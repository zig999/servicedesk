// Proof for task/case-simulation-pipeline/extract-shared-investigation-pipeline:
// runInvestigationPipeline is investigation-pipeline.ts's own new exported
// boundary, callable directly rather than only through run-diagnosis.ts's own
// composition. Two of this record's own fields — resolved and prompts — never
// reach a diagnose caller: run-diagnosis.ts's own runDiagnosis destructures
// only evidence/evaluations/assessment/cost/durations off this call's answer,
// so run-diagnosis.spec.ts's own already-delivered, still-passing suite
// proves this task's own criteria 2, 4 and 5 (diagnose's composition calling
// this function, an identical response, write-before-respond ordering) but
// cannot exercise this record's own complete shape, or this file's own
// stage-sequencing guarantee, since neither ever surfaces through diagnose's
// own written Investigation. Both are exercised here instead, directly
// against the exported function. Fake timers stand in for wall-clock time
// throughout, the same discipline run-diagnosis.spec.ts already keeps, since
// evidence-collection-stage.ts measures elapsed_ms via Date.now().
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { ConsolidationOutcome, IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS, type Evidence } from '../../../investigation/evidence.js';
import type { EvaluationOutcome, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import { runInvestigationPipeline, type InvestigationPipelineOptions } from '../../../investigation/investigation-pipeline.js';
import type { IObservationSource, ObservationOutcome, Subject } from '../../../investigation/observation-source.port.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// --------------------------------------------------------------- fixtures

const A_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];
const A_SUBJECT: Subject = { type: 'ont', attributes: A_SUBJECT_ATTRIBUTES };
const A_REQUESTER = 'requester-1';

