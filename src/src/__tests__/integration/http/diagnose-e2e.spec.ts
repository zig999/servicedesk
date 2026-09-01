import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import type { Env } from '../../../config/env.js';
import { buildAppDependencies } from '../../../factories/build-app.factory.js';
import { createCaseInputRequirementsQuery } from '../../../factories/case-input-requirements.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createDiagnoseRunner } from '../../../factories/diagnose.factory.js';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
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

const SEEDED_SUBJECT: Subject = { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] };

const REQUEST_BODY = {
  case: { slug: CASE_SLUG, version: CASE_VERSION },
  subject: SEEDED_SUBJECT,
  narrative: 'a customer reports an intermittent internet connection',
  requester: 'an-end-to-end-requester',
};

const EQUIPMENT_FAULT_CRITERION = "The customer's registered equipment reports a fault status in the corporate systems.";
const AREA_OUTAGE_CRITERION = "An active network outage is currently registered for the contract's service area.";

const CONSOLIDATED_TEXT = 'an end-to-end drafted assessment write-up';

const EXPECTED_NARROWED_EVALUATIONS: readonly Evaluation[] = [
  { hypothesis: 'customer-equipment-fault', verdict: 'inconclusive', reason: 'no-data', citations: [], usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0 },
  { hypothesis: 'area-network-outage', verdict: 'inconclusive', reason: 'no-data', citations: [], usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0 },
];

const EXPECTED_ASSESSMENT: Assessment = {
  outcome: 'inconclusive-hypotheses-exhausted',
  referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' },
  text: CONSOLIDATED_TEXT,
};

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

function buildSimulateCase(connection: DatabaseConnection, caseQuery: DiagnoseControllerDependencies['caseQuery']): SimulateCaseControllerDependencies {
  return {
    caseQuery,
    glossary: createGlossaryQuery(connection),
    runSimulate: () => {
      throw new Error("simulate-case is not exercised by this file's own tests");
    },
  };
}

function buildSimulateHypothesis(connection: DatabaseConnection, caseQuery: DiagnoseControllerDependencies['caseQuery']): SimulateHypothesisControllerDependencies {
  return {
    caseQuery,
    glossary: createGlossaryQuery(connection),
    runSimulateHypothesis: () => {
      throw new Error("simulate-hypothesis is not exercised by this file's own tests");
    },
  };
}

function buildTestApp(connection: DatabaseConnection): { app: FastifyInstance; capturedId: () => string | undefined } {
  const { runDiagnose, capturedId } = buildRunDiagnose(connection);
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: createCaseQuery(connection),
    caseInputRequirementsQuery: createCaseInputRequirementsQuery(connection),
    runDiagnose,
    model: 'an-end-to-end-test-model',
    promptVersion: 'an-end-to-end-test-prompt-version',
  };
  const fullDependencies = buildAppDependencies({
    env: placeholderEnv(),
    connection,
    caseQuery: dependencies.caseQuery,
    diagnose: dependencies,
    simulateCase: buildSimulateCase(connection, dependencies.caseQuery),
    simulateHypothesis: buildSimulateHypothesis(connection, dependencies.caseQuery),
  });
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
