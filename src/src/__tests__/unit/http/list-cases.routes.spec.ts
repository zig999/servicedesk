import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { CaseCatalogEntry } from '../../../case/case-store.port.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListCasesControllerDependencies } from '../../../http/list-cases.controller.js';
import { createListCasesRoutesPlugin } from '../../../http/list-cases.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListCasesMock = ReturnType<typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<CaseCatalogEntry>>>>;

function heldPage(overrides: Partial<PaginatedResponse<CaseCatalogEntry>> = {}): PaginatedResponse<CaseCatalogEntry> {
  return {
    data: [
      { slug: 'case-a', version_count: 0 },
      { slug: 'case-b', version_count: 0 },
    ],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listCases: ListCasesMock;
} {
  const listCases: ListCasesMock = vi.fn();

  const readCase = vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>();
  const caseQuery: ICaseQuery = {
    readCase,
    listCases,
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: ListCasesControllerDependencies = {
    caseQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListCasesRoutesPlugin(dependencies));
  return { app, listCases };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers 200 with the paginated page of every case's identity the case query resolved, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listCases.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/cases?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it('passes the request\'s own offset and limit through to the case query unchanged, when both are given and within bounds', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases?offset=5&limit=10' });

  expect(built.listCases).toHaveBeenCalledWith({ offset: 5, limit: 10 });
});

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases?limit=10' });

  expect(built.listCases).toHaveBeenCalledWith({ offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases?offset=5' });

  expect(built.listCases).toHaveBeenCalledWith({ offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listCases).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases?limit=50' });

  expect(built.listCases).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the case query resolves an empty store', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<CaseCatalogEntry> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listCases.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/cases' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCases).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCases).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listCases).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listCases).not.toHaveBeenCalled();
});

it("answers 500 with the generic envelope, never the rejected call's own error text, when the case query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCases.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/cases' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
