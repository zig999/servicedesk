---
title: Telemetry event catalog hook
summary: A hook exposing the eight-event telemetry catalog from section 3 of the proposal, sinking each call to namespaced console.info per the decision recorded in temp/frontend-console-decisions.md.
rationale: >-
  Kept as its own task because the telemetry catalog is one reusable hook with one reason to
  change -- which events exist and what each carries -- independent of every other reusable
  piece this wave builds; nothing else in the wave depends on it existing first. The binder
  confirmed naming the eight events and their trigger conditions does not cross into a domain
  fact the specification should hold: section 6.1's own routing table does not route the event
  catalog through any of the four routes, each payload field is an existing domain identifier
  rather than a new fact, and the console.info sink is a planning-time decision already
  disclosed outside the specification.
objective: Calling the telemetry hook's function for any of the eight cataloged events produces one namespaced console.info call carrying that event's name and payload.
criteria:
  - The hook exposes exactly the eight events section 3's catalog names, each as its own callable.
  - Calling any one of the eight does not call any of the other seven.
  - Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
  - No network call or real telemetry endpoint is invoked -- the sink is console.info only, matching the decision recorded in temp/frontend-console-decisions.md.
sources:
  - intake/onda-1-scope.md
---

## What it is
The eight-event telemetry catalog hook the scope's section 3 line asks for, sinking to console.info because no real endpoint is known yet.

## Notes
None.
