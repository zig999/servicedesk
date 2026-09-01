import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import { HypothesisNotInManifestError } from '../../../errors/hypothesis-not-in-manifest.error.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
import type { EvaluationOutcome, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { ObservationOutcome, ObserveConceptOptions, IObservationSource } from '../../../investigation/observation-source.port.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';
import {
  runSimulateHypothesisPipeline,
  type SimulateHypothesisDurations,
  type SimulateHypothesisPipelineOptions,
  type SimulateHypothesisPipelineResult,
} from '../../../investigation/simulate-hypothesis-pipeline.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const A_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];
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

function twoHypothesisCase(): Case {
  const hypotheses = [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])];
  return {
    slug: 'a-case',
    title: 'A case for simulate-hypothesis',
    when_to_use: 'when testing the narrower pipeline',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-fallback-queue' } },
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
  };
}

function schemaDeclaring(...fields: readonly string[]): string {
  return JSON.stringify({ type: 'object', properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])) });
}

function aCapability(concept: string): Capability {
  return {
    name: `capability-for-${concept}`,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: schemaDeclaring('a-field'),
    timeout: 60_000,
    connector: `connector-for-${concept}`,
    concept,
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

class RecordingObservationSource implements IObservationSource {
  public readonly observedConcepts: string[] = [];
  public async observeConcept(options: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.observedConcepts.push(options.concept);
    return { result: 'ok', observation: `observed-${options.concept}` };
  }
}

class RecordingHypothesisEvaluator implements IHypothesisEvaluator {
  public readonly judgedCriteria: string[] = [];
  public async evaluate(criterion: string): Promise<EvaluationOutcome> {
    this.judgedCriteria.push(criterion);
    return { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], elapsed_ms: 5 };
  }
}

class HangingHypothesisEvaluator implements IHypothesisEvaluator {
  public evaluate(): Promise<EvaluationOutcome> {
    return new Promise(() => {});
  }
}

class DelayedObservationSource implements IObservationSource {
  public constructor(
    private readonly delayMs: number,
    private readonly outcome: ObservationOutcome,
  ) {}
  public observeConcept(): Promise<ObservationOutcome> {
    return new Promise((resolve) => setTimeout(() => resolve(this.outcome), this.delayMs));
  }
}

function baseOptions(overrides: Partial<SimulateHypothesisPipelineOptions> = {}): SimulateHypothesisPipelineOptions {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability('concept-a'));
  capabilities.hold(aCapability('concept-b'));
  return {
    subjectType: 'ont',
    subjectAttributes: A_SUBJECT_ATTRIBUTES,
    case: twoHypothesisCase(),
    requester: A_REQUESTER,
    hypothesis: 'h1',
    capabilities,
    glossary: new FakeGlossaryQuery(),
    observationSource: new RecordingObservationSource(),
    evaluator: new RecordingHypothesisEvaluator(),
    poolSize: 4,
    now: 0,
    deadline: 20_000,
    ...overrides,
  };
}

it("collects only the named hypothesis's own revision's concepts, never a concept only the case's other hypothesis collects", async () => {
  const observationSource = new RecordingObservationSource();
  const options = baseOptions({ hypothesis: 'h1', observationSource });

  const result = await runSimulateHypothesisPipeline(options);

  expect(observationSource.observedConcepts).toEqual(['concept-a']);
  expect(result.evidence.map((item) => item.concept)).toEqual(['concept-a']);
});

it("collects the other hypothesis's own concept instead when that one is named, proving the narrowing follows the given hypothesis rather than a fixed one", async () => {
  const observationSource = new RecordingObservationSource();
  const options = baseOptions({ hypothesis: 'h2', observationSource });

  const result = await runSimulateHypothesisPipeline(options);

  expect(observationSource.observedConcepts).toEqual(['concept-b']);
  expect(result.evidence.map((item) => item.concept)).toEqual(['concept-b']);
});

it('answers exactly one evaluation, for the named hypothesis, judging its criterion exactly once', async () => {
  const evaluator = new RecordingHypothesisEvaluator();
  const options = baseOptions({ hypothesis: 'h1', evaluator });

  const result = await runSimulateHypothesisPipeline(options);

  expect(result.evaluation.hypothesis).toBe('h1');
  expect(evaluator.judgedCriteria).toEqual(['h1 criterion']);
});

it('carries exactly evidence, evaluation and durations — no resolved outcome and no assessment field, at the type level and on the actual answer', async () => {
  expectTypeOf<SimulateHypothesisPipelineResult>().toEqualTypeOf<{
    readonly evidence: readonly import('../../../investigation/evidence.js').Evidence[];
    readonly evaluation: import('../../../investigation/evaluation.js').Evaluation;
    readonly durations: SimulateHypothesisDurations;
  }>();
  const result = await runSimulateHypothesisPipeline(baseOptions());

  expect(Object.keys(result).sort()).toEqual(['durations', 'evaluation', 'evidence']);
  expect(result).not.toHaveProperty('resolved');
  expect(result).not.toHaveProperty('assessment');
});

