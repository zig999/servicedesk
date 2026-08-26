// Proof for task/evidence-collection/evidence-collection-stage: collectEvidence
// produces exactly one Evidence per concept in the case's collection plan, in
// parallel, within the smaller of the collection stage's own seven-second
// ceiling and whatever the propagated deadline still allows, always in the
// requester's own scope, turning every one of the four evidence-result
// endings — plus the stage's own timeout mark and the no-capability-held case
// — into data rather than a thrown failure. A genuine rejection from
// observe-concept is the one thing this stage lets through unmodified.
// Fake timers stand in for wall-clock time throughout, since
// raceObservation races a real setTimeout internally
// (idempotency-lease-store.spec.ts and idempotency-resolution.spec.ts already
// establish the sibling discipline of passing `now` explicitly; this module
// additionally owns a live timer this proof has to control).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Case } from '../../../case/case.js';
import { COLLECTION_STAGE_BUDGET_MS, collectEvidence } from '../../../investigation/evidence-collection-stage.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS } from '../../../investigation/evidence.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type {
  IObservationSource,
  ObservationOutcome,
  ObserveConceptOptions,
  Subject,
} from '../../../investigation/observation-source.port.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** The subject and requester most tests reuse; neither is what any test is about. */
const A_SUBJECT: Subject = { type: 'ont', attributes: [{ attribute: 'id', value: 'a-subject-id' }] };
const A_REQUESTER = 'a-requester';

/**
 * A minimally valid Case whose collection plan is exactly the given
 * hypotheses' collects, deduplicated in declared order — the same rule
 * case-resolution.spec.ts already proves collectionPlan itself follows.
 * collectEvidence reads theCase.manifest exclusively
 * (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation),
 * so this fixture builds a manifest entry per given hypothesis, its own
 * declared position matching that array's own order, and derives the flat
 * .hypotheses projection from the same declared entries — never
 * independently, the same convention parse-case-document.ts's own heldCase
 * keeps.
 */
function aCase(hypotheses: ReadonlyArray<{ readonly name: string; readonly collects: readonly string[] }>): Case {
  const declared = hypotheses.map((hypothesis) => ({
    name: hypothesis.name,
    criterion: `${hypothesis.name} criterion`,
    collects: hypothesis.collects,
    resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
  }));
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when testing evidence collection',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: declared.map((hypothesis, index) => ({
      position: index + 1,
      hypothesis_revision: {
        hypothesis: { name: hypothesis.name },
        revision: 1,
        criterion: hypothesis.criterion,
        collects: hypothesis.collects,
        resolution: hypothesis.resolution,
      },
    })),
    hypotheses: declared,
  };
}

/** A capability registered for exactly one concept, every other attribute defaulted so a test states only what it is about. */
function aCapability(overrides: Partial<Capability> & { readonly concept: string }): Capability {
  return {
    name: `capability-for-${overrides.concept}`,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: 'output-schema',
    timeout: 60_000,
    connector: `connector-for-${overrides.concept}`,
    ...overrides,
  };
}

/** Holds whatever capabilities a test registers, resolving every other concept as unheld — the collection stage's own upstream, standing in for the capability registry. */
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

/** Holds every capability in the map and seeds the fake observation source to answer ok with `observed-${concept}` for each — for a test whose whole plan is expected to succeed. */
function holdAndSeedOk(
  capabilities: FakeCapabilityQuery,
  observationSource: FakeObservationSource,
  capabilityFor: Readonly<Record<string, Capability>>,
): void {
  for (const [concept, capability] of Object.entries(capabilityFor)) {
    capabilities.hold(capability);
    observationSource.seed(concept, A_SUBJECT, { result: 'ok', observation: `observed-${concept}` });
  }
}

/** Resolves the one capability it is given, but only after the given delay under fake timers — proving the collection ceiling is fixed at the stage's own start rather than re-derived from however long this read itself took. */
class DelayedCapabilityQuery implements ICapabilityQuery {
  public constructor(
    private readonly capability: Capability,
    private readonly delayMs: number,
  ) {}

