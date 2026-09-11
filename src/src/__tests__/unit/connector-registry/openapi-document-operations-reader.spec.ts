import { expect, it, vi } from 'vitest';
import { readOpenApiDocumentOperations } from '../../../connector-registry/openapi-document-operations-reader.js';
import type { ReadOpenApiDocumentOperationsOptions } from '../../../connector-registry/openapi-document-operations-reader.js';
import type { IOpenApiDocumentFetcher } from '../../../connector-registry/openapi-document-fetcher.port.js';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';
import { OpenApiDocumentNotReadableError } from '../../../errors/openapi-document-not-readable.error.js';

const A_LINK = 'https://api.example.com/openapi.json';

function fetcherResolvingWith(documentText: string): IOpenApiDocumentFetcher {
  return { fetchOpenApiDocument: async () => documentText };
}

function fetcherRejectingWith(error: unknown): IOpenApiDocumentFetcher {
  return { fetchOpenApiDocument: () => Promise.reject(error) };
}

async function notReadableErrorFrom(promise: Promise<unknown>): Promise<OpenApiDocumentNotReadableError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof OpenApiDocumentNotReadableError) {
      return error;
    }
    throw error;
  }
  throw new Error('expected readOpenApiDocumentOperations to refuse with OpenApiDocumentNotReadableError, but it resolved');
}

it('reads a path declaring a get and a post operation into two entries naming that same path, one per method', async () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/items': { get: {}, post: {} } } });

  const result = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) });

  expect(result.operations).toEqual([
    { path: '/items', method: 'GET' },
    { path: '/items', method: 'POST' },
  ]);
});

it("upper-cases every method regardless of the case the document's own path-item key used", async () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { Get: {}, PoSt: {}, delete: {} } } });

  const result = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) });

  expect(result.operations.map((operation) => operation.method)).toEqual(['GET', 'POST', 'DELETE']);
});

it("names each entry's path exactly as the document declares it, unaltered", async () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/Items/{Item_ID}': { get: {} } } });

  const result = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) });

  expect(result.operations).toEqual([{ path: '/Items/{Item_ID}', method: 'GET' }]);
});

it('answers every operation across every path in one array, ignoring any page, cursor or limit-like field and truncating nothing', async () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/a': { get: {}, post: {} },
      '/b': { get: {}, put: {} },
      '/c': { get: {}, delete: {} },
    },
  });
  const optionsWithBogusPaginationFields: ReadOpenApiDocumentOperationsOptions & {
    readonly page: number;
    readonly cursor: string;
    readonly limit: number;
  } = { link: A_LINK, documentFetcher: fetcherResolvingWith(documentText), page: 1, cursor: 'abc', limit: 1 };

  const result = await readOpenApiDocumentOperations(optionsWithBogusPaginationFields);

  expect(result.operations).toEqual([
    { path: '/a', method: 'GET' },
    { path: '/a', method: 'POST' },
    { path: '/b', method: 'GET' },
    { path: '/b', method: 'PUT' },
    { path: '/c', method: 'GET' },
    { path: '/c', method: 'DELETE' },
  ]);
});

it('propagates the fetcher\'s own refusal unchanged for a network failure, a timeout, or a non-2xx status, attempting no parse', async () => {
  const fetchFailures = [
    new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' }),
    new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'timeout' }),
    new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'status-outside-2xx', status: 503 }),
  ];

  for (const fetchFailure of fetchFailures) {
    const refusal = await readOpenApiDocumentOperations({
      link: A_LINK,
      documentFetcher: fetcherRejectingWith(fetchFailure),
    }).catch((error: unknown) => error);

    expect(refusal).toBe(fetchFailure);
  }
});

it('resolves once the fetcher itself resolves, however long that takes, imposing no timeout of its own', async () => {
  vi.useFakeTimers();
  try {
    let resolveFetch: (value: string) => void = () => {};
    const pendingFetcher: IOpenApiDocumentFetcher = {
      fetchOpenApiDocument: () =>
        new Promise<string>((resolve) => {
          resolveFetch = resolve;
        }),
    };

    const resultPromise = readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: pendingFetcher });
    await vi.advanceTimersByTimeAsync(120_000);
    resolveFetch(JSON.stringify({ openapi: '3.0.0', paths: { '/items': { get: {} } } }));
    const result = await resultPromise;

    expect(result.operations).toEqual([{ path: '/items', method: 'GET' }]);
  } finally {
    vi.useRealTimers();
  }
});

