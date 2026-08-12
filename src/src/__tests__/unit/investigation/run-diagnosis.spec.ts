// Proof for task/diagnose-entry-point/diagnose-pipeline-composition:
// runDiagnosis wires collection, judgment, resolve-and-narrow, drafting and
// persistence into one synchronous run over an already-resolved
// case/subject/narrative, propagating one given (now, deadline) pair,
// tightening judgment's and persistence's own windows, and refusing to
// answer without a written record. Fake timers stand in for wall-clock time
// throughout, since persistence races a real setTimeout internally and this
// module composes two further stages (evidence-collection-stage.ts,
// judgment-stage.ts) that already do the same — the same settled-flag
// discipline evidence-collection-stage.spec.ts and judgment-stage.spec.ts
// already establish for observing an in-flight state before a later advance
// resolves it.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Case, Hypothesis } from '../../../case/case.js';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationWriteDeadlineExceededError } from '../../../errors/investigation-write-deadline-exceeded.error.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
import type { Cost } from '../../../investigation/cost.js';
import type { Durations } from '../../../investigation/durations.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS, type Evidence } from '../../../investigation/evidence.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { Investigation } from '../../../investigation/investigation.js';
import type { IInvestigationStore, StoredInvestigation } from '../../../investigation/investigation-store.port.js';
import type { IObservationSource, ObservationOutcome, Subject } from '../../../investigation/observation-source.port.js';
import { runDiagnosis, type RunDiagnosisOptions } from '../../../investigation/run-diagnosis.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// --------------------------------------------------------------- fixtures

const CASE_SLUG = 'a-case';
const CASE_VERSION = 1;
const CASE_AUTHORED_AT = '2024-01-01T00:00:00.000Z';
const A_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];
const A_SUBJECT: Subject = { type: 'ont', attributes: A_SUBJECT_ATTRIBUTES };
const A_REQUESTER = 'requester-1';

