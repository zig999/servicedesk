---
title: A rate-limit hook whose threshold and window are arguments
summary: The counting mechanism a route plugin builds to refuse a source address past a stated number
  of requests in a stated window.
rationale: The scope left open whether the delivered middleware is generalized or a second one is written,
  and I cut the mechanism apart from the route wiring because the counting idiom changes when the counting
  changes, while the wiring changes when the specification's threshold or the set of limited routes changes.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
objective: A route plugin can build a rate-limit hook by naming the request threshold and the window length,
  and that hook refuses a source address past the named threshold within the named window with HTTP 429
  and a Retry-After value.
criteria:
- A hook built with threshold N and window W leaves the first N requests from one source address within
  W unrefused by the limit.
- The N+1th request from that same source address within the same window is answered HTTP 429.
- That HTTP 429 response carries a Retry-After value naming when the caller may retry.
- A request from a second source address is not refused by the limit while the first source address is
  over its threshold in the same window.
- The threshold and the window a hook counts by come from the arguments its construction was given, not
  from a constant fixed in the hook's own module.
- 'Two hooks built by separate constructions count their windows independently: a source address over
  the threshold on one is not refused by the other.'
- Once a source address's window has elapsed, a further request from it is not refused by the limit.
- The read-capability-by-identity route's delivered refusal past 60 requests in a minute still answers
  HTTP 429 with a Retry-After value.
implements:
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
---
## What it is
One construction that returns a request hook counting requests per source address against a threshold and window it was told.
It is the mechanism only; no route is limited by this task.

## Notes
ADVISORY, from the specification — the criterion holding that the read-capability-by-identity route's delivered refusal past 60 requests in a minute still answers HTTP 429 with a Retry-After value rests on a fact stated by constraints/the-capability-identity-read-is-rate-limited, a node outside this task's own candidate set (it sits in the epic's covers, declared uncovered because the plan changes neither that route's threshold nor its wiring).
REMAINDER, from the specification — two clauses of constraints/the-diagnosis-and-simulation-routes-are-rate-limited reach no criterion of this task: the concrete threshold and window (10 requests per minute), and that the diagnose, simulate-case and simulate-hypothesis routes each count independently. Belongs to the sibling task that wires this hook onto those three routes.
The delivered read-capability-by-identity limiter is the reference for the idiom, not a thing this epic rewrites.
The three routes carry a threshold different from that one's, so the counting shape and the thresholds are separate concerns within this epic.
