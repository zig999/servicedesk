export type GlossaryTerm = {
  readonly name: string;
};

export type SubjectType = GlossaryTerm;

export type SubjectAttribute = GlossaryTerm;

export type Outcome = GlossaryTerm;

export type Action = GlossaryTerm;

export type Recipient = GlossaryTerm;

export const TERM_VOCABULARIES = ['subject-type', 'subject-attribute', 'outcome', 'action', 'recipient'] as const;

export type TermVocabulary = (typeof TERM_VOCABULARIES)[number];

export type Concept = {
  readonly name: string;

  readonly accepts: readonly string[];

  readonly ttl: number;

  readonly description: string;
};

export type ConceptRegistration = {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl?: number;
  readonly description?: string;
};

export const DEFAULT_CONCEPT_TTL_SECONDS = 60;

export const NON_CONCLUSION_OUTCOMES: readonly Outcome[] = [
  { name: 'inconclusive-no-data' },
  { name: 'inconclusive-hypotheses-exhausted' },
];
