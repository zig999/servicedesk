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
import type { ListConnectorConfigurationsControllerDependencies } from '../../../http/list-connector-configurations.controller.js';
import type { ReadCapabilityByIdentityControllerDependencies } from '../../../http/read-capability-by-identity.controller.js';
import type { ReadConnectorConfigurationControllerDependencies } from '../../../http/read-connector-configuration.controller.js';
import type { RegisterCapabilityControllerDependencies } from '../../../http/register-capability.controller.js';
import type { RegisterConceptControllerDependencies } from '../../../http/register-concept.controller.js';
import type { RegisterConnectorControllerDependencies } from '../../../http/register-connector.controller.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import type { TestConnectorControllerDependencies } from '../../../http/test-connector.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { InvestigationPipelineResult } from '../../../investigation/investigation-pipeline.js';
import type { SimulateHypothesisPipelineResult } from '../../../investigation/simulate-hypothesis-pipeline.js';
import type { PaginatedResponse } from '../../../types/pagination.js';

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

function stubCaseQuery(theCase: Case): ICaseQuery {

  return {
    readCase: async () => ({ case: theCase, hash: 'a-hash' }),
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
}

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

function emptyPage<T>(): PaginatedResponse<T> {
  return { data: [], total: 0, limit: 10, offset: 0, pageCount: 0 };
}

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

function stubCapabilityQuery(): ICapabilityQuery {
  return {
    readCapability: async (concept) => ({
      held: true,
      capability: { name: concept, version: '1.0.0', nature: 'read-only', input_schema: 'a-schema', output_schema: 'a-schema', timeout: 1000, connector: 'a-connector', concept },
    }),
    listCapabilities: async () => emptyPage(),
  };
}

function stubGlossaryQuery(): IGlossaryQuery {
  return {
    readVocabularyTerm: async (_vocabulary, name) => ({ held: true, term: { name } }),
    readConcept: async (name) => ({ held: true, concept: { name, accepts: ['a-subject-type'], ttl: 60, description: 'a fixture concept' } }),
    listVocabularyTerms: async () => emptyPage(),
    listConcepts: async () => emptyPage(),
  };
}

function stubReadCapabilityByIdentity(): ReadCapabilityByIdentityControllerDependencies {
  return {
    readCapabilityByIdentity: async (name, version) => ({
      name, version, nature: 'read-only', input_schema: 'a-schema', output_schema: 'a-schema', timeout: 1000, connector: 'a-connector', concept: 'a-concept',
    }),
  };
}

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

function stubRegisterConcept(): RegisterConceptControllerDependencies {
  return {
    registerConcept: async () => ({
      name: 'a-concept',
      accepts: ['a-subject-type'],
      ttl: 60,
      description: 'a fixture concept',
    }),
  };
}

function stubRegisterConnector(): RegisterConnectorControllerDependencies {
  return {
    registerConnector: async () => ({
      connector: 'a-connector',
      configuration: JSON.stringify({}),
    }),
  };
}

function stubReadConnectorConfiguration(): ReadConnectorConfigurationControllerDependencies {
  return {
    readConnectorConfiguration: async () => ({ connector: 'a-connector', configuration: JSON.stringify({}) }),
  };
}

function stubListConnectorConfigurations(): ListConnectorConfigurationsControllerDependencies {
  return {
    listConnectorConfigurations: async () => emptyPage(),
    defaultLimit: 10,
    maxLimit: 100,
  };
}

function stubTestConnector(): TestConnectorControllerDependencies {
  return {
    readCapabilityByIdentity: async (name, version) => ({
      held: true,
      capability: { name, version, nature: 'read-only', input_schema: 'a-schema', output_schema: 'a-schema', timeout: 1000, connector: 'a-connector', concept: 'a-concept' },
    }),
    readConnectorConfiguration: async (connector) => ({
      held: true,
      configuration: { connector, configuration: JSON.stringify({}) },
    }),
    httpClient: (async () => new Response('', { status: 200 })) as typeof fetch,
  };
}

const MINIMAL_SIMULATION_RESULT: InvestigationPipelineResult = {
  evidence: [],
  evaluations: [],
  resolved: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
  assessment: {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a prompt',
  },
  cost: { calls: 0, input_tokens: 0, output_tokens: 0 },
  durations: { collection: 0, judgment: 0, writing: 0, total: 0 },
  prompts: { writing: 'a prompt' },
};

const EXPECTED_SIMULATE_RESPONSE_BODY = {
  evidence: MINIMAL_SIMULATION_RESULT.evidence,
  evaluations: MINIMAL_SIMULATION_RESULT.evaluations,
  resolved: MINIMAL_SIMULATION_RESULT.resolved,
  assessment: MINIMAL_SIMULATION_RESULT.assessment,
  cost: MINIMAL_SIMULATION_RESULT.cost,
  durations: MINIMAL_SIMULATION_RESULT.durations,
};

function stubSimulateCase(caseQuery: ICaseQuery, glossaryQuery: IGlossaryQuery): SimulateCaseControllerDependencies {
  return {
    caseQuery,
    glossary: glossaryQuery,
    runSimulate: vi.fn().mockResolvedValue(MINIMAL_SIMULATION_RESULT),
  };
}

const MINIMAL_HYPOTHESIS_SIMULATION_RESULT: SimulateHypothesisPipelineResult = {
  evidence: [],
  evaluation: { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] },
  durations: { collection: 0, judgment: 0, total: 0 },
};

