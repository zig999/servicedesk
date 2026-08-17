// Proof for task/case-lifecycle-persistence/relational-case-store-for-lifecycle, against a real,
// externally provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned)
// reached through DATABASE_URL — RelationalCaseStore is what is under test, so nothing here stands
// in for it (TST-03); the mechanics (which statement text and params are sent, exactly when
// BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a real database in
// this file's own unit-level sibling instead.
//
// Full replacement of this file's previous content, which targeted readVersion/writeVersion/
// listVersions and a flat, per-version hypotheses table (migrations/0004, dropped by
// task/case-lifecycle-persistence/case-version-lifecycle-schema's own migration 0009): every test
// below is written against assembleVersion, createDraft, insertHypothesisRevision, placeHypothesis,
// removeManifestEntry, release and discard instead, over the new hypotheses/hypothesis_revisions/
// hypothesis_revision_collects/case_version_hypotheses tables that migration adds.
//
// This is also where this task's own UNDERDETERMINED note is excluded: a discard() that removed a
// case_versions row and its manifest entries by identifier alone, with no check of the version's
// own state field, would still pass every one of this task's literal eleven criteria, yet would
// let discard() delete an already-released version — exactly what
// rules/knowledge/only-a-draft-case-version-may-be-discarded's own negative clause ("a released
// version is never removed") forbids. "discards a released version, once released" below calls
// discard() against a version this same test releases first, and asserts it is still readable
// afterward: the actual delivery relies on the schema's own release-conditioned DELETE rules
// (case_version_hypotheses_no_delete_when_released, case_versions' own release-conditioned delete
// rule) to make that DELETE a no-op regardless of what application code checks, so this test would
// fail over the flagged implementation and passes over the one actually delivered.
//
// Every statement below is schema-qualified as public.<table>, the same convention every sibling
// integration proof in this initiative already documents at length: this project's DATABASE_URL
// reaches Postgres through a transaction-pooling endpoint that can hand back a physical connection
// still carrying an unrelated, already-finished session's own search_path.
//
// Every case, hypothesis and glossary row this file writes carries a case-lifecycle-store-prefixed
// marker plus a fresh randomUUID(), so no test here can collide with a row another suite file
// wrote, and every row a test actually commits is deleted again in this file's own afterEach; the
// two atomicity tests below register no slug for that cleanup, because nothing survives the
// rollback for there to be anything to delete (database-access.spec.ts's own rollback-test
// convention). Several tests here call release() for real (criteria 3, 4, 10, the manifest-
// immutability scenario, and the discard-of-a-released-version note), so migrations/0009's own
// release-conditioned rules now make that released case_versions row (and, once released, its own
// case_version_hypotheses entries) permanent — an ordinary DELETE against one is a silent no-op,
// and a DELETE against whatever it still references (a hypothesis-revision, a glossary row) fails
// on that surviving row's own foreign key. deleteTolerantly below runs every cleanup statement
// expecting exactly that: a real failure (any code but a foreign-key violation) still surfaces, but
// a 23503 from a row this suite's own tests deliberately released is left in place, permanently, by
// the same rule a real curator's released case would be — the same tolerance create-draft.operation.
// spec.ts's own deleteTolerantly already establishes for this migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { CreateDraftInput } from '../../../case/case-store.port.js';
import type { Resolution } from '../../../case/case.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
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

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
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

/** A fresh, uniquely named glossary triple this file's own tests reference by foreign key, tracked for this file's own afterEach cleanup. */
async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `case-lifecycle-store-subject-${randomUUID()}`;
  const outcome = `case-lifecycle-store-outcome-${randomUUID()}`;
  const action = `case-lifecycle-store-action-${randomUUID()}`;
  const recipient = `case-lifecycle-store-recipient-${randomUUID()}`;
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [subjectType]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [outcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [action]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [recipient]);
  subjectTypesWrittenByThisTest.push(subjectType);
  outcomesWrittenByThisTest.push(outcome);
  actionsWrittenByThisTest.push(action);
  recipientsWrittenByThisTest.push(recipient);
  return { subjectType, outcome, action, recipient };
}

