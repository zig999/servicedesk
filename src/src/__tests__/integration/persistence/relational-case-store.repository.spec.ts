import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { CreateDraftInput } from '../../../case/case-store.port.js';
import type { Resolution } from '../../../case/case.js';
import type { IHypothesisRevisionOverwrite } from '../../../case/hypothesis-revision-overwrite.port.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import { ReleasedHypothesisRevisionNotAlterableError } from '../../../errors/released-hypothesis-revision-not-alterable.error.js';
import { statusForError } from '../../../errors/status-map.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

interface IGlossary {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
}

const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

let pool: DatabaseConnection;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `case-lifecycle-store-subject-${randomUUID()}`;
  const outcome = `case-lifecycle-store-outcome-${randomUUID()}`;
  const action = `case-lifecycle-store-action-${randomUUID()}`;
  const recipient = `case-lifecycle-store-recipient-${randomUUID()}`;
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [subjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [recipient]);
  subjectTypesWrittenByThisTest.push(subjectType);
  outcomesWrittenByThisTest.push(outcome);
  actionsWrittenByThisTest.push(action);
  recipientsWrittenByThisTest.push(recipient);
  return { subjectType, outcome, action, recipient };
}

async function freshConcept(): Promise<string> {
  const name = `case-lifecycle-store-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

function aResolution(glossary: IGlossary): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

function aCreateDraftInput(slug: string, glossary: IGlossary, overrides: Partial<CreateDraftInput> = {}): CreateDraftInput {
  return {
    slug,
    title: 'A title',
    when_to_use: 'A use',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: glossary.subjectType,
    fallback: aResolution(glossary),
    ...overrides,
  };
}

const CASE_CATALOG_PAGE_MARGIN = 20;

async function currentCaseCount(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM cases');
  return Number(rows[0]?.count ?? '0');
}

async function generousCasesPageLimit(): Promise<number> {
  return (await currentCaseCount()) + CASE_CATALOG_PAGE_MARGIN;
}

async function cleanupWrittenCases(): Promise<void> {
  if (slugsWrittenByThisTest.length === 0) return;
  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  slugsWrittenByThisTest = [];
}

async function cleanupWrittenGlossary(): Promise<void> {
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  }
  if (actionsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
  }
  conceptsWrittenByThisTest = [];
  subjectTypesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
}

afterEach(async () => {
  await cleanupWrittenCases();
  await cleanupWrittenGlossary();
});

async function placeHypothesesOutOfOrder(
  store: RelationalCaseStore,
  input: { slug: string; glossary: IGlossary; conceptA: string; conceptB: string },
): Promise<{ version: number; firstRevision: number; secondRevision: number }> {
  const { slug, glossary, conceptA, conceptB } = input;
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const firstRevision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'first',
    criterion: 'a criterion',
    collects: [conceptA, conceptB],
    resolution: aResolution(glossary),
  });
  const secondRevision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'second',
    criterion: 'another criterion',
    collects: [conceptB],
    resolution: aResolution(glossary),
  });

  await store.placeHypothesis({ slug, version, hypothesis_name: 'second', revision: secondRevision, position: 1 });
  await store.placeHypothesis({ slug, version, hypothesis_name: 'first', revision: firstRevision, position: 2 });
  return { version, firstRevision, secondRevision };
}

it(
  "assembles one version whole — its own attributes together with its manifest, ordered by " +
    'position regardless of the order entries were placed in, each entry joined to its own adopted ' +
    'hypothesis-revision and its collects',
  async () => {
    const slug = `case-lifecycle-store-assemble-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const [conceptA, conceptB] = await Promise.all([freshConcept(), freshConcept()]);
    const store = new RelationalCaseStore(pool);
    const { version, firstRevision, secondRevision } = await placeHypothesesOutOfOrder(store, { slug, glossary, conceptA, conceptB });

    const assembled = await store.assembleVersion(slug, version);

    expect(assembled).toMatchObject({
      slug,
      version,
      title: 'A title',
      when_to_use: 'A use',
      subject: glossary.subjectType,
      fallback: aResolution(glossary),
      state: 'draft',
    });

    expect(assembled?.manifest).toEqual([
      { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'second', revision: secondRevision, collects: [conceptB] }) },
      { position: 2, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'first', revision: firstRevision, collects: [conceptA, conceptB].sort() }) },
    ]);
  },
);

it('answers absence, not a rejection, for a slug and version nothing was ever stored under', async () => {
  const store = new RelationalCaseStore(pool);

  const assembled = await store.assembleVersion(`case-lifecycle-store-absent-${randomUUID()}`, 1);

  expect(assembled).toBeUndefined();
});

it("returns every case currently held, with no filter narrowing it, so all three freshly created cases show up on one wide-enough page", async () => {
  const slugA = `case-lifecycle-store-list-${randomUUID()}`;
  const slugB = `case-lifecycle-store-list-${randomUUID()}`;
  const slugC = `case-lifecycle-store-list-${randomUUID()}`;
  slugsWrittenByThisTest.push(slugA, slugB, slugC);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);

  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM cases');
  const wideEnoughLimit = Number(rows[0]?.count ?? '0') + 10;
  await store.createDraft(aCreateDraftInput(slugA, glossary));
  await store.createDraft(aCreateDraftInput(slugB, glossary));
  await store.createDraft(aCreateDraftInput(slugC, glossary));

  const page = await store.listCases({ offset: 0, limit: wideEnoughLimit });

  const slugs = page.data.map((identity) => identity.slug);
  expect(slugs).toEqual(expect.arrayContaining([slugA, slugB, slugC]));
});

