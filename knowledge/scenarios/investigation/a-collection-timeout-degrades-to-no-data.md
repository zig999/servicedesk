---
subject: rules/investigation/no-stage-aborts-on-its-deadline
given:
  - the collection of equipment-state exceeds its capability timeout
when:
  - the collection stage closes
then:
  - the evidence for equipment-state records result timeout
  - the evaluation of the hypothesis collecting it is inconclusive with reason no-data, citing that evidence
  - the investigation proceeds and answers within the total deadline
involves:
  - domain/investigation/evidence
  - domain/investigation/evaluation
---

## Description

Failing fast to a recorded timeout beats waiting for data that may come: an inconclusive within the deadline is a result, an assessment past it is not.