/** One hypothesis, defaulted so a test states only its name and what it collects — mirrors run-diagnosis.spec.ts's own fixture convention. */
function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: `${name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/** One manifest entry mirroring one flat Hypothesis fixture, position assigned from array order. */
function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesis.name },
      revision: 1,
      criterion: hypothesis.criterion,
      collects: hypothesis.collects,
      resolution: hypothesis.resolution,
    },
  };
}

/** A minimally valid, single-hypothesis Case, so a test states only what it departs from. */
function aCase(overrides: Partial<Case> = {}): Case {
  const hypotheses = overrides.hypotheses ?? [aHypothesis('h1', ['concept-a'])];
  return {
    slug: 'a-case',
    title: 'A case for the pipeline extraction',
    when_to_use: 'when testing the shared pipeline',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-fallback-queue' } },
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
    ...overrides,
  };
}

function schemaDeclaring(...fields: readonly string[]): string {
  return JSON.stringify({ type: 'object', properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])) });
}

/** A capability registered for exactly one concept, its output schema declaring the "a-field" every citation in this file names. */
function aCapability(overrides: Partial<Capability> & { readonly concept: string }): Capability {
  return {
    name: `capability-for-${overrides.concept}`,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: schemaDeclaring('a-field'),
    timeout: 60_000,
    connector: `connector-for-${overrides.concept}`,
    ...overrides,
  };
}

/** Holds whatever capabilities a test registers, resolving every other concept as unheld. */
class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly held = new Map<string, Capability>();
  public hold(capability: Capability): void {
    this.held.set(capability.concept, capability);
  }
  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const capability = this.held.get(concept);
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }
  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
  }
}

/** Answers the given fixed outcome for every criterion, immediately — a stand-in for a fast, always-decided evaluator. */
class ImmediateHypothesisEvaluator implements IHypothesisEvaluator {
  public constructor(private readonly outcome: EvaluationOutcome) {}
  public async evaluate(): Promise<EvaluationOutcome> {
    return this.outcome;
  }
}

/** Counts how many times it was ever called, answering a fixed confirmed outcome — a spy on whether judgment was reached at all. */
class CountingHypothesisEvaluator implements IHypothesisEvaluator {
  public calls = 0;
  public async evaluate(): Promise<EvaluationOutcome> {
    this.calls += 1;
    return { verdict: 'confirmed', citations: [{ concept: 'unused', field: 'unused' }] };
  }
}

/** Counts how many times it was ever called, answering ok unconditionally — a spy on whether collection was reached at all. */
class CountingObservationSource implements IObservationSource {
  public calls = 0;
  public async observeConcept(): Promise<ObservationOutcome> {
    this.calls += 1;
    return { result: 'ok', observation: 'unused' };
  }
}

/** Answers one fixed ConsolidationOutcome regardless of input — carrying real, non-zero usage/elapsed_ms/prompt, unlike FakeAssessmentConsolidator's own zero-valued placeholder. */
class ScriptedAssessmentConsolidator implements IAssessmentConsolidator {
  public constructor(private readonly outcome: ConsolidationOutcome) {}
  public async consolidate(): Promise<ConsolidationOutcome> {
    return this.outcome;
  }
}

/** The Evidence a held capability's ok observation assembles for `concept`, at now=0 under frozen fake timers. */
function expectedOkEvidence(concept: string, observation: string): Evidence {
  return {
    concept,
    inputs: JSON.stringify({ concept, subject: A_SUBJECT, requester: A_REQUESTER }),
    observation,
    observed_at: new Date(0).toISOString(),
    ttl: DEFAULT_EVIDENCE_TTL_SECONDS,
    origin: `connector-for-${concept}`,
    result: 'ok',
    capability_name: `capability-for-${concept}`,
    capability_version: '1.0.0',
    elapsed_ms: 0,
  };
}

/** The base fixture's own judgment call: confirmed, with real, non-zero usage/elapsed_ms so cost and durations are never a coincidental zero. */
const BASE_EVALUATOR_OUTCOME: EvaluationOutcome = {
  verdict: 'confirmed',
  citations: [{ concept: 'concept-a', field: 'a-field' }],
  usage: { input_tokens: 10, output_tokens: 5 },
  elapsed_ms: 50,
};

/** The base fixture's own consolidation call, for the same reason. */
const BASE_CONSOLIDATION_OUTCOME: ConsolidationOutcome = {
  text: 'the drafted assessment text',
  usage: { input_tokens: 1, output_tokens: 2 },
  elapsed_ms: 7,
  prompt: 'the consolidation prompt',
};

/** The whole InvestigationPipelineOptions, valid and resolving by default: one hypothesis, one concept, confirmed. */
function baseOptions(overrides: Partial<InvestigationPipelineOptions> = {}): InvestigationPipelineOptions {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' }));
  const observationSource: IObservationSource = { observeConcept: async () => ({ result: 'ok', observation: 'observed-concept-a' }) };
  return {
    subjectType: 'ont',
    subjectAttributes: A_SUBJECT_ATTRIBUTES,
    case: aCase(),
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    evaluator: new ImmediateHypothesisEvaluator(BASE_EVALUATOR_OUTCOME),
    poolSize: 4,
    consolidator: new ScriptedAssessmentConsolidator(BASE_CONSOLIDATION_OUTCOME),
    defaultConsolidationRegister: 'plain',
    now: 0,
    deadline: 20_000,
    ...overrides,
  };
}

const RUN_DIAGNOSIS_MODULE_PATH = fileURLToPath(new URL('../../../investigation/run-diagnosis.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

async function runDiagnosisImportSpecifiers(): Promise<readonly string[]> {
  const source = await readFile(RUN_DIAGNOSIS_MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

// ------------------------------------------------ criterion 1: the complete record

it('answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and prompts together, for one confirmed hypothesis', async () => {
  const options = baseOptions();

  const result = await runInvestigationPipeline(options);

  expect(result).toEqual({
    evidence: [expectedOkEvidence('concept-a', 'observed-concept-a')],
    evaluations: [
      {
        hypothesis: 'h1',
        verdict: 'confirmed',
        citations: [{ concept: 'concept-a', field: 'a-field' }],
        usage: { input_tokens: 10, output_tokens: 5 },
        elapsed_ms: 50,
      },
    ],
    resolved: { outcome: 'h1-outcome', referral: { action: 'refer', recipient: 'a-queue' }, determining: 'h1' },
    assessment: {
      outcome: 'h1-outcome',
      referral: { action: 'refer', recipient: 'a-queue' },
      determining_hypothesis: 'h1',
      text: 'the drafted assessment text',
    },
    cost: { calls: 2, input_tokens: 11, output_tokens: 7 },
    durations: { collection: 0, judgment: 50, writing: 7, total: 57 },
    prompts: { writing: 'the consolidation prompt' },
  });
});

it('runs buildSubject before collecting any evidence or judging any hypothesis, refusing an empty subject attribute set without reaching either stage', async () => {
  const observationSource = new CountingObservationSource();
  const evaluator = new CountingHypothesisEvaluator();
  const options = baseOptions({ subjectAttributes: [], observationSource, evaluator });

  await expect(runInvestigationPipeline(options)).rejects.toThrow(/carries no attribute-value/);

  expect(observationSource.calls).toBe(0);
  expect(evaluator.calls).toBe(0);
});

// ------------------------------------------------------------------ inference

it("carries only the consolidation call's own prompt under prompts.writing, never merging in a judged hypothesis's own distinct judgment prompt", async () => {
  const options = baseOptions({
    evaluator: new ImmediateHypothesisEvaluator({
      verdict: 'confirmed',
      citations: [{ concept: 'concept-a', field: 'a-field' }],
      prompt: 'a judgment prompt, distinct from the consolidation prompt',
    }),
    consolidator: new ScriptedAssessmentConsolidator({
      text: 'the drafted assessment text',
      usage: { input_tokens: 0, output_tokens: 0 },
      elapsed_ms: 0,
      prompt: 'the consolidation prompt',
    }),
  });

  const result = await runInvestigationPipeline(options);

  expect(result.prompts).toEqual({ writing: 'the consolidation prompt' });
});

// ------------------------------------------------------------------- criterion 3

it('imports none of the five stage-owning modules into run-diagnosis.ts, since its only route to any of the five stages is through investigation-pipeline.ts', async () => {
  const specifiers = await runDiagnosisImportSpecifiers();
  const stageModulePattern = /subject\.js$|evidence-collection-stage\.js$|judgment-stage\.js$|resolve-and-narrow-input\.js$|draft-assessment-text\.js$/;

  expect(specifiers.filter((specifier) => stageModulePattern.test(specifier))).toEqual([]);
});
