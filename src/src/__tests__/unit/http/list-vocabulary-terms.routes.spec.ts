// Proof for task/glossary-query-http/list-vocabulary-terms-route: GET /v1/glossary/{vocabulary}
// exercised through Fastify's own app.inject() against a local instance registering
// createListVocabularyTermsRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape list-cases.routes.spec.ts and
// read-vocabulary-term.routes.spec.ts already establish. The published glossary-query read is a
// stand-in here (TST-03 — a stand-in replaces a boundary, never business logic):
// IGlossaryQuery.listVocabularyTerms is exactly the seam ListVocabularyTermsControllerDependencies
// declares, stood in for by a vi.fn(); the domain behavior behind that seam is proved separately in
// glossary.service.spec.ts and glossary-query.port.spec.ts. This file proves only that the route,
// controller and DTO carry that contract's promise onto the wire unchanged, that the closed
// vocabulary enum is enforced before the query is ever reached, and that the controller's own
// pagination-bound resolution (defaultLimit, maxLimit, offset defaulting to 0) behaves exactly as
// list-cases.controller.ts's own already does.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { TERM_VOCABULARIES, type GlossaryTerm, type TermVocabulary } from '../../../glossary/terms.js';
import type { IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListVocabularyTermsControllerDependencies } from '../../../http/list-vocabulary-terms.controller.js';
import { createListVocabularyTermsRoutesPlugin } from '../../../http/list-vocabulary-terms.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListVocabularyTermsMock = ReturnType<
  typeof vi.fn<(vocabulary: TermVocabulary, pagination: PaginationRequest) => Promise<PaginatedResponse<GlossaryTerm>>>
>;

/** A page of two terms of one vocabulary, every PaginatedResponse<GlossaryTerm> field present, overridable per test. */
function heldPage(overrides: Partial<PaginatedResponse<GlossaryTerm>> = {}): PaginatedResponse<GlossaryTerm> {
  return {
    data: [{ name: 'term-a' }, { name: 'term-b' }],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

/**
 * One Fastify instance registering exactly this route plugin plus the shared error handler —
 * mirrors list-cases.routes.spec.ts's own buildTestApp(). defaultLimit and maxLimit default to two
 * distinct, deliberately non-coincidental figures so a test asserting one is never satisfied by
 * mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listVocabularyTerms: ListVocabularyTermsMock;
} {
  const listVocabularyTerms: ListVocabularyTermsMock = vi.fn();
  const glossaryQuery: IGlossaryQuery = {
    // readVocabularyTerm, readConcept and listConcepts are no part of what this file proves
    // (this route's own IGlossaryQuery seam is listVocabularyTerms alone) — stubbed only so this
    // fake keeps satisfying IGlossaryQuery; this route under test never calls any of them.
    readVocabularyTerm: () => Promise.reject(new Error('readVocabularyTerm is not scripted for this file')),
    readConcept: () => Promise.reject(new Error('readConcept is not scripted for this file')),
    listVocabularyTerms,
    listConcepts: () => Promise.reject(new Error('listConcepts is not scripted for this file')),
  };
  const dependencies: ListVocabularyTermsControllerDependencies = {
    glossaryQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListVocabularyTermsRoutesPlugin(dependencies));
  return { app, listVocabularyTerms };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it("answers 200 with the paginated page of every term the named vocabulary currently holds, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listVocabularyTerms.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the request's own vocabulary and pagination window through to listVocabularyTerms unchanged", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/outcome?offset=5&limit=10' });

  expect(built.listVocabularyTerms).toHaveBeenCalledWith('outcome', { offset: 5, limit: 10 });
});

it.each(TERM_VOCABULARIES)(
  'resolves a page of the %s vocabulary through listVocabularyTerms, and answers with what it holds',
  async (vocabulary) => {
    const built = buildTestApp();
    app = built.app;
    const page = heldPage({ data: [{ name: `a-${vocabulary}-term` }], total: 1 });
    built.listVocabularyTerms.mockResolvedValueOnce(page);

    const response = await app.inject({ method: 'GET', url: `/v1/glossary/${vocabulary}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(page);
    expect(built.listVocabularyTerms).toHaveBeenCalledWith(vocabulary, { offset: 0, limit: 20 });
  },
);

it("answers each of two requests against different vocabularies with that request's own resolved page, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms
    .mockResolvedValueOnce(heldPage({ data: [{ name: 'a-subject-type-term' }], total: 1 }))
    .mockResolvedValueOnce(heldPage({ data: [{ name: 'an-action-term' }], total: 1 }));

  const first = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type' });
  const second = await app.inject({ method: 'GET', url: '/v1/glossary/action' });

  expect((first.json() as PaginatedResponse<GlossaryTerm>).data).toEqual([{ name: 'a-subject-type-term' }]);
  expect((second.json() as PaginatedResponse<GlossaryTerm>).data).toEqual([{ name: 'an-action-term' }]);
});

// ------------------------------------------------------------------ criterion 2

it('answers 400 for a :vocabulary segment naming none of the five term vocabularies, never reaching listVocabularyTerms', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/not-a-real-vocabulary' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(built.listVocabularyTerms).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ inferred pagination resolution

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/recipient?limit=10' });

  expect(built.listVocabularyTerms).toHaveBeenCalledWith('recipient', { offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/recipient?offset=5' });

  expect(built.listVocabularyTerms).toHaveBeenCalledWith('recipient', { offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/recipient?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listVocabularyTerms).toHaveBeenCalledWith('recipient', { offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/recipient?limit=50' });

  expect(built.listVocabularyTerms).toHaveBeenCalledWith('recipient', { offset: 0, limit: 50 });
});

// ------------------------------------------------------------------ edge cases

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when a recognized vocabulary currently holds no term', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<GlossaryTerm> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listVocabularyTerms.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-attribute' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('accepts an offset of exactly zero, the lower boundary of the nonnegative range, without refusing it', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/action?offset=0' });

  expect(response.statusCode).toBe(200);
  expect(built.listVocabularyTerms).toHaveBeenCalledWith('action', { offset: 0, limit: 20 });
});

it('accepts a limit of exactly 1, the lower boundary of the positive range, without refusing it', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/action?limit=1' });

  expect(response.statusCode).toBe(200);
  expect(built.listVocabularyTerms).toHaveBeenCalledWith('action', { offset: 0, limit: 1 });
});

it('answers 400 for a non-numeric offset, without ever reaching listVocabularyTerms', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(built.listVocabularyTerms).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching listVocabularyTerms', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(built.listVocabularyTerms).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching listVocabularyTerms', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listVocabularyTerms).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching listVocabularyTerms', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listVocabularyTerms).not.toHaveBeenCalled();
});

it("answers 500 with a generic message, never the rejected call's own error text, when the glossary query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listVocabularyTerms.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
