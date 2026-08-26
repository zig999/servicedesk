// Proof for task/connector-diagnostics/test-connector-route: POST
// /v1/test-connector exercised through Fastify's own app.inject() against a
// local instance registering createTestConnectorRoutesPlugin() and
// error-handler.middleware.ts's own handleUnexpectedError directly — the
// same shape register-capability.routes.spec.ts already establishes.
//
// Three boundaries are stood in for (TST-03), never business logic:
// readCapabilityByIdentity, readConnectorConfiguration, and the network
// itself — the controller's own injectable httpClient, a vi.fn() never
// wired to a real fetch. No test below makes a real network call or reaches
// a real store. resolveConnectorRequest and issueConnectorHttpCall are
// pre-existing, separately proven modules (connector-request-resolver.spec.ts,
// connector-http-issuer's own coverage through
// http-declarative-observation-source.adapter.spec.ts); this file proves
// only that the route, controller and DTO carry their behavior onto the
// wire for this new use case — including, for criterion 2, that the request
// actually sent embeds a subject-attribute and a requester value that only
// resolveConnectorRequest's own placeholder substitution could have
// produced from the connector configuration's own '${subject:id}' and
// '${requester}' templates.
//
// Criterion 6 (no evidence and no citation is written) cannot be proven by
// asserting an absence of calls to a store or module the mocked dependency
// set has no reference to at all — a mock cannot demonstrate that a side
// effect it has no capacity to produce did not happen. What is asserted
// instead is structural: TestConnectorControllerDependencies' own shape
// carries only two reads and an HTTP client, so there is nothing else for
// the controller to call even if it wanted to.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityIdentityResolution } from '../../../capability-registry/capability-registry.service.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { TestConnectorResponseDto } from '../../../http/dto/test-connector.dto.js';
import type { TestConnectorControllerDependencies } from '../../../http/test-connector.controller.js';
import { createTestConnectorRoutesPlugin } from '../../../http/test-connector.routes.js';

type ReadCapabilityByIdentityMock = ReturnType<
  typeof vi.fn<(name: string, version: string) => Promise<CapabilityIdentityResolution>>
>;
type ReadConnectorConfigurationMock = ReturnType<
  typeof vi.fn<(connector: string) => Promise<ConnectorConfigurationResolution>>
>;
type HttpClientMock = ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>>;

/** Every attribute testConnectorRequestSchema requires, overridable per test — the same "state only what a test is about" convention register-capability.routes.spec.ts's own validBody keeps. */
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    capability: { name: 'a-name', version: '1.0.0' },
    connector: 'a-connector',
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'subject-value-1' }] },
    requester: 'a-requester',
    ...overrides,
  };
}

/** A capability as readCapabilityByIdentity would resolve it, held. */
function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-name',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{"type":"object"}',
    output_schema: '{"type":"object"}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A connector configuration resolution whose own address and headers each embed one placeholder — '${subject:id}' and '${requester}' — so a test can tell whether resolveConnectorRequest's own substitution actually ran over the given subject and requester. */
