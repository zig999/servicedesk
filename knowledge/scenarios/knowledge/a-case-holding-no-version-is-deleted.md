---
subject: rules/knowledge/a-case-holding-no-version-may-be-deleted
given:
  - a case's only draft version was discarded, so it currently holds no version at all
when:
  - the curator deletes that case
then:
  - the deletion is accepted
  - the case no longer appears in the case listing
  - a future create-draft naming that same slug creates a new case under it, as though the deleted one had never existed
involves:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
---

## Description

This is the case discovered stuck rather than removed: `a-case-with-no-hypothesis-is-still-discardable` already lets its one draft go, and what is left is exactly the identity `a-case-holding-no-version-may-be-deleted` now gives the curator a further act to end.
