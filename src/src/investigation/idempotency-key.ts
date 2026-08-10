// The repeat-request key rules/investigation/an-investigation-is-idempotent-within-a-window
// names: subject type, the subject's whole set of attribute-values, case and
// ticket reference, modeled as its own type so a lease or a
// completed-investigation lookup keyed by anything else is a type error
// rather than a convention a caller could drift from. This module declares
// the key alone — no lease, no completed-investigation lookup and no
// Investigation live here (task/investigation-lifecycle/idempotency-window
// builds only the mechanism, never a built Investigation or the real
// diagnose entry point).
//
// The prior version of this module kept subject type and subject id as two
// flat strings specifically because domain/investigation/subject had no
// canonical module of its own yet, and reaching for the one local `Subject`
// declaration that existed then (scoped to observation-source.port.ts's own
// signature) would have coupled this key to an unrelated port for a decision
// the specification did not ask that task to take. That reasoning no longer
// holds: task/subject-identity-rework/subject-value-object has since built
// src/investigation/subject.ts as the canonical Subject module, and the
// domain now states plainly that a subject's identity is its whole
// attribute-value set (domain/investigation/subject,
// domain/investigation/subject-attribute-value), never a bare id — so a flat
// `subjectId` string could no longer stand in for what the rule actually
// asks two requests to share. This module now composes the key directly over
// the canonical Subject value, so the key changes exactly when the subject's
// whole attribute-value set changes, not only when a single id field does
// (task/subject-identity-rework/idempotency-key-subject-attributes).

import type { Subject } from './subject.js';

/**
 * The four components rules/investigation/an-investigation-is-idempotent-within-a-window
 * names together as what a repeated request repeats: subject type and the
 * subject's whole attribute-value set (carried together as the canonical
 * `Subject` value, domain/investigation/subject), case and ticket reference.
 * Two requests sharing every one of the four are the same request for this
 * rule's purpose, regardless of narrative or any other input the request may
 * also carry — and two requests whose subjects share a type but differ in
 * even one attribute-value pair are not the same request, since the whole
 * set, not a selected part of it, is what the rule names.
 *
 * `caseReference` is kept opaque rather than decomposed into the case's own
 * slug, version and hash: the rule names "case" as one component beside the
 * other three, and which of the case's identifying fields a caller pins into
 * this one string is a decision for whichever task assembles the real key
 * from a real diagnose request (epic/diagnose-entry-point's
 * task/diagnose-entry-point/diagnose-payload-and-window-dedup) — not this
 * task's, which is proved against fixture subjects and keys alone.
 */
export type IdempotencyKey = {
  readonly subject: Subject;
  readonly caseReference: string;
  readonly ticketRef: string;
};

/**
 * The one canonical string form of a key: the subject's governed type,
 * every attribute-value pair in its whole set — none selected or dropped —
 * flattened to one attribute-name/value sequence, and the case reference and
 * ticket reference, joined with '::' in that order, for wherever they need
 * to compare or index as one value — a lease store's map key here. Mirrors
 * FakeObservationSource's own concept-and-subject fixture key
 * (fixtureKey in src/investigation/fake-observation-source.adapter.ts), the
 * codebase's existing convention for a multi-field composite lookup key,
 * reused here rather than invented anew.
 *
 * Two keys whose subjects carry the same type and the same attribute-value
 * pairs in the same order, and whose case reference and ticket reference
 * also match, produce the same string; the caller — whoever assembles the
 * `Subject` this key carries — is what supplies that attribute order, since
 * neither this function nor domain/investigation/subject itself states a
 * canonical one to sort by.
 */
export function idempotencyKeyOf(key: IdempotencyKey): string {
  const attributeParts = key.subject.attributes.flatMap((pair) => [pair.attribute, pair.value]);
  return [key.subject.type, ...attributeParts, key.caseReference, key.ticketRef].join('::');
}
