import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { ICaseStore } from '../../../case/case-store.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import type { UpdateDraftBodyDto } from '../../../http/dto/update-draft.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { UpdateDraftControllerDependencies } from '../../../http/update-draft.controller.js';
import { createUpdateDraftRoutesPlugin } from '../../../http/update-draft.routes.js';

type UpdateDraftMock = ReturnType<typeof vi.fn<(slug: string, version: number, attributes: UpdateDraftBodyDto) => Promise<void>>>;
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

function heldDraftCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'an-updated-title',
    when_to_use: 'when an attendant needs the updated case',
    version: 3,
    authored_at: '2024-03-01T00:00:00.000Z',
    subject: 'an-updated-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'draft',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

function validUpdateBody(): UpdateDraftBodyDto {
  return {
    title: 'an-updated-title',
    when_to_use: 'when an attendant needs the updated case',
    subject: 'an-updated-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    consolidation_register: 'formal',
  };
}

function stubCaseStore(updateDraft: UpdateDraftMock): ICaseStore {
  return {
    assembleVersion: vi.fn(),
    findDraftVersion: vi.fn(),
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
    createDraft: vi.fn(),
    insertHypothesisRevision: vi.fn(),
    placeHypothesis: vi.fn(),
    removeManifestEntry: vi.fn(),
    release: vi.fn(),
    discard: vi.fn(),
    updateDraft,
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

function buildTestApp(): { app: FastifyInstance; updateDraft: UpdateDraftMock; readCase: ReadCaseMock } {
  const updateDraft: UpdateDraftMock = vi.fn();
  const readCase: ReadCaseMock = vi.fn();
  const dependencies: UpdateDraftControllerDependencies = {
    caseStore: stubCaseStore(updateDraft),
    caseQuery: stubCaseQuery(readCase),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createUpdateDraftRoutesPlugin(dependencies));
  return { app, updateDraft, readCase };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the version updateDraft corrected, read back whole through the published case-query and projected the same way read-case-route already is', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validUpdateBody();
  const updatedCase = heldDraftCase();
  built.updateDraft.mockResolvedValueOnce(undefined);
  built.readCase.mockResolvedValueOnce({ case: updatedCase });

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/3', payload: body });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    slug: updatedCase.slug,
    title: updatedCase.title,
    when_to_use: updatedCase.when_to_use,
    version: updatedCase.version,
    authored_at: updatedCase.authored_at,
    subject: updatedCase.subject,
    fallback: updatedCase.fallback,
    state: updatedCase.state,
    manifest: updatedCase.manifest,
  });
  expect(built.updateDraft).toHaveBeenCalledWith('a-slug', 3, body);
  expect(built.readCase).toHaveBeenCalledWith('a-slug', 3);
});

it('calls updateDraft before readCase, so the response reflects the write just made rather than a stale prior read', async () => {
  const built = buildTestApp();
  app = built.app;
  const callOrder: string[] = [];
  built.updateDraft.mockImplementationOnce(async () => {
    callOrder.push('updateDraft');
  });
  built.readCase.mockImplementationOnce(async () => {
    callOrder.push('readCase');
    return { case: heldDraftCase() };
  });

  await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/3', payload: validUpdateBody() });

  expect(callOrder).toEqual(['updateDraft', 'readCase']);
});

it('refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the version back, when the named version is not draft', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockRejectedValueOnce(new CaseVersionNotDraftError('a-slug', 1, 'released'));

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/1', payload: validUpdateBody() });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotDraftError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'released' });
  expect(built.readCase).not.toHaveBeenCalled();
});

it('refuses with the status the status map assigns CaseNotFoundError, and never reads the version back, when no version answers the named slug and version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/an-absent-slug/versions/9', payload: validUpdateBody() });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
  expect(built.readCase).not.toHaveBeenCalled();
});

it('answers 400 for a body missing a required attribute, without ever reaching caseStore.updateDraft', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validUpdateBody();
  const bodyWithoutTitle = { when_to_use: fullBody.when_to_use, subject: fullBody.subject, fallback: fullBody.fallback };

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/1', payload: bodyWithoutTitle });

  expect(response.statusCode).toBe(400);
  expect(built.updateDraft).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric version segment, without ever reaching caseStore.updateDraft', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/not-a-number', payload: validUpdateBody() });

  expect(response.statusCode).toBe(400);
  expect(built.updateDraft).not.toHaveBeenCalled();
});

it('answers 400 via validation for a request with an empty version segment, without ever reaching caseStore.updateDraft', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/', payload: validUpdateBody() });

  expect(response.statusCode).toBe(400);
  expect(built.updateDraft).not.toHaveBeenCalled();
});

it('succeeds when consolidation_register is omitted from the body entirely, calling updateDraft with it absent rather than defaulted to some value', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validUpdateBody();
  const bodyWithoutRegister = { title: fullBody.title, when_to_use: fullBody.when_to_use, subject: fullBody.subject, fallback: fullBody.fallback };
  built.updateDraft.mockResolvedValueOnce(undefined);
  built.readCase.mockResolvedValueOnce({ case: heldDraftCase() });

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/3', payload: bodyWithoutRegister });

  expect(response.statusCode).toBe(200);
  const [, , attributes] = built.updateDraft.mock.calls[0] as [string, number, UpdateDraftBodyDto];
  expect(attributes).not.toHaveProperty('consolidation_register');
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when updateDraft rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/1', payload: validUpdateBody() });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(built.readCase).not.toHaveBeenCalled();
});