  public async readCapability(_concept: string): Promise<CapabilityResolution> {
    await new Promise<void>((resolve) => setTimeout(resolve, this.delayMs));
    return { held: true, capability: this.capability };
  }

  // Minimal stub kept only to satisfy the widened ICapabilityQuery interface
  // (task/capability-registry-http/list-capabilities-query-extension): this
  // file's own scenarios never call listCapabilities.
  public async listCapabilities(): Promise<never> {
    throw new Error('DelayedCapabilityQuery.listCapabilities is not scripted for this file');
  }
}

/** Answers whatever handler a test scripted for the concept, recording every call it received — a stand-in for the observation-source port whose per-concept timing a test controls directly, rather than through a real delay. */
class ScriptedObservationSource implements IObservationSource {
  public readonly calls: Array<{ readonly concept: string; readonly requester: string }> = [];

  public constructor(private readonly handlers: ReadonlyMap<string, () => Promise<ObservationOutcome>>) {}

  public async observeConcept({ concept, requester }: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.calls.push({ concept, requester });
    const handler = this.handlers.get(concept);
    if (handler === undefined) {
      throw new Error(`ScriptedObservationSource has no handler scripted for concept "${concept}"`);
    }
    return handler();
  }
}

/** A ScriptedObservationSource handler answering ok with the given observation after delayMs — for a concept whose own settling a test controls precisely. */
function resolvesAfter(delayMs: number, observation: string): () => Promise<ObservationOutcome> {
  return () => new Promise((resolve) => setTimeout(() => resolve({ result: 'ok', observation }), delayMs));
}

/** A ScriptedObservationSource handler that never settles — for a concept a test forces to reach the stage's own race timeout. */
function neverSettles(): Promise<ObservationOutcome> {
  return new Promise(() => {});
}

/** Captures the exact subject reference each observe-concept call received, keyed by concept — a stand-in for the observation-source port that answers ok unconditionally, since which ending settles is not what this fake is for; only what reached it. */
class RecordingObservationSource implements IObservationSource {
  public readonly subjectReceivedByConcept = new Map<string, Subject>();

  public async observeConcept({ concept, subject }: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.subjectReceivedByConcept.set(concept, subject);
    return { result: 'ok', observation: `observed-${concept}` };
  }
}

/** Captures the exact remainingBudgetMs each observe-concept call received, keyed by concept, and answers ok unconditionally — a stand-in for the observation-source port that lets a test see the one value this stage's own propagation actually sends across that boundary, rather than what any implementer does with it once received (task/observation-endings-and-collection-budget/observation-port-budget-clamp's own proof already covers the latter, invoking the port directly). */
class BudgetRecordingObservationSource implements IObservationSource {
  public readonly remainingBudgetMsByConcept = new Map<string, number | undefined>();

  public async observeConcept({ concept, remainingBudgetMs }: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.remainingBudgetMsByConcept.set(concept, remainingBudgetMs);
    return { result: 'ok', observation: `observed-${concept}` };
  }
}

/** What every expected Evidence shares except its result: which concept, subject and requester it was called with, and the instant the stage recorded as observed_at. */
type EvidenceContext = {
  readonly concept: string;
  readonly subject: Subject;
  readonly requester: string;
  readonly observedAt: string;
};

/** The exact call this stage makes to observe-concept, serialized as evidence.inputs pins it. */
function expectedInputs(context: EvidenceContext): string {
  return JSON.stringify({ concept: context.concept, subject: context.subject, requester: context.requester });
}

/** The full Evidence a held capability's ok observation assembles. */
function expectedOkEvidence(context: EvidenceContext & { readonly capability: Capability }, observation: string) {
  return {
    concept: context.concept,
    inputs: expectedInputs(context),
    observation,
    observed_at: context.observedAt,
    ttl: DEFAULT_EVIDENCE_TTL_SECONDS,
    origin: context.capability.connector,
    result: 'ok' as const,
    capability_name: context.capability.name,
    capability_version: context.capability.version,
  };
}

