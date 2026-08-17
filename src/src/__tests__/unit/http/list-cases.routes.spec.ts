// Proof for task/case-query-http/list-cases-route: GET /v1/cases exercised through Fastify's own
// app.inject() against a local instance registering createListCasesRoutesPlugin() and
// error-handler.middleware.ts's own handleUnexpectedError directly — the same shape
// read-case.routes.spec.ts and read-capability.routes.spec.ts already establish, adapted because
// build-app.ts does not yet register this route. The published case-query read is a stand-in here
// (TST-03 — a stand-in replaces a boundary, never business logic): ICaseQuery.listCases is exactly
// the seam ListCasesControllerDependencies declares, stood in for by a vi.fn(); case-query.service.ts's
// own listCases — a direct pass-through onto the case store — is proved separately in
// __tests__/unit/case/case-query.service.spec.ts. This file proves only that the route, controller
// and DTO carry that contract's promise onto the wire unchanged, and that the controller's own
// pagination-bound resolution (defaultLimit, maxLimit, offset defaulting to 0) behaves as this
// task's delivery record discloses it inferred.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { CaseIdentity } from '../../../case/case-store.port.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListCasesControllerDependencies } from '../../../http/list-cases.controller.js';
import { createListCasesRoutesPlugin } from '../../../http/list-cases.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListCasesMock = ReturnType<typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<CaseIdentity>>>>;

/** A page of two cases' own bare identities, every PaginatedResponse<CaseIdentity> field present, overridable per test. */
function heldPage(overrides: Partial<PaginatedResponse<CaseIdentity>> = {}): PaginatedResponse<CaseIdentity> {
  return {
    data: [{ slug: 'case-a' }, { slug: 'case-b' }],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

/**
 * One Fastify instance registering exactly this route plugin plus the shared error handler —
 * mirrors what build-app.ts wires for diagnose and read-case, ahead of the still-outstanding task
 * that wires this route into build-app.ts itself. defaultLimit and maxLimit default to two
 * distinct, deliberately non-coincidental figures so a test asserting one is never satisfied by
 * mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listCases: ListCasesMock;
} {
  const listCases: ListCasesMock = vi.fn();
  // readCase and listCaseVersions are no part of what this file proves (list-cases-route's own
  // ICaseQuery seam is listCases alone) — stubbed only so this fake keeps satisfying ICaseQuery,
  // which still declares readCase, and now listCaseVersions too
  // (task/case-query-http/list-case-versions-route).
  const readCase = vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>();
  const caseQuery: ICaseQuery = { readCase, listCases, listCaseVersions: vi.fn() };
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCases.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/cases' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

// ------------------------------------------------------------------ inferred pagination resolution

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

// ------------------------------------------------------------------ edge cases

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the case query resolves an empty store', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<CaseIdentity> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
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
