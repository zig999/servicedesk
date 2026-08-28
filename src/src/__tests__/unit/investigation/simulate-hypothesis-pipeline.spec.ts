// Proof for task/case-simulation-pipeline/simulate-hypothesis-operation:
// runSimulateHypothesisPipeline narrows collectEvidence and judgeHypotheses to
// exactly the named hypothesis's own manifest entry — collecting only what
// that entry's own revision collects, never a concept only the case's other
// hypothesis collects — answers exactly one Evaluation for that hypothesis,
// resolves no outcome and drafts no assessment, refuses a hypothesis name the
// pinned case version's manifest holds no entry for before either stage ever
// runs, and reports durations carrying only collection and judgment, never a
// writing field, since this operation never consolidates. Mirrors
// investigation-pipeline.spec.ts's own fixture and import-scan conventions
// (aHypothesis, manifestEntryOf, aCase, FakeCapabilityQuery, fake timers),
// narrowed to this operation's own two-hypothesis fixture.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import { HypothesisNotInManifestError } from '../../../errors/hypothesis-not-in-manifest.error.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
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

// --------------------------------------------------------------- fixtures

const A_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];
const A_REQUESTER = 'requester-1';

/** One hypothesis, defaulted so a test states only its name and what it collects — mirrors investigation-pipeline.spec.ts's own fixture convention. */
function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: `${name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/** One manifest entry mirroring one flat Hypothesis fixture, position assigned by the caller. */
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

/** A two-hypothesis Case: h1 collects concept-a, h2 collects concept-b — distinct concepts, so a test can tell which hypothesis's own collection ran. */
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

/** A capability registered for exactly one concept, its output schema declaring the "a-field" every citation in this file names. */
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

/** Holds a capability for every concept a test registers, resolving every other concept as unheld. */
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

/** Records every concept it was asked to observe, answering ok unconditionally — the spy criterion 1 reads to prove which concept(s) were ever collected. */
class RecordingObservationSource implements IObservationSource {
  public readonly observedConcepts: string[] = [];
  public async observeConcept(options: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.observedConcepts.push(options.concept);
    return { result: 'ok', observation: `observed-${options.concept}` };
  }
}

/** Records every hypothesis-criterion it was asked to judge, answering one fixed confirmed outcome — the spy criterion 2 reads to prove exactly one judgment call happened. */
class RecordingHypothesisEvaluator implements IHypothesisEvaluator {
  public readonly judgedCriteria: string[] = [];
  public async evaluate(criterion: string): Promise<EvaluationOutcome> {
    this.judgedCriteria.push(criterion);
    return { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], elapsed_ms: 5 };
  }
}

/** The whole SimulateHypothesisPipelineOptions, valid and resolving by default: the two-hypothesis case, narrowed to h1. */
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
    observationSource: new RecordingObservationSource(),
    evaluator: new RecordingHypothesisEvaluator(),
    poolSize: 4,
    now: 0,
    deadline: 20_000,
    ...overrides,
  };
}

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2

it('answers exactly one evaluation, for the named hypothesis, judging its criterion exactly once', async () => {
  const evaluator = new RecordingHypothesisEvaluator();
  const options = baseOptions({ hypothesis: 'h1', evaluator });

  const result = await runSimulateHypothesisPipeline(options);

  expect(result.evaluation.hypothesis).toBe('h1');
  expect(evaluator.judgedCriteria).toEqual(['h1 criterion']);
});

// ------------------------------------------------------------------ criterion 3

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
    readonly observationSource: IObservationSource;
    readonly evaluator: IHypothesisEvaluator;
    readonly poolSize: number;
    readonly now: number;
    readonly deadline: number;
  }>();
});

// ------------------------------------------------------------------ criterion 4

it("refuses with HypothesisNotInManifestError a hypothesis name absent from the case version's manifest, before collecting or judging anything", async () => {
  const observationSource = new RecordingObservationSource();
  const evaluator = new RecordingHypothesisEvaluator();
  const options = baseOptions({ hypothesis: 'an-absent-hypothesis', observationSource, evaluator });

  await expect(runSimulateHypothesisPipeline(options)).rejects.toBeInstanceOf(HypothesisNotInManifestError);

  expect(observationSource.observedConcepts).toEqual([]);
  expect(evaluator.judgedCriteria).toEqual([]);
});

// ------------------------------------------------------------------ criterion 8

it('carries durations with collection and judgment only, real non-zero measured values, and no writing field at all — neither in the type nor on the answer', async () => {
  expectTypeOf<SimulateHypothesisDurations>().toEqualTypeOf<{
    readonly collection: number;
    readonly judgment: number;
    readonly total: number;
  }>();
  const result = await runSimulateHypothesisPipeline(baseOptions());

  expect(result.durations).toEqual({ collection: 0, judgment: 5, total: 5 });
  expect(result.durations).not.toHaveProperty('writing');
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

// ------------------------------------------------------------- structural: never writes, never consolidates

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/simulate-hypothesis-pipeline.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
/**
 * Exact compiled basenames of the resolving, consolidating or write-capable modules this narrower
 * pipeline never reaches — matched by the whole final path segment, mirroring
 * investigation-pipeline.spec.ts's own import-scan discipline. investigation-pipeline.js itself is
 * deliberately not in this list: the implementation record discloses reusing its exported
 * maxElapsedMs and JUDGMENT_STAGE_BUDGET_MS (MNT-03), so importing that module is expected —
 * runInvestigationPipeline is the one export of it this pipeline must never call, which an
 * import-scan over the whole module cannot distinguish, so criterion 3's "no resolved outcome and
 * no assessment" is instead proven above by the type-level and runtime shape of the actual answer.
 */
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
