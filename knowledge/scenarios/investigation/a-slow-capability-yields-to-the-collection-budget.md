---
subject: rules/investigation/collection-has-its-own-budget-within-the-total
given:
  - the case olt-saturated declares a hypothesis collecting equipment-state
  - the registered capability for equipment-state declares its own timeout of ten seconds
  - the collection stage's nominal budget is seven seconds, and the propagated remaining time still allows the full seven at collection's start
when:
  - the capability has not returned an observation by the seven-second mark
then:
  - the evidence for equipment-state records result timeout at seven seconds
  - the investigation proceeds, unaffected by the three seconds the capability's own declared timeout still had left
involves:
  - domain/investigation/evidence
  - domain/integration/capability
---

## Description

A capability's own timeout bounds one call; it is never the reason the collection stage waits longer than its own seven-second budget allows.