function heldConnectorConfigurationResolution(
  configurationOverrides: Readonly<Record<string, unknown>> = {},
): ConnectorConfigurationResolution {
  return {
    held: true,
    configuration: {
      connector: 'a-connector',
      configuration: JSON.stringify({
        address: 'https://api.example.com/subjects/${subject:id}',
        method: 'GET',
        headers: { 'x-requester': '${requester}' },
        responseMap: {},
        statusMap: {},
        ...configurationOverrides,
      }),
    },
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors register-capability.routes.spec.ts's own buildTestApp. */
function buildTestApp(): {
  app: FastifyInstance;
  readCapabilityByIdentity: ReadCapabilityByIdentityMock;
  readConnectorConfiguration: ReadConnectorConfigurationMock;
  httpClient: HttpClientMock;
  dependencies: TestConnectorControllerDependencies;
} {
  const readCapabilityByIdentity: ReadCapabilityByIdentityMock = vi.fn();
  const readConnectorConfiguration: ReadConnectorConfigurationMock = vi.fn();
  const httpClient: HttpClientMock = vi.fn();
  const dependencies: TestConnectorControllerDependencies = {
    readCapabilityByIdentity,
    readConnectorConfiguration,
    httpClient: httpClient as unknown as typeof fetch,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createTestConnectorRoutesPlugin(dependencies));
  return { app, readCapabilityByIdentity, readConnectorConfiguration, httpClient, dependencies };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct from the route\'s own 200 wrapper', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(
    new Response(JSON.stringify({ value: 42 }), { status: 201, headers: { 'x-test-header': 'value-abc' } }),
  );

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  const body = response.json() as TestConnectorResponseDto;
  expect(body.response.kind).toBe('response');
  if (body.response.kind !== 'response') {
    throw new Error('expected a response outcome');
  }
  expect(body.response.status).toBe(201);
  expect(body.response.headers['x-test-header']).toBe('value-abc');
  expect(body.response.body).toEqual({ value: 42 });
  expect(typeof body.response.elapsedMs).toBe('number');
  expect(body.response.elapsedMs).toBeGreaterThanOrEqual(0);
});

// ------------------------------------------------------------------ criterion 2

it('issues the exact request resolveConnectorRequest assembles from the given subject and the connector configuration — the subject-attribute and requester placeholders resolved, not left as literal template text', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(null, { status: 200 }));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(built.httpClient).toHaveBeenCalledTimes(1);
  const [calledUrl, calledInit] = built.httpClient.mock.calls[0] as [string, RequestInit];
  expect(calledUrl).toBe('https://api.example.com/subjects/subject-value-1');
  expect((calledInit.headers as Record<string, string>)['x-requester']).toBe('a-requester');
  expect(calledInit.method).toBe('GET');
  const body = response.json() as TestConnectorResponseDto;
  expect(body.request.address).toBe('https://api.example.com/subjects/subject-value-1');
  expect(body.request.headers['x-requester']).toBe('a-requester');
});

// -------------------------------- task/connector-configuration-registration-conformance/test-connector-parses-stored-configuration
//
// The criterion's own "issues the call the configuration declares, deriving
// method, responseMap and statusMap from the parsed object" is proven for
// `method` by the two criterion-2 tests above: heldConnectorConfigurationResolution()
// stores configuration as JSON *text* (JSON.stringify), and the outbound
// httpClient call above is only ever reached once that text has been parsed
// back into an object and its own 'GET' read from it — an unparsed or
// wrongly-parsed configuration would leave `configuration.method` undefined
// and the request would never be issued at all (see below). What those two
// tests do not observe is `responseMap` and `statusMap`: this route never
// surfaces either in its own response, so the only way to tell they were
// actually read from the parsed text — rather than replaced with an
// always-valid default — is to store a stored text whose own responseMap or
// statusMap, once parsed, is not well-formed, and confirm the call is
// refused for exactly that reason rather than issued anyway.
it("refuses a test-connector request whose stored connector configuration text parses to a responseMap holding a non-string value, proving responseMap is read from the parsed stored text rather than defaulted past", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(
    heldConnectorConfigurationResolution({ responseMap: { value: 123 } }),
  );

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(500);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('INTERNAL_ERROR');
  expect(built.httpClient).not.toHaveBeenCalled();
});

it("refuses a test-connector request whose stored connector configuration text parses to a statusMap holding a value outside the four evidence-result endings, proving statusMap is read from the parsed stored text rather than defaulted past", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(
    heldConnectorConfigurationResolution({ statusMap: { '200': 'not-a-real-ending' } }),
  );

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(500);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('INTERNAL_ERROR');
  expect(built.httpClient).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 3

it('refuses a request naming a capability that is not registered at all, with the status the status map assigns CapabilityNotRegisteredForTestError', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: false, name: 'a-name', version: '1.0.0' });

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('CapabilityNotRegisteredForTestError');
  expect(built.readConnectorConfiguration).not.toHaveBeenCalled();
  expect(built.httpClient).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 4

