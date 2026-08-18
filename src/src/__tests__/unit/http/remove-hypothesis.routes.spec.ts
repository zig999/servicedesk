// Proof for task/case-lifecycle-http/remove-hypothesis-route: DELETE
// /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name} exercised
// through Fastify's own app.inject() against a local instance registering
// createRemoveHypothesisRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape discard.routes.spec.ts
// already establishes, narrowed for a route with no body, no
// read-after-write and one further path segment.
// CaseLifecycleOperations['removeHypothesis'] is the one stand-in here
// (TST-03 — a stand-in replaces a boundary, never business logic):
// manifest-composition.operations.ts's own removeHypothesis — which reads
// the named version's own current state first and refuses through
// CaseNotFoundError, CaseVersionNotDraftError or
// ManifestWouldHoldNoHypothesisError before ever reaching the store's own
// removeManifestEntry() primitive — is proved separately in its own
// operation spec. This file proves only that the route, controller and DTO
// carry that contract's promise onto the wire unchanged: a valid request
// removes the named manifest entry and answers 204 with nothing, and every
// refusal the operation raises reaches the shared status map unmapped by
// anything this route or its controller adds.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RemoveHypothesisControllerDependencies } from '../../../http/remove-hypothesis.controller.js';
import { createRemoveHypothesisRoutesPlugin } from '../../../http/remove-hypothesis.routes.js';
import type { RemoveHypothesisParamsDto } from '../../../http/dto/remove-hypothesis.dto.js';

type RemoveHypothesisMock = ReturnType<typeof vi.fn<(input: RemoveHypothesisParamsDto) => Promise<void>>>;

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors discard.routes.spec.ts's own buildTestApp, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; removeHypothesis: RemoveHypothesisMock } {
  const removeHypothesis: RemoveHypothesisMock = vi.fn();
  const dependencies: RemoveHypothesisControllerDependencies = { removeHypothesis };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRemoveHypothesisRoutesPlugin(dependencies));
  return { app, removeHypothesis };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('removes the named hypothesis manifest entry through removeHypothesis and answers 204 with a wholly empty body', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeHypothesis.mockResolvedValueOnce(undefined);

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/3/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(204);
  expect(response.body).toBe('');
  expect(response.rawPayload.length).toBe(0);
  expect(built.removeHypothesis).toHaveBeenCalledWith({ slug: 'a-slug', version: 3, hypothesis_name: 'some-hypothesis' });
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns ManifestWouldHoldNoHypothesisError when the removal would leave the manifest empty', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeHypothesis.mockRejectedValueOnce(new ManifestWouldHoldNoHypothesisError('a-slug', 2));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/2/manifest/only-hypothesis' });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ManifestWouldHoldNoHypothesisError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 2 });
});

// ------------------------------------------------------------------ criterion 3

it('refuses with the status the status map assigns CaseVersionNotDraftError when the named version is released', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeHypothesis.mockRejectedValueOnce(new CaseVersionNotDraftError('a-slug', 1, 'released'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/1/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotDraftError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'released' });
});

// ------------------------------------------------------------------ edge cases

it('answers 400 for a non-numeric version segment, without ever reaching removeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/not-a-number/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(400);
  expect(built.removeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a version segment of 0, the schema\'s own positive-integer boundary, without ever reaching removeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/0/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(400);
  expect(built.removeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty slug segment, without ever reaching removeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases//versions/3/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(400);
  expect(built.removeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty version segment, without ever reaching removeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions//manifest/some-hypothesis' });

  expect(response.statusCode).toBe(400);
  expect(built.removeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty hypothesis_name segment, without ever reaching removeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/3/manifest/' });

  expect(response.statusCode).toBe(400);
  expect(built.removeHypothesis).not.toHaveBeenCalled();
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when removeHypothesis rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeHypothesis.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug/versions/1/manifest/some-hypothesis' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a generic failure');
});
