---
type: invariant
statement: An investigation is written once and never mutated; no intermediate domain state persists.
constrains:
  - domain/investigation/investigation
---

## Description

Persisting in stages would reintroduce the intermediate states and the rich aggregate that were cut.
A crash before the write costs one re-execution, acceptable because collection is read-only and parallel.
