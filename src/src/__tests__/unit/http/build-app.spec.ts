// Proof for task/http-surface/diagnose-http-endpoint: the HTTP surface itself
// — build-app.ts, diagnose.routes.ts, diagnose.controller.ts and
// dto/diagnose.dto.ts — exercised through Fastify's own app.inject() against
// buildApp() directly, never a hand-rolled substitute for the route or the
// controller. The wired production pipeline is a stand-in here: runDiagnose
// is exactly the function-value seam DiagnoseControllerDependencies
// declares, stood in for by a vi.fn() (TST-03 — a stand-in replaces a
// boundary, never business logic; the pipeline behind that seam is business
// logic this task does not own). The real pipeline, run end to end against
// the real fixture case and a mocked Anthropic client, is proven separately
// in __tests__/integration/factories/diagnose-server.factory.spec.ts.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ICaseQuery } from '../../../case/case-query.port.js';
import type { Case } from '../../../case/case.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';

/** A minimally valid Case, never read for its content by any test here: every test supplies its own runDiagnose stand-in, so nothing in this file ever reaches the real pipeline this case would otherwise feed. */
function minimalCase(): Case {
  return {
    slug: 'a-case',
    title: 'a title',
    when_to_use: 'a when-to-use',
    version: 1,
    hash: 'a-hash',
    subject: 'a-subject-type',
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
    hypotheses: [
      { name: 'h1', criterion: 'h1 criterion', collects: ['a-concept'], resolution: { outcome: 'h1-outcome', referral: { action: 'refer', recipient: 'a-queue' } } },
    ],
  };
}

/** Answers minimalCase() unconditionally, regardless of the slug/version given — this file's own tests only assert on the HTTP surface, never on which case was requested. */
function stubCaseQuery(theCase: Case): ICaseQuery {
  return { readCase: async () => ({ case: theCase, hash: theCase.hash }) };
}

/** Everything diagnoseRequestSchema requires, as a plain object rather than the imported DTO type — some tests below intentionally break this shape to prove the validation boundary refuses it. */
function validRequestBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    case: { slug: 'a-case', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    narrative: 'a narrative describing the situation',
    requester: 'a-requester',
    ...overrides,
  };
}

type RunDiagnoseMock = ReturnType<typeof vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>>;

/** One Fastify instance built against buildApp() itself, plus the runDiagnose stand-in it was wired with — the one seam this whole file's tests drive and observe. */
function buildTestApp(): { app: FastifyInstance; runDiagnose: RunDiagnoseMock } {
  const runDiagnose = vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>();
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: stubCaseQuery(minimalCase()),
    runDiagnose,
    model: 'a-model',
    promptVersion: 'a-prompt-version',
  };
  return { app: buildApp(dependencies), runDiagnose };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the assessment the diagnose call produced, for a request naming an existing case, subject, narrative and requester', async () => {
  const built = buildTestApp();
  app = built.app;
  const expectedAssessment: Assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted assessment text',
  };
  built.runDiagnose.mockResolvedValueOnce(expectedAssessment);

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(expectedAssessment);
});

// ------------------------------------------------------------------ criterion 2

it('carries exactly outcome, referral, determining_hypothesis and text when the resolved outcome names a determining hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({
    outcome: 'issue-equipment-fault',
    referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' },
    determining_hypothesis: 'customer-equipment-fault',
    text: 'a drafted assessment text',
  });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(Object.keys(response.json() as object).sort()).toEqual(['determining_hypothesis', 'outcome', 'referral', 'text']);
});

it('omits determining_hypothesis and carries no verdict, citation or evidence field when the resolved outcome names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({
    outcome: 'a-fallback-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    text: 'a drafted assessment text',
  });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  const body = response.json() as Record<string, unknown>;
  expect(Object.keys(body).sort()).toEqual(['outcome', 'referral', 'text']);
  expect(body).not.toHaveProperty('verdict');
  expect(body).not.toHaveProperty('citations');
  expect(body).not.toHaveProperty('evidence');
});

// ------------------------------------------------------------------ criterion 3