it('never consolidates: SimulateHypothesisPipelineOptions declares no consolidator or defaultConsolidationRegister field', () => {
  expectTypeOf<SimulateHypothesisPipelineOptions>().toEqualTypeOf<{
    readonly subjectType: string;
    readonly subjectAttributes: readonly SubjectAttributeValue[];
    readonly case: Case;
    readonly requester: string;
    readonly hypothesis: string;
    readonly capabilities: ICapabilityQuery;
    readonly glossary: IGlossaryQuery;
    readonly observationSource: IObservationSource;
    readonly evaluator: IHypothesisEvaluator;
    readonly poolSize: number;
    readonly now: number;
    readonly deadline: number;
  }>();
});

it("refuses with HypothesisNotInManifestError a hypothesis name absent from the case version's manifest, before collecting or judging anything", async () => {
  const observationSource = new RecordingObservationSource();
  const evaluator = new RecordingHypothesisEvaluator();
  const options = baseOptions({ hypothesis: 'an-absent-hypothesis', observationSource, evaluator });

  await expect(runSimulateHypothesisPipeline(options)).rejects.toBeInstanceOf(HypothesisNotInManifestError);

  expect(observationSource.observedConcepts).toEqual([]);
  expect(evaluator.judgedCriteria).toEqual([]);
});

it('carries durations with collection and judgment only, real measured values, and no writing field at all — neither in the type nor on the answer', async () => {
  expectTypeOf<SimulateHypothesisDurations>().toEqualTypeOf<{
    readonly collection: number;
    readonly judgment: number;
    readonly total: number;
  }>();
  const result = await runSimulateHypothesisPipeline(baseOptions());

  expect(result.durations).toEqual({ collection: 0, judgment: 5, total: 0 });
  expect(result.durations).not.toHaveProperty('writing');
});

it('computes durations.total as the real wall-clock elapsed time from pipelineStartedAtMs to the moment its result is assembled, never as collection + judgment', async () => {
  const delayMs = 3_000;
  const observationSource = new DelayedObservationSource(delayMs, { result: 'ok', observation: 'observed-concept-a' });
  const evaluator = new RecordingHypothesisEvaluator();
  const options = baseOptions({ hypothesis: 'h1', observationSource, evaluator });

  const resultPromise = runSimulateHypothesisPipeline(options);
  await vi.advanceTimersByTimeAsync(delayMs);
  const result = await resultPromise;

  expect(result.durations.total).toBe(delayMs);
  expect(result.durations.total).not.toBe(result.durations.collection + result.durations.judgment);
});

it('answers a judgment duration of zero when no-data means the evaluator was never called at all', async () => {
  const evaluator = new RecordingHypothesisEvaluator();
  const nonOkObservationSource: IObservationSource = {
    observeConcept: async () => ({ result: 'unavailable' }),
  };
  const options = baseOptions({ hypothesis: 'h1', observationSource: nonOkObservationSource, evaluator });

  const result = await runSimulateHypothesisPipeline(options);

  expect(evaluator.judgedCriteria).toEqual([]);
  expect(result.evaluation).toMatchObject({ hypothesis: 'h1', verdict: 'inconclusive', reason: 'no-data' });
  expect(result.durations.judgment).toBe(0);
});

it('measures judgment\'s own deadline from the clock at the moment judgment actually begins, so a collection stage that consumed part of the propagated deadline leaves judgment correspondingly less real time than its own nominal budget — never the full nominal budget measured from the pipeline\'s entry instant', async () => {
  const collectionDelayMs = 3_000;
  const tightDeadlineMs = 6_000;
  const observationSource = new DelayedObservationSource(collectionDelayMs, { result: 'ok', observation: 'observed-concept-a' });
  const options = baseOptions({
    hypothesis: 'h1',
    observationSource,
    evaluator: new HangingHypothesisEvaluator(),
    now: 0,
    deadline: tightDeadlineMs,
  });

  const resultPromise = runSimulateHypothesisPipeline(options);
  let settled = false;
  resultPromise.then(() => {
    settled = true;
  });

  await vi.advanceTimersByTimeAsync(tightDeadlineMs - 1);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const result = await resultPromise;

  expect(result.evaluation).toEqual({ hypothesis: 'h1', verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] });
});

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/simulate-hypothesis-pipeline.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

const FORBIDDEN_BASENAMES = [
  'resolve-and-narrow-input.js',
  'draft-assessment-text.js',
  'run-diagnosis.js',
  'investigation-factory.js',
];

async function simulateHypothesisPipelineImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? '');
}

function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it('imports neither resolveAndNarrow, draftAssessmentText, runDiagnosis nor buildInvestigation — this operation resolves no outcome, drafts no assessment and writes no investigation', async () => {
  const specifiers = await simulateHypothesisPipelineImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});
