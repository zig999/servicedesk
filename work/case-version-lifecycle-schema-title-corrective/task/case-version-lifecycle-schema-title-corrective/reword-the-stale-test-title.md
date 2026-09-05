---
title: Reword case-version-lifecycle-schema.spec.ts's stale test title
summary: One test's own title names a case-version-reference condition migration 0021 retired; the fix renames the title to state the actual governing condition (the revision's own state), with no change to the test's arrange, act or assert.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/case-version-lifecycle-schema-title-corrective-scope.md
objective: The test currently titled "changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it" is retitled to name the condition it actually exercises — the revision's own draft state — never a case-version-reference framing.
criteria:
- The test's own title states that the row is mutable because the hypothesis-revision's own state is draft (the column's default, left there by insertHypothesisRevision), never because of any case version's reference to it or absence of one.
- The test's arrange, act and assert are byte-for-byte unchanged; only the string literal naming the test changes.
- Running this file's own full test suite continues to pass with every existing assertion unchanged.
implements:
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- domain/knowledge/hypothesis-revision
---
## What it is

Renames one stale test title in case-version-lifecycle-schema.spec.ts to name the revision's own draft state as the actual governing condition, dropping the retired case-version-reference framing migration 0021 replaced.

## Notes

REMAINDER, from the specification — no criterion of this task reaches any behavioural clause of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's statement (the branch selection a revise makes among highest-existing-in-place, next-revision-when-released, or revision-1-when-none); this task changes one string literal and the test's own act is a raw SQL UPDATE, never a revise. It belongs to the task that implements and proves revise-hypothesis's branch selection.
ADVISORY, from the specification — this file also holds tests over a released hypothesis-revision's own immutability, governed by rules/knowledge/a-released-hypothesis-revision-is-never-altered, outside this epic's candidates; criterion 3's "whole suite passes" runs those assertions too, though this task changes nothing about them.
ADVISORY, from the specification — a provenance check: earlier reasoning recorded for rules/knowledge/a-released-hypothesis-revision-is-never-altered's own statement, in the retired case-version-reference framing (it reads "a revision declares no such state"), is history, superseded by domain/knowledge/hypothesis-revision's own current text that a revision carries its own state directly; not read back as the governing fact.
Decision, beyond the covers — stand: rules/knowledge/a-released-hypothesis-revision-is-never-altered governs this file's own immutability tests, named above only because criterion 3's suite-wide pass touches them incidentally — this task states no new fact about that rule and implements nothing of its own against it, so growing this epic's claim to a rule this task does not implement would be a claim the validator refuses for want of an implementing task.
