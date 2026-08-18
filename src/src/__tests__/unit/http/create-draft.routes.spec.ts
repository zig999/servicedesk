// Proof for task/case-lifecycle-http/create-draft-route: POST /v1/cases
// exercised through Fastify's own app.inject() against a local instance
// registering createCreateDraftRoutesPlugin() and
// error-handler.middleware.ts's own handleUnexpectedError directly — the
// same shape update-draft.routes.spec.ts already establishes, adapted for a
// route with a single dependency and no path parameters (everything arrives
// in the body). CaseLifecycleOperations['createDraft'] is a stand-in here
// (TST-03 — a stand-in replaces a boundary, never business logic):
// create-draft.operation.ts's own CreateDraftOperation, which delegates the
// next-version number, the at-most-one-draft refusal and the manifest's copy
// source entirely to the case store beneath it, is proved separately in its
// own unit spec. This file proves only that the route, controller and DTO
// carry that operation's promise onto the wire unchanged — including the
// one promise this task's own UNDERDETERMINED note singles out: a slug
// already naming an existing case with no open draft must still succeed,
// originating that case's own next draft, because the route adds no
// slug-existence pre-check of its own (create-draft.controller.ts's own
// header comment).
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CreatedDraft } from '../../../case/create-draft.operation.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import type { CreateDraftBodyDto } from '../../../http/dto/create-draft.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { CreateDraftControllerDependencies } from '../../../http/create-draft.controller.js';
import { createCreateDraftRoutesPlugin } from '../../../http/create-draft.routes.js';

type CreateDraftMock = ReturnType<typeof vi.fn<(input: CreateDraftBodyDto) => Promise<CreatedDraft>>>;

/** domain/knowledge/resolution, whole: an outcome paired with its referral. */
function heldResolution(outcome = 'no-hypothesis-confirmed'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

/** A full, valid create-draft request body, every one of createDraftBodySchema's required attributes present and both optional ones supplied. */
function validCreateDraftBody(overrides: Partial<CreateDraftBodyDto> = {}): CreateDraftBodyDto {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs this case',
    authored_at: '2024-03-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution(),
    consolidation_register: 'formal',
    source_version: 2,
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors update-draft.routes.spec.ts's own buildTestApp, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; createDraft: CreateDraftMock } {
  const createDraft: CreateDraftMock = vi.fn();
  const dependencies: CreateDraftControllerDependencies = { createDraft };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createCreateDraftRoutesPlugin(dependencies));
  return { app, createDraft };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 201 with the slug and version createDraft originated, calling createDraft with the parsed body exactly as sent', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validCreateDraftBody();
  const createdDraft: CreatedDraft = { slug: 'a-slug', version: 4 };
  built.createDraft.mockResolvedValueOnce(createdDraft);

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: body });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(createdDraft);
  expect(built.createDraft).toHaveBeenCalledWith(body);
});

// ------------------------------------------------------------------ UNDERDETERMINED-defeating test
//
// This task's own UNDERDETERMINED note rules out a reading where POST
// /v1/cases refuses every request naming a slug that already identifies a
// case, regardless of whether that case currently holds an open draft — a
// reading that would satisfy every criterion as literally stated (the slug
// this test names never appears in a rejected call, and criteria 2 and 3
// are proved by separate tests), yet contradicts domain/knowledge/case's own
// responsibility to "originate a new draft version when a curator starts
// revising it" and contracts/knowledge/case-lifecycle's own "revising a
// released case always starts the next draft." CreateDraftControllerDependencies
// narrows to createDraft alone (no read/exists operation is ever wired to
// this route), so there is structurally nothing here the route could use to
// pre-check slug existence; this test additionally proves it behaviorally,
// by mocking createDraft to resolve successfully — never reject — for a slug
// that already identifies an existing case with no open draft, and asserting
// the route still answers 201 with the originated draft rather than refusing
// outright.

