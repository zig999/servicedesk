import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReleaseControllerDependencies } from '../../../http/release.controller.js';
import { createReleaseRoutesPlugin } from '../../../http/release.routes.js';
import type { CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';

type ReleaseMock = ReturnType<typeof vi.fn<CaseLifecycleOperations['release']>>;
type ReadCaseMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>>;

function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

function heldManifestEntry(position: number, hypothesisName: string): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesisName },
      revision: 1,
      criterion: 'a-criterion',
      collects: ['a-concept'],
      resolution: heldResolution(),
    },
  };
}

function heldReleasedCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs this case',
    version: 3,
    authored_at: '2024-03-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'released',
    released_at: '2024-03-02T00:00:00.000Z',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

function stubCaseQuery(readCase: ReadCaseMock): ICaseQuery {
  return {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
}

function buildTestApp(): { app: FastifyInstance; release: ReleaseMock; readCase: ReadCaseMock } {
  const release: ReleaseMock = vi.fn();
  const readCase: ReadCaseMock = vi.fn();
  const dependencies: ReleaseControllerDependencies = {
    release,
    caseQuery: stubCaseQuery(readCase),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReleaseRoutesPlugin(dependencies));
  return { app, release, readCase };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the version now in released state, read back whole through the published case-query and projected the same way read-case-route already is', async () => {
  const built = buildTestApp();
  app = built.app;
  const releasedCase = heldReleasedCase();
  built.release.mockResolvedValueOnce(undefined);
  built.readCase.mockResolvedValueOnce({ case: releasedCase });

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/3/release' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    slug: releasedCase.slug,
    title: releasedCase.title,
    when_to_use: releasedCase.when_to_use,
    version: releasedCase.version,
    authored_at: releasedCase.authored_at,
    subject: releasedCase.subject,
    fallback: releasedCase.fallback,
    state: 'released',
    released_at: releasedCase.released_at,
    manifest: releasedCase.manifest,
  });
  expect(built.release).toHaveBeenCalledWith('a-slug', 3);
  expect(built.readCase).toHaveBeenCalledWith('a-slug', 3);
});

it('calls release before readCase, so the response reflects the transition just made rather than a stale prior read', async () => {
  const built = buildTestApp();
  app = built.app;
  const callOrder: string[] = [];
  built.release.mockImplementationOnce(async () => {
    callOrder.push('release');
  });
  built.readCase.mockImplementationOnce(async () => {
    callOrder.push('readCase');
    return { case: heldReleasedCase() };
  });

  await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/3/release' });

  expect(callOrder).toEqual(['release', 'readCase']);
});

it('refuses with the status the status map assigns CaseVersionNotDraftAtReleaseError, and never reads the version back, when the named version is already released', async () => {
  const built = buildTestApp();
  app = built.app;
  built.release.mockRejectedValueOnce(new CaseVersionNotDraftAtReleaseError('a-slug', 3, 'released'));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/3/release' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotDraftAtReleaseError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 3, state: 'released' });
  expect(built.readCase).not.toHaveBeenCalled();
});

it('refuses with the status the status map assigns CaseVersionNotReleasableError, naming every violated rule together, and never reads the version back, when the assembled manifest fails more than one rule', async () => {
  const built = buildTestApp();
  app = built.app;
  const violations = ['a structural rule is violated', 'a coherence rule is violated'];
  built.release.mockRejectedValueOnce(new CaseVersionNotReleasableError('a-slug', 3, violations));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/3/release' });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotReleasableError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 3, violations });
  expect(built.readCase).not.toHaveBeenCalled();
});

it('refuses with the status the status map assigns CaseNotFoundError, and never reads the version back, when no version answers the named slug and version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.release.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/an-absent-slug/versions/9/release' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
  expect(built.readCase).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric version segment, without ever reaching release', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/not-a-number/release' });

  expect(response.statusCode).toBe(400);
  expect(built.release).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and releaseParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'POST', url: '/v1/cases//versions/3/release' });

    expect(response.statusCode).toBe(400);
    expect(built.release).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :version segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and releaseParamsSchema (z.coerce.number().int().positive()) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions//release' });

    expect(response.statusCode).toBe(400);
    expect(built.release).not.toHaveBeenCalled();
  },
);

it("answers 500 with the generic envelope, never the rejected call's own error text, when release itself rejects with an untyped error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.release.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/versions/3/release' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(built.readCase).not.toHaveBeenCalled();
});
