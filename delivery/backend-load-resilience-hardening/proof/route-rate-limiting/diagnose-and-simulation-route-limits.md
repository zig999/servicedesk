---
target: backend
title: Rate-limit wiring on diagnose, simulate-case and simulate-hypothesis routes — proof
summary: Per-route, per-source-address 429/Retry-After enforcement at the ten-request-per-minute boundary
  is proven independently for each of the three routes, and their cross-route and cross-caller independence
  is proven by standing all three plugins up together; the accepted non-rolling-but-caller-anchored window
  design is proven against the one implementation the task's own Notes name as a specification-refusing
  pass.
implementation: sha256:dd2f7e654d8a24b394710f35c7fd06795df09dd4ddbe6cce7d7da3586ec6dd67
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/route-rate-limiting-diagnose-and-simulation-route-limits-suite-2
tests:
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers every one of the first 10 requests within a minute from one source address with its ordinary
    200 response, none of them refused
  proves: 'Criterion: The 10th request within the window on each of the three routes is not refused by
    the limit — diagnose instance.'
  fails_when: any of the first 10 requests from one source address within the window is refused on diagnose.
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers the 11th request within one minute from that same source address with HTTP 429
  proves: 'Criterion: The 11th request within one minute from one source address to diagnose is answered
    HTTP 429.'
  fails_when: the 11th request from the same source address to diagnose within the window is answered
    anything other than 429.
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: names, in that 429 response, a Retry-After value the caller may retry after
  proves: 'Criterion: Each of those HTTP 429 responses carries a Retry-After value naming when the caller
    may retry — diagnose instance.'
  fails_when: diagnose's 429 response carries no Retry-After header, or one that does not name the accepted
    60-second window.
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: keeps refusing the same source address past its own ten-request window even once the wall clock
    crosses into the next calendar minute, never resetting the count on the clock face alone
  proves: the task's Notes entry — UNDERDETERMINED, from the specification — about a fixed-clock-minute-boundary
    counter admitting up to 20 requests in a single 60-second span; diagnose stands in as the representative
    route since all three files wire the identical hook and constants.
  fails_when: the wiring instead used a counter that resets whenever the wall-clock minute changes rather
    than anchoring the window to the caller's own first request.
- file: src/__tests__/unit/http/simulate-case.routes.spec.ts
  name: answers every one of the first 10 requests within a minute from one source address with its ordinary
    200 response, none of them refused
  proves: 'Criterion: The 10th request within the window on each of the three routes is not refused by
    the limit — simulate-case instance.'
  fails_when: any of the first 10 requests from one source address within the window is refused on simulate-case.
- file: src/__tests__/unit/http/simulate-case.routes.spec.ts
  name: answers the 11th request within one minute from that same source address with HTTP 429
  proves: 'Criterion: The 11th request within one minute from one source address to simulate-case is answered
    HTTP 429.'
  fails_when: the 11th request from the same source address to simulate-case within the window is answered
    anything other than 429.
- file: src/__tests__/unit/http/simulate-case.routes.spec.ts
  name: names, in that 429 response, a Retry-After value the caller may retry after
  proves: 'Criterion: Each of those HTTP 429 responses carries a Retry-After value naming when the caller
    may retry — simulate-case instance.'
  fails_when: simulate-case's 429 response carries no Retry-After header, or one that does not name the
    accepted 60-second window.
- file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  name: answers every one of the first 10 requests within a minute from one source address with its ordinary
    200 response, none of them refused
  proves: 'Criterion: The 10th request within the window on each of the three routes is not refused by
    the limit — simulate-hypothesis instance.'
  fails_when: any of the first 10 requests from one source address within the window is refused on simulate-hypothesis.
- file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  name: answers the 11th request within one minute from that same source address with HTTP 429
  proves: 'Criterion: The 11th request within one minute from one source address to simulate-hypothesis
    is answered HTTP 429.'
  fails_when: the 11th request from the same source address to simulate-hypothesis within the window is
    answered anything other than 429.
