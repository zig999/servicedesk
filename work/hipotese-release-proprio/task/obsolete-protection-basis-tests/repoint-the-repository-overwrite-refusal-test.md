---
title: Repoint the repository's overwrite-refusal test onto the revision's own state
summary: The relational case store repository spec's test for a distinguishable refusal of an overwrite,
  keyed on the revision's own released state instead of on a released case version referencing it.
rationale: The planning cut this away from the schema specs because it asserts the repository's own
  distinguishable error rather than the schema condition, and because the file already holds a correct
  state-only sibling test that this correction must converge on without duplicating.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
objective: The relational case store repository spec asserts a distinguishable refusal of an overwrite
  from the hypothesis-revision's own released state and from no case version's reference to it.
criteria:
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts holds no test asserting
  an overwrite is refused because a released case version still references the revision.
- The spec asserts that an overwrite attempted against a hypothesis-revision whose own state is released
  is refused through a distinguishable error.
- The spec asserts that an overwrite attempted against a hypothesis-revision whose own state is draft
  is not refused by this rule, even where a released case version's manifest references that revision.
- The spec holds exactly one test asserting the refusal of an overwrite against a revision whose own
  state is released.
- The relational case store repository spec passes in full with no test skipped and no assertion relaxed.
depends_on:
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
---

## What it is

One obsolete test in the repository spec, sitting beside a sibling that already asserts the same refusal from the revision's own state.
The obsolete one constructs a released case version referencing the revision, which the delivered condition no longer reads at all.
Correcting it means the file states the refusal once, on the basis the specification holds.

## Notes

The correct sibling test already in this file is what the corrected test must not become a second copy of.
UNDERDETERMINED, from the specification — criterion 2 asks only that the refusal be "distinguishable"; `rules/knowledge/a-released-hypothesis-revision-is-never-altered` names both the error identity (ReleasedHypothesisRevisionNotAlterableError) and the status (HTTP 409), neither of which any criterion holds the test to.
ADVISORY, from the specification — criterion 3's setup (a released case version's manifest referencing a draft revision) is governed by `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions`, outside this epic's covers.
Decision, beyond the covers — stand: the fixture is constructed directly against the store, below any release path, exactly as the sibling schema-level test already does; no claim on `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` is needed here.
ADVISORY, from the specification — `constraints/the-schema-replays-from-its-scripts` is a candidate this task's own criteria never reach (no migration script is touched here); its coverage under this epic closes through the sibling task `retire-manifest-basis-schema-specs`.
