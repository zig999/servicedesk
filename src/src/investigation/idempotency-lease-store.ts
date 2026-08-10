// The in-progress half of rules/investigation/an-investigation-is-idempotent-within-a-window,
// held exactly to constraints/in-progress-is-a-lease-not-domain-state's
// fitness clause: a key and an instant, nothing else, kept in process
// memory rather than written to any file (see this module's own inference
// on why — recorded in the implementation record, not here, since no
// specification node states a persistence requirement for this store one
// way or the other). No investigation, no partial record and no status
// field is ever held here.

import { idempotencyKeyOf, type IdempotencyKey } from './idempotency-key.js';

/**
 * The lease itself (constraints/in-progress-is-a-lease-not-domain-state):
 * the key it was acquired for and the instant it was acquired, as epoch
 * milliseconds — the fitness clause's own literal test, "the lease store
 * holds nothing but keys and instants," satisfied by this shape having
 * nothing else to add.
 */
export type Lease = {
  readonly key: IdempotencyKey;
  readonly heldAt: number;
};

/**
 * What one acquire() call answers: whether this call is the one that just
 * claimed the lease (acquired: true), or an unexpired lease was already
 * held for this key and this call left it untouched (acquired: false) —
 * the caller's signal to join the held lease rather than start a second
 * investigation. Either way, `lease` is the one now in force for the key.
 */
export type AcquireResult = { readonly acquired: boolean; readonly lease: Lease };

/**
 * Holds one lease per key, entirely in process memory, for exactly as long
 * as the configured window bound to this store at construction. Every
 * instant this store compares against is given to it by its caller — it
 * never reads the system clock itself — so window expiry is exercised
 * deterministically with fixture instants alone, never by waiting out a
 * real window in a test.
 */
export class IdempotencyLeaseStore {
  private readonly leases = new Map<string, Lease>();

  public constructor(private readonly windowMs: number) {}

  /**
   * Checks and claims in one call: where no lease is held for this key, or
   * the one held is now outside the configured window, claims a fresh
   * lease at `now` and answers acquired: true; otherwise leaves the held
   * lease untouched and answers acquired: false with it, so a caller can
   * join it rather than start a second investigation
   * (rules/investigation/an-investigation-is-idempotent-within-a-window).
   */
  public acquire(key: IdempotencyKey, now: number): AcquireResult {
    const held = this.currentLease(key, now);
    if (held !== undefined) {
      return { acquired: false, lease: held };
    }
    const lease: Lease = { key, heldAt: now };
    this.leases.set(idempotencyKeyOf(key), lease);
    return { acquired: true, lease };
  }

  /**
   * Answers the lease currently held for this key, or undefined where none
   * was ever acquired or the one acquired is now outside the configured
   * window — a lease outside the window no longer blocks a fresh request,
   * so it reads as absent here rather than as expired data, derived fresh
   * from the two instants on every call rather than from a stored flag.
   */
  public currentLease(key: IdempotencyKey, now: number): Lease | undefined {
    const lease = this.leases.get(idempotencyKeyOf(key));
    if (lease === undefined || now - lease.heldAt >= this.windowMs) {
      return undefined;
    }
    return lease;
  }
}
