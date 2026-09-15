import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS } from '../../../connector-registry/capability-schema-draft.js';
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
