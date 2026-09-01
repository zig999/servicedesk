import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Concept, GlossaryTerm, TermVocabulary } from './terms.js';

export type TermResolution =
  | { readonly held: true; readonly term: GlossaryTerm }
  | { readonly held: false; readonly vocabulary: TermVocabulary; readonly name: string };

export type ConceptResolution =
  | { readonly held: true; readonly concept: Concept }
  | { readonly held: false; readonly name: string };

export interface IGlossaryQuery {

  readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution>;

  readConcept(name: string): Promise<ConceptResolution>;

  listVocabularyTerms(vocabulary: TermVocabulary, pagination: PaginationRequest): Promise<PaginatedResponse<GlossaryTerm>>;

  listConcepts(pagination: PaginationRequest): Promise<PaginatedResponse<Concept>>;
}