- file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  name: names, in that 429 response, a Retry-After value the caller may retry after
  proves: 'Criterion: Each of those HTTP 429 responses carries a Retry-After value naming when the caller
    may retry — simulate-hypothesis instance.'
  fails_when: simulate-hypothesis's 429 response carries no Retry-After header, or one that does not name
    the accepted 60-second window.
- file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  name: answers ordinarily — 200 — on simulate-case and simulate-hypothesis for a source address that
    is over its own limit on diagnose, each route counting that address independently
  proves: 'Criteria: "A source address over the limit on one of the three routes is answered ordinarily
    on each of the other two within the same window" and "The limit on each of the three routes reaches
    that route''s own requests and no request of any other route" — diagnose is the representative over-limit
    route.'
  fails_when: simulate-case's or simulate-hypothesis's counter is shared with, or incremented by, diagnose's,
    so a source address over its limit on diagnose is also refused on simulate-case or simulate-hypothesis.
- file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  name: answers ordinarily — 200 — on all three routes for a second source address while the first source
    address is over its own limit on every one of the three
  proves: 'Criterion: A second source address is answered ordinarily on all three routes while the first
    is over its limit.'
  fails_when: a second source address's request is refused, or otherwise not answered ordinarily, on any
    of the three routes because the counter is keyed by something other than the source address.
untested:
- 'constraints/the-diagnosis-and-simulation-routes-are-rate-limited: the node''s own fact bundles three
  independently-failing properties into one sentence — the ten-per-minute ceiling per caller, its independence
  across the three named routes, and the shape of the refusal (429 with a Retry-After naming the wait)
  — across three separate route files. A test fails for one reason; no single test can assert all three
  together without conflating distinct failure causes into one assertion. The criterion-level tests above,
  taken together, cover every piece the node states, but none of them individually may claim to demonstrate
  the node''s fact whole.'
not_applicable:
- edge_case: Absent, empty or otherwise malformed request body on any of the three routes
  why: The rate-limit hook runs in Fastify's onRequest phase, ahead of body parsing and the existing,
    unchanged validation boundary; none of this task's criteria concern validation.
- edge_case: Two requests from the same source address racing concurrently against one route's counter
  why: The counter is a plain in-memory Map incremented synchronously inside Node's single-threaded event
    loop; whether that increment is safe under concurrent access is a property of the already-delivered
    createRateLimitHook, not of the wiring these three files add.
- edge_case: A downstream dependency (the case store, the glossary, the model call) failing or answering
    slowly
  why: The rate-limit hook these three files add performs no I/O of its own; the routes' downstream dependencies
    are stubbed in every test above and are unchanged by this task.
- edge_case: A duplicate registration or other uniqueness violation
  why: No uniqueness constraint is at stake in rate limiting; not reached by any criterion of this task.
- edge_case: An operation attempted against state that forbids it
  why: Rate limiting has no state machine of its own to forbid an operation against; not reached by any
    criterion of this task.
divergences:
- cites: TST-04
  file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  departure: This file mirrors no single file under src/http; it stands up diagnose.routes.ts, simulate-case.routes.ts
    and simulate-hypothesis.routes.ts together in one Fastify instance, because their rate limit's cross-route
    and cross-caller independence is only demonstrable across all three plugins registered side by side.
  why: A test file scoped to one route's own path could show that route refuses its own callers past the
    limit, but not that a source address over that limit remains unaffected on the other two — the node's
    "counted independently per route" clause has no single-file home to mirror.
---
## What it is
Tests proving each route's own 10/minute enforcement and cross-route/cross-caller independence.

## Notes
The first suite attempt (run/route-rate-limiting-diagnose-and-simulation-route-limits-suite) failed at the test step with `ERR_MODULE_NOT_FOUND` inside a vitest worker (tinypool) — an infrastructure failure from running two suites' `npm ci` concurrently against the same node_modules, not a code or test defect. The suite passed cleanly on the next attempt, run sequentially.
