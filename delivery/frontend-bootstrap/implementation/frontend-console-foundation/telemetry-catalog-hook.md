---
title: Telemetry event catalog hook
summary: A hook exposing the eight-event telemetry catalog as typed callables, each sinking through one shared emit() to a namespaced console.info call, with the PRH-01 departure disclosed inline where console.info is actually called.
task: sha256:063530c488907df57e6cfc37f1dc7fcfab5aa94722e68d5f5ec13efe73e259e9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/hooks/use-telemetry.ts
    effect: exports the Telemetry interface (eight typed callables, one per cataloged event), a private emit() helper that calls console.info with a "telemetry:<eventName>" prefix and the payload, and useTelemetry() which returns eight closures each fixed to its own event name and payload type, closing over emit() and nothing else
criteria:
  - criterion: The hook exposes exactly the eight events section 3's catalog names, each as its own callable.
    met: true
    how: the Telemetry interface declares exactly eight readonly callables (caseDraftCreated, caseDraftUpdated, caseDraftDiscarded, caseReleased, manifestHypothesisPlaced, manifestHypothesisRemoved, hypothesisRevised, uiStaleConflictDetected), and useTelemetry() returns an object literal with exactly those eight keys
  - criterion: Calling any one of the eight does not call any of the other seven.
    met: true
    how: each of the eight callables is its own arrow-function closure calling emit() exactly once with its own literal event name and typed payload; none references or invokes any of the other seven
  - criterion: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    met: true
    how: 'every callable routes through the single emit(eventName, payload) function, whose only console.info call is `console.info(`telemetry:${eventName}`, payload)` -- one place applies the prefix'
  - criterion: No network call or real telemetry endpoint is invoked -- the sink is console.info only, matching the decision recorded in temp/frontend-console-decisions.md.
    met: true
    how: emit() is the only place any callable reaches, and its body is a single console.info call with no fetch, no XHR and no client construction
divergences:
  - cites: PRH-01
    file: src/hooks/use-telemetry.ts
    departure: emit() calls console.info directly rather than through a configured logger.
    why: no configured logger exists in this app yet, and this task's own criteria (and the decision recorded in temp/frontend-console-decisions.md) name console.info as the sink deliberately; the PRH-03 suppression sits on the console.info line itself with the reason stated inline
preserved:
  - every other file under frontend/app/src, none of which this task touched
  - the rest of the app's build and lint configuration, unmodified by this delivery
---

## What it is
The eight-event telemetry catalog hook the scope's section 3 line asks for, sinking to console.info because no real endpoint is known yet -- exactly the decision recorded in temp/frontend-console-decisions.md.

## Notes
Departs from PRH-01 (production code emits through the project's configured logger) on purpose: no logger is configured in this app yet, and the task's own criteria name console.info as the sink. Disclosed above and inline in the file via an eslint-disable comment carrying the same reason (PRH-03).
