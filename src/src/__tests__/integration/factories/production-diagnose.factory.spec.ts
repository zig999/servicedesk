// Proof for task/diagnose-composition-root/wire-diagnose-runner: the real,
// end-to-end wiring createProductionDiagnoseRunner assembles — the real
// file-backed investigation store (over a scratch directory), the real
// glossary and capability registry reads, and one AnthropicHypothesisEvaluator
// plus one AnthropicAssessmentConsolidator actually reaching the provider
// boundary. Only @anthropic-ai/sdk is a stand-in (TST-03 — a stand-in
// replaces the network boundary, never business logic), mocked the same way
// anthropic-hypothesis-evaluator.adapter.spec.ts and
// anthropic-assessment-consolidator.adapter.spec.ts already do, so this suite
// exercises production-diagnose.factory.ts's own composition genuinely
// without ever reaching the live Anthropic API. The model's own answer is
// deliberately never valid JSON, so every hypothesis judged here falls
// through to inconclusive/judgment-failure and citation validation is never
// exercised — that path already belongs to judgment-stage.spec.ts and
// citation-validation.spec.ts, and this suite's own objective is this
// factory's wiring, not the pipeline's judgment semantics.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'the drafted assessment write-up' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

import type { Case } from '../../../case/case.js';
import {
  createProductionDiagnoseRunner,
  type ProductionDiagnoseCall,
  type ProductionDiagnoseDependencies,
} from '../../../factories/production-diagnose.factory.js';
import { createInvestigationStore } from '../../../factories/investigation-store.factory.js';
import type { Cost } from '../../../investigation/cost.js';
import type { Durations } from '../../../investigation/durations.js';
import type { IObservationSource, ObservationOutcome, Subject } from '../../../investigation/observation-source.port.js';

const CONCEPT = 'contract-status';
const SUBJECT_TYPE = 'contract';
const SUBJECT_ATTRIBUTE = 'contract-id';
const A_REQUESTER = 'requester-shared-across-both-calls';
const POOL_SIZE = 1;
const CONSOLIDATOR_MAX_TOKENS = 256;

/** Records every observe-concept call it receives, in order, and always answers ok — the observation-source boundary this factory's caller supplies directly, so this suite never touches a real connector. */
class RecordingObservationSource implements IObservationSource {
  public readonly calls: Array<{ concept: string; subject: Subject; requester: string }> = [];

  public async observeConcept(concept: string, subject: Subject, requester: string): Promise<ObservationOutcome> {
    this.calls.push({ concept, subject, requester });
    return { result: 'ok', observation: `an-observation-for-${concept}` };
  }
}

