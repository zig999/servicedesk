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
total is the whole call's own real elapsed time, measured from the same entry instant the deadline was propagated from to the moment the record carrying this same durations value is assembled — before anything downstream (persistence, for an investigation; the answer leaving, for a simulation) reads or stores it. It is never the sum of collection, judgment and writing, which loses the overhead and the gaps between stages that constraints/the-deadline-is-an-absolute-propagated-instant's own rationale already names as lost by a budget-sum reading. For an investigation, total necessarily excludes the persistence stage itself, since this attribute must already hold a value before the record it belongs to is complete enough to persist — durations cannot describe a stage that has not yet run when it is fixed. Held against the declared total, it is what a load test compares to find a stage granted more than the remaining time.

## Responsibility

None.