it("refuses a request naming a connector configuration the capability's own connector does not match, with the status the status map assigns CapabilityConnectorMismatchError", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability({ connector: 'the-actual-connector' }) });

  const response = await app.inject({
    method: 'POST',
    url: '/v1/test-connector',
    payload: validBody({ connector: 'a-different-connector' }),
  });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('CapabilityConnectorMismatchError');
  expect(built.readConnectorConfiguration).not.toHaveBeenCalled();
  expect(built.httpClient).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 5

it("assembles the subject examined from each request's own subject type and attribute-values alone — two requests at the same capability and connector each address the outbound call with their own request's own subject, never a shared or cached one", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValue({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValue(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValue(new Response(null, { status: 200 }));

  await app.inject({
    method: 'POST',
    url: '/v1/test-connector',
    payload: validBody({ subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'subject-value-A' }] } }),
  });
  await app.inject({
    method: 'POST',
    url: '/v1/test-connector',
    payload: validBody({ subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'subject-value-B' }] } }),
  });

  expect(built.httpClient.mock.calls[0]?.[0]).toBe('https://api.example.com/subjects/subject-value-A');
  expect(built.httpClient.mock.calls[1]?.[0]).toBe('https://api.example.com/subjects/subject-value-B');
});

// ------------------------------------------------------------------ criterion 6

it('demonstrates structurally, not by observing an absent side effect, that TestConnectorControllerDependencies exposes only two reads and an HTTP client — no evidence-writing or citation-writing function exists in this shape for the controller to call, since a mocked dependency set has no capacity to prove the absence of a side effect it cannot produce', () => {
  const built = buildTestApp();
  app = built.app;

  // buildTestApp() above typed its own dependencies object literal as
  // TestConnectorControllerDependencies (`const dependencies:
  // TestConnectorControllerDependencies = { readCapabilityByIdentity,
  // readConnectorConfiguration, httpClient }`). If that type ever gained a
  // fourth member — an evidence-writer or a citation-writer — that literal
  // would fail the project's own strict compiler configuration (STK-01)
  // before this test ever ran, missing the newly required member. What
  // follows is the runtime half: the exact key set the controller was
  // actually constructed with, today.
  const dependencyKeys = Object.keys(built.dependencies).sort();
  expect(dependencyKeys).toEqual(['httpClient', 'readCapabilityByIdentity', 'readConnectorConfiguration']);
});

// ------------------------------------------------------------------ criterion 7

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(null, { status: 200 }));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody(), headers: {} });

  expect(response.statusCode).toBe(200);
});

it('answers 200 for a request carrying an authorization header naming no credential this route recognizes, dispatching it exactly as one that carries none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(null, { status: 200 }));

  const response = await app.inject({
    method: 'POST',
    url: '/v1/test-connector',
    payload: validBody(),
    headers: { authorization: 'Bearer not-a-real-credential' },
  });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ edge cases — basic request-body validation

it('answers 400 for a request whose body omits subject entirely, without reaching any dependency', async () => {
  const built = buildTestApp();
  app = built.app;
  const bodyWithoutSubject: Record<string, unknown> = validBody();
  delete bodyWithoutSubject.subject;

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: bodyWithoutSubject });

  expect(response.statusCode).toBe(400);
  expect(built.readCapabilityByIdentity).not.toHaveBeenCalled();
  expect(built.httpClient).not.toHaveBeenCalled();
});

it('answers 400 for a request whose body omits the capability identity entirely, without reaching any dependency', async () => {
  const built = buildTestApp();
  app = built.app;
  const bodyWithoutCapability: Record<string, unknown> = validBody();
  delete bodyWithoutCapability.capability;

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: bodyWithoutCapability });

  expect(response.statusCode).toBe(400);
  expect(built.readCapabilityByIdentity).not.toHaveBeenCalled();
  expect(built.httpClient).not.toHaveBeenCalled();
});
