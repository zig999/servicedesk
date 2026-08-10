// Proof for task/diagnose-entry-point/diagnose-payload-and-window-dedup: the
// diagnose entry point (contracts/investigation/diagnosis) refuses a payload
// with no requester before anything else runs, applies the window dedup
// (rules/investigation/an-investigation-is-idempotent-within-a-window) only
// where a ticket reference travels — a completed match answers first, an
// in-progress match is joined next, and only where neither exists does a
// fresh run start and get registered — and it reads requester and ticket_ref
// from the payload and nowhere else. IdempotencyLeaseStore and
// resolveIdempotency are reached only indirectly, through diagnose() itself:
// their own internal correctness is already proven
// (idempotency-lease-store.spec.ts, idempotency-resolution.spec.ts), and this
// file exercises how diagnose.ts composes them, not that machinery again. No
// fake timer is needed: like that sibling machinery, every instant here is an
// explicit `now` this module never reads from the system clock.
import { expect, it } from 'vitest';
import type { Case } from '../../../case/case.js';
import { RequesterRequiredError } from '../../../errors/requester-required.error.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Cost } from '../../../investigation/cost.js';
import {
  diagnose,
  type DiagnosePayload,
  type DiagnoseRunInput,
  type DiagnoseWindowDependencies,
} from '../../../investigation/diagnose.js';
import { DiagnosisRunRegistry } from '../../../investigation/diagnosis-run-registry.js';
import type { Durations } from '../../../investigation/durations.js';
import { IdempotencyLeaseStore } from '../../../investigation/idempotency-lease-store.js';

/** The window every test that is not specifically about a different bound uses. */
const WINDOW_MS = 60_000;

const A_COST: Cost = { calls: 1, input_tokens: 10, output_tokens: 10 };
const A_DURATIONS: Durations = { collection: 1, judgment: 1, writing: 1, total: 3 };

/** A minimally valid Case, defaulted so a test states only what it overrides. */
function aCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when testing diagnose',
    version: 1,
    hash: 'a-hash',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    hypotheses: [
      {
        name: 'h1',
        criterion: 'h1 criterion',
        collects: ['a-concept'],
        resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
      },
    ],
    ...overrides,
  };
}

/**
 * A minimally valid DiagnosePayload, defaulted so a test states only what it
 * is about. requester and ticket_ref both carry a value by default; a test
 * about their absence overrides one of them to undefined explicitly.
 */
function aPayload(overrides: Partial<DiagnosePayload> = {}): DiagnosePayload {
  return {
    id: 'an-id',
    requester: 'a-requester',
    ticket_ref: 'a-ticket',
    narrative: 'a narrative',
    subjectType: 'ont',
    subjectAttributes: [{ attribute: 'id', value: 'subject-1' }],
    case: aCase(),
    prompt_version: 'v1',
    model: 'a-model',
    cost: A_COST,
    durations: A_DURATIONS,
    now: 0,
    deadline: 100_000,
    ...overrides,
  };
}

/** A minimally valid Assessment, defaulted so a test states only what distinguishes it from another one. */
function anAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    text: 'an assessment text',
    ...overrides,
  };
}

/**
 * A runFresh stand-in for the already-delivered pipeline
 * (task/diagnose-entry-point/diagnose-pipeline-composition) this task wraps
 * without modifying: records every input it is called with, in call order,
 * and answers whatever the test queued for that call number — the last
 * queued answer repeats for any call beyond the ones given. This stands in
 * for the boundary diagnose() calls through, never for business logic of its
 * own (TST-03): what it proves is how diagnose() calls it, not what a real
 * run would compute.
 */
function fakeRunner(...answers: ReadonlyArray<() => Promise<Assessment>>): {
  readonly runFresh: (input: DiagnoseRunInput) => Promise<Assessment>;
  readonly calls: DiagnoseRunInput[];
} {
  const calls: DiagnoseRunInput[] = [];
  const runFresh = (input: DiagnoseRunInput): Promise<Assessment> => {
    const answer = answers[calls.length] ?? answers[answers.length - 1];
    calls.push(input);
    return answer();
  };
  return { runFresh, calls };
}

/** One diagnose() call's own dependencies, over a fresh lease store and run registry — never shared across tests. */
function dependenciesWith(
  runFresh: (input: DiagnoseRunInput) => Promise<Assessment>,
  windowMs: number = WINDOW_MS,
): DiagnoseWindowDependencies {
  return { runFresh, leases: new IdempotencyLeaseStore(windowMs), registry: new DiagnosisRunRegistry() };
}