it(
  'answers the PaginatedResponse envelope src/types/pagination.ts declares — the given limit and ' +
    'offset echoed back, the page itself held to that limit even though more cases exist, and ' +
    'pageCount computed from total and limit rather than hardcoded',
  async () => {
    const slugA = `case-lifecycle-store-list-page-${randomUUID()}`;
    const slugB = `case-lifecycle-store-list-page-${randomUUID()}`;
    slugsWrittenByThisTest.push(slugA, slugB);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slugA, glossary));
    await store.createDraft(aCreateDraftInput(slugB, glossary));

    const page = await store.listCases({ offset: 0, limit: 1 });

    expect(page.limit).toBe(1);
    expect(page.offset).toBe(0);
    expect(page.data).toHaveLength(1);
    expect(page.total).toBeGreaterThanOrEqual(2);
    expect(page.pageCount).toBe(Math.ceil(page.total / 1));
  },
);

it('answers an empty page — data: [] — rather than an error or an absent value, for a page far beyond anything the table could hold', async () => {
  const store = new RelationalCaseStore(pool);

  const page = await store.listCases({ offset: 100_000_000, limit: 20 });

  expect(page).toBeDefined();
  expect(page.data).toEqual([]);
});

it(
  "returns every version the named case currently holds, by its own number and lifecycle state, " +
    'ordered by version regardless of how many of them have since been released',
  async () => {
    const slug = `case-lifecycle-store-list-versions-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version1);
    const version2 = await store.createDraft(aCreateDraftInput(slug, glossary));

    const page = await store.listCaseVersions(slug, { offset: 0, limit: 20 });

    expect(page.data).toEqual([
      { version: version1, state: 'released' },
      { version: version2, state: 'draft' },
    ]);
  },
);

it("excludes another case's own versions from the page, naming only the slug it was asked for", async () => {
  const slug = `case-lifecycle-store-list-versions-isolated-${randomUUID()}`;
  const otherSlug = `case-lifecycle-store-list-versions-isolated-other-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug, otherSlug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.createDraft(aCreateDraftInput(otherSlug, glossary));

  const page = await store.listCaseVersions(slug, { offset: 0, limit: 20 });

  expect(page.data).toEqual([{ version, state: 'draft' }]);
});

it(
  'answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named ' +
    "case's own versions — the given limit and offset echoed back, the page itself held to that " +
    'limit even though the case holds more versions, and pageCount computed from total and limit',
  async () => {
    const slug = `case-lifecycle-store-list-versions-page-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version1);
    const version2 = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version2);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const page = await store.listCaseVersions(slug, { offset: 0, limit: 1 });

    expect(page.limit).toBe(1);
    expect(page.offset).toBe(0);
    expect(page.data).toHaveLength(1);
    expect(page.total).toBe(3);
    expect(page.pageCount).toBe(3);
  },
);

it('refuses, through CaseNotFoundError naming the slug, a slug that names no case at all', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-list-versions-absent-${randomUUID()}`;

  const rejection = store.listCaseVersions(slug, { offset: 0, limit: 20 });

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 0 } });
});

it(
  'answers an empty page, never CaseNotFoundError, for a case that currently holds no version at ' +
    'all because the only one it ever held was discarded — its own identity row survives that, ' +
    'told apart here from a slug naming no case at all',
  async () => {
    const slug = `case-lifecycle-store-list-versions-zero-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.discard(slug, version);

    const page = await store.listCaseVersions(slug, { offset: 0, limit: 20 });

    expect(page).toEqual({ data: [], total: 0, limit: 20, offset: 0, pageCount: 0 });
  },
);

it(
  'returns every hypothesis the named case has ever originated, by its own bare name, regardless of ' +
    'how many revisions each one holds',
  async () => {
    const slug = `case-lifecycle-store-list-hypotheses-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = (hypothesisName: string) => ({ slug, hypothesis_name: hypothesisName, criterion: 'a criterion', collects: [] as string[], resolution: aResolution(glossary) });
    await store.insertHypothesisRevision(revisionInput('alpha'));
    await store.insertHypothesisRevision(revisionInput('beta'));
    await store.insertHypothesisRevision(revisionInput('beta'));

    const page = await store.listHypotheses(slug, { offset: 0, limit: 20 });

    expect(page.data).toEqual([{ name: 'alpha' }, { name: 'beta' }]);
  },
);

it("excludes another case's own hypotheses from the page, naming only the slug it was asked for", async () => {
  const slug = `case-lifecycle-store-list-hypotheses-isolated-${randomUUID()}`;
  const otherSlug = `case-lifecycle-store-list-hypotheses-isolated-other-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug, otherSlug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.createDraft(aCreateDraftInput(otherSlug, glossary));
  await store.insertHypothesisRevision({ slug, hypothesis_name: 'a-hypothesis', criterion: 'a criterion', collects: [], resolution: aResolution(glossary) });
  await store.insertHypothesisRevision({ slug: otherSlug, hypothesis_name: 'other-hypothesis', criterion: 'a criterion', collects: [], resolution: aResolution(glossary) });

  const page = await store.listHypotheses(slug, { offset: 0, limit: 20 });

  expect(page.data).toEqual([{ name: 'a-hypothesis' }]);
});

it(
  'answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named ' +
    "case's own hypotheses — the given limit and offset echoed back, the page itself held to that " +
    'limit even though the case holds more hypotheses, and pageCount computed from total and limit',
  async () => {
    const slug = `case-lifecycle-store-list-hypotheses-page-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = (hypothesisName: string) => ({ slug, hypothesis_name: hypothesisName, criterion: 'a criterion', collects: [] as string[], resolution: aResolution(glossary) });
    await store.insertHypothesisRevision(revisionInput('alpha'));
    await store.insertHypothesisRevision(revisionInput('beta'));
    await store.insertHypothesisRevision(revisionInput('gamma'));

    const page = await store.listHypotheses(slug, { offset: 0, limit: 1 });

    expect(page.limit).toBe(1);
    expect(page.offset).toBe(0);
    expect(page.data).toHaveLength(1);
    expect(page.total).toBe(3);
    expect(page.pageCount).toBe(3);
  },
);

