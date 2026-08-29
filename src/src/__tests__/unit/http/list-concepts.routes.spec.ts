// Proof for task/glossary-query-http/list-concepts-route: GET /v1/glossary/concepts exercised
// through Fastify's own app.inject() against a local instance registering
// createListConceptsRoutesPlugin() and error-handler.middleware.ts's own handleUnexpectedError
// directly — the same shape list-cases.routes.spec.ts and read-concept.routes.spec.ts already
// establish, adapted because build-app.ts does not yet register this route. The published
// glossary-query read is a stand-in here (TST-03 — a stand-in replaces a boundary, never business
// logic): IGlossaryQuery.listConcepts is exactly the seam ListConceptsControllerDependencies
// declares, stood in for by a vi.fn(); GlossaryService's own listConcepts — a pass-through onto
// the glossary's own held concepts — is proved separately in
// __tests__/unit/glossary/glossary.service.list-concepts.spec.ts. This file proves only that the
// route, controller and DTO carry that contract's promise onto the wire unchanged, and that the
// controller's own pagination-bound resolution (defaultLimit, maxLimit, offset defaulting to 0)
// behaves as list-concepts.controller.ts's own header comment discloses it inferred (mirroring
// list-cases.controller.ts's own inference, reused rather than re-decided).
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ConceptResolution, IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import type { Concept } from '../../../glossary/terms.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListConceptsControllerDependencies } from '../../../http/list-concepts.controller.js';
import { createListConceptsRoutesPlugin } from '../../../http/list-concepts.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListConceptsMock = ReturnType<typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<Concept>>>>;

/** A concept as the glossary would already hold it, every one of its three declared attributes present, overridable per test. */
function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'a fixture concept',
    ...overrides,
  };
}

/** A page of two concepts' own held shape, every PaginatedResponse<Concept> field present, overridable per test. */
function heldPage(overrides: Partial<PaginatedResponse<Concept>> = {}): PaginatedResponse<Concept> {
  return {
    data: [heldConcept({ name: 'concept-a' }), heldConcept({ name: 'concept-b' })],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

/**
 * One Fastify instance registering exactly this route plugin plus the shared error handler —
 * mirrors what build-app.ts wires for diagnose and read-concept, ahead of the still-outstanding
 * task that wires this route into build-app.ts itself. defaultLimit and maxLimit default to two
 * distinct, deliberately non-coincidental figures so a test asserting one is never satisfied by
 * mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listConcepts: ListConceptsMock;
} {
  const listConcepts: ListConceptsMock = vi.fn();
  // readVocabularyTerm, readConcept and listVocabularyTerms are no part of what this file proves
  // (list-concepts-route's own IGlossaryQuery seam is listConcepts alone) — stubbed to reject only
  // so this fake keeps satisfying IGlossaryQuery, mirroring read-concept.routes.spec.ts's own
  // reasoning for stubbing the siblings it does not exercise.
  const glossaryQuery: IGlossaryQuery = {
    readVocabularyTerm: () => Promise.reject(new Error('list-concepts.routes.spec.ts never exercises readVocabularyTerm')),
    readConcept: (): Promise<ConceptResolution> => Promise.reject(new Error('list-concepts.routes.spec.ts never exercises readConcept')),
    listVocabularyTerms: () => Promise.reject(new Error('listVocabularyTerms is not scripted for this file')),
    listConcepts,
  };
  const dependencies: ListConceptsControllerDependencies = {
    glossaryQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListConceptsRoutesPlugin(dependencies));
  return { app, listConcepts };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it("answers 200 with the paginated page of every concept currently registered the glossary query resolved, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listConcepts.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the request's own offset and limit through to the glossary query unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/concepts?offset=5&limit=10' });

  expect(built.listConcepts).toHaveBeenCalledWith({ offset: 5, limit: 10 });
});

// ------------------------------------------------------------------ criterion 2

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

// ------------------------------------------------------------------ inferred pagination resolution

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/concepts?limit=10' });

  expect(built.listConcepts).toHaveBeenCalledWith({ offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/concepts?offset=5' });

  expect(built.listConcepts).toHaveBeenCalledWith({ offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listConcepts).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/glossary/concepts?limit=50' });

  expect(built.listConcepts).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

// ------------------------------------------------------------------ edge cases

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the glossary query resolves an empty glossary', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<Concept> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listConcepts.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listConcepts).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listConcepts).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listConcepts).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listConcepts).not.toHaveBeenCalled();
});

it("answers 500 with the generic envelope, never the rejected call's own error text, when the glossary query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConcepts.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
