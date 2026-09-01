import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { HypothesisRevisionListItem } from '../../../case/case-store.port.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListHypothesisRevisionsControllerDependencies } from '../../../http/list-hypothesis-revisions.controller.js';
import { createListHypothesisRevisionsRoutesPlugin } from '../../../http/list-hypothesis-revisions.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListHypothesisRevisionsMock = ReturnType<
  typeof vi.fn<
    (slug: string, hypothesisName: string, pagination: PaginationRequest) => Promise<PaginatedResponse<HypothesisRevisionListItem>>
  >
>;

function heldPage(overrides: Partial<PaginatedResponse<HypothesisRevisionListItem>> = {}): PaginatedResponse<HypothesisRevisionListItem> {
  return {
    data: [
      { revision: 1, criterion: 'a-criterion', collects: ['a-concept'], resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } } },
      { revision: 2, criterion: 'a-revised-criterion', collects: ['a-concept', 'another-concept'], resolution: { outcome: 'a-revised-outcome', referral: { action: 'refer', recipient: 'a-queue' } } },
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
  listHypothesisRevisions: ListHypothesisRevisionsMock;
} {
  const listHypothesisRevisions: ListHypothesisRevisionsMock = vi.fn();

  const readCase = vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>();
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions,
  };
  const dependencies: ListHypothesisRevisionsControllerDependencies = {
    caseQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListHypothesisRevisionsRoutesPlugin(dependencies));
  return { app, listHypothesisRevisions };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers 200 with the paginated page of every revision the named hypothesis holds, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listHypothesisRevisions.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the path's own slug and hypothesis name and the query's own offset and limit through to the case query unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?offset=5&limit=10' });

  expect(built.listHypothesisRevisions).toHaveBeenCalledWith('a-slug', 'a-hypothesis', { offset: 5, limit: 10 });
});

it(
  'answers a body carrying exactly the five fields src/types/pagination.ts\'s PaginatedResponse declares — data, limit, offset, ' +
    'pageCount and total — and each revision item carrying exactly revision, criterion, collects and resolution, never hypothesis_name',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

    const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions' });

    const body = response.json() as PaginatedResponse<HypothesisRevisionListItem>;
    expect(Object.keys(body).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual(['collects', 'criterion', 'resolution', 'revision']);
    }
  },
);

it("answers each of two requests naming different (slug, hypothesis name) pairs with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypothesisRevisions
    .mockResolvedValueOnce(
      heldPage({
        data: [{ revision: 1, criterion: 'criterion-a', collects: ['concept-a'], resolution: { outcome: 'outcome-a', referral: { action: 'refer', recipient: 'queue-a' } } }],
        total: 1,
        pageCount: 1,
      }),
    )
    .mockResolvedValueOnce(
      heldPage({
        data: [{ revision: 1, criterion: 'criterion-b', collects: ['concept-b'], resolution: { outcome: 'outcome-b', referral: { action: 'refer', recipient: 'queue-b' } } }],
        total: 1,
        pageCount: 1,
      }),
    );

  const first = await app.inject({ method: 'GET', url: '/v1/cases/slug-a/hypotheses/hypothesis-a/revisions' });
  const second = await app.inject({ method: 'GET', url: '/v1/cases/slug-b/hypotheses/hypothesis-b/revisions' });

  expect((first.json() as PaginatedResponse<HypothesisRevisionListItem>).data).toEqual([
    { revision: 1, criterion: 'criterion-a', collects: ['concept-a'], resolution: { outcome: 'outcome-a', referral: { action: 'refer', recipient: 'queue-a' } } },
  ]);
  expect((second.json() as PaginatedResponse<HypothesisRevisionListItem>).data).toEqual([
    { revision: 1, criterion: 'criterion-b', collects: ['concept-b'], resolution: { outcome: 'outcome-b', referral: { action: 'refer', recipient: 'queue-b' } } },
  ]);
  expect(built.listHypothesisRevisions).toHaveBeenNthCalledWith(1, 'slug-a', 'hypothesis-a', { offset: 0, limit: 20 });
  expect(built.listHypothesisRevisions).toHaveBeenNthCalledWith(2, 'slug-b', 'hypothesis-b', { offset: 0, limit: 20 });
});

it('refuses with the status the status map assigns CaseNotFoundError, when the named slug names no case at all', async () => {
  const built = buildTestApp();
  app = built.app;

  built.listHypothesisRevisions.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 0));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/hypotheses/a-hypothesis/revisions' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 0 });
});

it(
  'refuses with the same status the status map assigns CaseNotFoundError, when the slug names a known case but the named ' +
    'hypothesis name does not exist under it — the identical propagation mechanism as an unknown slug, since the store raises the ' +
    'same typed error either way and this layer catches neither',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.listHypothesisRevisions.mockRejectedValueOnce(new CaseNotFoundError('a-known-slug', 0));

    const response = await app.inject({ method: 'GET', url: '/v1/cases/a-known-slug/hypotheses/an-absent-hypothesis/revisions' });

    expect(response.statusCode).toBe(404);
    const body = response.json() as { error: { code: string; details?: unknown } };
    expect(body.error.code).toBe('CaseNotFoundError');
  },
);

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?limit=10' });

  expect(built.listHypothesisRevisions).toHaveBeenCalledWith('a-slug', 'a-hypothesis', { offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?offset=5' });

  expect(built.listHypothesisRevisions).toHaveBeenCalledWith('a-slug', 'a-hypothesis', { offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listHypothesisRevisions).toHaveBeenCalledWith('a-slug', 'a-hypothesis', { offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listHypothesisRevisions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?limit=50' });

  expect(built.listHypothesisRevisions).toHaveBeenCalledWith('a-slug', 'a-hypothesis', { offset: 0, limit: 50 });
});

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the named hypothesis currently holds no revision', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<HypothesisRevisionListItem> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listHypothesisRevisions.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and listHypothesisRevisionsParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/cases//hypotheses/a-hypothesis/revisions' });

    expect(response.statusCode).toBe(400);
    expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :name segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and listHypothesisRevisionsParamsSchema (z.string().min(1)) is what refuses it, ' +
    'the same precedent read-vocabulary-term.routes.spec.ts keeps for its own second :name segment',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses//revisions' });

    expect(response.statusCode).toBe(400);
    expect(built.listHypothesisRevisions).not.toHaveBeenCalled();
  },
);

it("answers 500 with the generic envelope, never the rejected call's own error text, when the case query itself rejects with an untyped error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listHypothesisRevisions.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});
