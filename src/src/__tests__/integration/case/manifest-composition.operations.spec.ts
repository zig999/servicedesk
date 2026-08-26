// Proof for task/case-lifecycle-operations/manifest-composition-operations, against a real,
// externally provisioned PostgreSQL database reached through DATABASE_URL — RelationalCaseStore is
// the real collaborator behind ICaseStore here, so nothing in this file stands in for the store or
// for placeHypothesis/removeHypothesis themselves (TST-03); they are what is under test.
//
// Every case this file writes carries a manifest-ops-prefixed slug plus a fresh randomUUID(), so no
// test here can collide with a row another suite file wrote, and every row a test commits is deleted
// again in this file's own afterEach, in the order case_version_hypotheses,
// hypothesis_revision_collects, hypothesis_revisions, hypotheses, case_versions, cases — the order
// their own foreign keys require — the same convention relational-case-store.repository.spec.ts and
// case-version-lifecycle-schema.spec.ts already keep.
//
// Two tests below (criterion 3, place and remove) call store.release() for real, so
// migrations/0009's own release-conditioned rules now make that released case_versions row (and its
// own case_version_hypotheses entry) permanent — an ordinary DELETE against one is a silent no-op,
// and a DELETE against whatever it still references (a hypothesis-revision, a glossary row) fails on
// that surviving row's own foreign key. deleteTolerantly below runs every cleanup statement expecting
// exactly that — the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already
// establishes for this migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses it:
// (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts's
// loadEnv, because loadEnv refuses unless every other application variable is configured too, which
// this file has no use for.
//
// Setup for every test below uses this module's own placeHypothesis to seed a manifest entry
// (rather than the store's own placeHypothesis primitive directly), so the same draft-state and
// occupied-position guards this suite proves also run during setup — no test here depends on a
// primitive this module never exercises.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { placeHypothesis, removeHypothesis } from '../../../case/manifest-composition.operations.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';
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
let store: RelationalCaseStore;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
  store = new RelationalCaseStore(pool);
});

afterAll(async () => {
  await pool.end();
});

/** Every glossary row a fresh case's fallback and every hypothesis's own resolution reference, uniquely named and tracked for this file's own afterEach cleanup. */
async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `manifest-ops-subject-${randomUUID()}`;
  const outcome = `manifest-ops-outcome-${randomUUID()}`;
  const action = `manifest-ops-action-${randomUUID()}`;
  const recipient = `manifest-ops-recipient-${randomUUID()}`;
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
  const name = `manifest-ops-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

/** A fresh case, claimed together with its first draft version, through this store's own createDraft. */
async function aFreshDraftCase(glossary: IGlossary): Promise<{ slug: string; version: number }> {
  const slug = `manifest-ops-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const version = await store.createDraft({
    slug,
    title: 'A title',
    when_to_use: 'A use',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: glossary.subjectType,
    fallback: { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } },
  });
  return { slug, version };
}

interface IPlaceOptions {
  readonly slug: string;
  readonly version: number;
  readonly position: number;
  readonly glossary: IGlossary;
  readonly concept: string;
}

/** Originates one fresh hypothesis-revision and adopts it into the named draft's manifest through this module's own placeHypothesis — the SUT seeds itself rather than a store primitive it does not exercise. */
async function placeFreshHypothesis(options: IPlaceOptions): Promise<{ hypothesisName: string; revision: number }> {
  const hypothesisName = `hypothesis-${randomUUID()}`;
  const revision = await store.insertHypothesisRevision({
    slug: options.slug,
    hypothesis_name: hypothesisName,
    criterion: 'A representative criterion.',
    collects: [options.concept],
    resolution: { outcome: options.glossary.outcome, referral: { action: options.glossary.action, recipient: options.glossary.recipient } },
  });
  await placeHypothesis(store, { slug: options.slug, version: options.version, hypothesis_name: hypothesisName, revision, position: options.position });
  return { hypothesisName, revision };
}

async function manifestOf(slug: string, version: number) {
  const assembled = await store.assembleVersion(slug, version);
  return assembled?.manifest ?? [];
}

