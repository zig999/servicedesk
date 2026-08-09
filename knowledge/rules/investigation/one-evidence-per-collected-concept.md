---
type: invariant
statement: An investigation holds exactly one evidence per concept in the case's collection plan.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
---

## Description

The collection plan is a set, so the concept already identifies the evidence and no separate id exists.
