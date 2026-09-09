import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { RegisteredCapabilityForPlaceholderCheck } from '../../../connector-registry/capabilities-reader.port.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';
import type { DraftConnectorConfigurationFromOpenApiControllerDependencies } from '../../../http/draft-connector-configuration-from-openapi.controller.js';
import { createDraftConnectorConfigurationFromOpenApiRoutesPlugin } from '../../../http/draft-connector-configuration-from-openapi.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';

const ROUTE_URL = '/v1/draft-connector-configuration-from-openapi';

type FetchMock = ReturnType<typeof vi.fn<(link: string) => Promise<string>>>;
type ReadCapabilitiesMock = ReturnType<
  typeof vi.fn<() => Promise<readonly RegisteredCapabilityForPlaceholderCheck[]>>
>;
type ReadConnectorConfigurationMock = ReturnType<
  typeof vi.fn<(connector: string) => Promise<ConnectorConfigurationResolution>>
>;

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    connector: 'a-connector',
    link: 'in-memory-fixture-link',
    path: '/widgets',
    method: 'GET',
    ...overrides,
  };
}

function minimalDocument(paths: Record<string, unknown> = { '/widgets': { get: {} } }): string {
  return JSON.stringify({ openapi: '3.0.0', paths });
}

const PARAMETERIZED_DOCUMENT = JSON.stringify({
  openapi: '3.0.0',
  paths: { '/widgets/{id}': { get: { parameters: [{ name: 'id', in: 'path' }] } } },
});

const SECURED_DOCUMENT = JSON.stringify({
  openapi: '3.0.0',
  paths: { '/widgets': { get: { security: [{ ApiKeyAuth: [] }] } } },
  components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'X-Api-Key', in: 'header' } } },
});

function buildTestApp(): {
  app: FastifyInstance;
  fetchOpenApiDocument: FetchMock;
  readCapabilities: ReadCapabilitiesMock;
  readConnectorConfiguration: ReadConnectorConfigurationMock;
} {
  const fetchOpenApiDocument: FetchMock = vi.fn();
  const readCapabilities: ReadCapabilitiesMock = vi.fn().mockResolvedValue([]);
  const readConnectorConfiguration: ReadConnectorConfigurationMock = vi
    .fn()
    .mockResolvedValue({ held: false, connector: 'a-connector' });
  const dependencies: DraftConnectorConfigurationFromOpenApiControllerDependencies = {
    documentFetcher: { fetchOpenApiDocument },
    capabilitiesReader: { readCapabilities },
    registry: { readConnectorConfiguration },
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies));
  return { app, fetchOpenApiDocument, readCapabilities, readConnectorConfiguration };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it(
  'answers 200 with exactly connector, configuration, unresolved and generated_credentials — and no ' +
    'method_mismatch key at all — for an operation with no parameters, no security scheme and no configuration ' +
    'currently registered for the connector',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      connector: 'a-connector',
      configuration: JSON.stringify({ method: 'GET', address: '/widgets' }),
      unresolved: [],
      generated_credentials: [],
    });
  },
);

it(
  'adds method_mismatch, alongside exactly the same four other fields and no other key, when a different method ' +
    'is currently registered for the connector',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());
    built.readConnectorConfiguration.mockResolvedValueOnce({
      held: true,
      configuration: { connector: 'a-connector', configuration: JSON.stringify({ method: 'POST' }) },
    });

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      connector: 'a-connector',
      configuration: JSON.stringify({ method: 'GET', address: '/widgets' }),
      unresolved: [],
      generated_credentials: [],
      method_mismatch: { registered: 'POST', operation: 'GET' },
    });
  },
);

it(
  'carries a generated credential naming only its own generated name and security scheme — never a value field ' +
    '— when the operation requires an apiKey security scheme',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(SECURED_DOCUMENT);

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    const body = response.json() as { generated_credentials: readonly Record<string, unknown>[] };
    expect(body.generated_credentials).toEqual([{ name: 'A_CONNECTOR_APIKEYAUTH', security_scheme: 'ApiKeyAuth' }]);
  },
);

it('names the unresolved parameter by its own name and reason, unchanged, when no capability is registered for the connector at all', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(PARAMETERIZED_DOCUMENT);

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ path: '/widgets/{id}' }) });

  const body = response.json() as { unresolved: readonly Record<string, unknown>[] };
  expect(body.unresolved).toEqual([{ name: 'id', reason: 'no-capability-registered' }]);
});

it('carries no capability name, version or count anywhere in the response, even though two capabilities are registered against the drafted connector', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(PARAMETERIZED_DOCUMENT);
  built.readCapabilities.mockResolvedValueOnce([
    { connector: 'a-connector', input_schema: JSON.stringify({ properties: { id: {} } }) },
    { connector: 'a-connector', input_schema: JSON.stringify({ properties: { id: {} } }) },
  ]);

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ path: '/widgets/{id}' }) });

  expect(Object.keys(response.json() as object).sort()).toEqual([
    'configuration',
    'connector',
    'generated_credentials',
    'unresolved',
  ]);
});

