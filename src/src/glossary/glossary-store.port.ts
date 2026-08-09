import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from './terms.js';

/**
 * The port through which the glossary's records reach their persistence.
 * The domain declares it and infrastructure implements it
 * (constraints/the-domain-depends-on-no-infrastructure): no vocabulary
 * module opens a file, and no framework, driver or client is imported here.
 */
export interface IGlossaryStore {
  /** Answers every persisted record of one term vocabulary, exactly as persisted. */
  readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]>;

  /** Replaces one term vocabulary's persisted records, whole. */
  writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void>;

  /** Answers every persisted concept registration — ttl absent where the registration stated none. */
  readConcepts(): Promise<readonly ConceptRegistration[]>;
}
