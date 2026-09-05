---
title: Correct revise-hypothesis.operation.spec.ts's two stale titles and its release-write duplication
summary: Retitles two it() blocks in revise-hypothesis.operation.spec.ts to name the condition their bodies actually exercise, and replaces the local releaseHypothesisRevisionOwnState helper's raw SQL UPDATE with a call to the case lifecycle's guarded releaseHypothesisRevision operation.
task: sha256:0fa167594e3bbbffa1e498cb6930f174616aaf71c65291394d1bf9d8e4015ce1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-fixture-corrective-correct-titles-and-release-write-duplication-build
files:
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  effect: Imports createCaseLifecycle and CaseLifecycleOperations; adds a wireLifecycle() helper mirroring manifest-collects-survive-release.spec.ts's own; rewrites releaseHypothesisRevisionOwnState to call wireLifecycle().releaseHypothesisRevision(fixture.slug, hypothesisName, revision) instead of a raw SQL UPDATE; retitles the it() block formerly opening "overwrites an already-named hypothesis's own highest revision in place..." to end "...when that revision's own state is draft"; retitles the it() block formerly opening "creates no revision at all..." to "creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released". No arrange/act/assert statement in either test, and no other test in the file, was changed.
criteria:
- criterion: The test currently titled "overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state" is retitled to name the revision's own state (draft — the state this test's own body exercises) as the governing condition, never a case version's reference to it or the revision's released state.
  met: true
  how: Retitled to end "...when that revision's own state is draft". The body seeds a draft case version, revises twice, and never releases or manifests the revision, so the new title names exactly the branch exercised; arrange/act/assert left byte-for-byte unchanged.
- criterion: The test currently titled to assert the revise "creates no revision at all" and "leaves the hypothesis holding only the revision it already had" is retitled to state that the revise creates the hypothesis's own next revision, one past its existing highest revision, matching what its own body already asserts and inserts.
  met: true
  how: Retitled to "creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released". The body's own assertion reads back both revision 1 (released) and revision 2 (draft); arrange/act/assert left byte-for-byte unchanged.
- criterion: releaseHypothesisRevisionOwnState's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the guarded operation that reads the revision's own state and refuses a non-draft release before writing — never a hand-written UPDATE statement against hypothesis_revisions.
  met: true
  how: Replaced the raw UPDATE with a wireLifecycle() helper returning createCaseLifecycle(pool), and releaseHypothesisRevisionOwnState now calls wireLifecycle().releaseHypothesisRevision(fixture.slug, hypothesisName, revision), the same pattern manifest-collects-survive-release.spec.ts's own wireLifecycle()/releaseRevisionDirectly already uses.
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged (the two retitled tests' own arrange/act/assert stay byte-for-byte the same; only their title strings change).
  met: true
  how: Every arrange/act/assert line in the two retitled tests, and in every other it() block, is untouched — only the two title strings and releaseHypothesisRevisionOwnState's internals changed. Every existing call site of releaseHypothesisRevisionOwnState in this file releases a revision still in draft state at the moment of the call, which the guarded operation permits, so the substitution is behaviorally equivalent for every caller. Confirmed by the build/suite runs below.
nodes:
- node: domain/knowledge/hypothesis-revision
  how: This task states no new fact about the aggregate; it only makes the test titles and the release-write helper agree with the aggregate's already-implemented state and release behavior (production code untouched by this task).
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  how: The first retitled test's new title names the rule's own governing condition — the revision's own state being draft — instead of the superseded manifest-reference framing; the test's own body already exercised exactly this branch.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  how: releaseHypothesisRevisionOwnState now drives the release transition through the case lifecycle's own guarded releaseHypothesisRevision operation rather than writing the released state directly, so every test in this file that moves a revision to released now does so through the declared transition. The second retitled test's new title also names the rule's terminal-state consequence instead of the contradictory "creates no revision at all" framing.
inferences:
- inferred: The exact title wording for the first retitled test — "...when that revision's own state is draft".
  from: The task's directive to name the revision's own state (draft) as the governing condition, and rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's own statement language ("unless that revision is itself in released state").
- inferred: The exact title wording for the second retitled test — "creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released".
  from: The task's directive plus the rule's own phrase ("revising instead creates the hypothesis's next revision") and the test body's own assertion of a released revision 1 alongside a newly created draft revision 2.
preserved:
- Every it() block's arrange/act/assert other than the two retitled titles is unchanged, including the eighteen other tests covering origination, overwrite, released-revision immutability, manifest independence, answer shape, refusal paths and the draft-gate tests.
- All other local helpers (freshFixture, persistCase, persistGlossaryVocabulary, registerConceptAccepting, seedCaseVersion and its wrappers, seedAlreadyPlacedManifestEntry, seedHypothesisRevision, seedManifestEntry, seedReleasedReferencedHighestRevision, seedReleasedOwnStateReferencedHighestRevision, aResolution, reviseInput, cleanupFixture, deleteTolerantly, isForeignKeyViolation) are untouched.
- The suite's beforeAll/afterAll/afterEach lifecycle wiring is untouched.
---
## What it is

Corrects two stale test titles and one raw-SQL release-write duplication in revise-hypothesis.operation.spec.ts.

## Notes

None.