it('refuses, through CaseNotFoundError naming the slug, a slug that names no case at all', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-list-hypotheses-absent-${randomUUID()}`;

  const rejection = store.listHypotheses(slug, { offset: 0, limit: 20 });

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 0 } });
});

it('answers an empty page, never CaseNotFoundError, for a case that has originated no hypothesis yet', async () => {
  const slug = `case-lifecycle-store-list-hypotheses-zero-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));

  const page = await store.listHypotheses(slug, { offset: 0, limit: 20 });

  expect(page).toEqual({ data: [], total: 0, limit: 20, offset: 0, pageCount: 0 });
});

it(
  "still returns a hypothesis originated but never placed into any manifest, and one placed into the " +
    "case's own current version and then removed from it — case membership does not depend on that " +
    "version's own manifest",
  async () => {
    const slug = `case-lifecycle-store-list-hypotheses-unplaced-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.insertHypothesisRevision({ slug, hypothesis_name: 'never-placed', criterion: 'a criterion', collects: [], resolution: aResolution(glossary) });
    const removedRevision = await store.insertHypothesisRevision({ slug, hypothesis_name: 'placed-then-removed', criterion: 'a criterion', collects: [], resolution: aResolution(glossary) });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'placed-then-removed', revision: removedRevision, position: 1 });
    await store.removeManifestEntry(slug, version, 'placed-then-removed');

    const page = await store.listHypotheses(slug, { offset: 0, limit: 20 });

    expect(page.data).toEqual([{ name: 'never-placed' }, { name: 'placed-then-removed' }]);
  },
);

it(
  "returns every revision the named hypothesis currently holds, by its own full content, each " +
    "revision's own collects grouped to it alone and never conflated with another revision of the " +
    'same hypothesis',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const [conceptA, conceptB] = await Promise.all([freshConcept(), freshConcept()]);
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const firstRevision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'first criterion',
      collects: [conceptA],
      resolution: aResolution(glossary),
    });
    const secondRevision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'second criterion',
      collects: [conceptB],
      resolution: aResolution(glossary),
    });

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

    expect(page.data).toEqual([
      { revision: secondRevision, criterion: 'second criterion', collects: [conceptB], resolution: aResolution(glossary), state: 'draft' },
      { revision: firstRevision, criterion: 'first criterion', collects: [conceptA], resolution: aResolution(glossary), state: 'draft' },
    ]);
  },
);

it(
  "excludes another hypothesis's own revisions from the page, within the same case, naming only the " +
    'hypothesis name it was asked for',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-isolated-name-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'another-hypothesis',
      criterion: 'another criterion',
      collects: [],
      resolution: aResolution(glossary),
    });

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

    expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects: [], resolution: aResolution(glossary), state: 'draft' }]);
  },
);

it(
  "excludes a different case's own revisions of a hypothesis sharing the same name, naming only the " +
    'slug it was asked for',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-isolated-slug-${randomUUID()}`;
    const otherSlug = `case-lifecycle-store-list-revisions-isolated-slug-other-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug, otherSlug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.createDraft(aCreateDraftInput(otherSlug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'shared-name',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.insertHypothesisRevision({
      slug: otherSlug,
      hypothesis_name: 'shared-name',
      criterion: 'another criterion',
      collects: [],
      resolution: aResolution(glossary),
    });

    const page = await store.listHypothesisRevisions(slug, 'shared-name', { offset: 0, limit: 20 });

    expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects: [], resolution: aResolution(glossary), state: 'draft' }]);
  },
);

it(
  'answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named ' +
    "hypothesis's own revisions — the given limit and offset echoed back, the page itself held to " +
    'that limit even though the hypothesis holds more revisions, and pageCount computed from total ' +
    'and limit',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-page-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = () => ({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [] as string[],
      resolution: aResolution(glossary),
    });
    await store.insertHypothesisRevision(revisionInput());
    await store.insertHypothesisRevision(revisionInput());
    await store.insertHypothesisRevision(revisionInput());

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 1 });

    expect(page.limit).toBe(1);
    expect(page.offset).toBe(0);
    expect(page.data).toHaveLength(1);
    expect(page.total).toBe(3);
    expect(page.pageCount).toBe(3);
  },
);

it(
  "carries every answered revision's own state, reading the field as draft for a revision left at its schema default across a multi-revision page",
  async () => {
    const slug = `case-lifecycle-store-list-revisions-own-state-draft-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = () => ({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [] as string[],
      resolution: aResolution(glossary),
    });
    await store.insertHypothesisRevision(revisionInput());
    await store.insertHypothesisRevision(revisionInput());
    await store.insertHypothesisRevision(revisionInput());

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

    expect(page.data).toHaveLength(3);
    expect(page.data.every((item) => item.state === 'draft')).toBe(true);
  },
);

it('answers a revision whose own stored state is released as released', async () => {
  const slug = `case-lifecycle-store-list-revisions-own-state-released-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  await pool.query(
    "UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3",
    [slug, 'a-hypothesis', revision],
  );

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

  expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects: [], resolution: aResolution(glossary), state: 'released' }]);
});

it('answers a revision whose own stored state is draft as draft', async () => {
  const slug = `case-lifecycle-store-list-revisions-own-state-still-draft-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

  expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects: [], resolution: aResolution(glossary), state: 'draft' }]);
});

it(
  "answers a revision's own stored state — draft — even though a released case version's manifest still references that revision, reading the state from the revision's own row and not from the referencing case version",
  async () => {
    const slug = `case-lifecycle-store-list-revisions-own-state-not-manifest-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    await store.release(slug, version);

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

    expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects: [], resolution: aResolution(glossary), state: 'draft' }]);
  },
);

it(
  'answers a hypothesis holding three revisions ordered by revision number descending, the highest revision first',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-order-desc-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = () => ({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [] as string[],
      resolution: aResolution(glossary),
    });
    const first = await store.insertHypothesisRevision(revisionInput());
    const second = await store.insertHypothesisRevision(revisionInput());
    const third = await store.insertHypothesisRevision(revisionInput());

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

    expect(page.data.map((item) => item.revision)).toEqual([third, second, first]);
  },
);

it(
  'answers the page a middle offset selects under descending order — the second- and third-highest revisions, not the two most recently inserted',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-paged-desc-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = () => ({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [] as string[],
      resolution: aResolution(glossary),
    });
    await store.insertHypothesisRevision(revisionInput());
    const second = await store.insertHypothesisRevision(revisionInput());
    const third = await store.insertHypothesisRevision(revisionInput());
    await store.insertHypothesisRevision(revisionInput());

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 1, limit: 2 });

    expect(page.data.map((item) => item.revision)).toEqual([third, second]);
    expect(page.total).toBe(4);
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(1);
  },
);

it('refuses, through CaseNotFoundError naming the slug, a slug that names no case at all', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-list-revisions-absent-slug-${randomUUID()}`;

  const rejection = store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 0 } });
});

