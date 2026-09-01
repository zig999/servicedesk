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
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationWriteDeadlineExceededError } from '../../../errors/investigation-write-deadline-exceeded.error.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
import type { ConsolidationOutcome, IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';
import type { Durations } from '../../../investigation/durations.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS, type Evidence } from '../../../investigation/evidence.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { Investigation } from '../../../investigation/investigation.js';
import type { IInvestigationStore, StoredInvestigation } from '../../../investigation/investigation-store.port.js';
import type { IObservationSource, ObserveConceptOptions, ObservationOutcome, Subject } from '../../../investigation/observation-source.port.js';
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

/** One hypothesis, defaulted so a test states only its name and what it collects. */
function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: `${name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/** One manifest entry mirroring one flat Hypothesis fixture, position assigned from array order — every stage this composition runs (collectEvidence, judgeHypotheses, resolveAndNarrow) reaches theCase.manifest through case-resolution.ts, which reads it exclusively (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation). */
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

/** A minimally valid, single-hypothesis Case, so a test states only what it departs from. A test overriding `hypotheses` gets its own manifest rebuilt to match, so the two never disagree. */
function aCase(overrides: Partial<Case> = {}): Case {
  const hypotheses = overrides.hypotheses ?? [aHypothesis('h1', ['concept-a'])];
  return {
    slug: CASE_SLUG,
    title: 'A case for the diagnose composition',
    when_to_use: 'when testing the diagnose composition',
    version: CASE_VERSION,
    authored_at: CASE_AUTHORED_AT,
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-fallback-queue' } },
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
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

  // Minimal stub kept only to satisfy the widened ICapabilityQuery interface
  // (task/capability-registry-http/list-capabilities-query-extension): this
  // file's own scenarios never call listCapabilities.
  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
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
  // Minimal stubs kept only to satisfy the widened IGlossaryQuery interface
  // (task/glossary-query-http/list-vocabulary-terms-query-extension,
  // task/glossary-query-http/list-concepts-query-extension): this file's own
  // scenarios never call either.
  public async listVocabularyTerms(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listVocabularyTerms is not scripted for this file');
  }
  public async listConcepts(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listConcepts is not scripted for this file');
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

/** Answers a distinct, fully scripted EvaluationOutcome keyed by hypothesis criterion — the per-hypothesis usage/elapsed_ms fixture the cost/durations tests below need, since ImmediateHypothesisEvaluator answers one fixed outcome for every hypothesis alike. */
class ScriptedByCriterionHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly outcomes = new Map<string, EvaluationOutcome>();
  public script(criterion: string, outcome: EvaluationOutcome): void {
    this.outcomes.set(criterion, outcome);
  }
  public async evaluate(criterion: string): Promise<EvaluationOutcome> {
    const outcome = this.outcomes.get(criterion);
    if (outcome === undefined) {
      throw new Error(`ScriptedByCriterionHypothesisEvaluator has no outcome scripted for criterion ${JSON.stringify(criterion)}`);
    }
    return outcome;
  }
}

/** Answers one fixed ConsolidationOutcome regardless of input — a stand-in carrying real, non-zero usage/elapsed_ms, since FakeAssessmentConsolidator (fake-assessment-consolidator.adapter.ts) always answers a zero-valued placeholder for both. */
class ScriptedAssessmentConsolidator implements IAssessmentConsolidator {
  public constructor(private readonly outcome: ConsolidationOutcome) {}
  public async consolidate(): Promise<ConsolidationOutcome> {
    return this.outcome;
  }
}

/** Delays each concept's own ok observation by a distinct, per-concept duration — the fixture the collection-duration-is-a-max-not-a-sum test below needs, since DelayedObservationSource above delays every concept alike. */
class PerConceptDelayedObservationSource implements IObservationSource {
  private readonly delaysMs = new Map<string, number>();
  public delay(concept: string, delayMs: number): void {
    this.delaysMs.set(concept, delayMs);
  }
  public observeConcept(options: ObserveConceptOptions): Promise<ObservationOutcome> {
    const delayMs = this.delaysMs.get(options.concept) ?? 0;
    return new Promise((resolve) => setTimeout(() => resolve({ result: 'ok', observation: `observed-${options.concept}` }), delayMs));
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

/** A write that rejects immediately with the given error, every time it is called — for a test proving that a genuine, persistent write failure exhausts the first attempt and its one retry alike (rather than being propagated unmodified, which is no longer this module's own behavior once a retry exists). attempts counts every call, so a test can confirm the retry was actually issued. */
class RejectingInvestigationStore implements IInvestigationStore {
  public attempts = 0;
  public constructor(private readonly error: Error) {}
  public write(): Promise<void> {
    this.attempts += 1;
    return Promise.reject(this.error);
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/** Rejects with the given error on its first call only, then succeeds on every call after — for a test proving a failed first attempt is retried and the retry itself settles normally. */
class FailOnceThenSucceedInvestigationStore implements IInvestigationStore {
  private readonly inner = new InMemoryInvestigationStore();
  public attempts = 0;
  public constructor(private readonly firstError: Error) {}
  public async write(investigation: Investigation): Promise<void> {
    this.attempts += 1;
    if (this.attempts === 1) {
      throw this.firstError;
    }
    await this.inner.write(investigation);
  }
  public async read(id: string): Promise<StoredInvestigation | undefined> {
    return this.inner.read(id);
  }
}

/** Rejects with the given error on its first call only, after first consuming delayMs of real wall-clock time, then hangs forever on every call after — for a test proving the retry races the very same shared stage timer as the first attempt, rather than opening a fresh grant of its own. */
class DelayedRejectThenHangInvestigationStore implements IInvestigationStore {
  private calls = 0;
  public constructor(
    private readonly delayMs: number,
    private readonly firstError: Error,
  ) {}
  public write(): Promise<void> {
    this.calls += 1;
    if (this.calls === 1) {
      return new Promise((_resolve, reject) => setTimeout(() => reject(this.firstError), this.delayMs));
    }
    return new Promise(() => {});
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/** Never settles, like HangingInvestigationStore, but counts how many times it was called — for a test proving a first attempt that runs out the stage bound is never retried. */
class CountingHangingInvestigationStore implements IInvestigationStore {
  public calls = 0;
  public write(): Promise<void> {
    this.calls += 1;
    return new Promise(() => {});
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/** Rejects with the given error on its first call, then rejects with InvestigationAlreadyStoredError on every call after — for a test proving a retry (not the first attempt) that finds the record already there also counts as settled. */
class FailOnceThenAlreadyStoredInvestigationStore implements IInvestigationStore {
  private calls = 0;
  public constructor(private readonly firstError: Error) {}
  public async write(investigation: Investigation): Promise<void> {
    this.calls += 1;
    if (this.calls === 1) {
      throw this.firstError;
    }
    throw new InvestigationAlreadyStoredError(investigation.id);
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

/**
 * The Evidence a held capability's ok observation assembles for `concept`, at now=0 — the shape
 * every base fixture's collection actually produces. fields is always [{ name: 'a-field', type:
 * 'string' }]: every aCapability() fixture in this file declares that exact output schema
 * (schemaDeclaring('a-field')), read structurally by field-semantics.ts's own fieldSemanticsOf.
 * concept_description is always '': this file's own FakeGlossaryQuery.readConcept always answers
 * held: false (no test here is about the description snapshot itself —
 * evidence-collection-stage.spec.ts is).
 */
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
    // Fake timers stay frozen for the whole synchronous, microtask-only
    // path this stage's own ok branch takes (no setTimeout ever needs to
    // fire), so attemptStartedAt and the settling Date.now() read the same
    // instant and elapsed_ms is always exactly 0 here.
    elapsed_ms: 0,
    fields: [{ name: 'a-field', type: 'string' }],
    concept_description: '',
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
    case: aCase({ hypotheses: [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])] }),
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

// task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries:
// this test used to assert that a genuine persistence failure propagated to the caller unmodified.
// That is no longer this module's own behavior once a failed first attempt is retried once
// (criterion 5): where the retry also fails outright, neither attempt has settled, and
// InvestigationWriteDeadlineExceededError is raised instead (criterion 8) — the raw failure is
// never surfaced to the caller once a retry exists to answer it. attempts confirms the retry was
// actually issued rather than this test passing for the unrelated reason of a first-attempt-only
// failure.
it('raises InvestigationWriteDeadlineExceededError, not the raw failure, once both a genuine first-attempt write failure and its retry reject outright', async () => {
  const failure = new Error('disk is full');
  const store = new RejectingInvestigationStore(failure);
  const options = baseOptions({ store, now: 0, deadline: 20_000 });

  const error = await runDiagnosis(options).catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 2_000 });
  expect(store.attempts).toBe(2);
});

// This test used to assert that the store's own InvestigationAlreadyStoredError propagated to the
// caller as a rejection. That is no longer this module's own behavior: criterion 7 now counts any
// attempt — the first or the retry — that finds the investigation's own id already stored as
// settled successfully, so runDiagnosis resolves normally instead of rejecting, without a second
// record ever being persisted (proving the implementation's own disclosed inference that this path
// answers from the locally-built investigation rather than re-reading the store, since the
// pre-occupied document is not itself a valid Investigation and could not equal HAPPY_PATH_ASSESSMENT
// if it had been re-read).
it('resolves normally, with no retry issued, when the first write attempt finds the investigation already stored under its own id', async () => {
  const store = new InMemoryInvestigationStore();
  store.preoccupy('investigation-1');
  const options = baseOptions({ store });

  const assessment = await runDiagnosis(options);

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
  expect(store.writeCount).toBe(1);
});

it('propagates a genuine failure from a composed stage, never masking it as an assessment', async () => {
  const failure = new Error('observation source is down');
  const observationSource: IObservationSource = { observeConcept: () => Promise.reject(failure) };
  const options = baseOptions({ observationSource });

  await expect(runDiagnosis(options)).rejects.toBe(failure);
});

// This test used to assert that exactly one of two concurrent runs for the same investigation id
// was refused. That is no longer this module's own behavior: criterion 7 now counts the losing
// attempt's own InvestigationAlreadyStoredError as settled rather than a failure, so both runs
// resolve normally, and the store still ends up holding exactly the one record the winning attempt
// wrote — never a duplicate.
it('settles both of two concurrent runs for the same investigation id successfully, neither raising the deadline error, while the store still ends up holding exactly one record', async () => {
  const store = new InMemoryInvestigationStore();
  const optionsA = baseOptions({ store, id: 'shared-id' });
  const optionsB = baseOptions({ store, id: 'shared-id' });

  const outcomes = await Promise.allSettled([runDiagnosis(optionsA), runDiagnosis(optionsB)]);

  expect(outcomes).toEqual([
    { status: 'fulfilled', value: HAPPY_PATH_ASSESSMENT },
    { status: 'fulfilled', value: HAPPY_PATH_ASSESSMENT },
  ]);
  const document = await writtenDocument(store, 'shared-id');
  expect(document).toMatchObject({ id: 'shared-id' });
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

it('issues no write attempt at all when persistence\'s own bound is zero or less, raising immediately instead', async () => {
  const store = new InMemoryInvestigationStore();
  const options = baseOptions({
    store,
    consolidator: deadlineExceededConsolidator('deadline-exceeded text'),
    now: 1_000,
    deadline: 500,
  });

  const resultPromise = runDiagnosis(options).catch((caught: unknown) => caught);
  // Judgment's own bound clamps to zero the same way under this tight a deadline
  // (unrelated, pre-existing degrade behavior this task does not change), and its own
  // zero-delay stage timer still needs a tick to resolve — the same runAllTimersAsync the
  // existing "clamps persistence's own bound to zero..." test above already needs, for the
  // same reason.
  await vi.runAllTimersAsync();
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect(store.writeCount).toBe(0);
});

// --------------- task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries

it('bounds persistence by the time actually remaining once collection has already consumed part of the declared deadline, never by the deadline computed against the request\'s original entry instant', async () => {
  // now=0, deadline=1_000: had the old, pre-fix computation (deadline - now, ignoring
  // durations already spent) still applied, persistence's own bound here would be
  // min(2_000, 1_000) = 1_000ms. Collection alone consumes 700ms of real time
  // (DelayedObservationSource), so the fixed formula's own bound is instead
  // min(2_000, 1_000 - 700) = 300ms — provable by observing exactly when, after the 700ms
  // collection delay, the persistence timeout itself fires.
  // FakeAssessmentConsolidator's own fixture lookup key includes the collected evidence's own
  // elapsed_ms, so a run whose collection genuinely takes 700ms of real time (rather than the
  // frozen-clock 0ms baseOptions()'s own default consolidator is seeded for) needs its own
  // consolidator seeded for that real value — the same technique the "forwards its own (now,
  // deadline) pair..." test above already establishes.
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    { evaluations: [CONFIRMED_H1_EVALUATION], evidence: [{ ...expectedOkEvidence('concept-a', 'observed-concept-a'), elapsed_ms: 700 }], consolidationRegister: 'plain' },
    HAPPY_PATH_TEXT,
  );
  const options = baseOptions({
    store: new HangingInvestigationStore(),
    observationSource: new DelayedObservationSource(700, { result: 'ok', observation: 'observed-concept-a' }),
    consolidator,
    now: 0,
    deadline: 1_000,
  });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(700); // lets collection's own real delay elapse
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(299);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(300);
});

it('holds the first write attempt to the whole of the persistence stage bound — its own unchanged 2000ms nominal budget — rather than capping it below to reserve time for a retry', async () => {
  // An implementation that reserved part of the bound for a retry (e.g. capping the first
  // attempt at half of it) would time this first attempt out before 1_999ms, since only
  // some smaller fraction of the nominal 2_000ms budget would remain available to it.
  const store = new DelayedInvestigationStore(1_999);
  const options = baseOptions({ store, now: 0, deadline: 50_000 });

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(1_999);
  const assessment = await resultPromise;

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
});

it('retries exactly once after a first attempt fails outright, succeeding on that retry when it still fits within what remains of the stage bound', async () => {
  const store = new FailOnceThenSucceedInvestigationStore(new Error('a transient write failure'));
  const options = baseOptions({ store, now: 0, deadline: 50_000 });

  const assessment = await runDiagnosis(options);

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
  expect(store.attempts).toBe(2);
});

it('bounds the retry by whatever of the stage bound the first attempt\'s own elapsed time left unspent, rather than granting it a fresh budget of its own', async () => {
  // The first attempt itself consumes 1_500ms of the 2_000ms nominal bound before failing
  // outright, leaving 500ms for the retry — which then hangs forever. An implementation that
  // gave the retry its own fresh 2_000ms grant (rather than racing the same shared timer)
  // would only raise the deadline error at 1_500 + 2_000 = 3_500ms; this fix raises it at
  // exactly the original bound's own end, 2_000ms.
  const failure = new Error('a slow, transient write failure');
  const store = new DelayedRejectThenHangInvestigationStore(1_500, failure);
  const options = baseOptions({ store, now: 0, deadline: 50_000 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(1_999);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(2_000);
});

it('does not retry when the first attempt runs until the stage bound itself elapses without settling', async () => {
  const store = new CountingHangingInvestigationStore();
  const options = baseOptions({ store, now: 0, deadline: 800 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(800);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect(store.calls).toBe(1);
});

it('settles successfully without raising the deadline error when the retry — not the first attempt — finds the investigation already stored', async () => {
  const store = new FailOnceThenAlreadyStoredInvestigationStore(new Error('a transient write failure'));
  const options = baseOptions({ store, now: 0, deadline: 50_000 });

  const assessment = await runDiagnosis(options);

  expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
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
  // DelayedObservationSource(190, …) genuinely advances the fake clock by
  // 190ms before resolving, so the evidence this call actually produces
  // carries elapsed_ms: 190 — not the frozen-clock elapsed_ms: 0
  // baseConsolidator()'s default seeds via expectedOkEvidence(). This test
  // seeds its own consolidator fixture keyed on that real elapsed_ms,
  // instead of relying on baseOptions()'s zero-elapsed_ms default.
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    {
      evaluations: [CONFIRMED_H1_EVALUATION],
      evidence: [{ ...expectedOkEvidence('concept-a', 'observed-concept-a'), elapsed_ms: 190 }],
      consolidationRegister: 'plain',
    },
    HAPPY_PATH_TEXT,
  );
  const options = baseOptions({
    observationSource: new DelayedObservationSource(190, { result: 'ok', observation: 'observed-concept-a' }),
    consolidator,
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

// ------ task/investigation-telemetry/diagnose-reports-real-cost-and-durations: criteria 2-4

it('counts cost.calls as one per hypothesis whose Evaluation actually carries usage, excluding a hypothesis that degraded to no-data without ever calling the evaluator, plus one for the consolidation call', async () => {
  const store = new InMemoryInvestigationStore();
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' })); // concept-b's own capability is never held, so h2 degrades to no-data before the pool and never calls evaluate()
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-concept-a' });
  const evaluator = new ImmediateHypothesisEvaluator({
    verdict: 'confirmed',
    citations: [{ concept: 'concept-a', field: 'a-field' }],
    usage: { input_tokens: 10, output_tokens: 5 },
  });
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', usage: { input_tokens: 1, output_tokens: 2 }, elapsed_ms: 7, prompt: 'a-prompt' });
  const options = baseOptions({
    case: aCase({ hypotheses: [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])] }),
    capabilities,
    observationSource,
    evaluator,
    consolidator,
    store,
  });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost.calls).toBe(2);
});

it("excludes a hypothesis from cost.calls when its evaluator's own answer carries no usage, even though evaluate() genuinely ran for it — a call this recorded cost never charges for", async () => {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({ text: HAPPY_PATH_TEXT, usage: { input_tokens: 4, output_tokens: 2 }, elapsed_ms: 3, prompt: 'a-prompt' });
  // baseOptions()'s own default evaluator answers confirmed with no usage field at all — evaluate() genuinely runs for h1, but nothing was ever returned to charge for.
  const options = baseOptions({ store, consolidator });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost).toEqual({ calls: 1, input_tokens: 4, output_tokens: 2 });
});

it('counts cost.calls as exactly one — the consolidation call alone — when every required hypothesis degrades to no-data without ever calling the evaluator', async () => {
  const store = new InMemoryInvestigationStore();
  const capabilities = new FakeCapabilityQuery(); // concept-a's own capability is never held
  const evaluator = new CountingHypothesisEvaluator();
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'fallback text', usage: { input_tokens: 9, output_tokens: 6 }, elapsed_ms: 11, prompt: 'a-prompt' });
  const options = baseOptions({ capabilities, evaluator, consolidator, store });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost).toEqual({ calls: 1, input_tokens: 9, output_tokens: 6 });
  expect(evaluator.calls).toBe(0);
});

/** Options for two required hypotheses (h1/concept-a, h2/concept-b), both hypotheses' own capability held, evidence collection delegated to the given observation source and judgment to the given evaluator — the two-hypothesis telemetry fixture the cost-token-sum and durations-formula tests below share. */
function twoHypothesisTelemetryOptions(
  observationSource: IObservationSource,
  evaluator: IHypothesisEvaluator,
  consolidator: IAssessmentConsolidator,
): RunDiagnosisOptions {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' }));
  capabilities.hold(aCapability({ concept: 'concept-b' }));
  return baseOptions({
    case: aCase({ hypotheses: [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])] }),
    capabilities,
    observationSource,
    evaluator,
    consolidator,
  });
}

it('counts cost.calls as one per hypothesis when every required hypothesis is actually judged, plus one for the consolidation call', async () => {
  const store = new InMemoryInvestigationStore();
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-a' });
  observationSource.seed('concept-b', A_SUBJECT, { result: 'ok', observation: 'observed-b' });
  const evaluator = new ScriptedByCriterionHypothesisEvaluator();
  evaluator.script('h1 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], usage: { input_tokens: 1, output_tokens: 1 } });
  evaluator.script('h2 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-b', field: 'a-field' }], usage: { input_tokens: 1, output_tokens: 1 } });
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', usage: { input_tokens: 1, output_tokens: 1 }, elapsed_ms: 0, prompt: 'a-prompt' });
  const options = { ...twoHypothesisTelemetryOptions(observationSource, evaluator, consolidator), store };

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost.calls).toBe(3);
});

it("sums cost.input_tokens and cost.output_tokens across every judgment call's own usage and the consolidation call's own usage", async () => {
  const store = new InMemoryInvestigationStore();
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-a' });
  observationSource.seed('concept-b', A_SUBJECT, { result: 'ok', observation: 'observed-b' });
  const evaluator = new ScriptedByCriterionHypothesisEvaluator();
  evaluator.script('h1 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], usage: { input_tokens: 10, output_tokens: 5 } });
  evaluator.script('h2 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-b', field: 'a-field' }], usage: { input_tokens: 20, output_tokens: 8 } });
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', usage: { input_tokens: 7, output_tokens: 3 }, elapsed_ms: 0, prompt: 'a-prompt' });
  const options = { ...twoHypothesisTelemetryOptions(observationSource, evaluator, consolidator), store };

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost.input_tokens).toBe(37);
  expect((document as Investigation).cost.output_tokens).toBe(16);
});

it("computes durations.collection and durations.judgment as the largest of their own stage's per-unit elapsed_ms, durations.writing as the consolidation call's own elapsed_ms, and durations.total as the sum of the three", async () => {
  const store = new InMemoryInvestigationStore();
  const observationSource = new PerConceptDelayedObservationSource();
  observationSource.delay('concept-a', 100);
  observationSource.delay('concept-b', 300);
  const evaluator = new ScriptedByCriterionHypothesisEvaluator();
  evaluator.script('h1 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], elapsed_ms: 50 });
  evaluator.script('h2 criterion', { verdict: 'confirmed', citations: [{ concept: 'concept-b', field: 'a-field' }], elapsed_ms: 200 });
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 400, prompt: 'a-prompt' });
  const options = { ...twoHypothesisTelemetryOptions(observationSource, evaluator, consolidator), store };

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(300);
  await resultPromise;
  const document = await writtenDocument(store, 'investigation-1');

  const durations = (document as Investigation).durations;
  expect(durations.collection).toBe(300);
  expect(durations.judgment).toBe(200);
  expect(durations.writing).toBe(400);
  expect(durations.total).toBe(900);
});

/** Runs one diagnose call with a single delayed evidence collection, a judgment call reporting the given elapsed_ms and a consolidation call reporting the given elapsed_ms, and returns the written investigation's own durations — the two-different-timings fixture the non-constant-durations test below needs. */
async function durationsForOneRun(runTiming: {
  readonly id: string;
  readonly collectionDelayMs: number;
  readonly judgmentElapsedMs: number;
  readonly writingElapsedMs: number;
}): Promise<Durations> {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({
    text: `text-${runTiming.id}`,
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: runTiming.writingElapsedMs,
    prompt: 'a-prompt',
  });
  const options = baseOptions({
    id: runTiming.id,
    store,
    observationSource: new DelayedObservationSource(runTiming.collectionDelayMs, { result: 'ok', observation: 'observed-concept-a' }),
    evaluator: new ImmediateHypothesisEvaluator({
      verdict: 'confirmed',
      citations: [{ concept: 'concept-a', field: 'a-field' }],
      elapsed_ms: runTiming.judgmentElapsedMs,
    }),
    consolidator,
  });
  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(runTiming.collectionDelayMs);
  await resultPromise;
  const document = await writtenDocument(store, runTiming.id);
  return (document as Investigation).durations;
}

it('writes measured, non-constant durations across two diagnose calls whose evidence and judgment take different amounts of time', async () => {
  const durationsA = await durationsForOneRun({ id: 'investigation-a', collectionDelayMs: 100, judgmentElapsedMs: 50, writingElapsedMs: 20 });
  const durationsB = await durationsForOneRun({ id: 'investigation-b', collectionDelayMs: 700, judgmentElapsedMs: 500, writingElapsedMs: 90 });

  expect(durationsA).not.toEqual(durationsB);
  expect(durationsA.collection).not.toBe(durationsB.collection);
  expect(durationsA.judgment).not.toBe(durationsB.judgment);
  expect(durationsA.writing).not.toBe(durationsB.writing);
  expect(durationsA.total).not.toBe(durationsB.total);
});

it('writes an assessment carrying no usage, elapsed_ms or prompt, even though the wrapped consolidation call answered all three — capturingConsolidator captures them for cost and durations without exposing them through Assessment', async () => {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({
    text: HAPPY_PATH_TEXT,
    usage: { input_tokens: 3, output_tokens: 4 },
    elapsed_ms: 15,
    prompt: 'a consolidation prompt',
  });
  const options = baseOptions({ store, consolidator });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  const assessment = (document as Investigation).assessment;
  expect(assessment).not.toHaveProperty('usage');
  expect(assessment).not.toHaveProperty('elapsed_ms');
  expect(assessment).not.toHaveProperty('prompt');
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

// -------------------- task/case-and-investigation-model/ticket-ref-is-optional: criteria 1, 2 and 3

/**
 * Every property baseOptions() would otherwise set, except ticket_ref, assembled as a genuine
 * RunDiagnosisOptions literal rather than deleting the field from an already-built value and
 * casting it back. This literal only type-checks because RunDiagnosisOptions.ticket_ref is
 * declared `ticket_ref?: string` (task/case-and-investigation-model/ticket-ref-is-optional's own
 * criterion 1): reverting it to a required string would leave this object literal missing a
 * property the type still requires, failing `npm run typecheck` rather than merely a runtime
 * assertion below.
 */
function baseOptionsOmittingTicketRef(): RunDiagnosisOptions {
  const full = baseOptions();
  return {
    id: full.id,
    requester: full.requester,
    narrative: full.narrative,
    subjectType: full.subjectType,
    subjectAttributes: full.subjectAttributes,
    case: full.case,
    prompt_version: full.prompt_version,
    model: full.model,
    defaultConsolidationRegister: full.defaultConsolidationRegister,
    glossary: full.glossary,
    capabilities: full.capabilities,
    observationSource: full.observationSource,
    evaluator: full.evaluator,
    poolSize: full.poolSize,
    consolidator: full.consolidator,
    store: full.store,
    now: full.now,
    deadline: full.deadline,
  };
}

it('writes an investigation whose own ticket_ref is undefined, not an invented placeholder, when the given options carry no ticket_ref at all', async () => {
  const store = new InMemoryInvestigationStore();
  const options: RunDiagnosisOptions = { ...baseOptionsOmittingTicketRef(), store };

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).ticket_ref).toBeUndefined();
});

it('writes the given ticket_ref through unchanged into the written investigation when one is supplied', async () => {
  const store = new InMemoryInvestigationStore();
  const options = baseOptions({ store, ticket_ref: 'TICKET-99' });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).ticket_ref).toBe('TICKET-99');
});
