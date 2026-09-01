import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { GlossaryService } from '../../../glossary/glossary.service.js';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';
import type { Concept, ConceptRegistration, GlossaryTerm } from '../../../glossary/terms.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RegisterConceptControllerDependencies } from '../../../http/register-concept.controller.js';
import { createRegisterConceptRoutesPlugin } from '../../../http/register-concept.routes.js';

type RegisterConceptMock = ReturnType<typeof vi.fn<(registration: ConceptRegistration) => Promise<Concept>>>;

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    accepts: ['a-subject-type'],
    ...overrides,
  };
}

function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-name',
    accepts: ['a-subject-type'],
    ttl: 60,
    description: 'a fixture concept',
    ...overrides,
  };
}

function buildTestApp(): { app: FastifyInstance; registerConcept: RegisterConceptMock } {
  const registerConcept: RegisterConceptMock = vi.fn();
  const dependencies: RegisterConceptControllerDependencies = { registerConcept };
  const app = Fastify();
  app.register(createRegisterConceptRoutesPlugin(dependencies));
  return { app, registerConcept };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the held concept registerConcept resolved, for a valid registration at the name the path names', async () => {
  const built = buildTestApp();
  app = built.app;
  const registered = heldConcept();
  built.registerConcept.mockResolvedValueOnce(registered);

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody() });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(registered);
});

it('composes the path-carried name with the body into one registration, calling registerConcept with it exactly', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept.mockResolvedValueOnce(heldConcept());

  await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody({ accepts: ['x', 'y'], ttl: 120 }) });

  expect(built.registerConcept).toHaveBeenCalledWith({ name: 'a-name', accepts: ['x', 'y'], ttl: 120 });
});

it("answers each of two requests at the same name with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept
    .mockResolvedValueOnce(heldConcept({ accepts: ['first-subject-type'] }))
    .mockResolvedValueOnce(heldConcept({ accepts: ['second-subject-type'] }));

  const first = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody({ accepts: ['first-subject-type'] }) });
  const second = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody({ accepts: ['second-subject-type'] }) });

  expect(first.statusCode).toBe(200);
  expect(second.statusCode).toBe(200);
  expect((first.json() as Concept).accepts).toEqual(['first-subject-type']);
  expect((second.json() as Concept).accepts).toEqual(['second-subject-type']);
  expect(built.registerConcept).toHaveBeenCalledTimes(2);
  expect(built.registerConcept).toHaveBeenNthCalledWith(1, { name: 'a-name', accepts: ['first-subject-type'] });
  expect(built.registerConcept).toHaveBeenNthCalledWith(2, { name: 'a-name', accepts: ['second-subject-type'] });
});

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept.mockResolvedValueOnce(heldConcept());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/glossary/concepts/a-name',
    payload: validBody(),
    headers: {},
  });

  expect(response.statusCode).toBe(200);
});

it('answers 200 for a request carrying an authorization header naming no credential this route recognizes, dispatching it exactly as one that carries none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept.mockResolvedValueOnce(heldConcept());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/glossary/concepts/a-name',
    payload: validBody(),
    headers: { authorization: 'Bearer not-a-real-credential' },
  });

  expect(response.statusCode).toBe(200);
});

it('lets a request whose body names no description at all reach registerConcept unmodified, rather than refusing it here with a 400', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept.mockResolvedValueOnce(heldConcept());

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody() });

  expect(response.statusCode).toBe(200);
  expect(built.registerConcept).toHaveBeenCalledWith({ name: 'a-name', accepts: ['a-subject-type'] });
});

it('answers 400 for a wholly empty body, without ever reaching registerConcept', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: {} });

  expect(response.statusCode).toBe(400);
  expect(built.registerConcept).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :name segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and registerConceptParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/', payload: validBody() });

    expect(response.statusCode).toBe(400);
    expect(built.registerConcept).not.toHaveBeenCalled();
  },
);

class MinimalGlossaryStore implements IGlossaryStore {
  private concepts: readonly ConceptRegistration[];

  public constructor(concepts: readonly ConceptRegistration[] = []) {
    this.concepts = concepts;
  }

  public async readTerms(): Promise<readonly GlossaryTerm[]> {
    return [];
  }

  public async writeTerms(): Promise<void> {}

  public async insertMissingTerms(): Promise<void> {}

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return this.concepts;
  }

  public async writeConcepts(concepts: readonly Concept[]): Promise<void> {
    this.concepts = concepts;
  }
}

function buildRealServiceApp(seed: readonly ConceptRegistration[] = []): FastifyInstance {
  const glossary = new GlossaryService(new MinimalGlossaryStore(seed));
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRegisterConceptRoutesPlugin({ registerConcept: (registration) => glossary.registerConcept(registration) }));
  return app;
}

it('answers 422 reporting a ConceptDescriptionRequiredError when a request creates a concept at a brand-new name with no description', async () => {
  app = buildRealServiceApp();

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-new-name', payload: validBody() });

  expect(response.statusCode).toBe(422);
  expect(response.json()).toMatchObject({ error: { code: 'ConceptDescriptionRequiredError' } });
});

it('answers 422 reporting a ConceptDescriptionRequiredError when a request replaces an already-held concept at its own name with no description', async () => {
  app = buildRealServiceApp([{ name: 'a-held-name', accepts: ['a-subject-type'], ttl: 60, description: 'the concept as it was already held' }]);

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-held-name', payload: validBody() });

  expect(response.statusCode).toBe(422);
  expect(response.json()).toMatchObject({ error: { code: 'ConceptDescriptionRequiredError' } });
});
