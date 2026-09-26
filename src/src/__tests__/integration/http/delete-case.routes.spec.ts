import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CaseCatalogEntry, CreateDraftInput } from '../../../case/case-store.port.js';
import { deleteCase } from '../../../case/delete-case.operation.js';
import type { DeleteCaseControllerDependencies } from '../../../http/delete-case.controller.js';
import { createDeleteCaseRoutesPlugin } from '../../../http/delete-case.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

// Wires the real route (delete-case.routes.ts), the real controller (delete-case.controller.ts) and
// the real operation (delete-case.operation.ts) against a real Postgres-backed store, so that a
// delete of a case the store actually holds — rather than a mocked dependency — is what answers here.

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
let conceptsWrittenByThisTest: string[] = [];

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl(), { maxConnections: 10, idleTimeoutMs: 10_000, statementTimeoutMs: 30_000 });
  store = new RelationalCaseStore(pool);
  const dependencies: DeleteCaseControllerDependencies = { delete: (slug) => deleteCase(store, slug) };
  app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  await app.register(createDeleteCaseRoutesPlugin(dependencies));
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

async function freshGlossary(prefix: string): Promise<IGlossary> {
  const subjectType = `${prefix}-subject-${randomUUID()}`;
  const outcome = `${prefix}-outcome-${randomUUID()}`;
  const action = `${prefix}-action-${randomUUID()}`;
  const recipient = `${prefix}-recipient-${randomUUID()}`;
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

async function freshConcept(prefix: string): Promise<string> {
  const name = `${prefix}-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
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
  if (conceptsWrittenByThisTest.length > 0) {
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

async function assertCaseFullyRemoved(slug: string): Promise<void> {
  const cases = await pool.query('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(cases.rows).toEqual([]);
  const hypotheses = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [slug]);
  expect(hypotheses.rows).toEqual([]);
  const revisions = await pool.query('SELECT revision FROM hypothesis_revisions WHERE case_slug = $1', [slug]);
  expect(revisions.rows).toEqual([]);
  const collects = await pool.query('SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1', [slug]);
  expect(collects.rows).toEqual([]);
}

async function assertCaseStillHeld(slug: string): Promise<void> {
  const cases = await pool.query('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(cases.rows).toEqual([{ slug }]);
}

// The test database is a persistent, long-lived instance rather than one truncated between runs, so
// the cases table already holds far more rows than any one fixed-size page: a single offset:0 page
// is not guaranteed to include a freshly written slug. This walks every page in slug order until the
// declared total is exhausted, so presence or absence is decided against the whole table rather than
// one arbitrary window of it.
const CASES_PAGE_SIZE = 500;

async function allCasesNamed(slug: string): Promise<CaseCatalogEntry[]> {
  const matches: CaseCatalogEntry[] = [];
  let offset = 0;
  for (;;) {
    const page = await store.listCases({ offset, limit: CASES_PAGE_SIZE });
    matches.push(...page.data.filter((entry) => entry.slug === slug));
    offset += page.data.length;
    if (page.data.length === 0 || offset >= page.total) break;
  }
  return matches;
}

type JsonErrorResponse = { readonly error: { readonly code: string; readonly message: string; readonly details: unknown } };

async function assertRefusedByCaseHoldsVersions(slug: string): Promise<void> {
  const response = await app.inject({ method: 'DELETE', url: `/v1/cases/${slug}` });

  expect(response.statusCode).toBe(409);
  const body = response.json() as JsonErrorResponse;
  expect(body.error.code).toBe('CaseHoldsVersionsError');
  expect(body.error.message).toMatch(/\bcaso\b/);
  expect(body.error.message).not.toMatch(/\bcase\b/i);
  expect(body.error.details).toEqual({ slug });
  await assertCaseStillHeld(slug);
}

async function aCaseHoldingNoVersionWithHypotheses(glossary: IGlossary, concept: string, prefix: string): Promise<string> {
  const slug = `${prefix}-accept-${randomUUID()}`;
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  const releasedRevision = await store.insertHypothesisRevision({
    slug,
    hypothesis_name: 'released-hypothesis',
    criterion: 'a criterion',
    collects: [concept],
    resolution: aResolution(glossary),
  });
  await store.releaseHypothesisRevision(slug, 'released-hypothesis', releasedRevision);
  await store.discard(slug, version);
  return slug;
}

async function aCaseHoldingADraftVersion(glossary: IGlossary, prefix: string): Promise<string> {
  const slug = `${prefix}-refuse-draft-${randomUUID()}`;
  await store.createDraft(aCreateDraftInput(slug, glossary));
  return slug;
}

async function aCaseHoldingAReleasedVersion(glossary: IGlossary, prefix: string): Promise<string> {
  const slug = `${prefix}-refuse-released-${randomUUID()}`;
  const version = await store.createDraft(aCreateDraftInput(slug, glossary));
  await store.release(slug, version);
  return slug;
}

it(
  'accepts an HTTP delete of a case holding no version — removing it together with every hypothesis ' +
    'and every hypothesis-revision (released included) and collect it held — and refuses that same ' +
    'HTTP delete, through 409 reporting CaseHoldsVersionsError whose message names the case slug in ' +
    'Brazilian Portuguese and whose details carry exactly that slug and no other field, for a case ' +
    'holding a draft version and, identically, for one holding a released version, leaving each still held',
  async () => {
    const prefix = 'delete-caso-http-rule';
    const glossary = await freshGlossary(prefix);
    const concept = await freshConcept(prefix);

    const acceptedSlug = await aCaseHoldingNoVersionWithHypotheses(glossary, concept, prefix);
    slugsWrittenByThisTest.push(acceptedSlug);
    const acceptedResponse = await app.inject({ method: 'DELETE', url: `/v1/cases/${acceptedSlug}` });
    expect(acceptedResponse.statusCode).toBe(204);
    await assertCaseFullyRemoved(acceptedSlug);

    const draftSlug = await aCaseHoldingADraftVersion(glossary, prefix);
    slugsWrittenByThisTest.push(draftSlug);
    await assertRefusedByCaseHoldsVersions(draftSlug);

    const releasedSlug = await aCaseHoldingAReleasedVersion(glossary, prefix);
    slugsWrittenByThisTest.push(releasedSlug);
    await assertRefusedByCaseHoldsVersions(releasedSlug);
  },
);

it('refuses an HTTP delete naming a slug no case holds, through 404 reporting CaseNotFoundError carrying that slug', async () => {
  const slug = `delete-case-http-not-found-${randomUUID()}`;

  const response = await app.inject({ method: 'DELETE', url: `/v1/cases/${slug}` });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toMatchObject({ slug });
});

it(
  'given a case whose only draft version was discarded so it currently holds no version at all, when ' +
    'a curator deletes that case through this HTTP route, the deletion is accepted with 204 and an ' +
    'empty body, the case no longer appears in the case listing, and a later create-draft naming that ' +
    'same slug creates a new case under it as though the deleted one had never existed — a version ' +
    'numbered 1, that case\'s next_version left standing at 2, and the listing holding exactly one entry for it',
  async () => {
    const prefix = 'delete-case-http-scenario';
    const glossary = await freshGlossary(prefix);
    const slug = `${prefix}-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const draftVersion = await store.createDraft(aCreateDraftInput(slug, glossary));
    await store.discard(slug, draftVersion);

    const response = await app.inject({ method: 'DELETE', url: `/v1/cases/${slug}` });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');

    expect(await allCasesNamed(slug)).toEqual([]);

    const recreatedVersion = await store.createDraft(aCreateDraftInput(slug, glossary));
    expect(recreatedVersion).toBe(1);

    const { rows } = await pool.query<{ next_version: number }>('SELECT next_version FROM cases WHERE slug = $1', [slug]);
    expect(rows[0]?.next_version).toBe(2);

    expect(await allCasesNamed(slug)).toHaveLength(1);
  },
);
