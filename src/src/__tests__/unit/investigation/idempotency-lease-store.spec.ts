// Proof for task/investigation-lifecycle/idempotency-window's lease store
// (constraints/in-progress-is-a-lease-not-domain-state,
// rules/investigation/an-investigation-is-idempotent-within-a-window): the
// lease it holds carries nothing but a key and the instant it was acquired
// at, an already-held, unexpired lease is left untouched rather than
// replaced, that same lease no longer blocks a fresh acquire once the
// configured window has elapsed, and two distinct keys never share or
// disturb each other's lease. Read alongside idempotency-resolution.spec.ts,
// which proves the same window bound again through the composition a
// caller actually calls.
import { expect, it } from 'vitest';
import { IdempotencyLeaseStore } from '../../../investigation/idempotency-lease-store.js';
import * as leaseStoreModule from '../../../investigation/idempotency-lease-store.js';
import type { IdempotencyKey } from '../../../investigation/idempotency-key.js';

const WINDOW_MS = 1_000;

/** The key most tests hold a lease for. */
const A_KEY: IdempotencyKey = {
  subject: { type: 'ont', attributes: [{ attribute: 'id', value: 'subject-one' }] },
  caseReference: 'case-one',
  ticketRef: 'ticket-one',
};

/** A second key, distinct in every field, for the no-collision test. */
const ANOTHER_KEY: IdempotencyKey = {
  subject: { type: 'ope', attributes: [{ attribute: 'id', value: 'subject-two' }] },
  caseReference: 'case-two',
  ticketRef: 'ticket-two',
};

it('holds a lease carrying exactly the key and the acquiring instant, both on acquire and on a later read', () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);

  const claim = store.acquire(A_KEY, 0);

  expect(Object.keys(claim.lease).sort()).toEqual(['heldAt', 'key']);
  expect(claim.lease).toEqual({ key: A_KEY, heldAt: 0 });
  expect(store.currentLease(A_KEY, 10)).toEqual({ key: A_KEY, heldAt: 0 });
});

it('answers acquired: true with a fresh lease once the previously held one has fallen outside the configured window', () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);
  store.acquire(A_KEY, 0);

  const claim = store.acquire(A_KEY, WINDOW_MS + 50);

  expect(claim).toEqual({ acquired: true, lease: { key: A_KEY, heldAt: WINDOW_MS + 50 } });
});

it("answers the lease as absent exactly at the window's own boundary instant", () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);
  store.acquire(A_KEY, 0);

  expect(store.currentLease(A_KEY, WINDOW_MS)).toBeUndefined();
  const claim = store.acquire(A_KEY, WINDOW_MS);
  expect(claim).toEqual({ acquired: true, lease: { key: A_KEY, heldAt: WINDOW_MS } });
});

it('still answers the lease as held one instant before the window elapses', () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);
  store.acquire(A_KEY, 0);

  expect(store.currentLease(A_KEY, WINDOW_MS - 1)).toEqual({ key: A_KEY, heldAt: 0 });
  const claim = store.acquire(A_KEY, WINDOW_MS - 1);
  expect(claim).toEqual({ acquired: false, lease: { key: A_KEY, heldAt: 0 } });
});

it('leaves an already-held, unexpired lease untouched on a second concurrent acquire for the same key', () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);
  const first = store.acquire(A_KEY, 0);

  const second = store.acquire(A_KEY, 10);

  expect(second).toEqual({ acquired: false, lease: first.lease });
  expect(store.currentLease(A_KEY, 10)).toEqual(first.lease);
});

it('never lets a lease held for one key answer, block, or be disturbed by an acquire for a different key', () => {
  const store = new IdempotencyLeaseStore(WINDOW_MS);
  const forFirstKey = store.acquire(A_KEY, 0);

  const forAnotherKey = store.acquire(ANOTHER_KEY, 0);

  expect(forAnotherKey).toEqual({ acquired: true, lease: { key: ANOTHER_KEY, heldAt: 0 } });
  expect(store.currentLease(A_KEY, 0)).toEqual(forFirstKey.lease);
});

it('exports nothing beyond the lease store itself — no stub investigation type or write path is exported from the module backing the in-progress branch', () => {
  expect(Object.keys(leaseStoreModule).sort()).toEqual(['IdempotencyLeaseStore']);
});
