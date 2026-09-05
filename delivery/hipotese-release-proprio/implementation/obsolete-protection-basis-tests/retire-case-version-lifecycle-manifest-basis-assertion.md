---
title: Retire the case-version-lifecycle spec's manifest-basis immutability assertion
summary: Removed the one test in case-version-lifecycle-schema.spec.ts that asserted a hypothesis-revision's
  immutability on the basis of a released case version's manifest reference, leaving the file's tests
  keyed only to constructions the current state-only trigger actually enforces.
task: sha256:74f28a01d3b43c95c3146120002642951ebf2ca22028a928e9ef3d63a3860305
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/obsolete-protection-basis-tests-retire-case-version-lifecycle-manifest-basis-assertion-build
files:
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  effect: Deleted the it block titled "leaves an already-stored hypothesis revision's own columns unchanged
    after an ordinary UPDATE attempts to alter them, where a released case version's manifest references
    that revision" (previously lines 304-326), which inserted the revision through insertHypothesisRevision
    (no explicit state, defaulting to 'draft' per migration 0020), attached a released case version's
    manifest entry to it, and expected the UPDATE to be silently ineffective — a result the current state-only
    trigger (migration 0021) no longer produces. No other test in the file constructs or depends on this
    scenario; every remaining test is untouched.
criteria:
- criterion: case-version-lifecycle-schema.spec.ts holds no assertion that an update against a hypothesis-revision's
    stored columns is refused, or left without effect, because a released case version's manifest references
    it.
  met: true
  how: The one test making that assertion was deleted outright; no other test in the file conditions a
    hypothesis_revisions UPDATE's outcome on a case_version_hypotheses/case_versions manifest reference.
- criterion: Any test the file retains that asserts this immutability asserts it from the hypothesis-revision
    row's own released state.
  met: true
  how: The file retains no test asserting hypothesis-revision immutability at all after the deletion —
    the task's own Notes record this as an explicit ADVISORY reading of the criterion (a conditional that
    a deletion with nothing retained also satisfies), and the correct, own-state-basis version of this
    exact assertion already exists as this initiative's delivered sibling, refuse-altering-a-released-revision-schema.spec.ts,
    so no gap in coverage is left behind.
- criterion: The file's own tests pass in full, with no test skipped and no assertion relaxed.
  met: true
  how: No remaining test was skipped, weakened or had an expectation loosened; the only change is the
    removal of the one test whose expectation the current schema's trigger no longer produces. Every helper
    the deleted test used remains in place and in use by the tests surrounding it.
nodes:
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  how: This task only had to stop this file from asserting the rule's refusal on the wrong basis (a manifest
    reference rather than the revision's own released state); the rule's actual refusal-on-own-state behavior
    is asserted elsewhere, and this file now makes no claim about the rule at all.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  how: Honored by removing the only assertion in this file that treated a case version's manifest pointing
    at a revision as moving that revision's mutability — exactly what this node states a manifest reference
    never does ("pointing at it moves neither").
- node: domain/knowledge/hypothesis-revision-state
  how: Honored rather than newly encoded — this file adds no test distinguishing draft from released state
    for a hypothesis-revision; that distinction is asserted in the sibling refuse-altering-a-released-revision-schema.spec.ts,
    which this task's scope does not reach.
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  how: Unaffected by the deletion — the file still builds its isolated schema by replaying every migration
    file in filename order through the same migrationFilesInOrder/applyMigrationFiles helpers, which the
    edit did not touch.
inferences:
- inferred: The obsolete assertion is retired by outright deletion, with no replacement own-state-basis
    test added to this file.
  from: 'The task''s own Notes carry an ADVISORY reading that a deletion with none retained satisfies
    both criteria 1 and 2, and this initiative already established the precedent in its two sibling files,
    both under this same epic''s prior retire-manifest-basis-schema-specs task: each retired its own manifest-basis
    immutability assertion by deletion alone, leaving the correct own-state assertion to the already-delivered
    refuse-altering-a-released-revision-schema.spec.ts rather than duplicating it file-by-file.'
preserved:
- Every other test in case-version-lifecycle-schema.spec.ts, including the adjacent mutability test for
  an unreferenced draft revision, the manifest-entry immutability/mutability tests, the case_versions
  immutability/lifecycle tests, and the migration-ordering and backfill tests, all unchanged in behavior
  and expectation.
- The file's shared fixture helpers and its per-test isolated-schema/migration-replay setup, all still
  exercised by the tests that remain.
deferred:
- what: Asserting the HTTP-409 response and ReleasedHypothesisRevisionNotAlterableError identity for an
    attempted alteration of a released hypothesis revision.
  why: A schema-level spec observes no HTTP status; this belongs to the task delivering the alteration
    refusal through the revise-hypothesis operation and its published route, per this task's own REMAINDER
    note.
---

## What it is

One test that built a released case version and pointed its manifest at the revision under test, expecting the UPDATE to be silently ineffective on that basis, retired because the state-only trigger no longer produces that outcome.

## Notes

None.
