import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Case } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { SimulateHypothesisRequestDto } from '../../../http/dto/simulate-hypothesis.dto.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import { createSimulateHypothesisRoutesPlugin } from '../../../http/simulate-hypothesis.routes.js';
import type { SimulateHypothesisPipelineResult } from '../../../investigation/simulate-hypothesis-pipeline.js';

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

const REQUEST_BODY: SimulateHypothesisRequestDto = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  requester: 'a-requester',
  hypothesis: 'a-hypothesis',
};

function minimalHypothesisSimulationResult(): SimulateHypothesisPipelineResult {
  return {
    evidence: [],
    evaluation: { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] },
    durations: { collection: 0, judgment: 0, total: 0 },
  };
}

function buildTestApp(): FastifyInstance {
  const readCaseResult: ReadCaseResult = { case: heldCase() };
  const caseQuery: ICaseQuery = {
    readCase: vi.fn().mockResolvedValue(readCaseResult),
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const dependencies: SimulateHypothesisControllerDependencies = {
    caseQuery,
    runSimulateHypothesis: vi.fn().mockResolvedValue(minimalHypothesisSimulationResult()),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createSimulateHypothesisRoutesPlugin(dependencies));
  return app;
}

async function sendSimulateHypothesisRequests(
  app: FastifyInstance,
  count: number,
  remoteAddress: string,
): Promise<LightMyRequestResponse[]> {
  const responses: LightMyRequestResponse[] = [];
  for (let i = 0; i < count; i += 1) {
    responses.push(await app.inject({ method: 'POST', url: '/v1/simulate/hypothesis', payload: REQUEST_BODY, remoteAddress }));
  }
  return responses;
}

const SOURCE_IP = '203.0.113.10';
const REQUESTS_WITHIN_LIMIT = 10;

let app: FastifyInstance | undefined;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(async () => {
  vi.useRealTimers();
  await app?.close();
  app = undefined;
});

it('answers every one of the first 10 requests within a minute from one source address with its ordinary 200 response, none of them refused', async () => {
  app = buildTestApp();

  const responses = await sendSimulateHypothesisRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);

  expect(responses.map((response) => response.statusCode)).toEqual(Array(REQUESTS_WITHIN_LIMIT).fill(200));
});

it('answers the 11th request within one minute from that same source address with HTTP 429', async () => {
  app = buildTestApp();

  await sendSimulateHypothesisRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);
  const [over] = await sendSimulateHypothesisRequests(app, 1, SOURCE_IP);

  expect(over.statusCode).toBe(429);
});

it('names, in that 429 response, a Retry-After value the caller may retry after', async () => {
  app = buildTestApp();

  await sendSimulateHypothesisRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);
  const [over] = await sendSimulateHypothesisRequests(app, 1, SOURCE_IP);

  expect(over.headers['retry-after']).toBe('60');
});
