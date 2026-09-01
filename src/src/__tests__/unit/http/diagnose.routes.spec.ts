import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { CaseInputRequirementsResult } from '../../../case/case-input-requirements.js';
import type { ICaseInputRequirementsQuery } from '../../../case/case-input-requirements.port.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import { createDiagnoseRoutesPlugin } from '../../../http/diagnose.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { Assessment } from '../../../investigation/assessment.js';

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

function heldCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'released',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

const REQUEST_BODY = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  narrative: 'a customer reports a fault',
  requester: 'a-requester',
};

type ReadCaseMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>>;
type RunDiagnoseMock = ReturnType<typeof vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>>;

function noRequirements(): CaseInputRequirementsResult {
  return { requirements: [], capabilities_with_malformed_input_schema: [] };
}

function buildTestApp(
  pinnedCase: Case,
  requirementsResult: CaseInputRequirementsResult = noRequirements(),
): { app: FastifyInstance; readCase: ReadCaseMock; runDiagnose: RunDiagnoseMock } {
  const readCase: ReadCaseMock = vi.fn().mockResolvedValue({ case: pinnedCase });
  const runDiagnose: RunDiagnoseMock = vi.fn();
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const caseInputRequirementsQuery: ICaseInputRequirementsQuery = {
    readCaseInputRequirements: vi.fn().mockResolvedValue(requirementsResult),
  };
  const dependencies: DiagnoseControllerDependencies = { caseQuery, caseInputRequirementsQuery, runDiagnose, model: 'a-model', promptVersion: 'a-prompt-version' };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDiagnoseRoutesPlugin(dependencies));
  return { app, readCase, runDiagnose };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 409 with the CaseVersionNotReleasedError envelope, naming the pinned slug, version and state, for a draft-state pinned version', async () => {
  const built = buildTestApp(heldCase({ slug: 'a-slug', version: 1, state: 'draft' }));
  app = built.app;

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CaseVersionNotReleasedError');
  expect(body.error.details).toEqual({ slug: 'a-slug', version: 1, state: 'draft' });
});

it('never calls the wired diagnose runner for a draft-state pinned version at the route level either', async () => {
  const built = buildTestApp(heldCase({ state: 'draft' }));
  app = built.app;

  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(built.runDiagnose).not.toHaveBeenCalled();
});

it('answers 200 with the resolved assessment, unchanged, for a released-state pinned version', async () => {
  const built = buildTestApp(heldCase({ state: 'released' }));
  app = built.app;
  const expectedAssessment: Assessment = { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, text: 'a text' };
  built.runDiagnose.mockResolvedValueOnce(expectedAssessment);

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(expectedAssessment);
});

const A_REQUIRED_CAPABILITY = { name: 'equipment-status-lookup', version: '1.0.0' };

function requestBodyWithUnrelatedSubjectAttribute(): Record<string, unknown> {
  return { ...REQUEST_BODY, subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-unrelated-attribute', value: 'a-value' }] } };
}

it('answers 422 with the SubjectDoesNotCoverCaseInputsError envelope naming the missing attribute and the capabilities that require it, for a subject missing a required case input', async () => {
  const requirements: CaseInputRequirementsResult = {
    requirements: [{ attribute: 'contract-number', required: true, capabilities: [A_REQUIRED_CAPABILITY] }],
    capabilities_with_malformed_input_schema: [],
  };
  const built = buildTestApp(heldCase({ state: 'released' }), requirements);
  app = built.app;

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyWithUnrelatedSubjectAttribute() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: { missing: unknown } } };
  expect(body.error.code).toBe('SubjectDoesNotCoverCaseInputsError');
  expect(body.error.details?.missing).toEqual([{ attribute: 'contract-number', capabilities: [A_REQUIRED_CAPABILITY] }]);
});

it('never calls the wired diagnose runner when the subject fails to cover a required case input, at the route level', async () => {
  const requirements: CaseInputRequirementsResult = {
    requirements: [{ attribute: 'contract-number', required: true, capabilities: [A_REQUIRED_CAPABILITY] }],
    capabilities_with_malformed_input_schema: [],
  };
  const built = buildTestApp(heldCase({ state: 'released' }), requirements);
  app = built.app;

  await app.inject({ method: 'POST', url: '/v1/diagnose', payload: requestBodyWithUnrelatedSubjectAttribute() });

  expect(built.runDiagnose).not.toHaveBeenCalled();
});

it('answers 200 with the resolved assessment when the subject covers every required attribute the derived requirements name', async () => {
  const requirements: CaseInputRequirementsResult = {
    requirements: [{ attribute: 'an-attribute', required: true, capabilities: [A_REQUIRED_CAPABILITY] }],
    capabilities_with_malformed_input_schema: [],
  };
  const built = buildTestApp(heldCase({ state: 'released' }), requirements);
  app = built.app;
  const expectedAssessment: Assessment = { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, text: 'a text' };
  built.runDiagnose.mockResolvedValueOnce(expectedAssessment);

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(expectedAssessment);
});