it('answers with an empty operations array when the fetched document declares no paths at all', async () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: {} });

  const result = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) });

  expect(result.operations).toEqual([]);
});

it('refuses a document declaring swagger 2.0, naming the declared version, with no operations read', async () => {
  const documentText = JSON.stringify({ swagger: '2.0', paths: { '/items': { get: {} } } });

  const error = await notReadableErrorFrom(
    readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) }),
  );

  expect(error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '2.0' });
});

it('refuses fetched text that parses as neither JSON nor YAML, naming what failed to parse', async () => {
  const documentText = 'just some plain prose, neither JSON nor a YAML mapping at all';

  const error = await notReadableErrorFrom(
    readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) }),
  );

  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('refuses a document that parses but declares no version at all, naming that distinctly from a parse failure or an unsupported version', async () => {
  const documentText = JSON.stringify({ paths: {} });

  const error = await notReadableErrorFrom(
    readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) }),
  );

  expect(error.context).toEqual({ kind: 'no-version-declared' });
});

it('reads a YAML OpenAPI 3.x document into the same operations as the equivalent JSON document', async () => {
  const jsonText = JSON.stringify({ openapi: '3.0.0', paths: { '/ping': { get: {} } } });
  const yamlText = 'openapi: "3.0.0"\npaths:\n  /ping:\n    get: {}\n';

  const fromJson = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(jsonText) });
  const fromYaml = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(yamlText) });

  expect(fromYaml).toEqual(fromJson);
});

it('answers strictly from whatever the injected fetcher resolves, with no alternate source for the document text', async () => {
  const firstDocument = JSON.stringify({ openapi: '3.0.0', paths: { '/first': { get: {} } } });
  const secondDocument = JSON.stringify({ openapi: '3.0.0', paths: { '/second': { post: {} } } });

  const firstResult = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(firstDocument) });
  const secondResult = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(secondDocument) });

  expect(firstResult.operations).toEqual([{ path: '/first', method: 'GET' }]);
  expect(secondResult.operations).toEqual([{ path: '/second', method: 'POST' }]);
});

it('answers with exactly the operations it read, generating no connector configuration draft and issuing no register-connector call', async () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/items': { get: {}, post: {} } } });

  const result = await readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(documentText) });

  expect(result).toEqual({
    operations: [
      { path: '/items', method: 'GET' },
      { path: '/items', method: 'POST' },
    ],
  });
});

it('refuses every out-of-range declared version, not only swagger 2.0, naming the version each document declares', async () => {
  const openapi4Text = JSON.stringify({ openapi: '4.0.0', paths: {} });
  const swagger1Text = JSON.stringify({ swagger: '1.2', paths: {} });

  const openapi4Error = await notReadableErrorFrom(
    readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(openapi4Text) }),
  );
  const swagger1Error = await notReadableErrorFrom(
    readOpenApiDocumentOperations({ link: A_LINK, documentFetcher: fetcherResolvingWith(swagger1Text) }),
  );

  expect(openapi4Error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '4.0.0' });
  expect(swagger1Error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '1.2' });
});

it('keeps a fetch failure and an unreadable document as two distinguishable refusals, neither an instance of the other', async () => {
  const fetchFailure = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' });

  const unfetchableRefusal = await readOpenApiDocumentOperations({
    link: A_LINK,
    documentFetcher: fetcherRejectingWith(fetchFailure),
  }).catch((error: unknown) => error);
  const unreadableRefusal = await notReadableErrorFrom(
    readOpenApiDocumentOperations({
      link: A_LINK,
      documentFetcher: fetcherResolvingWith('neither JSON nor YAML at all'),
    }),
  );

  expect(unfetchableRefusal).toBeInstanceOf(OpenApiDocumentNotFetchedError);
  expect(unfetchableRefusal).not.toBeInstanceOf(OpenApiDocumentNotReadableError);
  expect(unreadableRefusal).not.toBeInstanceOf(OpenApiDocumentNotFetchedError);
});