function stubSimulateHypothesis(caseQuery: ICaseQuery, glossaryQuery: IGlossaryQuery): SimulateHypothesisControllerDependencies {
  return {
    caseQuery,
    glossary: glossaryQuery,
    runSimulateHypothesis: vi.fn().mockResolvedValue(MINIMAL_HYPOTHESIS_SIMULATION_RESULT),
  };
}

type QueryDependentFields = Pick<
  BuildAppDependencies,
  | 'updateDraft'
  | 'release'
  | 'readCase'
  | 'listCases'
  | 'listCaseVersions'
  | 'listHypotheses'
  | 'listHypothesisRevisions'
  | 'readVocabularyTerm'
  | 'listVocabularyTerms'
  | 'readConcept'
  | 'listConcepts'
>;

function stubQueryDependentFields(caseQuery: ICaseQuery, glossaryQuery: IGlossaryQuery): QueryDependentFields {
  return {
    updateDraft: { caseStore: stubCaseStore(), caseQuery },
    release: { release: async () => undefined, caseQuery },
    readCase: { caseQuery },
    listCases: { caseQuery, defaultLimit: 10, maxLimit: 100 },
    listCaseVersions: { caseQuery, defaultLimit: 10, maxLimit: 100 },
    listHypotheses: { caseQuery, defaultLimit: 10, maxLimit: 100 },
    listHypothesisRevisions: { caseQuery, defaultLimit: 10, maxLimit: 100 },
    readVocabularyTerm: { glossaryQuery },
    listVocabularyTerms: { glossaryQuery, defaultLimit: 10, maxLimit: 100 },
    readConcept: { glossaryQuery },
    listConcepts: { glossaryQuery, defaultLimit: 10, maxLimit: 100 },
  };
}

function stubBuildAppDependencies(diagnose: DiagnoseControllerDependencies): BuildAppDependencies {
  const caseQuery = stubCaseQuery(minimalCase()); const glossaryQuery = stubGlossaryQuery();
  return {
    diagnose,
    simulateCase: stubSimulateCase(caseQuery, glossaryQuery),
    simulateHypothesis: stubSimulateHypothesis(caseQuery, glossaryQuery),
    ...stubQueryDependentFields(caseQuery, glossaryQuery),
    readCapability: { capabilityQuery: stubCapabilityQuery() }, readCapabilityByIdentity: stubReadCapabilityByIdentity(),
    readCaseInputRequirements: { caseInputRequirementsQuery: { readCaseInputRequirements: async () => ({ requirements: [], capabilities_with_malformed_input_schema: [] }) } },
    listCapabilities: { capabilityQuery: stubCapabilityQuery(), defaultLimit: 10, maxLimit: 100 },
    registerCapability: stubRegisterCapability(),
    createDraft: { createDraft: async () => ({ slug: 'a-slug', version: 1 }) },
    releaseHypothesisRevision: { releaseHypothesisRevision: async () => undefined },
    discard: { discard: async () => undefined },
    reviseHypothesis: { reviseHypothesis: async () => ({ hypothesis_name: 'a-hypothesis', revision: 1 }) },
    placeHypothesis: { placeHypothesis: async () => undefined },
    removeHypothesis: { removeHypothesis: async () => undefined },
    registerConcept: stubRegisterConcept(),
    registerConnector: stubRegisterConnector(),
    readConnectorConfiguration: stubReadConnectorConfiguration(),
    listConnectorConfigurations: stubListConnectorConfigurations(),
    testConnector: stubTestConnector(),
  };
}

