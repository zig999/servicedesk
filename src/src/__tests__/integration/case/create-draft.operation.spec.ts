// Proof for task/case-lifecycle-operations/create-draft-operation, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL, and against the real RelationalCaseStore behind it — CreateDraftOperation
// itself is a thin forwarder, so the behavior its own criteria describe (the version the case's own
// durable counter assigns, the at-most-one-draft refusal, and which version's manifest a new draft
// copies) is entirely the store's and the schema's, and nothing here stands in for either (TST-03).
//
// Every case, hypothesis and glossary row this file writes carries a create-draft-prefixed marker
// plus a fresh randomUUID(), so no test here can collide with a row another suite file wrote, and
// every row a test's own afterEach *can* remove, it does — in the order each table's own foreign
// keys require (case_version_hypotheses and hypothesis_revision_collects before hypothesis_revisions,
// before hypotheses, before case_versions, before cases). It cannot remove everything, and that is
// not a leak this file could close: migrations/0009's own release-conditioned RULEs make a released
// case_versions row (and, once released, its own case_version_hypotheses entries) permanent —
// rules/knowledge/a-case-version-is-written-once and only-a-draft-case-version-may-be-discarded, in
// the schema itself rather than re-checked here — so an ordinary DELETE against one is a silent
// no-op, and a DELETE against whatever it still references (a hypothesis-revision, a hypothesis
// identity, the glossary row a released fallback names) fails on that surviving row's own foreign
// key. deleteTolerantly below runs every cleanup statement expecting exactly that: a real failure
// (any code but a foreign-key violation) still surfaces, but a 23503 from a row this suite's own
// tests deliberately released is left in place, permanently, by the same rule a real curator's
// released case would be.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CreateDraftInput } from '../../../case/case-store.port.js';
import { CreateDraftOperation } from '../../../case/create-draft.operation.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
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

/** Every glossary row one draft's fallback and every hypothesis-revision's own resolution references, under fresh, uniquely named rows tracked for this file's own afterEach cleanup. */
async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `create-draft-subject-${randomUUID()}`;
  const outcome = `create-draft-outcome-${randomUUID()}`;
  const action = `create-draft-action-${randomUUID()}`;
  const recipient = `create-draft-recipient-${randomUUID()}`;
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

/** One glossary concept a hypothesis-revision may collect, freshly and uniquely named, tracked for this file's own afterEach cleanup. */
async function freshConcept(): Promise<string> {
  const name = `create-draft-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

/** The one resolution every fallback and every hypothesis-revision below reuses, built from one glossary quadruple. */
function resolutionOf(glossary: IGlossary): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

/** One CreateDraftInput as create-draft's own caller would submit it, its title/when_to_use/authored_at held fixed since no test here varies them. */
function draftInputFor(slug: string, glossary: IGlossary, overrides: Partial<CreateDraftInput> = {}): CreateDraftInput {
  return {
    slug,
    title: 'A title',
    when_to_use: 'A use',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: glossary.subjectType,
    fallback: resolutionOf(glossary),
    ...overrides,
  };
}

interface IPlaceHypothesisOptions {
  readonly glossary: IGlossary;
  readonly slug: string;
  readonly version: number;
  readonly name: string;
  readonly criterion: string;
}

/** Originates one hypothesis-revision, freshly concepted, and places it at position 1 of the named version's own manifest — the shared setup every manifest-copy test below builds a released version's own content from. */
async function placeHypothesisOn(store: RelationalCaseStore, options: IPlaceHypothesisOptions): Promise<{ revision: number; concept: string }> {
  const concept = await freshConcept();
  const revision = await store.insertHypothesisRevision({
    slug: options.slug,
    hypothesis_name: options.name,
    criterion: options.criterion,
    collects: [concept],
    resolution: resolutionOf(options.glossary),
  });
  await store.placeHypothesis({ slug: options.slug, version: options.version, hypothesis_name: options.name, revision, position: 1 });
  return { revision, concept };
}

interface ITwoReleasedVersionsOptions {
  readonly store: RelationalCaseStore;
  readonly operation: CreateDraftOperation;
  readonly slug: string;
  readonly glossary: IGlossary;
}

/** A case holding two released versions with two distinct manifests — v1 holding "alpha", v2 (created by copying v1, then swapped) holding "beta" instead — so a source-version test can prove which one it actually copied. */
async function aCaseWithTwoReleasedVersions(options: ITwoReleasedVersionsOptions): Promise<{ v1Version: number; revisionAlpha: number; conceptAlpha: string }> {
  const { store, operation, slug, glossary } = options;
  const v1 = await operation.createDraft(draftInputFor(slug, glossary));
  const alpha = await placeHypothesisOn(store, { glossary, slug, version: v1.version, name: 'alpha', criterion: 'alpha criterion' });
  await store.release(slug, v1.version);

  const v2 = await operation.createDraft(draftInputFor(slug, glossary));
  await store.removeManifestEntry(slug, v2.version, 'alpha');
  await placeHypothesisOn(store, { glossary, slug, version: v2.version, name: 'beta', criterion: 'beta criterion' });
  await store.release(slug, v2.version);

  return { v1Version: v1.version, revisionAlpha: alpha.revision, conceptAlpha: alpha.concept };
}

const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard relational-case-store.repository.ts's own isConstraintViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected rather than a bug. */
async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

/** Every row this file's own tests wrote under a case slug that can still be removed, attempted child-first, in the order each table's own foreign keys require. */
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

/** Every glossary row freshGlossary()/freshConcept() wrote for this file's own tests that can still be removed. */
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

// ---------------------------------------------------------------- criterion 1

it('assigns a new draft a version number greater than every version the case has ever held, including one later discarded', async () => {
  const slug = `create-draft-never-reused-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);

  const first = await operation.createDraft(draftInputFor(slug, glossary));
  await store.release(slug, first.version);
  const second = await operation.createDraft(draftInputFor(slug, glossary));
  await store.discard(slug, second.version);
  const third = await operation.createDraft(draftInputFor(slug, glossary));

  expect(third.version).toBeGreaterThan(first.version);
  expect(third.version).toBeGreaterThan(second.version);
});

