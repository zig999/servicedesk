import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CreateDraftInput } from '../../../case/case-store.port.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore, type CaseStore } from '../../../factories/case-store.factory.js';
import type { UpdateDraftBodyDto } from '../../../http/dto/update-draft.dto.js';
import type { UpdateDraftControllerDependencies } from '../../../http/update-draft.controller.js';
import { createUpdateDraftRoutesPlugin } from '../../../http/update-draft.routes.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { deleteTolerantly, requireDatabaseUrl } from '../database-test-helpers.js';

// Wires the real route (update-draft.routes.ts), the real controller (update-draft.controller.ts),
// the real store (RelationalCaseStore) and the real query (CaseQueryService, wired with the real
// glossary and capability stores through createCaseQuery) against a real Postgres-backed database,
// so that an update-draft over a draft the store actually holds — whose manifest genuinely holds no
// entry, never a mocked dependency — is what answers here.

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

function anUpdateDraftBody(glossary: IGlossary, overrides: Partial<UpdateDraftBodyDto> = {}): UpdateDraftBodyDto {
  return {
    title: 'a corrected title',
    when_to_use: 'when a curator corrects the case',
    subject: glossary.subjectType,
    fallback: aResolution(glossary),
    ...overrides,
  };
}

let pool: DatabaseConnection;
let store: CaseStore;
let app: FastifyInstance;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl(), { maxConnections: 10, idleTimeoutMs: 10_000, statementTimeoutMs: 30_000 });
  store = createCaseStore(pool);
  const dependencies: UpdateDraftControllerDependencies = { caseStore: store, caseQuery: createCaseQuery(pool) };
  app = Fastify();
  await app.register(createUpdateDraftRoutesPlugin(dependencies));
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `update-draft-own-record-subject-${randomUUID()}`;
  const outcome = `update-draft-own-record-outcome-${randomUUID()}`;
  const action = `update-draft-own-record-action-${randomUUID()}`;
  const recipient = `update-draft-own-record-recipient-${randomUUID()}`;
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
  await deleteTolerantly(pool, 'DELETE FROM case_version_hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly(pool, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly(pool, 'DELETE FROM hypothesis_revisions WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly(pool, 'DELETE FROM hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly(pool, 'DELETE FROM case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await deleteTolerantly(pool, 'DELETE FROM cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  slugsWrittenByThisTest = [];
}

async function cleanupWrittenGlossary(): Promise<void> {
  if (subjectTypesWrittenByThisTest.length > 0) {
    await deleteTolerantly(pool, 'DELETE FROM subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await deleteTolerantly(pool, 'DELETE FROM outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  }
  if (actionsWrittenByThisTest.length > 0) {
    await deleteTolerantly(pool, 'DELETE FROM actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await deleteTolerantly(pool, 'DELETE FROM recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
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
  'accepts a well-formed update-draft over a draft whose manifest holds no entry, answering HTTP 200, ' +
    'and the store then holds the submitted title',
  async () => {
    const slug = `update-draft-own-record-manifest-empty-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const body = anUpdateDraftBody(glossary, { title: 'a corrected title for the manifest-empty draft' });

    const response = await app.inject({ method: 'PATCH', url: `/v1/cases/${slug}/versions/${version}`, payload: body });

    expect(response.statusCode).toBe(200);
    const stored = await store.assembleVersion(slug, version);
    expect(stored?.title).toBe(body.title);
  },
);

it(
  "the 200 answer's body carries the stored record's own declared attributes exactly, carrying no manifest " +
    'entry and no consolidation_register defaulted in place of the one the write left absent',
  async () => {
    const slug = `update-draft-own-record-body-shape-${randomUUID()}`;
    slugsWrittenByThisTest.push(slug);
    const glossary = await freshGlossary();
    const version = await store.createDraft(aCreateDraftInput(slug, glossary));
    const body = anUpdateDraftBody(glossary, { title: 'a title carrying no consolidation register' });

    const response = await app.inject({ method: 'PATCH', url: `/v1/cases/${slug}/versions/${version}`, payload: body });

    const stored = await store.assembleVersion(slug, version);
    expect(stored).toBeDefined();
    expect(response.json()).toEqual({
      title: stored!.title,
      when_to_use: stored!.when_to_use,
      subject: stored!.subject,
      fallback: stored!.fallback,
    });
  },
);
