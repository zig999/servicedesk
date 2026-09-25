import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Case } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import { createDiagnoseRoutesPlugin } from '../../../http/diagnose.routes.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import { createSimulateCaseRoutesPlugin } from '../../../http/simulate-case.routes.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import { createSimulateHypothesisRoutesPlugin } from '../../../http/simulate-hypothesis.routes.js';

function heldCase(): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: { outcome: 'no-hypothesis-confirmed', referral: { action: 'an-action', recipient: 'a-recipient' } },
    state: 'released',
    manifest: [],
    hypotheses: [],
  };
}

function freshCaseQuery(): ICaseQuery {
  const readCaseResult: ReadCaseResult = { case: heldCase() };
  return {
    readCase: vi.fn().mockResolvedValue(readCaseResult),
    readCaseVersion: vi.fn(),
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
}

function freshDiagnoseDependencies(): DiagnoseControllerDependencies {
  return {
    caseQuery: freshCaseQuery(),
    caseInputRequirementsQuery: {
      readCaseInputRequirements: vi.fn().mockResolvedValue({ requirements: [], capabilities_with_malformed_input_schema: [] }),
    },
    runDiagnose: vi.fn().mockResolvedValue({
      outcome: 'an-outcome',
      referral: { action: 'an-action', recipient: 'a-recipient' },
      text: 'a text',
      register: 'plain',
      usage: { input_tokens: 0, output_tokens: 0 },
      elapsed_ms: 0,
      prompt: 'a prompt',
    }),
    model: 'a-model',
    promptVersion: 'a-prompt-version',
  };
}

function freshSimulateCaseDependencies(): SimulateCaseControllerDependencies {
  return {
    caseQuery: freshCaseQuery(),
    runSimulate: vi.fn().mockResolvedValue({
      evidence: [],
      evaluations: [],
      resolved: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
      assessment: {
        outcome: 'an-outcome',
        referral: { action: 'an-action', recipient: 'a-recipient' },
        text: 'a text',
        register: 'plain',
        usage: { input_tokens: 0, output_tokens: 0 },
        elapsed_ms: 0,
        prompt: 'a prompt',
      },
      cost: { calls: 0, input_tokens: 0, output_tokens: 0 },
      durations: { collection: 0, judgment: 0, writing: 0, total: 0 },
      prompts: { writing: 'a prompt' },
    }),
  };
}

function freshSimulateHypothesisDependencies(): SimulateHypothesisControllerDependencies {
  return {
    caseQuery: freshCaseQuery(),
    runSimulateHypothesis: vi.fn().mockResolvedValue({
      evidence: [],
      evaluation: { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] },
      durations: { collection: 0, judgment: 0, total: 0 },
    }),
  };
}

function buildThreeRouteTestApp(): FastifyInstance {
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDiagnoseRoutesPlugin(freshDiagnoseDependencies()));
  app.register(createSimulateCaseRoutesPlugin(freshSimulateCaseDependencies()));
  app.register(createSimulateHypothesisRoutesPlugin(freshSimulateHypothesisDependencies()));
  return app;
}

type RouteRequest = { readonly method: 'POST'; readonly url: string; readonly payload: Record<string, unknown> };

const DIAGNOSE_REQUEST: RouteRequest = {
  method: 'POST',
  url: '/v1/diagnose',
  payload: {
    case: { slug: 'a-slug', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    narrative: 'a customer reports a fault',
    requester: 'a-requester',
  },
};

const SIMULATE_CASE_REQUEST: RouteRequest = {
  method: 'POST',
  url: '/v1/simulate',
  payload: {
    case: { slug: 'a-slug', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    requester: 'a-requester',
  },
};

const SIMULATE_HYPOTHESIS_REQUEST: RouteRequest = {
  method: 'POST',
  url: '/v1/simulate/hypothesis',
  payload: {
    case: { slug: 'a-slug', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    requester: 'a-requester',
    hypothesis: 'a-hypothesis',
  },
};

type SendRequestsOptions = {
  readonly request: RouteRequest;
  readonly count: number;
  readonly remoteAddress: string;
};

async function sendRequests(app: FastifyInstance, options: SendRequestsOptions): Promise<LightMyRequestResponse[]> {
  const responses: LightMyRequestResponse[] = [];
  for (let i = 0; i < options.count; i += 1) {
    responses.push(
      await app.inject({
        method: options.request.method,
        url: options.request.url,
        payload: options.request.payload,
        remoteAddress: options.remoteAddress,
      }),
    );
  }
  return responses;
}

const REQUESTS_WITHIN_LIMIT = 10;
const OVER_LIMIT_ADDRESS = '203.0.113.10';
const SECOND_ADDRESS = '203.0.113.20';

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers ordinarily — 200 — on simulate-case and simulate-hypothesis for a source address that is over its own limit on diagnose, each route counting that address independently', async () => {
  app = buildThreeRouteTestApp();

  await sendRequests(app, { request: DIAGNOSE_REQUEST, count: REQUESTS_WITHIN_LIMIT + 1, remoteAddress: OVER_LIMIT_ADDRESS });
  const onOtherRoutes = [
    (await sendRequests(app, { request: SIMULATE_CASE_REQUEST, count: 1, remoteAddress: OVER_LIMIT_ADDRESS }))[0],
    (await sendRequests(app, { request: SIMULATE_HYPOTHESIS_REQUEST, count: 1, remoteAddress: OVER_LIMIT_ADDRESS }))[0],
  ];

  expect(onOtherRoutes.map((response) => response?.statusCode)).toEqual([200, 200]);
});

it('answers ordinarily — 200 — on all three routes for a second source address while the first source address is over its own limit on every one of the three', async () => {
  app = buildThreeRouteTestApp();

  await sendRequests(app, { request: DIAGNOSE_REQUEST, count: REQUESTS_WITHIN_LIMIT + 1, remoteAddress: OVER_LIMIT_ADDRESS });
  await sendRequests(app, { request: SIMULATE_CASE_REQUEST, count: REQUESTS_WITHIN_LIMIT + 1, remoteAddress: OVER_LIMIT_ADDRESS });
  await sendRequests(app, { request: SIMULATE_HYPOTHESIS_REQUEST, count: REQUESTS_WITHIN_LIMIT + 1, remoteAddress: OVER_LIMIT_ADDRESS });
  const forSecondAddress = [
    (await sendRequests(app, { request: DIAGNOSE_REQUEST, count: 1, remoteAddress: SECOND_ADDRESS }))[0],
    (await sendRequests(app, { request: SIMULATE_CASE_REQUEST, count: 1, remoteAddress: SECOND_ADDRESS }))[0],
    (await sendRequests(app, { request: SIMULATE_HYPOTHESIS_REQUEST, count: 1, remoteAddress: SECOND_ADDRESS }))[0],
  ];

  expect(forSecondAddress.map((response) => response?.statusCode)).toEqual([200, 200, 200]);
});
