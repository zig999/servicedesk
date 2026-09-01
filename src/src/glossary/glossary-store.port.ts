import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from './terms.js';

export interface IGlossaryStore {

  readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]>;

  writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void>;

  insertMissingTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void>;

  readConcepts(): Promise<readonly ConceptRegistration[]>;

  writeConcepts(concepts: readonly Concept[]): Promise<void>;
}
