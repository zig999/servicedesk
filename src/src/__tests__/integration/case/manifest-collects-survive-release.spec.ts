import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import { ReleaseOperation } from '../../../case/release.operation.js';
import { createCapabilityQuery, createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
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
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly conceptA: string;
  readonly conceptB: string;
  readonly capabilityNameA: string;
  readonly capabilityNameB: string;
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
    subjectType: `manifest-collects-subject-${id}`,
    outcome: `manifest-collects-outcome-${id}`,
    action: `manifest-collects-action-${id}`,
    recipient: `manifest-collects-recipient-${id}`,
    conceptA: `manifest-collects-concept-a-${id}`,
    conceptB: `manifest-collects-concept-b-${id}`,
    capabilityNameA: `manifest-collects-capability-a-${id}`,
    capabilityNameB: `manifest-collects-capability-b-${id}`,
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

async function registerCoherentConcept(vocabulary: IVocabulary, conceptName: string, capabilityName: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [conceptName]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [conceptName, vocabulary.subjectType]);
  await createCapabilityRegistry(pool).registerCapability({
    name: capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: conceptName,
  });
  conceptsWrittenByThisTest.push(conceptName);
  capabilityNamesWrittenByThisTest.push(capabilityName);
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
    when_to_use: 'when a curator asks whether a collects row survives an attempted deletion',
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
  readonly collects: readonly string[];
  readonly resolution: Resolution;
  readonly position: number;
}

async function placeNewHypothesis(store: RelationalCaseStore, key: ICaseVersionKey, hypothesis: IHypothesisDescription): Promise<number> {
  const revision = await store.insertHypothesisRevision({
    slug: key.slug,
    hypothesis_name: hypothesis.name,
    criterion: `a criterion for ${hypothesis.name}`,
    collects: hypothesis.collects,
    resolution: hypothesis.resolution,
  });
  await store.placeHypothesis({ slug: key.slug, version: key.version, hypothesis_name: hypothesis.name, revision, position: hypothesis.position });
  return revision;
}

function wireRelease(store: RelationalCaseStore): ReleaseOperation {
  return new ReleaseOperation(store, createGlossaryQuery(pool), createCapabilityQuery(pool));
}

async function deleteCollectsDirectly(slug: string, hypothesisName: string, revision: number): Promise<void> {
  await pool.query(
    'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [slug, hypothesisName, revision],
  );
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
  "reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, " +
    'even after an ordinary DELETE against those exact rows is attempted',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `manifest-collects-readback-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerCoherentConcept(vocabulary, vocabulary.conceptA, vocabulary.capabilityNameA);
    await registerCoherentConcept(vocabulary, vocabulary.conceptB, vocabulary.capabilityNameB);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version = await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revisionA = await placeNewHypothesis(store, { slug, version }, { name: 'h1', collects: [vocabulary.conceptA], resolution, position: 1 });
    const revisionB = await placeNewHypothesis(store, { slug, version }, { name: 'h2', collects: [vocabulary.conceptB], resolution, position: 2 });
    const releaseOperation = wireRelease(store);
    await releaseOperation.release(slug, version);
    await deleteCollectsDirectly(slug, 'h1', revisionA);
    await deleteCollectsDirectly(slug, 'h2', revisionB);

    const result = await createCaseQuery(pool).readCase(slug, version);

    expect(result.case.hypotheses.find((hypothesis) => hypothesis.name === 'h1')?.collects).toEqual([vocabulary.conceptA]);
    expect(result.case.hypotheses.find((hypothesis) => hypothesis.name === 'h2')?.collects).toEqual([vocabulary.conceptB]);
  },
);

it(
  'releases a new draft that inherits an earlier released version\'s own manifest without refusing through the ' +
    'structural "collects no concept" problem, even though an ordinary DELETE against the inherited ' +
    "revision's own collects row was already attempted",
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `manifest-collects-inherited-release-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerCoherentConcept(vocabulary, vocabulary.conceptA, vocabulary.capabilityNameA);
    const store = new RelationalCaseStore(pool);
    const resolution = resolutionOf(vocabulary);
    const version1 = await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });
    const revision = await placeNewHypothesis(store, { slug, version: version1 }, { name: 'h', collects: [vocabulary.conceptA], resolution, position: 1 });
    const releaseOperation = wireRelease(store);
    await releaseOperation.release(slug, version1);
    await deleteCollectsDirectly(slug, 'h', revision);
    const version2 = await createDraftVersion(store, { slug, subjectType: vocabulary.subjectType, resolution });

    await expect(releaseOperation.release(slug, version2)).resolves.toBeUndefined();

    const releasedVersion2 = await store.assembleVersion(slug, version2);
    expect(releasedVersion2?.manifest[0]?.hypothesis_revision.collects).toEqual([vocabulary.conceptA]);
  },
);