it('still succeeds, originating the next draft, for a slug already naming an existing case that currently holds no open draft', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validCreateDraftBody({ slug: 'an-existing-slug-without-open-draft' });
  const createdDraft: CreatedDraft = { slug: 'an-existing-slug-without-open-draft', version: 7 };
  // createDraft resolves — never rejects — proving the route itself raises
  // no refusal of its own for a slug that already identifies a case; the
  // only refusal this operation can produce is CaseAlreadyHasDraftError,
  // which this test does not trigger.
  built.createDraft.mockResolvedValueOnce(createdDraft);

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: body });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(createdDraft);
  expect(built.createDraft).toHaveBeenCalledWith(body);
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns CaseAlreadyHasDraftError when the named case already holds an open draft', async () => {
  const built = buildTestApp();
  app = built.app;
  built.createDraft.mockRejectedValueOnce(new CaseAlreadyHasDraftError('a-slug-with-a-draft'));

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases',
    payload: validCreateDraftBody({ slug: 'a-slug-with-a-draft' }),
  });

  expect(response.statusCode).toBe(409);
  const responseBody = response.json() as { error: { code: string; details?: unknown } };
  expect(responseBody.error.code).toBe('CaseAlreadyHasDraftError');
  expect(responseBody.error.details).toEqual({ slug: 'a-slug-with-a-draft' });
});

// ------------------------------------------------------------------ criterion 3

it('answers 400 for a body missing the required title attribute, without ever reaching createDraft', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validCreateDraftBody();
  const bodyWithoutTitle = {
    slug: fullBody.slug,
    when_to_use: fullBody.when_to_use,
    authored_at: fullBody.authored_at,
    subject: fullBody.subject,
    fallback: fullBody.fallback,
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: bodyWithoutTitle });

  expect(response.statusCode).toBe(400);
  expect(built.createDraft).not.toHaveBeenCalled();
});

it('answers 400 for a body missing the required slug attribute, without ever reaching createDraft', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validCreateDraftBody();
  const bodyWithoutSlug = {
    title: fullBody.title,
    when_to_use: fullBody.when_to_use,
    authored_at: fullBody.authored_at,
    subject: fullBody.subject,
    fallback: fullBody.fallback,
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: bodyWithoutSlug });

  expect(response.statusCode).toBe(400);
  expect(built.createDraft).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ edge cases

it('succeeds when consolidation_register is omitted from the body entirely, calling createDraft with it absent rather than defaulted to some value', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validCreateDraftBody();
  const bodyWithoutRegister = {
    slug: fullBody.slug,
    title: fullBody.title,
    when_to_use: fullBody.when_to_use,
    authored_at: fullBody.authored_at,
    subject: fullBody.subject,
    fallback: fullBody.fallback,
    source_version: fullBody.source_version,
  };
  built.createDraft.mockResolvedValueOnce({ slug: 'a-slug', version: 1 });

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: bodyWithoutRegister });

  expect(response.statusCode).toBe(201);
  const [calledWith] = built.createDraft.mock.calls[0] as [CreateDraftBodyDto];
  expect(calledWith).not.toHaveProperty('consolidation_register');
});

it('succeeds when source_version is omitted from the body entirely, calling createDraft with it absent rather than defaulted to some value', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validCreateDraftBody();
  const bodyWithoutSourceVersion = {
    slug: fullBody.slug,
    title: fullBody.title,
    when_to_use: fullBody.when_to_use,
    authored_at: fullBody.authored_at,
    subject: fullBody.subject,
    fallback: fullBody.fallback,
    consolidation_register: fullBody.consolidation_register,
  };
  built.createDraft.mockResolvedValueOnce({ slug: 'a-slug', version: 1 });

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: bodyWithoutSourceVersion });

  expect(response.statusCode).toBe(201);
  const [calledWith] = built.createDraft.mock.calls[0] as [CreateDraftBodyDto];
  expect(calledWith).not.toHaveProperty('source_version');
});

it('answers 400 for a malformed fallback whose referral is missing its required recipient, without ever reaching createDraft', async () => {
  const built = buildTestApp();
  app = built.app;
  const malformedBody = {
    ...validCreateDraftBody(),
    fallback: { outcome: 'no-hypothesis-confirmed', referral: { action: 'an-action' } },
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: malformedBody });

  expect(response.statusCode).toBe(400);
  expect(built.createDraft).not.toHaveBeenCalled();
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when createDraft rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.createDraft.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: validCreateDraftBody() });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});
