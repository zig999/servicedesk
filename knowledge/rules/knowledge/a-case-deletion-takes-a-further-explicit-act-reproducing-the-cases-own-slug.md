---
type: policy
statement: >-
  Where a surface offers a curator a control to delete a case holding no case version,
  taking that control asks whether the delete is to be performed and issues no delete on
  that asking alone; the delete is issued only where the curator, having asked for it,
  states in a further, explicit act that it is to be performed and reproduces the case's own
  slug in that act, an act reproducing no slug or a slug that is not the case's issuing no
  delete; and where the curator does not so state, the case stands exactly as it stood,
  under the same slug and the same next_version, with every hypothesis referencing it, every
  hypothesis-revision of those hypotheses and every collect those revisions hold untouched.
expression: >-
  For a case c holding no case version and a curator on a surface offering c's delete: the
  curator's taking the delete control issues no delete. A delete of c is issued only where
  the curator, having asked for it, states in a further act that the delete is to be
  performed and reproduces c's own slug in that act; an act reproducing no slug, or
  reproducing one that is not c's, issues no delete. Where the curator does not so state, no
  delete of c is issued -- c answers to the same slug, its next_version holds the value it
  held, every hypothesis referencing c still references it, every hypothesis-revision of
  those hypotheses holds its number, state and content as it did, and every collect those
  revisions hold is still held. This turns on nothing else -- not on which surface offers
  the control, and not on how many hypotheses or hypothesis-revisions reference c.
constrains:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

`contracts/knowledge/case-lifecycle` publishes delete, and `a-case-holding-no-version-may-be-deleted` states when it is accepted and what it removes: the case itself, every hypothesis referencing it, every hypothesis-revision of those hypotheses, released ones included, and every collect those revisions hold.
No operation that contract publishes restores any of it. Once the case is deleted its slug names no case, and a later create-draft naming that slug creates a new case rather than restoring the old one (`a-case-is-created-by-the-first-create-draft-naming-its-slug`).
Without this rule, whether the curator's asking for the delete was itself the delete fell to whatever a surface happened to offer.

The further act carries the case's own slug. That is because what the delete destroys is not a single registration: it is a whole identity together with everything that named it.
It reaches further than the discard of a draft, which `a-draft-case-versions-discard-reproduces-the-cases-own-slug` already asks the curator to confirm by naming the case.
Reproducing the slug makes the delete an act no curator completes without naming the case being destroyed.

Nothing here moves what the delete evaluates or what it answers. A delete asked of a case holding any version is still refused as `a-case-holding-no-version-may-be-deleted` states. An accepted delete still answers as `a-successful-case-deletion-answers-with-no-content` states.
This rule does not state which control carries the delete or the further act, how they are worded, where they sit, or how the surface asks for the slug. Those are form and belong to the interface. The rule states only what the further act requires of the curator.
