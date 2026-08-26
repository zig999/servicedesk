---
title: Observation port clamps a capability's timeout to the remaining budget
summary: The observation port accepts a remaining-budget bound and never lets a capability's own timeout exceed it.
objective: The observation port accepts a remaining-budget bound from its caller, and the production HTTP adapter never lets a capability's own declared timeout exceed it.
criteria:
  - Given a remaining-budget bound smaller than the capability's own declared timeout, the HTTP call the adapter issues is bounded by the remaining-budget value, not the capability's own timeout.
  - Given a remaining-budget bound at or above the capability's own declared timeout, the HTTP call remains bounded by the capability's own timeout.
rationale: I split this from the collection stage's own propagation of its computed remaining time, since the stage is the port's caller rather than its delivery, and this task's criteria are demonstrable by invoking the port directly with an explicit bound.
implements:
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - contracts/integration/concept-observation
  - contracts/investigation/observation-source
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
sources:
  - intake/scope.md
---

## What it is

The observation port's call signature carries a remaining-budget input.
The production HTTP adapter bounds its issued call by the lesser of the capability's own timeout and that remaining budget.

## Notes

REMAINDER, from the specification — rules/investigation/collection-has-its-own-budget-within-the-total's
statement carries a first clause this task's criteria do not reach: "The collection stage carries
its own nominal budget of seven seconds inside the declared total deadline." This task only accepts
a remaining-budget bound as a given input from its caller; it does not fix or propagate the
seven-second figure itself. It belongs to task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget,
which computes and propagates that seven-second nominal budget, against the propagated deadline,
into the remaining-budget value handed to this port.
