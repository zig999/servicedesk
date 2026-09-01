import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { HypothesisIdentity } from '../../../case/case-store.port.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListHypothesesControllerDependencies } from '../../../http/list-hypotheses.controller.js';
import { createListHypothesesRoutesPlugin } from '../../../http/list-hypotheses.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListHypothesesMock = ReturnType<
  typeof vi.fn<(slug: string, pagination: PaginationRequest) => Promise<PaginatedResponse<HypothesisIdentity>>>
>;

function heldPage(overrides: Partial<PaginatedResponse<HypothesisIdentity>> = {}): PaginatedResponse<HypothesisIdentity> {
  return {
    data: [{ name: 'hypothesis-a' }, { name: 'hypothesis-b' }],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listHypotheses: ListHypothesesMock;
} {
  const listHypotheses: ListHypothesesMock = vi.fn();

  const readCase = vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>();
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses,
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: ListHypothesesControllerDependencies = {
    caseQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListHypothesesRoutesPlugin(dependencies));
  return { app, listHypotheses };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers 200 with the paginated page of every hypothesis the named case holds, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listHypotheses.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the path's own slug and the query's own offset and limit through to the case query unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?offset=5&limit=10' });

  expect(built.listHypotheses).toHaveBeenCalledWith('a-slug', { offset: 5, limit: 10 });
});

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

it("answers each of two requests naming different slugs with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypotheses
    .mockResolvedValueOnce(heldPage({ data: [{ name: 'hypothesis-a' }], total: 1, pageCount: 1 }))
    .mockResolvedValueOnce(heldPage({ data: [{ name: 'hypothesis-c' }], total: 1, pageCount: 1 }));

  const first = await app.inject({ method: 'GET', url: '/v1/cases/slug-a/hypotheses' });
  const second = await app.inject({ method: 'GET', url: '/v1/cases/slug-b/hypotheses' });

  expect((first.json() as PaginatedResponse<HypothesisIdentity>).data).toEqual([{ name: 'hypothesis-a' }]);
  expect((second.json() as PaginatedResponse<HypothesisIdentity>).data).toEqual([{ name: 'hypothesis-c' }]);
  expect(built.listHypotheses).toHaveBeenNthCalledWith(1, 'slug-a', { offset: 0, limit: 20 });
  expect(built.listHypotheses).toHaveBeenNthCalledWith(2, 'slug-b', { offset: 0, limit: 20 });
});

it('refuses with the status the status map assigns CaseNotFoundError, when the named slug names no case at all', async () => {
  const built = buildTestApp();
  app = built.app;

  built.listHypotheses.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 0));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/hypotheses' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 0 });
});

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?limit=10' });

  expect(built.listHypotheses).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?offset=5' });

  expect(built.listHypotheses).toHaveBeenCalledWith('a-slug', { offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listHypotheses).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypotheses.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?limit=50' });

  expect(built.listHypotheses).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 50 });
});

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the named case currently holds no hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<HypothesisIdentity> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listHypotheses.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypotheses).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypotheses).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypotheses).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypotheses).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and listHypothesesParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/cases//hypotheses' });

    expect(response.statusCode).toBe(400);
    expect(built.listHypotheses).not.toHaveBeenCalled();
  },
);

it("answers 500 with the generic envelope, never the rejected call's own error text, when the case query itself rejects with an untyped error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypotheses.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});