it(
  'refuses, through CaseNotFoundError naming the slug, a known case that has never originated a ' +
    'hypothesis by the given name',
  async () => {
    const slug = `case-lifecycle-store-list-revisions-absent-name-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const rejection = store.listHypothesisRevisions(slug, 'never-originated', { offset: 0, limit: 20 });

    await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version: 0 } });
  },
);

it(
  'assigns the next version off the durable counter, never reusing a version number even after the ' +
    'draft that held it is discarded',
  async () => {
    const slug = `case-lifecycle-store-counter-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version1);
    const version2 = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.discard(slug, version2);

    const version3 = await store.createDraft(aCreateDraftInput(slug, glossary));

    expect([version1, version2, version3]).toEqual([1, 2, 3]);
  },
);

it("copies a named source version's manifest into the new draft's own manifest, entry for entry", async () => {
  const slug = `case-lifecycle-store-copy-named-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const store = new RelationalCaseStore(pool);
  const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [concept],
    resolution: aResolution(glossary),
  });
  await store.placeHypothesis({ slug, version: version1, hypothesis_name: 'a-hypothesis', revision, position: 1 });
  await store.release(slug, version1);

  const version2 = await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version1 }));
  const assembled = await store.assembleVersion(slug, version2);

  expect(assembled?.manifest).toEqual([
    { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'a-hypothesis', revision, collects: [concept] }) },
  ]);
});

it('copies the case\'s own latest released version\'s manifest when naming no source version at all', async () => {
  const slug = `case-lifecycle-store-copy-latest-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const store = new RelationalCaseStore(pool);
  const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [concept],
    resolution: aResolution(glossary),
  });
  await store.placeHypothesis({ slug, version: version1, hypothesis_name: 'a-hypothesis', revision, position: 1 });
  await store.release(slug, version1);

  const version2 = await store.createDraft(aCreateDraftInput(slug, glossary));
  const assembled = await store.assembleVersion(slug, version2);

  expect(assembled?.manifest).toHaveLength(1);
  expect(assembled?.manifest[0]?.hypothesis_revision.hypothesis_name).toBe('a-hypothesis');
});

it('starts a case\'s very first draft with an empty manifest, since no released version exists yet to copy from', async () => {
  const slug = `case-lifecycle-store-first-draft-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);

  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const assembled = await store.assembleVersion(slug, version);

  expect(assembled?.manifest).toEqual([]);
});

it('refuses a second draft for a case that already holds one in draft state', async () => {
  const slug = `case-lifecycle-store-second-draft-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));

  const rejection = store.createDraft(aCreateDraftInput(slug, glossary));

  await expect(rejection).rejects.toBeInstanceOf(CaseAlreadyHasDraftError);
  await expect(rejection).rejects.toMatchObject({ context: { slug } });
});

it('lets only one of two concurrent draft-creation calls for the same case succeed, the other refused through CaseAlreadyHasDraftError', async () => {
  const slug = `case-lifecycle-store-concurrent-draft-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);

  const results = await Promise.allSettled([
    store.createDraft(aCreateDraftInput(slug, glossary)),
    store.createDraft(aCreateDraftInput(slug, glossary)),
  ]);

  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
  expect(rejected?.reason).toBeInstanceOf(CaseAlreadyHasDraftError);
});

it("creates a hypothesis's own identity row only the first time its name is used for a case, never a second one for a name already held", async () => {
  const slug = `case-lifecycle-store-identity-once-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const input = { slug, hypothesis_name: 'a-hypothesis', criterion: 'a criterion', collects: [] as string[], resolution: aResolution(glossary) };

  await store.insertHypothesisRevision(input);
  await store.insertHypothesisRevision(input);

  const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1 AND name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ name: 'a-hypothesis' }]);
});

it("numbers a hypothesis-revision one past that hypothesis's own highest existing revision, or 1 where none exists yet, independently per hypothesis", async () => {
  const slug = `case-lifecycle-store-revision-number-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revisionInput = (hypothesisName: string) => ({
    slug,
    hypothesis_name: hypothesisName,
    criterion: 'a criterion',
    collects: [] as string[],
    resolution: aResolution(glossary),
  });

  const first = await store.insertHypothesisRevision(revisionInput('a-hypothesis'));
  const second = await store.insertHypothesisRevision(revisionInput('a-hypothesis'));
  const anothersFirst = await store.insertHypothesisRevision(revisionInput('another-hypothesis'));

  expect([first, second, anothersFirst]).toEqual([1, 2, 1]);
});

it('refuses placing a revision at a manifest position already occupied by a different hypothesis in the same version', async () => {
  const slug = `case-lifecycle-store-position-occupied-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const firstRevision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'first',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  const secondRevision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'second',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  await store.placeHypothesis({ slug, version, hypothesis_name: 'first', revision: firstRevision, position: 1 });

  const rejection = store.placeHypothesis({ slug, version, hypothesis_name: 'second', revision: secondRevision, position: 1 });

  await expect(rejection).rejects.toBeInstanceOf(ManifestPositionOccupiedError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version, position: 1 } });
});