// ---------------------------------------------------------------- criterion 2

it('refuses a second draft creation while the case already holds one open, naming that a draft already exists', async () => {
  const slug = `create-draft-already-open-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);
  await operation.createDraft(draftInputFor(slug, glossary));

  const rejection = operation.createDraft(draftInputFor(slug, glossary, { title: 'A second attempt' }));

  await expect(rejection).rejects.toBeInstanceOf(CaseAlreadyHasDraftError);
  await expect(rejection).rejects.toMatchObject({ context: { slug } });
});

// ---------------------------------------------------------------- edge case: two draft creations against the same case at once

it('lets only one of two concurrent draft creations for the same case succeed, the other refused through CaseAlreadyHasDraftError', async () => {
  const slug = `create-draft-concurrent-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);

  const results = await Promise.allSettled([
    operation.createDraft(draftInputFor(slug, glossary)),
    operation.createDraft(draftInputFor(slug, glossary)),
  ]);

  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
  expect(rejected?.reason).toBeInstanceOf(CaseAlreadyHasDraftError);
});

// ---------------------------------------------------------------- criterion 3, empty case

it('creates a draft with an empty manifest when naming no source version and the case holds no released version yet', async () => {
  const slug = `create-draft-empty-manifest-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);

  const created = await operation.createDraft(draftInputFor(slug, glossary));
  const assembled = await store.assembleVersion(slug, created.version);

  expect(assembled?.manifest).toEqual([]);
});

// ---------------------------------------------------------------- criterion 3, latest released case

it("copies the case's own latest released version's manifest when a draft is created naming no source version", async () => {
  const slug = `create-draft-copies-latest-released-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);
  const released = await operation.createDraft(draftInputFor(slug, glossary));
  const { revision, concept } = await placeHypothesisOn(store, {
    glossary,
    slug,
    version: released.version,
    name: 'the-hypothesis',
    criterion: 'a criterion',
  });
  await store.release(slug, released.version);

  const secondDraft = await operation.createDraft(draftInputFor(slug, glossary));
  const assembled = await store.assembleVersion(slug, secondDraft.version);

  expect(assembled?.manifest).toEqual([
    { position: 1, hypothesis_revision: { hypothesis_name: 'the-hypothesis', revision, criterion: 'a criterion', collects: [concept], resolution: resolutionOf(glossary) } },
  ]);
});

// ---------------------------------------------------------------- criterion 4

it("copies the named historical version's own manifest instead of the case's latest released version, when a draft is created naming a source version", async () => {
  const slug = `create-draft-historical-source-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const operation = new CreateDraftOperation(store);
  const { v1Version, revisionAlpha, conceptAlpha } = await aCaseWithTwoReleasedVersions({ store, operation, slug, glossary });

  const v3 = await operation.createDraft(draftInputFor(slug, glossary, { source_version: v1Version }));
  const assembled = await store.assembleVersion(slug, v3.version);

  expect(assembled?.manifest).toEqual([
    { position: 1, hypothesis_revision: { hypothesis_name: 'alpha', revision: revisionAlpha, criterion: 'alpha criterion', collects: [conceptAlpha], resolution: resolutionOf(glossary) } },
  ]);
});
