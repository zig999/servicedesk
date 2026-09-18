---
type: invariant
statement: Every inconclusive evaluation declares its reason, a no-data reason cites the evidence whose result is not ok, and an evaluation whose judgment call returned a well-formed inconclusive verdict within its deadline over evidence that collected ok declares not-grounded rather than judgment-failure.
constrains:
  - domain/investigation/evaluation
---

## Description

Inconclusive by technical failure, by queue and by missing data must be distinguishable, or an infrastructure failure is read as a domain fact — the pathology the rest of the system exists to avoid.
A judgment that never received a slot, or that started and did not return in time, is deadline-exceeded: nothing failed and the data arrived.
A judgment that ran to completion and answered, in a response the system could read, that the evidence grounds neither verdict is not-grounded: the call succeeded and the answer is the one the judgment was asked for, while judgment-failure is reserved for a response the system could not read at all.
