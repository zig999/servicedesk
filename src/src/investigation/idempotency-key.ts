// The repeat-request key rules/investigation/an-investigation-is-idempotent-within-a-window
// names: subject type, subject id, case and ticket reference, modeled as
// its own type so a lease or a completed-investigation lookup keyed by
// anything else is a type error rather than a convention a caller could
// drift from. This module declares the key alone — no lease, no
// completed-investigation lookup and no Investigation live here
// (task/investigation-lifecycle/idempotency-window builds only the
// mechanism, never a built Investigation or the real diagnose entry point).

/**
 * The four values rules/investigation/an-investigation-is-idempotent-within-a-window
 * names together as what a repeated request repeats. Two requests sharing
 * every field are the same request for this rule's purpose, regardless of
 * narrative or any other input the request may also carry.
 *
 * Each of the four is kept as a flat string, mirroring the rule's own flat
 * listing of four components rather than nesting subject type and subject
 * id into a `Subject`-shaped object: domain/investigation/subject has no
 * canonical module of its own yet, and the one local `Subject` declaration
 * that exists today (src/investigation/observation-source.port.ts) is
 * scoped to that port's own signature — reaching for it here would couple
 * this key to an unrelated port for a decision the specification does not
 * ask this task to take. `caseReference` is likewise left opaque rather
 * than decomposed into the case's own slug, version and hash: the rule
 * names "case" as one component beside the other three, and which of the
 * case's identifying fields a caller pins into this one string is a
 * decision for whichever task assembles the real key from a real diagnose
 * request (task/investigation-lifecycle/diagnose-entry-point) — not this
 * task's, which is proved against fixture keys alone.
 */
export type IdempotencyKey = {
  readonly subjectType: string;
  readonly subjectId: string;
  readonly caseReference: string;
  readonly ticketRef: string;
};

/**
 * The one canonical string form of a key: the four fields joined in the
 * rule's own stated order, for wherever they need to compare or index as
 * one value — a lease store's map key here. Mirrors FakeObservationSource's
 * own concept-and-subject fixture key
 * (src/investigation/fake-observation-source.adapter.ts), the codebase's
 * existing convention for a multi-field lookup key.
 */
export function idempotencyKeyOf(key: IdempotencyKey): string {
  return [key.subjectType, key.subjectId, key.caseReference, key.ticketRef].join('::');
}
