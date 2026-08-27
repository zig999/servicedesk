// Proof for task/diagnose-release-gate/refuse-diagnosis-of-a-draft-case-version, at the wire:
// POST /v1/diagnose exercised through Fastify's own app.inject() against a local instance
// registering createDiagnoseRoutesPlugin() and error-handler.middleware.ts's own
// handleUnexpectedError directly — the same shape read-case.routes.spec.ts already establishes.
// ICaseQuery.readCase and the wired runDiagnose function are stand-ins here (TST-03 — each is a
// boundary this route's own dependencies call, never business logic of its own): what
// handleDiagnoseRequest itself does with them is proved at the unit level in
// __tests__/unit/http/diagnose.controller.spec.ts; this file proves only that a draft-state
// pinned version answers on the wire with the status status-map.ts assigns
// CaseVersionNotReleasedError, and that a released-state pinned version still answers 200 with
// the resolved assessment, unchanged.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import { createDiagnoseRoutesPlugin } from '../../../http/diagnose.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { Assessment } from '../../../investigation/assessment.js';

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

/** A case version as case-query would already hold it, overridable per test so state varies without a second builder. */
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

/** One Fastify instance registering exactly the diagnose route plugin plus the shared error handler — mirrors what build-app.ts wires, the same convention read-case.routes.spec.ts already establishes. */
function buildTestApp(pinnedCase: Case): { app: FastifyInstance; readCase: ReadCaseMock; runDiagnose: RunDiagnoseMock } {
  const readCase: ReadCaseMock = vi.fn().mockResolvedValue({ case: pinnedCase });
  const runDiagnose: RunDiagnoseMock = vi.fn();
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: DiagnoseControllerDependencies = { caseQuery, runDiagnose, model: 'a-model', promptVersion: 'a-prompt-version' };
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 3

it('answers 200 with the resolved assessment, unchanged, for a released-state pinned version', async () => {
  const built = buildTestApp(heldCase({ state: 'released' }));
  app = built.app;
  const expectedAssessment: Assessment = { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, text: 'a text' };
  built.runDiagnose.mockResolvedValueOnce(expectedAssessment);

  const response = await app.inject({ method: 'POST', url: '/v1/diagnose', payload: REQUEST_BODY });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(expectedAssessment);
});
