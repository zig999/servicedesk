---
title: Case lifecycle HTTP surface
summary: The port extension, the shared error-status mapping, and the seven HTTP routes that let a curator create, revise, place, remove, correct, release and discard a case version.
rationale: The scope's own table (§0) groups create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, update-draft, release and discard under one published api contract; this epic keeps that grouping and adds the case-version-state, consolidation-register and resolution nodes those seven operations read and write, plus the a-case-version-is-written-once rule update-draft must newly enforce. contracts/system/case-authoring is claimed here because it is the write-side capability promise these seven operations jointly deliver, not a node any single task states directly. status-map is placed here because the seven typed errors it must resolve (CaseNotFoundError, CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError, ManifestWouldHoldNoHypothesisError) are all case-lifecycle/case-version errors.
covers:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-case-has-at-most-one-draft
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - contracts/system/case-authoring
uncovered:
  - node: contracts/system/case-authoring
    why: The capability is prose restating what create-draft, update-draft, place-hypothesis, remove-hypothesis, release and discard collectively already deliver; the scope itself states this adds no code obligation beyond those seven operations, so no task names it directly.
sources:
  - intake/scope.md
---

## What it is

The one new domain write (update-draft) the port must gain before its route can exist.
The shared status-map every typed domain error in this surface needs to answer with something other than 500.
Seven HTTP routes: create-draft, update-draft, release, discard, revise-hypothesis, place-hypothesis, remove-hypothesis.
Each route follows the diagnose.routes.ts / diagnose.controller.ts / dto pattern already established.

## Notes

None.
