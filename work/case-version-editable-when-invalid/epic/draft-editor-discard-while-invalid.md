---
title: Discarding a draft on the editor while it does not read back as a case
summary: The frontend editor offers, and completes, the discard of a draft version
  whatever validator rule fails over it.
rationale: Split from correction because discard needs none of the draft's declared
  attributes, and its gate already depends on state alone. It changes for a different
  reason than the correction work, as the backend half was split.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
covers:
  - rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
  - rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  - rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  - constraints/a-successful-case-version-discard-answers-with-no-content
  - domain/knowledge/case-version
---

## What it is

This epic holds the frontend half of the discard rule: the editor offering the discard of a draft that does not read back as a case.

## Notes

The backend already accepts this discard, and epic/draft-discard-while-invalid holds the proof of that acceptance. So the offer is the only thing this target still has to do.
