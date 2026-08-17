// The case-version aggregate as data (domain/knowledge/case-version): pure
// values with no behavior, each attribute spelled as the specification
// declares it. Two distinct pairs of types coexist here, deliberately, and
// the reason each exists is worth reading before either is touched again:
//
// - Hypothesis, kept under its long-standing name and its long-standing
//   flat shape (name, criterion, collects, resolution), is the per-version
//   projection Case.hypotheses carries — exactly the shape
//   src/investigation/judgment-stage.ts, src/investigation/run-diagnosis.ts
//   and src/case/validate-case-coherence.ts already consume, none of which
//   is task/case-lifecycle-domain-model/aggregate-types-and-structural-validation's
//   own criterion 7 (or its own reasoning, extended here to judgment-stage.ts,
//   an out-of-epic consumer this rewrite must not break either) to touch. It
//   is derived from Case.manifest at parse time (heldCase, in
//   parse-case-document.ts), never independently declared, so the two never
//   disagree.
// - HypothesisIdentity, HypothesisRevision and ManifestEntry are the
//   aggregate's own newly split, canonical declaration
//   (domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision,
//   domain/knowledge/manifest-entry): a hypothesis's stable identity — its
//   name alone — and its revisioned content — revision, criterion, collects,
//   resolution — are two distinct types, never the one flat record
//   Hypothesis above still is for its own, separate reason above. A manifest
//   entry references exactly one hypothesis-revision by nesting it, never by
//   inlining that revision's own content onto the entry directly.
//
// Case itself is domain/knowledge/case-version, kept under its own
// long-standing name for the same reason as Hypothesis above:
// case-query.port.ts, run-diagnosis.ts, judgment-stage.ts,
// resolve-and-narrow-input.ts, investigation-factory.ts and
// evidence-collection-stage.ts all import this exact name, and none of them
// is this task's to touch. It now also declares state, released_at (present
// only once released) and manifest, alongside its own already-declared
// attributes (constraints/a-case-is-stored-as-one-json-document).
//
// The one import this module carries is the consolidation-register
// vocabulary's own plain type (domain/knowledge/consolidation-register),
// reused here rather than redeclared, and itself free of any import
// (constraints/the-domain-depends-on-no-infrastructure).

import type { ConsolidationRegister } from '../investigation/consolidation-register.js';

/**
 * The forwarding a resolution carries (domain/knowledge/referral): what to
 * do and which operational role does it, each named from the glossary by
 * name.
 */
export type Referral = {
  /** What the recipient of the referral does, by its glossary action name. */
  readonly action: string;
  /** The operational queue the referral addresses, by its glossary recipient name. */
  readonly recipient: string;
};

/**
 * What follows a decided position (domain/knowledge/resolution): the outcome
 * concluded and the referral to act on, paired so no position can declare
 * one without the other (rules/knowledge/every-position-declares-a-resolution).
 */
export type Resolution = {
  /** What the position concludes, by its glossary outcome name. */
  readonly outcome: string;
  readonly referral: Referral;
};

/**
 * domain/knowledge/hypothesis: a hypothesis's own stable identity within its
 * case, named uniquely across every version the case ever holds — past,
 * current or future. Its content belongs to its revisions, never to this
 * identity directly (domain/knowledge/hypothesis-revision): revising a
 * hypothesis never changes this name, it only adds a new revision for a case
 * version's manifest to adopt. Named HypothesisIdentity rather than
 * Hypothesis: this module's own Hypothesis name is already held by the flat,
 * per-version projection below, kept under that name for its own consumers'
 * sake (this module's own header comment).
 */
export type HypothesisIdentity = {
  readonly name: string;
};

/**
 * domain/knowledge/hypothesis-revision: one numbered state of a hypothesis's
 * own content, referencing the hypothesis it belongs to. Its investigation is
 * the pair collects plus criterion — the criterion never empty
 * (rules/knowledge/a-hypothesis-declares-a-criterion) and collects never
 * empty (rules/knowledge/a-hypothesis-collects-at-least-one-concept) — and
 * its resolution follows its confirmation.
 */
export type HypothesisRevision = {
  readonly hypothesis: HypothesisIdentity;
  readonly revision: number;
  /** The short business prose the judgment applies (rules/knowledge/a-hypothesis-declares-a-criterion). */
  readonly criterion: string;
  /** The concepts the claim collects, each by its glossary name, at least one (rules/knowledge/a-hypothesis-collects-at-least-one-concept). */
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * domain/knowledge/manifest-entry: one line of a case version's manifest —
 * the precedence position this version places one hypothesis at, and
 * exactly which revision of that hypothesis's content it uses. Reordering
 * two hypotheses between one version and the next changes only the position
 * two manifest entries declare — never the revision either references, and
 * never a fact any hypothesis-revision itself carries, so that revision's
 * own content is never inlined onto this entry directly.
 */
export type ManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: HypothesisRevision;
};

