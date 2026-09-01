import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

const { anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn(() => Promise.resolve({ content: [{ type: 'text', text: 'not valid json, so judgment always falls through' }] }));
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
const EQUIPMENT_STATUS_CONNECTOR = 'corporate-records-equipment-status-connector';
const NETWORK_OUTAGE_CONNECTOR = 'corporate-records-network-outage-connector';
const EQUIPMENT_STATUS_ADDRESS = 'https://corporate-records.test/equipment-status';
const NETWORK_OUTAGE_ADDRESS = 'https://corporate-records.test/network-outage';

const fetchMock = vi.fn(async () =>
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

async function cleanupReleasedFixtureCase(connection: DatabaseConnection): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [RELEASED_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [RELEASED_SLUG]);
}

async function cleanupConnectorConfigurations(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM connector_configurations WHERE connector = ANY($1)', [
    [EQUIPMENT_STATUS_CONNECTOR, NETWORK_OUTAGE_CONNECTOR],
  ]);
}

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
  await cleanupReleasedFixtureCase(seedingConnection);
  await cleanupConnectorConfigurations(seedingConnection);
  await cleanupGlossaryAndCapabilities(seedingConnection);
  await seedingConnection.end();
  vi.unstubAllGlobals();
}, 30000);

beforeEach(async () => {
  requester = `simulate-hypothesis-server-factory-requester-${randomUUID()}`;
  anthropicConstructorMock.mockClear();
  fetchMock.mockClear();
  app = await createDiagnoseHttpServer(baseEnv());
});

afterEach(async () => {
  await app.close();
});

function requestBodyFor(hypothesis: string, requesterName: string): Record<string, unknown> {
  return {
    case: { slug: RELEASED_SLUG, version: RELEASED_VERSION },
    subject: { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] },
    requester: requesterName,
    hypothesis,
  };
}

it(
  "reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition and answers 200 with exactly evidence, one evaluation and durations — collecting only the named hypothesis's own revision's concept, never the case's other hypothesis's own concept",
  async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/simulate/hypothesis',
      payload: requestBodyFor('customer-equipment-fault', requester),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['durations', 'evaluation', 'evidence']);
    const evidence = body.evidence as ReadonlyArray<{ concept: string }>;
    expect(evidence.map((item) => item.concept)).toEqual(['equipment-status']);
    expect((body.evaluation as { hypothesis: string }).hypothesis).toBe('customer-equipment-fault');
    expect(body.durations).not.toHaveProperty('writing');
  },
);

it(
  "collects the other hypothesis's own concept instead when that one is named, proving the real composition's narrowing follows the given hypothesis rather than a fixed one",
  async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/simulate/hypothesis',
      payload: requestBodyFor('area-network-outage', requester),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    const evidence = body.evidence as ReadonlyArray<{ concept: string }>;
    expect(evidence.map((item) => item.concept)).toEqual(['network-outage-flag']);
    expect((body.evaluation as { hypothesis: string }).hypothesis).toBe('area-network-outage');
  },
);

it(
  'refuses with 400 a simulate-hypothesis request whose body names no hypothesis at all, at the wire, before the route ever reaches its own controller',
  async () => {
    const bodyWithoutHypothesis = requestBodyFor('customer-equipment-fault', requester);
    delete bodyWithoutHypothesis.hypothesis;

    const response = await app.inject({ method: 'POST', url: '/v1/simulate/hypothesis', payload: bodyWithoutHypothesis });

    expect(response.statusCode).toBe(400);
  },
);

it(
  'refuses with 404 reporting HypothesisNotInManifestError, for a hypothesis name absent from the pinned case version manifest',
  async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/simulate/hypothesis',
      payload: requestBodyFor('a-hypothesis-this-case-never-declares', requester),
    });

    expect(response.statusCode).toBe(404);
    const body = response.json() as { error: { code: string } };
    expect(body.error.code).toBe('HypothesisNotInManifestError');
  },
);

it(
  'writes no investigation row for the requester a real simulate-hypothesis call ran under, even though the call itself succeeds',
  async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/simulate/hypothesis',
      payload: requestBodyFor('customer-equipment-fault', requester),
    });

    expect(response.statusCode).toBe(200);
    expect(await investigationCountFor(seedingConnection, requester)).toBe(0);
  },
);
