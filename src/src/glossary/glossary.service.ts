import { DuplicateGlossaryNameError } from '../errors/duplicate-glossary-name.error.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from './glossary-query.port.js';
import type { IGlossaryStore } from './glossary-store.port.js';
import {
  DEFAULT_CONCEPT_TTL_SECONDS,
  NON_CONCLUSION_OUTCOMES,
  type Concept,
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
