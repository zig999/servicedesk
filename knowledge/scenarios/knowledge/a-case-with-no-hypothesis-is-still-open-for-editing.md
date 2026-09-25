---
subject: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
given:
  - a case was just created and its only draft version's manifest holds no hypothesis
  - the curator returns to the case listing and opens that case
when:
  - the curator reaches the draft version's own editing surface
then:
  - the surface states that the version does not read back as a case
  - the surface also presents the version's title, when_to_use, subject, fallback and consolidation_register exactly as its own stored record carries them
  - the curator submits an update-draft correcting the title and it is accepted
involves:
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  - rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
---

## Description

This is the reading `an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case` decides: a case's first draft, whose manifest is empty from `a-new-drafts-manifest-is-copied-from-an-existing-version`'s own first-version reading, fails `a-case-has-at-least-one-hypothesis` at every read until a hypothesis is placed. The curator did nothing wrong composing the case's own attributes; what is missing is the manifest, and correcting a title or a when_to_use never depended on the manifest holding an entry.
