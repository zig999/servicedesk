import { ConceptDescriptionRequiredError } from '../errors/concept-description-required.error.js';
import { DuplicateGlossaryNameError } from '../errors/duplicate-glossary-name.error.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from './glossary-query.port.js';
import type { IGlossaryStore } from './glossary-store.port.js';
import {
  DEFAULT_CONCEPT_TTL_SECONDS,
  NON_CONCLUSION_OUTCOMES,
  type Concept,
  type ConceptRegistration,
  type GlossaryTerm,
  type TermVocabulary,
} from './terms.js';

export class GlossaryService implements IGlossaryQuery {
  public constructor(private readonly store: IGlossaryStore) {}

  public async terms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    const held = await this.store.readTerms(vocabulary);
    assertUniqueNames(vocabulary, held);
    if (vocabulary !== 'outcome') {
      return held;
    }
    return this.withNonConclusionOutcomes(held);
  }

  public async concepts(): Promise<readonly Concept[]> {
    const registrations = await this.store.readConcepts();
    assertUniqueNames('concept', registrations);
    return registrations.map((registration) => ({
      name: registration.name,
      accepts: registration.accepts,
      ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS,
      description: registration.description ?? '',
    }));
  }

  public async registerConcept(registration: ConceptRegistration): Promise<Concept> {
    if (namesNoDescription(registration.description)) {
      throw new ConceptDescriptionRequiredError(registration.name, registration.description);
    }
    const concept: Concept = {
      name: registration.name,
      accepts: registration.accepts,
      ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS,
      description: registration.description,
    };
    const held = await this.concepts();
    const kept = held.filter((candidate) => candidate.name !== concept.name);
    await this.store.writeConcepts([...kept, concept]);
    return concept;
  }

  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    const held = await this.terms(vocabulary);
    const term = held.find((candidate) => candidate.name === name);
    return term === undefined ? { held: false, vocabulary, name } : { held: true, term };
  }

  public async readConcept(name: string): Promise<ConceptResolution> {
    const held = await this.concepts();
    const concept = held.find((candidate) => candidate.name === name);
    return concept === undefined ? { held: false, name } : { held: true, concept };
  }

  public async listVocabularyTerms(
    vocabulary: TermVocabulary,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<GlossaryTerm>> {
    const held = await this.terms(vocabulary);
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total: held.length,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pageCountOf(held.length, pagination.limit),
    };
  }

  public async listConcepts(pagination: PaginationRequest): Promise<PaginatedResponse<Concept>> {
    const held = await this.concepts();
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total: held.length,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pageCountOf(held.length, pagination.limit),
    };
  }

  private async withNonConclusionOutcomes(held: readonly GlossaryTerm[]): Promise<readonly GlossaryTerm[]> {
    const missing = NON_CONCLUSION_OUTCOMES.filter(
      (outcome) => !held.some((term) => term.name === outcome.name),
    );
    if (missing.length === 0) {
      return held;
    }
    await this.store.insertMissingTerms('outcome', missing);
    return [...held, ...missing];
  }
}

function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

function namesNoDescription(description: string | undefined): description is undefined | '' {
  return description === undefined || description === '';
}

function assertUniqueNames(vocabulary: string, records: readonly { readonly name: string }[]): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.name)) {
      throw new DuplicateGlossaryNameError(vocabulary, record.name);
    }
    seen.add(record.name);
  }
}
