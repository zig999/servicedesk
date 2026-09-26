import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseHoldsVersionsError } from '../../../errors/case-holds-versions.error.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { DeleteCaseControllerDependencies } from '../../../http/delete-case.controller.js';
import { createDeleteCaseRoutesPlugin } from '../../../http/delete-case.routes.js';

// Stands in for the store/domain boundary only (TST-03): this route and its controller add no
// error-mapping or message logic of their own (mirrors discard.routes.ts and
// remove-connector.routes.ts), so a mocked delete() rejecting with the real error classes exercises
// exactly what this layer contributes — forwarding, not formatting.
type DeleteCaseMock = ReturnType<typeof vi.fn<(slug: string) => Promise<void>>>;

function buildTestApp(): { app: FastifyInstance; delete: DeleteCaseMock } {
  const deleteMock: DeleteCaseMock = vi.fn();
  const dependencies: DeleteCaseControllerDependencies = { delete: deleteMock };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDeleteCaseRoutesPlugin(dependencies));
  return { app, delete: deleteMock };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('removes the named case through delete and answers 204 with a wholly empty body', async () => {
  const built = buildTestApp();
  app = built.app;
  built.delete.mockResolvedValueOnce(undefined);

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug' });

  expect(response.statusCode).toBe(204);
  expect(response.body).toBe('');
  expect(response.rawPayload.length).toBe(0);
  expect(built.delete).toHaveBeenCalledWith('a-slug');
});

it(
  'refuses with the status the status map assigns CaseHoldsVersionsError when the named case holds a ' +
    "draft version, carrying that slug in its details — the route and controller add no error-mapping " +
    'logic of their own, so this test and its sibling below (for a released version) are deliberately ' +
    'symmetric rather than distinguishing a boundary this layer cannot see',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.delete.mockRejectedValueOnce(new CaseHoldsVersionsError('a-slug-holding-a-draft'));

    const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug-holding-a-draft' });

    expect(response.statusCode).toBe(409);
    const body = response.json() as { error: { code: string; details?: unknown } };
    expect(body.error.code).toBe('CaseHoldsVersionsError');
    expect(body.error.details).toMatchObject({ slug: 'a-slug-holding-a-draft' });
  },
);

it(
  'refuses with the identical status, code and details shape when the named case holds a released ' +
    'version instead of a draft one — the same disclosed scope boundary as its sibling above',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.delete.mockRejectedValueOnce(new CaseHoldsVersionsError('a-slug-holding-a-released-version'));

    const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-slug-holding-a-released-version' });

    expect(response.statusCode).toBe(409);
    const body = response.json() as { error: { code: string; details?: unknown } };
    expect(body.error.code).toBe('CaseHoldsVersionsError');
    expect(body.error.details).toMatchObject({ slug: 'a-slug-holding-a-released-version' });
  },
);

it('refuses with the status the status map assigns CaseNotFoundError when no case answers an unknown slug, carrying that slug in its details', async () => {
  const built = buildTestApp();
  app = built.app;
  built.delete.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 0));

  const response = await app.inject({ method: 'DELETE', url: '/v1/cases/an-absent-slug' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toMatchObject({ slug: 'an-absent-slug' });
});

it(
  'answers 400 via validation for a request with an empty :slug segment, naming the path as what ' +
    'failed validation, without ever reaching delete — Fastify still matches the route with an empty ' +
    "string param for this segment, and deleteCaseParamsSchema (z.string().min(1)) is what refuses it",
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'DELETE', url: '/v1/cases/' });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { error: { code: string; message: string; details: unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toContain('path');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(built.delete).not.toHaveBeenCalled();
  },
);

it(
  "forwards CaseNotFoundError's own message through this route unreformatted, still naming the case " +
    'in Brazilian Portuguese ("caso", never the English "case") — unlike an implementation whose own ' +
    'route or controller intercepted the rejection and substituted an English message before answering ' +
    "(CaseHoldsVersionsError's own equivalent forwarding, together with its details' exactness, is " +
    'proven end to end against the real store in the sibling integration spec for this route)',
  async () => {
    const built = buildTestApp();
    app = built.app;
    built.delete.mockRejectedValueOnce(new CaseNotFoundError('a-checked-slug', 0));

    const response = await app.inject({ method: 'DELETE', url: '/v1/cases/a-checked-slug' });

    const body = response.json() as { error: { message: string } };
    expect(body.error.message).toMatch(/\bcaso\b/);
    expect(body.error.message).not.toMatch(/\bcase\b/i);
  },
);
