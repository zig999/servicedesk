// Proof for task/http-surface/end-to-end-diagnose-proof: one HTTP request driving the whole
// synchronous diagnose flow — collection, judgment, consolidation and writing, assessment out —
// through Fastify's own app.inject() against buildApp() directly, composed with
// createDiagnoseRunner (diagnose.factory.ts) rather than createProductionDiagnoseRunner
// (production-diagnose.factory.ts), which always wires the real, Anthropic-backed
// AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator. FakeHypothesisEvaluator and
// FakeAssessmentConsolidator stand behind the published judgment and consolidation ports instead
// (TST-03 — a stand-in replaces a boundary, never business logic); FakeObservationSource stands
// behind the collection port the same way every other test of this pipeline already does, since no
// real corporate-records connector exists yet. Every other stage — collection, the judgment pool
// orchestration, resolve-and-narrow and persistence — is the real, unmocked code, run against the
// real, committed fixture case, glossary and capability data
// (src/fixtures/case/intermittent-connection-outage/1.json), and against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned). This
// composition imports @anthropic-ai/sdk nowhere: the files listed in COMPOSITION_FILES_UNDER_TEST
// below are exactly what this test's own wiring reaches, and none of them names that package, so
// nothing here can read ANTHROPIC_API_KEY even if it were set — proven by running the whole suite
// below with that variable deliberately unset for the duration of every test.
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed a fresh temp
// investigation directory per test and read the fixture's own case/glossary/capability directories
// straight off disk; createDiagnoseRunner and createCaseQuery now take the one shared
// DatabaseConnection this task's own cutover wires everywhere (task/service-on-the-database/store-wiring),
// so this file seeds the committed fixture's own case, glossary and capability data into the real
// tables once and reads the written investigation back through RelationalInvestigationStore over
// that same connection — removing every row it seeded again in its own afterAll, so a sibling
// integration file that wipes a glossary table wholesale (relational-glossary-store.repository.spec.ts's
// own wipeGlossaryTables()) never meets a foreign key this file's own rows still hold open.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createDiagnoseRunner } from '../../../factories/diagnose.factory.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { Subject } from '../../../investigation/subject.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const CASE_SLUG = 'intermittent-connection-outage';
const CASE_VERSION = 1;
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** The one subject the fixture's own canned observations.json is seeded for — the same subject-type/attribute-name convention diagnose-server.factory.ts's own SEEDED_SUBJECT and its spec's REQUEST_BODY already establish for this fixture case. */
const SEEDED_SUBJECT: Subject = { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] };

const REQUEST_BODY = {
  case: { slug: CASE_SLUG, version: CASE_VERSION },
  subject: SEEDED_SUBJECT,
  narrative: 'a customer reports an intermittent internet connection',
  requester: 'an-end-to-end-requester',
};

/** Both hypotheses' own criteria, exactly as fixtures/case/intermittent-connection-outage/1.json declares them — the whole key FakeHypothesisEvaluator's seed() looks up by. */
const EQUIPMENT_FAULT_CRITERION = "The customer's registered equipment reports a fault status in the corporate systems.";
const AREA_OUTAGE_CRITERION = "An active network outage is currently registered for the contract's service area.";

const CONSOLIDATED_TEXT = 'an end-to-end drafted assessment write-up';

/** Both required hypotheses' own resolved evaluation, exactly as judgment-stage.ts's asEvaluation assembles it from the inconclusive outcome each is seeded with below — the exact evaluations resolve-and-narrow-input.ts will narrow to, since neither citations list is non-empty. */
const EXPECTED_NARROWED_EVALUATIONS: readonly Evaluation[] = [
  { hypothesis: 'customer-equipment-fault', verdict: 'inconclusive', reason: 'no-data', citations: [] },
  { hypothesis: 'area-network-outage', verdict: 'inconclusive', reason: 'no-data', citations: [] },
];

