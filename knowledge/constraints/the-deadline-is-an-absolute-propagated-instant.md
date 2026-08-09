---
statement: A request records one absolute deadline at entry, every stage receives the minimum of its nominal budget and the remaining time, and the internal total stays below the caller's timeout with margin.
scope: investigation
fitness: A load test at saturation shows no response later than the declared total and no stage granted more than the remaining time.
---

## Description

Summing stage budgets and calling the sum a deadline leaves nothing for the overhead between stages; a stage finishing early returns its balance to the next, a late one takes from those that follow, and the last to run pays.
