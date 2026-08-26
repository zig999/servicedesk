---
title: Collection stage propagates its remaining budget into each observation
summary: The collection stage passes its own remaining time within the seven-second budget into every concept's observation call.
objective: The collection stage propagates its own remaining time within the seven-second collection budget into each concept's observation call, so a capability slower than that budget yields to it.
criteria:
  - A capability declaring a ten-second timeout, collected while the stage's seven-second budget is still fully available, ends at seven seconds with result timeout, unaffected by the three seconds its own declared timeout still had left.
  - The investigation proceeds after that ending rather than waiting past the seven-second collection budget.
depends_on:
  - task/observation-endings-and-collection-budget/observation-port-budget-clamp
rationale: Same split as the ending-detail pair above, under the one-seam boundary between the port and its one production caller; the criteria mirror the scenario a-slow-capability-yields-to-the-collection-budget directly.
implements:
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  - domain/investigation/evidence-result
  - domain/investigation/evidence
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
sources:
  - intake/scope.md
---

## What it is

The collection stage computes its own remaining time within the seven-second budget and passes it into the observation port for every concept it collects.

## Notes

None.
