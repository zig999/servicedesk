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

const CASE_SLUG = 'a-case';
const CASE_VERSION = 1;
const CASE_AUTHORED_AT = '2024-01-01T00:00:00.000Z';
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

class ImmediateHypothesisEvaluator implements IHypothesisEvaluator {
  public constructor(private readonly outcome: EvaluationOutcome) {}
  public async evaluate(): Promise<EvaluationOutcome> {
    return this.outcome;
  }
}

class HangingHypothesisEvaluator implements IHypothesisEvaluator {
  public evaluate(): Promise<EvaluationOutcome> {
    return new Promise(() => {});
  }
}

class CountingHypothesisEvaluator implements IHypothesisEvaluator {
  public calls = 0;
  public async evaluate(): Promise<EvaluationOutcome> {
    this.calls += 1;
    return { verdict: 'confirmed', citations: [{ concept: 'unused', field: 'unused' }] };
  }
}

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

class DelayedObservationSource implements IObservationSource {
  public constructor(
    private readonly delayMs: number,
    private readonly outcome: ObservationOutcome,
  ) {}
  public observeConcept(): Promise<ObservationOutcome> {
    return new Promise((resolve) => setTimeout(() => resolve(this.outcome), this.delayMs));
  }
}

class CountingObservationSource implements IObservationSource {
  public calls = 0;
  public async observeConcept(): Promise<ObservationOutcome> {
    this.calls += 1;
    return { result: 'ok', observation: 'unused' };
  }
}

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

class ScriptedAssessmentConsolidator implements IAssessmentConsolidator {
  public constructor(private readonly outcome: ConsolidationOutcome) {}
  public async consolidate(): Promise<ConsolidationOutcome> {
    return this.outcome;
  }
}

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

class InMemoryInvestigationStore implements IInvestigationStore {
  private readonly documents = new Map<string, unknown>();
  public writeCount = 0;

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

class HangingInvestigationStore implements IInvestigationStore {
  public write(): Promise<void> {
    return new Promise(() => {});
  }
  public async read(): Promise<StoredInvestigation | undefined> {
    return undefined;
  }
}

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

class DelayedRejectThenSucceedInvestigationStore implements IInvestigationStore {
  private readonly inner = new InMemoryInvestigationStore();
  private calls = 0;
  public constructor(
    private readonly delayMs: number,
    private readonly firstError: Error,
  ) {}
  public write(investigation: Investigation): Promise<void> {
    this.calls += 1;
    if (this.calls === 1) {
      return new Promise((_resolve, reject) => setTimeout(() => reject(this.firstError), this.delayMs));
    }
    return this.inner.write(investigation);
  }
  public async read(id: string): Promise<StoredInvestigation | undefined> {
    return this.inner.read(id);
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
  register: 'plain',
  usage: { input_tokens: 0, output_tokens: 0 },
  elapsed_ms: 0,
  prompt: '',
};

function baseConsolidator(register: 'formal' | 'plain' = 'plain'): FakeAssessmentConsolidator {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    { evaluations: [CONFIRMED_H1_EVALUATION], evidence: [expectedOkEvidence('concept-a', 'observed-concept-a')], consolidationRegister: register },
    HAPPY_PATH_TEXT,
  );
  return consolidator;
}

function deadlineExceededConsolidator(text: string): FakeAssessmentConsolidator {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed({ evaluations: [DEADLINE_EXCEEDED_H1_EVALUATION], evidence: [], consolidationRegister: 'plain' }, text);
  return consolidator;
}

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

it('raises InvestigationWriteDeadlineExceededError, not the raw failure, once both a genuine first-attempt write failure and its retry reject outright', async () => {
  const failure = new Error('disk is full');
  const store = new RejectingInvestigationStore(failure);
  const options = baseOptions({ store, now: 0, deadline: 20_000 });

  const error = await runDiagnosis(options).catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 2_000 });
  expect(store.attempts).toBe(2);
});

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

it('raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not conclude within what remains of the declared deadline', async () => {
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 800 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(800);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 800 });
});

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

  await vi.runAllTimersAsync();
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect(store.writeCount).toBe(0);
});

it('bounds persistence by the time actually remaining once collection has already consumed part of the declared deadline, never by the deadline computed against the request\'s original entry instant', async () => {

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
  await vi.advanceTimersByTimeAsync(700);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(299);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(300);
});

it('computes persistence\'s own bound from the actual wall-clock time elapsed before persistence begins, never from durations.collection + durations.judgment + durations.writing — a write still proceeds even where those reported durations would sum to more than the whole deadline', async () => {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({
    text: HAPPY_PATH_TEXT,
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 1_000,
    prompt: 'a-prompt',
  });
  const options = baseOptions({
    store,
    evaluator: new ImmediateHypothesisEvaluator({
      verdict: 'confirmed',
      citations: [{ concept: 'concept-a', field: 'a-field' }],
      elapsed_ms: 20_000,
    }),
    consolidator,
    now: 0,
    deadline: 20_000,
  });

  await runDiagnosis(options);

  expect(store.writeCount).toBe(1);
});

