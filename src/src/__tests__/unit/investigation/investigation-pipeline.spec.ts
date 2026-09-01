import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
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

const A_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];
const A_SUBJECT: Subject = { type: 'ont', attributes: A_SUBJECT_ATTRIBUTES };
const A_REQUESTER = 'requester-1';

function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: `${name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

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

class FakeGlossaryQuery implements IGlossaryQuery {
  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    return { held: false, vocabulary, name };
  }
  public async readConcept(name: string): Promise<ConceptResolution> {
    return { held: false, name };
  }

  public async listVocabularyTerms(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listVocabularyTerms is not scripted for this file');
  }
  public async listConcepts(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listConcepts is not scripted for this file');
  }
}

class ImmediateHypothesisEvaluator implements IHypothesisEvaluator {
  public constructor(private readonly outcome: EvaluationOutcome) {}
  public async evaluate(): Promise<EvaluationOutcome> {
    return this.outcome;
  }
}

class CountingHypothesisEvaluator implements IHypothesisEvaluator {
  public calls = 0;
  public async evaluate(): Promise<EvaluationOutcome> {
    this.calls += 1;
    return { verdict: 'confirmed', citations: [{ concept: 'unused', field: 'unused' }] };
  }
}

class CountingObservationSource implements IObservationSource {
  public calls = 0;
  public async observeConcept(): Promise<ObservationOutcome> {
    this.calls += 1;
    return { result: 'ok', observation: 'unused' };
  }
}

class ScriptedAssessmentConsolidator implements IAssessmentConsolidator {
  public constructor(private readonly outcome: ConsolidationOutcome) {}
  public async consolidate(): Promise<ConsolidationOutcome> {
    return this.outcome;
  }
}

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
    fields: [{ name: 'a-field', type: 'string' }],
    concept_description: '',
  };
}

const BASE_EVALUATOR_OUTCOME: EvaluationOutcome = {
  verdict: 'confirmed',
  citations: [{ concept: 'concept-a', field: 'a-field' }],
  usage: { input_tokens: 10, output_tokens: 5 },
  elapsed_ms: 50,
};

const BASE_CONSOLIDATION_OUTCOME: ConsolidationOutcome = {
  text: 'the drafted assessment text',
  usage: { input_tokens: 1, output_tokens: 2 },
  elapsed_ms: 7,
  prompt: 'the consolidation prompt',
};

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
    glossary: new FakeGlossaryQuery(),
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

it('imports none of the five stage-owning modules into run-diagnosis.ts, since its only route to any of the five stages is through investigation-pipeline.ts', async () => {
  const specifiers = await runDiagnosisImportSpecifiers();
  const stageModulePattern = /subject\.js$|evidence-collection-stage\.js$|judgment-stage\.js$|resolve-and-narrow-input\.js$|draft-assessment-text\.js$/;

  expect(specifiers.filter((specifier) => stageModulePattern.test(specifier))).toEqual([]);
});
