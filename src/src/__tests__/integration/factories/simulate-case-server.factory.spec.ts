// Proof for task/case-simulation-pipeline/simulate-case-operation, criterion 8 and the real-world
// half of criteria 1, 2 and 3: the real, end-to-end wiring createDiagnoseHttpServer assembles for
// POST /v1/simulate against a real, externally provisioned PostgreSQL database
// (constraints/the-database-is-externally-provisioned) — the real relational case query over the
// fixture's own committed case data (case intermittent-connection-outage/1) for the released-state
// scenario, and a freshly created, never-released draft version of a second case for the
// draft-state scenario, both reached entirely through Fastify's own app.inject() against
// createDiagnoseHttpServer(env)'s own instance, never a hand-rolled substitute for the route or the
// controller. This is the closest available analog to diagnose-server.factory.spec.ts's own
// established convention, trimmed to what this task's own criteria need: reachability for a real
// process, the complete record for a case version in either declared state, and — the strongest
// available evidence for "no investigation is written" — a direct read of the investigations table
// itself after a real call, rather than only the structural absence of a write-capable dependency
// unit tests elsewhere in this delivery already establish.
//
// Divergence (TST-04): this file's own name corresponds to no single production file — its subject
// is createDiagnoseHttpServer (diagnose-server.factory.ts), the same composition root
// diagnose-server.factory.spec.ts already mirrors and already owns. It was written standalone
// rather than appended there to avoid growing an already-large, delicate, shared fixture file (and
// its beforeAll/afterAll) any change here risks for every diagnose test that file already proves;
// this file seeds and tears down its own state independently, so — since vitest.config.ts's own
// fileParallelism: false runs every test file strictly sequentially — it never races
// diagnose-server.factory.spec.ts's own identical use of the same released fixture, whichever of
// the two runs first.
//
// Two stand-ins replace the two network boundaries this pipeline crosses (TST-03 — a stand-in
// replaces a boundary, never business logic), exactly as diagnose-server.factory.spec.ts already
// establishes: @anthropic-ai/sdk, mocked the same way, and the platform's own global fetch,
// HttpDeclarativeObservationSource's own one HTTP call, with no client injectable from production
// wiring. The model's own answer is deliberately never valid JSON, so every hypothesis judged here
// falls through to inconclusive/judgment-failure and the case's own declared fallback answers —
// deterministic regardless of which hypothesis is judged first or what either connector's own
// mocked response carries, since neither hypothesis ever confirms.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

/** Mirrors diagnose-server.factory.spec.ts's own hoisted Anthropic mock exactly, since createProductionSimulationRunner wires the identical real, Anthropic-backed adapters simulate's own composition does. */
const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn(
    (_options: { model: string }) =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              content: [{ type: 'text', text: 'the drafted assessment write-up' }],
              usage: { input_tokens: 120, output_tokens: 45 },
            }),
          10,
        ),
      ),
  );
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

import type { FastifyInstance } from 'fastify';
import type { Env } from '../../../config/env.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createConnectorConfigurationRegistry } from '../../../factories/connector-configuration-registry.factory.js';
import { createDiagnoseHttpServer } from '../../../factories/diagnose-server.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const RELEASED_SLUG = 'intermittent-connection-outage';
const RELEASED_VERSION = 1;

/** This file's own draft case, never released — a new slug so it never touches the shared, already-released fixture version-1 that other integration files also read. */
const DRAFT_SLUG = 'simulate-case-operation-draft-fixture';

/** The connector the fixture case's own first hypothesis (customer-equipment-fault) and this file's own draft case alike collect through, and the fixed address this suite registers it against — no placeholder, so the resolved request never depends on the subject or requester under test. */
const EQUIPMENT_STATUS_CONNECTOR = 'corporate-records-equipment-status-connector';
const NETWORK_OUTAGE_CONNECTOR = 'corporate-records-network-outage-connector';
const EQUIPMENT_STATUS_ADDRESS = 'https://corporate-records.test/equipment-status';
const NETWORK_OUTAGE_ADDRESS = 'https://corporate-records.test/network-outage';

