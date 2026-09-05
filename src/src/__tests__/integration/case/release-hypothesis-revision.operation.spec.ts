import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import { ReleaseHypothesisRevisionOperation } from '../../../case/release-hypothesis-revision.operation.js';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';
import { ReleasedHypothesisRevisionNotAlterableError } from '../../../errors/released-hypothesis-revision-not-alterable.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

interface IVocabulary {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
}

const FOREIGN_KEY_VIOLATION = '23503';

let pool: DatabaseConnection;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];

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

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

function freshVocabulary(): IVocabulary {
  const id = randomUUID();
  return {
    subjectType: `release-hypothesis-revision-subject-${id}`,
    outcome: `release-hypothesis-revision-outcome-${id}`,
    action: `release-hypothesis-revision-action-${id}`,
    recipient: `release-hypothesis-revision-recipient-${id}`,
  };
}

function resolutionOf(vocabulary: IVocabulary): Resolution {
  return { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } };
}

async function persistGlossary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [vocabulary.subjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [vocabulary.outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [vocabulary.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [vocabulary.recipient]);
  subjectTypesWrittenByThisTest.push(vocabulary.subjectType);
  outcomesWrittenByThisTest.push(vocabulary.outcome);
  actionsWrittenByThisTest.push(vocabulary.action);
  recipientsWrittenByThisTest.push(vocabulary.recipient);
}

interface IDraftDescription {
  readonly slug: string;
  readonly subjectType: string;
  readonly resolution: Resolution;
}

async function createDraftVersion(store: RelationalCaseStore, description: IDraftDescription): Promise<number> {
  return store.createDraft({
    slug: description.slug,
    title: 'A case',
    when_to_use: "when a curator asks release to move a hypothesis-revision on its own terms",
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: description.subjectType,
    fallback: description.resolution,
  });
}

interface ICaseVersionKey {
  readonly slug: string;
  readonly version: number;
}

interface IHypothesisDescription {
  readonly name: string;
  readonly resolution: Resolution;
}

async function insertUnplacedRevision(store: RelationalCaseStore, slug: string, hypothesis: IHypothesisDescription): Promise<number> {
  return store.insertHypothesisRevision({
    slug,
    hypothesis_name: hypothesis.name,
    criterion: `a criterion for ${hypothesis.name}`,
    collects: [],
    resolution: hypothesis.resolution,
  });
}

interface IPlacedHypothesisDescription extends IHypothesisDescription {
  readonly position: number;
}

async function placeNewHypothesis(store: RelationalCaseStore, key: ICaseVersionKey, hypothesis: IPlacedHypothesisDescription): Promise<number> {
  const revision = await insertUnplacedRevision(store, key.slug, hypothesis);
  await store.placeHypothesis({ slug: key.slug, version: key.version, hypothesis_name: hypothesis.name, revision, position: hypothesis.position });
  return revision;
}

async function setCaseVersionStateDirectly(slug: string, version: number, state: string): Promise<void> {
  await pool.query('UPDATE case_versions SET state = $1 WHERE slug = $2 AND version = $3', [state, slug, version]);
}

function wireOperation(store: RelationalCaseStore): ReleaseHypothesisRevisionOperation {
  return new ReleaseHypothesisRevisionOperation(store);
}

async function cleanupCaseRows(): Promise<void> {
  if (slugsWrittenByThisTest.length === 0) return;
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
}

async function cleanupGlossaryRows(): Promise<void> {
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
}

afterEach(async () => {
  await cleanupCaseRows();
  await cleanupGlossaryRows();
  slugsWrittenByThisTest = [];
  subjectTypesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
});

it("moves a hypothesis-revision from draft to released, reading its own state back as released", async () => {
  const vocabulary = freshVocabulary();
  const slug = `release-hypothesis-revision-draft-to-released-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  await persistGlossary(vocabulary);
  const store = new RelationalCaseStore(pool);
  const resolution = resolutionOf(vocabulary);
  await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
  const revision = await insertUnplacedRevision(store, slug, { name: 'h1', resolution });
  const operation = wireOperation(store);

  await operation.releaseHypothesisRevision(slug, 'h1', revision);

  const state = await store.readHypothesisRevisionOwnState(slug, 'h1', revision);
  expect(state).toBe('released');
});

it(
  "refuses a further release against an already-released hypothesis-revision with this operation's own " +
    'HypothesisRevisionNotDraftAtReleaseError, leaving its own state exactly released',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-hypothesis-revision-already-released-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revision = await insertUnplacedRevision(store, slug, { name: 'h1', resolution });
    const operation = wireOperation(store);
    await operation.releaseHypothesisRevision(slug, 'h1', revision);

    const refusal = await operation.releaseHypothesisRevision(slug, 'h1', revision).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);
    const state = await store.readHypothesisRevisionOwnState(slug, 'h1', revision);
    expect(state).toBe('released');
  },
);

it('releases a hypothesis-revision that no case version manifest ever references, without refusing for that absence', async () => {
  const vocabulary = freshVocabulary();
  const slug = `release-hypothesis-revision-never-manifested-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  await persistGlossary(vocabulary);
  const store = new RelationalCaseStore(pool);
  const resolution = resolutionOf(vocabulary);
  await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
  const revision = await insertUnplacedRevision(store, slug, { name: 'h1', resolution });
  const operation = wireOperation(store);

  await expect(operation.releaseHypothesisRevision(slug, 'h1', revision)).resolves.toBeUndefined();

  const state = await store.readHypothesisRevisionOwnState(slug, 'h1', revision);
  expect(state).toBe('released');
});

it(
  "leaves the containing case version's own state and its manifest entry for the revision unchanged after " +
    'the revision is released',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-hypothesis-revision-manifest-untouched-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revision = await placeNewHypothesis(store, { slug, version }, { name: 'h1', resolution, position: 1 });
    const operation = wireOperation(store);
    const before = await store.assembleVersion(slug, version);

    await operation.releaseHypothesisRevision(slug, 'h1', revision);

    const after = await store.assembleVersion(slug, version);
    expect(after?.state).toBe(before?.state);
    expect(after?.manifest).toEqual(before?.manifest);
  },
);

