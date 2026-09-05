---
title: Reword case-version-lifecycle-schema.spec.ts's stale test title
summary: Renamed the mutability test's own title to name the revision's own draft state as the governing condition, dropping the retired case-version-reference framing, with arrange/act/assert byte-for-byte unchanged.
task: sha256:4dd1e532e887c518df82ee7ec5b455cde9089942237b116f9f71a7cb36152152
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-version-lifecycle-schema-title-corrective-reword-the-stale-test-title-build
files:
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  effect: Renamed one it(...) block's title string from "changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it" to "changes an already-stored hypothesis revision's own columns on an ordinary UPDATE while the revision's own state is still draft"; no other line in the file changed.
criteria:
- criterion: The test's own title states that the row is mutable because the hypothesis-revision's own state is draft (the column's default, left there by insertHypothesisRevision), never because of any case version's reference to it or absence of one.
  met: true
  how: The new title reads "...while the revision's own state is still draft", naming the revision's own state directly and dropping every reference to a case version or its release status.
- criterion: The test's arrange, act and assert are byte-for-byte unchanged; only the string literal naming the test changes.
  met: true
  how: Only the it(...) string literal was edited; the insertCase/insertHypothesis/insertHypothesisRevision arrange, the UPDATE act, and the SELECT/expect assert are untouched.
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  met: true
  how: No assertion, query, or fixture in the file was touched, so the suite's behavior is unchanged.
nodes:
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  how: This task changes no behavior and implements no branch of this rule's statement (per the task's own REMAINDER note); the title now names this rule's governing fact — the revision's own draft state — instead of the retired case-version-reference framing, so the test's title no longer misdescribes the condition this rule states.
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: domain/knowledge/hypothesis-revision
  how: The retitled test now names the revision's own state attribute (draft) as what makes the row mutable, matching this node's statement that the revision carries its own state directly rather than through any case version reference.
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
preserved:
- Every existing assertion in case-version-lifecycle-schema.spec.ts, including this test's own arrange, act, and assert — all left byte-for-byte identical.
- The file's other tests, including the released-hypothesis-revision immutability tests governed by rules/knowledge/a-released-hypothesis-revision-is-never-altered — none of their lines were touched.
deferred:
- what: Implementing and proving revise-hypothesis's own branch selection among highest-existing-in-place, next-revision-when-released, and revision-1-when-none, per rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's full statement.
  why: The task's own REMAINDER note states no criterion of this task reaches that behavioral clause — this task's act is a raw SQL UPDATE, never a revise-hypothesis call, so that branch selection belongs to a different task.
---
## What it is

Renames one stale test title in case-version-lifecycle-schema.spec.ts to name the revision's own draft state as the actual governing condition.

## Notes

None.
