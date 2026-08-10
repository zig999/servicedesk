// Proof for task/investigation-lifecycle/idempotency-window's composition
// (rules/investigation/an-investigation-is-idempotent-within-a-window,
// scenarios/investigation/a-repeated-request-returns-the-same-investigation):
// a completed match answers first and claims no lease — even where a lease
// happens to still be held for the same key — an unexpired held lease
// answers next for the caller to join, and only where neither exists does
// resolving claim a fresh lease and answer free, claiming it itself so a
// concurrent duplicate call joins it rather than also answering free. Read
// alongside idempotency-lease-store.spec.ts, which proves the window bound
// this composition's own free/in-progress split depends on.
import { expect, it } from 'vitest';
import { IdempotencyLeaseStore } from '../../../investigation/idempotency-lease-store.js';
import { resolveIdempotency } from '../../../investigation/idempotency-resolution.js';
import * as resolutionModule from '../../../investigation/idempotency-resolution.js';
import type { IdempotencyKey } from '../../../investigation/idempotency-key.js';

const WINDOW_MS = 1_000;

/** The key every test below resolves. */
const A_KEY: IdempotencyKey = {
  subject: { type: 'ont', attributes: [{ attribute: 'id', value: 'subject-one' }] },
  caseReference: 'case-one',
  ticketRef: 'ticket-one',
};

/** A findCompleted that answers no match for any key — the free/in-progress tests' own baseline. */
async function findsNoCompletedMatch(_key: IdempotencyKey): Promise<undefined> {
  return undefined;
}

it('answers the completed investigation and claims no lease when the key already matches one', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  const match = { investigationId: 'the-completed-investigation' };

  const outcome = await resolveIdempotency({
    key: A_KEY,
    now: 0,
    leases,
    findCompleted: async () => match,
  });

  expect(outcome).toEqual({ outcome: 'completed', match });
  expect(leases.currentLease(A_KEY, 0)).toBeUndefined();
});

it('answers in-progress joining the exact lease already held for the key, rather than claiming a second one', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  const held = leases.acquire(A_KEY, 0);

  const outcome = await resolveIdempotency({
    key: A_KEY,
    now: 10,
    leases,
    findCompleted: findsNoCompletedMatch,
  });

  expect(outcome).toEqual({ outcome: 'in-progress', lease: held.lease });
  expect(leases.currentLease(A_KEY, 10)).toEqual(held.lease);
});

it('answers free with a freshly claimed lease once the previously held lease for the key has fallen outside the window', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);

  const outcome = await resolveIdempotency({
    key: A_KEY,
    now: WINDOW_MS + 50,
    leases,
    findCompleted: findsNoCompletedMatch,
  });

  expect(outcome).toEqual({ outcome: 'free', lease: { key: A_KEY, heldAt: WINDOW_MS + 50 } });
});

it('answers completed even though an unexpired lease happens to be held for the same key, leaving that lease untouched', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);
  const match = { investigationId: 'the-completed-investigation' };

  const outcome = await resolveIdempotency({
    key: A_KEY,
    now: 10,
    leases,
    findCompleted: async () => match,
  });

  expect(outcome).toEqual({ outcome: 'completed', match });
  expect(leases.currentLease(A_KEY, 10)).toEqual({ key: A_KEY, heldAt: 0 });
});

it('claims the lease itself on the free branch, so a second concurrent call for the same key joins it as in-progress rather than also answering free', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);

  const firstCall = await resolveIdempotency({
    key: A_KEY,
    now: 0,
    leases,
    findCompleted: findsNoCompletedMatch,
  });
  const secondCall = await resolveIdempotency({
    key: A_KEY,
    now: 10,
    leases,
    findCompleted: findsNoCompletedMatch,
  });

  expect(firstCall).toEqual({ outcome: 'free', lease: { key: A_KEY, heldAt: 0 } });
  expect(secondCall).toEqual({ outcome: 'in-progress', lease: { key: A_KEY, heldAt: 0 } });
});

it('answers completed no matter how far `now` sits from when the match might have been reached, since it never itself re-derives "within the window" from the completed match', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  const match = { investigationId: 'a-long-completed-investigation' };

  const outcome = await resolveIdempotency({
    key: A_KEY,
    now: WINDOW_MS * 1_000_000,
    leases,
    findCompleted: async () => match,
  });

  expect(outcome).toEqual({ outcome: 'completed', match });
});

it('exports nothing beyond the resolution composition itself — no stub investigation write path is exported alongside it', () => {
  expect(Object.keys(resolutionModule).sort()).toEqual(['resolveIdempotency']);
});
