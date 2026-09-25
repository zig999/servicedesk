import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CreateDraftInput } from '../../../case/case-store.port.js';
import { discardCaseVersion } from '../../../case/discard.operation.js';
import type { DiscardControllerDependencies } from '../../../http/discard.controller.js';
import { createDiscardRoutesPlugin } from '../../../http/discard.routes.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

// Wires the real route (discard.routes.ts), the real controller (discard.controller.ts) and the
// real operation (discard.operation.ts) against a real Postgres-backed store, so that a discard
// of a draft the store actually holds — rather than a mocked dependency — is what answers here.

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
    subject: glossary.subjectType,
    fallback: aResolution(glossary),
  };
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
let store: RelationalCaseStore;
let app: FastifyInstance;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl(), { maxConnections: 10, idleTimeoutMs: 10_000, statementTimeoutMs: 30_000 });
  store = new RelationalCaseStore(pool);
  const dependencies: DiscardControllerDependencies = { discard: (slug, version) => discardCaseVersion(store, slug, version) };
  app = Fastify();
  await app.register(createDiscardRoutesPlugin(dependencies));
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `discard-invalid-subject-${randomUUID()}`;
  const outcome = `discard-invalid-outcome-${randomUUID()}`;
  const action = `discard-invalid-action-${randomUUID()}`;
  const recipient = `discard-invalid-recipient-${randomUUID()}`;
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

it(
  'accepts a discard of a draft whose manifest holds no entry: the route answers 204 with an empty body, ' +
    'the store then answers no case version at that slug and number, and the case’s next draft is not ' +
    'numbered with the discarded draft’s number',
  async () => {
    const slug = `discard-http-manifest-empty-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const discardedVersion = await store.createDraft(aCreateDraftInput(slug, glossary));

    const response = await app.inject({ method: 'DELETE', url: `/v1/cases/${slug}/versions/${discardedVersion}` });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');

    const assembledAfterDiscard = await store.assembleVersion(slug, discardedVersion);
    expect(assembledAfterDiscard).toBeUndefined();

    const nextVersion = await store.createDraft(aCreateDraftInput(slug, glossary));
    expect(nextVersion).not.toBe(discardedVersion);
  },
);