async function revisionRowsFor(slug: string, hypothesisNames: readonly string[]) {
  const { rows } = await pool.query<{ hypothesis_name: string; revision: number }>(
    'SELECT hypothesis_name, revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = ANY($2) ORDER BY hypothesis_name, revision',
    [slug, hypothesisNames],
  );
  return rows;
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
  if (conceptsWrittenByThisTest.length > 0) await deleteTolerantly('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  if (subjectTypesWrittenByThisTest.length > 0) await deleteTolerantly('DELETE FROM subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  if (outcomesWrittenByThisTest.length > 0) await deleteTolerantly('DELETE FROM outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  if (actionsWrittenByThisTest.length > 0) await deleteTolerantly('DELETE FROM actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  if (recipientsWrittenByThisTest.length > 0) await deleteTolerantly('DELETE FROM recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
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

it('places a hypothesis-revision at a position not yet occupied in a draft manifest', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);

  const { hypothesisName, revision } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });

  const manifest = await manifestOf(slug, version);
  expect(manifest).toEqual([{ position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: hypothesisName, revision }) }]);
});

// ---------------------------------------------------------------- criterion 2

it('refuses placing a hypothesis-revision at a position already occupied by a different hypothesis', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  const revision = await store.insertHypothesisRevision({ slug, hypothesis_name: 'a-second-hypothesis', criterion: 'A criterion.', collects: [concept], resolution: { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } } });

  const attempt = placeHypothesis(store, { slug, version, hypothesis_name: 'a-second-hypothesis', revision, position: 1 });

  await expect(attempt).rejects.toBeInstanceOf(ManifestPositionOccupiedError);
  await expect(attempt).rejects.toMatchObject({ context: { slug, version, position: 1 } });
});

// ---------------------------------------------------------------- boundary of criterion 2: occupied by itself is not "occupied"

it('does not refuse re-placing the same hypothesis at the position it already occupies, adopting a new revision there instead', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName, revision: firstRevision } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  const secondRevision = await store.insertHypothesisRevision({ slug, hypothesis_name: hypothesisName, criterion: 'A revised criterion.', collects: [concept], resolution: { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } } });

  await expect(placeHypothesis(store, { slug, version, hypothesis_name: hypothesisName, revision: secondRevision, position: 1 })).resolves.toBeUndefined();

  const manifest = await manifestOf(slug, version);
  expect(manifest).toEqual([{ position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: hypothesisName, revision: secondRevision }) }]);
  expect(secondRevision).not.toBe(firstRevision);
});

// ---------------------------------------------------------------- criterion 3 (place)

it('refuses placing a hypothesis-revision against a version that is not in draft state', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  await store.release(slug, version);
  const revision = await store.insertHypothesisRevision({ slug, hypothesis_name: 'a-late-hypothesis', criterion: 'A criterion.', collects: [concept], resolution: { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } } });

  const attempt = placeHypothesis(store, { slug, version, hypothesis_name: 'a-late-hypothesis', revision, position: 2 });

  await expect(attempt).rejects.toBeInstanceOf(CaseVersionNotDraftError);
  await expect(attempt).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
});

// ---------------------------------------------------------------- criterion 3 (remove)

it('refuses removing a manifest entry against a version that is not in draft state', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  await store.release(slug, version);

  const attempt = removeHypothesis(store, { slug, version, hypothesis_name: hypothesisName });

  await expect(attempt).rejects.toBeInstanceOf(CaseVersionNotDraftError);
  await expect(attempt).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
});

// ---------------------------------------------------------------- criterion 4

it('refuses removing the last remaining entry of a draft manifest, naming that the manifest would hold no hypothesis', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });

  const attempt = removeHypothesis(store, { slug, version, hypothesis_name: hypothesisName });

  await expect(attempt).rejects.toBeInstanceOf(ManifestWouldHoldNoHypothesisError);
  await expect(attempt).rejects.toMatchObject({ context: { slug, version } });
  expect(await manifestOf(slug, version)).toHaveLength(1);
});

// ---------------------------------------------------------------- criterion 5