/**
 * Lets every microtask diagnose()'s own await chain has already queued
 * settle, without waiting on any real timer — diagnose.ts and
 * diagnosis-run-registry.ts read no clock and set no timer of their own, so
 * nothing here needs a fake one. Used only to let a first call reach the
 * point of registering itself as running before a second call for the same
 * key is issued, so that second call genuinely arrives while the first is
 * "still in progress" rather than racing it.
 */
async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

// ---------------------------------------------------- criterion 1: no requester, refused up front

it('refuses a diagnose call with no requester before starting any investigation', async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ requester: undefined });

  let refusal: unknown;
  try {
    await diagnose(payload, dependencies);
  } catch (error) {
    refusal = error;
  }

  expect(refusal).toBeInstanceOf(RequesterRequiredError);
  if (!(refusal instanceof RequesterRequiredError)) {
    throw refusal;
  }
  expect(refusal.context).toEqual({ given: undefined });
  expect(runner.calls).toHaveLength(0);
});

it('refuses a diagnose call whose requester is an empty string, the same as one that is missing altogether', async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ requester: '' });

  let refusal: unknown;
  try {
    await diagnose(payload, dependencies);
  } catch (error) {
    refusal = error;
  }

  expect(refusal).toBeInstanceOf(RequesterRequiredError);
  expect(runner.calls).toHaveLength(0);
});

// -------------------------------------------- criterion 2: a completed match within the window

it('returns the existing completed investigation for a repeated ticket_ref within the window, without starting a second run', async () => {
  const firstAssessment = anAssessment({ text: 'the completed run' });
  const runner = fakeRunner(() => Promise.resolve(firstAssessment));
  const dependencies = dependenciesWith(runner.runFresh, WINDOW_MS);
  const payload = aPayload({ ticket_ref: 'ticket-1', now: 0 });

  const first = await diagnose(payload, dependencies);
  const second = await diagnose({ ...payload, now: 500 }, dependencies);

  expect(first).toBe(firstAssessment);
  expect(second).toBe(firstAssessment);
  expect(runner.calls).toHaveLength(1);
});

it('starts a fresh run instead of returning the cached one once the window for that key has elapsed', async () => {
  const firstAssessment = anAssessment({ text: 'first run' });
  const secondAssessment = anAssessment({ text: 'second run' });
  const runner = fakeRunner(
    () => Promise.resolve(firstAssessment),
    () => Promise.resolve(secondAssessment),
  );
  const boundedWindowMs = 1_000;
  const dependencies = dependenciesWith(runner.runFresh, boundedWindowMs);
  const payload = aPayload({ ticket_ref: 'ticket-1', now: 0 });

  const first = await diagnose(payload, dependencies);
  const second = await diagnose({ ...payload, now: boundedWindowMs + 1 }, dependencies);

  expect(first).toBe(firstAssessment);
  expect(second).toBe(secondAssessment);
  expect(runner.calls).toHaveLength(2);
});

// ---------------------------------------- criterion 3: in-progress is joined, not duplicated

it('joins the same in-flight run for a repeated ticket_ref submitted while the first call has not settled yet', async () => {
  let resolveRun: (assessment: Assessment) => void = () => {};
  const pending = new Promise<Assessment>((resolve) => {
    resolveRun = resolve;
  });
  const runner = fakeRunner(() => pending);
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: 'ticket-1' });

  const firstCall = diagnose(payload, dependencies);
  await flushMicrotasks();
  const secondCall = diagnose(payload, dependencies);
  await flushMicrotasks();
  const joinedAssessment = anAssessment({ text: 'the joined run' });
  resolveRun(joinedAssessment);
  const [first, second] = await Promise.all([firstCall, secondCall]);

  expect(first).toBe(joinedAssessment);
  expect(second).toBe(joinedAssessment);
  expect(runner.calls).toHaveLength(1);
});

it('lets a joining call inherit the same rejection as the run it joined, rather than hanging or answering something else, when that run later fails', async () => {
  let rejectRun: (error: Error) => void = () => {};
  const pending = new Promise<Assessment>((_resolve, reject) => {
    rejectRun = reject;
  });
  const runner = fakeRunner(() => pending);
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: 'ticket-1' });

  const firstCall = diagnose(payload, dependencies);
  await flushMicrotasks();
  const secondCall = diagnose(payload, dependencies);
  await flushMicrotasks();
  const failure = new Error('the joined run failed');
  rejectRun(failure);

  await expect(firstCall).rejects.toBe(failure);
  await expect(secondCall).rejects.toBe(failure);
  expect(runner.calls).toHaveLength(1);
});

