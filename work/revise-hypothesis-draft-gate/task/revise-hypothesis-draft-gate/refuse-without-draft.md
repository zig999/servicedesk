---
title: revise-hypothesis refuses a case with no open draft version
summary: Fixes a defect where reviseHypothesis originates a new hypothesis-revision for any case slug, even one holding no draft version at all, never refusing.
objective: ReviseHypothesisOperation.reviseHypothesis refuses, before writing anything, when the named case slug does not currently hold a version in draft state, and otherwise anchors its existing concept-acceptance check to that draft version's own declared subject type exactly as it already does.
criteria:
  - Calling reviseHypothesis for a case slug that holds no version in draft state (never drafted, or its only draft already released or discarded) is refused with a typed error, before any hypothesis identity or revision row is written.
  - Calling reviseHypothesis for a case slug that does hold an open draft version succeeds exactly as it already does today, unchanged.
  - src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts's own existing test "excludes an implementation that originates a hypothesis identity and revision for a case holding no draft version at all, without refusing" passes.
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
sources:
  - intake/scope.md
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered system (npm test),
disclosed from the moment it was written (revise-hypothesis.operation.ts's own UNDERDETERMINED
note) but never closed by any task of the closed case-lifecycle plan.

## Notes

None.
