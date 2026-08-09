// The published language as data (domain/glossary): pure values with no
// behavior, each term existing exactly once so spelling cannot drift.

/**
 * One entry of a term vocabulary: a name, held exactly once per vocabulary.
 * The shape the four term vocabularies of the glossary share.
 */
export type GlossaryTerm = {
  readonly name: string;
};

/** A kind of subject an investigation may examine (domain/glossary/subject-type). */
export type SubjectType = GlossaryTerm;

/** What a confirmed hypothesis, or the fallback, concludes (domain/glossary/outcome). */
export type Outcome = GlossaryTerm;

/** What the recipient of a referral does (domain/glossary/action). */
export type Action = GlossaryTerm;

/** The operational queue a referral addresses (domain/glossary/recipient). */
export type Recipient = GlossaryTerm;

/** The four term vocabularies of the glossary; concepts stand beside them with a shape of their own. */
export const TERM_VOCABULARIES = ['subject-type', 'outcome', 'action', 'recipient'] as const;

/** One of the four term vocabularies, by name. */
export type TermVocabulary = (typeof TERM_VOCABULARIES)[number];

/**
 * A named observation a hypothesis may collect (domain/glossary/concept), as
 * the glossary holds it: its name, the subject types it accepts, and its ttl
 * in seconds — the constraints the glossary guarantees for it.
 */
export type Concept = {
  readonly name: string;
  /** Names of the subject types the concept accepts. */
  readonly accepts: readonly string[];
  /** Freshness tolerance in seconds. */
  readonly ttl: number;
};

/**
 * A concept as its registration states it: the ttl may be absent, and the
 * glossary then holds the default below
 * (rules/knowledge/a-collected-concept-declares-a-ttl).
 */
export type ConceptRegistration = {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl?: number;
};

/**
 * The ttl a concept registration that states none takes, in seconds
 * (rules/knowledge/a-collected-concept-declares-a-ttl).
 */
export const DEFAULT_CONCEPT_TTL_SECONDS = 60;

/**
 * The two non-conclusion outcomes, which the glossary holds before the first
 * case validates
 * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
 */
export const NON_CONCLUSION_OUTCOMES: readonly Outcome[] = [
  { name: 'inconclusive-no-data' },
  { name: 'inconclusive-hypotheses-exhausted' },
];
