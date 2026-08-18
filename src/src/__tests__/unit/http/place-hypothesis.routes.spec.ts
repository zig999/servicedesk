// Proof for task/case-lifecycle-http/place-hypothesis-route: PUT
// /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name} exercised
// through Fastify's own app.inject() against a local instance registering
// createPlaceHypothesisRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape discard.routes.spec.ts
// already establishes for a no-read-after-write, 204-empty-body route,
// adapted for this route's own three path segments and its own request
// body. CaseLifecycleOperations['placeHypothesis'] is the one stand-in here
// (TST-03 — a stand-in replaces a boundary, never business logic):
// manifest-composition.operations.ts's own placeHypothesis — which reads the
// named version's own current state first and refuses through
// CaseNotFoundError, CaseVersionNotDraftError or ManifestPositionOccupiedError
// before any write — is proved separately in its own operation spec
// (__tests__/integration/case/manifest-composition.operations.spec.ts). This
// file proves only that the route, controller and DTO carry that contract's
// promise onto the wire unchanged: a valid request places the named
// hypothesis's stated revision at the stated position and answers 204 with
// nothing, both refusals this task's own criteria name reach the shared
// status map unmapped by anything this route or its controller adds, and
// the DTO's own disclosed .positive() inference for revision and position is
// enforced at the validation boundary before placeHypothesis is ever
// reached.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import type { CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { PlaceHypothesisControllerDependencies } from '../../../http/place-hypothesis.controller.js';
import { createPlaceHypothesisRoutesPlugin } from '../../../http/place-hypothesis.routes.js';

type PlaceHypothesisMock = ReturnType<typeof vi.fn<CaseLifecycleOperations['placeHypothesis']>>;

/** A body every request in this file starts from, both fields present and each a positive integer — overridden per test where a specific value or absence is what the test proves. */
function validBody(overrides: Partial<{ revision: number; position: number }> = {}): { revision: number; position: number } {
  return { revision: 2, position: 1, ...overrides };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors discard.routes.spec.ts's own buildTestApp, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; placeHypothesis: PlaceHypothesisMock } {
  const placeHypothesis: PlaceHypothesisMock = vi.fn();
  const dependencies: PlaceHypothesisControllerDependencies = { placeHypothesis };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createPlaceHypothesisRoutesPlugin(dependencies));
  return { app, placeHypothesis };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it("places the named hypothesis's stated revision at the stated manifest position, and answers 204 with a wholly empty body", async () => {
  const built = buildTestApp();
  app = built.app;
  built.placeHypothesis.mockResolvedValueOnce(undefined);

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: validBody({ revision: 2, position: 1 }),
  });

  expect(response.statusCode).toBe(204);
  expect(response.body).toBe('');
  expect(response.rawPayload.length).toBe(0);
  expect(built.placeHypothesis).toHaveBeenCalledWith({
    slug: 'a-slug',
    version: 3,
    hypothesis_name: 'hypothesis-a',
    revision: 2,
    position: 1,
  });
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns CaseVersionNotDraftError when the named version is not draft', async () => {
  const built = buildTestApp();
  app = built.app;
  built.placeHypothesis.mockRejectedValueOnce(new CaseVersionNotDraftError('a-slug', 1, 'released'));

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/1/manifest/hypothesis-a',
    payload: validBody(),
  });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotDraftError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'released' });
});

// ------------------------------------------------------------------ criterion 3

it('refuses with the status the status map assigns ManifestPositionOccupiedError when the named position is already held by a different hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  built.placeHypothesis.mockRejectedValueOnce(new ManifestPositionOccupiedError('a-slug', 3, 1));

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: validBody({ position: 1 }),
  });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ManifestPositionOccupiedError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 3, position: 1 });
});

// ------------------------------------------------------------------ edge cases

it('answers 400 for a body missing revision, without ever reaching placeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: { position: 1 },
  });

  expect(response.statusCode).toBe(400);
  expect(built.placeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a body missing position, without ever reaching placeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: { revision: 1 },
  });

  expect(response.statusCode).toBe(400);
  expect(built.placeHypothesis).not.toHaveBeenCalled();
});

it("answers 400 for a revision of 0, one below the schema's own disclosed .positive() lower boundary, without ever reaching placeHypothesis", async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: validBody({ revision: 0 }),
  });

  expect(response.statusCode).toBe(400);
  expect(built.placeHypothesis).not.toHaveBeenCalled();
});

it("answers 400 for a position of 0, one below the schema's own disclosed .positive() lower boundary, without ever reaching placeHypothesis", async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: validBody({ position: 0 }),
  });

  expect(response.statusCode).toBe(400);
  expect(built.placeHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric version segment, without ever reaching placeHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/not-a-number/manifest/hypothesis-a',
    payload: validBody(),
  });

  expect(response.statusCode).toBe(400);
  expect(built.placeHypothesis).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and placeHypothesisParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({
      method: 'PUT',
      url: '/v1/cases//versions/3/manifest/hypothesis-a',
      payload: validBody(),
    });

    expect(response.statusCode).toBe(400);
    expect(built.placeHypothesis).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :version segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and placeHypothesisParamsSchema (z.coerce.number().int().positive()) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({
      method: 'PUT',
      url: '/v1/cases/a-slug/versions//manifest/hypothesis-a',
      payload: validBody(),
    });

    expect(response.statusCode).toBe(400);
    expect(built.placeHypothesis).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :hypothesis_name segment, never 404 "route not found" — Fastify still matches ' +
    "the route with an empty string param for this segment, and placeHypothesisParamsSchema (z.string().min(1)) is what refuses it",
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({
      method: 'PUT',
      url: '/v1/cases/a-slug/versions/3/manifest/',
      payload: validBody(),
    });

    expect(response.statusCode).toBe(400);
    expect(built.placeHypothesis).not.toHaveBeenCalled();
  },
);

it("answers the unchanged generic envelope, never the rejected call's own error text, when placeHypothesis rejects with a generic, non-domain error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.placeHypothesis.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/cases/a-slug/versions/3/manifest/hypothesis-a',
    payload: validBody(),
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a sensitive internal detail nobody outside the server should see');
});
