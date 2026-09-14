import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Case } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import type { IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { SimulateCaseRequestDto } from '../../../http/dto/simulate-case.dto.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import { createSimulateCaseRoutesPlugin } from '../../../http/simulate-case.routes.js';
import type { InvestigationPipelineResult } from '../../../investigation/investigation-pipeline.js';

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

const REQUEST_BODY: SimulateCaseRequestDto = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  requester: 'a-requester',
};

function minimalSimulationResult(): InvestigationPipelineResult {
  return {
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
  const glossary: IGlossaryQuery = {
    readVocabularyTerm: vi.fn().mockImplementation(
      async (_vocabulary, name: string): Promise<TermResolution> => ({ held: true, term: { name } }),
    ),
    readConcept: vi.fn(),
    listVocabularyTerms: vi.fn(),
    listConcepts: vi.fn(),
  };
  const dependencies: SimulateCaseControllerDependencies = {
    caseQuery,
    glossary,
    runSimulate: vi.fn().mockResolvedValue(minimalSimulationResult()),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createSimulateCaseRoutesPlugin(dependencies));
  return app;
}

async function sendSimulateCaseRequests(
  app: FastifyInstance,
  count: number,
  remoteAddress: string,
): Promise<LightMyRequestResponse[]> {
  const responses: LightMyRequestResponse[] = [];
  for (let i = 0; i < count; i += 1) {
    responses.push(await app.inject({ method: 'POST', url: '/v1/simulate', payload: REQUEST_BODY, remoteAddress }));
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

  const responses = await sendSimulateCaseRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);

  expect(responses.map((response) => response.statusCode)).toEqual(Array(REQUESTS_WITHIN_LIMIT).fill(200));
});

it('answers the 11th request within one minute from that same source address with HTTP 429', async () => {
  app = buildTestApp();

  await sendSimulateCaseRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);
  const [over] = await sendSimulateCaseRequests(app, 1, SOURCE_IP);

  expect(over.statusCode).toBe(429);
});

it('names, in that 429 response, a Retry-After value the caller may retry after', async () => {
  app = buildTestApp();

  await sendSimulateCaseRequests(app, REQUESTS_WITHIN_LIMIT, SOURCE_IP);
  const [over] = await sendSimulateCaseRequests(app, 1, SOURCE_IP);

  expect(over.headers['retry-after']).toBe('60');
});
