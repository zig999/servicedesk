// Tells a caller which of the three outcomes
// rules/investigation/an-investigation-is-idempotent-within-a-window names
// applies to one repeat-request key — never what the caller does about it.
// A completed match answers first, an unexpired lease answers next and is
// the caller's to join, and only where neither exists does this call claim
// a fresh lease on the caller's behalf and answer free, so a second
// concurrent call for the very same key sees the lease this call just
// claimed rather than also reading free.

import { IdempotencyLeaseStore, type Lease } from './idempotency-lease-store.js';
import type { IdempotencyKey } from './idempotency-key.js';

/**
 * The three outcomes the rule names for a repeated request, generic over
 * what a completed match carries so a caller can plug in the real
 * completed-investigation answer
 * (task/investigation-lifecycle/investigation-store,
 * task/investigation-lifecycle/diagnose-entry-point) without this module
 * depending on that type. What a caller does with each — returning the
 * match, joining the held lease, or running the stages and writing a new
 * investigation — is exactly what this module leaves to whoever calls it.
 */
export type IdempotencyOutcome<CompletedMatch> =
  | { readonly outcome: 'completed'; readonly match: CompletedMatch }
  | { readonly outcome: 'in-progress'; readonly lease: Lease }
  | { readonly outcome: 'free'; readonly lease: Lease };

/**
 * What one resolveIdempotency() call needs: the key repeated, the instant
 * it repeats at, the lease store to check and claim against, and
 * findCompleted — the plug point for the real completed-investigation
 * answer. This task never calls a real one: a caller with no completed
 * store yet can pass a findCompleted that always resolves to undefined and
 * still exercise the in-progress and free branches whole.
 */
export type ResolveIdempotencyOptions<CompletedMatch> = {
  readonly key: IdempotencyKey;
  readonly now: number;
  readonly leases: IdempotencyLeaseStore;
  readonly findCompleted: (key: IdempotencyKey) => Promise<CompletedMatch | undefined>;
};

/**
 * Resolves one repeat-request key in the rule's own precedence: a completed
 * match answers first even where a lease happens to still be held, an
 * unexpired held lease answers next, and only where neither exists does
 * this call claim a fresh lease and answer free
 * (rules/investigation/an-investigation-is-idempotent-within-a-window,
 * scenarios/investigation/a-repeated-request-returns-the-same-investigation).
 */
export async function resolveIdempotency<CompletedMatch>(
  options: ResolveIdempotencyOptions<CompletedMatch>,
): Promise<IdempotencyOutcome<CompletedMatch>> {
  const match = await options.findCompleted(options.key);
  if (match !== undefined) {
    return { outcome: 'completed', match };
  }
  const claim = options.leases.acquire(options.key, options.now);
  return claim.acquired
    ? { outcome: 'free', lease: claim.lease }
    : { outcome: 'in-progress', lease: claim.lease };
}
