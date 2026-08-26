---
title: Collection stage records the observation's result detail
summary: Evidence written for a newly-classified unavailable observation carries the cause its outcome named.
objective: The evidence the collection stage writes for an observation ending unavailable for one of the four newly classified causes carries the result_detail that observation's outcome reported.
criteria:
  - Evidence written for a concept whose observation ends unavailable for one of the four newly classified causes carries a result_detail naming that cause.
  - Evidence written for a concept whose observation ends ok, denied or timeout is unchanged from before this task.
depends_on:
  - task/observation-endings-and-collection-budget/observation-port-unavailable-endings
rationale: This is the consumer half of the sibling task's port widening; I split it out because evidence-collection-stage.ts calls the widened port rather than delivering it, and its own criterion (what lands in the written evidence) is demonstrable independently of the port's own internal shape.
implements:
  - rules/integration/an-unresolvable-observation-ends-unavailable
  - rules/integration/an-http-connector-configuration-declares-its-call
  - domain/investigation/evidence
  - domain/investigation/evidence-result
sources:
  - intake/scope.md
---

## What it is

The collection stage copies the observation outcome's result detail into the evidence entry it writes for the investigation.

## Notes

REMAINDER, from the specification — rules/integration/an-http-connector-configuration-declares-its-call's
statement carries a second clause this task's criteria do not reach: "A connector configuration
executed by the HTTP connector declares a method that is one of GET, POST, PUT, PATCH or DELETE, a
responseMap that is an object of string paths, and a statusMap that is an object mapping an HTTP
status to one evidence-result ending" — the shape a connector configuration must hold. This task's
objective and criteria govern only what the collection stage writes into evidence once an
observation has already ended unavailable for the malformed-configuration cause; they say nothing
about validating or shaping the configuration itself. It belongs to the task governing the HTTP
connector configuration's required keys (method, responseMap, statusMap) — connector registration
and execution validation, not the collection stage's evidence writing this task covers.
