import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import { ReleaseOperation } from '../../../case/release.operation.js';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { createCapabilityQuery, createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
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
  readonly otherSubjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly concept: string;
  readonly capabilityName: string;
}

const FOREIGN_KEY_VIOLATION = '23503';

let pool: DatabaseConnection;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];
let capabilityNamesWrittenByThisTest: string[] = [];

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
    subjectType: `release-operation-subject-${id}`,
    otherSubjectType: `release-operation-other-subject-${id}`,
    outcome: `release-operation-outcome-${id}`,
    action: `release-operation-action-${id}`,
    recipient: `release-operation-recipient-${id}`,
    concept: `release-operation-concept-${id}`,
    capabilityName: `release-operation-capability-${id}`,
  };
}

function resolutionOf(vocabulary: IVocabulary): Resolution {
  return { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } };
}

async function persistGlossary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1), ($2)', [vocabulary.subjectType, vocabulary.otherSubjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [vocabulary.outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [vocabulary.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [vocabulary.recipient]);
  subjectTypesWrittenByThisTest.push(vocabulary.subjectType, vocabulary.otherSubjectType);
  outcomesWrittenByThisTest.push(vocabulary.outcome);
  actionsWrittenByThisTest.push(vocabulary.action);
  recipientsWrittenByThisTest.push(vocabulary.recipient);
}

async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
  conceptsWrittenByThisTest.push(vocabulary.concept);
}

async function registerCoherentCapability(vocabulary: IVocabulary): Promise<void> {
  await createCapabilityRegistry(pool).registerCapability({
    name: vocabulary.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: vocabulary.concept,
  });
  capabilityNamesWrittenByThisTest.push(vocabulary.capabilityName);
}

interface IDraftDescription {
  readonly slug: string;
  readonly title: string;
  readonly subjectType: string;
  readonly resolution: Resolution;
}

async function createDraftVersion(store: RelationalCaseStore, description: IDraftDescription): Promise<number> {
  return store.createDraft({
    slug: description.slug,
    title: description.title,
    when_to_use: 'when a curator asks release to check this draft',
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
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
  readonly position: number;
}

async function placeNewHypothesis(store: RelationalCaseStore, key: ICaseVersionKey, hypothesis: IHypothesisDescription): Promise<number> {
  const revision = await store.insertHypothesisRevision({
    slug: key.slug,
    hypothesis_name: hypothesis.name,
    criterion: hypothesis.criterion,
    collects: hypothesis.collects,
    resolution: hypothesis.resolution,
  });
  await store.placeHypothesis({ slug: key.slug, version: key.version, hypothesis_name: hypothesis.name, revision, position: hypothesis.position });
  return revision;
}

function wireRelease(store: RelationalCaseStore): ReleaseOperation {
  return new ReleaseOperation(store, createGlossaryQuery(pool), createCapabilityQuery(pool));
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
  if (capabilityNamesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM capabilities WHERE name = ANY($1)', [capabilityNamesWrittenByThisTest]);
  }
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = ANY($1)', [conceptsWrittenByThisTest]);
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
}

afterEach(async () => {
  await cleanupCaseRows();
  await cleanupGlossaryRows();
  slugsWrittenByThisTest = [];
  subjectTypesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
  conceptsWrittenByThisTest = [];
  capabilityNamesWrittenByThisTest = [];
});

it(
  'refuses releasing a draft whose manifest holds two hypothesis-revisions collecting no concept at all, ' +
    'naming both structural violations together, leaving the version in draft state with no release recorded',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-operation-structural-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, title: 'A case', subjectType: vocabulary.subjectType, resolution });
    await placeNewHypothesis(store, { slug, version }, { name: 'h1', criterion: 'first', collects: [], resolution, position: 1 });
    await placeNewHypothesis(store, { slug, version }, { name: 'h2', criterion: 'second', collects: [], resolution, position: 2 });
    const releaseOperation = wireRelease(store);

    const refusal = await releaseOperation.release(slug, version).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseVersionNotReleasableError);
    expect((refusal as CaseVersionNotReleasableError).context.violations).toEqual([
      'manifest entry 1 collects no concept',
      'manifest entry 2 collects no concept',
    ]);
    const stillStored = await store.assembleVersion(slug, version);
    expect(stillStored?.state).toBe('draft');
    expect(stillStored?.released_at).toBeUndefined();
  },
);

