// Proof for task/glossary-query-http/read-concept-route: GET /v1/glossary/concepts/{name}
// exercised through Fastify's own app.inject() against a local instance registering
// createReadConceptRoutesPlugin() and error-handler.middleware.ts's own handleUnexpectedError
// directly — the same shape read-capability.routes.spec.ts and read-case.routes.spec.ts already
// establish, adapted because build-app.ts does not yet register this route (that wiring is
// task/case-lifecycle-http/register-routes-in-build-app, still outstanding at the time of this
// proof). The published glossary-query read is a stand-in here (TST-03 — a stand-in replaces a
// boundary, never business logic): IGlossaryQuery.readConcept is exactly the seam
// ReadConceptControllerDependencies declares, stood in for by a vi.fn(); the domain behavior
// behind that seam — how a resolution is answered, held or not — is proved separately in
// __tests__/unit/glossary/glossary-query.port.spec.ts. This file proves only that the route,
// controller and DTO carry that contract's promise onto the wire unchanged.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Concept } from '../../../glossary/terms.js';
import type { ConceptResolution, IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import { readConceptResponseSchema } from '../../../http/dto/read-concept.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadConceptControllerDependencies } from '../../../http/read-concept.controller.js';
import { createReadConceptRoutesPlugin } from '../../../http/read-concept.routes.js';

type ReadConceptMock = ReturnType<typeof vi.fn<(name: string) => Promise<ConceptResolution>>>;

/** A concept as the glossary would already hold it, for seeding the stand-in query — every one of its three declared attributes, so criterion 1's "including its accepted subject types and its ttl" has something whole to assert against. */
function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'a fixture concept',
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors what build-app.ts wires for diagnose, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; readConcept: ReadConceptMock } {
  const readConcept: ReadConceptMock = vi.fn();
  const glossaryQuery: IGlossaryQuery = {
    readVocabularyTerm: () => Promise.reject(new Error('read-concept.routes.spec.ts never exercises readVocabularyTerm')),
    readConcept,
    // Minimal stubs kept only to satisfy the widened IGlossaryQuery interface
    // (task/glossary-query-http/list-vocabulary-terms-query-extension,
    // task/glossary-query-http/list-concepts-query-extension): this route
    // under test never calls either.
    listVocabularyTerms: () => Promise.reject(new Error('listVocabularyTerms is not scripted for this file')),
    listConcepts: () => Promise.reject(new Error('listConcepts is not scripted for this file')),
  };
  const dependencies: ReadConceptControllerDependencies = { glossaryQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadConceptRoutesPlugin(dependencies));
  return { app, readConcept };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the concept currently held by the glossary, including its accepted subject types and its ttl', async () => {
  const built = buildTestApp();
  app = built.app;
  const concept = heldConcept({ name: 'a-known-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 120 });
  built.readConcept.mockResolvedValueOnce({ held: true, concept });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/a-known-concept' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(concept);
  expect(Object.keys(response.json() as object).sort()).toEqual(Object.keys(readConceptResponseSchema.shape).sort());
});

it('resolves the concept exactly as the path spelled it, case and hyphenation preserved, never normalized', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConcept.mockResolvedValueOnce({ held: true, concept: heldConcept({ name: 'Mixed-Case-Concept' }) });

  await app.inject({ method: 'GET', url: '/v1/glossary/concepts/Mixed-Case-Concept' });

  expect(built.readConcept).toHaveBeenCalledWith('Mixed-Case-Concept');
});

it("answers each of two requests naming different concepts with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConcept
    .mockResolvedValueOnce({ held: true, concept: heldConcept({ name: 'concept-a', accepts: ['type-a'], ttl: 60 }) })
    .mockResolvedValueOnce({ held: true, concept: heldConcept({ name: 'concept-b', accepts: ['type-b'], ttl: 90 }) });

  const first = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/concept-a' });
  const second = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/concept-b' });

  expect((first.json() as Concept).name).toBe('concept-a');
  expect((second.json() as Concept).name).toBe('concept-b');
});

// ---------------------- task/concept-description/read-concept-returns-description

it('answers 200 with the empty string for description, when the glossary holds a legacy concept with no stored description, never a refusal', async () => {
  const built = buildTestApp();
  app = built.app;
  const concept = heldConcept({ name: 'a-legacy-concept', description: '' });
  built.readConcept.mockResolvedValueOnce({ held: true, concept });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/a-legacy-concept' });

  expect(response.statusCode).toBe(200);
  expect((response.json() as Concept).description).toBe('');
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns ConceptNotHeldError, when the glossary does not currently hold the named concept', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConcept.mockResolvedValueOnce({ held: false, name: 'an-absent-concept' });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/an-absent-concept' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConceptNotHeldError');
  expect(body.error.details).toEqual({ name: 'an-absent-concept' });
});

// ------------------------------------------------------------------ edge cases

it('answers 400 via validation for a request with an empty concept segment, never reaching the glossary query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/' });

  expect(response.statusCode).toBe(400);
  expect(built.readConcept).not.toHaveBeenCalled();
});

it("answers 500 with a generic message, never the rejected call's own error text, when the glossary query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConcept.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/a-concept' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