it('removes only the named manifest entry, never the hypothesis-revision it referenced', async () => {
  const slug = `case-lifecycle-store-remove-entry-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

  await store.removeManifestEntry(slug, version, 'a-hypothesis');

  const assembled = await store.assembleVersion(slug, version);
  expect(assembled?.manifest).toEqual([]);
  const { rows } = await pool.query('SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ revision }]);
});

it('records the instant of release when release is called against a draft version', async () => {
  const slug = `case-lifecycle-store-release-once-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));

  await store.release(slug, version);

  const read = await store.assembleVersion(slug, version);
  expect(read?.state).toBe('released');
  expect(read?.released_at).toBeDefined();
});

it(
  'refuses a second release call against a version already released, through CaseVersionNotDraftAtReleaseError, leaving its recorded released_at unchanged',
  async () => {
    const slug = `case-lifecycle-store-release-twice-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version);
    const firstRead = await store.assembleVersion(slug, version);

    const rejection = store.release(slug, version);

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftAtReleaseError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
    const secondRead = await store.assembleVersion(slug, version);
    expect(secondRead?.released_at).toBe(firstRead?.released_at);
  },
);

it(
  "refuses removeManifestEntry, through CaseVersionNotDraftError, against a released version, leaving its own manifest entry in place",
  async () => {
    const slug = `case-lifecycle-store-manifest-immutable-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    await store.release(slug, version);

    const rejection = store.removeManifestEntry(slug, version, 'a-hypothesis');

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
    const assembled = await store.assembleVersion(slug, version);
    expect(assembled?.manifest).toEqual([
      { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'a-hypothesis', revision }) },
    ]);
  },
);

it("removes a draft version and its own manifest entries, without deleting any hypothesis-revision", async () => {
  const slug = `case-lifecycle-store-discard-draft-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

  await store.discard(slug, version);

  await expect(store.assembleVersion(slug, version)).resolves.toBeUndefined();
  const { rows } = await pool.query('SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ revision }]);
});

it(
  'refuses discard, through CaseVersionNotDraftError, against a released version, leaving it — ' +
    "its state, its released_at and its manifest — untouched",
  async () => {
    const slug = `case-lifecycle-store-discard-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    await store.release(slug, version);

    const rejection = store.discard(slug, version);

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
    const assembled = await store.assembleVersion(slug, version);
    expect(assembled).toBeDefined();
    expect(assembled?.state).toBe('released');
    expect(assembled?.manifest).toHaveLength(1);
  },
);

it(
  'refuses placeHypothesis, through CaseVersionNotDraftError, against a released version, inserting no manifest entry',
  async () => {
    const slug = `case-lifecycle-store-place-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.release(slug, version);

    const rejection = store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
    const assembled = await store.assembleVersion(slug, version);
    expect(assembled?.manifest).toEqual([]);
  },
);

it(
  'refuses insertHypothesisRevision, through CaseHoldsNoDraftError naming the slug, against a case that currently holds no draft version, inserting no revision',
  async () => {
    const slug = `case-lifecycle-store-revision-no-draft-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version);

    const rejection = store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });

    await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug } });
    const { rows } = await pool.query(
      'SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
      [slug, 'a-hypothesis'],
    );
    expect(rows).toEqual([]);
  },
);

it('refuses placeHypothesis, through CaseNotFoundError naming the slug and version, against a version that was never stored', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-place-absent-${randomUUID()}`;

  const rejection = store.placeHypothesis({ slug, version: 1, hypothesis_name: 'a-hypothesis', revision: 1, position: 1 });

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});

it('refuses removeManifestEntry, through CaseNotFoundError naming the slug and version, against a version that was never stored', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-remove-absent-${randomUUID()}`;

  const rejection = store.removeManifestEntry(slug, 1, 'a-hypothesis');

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});

it('refuses release, through CaseNotFoundError naming the slug and version, against a version that was never stored', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-release-absent-${randomUUID()}`;

  const rejection = store.release(slug, 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});

it('refuses discard, through CaseNotFoundError naming the slug and version, against a version that was never stored', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-discard-absent-${randomUUID()}`;

  const rejection = store.discard(slug, 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});

it(
  'persists the corrected title, when_to_use, subject, fallback and consolidation_register attributes against a version in draft state',
  async () => {
    const slug = `case-lifecycle-store-update-draft-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const newGlossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary, { consolidation_register: 'plain' }));

    await store.updateDraft(slug, version, {
      title: 'A corrected title',
      when_to_use: 'A corrected use',
      subject: newGlossary.subjectType,
      fallback: aResolution(newGlossary),
      consolidation_register: 'formal',
    });

    const assembled = await store.assembleVersion(slug, version);
    expect(assembled).toMatchObject({
      title: 'A corrected title',
      when_to_use: 'A corrected use',
      subject: newGlossary.subjectType,
      fallback: aResolution(newGlossary),
      consolidation_register: 'formal',
    });
  },
);

it(
  "leaves everything beyond its own five declared attributes untouched — the manifest, the version number and the draft state itself",
  async () => {
    const slug = `case-lifecycle-store-update-draft-boundary-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const newGlossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

    await store.updateDraft(slug, version, {
      title: 'A corrected title',
      when_to_use: 'A corrected use',
      subject: newGlossary.subjectType,
      fallback: aResolution(newGlossary),
    });

    const assembled = await store.assembleVersion(slug, version);
    expect(assembled?.version).toBe(version);
    expect(assembled?.state).toBe('draft');
    expect(assembled?.manifest).toEqual([
      { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'a-hypothesis', revision }) },
    ]);
  },
);