function buildTestApp(): { app: FastifyInstance; runDiagnose: RunDiagnoseMock } {
  const runDiagnose = vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>();
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: stubCaseQuery(minimalCase()),
    caseInputRequirementsQuery: { readCaseInputRequirements: async () => ({ requirements: [], capabilities_with_malformed_input_schema: [] }) },
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

it('answers 200 with the diagnose call\'s resolved assessment narrowed to the response DTO\'s four fields, for a request naming an existing case, subject, narrative and requester', async () => {
  const built = buildTestApp();
  app = built.app;
  const resolvedAssessment: Assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted assessment text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a drafted assessment prompt',
  };
  built.runDiagnose.mockResolvedValueOnce(resolvedAssessment);

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted assessment text',
  });
});

it('carries exactly outcome, referral, determining_hypothesis and text on the wire — never register, usage, elapsed_ms or prompt — when the resolved outcome names a determining hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({
    outcome: 'issue-equipment-fault',
    referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' },
    determining_hypothesis: 'customer-equipment-fault',
    text: 'a drafted assessment text',
    register: 'formal',
    usage: { input_tokens: 3, output_tokens: 5 },
    elapsed_ms: 40,
    prompt: 'a drafted assessment prompt',
  });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.json()).toEqual({
    outcome: 'issue-equipment-fault',
    referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' },
    determining_hypothesis: 'customer-equipment-fault',
    text: 'a drafted assessment text',
  });
});

it('omits determining_hypothesis, register, usage, elapsed_ms and prompt on the wire, and carries no verdict, citation or evidence field, when the resolved outcome names no determining hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({
    outcome: 'a-fallback-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    text: 'a drafted assessment text',
    register: 'plain',
    usage: { input_tokens: 3, output_tokens: 5 },
    elapsed_ms: 40,
    prompt: 'a drafted assessment prompt',
  });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.json()).toEqual({
    outcome: 'a-fallback-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    text: 'a drafted assessment text',
  });
});

it("answers each of two requests naming the same case, subject, narrative and requester with that call's own resolved assessment narrowed to the response DTO's four fields, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  const firstAssessment: Assessment = {
    outcome: 'first-outcome',
    referral: { action: 'a', recipient: 'r' },
    text: 'first-text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'first-prompt',
  };
  const secondAssessment: Assessment = {
    outcome: 'second-outcome',
    referral: { action: 'a', recipient: 'r' },
    text: 'second-text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'second-prompt',
  };
  built.runDiagnose
    .mockResolvedValueOnce(firstAssessment)
    .mockResolvedValueOnce(secondAssessment);
  const body = validRequestBody();

  const firstResponse = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });
  const secondResponse = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });

  expect(firstResponse.json()).toEqual({ outcome: 'first-outcome', referral: { action: 'a', recipient: 'r' }, text: 'first-text' });
  expect(secondResponse.json()).toEqual({ outcome: 'second-outcome', referral: { action: 'a', recipient: 'r' }, text: 'second-text' });
});

it('invokes the diagnose call under a fresh id for each of two requests naming the same case, subject, narrative and requester', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValue({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'p' });
  const body = validRequestBody();

  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });
  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: body });

  expect(built.runDiagnose).toHaveBeenCalledTimes(2);
  const firstId = built.runDiagnose.mock.calls[0]?.[0].id;
  const secondId = built.runDiagnose.mock.calls[1]?.[0].id;
  expect(firstId).not.toBe(secondId);
});

