// Proof for
// task/registry-read-not-found-relocation-and-rate-limit/capability-identity-read-rate-limit:
// createReadCapabilityByIdentityRateLimitHook refuses a source IP's 61st request within one
// minute with HTTP 429 and a Retry-After header naming when to retry, lets the 60th and every
// earlier request in that window through with its ordinary response, tracks a second source IP
// independently, and is confined by Fastify's own plugin encapsulation to
// read-capability-by-identity alone — exercised through app.inject() against a real Fastify
// instance registering createReadCapabilityByIdentityRoutesPlugin(), the same shape
// read-capability-by-identity.routes.spec.ts already establishes for this route.
//
// Only Date is faked here (vi.useFakeTimers({ toFake: ['Date'] })): the window this hook tracks
// is measured through Date.now() alone, so freezing only Date lets a test move the window without
// also freezing the setImmediate/setTimeout machinery Fastify's own app.inject() relies on to
// actually deliver a response — and it is what keeps sixty sequential injected requests from
// drifting across a real window boundary on a slow run, the same risk a real sixty-second sleep
// would carry, without paying that sleep.
//
// CapabilityRegistryService's own readCapabilityByIdentity is a stand-in here (TST-03 — a
// stand-in replaces a boundary, never business logic): this file is about the rate-limit hook,
// never about what the controller answers with, so every accepted request resolves the same
// capability.
import Fastify, { type FastifyInstance, type LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCapabilityByIdentityControllerDependencies } from '../../../http/read-capability-by-identity.controller.js';
import { createReadCapabilityByIdentityRoutesPlugin } from '../../../http/read-capability-by-identity.routes.js';

/** The route under test, fixed across every request this file sends. */
const CAPABILITY_URL = '/v1/capabilities/a-capability/1.0.0';

/** Two distinct source IPs (TEST-NET-3, reserved for documentation/example use) so the
 * "different source IP" tests never rely on light-my-request's own default remote address. */
const PRIMARY_SOURCE_IP = '203.0.113.10';
const SECONDARY_SOURCE_IP = '203.0.113.20';

/** The rate limit's own stated numbers
 * (constraints/the-capability-identity-read-is-rate-limited: "60 requests per minute"), spelled
 * out here rather than imported from the module under test: a test importing the very constant
 * it means to hold the implementation to would still pass against an implementation that quietly
 * changed that constant to something other than what the constraint states. */
const REQUESTS_WITHIN_LIMIT = 60;
const FIRST_REQUEST_OVER_LIMIT = 61;
const ONE_MINUTE_MS = 60_000;

/** A capability the stood-in read always resolves to; no test in this file is about its shape. */
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

/** One Fastify instance registering exactly this route plugin plus the shared error handler —
 * the same shape read-capability-by-identity.routes.spec.ts already builds. */
function buildTestApp(): FastifyInstance {
  const dependencies: ReadCapabilityByIdentityControllerDependencies = {
    readCapabilityByIdentity: vi.fn().mockResolvedValue(heldCapability()),
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCapabilityByIdentityRoutesPlugin(dependencies));
  return app;
}

/** Sends `count` sequential GET requests to the capability route from one source IP, in order,
 * returning every response so a caller can inspect the whole run rather than only its last one. */
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

// ------------------------------------------------------------------ criterion 1

it('answers the 61st request within one minute from the same source IP with HTTP 429', async () => {
  app = buildTestApp();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  const [over] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  expect(over.statusCode).toBe(429);
});

// ------------------------------------------------------------------ criterion 2

it('names, in the 429 response, a Retry-After value the caller may retry after', async () => {
  app = buildTestApp();

  await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);
  const [over] = await sendRequests(app, 1, PRIMARY_SOURCE_IP);

  // Date is frozen for the whole test, so the window this 61st request lands in still has its
  // full minute left: exactly sixty seconds remain until it resets.
  expect(over.headers['retry-after']).toBe('60');
});

// ------------------------------------------------------------------ criterion 3

it('answers every one of the first 60 requests within a minute from one source IP with its ordinary response, none of them refused', async () => {
  app = buildTestApp();

  const responses = await sendRequests(app, REQUESTS_WITHIN_LIMIT, PRIMARY_SOURCE_IP);

  expect(responses.map((response) => response.statusCode)).toEqual(Array(REQUESTS_WITHIN_LIMIT).fill(200));
});

// ------------------------------------------------------------------ criterion 4

it("does not count a second source IP's requests against a first source IP's own limit", async () => {
  app = buildTestApp();

  await sendRequests(app, FIRST_REQUEST_OVER_LIMIT, PRIMARY_SOURCE_IP);
  const [fromSecondIp] = await sendRequests(app, 1, SECONDARY_SOURCE_IP);

  expect(fromSecondIp.statusCode).toBe(200);
});

// ------------------------------------------------------------------ criterion 5

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

// ------------------------------------------------------------------ edge cases

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
