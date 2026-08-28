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
//
// Sibling fix, disclosed in task/case-lifecycle-http/register-routes-in-build-app's own proof
// record: buildApp() now takes a BuildAppDependencies value — one field per route this initiative
// registers, nineteen in all — rather than a DiagnoseControllerDependencies-shaped object alone.
// buildTestApp() below still names only diagnose's own dependencies, since every test in this file
// exercises only the diagnose route; the other eighteen routes' own dependencies are composed for
// real from this file's own connection through build-app.factory.ts's own buildAppDependencies
// (MNT-03 — reused rather than re-stubbed), with placeholderEnv() below supplying the handful of
// Env fields that composition reads (the configured pagination bound among them) — none of those
// eighteen routes is ever exercised by a test in this file, only diagnose is.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import type { Env } from '../../../config/env.js';
import { buildAppDependencies } from '../../../factories/build-app.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
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

/**
 * Both required hypotheses' own resolved evaluation, exactly as judgment-stage.ts's asEvaluation
 * assembles it from the inconclusive outcome each is seeded with below — the exact evaluations
 * resolve-and-narrow-input.ts will narrow to, since neither citations list is non-empty. Each also
 * carries the deterministic zero-valued usage and elapsed_ms FakeHypothesisEvaluator now attaches to
 * every seeded call (task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own
 * criterion 1): buildEvaluator() below seeds an inconclusive/no-data answer directly (never the
 * judgeOneHypothesis pre-check's own no-data degrade, which never calls evaluate() at all), so a call
 * genuinely happens here and asEvaluation's own callRecordOf carries the fake's usage/elapsed_ms
 * through onto the Evaluation it builds, in the exact key order asEvaluation's own object literal
 * spread produces (hypothesis, verdict, reason, citations, then the spread-in usage/elapsed_ms) —
 * the same order this array's own object literals below are written in, since buildConsolidator()
 * keys its own fixture by this exact array's JSON-serialized content.
 */
const EXPECTED_NARROWED_EVALUATIONS: readonly Evaluation[] = [
  { hypothesis: 'customer-equipment-fault', verdict: 'inconclusive', reason: 'no-data', citations: [], usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0 },
  { hypothesis: 'area-network-outage', verdict: 'inconclusive', reason: 'no-data', citations: [], usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0 },
];

/** The assessment this whole run must produce: neither hypothesis confirms, so case-resolution.ts's resolveOutcome answers the fixture case's own declared fallback, and text is exactly the seeded consolidated text. */
const EXPECTED_ASSESSMENT: Assessment = {
  outcome: 'inconclusive-hypotheses-exhausted',
  referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' },
  text: CONSOLIDATED_TEXT,
};

/**
 * Exactly the files this test's own wiring reaches, scanned by the second test below for an
 * '@anthropic-ai/sdk' import specifier — production-diagnose.factory.ts, the only file in this tree
 * that imports it, is deliberately absent from this list and from every import above.
 *
 * Sibling fix, disclosed in task/case-lifecycle-http/register-routes-in-build-app's own proof
 * record: build-app.factory.ts joins this list, since buildTestApp() above now reaches it (and, in
 * turn, the leaf factories it composes for this initiative's other eighteen routes) to satisfy
 * buildApp()'s wider BuildAppDependencies parameter — none of them imports '@anthropic-ai/sdk'
 * either.
 */
const COMPOSITION_FILES_UNDER_TEST = [
  '../../../http/build-app.ts',
  '../../../http/diagnose.controller.ts',
  '../../../http/diagnose.routes.ts',
  '../../../factories/build-app.factory.ts',
  '../../../factories/diagnose.factory.ts',
  '../../../factories/case-query.factory.ts',
  '../../../factories/case-store.factory.ts',
  '../../../factories/case-lifecycle.factory.ts',
  '../../../factories/capability-registry.factory.ts',
  '../../../factories/glossary.factory.ts',
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
      [capability.name, capability.version, capability.nature, capability.input_schema, capability.output_schema, capability.timeout, capability.connector, capability.concept],
    );
  }
}

/** One manifest entry exactly as the committed fixture document declares it — its own declared position and hypothesis name alongside the content revise-hypothesis needs, the same flat shape seed.ts's own CaseFixtureManifestEntry reads (task/case-lifecycle-operations/wire-and-retire-author-case-version). */
type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
};

/** The committed fixture case document's own whole shape, read exactly as committed — mirrors seed.ts's own CaseFixture. */
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

