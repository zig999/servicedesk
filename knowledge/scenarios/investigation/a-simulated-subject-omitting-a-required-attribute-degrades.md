---
subject: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
given:
  - a case version names user_id a required case-input-requirement
  - a curator dispatches simulate-case against that version with a subject holding no user_id attribute-value
when:
  - the concept user_id's requirement answers is collected
then:
  - that concept's evidence records result unavailable
  - every other concept's collection proceeds unaffected
  - the simulate-case call itself is not refused
involves:
  - domain/investigation/evidence
  - contracts/investigation/case-simulation
---

## Description

The same missing attribute that would refuse a diagnose at the door (a-diagnose-refuses-a-subject-missing-a-required-attribute) here only ends one concept's own observation unavailable, leaving the rest of the run to show the curator everything else the version does.
