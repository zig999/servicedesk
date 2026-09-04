---
title: Retirement of the manifest-basis immutability assertion in case-version-lifecycle-schema.spec.ts
summary: Confirms the obsolete manifest-basis assertion is gone from the file, that no replacement of
  any basis was added or needed to remain because the row's-own-state version of the same claim already
  stands elsewhere in the suite, and that the file's remaining tests — none of them altered by this task
  — still pass.
implementation: sha256:0d772fb4d6da8cc1856824ef6257181da42467f6370758423033678891340abc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released
    case version references it
  proves: This pre-existing, unmodified test is the file's own remaining coverage of a hypothesis-revision
    UPDATE outcome — it demonstrates the deletion left the file's other tests exercising real behavior
    against the live schema rather than being skipped or weakened, which is what criterion 3 requires.
  fails_when: The ordinary UPDATE against this unmanifested hypothesis-revision's criterion column is
    refused, or is silently discarded rather than taking effect.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError,
    rather than silently discarding it, where a released case version's manifest also references that
    revision
  proves: 'This pre-existing test, delivered by the depended-on task refuse-altering-a-released-revision,
    is the row''s-own-state version of the exact scenario the deleted test used to assert on the manifest
    basis. It closes criterion 2''s substance for the suite as a whole: any surviving assertion of this
    immutability is stated from the revision''s own released state.'
  fails_when: An UPDATE against a hypothesis-revision whose own state is released succeeds, or is discarded
    without raising ReleasedHypothesisRevisionNotAlterableError, even though a released case version's
    manifest also references that revision.
not_applicable:
- edge_case: Absent or empty input
  why: This task retires one obsolete schema-level test assertion; no input boundary is introduced or
    touched by its criteria.
- edge_case: A boundary at each end of a stated range
  why: No numeric or ordinal range is concerned by removing an immutability assertion built on the wrong
    basis.
- edge_case: A duplicate where uniqueness is claimed
  why: Not reached by any of this task's three criteria; the file's uniqueness-constraint tests are untouched
    and outside this task's scope.
- edge_case: A dependency that fails or answers slowly
  why: No dependency call is introduced or altered; the change is the deletion of one it block in an integration
    schema spec.
- edge_case: Two operations against one subject at once
  why: No criterion here asserts or changes concurrency behavior; the trigger's transactional behavior
    under concurrent writers is unchanged by this deletion.
untested:
- Criterion 1 (the file holds no assertion of the retired kind) is a claim about the file's own text,
  verified here by reading the file in full rather than by a runnable test. Direct inspection confirms
  no it block in case-version-lifecycle-schema.spec.ts conditions a hypothesis_revisions outcome on a
  case_version_hypotheses/case_versions manifest reference.
- The first UNDERDETERMINED note (a test asserting only 'stored columns unchanged' would not distinguish
  refusal from silent no-effect acceptance) names no implementation this task delivered — the task took
  the deletion route with nothing retained, so no such under-specified test exists here to fail against.
- The second UNDERDETERMINED note (the neighboring 'no released case version references it' test asserting
  mutability conditioned on absence of a reference) is explicitly stated by the task's own Notes as reaching
  no criterion of this task. No candidate implementation is named to test against.
---

## What it is

Confirms the obsolete manifest-basis immutability assertion in `case-version-lifecycle-schema.spec.ts` is gone, and that the row's-own-state version of the same claim already stands elsewhere in the suite.

## Notes

None.
