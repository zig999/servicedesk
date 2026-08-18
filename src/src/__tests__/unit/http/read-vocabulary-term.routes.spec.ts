// Proof for task/glossary-query-http/read-vocabulary-term-route: GET /v1/glossary/{vocabulary}/{name}
// exercised through Fastify's own app.inject() against a local instance registering
// createReadVocabularyTermRoutesPlugin() and error-handler.middleware.ts's own handleUnexpectedError
// directly — the same shape read-concept.routes.spec.ts already establishes, adapted for this
// route's second path parameter (the closed set of five term vocabularies). The published
// glossary-query read is a stand-in here (TST-03 — a stand-in replaces a boundary, never business
// logic): IGlossaryQuery.readVocabularyTerm is exactly the seam ReadVocabularyTermControllerDependencies
// declares, stood in for by a vi.fn(); the domain behavior behind that seam — how a resolution is
// answered, held or not — is proved separately in __tests__/unit/glossary/glossary-query.port.spec.ts.
// This file proves only that the route, controller and DTO carry that contract's promise onto the
// wire unchanged, and that the closed vocabulary enum is enforced before the query is ever reached.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { GlossaryTerm, TermVocabulary } from '../../../glossary/terms.js';
import { TERM_VOCABULARIES } from '../../../glossary/terms.js';
import type { IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import { readVocabularyTermResponseSchema } from '../../../http/dto/read-vocabulary-term.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadVocabularyTermControllerDependencies } from '../../../http/read-vocabulary-term.controller.js';
import { createReadVocabularyTermRoutesPlugin } from '../../../http/read-vocabulary-term.routes.js';

type ReadVocabularyTermMock = ReturnType<typeof vi.fn<(vocabulary: TermVocabulary, name: string) => Promise<TermResolution>>>;

/** A term as the glossary would already hold it, for seeding the stand-in query — its one name attribute, since criterion 1 asks for the term "exactly as the glossary currently holds it" and none of the five vocabularies carries anything beyond that name. */
function heldTerm(overrides: Partial<GlossaryTerm> = {}): GlossaryTerm {
  return { name: 'a-term', ...overrides };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors read-concept.routes.spec.ts's own buildTestApp(), ahead of the still-outstanding task that wires this route into build-app.ts. */
function buildTestApp(): { app: FastifyInstance; readVocabularyTerm: ReadVocabularyTermMock } {
  const readVocabularyTerm: ReadVocabularyTermMock = vi.fn();
  const glossaryQuery: IGlossaryQuery = {
    readVocabularyTerm,
    readConcept: () => Promise.reject(new Error('read-vocabulary-term.routes.spec.ts never exercises readConcept')),
    // Minimal stubs kept only to satisfy the widened IGlossaryQuery interface
    // (task/glossary-query-http/list-vocabulary-terms-query-extension,
    // task/glossary-query-http/list-concepts-query-extension): this route
    // under test never calls either.
    listVocabularyTerms: () => Promise.reject(new Error('listVocabularyTerms is not scripted for this file')),
    listConcepts: () => Promise.reject(new Error('listConcepts is not scripted for this file')),
  };
  const dependencies: ReadVocabularyTermControllerDependencies = { glossaryQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadVocabularyTermRoutesPlugin(dependencies));
  return { app, readVocabularyTerm };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the term currently held by the named vocabulary, exactly as the glossary holds it', async () => {
  const built = buildTestApp();
  app = built.app;
  const term = heldTerm({ name: 'a-known-term' });
  built.readVocabularyTerm.mockResolvedValueOnce({ held: true, term });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type/a-known-term' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(term);
  expect(Object.keys(response.json() as object).sort()).toEqual(Object.keys(readVocabularyTermResponseSchema.shape).sort());
});

it('resolves the term exactly as the path spelled it, case and hyphenation preserved, never normalized', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readVocabularyTerm.mockResolvedValueOnce({ held: true, term: heldTerm({ name: 'Mixed-Case-Term' }) });

  await app.inject({ method: 'GET', url: '/v1/glossary/outcome/Mixed-Case-Term' });

  expect(built.readVocabularyTerm).toHaveBeenCalledWith('outcome', 'Mixed-Case-Term');
});

it("answers each of two requests naming different terms with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readVocabularyTerm
    .mockResolvedValueOnce({ held: true, term: heldTerm({ name: 'term-a' }) })
    .mockResolvedValueOnce({ held: true, term: heldTerm({ name: 'term-b' }) });

  const first = await app.inject({ method: 'GET', url: '/v1/glossary/action/term-a' });
  const second = await app.inject({ method: 'GET', url: '/v1/glossary/action/term-b' });

  expect((first.json() as GlossaryTerm).name).toBe('term-a');
  expect((second.json() as GlossaryTerm).name).toBe('term-b');
});

it.each(TERM_VOCABULARIES)(
  'resolves a term of the %s vocabulary through readVocabularyTerm, and answers with what it holds',
  async (vocabulary) => {
    const built = buildTestApp();
    app = built.app;
    const term = heldTerm({ name: `a-${vocabulary}-term` });
    built.readVocabularyTerm.mockResolvedValueOnce({ held: true, term });

    const response = await app.inject({ method: 'GET', url: `/v1/glossary/${vocabulary}/a-${vocabulary}-term` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(term);
    expect(built.readVocabularyTerm).toHaveBeenCalledWith(vocabulary, `a-${vocabulary}-term`);
  },
);

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns VocabularyTermNotHeldError, when the named vocabulary does not currently hold the term', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readVocabularyTerm.mockResolvedValueOnce({ held: false, vocabulary: 'recipient', name: 'an-absent-term' });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/recipient/an-absent-term' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('VocabularyTermNotHeldError');
  expect(body.error.details).toEqual({ vocabulary: 'recipient', name: 'an-absent-term' });
});

// ------------------------------------------------------------------ edge cases

it('answers 400 for a :vocabulary segment naming none of the five term vocabularies, never reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/not-a-real-vocabulary/some-name' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(built.readVocabularyTerm).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty term segment, never reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type/' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(built.readVocabularyTerm).not.toHaveBeenCalled();
});

it("answers 500 with a generic message, never the rejected call's own error text, when the glossary query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readVocabularyTerm.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/subject-type/a-term' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
