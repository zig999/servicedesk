// Proof for task/case-query-http/read-case-route: GET /v1/cases/{slug}/versions/{version}
// exercised through Fastify's own app.inject() against a local instance registering
// createReadCaseRoutesPlugin() and error-handler.middleware.ts's own handleUnexpectedError
// directly — the same shape read-capability.routes.spec.ts already establishes, adapted because
// build-app.ts does not yet register this route (that wiring is
// task/case-lifecycle-http/register-routes-in-build-app, still outstanding at the time of this
// proof). The published case-query read is a stand-in here (TST-03 — a stand-in replaces a
// boundary, never business logic): ICaseQuery.readCase is exactly the seam
// ReadCaseControllerDependencies declares, stood in for by a vi.fn(); case-query.service.ts's own
// readCase — which never answers a partial result, throwing CaseNotFoundError or CaseNotValidError
// instead — is proved separately in __tests__/unit/case/case-query.service.spec.ts. This file
// proves only that the route, controller and DTO carry that contract's promise onto the wire
// unchanged.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { readCaseResponseSchema } from '../../../http/dto/read-case.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCaseControllerDependencies } from '../../../http/read-case.controller.js';
import { createReadCaseRoutesPlugin } from '../../../http/read-case.routes.js';

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

/** A case version as case-query would already hold it, both optional attributes present, manifest carrying two whole entries — so criterion 1's "its manifest and every manifest entry's own hypothesis-revision" has more than one to assert against. */
function heldCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    consolidation_register: 'formal',
    state: 'released',
    released_at: '2024-02-01T00:00:00.000Z',
    manifest: [heldManifestEntry(1, 'hypothesis-a'), heldManifestEntry(2, 'hypothesis-b')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

/** A draft case version carrying neither optional attribute at all — never the same case with those fields set to undefined. */
function heldDraftCase(): Case {
  return {
    slug: 'a-draft-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 3,
    authored_at: '2024-03-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'draft',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors what build-app.ts wires for diagnose, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; readCase: ReadCaseMock } {
  const readCase: ReadCaseMock = vi.fn();
  // listCases, listCaseVersions, listHypotheses and listHypothesisRevisions are no part of what
  // this file proves (read-case-route's own ICaseQuery seam is readCase alone) — stubbed only so
  // this fake keeps satisfying ICaseQuery now that task/case-query-http/list-cases-route,
  // list-case-versions-route, list-hypotheses-route and list-hypothesis-revisions-route added them
  // to it.
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: ReadCaseControllerDependencies = { caseQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCaseRoutesPlugin(dependencies));
  return { app, readCase };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it("answers 200 with the named case version assembled whole — its own attributes, its manifest and every manifest entry's own hypothesis-revision", async () => {
  const built = buildTestApp();
  app = built.app;
  const theCase = heldCase();
  built.readCase.mockResolvedValueOnce({ case: theCase });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    slug: theCase.slug,
    title: theCase.title,
    when_to_use: theCase.when_to_use,
    version: theCase.version,
    authored_at: theCase.authored_at,
    subject: theCase.subject,
    fallback: theCase.fallback,
    consolidation_register: theCase.consolidation_register,
    state: theCase.state,
    released_at: theCase.released_at,
    manifest: theCase.manifest,
  });
  expect(Object.keys(response.json() as object).sort()).toEqual(Object.keys(readCaseResponseSchema.shape).sort());
});

it('resolves the slug and version exactly as the path names them, the version coerced from its string segment into a number', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase.mockResolvedValueOnce({ case: heldCase() });

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/7' });

  expect(built.readCase).toHaveBeenCalledWith('a-slug', 7);
});

it("never carries Case.hypotheses — the flattened per-version projection this route's own dto excludes — even though the assembled case itself still carries it", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase.mockResolvedValueOnce({ case: heldCase() });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1' });

  expect(response.json()).not.toHaveProperty('hypotheses');
});

it('omits consolidation_register and released_at entirely, rather than as null, when the assembled case does not carry them', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase.mockResolvedValueOnce({ case: heldDraftCase() });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-draft-slug/versions/3' });

  const body = response.json() as object;
  expect(body).not.toHaveProperty('consolidation_register');
  expect(body).not.toHaveProperty('released_at');
  const expectedKeys = Object.keys(readCaseResponseSchema.shape).filter(
    (key) => key !== 'consolidation_register' && key !== 'released_at',
  );
  expect(Object.keys(body).sort()).toEqual(expectedKeys.sort());
});

it("answers each of two requests naming different slug/version pairs with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase
    .mockResolvedValueOnce({ case: heldCase({ slug: 'slug-a', version: 1 }) })
    .mockResolvedValueOnce({ case: heldDraftCase() });

  const first = await app.inject({ method: 'GET', url: '/v1/cases/slug-a/versions/1' });
  const second = await app.inject({ method: 'GET', url: '/v1/cases/a-draft-slug/versions/3' });

  expect((first.json() as { slug: string }).slug).toBe('slug-a');
  expect((second.json() as { slug: string }).slug).toBe('a-draft-slug');
});

// ------------------------------------------------------------------ criterion 2

it('refuses with the status the status map assigns CaseNotFoundError, when no version answers the named slug and version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/versions/9' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
});

// ------------------------------------------------------------------ criterion 3

it('answers the unchanged generic envelope, never a partial body, when the named version cannot be assembled whole', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCase.mockRejectedValueOnce(new CaseNotValidError('a-slug', 1, ['a violated rule']));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});

// ------------------------------------------------------------------ edge cases

it('answers 400 for a non-numeric version segment, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.readCase).not.toHaveBeenCalled();
});

it('answers 400 for a version of zero, one below the positive range the domain declares, without ever reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/0' });

  expect(response.statusCode).toBe(400);
  expect(built.readCase).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty version segment, never reaching the case query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/' });

  expect(response.statusCode).toBe(400);
  expect(built.readCase).not.toHaveBeenCalled();
});