/** The full Evidence a held capability's denied, timed-out or observation-reported-unavailable ending assembles: an empty observation, and a result_detail only where one was given. */
function expectedNonOkEvidence(
  context: EvidenceContext & { readonly capability: Capability },
  result: 'denied' | 'timeout' | 'unavailable',
  resultDetail?: string,
) {
  return {
    concept: context.concept,
    inputs: expectedInputs(context),
    observation: '',
    observed_at: context.observedAt,
    ttl: DEFAULT_EVIDENCE_TTL_SECONDS,
    origin: context.capability.connector,
    result,
    ...(resultDetail === undefined ? {} : { result_detail: resultDetail }),
    capability_name: context.capability.name,
    capability_version: context.capability.version,
  };
}

/** The full Evidence this stage assembles for a concept nothing currently answers. */
function expectedUnavailableEvidence(context: EvidenceContext, resultDetail: string) {
  return {
    concept: context.concept,
    inputs: expectedInputs(context),
    observation: '',
    observed_at: context.observedAt,
    ttl: DEFAULT_EVIDENCE_TTL_SECONDS,
    origin: '',
    result: 'unavailable' as const,
    result_detail: resultDetail,
    capability_name: '',
    capability_version: '',
  };
}

it('produces exactly one evidence per concept in the collection plan, deduplicating a concept two hypotheses both collect, each carrying its resolved capability and the stage own now as observed_at', async () => {
  const capabilities = new FakeCapabilityQuery();
  const observationSource = new FakeObservationSource();
  const capabilityFor = {
    'concept-shared': aCapability({ concept: 'concept-shared' }),
    'concept-only-a': aCapability({ concept: 'concept-only-a' }),
    'concept-only-b': aCapability({ concept: 'concept-only-b' }),
  };
  holdAndSeedOk(capabilities, observationSource, capabilityFor);
  const theCase = aCase([
    { name: 'hypothesis-a', collects: ['concept-shared', 'concept-only-a'] },
    { name: 'hypothesis-b', collects: ['concept-shared', 'concept-only-b'] },
  ]);
  const now = 1_700_000_000_000;

  const result = await collectEvidence({
    case: theCase, subject: A_SUBJECT, requester: A_REQUESTER, capabilities, observationSource, now, deadline: now + 20_000,
  });

  const base = { subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(now).toISOString() };
  expect(result).toEqual(
    Object.entries(capabilityFor).map(([concept, capability]) =>
      expectedOkEvidence({ ...base, concept, capability }, `observed-${concept}`),
    ),
  );
});

it('records a denied ending as the evidence result with an empty observation, rather than throwing and aborting the stage', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept' });
  capabilities.hold(capability);
  const observationSource = new FakeObservationSource();
  observationSource.seed('a-concept', A_SUBJECT, { result: 'denied' });
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const result = await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const context = { concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(0).toISOString() };
  expect(result).toEqual([expectedNonOkEvidence({ ...context, capability }, 'denied')]);
});

it('records a concept nothing currently answers as unavailable, naming the concept, and never attempts to call observe-concept for it', async () => {
  const capabilities = new FakeCapabilityQuery();
  const observationSource = new FakeObservationSource();
  const theCase = aCase([{ name: 'h1', collects: ['unregistered-concept'] }]);

  const result = await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const context = {
    concept: 'unregistered-concept',
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    observedAt: new Date(0).toISOString(),
  };
  expect(result).toEqual([
    expectedUnavailableEvidence(context, 'no capability is currently registered for concept "unregistered-concept"'),
  ]);
});

// ---------------------------- an observation-reported unavailable ending carries its own cause

