// Proof for task/case-lifecycle-operations/discard-operation, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL — discardCaseVersion is what is under test, and RelationalCaseStore is a
// real collaborator standing in for nothing (TST-03): every fixture below is built by calling the
// store's own createDraft/insertHypothesisRevision/placeHypothesis/release, never by hand-inserted
// SQL, so the only thing this file writes by hand is the read that checks a table the store itself
// exposes no read for (hypothesis_revisions, case_version_hypotheses).
//
// Every case this file writes carries a discard-op-prefixed marker plus a fresh randomUUID(), so no
// test here can collide with a row another suite file wrote, and every row a test actually commits
// is deleted again in this file's own afterEach — the same convention
// relational-case-store.repository.spec.ts and case-version-lifecycle-schema.spec.ts already keep.
// The one test naming an unstored slug (CaseNotFoundError) registers nothing for that cleanup,
// because nothing is ever written under it.
//
// Two tests below (criterion 2) call store.release() for real, so migrations/0009's own
// release-conditioned rules now make that released case_versions row (and its own
// case_version_hypotheses entry) permanent — an ordinary DELETE against one is a silent no-op, and a
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
import type { CreateDraftInput, HypothesisRevisionInput } from '../../../case/case-store.port.js';
import type { Resolution } from '../../../case/case.js';
import { discardCaseVersion } from '../../../case/discard.operation.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
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

/** One resolution built from one glossary triple, reused for both a draft's own fallback and a hypothesis-revision's own resolution — nothing here varies the two independently. */
function aResolution(glossary: IGlossary): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

/** What createDraft needs to originate one new draft version, held fixed since no test here varies title/when_to_use/authored_at. */
function aCreateDraftInput(slug: string, glossary: IGlossary): CreateDraftInput {
  return {
    slug,
    title: 'A title',
    when_to_use: 'A use',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: glossary.subjectType,
    fallback: aResolution(glossary),
  };
}

/** What insertHypothesisRevision needs to originate one new hypothesis-revision, its collects left empty since no test here needs a concept fixture to exercise discard. */
function aHypothesisRevisionInput(slug: string, hypothesisName: string, glossary: IGlossary): HypothesisRevisionInput {
  return { slug, hypothesis_name: hypothesisName, criterion: 'A representative criterion.', collects: [], resolution: aResolution(glossary) };
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

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every glossary row one draft's own fallback and its hypothesis-revisions' own resolutions reference, under fresh, uniquely named rows tracked for this file's own afterEach cleanup. */
async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `discard-op-subject-${randomUUID()}`;
  const outcome = `discard-op-outcome-${randomUUID()}`;
  const action = `discard-op-action-${randomUUID()}`;
  const recipient = `discard-op-recipient-${randomUUID()}`;
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

/** Every row this file's own tests wrote under a case slug, in the order their own foreign keys require. */
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

/** Every glossary row freshGlossary() wrote for this file's own tests that can still be removed. */
async function cleanupWrittenGlossary(): Promise<void> {
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

it('removes the discarded draft version itself, so no later read answers it at all', async () => {
  const slug = `discard-op-basic-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision(aHypothesisRevisionInput(slug, 'a-hypothesis', glossary));
  await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

  await discardCaseVersion(store, slug, version);

  const assembled = await store.assembleVersion(slug, version);
  expect(assembled).toBeUndefined();
});

it("removes the discarded draft's own manifest entries", async () => {
  const slug = `discard-op-manifest-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision(aHypothesisRevisionInput(slug, 'a-hypothesis', glossary));
  await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });

  await discardCaseVersion(store, slug, version);

  const { rows } = await pool.query(
    'SELECT 1 FROM public.case_version_hypotheses WHERE case_slug = $1 AND case_version = $2',
    [slug, version],
  );
  expect(rows).toEqual([]);
});

// ---------------------------------------------------------------- criterion 2

it('refuses to discard a version that is not in draft state, naming the state it actually holds', async () => {
  const slug = `discard-op-released-refusal-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.release(slug, version);

  const rejection = discardCaseVersion(store, slug, version);

  await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotDraftError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version, state: 'released' } });
});

it('leaves a released version and its manifest entry in place after refusing to discard it', async () => {
  const slug = `discard-op-released-untouched-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision(aHypothesisRevisionInput(slug, 'a-hypothesis', glossary));
  await store.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
  await store.release(slug, version);

  await expect(discardCaseVersion(store, slug, version)).rejects.toBeInstanceOf(CaseVersionNotDraftError);

  const assembled = await store.assembleVersion(slug, version);
  expect(assembled?.manifest).toEqual([
    expect.objectContaining({ position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'a-hypothesis', revision }) }),
  ]);
});

// ---------------------------------------------------------------- criterion 3

it("never removes a hypothesis-revision the discarded draft's manifest referenced, even though no other version ever adopted it", async () => {
  const slug = `discard-op-revision-survives-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const store = new RelationalCaseStore(pool);
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const revision = await store.insertHypothesisRevision(aHypothesisRevisionInput(slug, 'an-orphaned-hypothesis', glossary));
  await store.placeHypothesis({ slug, version, hypothesis_name: 'an-orphaned-hypothesis', revision, position: 1 });

  await discardCaseVersion(store, slug, version);

  const { rows } = await pool.query(
    'SELECT 1 FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [slug, 'an-orphaned-hypothesis', revision],
  );
  expect(rows).toHaveLength(1);
});

// ---------------------------------------------------------------- disclosed inference: CaseNotFoundError

it('refuses to discard a slug/version nothing stores, through CaseNotFoundError', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `discard-op-absent-${randomUUID()}`;

  const rejection = discardCaseVersion(store, slug, 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});
