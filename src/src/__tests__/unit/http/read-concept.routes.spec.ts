import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Concept } from '../../../glossary/terms.js';
import type { ConceptResolution, IGlossaryQuery } from '../../../glossary/glossary-query.port.js';
import { readConceptResponseSchema } from '../../../http/dto/read-concept.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadConceptControllerDependencies } from '../../../http/read-concept.controller.js';
import { createReadConceptRoutesPlugin } from '../../../http/read-concept.routes.js';

type ReadConceptMock = ReturnType<typeof vi.fn<(name: string) => Promise<ConceptResolution>>>;

function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-concept',
    accepts: ['a-subject-type', 'another-subject-type'],
    ttl: 120,
    description: 'a fixture concept',
    ...overrides,
  };
}

function buildTestApp(): { app: FastifyInstance; readConcept: ReadConceptMock } {
  const readConcept: ReadConceptMock = vi.fn();
  const glossaryQuery: IGlossaryQuery = {
    readVocabularyTerm: () => Promise.reject(new Error('read-concept.routes.spec.ts never exercises readVocabularyTerm')),
    readConcept,

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

it('answers 200 with the empty string for description, when the glossary holds a legacy concept with no stored description, never a refusal', async () => {
  const built = buildTestApp();
  app = built.app;
  const concept = heldConcept({ name: 'a-legacy-concept', description: '' });
  built.readConcept.mockResolvedValueOnce({ held: true, concept });

  const response = await app.inject({ method: 'GET', url: '/v1/glossary/concepts/a-legacy-concept' });

  expect(response.statusCode).toBe(200);
  expect((response.json() as Concept).description).toBe('');
});

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
