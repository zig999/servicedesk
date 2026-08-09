import type { Concept, GlossaryTerm, TermVocabulary } from './terms.js';

/**
 * What resolving a vocabulary term answers: the term exactly as the glossary
 * holds it, or its absence stated as data — never an invented term and never
 * an error, because a name the glossary does not hold is an ordinary answer
 * of a resolution, not a failure of the read. The absence names what was
 * asked, so a consumer can report it without keeping its own copy.
 */
export type TermResolution =
  | { readonly held: true; readonly term: GlossaryTerm }
  | { readonly held: false; readonly vocabulary: TermVocabulary; readonly name: string };

/**
 * What resolving a concept answers: the concept exactly as the glossary
 * holds it — its name, the subject types it accepts and its ttl in seconds —
 * or its absence stated the same way.
 */
export type ConceptResolution =
  | { readonly held: true; readonly concept: Concept }
  | { readonly held: false; readonly name: string };

/**
 * The published glossary-query contract (contracts/glossary/glossary-query):
 * the synchronous in-process read its consumers — every case-validation term
 * check among them — resolve a vocabulary term or a concept through, exactly
 * as the glossary currently holds it. A consumer depends on this interface,
 * never on the store or on the service that answers it.
 */
export interface IGlossaryQuery {
  /**
   * read-vocabulary-term: resolves one term of one of the four term
   * vocabularies by its name, against the glossary's current holding —
   * read through the store on every call, never remembered.
   */
  readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution>;

  /**
   * read-concept: resolves one concept by its name, against the glossary's
   * current holding — read through the store on every call, never remembered.
   */
  readConcept(name: string): Promise<ConceptResolution>;
}
