import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCapabilityByIdentityControllerDependencies } from '../../../http/read-capability-by-identity.controller.js';
import { createReadCapabilityByIdentityRoutesPlugin } from '../../../http/read-capability-by-identity.routes.js';

const CAPABILITY_URL = '/v1/capabilities/a-capability/1.0.0';

const PRIMARY_SOURCE_IP = '203.0.113.10';
const SECONDARY_SOURCE_IP = '203.0.113.20';

const REQUESTS_WITHIN_LIMIT = 60;
const FIRST_REQUEST_OVER_LIMIT = 61;
const ONE_MINUTE_MS = 60_000;

function heldCapability(): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
  };
}

function buildTestApp(): FastifyInstance {
  const dependencies: ReadCapabilityByIdentityControllerDependencies = {
    readCapabilityByIdentity: vi.fn().mockResolvedValue(heldCapability()),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCapabilityByIdentityRoutesPlugin(dependencies));
  return app;
}

async function sendRequests(
  app: FastifyInstance,
  count: number,
  remoteAddress: string,
): Promise<LightMyRequestResponse[]> {
  const responses: LightMyRequestResponse[] = [];
  for (let i = 0; i < count; i += 1) {
    responses.push(await app.inject({ method: 'GET', url: CAPABILITY_URL, remoteAddress }));
  }
  return responses;
}

let app: FastifyInstance | undefined;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(async () => {
  vi.useRealTimers();
  await app?.close();
  app = undefined;
});

it('answers the 61st request within one minute from the same source IP with HTTP 429', async () => {
  app = buildTestApp();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  const [over] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  expect(over.statusCode).toBe(429);
});

it('names, in the 429 response, a Retry-After value the caller may retry after', async () => {
  app = buildTestApp();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  const [over] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  expect(over.headers['retry-after']).toBe('60');
});

it('answers every one of the first 60 requests within a minute from one source IP with its ordinary response, none of them refused', async () => {
  app = buildTestApp();

  const responses = await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);

  expect(responses.map((response) => response.statusCode)).toEqual(Array(REQUESTS_WITHIN_LIMIT).fill(200));
});

it("does not count a second source IP's requests against a first source IP's own limit", async () => {
  app = buildTestApp();

  await sendRequests(app, FIRST_REQUEST_OVER_LIMIT, PRIMARY_SOURCE_IP);
  const [fromSecondIp] = await sendRequests(app, 1, SECONDARY_SOURCE_IP);

  expect(fromSecondIp.statusCode).toBe(200);
});

it("refuses no route but read-capability-by-identity, even once that route's own limit is exhausted from the same source IP", async () => {
  app = buildTestApp();
  app.get('/v1/an-unrelated-route', async () => ({ ok: true }));

  await sendRequests(app, FIRST_REQUEST_OVER_LIMIT, PRIMARY_SOURCE_IP);
  const unrelated = await app.inject({
    method: 'GET',
    url: '/v1/an-unrelated-route',
    remoteAddress: PRIMARY_SOURCE_IP,
  });

  expect(unrelated.statusCode).toBe(200);
});

it('lets a source IP start a fresh window, with its ordinary response, once its prior window has fully elapsed', async () => {
  app = buildTestApp();
  const windowStart = Date.now();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  vi.setSystemTime(windowStart + ONE_MINUTE_MS);
  const [afterReset] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  expect(afterReset.statusCode).toBe(200);
});

it("never answers a Retry-After below one second, even when the refusal lands in the window's very last millisecond", async () => {
  app = buildTestApp();
  const windowStart = Date.now();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  vi.setSystemTime(windowStart + ONE_MINUTE_MS - 1);
  const [over] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  expect(over.headers['retry-after']).toBe('1');
});
