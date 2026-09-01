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

function heldResolution(outcome = 'no-hypothesis-confirmed'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

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

it('still succeeds, originating the next draft, for a slug already naming an existing case that currently holds no open draft', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validCreateDraftBody({ slug: 'an-existing-slug-without-open-draft' });
  const createdDraft: CreatedDraft = { slug: 'an-existing-slug-without-open-draft', version: 7 };

  built.createDraft.mockResolvedValueOnce(createdDraft);

  const response = await app.inject({ method: 'POST', url: '/v1/cases', payload: body });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(createdDraft);
  expect(built.createDraft).toHaveBeenCalledWith(body);
});

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
