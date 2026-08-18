// Proof for task/glossary-query-http/list-concepts-query-extension:
// GlossaryService.listConcepts answers every concept currently registered,
// paginated per src/types/pagination.ts (API-01 through API-04), reusing
// concepts()'s own established behavior — the ttl default and the
// duplicate-name assertion — unchanged. A companion to
// glossary.service.spec.ts rather than an addition to it: see this record's
// own `divergences` for why the file sits beside it instead of inside it.
import { expect, it } from 'vitest';
import { DuplicateGlossaryNameError } from '../../../errors/duplicate-glossary-name.error.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { ConceptRegistration, GlossaryTerm } from '../../../glossary/terms.js';

/**
 * The default the criterion states in its own words — sixty seconds — spelled
 * here rather than imported from the source, so the test fails if the
 * source's constant drifts from what the task states.
 */
const SIXTY_SECONDS = 60;

/**
 * Stands in for the store boundary, holding only concept registrations —
 * listConcepts reaches no term vocabulary, so the three term-vocabulary
 * methods are never called by any test in this file and simply refuse if
 * they ever were.
 */
class ConceptOnlyGlossaryStore implements IGlossaryStore {
  public constructor(private readonly concepts: readonly ConceptRegistration[] = []) {}

  public async readTerms(): Promise<readonly GlossaryTerm[]> {
    throw new Error('listConcepts must never read a term vocabulary');
  }

  public async writeTerms(): Promise<void> {
    throw new Error('listConcepts must never write a term vocabulary');
  }

  public async insertMissingTerms(): Promise<void> {
    throw new Error('listConcepts must never seed a term vocabulary');
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return this.concepts;
  }
}

/** Builds five distinct concept registrations, named a through e, each ttl-less. */
function fiveConcepts(): readonly ConceptRegistration[] {
  return ['concept-a', 'concept-b', 'concept-c', 'concept-d', 'concept-e'].map((name) => ({
    name,
    accepts: ['a-subject-type'],
  }));
}

it('answers a page of the registered concepts with the full pagination envelope, its page count computed from the total and the limit (API-03)', async () => {
  const store = new ConceptOnlyGlossaryStore(fiveConcepts());
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 0, limit: 2 });

  expect(page).toEqual({
    data: [
      { name: 'concept-a', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
      { name: 'concept-b', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
    ],
    total: 5,
    limit: 2,
    offset: 0,
    pageCount: 3,
  });
});

it('answers a page from the middle of a larger concept list, windowed by offset and limit rather than always starting at the first concept', async () => {
  const store = new ConceptOnlyGlossaryStore(fiveConcepts());
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 2, limit: 2 });

  expect(page).toEqual({
    data: [
      { name: 'concept-c', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
      { name: 'concept-d', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
    ],
    total: 5,
    limit: 2,
    offset: 2,
    pageCount: 3,
  });
});

it('answers an empty data array, never an error, for a glossary holding no concepts (API-02)', async () => {
  const store = new ConceptOnlyGlossaryStore();
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 0, limit: 10 });

  expect(page).toEqual({ data: [], total: 0, limit: 10, offset: 0, pageCount: 0 });
});

it('answers an empty data array, never an error, when the offset falls past the end of the registered concepts (API-02)', async () => {
  const store = new ConceptOnlyGlossaryStore([{ name: 'only-concept', accepts: ['a-subject-type'] }]);
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 5, limit: 2 });

  expect(page).toEqual({ data: [], total: 1, limit: 2, offset: 5, pageCount: 1 });
});

it('holds the default of sixty seconds, read through listConcepts, for a concept whose registration states no ttl', async () => {
  const store = new ConceptOnlyGlossaryStore([
    { name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'] },
  ]);
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 0, limit: 10 });

  expect(page.data).toEqual([
    { name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS },
  ]);
});

it('refuses listing concepts whose registrations hold one name twice, the same typed error reading a single concept already raises', async () => {
  const store = new ConceptOnlyGlossaryStore([
    { name: 'repeated-concept', accepts: ['a-subject-type'], ttl: 120 },
    { name: 'repeated-concept', accepts: ['a-subject-type'] },
  ]);
  const glossary = new GlossaryService(store);

  let caught: unknown;
  try {
    await glossary.listConcepts({ offset: 0, limit: 10 });
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(DuplicateGlossaryNameError);
  expect(caught).toMatchObject({ context: { vocabulary: 'concept', name: 'repeated-concept' } });
});

it('answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)', async () => {
  const store = new ConceptOnlyGlossaryStore(fiveConcepts());
  const glossary = new GlossaryService(store);

  const page = await glossary.listConcepts({ offset: 0, limit: 0 });

  expect(page.pageCount).toBe(0);
});
