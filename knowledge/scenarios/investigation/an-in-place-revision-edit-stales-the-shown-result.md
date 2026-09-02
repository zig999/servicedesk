---
subject: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
given:
  - a case-simulation result is shown from a prior run of a draft case version
  - the draft's manifest pins hypothesis customer-equipment-fault at revision 2, not yet
    referenced by any case version in released state
when:
  - the curator revises customer-equipment-fault, overwriting revision 2's content in place, and
    returns to the cockpit
then:
  - the shown result is marked stale
  - the curator is told the result may no longer reflect the version's current content
involves:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - contracts/investigation/case-simulation
---

## Description

The revision number staying at 2 throughout is exactly what rules out a number comparison as the detection mechanism: `a-simulation-result-is-stale-once-its-source-changes` already commits to no named mechanism for this reason, and an in-place overwrite is the case where that choice is load-bearing rather than incidental.
