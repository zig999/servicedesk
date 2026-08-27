---
subject: rules/investigation/a-simulation-writes-no-investigation
given:
  - a simulation collected an evidence item with result ok
when:
  - a diagnosis of the same case and subject runs afterward
then:
  - the diagnosis observes the concept again
  - nothing the simulation collected is read back
involves:
  - domain/investigation/evidence
  - contracts/investigation/diagnosis
---

## Description

Result `ok` is exactly the class `domain/investigation/evidence-result` admits into a cache when one exists; this scenario is the one case that proves a simulation's own `ok` observation is the one exception even then.
