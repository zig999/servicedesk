// Proof for task/http-surface/end-to-end-diagnose-proof: one HTTP request
// driving the whole synchronous diagnose flow — collection, judgment,
// consolidation and writing, assessment out — through Fastify's own
// app.inject() against buildApp() directly, composed with createDiagnoseRunner
// (diagnose.factory.ts) rather than createProductionDiagnoseRunner
// (production-diagnose.factory.ts), which always wires the real,
// Anthropic-backed AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator.
// FakeHypothesisEvaluator and FakeAssessmentConsolidator stand behind the
// published judgment and consolidation ports instead (TST-03 — a stand-in
// replaces a boundary, never business logic); FakeObservationSource stands
// behind the collection port the same way every other test of this pipeline
// already does, since no real corporate-records connector exists yet. Every
// other stage — collection, the judgment pool orchestration, resolve-and-narrow
// and persistence — is the real, unmocked code, run against the real,
// committed fixture case, glossary and capability data
// (src/fixtures/case/intermittent-connection-outage/1.json). This composition
// imports @anthropic-ai/sdk nowhere: the files listed in
// COMPOSITION_FILES_UNDER_TEST below are exactly what this test's own wiring
// reaches, and none of them names that package, so nothing here can read
// ANTHROPIC_API_KEY even if it were set — proven by running the whole suite
// below with that variable deliberately unset for the duration of every test.
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createDiagnoseRunner } from '../../../factories/diagnose.factory.js';
import { createInvestigationStore } from '../../../factories/investigation-store.factory.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { Subject } from '../../../investigation/subject.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const CASE_SLUG = 'intermittent-connection-outage';
const CASE_VERSION = 1;
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

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
function buildRunDiagnose(investigationDir: string): WiredRunner {
  const runner = createDiagnoseRunner({
    investigationDataDirectory: investigationDir,
    glossaryDataDirectory: join(FIXTURES_ROOT, 'glossary'),
    capabilityDataDirectory: join(FIXTURES_ROOT, 'capability'),
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

function buildTestApp(investigationDir: string): { app: FastifyInstance; capturedId: () => string | undefined } {
  const { runDiagnose, capturedId } = buildRunDiagnose(investigationDir);
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: createCaseQuery(join(FIXTURES_ROOT, 'case'), join(FIXTURES_ROOT, 'glossary'), join(FIXTURES_ROOT, 'capability')),
    runDiagnose,
    model: 'an-end-to-end-test-model',
    promptVersion: 'an-end-to-end-test-prompt-version',
  };
  return { app: buildApp(dependencies), capturedId };
}

let investigationDir: string;
let app: FastifyInstance;
let getCapturedId: () => string | undefined;
let originalAnthropicApiKey: string | undefined;

beforeEach(async () => {
  investigationDir = await mkdtemp(join(tmpdir(), 'diagnose-e2e-investigation-'));
  // Criterion 3: deliberately unset for the whole test, rather than merely
  // asserted, so the run below is real evidence that no live network
  // credential is needed — not an incidental fact about whatever the
  // ambient environment happened to already have set.
  originalAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  const built = buildTestApp(investigationDir);
  app = built.app;
  getCapturedId = built.capturedId;
});

afterEach(async () => {
  await app.close();
  await rm(investigationDir, { recursive: true, force: true });
  if (originalAnthropicApiKey === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = originalAnthropicApiKey;
  }
});

// ------------------------------------------------------------------ criteria 1 and 4

it(
  "writes an investigation to the file-backed store for the request, readable back through createInvestigationStore, before asserting anything about the HTTP response — and the response then carries the fixture case's own resolved fallback assessment",
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

    const investigationId = getCapturedId();
    expect(investigationId).toBeDefined();
    const store = createInvestigationStore(investigationDir);
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
