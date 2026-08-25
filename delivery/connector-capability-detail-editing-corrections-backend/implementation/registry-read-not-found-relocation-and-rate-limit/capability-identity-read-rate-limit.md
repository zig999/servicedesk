---
title: Rate limit for read-capability-by-identity
summary: The read-capability-by-identity route now refuses a source IP's 61st request within a one-minute window with HTTP 429 and a Retry-After value, through an onRequest hook scoped to that route's own plugin registration alone.
task: sha256:529c3b09812abb3e42f9d6a82764125dcc7e6a95783bdeef8158c979c8603896
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-capability-identity-read-rate-limit-build
files:
- path: src/http/read-capability-by-identity-rate-limit.middleware.ts
  effect: 'New module exporting createReadCapabilityByIdentityRateLimitHook(), a factory building one Fastify onRequest hook closed over its own in-memory Map<string, RateLimitWindow> (source IP -> { requestCount, windowStartMs }) — no rate-limiting package, plain JavaScript state. The hook reads request.ip, prunes every window whose age has reached RATE_LIMIT_WINDOW_MS (60_000ms), and on the 61st request inside a still-live window answers 429 with a Retry-After header naming the whole seconds remaining until that window resets (minimum 1) plus the same { error: { code, message, details } } envelope every other refusal in this HTTP surface already answers with, short-circuiting before the controller is reached. Exports RATE_LIMIT_MAX_REQUESTS_PER_WINDOW and RATE_LIMIT_WINDOW_MS.'
- path: src/http/read-capability-by-identity.routes.ts
  effect: createReadCapabilityByIdentityRoutesPlugin now calls app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook()) on its own plugin's FastifyInstance, ahead of the app.get() registration — Fastify's own plugin encapsulation confines that hook to the one route this plugin registers. The plugin's exported call signature is unchanged.
criteria:
- criterion: A 61st request within one minute from the same source IP to read-capability-by-identity receives HTTP 429.
  met: true
  how: The hook's fixed-window counter increments requestCount on every request from a still-live window; once that count exceeds RATE_LIMIT_MAX_REQUESTS_PER_WINDOW (60) — on the 61st — the hook answers 429 and returns, never invoking the route handler.
- criterion: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  met: true
  how: The refusal sets a Retry-After header to the whole number of seconds remaining until the offending window's windowStartMs + RATE_LIMIT_WINDOW_MS is reached (minimum 1), and repeats that value under details.retryAfterSeconds in the response body.
- criterion: Up to and including the 60th request within the same minute from that source IP still receives its ordinary, non-429 response.
  met: true
  how: The hook only refuses once requestCount exceeds 60; for the 1st through 60th request in a window it starts or increments the window and returns without touching the reply, so Fastify's lifecycle proceeds unchanged into readCapabilityByIdentityHandler.
- criterion: A request from a different source IP within the same minute is not counted against another source IP's limit.
  met: true
  how: The Map is keyed by request.ip; each key holds its own independent { requestCount, windowStartMs }, read and written only under that key, so one source IP's count never affects another's.
- criterion: No route other than read-capability-by-identity is registered against the rate-limit mechanism this task adds, and every other existing route's tests continue to pass unmodified.
  met: true
  how: createReadCapabilityByIdentityRateLimitHook() is called only from read-capability-by-identity.routes.ts's own plugin body; Fastify's own encapsulation means an addHook call on a plugin's own instance never reaches a route registered by a sibling plugin. No other file was touched.
nodes:
- node: constraints/the-capability-identity-read-is-rate-limited
  encoded_at:
  - src/http/read-capability-by-identity-rate-limit.middleware.ts
  - src/http/read-capability-by-identity.routes.ts
  how: the constraint's own "at most 60 requests per minute from one caller; a request beyond that limit is refused with a 429 response naming when the caller may retry" is the hook's own RATE_LIMIT_MAX_REQUESTS_PER_WINDOW/RATE_LIMIT_WINDOW_MS pair and its 429-with-Retry-After refusal; "confined to this one route" is answered by registering the hook only inside this route's own plugin body. The constraint's cross-reference to constraints/no-route-enforces-authentication is answered by keying the Map on request.ip alone, since no route in this build resolves or verifies a claimed identity.
inferences:
- inferred: Counting is a fixed one-minute window per source IP (reset the instant a key's window ages past 60s) rather than a sliding or token-bucket window.
  from: the task's own Notes describe the mechanism as "a Map keyed by source IP tracking request counts/timestamps in the current one-minute window" — a fixed-window shape — and neither the constraint node nor the task states sliding-window or leaky-bucket semantics.
- inferred: The hook reads Date.now() directly rather than accepting an injected clock parameter.
  from: existing codebase precedent (connector-http-issuer.ts, test-connector.controller.ts) already reads Date.now() directly outside the investigation module's own narrower no-internal-clock-read discipline, and existing specs already control time through Vitest's fake timers rather than an injected clock parameter.
- inferred: Memory is bounded by scanning the whole Map for expired windows on every hook invocation, rather than a separate timer-driven sweep or an LRU cap.
  from: the task's own Notes explicitly invite this inference; the per-request scan needs no additional process-lifecycle concern and keeps the mechanism inside the one hook closure the task asks for.
- inferred: 'The 429 body uses the same { error: { code, message, details } } envelope every other refusal in this HTTP surface already answers with, with code RATE_LIMIT_EXCEEDED and details.retryAfterSeconds carrying the same value as the header.'
  from: backend-node-service.yaml's own API-05 (an error answers in one envelope, carrying a code, a message and its details), already followed by this route's own 400 validation envelope and the shared error-handler middleware.
- inferred: Retry-After carries a whole number of seconds (as a string), not an HTTP-date.
  from: the task's own instruction names this directly ("a Retry-After header/value naming when the caller may retry — e.g. seconds until the window resets"), and the constraint node states no format of its own.
preserved:
- Every other route's registration, dependencies and behavior in build-app.ts's routePlugins() — none of that file was touched.
- createReadCapabilityByIdentityRoutesPlugin's existing exported call signature (one dependencies argument), so every existing caller and spec keeps constructing it exactly as before.
- read-capability-by-identity's own existing 200/400/404/500 behavior for any request that does not exceed the new rate limit.
---

## What it is

createReadCapabilityByIdentityRoutesPlugin gains a rate-limit onRequest hook, scoped to its own plugin registration, ahead of the existing handler.
A caller identified by source IP, past 60 requests in a fixed one-minute window, is answered 429 with Retry-After instead of reaching the handler. No package was added — the limiter is plain in-memory state, since no rate-limiting package is in the standard's authorized dependency list.

## Notes

None.
