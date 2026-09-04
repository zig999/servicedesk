---
title: Repoint the repository's overwrite-refusal test onto the revision's own state
summary: Replaced the obsolete manifest-referenced-basis overwrite test in the relational case store repository
  spec with a test asserting the opposite direction of the state-only rule — that a released case version's
  manifest reference alone, over a draft-state revision, does not refuse an overwrite — leaving the already-correct
  sibling as the file's one assertion of the refusal itself.
task: sha256:ac0b9b99ebd817484de2623112dab8ea87f0858b5ea8ec46fe31dd843bcf28ef
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/obsolete-protection-basis-tests-repoint-the-repository-overwrite-refusal-test-build
files:
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  effect: Replaced the test titled "refuses an overwrite attempt against a revision a released case version
    still references through a distinguishable error, rather than surfacing it as an undifferentiated
    write failure" with a test titled "does not refuse an overwrite attempt against a hypothesis-revision
    whose own state is draft, even though a released case version's manifest still references that revision".
    The new test keeps the exact same fixture construction but asserts the overwrite succeeds and the
    stored criterion changed, rather than asserting any refusal. The sibling test asserting refusal from
    the revision's own released state is untouched.
criteria:
- criterion: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts holds no test
    asserting an overwrite is refused because a released case version still references the revision.
  met: true
  how: The only test that asserted this was replaced; no remaining test in the file asserts a refusal
    keyed on manifest reference.
- criterion: The spec asserts that an overwrite attempted against a hypothesis-revision whose own state
    is released is refused through a distinguishable error.
  met: true
  how: The untouched sibling test sets the revision's own state column to released directly, attempts
    the overwrite, and asserts the rejection is an instance of ReleasedHypothesisRevisionNotAlterableError
    with statusForError(caught) === 409.
- criterion: The spec asserts that an overwrite attempted against a hypothesis-revision whose own state
    is draft is not refused by this rule, even where a released case version's manifest references that
    revision.
  met: true
  how: The repointed test builds a released case version whose manifest places the revision while the
    revision's own state stays at its default draft (release() only writes case_versions), then performs
    the overwrite and asserts it resolves and the stored criterion reflects the new value.
- criterion: The spec holds exactly one test asserting the refusal of an overwrite against a revision
    whose own state is released.
  met: true
  how: Only the sibling test (unchanged) asserts this refusal; the repointed test asserts the opposite
    (non-refusal) under a different precondition (draft state), so no duplication of the refusal assertion
    exists.
- criterion: The relational case store repository spec passes in full with no test skipped and no assertion
    relaxed.
  met: true
  how: No test in the file was skipped, marked pending, or had an assertion weakened; the repointed test
    uses the same store methods and fixture-cleanup registration as every other test in the file, and
    its own assertions are exact-value checks (toBe), not relaxed matchers.
nodes:
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  how: The sibling test already encodes this rule's own-state basis and its distinguishable error (ReleasedHypothesisRevisionNotAlterableError,
    HTTP 409); this task's edit removes the one test that mis-encoded the rule as manifest-referenced
    and adds a test proving the rule does not fire on manifest reference alone, converging the file onto
    the rule's actual, state-only condition.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  how: The repointed test exercises the revision's own state (draft) as independent from any case version's
    manifest reference to it, matching the node's statement that "a case version's manifest may point
    at this revision in either state; pointing at it moves neither."
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  how: The repointed test asserts behavior conditioned on the revision remaining in its default draft
    state despite external manifest reference, and the sibling asserts the released-state behavior — together
    the file exercises both values of this enumeration as the sole basis for the refusal.
---

## What it is

The repository's own overwrite-refusal assertion, converged onto the revision's own state — one test proving the refusal from released state alone, one proving the manifest reference alone never triggers it.

## Notes

None.