/** Stands in for the network boundary (TST-03) HttpDeclarativeObservationSource's own global fetch reaches: every call answers 200 with a body carrying both connectors' own declared response-map fields, so neither connector's own call ever reaches a real address. */
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
  new Response(JSON.stringify({ status: 'ok', active: false }), { status: 200, headers: { 'content-type': 'application/json' } }),
);

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function readTermNames(file: string): Promise<readonly string[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  const records = JSON.parse(raw) as ReadonlyArray<{ name: string }>;
  return records.map((record) => record.name);
}

async function insertTerms(connection: DatabaseConnection, table: string, names: readonly string[]): Promise<void> {
  for (const name of names) {
    await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  }
}

async function insertConcepts(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');
  const concepts = JSON.parse(raw) as ReadonlyArray<{ name: string; accepts: readonly string[]; ttl: number }>;
  for (const concept of concepts) {
    await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [concept.name, concept.ttl]);
    for (const subjectType of concept.accepts) {
      await connection.query(
        'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [concept.name, subjectType],
      );
    }
  }
}

async function insertCapabilities(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8');
  const capabilities = JSON.parse(raw) as ReadonlyArray<Record<string, unknown>>;
  for (const capability of capabilities) {
    await connection.query(
      `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [
        capability.name,
        capability.version,
        capability.nature,
        capability.input_schema,
        capability.output_schema,
        capability.timeout,
        capability.connector,
        capability.concept,
      ],
    );
  }
}

async function insertConnectorConfigurations(connection: DatabaseConnection): Promise<void> {
  const registry = createConnectorConfigurationRegistry(connection);
  await registry.registerConnector({
    connector: EQUIPMENT_STATUS_CONNECTOR,
    configuration: { method: 'GET', address: EQUIPMENT_STATUS_ADDRESS, responseMap: { status: 'status' }, statusMap: { '200': 'ok' } },
  });
  await registry.registerConnector({
    connector: NETWORK_OUTAGE_CONNECTOR,
    configuration: { method: 'GET', address: NETWORK_OUTAGE_ADDRESS, responseMap: { active: 'active' }, statusMap: { '200': 'ok' } },
  });
}

type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
};

type CaseFixtureDocument = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly consolidation_register?: 'formal' | 'plain';
  readonly fallback: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
  readonly manifest: readonly CaseFixtureManifestEntry[];
};

async function placeFixtureHypotheses(lifecycle: CaseLifecycleOperations, fixture: CaseFixtureDocument, version: number): Promise<void> {
  for (const entry of fixture.manifest) {
    const revised = await lifecycle.reviseHypothesis({
      slug: fixture.slug,
      hypothesis_name: entry.hypothesis_name,
      criterion: entry.criterion,
      collects: entry.collects,
      resolution: entry.resolution,
      subject: fixture.subject,
    });
    await lifecycle.placeHypothesis({
      slug: fixture.slug,
      version,
      hypothesis_name: revised.hypothesis_name,
      revision: revised.revision,
      position: entry.position,
    });
  }
}

/** Writes the committed fixture case's own document, released — mirrors diagnose-server.factory.spec.ts's own insertFixtureCase exactly, for the released-state half of this file's own tests. */
async function insertReleasedFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.assembleVersion(RELEASED_SLUG, RELEASED_VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', RELEASED_SLUG, `${RELEASED_VERSION}.json`), 'utf8');
  const fixture = JSON.parse(raw) as CaseFixtureDocument;
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: fixture.slug,
    title: fixture.title,
    when_to_use: fixture.when_to_use,
    authored_at: fixture.authored_at,
    subject: fixture.subject,
    fallback: fixture.fallback,
    consolidation_register: fixture.consolidation_register,
  });
  await placeFixtureHypotheses(lifecycle, fixture, draft.version);
  await lifecycle.release(fixture.slug, draft.version);
}

/** Revises then places this file's own draft case's one hypothesis, pulled out of insertDraftFixtureCase below so that function's own body stays inside the standard's max-lines-per-function rule (MNT-01) — the same split diagnose-server.factory.spec.ts's own placeFixtureHypotheses already establishes for the released fixture case's own manifest. */
async function placeDraftHypothesis(lifecycle: CaseLifecycleOperations, version: number): Promise<void> {
  const revised = await lifecycle.reviseHypothesis({
    slug: DRAFT_SLUG,
    hypothesis_name: 'equipment-fault',
    criterion: "The customer's registered equipment reports a fault status in the corporate systems.",
    collects: ['equipment-status'],
    resolution: { outcome: 'issue-equipment-fault', referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' } },
    subject: 'contract',
  });
  await lifecycle.placeHypothesis({
    slug: DRAFT_SLUG,
    version,
    hypothesis_name: revised.hypothesis_name,
    revision: revised.revision,
    position: 1,
  });
}

/** This file's own draft case, deliberately left in draft state: one hypothesis collecting the same already-registered equipment-status concept the released fixture case's own first hypothesis collects, so no extra capability or connector configuration is needed beyond what this file already registers above. Never released — proving that criterion 1 (a draft-state case version is simulated) is answered against a version genuinely still in draft, not merely one that has not yet reached the release call. */
async function insertDraftFixtureCase(connection: DatabaseConnection): Promise<number> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.assembleVersion(DRAFT_SLUG, 1);
  if (alreadyStored !== undefined) {
    return 1;
  }
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: DRAFT_SLUG,
    title: 'A draft-only case for simulate-case-operation',
    when_to_use: 'When this task\'s own proof needs a case version genuinely still in draft.',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'contract',
    fallback: { outcome: 'inconclusive-hypotheses-exhausted', referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' } },
  });
  await placeDraftHypothesis(lifecycle, draft.version);
  return draft.version;
}

let draftVersion: number | undefined;

async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'actions', await readTermNames('action.json'));
  await insertTerms(connection, 'recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertReleasedFixtureCase(connection);
  await insertConnectorConfigurations(connection);
  draftVersion = await insertDraftFixtureCase(connection);
}

const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

/** Removes this file's own draft case. */
async function cleanupDraftFixtureCase(connection: DatabaseConnection): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [DRAFT_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [DRAFT_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [DRAFT_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [DRAFT_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [DRAFT_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [DRAFT_SLUG]);
}

/** Removes the shared, released fixture case's own rows, mirroring diagnose-server.factory.spec.ts's own cleanupFixtureSeeded exactly — table set and order rewired against the case-version-lifecycle schema, same as that file. fileParallelism: false (vitest.config.ts) runs every test file strictly sequentially, so this file's own beforeAll always re-seeds everything it needs from scratch regardless of what an earlier file's own afterAll already removed; this file returns the database to that same clean state afterward, rather than leaving the fixture and its glossary/capability/connector rows as permanent litter for whichever file happens to run last. */
async function cleanupReleasedFixtureCase(connection: DatabaseConnection): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [RELEASED_SLUG]);
}

/** Removes the two connector configurations this file's own beforeAll registered. */
async function cleanupConnectorConfigurations(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM connector_configurations WHERE connector = ANY($1)', [
    [EQUIPMENT_STATUS_CONNECTOR, NETWORK_OUTAGE_CONNECTOR],
  ]);
}

/** Removes every glossary and capability row this file's own beforeAll seeded, mirroring diagnose-server.factory.spec.ts's own equivalent cleanup exactly — excluding the two non-conclusion outcomes, which are this suite's own global seed (vitest-global-setup.ts), never this file's own to remove. */
async function cleanupGlossaryAndCapabilities(connection: DatabaseConnection): Promise<void> {
  const capabilities = JSON.parse(await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8')) as ReadonlyArray<{ name: string; version: string }>;
  for (const capability of capabilities) {
    await deleteTolerantly(connection, 'DELETE FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  const concepts = JSON.parse(await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8')) as ReadonlyArray<{ name: string }>;
  for (const concept of concepts) {
    await deleteTolerantly(connection, 'DELETE FROM concept_accepts WHERE concept_name = $1', [concept.name]);
    await deleteTolerantly(connection, 'DELETE FROM concepts WHERE name = $1', [concept.name]);
  }
  await deleteTolerantly(connection, 'DELETE FROM subject_types WHERE name = ANY($1)', [await readTermNames('subject-type.json')]);
  await deleteTolerantly(connection, 'DELETE FROM subject_attributes WHERE name = ANY($1)', [await readTermNames('subject-attribute.json')]);
  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readTermNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readTermNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readTermNames('recipient.json')]);
}

function baseEnv(): Env {
  return {
    PORT: 3000,
    DATABASE_URL: requireDatabaseUrl(),
    EVALUATOR_MODEL: 'a-test-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-test-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: 256,
    POOL_SIZE: 2,
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
  };
}

/** Every investigation row written under the given requester, freshly read from the real table — this file's own strongest evidence for criterion 3 ("no investigation is written"). */
async function investigationCountFor(connection: DatabaseConnection, requester: string): Promise<number> {
  const { rows } = await connection.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM investigations WHERE requester = $1', [requester]);
  return Number(rows[0]?.count ?? '0');
}

let seedingConnection: DatabaseConnection;
let app: FastifyInstance;
let requester: string;

beforeAll(async () => {
  vi.stubGlobal('fetch', fetchMock);
  seedingConnection = createDatabaseConnection(requireDatabaseUrl());
  await ensureFixtureSeeded(seedingConnection);
});

afterAll(async () => {
  await cleanupDraftFixtureCase(seedingConnection);
  await cleanupReleasedFixtureCase(seedingConnection);
  await cleanupConnectorConfigurations(seedingConnection);
  await cleanupGlossaryAndCapabilities(seedingConnection);
  await seedingConnection.end();
  vi.unstubAllGlobals();
}, 30000);

beforeEach(async () => {
  requester = `simulate-case-server-factory-requester-${randomUUID()}`;
  createMock.mockClear();
  anthropicConstructorMock.mockClear();
  fetchMock.mockClear();
  app = await createDiagnoseHttpServer(baseEnv());
});

afterEach(async () => {
  await app.close();
});

function requestBodyFor(slug: string, version: number, requesterName: string): Record<string, unknown> {
  return {
    case: { slug, version },
    subject: { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] },
    requester: requesterName,
  };
}

// ------------------------------------------------------- criterion 8, and the real-world half of criterion 2

it(
  "reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations — for a released-state pinned case version",
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/simulate', payload: requestBodyFor(RELEASED_SLUG, RELEASED_VERSION, requester) });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['assessment', 'cost', 'durations', 'evaluations', 'evidence', 'resolved']);
    expect(Array.isArray(body.evidence)).toBe(true);
    expect((body.evidence as unknown[]).length).toBeGreaterThan(0);
    expect(body).not.toHaveProperty('narrative');
    expect(body).not.toHaveProperty('ticket_ref');
  },
);

// ----------------------------------------------------------------- the real-world half of criterion 1

it(
  'answers 200 with the complete record likewise for a draft-state pinned case version, never released',
  async () => {
    expect(draftVersion).toBeDefined();

    const response = await app.inject({ method: 'POST', url: '/v1/simulate', payload: requestBodyFor(DRAFT_SLUG, draftVersion as number, requester) });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['assessment', 'cost', 'durations', 'evaluations', 'evidence', 'resolved']);
  },
);

// ------------------------------------------------------------------------------------ criterion 3

it(
  'writes no investigation row for the requester a real simulate-case call ran under, even though the call itself succeeds',
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/simulate', payload: requestBodyFor(RELEASED_SLUG, RELEASED_VERSION, requester) });

    expect(response.statusCode).toBe(200);
    expect(await investigationCountFor(seedingConnection, requester)).toBe(0);
  },
);
