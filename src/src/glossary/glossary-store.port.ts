import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from './terms.js';

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

  /**
   * Adds to one term vocabulary's persisted records exactly the given terms
   * that are not already held, and touches nothing else: no already-held
   * row is deleted or rewritten, so a row some other part of this database
   * now permanently references never stands in this operation's way
   * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
   * The narrower sibling of writeTerms, for a caller that only ever needs to
   * ensure a term exists rather than to author the vocabulary's whole
   * content.
   */
  insertMissingTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void>;

  /** Answers every persisted concept registration — ttl absent where the registration stated none (rules/knowledge/a-collected-concept-declares-a-ttl), as read, with no default resolved on its behalf. */
  readConcepts(): Promise<readonly ConceptRegistration[]>;

  /**
   * Replaces the glossary's persisted concept registrations, whole: a
   * concept named at a name none of the given concepts holds is gone after
   * this call, and every given concept stands exactly as given — creating
   * one at a name the glossary did not yet hold, or replacing one in place
   * at a name it already held, according to whether the caller's own given
   * set carries that name (domain/glossary/concept,
   * contracts/glossary/glossary-authoring). Mirrors writeTerms' own
   * whole-replace shape for the term vocabularies, and
   * ICapabilityStore.writeCapabilities' and
   * IConnectorConfigurationStore.writeConnectorConfigurations' own
   * whole-replace shape for their registries, so a caller authoring one
   * concept reads the currently held set, replaces the one entry sharing its
   * name, and writes the whole resulting set back — never a second entry
   * for the same name.
   */
  writeConcepts(concepts: readonly Concept[]): Promise<void>;
}
