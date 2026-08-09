// Proof for the glossary's holding: every vocabulary answers each name exactly
// once, a concept declares its name, accepted subject types and ttl in seconds
// with sixty as the default where its registration states none, and the two
// non-conclusion outcomes are held from the first outcome read on. The store
// boundary is an in-memory stand-in, so no test here touches a file.
import { expect, it } from 'vitest';
import { DuplicateGlossaryNameError } from '../../../errors/duplicate-glossary-name.error.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from '../../../glossary/terms.js';

/**
 * The default the criterion states in its own words — sixty seconds — spelled
 * here rather than imported from the source, so the test fails if the source's
 * constant drifts from what the task states.
 */
const SIXTY_SECONDS = 60;

/** Stands in for the store boundary, so the service is exercised without any filesystem. */
class InMemoryGlossaryStore implements IGlossaryStore {
  private readonly records = new Map<TermVocabulary, readonly GlossaryTerm[]>();

  public constructor(private readonly concepts: readonly ConceptRegistration[] = []) {}

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return this.held(vocabulary);
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    this.records.set(vocabulary, terms);
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return this.concepts;
  }

  /** What the store now holds for one vocabulary, for asserting what a read persisted. */
  public held(vocabulary: TermVocabulary): readonly GlossaryTerm[] {
    return this.records.get(vocabulary) ?? [];
  }
}

/** Captures a promise's rejection, failing where it resolves instead. */
async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected the promise to reject');
}

it('answers a vocabulary with its terms exactly as the store holds them', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('action', [{ name: 'first-term' }, { name: 'second-term' }]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('action');

  expect(answered).toEqual([{ name: 'first-term' }, { name: 'second-term' }]);
});

it('refuses a vocabulary whose records hold one name twice', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('action', [
    { name: 'repeated-term' },
    { name: 'other-term' },
    { name: 'repeated-term' },
  ]);
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(glossary.terms('action'));

  expect(refusal).toBeInstanceOf(DuplicateGlossaryNameError);
  expect(refusal).toMatchObject({ context: { vocabulary: 'action', name: 'repeated-term' } });
});

it('refuses concepts whose registrations hold one name twice', async () => {
  const store = new InMemoryGlossaryStore([
    { name: 'repeated-concept', accepts: ['a-subject-type'], ttl: 120 },
    { name: 'repeated-concept', accepts: ['a-subject-type'] },
  ]);
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(glossary.concepts());

  expect(refusal).toBeInstanceOf(DuplicateGlossaryNameError);
  expect(refusal).toMatchObject({ context: { vocabulary: 'concept', name: 'repeated-concept' } });
});

it('refuses a duplicated outcome vocabulary before seeding writes anything', async () => {
  const store = new InMemoryGlossaryStore();
  const duplicated = [{ name: 'repeated-outcome' }, { name: 'repeated-outcome' }];
  await store.writeTerms('outcome', duplicated);
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(glossary.terms('outcome'));

  expect(refusal).toBeInstanceOf(DuplicateGlossaryNameError);
  expect(store.held('outcome')).toEqual(duplicated);
});

it('answers a concept with its name, its accepted subject types and its ttl in seconds', async () => {
  const store = new InMemoryGlossaryStore([
    { name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 300 },
  ]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.concepts();

  expect(answered).toEqual([
    { name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 300 },
  ]);
});

it('holds the default of sixty seconds for a concept whose registration states no ttl', async () => {
  const store = new InMemoryGlossaryStore([{ name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'] }]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.concepts();

  expect(answered).toEqual([
    { name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
  ]);
});

it('answers no concepts as an empty list rather than an absence', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const answered = await glossary.concepts();

  expect(answered).toEqual([]);
});

it('answers both non-conclusion outcomes from an empty outcome vocabulary', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name).sort()).toEqual([
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
});

it('persists the seeded non-conclusion outcomes through the store', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  await glossary.terms('outcome');

  const persisted = store.held('outcome').map((term) => term.name);
  expect(persisted.sort()).toEqual(['inconclusive-hypotheses-exhausted', 'inconclusive-no-data']);
});

it('seeds only the absent non-conclusion outcome beside what the store already holds', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('outcome', [{ name: 'inconclusive-no-data' }, { name: 'a-conclusion' }]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name).sort()).toEqual([
    'a-conclusion',
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
});

it('leaves a vocabulary other than outcome unseeded and answers it empty', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('recipient');

  expect(answered).toEqual([]);
  expect(store.held('recipient')).toEqual([]);
});
