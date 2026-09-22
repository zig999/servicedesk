---
title: overwriteRevision applies requireCaseHoldsDraft before writing
summary: overwriteRevision now refuses with CaseHoldsNoDraftError before touching a hypothesis-revision
  when the case no longer holds a draft, matching insertRevision's own precedent.
rationale: Corrective increment. The wrong behavior is observed, not planned — /review-change's conformance
  pass found overwriteRevision skips the draft guard its sibling insertRevision applies, letting an in-place
  hypothesis-revision edit reach the UPDATE after the case's draft was released or discarded.
sources:
- intake/2026-09-22-case-store-overwrite-revision-draft-guard-gap.md
objective: overwriteRevision refuses with CaseHoldsNoDraftError before writing when the case it belongs
  to holds no draft version, matching insertRevision's own precedent.
criteria:
- Where the case the hypothesis-revision belongs to holds no draft version, an overwrite of that revision
  is refused with CaseHoldsNoDraftError before any statement touches the hypothesis-revision or its collects.
- Where the case still holds a draft version, an overwrite of an unreleased hypothesis-revision proceeds
  exactly as it already does today.
- The refusal is raised through the same requireCaseHoldsDraft helper insertRevision already applies, so
  the two write paths share one guard rather than two independent checks that could drift apart.
reference:
- src/src/persistence/relational-case-store.repository.ts
implements:
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
---

## What it is
The one missing guard call, added to overwriteRevision ahead of its existing statements.

## Notes
BLOCKING notes do not apply here; this is a corrective increment answering an observed defect, not a
planning silence.
REMAINDER, from the specification — the rule's subject-type-check clause ("the concept-acceptance check
the new revision undergoes uses that draft version's declared subject type") and the HTTP 409 transport
shape belong to the already-delivered revise-hypothesis operation and route, not to this store-layer guard.
ADVISORY, from the specification — criterion 2's regression-guard subject matter (which revision a revise
writes into) is rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's own; this task
changes none of that rule's clauses and does not implement it.
ADVISORY, from the specification — criterion 3's helper-sharing requirement is implementation structure,
backed by insertRevision's own existing code and the intake's observation, not by the specification.

ABANDONED, 2026-09-22 — this task is not delivered. A build of the implementation (requireCaseHoldsDraft
added to overwriteRevision, exactly as this task's criteria state) broke a pre-existing, deliberate
integration test: src/src/__tests__/integration/persistence/relational-case-store.repository.spec.ts,
"does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even though
a released case version's manifest still references that revision" (lines 2085-2116 at time of observation).
That test creates a draft version, inserts and places a hypothesis-revision, releases the version — leaving
the case with no draft version at all — and asserts that overwriteHypothesisRevision still succeeds. This
task's own guard would refuse that call with CaseHoldsNoDraftError, contradicting an established,
Postgres-backed test nobody flagged as wrong. Put to the human (who authorized this corrective increment
via the review this task was cut from), the decision was to abandon this task rather than override the
existing test: the source change (the requireCaseHoldsDraft call in overwriteRevision) has been reverted,
and no implementation record was written. Whether rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
genuinely governs the overwrite-in-place path, or governs only the insert path (a-hypothesis-revision-is-overwritten-while-unreleased's
own concern) and the review's original conformance finding was a false positive, is unresolved and would
need a fresh /analyse over both the rule's own text and this test's own established behavior before any
future attempt.
