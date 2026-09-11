import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';
import type { ReadOpenApiDocumentOperationsControllerDependencies } from '../../../http/read-openapi-document-operations.controller.js';
import { createReadOpenApiDocumentOperationsRoutesPlugin } from '../../../http/read-openapi-document-operations.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';

const ROUTE_URL = '/v1/read-openapi-document-operations';

type FetchMock = ReturnType<typeof vi.fn<(link: string) => Promise<string>>>;

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    link: 'https://example.com/openapi.json',
    ...overrides,
  };
}

function documentWith(paths: Record<string, unknown>): string {
  return JSON.stringify({ openapi: '3.0.0', paths });
}

function buildTestApp(): { app: FastifyInstance; fetchOpenApiDocument: FetchMock } {
  const fetchOpenApiDocument: FetchMock = vi.fn();
  const dependencies: ReadOpenApiDocumentOperationsControllerDependencies = {
    documentFetcher: { fetchOpenApiDocument },
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadOpenApiDocumentOperationsRoutesPlugin(dependencies));
  return { app, fetchOpenApiDocument };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it(
  "answers 200 with exactly the fetched document's every operation, each entry carrying exactly its own path and " +
    "upper-cased method and no other key, and forwards the request's own link unchanged to the injected fetcher, " +
    'for a request naming one OpenAPI document link',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(
      documentWith({ '/widgets': { get: {} }, '/gadgets': { post: {} } }),
    );

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      operations: [
        { path: '/widgets', method: 'GET' },
        { path: '/gadgets', method: 'POST' },
      ],
    });
    expect(built.fetchOpenApiDocument).toHaveBeenCalledWith('https://example.com/openapi.json');
  },
);

it(
  "answers each of two requests naming a different link with that call's own complete, freshly-read operations list " +
    '— never a cached or shortened one — proving the read is neither cached across calls nor paged within one',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument
      .mockResolvedValueOnce(documentWith({ '/first': { get: {} }, '/second': { post: {} }, '/third': { put: {} } }))
      .mockResolvedValueOnce(documentWith({ '/only': { delete: {} } }));

    const firstResponse = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: 'link-one' }) });
    const secondResponse = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: 'link-two' }) });

    expect(firstResponse.json()).toEqual({
      operations: [
        { path: '/first', method: 'GET' },
        { path: '/second', method: 'POST' },
        { path: '/third', method: 'PUT' },
      ],
    });
    expect(secondResponse.json()).toEqual({ operations: [{ path: '/only', method: 'DELETE' }] });
  },
);

it(
  "upper-cases an operation's method whatever case the fetched document's own path-item key names it under",
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(documentWith({ '/widgets': { PuT: {} } }));

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.json()).toEqual({ operations: [{ path: '/widgets', method: 'PUT' }] });
  },
);

it('refuses with 400 VALIDATION_ERROR and issues no fetch, for a request naming no document link at all', async () => {
  const built = buildTestApp();
  app = built.app;
  const withoutLink = validBody();
  delete withoutLink.link;

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: withoutLink });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string; message: string; details: readonly unknown[] } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(body.error.details.length).toBeGreaterThan(0);
  expect(built.fetchOpenApiDocument).not.toHaveBeenCalled();
});

it('refuses with 400 VALIDATION_ERROR and issues no fetch, for a request whose link is not a string', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody({ link: 12345 }) });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string; details: readonly unknown[] } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(body.error.details.length).toBeGreaterThan(0);
  expect(built.fetchOpenApiDocument).not.toHaveBeenCalled();
});

it(
  'answers 422 reporting OpenApiDocumentNotFetchedError naming the fetch failure — never swallowing it into 200 ' +
    'with an empty operations list, and never falling through to the generic 500 handler — when the named link ' +
    'cannot be fetched at all',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockRejectedValueOnce(
      new OpenApiDocumentNotFetchedError('https://example.com/openapi.json', { kind: 'network-failure' }),
    );

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(422);
    const body = response.json() as { error: { code: string; details: unknown } };
    expect(body.error.code).toBe('OpenApiDocumentNotFetchedError');
    expect(body.error.details).toEqual({ link: 'https://example.com/openapi.json', kind: 'network-failure' });
  },
);

const UNREADABLE_DOCUMENT_CASES: ReadonlyArray<{
  readonly description: string;
  readonly fetchedText: string;
  readonly expectedDetails: Record<string, unknown>;
}> = [
  { description: 'the fetched text does not parse as JSON or YAML at all', fetchedText: 'null', expectedDetails: { kind: 'unparseable', detail: 'the fetched document text' } },
  { description: 'the document declares neither an openapi nor a swagger version field', fetchedText: JSON.stringify({ paths: {} }), expectedDetails: { kind: 'no-version-declared' } },
  { description: 'the document declares an unsupported openapi version', fetchedText: JSON.stringify({ openapi: '2.0', paths: {} }), expectedDetails: { kind: 'unsupported-version', declaredVersion: '2.0' } },
];

it.each(UNREADABLE_DOCUMENT_CASES)(
  'answers 422 reporting OpenApiDocumentNotReadableError naming its own distinct condition, never conflated with ' +
    'either of the other two, reading no operations, when $description',
  async ({ fetchedText, expectedDetails }) => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(fetchedText);

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(422);
    const body = response.json() as { error: { code: string; details: unknown } };
    expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
    expect(body.error.details).toEqual(expectedDetails);
    expect(body).not.toHaveProperty('operations');
  },
);

it(
  'refuses the read, naming the declared version and reading no operations, when an OpenAPI document link answers ' +
    'a document declaring swagger 2.0',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ swagger: '2.0', paths: {} }));

    const response = await app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(response.statusCode).toBe(422);
    const body = response.json() as { error: { code: string; details: unknown }; operations?: unknown };
    expect(body.error.code).toBe('OpenApiDocumentNotReadableError');
    expect(body.error.details).toEqual({ kind: 'unsupported-version', declaredVersion: '2.0' });
    expect(body.operations).toBeUndefined();
  },
);

it(
  'answers a link that cannot be fetched and a document that cannot be read under their own distinct 422 error ' +
    'code — an unfetchable link is never reported as an unreadable document, nor the other way round',
  async () => {
    const unfetchable = buildTestApp();
    app = unfetchable.app;
    unfetchable.fetchOpenApiDocument.mockRejectedValueOnce(
      new OpenApiDocumentNotFetchedError('https://example.com/openapi.json', { kind: 'timeout' }),
    );
    const unfetchableResponse = await unfetchable.app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });
    await unfetchable.app.close();

    const unreadable = buildTestApp();
    app = unreadable.app;
    unreadable.fetchOpenApiDocument.mockResolvedValueOnce('null');
    const unreadableResponse = await unreadable.app.inject({ method: 'POST', url: ROUTE_URL, payload: validBody() });

    expect(unfetchableResponse.statusCode).toBe(422);
    expect(unreadableResponse.statusCode).toBe(422);
    const unfetchableCode = (unfetchableResponse.json() as { error: { code: string } }).error.code;
    const unreadableCode = (unreadableResponse.json() as { error: { code: string } }).error.code;
    expect(unfetchableCode).toBe('OpenApiDocumentNotFetchedError');
    expect(unreadableCode).toBe('OpenApiDocumentNotReadableError');
    expect(unfetchableCode).not.toBe(unreadableCode);
  },
);
