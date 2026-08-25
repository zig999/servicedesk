// The rate-limit refusal
// constraints/the-capability-identity-read-is-rate-limited states
// (task/registry-read-not-found-relocation-and-rate-limit/capability-identity-read-rate-limit):
// read-capability-by-identity accepts at most 60 requests per minute from
// one source IP; the 61st and every later request in the same one-minute
// window answers 429 with a Retry-After value naming when the caller may
// retry, instead of reaching the controller. No claimed identity is
// verified anywhere in this build
// (constraints/no-route-enforces-authentication), so the caller this
// constraint counts against is the request's own source IP
// (FastifyRequest#ip) — the narrower, distinct question that constraint's
// own description leaves to this one.
//
// createReadCapabilityByIdentityRateLimitHook returns a Fastify onRequest
// hook meant to be registered only inside
// read-capability-by-identity.routes.ts's own plugin body, on that plugin's
// own FastifyInstance — Fastify's own encapsulation then confines the hook
// to the one route that plugin registers, never reaching any route
// registered outside it (EDG-07's own "applied at the boundary", scoped to
// this one route rather than a shared/global plugin). No rate-limiting
// package is authorized for this project (the delivery's own authorized
// dependency list carries none), so the count is plain in-memory JavaScript
// state — a Map keyed by source IP, one fixed one-minute window per key —
// closed over by the hook this factory returns, one Map per call so every
// route this factory is used for (only this one, by convention) counts
// independently and no state survives past the app instance that built it.
//
// Fixed-window counting, not sliding: on a key's first request, or once its
// window's age has reached RATE_LIMIT_WINDOW_MS, a fresh window starts at
// the current time with a count of one; every request inside that window
// increments the count, and the moment it exceeds
// RATE_LIMIT_MAX_REQUESTS_PER_WINDOW the request is refused rather than
// reaching the handler. Reads Date.now() directly rather than taking an
// injected clock parameter — an inference, disclosed in this task's own
// delivery record: connector-http-issuer.ts and test-connector.controller.ts
// already read Date.now() directly for their own elapsed-time bookkeeping
// outside the investigation module's own no-internal-clock-read discipline
// (run-diagnosis.ts and its neighbors), and this codebase's own spec files
// already control time in tests through Vitest's fake timers rather than an
// injected clock parameter (run-diagnosis.spec.ts, evidence-collection-stage.spec.ts,
// judgment-stage.spec.ts, http-declarative-observation-source.adapter.spec.ts
// each say so directly), so a second, hook-local injection convention here
// would depart from both the read-directly and the inject-a-clock
// conventions the rest of this codebase already settled on for a
// use unlike either.
//
// Memory stays bounded (a brief inference the task's own notes invite,
// disclosed the same way): pruneExpiredWindows runs on every call, ahead of
// the current key's own check, and drops every key — including a key whose
// only entry is the current one, which is exactly how that key's own window
// resets — whose window has already aged past RATE_LIMIT_WINDOW_MS, so the
// Map never grows past the number of distinct source IPs that called within
// the last minute.

import type { FastifyReply, FastifyRequest } from 'fastify';

/** How many requests one source IP may make inside one window before the next one is refused (constraints/the-capability-identity-read-is-rate-limited's own "60 requests per minute"). */
export const RATE_LIMIT_MAX_REQUESTS_PER_WINDOW = 60;

/** How many milliseconds one window spans (constraints/the-capability-identity-read-is-rate-limited's own "per minute"). */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** How many milliseconds one second spans — named so a millisecond-to-second conversion never spells the literal 1000 inline (TYP-04). */
const MS_PER_SECOND = 1_000;

/** One source IP's own current window: how many requests it has made since windowStartMs, the moment that window began. */
type RateLimitWindow = {
  requestCount: number;
  readonly windowStartMs: number;
};

/**
 * Builds one onRequest hook, closed over its own Map, for
 * read-capability-by-identity.routes.ts's own plugin to register on its own
 * FastifyInstance — every call to this factory gets an independent Map, so
 * two apps (or two tests) built from two separate calls never share a
 * count.
 */
export function createReadCapabilityByIdentityRateLimitHook(): (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void> {
  const windows = new Map<string, RateLimitWindow>();
  return async function readCapabilityByIdentityRateLimitHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const now = Date.now();
    pruneExpiredWindows(windows, now);
    const sourceIp = request.ip;
    const window = windows.get(sourceIp);
    if (window === undefined) {
      windows.set(sourceIp, { requestCount: 1, windowStartMs: now });
      return;
    }
    window.requestCount += 1;
    if (window.requestCount > RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {
      await refuseOverLimit(reply, window, now);
    }
  };
}

/** Drops every window whose age has already reached RATE_LIMIT_WINDOW_MS — the current source IP's own expired window included, which is what lets that IP start a fresh one on the very next line. */
function pruneExpiredWindows(windows: Map<string, RateLimitWindow>, now: number): void {
  for (const [sourceIp, window] of windows) {
    if (now - window.windowStartMs >= RATE_LIMIT_WINDOW_MS) {
      windows.delete(sourceIp);
    }
  }
}

/**
 * Answers the refused request with 429, a Retry-After header naming the
 * whole seconds remaining until this window resets (at least one, so a
 * request refused in the window's very last millisecond is never told to
 * retry immediately), and the same { error: { code, message, details } }
 * envelope every other refusal in this HTTP surface already answers with
 * (API-05).
 */
async function refuseOverLimit(reply: FastifyReply, window: RateLimitWindow, now: number): Promise<void> {
  const retryAfterSeconds = Math.max(1, Math.ceil((window.windowStartMs + RATE_LIMIT_WINDOW_MS - now) / MS_PER_SECOND));
  await reply
    .header('Retry-After', String(retryAfterSeconds))
    .code(429)
    .send({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'too many requests from this source; retry after the given number of seconds',
        details: { retryAfterSeconds },
      },
    });
}
