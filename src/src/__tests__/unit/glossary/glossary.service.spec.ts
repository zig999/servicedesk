// Proof for the glossary's holding: every vocabulary answers each name exactly
// once, a concept declares its name, accepted subject types and ttl in seconds
// with sixty as the default where its registration states none, and the two
// non-conclusion outcomes are held from the first outcome read on. The store
// boundary is an in-memory stand-in, so no test here touches a file.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { DuplicateGlossaryNameError } from '../../../errors/duplicate-glossary-name.error.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from '../../../glossary/terms.js';

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

  /**
   * Replaces the whole held set of concept registrations with exactly the
   * given concepts, the same whole-replace effect
   * RelationalGlossaryStore.writeConcepts has for its own two tables —
   * lets registerConcept's create-or-replace-in-place behavior be observed
   * through a later readConcepts()/concepts() call, without any filesystem.
   */
  public async writeConcepts(concepts: readonly Concept[]): Promise<void> {
    this.concepts = concepts;
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

// -------------------- task/concept-authoring/glossary-store-concept-write

it('creates a concept with its accepted subject types and its ttl, at a name the glossary does not yet hold', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-new-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
  });

  expect(registered).toEqual({ name: 'a-new-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 120 });
  expect(await store.readConcepts()).toEqual([
    { name: 'a-new-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 120 },
  ]);
});

it('defaults a newly created concept\'s ttl to sixty seconds when its registration states none, the same default a read already applies', async () => {
  const store = new InMemoryGlossaryStore();
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({ name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'] });

  expect(registered).toEqual({ name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS });
});

it('replaces a concept in place at a name the glossary already holds, rather than creating a second entry for it', async () => {
  const store = new InMemoryGlossaryStore([
    { name: 'a-held-concept', accepts: ['an-old-subject-type'], ttl: 90 },
    { name: 'an-unrelated-concept', accepts: ['a-subject-type'], ttl: 60 },
  ]);
  const glossary = new GlossaryService(store);

  const registered = await glossary.registerConcept({
    name: 'a-held-concept',
    accepts: ['a-new-subject-type'],
    ttl: 240,
  });

  expect(registered).toEqual({ name: 'a-held-concept', accepts: ['a-new-subject-type'], ttl: 240 });
  const persisted = await store.readConcepts();
  expect(persisted).toHaveLength(2);
  expect(persisted.filter((concept) => concept.name === 'a-held-concept')).toEqual([
    { name: 'a-held-concept', accepts: ['a-new-subject-type'], ttl: 240 },
  ]);
  expect(persisted).toEqual(
    expect.arrayContaining([{ name: 'an-unrelated-concept', accepts: ['a-subject-type'], ttl: 60 }]),
  );
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

// -------------------- task/glossary-query-http/list-vocabulary-terms-query-extension

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

// ------------------------------------------------------------------ task/stale-specification-citations/citations-corrected

// Strips every line's own leading comment marker (a line-comment slash pair, or a block-comment
// opener, closer or continuation star) and collapses what remains to one line of prose, so a
// comment wrapped across several source lines compares the same as its own single-line paraphrase.
function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("pageCountOf's own comment cites constraints/listings-are-paged's own statement that a non-positive limit never reaches this count, rather than claiming no source states the answer (criterion 6)", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../glossary/glossary.service.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/no source states/i);
  expect(prose).toContain('constraints/listings-are-paged now states this branch is never reached by a request this system answers');
  expect(prose).toContain(
    'no request with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error refuses it first',
  );
});

it("no longer cites the discarded ensure-non-conclusion-outcomes-hotfix task path — terms()' and withNonConclusionOutcomes' own doc comments both cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead (criterion 8)", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../glossary/glossary.service.ts', import.meta.url)), 'utf8');

  expect(source).not.toContain('task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome');
  const citationCount = source.split('rules/glossary/the-non-conclusion-outcomes-precede-the-first-case').length - 1;
  expect(citationCount).toBeGreaterThanOrEqual(2);
});
