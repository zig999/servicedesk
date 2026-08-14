// Proof for task/http-surface/diagnose-http-endpoint: the real, end-to-end wiring
// createDiagnoseHttpServer assembles against a real, externally provisioned PostgreSQL database
// (constraints/the-database-is-externally-provisioned) — the real relational case query over the
// fixture's own committed case/glossary/capability data (case intermittent-connection-outage/1,
// task/case-fixture/author-diagnose-fixture-case), seeded once into the real tables below, the
// real production diagnose runner, and (since task/http-observation-runtime/production-wiring-swap)
// the real HttpDeclarativeObservationSource built from the capability and connector-configuration
// registries this same connection backs, observing each collected concept through a connector
// configuration this file registers below — reached entirely through Fastify's own app.inject()
// against POST /v1/diagnose, never a hand-rolled substitute for the route. Two stand-ins replace
// the two network boundaries this pipeline crosses (TST-03 — a stand-in replaces a boundary, never
// business logic): @anthropic-ai/sdk, mocked the same way production-diagnose.factory.spec.ts and
// case-fixture-reads-clean.spec.ts already do, and (since that same swap) the platform's own global
// fetch HttpDeclarativeObservationSource issues its one HTTP call through, with no client injectable
// from production wiring. The model's own answer is deliberately never valid JSON, so every
// hypothesis judged here falls through to inconclusive/judgment-failure and the case's own declared
// fallback answers — deterministic regardless of which of the fixture case's two hypotheses is
// judged first, or what either connector's own mocked response carries, since neither hypothesis
// ever confirms. What the HTTP surface itself does with an injected runDiagnose stand-in — the exact
// response shape, ticket_ref handling, freshness of the generated id, and header independence — is
// proven at the unit level instead, in __tests__/unit/http/build-app.spec.ts.
//
// Sibling fix, disclosed in this task's own proof record: this file used to build four fresh
// temp directories per test, copy the fixture's own committed directories into them and count
// written *.json files under a scratch investigation directory; createDiagnoseHttpServer now
// builds its one DatabaseConnection from env.DATABASE_URL and threads it into every store this
// task's own cutover wires (task/service-on-the-database/store-wiring), so this file seeds the
// committed fixture's own case, glossary and capability data into the real tables once, identifies
// each test's own written investigation by a freshly generated requester rather than by scanning a
// directory, and removes every row it seeded again in its own afterAll, so a sibling integration
// file that wipes a glossary table wholesale (relational-glossary-store.repository.spec.ts's own
// wipeGlossaryTables()) never meets a foreign key this file's own rows still hold open.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
//
// Reconciled for task/http-observation-runtime/production-wiring-swap, disclosed in that task's
// own proof record rather than its implementation (its own deferred entry names this file as the
// proof pass's own to settle): createDiagnoseHttpServer no longer constructs FakeObservationSource
// seeded from this fixture's own observations.json, so the Env literal below no longer names
// OBSERVATIONS_FIXTURE_FILE (dropped from the Env type itself) and this file instead registers a
// connector configuration for each connector the fixture case's own two collected concepts name
// (corporate-records-equipment-status-connector, corporate-records-network-outage-connector),
// through the same createConnectorConfigurationRegistry wiring
// connector-configuration-registry.factory.spec.ts already exercises. A second stand-in joins
// @anthropic-ai/sdk at the network boundary (TST-03): HttpDeclarativeObservationSource issues its
// one HTTP call through the platform's own global fetch with no injectable client in production
// wiring, so this file stubs globalThis.fetch for the whole suite rather than letting it reach a
// real network address. The model's own answer stays deliberately invalid JSON regardless, so
// which of the two fetched connectors answers what is immaterial to the fixture's own declared
// fallback outcome this file already asserted before this swap.
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'the drafted assessment write-up' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

import type { FastifyInstance } from 'fastify';
import type { Env } from '../../../config/env.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createConnectorConfigurationRegistry } from '../../../factories/connector-configuration-registry.factory.js';
import { createDiagnoseHttpServer } from '../../../factories/diagnose-server.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