/**
 * domain/knowledge/case-version-state: whether a case version may still be
 * revised, or has been published and stands immutable — the two states its
 * lifecycle ever holds. Declared as a const array plus its derived literal
 * union, the same convention consolidation-register.ts already keeps for its
 * own closed, two-value vocabulary (MNT-03), so parse-case-document.ts's own
 * structural check can read the array rather than spelling both values a
 * second time (TYP-04).
 */
export const CASE_VERSION_STATES = ['draft', 'released'] as const;

/** One of the two states domain/knowledge/case-version-state names. */
export type CaseVersionState = (typeof CASE_VERSION_STATES)[number];

/**
 * The flat, per-version projection of one adopted hypothesis-revision that
 * Case.hypotheses carries — name, criterion, collects and resolution
 * together, exactly the shape judgment-stage.ts, run-diagnosis.ts and
 * validate-case-coherence.ts already consume
 * (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation's
 * own criterion 7). Derived from Case.manifest at parse time (heldCase, in
 * parse-case-document.ts), never independently declared, so the two never
 * disagree — this is deliberately not domain/knowledge/hypothesis's own
 * identity-only shape; see this module's own header comment for why both
 * exist.
 */
export type Hypothesis = {
  readonly name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * One version of a case (domain/knowledge/case-version), whole as a
 * submitted version states it: every declared attribute required except the
 * optional consolidation register and released_at (present only once
 * released), the fallback a disguised default hypothesis that claims
 * nothing about the world, and no digest over its own content — a version is
 * written once and never altered, so slug and version alone name one
 * content without one (rules/knowledge/a-case-version-is-written-once,
 * task/case-and-investigation-model/case-aggregate-shape). manifest is this
 * version's own canonical declaration — at least one entry
 * (rules/knowledge/a-case-has-at-least-one-hypothesis), in the document's own
 * declared array order, never reordered and never keyed by name; the
 * precedence collection-plan and resolve-outcome consult is each manifest
 * entry's own declared position instead of that array arrangement
 * (rules/knowledge/hypotheses-are-ordered-by-precedence,
 * task/case-and-investigation-model/precedence-from-position). hypotheses is
 * the same manifest, flattened into the shape this aggregate's own
 * out-of-scope consumers already read (this module's own header comment) —
 * never a second, independently declared fact.
 */
export type Case = {
  /** The case's identity (rules/knowledge/a-slug-identifies-one-case). */
  readonly slug: string;
  readonly title: string;
  /** When an attendant reaches for this case, spelled as the specification spells it. */
  readonly when_to_use: string;
  readonly version: number;
  /** When this case version was authored, as an ISO-8601 instant (domain/knowledge/case's own authored_at). */
  readonly authored_at: string;
  /** The kind of subject the case examines, by its glossary subject-type name. */
  readonly subject: string;
  /** The resolution that answers when no hypothesis confirms. */
  readonly fallback: Resolution;
  /**
   * The register the case's curator asks the consolidation write-up to
   * keep, formal or plain (domain/knowledge/consolidation-register). The
   * curator may author it alongside the hypotheses; where the case leaves
   * it undeclared, the consolidation step keeps whatever register its own
   * adapter defaults to.
   */
  readonly consolidation_register?: ConsolidationRegister;
  /** Whether this version may still be revised or stands immutable (domain/knowledge/case-version-state). */
  readonly state: CaseVersionState;
  /** Present only once released (domain/knowledge/case-version's own "released_at is present only once released"). */
  readonly released_at?: string;
  /**
   * At least one entry (rules/knowledge/a-case-has-at-least-one-hypothesis),
   * in the document's own declared array order — never the precedence order,
   * which each entry's own position states instead
   * (rules/knowledge/hypotheses-are-ordered-by-precedence).
   */
  readonly manifest: readonly ManifestEntry[];
  /** manifest, flattened for this aggregate's own out-of-scope consumers (this module's own header comment); never independently declared. */
  readonly hypotheses: readonly Hypothesis[];
};

/**
 * The ending a case's one JSON document carries
 * (constraints/a-case-is-stored-as-one-json-document) — the medium's, not
 * the name's, so the slug rule reads the file's name without it.
 */
export const CASE_DOCUMENT_ENDING = '.json';
