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

function aResolution(glossary: IGlossary): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

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

function aHypothesisRevisionInput(slug: string, hypothesisName: string, glossary: IGlossary): HypothesisRevisionInput {
  return { slug, hypothesis_name: hypothesisName, criterion: 'A representative criterion.', collects: [], resolution: aResolution(glossary) };
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

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `discard-op-subject-${randomUUID()}`;
  const outcome = `discard-op-outcome-${randomUUID()}`;
  const action = `discard-op-action-${randomUUID()}`;
  const recipient = `discard-op-recipient-${randomUUID()}`;
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
  subjectTypesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
}

afterEach(async () => {
  await cleanupWrittenCases();
  await cleanupWrittenGlossary();
});

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
    'SELECT 1 FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = $2',
    [slug, version],
  );
  expect(rows).toEqual([]);
});

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
    'SELECT 1 FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [slug, 'an-orphaned-hypothesis', revision],
  );
  expect(rows).toHaveLength(1);
});

it('refuses to discard a slug/version nothing stores, through CaseNotFoundError', async () => {
  const store = new RelationalCaseStore(pool);
  const slug = `discard-op-absent-${randomUUID()}`;

  const rejection = discardCaseVersion(store, slug, 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseNotFoundError);
  await expect(rejection).rejects.toMatchObject({ context: { slug, version: 1 } });
});
