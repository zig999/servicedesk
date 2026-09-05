---
title: Retire the case-version-lifecycle spec's manifest-basis immutability assertion
summary: The one test in case-version-lifecycle-schema.spec.ts asserting a hypothesis-revision's
  immutability from a released case version's manifest reference, restated against the revision's
  own state.
rationale: Found by running the full suite after delivering retire-manifest-basis-schema-specs —
  a fourth file carrying the same obsolete basis that the original corrective scope did not name.
  The planning gives it its own task under the existing obsolete-protection-basis-tests epic
  because that epic's covers already reach every node this fix answers to, and no other task of
  this plan touches this file.
sources:
- work/hipotese-release-proprio/intake/scope-case-version-lifecycle-schema-obsolete-test.md
objective: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts asserts a
  hypothesis-revision's immutability from its own released state, never from a released case
  version's manifest reference to it.
criteria:
- case-version-lifecycle-schema.spec.ts holds no assertion that an update against a hypothesis-revision's
  stored columns is refused, or left without effect, because a released case version's manifest
  references it.
- Any test the file retains that asserts this immutability asserts it from the hypothesis-revision
  row's own released state.
- The file's own tests pass in full, with no test skipped and no assertion relaxed.
depends_on:
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- constraints/the-schema-replays-from-its-scripts
---

## What it is

One test that builds a released case version and points its manifest at the revision under test,
expecting the UPDATE to be refused on that basis — the same obsolete construction
retire-manifest-basis-schema-specs already retired from two sibling files, missed here because
this file was not named in that task's own scope.

## Notes

UNDERDETERMINED, from the specification — criterion 2 fixes only the basis of a retained immutability assertion, not its outcome; `rules/knowledge/a-released-hypothesis-revision-is-never-altered` states the attempt is refused with an HTTP 409 response reporting ReleasedHypothesisRevisionNotAlterableError, which a test asserting only that stored columns are unchanged does not distinguish from a silent no-effect acceptance.
UNDERDETERMINED, from the specification — the file's neighboring test "changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it" asserts mutability conditioned on the absence of a released reference, which `domain/knowledge/hypothesis-revision` refuses as a basis ("pointing at it moves neither"); no criterion of this task reaches it.
REMAINDER, from the specification — the HTTP-409/error-identity clause of `rules/knowledge/a-released-hypothesis-revision-is-never-altered` reaches no criterion here; a schema-level spec observes no HTTP status. Belongs to the task delivering the alteration refusal through the revise-hypothesis operation and its published route.
ADVISORY, from the specification — criterion 2 is conditional ("Any test the file retains..."), so deleting the assertion outright with none retained also satisfies criteria 1 and 2; no candidate node requires a replacement test to exist.