it('issues no write attempt when persistence begins after the propagated deadline has already been consumed by real wall-clock time inside judgment, even though a deadline-exceeded judgment carries no elapsed_ms of its own and so durations.collection + durations.judgment + durations.writing reads as zero', async () => {
  const store = new InMemoryInvestigationStore();
  const options = baseOptions({
    store,
    evaluator: new HangingHypothesisEvaluator(),
    consolidator: deadlineExceededConsolidator('deadline-exceeded text'),
    now: 0,
    deadline: 5_000,
  });

  const resultPromise = runDiagnosis(options).catch((caught: unknown) => caught);
  await vi.runAllTimersAsync();
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 0 });
  expect(store.writeCount).toBe(0);
});

it('holds the first write attempt to the whole of the persistence stage bound — its own unchanged 2000ms nominal budget — rather than capping it below to reserve time for a retry', async () => {

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

it("reads written_at from the clock at persistence time, distinctly later than the request's own entry instant once collection has consumed real wall-clock time", async () => {
  const REQUEST_ENTRY_INSTANT = 1_700_000_000_000;
  vi.setSystemTime(REQUEST_ENTRY_INSTANT);
  const store = new InMemoryInvestigationStore();
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    { evaluations: [CONFIRMED_H1_EVALUATION], evidence: [{ ...expectedOkEvidence('concept-a', 'observed-concept-a'), elapsed_ms: 500 }], consolidationRegister: 'plain' },
    HAPPY_PATH_TEXT,
  );
  const options = baseOptions({
    store,
    observationSource: new DelayedObservationSource(500, { result: 'ok', observation: 'observed-concept-a' }),
    consolidator,
    now: 0,
    deadline: 20_000,
  });

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(500);
  await resultPromise;
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).written_at).toBe(new Date(REQUEST_ENTRY_INSTANT + 500).toISOString());
});

it("records written_at from the retry's own fresh clock reading when the retry — not the first attempt — is the one that settles, never from the first attempt's own start", async () => {
  const START_INSTANT = 1_700_000_000_000;
  vi.setSystemTime(START_INSTANT);
  const store = new DelayedRejectThenSucceedInvestigationStore(500, new Error('a transient write failure'));
  const options = baseOptions({ store, now: 0, deadline: 50_000 });

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(500);
  await resultPromise;
  const stored = await store.read('investigation-1');

  expect((stored?.document as Investigation).written_at).toBe(new Date(START_INSTANT + 500).toISOString());
});

it('leaves the already-present record\'s own written_at untouched, never restamping it, when the first write attempt finds the investigation already stored', async () => {
  const store = new InMemoryInvestigationStore();
  store.preoccupy('investigation-1');
  const options = baseOptions({ store });

  await runDiagnosis(options);
  const stored = await store.read('investigation-1');

  expect(stored?.document).toEqual({ id: 'investigation-1' });
});

it('reads written_at from the clock immediately before dispatching a write attempt, not from a reading taken after the store confirms that attempt has settled', async () => {
  const START_INSTANT = 1_700_000_000_000;
  vi.setSystemTime(START_INSTANT);
  const store = new DelayedInvestigationStore(500);
  const options = baseOptions({ store, now: 0, deadline: 20_000 });

  const resultPromise = runDiagnosis(options);
  await vi.advanceTimersByTimeAsync(500);
  await resultPromise;
  const stored = await store.read('investigation-1');

  expect((stored?.document as Investigation).written_at).toBe(new Date(START_INSTANT).toISOString());
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

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  const tracker = trackSettlement(resultPromise);
  await vi.advanceTimersByTimeAsync(1_499);
  expect(tracker.settled()).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context).toEqual({ id: 'investigation-1', remainingMs: 0 });
});

