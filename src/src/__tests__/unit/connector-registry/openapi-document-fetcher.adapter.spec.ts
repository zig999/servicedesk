import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { OpenApiDocumentFetcher } from '../../../connector-registry/openapi-document-fetcher.adapter.js';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';

const A_LINK = 'https://api.example.com/openapi.json';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function newHttpClient(): ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>> {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
}

function newPendingUntilAbortedHttpClient(): ReturnType<typeof newHttpClient> {
  return newHttpClient().mockImplementation(
    (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
  );
}

function aFetcher(httpClient: ReturnType<typeof newHttpClient>): OpenApiDocumentFetcher {
  return new OpenApiDocumentFetcher({ httpClient: httpClient as unknown as typeof fetch });
}

it('refuses a link answering HTTP 404 with OpenApiDocumentNotFetchedError naming status-outside-2xx and the answered status', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 404 }));
  const fetcher = aFetcher(httpClient);

  await expect(fetcher.fetchOpenApiDocument(A_LINK)).rejects.toMatchObject({
    name: 'OpenApiDocumentNotFetchedError',
    context: { link: A_LINK, kind: 'status-outside-2xx', status: 404 },
  });
});

it('refuses a link answering a different non-2xx status (503) the same way, carrying that status rather than only ever 404', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 503 }));
  const fetcher = aFetcher(httpClient);

  await expect(fetcher.fetchOpenApiDocument(A_LINK)).rejects.toMatchObject({
    name: 'OpenApiDocumentNotFetchedError',
    context: { link: A_LINK, kind: 'status-outside-2xx', status: 503 },
  });
});

it('never reads the response body on a non-2xx answer, refusing before any parse is attempted', async () => {
  const response = new Response(null, { status: 404 });
  const textSpy = vi.spyOn(response, 'text');
  const httpClient = newHttpClient().mockResolvedValue(response);
  const fetcher = aFetcher(httpClient);

  await expect(fetcher.fetchOpenApiDocument(A_LINK)).rejects.toThrow(OpenApiDocumentNotFetchedError);

  expect(textSpy).not.toHaveBeenCalled();
});

it('refuses a rejected outbound call with OpenApiDocumentNotFetchedError naming network-failure, preserving the original rejection as cause', async () => {
  const transportRejection = new Error('a genuine network failure');
  const httpClient = newHttpClient().mockRejectedValue(transportRejection);
  const fetcher = aFetcher(httpClient);

  const refusal = await fetcher.fetchOpenApiDocument(A_LINK).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(OpenApiDocumentNotFetchedError);
  expect((refusal as OpenApiDocumentNotFetchedError).context).toEqual({ link: A_LINK, kind: 'network-failure' });
  expect((refusal as OpenApiDocumentNotFetchedError).cause).toBe(transportRejection);
});

it('abandons the fetch as a timeout once 60000ms elapse with no answer, refusing with kind timeout', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const fetcher = aFetcher(httpClient);
  const refusalPromise = fetcher.fetchOpenApiDocument(A_LINK).catch((error: unknown) => error);

  await vi.advanceTimersByTimeAsync(60_000);
  const refusal = await refusalPromise;

  expect(refusal).toBeInstanceOf(OpenApiDocumentNotFetchedError);
  expect((refusal as OpenApiDocumentNotFetchedError).context).toEqual({ link: A_LINK, kind: 'timeout' });
});

it('does not abandon the fetch before the full 60000ms deadline elapses', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const fetcher = aFetcher(httpClient);
  let settled = false;
  const promise = fetcher
    .fetchOpenApiDocument(A_LINK)
    .catch((error: unknown) => error)
    .then((result) => {
      settled = true;
      return result;
    });

  await vi.advanceTimersByTimeAsync(59_999);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(promise).resolves.toBeInstanceOf(OpenApiDocumentNotFetchedError);
});

it("yields a 2xx response's body text to its caller exactly, without parsing it as JSON", async () => {
  const rawBody = 'openapi: 3.0.0\ninfo:\n  title: not valid JSON at all { {{';
  const httpClient = newHttpClient().mockResolvedValue(new Response(rawBody, { status: 200 }));
  const fetcher = aFetcher(httpClient);

  const body = await fetcher.fetchOpenApiDocument(A_LINK);

  expect(body).toBe(rawBody);
});

it('yields an empty string, not undefined or a thrown error, when a 2xx response carries an empty body', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response('', { status: 200 }));
  const fetcher = aFetcher(httpClient);

  const body = await fetcher.fetchOpenApiDocument(A_LINK);

  expect(body).toBe('');
});

it('imports no HTTP client library, reaching the network only through the platform global fetch', async () => {
  const source = await readFile(
    fileURLToPath(new URL('../../../connector-registry/openapi-document-fetcher.adapter.ts', import.meta.url)),
    'utf8',
  );

  const forbidden = ['axios', 'node-fetch', 'got', 'undici', 'superagent', 'request'];
  const offenders = forbidden.filter((name) => source.includes(`'${name}'`) || source.includes(`"${name}"`));

  expect(offenders).toEqual([]);
});

it('defaults its own HTTP client to the platform global fetch when the caller injects none', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('a document body', { status: 200 }));
  try {
    const fetcher = new OpenApiDocumentFetcher();

    await fetcher.fetchOpenApiDocument(A_LINK);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  } finally {
    fetchSpy.mockRestore();
  }
});
