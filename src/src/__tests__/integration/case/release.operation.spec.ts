// Proof for task/case-lifecycle-operations/release-operation, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL — ReleaseOperation is what is under test, so nothing here stands in for it
// (TST-03): the real RelationalCaseStore, the real glossary-query and capability-query factories
// compose it exactly the way case-lifecycle.factory.ts wires it in production.
//
// Every fixture below is built through the real store's own already-delivered primitives
// (createDraft, insertHypothesisRevision, placeHypothesis, removeManifestEntry) rather than
// hand-written SQL, the same way author-case-version.factory.spec.ts and
// case-query.factory.spec.ts build their own fixtures through real wiring one layer down from the
// thing under test. The vocabulary-seeding shape (subject_types, outcomes, actions, recipients,
// concepts, concept_accepts, capabilities) mirrors the established pattern those two files and
// relational-case-store.repository.spec.ts already keep.
//
// A coherence violation naming "the concept ... does not exist in the glossary" cannot be
// constructed through this real store: hypothesis_revision_collects.concept_name is a real foreign
// key into concepts, so a collected concept absent from the glossary refuses the fixture's own
// setup write before release is ever reached — the same fact case-query.factory.spec.ts's own
// header comment already discloses for the read side. This suite's own coherence-violation fixture
// therefore registers the concept but has it accept a different subject type than the case
// declares, and registers no capability for it at all, so both remaining coherence rules are
// violated together, exactly the way this task's criterion 1 asks refusal to name every violation
// together.
//
// This suite's own point is to release drafts for real, repeatedly — so migrations/0009's own
// release-conditioned rules now make every released case_versions row (and its own
// case_version_hypotheses entry) permanent: an ordinary DELETE against one is a silent no-op, and a
// DELETE against whatever it still references (a hypothesis-revision, a glossary row) fails on that
// surviving row's own foreign key. deleteTolerantly below runs every cleanup statement expecting
// exactly that — the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already
// establishes for this migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
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
    subjectType: `release-operation-subject-${id}`,
    otherSubjectType: `release-operation-other-subject-${id}`,
    outcome: `release-operation-outcome-${id}`,
    action: `release-operation-action-${id}`,
    recipient: `release-operation-recipient-${id}`,
    concept: `release-operation-concept-${id}`,
    capabilityName: `release-operation-capability-${id}`,
  };
}

/** The outcome/action/recipient triple every fallback and every hypothesis-revision's own resolution below reuses, since nothing here varies the two independently. */
function resolutionOf(vocabulary: IVocabulary): Resolution {
  return { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } };
}

/** Writes every glossary row a case_versions/hypothesis_revisions row's own foreign keys require: both subject types, the outcome, the action and the recipient — tracked for this file's own afterEach cleanup. */
async function persistGlossary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1), ($2)', [vocabulary.subjectType, vocabulary.otherSubjectType]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [vocabulary.outcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [vocabulary.action]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [vocabulary.recipient]);
  subjectTypesWrittenByThisTest.push(vocabulary.subjectType, vocabulary.otherSubjectType);
  outcomesWrittenByThisTest.push(vocabulary.outcome);
  actionsWrittenByThisTest.push(vocabulary.action);
  recipientsWrittenByThisTest.push(vocabulary.recipient);
}

/** Writes the concept row plus one concept_accepts row naming the given subject type, tracked for this file's own afterEach cleanup. */
async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
  conceptsWrittenByThisTest.push(vocabulary.concept);
}

/** Registers, through the real registry, a complete read-only capability answering the vocabulary's own concept. */
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

/** Originates one draft version through the real store, holding when_to_use/authored_at fixed since no test here varies either. */
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

/** Originates one hypothesis-revision through the real store and adopts it into the named version's manifest at the given position, answering the assigned revision number. */
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

/** Wires ReleaseOperation exactly the way case-lifecycle.factory.ts wires it in production, over the real glossary-query and capability-query. */
function wireRelease(store: RelationalCaseStore): ReleaseOperation {
  return new ReleaseOperation(store, createGlossaryQuery(pool), createCapabilityQuery(pool));
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

/** Every glossary/capability row persistGlossary/registerConceptAccepting/registerCoherentCapability wrote for this file's own tests, in the order their own foreign keys require, tolerating a foreign-key violation from a row a released fixture still references. */
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

// -------------------------------------------------------------------------------- criterion 1 (structural)

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

// -------------------------------------------------------------------------------- criterion 1 (coherence)

it(
  'refuses releasing a draft whose collected concept both rejects the declared subject type and answers no ' +
    'capability, naming both coherence violations together, leaving the version in draft state with no release recorded',
  async () => {
    const vocabulary = freshVocabulary();
    const slug = `release-operation-coherence-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    await persistGlossary(vocabulary);
    await registerConceptAccepting(vocabulary, vocabulary.otherSubjectType); // accepts a subject type other than the case's own declared one
    // Deliberately no capability registered for this concept.
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

// -------------------------------------------------------------------------------- criterion 2

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

// -------------------------------------------------------------------------------- criterion 3

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

// -------------------------------------------------------------------------------- criterion 4

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

    // Originates version 2 (copying version 1's own manifest), then revises the same hypothesis and adopts the new revision in version 2's own manifest alone.
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
