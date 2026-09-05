---
title: releaseRevisionDirectly routes through the guarded lifecycle operation
summary: Adds one new test to manifest-collects-survive-release.spec.ts proving releaseRevisionDirectly now enforces the case lifecycle's draft-only release guard, and cites the file's two pre-existing, unmodified tests as the proof that its own suite still passes unchanged.
implementation: sha256:b4fb7b1c39e1d748d1630ca0bba52644b4c63b5353fdb9473a25458ee9cd0dc8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/manifest-collects-survive-release-duplication-corrective-route-through-the-declared-lifecycle-operation-suite-3
tests:
- file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  name: refuses releaseRevisionDirectly's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  proves: Criterion 1 (releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision, the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE, and never the persistence layer's own unguarded write method called directly), and the task's UNDERDETERMINED note that the release must be allowed to propagate or fail rather than be swallowed. Releases one fixture hypothesis-revision through releaseRevisionDirectly, then calls it again against the same now-released revision and asserts the rejection is an instance of HypothesisRevisionNotDraftAtReleaseError.
  fails_when: releaseRevisionDirectly is implemented as a raw SQL UPDATE against hypothesis_revisions, or as a direct call to the persistence layer's own unguarded releaseHypothesisRevision write, or wraps the guarded operation's call in a try/catch that swallows the refusal — in every one of these cases the second call resolves instead of rejecting.
- file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, even after an ordinary DELETE against those exact rows is attempted
  proves: Criterion 2 (running this file's own full test suite continues to pass with every existing assertion unchanged), for this pre-existing test. Its body and expected values are untouched by this task — only releaseRevisionDirectly's internal implementation and the file's import list changed — and this test's two calls release a revision that is still draft at the moment of the call, so the newly guarded operation's own-state check passes silently.
  fails_when: The routed releaseHypothesisRevision call refuses either fixture release (e.g. because the guard misreads a draft revision as non-draft), or the subsequent ReleaseOperation.release or readCase behavior changes, so either collects array no longer equals the single concept given to that hypothesis.
- file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  name: releases a new draft that inherits an earlier released version's own manifest without refusing through the structural collects-no-concept problem, even though an ordinary DELETE against the inherited revision's own collects row was already attempted
  proves: Criterion 2, for this second pre-existing test. Its body is likewise untouched by this task, and its one call to releaseRevisionDirectly releases a revision that is still draft at that point, so the routed guard passes and the test's original resolves/manifest assertions still hold.
  fails_when: The routed releaseHypothesisRevision call refuses the fixture's one release, or the subsequent release-of-version-2 call rejects instead of resolving, or the inherited manifest entry's collects no longer equals the single concept the fixture gave it.
not_applicable:
- edge_case: Absent or empty input to releaseRevisionDirectly
  why: Its three parameters are always supplied from typed values the fixture itself just created; no caller in this file can reach it with an absent or empty argument, and no criterion asks this fixture helper to validate its own callers.
- edge_case: A boundary at either end of a numeric range
  why: A revision number is an opaque identifier returned by the store, not a bounded range this task's criteria constrain.
- edge_case: An empty collection returned where one is expected
  why: releaseRevisionDirectly returns Promise<void>; no collection is returned by the behavior this task's criteria describe.
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: This task changes which internal operation the fixture calls, not how the database connection itself is wired or recovers; dependency-failure handling belongs to the guarded operation's own unit coverage (release-hypothesis-revision.operation.spec.ts), which this task does not touch.
- edge_case: Two operations against one subject at once (concurrency)
  why: No criterion here states a concurrency guarantee for releaseRevisionDirectly, and the guarded operation's own concurrency behavior is already covered outside this file; this task only routes an existing fixture call through that operation, sequentially, exactly as its two call sites already do.
untested:
- The REMAINDER note that rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's HTTP-409 clause is not exercised here is the task's own scope statement, not an absence in this proof — the binder assigned that clause to the task exposing release-hypothesis over HTTP, and no criterion of this task calls for a test crossing HTTP.
- Likewise, the REMAINDER note that the same rule's refusal-carries-no-further-value clause is not exercised here belongs to the task delivering or exposing the release-hypothesis refusal itself; this fixture never inspects a refusal payload beyond its identity, and no criterion here asks it to.
---
## What it is

One new test proving releaseRevisionDirectly now enforces the release guard (refuses a second release of an already-released revision), plus the file's two pre-existing tests cited as proof that the routed rewrite left every existing assertion unchanged.

## Notes

run/manifest-collects-survive-release-duplication-corrective-route-through-the-declared-lifecycle-operation-suite failed with cause setup: the test-database connection (10.252.4.205:30671) timed out before any test ran.
run/manifest-collects-survive-release-duplication-corrective-route-through-the-declared-lifecycle-operation-suite-2 failed with the same cause setup, the same connection still unreachable.
run/manifest-collects-survive-release-duplication-corrective-route-through-the-declared-lifecycle-operation-suite-3 passed once the test database was reachable again, with no source or test change between attempts.
