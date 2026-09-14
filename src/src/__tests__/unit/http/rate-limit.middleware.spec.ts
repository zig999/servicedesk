import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createRateLimitHook, type RateLimitHookOptions } from '../../../http/rate-limit.middleware.js';

const TEST_ROUTE = '/a-test-route';
const OTHER_ROUTE = '/another-test-route';
const PRIMARY_SOURCE_IP = '203.0.113.50';
const SECONDARY_SOURCE_IP = '203.0.113.60';
const WINDOW_MS = 10_000;

type SendRequestsOptions = {
  readonly count: number;
  readonly remoteAddress: string;
  readonly path: string;
};

function buildTestApp(options: RateLimitHookOptions): FastifyInstance {
  const app = Fastify();
  app.get(TEST_ROUTE, { onRequest: createRateLimitHook(options) }, async () => ({ ok: true }));
  return app;
}

function buildTwoRouteApp(
  routeAOptions: RateLimitHookOptions,
  routeBOptions: RateLimitHookOptions,
): FastifyInstance {
  const app = Fastify();
  app.get(TEST_ROUTE, { onRequest: createRateLimitHook(routeAOptions) }, async () => ({ ok: true }));
  app.get(OTHER_ROUTE, { onRequest: createRateLimitHook(routeBOptions) }, async () => ({ ok: true }));
  return app;
}

async function sendRequests(
  app: FastifyInstance,
  options: SendRequestsOptions,
): Promise<LightMyRequestResponse[]> {
  const responses: LightMyRequestResponse[] = [];
  for (let i = 0; i < options.count; i += 1) {
    responses.push(await app.inject({ method: 'GET', url: options.path, remoteAddress: options.remoteAddress }));
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

it('answers each of the first N requests from one source address within the window with its ordinary response, none refused', async () => {
  const threshold = 3;
  app = buildTestApp({ maxRequestsPerWindow: threshold, windowMs: WINDOW_MS });

  const responses = await sendRequests(app, { count: threshold, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });

  expect(responses.map((response) => response.statusCode)).toEqual(Array(threshold).fill(200));
});

it('answers the (N+1)th request from that same source address within the window with HTTP 429', async () => {
  const threshold = 3;
  app = buildTestApp({ maxRequestsPerWindow: threshold, windowMs: WINDOW_MS });

  await sendRequests(app, { count: threshold, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  const [over] = await sendRequests(app, { count: 1, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });

  expect(over.statusCode).toBe(429);
});

it('names, in that 429 response, a Retry-After value the caller may retry after', async () => {
  const threshold = 3;
  app = buildTestApp({ maxRequestsPerWindow: threshold, windowMs: WINDOW_MS });

  await sendRequests(app, { count: threshold, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  const [over] = await sendRequests(app, { count: 1, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });

  expect(over.headers['retry-after']).toBe('10');
});

it('does not refuse a request from a second source address while the first source address is over its own threshold', async () => {
  const threshold = 3;
  app = buildTestApp({ maxRequestsPerWindow: threshold, windowMs: WINDOW_MS });

  await sendRequests(app, { count: threshold + 1, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  const [fromSecondIp] = await sendRequests(app, { count: 1, remoteAddress: SECONDARY_SOURCE_IP, path: TEST_ROUTE });

  expect(fromSecondIp.statusCode).toBe(200);
});

it("enforces the threshold each hook was constructed with: one route refuses at its own boundary while a route built with a higher threshold does not", async () => {
  app = buildTwoRouteApp(
    { maxRequestsPerWindow: 2, windowMs: WINDOW_MS },
    { maxRequestsPerWindow: 5, windowMs: WINDOW_MS },
  );

  const lowThresholdResponses = await sendRequests(app, { count: 3, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  const highThresholdResponses = await sendRequests(app, { count: 3, remoteAddress: SECONDARY_SOURCE_IP, path: OTHER_ROUTE });

  expect(lowThresholdResponses[lowThresholdResponses.length - 1].statusCode).toBe(429);
  expect(highThresholdResponses.every((response) => response.statusCode === 200)).toBe(true);
});

it("does not refuse, on a second hook's own route, a source address already refused by a first hook built separately", async () => {
  app = buildTwoRouteApp(
    { maxRequestsPerWindow: 2, windowMs: WINDOW_MS },
    { maxRequestsPerWindow: 2, windowMs: WINDOW_MS },
  );

  await sendRequests(app, { count: 3, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  const [onOtherHook] = await sendRequests(app, { count: 1, remoteAddress: PRIMARY_SOURCE_IP, path: OTHER_ROUTE });

  expect(onOtherHook.statusCode).toBe(200);
});

it("lets a source address's request through once its prior window has fully elapsed", async () => {
  const threshold = 3;
  app = buildTestApp({ maxRequestsPerWindow: threshold, windowMs: WINDOW_MS });
  const windowStart = Date.now();

  await sendRequests(app, { count: threshold, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });
  vi.setSystemTime(windowStart + WINDOW_MS);
  const [afterReset] = await sendRequests(app, { count: 1, remoteAddress: PRIMARY_SOURCE_IP, path: TEST_ROUTE });

  expect(afterReset.statusCode).toBe(200);
});
