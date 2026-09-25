import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CaseVersionAttributes, ICaseQuery, ReadCaseVersionResult } from '../../../case/case-query.port.js';
import type { ICaseStore } from '../../../case/case-store.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import type { UpdateDraftBodyDto } from '../../../http/dto/update-draft.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { UpdateDraftControllerDependencies } from '../../../http/update-draft.controller.js';
import { createUpdateDraftRoutesPlugin } from '../../../http/update-draft.routes.js';

type UpdateDraftMock = ReturnType<typeof vi.fn<(slug: string, version: number, attributes: UpdateDraftBodyDto) => Promise<void>>>;
type ReadCaseVersionMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseVersionResult>>>;

function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

function heldAttributes(overrides: Partial<CaseVersionAttributes> = {}): CaseVersionAttributes {
  return {
    title: 'an-updated-title',
    when_to_use: 'when an attendant needs the updated case',
    subject: 'an-updated-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
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

function stubCaseQuery(readCaseVersion: ReadCaseVersionMock): ICaseQuery {
  return {
    readCase: vi.fn(),
    readCaseVersion,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
}

function buildTestApp(): { app: FastifyInstance; updateDraft: UpdateDraftMock; readCaseVersion: ReadCaseVersionMock } {
  const updateDraft: UpdateDraftMock = vi.fn();
  const readCaseVersion: ReadCaseVersionMock = vi.fn();
  const dependencies: UpdateDraftControllerDependencies = {
    caseStore: stubCaseStore(updateDraft),
    caseQuery: stubCaseQuery(readCaseVersion),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createUpdateDraftRoutesPlugin(dependencies));
  return { app, updateDraft, readCaseVersion };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers 200 with the body built from caseQuery.readCaseVersion's own stored-record read, dropping none of its five declared attributes and carrying no manifest field", async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validUpdateBody();
  const attributes = heldAttributes({ consolidation_register: 'plain' });
  built.updateDraft.mockResolvedValueOnce(undefined);
  built.readCaseVersion.mockResolvedValueOnce({ version: attributes });

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/3', payload: body });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    title: attributes.title,
    when_to_use: attributes.when_to_use,
    subject: attributes.subject,
    fallback: attributes.fallback,
    consolidation_register: attributes.consolidation_register,
  });
  expect(built.updateDraft).toHaveBeenCalledWith('a-slug', 3, body);
  expect(built.readCaseVersion).toHaveBeenCalledWith('a-slug', 3);
});

it('answers 200 for a well-formed update-draft whose submitted subject names a subject type the glossary does not hold, since this route never checks glossary coherence', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockResolvedValueOnce(undefined);
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes({ subject: 'an-unregistered-subject-type' }) });

  const response = await app.inject({
    method: 'PATCH',
    url: '/v1/cases/a-slug/versions/3',
    payload: { ...validUpdateBody(), subject: 'an-unregistered-subject-type' },
  });

  expect(response.statusCode).toBe(200);
});

it('refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the version back, when the named version is not draft', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockRejectedValueOnce(new CaseVersionNotDraftError('a-slug', 1, 'released'));

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/1', payload: validUpdateBody() });

  expect(response.statusCode).toBe(409);
  const responseBody = response.json() as { error: { code: string; details?: unknown } };
  expect(responseBody.error.code).toBe('CaseVersionNotDraftError');
  expect(responseBody.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'released' });
  expect(built.readCaseVersion).not.toHaveBeenCalled();
});

it('refuses with the status the status map assigns CaseNotFoundError, and never reads the version back, when no version answers the named slug and version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.updateDraft.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/an-absent-slug/versions/9', payload: validUpdateBody() });

  expect(response.statusCode).toBe(404);
  const responseBody = response.json() as { error: { code: string; details?: unknown } };
  expect(responseBody.error.code).toBe('CaseNotFoundError');
  expect(responseBody.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
  expect(built.readCaseVersion).not.toHaveBeenCalled();
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

it('names VALIDATION_ERROR, the body as the part that failed, and a non-empty details list, on that same missing-attribute refusal', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validUpdateBody();
  const bodyWithoutTitle = { when_to_use: fullBody.when_to_use, subject: fullBody.subject, fallback: fullBody.fallback };

  const response = await app.inject({ method: 'PATCH', url: '/v1/cases/a-slug/versions/1', payload: bodyWithoutTitle });

  const responseBody = response.json() as { error: { code: string; message: string; details: unknown[] } };
  expect(responseBody.error.code).toBe('VALIDATION_ERROR');
  expect(responseBody.error.message).toContain('body');
  expect(responseBody.error.details.length).toBeGreaterThan(0);
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
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes() });

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
  expect(built.readCaseVersion).not.toHaveBeenCalled();
});
