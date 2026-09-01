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

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    capability: { name: 'a-name', version: '1.0.0' },
    connector: 'a-connector',
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'subject-value-1' }] },
    requester: 'a-requester',
    ...overrides,
  };
}

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

it('demonstrates structurally, not by observing an absent side effect, that TestConnectorControllerDependencies exposes only two reads and an HTTP client — no evidence-writing or citation-writing function exists in this shape for the controller to call, since a mocked dependency set has no capacity to prove the absence of a side effect it cannot produce', () => {
  const built = buildTestApp();
  app = built.app;

  const dependencyKeys = Object.keys(built.dependencies).sort();
  expect(dependencyKeys).toEqual(['httpClient', 'readCapabilityByIdentity', 'readConnectorConfiguration']);
});

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

it("names, in its own orphaned_placeholders, a Subject-attribute placeholder the tested connector configuration's call text embeds that the tested capability's own input schema does not declare", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({
    held: true,
    capability: heldCapability({ input_schema: JSON.stringify({ type: 'object', properties: { unrelated_attribute: {} } }) }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(null, { status: 200 }));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  const body = response.json() as TestConnectorResponseDto;
  expect(body.orphaned_placeholders).toEqual(['id']);
});

it("names none in its own orphaned_placeholders when the tested capability's own input schema declares every Subject-attribute placeholder the tested connector configuration's call text embeds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({
    held: true,
    capability: heldCapability({ input_schema: JSON.stringify({ type: 'object', properties: { id: {} } }) }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(null, { status: 200 }));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  const body = response.json() as TestConnectorResponseDto;
  expect(body.orphaned_placeholders).toEqual([]);
});

it('is not refused, and still issues the call and returns the outcome, for a test whose own response reports an orphaned placeholder', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({
    held: true,
    capability: heldCapability({ input_schema: JSON.stringify({ type: 'object', properties: { unrelated_attribute: {} } }) }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockResolvedValueOnce(new Response(JSON.stringify({ value: 1 }), { status: 200 }));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  const body = response.json() as TestConnectorResponseDto & { error?: unknown };
  expect(body.orphaned_placeholders).toEqual(['id']);
  expect(body.error).toBeUndefined();
  expect(body.response.kind).toBe('response');
  expect(built.httpClient).toHaveBeenCalledTimes(1);
});

it('still names the orphaned placeholder in its own response, without itself refusing the test, when the underlying HTTP call fails', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({
    held: true,
    capability: heldCapability({ input_schema: JSON.stringify({ type: 'object', properties: { unrelated_attribute: {} } }) }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfigurationResolution());
  built.httpClient.mockRejectedValueOnce(new Error('a genuine network failure'));

  const response = await app.inject({ method: 'POST', url: '/v1/test-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  const body = response.json() as TestConnectorResponseDto & { error?: unknown };
  expect(body.response.kind).toBe('error');
  expect(body.orphaned_placeholders).toEqual(['id']);
  expect(body.error).toBeUndefined();
});
