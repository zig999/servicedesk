---
title: Retitled tests and the guarded release-write substitution in revise-hypothesis.operation.spec.ts
summary: Confirms the two corrected test titles now name their own bodies' governing conditions, adds one new test proving releaseHypothesisRevisionOwnState's substitution actually enforces the guard, and cites the file's own unchanged full suite for continued passing.
implementation: sha256:b80e8f9031fc9a79c53962cb8b3b60dcb3364221cacabb971915f97c6167f9c7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-fixture-corrective-correct-titles-and-release-write-duplication-suite
tests:
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision's own state is draft
  proves: Criterion 1 — the retitled test names the revision's own draft state as the governing condition, matching exactly what its unchanged body exercises.
  fails_when: The it() block's title string stops naming the revision's own draft state as the governing condition — e.g. it reverts to naming a case version's reference to the revision, or the revision's released state, as the old title did.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released
  proves: Criterion 2 — the retitled test states that the revise creates the hypothesis's own next revision one past its existing highest, matching its own body's read-back of a released revision 1 and a newly created draft revision 2.
  fails_when: The it() block's title string stops stating that the revise creates the hypothesis's next revision — e.g. it reverts to asserting the revise 'creates no revision at all', which contradicts what the body inserts and asserts.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses releaseHypothesisRevisionOwnState's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  proves: Criterion 3 — that releaseHypothesisRevisionOwnState now routes through the case lifecycle's guarded releaseHypothesisRevision operation, which reads the revision's own state and refuses a non-draft release, rather than a hand-written UPDATE that would unconditionally rewrite the row. Every pre-existing call site in this file releases a still-draft revision, so without this test the substitution's guarded behavior was never exercised.
  fails_when: releaseHypothesisRevisionOwnState reverts to (or is replaced by) a raw SQL UPDATE against hypothesis_revisions, or otherwise stops consulting the revision's own state before writing — in either case the second call would silently succeed instead of rejecting with HypothesisRevisionNotDraftAtReleaseError.
untested:
- Concurrent releaseHypothesisRevisionOwnState calls against the same revision (a race between two callers) are not exercised here. This fixture file tests the wiring point (that the helper calls the guarded operation), not the guarded operation's own concurrency handling, which belongs to release-hypothesis-revision.operation's own test file, outside this task's files.
not_applicable:
- edge_case: Absent or empty input to the changed code path
  why: This task changes no input-handling code — only two test titles and a test helper's internal write mechanism.
- edge_case: A numeric or range boundary
  why: No new bound is introduced; revision numbering is decided by revise-hypothesis's own already-delivered logic, unchanged by this task.
- edge_case: An empty collection returned where one is expected
  why: No listing or collection-returning behavior is touched by this task.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness constraint is introduced or altered by this task.
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: releaseHypothesisRevisionOwnState now calls createCaseLifecycle(pool) — the same pool and pattern manifest-collects-survive-release.spec.ts's own wireLifecycle() already uses elsewhere in this suite; no new dependency is introduced.
---
## What it is

Cites the two retitled tests as proof of the title corrections, plus one new test proving the release-write substitution actually enforces the lifecycle guard rather than merely matching every existing draft-only call site.

## Notes

None.
