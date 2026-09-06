import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CaseInputRequirementsResult } from '../../../case/case-input-requirements.js';
import type { ICaseInputRequirementsQuery } from '../../../case/case-input-requirements.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotValidError } from '../../../errors/case-version-not-valid.error.js';
import type { CaseInputRequirementsControllerDependencies } from '../../../http/case-input-requirements.controller.js';
import { createCaseInputRequirementsRoutesPlugin } from '../../../http/case-input-requirements.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';

type ReadMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<CaseInputRequirementsResult>>>;

function heldResult(): CaseInputRequirementsResult {
  return {
    requirements: [
      { attribute: 'an-attribute', required: true, capabilities: [{ name: 'a-capability', version: '1.0.0' }] },
    ],
    capabilities_with_malformed_input_schema: [{ name: 'a-legacy-capability', version: '0.1.0' }],
  };
}

function buildTestApp(): { app: FastifyInstance; read: ReadMock } {
  const read: ReadMock = vi.fn();
  const caseInputRequirementsQuery: ICaseInputRequirementsQuery = { readCaseInputRequirements: read };
  const dependencies: CaseInputRequirementsControllerDependencies = { caseInputRequirementsQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createCaseInputRequirementsRoutesPlugin(dependencies));
  return { app, read };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the requirements and the malformed capabilities named apart, exactly as the query resolved them', async () => {
  const built = buildTestApp();
  app = built.app;
  built.read.mockResolvedValueOnce(heldResult());

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1/input-requirements' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(heldResult());
});

it('resolves the slug and version exactly as the path names them, the version coerced from its string segment into a number', async () => {
  const built = buildTestApp();
  app = built.app;
  built.read.mockResolvedValueOnce(heldResult());

  await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/7/input-requirements' });

  expect(built.read).toHaveBeenCalledWith('a-slug', 7);
});

it('refuses with the status the status map assigns CaseNotFoundError, when no version answers the named slug and version', async () => {
  const built = buildTestApp();
  app = built.app;
  built.read.mockRejectedValueOnce(new CaseNotFoundError('an-absent-slug', 9));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/an-absent-slug/versions/9/input-requirements' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseNotFoundError');
  expect(body.error.details).toEqual({ slug: 'an-absent-slug', version: 9 });
});

it('refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the named version fails a structural rule', async () => {
  const built = buildTestApp();
  app = built.app;
  built.read.mockRejectedValueOnce(new CaseVersionNotValidError('a-slug', 1, ['a violated rule']));

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/1/input-requirements' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotValidError');
});

it('answers 400 for a non-numeric version segment, without ever reaching the query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/not-a-number/input-requirements' });

  expect(response.statusCode).toBe(400);
  expect(built.read).not.toHaveBeenCalled();
});

it('answers 400 for a version of zero, one below the positive range the domain declares, without ever reaching the query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/cases/a-slug/versions/0/input-requirements' });

  expect(response.statusCode).toBe(400);
  expect(built.read).not.toHaveBeenCalled();
});