it(
  "reaches its own controller and answers only through the injected document fetcher and registry — never a " +
    'fetcher or registry it constructs itself — for a link that resolves to nothing over a real network',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());

    const response = await app.inject({
      method: 'POST',
      url: ROUTE_URL,
      payload: validBody({ link: 'not-a-real-network-address' }),
    });

    expect(response.statusCode).toBe(200);
    expect(built.fetchOpenApiDocument).toHaveBeenCalledWith('not-a-real-network-address');
    expect(built.readConnectorConfiguration).toHaveBeenCalledWith('a-connector');
  },
);

it("accepts a method field naming no standard HTTP verb, matching it case-insensitively against the document's own declared operation key", async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { purge: {} } } }));

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ method: 'Purge' }) });

  expect(response.statusCode).toBe(200);
});

const REQUIRED_FIELDS = ['connector', 'link', 'path', 'method'] as const;

it.each(REQUIRED_FIELDS)(
  'refuses with 400, code VALIDATION_ERROR and a non-empty details list when %s is missing from the body, without reaching the document fetcher',
  async (field) => {
    const built = buildTestApp();
    app = built.app;
    const withoutField = validBody();
    delete withoutField[field];

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: withoutField });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { error: { code: string; message: string; details: readonly unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('the request body failed validation');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(built.fetchOpenApiDocument).not.toHaveBeenCalled();
  },
);

it('refuses with 400 and a non-empty details list for a request whose body is empty entirely', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: {} });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { details: readonly unknown[] } };
  expect(body.error.details.length).toBeGreaterThan(0);
});

it('refuses with 400 a request whose connector is an empty string', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ connector: '' }) });

  expect(response.statusCode).toBe(400);
});

it('answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status key — when the link cannot be reached at all', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockRejectedValueOnce(
    new OpenApiDocumentNotFetchedError('https://example.com/openapi.json', { kind: 'network-failure' }),
  );

  const response = await app.inject({
    method: 'POST',
    url: ROUTE_URL,
    payload: validBody({ link: 'https://example.com/openapi.json' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotFetchedError');
  expect(body.error.details).toEqual({ link: 'https://example.com/openapi.json', kind: 'network-failure' });
});

it('answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status key — when the link times out', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockRejectedValueOnce(
    new OpenApiDocumentNotFetchedError('https://example.com/openapi.json', { kind: 'timeout' }),
  );

  const response = await app.inject({
    method: 'POST',
    url: ROUTE_URL,
    payload: validBody({ link: 'https://example.com/openapi.json' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotFetchedError');
  expect(body.error.details).toEqual({ link: 'https://example.com/openapi.json', kind: 'timeout' });
});

it('answers 422 reporting OpenApiDocumentNotFetchedError with exactly link, kind and the answered status when the link answers outside 2xx', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockRejectedValueOnce(
    new OpenApiDocumentNotFetchedError('https://example.com/openapi.json', { kind: 'status-outside-2xx', status: 503 }),
  );

  const response = await app.inject({
    method: 'POST',
    url: ROUTE_URL,
    payload: validBody({ link: 'https://example.com/openapi.json' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotFetchedError');
  expect(body.error.details).toEqual({
    link: 'https://example.com/openapi.json',
    kind: 'status-outside-2xx',
    status: 503,
  });
});

it('answers 422 reporting OpenApiDocumentNotReadableError naming what failed to parse, when the fetched text does not parse to a document', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce('null');

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
  expect(body.error.details).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('answers 422 reporting OpenApiDocumentNotReadableError naming the declared version, when the document declares an unsupported OpenAPI version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi: '2.0', paths: {} }));

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
  expect(body.error.details).toEqual({ kind: 'unsupported-version', declaredVersion: '2.0' });
});

it('answers 422 reporting OpenApiDocumentNotReadableError naming that no version was declared, when the document declares neither openapi nor swagger', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ paths: {} }));

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
  expect(body.error.details).toEqual({ kind: 'no-version-declared' });
});

it('answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method, when the document declares no such operation', async () => {
  const built = buildTestApp();
  app = built.app;
  built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());

  const response = await app.inject({
    method: 'POST',
    url: ROUTE_URL,
    payload: validBody({ path: '/no-such-path', method: 'DELETE' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details: unknown } };
  expect(body.error.code).toBe('OpenApiOperationNotFoundError');
  expect(body.error.details).toEqual({ path: '/no-such-path', method: 'DELETE' });
});