it.each([
  'CapabilityNotResolvedForObservationError',
  'DuplicateConceptAnswerError',
  'ConnectorConfigurationNotRegisteredError',
  'MalformedHttpConnectorConfigurationError',
])(
  'carries %s as the evidence result_detail for a held capability whose observation ends unavailable for that cause (rules/integration/an-unresolvable-observation-ends-unavailable, rules/integration/an-http-connector-configuration-declares-its-call)',
  async (cause) => {
    const capabilities = new FakeCapabilityQuery();
    const capability = aCapability({ concept: 'a-concept' });
    capabilities.hold(capability);
    const observationSource = new FakeObservationSource();
    observationSource.seed('a-concept', A_SUBJECT, { result: 'unavailable', result_detail: cause });
    const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

    const result = await collectEvidence({
      case: theCase,
      subject: A_SUBJECT,
      requester: A_REQUESTER,
      capabilities,
      observationSource,
      now: 0,
      deadline: 20_000,
    });

    const context = { concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(0).toISOString() };
    expect(result).toEqual([expectedNonOkEvidence({ ...context, capability }, 'unavailable', cause)]);
  },
);

it('carries no result_detail for an unavailable ending the observation reported without one, rather than requiring one to be present or inventing one', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept' });
  capabilities.hold(capability);
  const observationSource = new FakeObservationSource();
  observationSource.seed('a-concept', A_SUBJECT, { result: 'unavailable' });
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const result = await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const context = { concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(0).toISOString() };
  expect(result).toEqual([expectedNonOkEvidence({ ...context, capability }, 'unavailable')]);
});

// ---------------------------- denied and observation-reported timeout stay unchanged by this task

it('drops a result_detail the observation reported on a denied ending, leaving evidence for denied unchanged from before this task', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept' });
  capabilities.hold(capability);
  const observationSource = new FakeObservationSource();
  observationSource.seed('a-concept', A_SUBJECT, { result: 'denied', result_detail: 'a-reported-detail' });
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const result = await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const context = { concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(0).toISOString() };
  expect(result).toEqual([expectedNonOkEvidence({ ...context, capability }, 'denied')]);
});

it("drops a result_detail the observation reported on its own timeout ending, distinct from the stage's own race timeout, leaving evidence for timeout unchanged from before this task", async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept' });
  capabilities.hold(capability);
  const observationSource = new FakeObservationSource();
  observationSource.seed('a-concept', A_SUBJECT, { result: 'timeout', result_detail: 'a-reported-detail' });
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const result = await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const context = { concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, observedAt: new Date(0).toISOString() };
  expect(result).toEqual([expectedNonOkEvidence({ ...context, capability }, 'timeout')]);
});

it('records a timeout at the stage\'s own seven-second ceiling for a capability declaring ten seconds, unaffected by the three seconds its own declared timeout still had left (scenarios/investigation/a-slow-capability-yields-to-the-collection-budget)', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'equipment-state', timeout: 10_000 });
  capabilities.hold(capability);
  const observationSource = new ScriptedObservationSource(
    new Map([['equipment-state', () => new Promise<ObservationOutcome>(() => {})]]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['equipment-state'] }]);

  const resultPromise = collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });
  await vi.advanceTimersByTimeAsync(COLLECTION_STAGE_BUDGET_MS);
  const result = await resultPromise;

  const context = {
    concept: 'equipment-state',
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    observedAt: new Date(0).toISOString(),
  };
  expect(result).toEqual([
    expectedNonOkEvidence({ ...context, capability }, 'timeout', `no observation within ${COLLECTION_STAGE_BUDGET_MS}ms`),
  ]);
});

it('records a timeout at a ceiling smaller than the nominal seven seconds when the propagated deadline is nearer', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept', timeout: 10_000 });
  capabilities.hold(capability);
  const observationSource = new ScriptedObservationSource(
    new Map([['a-concept', () => new Promise<ObservationOutcome>(() => {})]]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const resultPromise = collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 3_000,
  });
  await vi.advanceTimersByTimeAsync(3_000);
  const result = await resultPromise;

  expect(result[0]).toMatchObject({ result: 'timeout', result_detail: 'no observation within 3000ms' });
});

