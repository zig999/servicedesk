import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

const MOCK_INPUT_TOKENS_PER_CALL = 120;
const MOCK_OUTPUT_TOKENS_PER_CALL = 45;
const MOCK_RESPONSE_DELAY_MS = 10;

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
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

const EQUIPMENT_STATUS_CONNECTOR = 'corporate-records-equipment-status-connector';
const NETWORK_OUTAGE_CONNECTOR = 'corporate-records-network-outage-connector';
const EQUIPMENT_STATUS_ADDRESS = 'https://corporate-records.test/equipment-status';
const NETWORK_OUTAGE_ADDRESS = 'https://corporate-records.test/network-outage';

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

async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'actions', await readTermNames('action.json'));
  await insertTerms(connection, 'recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
  await insertConnectorConfigurations(connection);
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

async function placeFixtureHypotheses(
  lifecycle: CaseLifecycleOperations,
  fixture: CaseFixtureDocument,
  version: number,
): Promise<void> {
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

async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.assembleVersion(SLUG, VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', SLUG, `${VERSION}.json`), 'utf8');
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

async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {

  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [SLUG]);
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
  await cleanupConnectorConfigurations(connection);
}

async function cleanupConnectorConfigurations(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM connector_configurations WHERE connector = ANY($1)', [
    [EQUIPMENT_STATUS_CONNECTOR, NETWORK_OUTAGE_CONNECTOR],
  ]);
}

function requestBodyFor(requester: string): Record<string, unknown> {
  return {
    case: { slug: SLUG, version: VERSION },
    subject: { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] },
    narrative: 'a customer reports an intermittent internet connection',
    requester,
  };
}

interface IInvestigationRow {
  readonly id: string;
  readonly cost_calls: number;
  readonly cost_input_tokens: number;
  readonly cost_output_tokens: number;
  readonly durations_collection: number;
  readonly durations_judgment: number;
  readonly durations_writing: number;
  readonly durations_total: number;
}

async function investigationsFor(connection: DatabaseConnection, requester: string): Promise<readonly IInvestigationRow[]> {
  const { rows } = await connection.query<IInvestigationRow>(
    `SELECT id, cost_calls, cost_input_tokens, cost_output_tokens, durations_collection, durations_judgment, durations_writing, durations_total
     FROM investigations WHERE requester = $1`,
    [requester],
  );
  return rows;
}

async function cleanupInvestigationsFor(connection: DatabaseConnection, requester: string): Promise<void> {
  const { rows } = await connection.query<{ id: string }>('SELECT id FROM investigations WHERE requester = $1', [requester]);
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return;
  }
  await connection.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM investigation_evaluations WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM investigations WHERE id = ANY($1)', [ids]);
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

let seedingConnection: DatabaseConnection;
let app: FastifyInstance;
let requester: string;

beforeAll(async () => {
  vi.stubGlobal('fetch', fetchMock);
  seedingConnection = createDatabaseConnection(requireDatabaseUrl());
  await ensureFixtureSeeded(seedingConnection);
});

afterAll(async () => {
  await cleanupFixtureSeeded(seedingConnection);
  await seedingConnection.end();
  vi.unstubAllGlobals();
}, 30000);

beforeEach(async () => {
  requester = `diagnose-server-factory-requester-${randomUUID()}`;
  createMock.mockClear();
  anthropicConstructorMock.mockClear();
  fetchMock.mockClear();

  app = await createDiagnoseHttpServer(baseEnv());
});

afterEach(async () => {
  await app.close();
  await cleanupInvestigationsFor(seedingConnection, requester);
});

it(
  'answers 200 with exactly the fixture case\'s own declared fallback outcome, referral and drafted text — no verdict, ' +
    'citation, evidence item or determining_hypothesis — for a request naming the seeded canonical subject',
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      outcome: 'inconclusive-hypotheses-exhausted',
      referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' },
      text: 'the drafted assessment write-up',
    });
  },
);

it("sends the caller-configured evaluator and consolidator models to the provider, both read once from this factory's own Env", async () => {
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

  const sentModels = createMock.mock.calls.map((call) => (call[0] as { model: string }).model);
  expect(sentModels).toContain('a-test-evaluator-model');
  expect(sentModels).toContain('a-test-consolidator-model');
});

const TOTAL_PROVIDER_CALLS = 3;

it(
  'persists real, non-zero cost and durations for the judgment and consolidation calls, ' +
    'now that the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total ' +
    'exceeding the sum of the three stage figures since it measures the whole pipeline\'s own real elapsed time',
  async () => {
    await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

    const [written] = await investigationsFor(seedingConnection, requester);
    expect(written).toBeDefined();
    expect({ calls: written?.cost_calls, input_tokens: written?.cost_input_tokens, output_tokens: written?.cost_output_tokens }).toEqual({
      calls: TOTAL_PROVIDER_CALLS,
      input_tokens: TOTAL_PROVIDER_CALLS * MOCK_INPUT_TOKENS_PER_CALL,
      output_tokens: TOTAL_PROVIDER_CALLS * MOCK_OUTPUT_TOKENS_PER_CALL,
    });
    expect(written?.durations_judgment).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);
    expect(written?.durations_writing).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);
    expect(written?.durations_collection).toBeGreaterThan(0);
    expect(written?.durations_total).toBeGreaterThan(
      (written?.durations_collection ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0),
    );
  },
);

it(
  "reaches the network to observe a concept the case collects, rather than answering from FakeObservationSource's static fixture",
  async () => {
    await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

    expect(fetchMock).toHaveBeenCalled();
  },
);

it(
  "calls each collected concept's own registered connector address, proving the pipeline's IObservationSource resolves through the HTTP declarative adapter's own registry-driven resolution rather than a hardcoded or fixture-derived one",
  async () => {
    await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toEqual(expect.arrayContaining([EQUIPMENT_STATUS_ADDRESS, NETWORK_OUTAGE_ADDRESS]));
  },
);

it(
  'answers correctly even while the retired static observations fixture holds unparseable content, proving no production path still reads it',
  async () => {
    const fixturePath = join(FIXTURES_ROOT, 'observations.json');
    const original = await readFile(fixturePath, 'utf8');
    await writeFile(fixturePath, '{ this is not valid json');
    let corruptedFixtureApp: FastifyInstance | undefined;
    try {
      corruptedFixtureApp = await createDiagnoseHttpServer(baseEnv());
      const response = await corruptedFixtureApp.inject({
        method: 'POST',
        url: '/v1/diagnose',
        payload: requestBodyFor(requester),
      });
      expect(response.statusCode).toBe(200);
    } finally {
      await writeFile(fixturePath, original);
      if (corruptedFixtureApp) {
        await corruptedFixtureApp.close();
      }
    }
  },
);