/** The two connectors the fixture case's own hypotheses collect through (capability.json), and the fixed address this suite registers each of them against — no placeholder, so the resolved request never depends on the subject or requester under test. */
const EQUIPMENT_STATUS_CONNECTOR = 'corporate-records-equipment-status-connector';
const NETWORK_OUTAGE_CONNECTOR = 'corporate-records-network-outage-connector';
const EQUIPMENT_STATUS_ADDRESS = 'https://corporate-records.test/equipment-status';
const NETWORK_OUTAGE_ADDRESS = 'https://corporate-records.test/network-outage';

/** Stands in for the network boundary (TST-03) HttpDeclarativeObservationSource's own global fetch reaches: every call answers 200 with a body carrying both connectors' own declared response-map fields, so neither connector's own call ever reaches a real address. Typed with fetch's own two parameters (both unused by the stand-in) so a call's own address is still readable off fetchMock.mock.calls below. */
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

/** One glossary vocabulary fixture file, parsed into its own table's own INSERT text. */
async function readTermNames(file: string): Promise<readonly string[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  const records = JSON.parse(raw) as ReadonlyArray<{ name: string }>;
  return records.map((record) => record.name);
}

/** Inserts every row the committed fixture's own case, glossary and capability data need, each guarded by ON CONFLICT DO NOTHING so calling this more than once across this suite's own files never fails or duplicates a row — the fixture is meant to be read, not owned, by any one test. */
async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'public.subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'public.subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'public.outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'public.actions', await readTermNames('action.json'));
  await insertTerms(connection, 'public.recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
  await insertConnectorConfigurations(connection);
}

