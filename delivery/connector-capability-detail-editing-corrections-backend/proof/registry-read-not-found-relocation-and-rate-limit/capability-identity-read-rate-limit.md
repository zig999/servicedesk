---
title: Rate limit on the capability-by-identity read route
summary: Seven Vitest tests, exercised through app.inject() against a real Fastify instance registering createReadCapabilityByIdentityRoutesPlugin(), prove the 61st-request refusal, its Retry-After header, the 60th-and-under pass-through, per-source-IP independence, the hook's confinement to this one route, the window's reset at its boundary, and the one-second Retry-After floor.
implementation: sha256:4918b9529439c46253880839b03ea9afdc37e97e4c713826ef62480025370ee6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-capability-identity-read-rate-limit-suite
tests:
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: answers the 61st request within one minute from the same source IP with HTTP 429
  proves: A 61st request within one minute from the same source IP to read-capability-by-identity receives HTTP 429.
  fails_when: the hook lets a 61st request from one source IP within its still-live window reach the handler (any status other than 429), or refuses at a different count than 61
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: names, in the 429 response, a Retry-After value the caller may retry after
  proves: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  fails_when: the 429 response carries no Retry-After header, or a value other than the exact whole-second remainder of the still-fresh window (60, since Date is frozen at the window's own start for this test)
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: answers every one of the first 60 requests within a minute from one source IP with its ordinary response, none of them refused
  proves: Up to and including the 60th request within the same minute from that source IP still receives its ordinary, non-429 response.
  fails_when: any of the first 60 requests from one source IP within one window answers anything but 200 — including a premature 429 before the 61st
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: does not count a second source IP's requests against a first source IP's own limit
  proves: A request from a different source IP within the same minute is not counted against another source IP's limit.
  fails_when: a request from a source IP that has made none of its own requests this window is refused anyway, because the counter keys on something other than the source IP
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: refuses no route but read-capability-by-identity, even once that route's own limit is exhausted from the same source IP
  proves: No route other than read-capability-by-identity is registered against the rate-limit mechanism this task adds (the scope half of the criterion).
  fails_when: a sibling route registered directly on the same Fastify instance, outside this route's own plugin, is refused once the capability route's own limit is exhausted from the same source IP — meaning the hook reached beyond its own plugin's encapsulation
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: lets a source IP start a fresh window, with its ordinary response, once its prior window has fully elapsed
  proves: the window is genuinely fixed and time-bounded rather than a limit that, once hit, never releases — the edge case at the window boundary the criteria's "within one minute" phrasing implies
  fails_when: a request sent exactly one window-length after the prior window started is still refused, meaning the window never resets
- file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  name: never answers a Retry-After below one second, even when the refusal lands in the window's very last millisecond
  proves: the Retry-After value never reaches zero at the window's own edge, which the Retry-After criterion's own purpose (naming when to retry) depends on
  fails_when: a refusal one millisecond before the window's own reset answers a Retry-After other than "1" (e.g. "0", which would tell a caller to retry immediately into a request still inside the same window)
not_applicable:
- edge_case: an absent or empty source IP
  why: request.ip is populated by Fastify from the raw socket on every request light-my-request can construct; no criterion or node states behavior for a request with no source address, and app.inject() offers no way to synthesize one
- edge_case: two requests from the same source IP dispatched concurrently at the boundary (the 60th and 61st, or the 61st and 62nd)
  why: the hook's own accepting path runs synchronously between reading and incrementing the counter, so no interleaving is possible for two hook invocations Fastify itself does not preempt mid-body — but which of two concurrently-dispatched app.inject() calls that Fastify's own dispatch actually runs first is an ordering light-my-request does not document and no node here constrains; asserting a specific outcome would bind the test to Node's own event-loop scheduling rather than to a stated behavior
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: the hook has no dependency of its own — no store, no network, no filesystem — it is closed over one in-memory Map with nothing to fail
- edge_case: a duplicate or a uniqueness violation
  why: nothing this task adds claims uniqueness over anything; there is no resource being created
- edge_case: an empty collection answered where one is expected
  why: this route answers one capability, never a list; the rate-limit hook never produces a collection
untested:
- the second half of criterion 5 — "every other existing route's tests continue to pass unmodified" — is not exercised by a new test in this file. The scope half (nothing in this route's own hook reaches beyond its own plugin) is proved directly; that every other route's own existing spec file still passes unmodified is established only by running the project's existing suite as it stood before this task, which this proof does not itself execute — the captured suite run above did run the whole project's existing test suite alongside these new tests, and it passed, but that is the run's own evidence rather than a test this proof wrote.
- 'that pruneExpiredWindows actually removes a stale key from its Map (bounded memory, the implementation''s own disclosed inference) is not independently observable through the HTTP surface: a hook that instead retained every expired key forever but still correctly ignored its stale count would answer every test above identically. The window-reset test exercises the same code path but cannot distinguish ''pruned'' from ''expired but retained and ignored'' from outside the module, so the memory-bound half of that inference stays unproven by a black-box test.'
---

## What it is

Seven new unit tests over the rate-limit hook, exercised through app.inject() against a real Fastify instance registering createReadCapabilityByIdentityRoutesPlugin(): the 61st-request refusal and its Retry-After header, the 60th-and-under pass-through, per-source-IP independence, confinement to this one route, the window's own reset at its boundary, and the Retry-After floor of one second.

## Notes

None.
