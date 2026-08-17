// Proof for task/manifest-collects-hotfix/fix-collects-readback, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL — the real RelationalCaseStore, ReleaseOperation and CaseQueryService,
// composed exactly the way case-lifecycle.factory.ts and case-query.factory.ts wire them in
// production, over the real glossary-query and capability-query (TST-03: nothing here stands in for
// the store or the two upstream reads release() and readCase() both depend on).
//
// Both tests below deliberately attempt the exact write migrations/0010 closes — an ordinary DELETE
// against hypothesis_revision_collects, issued directly against the pool rather than through any
// store method, the same statement several sibling integration files' own cleanup already runs once
// a version they touched is released (migrations/0010's own header names them) — immediately after
// releasing, before ever reading the version back or releasing a version that inherits it. Without
// that deliberate DELETE, a straight-line create-then-release-then-read would have passed the same
// way before migrations/0010 ever existed, since this task's own implementation record found
// relational-case-store.repository.ts and case-query.service.ts already correct; the DELETE is what
// makes each assertion below about this task's own fix rather than about code nothing here changed.
//
// Divergences from the project's standard, disclosed here for the same reason every sibling
// integration proof already discloses them:
//   - STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL
//     is read directly from process.env rather than through config/env.ts's loadEnv, because loadEnv
//     refuses unless every other application variable is also configured too, which this file has
//     no use for.
//   - TST-04 ("mirrors the path of the unit under test") is departed from below: this file's own
//     scenario exercises RelationalCaseStore, ReleaseOperation and CaseQueryService together and
//     mirrors none of them alone, so it is named for the scenario itself instead — the same
//     departure case-fixture-reads-clean.spec.ts's own file already makes for the same reason.
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

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — release.operation.spec.ts's own header comment explains why that one code, and only that one, is expected rather than a bug once a version is genuinely released. */
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

/** Every distinct, freshly generated glossary/capability name one test's own case needs — nothing here shared with any other test or any other suite file. */
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

/** The outcome/action/recipient triple every fallback and every hypothesis-revision's own resolution below reuses, since nothing here varies the two independently. */
function resolutionOf(vocabulary: IVocabulary): Resolution {
  return { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } };
}

/** Writes every glossary row a case_versions/hypothesis_revisions row's own foreign keys require, tracked for this file's own afterEach cleanup. */
async function persistGlossary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [vocabulary.subjectType]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [vocabulary.outcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [vocabulary.action]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [vocabulary.recipient]);
  subjectTypesWrittenByThisTest.push(vocabulary.subjectType);
  outcomesWrittenByThisTest.push(vocabulary.outcome);
  actionsWrittenByThisTest.push(vocabulary.action);
  recipientsWrittenByThisTest.push(vocabulary.recipient);
}

/** Registers one concept accepting the case's own subject type, plus one read-only capability answering it, so a manifest entry collecting it holds against both coherence rules — tracked for this file's own afterEach cleanup. */
async function registerCoherentConcept(vocabulary: IVocabulary, conceptName: string, capabilityName: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [conceptName]);
  await pool.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [conceptName, vocabulary.subjectType]);
  await createCapabilityRegistry(pool).registerCapability({
    name: capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
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

/** Originates one draft version through the real store, holding when_to_use/authored_at/title fixed since no test here varies any of them. */
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

/** Originates one hypothesis-revision through the real store and adopts it into the named version's manifest at the given position, answering the assigned revision number. */
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

/** Wires ReleaseOperation exactly the way case-lifecycle.factory.ts wires it in production, over the real glossary-query and capability-query. */
function wireRelease(store: RelationalCaseStore): ReleaseOperation {
  return new ReleaseOperation(store, createGlossaryQuery(pool), createCapabilityQuery(pool));
}

/** Attempts the exact write migrations/0010 closes: an ordinary DELETE against hypothesis_revision_collects, issued directly against the pool rather than through any store method — the same statement an unrelated integration file's own cleanup already runs once a version it touched is released. */
async function deleteCollectsDirectly(slug: string, hypothesisName: string, revision: number): Promise<void> {
  await pool.query(
    'DELETE FROM public.hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [slug, hypothesisName, revision],
  );
}

/** Every row this file's own tests wrote under a case slug — collects, then the manifest, then the hypothesis-revisions, the hypothesis identities, the versions, then the case identity, in the order their own foreign keys require. */
async function cleanupCaseRows(): Promise<void> {
  if (slugsWrittenByThisTest.length === 0) return;
  await deleteTolerantly('DELETE FROM public.hypothesis_revision_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.case_version_hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.hypothesis_revisions WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM public.cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
}

/** Every glossary/capability row persistGlossary/registerCoherentConcept wrote for this file's own tests, in the order their own foreign keys require, tolerating a foreign-key violation from a row a released fixture still references. */
async function cleanupGlossaryRows(): Promise<void> {
  if (capabilityNamesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.capabilities WHERE name = ANY($1)', [capabilityNamesWrittenByThisTest]);
  }
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.concept_accepts WHERE concept_name = ANY($1)', [conceptsWrittenByThisTest]);
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

// -------------------------------------------------------------------------------- criterion 1

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

// -------------------------------------------------------------------------------- criterion 3

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