/** The assessment this whole run must produce: neither hypothesis confirms, so case-resolution.ts's resolveOutcome answers the fixture case's own declared fallback, and text is exactly the seeded consolidated text. */
const EXPECTED_ASSESSMENT: Assessment = {
  outcome: 'inconclusive-hypotheses-exhausted',
  referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' },
  text: CONSOLIDATED_TEXT,
};

/** Exactly the files this test's own wiring reaches, scanned by the second test below for an '@anthropic-ai/sdk' import specifier — production-diagnose.factory.ts, the only file in this tree that imports it, is deliberately absent from this list and from every import above. */
const COMPOSITION_FILES_UNDER_TEST = [
  '../../../http/build-app.ts',
  '../../../http/diagnose.controller.ts',
  '../../../http/diagnose.routes.ts',
  '../../../factories/diagnose.factory.ts',
  '../../../factories/case-query.factory.ts',
  '../../../factories/investigation-store.factory.ts',
  '../../../investigation/run-diagnosis.ts',
  '../../../investigation/fake-hypothesis-evaluator.adapter.ts',
  '../../../investigation/fake-assessment-consolidator.adapter.ts',
  '../../../investigation/fake-observation-source.adapter.ts',
];

/** One glossary vocabulary fixture file, parsed into the names its own table needs. */
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
      [capability.name, capability.version, capability.nature, capability.input_schema, capability.output_schema, capability.timeout, capability.connector, capability.concept],
    );
  }
}

/** Writes the fixture case's own committed document through the real store exactly once — writeVersion refuses a second write under the same slug and version, so this checks it is not already stored first. */
async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.readVersion(CASE_SLUG, CASE_VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', CASE_SLUG, `${CASE_VERSION}.json`), 'utf8');
  await store.writeVersion(CASE_SLUG, CASE_VERSION, JSON.parse(raw));
}

/** Inserts every row the committed fixture's own case, glossary and capability data need, each guarded by ON CONFLICT DO NOTHING so a row already present (left behind by a crash) never fails or duplicates. */
async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'public.subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'public.subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'public.outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'public.actions', await readTermNames('action.json'));
  await insertTerms(connection, 'public.recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
}

/** Removes every row this file's own beforeAll seeded, in an order that always satisfies their own foreign keys — so this file leaves the glossary and capability tables exactly as it found them, and a sibling suite that owns one of those tables wholesale (relational-glossary-store.repository.spec.ts's own wipeGlossaryTables()) never meets a row this file left behind. By the time this runs, every test's own afterEach has already deleted the one investigation it wrote, so no foreign key still holds the pinned case open. */
async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM public.hypothesis_collects WHERE case_slug = $1', [CASE_SLUG]);
  await connection.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [CASE_SLUG]);
  await connection.query('DELETE FROM public.case_versions WHERE slug = $1', [CASE_SLUG]);
  await connection.query('DELETE FROM public.cases WHERE slug = $1', [CASE_SLUG]);
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
}

function buildObservationSource(): FakeObservationSource {
  const source = new FakeObservationSource();
  source.seed('equipment-status', SEEDED_SUBJECT, { result: 'ok', observation: 'the registered equipment reports status: fault' });
  source.seed('network-outage-flag', SEEDED_SUBJECT, {
    result: 'ok',
    observation: "no active network outage is registered for this contract's service area",
  });
  return source;
}

function buildEvaluator(): FakeHypothesisEvaluator {
  const evaluator = new FakeHypothesisEvaluator();
  evaluator.seed(EQUIPMENT_FAULT_CRITERION, { verdict: 'inconclusive', reason: 'no-data', citations: [] });
  evaluator.seed(AREA_OUTAGE_CRITERION, { verdict: 'inconclusive', reason: 'no-data', citations: [] });
  return evaluator;
}

function buildConsolidator(): FakeAssessmentConsolidator {
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed({ evaluations: EXPECTED_NARROWED_EVALUATIONS, evidence: [], consolidationRegister: 'formal' }, CONSOLIDATED_TEXT);
  return consolidator;
}

type WiredRunner = {
  readonly runDiagnose: (call: ProductionDiagnoseCall) => Promise<Assessment>;
  readonly capturedId: () => string | undefined;
};

