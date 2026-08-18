// Proof for task/case-lifecycle-http/release-route: POST
// /v1/cases/{slug}/versions/{version}/release exercised through Fastify's
// own app.inject() against a local instance registering
// createReleaseRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape update-draft.routes.spec.ts
// and read-case.routes.spec.ts already establish, adapted for release's own
// no-body shape and its own pair of dependencies (release, caseQuery).
// Both CaseLifecycleOperations['release'] and ICaseQuery.readCase are
// stand-ins here (TST-03 — a stand-in replaces a boundary, never business
// logic): release.operation.ts's own release — which refuses through
// CaseVersionNotDraftAtReleaseError where the named version is not in draft
// state, through CaseVersionNotReleasableError naming every violated rule
// together where its assembled manifest fails a structural or coherence
// rule, and through CaseNotFoundError where the slug/version is not stored
// at all — is proved separately in its own operation spec; case-query
// .service.ts's own readCase is proved separately in
// case-query.service.spec.ts. This file proves only that the route,
// controller and DTO carry those contracts' promises onto the wire
// unchanged, in the release-then-read-back order release.controller.ts's
// own header comment states.
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

/** domain/knowledge/resolution, whole: an outcome paired with its referral. */
function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

/** domain/knowledge/manifest-entry: one precedence position pinning one whole hypothesis-revision. */
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

/** A released case version, as case-query would read it back once release has moved it out of draft — carrying released_at, present only once released (domain/knowledge/case-version). */
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

/** ICaseQuery stood in whole: readCase alone is this file's own seam, the same convention update-draft.routes.spec.ts's own caseQuery stub keeps. */
function stubCaseQuery(readCase: ReadCaseMock): ICaseQuery {
  return {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors update-draft.routes.spec.ts's own buildTestApp, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2

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

// ------------------------------------------------------------------ criterion 3

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

// ------------------------------------------------------------------ edge cases

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
