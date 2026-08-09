---
subject: rules/investigation/an-inconclusive-evaluation-declares-its-reason
given:
  - the judgment pool is saturated and one hypothesis never receives a slot before the stage deadline
  - the evidence for that hypothesis arrived with result ok
when:
  - the judgment stage closes
then:
  - the evaluation is inconclusive with reason deadline-exceeded
  - the reason is neither no-data, because the data arrived, nor judgment-failure, because nothing failed
involves:
  - domain/investigation/evaluation
---

## Description

Reading a queue as a prompt problem points curation at the wrong place, and the signal that a case has too many hypotheses disappears inside the wrong reason.
