// Proof for task/case-query-http/list-case-versions-route: GET /v1/cases/{slug}/versions
// exercised through Fastify's own app.inject() against a local instance registering
// createListCaseVersionsRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape list-cases.routes.spec.ts and
// read-case.routes.spec.ts already establish, adapted because build-app.ts does not yet register
// this route. The published case-query read is a stand-in here (TST-03 — a stand-in replaces a
// boundary, never business logic): ICaseQuery.listCaseVersions is exactly the seam
// ListCaseVersionsControllerDependencies declares, stood in for by a vi.fn(); case-query.service.ts's
// own listCaseVersions — a direct pass-through onto the case store — is proved separately in
// __tests__/unit/case/case-query.service.spec.ts, and the case store's own CaseNotFoundError
// refusal for a slug naming no case at all is proved separately in
// __tests__/integration/persistence/relational-case-store.repository.spec.ts. This file proves
// only that the route, controller and DTO carry that contract's promise onto the wire unchanged,
// and that the controller's own pagination-bound resolution (defaultLimit, maxLimit, offset
// defaulting to 0) behaves as list-cases.controller.ts's own resolvePagination already does.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CaseVersionListItem } from '../../../case/case-store.port.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListCaseVersionsControllerDependencies } from '../../../http/list-case-versions.controller.js';
import { createListCaseVersionsRoutesPlugin } from '../../../http/list-case-versions.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListCaseVersionsMock = ReturnType<
  typeof vi.fn<(slug: string, pagination: PaginationRequest) => Promise<PaginatedResponse<CaseVersionListItem>>>
>;

/** A page of two versions a case holds, one draft and one released, every PaginatedResponse<CaseVersionListItem> field present, overridable per test. */
function heldPage(overrides: Partial<PaginatedResponse<CaseVersionListItem>> = {}): PaginatedResponse<CaseVersionListItem> {
  return {
    data: [{ version: 1, state: 'released' }, { version: 2, state: 'draft' }],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

/**
 * One Fastify instance registering exactly this route plugin plus the shared error handler —
 * mirrors what build-app.ts wires for diagnose, read-case and list-cases, ahead of the still-
 * outstanding task that wires this route into build-app.ts itself. defaultLimit and maxLimit
 * default to two distinct, deliberately non-coincidental figures so a test asserting one is never
 * satisfied by mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listCaseVersions: ListCaseVersionsMock;
} {
  const listCaseVersions: ListCaseVersionsMock = vi.fn();
  // readCase and listCases are no part of what this file proves (list-case-versions-route's own
  // ICaseQuery seam is listCaseVersions alone) — stubbed only so this fake keeps satisfying
  // ICaseQuery, which still declares both.
  const readCase = vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>();
  const caseQuery: ICaseQuery = { readCase, listCases: vi.fn(), listCaseVersions };
  const dependencies: ListCaseVersionsControllerDependencies = {
    caseQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListCaseVersionsRoutesPlugin(dependencies));
  return { app, listCaseVersions };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it("answers 200 with the paginated page of every version the named case holds, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listCaseVersions.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the path's own slug and the query's own offset and limit through to the case query unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?offset=5&limit=10' });

  expect(built.listCaseVersions).toHaveBeenCalledWith('a-slug', { offset: 5, limit: 10 });
});

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

it("answers each of two requests naming different slugs with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCaseVersions
    .mockResolvedValueOnce(heldPage({ data: [{ version: 1, state: 'released' }], total: 1, pageCount: 1 }))
    .mockResolvedValueOnce(heldPage({ data: [{ version: 3, state: 'draft' }], total: 1, pageCount: 1 }));

  const first = await app.inject({ method: 'GET', url: '/v1/cases/slug-a/versions' });
  const second = await app.inject({ method: 'GET', url: '/v1/cases/slug-b/versions' });

  expect((first.json() as PaginatedResponse<CaseVersionListItem>).data).toEqual([{ version: 1, state: 'released' }]);
  expect((second.json() as PaginatedResponse<CaseVersionListItem>).data).toEqual([{ version: 3, state: 'draft' }]);
  expect(built.listCaseVersions).toHaveBeenNthCalledWith(1, 'slug-a', { offset: 0, limit: 20 });
  expect(built.listCaseVersions).toHaveBeenNthCalledWith(2, 'slug-b', { offset: 0, limit: 20 });
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns CaseNotFoundError, when the named slug names no case at all', async () => {
  const built = buildTestApp();
  app = built.app;
  // The store's own refusal for this exact absence names no particular version at all — it
  // stands in its own NO_VERSION_NAMED sentinel (0) where CaseNotFoundError's constructor still
  // requires one (relational-case-store.repository.ts's own header comment on that constant).
  // Constructed here directly, matching that store-level convention, since this file's own
  // ICaseQuery stand-in never runs the real store.
  built.listCaseVersions.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 0));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/versions' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 0 });
});

// ------------------------------------------------------------------ inferred pagination resolution

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?limit=10' });

  expect(built.listCaseVersions).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?offset=5' });

  expect(built.listCaseVersions).toHaveBeenCalledWith('a-slug', { offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listCaseVersions).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCaseVersions.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?limit=50' });

  expect(built.listCaseVersions).toHaveBeenCalledWith('a-slug', { offset: 0, limit: 50 });
});

// ------------------------------------------------------------------ edge cases

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the named case currently holds no version', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<CaseVersionListItem> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listCaseVersions.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCaseVersions).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCaseVersions).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listCaseVersions).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listCaseVersions).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and listCaseVersionsParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/cases//versions' });

    expect(response.statusCode).toBe(400);
    expect(built.listCaseVersions).not.toHaveBeenCalled();
  },
);

it("answers 500 with the generic envelope, never the rejected call's own error text, when the case query itself rejects with an untyped error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCaseVersions.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});
