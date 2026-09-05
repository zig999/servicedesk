---
title: Correct revise-hypothesis.operation.spec.ts's two stale titles and its release-write duplication
summary: Two test titles name a superseded manifest-reference condition and contradict their own assertions; a local helper reimplements the hypothesis-revision release write as raw SQL instead of calling the declared lifecycle operation.
rationale: Three wrong behaviors found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/revise-hypothesis-fixture-corrective-scope.md
objective: revise-hypothesis.operation.spec.ts's test titles name the conditions their bodies actually exercise, and its release-transition fixture calls the case lifecycle's guarded releaseHypothesisRevision operation, never a raw SQL UPDATE.
criteria:
- The test currently titled "overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state" is retitled to name the revision's own state (draft — the state this test's own body exercises) as the governing condition, never a case version's reference to it or the revision's released state.
- The test currently titled to assert the revise "creates no revision at all" and "leaves the hypothesis holding only the revision it already had" is retitled to state that the revise creates the hypothesis's own next revision, one past its existing highest revision, matching what its own body already asserts and inserts.
- releaseHypothesisRevisionOwnState's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the guarded operation that reads the revision's own state and refuses a non-draft release before writing — never a hand-written UPDATE statement against hypothesis_revisions.
- Running this file's own full test suite continues to pass with every existing assertion unchanged (the two retitled tests' own arrange/act/assert stay byte-for-byte the same; only their title strings change).
implements:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
## What it is

Corrects two stale test titles (a superseded manifest-reference framing, and a title contradicting its own assertion) and one raw-SQL release-write duplication in revise-hypothesis.operation.spec.ts.

## Notes

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's "a hypothesis holding no revision yet always creates revision 1" clause reaches no criterion here; it belongs to the task delivering revise-hypothesis's first-revision branch.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's HTTP-409/refusal-content clauses reach no criterion here; it belongs to the task delivering the hypothesis-revision release operation and its non-draft refusal.
ADVISORY, from the specification — criterion 2's "one past its existing highest revision" arithmetic is stated by rules/knowledge/a-hypothesis-revision-number-is-never-reused, outside this epic's covers; the candidate rule states only "the hypothesis's next revision" without the arithmetic.
ADVISORY, from the specification — criterion 3 names the case lifecycle's release-hypothesis operation, published by contracts/knowledge/case-lifecycle, outside this epic's covers; the candidates state the transition and the revision's own release, not its publication.
ADVISORY, from the specification — two non-candidate nodes' own Description bodies (rules/knowledge/a-revise-answers-the-revision-number-it-saved and rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move) still describe the superseded manifest-reference condition in prose; a reviewer reading those bodies alongside this retitling may read a contradiction. Flagged for a future prose sweep of those two nodes' own text, outside this task's objective.
Decision, beyond the covers — stand: rules/knowledge/a-hypothesis-revision-number-is-never-reused, contracts/knowledge/case-lifecycle, rules/knowledge/a-revise-answers-the-revision-number-it-saved and rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move are each named above only as context for an advisory note; this task states no new fact about any of them and implements nothing of its own against them, so growing this epic's claim to nodes this task does not implement would be a claim the validator refuses for want of an implementing task.
