---
subject: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
given:
  - a released case version's collection plan resolves to a capability whose input schema names contract_number required
when:
  - a diagnose is called against that case version with a subject holding no contract_number attribute-value
then:
  - the diagnose is refused before any collection
  - the refusal names contract_number and the capability that requires it
involves:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
---

## Description

The refusal happens before the collection stage ever starts, distinct from an observation degrading mid-collection: nothing is spent finding out what a look at the case's own derived requirements already knew.
