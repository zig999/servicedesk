import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { CaseVersionAttributes, ICaseQuery, ReadCaseVersionResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { readCaseVersionResponseSchema } from '../../../http/dto/read-case-version.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCaseVersionControllerDependencies } from '../../../http/read-case-version.controller.js';
import { createReadCaseVersionRoutesPlugin } from '../../../http/read-case-version.routes.js';

type ReadCaseVersionMock = ReturnType<
  typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseVersionResult>>
>;

function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

function heldAttributes(overrides: Partial<CaseVersionAttributes> = {}): CaseVersionAttributes {
  return {
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    subject: 'a-subject',
    fallback: heldResolution(),
    ...overrides,
  };
}

function buildTestApp(): { app: FastifyInstance; readCaseVersion: ReadCaseVersionMock } {
  const readCaseVersion: ReadCaseVersionMock = vi.fn();

  const caseQuery: ICaseQuery = {
    readCase: vi.fn(),
    readCaseVersion,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: ReadCaseVersionControllerDependencies = { caseQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCaseVersionRoutesPlugin(dependencies));
  return { app, readCaseVersion };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers HTTP 200 both for a draft whose manifest holds no hypothesis and for a version that reads back fully as a case, never conditioning the status on the version's validity", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes() });
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes({ consolidation_register: 'formal' }) });

  const draftResponse = await app.inject({ method: 'GET', url: '/v1/cases/a-draft-slug/versions/3/declared-attributes' });
  const validatingResponse = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1/declared-attributes' });

  expect(draftResponse.statusCode).toBe(200);
  expect(validatingResponse.statusCode).toBe(200);
});

it('answers 200 even when the subject or fallback itself is the declared attribute a validator rule would reject, not only when an empty manifest is the failing rule', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes({ subject: 'an-unregistered-subject-type' }) });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/2/declared-attributes' });

  expect(response.statusCode).toBe(200);
  expect((response.json() as { subject: string }).subject).toBe('an-unregistered-subject-type');
});

it("carries the declared attributes exactly as the draft's own-record read answered them, dropping none of the five named attributes and carrying no field beyond them", async () => {
  const built = buildTestApp();
  app = built.app;
  const attributes = heldAttributes({ consolidation_register: 'plain' });
  built.readCaseVersion.mockResolvedValueOnce({ version: attributes });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/4/declared-attributes' });

  expect(response.json()).toEqual({
    title: attributes.title,
    when_to_use: attributes.when_to_use,
    subject: attributes.subject,
    fallback: attributes.fallback,
    consolidation_register: attributes.consolidation_register,
  });
});

it('carries no consolidation_register key, rather than an empty or null one, when the draft declares none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCaseVersion.mockResolvedValueOnce({ version: heldAttributes() });

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/5/declared-attributes' });

  const body = response.json() as object;
  expect(body).not.toHaveProperty('consolidation_register');
  const expectedKeys = Object.keys(readCaseVersionResponseSchema.shape).filter((key) => key !== 'consolidation_register');
  expect(Object.keys(body).sort()).toEqual(expectedKeys.sort());
});

it('refuses with 404 reporting CaseNotFoundError carrying the named slug and version, when no case version answers them', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCaseVersion.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/versions/9/declared-attributes' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
});

it('refuses with 400 VALIDATION_ERROR naming the path and listing the issue found, when the version segment is not an integer', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/not-a-number/declared-attributes' });

  expect(response.statusCode).toBe(400);
  const body = response.json() as { error: { code: string; message: string; details?: unknown } };
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(body.error.message).toMatch(/path/);
  expect(body.error.details).toEqual(expect.arrayContaining([expect.stringContaining('version')]));
  expect(built.readCaseVersion).not.toHaveBeenCalled();
});
