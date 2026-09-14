---
target: backend
title: Rate limiting wired onto diagnose, simulate-case and simulate-hypothesis routes
summary: Each of the three route plugins registers its own onRequest rate-limit hook, built from the already-delivered
  createRateLimitHook(10, 60_000), so each route refuses its own callers past ten requests a minute independently
  of the other two.
task: sha256:8705e4a8b30209d840ccc978b080531932f2bc19226a04f44d80a602d0304442
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/route-rate-limiting-diagnose-and-simulation-route-limits-build-2
files:
- path: src/http/diagnose.routes.ts
  effect: 'Imports createRateLimitHook and adds a module-scoped RATE_LIMIT_MAX_REQUESTS_PER_MINUTE (10)
    and RATE_LIMIT_WINDOW_MS (60_000); createDiagnoseRoutesPlugin''s returned plugin function now calls
    app.addHook(''onRequest'', createRateLimitHook({ maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,
    windowMs: RATE_LIMIT_WINDOW_MS })) before registering the POST /v1/diagnose handler, so a fresh per-plugin-instance
    counter gates that route''s own requests. The existing handler and its validation/response behavior
    are otherwise untouched.'
- path: src/http/simulate-case.routes.ts
  effect: Same wiring as diagnose.routes.ts — the same two named constants and the same app.addHook('onRequest',
    createRateLimitHook(...)) call — added ahead of the existing POST /v1/simulate registration, giving
    this route its own independent counter.
- path: src/http/simulate-hypothesis.routes.ts
  effect: Same wiring again, ahead of the existing POST /v1/simulate/hypothesis registration, giving this
    route its own independent counter.
criteria:
- criterion: The 11th request within one minute from one source address to diagnose is answered HTTP 429.
  met: true
  how: 'diagnose.routes.ts''s onRequest hook is createRateLimitHook({ maxRequestsPerWindow: 10, windowMs:
    60_000 }); the hook increments a per-sourceIp counter and, past 10 within the current window, replies
    429 before the route handler runs.'
- criterion: The 11th request within one minute from one source address to simulate-case is answered HTTP
    429.
  met: true
  how: Identical hook wired into simulate-case.routes.ts's plugin function ahead of its POST /v1/simulate
    registration.
- criterion: The 11th request within one minute from one source address to simulate-hypothesis is answered
    HTTP 429.
  met: true
  how: Identical hook wired into simulate-hypothesis.routes.ts's plugin function ahead of its POST /v1/simulate/hypothesis
    registration.
- criterion: Each of those HTTP 429 responses carries a Retry-After value naming when the caller may retry.
  met: true
  how: createRateLimitHook's own refuseOverLimit (src/http/rate-limit.middleware.ts, unmodified) sets
    a Retry-After header computed from the window's remaining time before sending the 429; every route
    above reuses that same hook body.
- criterion: The 10th request within the window on each of the three routes is not refused by the limit.
  met: true
  how: The hook only refuses once requestCount exceeds maxRequestsPerWindow (10); the 10th request brings
    the count to exactly 10, which is not greater than 10, so it passes through to the route handler on
    all three routes.
- criterion: A source address over the limit on one of the three routes is answered ordinarily on each
    of the other two within the same window.
  met: true
  how: build-app.ts registers each route plugin with app.register(plugin), so Fastify's plugin encapsulation
    gives each plugin invocation its own onRequest hook instance and, because createRateLimitHook opens
    a fresh Map per call, its own counter.
- criterion: A second source address is answered ordinarily on all three routes while the first is over
    its limit.
  met: true
  how: The hook keys its Map by request.ip (sourceIp), so a second source address is a distinct key with
    its own fresh window regardless of the first address's count.
- criterion: The limit on each of the three routes reaches that route's own requests and no request of
    any other route.
  met: true
  how: Each onRequest hook is registered inside its own route plugin's encapsulated scope, mirroring how
    read-capability-by-identity.routes.ts's existing hook is scoped to that plugin alone.
nodes:
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  encoded_at:
  - src/http/diagnose.routes.ts
  - src/http/simulate-case.routes.ts
  - src/http/simulate-hypothesis.routes.ts
  how: The node's "at most 10 requests per minute... counted independently per route, where one caller
    is one source IP address" is answered by wiring the shared, already-delivered createRateLimitHook
    with maxRequestsPerWindow 10 and windowMs 60_000 into each of the three named route plugins, each
    getting its own Map keyed by request.ip through Fastify's plugin encapsulation; the "refused with
    an HTTP 429 response carrying a Retry-After value" half is answered entirely inside the hook body
    these three files call, unchanged from the dependency task.
inferences:
- inferred: The dependency hook's window (start-of-window pinned to a caller's first request, reset only
    once a full windowMs has elapsed since that start) is the implementation the task accepts, even though
    it is not a rolling one-minute window.
  from: The task's own Notes, which name a fixed, non-rolling, per-window-boundary counter as "Passes"
    for these criteria.
- inferred: Cross-route and cross-caller independence is achieved through Fastify's own plugin encapsulation
    rather than any new isolation mechanism.
  from: The inventory's description of read-capability-by-identity.routes.ts as "the one existing rate-limit
    idiom," wired the same way.
- inferred: A route-local module constant pair (RATE_LIMIT_MAX_REQUESTS_PER_MINUTE, RATE_LIMIT_WINDOW_MS)
    rather than a hardcoded 10 and 60_000 inline at each call site.
  from: TYP-04 (a value with meaning is a named constant) and the naming precedent already declared in
    read-capability-by-identity-rate-limit.middleware.ts.
preserved:
- diagnose.routes.ts's, simulate-case.routes.ts's and simulate-hypothesis.routes.ts's existing body validation
  (400 on schema failure) and success responses, unchanged.
- build-app.ts's routePluginFactories registration order and the one-app.register-per-plugin encapsulation
  it already relied on for read-capability-by-identity's own rate limiting.
- The database-pool-configuration task's disjoint area (src/persistence/*, src/config/*) — not touched
  by this delivery.
---
## What it is
Each of the three named route plugins now enforces its own 10-per-minute limit ahead of its handler.

## Notes
None.