/** Registers a connector configuration for each of the fixture case's own two collected concepts' connectors, through the real registry wiring — replacing rather than duplicating on a re-run, since register-connector holds one row per connector identity. */
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
    await connection.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [concept.name, concept.ttl]);
    for (const subjectType of concept.accepts) {
      await connection.query(
        'INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
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
      `INSERT INTO public.capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
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

/** Writes the fixture case's own committed document through the real store exactly once — writeVersion refuses a second write under the same slug and version, so this checks it is not already stored first. */
async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.readVersion(SLUG, VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', SLUG, `${VERSION}.json`), 'utf8');
  await store.writeVersion(SLUG, VERSION, JSON.parse(raw));
}

/** Removes every row this file's own beforeAll seeded, in an order that always satisfies their own foreign keys — so this file leaves the glossary and capability tables exactly as it found them, and a sibling suite that owns one of those tables wholesale (relational-glossary-store.repository.spec.ts's own wipeGlossaryTables()) never meets a row this file left behind. By the time this runs, every test's own afterEach has already deleted every investigation this file wrote, so no foreign key still holds the pinned case open. */
async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM public.hypothesis_collects WHERE case_slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.case_versions WHERE slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.cases WHERE slug = $1', [SLUG]);
  const capabilities = JSON.parse(await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8')) as ReadonlyArray<{ name: string; version: string }>;
  for (const capability of capabilities) {
    await connection.query('DELETE FROM public.capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  const concepts = JSON.parse(await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8')) as ReadonlyArray<{ name: string }>;
  for (const concept of concepts) {
    await connection.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [concept.name]);
    await connection.query('DELETE FROM public.concepts WHERE name = $1', [concept.name]);
  }
  await connection.query('DELETE FROM public.subject_types WHERE name = ANY($1)', [await readTermNames('subject-type.json')]);
  await connection.query('DELETE FROM public.subject_attributes WHERE name = ANY($1)', [await readTermNames('subject-attribute.json')]);
  // The fixture's own outcome.json happens to list both non-conclusion outcomes among its own
  // terms; excluded here rather than deleted, since they are the glossary's own suite-wide seed
  // (vitest-global-setup.ts), never this fixture's own to remove — deleting them mid-suite races
  // GlossaryService.withNonConclusionOutcomes' own top-up against any other file's currently-live
  // hypothesis row (task/service-on-the-database/store-wiring, disclosed in that task's own delivery).
  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readTermNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await connection.query('DELETE FROM public.outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await connection.query('DELETE FROM public.actions WHERE name = ANY($1)', [await readTermNames('action.json')]);
  await connection.query('DELETE FROM public.recipients WHERE name = ANY($1)', [await readTermNames('recipient.json')]);
  await cleanupConnectorConfigurations(connection);
}

/** Removes the two connector configurations this file's own beforeAll registered, so a sibling suite reading the whole table (connector-configuration-registry.factory.spec.ts's own afterEach, filtered to its own connector-registry-factory- prefix, never collides) never meets a row this file left behind. */
async function cleanupConnectorConfigurations(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM public.connector_configurations WHERE connector = ANY($1)', [
    [EQUIPMENT_STATUS_CONNECTOR, NETWORK_OUTAGE_CONNECTOR],
  ]);
}

/** The request body this suite submits, naming a fresh requester per test so this file's own investigation rows never collide with another test's. */
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

/** Every investigation row written under the given requester, freshly read from the real table. */
async function investigationsFor(connection: DatabaseConnection, requester: string): Promise<readonly IInvestigationRow[]> {
  const { rows } = await connection.query<IInvestigationRow>(
    `SELECT id, cost_calls, cost_input_tokens, cost_output_tokens, durations_collection, durations_judgment, durations_writing, durations_total
     FROM public.investigations WHERE requester = $1`,
    [requester],
  );
  return rows;
}

/** Deletes every row this file's own tests wrote under the given requester's investigations, in an order that always satisfies their own foreign keys. */
async function cleanupInvestigationsFor(connection: DatabaseConnection, requester: string): Promise<void> {
  const { rows } = await connection.query<{ id: string }>('SELECT id FROM public.investigations WHERE requester = $1', [requester]);
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return;
  }
  await connection.query('DELETE FROM public.investigation_evaluation_citations WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM public.investigation_evaluations WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM public.investigation_evidence WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM public.investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [ids]);
  await connection.query('DELETE FROM public.investigations WHERE id = ANY($1)', [ids]);
}

/** The Env every test below builds createDiagnoseHttpServer from, absent OBSERVATIONS_FIXTURE_FILE now that env.ts no longer declares it (task/http-observation-runtime/production-wiring-swap) — named once so a test needing its own separate app (the corrupted-fixture criterion-3 test below) never redeclares this literal (MNT-03). */
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
});

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

// ------------------------------------------------------- criteria 1 and 2

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

// ------------------------------------------------------------- criterion 3

it(
  'writes two independent investigation records for two requests naming the same case, subject, narrative and requester',
  async () => {
    const body = requestBodyFor(requester);
    const first = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });
    const second = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    const written = await investigationsFor(seedingConnection, requester);
    expect(written).toHaveLength(2);
  },
  // Two full diagnose pipelines run sequentially, each against the real, externally provisioned
  // database and each bounded by production-diagnose.factory.ts's own 20000ms deadline; the suite's
  // own 40000ms testTimeout leaves one call almost no headroom against a second, so this test states
  // its own longer bound explicitly rather than raising the suite-wide default again for one test.
  70000,
);

// ------------------------------------------------------------- criterion 4

it('answers 200 when the request supplies no ticket_ref', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

  expect(response.statusCode).toBe(200);
});

it('answers 200 when the request supplies a ticket_ref', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/v1/diagnose',
    payload: { ...requestBodyFor(requester), ticket_ref: 'TCK-1' },
  });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------- criterion 5

it('answers 200 for a request carrying no headers at all', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester), headers: {} });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------- inference: env's models reach the provider

it("sends the caller-configured evaluator and consolidator models to the provider, both read once from this factory's own Env", async () => {
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

  const sentModels = createMock.mock.calls.map((call) => (call[0] as { model: string }).model);
  expect(sentModels).toContain('a-test-evaluator-model');
  expect(sentModels).toContain('a-test-consolidator-model');
});

// ------------------------------------------- inference: cost/durations are zero placeholders

it('persists the zero-valued cost and duration placeholders this HTTP layer stamps, since nothing behind it measures either yet', async () => {
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyFor(requester) });

  const [written] = await investigationsFor(seedingConnection, requester);
  expect(written).toBeDefined();
  expect({ calls: written?.cost_calls, input_tokens: written?.cost_input_tokens, output_tokens: written?.cost_output_tokens }).toEqual({
    calls: 0,
    input_tokens: 0,
    output_tokens: 0,
  });
  expect({
    collection: written?.durations_collection,
    judgment: written?.durations_judgment,
    writing: written?.durations_writing,
    total: written?.durations_total,
  }).toEqual({ collection: 0, judgment: 0, writing: 0, total: 0 });
});

// ---------------------- task/http-observation-runtime/production-wiring-swap, criteria 1 and 2

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

// --------------------------- task/http-observation-runtime/production-wiring-swap, criterion 3

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