/** One hypothesis, defaulted so a test states only its name, what it collects, and its declared position. */
function aHypothesis(name: string, collects: readonly string[], position: number): Hypothesis {
  return {
    name,
    position,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: `${name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/** A minimally valid, single-hypothesis Case, so a test states only what it departs from. */
function aCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: CASE_SLUG,
    title: 'A case for the diagnose composition',
    when_to_use: 'when testing the diagnose composition',
    version: CASE_VERSION,
    authored_at: CASE_AUTHORED_AT,
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-fallback-queue' } },
    hypotheses: [aHypothesis('h1', ['concept-a'], 1)],
    ...overrides,
  };
}

/**
 * A JSON-Schema-shaped output_schema declaring exactly the given field names
 * as top-level `properties` keys — judgment-stage.spec.ts's own convention,
 * reused here: every citation this file ever seeds names field "a-field",
 * and citation-validation.ts (exercised for real by this composition, unlike
 * investigation-factory.spec.ts's own fixtures) refuses a citation whose
 * field the producing capability's own output schema does not declare.
 */
function schemaDeclaring(...fields: readonly string[]): string {
  return JSON.stringify({ type: 'object', properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])) });
}

/** A capability registered for exactly one concept, every other attribute defaulted, its output schema declaring the "a-field" every citation in this file names. */
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
}

/** Stands in for the glossary-source port, holding exactly the subject-attribute names a test seeds. */
class FakeGlossaryQuery implements IGlossaryQuery {
  private readonly attributes = new Set<string>();
  public holdAttribute(name: string): void {
    this.attributes.add(name);
  }
  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    return this.attributes.has(name) ? { held: true, term: { name } } : { held: false, vocabulary, name };
  }
  public async readConcept(name: string): Promise<ConceptResolution> {
    return { held: false, name };
  }
}

function glossaryHolding(...names: readonly string[]): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  for (const name of names) {
    glossary.holdAttribute(name);
  }
  return glossary;
}

/** Answers the given fixed outcome for every criterion, immediately — a stand-in for a fast, always-decided evaluator. */
class ImmediateHypothesisEvaluator implements IHypothesisEvaluator {
  public constructor(private readonly outcome: EvaluationOutcome) {}
  public async evaluate(): Promise<EvaluationOutcome> {
    return this.outcome;
  }
}

/** Never settles — a stand-in for a judgment call that never returns, so a test controls exactly when the stage's own shared deadline resolves it instead. */
class HangingHypothesisEvaluator implements IHypothesisEvaluator {
  public evaluate(): Promise<EvaluationOutcome> {
    return new Promise(() => {});
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

/** Tracks the highest number of evaluate() calls ever in flight at once, answering confirmed with a citation to the evidence it was actually given. */
class ConcurrencyTrackingHypothesisEvaluator implements IHypothesisEvaluator {
  private inFlight = 0;
  public maxConcurrent = 0;
  public async evaluate(_criterion: string, evidence: readonly EvidenceItem[]): Promise<EvaluationOutcome> {
    this.inFlight += 1;
    this.maxConcurrent = Math.max(this.maxConcurrent, this.inFlight);
    await Promise.resolve();
    this.inFlight -= 1;
    return { verdict: 'confirmed', citations: [{ concept: evidence[0].concept, field: 'a-field' }] };
  }
}

/** Answers ok only after the given delay, under fake timers — a stand-in for a slow, but eventually successful, observation call. */
class DelayedObservationSource implements IObservationSource {
  public constructor(
    private readonly delayMs: number,
    private readonly outcome: ObservationOutcome,
  ) {}
  public observeConcept(): Promise<ObservationOutcome> {
    return new Promise((resolve) => setTimeout(() => resolve(this.outcome), this.delayMs));
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

/** Holds every investigation written to it, keyed by id, refusing a second write for the same id — the persistence boundary this composition never bypasses (rules/investigation/an-investigation-is-written-once). */
class InMemoryInvestigationStore implements IInvestigationStore {
  private readonly documents = new Map<string, unknown>();
  public writeCount = 0;
  /** Occupies an id ahead of any real build, for a test that proves a duplicate write is refused rather than swallowed. */
  public preoccupy(id: string): void {
    this.documents.set(id, { id });
  }
  public async write(investigation: Investigation): Promise<void> {
    this.writeCount += 1;
    if (this.documents.has(investigation.id)) {
      throw new InvestigationAlreadyStoredError(investigation.id);
    }
    this.documents.set(investigation.id, investigation);
  }
  public async read(id: string): Promise<StoredInvestigation | undefined> {
    const document = this.documents.get(id);
    return document === undefined ? undefined : { document, hash: 'fake-hash' };
  }
}

/** Resolves a write only after the given delay, under fake timers — for a test that controls exactly when persistence settles relative to its own bound. */
class DelayedInvestigationStore implements IInvestigationStore {
  private readonly inner = new InMemoryInvestigationStore();
  public constructor(private readonly delayMs: number) {}
  public async write(investigation: Investigation): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, this.delayMs));
    await this.inner.write(investigation);
  }
  public async read(id: string): Promise<StoredInvestigation | undefined> {
    return this.inner.read(id);
  }
}

/** A write that never settles — for a test that forces persistence's own race to reach its own timeout. */
class HangingInvestigationStore implements IInvestigationStore {
  public write(): Promise<void> {
    return new Promise(() => {});
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/** A write that rejects immediately with the given error — for a test that proves a genuine persistence failure propagates unmodified. */
class RejectingInvestigationStore implements IInvestigationStore {
  public constructor(private readonly error: Error) {}
  public write(): Promise<void> {
    return Promise.reject(this.error);
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/** The Evidence a held capability's ok observation assembles for `concept`, at now=0 — the shape every base fixture's collection actually produces. */
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
  };
}

const CONFIRMED_H1_EVALUATION: Evaluation = {
  hypothesis: 'h1',
  verdict: 'confirmed',
  citations: [{ concept: 'concept-a', field: 'a-field' }],
};
const DEADLINE_EXCEEDED_H1_EVALUATION: Evaluation = {
  hypothesis: 'h1',
  verdict: 'inconclusive',
  reason: 'deadline-exceeded',
  citations: [],
};
const HAPPY_PATH_TEXT = 'the drafted assessment text';
const HAPPY_PATH_ASSESSMENT = {
  outcome: 'h1-outcome',
  referral: { action: 'refer', recipient: 'a-queue' },
  determining_hypothesis: 'h1',
  text: HAPPY_PATH_TEXT,
};

/** A fresh consolidator seeded for the base fixture's own confirmed-h1 narrowed input, at the given register. */
function baseConsolidator(register: 'formal' | 'plain' = 'plain'): FakeAssessmentConsolidator {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    { evaluations: [CONFIRMED_H1_EVALUATION], evidence: [expectedOkEvidence('concept-a', 'observed-concept-a')], consolidationRegister: register },
    HAPPY_PATH_TEXT,
  );
  return consolidator;
}

/** A fresh consolidator seeded for the narrowed input a single deadline-exceeded h1 produces (no citations, so no evidence). */
function deadlineExceededConsolidator(text: string): FakeAssessmentConsolidator {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed({ evaluations: [DEADLINE_EXCEEDED_H1_EVALUATION], evidence: [], consolidationRegister: 'plain' }, text);
  return consolidator;
}

/** The whole RunDiagnosisOptions, valid and resolving by default: one hypothesis, one concept, confirmed. */
function baseOptions(overrides: Partial<RunDiagnosisOptions> = {}): RunDiagnosisOptions {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' }));
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-concept-a' });
  return {
    id: 'investigation-1',
    requester: A_REQUESTER,
    ticket_ref: 'TICKET-1',
    narrative: 'the narrative the requester submitted',
    subjectType: 'ont',
    subjectAttributes: A_SUBJECT_ATTRIBUTES,
    case: aCase(),
    prompt_version: 'prompt-v1',
    model: 'model-x',
    cost: { calls: 1, input_tokens: 10, output_tokens: 5 },
    durations: { collection: 0, judgment: 0, writing: 0, total: 0 },
    defaultConsolidationRegister: 'plain',
    glossary: glossaryHolding('id'),
    capabilities,
    observationSource,
    evaluator: new ImmediateHypothesisEvaluator({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }] }),
    poolSize: 4,
    consolidator: baseConsolidator(),
    store: new InMemoryInvestigationStore(),
    now: 0,
    deadline: 20_000,
    ...overrides,
  };
}

/** Options for two hypotheses (h1/concept-a, h2/concept-b), both confirmed, judged under the given evaluator at poolSize 1 — the fixture the poolSize-concurrency test needs. */
function twoHypothesisConcurrencyOptions(evaluator: ConcurrencyTrackingHypothesisEvaluator): RunDiagnosisOptions {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' }));
  capabilities.hold(aCapability({ concept: 'concept-b' }));
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-a' });
  observationSource.seed('concept-b', A_SUBJECT, { result: 'ok', observation: 'observed-b' });
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    {
      evaluations: [
        { hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }] },
        { hypothesis: 'h2', verdict: 'confirmed', citations: [{ concept: 'concept-b', field: 'a-field' }] },
      ],
      evidence: [expectedOkEvidence('concept-a', 'observed-a'), expectedOkEvidence('concept-b', 'observed-b')],
      consolidationRegister: 'plain',
    },
    'both confirmed text',
  );
  return baseOptions({
    case: aCase({ hypotheses: [aHypothesis('h1', ['concept-a'], 1), aHypothesis('h2', ['concept-b'], 2)] }),
    capabilities,
    observationSource,
    evaluator,
    consolidator,
    poolSize: 1,
  });
}

/** Attaches to a promise without awaiting it, answering whether it has settled (fulfilled or rejected) yet — evidence-collection-stage.spec.ts's own settled-flag technique. */
function trackSettlement(promise: Promise<unknown>): { settled: () => boolean } {
  let settled = false;
  promise.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    },
  );
  return { settled: () => settled };
}

/** The document a store actually holds for `id`, or a thrown failure — never an undefined a test would have to guard against ad hoc. */
async function writtenDocument(store: InMemoryInvestigationStore, id: string): Promise<unknown> {
  const stored = await store.read(id);
  if (stored === undefined) {
    throw new Error(`expected an investigation to have been written for id ${JSON.stringify(id)}`);
  }
  return stored.document;
}

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/run-diagnosis.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
const EXPORT_DECLARATION_PATTERN = /^export\s+(?:type\s+(\w+)|(?:async\s+)?function\s+(\w+))/gm;

async function runDiagnosisSource(): Promise<string> {
  return readFile(MODULE_PATH, 'utf8');
}

async function runDiagnosisImports(): Promise<readonly string[]> {
  const source = await runDiagnosisSource();
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

async function runDiagnosisExportedNames(): Promise<readonly string[]> {
  const source = await runDiagnosisSource();
  return [...source.matchAll(EXPORT_DECLARATION_PATTERN)].map((match) => match[1] ?? match[2]);
}

// ---------------------------------- criterion 1: no assessment without persistence completing

it('does not resolve until persistence has actually written the investigation, then resolves with the written investigation\'s own assessment', async () => {
  const store = new DelayedInvestigationStore(500);
  const options = baseOptions({ store, deadline: 20_000 });

  const resultPromise = runDiagnosis(options);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(499);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const assessment = await resultPromise;

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
});

it('propagates a genuine persistence failure instead of returning an assessment or reframing it as a deadline error', async () => {
  const failure = new Error('disk is full');
  const options = baseOptions({ store: new RejectingInvestigationStore(failure) });

  await expect(runDiagnosis(options)).rejects.toBe(failure);
});

it('propagates the store\'s own refusal when an investigation with this id is already stored, rather than returning an assessment', async () => {
  const store = new InMemoryInvestigationStore();
  store.preoccupy('investigation-1');
  const options = baseOptions({ store });

  await expect(runDiagnosis(options)).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);
});

it('propagates a genuine failure from a composed stage, never masking it as an assessment', async () => {
  const failure = new Error('observation source is down');
  const observationSource: IObservationSource = { observeConcept: () => Promise.reject(failure) };
  const options = baseOptions({ observationSource });

  await expect(runDiagnosis(options)).rejects.toBe(failure);
});

it('refuses the second of two concurrent runs for the same investigation id once the first has already written it, never producing two assessments for one record', async () => {
  const store = new InMemoryInvestigationStore();
  const optionsA = baseOptions({ store, id: 'shared-id' });
  const optionsB = baseOptions({ store, id: 'shared-id' });

  const outcomes = await Promise.allSettled([runDiagnosis(optionsA), runDiagnosis(optionsB)]);

  expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
  expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(1);
});

// ------------------------------- criterion 2: a persistence timeout is an error, not an assessment

it('raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not conclude within what remains of the declared deadline', async () => {
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 800 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(800);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 800 });
});

// --------- criterion 3: each stage receives no more than min(nominal budget, what remains)

it('bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining deadline', async () => {
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 50_000 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(1_999);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(2_000);
});

it('bounds persistence at what remains of the declared deadline when that is smaller than the nominal two-second budget', async () => {
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 300 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(299);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(300);
});

it('clamps persistence\'s own bound to zero rather than negative, once the given deadline has already elapsed relative to now', async () => {
  const options = baseOptions({
    store: new HangingInvestigationStore(),
    consolidator: deadlineExceededConsolidator('deadline-exceeded text'),
    now: 1_000,
    deadline: 500,
  });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  // Several pure-microtask stages (collection, judgment, drafting, building)
  // run first, and only then does persistence arm its own zero-delay timer —
  // runAllTimersAsync, not a fixed advance, is what reliably catches a timer
  // scheduled partway through such a chain.
  await vi.runAllTimersAsync();
  const error = await resultPromise;

  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(0);
});

it('tightens judgment\'s own deadline to no more than the nominal five-second budget, even where the declared deadline leaves far more room', async () => {
  const options = baseOptions({
    evaluator: new HangingHypothesisEvaluator(),
    consolidator: deadlineExceededConsolidator('deadline-exceeded text'),
    now: 0,
    deadline: 1_000_000,
  });

  const resultPromise = runDiagnosis(options);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(4_999);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const assessment = await resultPromise;
  expect(assessment.text).toBe('deadline-exceeded text');
});

it('tightens judgment\'s own deadline to no more than what remains of the declared deadline, when that is smaller than the nominal five-second budget', async () => {
  const options = baseOptions({
    evaluator: new HangingHypothesisEvaluator(),
    consolidator: deadlineExceededConsolidator('deadline-exceeded text'),
    now: 0,
    deadline: 1_500,
  });

  const resultPromise = runDiagnosis(options);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(1_499);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const assessment = await resultPromise;
  expect(assessment.text).toBe('deadline-exceeded text');
});

it('forwards its own (now, deadline) pair into collection unmodified, letting a call finish just under a tight propagated deadline', async () => {
  const options = baseOptions({
    observationSource: new DelayedObservationSource(190, { result: 'ok', observation: 'observed-concept-a' }),
    now: 0,
    deadline: 200,
  });

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(190);
  const assessment = await resultPromise;

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
});

it('bounds judgment concurrency at exactly the given poolSize, rather than a hardcoded pool of its own', async () => {
  const evaluator = new ConcurrencyTrackingHypothesisEvaluator();
  const options = twoHypothesisConcurrencyOptions(evaluator);

  await runDiagnosis(options);

  expect(evaluator.maxConcurrent).toBe(1);
});

// ------------------------------------------------------- criterion 4: replay pins

it('pins the case by slug and version, the model, the prompt version and the evidence this run actually collected, in the written investigation', async () => {
  // Narrowed from the three-field pin (slug, version, hash) an earlier
  // delivery carried down to exactly two
  // (task/case-and-investigation-model/investigation-record-shape): the
  // pinned case no longer carries the case's own hash at all.
  const store = new InMemoryInvestigationStore();
  const options = baseOptions({ store, model: 'model-y', prompt_version: 'prompt-v9' });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect(document).toMatchObject({
    id: 'investigation-1',
    pinned_case: { slug: CASE_SLUG, version: CASE_VERSION },
    model: 'model-y',
    prompt_version: 'prompt-v9',
    evidence: [expectedOkEvidence('concept-a', 'observed-concept-a')],
  });
});

// -------------------------------------------- criterion 5: explicit clock, no system read

it('reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now() call appears in run-diagnosis.ts', async () => {
  const source = await runDiagnosisSource();

  expect(/Date\.now\s*\(/.test(source)).toBe(false);
  expect(/new Date\(\s*\)/.test(source)).toBe(false);
  expect(/performance\.now\s*\(/.test(source)).toBe(false);
});

it('computes the persistence deadline from the given now/deadline pair alone, unaffected by the real system clock', async () => {
  vi.setSystemTime(1_700_000_000_000); // an arbitrary, unrelated real-world instant
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 300 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(300);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(300);
});

// -------------------------------------- criterion 6: runs exactly the given case

// The two calls below once differed only in the given case's own hash —
// aCase({ hash: 'hash-A' }) and aCase({ hash: 'hash-B' }) shared the same
// slug and version — which was enough to prove each call pinned exactly its
// own case while pinned_case still carried hash. Under the narrowed pin
// (task/case-and-investigation-model/investigation-record-shape), slug and
// version were already the whole of what is pinned, and both calls' cases
// shared both, so nothing observable through pinned_case could any longer
// distinguish "this call's own case" from "the other call's case" — the
// cross-call isolation this test's name once claimed was already unprovable
// through this seam, and no different aCase(...) override was substituted in
// its place, since doing so would assert a difference the test itself never
// established. task/case-and-investigation-model/case-aggregate-shape now
// removes Case's own hash attribute entirely, so even that no-longer-load-
// bearing override stopped type-checking; both calls below now build their
// case through a bare aCase(), which asserts nothing new but keeps compiling
// what this test already asserted. What remains true and is asserted here:
// each call still writes its own document, independently, with its own
// case's slug and version pinned.
it("pins each call's own written document with its own case's slug and version, independently of the other call", async () => {
  const storeA = new InMemoryInvestigationStore();
  const storeB = new InMemoryInvestigationStore();

  await runDiagnosis(baseOptions({ id: 'investigation-a', store: storeA, case: aCase() }));
  await runDiagnosis(baseOptions({ id: 'investigation-b', store: storeB, case: aCase() }));

  const documentA = await writtenDocument(storeA, 'investigation-a');
  const documentB = await writtenDocument(storeB, 'investigation-b');
  expect(documentA).toMatchObject({ pinned_case: { slug: CASE_SLUG, version: CASE_VERSION } });
  expect(documentB).toMatchObject({ pinned_case: { slug: CASE_SLUG, version: CASE_VERSION } });
});

it('imports no case-fetching port — case-query and case-store are absent from its own module, so nothing inside it could re-resolve the case itself', async () => {
  const specifiers = await runDiagnosisImports();

  expect(specifiers.filter((specifier) => /case-query|case-store/.test(specifier))).toEqual([]);
});

// ------------------------------------------------------------- inferences

it('consolidates in the pinned case\'s own declared register, ignoring the given default, when the case declares one', async () => {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    { evaluations: [CONFIRMED_H1_EVALUATION], evidence: [expectedOkEvidence('concept-a', 'observed-concept-a')], consolidationRegister: 'formal' },
    'formal text',
  );
  const options = baseOptions({ case: aCase({ consolidation_register: 'formal' }), consolidator, defaultConsolidationRegister: 'plain' });

  const assessment = await runDiagnosis(options);

  expect(assessment.text).toBe('formal text');
});

it('forwards the given cost and durations unchanged into the written investigation, computing neither itself', async () => {
  const store = new InMemoryInvestigationStore();
  const cost: Cost = { calls: 7, input_tokens: 1_234, output_tokens: 567 };
  const durations: Durations = { collection: 11, judgment: 22, writing: 33, total: 66 };
  const options = baseOptions({ store, cost, durations });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect(document).toMatchObject({ cost, durations });
});

it('exports exactly RunDiagnosisOptions and runDiagnosis, keeping every internal helper — including its own evidence-by-hypothesis matching — private to this module', async () => {
  const names = await runDiagnosisExportedNames();

  expect(new Set(names)).toEqual(new Set(['RunDiagnosisOptions', 'runDiagnosis']));
});

it('fails fast on an empty subject attribute set before collecting any evidence, judging any hypothesis or writing anything', async () => {
  const observationSource = new CountingObservationSource();
  const evaluator = new CountingHypothesisEvaluator();
  const store = new InMemoryInvestigationStore();
  const options = baseOptions({ subjectAttributes: [], observationSource, evaluator, store });

  await expect(runDiagnosis(options)).rejects.toThrow(/carries no attribute-value/);

  expect(observationSource.calls).toBe(0);
  expect(evaluator.calls).toBe(0);
  expect(store.writeCount).toBe(0);
});
