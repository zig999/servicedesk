---
title: The diagnose and simulation routes refuse a caller past ten requests a minute
summary: The wiring that puts the ten-per-minute limit on each of the three routes the specification names,
  counted separately per route.
rationale: The three routes are one task and not three because counting independently per route is only
  demonstrable across all three at once, and they share one reason to change — the node that states the
  threshold and names exactly these routes.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
depends_on:
- task/route-rate-limiting/parameterized-rate-limit-hook
objective: Each of the diagnose, simulate-case and simulate-hypothesis routes refuses a source address
  past 10 requests within one minute with an HTTP 429 response carrying a Retry-After value, counted independently
  per route.
criteria:
- The 11th request within one minute from one source address to diagnose is answered HTTP 429.
- The 11th request within one minute from one source address to simulate-case is answered HTTP 429.
- The 11th request within one minute from one source address to simulate-hypothesis is answered HTTP 429.
- Each of those HTTP 429 responses carries a Retry-After value naming when the caller may retry.
- The 10th request within the window on each of the three routes is not refused by the limit.
- A source address over the limit on one of the three routes is answered ordinarily on each of the other
  two within the same window.
- A second source address is answered ordinarily on all three routes while the first is over its limit.
- The limit on each of the three routes reaches that route's own requests and no request of any other
  route.
implements:
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
---
## What it is
Each of the three named route plugins registers the ten-per-minute limit at its own entry.
Each route counts its own callers, so a caller spent on one is fresh on the others.

## Notes
UNDERDETERMINED, from the specification — constraints/the-diagnosis-and-simulation-routes-are-rate-limited bounds "at most 10 requests per minute" over any one-minute span, but every criterion here is written against a single burst; a counter that resets on fixed clock-minute boundaries would pass every criterion while admitting up to 20 requests from one source address inside a single 60-second span, which the statement's own bound refuses.
Passes: a per-route, per-source-address counter keyed on the current clock minute — resetting at each minute boundary rather than rolling — that answers HTTP 429 with Retry-After once the count exceeds 10 within the current minute.
No route plugin among the three holds a request hook today, so the registration is new in each rather than an extension of one.
The specification's own fitness for this node asks for the cross-route independence the criteria state.