it('clamps the effective bound to zero, timing out immediately, once the propagated deadline has already elapsed by the time the stage starts', async () => {
  const capabilities = new FakeCapabilityQuery();
  const capability = aCapability({ concept: 'a-concept', timeout: 5_000 });
  capabilities.hold(capability);
  const observationSource = new ScriptedObservationSource(
    new Map([['a-concept', () => new Promise<ObservationOutcome>(() => {})]]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const resultPromise = collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 1_000,
    deadline: 500,
  });
  await vi.advanceTimersByTimeAsync(0);
  const result = await resultPromise;

  expect(result[0]).toMatchObject({ result: 'timeout', result_detail: 'no observation within 0ms' });
});

it("propagates the stage's own seven-second budget as observe-concept's remaining-budget bound for every concept, rather than leaving a capability's own longer declared timeout to reach the call ungoverned (rules/investigation/collection-has-its-own-budget-within-the-total)", async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-longer-timeout', timeout: 10_000 }));
  capabilities.hold(aCapability({ concept: 'concept-shorter-timeout', timeout: 5_000 }));
  const observationSource = new BudgetRecordingObservationSource();
  const theCase = aCase([{ name: 'h1', collects: ['concept-longer-timeout', 'concept-shorter-timeout'] }]);

  await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  expect(observationSource.remainingBudgetMsByConcept.get('concept-longer-timeout')).toBe(COLLECTION_STAGE_BUDGET_MS);
  expect(observationSource.remainingBudgetMsByConcept.get('concept-shorter-timeout')).toBe(COLLECTION_STAGE_BUDGET_MS);
});

it('propagates the smaller, deadline-derived ceiling as remaining-budget when the propagated deadline is nearer than the nominal seven seconds, rather than the nominal figure or the capability\'s own timeout', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'a-concept', timeout: 10_000 }));
  const observationSource = new BudgetRecordingObservationSource();
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 3_000,
  });

  expect(observationSource.remainingBudgetMsByConcept.get('a-concept')).toBe(3_000);
});

it('propagates zero as remaining-budget, never undefined or a negative value, once the propagated deadline has already elapsed by the time the stage starts', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'a-concept', timeout: 5_000 }));
  const observationSource = new BudgetRecordingObservationSource();
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 1_000,
    deadline: 500,
  });

  expect(observationSource.remainingBudgetMsByConcept.get('a-concept')).toBe(0);
});

it('carries the requester unmodified into every observe-concept call, never a substituted or defaulted value', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-one' }));
  capabilities.hold(aCapability({ concept: 'concept-two' }));
  const observationSource = new ScriptedObservationSource(
    new Map([
      ['concept-one', async () => ({ result: 'ok' as const, observation: 'observed-one' })],
      ['concept-two', async () => ({ result: 'ok' as const, observation: 'observed-two' })],
    ]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-one', 'concept-two'] }]);

  await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: 'requester-alpha',
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  expect(observationSource.calls.map((call) => call.requester)).toEqual(['requester-alpha', 'requester-alpha']);
});

it('passes a subject carrying several attribute-value pairs to every concept\'s observe-concept call whole, with no pair selected out', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'concept-one' }));
  capabilities.hold(aCapability({ concept: 'concept-two' }));
  const observationSource = new RecordingObservationSource();
  const multiAttributeSubject: Subject = {
    type: 'person',
    attributes: [
      { attribute: 'id', value: '12345' },
      { attribute: 'phone', value: '555-0100' },
      { attribute: 'email', value: 'person@example.com' },
    ],
  };
  const theCase = aCase([{ name: 'h1', collects: ['concept-one', 'concept-two'] }]);

  await collectEvidence({
    case: theCase,
    subject: multiAttributeSubject,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  expect(observationSource.subjectReceivedByConcept).toEqual(
    new Map([
      ['concept-one', multiAttributeSubject],
      ['concept-two', multiAttributeSubject],
    ]),
  );
});

