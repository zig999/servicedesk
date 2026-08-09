// Proof for the published glossary-query contract: a resolution answers a
// vocabulary term or a concept exactly as the glossary currently holds it,
// states an absence as data naming what was asked, and reads through the
// store on every call, so nothing survives the holding changing. The store
// boundary is an in-memory stand-in; no test here touches a file.
import { expect, it } from 'vitest';
import { DuplicateGlossaryNameError } from '../../../errors/duplicate-glossary-name.error.js';
import type { IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from '../../../glossary/terms.js';

/**
 * Stands in for the store boundary: a holding a test can change between two
 * reads, and an injectable failure, so the query is exercised without any
 * filesystem while its resolution logic stays real.
 */
class MutableGlossaryStore implements IGlossaryStore {
  private readonly vocabularies = new Map<TermVocabulary, readonly GlossaryTerm[]>();
  private concepts: readonly ConceptRegistration[] = [];
  private failure: Error | undefined;

  public holdTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): void {
    this.vocabularies.set(vocabulary, terms);
  }

  public holdConcepts(concepts: readonly ConceptRegistration[]): void {
    this.concepts = concepts;
  }

  public failWith(failure: Error): void {
    this.failure = failure;
  }

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    if (this.failure !== undefined) {
      throw this.failure;
    }
    return this.vocabularies.get(vocabulary) ?? [];
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    this.vocabularies.set(vocabulary, terms);
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    if (this.failure !== undefined) {
      throw this.failure;
    }
    return this.concepts;
  }
}

/** The subject under test, held as the published contract rather than as the class behind it. */
function queryOver(store: MutableGlossaryStore): IGlossaryQuery {
  return new GlossaryService(store);
}

it('answers a held vocabulary term exactly as the glossary holds it', async () => {
  const store = new MutableGlossaryStore();
  store.holdTerms('action', [{ name: 'first-term' }, { name: 'second-term' }]);
  const query = queryOver(store);

  const resolution = await query.readVocabularyTerm('action', 'second-term');

  expect(resolution).toEqual({ held: true, term: { name: 'second-term' } });
});

it('reports a term the glossary does not hold as an absence naming what was asked', async () => {
  const store = new MutableGlossaryStore();
  store.holdTerms('action', [{ name: 'a-held-term' }]);
  const query = queryOver(store);

  const resolution = await query.readVocabularyTerm('action', 'an-absent-term');

  expect(resolution).toEqual({ held: false, vocabulary: 'action', name: 'an-absent-term' });
});

it('reports any term of an empty vocabulary as the absence', async () => {
  const store = new MutableGlossaryStore();
  const query = queryOver(store);

  const resolution = await query.readVocabularyTerm('recipient', 'any-term');

  expect(resolution).toEqual({ held: false, vocabulary: 'recipient', name: 'any-term' });
});

it('answers a held concept with its accepted subject types and its ttl', async () => {
  const store = new MutableGlossaryStore();
  store.holdConcepts([
    { name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 300 },
  ]);
  const query = queryOver(store);

  const resolution = await query.readConcept('a-concept');

  expect(resolution).toEqual({
    held: true,
    concept: { name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 300 },
  });
});

it('reports a concept the glossary does not hold as an absence naming what was asked', async () => {
  const store = new MutableGlossaryStore();
  store.holdConcepts([{ name: 'a-held-concept', accepts: ['a-subject-type'], ttl: 120 }]);
  const query = queryOver(store);

  const resolution = await query.readConcept('an-absent-concept');

  expect(resolution).toEqual({ held: false, name: 'an-absent-concept' });
});

it('no longer answers a term the holding no longer carries, even after answering it once', async () => {
  const store = new MutableGlossaryStore();
  store.holdTerms('action', [{ name: 'a-replaced-term' }]);
  const query = queryOver(store);
  await query.readVocabularyTerm('action', 'a-replaced-term'); // arranged to bait a remembered holding
  store.holdTerms('action', [{ name: 'a-new-term' }]);

  const resolution = await query.readVocabularyTerm('action', 'a-replaced-term');

  expect(resolution).toEqual({ held: false, vocabulary: 'action', name: 'a-replaced-term' });
});

it('refuses to resolve over a vocabulary holding one name twice rather than picking a copy', async () => {
  const store = new MutableGlossaryStore();
  store.holdTerms('action', [{ name: 'repeated-term' }, { name: 'repeated-term' }]);
  const query = queryOver(store);

  await expect(query.readVocabularyTerm('action', 'repeated-term')).rejects.toBeInstanceOf(
    DuplicateGlossaryNameError,
  );
});

it('lets a failing store read reach the caller instead of answering an absence', async () => {
  const store = new MutableGlossaryStore();
  const failure = new Error('the store could not be read');
  store.failWith(failure);
  const query = queryOver(store);

  await expect(query.readVocabularyTerm('action', 'a-term')).rejects.toBe(failure);
});