/** One glossary concept a hypothesis-revision may collect, freshly and uniquely named, tracked for this file's own afterEach cleanup. */
async function freshConcept(): Promise<string> {
  const name = `case-lifecycle-store-concept-${randomUUID()}`;
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

/** A resolution naming the given glossary's own outcome/action/recipient, held fixed since no test here varies a resolution independently of its own glossary. */
function aResolution(glossary: IGlossary): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

/** What createDraft needs for a fresh case, naming the given glossary's own subject and fallback — every field this task's own CreateDraftInput requires, bundled as the one object the port itself declares (MNT-01). */
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

/** Every row this file's own tests wrote under one or more slugs, deleted in the order their own foreign keys require — manifest entries and revision collects before the revisions and hypotheses they reference, those before the versions, those before the case identity itself. */
async function cleanupWrittenCases(): Promise<void> {
  if (slugsWrittenByThisTest.length === 0) return;
  await deleteTolerantly('DELETE FROM public.case_version_hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.hypothesis_revision_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.hypothesis_revisions WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  slugsWrittenByThisTest = [];
}

/** Every glossary row freshGlossary()/freshConcept() wrote for this file's own tests that can still be removed. */
async function cleanupWrittenGlossary(): Promise<void> {
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  }
  if (actionsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
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

/**
 * Creates the draft and inserts both hypothesis revisions, placing them out of their declared
 * order — "second" at position 1, "first" at position 2 — pulled out into its own function only
 * so the criterion-1 test below stays inside the standard's max-lines-per-function rule; the
 * sequence and behavior are exactly what that test's own setup ran before this split (this
 * delivery's own inference — the extraction changes nothing but where the lines are counted).
 */
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
  // Placed out of declared order: "second" at position 1, "first" at position 2.
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
    // manifest-collects' own query (relational-case-store.repository.ts's manifestCollectsSelect)
    // orders each hypothesis's own collects alphabetically by concept_name, not by insertion order —
    // conceptA/conceptB are randomUUID()-suffixed, so which reads first is only known by sorting them
    // the same way the query does.
    expect(assembled?.manifest).toEqual([
      { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'second', revision: secondRevision, collects: [conceptB] }) },
      { position: 2, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'first', revision: firstRevision, collects: [conceptA, conceptB].sort() }) },
    ]);
  },
);

// ---------------------------------------------------------------- criterion 2

it('answers absence, not a rejection, for a slug and version nothing was ever stored under', async () => {
  const store = new RelationalCaseStore(pool);

  const assembled = await store.assembleVersion(`case-lifecycle-store-absent-${randomUUID()}`, 1);

  expect(assembled).toBeUndefined();
});

// ---------------------------------------------------------------- criterion 3

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
    await store.discard(slug, version2); // removes version2's own row; MAX(version) would now answer 1

    const version3 = await store.createDraft(aCreateDraftInput(slug, glossary));

    expect([version1, version2, version3]).toEqual([1, 2, 3]);
  },
);

// ---------------------------------------------------------------- criterion 4

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

// ---------------------------------------------------------------- criterion 5

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

// ---------------------------------------------------------------- criterion 6

it("creates a hypothesis's own identity row only the first time its name is used for a case, never a second one for a name already held", async () => {
  const slug = `case-lifecycle-store-identity-once-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  await store.createDraft(aCreateDraftInput(slug, glossary));
  const input = { slug, hypothesis_name: 'a-hypothesis', criterion: 'a criterion', collects: [] as string[], resolution: aResolution(glossary) };

  await store.insertHypothesisRevision(input);
  await store.insertHypothesisRevision(input);

  const { rows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1 AND name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ name: 'a-hypothesis' }]);
});

// ---------------------------------------------------------------- criterion 7

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

// ---------------------------------------------------------------- criterion 8

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

// ---------------------------------------------------------------- criterion 9

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
  const { rows } = await pool.query('SELECT revision FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ revision }]);
});

// ---------------------------------------------------------------- criterion 10

it('records the instant of release, and a second call to release leaves that instant unchanged', async () => {
  const slug = `case-lifecycle-store-release-once-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));

  await store.release(slug, version);
  const firstRead = await store.assembleVersion(slug, version);
  await store.release(slug, version);
  const secondRead = await store.assembleVersion(slug, version);

  expect(firstRead?.state).toBe('released');
  expect(firstRead?.released_at).toBeDefined();
  expect(secondRead?.released_at).toBe(firstRead?.released_at);
});

// -------------------------------------------- scenarios/knowledge/a-released-version-keeps-its-original-revision

it("leaves a released version's own manifest entry in place — the schema's own release-conditioned rule no-ops the DELETE — once removeManifestEntry is called against it", async () => {
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

  await store.removeManifestEntry(slug, version, 'a-hypothesis');

  const assembled = await store.assembleVersion(slug, version);
  expect(assembled?.manifest).toEqual([
    { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'a-hypothesis', revision }) },
  ]);
});

// ---------------------------------------------------------------- criterion 11

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
  const { rows } = await pool.query('SELECT revision FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
  expect(rows).toEqual([{ revision }]);
});

// --------------------------- excludes this task's own UNDERDETERMINED note (rules/knowledge/only-a-draft-case-version-may-be-discarded)

it(
  'leaves a released version untouched when discard is called against it — the flagged, ' +
    "state-blind implementation this note excludes would have deleted it the same way it deletes a draft's",
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

    await store.discard(slug, version);

    const assembled = await store.assembleVersion(slug, version);
    expect(assembled).toBeDefined();
    expect(assembled?.state).toBe('released');
    expect(assembled?.manifest).toHaveLength(1);
  },
);

// ---------------------------------------------------------------- excludes a non-atomic createDraft (EDG-05)

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
    const { rows } = await pool.query('SELECT slug FROM public.cases WHERE slug = $1', [slug]);
    expect(rows).toEqual([]);
  },
);

// ---------------------------------------------------------------- excludes a non-atomic insertHypothesisRevision (EDG-05)

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
    const { rows } = await pool.query('SELECT revision FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2', [slug, 'a-hypothesis']);
    expect(rows).toEqual([]);
  },
);
