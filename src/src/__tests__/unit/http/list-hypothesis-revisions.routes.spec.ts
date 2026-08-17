// Proof for task/case-query-http/list-hypothesis-revisions-route: GET
// /v1/cases/{slug}/hypotheses/{name}/revisions exercised through Fastify's own app.inject()
// against a local instance registering createListHypothesisRevisionsRoutesPlugin() and
// error-handler.middleware.ts's own handleUnexpectedError directly — the same shape
// list-hypotheses.routes.spec.ts already establishes for a single-:slug-plus-pagination route,
// adapted for this route's second path parameter (:name, the hypothesis's own bare name), the
// same second-segment precedent read-vocabulary-term.routes.spec.ts already keeps for its own
// :vocabulary/:name pair. The published case-query read is a stand-in here (TST-03 — a stand-in
// replaces a boundary, never business logic): ICaseQuery.listHypothesisRevisions is exactly the
// seam ListHypothesisRevisionsControllerDependencies declares, stood in for by a vi.fn();
// case-query.service.ts's own listHypothesisRevisions — a direct pass-through onto the case
// store — is proved separately in __tests__/unit/case/case-query.service.spec.ts, and the case
// store's own CaseNotFoundError refusal (covering both an unknown slug and an unknown hypothesis
// name under a known slug, since a single existence check against the hypotheses identity row
// answers both absences at once — relational-case-store.repository.ts's own
// listHypothesisRevisions) is proved separately in
// __tests__/integration/persistence/relational-case-store.repository.spec.ts. This file proves
// only that the route, controller and DTO carry that contract's promise onto the wire unchanged,
// and that the controller's own pagination-bound resolution (defaultLimit, maxLimit, offset
// defaulting to 0) behaves as list-hypotheses.controller.ts's own resolvePagination already does.
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

/** A page of two revisions one hypothesis currently holds, every PaginatedResponse<HypothesisRevisionListItem> field present, overridable per test. Carries no hypothesis_name — HypothesisRevisionListItem omits it, this listing already being scoped to one named hypothesis by its own path parameter (case-store.port.ts's own header comment). */
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

/**
 * One Fastify instance registering exactly this route plugin plus the shared error handler —
 * mirrors what build-app.ts wires for diagnose, read-case, list-cases, list-case-versions and
 * list-hypotheses, ahead of the still-outstanding task that wires this route into build-app.ts
 * itself. defaultLimit and maxLimit default to two distinct, deliberately non-coincidental
 * figures so a test asserting one is never satisfied by mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listHypothesisRevisions: ListHypothesisRevisionsMock;
} {
  const listHypothesisRevisions: ListHypothesisRevisionsMock = vi.fn();
  // readCase, listCases, listCaseVersions and listHypotheses are no part of what this file proves
  // (list-hypothesis-revisions-route's own ICaseQuery seam is listHypothesisRevisions alone) —
  // stubbed only so this fake keeps satisfying ICaseQuery, which still declares all four.
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2
//
// The route raises the identical CaseNotFoundError whether the :slug or the :name (or both) names
// nothing this case has originated — case-query.service.ts's own listHypothesisRevisions is a bare
// pass-through onto the case store, and the store's own existence check queries the hypotheses
// table by (case_slug, name), a single foreign-key-backed row whose absence is one refusal
// covering both cases (relational-case-store.repository.ts's own listHypothesisRevisions, and this
// controller's own header comment). So this route, controller and DTO layer has exactly one seam
// to prove here — that a rejected caseQuery.listHypothesisRevisions call propagates unchanged to
// the status map — regardless of which of the two names was the one that did not exist; which of
// the two absences actually triggered it is the store's own distinction to prove, in
// relational-case-store.repository.spec.ts, not this route's.

it('refuses with the status the status map assigns CaseNotFoundError, when the named slug names no case at all', async () => {
  const built = buildTestApp();
  app = built.app;
  // The store's own refusal for this exact absence names no particular version at all — it
  // stands in its own NO_VERSION_NAMED sentinel (0) where CaseNotFoundError's constructor still
  // requires one (relational-case-store.repository.ts's own header comment on that constant).
  // Constructed here directly, matching that store-level convention, since this file's own
  // ICaseQuery stand-in never runs the real store.
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

// ------------------------------------------------------------------ inferred pagination resolution

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

// ------------------------------------------------------------------ edge cases

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
