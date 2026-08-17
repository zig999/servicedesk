---
title: Domain errors resolve to HTTP status
summary: A status-map module that lets error-handler.middleware.ts answer a typed domain error with something other than 500.
rationale: status-map.ts is required by the standard's COR-04 rule ("every domain error maps to a transport status in one place, and no handler chooses a status inline") and named explicitly in the scope (§1.3) as the point that blocks every one of the eighteen routes from responding with a typed status. No specification node states which numeric HTTP status any named domain error maps to, and none of the five node classes has a field capable of holding one — COR-04 itself only requires that one table exist and that no handler decide a status inline; it is the standard, not the specification, that presupposes this artifact, the same way it presupposes a manifest or a compiler configuration. It implements no specification node.
objective: A status-map module resolves every typed domain error class the case, glossary and capability-registry ports raise to the HTTP status error-handler.middleware.ts now answers with.
criteria:
  - error-handler.middleware.ts consults the status map instead of answering every thrown error with 500.
  - CaseNotFoundError, CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each resolve to a distinct HTTP status other than 500.
  - An error class the map does not name still answers 500, unchanged from today's behavior.
sources:
  - intake/scope.md
---

## What it is

A new src/errors/status-map.ts consulted by the existing error-handler.middleware.ts.
It carries no business rule of its own; it only keys already-typed domain errors to a transport status.

## Notes

Every route task in this plan depends on this task, since none of the eighteen routes can answer a typed refusal with anything but 500 until it exists.
The binder that first read this task's candidates classed the status-per-error question `unstated`, proposing it as a fact for the specification to decide. On review, this does not survive the cut: no class in the plan-node/specification schemas has a field that could hold an HTTP status number, and error-handler.middleware.ts's own existing header comment already discloses this project's deliberate, standing choice — the standard's COR-04 requires the one table to exist; which number each error resolves to is this table's own engineering content, not a domain fact the business decided. No unstated-fact-decider was spawned over it.
