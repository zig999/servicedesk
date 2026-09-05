---
title: Fix the pinned-revision-state disclosure's off-page silence
summary: The manifest presentation surfaces state a pinned revision's own draft/released state unconditionally, even when that revision falls off the default page its hypothesis's revisions listing answers.
rationale: Corrective increment for a real, reproducible defect a /review-change conformance pass found against already-delivered code -- the state disclosure this rule requires is unconditional, and the current implementation drops it silently whenever the pinned revision is not on the default (unpaged) answer. Epic claim seeded mechanically from trace.py --encodes over the file the human named.
sources:
  - intake/pinned-revision-state-off-page-corrective.md
covers:
  - rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  - constraints/listings-are-paged
---
## What it is

The pinned-revision-state badge on both manifest-presentation surfaces (the version-manifest builder screen and the case-version editor's released-view manifest table) must state the pinned revision's own state whether or not that revision is on the default page its hypothesis's revisions listing answers.

## Notes

None.