it('forwards its own (now, deadline) pair into collection unmodified, letting a call finish just under a tight propagated deadline', async () => {

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

it('pins the case by slug and version, the model, the prompt version and the evidence this run actually collected, in the written investigation', async () => {

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

it('reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now() call appears in run-diagnosis.ts', async () => {
  const source = await runDiagnosisSource();

  expect(/Date\.now\s*\(/.test(source)).toBe(false);
  expect(/new Date\(\s*\)/.test(source)).toBe(false);
  expect(/performance\.now\s*\(/.test(source)).toBe(false);
});

it('computes the persistence deadline from the given now/deadline pair alone, unaffected by the real system clock', async () => {
  vi.setSystemTime(1_700_000_000_000);
  const options = baseOptions({ store: new HangingInvestigationStore(), now: 0, deadline: 300 });

  const resultPromise = runDiagnosis(options).catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(300);
  const error = await resultPromise;

  expect(error).toBeInstanceOf(InvestigationWriteDeadlineExceededError);
  expect((error as InvestigationWriteDeadlineExceededError).context.remainingMs).toBe(300);
});

it('imports no case-fetching port — case-query and case-store are absent from its own module, so nothing inside it could re-resolve the case itself', async () => {
  const specifiers = await runDiagnosisImports();

  expect(specifiers.filter((specifier) => /case-query|case-store/.test(specifier))).toEqual([]);
});

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

it('counts cost.calls as one per hypothesis whose Evaluation actually carries usage, excluding a hypothesis that degraded to no-data without ever calling the evaluator, plus one for the consolidation call', async () => {
  const store = new InMemoryInvestigationStore();
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-a' }));
  const observationSource = new FakeObservationSource();
  observationSource.seed('concept-a', A_SUBJECT, { result: 'ok', observation: 'observed-concept-a' });
  const evaluator = new ImmediateHypothesisEvaluator({
    verdict: 'confirmed',
    citations: [{ concept: 'concept-a', field: 'a-field' }],
    usage: { input_tokens: 10, output_tokens: 5 },
  });
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', register: 'plain', usage: { input_tokens: 1, output_tokens: 2 }, elapsed_ms: 7, prompt: 'a-prompt' });
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
  const consolidator = new ScriptedAssessmentConsolidator({ text: HAPPY_PATH_TEXT, register: 'plain', usage: { input_tokens: 4, output_tokens: 2 }, elapsed_ms: 3, prompt: 'a-prompt' });

  const options = baseOptions({ store, consolidator });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost).toEqual({ calls: 1, input_tokens: 4, output_tokens: 2 });
});

it('counts cost.calls as exactly one — the consolidation call alone — when every required hypothesis degrades to no-data without ever calling the evaluator', async () => {
  const store = new InMemoryInvestigationStore();
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new CountingHypothesisEvaluator();
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'fallback text', register: 'plain', usage: { input_tokens: 9, output_tokens: 6 }, elapsed_ms: 11, prompt: 'a-prompt' });
  const options = baseOptions({ capabilities, evaluator, consolidator, store });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  expect((document as Investigation).cost).toEqual({ calls: 1, input_tokens: 9, output_tokens: 6 });
  expect(evaluator.calls).toBe(0);
});

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
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', register: 'plain', usage: { input_tokens: 1, output_tokens: 1 }, elapsed_ms: 0, prompt: 'a-prompt' });
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
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', register: 'plain', usage: { input_tokens: 7, output_tokens: 3 }, elapsed_ms: 0, prompt: 'a-prompt' });
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
  const consolidator = new ScriptedAssessmentConsolidator({ text: 'consolidated text', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 400, prompt: 'a-prompt' });
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

async function durationsForOneRun(runTiming: {
  readonly id: string;
  readonly collectionDelayMs: number;
  readonly judgmentElapsedMs: number;
  readonly writingElapsedMs: number;
}): Promise<Durations> {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({
    text: `text-${runTiming.id}`, register: 'plain', usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: runTiming.writingElapsedMs, prompt: 'a-prompt',
  });
  const options = baseOptions({
    id: runTiming.id,
    store,
    observationSource: new DelayedObservationSource(runTiming.collectionDelayMs, { result: 'ok', observation: 'observed-concept-a' }),
    evaluator: new ImmediateHypothesisEvaluator({
      verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }], elapsed_ms: runTiming.judgmentElapsedMs,
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

it("writes an assessment carrying exactly the register, usage, elapsed_ms and prompt the consolidation call itself answered with — never the register the caller requested, when the two differ", async () => {
  const store = new InMemoryInvestigationStore();
  const consolidator = new ScriptedAssessmentConsolidator({
    text: HAPPY_PATH_TEXT,
    register: 'formal',
    usage: { input_tokens: 3, output_tokens: 4 },
    elapsed_ms: 15,
    prompt: 'a consolidation prompt',
  });
  const options = baseOptions({ store, consolidator, defaultConsolidationRegister: 'plain' });

  await runDiagnosis(options);
  const document = await writtenDocument(store, 'investigation-1');

  const assessment = (document as Investigation).assessment;
  expect({
    register: assessment.register,
    usage: assessment.usage,
    elapsed_ms: assessment.elapsed_ms,
    prompt: assessment.prompt,
  }).toEqual({
    register: 'formal',
    usage: { input_tokens: 3, output_tokens: 4 },
    elapsed_ms: 15,
    prompt: 'a consolidation prompt',
  });
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
