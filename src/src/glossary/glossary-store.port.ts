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
   * Upserts each given concept by its own name (domain/glossary/concept,
   * contracts/glossary/glossary-authoring): creating it at a name the
   * glossary did not yet hold, or replacing it in place at a name it
   * already held — its accepts, ttl and description overwritten with the
   * given values — according to whether the caller's own given set carries
   * that name, so a caller authoring one concept reads the currently held
   * set, replaces the one entry sharing its name, and writes the whole
   * resulting set back, never a second entry for the same name. A
   * previously-held concept named at a name none of the given concepts
   * holds is left exactly as it was, never removed by this call: a
   * concept's own row, once it exists, is never deleted here — including
   * one another table now permanently references — so it is never at risk
   * of a foreign key breaking merely because a different concept was
   * written in the same call. This is deliberately narrower than
   * writeTerms' and ICapabilityStore.writeCapabilities' own whole-replace
   * shape for their registries, which this method used to mirror until
   * that shape's own delete-then-reinsert-everything unit of work failed
   * against any registration this database's own foreign keys hold onto
   * permanently (task/glossary-concept-write-upsert-hotfix/write-concepts-upserts-by-identity).
   */
  writeConcepts(concepts: readonly Concept[]): Promise<void>;
}
