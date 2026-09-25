---
title: Discarding a draft that does not read back as a case
summary: The backend accepts a discard of a draft version whichever validator rule
  fails over it, with draft state as the only condition.
rationale: Split from correction because discard needs no read of the draft's declared
  attributes and, per the inventory, already bypasses validation, so it changes for
  a different reason than the correction work.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
covers:
  - rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  - constraints/a-successful-case-version-discard-answers-with-no-content
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
  - rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  - rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  - rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
uncovered:
  - node: rules/knowledge/only-a-draft-case-version-may-be-discarded
    why: The draft-state refusal already stands in discard.operation.ts, and nothing
      here changes it; the scope states it stays the deciding condition.
  - node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
    why: The further explicit act is taken on the surface in the frontend target,
      the backend discard route carries none of it, and the scope states that nothing
      here changes it.
  - node: rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
    why: Reproducing the slug is a surface act in the frontend target, the backend
      discard route carries no slug reproduction, and the scope states that nothing
      here changes it.
  - node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
    why: A surface fact of the frontend target about the interval before a draft's
      record arrives; nothing backend changes for it.
---

## What it is

This epic holds the proof that a discard of a draft is accepted whatever validator rule fails over it.

## Notes

Rule 3 has two halves, the surface offering the discard and the discard being accepted, and this backend scope delivers only the acceptance; the offer is the frontend's.
