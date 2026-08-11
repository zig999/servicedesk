// Proof for task/http-surface/diagnose-http-endpoint: the real, end-to-end
// wiring createDiagnoseHttpServer assembles — the real file-backed case
// query over the fixture's own committed case/glossary/capability data (case
// intermittent-connection-outage/1, task/case-fixture/author-diagnose-fixture-case),
// the real production diagnose runner, and the FakeObservationSource this
// factory seeds once from the fixture's own observations.json — reached
// entirely through Fastify's own app.inject() against POST /v1/diagnose,
// never a hand-rolled substitute for the route. Only @anthropic-ai/sdk is a
// stand-in (TST-03 — a stand-in replaces the network boundary, never
// business logic), mocked the same way production-diagnose.factory.spec.ts
// and case-fixture-reads-clean.spec.ts already do; the three fixture
// directories are copied into scratch directories before each test so this
// suite reads the fixture's own committed bytes without ever writing back
// into them. The model's own answer is deliberately never valid JSON, so
// every hypothesis judged here falls through to inconclusive/judgment-failure
// and the case's own declared fallback answers — deterministic regardless of
// which of the fixture case's two hypotheses is judged first, since neither
// ever confirms. What the HTTP surface itself does with an injected
// runDiagnose stand-in — the exact response shape, ticket_ref handling,
// freshness of the generated id, and header independence — is proven at the
// unit level instead, in __tests__/unit/http/build-app.spec.ts.
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'the drafted assessment write-up' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

import type { FastifyInstance } from 'fastify';
import type { Env } from '../../../config/env.js';
import { createDiagnoseHttpServer } from '../../../factories/diagnose-server.factory.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

/** The one subject the fixture's own canned observations.json is seeded for (diagnose-server.factory.ts's own SEEDED_SUBJECT) — a request naming a different subject would find no seeded evidence at all and fail, not succeed. */
const REQUEST_BODY = {
  case: { slug: SLUG, version: VERSION },
  subject: { type: 'contract', attributes: [{ attribute: 'contract-number', value: 'CTR-0001' }] },
  narrative: 'a customer reports an intermittent internet connection',
  requester: 'a-requester',
};

let caseDir: string;
let glossaryDir: string;
let capabilityDir: string;
let investigationDir: string;
let app: FastifyInstance;

beforeEach(async () => {
  caseDir = await mkdtemp(join(tmpdir(), 'diagnose-http-case-'));
  glossaryDir = await mkdtemp(join(tmpdir(), 'diagnose-http-glossary-'));
  capabilityDir = await mkdtemp(join(tmpdir(), 'diagnose-http-capability-'));
  investigationDir = await mkdtemp(join(tmpdir(), 'diagnose-http-investigation-'));
  await cp(join(FIXTURES_ROOT, 'case'), caseDir, { recursive: true });
  await cp(join(FIXTURES_ROOT, 'glossary'), glossaryDir, { recursive: true });
  await cp(join(FIXTURES_ROOT, 'capability'), capabilityDir, { recursive: true });
  createMock.mockClear();
  anthropicConstructorMock.mockClear();

  const env: Env = {
    PORT: 3000,
    CASE_DATA_DIRECTORY: caseDir,
    GLOSSARY_DATA_DIRECTORY: glossaryDir,
    CAPABILITY_DATA_DIRECTORY: capabilityDir,
    INVESTIGATION_DATA_DIRECTORY: investigationDir,
    OBSERVATIONS_FIXTURE_FILE: join(FIXTURES_ROOT, 'observations.json'),
    EVALUATOR_MODEL: 'a-test-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-test-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: 256,
    POOL_SIZE: 2,
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
  };
  app = await createDiagnoseHttpServer(env);
});

afterEach(async () => {
  await app.close();
  await rm(caseDir, { recursive: true, force: true });
  await rm(glossaryDir, { recursive: true, force: true });
  await rm(capabilityDir, { recursive: true, force: true });
  await rm(investigationDir, { recursive: true, force: true });
});

// ------------------------------------------------------- criteria 1 and 2

it(
  'answers 200 with exactly the fixture case\'s own declared fallback outcome, referral and drafted text — no verdict, ' +
    'citation, evidence item or determining_hypothesis — for a request naming the seeded canonical subject',
  async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

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
    const first = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });
    const second = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    const files = await readdir(investigationDir);
    expect(files.filter((file) => file.endsWith('.json'))).toHaveLength(2);
  },
);

// ------------------------------------------------------------- criterion 4

it('answers 200 when the request supplies no ticket_ref', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(response.statusCode).toBe(200);
});

it('answers 200 when the request supplies a ticket_ref', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: { ...REQUEST_BODY, ticket_ref: 'TCK-1' } });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------- criterion 5

it('answers 200 for a request carrying no headers at all', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY, headers: {} });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------- inference: env's models reach the provider

it("sends the caller-configured evaluator and consolidator models to the provider, both read once from this factory's own Env", async () => {
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  const sentModels = createMock.mock.calls.map((call) => (call[0] as { model: string }).model);
  expect(sentModels).toContain('a-test-evaluator-model');
  expect(sentModels).toContain('a-test-consolidator-model');
});

// ------------------------------------------- inference: cost/durations are zero placeholders

it('persists the zero-valued cost and duration placeholders this HTTP layer stamps, since nothing behind it measures either yet', async () => {
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  const files = await readdir(investigationDir);
  const investigationFile = files.find((file) => file.endsWith('.json'));
  expect(investigationFile).toBeDefined();
  const raw = await readFile(join(investigationDir, investigationFile as string), 'utf8');
  const investigation = JSON.parse(raw) as { cost: unknown; durations: unknown };

  expect(investigation.cost).toEqual({ calls: 0, input_tokens: 0, output_tokens: 0 });
  expect(investigation.durations).toEqual({ collection: 0, judgment: 0, writing: 0, total: 0 });
});
