---
target: backend
title: Parameterized per-source-address rate-limit hook
summary: A createRateLimitHook construction in src/http/rate-limit.middleware.ts builds, from a caller-supplied
  threshold and window, an independent per-source-IP counting Fastify onRequest hook that refuses overflow
  with HTTP 429 and a Retry-After header.
task: sha256:c1f662eb233c841c3950c19d480346691b72a2aebfb4908648c825a633a187f0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/route-rate-limiting-parameterized-rate-limit-hook-build-2
files:
- path: src/http/rate-limit.middleware.ts
  effect: 'Exports createRateLimitHook(options: RateLimitHookOptions), a construction that opens a fresh,
    closured Map<sourceIp, window> and returns a Fastify onRequest hook counting requests per request.ip
    against options.maxRequestsPerWindow within options.windowMs; a request past the threshold is refused
    with HTTP 429 and a Retry-After header naming the remaining seconds in the window, and an expired
    window is pruned before the next request from that address is counted, restarting its count at 1.'
criteria:
- criterion: A hook built with threshold N and window W leaves the first N requests from one source address
    within W unrefused by the limit.
  met: true
  how: The first request from an address is never checked against the threshold (it only opens the window
    and returns); each following request up to the Nth increments requestCount without exceeding options.maxRequestsPerWindow,
    so refuseOverLimit is never reached for any of the first N.
- criterion: The N+1th request from that same source address within the same window is answered HTTP 429.
  met: true
  how: The request whose incremented requestCount first exceeds options.maxRequestsPerWindow reaches refuseOverLimit,
    which replies with .code(429).
- criterion: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  met: true
  how: refuseOverLimit sets the Retry-After header to computeRetryAfterSeconds's result, computed from
    the window's remaining time (windowStartMs + windowMs - now) before the window elapses.
- criterion: A request from a second source address is not refused by the limit while the first source
    address is over its threshold in the same window.
  met: true
  how: windows is a Map keyed by request.ip; each source address's requestCount and windowStartMs are
    stored and checked under its own key, so one address's overflow never touches another's entry.
- criterion: The threshold and the window a hook counts by come from the arguments its construction was
    given, not from a constant fixed in the hook's own module.
  met: true
  how: 'createRateLimitHook(options: RateLimitHookOptions) reads options.maxRequestsPerWindow and options.windowMs
    from its own argument; the module declares no top-level threshold or window constant (only MS_PER_SECOND,
    a unit conversion, is module-level).'
- criterion: 'Two hooks built by separate constructions count their windows independently: a source address
    over the threshold on one is not refused by the other.'
  met: true
  how: Each call to createRateLimitHook opens its own windows Map inside its own closure; no state is
    shared across separate constructions, so two hooks never see each other's counts.
- criterion: Once a source address's window has elapsed, a further request from it is not refused by the
    limit.
  met: true
  how: pruneExpiredWindows runs before every count check and deletes any window whose age (now - windowStartMs)
    is >= windowMs, so the next request from that address finds no window, resets requestCount to 1, and
    is not refused.
- criterion: The read-capability-by-identity route's delivered refusal past 60 requests in a minute still
    answers HTTP 429 with a Retry-After value.
  met: true
  how: This task did not touch read-capability-by-identity-rate-limit.middleware.ts, read-capability-by-identity.routes.ts
    or build-app.ts; the existing 60-per-minute hook and its wiring are unchanged, so the route's delivered
    behavior is preserved as-is.
nodes:
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  encoded_at:
  - src/http/rate-limit.middleware.ts
  how: This task builds only the counting mechanism the node's refusal needs — a construction taking a
    threshold and a window and returning a per-source-address counting onRequest hook that refuses with
    HTTP 429 and a Retry-After value. It does not wire the hook onto the diagnose, simulate-case or simulate-hypothesis
    routes, does not fix the node's concrete 10-per-minute threshold, and does not encode the three routes'
    independent counting of one another — those three facts belong to the sibling task that wires this
    hook onto the three routes.
inferences:
- inferred: The 429 response body reuses the existing envelope shape — error.code 'RATE_LIMIT_EXCEEDED',
    a fixed message sentence, and details.retryAfterSeconds — rather than a newly invented shape.
  from: The inventory names read-capability-by-identity-rate-limit.middleware.ts as "the one existing
    rate-limit idiom" and the task's own Notes call it "the reference for the idiom, not a thing this
    epic rewrites," so its response shape is the convention to follow.
- inferred: The constructor options are named maxRequestsPerWindow and windowMs (an object, not two positional
    numbers), and the file is placed at src/http/rate-limit.middleware.ts with no route name in it.
  from: The existing module's constant names turned into per-instance option fields, and the task's own
    description ("no route is limited by this task") ruling out a route-specific name.
divergences:
- cites: MNT-03
  file: src/http/rate-limit.middleware.ts
  departure: The window-tracking, pruning and Retry-After computation duplicate the shape of read-capability-by-identity-rate-limit.middleware.ts's
    sliding-window logic rather than calling a shared helper.
  why: That file's threshold and window are compile-time module constants with no constructor parameter,
    and this task's own Notes forbid rewriting it — extracting a shared helper would mean editing a file
    outside this task's candidate set; the duplication is the visible cost of keeping the two apart until
    a task that owns that file's rewrite exists.
preserved:
- read-capability-by-identity-rate-limit.middleware.ts and read-capability-by-identity.routes.ts are unchanged;
  the route's existing 60-requests-per-minute limiter still answers HTTP 429 with a Retry-After header
  exactly as before.
- diagnose.routes.ts, simulate-case.routes.ts, simulate-hypothesis.routes.ts and build-app.ts are unchanged
  — no route is wired to any rate limit by this task.
deferred:
- what: Wiring createRateLimitHook onto the diagnose, simulate-case and simulate-hypothesis routes with
    a 10-requests-per-minute threshold, counted independently per route.
  why: Explicitly out of this task's scope per its own "What it is" and the sibling task that wires this
    hook onto the three routes.
---
## What it is
createRateLimitHook is a small, self-contained construction with no route wiring; the sibling task consumes it.

## Notes
None.
