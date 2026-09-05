---
title: Case-fixture-reads-clean collects-DELETE corruption correction
summary: Corrects case-fixture-reads-clean.spec.ts, a file this project already delivered, so its own collects-survive-DELETE test no longer permanently corrupts the shared canonical fixture.
rationale: A wrong behavior observed by running the delivered system twice, in code this project already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/case-fixture-reads-clean-collects-delete-corrective-scope.md
covers:
- constraints/a-case-is-read-whole
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/validation-runs-at-every-read
uncovered:
- node: constraints/a-case-is-read-whole
  why: >-
    This file's own separate "reads the fixture case whole" test already proves this
    constraint's wholeness-of-assembly; this task's own criteria turn on validation at the
    moment of the read and on release ordering, not on the transaction the assembly runs in.
- node: domain/knowledge/hypothesis-revision-state
  why: >-
    This node only supplies the "released" vocabulary this task's criteria borrow; no criterion
    demonstrates anything about the draft/released enumeration itself.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: >-
    This rule's collects-no-concept refusal is answered by this same file's own pre-existing
    "reads every manifest entry's revision back collecting at least one concept" test; this
    task's own criteria concern release ordering and DELETE-survival, not the write-path
    refusal for an empty collects set.
---

## What it is

The one-behavior correction to case-fixture-reads-clean.spec.ts's own destructive collects-survive-DELETE test, found by two failure-diagnostician passes over the hipotese-release-proprio initiative's own captured suite runs and reproduced directly.

## Notes

None.
