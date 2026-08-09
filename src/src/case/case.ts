// The case aggregate as data (domain/knowledge): pure values with no
// behavior, each attribute spelled as the specification declares it so the
// one JSON document and the node read the same
// (constraints/a-case-is-stored-as-one-json-document).

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
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case): its
 * investigation is the pair collects plus criterion, inline in the case
 * document, and its resolution follows its confirmation.
 */
export type Hypothesis = {
  readonly name: string;
  /** The short business prose the judgment applies (rules/knowledge/a-hypothesis-declares-a-criterion). */
  readonly criterion: string;
  /** The concepts the claim collects, each by its glossary name, at least one (rules/knowledge/a-hypothesis-collects-at-least-one-concept). */
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * One troubleshooting procedure (domain/knowledge/case), whole as its one
 * JSON document states it: every declared attribute required, the fallback
 * a disguised default hypothesis that claims nothing about the world, and
 * the hypotheses held in the document's declared order — the precedence the
 * experts affirm and resolve-outcome consumes
 * (rules/knowledge/hypotheses-are-ordered-by-precedence), so the aggregate
 * never reorders them and never keys them by name.
 */
export type Case = {
  /** The case's identity, equal to the name of the file that holds it (rules/knowledge/the-slug-matches-the-file-name). */
  readonly slug: string;
  readonly title: string;
  /** When an attendant reaches for this case, spelled as the specification spells it. */
  readonly when_to_use: string;
  readonly version: number;
  readonly hash: string;
  /** The kind of subject the case examines, by its glossary subject-type name. */
  readonly subject: string;
  /** The resolution that answers when no hypothesis confirms. */
  readonly fallback: Resolution;
  /** At least one (rules/knowledge/a-case-has-at-least-one-hypothesis), in declared precedence order. */
  readonly hypotheses: readonly Hypothesis[];
};

/**
 * The ending a case's one JSON document carries
 * (constraints/a-case-is-stored-as-one-json-document) — the medium's, not
 * the name's, so the slug rule reads the file's name without it.
 */
export const CASE_DOCUMENT_ENDING = '.json';