it('never deletes the hypothesis-revision a removed manifest entry referenced', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName: first, revision: firstRevision } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  await placeFreshHypothesis({ slug, version, position: 2, glossary, concept });

  await removeHypothesis(store, { slug, version, hypothesis_name: first });

  expect(await manifestOf(slug, version)).toHaveLength(1);
  expect(await revisionRowsFor(slug, [first])).toEqual([{ hypothesis_name: first, revision: firstRevision }]);
});

// ---------------------------------------------------------------- criterion 6

it('swaps two placed hypotheses onto each other\'s position, through this module\'s own place and remove calls, creating no new hypothesis-revision for either', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName: first, revision: firstRevision } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  const { hypothesisName: second, revision: secondRevision } = await placeFreshHypothesis({ slug, version, position: 2, glossary, concept });
  const beforeSwap = await revisionRowsFor(slug, [first, second]);

  // A direct two-call swap is refused (see the sibling test below); reaching the swapped
  // arrangement through this module's own operations requires freeing one position first.
  await removeHypothesis(store, { slug, version, hypothesis_name: second });
  await placeHypothesis(store, { slug, version, hypothesis_name: first, revision: firstRevision, position: 2 });
  await placeHypothesis(store, { slug, version, hypothesis_name: second, revision: secondRevision, position: 1 });

  const manifest = await manifestOf(slug, version);
  expect(manifest.map((entry) => [entry.position, entry.hypothesis_revision.hypothesis_name])).toEqual([[1, second], [2, first]]);
  expect(await revisionRowsFor(slug, [first, second])).toEqual(beforeSwap);
});

// ---------------------------------------------------------------- contested evidence for criterion 6's documented mechanism

it("refuses placing a hypothesis directly at a position a different, still-placed hypothesis occupies, so a bare two-call swap (place each hypothesis straight at the other's still-occupied position) is refused rather than reordering them", async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const { hypothesisName: first, revision: firstRevision } = await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });
  await placeFreshHypothesis({ slug, version, position: 2, glossary, concept });

  const attempt = placeHypothesis(store, { slug, version, hypothesis_name: first, revision: firstRevision, position: 2 });

  await expect(attempt).rejects.toBeInstanceOf(ManifestPositionOccupiedError);
});

// ---------------------------------------------------------------- inference: a hypothesis name absent from the manifest is never the ground for refusing an emptied manifest

it('does not refuse removing a hypothesis name that is not part of the manifest, even where the manifest holds only one entry', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  await placeFreshHypothesis({ slug, version, position: 1, glossary, concept });

  await expect(removeHypothesis(store, { slug, version, hypothesis_name: 'never-placed' })).resolves.toBeUndefined();

  expect(await manifestOf(slug, version)).toHaveLength(1);
});

// ---------------------------------------------------------------- edge case: absent version, shared by both operations' own draft-state guard

it('refuses placing a hypothesis-revision against a version that was never stored', async () => {
  const slug = `manifest-ops-absent-${randomUUID()}`;

  const attempt = placeHypothesis(store, { slug, version: 1, hypothesis_name: 'irrelevant', revision: 1, position: 1 });

  await expect(attempt).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(attempt).rejects.toMatchObject({ context: { slug, version: 1 } });
});

// ---------------------------------------------------------------- edge case: two placements racing for the same free position

it('lets only one of two concurrent placements to the same free position succeed, the other refused through ManifestPositionOccupiedError', async () => {
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const { slug, version } = await aFreshDraftCase(glossary);
  const resolution = { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
  const revisionA = await store.insertHypothesisRevision({ slug, hypothesis_name: 'racer-a', criterion: 'A criterion.', collects: [concept], resolution });
  const revisionB = await store.insertHypothesisRevision({ slug, hypothesis_name: 'racer-b', criterion: 'A criterion.', collects: [concept], resolution });

  const results = await Promise.allSettled([
    placeHypothesis(store, { slug, version, hypothesis_name: 'racer-a', revision: revisionA, position: 5 }),
    placeHypothesis(store, { slug, version, hypothesis_name: 'racer-b', revision: revisionB, position: 5 }),
  ]);

  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
  expect(rejected?.reason).toBeInstanceOf(ManifestPositionOccupiedError);
});