it('passes ticket_ref through as undefined to the diagnose call when the request names none, inventing no placeholder', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'p' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody() });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].ticket_ref).toBeUndefined();
});

it('passes a given ticket_ref straight through to the diagnose call, unchanged', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'p' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody({ ticket_ref: 'TCK-42' }) });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].ticket_ref).toBe('TCK-42');
});

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'p' });

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: validRequestBody(), headers: {} });

  expect(response.statusCode).toBe(200);
});

it("runs the diagnose call under exactly the body's own requester, even when the request carries an authorization header naming a different identity", async () => {
  const built = buildTestApp();
  app = built.app;
  built.runDiagnose.mockResolvedValueOnce({ outcome: 'o', referral: { action: 'a', recipient: 'r' }, text: 't', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'p' });

  const response = await app.inject({
    method: 'POST',
    url: '/v1/diagnose',
    payload: validRequestBody({ requester: 'requester-in-body' }),
    headers: { authorization: 'Bearer token-for-someone-else' },
  });

  expect(response.statusCode).toBe(200);
  expect(built.runDiagnose.mock.calls[0]?.[0].requester).toBe('requester-in-body');
});

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

it('registers every route plugin through one shared app.register() call site, never one repeated per route', async () => {
  const file = fileURLToPath(new URL('../../../http/build-app.ts', import.meta.url));
  const source = await readFile(file, 'utf8');

  const codeOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

  const registerCallSites = codeOnly.match(/app\.register\(/g) ?? [];

  expect(registerCallSites).toHaveLength(1);
});

type RegisteredRouteRequest = {
  readonly description: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly url: string;
  readonly payload?: Record<string, unknown>;
};

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
  { description: 'release-hypothesis-revision', method: 'POST', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/1/release' },
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

it(
  "reaches read-capability-by-identity's own controller on the very first request a freshly built app instance ever receives, " +
    'proving it is registered in routePlugins() with no dependency on any prior call to list-capabilities',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-capability/1.0.0' });

    expect(response.statusCode).toBe(200);
  },
);

it(
  'answers the GET to /v1/capabilities/{name}/{version} through read-capability-by-identity and the PUT to the identical path ' +
    'through register-capability, neither one colliding with the other',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const getResponse = await app.inject({ method: 'GET', url: '/v1/capabilities/a-capability/1.0.0' });
    const putResponse = await app.inject({
      method: 'PUT',
      url: '/v1/capabilities/a-capability/1.0.0',
      payload: {
        nature: 'read-only',
        input_schema: '{"type":"object"}',
        output_schema: '{"type":"object"}',
        connector: 'a-connector',
        concept: 'a-concept',
      },
    });

    expect(getResponse.statusCode).toBe(200);
    expect(putResponse.statusCode).toBe(200);
  },
);

function validSimulateRequestBody(): Record<string, unknown> {
  return {
    case: { slug: 'a-case', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    requester: 'a-requester',
  };
}

it(
  "reaches simulate-case's own controller through the identical routePlugins()/BuildAppDependencies/buildAppDependencies() convention every other route in this file is proven through, on the very first request a freshly built app instance ever receives, answering exactly the complete record runSimulate resolved — no narrative or ticket_ref field",
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'POST', url: '/v1/simulate', payload: validSimulateRequestBody() });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(EXPECTED_SIMULATE_RESPONSE_BODY);
  },
);

it('refuses with 400 a simulate-case request whose subject carries no attribute at all, at the wire, before the route ever reaches its own controller', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'POST',
    url: '/v1/simulate',
    payload: { ...validSimulateRequestBody(), subject: { type: 'a-subject-type', attributes: [] } },
  });

  expect(response.statusCode).toBe(400);
});

it(
  "reaches read-case-input-requirements's own controller through buildApp()'s registration, answering the query's own result unchanged, on the very first request a freshly built app instance ever receives",
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1/input-requirements' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ requirements: [], capabilities_with_malformed_input_schema: [] });
  },
);
