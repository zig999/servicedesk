import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS } from '../../../connector-registry/capability-schema-draft.js';
import {
  OpenApiDocumentNotFetchedError,
  type OpenApiDocumentFetchOutcome,
} from '../../../errors/openapi-document-not-fetched.error.js';
import type { DraftCapabilitySchemaFromOpenApiControllerDependencies } from '../../../http/draft-capability-schema-from-openapi.controller.js';
import { createDraftCapabilitySchemaFromOpenApiRoutesPlugin } from '../../../http/draft-capability-schema-from-openapi.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';

const ROUTE_URL = '/v1/draft-capability-schema-from-openapi';

type FetchMock = ReturnType<typeof vi.fn<(link: string) => Promise<string>>>;

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    link: 'in-memory-fixture-link',
    path: '/widgets',
    method: 'GET',
    ...overrides,
  };
}

function minimalDocument(): string {
  return JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': { description: 'ok' } } } } },
  });
}

const QUERY_PARAMETER_DOCUMENT = JSON.stringify({
  openapi: '3.0.0',
  paths: {
    '/widgets': {
      get: {
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'ok' } },
      },
    },
  },
});

const MIXED_RESOLUTION_DOCUMENT = JSON.stringify({
  openapi: '3.0.0',
  paths: {
    '/widgets/{id}': {
      get: {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'filter', in: 'query', schema: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
        ],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } } } } },
        },
        responses: {
          '200': {
            description: 'ok',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    meta: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

function buildTestApp(): { app: FastifyInstance; fetchOpenApiDocument: FetchMock } {
  const fetchOpenApiDocument: FetchMock = vi.fn();
  const dependencies: DraftCapabilitySchemaFromOpenApiControllerDependencies = {
    documentFetcher: { fetchOpenApiDocument },
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies));
  return { app, fetchOpenApiDocument };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it(
  "fetches the operator-named document through the injected document fetcher, using the request's own link, " +
    'and answers HTTP 200 for a well-formed request that generates a draft',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(built.fetchOpenApiDocument).toHaveBeenCalledWith('in-memory-fixture-link');
    expect(response.statusCode).toBe(200);
  },
);

it(
  'answers exactly input_schema, output_schema and unresolved on a generated draft — the value object\'s three ' +
    'declared attributes and no other key',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    const body = response.json() as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['input_schema', 'output_schema', 'unresolved']);
    expect(typeof body.input_schema).toBe('string');
    expect(typeof body.output_schema).toBe('string');
    expect(Array.isArray(body.unresolved)).toBe(true);
  },
);

it(
  "derives input_schema and output_schema from the named operation's resolvable parameters, request-body field " +
    'and success response field, for an operation whose document declares a resolvable path parameter and a ' +
    'resolvable response field alongside unresolvable ones',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(MIXED_RESOLUTION_DOCUMENT);

    const response = await app.inject({
      method: 'POST',
      url: ROUTE_URL,
      payload: validBody({ path: '/widgets/{id}' }),
    });

    const body = response.json() as { input_schema: string; output_schema: string };
    expect(body.input_schema).toBe(JSON.stringify({ properties: { id: { type: 'string' } }, required: ['id'] }));
    expect(body.output_schema).toBe(JSON.stringify({ properties: { total: { type: 'integer' } } }));
  },
);

it(
  'names each unresolved item by its own name and its own reason, and no other field, for the same operation ' +
    'declaring an unresolvable parameter, a name claimed by another parameter and an unresolvable response field',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(MIXED_RESOLUTION_DOCUMENT);

    const response = await app.inject({
      method: 'POST',
      url: ROUTE_URL,
      payload: validBody({ path: '/widgets/{id}' }),
    });

    const body = response.json() as { unresolved: readonly Record<string, unknown>[] };
    expect(body.unresolved.map((item) => item.name).sort()).toEqual(['filter', 'id', 'meta']);
    for (const item of body.unresolved) {
      expect(Object.keys(item).sort()).toEqual(['name', 'reason']);
    }
  },
);

it(
  'carries a reason for every unresolved item drawn from exactly schema-not-reducible-to-a-type and ' +
    'name-claimed-by-another-parameter, realizing both from one request',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(MIXED_RESOLUTION_DOCUMENT);

    const response = await app.inject({
      method: 'POST',
      url: ROUTE_URL,
      payload: validBody({ path: '/widgets/{id}' }),
    });

    const body = response.json() as { unresolved: readonly { reason: string }[] };
    const reasonsUsed = new Set(body.unresolved.map((item) => item.reason));
    for (const reason of reasonsUsed) {
      expect(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS).toContain(reason);
    }
    expect([...reasonsUsed].sort()).toEqual([...CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS].sort());
  },
);

it(
  "answers a second request naming a different operation with that operation's own freshly generated draft, " +
    'never a draft carried over from an earlier request',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(minimalDocument());
    const first = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });
    expect((first.json() as { input_schema: string }).input_schema).toBe(JSON.stringify({ properties: {} }));

    built.fetchOpenApiDocument.mockResolvedValueOnce(QUERY_PARAMETER_DOCUMENT);
    const second = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect((second.json() as { input_schema: string }).input_schema).toBe(
      JSON.stringify({ properties: { q: { type: 'string' } } }),
    );
  },
);