it(
  'refuses releasing a draft whose collected concept both rejects the declared subject type and answers no ' +
    'capability, naming both coherence violations together, leaving the version in draft state with no release recorded',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-operation-coherence-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerConceptAccepting(vocabulary, vocabulary.otherSubjectType);

    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, title: 'A case', subjectType: vocabulary.subjectType, resolution });
    await placeNewHypothesis(store, { slug, version }, { name: 'h1', criterion: 'a criterion', collects: [vocabulary.concept], resolution, position: 1 });
    const releaseOperation = wireRelease(store);

    const refusal = await releaseOperation.release(slug, version).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseVersionNotReleasableError);
    expect((refusal as CaseVersionNotReleasableError).context.violations).toEqual([
      `the concept "${vocabulary.concept}" does not accept the subject type "${vocabulary.subjectType}" the case declares`,
      `no read-only capability currently answers the concept "${vocabulary.concept}"`,
    ]);
    const stillStored = await store.assembleVersion(slug, version);
    expect(stillStored?.state).toBe('draft');
    expect(stillStored?.released_at).toBeUndefined();
  },
);

it('marks a draft that holds against every rule released, recording the instant of release', async () => {
  const vocabulary = freshVocabulary();
  const slug = `release-operation-valid-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  await persistGlossary(vocabulary);
  await registerConceptAccepting(vocabulary, vocabulary.subjectType);
  await registerCoherentCapability(vocabulary);
  const store = new RelationalCaseStore(pool);
  const resolution = resolutionOf(vocabulary);
  const version = await createDraftVersion(store, { slug, title: 'A case', subjectType: vocabulary.subjectType, resolution });
  await placeNewHypothesis(store, { slug, version }, { name: 'h1', criterion: 'a criterion', collects: [vocabulary.concept], resolution, position: 1 });
  const releaseOperation = wireRelease(store);
  const beforeRelease = new Date();

  await expect(releaseOperation.release(slug, version)).resolves.toBeUndefined();

  const released = await store.assembleVersion(slug, version);
  expect(released?.state).toBe('released');
  expect(released?.released_at).toBeDefined();
  expect(new Date(released?.released_at as string).getTime()).toBeGreaterThanOrEqual(beforeRelease.getTime());
});

it(
  "refuses releasing a version that is not in draft state, through this operation's own " +
    'CaseVersionNotDraftAtReleaseError, leaving the already-recorded release instant unchanged',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-operation-not-draft-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerConceptAccepting(vocabulary, vocabulary.subjectType);
    await registerCoherentCapability(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, title: 'A case', subjectType: vocabulary.subjectType, resolution });
    await placeNewHypothesis(store, { slug, version }, { name: 'h1', criterion: 'a criterion', collects: [vocabulary.concept], resolution, position: 1 });
    const releaseOperation = wireRelease(store);
    await releaseOperation.release(slug, version);
    const releasedOnce = await store.assembleVersion(slug, version);

    const refusal = await releaseOperation.release(slug, version).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseVersionNotDraftAtReleaseError);
    expect((refusal as CaseVersionNotDraftAtReleaseError).context).toEqual({ slug, version, state: 'released' });
    const stillReleased = await store.assembleVersion(slug, version);
    expect(stillReleased?.released_at).toBe(releasedOnce?.released_at);
  },
);

it(
  "releasing version 2 with a new hypothesis-revision leaves version 1's own manifest and adopted " +
    'revision reading exactly as they read before version 2 ever existed',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-operation-version-isolation-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerConceptAccepting(vocabulary, vocabulary.subjectType);
    await registerCoherentCapability(vocabulary);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const releaseOperation = wireRelease(store);

    const version1 = await createDraftVersion(store, { slug, title: 'Version one', subjectType: vocabulary.subjectType, resolution });
    const revision1 = await placeNewHypothesis(store, { slug, version: version1 }, { name: 'h', criterion: 'the first criterion', collects: [vocabulary.concept], resolution, position: 1 });
    await releaseOperation.release(slug, version1);
    const version1AfterItsOwnRelease = await store.assembleVersion(slug, version1);

    const version2 = await createDraftVersion(store, { slug, title: 'Version two', subjectType: vocabulary.subjectType, resolution });
    await store.removeManifestEntry(slug, version2, 'h');
    const revision2 = await placeNewHypothesis(store, { slug, version: version2 }, { name: 'h', criterion: 'the second criterion', collects: [vocabulary.concept], resolution, position: 1 });
    await releaseOperation.release(slug, version2);

    const version1AfterVersion2Released = await store.assembleVersion(slug, version1);
    expect(version1AfterVersion2Released).toEqual(version1AfterItsOwnRelease);
    expect(version1AfterVersion2Released?.manifest[0]?.hypothesis_revision).toMatchObject({ revision: revision1, criterion: 'the first criterion' });
    const version2AfterItsOwnRelease = await store.assembleVersion(slug, version2);
    expect(version2AfterItsOwnRelease?.manifest[0]?.hypothesis_revision).toMatchObject({ revision: revision2, criterion: 'the second criterion' });
  },
);
