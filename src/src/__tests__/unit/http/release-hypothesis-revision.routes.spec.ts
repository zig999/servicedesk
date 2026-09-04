import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReleaseHypothesisRevisionControllerDependencies } from '../../../http/release-hypothesis-revision.controller.js';
import { createReleaseHypothesisRevisionRoutesPlugin } from '../../../http/release-hypothesis-revision.routes.js';

type ReleaseHypothesisRevisionMock = ReturnType<typeof vi.fn<CaseLifecycleOperations['releaseHypothesisRevision']>>;

function buildTestApp(): { app: FastifyInstance; releaseHypothesisRevision: ReleaseHypothesisRevisionMock } {
  const releaseHypothesisRevision: ReleaseHypothesisRevisionMock = vi.fn();
  const dependencies: ReleaseHypothesisRevisionControllerDependencies = { releaseHypothesisRevision };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReleaseHypothesisRevisionRoutesPlugin(dependencies));
  return { app, releaseHypothesisRevision };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('releases a draft revision and answers 204 with a wholly empty body, calling releaseHypothesisRevision with exactly the path slug, name and revision', async () => {
  const built = buildTestApp();
  app = built.app;
  built.releaseHypothesisRevision.mockResolvedValueOnce(undefined);

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/3/release',
  });

  expect(response.statusCode).toBe(204);
  expect(response.body).toBe('');
  expect(built.releaseHypothesisRevision).toHaveBeenCalledWith('a-slug', 'a-hypothesis', 3);
});

it("refuses with 409 and HypothesisRevisionNotDraftAtReleaseError's own code and message, carrying no details field at all, when the named revision is already released", async () => {
  const built = buildTestApp();
  app = built.app;
  const error = new HypothesisRevisionNotDraftAtReleaseError();
  built.releaseHypothesisRevision.mockRejectedValueOnce(error);

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/3/release',
  });

  expect(response.statusCode).toBe(409);
  expect(response.json()).toEqual({ error: { code: 'HypothesisRevisionNotDraftAtReleaseError', message: error.message } });
});

it('calls releaseHypothesisRevision with only slug, name and revision — no case-version or manifest identifier — and succeeds even when naming a hypothesis no manifest has ever referenced', async () => {
  const built = buildTestApp();
  app = built.app;
  built.releaseHypothesisRevision.mockResolvedValueOnce(undefined);

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/an-unreferenced-hypothesis/revisions/7/release',
  });

  expect(response.statusCode).toBe(204);
  expect(built.releaseHypothesisRevision.mock.calls[0]).toEqual(['a-slug', 'an-unreferenced-hypothesis', 7]);
});

it('ignores any request body sent, since the route declares no body schema and parses only its params', async () => {
  const built = buildTestApp();
  app = built.app;
  built.releaseHypothesisRevision.mockResolvedValueOnce(undefined);

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/3/release',
    payload: { unexpected: 'field' },
  });

  expect(response.statusCode).toBe(204);
  expect(built.releaseHypothesisRevision).toHaveBeenCalledWith('a-slug', 'a-hypothesis', 3);
});

it('answers 400 with VALIDATION_ERROR naming the path and a non-empty details array, for a non-numeric revision segment, without ever reaching releaseHypothesisRevision', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/not-a-number/release',
  });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string; message: string; details: unknown[] } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(body.error.message).toContain('path');
  expect(body.error.details.length).toBeGreaterThan(0);
  expect(built.releaseHypothesisRevision).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and releaseHypothesisRevisionParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({
      method: 'POST',
      url: '/v1/cases//hypotheses/a-hypothesis/revisions/3/release',
    });

    expect(response.statusCode).toBe(400);
    expect(built.releaseHypothesisRevision).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :name segment, never 404 "route not found", since releaseHypothesisRevisionParamsSchema ' +
    'requires a non-empty name exactly as it requires a non-empty slug',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({
      method: 'POST',
      url: '/v1/cases/a-slug/hypotheses//revisions/3/release',
    });

    expect(response.statusCode).toBe(400);
    expect(built.releaseHypothesisRevision).not.toHaveBeenCalled();
  },
);

it('answers 400 for a revision of zero, which fails releaseHypothesisRevisionParamsSchema\'s positive-integer requirement, without ever reaching releaseHypothesisRevision', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/0/release',
  });

  expect(response.statusCode).toBe(400);
  expect(built.releaseHypothesisRevision).not.toHaveBeenCalled();
});

it('reaches the handler and answers a real 204 response, not a 401 or 403, for a request carrying no credential header at all', async () => {
  const built = buildTestApp();
  app = built.app;
  built.releaseHypothesisRevision.mockResolvedValueOnce(undefined);

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/3/release',
    headers: {},
  });

  expect(response.statusCode).toBe(204);
  expect(built.releaseHypothesisRevision).toHaveBeenCalledTimes(1);
});

it("answers the unchanged generic envelope, never a partial body or leaked detail, when releaseHypothesisRevision rejects with a generic, non-domain error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.releaseHypothesisRevision.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({
    method: 'POST',
    url: '/v1/cases/a-slug/hypotheses/a-hypothesis/revisions/3/release',
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a sensitive internal detail nobody outside the server should see');
});