const REQUIRED_FIELDS = ['link', 'path', 'method'] as const;

it.each(REQUIRED_FIELDS)(
  'refuses with 400, code VALIDATION_ERROR and a non-empty details list when %s is missing from the body, ' +
    'without reaching the document fetcher',
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

it('refuses with 400 a request whose link is an empty string', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: '' }) });

  expect(response.statusCode).toBe(400);
});

it(
  'fetches through the injected document-fetcher port and reads the operation via the existing ' +
    'openapi-operation-reader module, declaring no second implementation of either',
  async () => {
    const file = fileURLToPath(
      new URL('../../../connector-registry/capability-schema-draft-generation.ts', import.meta.url),
    );
    const source = await readFile(file, 'utf8');

    expect(source).toMatch(/import\s*\{\s*readOpenApiOperation\s*\}\s*from\s*['"]\.\/openapi-operation-reader\.js['"]/);
    expect(source).not.toContain('JSON.parse');
    expect(source).not.toContain('js-yaml');
  },
);

const REFUSAL_LINK = 'https://example.com/openapi.json';

type FetchFailureCase = {
  readonly name: string;
  readonly outcome: OpenApiDocumentFetchOutcome;
  readonly expectedDetails: Record<string, unknown>;
};

const FETCH_FAILURE_CASES: readonly FetchFailureCase[] = [
  {
    name: 'a network failure reaching the link',
    outcome: { kind: 'network-failure' },
    expectedDetails: { link: REFUSAL_LINK, kind: 'network-failure' },
  },
  {
    name: 'the link not answering before the fetch timeout elapses',
    outcome: { kind: 'timeout' },
    expectedDetails: { link: REFUSAL_LINK, kind: 'timeout' },
  },
  {
    name: 'the link answering with a status outside the 2xx range',
    outcome: { kind: 'status-outside-2xx', status: 503 },
    expectedDetails: { link: REFUSAL_LINK, kind: 'status-outside-2xx', status: 503 },
  },
];

it.each(FETCH_FAILURE_CASES)(
  "answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly the link and the failure's own fields, and no draft field, for $name",
  async ({ outcome, expectedDetails }) => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockRejectedValueOnce(new OpenApiDocumentNotFetchedError(REFUSAL_LINK, outcome));

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: REFUSAL_LINK }) });

    expect(response.statusCode).toBe(422);
    const body = response.json() as { error: { code: string; details: unknown } };
    expect(body.error.code).toBe('OpenApiDocumentNotFetchedError');
    expect(body.error.details).toEqual(expectedDetails);
    expect(Object.keys(response.json() as object)).toEqual(['error']);
  },
);

type UnreadableDocumentCase = {
  readonly name: string;
  readonly documentText: string;
  readonly expectedDetails: Record<string, unknown>;
};

const UNREADABLE_DOCUMENT_CASES: readonly UnreadableDocumentCase[] = [
  {
    name: 'a fetched document that does not parse in either serialization OpenAPI 3.x defines',
    documentText: 'null',
    expectedDetails: { kind: 'unparseable', detail: 'the fetched document text', link: REFUSAL_LINK },
  },
  {
    name: 'a fetched document whose declared version is not OpenAPI 3.x',
    documentText: JSON.stringify({ openapi: '2.0', paths: {} }),
    expectedDetails: { kind: 'unsupported-version', declaredVersion: '2.0', link: REFUSAL_LINK },
  },
  {
    name: 'a fetched document declaring no version at all',
    documentText: JSON.stringify({ paths: {} }),
    expectedDetails: { kind: 'no-version-declared', link: REFUSAL_LINK },
  },
];

it.each(UNREADABLE_DOCUMENT_CASES)(
  "answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly its own reason and the operator-named link, and no draft field, for $name",
  async ({ documentText, expectedDetails }) => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(documentText);

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: REFUSAL_LINK }) });

    expect(response.statusCode).toBe(422);
    const body = response.json() as { error: { code: string; details: unknown } };
    expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
    expect(body.error.details).toEqual(expectedDetails);
    expect(Object.keys(response.json() as object)).toEqual(['error']);
  },
);

it(
  'answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method, and no draft ' +
    'field, when the document parses and declares OpenAPI 3.x but declares no such operation',
  async () => {
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
    expect(Object.keys(response.json() as object)).toEqual(['error']);
  },
);

it(
  "answers 500 with code INTERNAL_ERROR and the fixed message 'an unexpected error occurred', disclosing neither " +
    "an unmapped error's own message nor any context it carries, when the document fetch throws an error the " +
    'status map does not name',
  async () => {
    const built = buildTestApp();
    app = built.app;
    const unmapped: Error & { context?: unknown } = new Error('internal detail that must never reach the caller');
    unmapped.context = { secret: 'must never reach the caller either' };
    built.fetchOpenApiDocument.mockRejectedValueOnce(unmapped);

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  },
);
