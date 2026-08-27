---
type: value-object
attributes:
  - name: collection
    type: integer
    required: true
  - name: judgment
    type: integer
    required: true
  - name: writing
    type: integer
  - name: total
    type: integer
    required: true
---

## Description

How long each stage took, in milliseconds, measured from the first delivery.
It is what says who is exceeding the declared total budget, per stage and per capability.
writing is present exactly when a consolidation call happened — the same conditional presence `domain/investigation/evaluation`'s own per-call attributes already use, and absent for a run that never reaches consolidation.

## Responsibility

None.
