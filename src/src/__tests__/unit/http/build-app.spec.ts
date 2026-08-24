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
//
// Sibling fix, disclosed in task/case-lifecycle-http/register-routes-in-build-app's own proof
// record: buildApp() now takes a BuildAppDependencies value — one field per route this initiative
// registers, nineteen in all — rather than a DiagnoseControllerDependencies-shaped object alone.
// buildTestApp() below still names only diagnose's own dependencies, since every test above and
// below it exercises only the diagnose route; stubBuildAppDependencies() wraps that one value into
// the full shape buildApp() now requires, stubbing every other route's own dependencies minimally
// (TST-03 — a stand-in replaces a boundary; every one of those eighteen fields is exactly that, a
// boundary this file's own scenarios never exercise).
//
// This file's own new tests, added for that same task, sit in their own two sections below: one
// proving build-app.ts's own criterion 1 (one stated registration convention rather than one
// registered call site per route), and one proving criterion 2 (every one of the eighteen other
// route plugins is actually reachable — a request against each one reaches its own controller
// rather than 404). Criterion 3 (the diagnose route's own registration preserved exactly as it
// already answers) is what every test already in this file proves by continuing to pass unmodified
// in behavior — only buildTestApp()'s own call site changed, never what it asserts.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { ICaseQuery } from '../../../case/case-query.port.js';
import type { ICaseStore } from '../../../case/case-store.port.js';
import type { Case } from '../../../case/case.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import type { IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import { buildApp, type BuildAppDependencies } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { ReadConnectorConfigurationControllerDependencies } from '../../../http/read-connector-configuration.controller.js';
import type { RegisterCapabilityControllerDependencies } from '../../../http/register-capability.controller.js';
import type { RegisterConceptControllerDependencies } from '../../../http/register-concept.controller.js';
import type { RegisterConnectorControllerDependencies } from '../../../http/register-connector.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { PaginatedResponse } from '../../../types/pagination.js';

/** A minimally valid Case, never read for its content by any test here: every test supplies its own runDiagnose stand-in, so nothing in this file ever reaches the real pipeline this case would otherwise feed; manifest stays empty for the same reason (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation). */
function minimalCase(): Case {
  return {
    slug: 'a-case',
    title: 'a title',
    when_to_use: 'a when-to-use',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject-type',
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: [],
    hypotheses: [
      { name: 'h1', criterion: 'h1 criterion', collects: ['a-concept'], resolution: { outcome: 'h1-outcome', referral: { action: 'refer', recipient: 'a-queue' } } },
    ],
  };
}