it("answers each of two requests naming the same case, subject, narrative and requester with that call's own resolved assessment, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose
    .mockResolvedValueOnce({ outcome: 'first-outcome', referral: { action: 'a', recipient: 'r' }, text: 'first-text' })
    .mockResolvedValueOnce({ outcome: 'second-outcome', referral: { action: 'a', recipient: 'r' }, text: 'second-text' });
  const body = validRequestBody();

  const firstResponse = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });
  const secondResponse = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });

  expect(firstResponse.json()).toEqual({ outcome: 'first-outcome', referral: { action: 'a', recipient: 'r' }, text: 'first-text' });
  expect(secondResponse.json()).toEqual({ outcome: 'second-outcome', referral: { action: 'a', recipient: 'r' }, text: 'second-text' });
});

it('invokes the diagnose call under a fresh id for each of two requests naming the same case, subject, narrative and requester', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValue({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });
  const body = validRequestBody();

  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });

  expect(built.runDiagnose).toHaveBeenCalledTimes(2);
  const firstId = built.runDiagnose.mock.calls[0]?.[0].id;
  const secondId = built.runDiagnose.mock.calls[1]?.[0].id;
  expect(firstId).not.toBe(secondId);
});

// ------------------------------------------------------------------ criterion 4

it('supplies the empty string as ticket_ref to the diagnose call when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].ticket_ref).toBe('');
});

it('passes a given ticket_ref straight through to the diagnose call, unchanged', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody({ ticket_ref: 'TCK-42' }) });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].ticket_ref).toBe('TCK-42');
});

// ------------------------------------------------------------------ criterion 5

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody(), headers: {} });

  expect(response.statusCode).toBe(200);
});

it("runs the diagnose call under exactly the body's own requester, even when the request carries an authorization header naming a different identity", async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });

  const response = await app.inject({
    method: 'POST',
    url: '/v1/diagnose',
    payload: validRequestBody({ requester: 'requester-in-body' }),
    headers: { authorization: 'Bearer token-for-someone-else' },
  });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].requester).toBe('requester-in-body');
});

// ------------------------------------------------------------------ criterion 6

const HTTP_LAYER_RELATIVE_PATHS = [
  '../../../http/build-app.ts',
  '../../../http/diagnose.routes.ts',
  '../../../http/diagnose.controller.ts',
  '../../../http/error-handler.middleware.ts',
  '../../../http/dto/diagnose.dto.ts',
];
const FORBIDDEN_HTTP_FRAMEWORKS = ['express', 'koa', '@koa/router', 'hapi', '@hapi/hapi', 'restify', 'connect', 'polka', 'micro'];
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

it("imports fastify, and no second HTTP or router framework, across build-app, the route, the controller, the error handler and the DTO", async () => {
  const allSpecifiers: string[] = [];
  for (const relativePath of HTTP_LAYER_RELATIVE_PATHS) {
    const file = fileURLToPath(new URL(relativePath, import.meta.url));
    const source = await readFile(file, 'utf8');
    allSpecifiers.push(...[...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? ''));
  }

  expect(allSpecifiers).toContain('fastify');
  const forbidden = allSpecifiers.filter((specifier) => FORBIDDEN_HTTP_FRAMEWORKS.includes(specifier));
  expect(forbidden).toEqual([]);
});

// ------------------------------------------------------------------ edge cases

it('refuses with 400 a request whose body names no narrative', async () => {
  const built = buildTestApp();
  app = built.app;
  const withoutNarrative: Record<string, unknown> = validRequestBody();
  delete withoutNarrative.narrative;

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: withoutNarrative });

  expect(response.statusCode).toBe(400);
  expect(built.runDiagnose).not.toHaveBeenCalled();
});

it('refuses with 400 a request whose subject carries no attribute at all', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'POST',
    url: '/v1/diagnose',
    payload: validRequestBody({ subject: { type: 'a-subject-type', attributes: [] } }),
  });

  expect(response.statusCode).toBe(400);
  expect(built.runDiagnose).not.toHaveBeenCalled();
});

it('answers 500 with a generic message, never the rejected call\'s own error text, when the diagnose call itself rejects', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
