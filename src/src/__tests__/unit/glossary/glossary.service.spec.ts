import { expect, it } from 'vitest';
import { ConceptDescriptionRequiredError } from '../../../errors/concept-description-required.error.js';
import { DuplicateGlossaryNameError } from '../../../errors/duplicate-glossary-name.error.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from '../../../glossary/terms.js';

const SIXTY_SECONDS = 60;

class InMemoryGlossaryStore implements IGlossaryStore {
  private readonly records = new Map<TermVocabulary, readonly GlossaryTerm[]>();
  private readonly writeTermsBlocked = new Set<TermVocabulary>();
  private concepts: readonly ConceptRegistration[];

  public constructor(concepts: readonly ConceptRegistration[] = []) {
    this.concepts = concepts;
  }

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return this.held(vocabulary);
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    if (this.writeTermsBlocked.has(vocabulary)) {
      throw new Error(`a whole-table replace of ${vocabulary} failed: a row it already holds is now permanently referenced elsewhere`);
    }
    this.records.set(vocabulary, terms);
  }

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

  public async writeConcepts(concepts: readonly Concept[]): Promise<void> {
    this.concepts = concepts;
  }

  public held(vocabulary: TermVocabulary): readonly GlossaryTerm[] {
    return this.records.get(vocabulary) ?? [];
  }

  public blockWriteTerms(vocabulary: TermVocabulary): void {
    this.writeTermsBlocked.add(vocabulary);
  }
}

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
    { name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 300, description: '' },
  ]);
});

it('holds the default of sixty seconds for a concept whose registration states no ttl', async () => {
  const store = new InMemoryGlossaryStore([{ name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'] }]);
  const glossary = new GlossaryService(store);

  const answered = await glossary.concepts();

  expect(answered).toEqual([
    { name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS, description: '' },
  ]);
});

it('creates a concept with its accepted subject types and its ttl, at a name the glossary does not yet hold', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-new-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'A new concept fixture describes for the test.',
  });

  expect(registered).toEqual({
    name: 'a-new-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'A new concept fixture describes for the test.',
  });
  expect(await store.readConcepts()).toEqual([
    {
      name: 'a-new-concept',
      accepts: ['a-subject-type', 'another-subject-type'],
      ttl: 120,
      description: 'A new concept fixture describes for the test.',
    },
  ]);
});

it('defaults a newly created concept\'s ttl to sixty seconds when its registration states none, the same default a read already applies', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'an-undeclared-ttl-concept',
    accepts: ['a-subject-type'],
    description: 'An undeclared-ttl concept fixture describes for the test.',
  });

  expect(registered).toEqual({
    name: 'an-undeclared-ttl-concept',
    accepts: ['a-subject-type'],
    ttl: SIXTY_SECONDS,
    description: 'An undeclared-ttl concept fixture describes for the test.',
  });
});

it('replaces a concept in place at a name the glossary already holds, rather than creating a second entry for it', async () => {
  const store = new InMemoryGlossaryStore([
    { name: 'a-held-concept', accepts: ['an-old-subject-type'], ttl: 90, description: 'The held concept fixture, before its replacement.' },
    { name: 'an-unrelated-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An unrelated concept fixture, left untouched.' },
  ]);
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-held-concept',
    accepts: ['a-new-subject-type'],
    ttl: 240,
    description: 'The held concept fixture, after its replacement.',
  });

  expect(registered).toEqual({
    name: 'a-held-concept',
    accepts: ['a-new-subject-type'],
    ttl: 240,
    description: 'The held concept fixture, after its replacement.',
  });
  const persisted = await store.readConcepts();
  expect(persisted).toHaveLength(2);
  expect(persisted.filter((concept) => concept.name === 'a-held-concept')).toEqual([
    { name: 'a-held-concept', accepts: ['a-new-subject-type'], ttl: 240, description: 'The held concept fixture, after its replacement.' },
  ]);
  expect(persisted).toEqual(
    expect.arrayContaining([
      { name: 'an-unrelated-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An unrelated concept fixture, left untouched.' },
    ]),
  );
});

it('refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError (criterion 1)', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(
    glossary.registerConcept({ name: 'a-description-less-concept', accepts: ['a-subject-type'] }),
  );

  expect(refusal).toBeInstanceOf(ConceptDescriptionRequiredError);
  expect(refusal).toMatchObject({ context: { name: 'a-description-less-concept', given: undefined } });
});

it('refuses a concept registration naming an empty-string description exactly as it refuses an absent one (criterion 1)', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(
    glossary.registerConcept({ name: 'an-empty-description-concept', accepts: ['a-subject-type'], description: '' }),
  );

  expect(refusal).toBeInstanceOf(ConceptDescriptionRequiredError);
  expect(refusal).toMatchObject({ context: { name: 'an-empty-description-concept', given: '' } });
});

it('leaves the glossary\'s held concepts unchanged when a registration naming no description is refused (criterion 2)', async () => {
  const store = new InMemoryGlossaryStore([
    { name: 'a-held-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An existing, already-described concept.' },
  ]);
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(
    glossary.registerConcept({ name: 'a-new-description-less-concept', accepts: ['a-subject-type'] }),
  );

  expect(refusal).toBeInstanceOf(ConceptDescriptionRequiredError);
  expect(await store.readConcepts()).toEqual([
    { name: 'a-held-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An existing, already-described concept.' },
  ]);
});

