---
type: invariant
statement: Every field a citation names exists among the field names its own cited evidence item snapshotted, read from that item's own producing capability's output schema at the moment it was collected.
constrains:
  - domain/investigation/citation
  - domain/investigation/evidence
---

## Description

This is what makes the validity of a citation machine-checkable; without it, traceability is a promise that does not survive six months.
The vocabulary a citation is held to is the cited evidence item's own snapshot, never a live read of the capability registry: a registration replacing the producing capability's own record between collection and judgment never changes what a citation may name (rules/investigation/judgment-reads-the-evidence-snapshot).
