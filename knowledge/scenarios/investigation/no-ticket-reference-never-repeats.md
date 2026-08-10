---
subject: rules/investigation/an-investigation-is-idempotent-within-a-window
given:
  - two diagnose calls for the same subject and the same case, neither carrying a ticket reference, arriving within what would otherwise be the window
when:
  - the second call is diagnosed
then:
  - a second, independent investigation starts
  - the first investigation is neither returned nor joined
involves:
  - domain/investigation/investigation
---

## Description

A ticket reference is the only thing two calls repeat against; without one, the second call has nothing to match the first by, so it is simply a new request.