/** A minimally valid, single-hypothesis Case naming exactly the one concept and subject-attribute this suite's own scratch glossary/capability directories register. */
function aCase(): Case {
  return {
    slug: 'wiring-proof-case',
    title: 'A case for proving the production diagnose wiring',
    when_to_use: 'when proving createProductionDiagnoseRunner wires the real pipeline',
    version: 1,
    hash: 'wiring-proof-hash',
    subject: SUBJECT_TYPE,
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
    hypotheses: [
      {
        name: 'h1',
        criterion: 'h1 criterion',
        collects: [CONCEPT],
        resolution: { outcome: 'h1-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
      },
    ],
  };
}

const SHARED_CASE = aCase();
const A_COST: Cost = { calls: 1, input_tokens: 10, output_tokens: 5 };
const A_DURATIONS: Durations = { collection: 0, judgment: 0, writing: 0, total: 0 };

/** Everything one call needs beyond the id and requester a test varies. */
function callFor(id: string, requester: string): ProductionDiagnoseCall {
  return {
    id,
    requester,
    ticket_ref: 'TICKET-1',
    narrative: 'the same narrative for both calls',
    subjectType: SUBJECT_TYPE,
    subjectAttributes: [{ attribute: SUBJECT_ATTRIBUTE, value: 'contract-1' }],
    case: SHARED_CASE,
    prompt_version: 'prompt-v1',
    model: 'model-x',
    cost: A_COST,
    durations: A_DURATIONS,
  };
}

let investigationDir: string;
let glossaryDir: string;
let capabilityDir: string;

beforeEach(async () => {
  investigationDir = await mkdtemp(join(tmpdir(), 'production-diagnose-investigation-'));
  glossaryDir = await mkdtemp(join(tmpdir(), 'production-diagnose-glossary-'));
  capabilityDir = await mkdtemp(join(tmpdir(), 'production-diagnose-capability-'));
  await writeFile(join(glossaryDir, 'subject-attribute.json'), JSON.stringify([{ name: SUBJECT_ATTRIBUTE }]));
  await writeFile(join(capabilityDir, 'capability.json'), JSON.stringify([capabilityRegistration()]));
  createMock.mockClear();
  anthropicConstructorMock.mockClear();
});

afterEach(async () => {
  await rm(investigationDir, { recursive: true, force: true });
  await rm(glossaryDir, { recursive: true, force: true });
  await rm(capabilityDir, { recursive: true, force: true });
});

/** The one capability registration this suite's scratch capability directory holds, answering CONCEPT with a JSON-Schema output_schema — never read for its own field names, since every judged hypothesis here falls back to inconclusive before citation validation ever runs. */
function capabilityRegistration(): Record<string, unknown> {
  return {
    name: 'contract-status-reader',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: JSON.stringify({ type: 'object', properties: { 'a-field': { type: 'string' } } }),
    timeout: 5_000,
    connector: 'contract-status-connector',
    concept: CONCEPT,
  };
}

function dependenciesFor(observationSource: IObservationSource): ProductionDiagnoseDependencies {
  return {
    investigationDataDirectory: investigationDir,
    glossaryDataDirectory: glossaryDir,
    capabilityDataDirectory: capabilityDir,
    observationSource,
    poolSize: POOL_SIZE,
    defaultConsolidationRegister: 'plain',
    evaluatorModel: 'a-test-model',
    consolidatorModel: 'a-test-model',
    consolidatorMaxTokens: CONSOLIDATOR_MAX_TOKENS,
  };
}

// ------------------------------------------------- criterion 3: no caching, no joining

it('writes two independent investigation records for two calls sharing the same case, subject, narrative and requester', async () => {
  const runner = createProductionDiagnoseRunner(dependenciesFor(new RecordingObservationSource()));

  await runner(callFor('investigation-a', A_REQUESTER));
  await runner(callFor('investigation-b', A_REQUESTER));

  const store = createInvestigationStore(investigationDir);
  const first = await store.read('investigation-a');
  const second = await store.read('investigation-b');
  expect(first).toBeDefined();
  expect(second).toBeDefined();
  expect((first?.document as { id: string }).id).toBe('investigation-a');
  expect((second?.document as { id: string }).id).toBe('investigation-b');
});

it("collects evidence again for the second of two calls with identical inputs, rather than reusing the first call's own result", async () => {
  const observationSource = new RecordingObservationSource();
  const runner = createProductionDiagnoseRunner(dependenciesFor(observationSource));

  await runner(callFor('investigation-a', A_REQUESTER));
  await runner(callFor('investigation-b', A_REQUESTER));

  expect(observationSource.calls).toHaveLength(2);
});

// ------------------------------------------------------ criterion 5: requester passthrough

it('passes the given requester straight through to the observation source, substituting none of its own', async () => {
  const observationSource = new RecordingObservationSource();
  const runner = createProductionDiagnoseRunner(dependenciesFor(observationSource));
  const distinctiveRequester = 'requester-distinctive-42';

  await runner(callFor('investigation-a', distinctiveRequester));

  expect(observationSource.calls).toHaveLength(1);
  expect(observationSource.calls[0]?.requester).toBe(distinctiveRequester);
});

// ------------------------------------------- criterion 1: real adapters, not swappable fakes

it('reaches the mocked Anthropic client when a call runs, confirming the real adapters are wired rather than a swappable fake', async () => {
  const runner = createProductionDiagnoseRunner(dependenciesFor(new RecordingObservationSource()));

  await runner(callFor('investigation-a', A_REQUESTER));

  expect(createMock).toHaveBeenCalled();
});

// ---------------------------- inference: caller's own evaluator/consolidator models reach the provider

it('sends the caller-configured evaluator and consolidator models to the provider, never a value fixed in source', async () => {
  const dependencies = dependenciesFor(new RecordingObservationSource());
  const runner = createProductionDiagnoseRunner({
    ...dependencies,
    evaluatorModel: 'evaluator-configured-model',
    consolidatorModel: 'consolidator-configured-model',
  });

  await runner(callFor('investigation-a', A_REQUESTER));

  const sentModels = createMock.mock.calls.map((call) => (call[0] as { model: string }).model);
  expect(sentModels).toContain('evaluator-configured-model');
  expect(sentModels).toContain('consolidator-configured-model');
});
