// The case aggregate as data (domain/knowledge): pure values with no
// behavior, each attribute spelled as the specification declares it so the
// one JSON document and the node read the same
// (constraints/a-case-is-stored-as-one-json-document). The one import this
// module carries is the consolidation-register vocabulary's own plain type
// (domain/knowledge/consolidation-register), reused here rather than
// redeclared, and itself free of any import
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
 * One falsifiable claim about the subject's situation
 * (domain/knowledge/hypothesis), named uniquely within its case
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case) and placed
 * at one declared position, also unique within its case
 * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case): its
 * investigation is the pair collects plus criterion, inline in the case's
 * submitted version, and its resolution follows its confirmation.
 */
export type Hypothesis = {
  readonly name: string;
  /**
   * Its own declared position in the case's precedence — the fact the
   * case's ordering used to carry by arrangement alone
   * (domain/knowledge/hypothesis,
   * rules/knowledge/a-hypothesis-position-is-unique-within-its-case).
   * resolve-outcome still reads the hypotheses' array order rather than
   * this field until
   * task/case-and-investigation-model/precedence-from-position moves it
   * (rules/knowledge/hypotheses-are-ordered-by-precedence).
   */
  readonly position: number;
  /** The short business prose the judgment applies (rules/knowledge/a-hypothesis-declares-a-criterion). */
  readonly criterion: string;
  /** The concepts the claim collects, each by its glossary name, at least one (rules/knowledge/a-hypothesis-collects-at-least-one-concept). */
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * One troubleshooting procedure (domain/knowledge/case), whole as a
 * submitted version states it: every declared attribute required except
 * the optional consolidation register, the fallback a disguised default
 * hypothesis that claims nothing about the world, and no digest over its
 * own content — a version is written once and never altered, so slug and
 * version alone name one content without one
 * (rules/knowledge/a-case-version-is-written-once,
 * task/case-and-investigation-model/case-aggregate-shape). The hypotheses
 * are held in the document's declared order — the precedence the experts
 * affirm and, once
 * task/case-and-investigation-model/precedence-from-position moves
 * resolve-outcome onto each hypothesis's own declared position, the fact
 * that order records
 * (rules/knowledge/hypotheses-are-ordered-by-precedence) — so the aggregate
 * never reorders them and never keys them by name.
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
  /** At least one (rules/knowledge/a-case-has-at-least-one-hypothesis), in declared precedence order. */
  readonly hypotheses: readonly Hypothesis[];
};

/**
 * The ending a case's one JSON document carries
 * (constraints/a-case-is-stored-as-one-json-document) — the medium's, not
 * the name's, so the slug rule reads the file's name without it.
 */
export const CASE_DOCUMENT_ENDING = '.json';
