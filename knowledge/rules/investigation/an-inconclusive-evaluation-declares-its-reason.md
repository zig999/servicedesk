---
type: invariant
statement: Every inconclusive evaluation declares its reason, and a no-data reason cites the evidence whose result is not ok.
constrains:
  - domain/investigation/evaluation
---

## Description

Inconclusive by technical failure, by queue and by missing data must be distinguishable, or an infrastructure failure is read as a domain fact — the pathology the rest of the system exists to avoid.
A judgment that never received a slot, or that started and did not return in time, is deadline-exceeded: nothing failed and the data arrived.
