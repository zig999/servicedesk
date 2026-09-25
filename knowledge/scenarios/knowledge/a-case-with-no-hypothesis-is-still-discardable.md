---
subject: rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
given:
  - a case's only draft version's manifest holds no hypothesis
when:
  - the curator discards that draft version, reproducing the case's own slug
then:
  - the discard is accepted
  - the draft version and its own manifest entries are removed
  - the case's version number spent on the discarded draft is never reused
involves:
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
  - rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
---

## Description

The curator who decided the case was not worth correcting is not left holding a version they can neither read, edit nor abandon: discard answers the same manifest-holds-no-entry condition `a-case-with-no-hypothesis-is-still-open-for-editing` answers by correction, this time by ending the draft instead.