it(
  'refuses a version already released, through CaseVersionNotDraftError, and leaves its five attributes exactly as they were — the guard runs before any write is attempted',
  async () => {
    const slug = `case-lifecycle-store-update-draft-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const newGlossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version);
    const beforeAttempt = await store.assembleVersion(slug, version);

    const rejection = store.updateDraft(slug, version, {
      title: 'A corrected title',
      when_to_use: 'A corrected use',
      subject: newGlossary.subjectType,
      fallback: aResolution(newGlossary),
    });

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
    const afterAttempt = await store.assembleVersion(slug, version);
    expect(afterAttempt).toMatchObject({
      title: beforeAttempt?.title,
      when_to_use: beforeAttempt?.when_to_use,
      subject: beforeAttempt?.subject,
      fallback: beforeAttempt?.fallback,
    });
  },
);

it('refuses, through CaseNotFoundError naming the slug, a slug that names no case at all', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `case-lifecycle-store-update-draft-absent-slug-${randomUUID()}`;

  const rejection = store.updateDraft(slug, 1, {
    title: 'A corrected title',
    when_to_use: 'A corrected use',
    subject: 'irrelevant-subject',
    fallback: { outcome: 'irrelevant-outcome', referral: { action: 'irrelevant-action', recipient: 'irrelevant-recipient' } },
  });

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});

it(
  'refuses, through CaseNotFoundError naming both the slug and the version, a known case that never held the given version number',
  async () => {
    const slug = `case-lifecycle-store-update-draft-absent-version-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const neverHeldVersion = version + 1;

    const rejection = store.updateDraft(slug, neverHeldVersion, {
      title: 'A corrected title',
      when_to_use: 'A corrected use',
      subject: glossary.subjectType,
      fallback: aResolution(glossary),
    });

    await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
    await expect(rejection).rejects.toMatchObject({ context: { slug, version: neverHeldVersion } });
  },
);

it(
  'leaves nothing behind — no cases row, no case_versions row — when the draft-row insert violates a ' +
    "real foreign key on an unregistered fallback outcome, even though the case-identity insert runs first",
  async () => {
    const slug = `case-lifecycle-store-atomic-create-draft-${randomUUID()}`;
    const store = new RelationalCaseStore(pool);
    const input: CreateDraftInput = {
      slug,
      title: 'A title',
      when_to_use: 'A use',
      authored_at: '2024-01-01T00:00:00.000Z',
      subject: `case-lifecycle-store-unregistered-subject-${randomUUID()}`,
      fallback: {
        outcome: `case-lifecycle-store-unregistered-outcome-${randomUUID()}`,
        referral: { action: `case-lifecycle-store-unregistered-action-${randomUUID()}`, recipient: `case-lifecycle-store-unregistered-recipient-${randomUUID()}` },
      },
    };

    const rejection = store.createDraft(input);

    await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
    const { rows } = await pool.query('SELECT slug FROM cases WHERE slug = $1', [slug]);
    expect(rows).toEqual([]);
  },
);

it(
  'leaves no hypothesis-revision behind when one of its own collects violates a real foreign key on an unregistered concept',
  async () => {
    const slug = `case-lifecycle-store-atomic-revision-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const concept = await freshConcept();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const rejection = store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [concept, `case-lifecycle-store-unregistered-concept-${randomUUID()}`],
      resolution: aResolution(glossary),
    });

    await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
    const { rows } = await pool.query('SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
    expect(rows).toEqual([]);
  },
);

it(
  "answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes — " +
    'current_state, version_count, last_updated, title, when_to_use and released_version — nothing more, ' +
    'for a case whose highest-numbered version is released',
  async () => {
    const slug = `case-catalog-shape-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, version);

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry && Object.keys(entry).sort()).toEqual(
      ['current_state', 'last_updated', 'released_version', 'slug', 'title', 'version_count', 'when_to_use'].sort(),
    );
  },
);

it(
  "reads an entry's title, when_to_use and released_version off the highest-numbered version whose " +
    'state is released, never off an earlier released version of the same case',
  async () => {
    const slug = `case-catalog-highest-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const firstReleased = await store.createDraft(
      aCreateDraftInput(slug, glossary, { title: 'First released title', when_to_use: 'First released use' }),
    );
    await store.release(slug, firstReleased);
    const secondReleased = await store.createDraft(
      aCreateDraftInput(slug, glossary, {
        title: 'Second released title',
        when_to_use: 'Second released use',
        source_version: firstReleased,
      }),
    );
    await store.release(slug, secondReleased);

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry).toMatchObject({
      title: 'Second released title',
      when_to_use: 'Second released use',
      released_version: secondReleased,
    });
  },
);

it(
  'carries none of title, when_to_use and released_version, each absent rather than null or empty, ' +
    'for a case currently holding no released version at all',
  async () => {
    const slug = `case-catalog-never-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry).toBeDefined();
    expect(entry).not.toHaveProperty('title');
    expect(entry).not.toHaveProperty('when_to_use');
    expect(entry).not.toHaveProperty('released_version');
  },
);

it(
  "carries the released version's own title, when_to_use and released_version, never the higher-numbered " +
    "draft's, when that case's highest-numbered version is a draft above a released one",
  async () => {
    const slug = `case-catalog-draft-above-released-fields-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const releasedVersion = await store.createDraft(
      aCreateDraftInput(slug, glossary, { title: 'Released title', when_to_use: 'Released use' }),
    );
    await store.release(slug, releasedVersion);
    await store.createDraft(
      aCreateDraftInput(slug, glossary, {
        title: 'Draft title',
        when_to_use: 'Draft use',
        source_version: releasedVersion,
      }),
    );

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry).toMatchObject({
      title: 'Released title',
      when_to_use: 'Released use',
      released_version: releasedVersion,
    });
  },
);

it(
  "reads an entry's current_state and last_updated off the case's highest-numbered version whatever its " +
    "own state, even though that same case's released fields still come from the earlier released version",
  async () => {
    const slug = `case-catalog-draft-above-released-latest-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const releasedVersion = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.release(slug, releasedVersion);
    await store.createDraft(
      aCreateDraftInput(slug, glossary, { authored_at: '2024-06-01T00:00:00.000Z', source_version: releasedVersion }),
    );

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry).toMatchObject({ current_state: 'draft', last_updated: '2024-06-01T00:00:00.000Z' });
  },
);