it(
  "leaves the already-held concept exactly as it was when a registration naming no description targets that very same, already-held name (criterion 2, the replace-at-an-existing-name path task/glossary-concept-write-upsert-hotfix's own Notes name)",
  async () => {
    const store = new InMemoryGlossaryStore([
      { name: 'a-held-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An existing, already-described concept.' },
    ]);
    const glossary = new GlossaryService(store);

    const refusal = await rejectionOf(
      glossary.registerConcept({ name: 'a-held-concept', accepts: ['a-different-subject-type'] }),
    );

    expect(refusal).toBeInstanceOf(ConceptDescriptionRequiredError);
    expect(await store.readConcepts()).toEqual([
      { name: 'a-held-concept', accepts: ['a-subject-type'], ttl: 60, description: 'An existing, already-described concept.' },
    ]);
  },
);

it('succeeds for a concept registration naming a description, and the glossary\'s held concept for that name carries exactly that description (criterion 3)', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-described-concept',
    accepts: ['a-subject-type'],
    ttl: 120,
    description: 'What this named observation means, stated for a reader downstream.',
  });

  expect(registered).toEqual({
    name: 'a-described-concept',
    accepts: ['a-subject-type'],
    ttl: 120,
    description: 'What this named observation means, stated for a reader downstream.',
  });
  expect(await store.readConcepts()).toEqual([
    {
      name: 'a-described-concept',
      accepts: ['a-subject-type'],
      ttl: 120,
      description: 'What this named observation means, stated for a reader downstream.',
    },
  ]);
});

it('does not treat a whitespace-only description as naming none: it is stored exactly as given, with no trimming and no refusal', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-whitespace-description-concept',
    accepts: ['a-subject-type'],
    description: '   ',
  });

  expect(registered.description).toBe('   ');
  expect(await store.readConcepts()).toEqual([
    { name: 'a-whitespace-description-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS, description: '   ' },
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

it(
  'resolves a non-conclusion outcome without throwing even though some other outcome is now permanently referenced elsewhere, and leaves that other outcome held unchanged',
  async () => {
    const store = new InMemoryGlossaryStore();
    await store.writeTerms('outcome', [{ name: 'a-permanently-referenced-outcome' }]);

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

it('answers a page of a vocabulary with the full pagination envelope, its page count computed from the total and the limit (API-03)', async () => {
  const store = new InMemoryGlossaryStore();
  const held = ['term-a', 'term-b', 'term-c', 'term-d', 'term-e'].map((name) => ({ name }));
  await store.writeTerms('subject-type', held);
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('subject-type', { offset: 0, limit: 2 });

  expect(page).toEqual({
    data: [{ name: 'term-a' }, { name: 'term-b' }],
    total: 5,
    limit: 2,
    offset: 0,
    pageCount: 3,
  });
});

it('answers a page from the middle of a larger vocabulary, windowed by offset and limit rather than always starting at the first term', async () => {
  const store = new InMemoryGlossaryStore();
  const held = ['action-a', 'action-b', 'action-c', 'action-d', 'action-e'].map((name) => ({ name }));
  await store.writeTerms('action', held);
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('action', { offset: 2, limit: 2 });

  expect(page).toEqual({
    data: [{ name: 'action-c' }, { name: 'action-d' }],
    total: 5,
    limit: 2,
    offset: 2,
    pageCount: 3,
  });
});

it('answers an empty data array, never an error, for a vocabulary with no terms held (API-02)', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('recipient', { offset: 0, limit: 10 });

  expect(page).toEqual({ data: [], total: 0, limit: 10, offset: 0, pageCount: 0 });
});

it('answers an empty data array, never an error, when the offset falls past the end of a non-empty vocabulary (API-02)', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('action', [{ name: 'only-action' }]);
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('action', { offset: 5, limit: 2 });

  expect(page).toEqual({ data: [], total: 1, limit: 2, offset: 5, pageCount: 1 });
});

it('includes both non-conclusion outcomes in the returned page when listing the outcome vocabulary, exactly as terms() already seeds them', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('outcome', { offset: 0, limit: 10 });

  expect(page.data.map((term) => term.name).sort()).toEqual([
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
});

it("counts the seeded non-conclusion outcomes toward the outcome vocabulary's total and page count, not only toward its returned page (API-03)", async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('outcome', [{ name: 'a-conclusion' }]);
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('outcome', { offset: 0, limit: 1 });

  expect(page.total).toBe(3);
  expect(page.pageCount).toBe(3);
});

it('refuses listing a vocabulary whose records hold one name twice, the same typed error reading a single term already raises', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('action', [{ name: 'repeated-term' }, { name: 'repeated-term' }]);
  const glossary = new GlossaryService(store);

  const refusal = await rejectionOf(glossary.listVocabularyTerms('action', { offset: 0, limit: 10 }));

  expect(refusal).toBeInstanceOf(DuplicateGlossaryNameError);
  expect(refusal).toMatchObject({ context: { vocabulary: 'action', name: 'repeated-term' } });
});

it('answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)', async () => {
  const store = new InMemoryGlossaryStore();
  await store.writeTerms('subject-attribute', [{ name: 'attr-a' }, { name: 'attr-b' }]);
  const glossary = new GlossaryService(store);

  const page = await glossary.listVocabularyTerms('subject-attribute', { offset: 0, limit: 0 });

  expect(page.pageCount).toBe(0);
});

