import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ConceptResolution, IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import type { Concept } from '../../../glossary/terms.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListConceptsControllerDependencies } from '../../../http/list-concepts.controller.js';
import { createListConceptsRoutesPlugin } from '../../../http/list-concepts.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListConceptsMock = ReturnType<typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<Concept>>>>;

function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'a fixture concept',
    ...overrides,
  };
}

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

function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listConcepts: ListConceptsMock;
} {
  const listConcepts: ListConceptsMock = vi.fn();

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

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConcepts.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

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