/**
 * Revises then places every fixture-declared hypothesis at its own fixture-declared position, in
 * the fixture's own declared order — the per-hypothesis half of insertFixtureCase's own sequence
 * below, pulled out into its own function only so that insertFixtureCase's own body stays inside
 * the standard's max-lines-per-function rule; the sequence and behavior are exactly what
 * insertFixtureCase's own loop ran before this split (this delivery's own inference — the
 * extraction changes nothing but where the lines are counted), the same split seed.ts's own
 * seedCase already made into placeFixtureHypotheses.
 */
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

/**
 * Writes the fixture case's own committed document through the six published case-lifecycle
 * operations — createDraft, then revise-and-place every declared hypothesis at its own declared
 * position (placeFixtureHypotheses above), then release — exactly the sequence seed.ts itself runs
 * (task/case-lifecycle-operations/wire-and-retire-author-case-version), rather than through the
 * store directly, which no longer takes a whole document. assembleVersion answers undefined for an
 * unstored version, so this checks the case is not already stored first, the same idempotency guard
 * seed.ts's own alreadySeeded() keeps.
 */
async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.assembleVersion(CASE_SLUG, CASE_VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', CASE_SLUG, `${CASE_VERSION}.json`), 'utf8');
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

/** Inserts every row the committed fixture's own case, glossary and capability data need, each guarded by ON CONFLICT DO NOTHING so a row already present (left behind by a crash) never fails or duplicates. */
async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'actions', await readTermNames('action.json'));
  await insertTerms(connection, 'recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
}

/** Removes every row this file's own beforeAll seeded, in an order that always satisfies their own foreign keys — so this file leaves the glossary and capability tables exactly as it found them, and a sibling suite that owns one of those tables wholesale (relational-glossary-store.repository.spec.ts's own wipeGlossaryTables()) never meets a row this file left behind. By the time this runs, every test's own afterEach has already deleted the one investigation it wrote, so no foreign key still holds the pinned case open. */
const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this fixture releases the seeded version for real, so migrations/0009's own release-conditioned rules make that row (and whatever it still references) permanent; the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already establishes for this migration's consequence. */
async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  // Table set and order rewired against the case-version-lifecycle schema
  // (task/case-lifecycle-persistence/case-version-lifecycle-schema): the flat
  // hypothesis_collects/hypotheses pair this file used to delete is gone, replaced by
  // hypothesis_revision_collects, case_version_hypotheses, hypothesis_revisions and the now
  // identity-only hypotheses — the same table set and order release.operation.spec.ts's own
  // afterEach already established for cleaning up after a released version.
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [CASE_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [CASE_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [CASE_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [CASE_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [CASE_SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [CASE_SLUG]);
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
  // The fixture's own outcome.json happens to list both non-conclusion outcomes among its own
  // terms; excluded here rather than deleted, since they are the glossary's own suite-wide seed
  // (vitest-global-setup.ts), never this fixture's own to remove — deleting them mid-suite races
  // GlossaryService.withNonConclusionOutcomes' own top-up against any other file's currently-live
  // hypothesis row (task/service-on-the-database/store-wiring, disclosed in that task's own delivery).
  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readTermNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readTermNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readTermNames('recipient.json')]);
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

/** The Env buildAppDependencies() reads beyond DATABASE_URL — the configured pagination bound among them — set to the same kind of placeholder value diagnose-server.factory.spec.ts's own baseEnv() already uses: none of the eighteen other routes this composes is ever exercised by a test in this file, only diagnose is, so nothing here needs to be a "real" value, only type-valid. */
function placeholderEnv(): Env {
  return {
    PORT: 3000,
    DATABASE_URL: requireDatabaseUrl(),
    EVALUATOR_MODEL: 'a-placeholder-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-placeholder-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: 256,
    POOL_SIZE: 2,
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
  };
}

function buildTestApp(connection: DatabaseConnection): { app: FastifyInstance; capturedId: () => string | undefined } {
  const { runDiagnose, capturedId } = buildRunDiagnose(connection);
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: createCaseQuery(connection),
    runDiagnose,
    model: 'an-end-to-end-test-model',
    promptVersion: 'an-end-to-end-test-prompt-version',
  };
  const fullDependencies = buildAppDependencies({ env: placeholderEnv(), connection, caseQuery: dependencies.caseQuery, diagnose: dependencies });
  return { app: buildApp(fullDependencies), capturedId };
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
    await connection.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM investigation_evaluations WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM investigation_evidence WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = $1', [id]);
    await connection.query('DELETE FROM investigations WHERE id = $1', [id]);
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
