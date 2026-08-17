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
  private readonly writeTermsBlocked = new Set<TermVocabulary>();

  public constructor(private readonly concepts: readonly ConceptRegistration[] = []) {}

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return this.held(vocabulary);
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    if (this.writeTermsBlocked.has(vocabulary)) {
      throw new Error(`a whole-table replace of ${vocabulary} failed: a row it already holds is now permanently referenced elsewhere`);
    }
    this.records.set(vocabulary, terms);
  }

  /**
   * Adds exactly the given terms this vocabulary does not already hold by
   * name, and touches nothing else — the same additive, no-delete semantics
   * RelationalGlossaryStore.insertMissingTerms has
   * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
   */
  public async insertMissingTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    const held = this.held(vocabulary);
    const names = new Set(held.map((term) => term.name));
    const additions = terms.filter((term) => !names.has(term.name));
    if (additions.length > 0) {
      this.records.set(vocabulary, [...held, ...additions]);
    }
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return this.concepts;
  }

  /** What the store now holds for one vocabulary, for asserting what a read persisted. */
  public held(vocabulary: TermVocabulary): readonly GlossaryTerm[] {
    return this.records.get(vocabulary) ?? [];
  }

  /**
   * Simulates a vocabulary where a whole-table replace (writeTerms) now
   * fails because a row it already holds is permanently referenced
   * elsewhere in the database — a released case version's fallback_outcome
   * or a released hypothesis-revision's resolution_outcome
   * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
   * insertMissingTerms, which never deletes, stays unaffected.
   */
  public blockWriteTerms(vocabulary: TermVocabulary): void {
    this.writeTermsBlocked.add(vocabulary);
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

// -------------------- task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome

it(
  'resolves a non-conclusion outcome without throwing even though some other outcome is now permanently referenced elsewhere, and leaves that other outcome held unchanged',
  async () => {
    const store = new InMemoryGlossaryStore();
    await store.writeTerms('outcome', [{ name: 'a-permanently-referenced-outcome' }]);
    // Simulates release-immutability elsewhere in the database having made this
    // row permanent: a whole-table replace (writeTerms) of 'outcome' can no
    // longer succeed, exactly as a real DELETE against a permanently
    // referenced row raises Postgres' own foreign-key violation. Before this
    // task's fix, withNonConclusionOutcomes topped up through writeTerms and
    // this call would reject with that store failure instead of resolving.
    store.blockWriteTerms('outcome');
    const glossary = new GlossaryService(store);

    const resolution = await glossary.readVocabularyTerm('outcome', 'inconclusive-no-data');

    expect(resolution).toEqual({ held: true, term: { name: 'inconclusive-no-data' } });
    expect(store.held('outcome').map((term) => term.name).sort()).toEqual([
      'a-permanently-referenced-outcome',
      'inconclusive-hypotheses-exhausted',
      'inconclusive-no-data',
    ]);
  },
);

it('leaves the outcome vocabulary exactly as held, with no name changed, when both non-conclusion outcomes are already present', async () => {
  const store = new InMemoryGlossaryStore();
  const alreadyHeld = [
    { name: 'a-conclusion' },
    { name: 'inconclusive-no-data' },
    { name: 'inconclusive-hypotheses-exhausted' },
  ];
  await store.writeTerms('outcome', alreadyHeld);
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('outcome');

  expect(answered).toEqual(alreadyHeld);
  expect(store.held('outcome')).toEqual(alreadyHeld);
});

it('seeds both missing non-conclusion outcomes beside another outcome that stays held with its own name unchanged', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('outcome', [{ name: 'a-conclusion' }]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name).sort()).toEqual([
    'a-conclusion',
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
  expect(store.held('outcome')).toEqual(
    expect.arrayContaining([{ name: 'a-conclusion' }]),
  );
});

it('leaves a vocabulary other than outcome unseeded and answers it empty', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const answered = await glossary.terms('recipient');

  expect(answered).toEqual([]);
  expect(store.held('recipient')).toEqual([]);
});
