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

/**
 * The glossary's holding: every term a case may name, each existing exactly
 * once per vocabulary. Persistence reaches it only through the store port,
 * so this module stays importable without any infrastructure. It provides
 * the published glossary-query contract, so a consumer holding IGlossaryQuery
 * reads this holding without depending on this class or its store.
 */
export class GlossaryService implements IGlossaryQuery {
  public constructor(private readonly store: IGlossaryStore) {}

  /**
   * Answers one term vocabulary as the glossary holds it: each name exactly
   * once — and the outcome vocabulary never without the two non-conclusion
   * outcomes, which are added through the port's own additive primitive
   * where the records lack them
   * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case),
   * never through the port's whole-replace writeTerms — ensuring these two
   * exist must never delete or rewrite an outcome some other row now
   * permanently references
   * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
   */
  public async terms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    const held = await this.store.readTerms(vocabulary);
    assertUniqueNames(vocabulary, held);
    if (vocabulary !== 'outcome') {
      return held;
    }
    return this.withNonConclusionOutcomes(held);
  }

  /**
   * Answers the concepts as the glossary holds them: each name exactly once,
   * each declaring its accepted subject types and its ttl in seconds — the
   * default of sixty where its registration stated none
   * (rules/knowledge/a-collected-concept-declares-a-ttl).
   */
  public async concepts(): Promise<readonly Concept[]> {
    const registrations = await this.store.readConcepts();
    assertUniqueNames('concept', registrations);
    return registrations.map((registration) => ({
      name: registration.name,
      accepts: registration.accepts,
      ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS,
    }));
  }

  /**
   * register-concept (contracts/glossary/glossary-authoring): holds one
   * concept at its own name — creating it where the glossary does not yet
   * hold that name, or replacing whatever concept already stood at that
   * name in place, never leaving a second entry for it
   * (domain/glossary/concept) — its ttl defaulted the same way a read
   * already defaults it where the registration states none
   * (rules/knowledge/a-collected-concept-declares-a-ttl). Reads the
   * currently held set through this.concepts (MNT-03, the same helper
   * readConcept and listConcepts already reuse), excludes whatever entry
   * already shares the registered name, and writes the whole resulting set
   * back through the store's own whole-replace writeConcepts — the same
   * replace-by-identity shape registerCapability and registerConnector
   * already run for their own registries.
   */
  public async registerConcept(registration: ConceptRegistration): Promise<Concept> {
    const concept: Concept = {
      name: registration.name,
      accepts: registration.accepts,
      ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS,
    };
    const held = await this.concepts();
    const kept = held.filter((candidate) => candidate.name !== concept.name);
    await this.store.writeConcepts([...kept, concept]);
    return concept;
  }

  /**
   * read-vocabulary-term (contracts/glossary/glossary-query): resolves one
   * term by name against the vocabulary as the glossary holds it on this
   * call — read through the store every time, never remembered — answering
   * the absence as data where no held term carries the name.
   */
  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    const held = await this.terms(vocabulary);
    const term = held.find((candidate) => candidate.name === name);
    return term === undefined ? { held: false, vocabulary, name } : { held: true, term };
  }

  /**
   * read-concept (contracts/glossary/glossary-query): resolves one concept
   * by name against the concepts as the glossary holds them on this call,
   * answering its accepted subject types and its ttl in seconds, or the
   * absence as data where no held concept carries the name.
   */
  public async readConcept(name: string): Promise<ConceptResolution> {
    const held = await this.concepts();
    const concept = held.find((candidate) => candidate.name === name);
    return concept === undefined ? { held: false, name } : { held: true, concept };
  }

  /**
   * list-vocabulary-terms (contracts/glossary/glossary-query): answers every
   * term the named vocabulary currently holds, paginated per
   * src/types/pagination.ts. Reads the vocabulary's whole current holding
   * through this.terms — the same private helper readVocabularyTerm already
   * reuses (MNT-03), so the outcome vocabulary's two non-conclusion outcomes
   * and the duplicate-name check apply here exactly as they do there — and
   * then windows that in-memory array by offset and limit: the store itself
   * (IGlossaryStore.readTerms) always answers the whole vocabulary and has no
   * paged read of its own, unlike the case store's listCases and its
   * siblings, which page at the SQL layer. An offset past the end of the
   * held array answers an empty page rather than an error (API-02), and the
   * page count is always computed from the full array's own length and the
   * given limit, never hardcoded (API-03).
   */
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

  /**
   * list-concepts (contracts/glossary/glossary-query): answers every concept
   * currently registered, paginated per src/types/pagination.ts. Reads the
   * whole current holding through this.concepts — the same private helper
   * readConcept already reuses (MNT-03), so the ttl-defaulting and the
   * duplicate-name check apply here exactly as they do there — and then
   * windows that in-memory array by offset and limit: the store itself
   * (IGlossaryStore.readConcepts) always answers every concept and has no
   * paged read of its own. An offset past the end of the held array answers
   * an empty page rather than an error (API-02), and the page count is
   * always computed from the full array's own length and the given limit,
   * never hardcoded (API-03).
   */
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

  /**
   * Ensures the two non-conclusion outcomes exist by adding only what is
   * missing, through insertMissingTerms — never writeTerms's own
   * whole-replace, which would delete every outcome row first and fail the
   * moment any of them, non-conclusion or not, is permanently referenced by
   * a released case version's fallback_outcome or a released hypothesis
   * revision's resolution_outcome
   * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
   * Every currently-held outcome's own name is left exactly as it was.
   */
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

/**
 * The page count this limit divides total into (API-03) — 0 for a
 * non-positive limit, since dividing by it would answer no page count at all
 * rather than one a caller could page through; the same defensive floor
 * relational-case-store.repository.ts's own pageCountOf already applies to
 * every SQL-paged listing, restated here rather than imported because that
 * one is a private, unexported helper of an unrelated persistence module
 * (MNT-03 reaches a block of logic this project already calls from
 * elsewhere, not a private one-line formula sitting in a different layer).
 */
function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

/**
 * Refuses records holding one name twice, before anything is answered or
 * written: no vocabulary the glossary answers holds a duplicate name.
 */
function assertUniqueNames(vocabulary: string, records: readonly { readonly name: string }[]): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.name)) {
      throw new DuplicateGlossaryNameError(vocabulary, record.name);
    }
    seen.add(record.name);
  }
}
