import type { ConceptName } from '../glossary/concept';

/**
 * Encodes the result vocabulary of `definition/investigation/evidence`.
 *
 * The four values are the base's own. `ok` is the concept's fact arriving as
 * asked; the other three are the recorded shapes of not arriving — a
 * capability that timed out, was unavailable, or refused — and each of them
 * still counts as the answer for its concept rather than as an absent
 * evidence (rule/investigation/one-evidence-per-collected-concept). A concept
 * the collection never attempted before its deadline is recorded among the
 * timeouts, never as a missing evidence
 * (rule/investigation/an-unattempted-concept-records-a-timeout).
 */
export type EvidenceResult = 'ok' | 'unavailable' | 'denied' | 'timeout';

/**
 * Encodes `definition/investigation/evidence`, to the shape
 * task/published-case/fallback-selection reads.
 *
 * The base declares four further attributes this module does not carry: the
 * capability that produced the evidence, when it was observed, its ttl and
 * its source, plus the two attributes the base states no shape for
 * (`observation`, `inputs`) and the one it states no policy for
 * (`retention`) — all four waived by that task's own binding, because a
 * selection that only tells one kind of non-ok apart from ok
 * (rule/knowledge/the-fallback-follows-what-the-collection-returned) reads
 * none of them. Declaring them here would be inventing a fact — the shape an
 * observation carries, the shape recorded inputs carry, or a capability
 * identity nothing in this tree yet binds by — that this task does not need
 * and the base does not give. The task that builds an evidence from a
 * collection attempt owns the rest of this shape; this module carries only
 * what the selection needs.
 *
 * An evidence is identified by its concept and carries no identifier of its
 * own (definition/investigation/evidence), so the concept is carried here
 * too even though the selection itself never reads it — it is what makes an
 * `Evidence` recognizable as one at all.
 *
 * An evidence is a value object, so every field is read-only. This module
 * declares the shape with no way to build one: an evidence is read as
 * recorded by the collection step, never produced by this selection or by
 * anything else in this plan.
 */
export type Evidence = {
  readonly concept: ConceptName;
  readonly result: EvidenceResult;
};