it("counts an entry's version_count as the number of versions that case currently holds, across every state", async () => {
  const slug = `case-catalog-version-count-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.release(slug, version1);
  const version2 = await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version1 }));
  await store.release(slug, version2);
  await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version2 }));

  const limit = await generousCasesPageLimit();
  const page = await store.listCases({ offset: 0, limit });

  const entry = page.data.find((item) => item.slug === slug);
  expect(entry?.version_count).toBe(3);
});

it('still shows a case currently holding no version as its own entry in the page', async () => {
  const slug = `case-catalog-zero-version-present-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.discard(slug, version);

  const limit = await generousCasesPageLimit();
  const page = await store.listCases({ offset: 0, limit });

  const entry = page.data.find((item) => item.slug === slug);
  expect(entry).toBeDefined();
});

it(
  'gives version_count 0 and carries neither current_state nor last_updated for a case currently holding no ' +
    'version at all',
  async () => {
    const slug = `case-catalog-zero-version-shape-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.discard(slug, version);

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const entry = page.data.find((item) => item.slug === slug);
    expect(entry?.version_count).toBe(0);
    expect(entry).not.toHaveProperty('current_state');
    expect(entry).not.toHaveProperty('last_updated');
  },
);

it('answers a case exactly once in the page, however many versions it currently holds', async () => {
  const slug = `case-catalog-no-duplicate-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version1 = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.release(slug, version1);
  const version2 = await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version1 }));
  await store.release(slug, version2);
  await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version2 }));

  const limit = await generousCasesPageLimit();
  const page = await store.listCases({ offset: 0, limit });

  expect(page.data.filter((item) => item.slug === slug)).toHaveLength(1);
});

it("leaves the page's total the number of cases currently held, unaffected by how many versions any case holds", async () => {
  const slugWithOneVersion = `case-catalog-total-one-${randomUUID()}`;
  const slugWithSeveralVersions = `case-catalog-total-several-${randomUUID()}`;
  slugsWrittenByThisTest.push(slugWithOneVersion, slugWithSeveralVersions);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const totalBefore = (await store.listCases({ offset: 0, limit: 1 })).total;

  await store.createDraft(aCreateDraftInput(slugWithOneVersion, glossary));
  const version1 = await store.createDraft(aCreateDraftInput(slugWithSeveralVersions, glossary));
  await store.release(slugWithSeveralVersions, version1);
  const version2 = await store.createDraft(aCreateDraftInput(slugWithSeveralVersions, glossary, { source_version: version1 }));
  await store.release(slugWithSeveralVersions, version2);
  await store.createDraft(aCreateDraftInput(slugWithSeveralVersions, glossary, { source_version: version2 }));

  const totalAfter = (await store.listCases({ offset: 0, limit: 1 })).total;

  expect(totalAfter - totalBefore).toBe(2);
});

it(
  'answers the page in ascending slug order, the same order the offset and limit selected before the ' +
    'summary fields were derived, regardless of the order the cases were created in',
  async () => {
    const base = randomUUID();
    const slugA = `case-catalog-order-${base}-a`;
    const slugB = `case-catalog-order-${base}-b`;
    const slugC = `case-catalog-order-${base}-c`;
    slugsWrittenByThisTest.push(slugA, slugB, slugC);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slugC, glossary));
    await store.createDraft(aCreateDraftInput(slugA, glossary));
    await store.createDraft(aCreateDraftInput(slugB, glossary));

    const limit = await generousCasesPageLimit();
    const page = await store.listCases({ offset: 0, limit });

    const ours = page.data.filter((item) => item.slug === slugA || item.slug === slugB || item.slug === slugC);
    expect(ours.map((item) => item.slug)).toEqual([slugA, slugB, slugC]);
  },
);

it(
  "carries the highest revision number a hypothesis currently holds, once it holds more than one",
  async () => {
    const slug = `case-lifecycle-store-highest-revision-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revisionInput = () => ({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [] as string[],
      resolution: aResolution(glossary),
    });
    const first = await store.insertHypothesisRevision(revisionInput());
    const second = await store.insertHypothesisRevision(revisionInput());

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(first).toBeLessThan(second);
    expect(state.revision).toBe(second);
  },
);

it(
  'says a hypothesis holds no revision at all, when the case has never originated it',
  async () => {
    const slug = `case-lifecycle-store-highest-revision-never-originated-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const state = await store.readHighestRevisionReleaseState(slug, 'never-originated');

    expect(state.revision).toBeUndefined();
  },
);

it(
  'carries no state field at all for a hypothesis holding no revision — never defaulting it to a state that would route the write side onto the overwrite branch for a hypothesis that must instead create revision 1',
  async () => {
    const slug = `case-lifecycle-store-highest-revision-no-state-field-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));

    const state = await store.readHighestRevisionReleaseState(slug, 'never-originated');

    expect(state).not.toHaveProperty('state');
  },
);

it(
  'answers { revision: undefined } rather than raising, for a slug naming no case at all',
  async () => {
    const store = new RelationalCaseStore(pool);
    const slug = `case-lifecycle-store-highest-revision-no-case-${randomUUID()}`;

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(state).toEqual({ revision: undefined });
  },
);

it(
  "carries the highest revision's own state as draft still, even once the case version that pins it moves to released state — releasing a case version never alters the hypothesis-revision's own state column",
  async () => {
    const slug = `case-lifecycle-store-highest-revision-released-version-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    await store.release(slug, version);

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(state).toEqual({ revision, state: 'draft' });
  },
);

it(
  "carries the highest revision's own state as draft when only a case version in draft state pins it",
  async () => {
    const slug = `case-lifecycle-store-highest-revision-draft-only-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(state).toEqual({ revision, state: 'draft' });
  },
);

it(
  "carries the highest revision's own state, ignoring which revision a released case version's manifest pins — a released case version referencing only a lower revision of the same hypothesis leaves the freshly inserted highest revision reading its own default draft state",
  async () => {
    const slug = `case-lifecycle-store-highest-revision-lower-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const lowerRevision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision: lowerRevision, position: 1 });
    await store.release(slug, version);
    await store.createDraft(aCreateDraftInput(slug, glossary, { source_version: version }));
    const highestRevision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a later criterion',
      collects: [],
      resolution: aResolution(glossary),
    });

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(highestRevision).toBeGreaterThan(lowerRevision);
    expect(state).toEqual({ revision: highestRevision, state: 'draft' });
  },
);