// ------------------------------------------- criterion 4: no ticket_ref never repeats

it('always starts a fresh run when no ticket reference is given, even for two otherwise-identical calls', async () => {
  const firstAssessment = anAssessment({ text: 'first, unmatched run' });
  const secondAssessment = anAssessment({ text: 'second, unmatched run' });
  const runner = fakeRunner(
    () => Promise.resolve(firstAssessment),
    () => Promise.resolve(secondAssessment),
  );
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: undefined, now: 0 });

  const first = await diagnose(payload, dependencies);
  const second = await diagnose(payload, dependencies);

  expect(first).toBe(firstAssessment);
  expect(second).toBe(secondAssessment);
  expect(runner.calls).toHaveLength(2);
});

// --------------------- edge case: an empty ticket_ref is present input, not absent input

it('treats an empty-string ticket_ref as a given ticket reference rather than as absent, entering the window dedup instead of always running fresh', async () => {
  const assessment = anAssessment();
  const runner = fakeRunner(() => Promise.resolve(assessment));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: '', now: 0 });

  const first = await diagnose(payload, dependencies);
  const second = await diagnose({ ...payload, now: 10 }, dependencies);

  expect(first).toBe(assessment);
  expect(second).toBe(assessment);
  expect(runner.calls).toHaveLength(1);
});

// --------------------------------------- criterion 5: requester/ticket_ref come from the payload alone

it("passes the payload's own requester and ticket_ref through to the fresh run unchanged", async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ requester: 'requester-from-payload-only', ticket_ref: 'ticket-from-payload-only' });

  await diagnose(payload, dependencies);

  expect(runner.calls).toHaveLength(1);
  expect(runner.calls[0].requester).toBe('requester-from-payload-only');
  expect(runner.calls[0].ticket_ref).toBe('ticket-from-payload-only');
});

it('threads an absent ticket_ref to the fresh run as an empty string, the mandatory field run-diagnosis.ts already declares', async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: undefined });

  await diagnose(payload, dependencies);

  expect(runner.calls[0].ticket_ref).toBe('');
});

// ------------------------------------------------------- inferences the implementation recorded

it('keys the repeat-request dedup on the case slug alone, so two payloads sharing a slug but differing in version and hash still match', async () => {
  const assessment = anAssessment();
  const runner = fakeRunner(() => Promise.resolve(assessment));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: 'ticket-1', case: aCase({ version: 1, hash: 'hash-a' }), now: 0 });

  const first = await diagnose(payload, dependencies);
  const second = await diagnose({ ...payload, case: aCase({ version: 2, hash: 'hash-b' }), now: 10 }, dependencies);

  expect(first).toBe(assessment);
  expect(second).toBe(assessment);
  expect(runner.calls).toHaveLength(1);
});

it('validates nothing about the payload besides requester and ticket_ref at this boundary, letting an otherwise-unusual field travel through unchanged', async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ narrative: '', ticket_ref: undefined });

  const result = await diagnose(payload, dependencies);

  expect(result).toBeDefined();
  expect(runner.calls[0].narrative).toBe('');
});

it("threads the payload's own id straight through to the fresh run, never generating one of its own", async () => {
  const runner = fakeRunner(() => Promise.resolve(anAssessment()));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ id: 'caller-given-id-42' });

  await diagnose(payload, dependencies);

  expect(runner.calls[0].id).toBe('caller-given-id-42');
});

// ------------------------------------------------------ edge case: the fresh run itself fails

it("propagates a fresh run's own rejection to the caller instead of swallowing it", async () => {
  const failure = new Error('fresh run failed');
  const runner = fakeRunner(() => Promise.reject(failure));
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: 'ticket-1' });

  await expect(diagnose(payload, dependencies)).rejects.toBe(failure);
});

it('lets a later call for the same key start its own fresh run once the first one has failed and settled', async () => {
  const failure = new Error('fresh run failed');
  const retryAssessment = anAssessment({ text: 'the retried run' });
  const runner = fakeRunner(
    () => Promise.reject(failure),
    () => Promise.resolve(retryAssessment),
  );
  const dependencies = dependenciesWith(runner.runFresh);
  const payload = aPayload({ ticket_ref: 'ticket-1', now: 0 });

  await expect(diagnose(payload, dependencies)).rejects.toBe(failure);
  const retried = await diagnose({ ...payload, now: 10 }, dependencies);

  expect(retried).toBe(retryAssessment);
  expect(runner.calls).toHaveLength(2);
});
