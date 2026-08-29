// Proof for task/concept-authoring/register-concept-route: PUT
// /v1/glossary/concepts/{name} exercised through Fastify's own app.inject()
// against a local instance registering createRegisterConceptRoutesPlugin()
// directly — the same shape register-capability.routes.spec.ts already
// establishes for the identical create-or-replace-at-a-known-identity shape,
// adapted for a route whose identity is a single path segment and whose body
// carries the rest of the registration.
// GlossaryService['registerConcept'] is the one stand-in here (TST-03 — a
// stand-in replaces a boundary, never business logic): the service's own
// create-or-replace-by-name holding is proved separately over the store; this
// file proves only that the route, controller and DTO carry that promise onto
// the wire unchanged — a valid request's path and body compose into one
// ConceptRegistration handed to registerConcept unmodified, each request's
// own resolution reaches the wire rather than a cached or joined one, and no
// authentication guard stands in front of any of it — plus the DTO's own
// required accepts and the params schema's own non-empty :name refuse a
// malformed request before registerConcept is ever reached.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Concept, ConceptRegistration } from '../../../glossary/terms.js';
import type { RegisterConceptControllerDependencies } from '../../../http/register-concept.controller.js';
import { createRegisterConceptRoutesPlugin } from '../../../http/register-concept.routes.js';

type RegisterConceptMock = ReturnType<typeof vi.fn<(registration: ConceptRegistration) => Promise<Concept>>>;

/** Every attribute registerConceptBodySchema requires, overridable per test. */
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    accepts: ['a-subject-type'],
    ...overrides,
  };
}

/** A concept as the glossary would answer it, every declared attribute present, overridable per test. */
function heldConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    name: 'a-name',
    accepts: ['a-subject-type'],
    ttl: 60,
    description: 'a fixture concept',
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin — mirrors register-capability.routes.spec.ts's own buildTestApp. */
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2 — replaces in place, never a second entry
//
// The route holds no create-or-replace logic of its own (this task's own
// disclosed inference: it answers 200 with whatever registerConcept
// resolves, for both the create case and the replace case) — the store-level
// fact that a second registration at a held name replaces the held record
// rather than adding a second one is GlossaryService's own concern, proved
// separately. What this route can and does prove on its own is that it never
// answers a previous or cached resolution: two successive requests at the
// same name each carry their own body through to registerConcept and each
// answer that call's own resolution — consistent with a single entry held
// and replaced at that name rather than accumulated.

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

// ------------------------------------------------------------------ criterion 3

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

// ------------------------------------------------------------------ task/concept-description/concept-registration-requires-a-description
//
// registerConceptBodySchema's own description field is Zod-optional (the
// implementation's own disclosed inference: deliberately deferring the
// refusal for an absent description to GlossaryService.registerConcept
// itself, so its own typed 422 ConceptDescriptionRequiredError is what
// answers it, rather than this route's generic 400 VALIDATION_ERROR
// envelope). registerConcept itself is a stand-in here, so this proves only
// that a body naming no description clears this boundary rather than being
// refused before ever reaching it.

it('lets a request whose body names no description at all reach registerConcept unmodified, rather than refusing it here with a 400', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConcept.mockResolvedValueOnce(heldConcept());

  const response = await app.inject({ method: 'PUT', url: '/v1/glossary/concepts/a-name', payload: validBody() });

  expect(response.statusCode).toBe(200);
  expect(built.registerConcept).toHaveBeenCalledWith({ name: 'a-name', accepts: ['a-subject-type'] });
});

// ------------------------------------------------------------------ basic validation

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