it('calls observe-concept exactly once for each concept in the plan, never more', async () => {
  const concepts = ['concept-one', 'concept-two', 'concept-three'];
  const capabilities = new FakeCapabilityQuery();
  for (const concept of concepts) {
    capabilities.hold(aCapability({ concept }));
  }
  const observationSource = new ScriptedObservationSource(
    new Map(concepts.map((concept) => [concept, async () => ({ result: 'ok' as const, observation: concept })])),
  );
  const theCase = aCase([{ name: 'h1', collects: concepts }]);

  await collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 20_000,
  });

  const callCountsByConcept = new Map<string, number>();
  for (const call of observationSource.calls) {
    callCountsByConcept.set(call.concept, (callCountsByConcept.get(call.concept) ?? 0) + 1);
  }
  expect(Object.fromEntries(callCountsByConcept)).toEqual({
    'concept-one': 1,
    'concept-two': 1,
    'concept-three': 1,
  });
});

it('runs every concept in parallel: a slow capability that has to time out never adds its own bound to a fast sibling\'s completion time, and both still complete correctly', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'fast-concept', timeout: 1_000 }));
  capabilities.hold(aCapability({ concept: 'slow-concept', timeout: 5_000 }));
  const observationSource = new ScriptedObservationSource(
    new Map([
      ['fast-concept', resolvesAfter(100, 'fast-observed')],
      ['slow-concept', neverSettles],
    ]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['fast-concept', 'slow-concept'] }]);

  let settled = false;
  const resultPromise = collectEvidence({
    case: theCase, subject: A_SUBJECT, requester: A_REQUESTER, capabilities, observationSource, now: 0, deadline: 20_000,
  }).then((evidences) => {
    settled = true;
    return evidences;
  });
  await vi.advanceTimersByTimeAsync(4_999);
  expect(settled).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  const result = await resultPromise;

  expect(result.map((evidence) => [evidence.concept, evidence.result])).toEqual([
    ['fast-concept', 'ok'],
    ['slow-concept', 'timeout'],
  ]);
});

it('propagates a genuine rejection from observe-concept rather than swallowing it as a non-ok evidence', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(aCapability({ concept: 'an-unseeded-concept' }));
  const observationSource = new FakeObservationSource();
  const theCase = aCase([{ name: 'h1', collects: ['an-unseeded-concept'] }]);

  await expect(
    collectEvidence({
      case: theCase,
      subject: A_SUBJECT,
      requester: A_REQUESTER,
      capabilities,
      observationSource,
      now: 0,
      deadline: 20_000,
    }),
  ).rejects.toThrow(/an-unseeded-concept/);
});

it("keeps the effective observation bound at the stage's own fixed seven-second ceiling, unaffected by how long the capability-registry read itself took", async () => {
  const capability = aCapability({ concept: 'a-concept', timeout: 10_000 });
  const capabilities = new DelayedCapabilityQuery(capability, 8_000);
  const observationSource = new ScriptedObservationSource(
    new Map([['a-concept', () => new Promise<ObservationOutcome>(() => {})]]),
  );
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const resultPromise = collectEvidence({
    case: theCase,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    capabilities,
    observationSource,
    now: 0,
    deadline: 10_000,
  });
  await vi.advanceTimersByTimeAsync(8_000);
  await vi.advanceTimersByTimeAsync(COLLECTION_STAGE_BUDGET_MS);
  const result = await resultPromise;

  expect(result[0]).toMatchObject({
    result: 'timeout',
    result_detail: `no observation within ${COLLECTION_STAGE_BUDGET_MS}ms`,
  });
});

// ------------------------------------------------------------- module purity

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/evidence-collection-stage.ts', import.meta.url));

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier evidence-collection-stage.ts itself imports. */
async function evidenceCollectionStageImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

it(
  'imports no framework, driver or provider-client package directly — every import specifier is a relative path, reaching infrastructure only through the observation-source port it is given (constraints/the-domain-depends-on-no-infrastructure)',
  async () => {
    const specifiers = await evidenceCollectionStageImports();

    const nonRelativeSpecifiers = specifiers.filter((specifier) => !specifier.startsWith('.'));

    expect(nonRelativeSpecifiers).toEqual([]);
  },
);
