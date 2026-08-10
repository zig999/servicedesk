---
subject: rules/investigation/an-investigation-is-idempotent-within-a-window
given:
  - an investigation for the same subject type, the same set of subject attribute-values, case and ticket reference completed inside the window
when:
  - the attendant submits the same request again
then:
  - the completed investigation is returned
  - no second investigation starts
involves:
  - domain/investigation/investigation
---

## Description

A request arriving while the first is still in progress joins it instead; the in-progress marker is a lease in the idempotency store, never domain state.
