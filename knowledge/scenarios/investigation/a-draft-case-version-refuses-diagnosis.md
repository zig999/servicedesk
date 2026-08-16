---
subject: rules/investigation/only-a-released-case-version-is-diagnosed
given:
  - a case version exists in draft state
when:
  - a new investigation attempts to pin that version
then:
  - the request is refused, naming that the version is not released
involves:
  - domain/investigation/investigation
  - domain/knowledge/case-version
---

## Description

A draft may already validate — every rule it composed may already hold — and still be refused here: coherence and release are two different questions, and this scenario is the one where the first holds and the second still refuses.
