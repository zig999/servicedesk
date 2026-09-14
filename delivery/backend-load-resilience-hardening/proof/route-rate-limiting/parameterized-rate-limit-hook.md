---
target: backend
title: Parameterized rate-limit hook proof
summary: Tests createRateLimitHook's per-source-address counting, refusal, Retry-After, independence across
  constructions and window reset, and confirms the untouched read-capability-by-identity limiter's regression
  criterion through its own existing suite.
implementation: sha256:5f7fce046b3acac4cba06ad71927f0e27b7c37cb61b05384ece62666736c4b9c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/route-rate-limiting-parameterized-rate-limit-hook-suite-2
tests:
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: answers each of the first N requests from one source address within the window with its ordinary
    response, none refused
  proves: A hook built with threshold N and window W leaves the first N requests from one source address
    within W unrefused by the limit.
  fails_when: any of the first N requests from PRIMARY_SOURCE_IP within the window comes back other than
    HTTP 200 (e.g. the hook refuses before the threshold is actually exceeded).
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: answers the (N+1)th request from that same source address within the window with HTTP 429
  proves: The N+1th request from that same source address within the same window is answered HTTP 429.
  fails_when: the request immediately past the configured threshold, from the same address in the same
    window, is answered anything other than HTTP 429 (e.g. the hook lets it through, or refuses one request
    early/late).
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: names, in that 429 response, a Retry-After value the caller may retry after
  proves: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  fails_when: the 429 response is missing the Retry-After header, or its value does not name the number
    of seconds remaining in the window (here 10 for a 10s window with no elapsed time).
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: does not refuse a request from a second source address while the first source address is over
    its own threshold
  proves: A request from a second source address is not refused by the limit while the first source address
    is over its threshold in the same window.
  fails_when: a request from SECONDARY_SOURCE_IP is refused (anything other than 200) merely because PRIMARY_SOURCE_IP
    is already over its own threshold on the same hook.
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: 'enforces the threshold each hook was constructed with: one route refuses at its own boundary
    while a route built with a higher threshold does not'
  proves: The threshold and the window a hook counts by come from the arguments its construction was given,
    not from a constant fixed in the hook's own module.
  fails_when: a hook constructed with maxRequestsPerWindow 2 fails to refuse its 3rd request, or a hook
    constructed with maxRequestsPerWindow 5 refuses within its own first 3 requests — either would mean
    the enforced boundary is not the one each construction was given.
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: does not refuse, on a second hook's own route, a source address already refused by a first hook
    built separately
  proves: 'Two hooks built by separate constructions count their windows independently: a source address
    over the threshold on one is not refused by the other.'
  fails_when: a source address already refused on the first hook's route is also refused on the second,
    separately constructed hook's route, meaning the two constructions share counting state.
- file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  name: lets a source address's request through once its prior window has fully elapsed
  proves: Once a source address's window has elapsed, a further request from it is not refused by the
    limit.
  fails_when: a request sent exactly at (or after) the window's full elapse from the same source address
    is still refused, meaning the window was not reset.
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: answers the 61st request within one minute from the same source IP with HTTP 429
  proves: The read-capability-by-identity route's delivered refusal past 60 requests in a minute still
    answers HTTP 429.
  fails_when: the 61st request within the minute from the same source IP against read-capability-by-identity
    stops answering HTTP 429 — this task touched no file behind that route, so this pre-existing test
    is the standing evidence that nothing regressed.
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: names, in the 429 response, a Retry-After value the caller may retry after
  proves: The read-capability-by-identity route's delivered refusal past 60 requests in a minute still
    carries a Retry-After value.
  fails_when: that same 429 response stops carrying a Retry-After value — again standing evidence, since
    this task left that middleware and its wiring untouched.
not_applicable:
- edge_case: A hook constructed with maxRequestsPerWindow 0 or windowMs 0
  why: No criterion states or implies a minimum for the arguments a construction is given; every criterion
    reads naturally for a positive threshold and a positive window. A threshold or window of zero is a
    degenerate configuration no criterion addresses, not a boundary any of them draws.
- edge_case: Two requests from the same source address arriving at literally the same instant (a race
    on the shared per-address counter)
  why: Node's event loop runs the hook's synchronous read-count-write logic to completion for one request
    before starting the next; two invocations of the hook body for the same address cannot interleave
    within one process, so there is no race for any criterion to reach.
untested:
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited's fact — that diagnose, simulate-case
  and simulate-hypothesis each accept at most 10 requests per minute per caller, counted independently
  per route, refusing with 429 and a Retry-After value — is not decided whole by any test this task can
  write. This task builds only the parameterized counting mechanism and, per its own Notes (REMAINDER),
  does not wire the hook onto any of the three routes; that node's fact is left to the sibling task's
  proof rather than approximated here.
- The implementation record's inference that the 429 response body reuses the existing envelope shape
  (error.code RATE_LIMIT_EXCEEDED, the fixed message sentence, details.retryAfterSeconds) is an inference
  about behavior, not a fact any criterion or node states — no test in this proof asserts the body's shape.
---
## What it is
The test suite proving createRateLimitHook's counting, refusal and independence properties.

## Notes
None.