/** Answers minimalCase() unconditionally, regardless of the slug/version given — this file's own tests only assert on the HTTP surface, never on which case was requested. The `hash` answered here is read-case's own store-level content pin (ReadCaseResult.hash — sha256 of the stored document's bytes), never a field of Case itself, which carries no hash at all; a fixed placeholder serves since no test in this file reads it. */
function stubCaseQuery(theCase: Case): ICaseQuery {
  // listCases, listCaseVersions, listHypotheses and listHypothesisRevisions are no part of what
  // this file proves (this file's own routes never reach any of them) — stubbed only so this fake
  // keeps satisfying ICaseQuery now that task/case-query-http/list-cases-route,
  // list-case-versions-route, list-hypotheses-route and list-hypothesis-revisions-route added them
  // to it.
  return {
    readCase: async () => ({ case: theCase, hash: 'a-hash' }),
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
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

/** An empty page of T, shaped exactly as src/types/pagination.ts's own PaginatedResponse requires — sufficient for any of this file's own stubbed listing dependencies to resolve without throwing, never asserted on for its own content by any test in this file. */
function emptyPage<T>(): PaginatedResponse<T> {
  return { data: [], total: 0, limit: 10, offset: 0, pageCount: 0 };
}

/** A minimally valid ICaseStore stand-in (TST-03): every write resolves void (or, where the port declares one, the smallest valid answer), so a route reaches its own controller and completes without throwing before ever reaching the shared error handler — never asserted on for its own returned content by any test in this file. */
function stubCaseStore(): ICaseStore {
  return {
    assembleVersion: async () => undefined,
    findDraftVersion: async () => undefined,
    listCases: async () => emptyPage(),
    listCaseVersions: async () => emptyPage(),
    listHypotheses: async () => emptyPage(),
    listHypothesisRevisions: async () => emptyPage(),
    createDraft: async () => 1,
    insertHypothesisRevision: async () => 1,
    placeHypothesis: async () => undefined,
    removeManifestEntry: async () => undefined,
    release: async () => undefined,
    discard: async () => undefined,
    updateDraft: async () => undefined,
  };
}

/** A minimally valid ICapabilityQuery stand-in (TST-03): readCapability answers a held capability so read-capability-route's own controller never raises ConceptNotAnsweredError (mapped to 404 by status-map.ts) for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubCapabilityQuery(): ICapabilityQuery {
  return {
    readCapability: async (concept) => ({
      held: true,
      capability: { name: concept, version: '1.0.0', nature: 'read-only', input_schema: 'a-schema', output_schema: 'a-schema', timeout: 1000, connector: 'a-connector', concept },
    }),
    listCapabilities: async () => emptyPage(),
  };
}

/** A minimally valid IGlossaryQuery stand-in (TST-03): both reads answer a held term/concept so read-vocabulary-term-route's and read-concept-route's own controllers never raise their own typed not-held errors (both mapped to 404 by status-map.ts) for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubGlossaryQuery(): IGlossaryQuery {
  return {
    readVocabularyTerm: async (_vocabulary, name) => ({ held: true, term: { name } }),
    readConcept: async (name) => ({ held: true, concept: { name, accepts: ['a-subject-type'], ttl: 60 } }),
    listVocabularyTerms: async () => emptyPage(),
    listConcepts: async () => emptyPage(),
  };
}

/** A minimally valid RegisterCapabilityControllerDependencies stand-in (TST-03), extracted to its own helper (MNT-01) rather than inlined in stubBuildAppDependencies: resolves a fixed Capability so register-capability-route's own controller never reaches a domain refusal for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubRegisterCapability(): RegisterCapabilityControllerDependencies {
  return {
    registerCapability: async () => ({
      name: 'a-name',
      version: '1.0.0',
      nature: 'read-only',
      input_schema: 'a-schema',
      output_schema: 'a-schema',
      timeout: 1000,
      connector: 'a-connector',
      concept: 'a-concept',
    }),
  };
}

/** A minimally valid RegisterConceptControllerDependencies stand-in (TST-03), extracted to its own helper (MNT-01) rather than inlined in stubBuildAppDependencies: resolves a fixed Concept so register-concept-route's own controller never reaches a domain refusal for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubRegisterConcept(): RegisterConceptControllerDependencies {
  return {
    registerConcept: async () => ({
      name: 'a-concept',
      accepts: ['a-subject-type'],
      ttl: 60,
    }),
  };
}

/** A minimally valid RegisterConnectorControllerDependencies stand-in (TST-03), extracted to its own helper (MNT-01) rather than inlined in stubBuildAppDependencies: resolves a fixed ConnectorConfiguration so register-connector-route's own controller never reaches a domain refusal for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubRegisterConnector(): RegisterConnectorControllerDependencies {
  return {
    registerConnector: async () => ({
      connector: 'a-connector',
      configuration: {},
    }),
  };
}

/** A minimally valid ReadConnectorConfigurationControllerDependencies stand-in (TST-03), extracted to its own helper (MNT-01) rather than inlined in stubBuildAppDependencies: resolves a fixed ConnectorConfiguration so read-connector-configuration-route's own controller never reaches a domain refusal for a reason unrelated to this file's own registration proof — never asserted on for its own returned content by any test in this file. */
function stubReadConnectorConfiguration(): ReadConnectorConfigurationControllerDependencies {
  return {
    readConnectorConfiguration: async () => ({
      held: true,
      configuration: { connector: 'a-connector', configuration: {} },
    }),
  };
}

/**
 * Every one of the eighteen route plugins besides diagnose this task registers, stubbed minimally
 * around the one given diagnose dependency: this file's own scenarios exercise only the diagnose
 * route, so every other field only needs to let its own route reach its own controller and resolve
 * without throwing before ever reaching the shared error handler (TST-03) — never asserted on for
 * its own returned content by any test in this file except the reachability tests criterion 2 owns
 * below, which assert only on the response's status code.
 */
function stubBuildAppDependencies(diagnose: DiagnoseControllerDependencies): BuildAppDependencies {
  const caseQuery = stubCaseQuery(minimalCase());
  const glossaryQuery = stubGlossaryQuery();
  const pagination = { defaultLimit: 10, maxLimit: 100 };
  return {
    diagnose,
    readCapability: { capabilityQuery: stubCapabilityQuery() },
    listCapabilities: { capabilityQuery: stubCapabilityQuery(), ...pagination },
    registerCapability: stubRegisterCapability(),
    createDraft: { createDraft: async () => ({ slug: 'a-slug', version: 1 }) },
    updateDraft: { caseStore: stubCaseStore(), caseQuery },
    release: { release: async () => undefined, caseQuery },
    discard: { discard: async () => undefined },
    reviseHypothesis: { reviseHypothesis: async () => ({ hypothesis_name: 'a-hypothesis', revision: 1 }) },
    placeHypothesis: { placeHypothesis: async () => undefined },
    removeHypothesis: { removeHypothesis: async () => undefined },
    readCase: { caseQuery },
    listCases: { caseQuery, ...pagination },
    listCaseVersions: { caseQuery, ...pagination },
    listHypotheses: { caseQuery, ...pagination },
    listHypothesisRevisions: { caseQuery, ...pagination },
    readVocabularyTerm: { glossaryQuery },
    listVocabularyTerms: { glossaryQuery, ...pagination },
    readConcept: { glossaryQuery },
    listConcepts: { glossaryQuery, ...pagination },
    registerConcept: stubRegisterConcept(),
    registerConnector: stubRegisterConnector(),
    readConnectorConfiguration: stubReadConnectorConfiguration(),
  };
}

/** One Fastify instance built against buildApp() itself, plus the runDiagnose stand-in it was wired with — the one seam this whole file's tests drive and observe. Wraps the given diagnose dependencies into the full BuildAppDependencies buildApp() now requires (register-routes-in-build-app's own sibling fix, disclosed above); every field beyond diagnose is stubBuildAppDependencies()'s own concern, never this function's. */
function buildTestApp(): { app: FastifyInstance; runDiagnose: RunDiagnoseMock } {
  const runDiagnose = vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>();
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: stubCaseQuery(minimalCase()),
    runDiagnose,
    model: 'a-model',
    promptVersion: 'a-prompt-version',
  };
  return { app: buildApp(stubBuildAppDependencies(dependencies)), runDiagnose };
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

// This test used to assert the controller supplied the empty string as a placeholder for an
// absent ticket_ref — the behavior task/case-and-investigation-model/ticket-ref-is-optional
// removed (diagnose.controller.ts no longer synthesizes `body.ticket_ref ?? ''`), so the
// assertion below now states what that task's own criteria 2 and 3 require instead: an absent
// ticket_ref threads through as an absence, not an invented placeholder.
it('passes ticket_ref through as undefined to the diagnose call when the request names none, inventing no placeholder', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].ticket_ref).toBeUndefined();
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

// ------------------------------------------------------- register-routes-in-build-app, criterion 1

it('registers every route plugin through one shared app.register() call site, never one repeated per route', async () => {
  const file = fileURLToPath(new URL('../../../http/build-app.ts', import.meta.url));
  const source = await readFile(file, 'utf8');
  // Comment lines are stripped first: this file's own header comment mentions "app.register()" in
  // prose, and counting that occurrence alongside the real call site would pass this assertion
  // regardless of whether the source actually registers through one call site or nineteen.
  const codeOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

  const registerCallSites = codeOnly.match(/app\.register\(/g) ?? [];

  expect(registerCallSites).toHaveLength(1);
});

// ------------------------------------------------------- register-routes-in-build-app, criterion 2

type RegisteredRouteRequest = {
  readonly description: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly url: string;
  readonly payload?: Record<string, unknown>;
};

/** One validly-shaped request against each of the eighteen route plugins this task registers besides diagnose (already proven reachable by every test above), so a 404 answered here could only mean the route was never registered by build-app.ts's own loop — never a 400 raised by this route's own DTO validation over a request this file shaped wrong. */
const A_RESOLUTION = { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } };
const REGISTERED_ROUTE_REQUESTS: readonly RegisteredRouteRequest[] = [
  { description: 'read-capability', method: 'GET', url: '/v1/capabilities/a-concept' },
  { description: 'list-capabilities', method: 'GET', url: '/v1/capabilities' },
  {
    description: 'create-draft',
    method: 'POST',
    url: '/v1/cases',
    payload: { slug: 'a-slug', title: 'a title', when_to_use: 'a when-to-use', authored_at: '2024-01-01T00:00:00.000Z', subject: 'a-subject-type', fallback: A_RESOLUTION },
  },
  {
    description: 'update-draft',
    method: 'PATCH',
    url: '/v1/cases/a-slug/versions/1',
    payload: { title: 'a title', when_to_use: 'a when-to-use', subject: 'a-subject-type', fallback: A_RESOLUTION },
  },
  { description: 'release', method: 'POST', url: '/v1/cases/a-slug/versions/1/release' },
  { description: 'discard', method: 'DELETE', url: '/v1/cases/a-slug/versions/1' },
  {
    description: 'revise-hypothesis',
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses',
    payload: { hypothesis_name: 'a-hypothesis', criterion: 'a criterion', collects: ['a-concept'], resolution: A_RESOLUTION, subject: 'a-subject-type' },
  },
  { description: 'place-hypothesis', method: 'PUT', url: '/v1/cases/a-slug/versions/1/manifest/a-hypothesis', payload: { revision: 1, position: 1 } },
  { description: 'remove-hypothesis', method: 'DELETE', url: '/v1/cases/a-slug/versions/1/manifest/a-hypothesis' },
  { description: 'read-case', method: 'GET', url: '/v1/cases/a-slug/versions/1' },
  { description: 'list-cases', method: 'GET', url: '/v1/cases' },
  { description: 'list-case-versions', method: 'GET', url: '/v1/cases/a-slug/versions' },
  { description: 'list-hypotheses', method: 'GET', url: '/v1/cases/a-slug/hypotheses' },
  { description: 'list-hypothesis-revisions', method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions' },
  { description: 'read-vocabulary-term', method: 'GET', url: '/v1/glossary/outcome/an-outcome' },
  { description: 'list-vocabulary-terms', method: 'GET', url: '/v1/glossary/outcome' },
  { description: 'read-concept', method: 'GET', url: '/v1/glossary/concepts/a-concept' },
  { description: 'list-concepts', method: 'GET', url: '/v1/glossary/concepts' },
];

it.each(REGISTERED_ROUTE_REQUESTS)(
  'reaches its own controller rather than answering 404, for the $description route',
  async ({ method, url, payload }) => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method, url, payload });

    expect(response.statusCode).not.toBe(404);
  },
);

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