/**
 * createDiagnoseRunner (diagnose.factory.ts) wired with the three fakes above,
 * wrapped to match the ProductionDiagnoseCall-shaped signature buildApp's own
 * DiagnoseControllerDependencies expects — reproducing inline exactly the
 * now/deadline-stamping pattern createProductionDiagnoseRunner itself keeps
 * (production-diagnose.factory.ts's own `const now = Date.now(); const
 * deadline = now + 20_000;`), never that factory itself, since it fixes the
 * real Anthropic adapters this test must never wire. Also captures the id the
 * controller generates for this call, so the test can read back exactly this
 * request's own written investigation afterwards.
 */
function buildRunDiagnose(connection: DatabaseConnection): WiredRunner {
  const runner = createDiagnoseRunner({
    connection,
    observationSource: buildObservationSource(),
    evaluator: buildEvaluator(),
    consolidator: buildConsolidator(),
    poolSize: 2,
    defaultConsolidationRegister: 'plain',
  });
  let capturedId: string | undefined;
  const runDiagnose = (call: ProductionDiagnoseCall): Promise<Assessment> => {
    capturedId = call.id;
    const now = Date.now();
    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
  };
  return { runDiagnose, capturedId: () => capturedId };
}

function buildTestApp(connection: DatabaseConnection): { app: FastifyInstance; capturedId: () => string | undefined } {
  const { runDiagnose, capturedId } = buildRunDiagnose(connection);
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: createCaseQuery(connection),
    runDiagnose,
    model: 'an-end-to-end-test-model',
    promptVersion: 'an-end-to-end-test-prompt-version',
  };
  return { app: buildApp(dependencies), capturedId };
}

let connection: DatabaseConnection;
let app: FastifyInstance;
let getCapturedId: () => string | undefined;
let originalAnthropicApiKey: string | undefined;

beforeAll(async () => {
  connection = createDatabaseConnection(requireDatabaseUrl());
  await ensureFixtureSeeded(connection);
});

afterAll(async () => {
  await cleanupFixtureSeeded(connection);
  await connection.end();
});

beforeEach(() => {
  // Criterion 3: deliberately unset for the whole test, rather than merely
  // asserted, so the run below is real evidence that no live network
  // credential is needed — not an incidental fact about whatever the
  // ambient environment happened to already have set.
  originalAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  const built = buildTestApp(connection);
  app = built.app;
  getCapturedId = built.capturedId;
});

afterEach(async () => {
  await app.close();
  const id = getCapturedId();
  if (id !== undefined) {
    await connection.query('DELETE FROM public.investigation_evaluation_citations WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM public.investigation_evaluations WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM public.investigation_evidence WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM public.investigation_subject_attribute_values WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM public.investigations WHERE id = $1', [id]);
  }
  if (originalAnthropicApiKey === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = originalAnthropicApiKey;
  }
});

// ------------------------------------------------------------------ criteria 1 and 4

it(
  "writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore, before asserting anything about the HTTP response — and the response then carries the fixture case's own resolved fallback assessment",
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

    const investigationId = getCapturedId();
    expect(investigationId).toBeDefined();
    const store = new RelationalInvestigationStore(connection);
    const stored = await store.read(investigationId as string);
    expect(stored).toBeDefined();
    const document = (stored as { document: { assessment: Assessment } }).document;
    expect(document.assessment).toEqual(EXPECTED_ASSESSMENT);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(EXPECTED_ASSESSMENT);
  },
);

// ------------------------------------------------------------------ criteria 2 and 3

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

it(
  'imports @anthropic-ai/sdk nowhere across every file this test\'s own composition reaches, so the run above never made or could make a call to the Anthropic API',
  async () => {
    const allSpecifiers: string[] = [];
    for (const relativePath of COMPOSITION_FILES_UNDER_TEST) {
      const file = fileURLToPath(new URL(relativePath, import.meta.url));
      const source = await readFile(file, 'utf8');
      allSpecifiers.push(...[...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? ''));
    }

    expect(allSpecifiers).not.toContain('@anthropic-ai/sdk');
  },
);
