import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { ConceptInUseError } from '../../../errors/concept-in-use.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RemoveConceptControllerDependencies } from '../../../http/remove-concept.controller.js';
import { createRemoveConceptRoutesPlugin } from '../../../http/remove-concept.routes.js';

type RemoveConceptMock = ReturnType<typeof vi.fn<(name: string) => Promise<void>>>;

function buildTestApp(): { app: FastifyInstance; removeConcept: RemoveConceptMock } {
  const removeConcept: RemoveConceptMock = vi.fn();
  const dependencies: RemoveConceptControllerDependencies = { removeConcept };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRemoveConceptRoutesPlugin(dependencies));
  return { app, removeConcept };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 204 with a wholly empty body, identically for a concept currently held and one nothing answers, records, cites or collects', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeConcept.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);

  const heldResponse = await app.inject({ method: 'DELETE', url: '/v1/glossary/concepts/a-concept' });
  const unheldResponse = await app.inject({ method: 'DELETE', url: '/v1/glossary/concepts/an-absent-concept' });

  expect(heldResponse.statusCode).toBe(204);
  expect(heldResponse.body).toBe('');
  expect(heldResponse.rawPayload.length).toBe(0);
  expect(unheldResponse.statusCode).toBe(204);
  expect(unheldResponse.body).toBe('');
  expect(unheldResponse.rawPayload.length).toBe(0);
  expect(built.removeConcept).toHaveBeenNthCalledWith(1, 'a-concept');
  expect(built.removeConcept).toHaveBeenNthCalledWith(2, 'an-absent-concept');
});

it(
  'answers 400 via validation for a request with an empty :name segment, never reaching removeConcept — Fastify still matches ' +
    'the route with an empty string param for this segment, and removeConceptParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'DELETE', url: '/v1/glossary/concepts/' });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { error: { code: string; message: string; details: unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toContain('path');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(built.removeConcept).not.toHaveBeenCalled();
  },
);

it('answers HTTP 409 naming ConceptInUseError and its (concept, reference) context as details, when removeConcept rejects with that class', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeConcept.mockRejectedValueOnce(new ConceptInUseError('a-cited-concept', 'capability'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/glossary/concepts/a-cited-concept' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConceptInUseError');
  expect(body.error.details).toEqual({ concept: 'a-cited-concept', reference: 'capability' });
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when removeConcept rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeConcept.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/glossary/concepts/a-concept' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a generic failure');
});
