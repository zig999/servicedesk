---
title: Proof for retiring the manifest-basis persistence schema specs
summary: Confirms, by reading the two edited files in full and cross-referencing a fresh full suite run,
  that the two schema specs no longer attribute refusal, content-survival or collects-survival to a released
  case version's manifest reference, that every removed assertion has a state-only equivalent already
  standing in the sibling file, and that the retained/sibling tests still pass.
implementation: sha256:3f8f2a58136d822e3c8bcbd84a5a672f9659502615fc988777b8b88a5e5c4d60
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: complete it roster of the delivered file (4 retained blocks)
  proves: Criterion 1 and 2 — none of the four retained blocks expects rejection or asserts unchanged
    content on the manifest basis; three assert a write goes through, one asserts trigger/rule existence.
  fails_when: any it block reappears expecting rejection tied to a case_version_hypotheses/case_versions
    manifest reference.
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: complete it roster of the delivered file (2 retained blocks)
  proves: Criterion 3 — the DELETE test asserts removal (not survival) against a draft-manifest fixture,
    and the UPDATE test builds no case version or manifest at all.
  fails_when: an it block reappears asserting a collects row survives an ordinary DELETE because a released
    case version's manifest references its revision.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: refuses an update against a hypothesis-revision whose own state is released even though no case
    version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError
  proves: Criterion 4 — this is the manifest-free equivalent of the removed rejection-and-content-survival
    assertion, keyed only to state = 'released'.
  fails_when: this test is removed, weakened, or altered to require a manifest reference for the refusal
    it asserts.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: reads back a released hypothesis-revision's own collects exactly as they were stored, after an
    ordinary DELETE against those exact rows is attempted
  proves: the collects-survival half of criterion 4 — the manifest-free equivalent of the removed collects-survival
    assertion.
  fails_when: this test is removed, weakened, or altered to require a manifest reference.
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: leaves a hypothesis-revision's own collects row naming its original concept after an ordinary
    UPDATE attempts to change which concept it names
  proves: Criterion 5 — this is the one survival-shaped assertion retained in either edited file, and
    it builds no case, case-version or manifest fixture at all.
  fails_when: this test (or any other retained in either edited file) is changed to build a case_versions/case_version_hypotheses
    fixture while still asserting refusal or survival.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though
    a released case version's manifest references that revision
  proves: Criterion 6 — an alteration aimed at a draft-state revision is not refused by this rule, even
    where a released case version's manifest references that revision.
  fails_when: this test is removed, or the trigger it exercises starts refusing a draft-state revision
    because a released case version's manifest references it.
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: the four retained tests plus the two removed ones, cross-referenced against a full suite run
  proves: Criterion 7 — replaying every migration file and running this file's tests passes with no test
    skipped; the two removed titles are exactly the two that would have failed against the current schema.
  fails_when: any of the four retained tests starts failing against the current schema, or a test in this
    file is skipped.
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: the two retained tests plus the one removed one, cross-referenced against the same full suite
    run
  proves: same criterion 7, for this file.
  fails_when: either retained test starts failing against the current schema, or a test in this file is
    skipped.
not_applicable:
- edge_case: absent or empty input at a validation boundary
  why: this task touches only integration schema specs asserting database trigger/rule behavior over fixtures
    the test itself constructs; no boundary-validated input is introduced or changed.
- edge_case: a boundary at each end of a stated range
  why: no range-bounded value is touched by this task.
- edge_case: a duplicate where uniqueness is claimed
  why: no uniqueness constraint is added, removed or exercised differently by this task.
- edge_case: two operations against one subject at once
  why: no concurrency behavior is introduced or altered; the suite's existing concurrency coverage is
    untouched.
- edge_case: a dependency that fails or answers slowly
  why: no external dependency is introduced; the only dependency (PostgreSQL) is unchanged and already
    covered by the unedited fixture helpers.
- edge_case: an operation attempted against state that forbids it
  why: already fully covered by tests this task did not write — the retained tests plus the sibling schema
    and repository tests.
untested:
- The REMAINDER note's HTTP-409/error-identity clause is left untested here, per the task's own scope
  — it belongs to the task covering the revise-hypothesis operation's refusal at the HTTP surface.
- 'The ADVISORY note''s question of whether a released case version''s manifest may legitimately reference
  a draft hypothesis-revision in the live system is left untested here, per the task''s own stand: criterion
  6 only needs the fixture constructed directly.'
---

## What it is

Confirms the two edited schema specs no longer attribute refusal, content-survival or collects-survival to a released case version's manifest reference, and that every removed assertion has a state-only equivalent already standing in the sibling file.

## Notes

None.
