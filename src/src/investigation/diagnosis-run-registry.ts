// The completed-match cache and in-progress join point
// rules/investigation/an-investigation-is-idempotent-within-a-window's own
// "completed returns it, in progress joins it" needs beyond what
// IdempotencyLeaseStore or IInvestigationStore can answer on their own
// (task/diagnose-entry-point/diagnose-payload-and-window-dedup):
// IdempotencyLeaseStore's own lease is exactly the in-progress marker
// constraints/in-progress-is-a-lease-not-domain-state names, and its own
// fitness clause holds it to nothing but a key and an instant — so neither
// a completed investigation's own identity nor a reference to its own
// in-flight promise can live there without breaking that fitness clause.
// IInvestigationStore, in turn, only answers a read keyed by an
// investigation's own id, and Investigation itself carries no absolute
// instant a completed match could be checked for staleness against
// (domain/investigation/investigation's own attribute list) — so a
// completed match here is bounded by the very same lease's own window
// instead of this module inventing a second, independent expiry.
// idempotency-resolution.ts's own proof (idempotency-resolution.spec.ts)
// establishes that resolveIdempotency never re-derives "within the window"
// from a completed match itself — that is left entirely to findCompleted,
// which is exactly this module's own completedMatch below.
//
// Neither map below is domain state, and neither is the in-progress marker
// that constraint names: the marker stays exactly the lease
// IdempotencyLeaseStore already keeps, untouched by this module. This
// registry only routes a repeated key to the one already-finished or
// already-running call that answers it, entirely in process memory, the
// same way the lease store already keeps its own state — and a failed run
// is never cached as completed, so it never blocks a retry from starting
// its own fresh attempt once the failed one's own promise has settled.

import type { Assessment } from './assessment.js';
import { idempotencyKeyOf, type IdempotencyKey } from './idempotency-key.js';
import type { IdempotencyLeaseStore } from './idempotency-lease-store.js';

export class DiagnosisRunRegistry {
  private readonly completed = new Map<string, Assessment>();
  private readonly running = new Map<string, Promise<Assessment>>();

  /**
   * The completed match for this key, or undefined where none was ever
   * recorded or the lease that started it has left the configured window —
   * a completed entry here never expires on its own, so the same
   * window-expiry IdempotencyLeaseStore already computes for its own lease
   * is what bounds this answer too, rather than a second expiry this
   * module would otherwise have to invent for itself.
   */
  public completedMatch(key: IdempotencyKey, now: number, leases: IdempotencyLeaseStore): Assessment | undefined {
    if (leases.currentLease(key, now) === undefined) {
      return undefined;
    }
    return this.completed.get(idempotencyKeyOf(key));
  }

  /**
   * The in-flight run currently answering this key, for a caller to
   * literally join by awaiting it — or undefined where none is running
   * right now.
   */
  public inProgressRun(key: IdempotencyKey): Promise<Assessment> | undefined {
    return this.running.get(idempotencyKeyOf(key));
  }

  /**
   * Starts one fresh run for this key: records its own promise as running
   * before anything about it can settle, so a concurrent lookup for the
   * very same key can find and join it, then moves its result into the
   * completed map once it resolves. A rejection is never cached — the
   * running entry is still cleared, so a failed run leaves nothing behind
   * for a later request to (incorrectly) treat as completed or join.
   */
  public async run(key: IdempotencyKey, start: () => Promise<Assessment>): Promise<Assessment> {
    const keyString = idempotencyKeyOf(key);
    const promise = start();
    this.running.set(keyString, promise);
    try {
      const assessment = await promise;
      this.completed.set(keyString, assessment);
      return assessment;
    } finally {
      this.running.delete(keyString);
    }
  }
}