it(
  "decides eligibility solely from the hypothesis-revision's own row, even where the containing case version " +
    "is already released, releasing the still-draft revision rather than reaching its manifest or version state",
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-hypothesis-revision-ignores-version-state-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revision = await placeNewHypothesis(store, { slug, version }, { name: 'h1', resolution, position: 1 });
    await setCaseVersionStateDirectly(slug, version, 'released');
    const operation = wireOperation(store);

    await expect(operation.releaseHypothesisRevision(slug, 'h1', revision)).resolves.toBeUndefined();

    const state = await store.readHypothesisRevisionOwnState(slug, 'h1', revision);
    expect(state).toBe('released');
  },
);

it(
  'refuses releasing a hypothesis-revision identity no row was ever stored for, with the same ' +
    'HypothesisRevisionNotDraftAtReleaseError as one that exists but is already released',
  async () => {
    const store = new RelationalCaseStore(pool);
    const operation = wireOperation(store);
    const slug = `release-hypothesis-revision-never-stored-${randomUUID()}`;

    const refusal = await operation.releaseHypothesisRevision(slug, 'a-never-stored-hypothesis', 1).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);
  },
);

it(
  "refuses overwriting a released hypothesis-revision's own content, the one other write path this codebase " +
    "exposes against that row, leaving its own state exactly released",
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-hypothesis-revision-terminal-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revision = await insertUnplacedRevision(store, slug, { name: 'h1', resolution });
    const operation = wireOperation(store);
    await operation.releaseHypothesisRevision(slug, 'h1', revision);

    const attemptedOverwrite = store
      .overwriteHypothesisRevision({ slug, hypothesis_name: 'h1', revision, criterion: 'a rewritten criterion', collects: [], resolution })
      .catch((error: unknown) => error);

    await expect(attemptedOverwrite).resolves.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError);
    const state = await store.readHypothesisRevisionOwnState(slug, 'h1', revision);
    expect(state).toBe('released');
  },
);