it(
  "carries the highest revision's own state as released once that row is updated directly, with no case version anywhere referencing it — this read never joins to case_version_hypotheses or case_versions at all",
  async () => {
    const slug = `case-lifecycle-store-highest-revision-own-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await pool.query(
      "UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3",
      [slug, 'a-hypothesis', revision],
    );

    const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis');

    expect(state).toEqual({ revision, state: 'released' });
  },
);

it("overwrites a revision's content while leaving its own revision number exactly as it was before", async () => {
  const slug = `case-lifecycle-store-overwrite-number-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data.map((item) => item.revision)).toEqual([revision]);
});

it("answers the replacement's own criterion and resolution, once that revision is read back after the overwrite", async () => {
  const slug = `case-lifecycle-store-overwrite-content-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const newGlossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(newGlossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data).toEqual([{ revision, criterion: 'the replaced criterion', collects: [], resolution: aResolution(newGlossary), state: 'draft' }]);
});

it("answers exactly the concepts the replacement carried, once that revision's collects are read back after the overwrite", async () => {
  const slug = `case-lifecycle-store-overwrite-collects-added-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const [conceptA, conceptB] = await Promise.all([freshConcept(), freshConcept()]);
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [conceptA, conceptB],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data[0]?.collects).toEqual([conceptA, conceptB].sort());
});

it('answers none of the concepts the revision collected before the replacement, once the replacement drops them all', async () => {
  const slug = `case-lifecycle-store-overwrite-collects-dropped-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const [conceptA, conceptB] = await Promise.all([freshConcept(), freshConcept()]);
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [conceptA, conceptB],
    resolution: aResolution(glossary),
  });

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data[0]?.collects).toEqual([]);
});

it('leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and no fewer', async () => {
  const slug = `case-lifecycle-store-overwrite-count-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revisionInput = () => ({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: [] as string[],
    resolution: aResolution(glossary),
  });
  const first = await store.insertHypothesisRevision(revisionInput());
  const second = await store.insertHypothesisRevision(revisionInput());

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision: first,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data.map((item) => item.revision)).toEqual([second, first]);
  expect(page.total).toBe(2);
});

it("leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite assigns no revision number the hypothesis had already assigned elsewhere", async () => {
  const slug = `case-lifecycle-store-overwrite-no-collision-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revisionInput = (criterion: string) => ({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion,
    collects: [] as string[],
    resolution: aResolution(glossary),
  });
  const first = await store.insertHypothesisRevision(revisionInput('first criterion'));
  const second = await store.insertHypothesisRevision(revisionInput('second criterion'));

  await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision: first,
    criterion: 'first criterion replaced',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data).toEqual([
    { revision: second, criterion: 'second criterion', collects: [], resolution: aResolution(glossary), state: 'draft' },
    { revision: first, criterion: 'first criterion replaced', collects: [], resolution: aResolution(glossary), state: 'draft' },
  ]);
});

it('resolves the overwrite with undefined rather than echoing back a revision number the way inserting one does', async () => {
  const slug = `case-lifecycle-store-overwrite-returns-void-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const result = await store.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  expect(result).toBeUndefined();
});

it('performs the overwrite through the IHypothesisRevisionOverwrite port alone, without needing the rest of ICaseStore', async () => {
  const slug = `case-lifecycle-store-overwrite-port-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const overwriter: IHypothesisRevisionOverwrite = store;
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  await overwriter.overwriteHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    revision,
    criterion: 'the replaced criterion',
    collects: [],
    resolution: aResolution(glossary),
  });

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data[0]?.criterion).toBe('the replaced criterion');
});

it('resolves without raising, leaving no new row behind, when the named revision does not exist for that hypothesis', async () => {
  const slug = `case-lifecycle-store-overwrite-absent-revision-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'a-hypothesis',
    criterion: 'the original criterion',
    collects: [],
    resolution: aResolution(glossary),
  });
  const neverHeldRevision = revision + 1;

  await expect(
    store.overwriteHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      revision: neverHeldRevision,
      criterion: 'a criterion nothing should have stored',
      collects: [],
      resolution: aResolution(glossary),
    }),
  ).resolves.toBeUndefined();

  const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
  expect(page.data.map((item) => item.revision)).toEqual([revision]);
});

it(
  "does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even " +
    "though a released case version's manifest still references that revision",
  async () => {
    const slug = `case-lifecycle-store-overwrite-draft-referenced-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'the original criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    await store.release(slug, version);

    await store.overwriteHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      revision,
      criterion: 'a criterion the manifest reference alone should not have refused',
      collects: [],
      resolution: aResolution(glossary),
    });

    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });
    expect(page.data[0]?.criterion).toBe('a criterion the manifest reference alone should not have refused');
  },
);

it(
  'refuses an overwrite attempt against a revision whose own state is released, through the same typed ' +
    "ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's manifest " +
    'has ever referenced that revision',
  async () => {
    const slug = `case-lifecycle-store-overwrite-released-own-state-unreferenced-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const store = new RelationalCaseStore(pool);
    await store.createDraft(aCreateDraftInput(slug, glossary));
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'the original criterion',
      collects: [],
      resolution: aResolution(glossary),
    });
    await pool.query(
      "UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3",
      [slug, 'a-hypothesis', revision],
    );

    const rejection = store.overwriteHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      revision,
      criterion: "a criterion the revision's own released state should have refused",
      collects: [],
      resolution: aResolution(glossary),
    });

    await expect(rejection).rejects.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError);
    const caught = await rejection.catch((error: unknown) => error);
    expect(statusForError(caught)).toBe(409);
  },
);
