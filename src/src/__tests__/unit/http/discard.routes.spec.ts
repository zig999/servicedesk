import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { DiscardControllerDependencies } from '../../../http/discard.controller.js';
import { createDiscardRoutesPlugin } from '../../../http/discard.routes.js';

type DiscardMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<void>>>;

function buildTestApp(): { app: FastifyInstance; discard: DiscardMock } {
  const discard: DiscardMock = vi.fn();
  const dependencies: DiscardControllerDependencies = { discard };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDiscardRoutesPlugin(dependencies));
  return { app, discard };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('removes the named draft version through discard and answers 204 with a wholly empty body', async () => {
  const built = buildTestApp();
  app = built.app;
  built.discard.mockResolvedValueOnce(undefined);

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/3' });

  expect(response.statusCode).toBe(204);
  expect(response.body).toBe('');
  expect(response.rawPayload.length).toBe(0);
  expect(built.discard).toHaveBeenCalledWith('a-slug', 3);
});

it('refuses with the status the status map assigns CaseVersionNotDraftError when the named version is not draft', async () => {
  const built = buildTestApp();
  app = built.app;
  built.discard.mockRejectedValueOnce(new CaseVersionNotDraftError('a-slug', 1, 'released'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/1' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotDraftError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'released' });
});

it('refuses with the status the status map assigns CaseNotFoundError when no version answers an unknown slug', async () => {
  const built = buildTestApp();
  app = built.app;
  built.discard.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/an-absent-slug/versions/9' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
});

it('refuses with the status the status map assigns CaseNotFoundError when the slug is known but the named version is not', async () => {
  const built = buildTestApp();
  app = built.app;
  built.discard.mockRejectedValueOnce(new CaseNotFoundError('a-slug', 99));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/99' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 99 });
  // The route and controller add no error-mapping logic of their own (see
  // header comment): both an unknown slug and a known-slug-unknown-version
  // absence reach here as the identical CaseNotFoundError, so this test and
  // its sibling above are deliberately symmetric rather than distinguishing
  // a boundary this layer cannot see — the same disclosed scope boundary
  // list-hypothesis-revisions-route's own proof already established.
});

it('answers 400 for a non-numeric version segment, without ever reaching discard', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.discard).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty version segment, without ever reaching discard', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/' });

  expect(response.statusCode).toBe(400);
  expect(built.discard).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty slug segment, without ever reaching discard', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases//versions/1' });

  expect(response.statusCode).toBe(400);
  expect(built.discard).not.toHaveBeenCalled();
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when discard rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.discard.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/1' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a generic failure');
});
