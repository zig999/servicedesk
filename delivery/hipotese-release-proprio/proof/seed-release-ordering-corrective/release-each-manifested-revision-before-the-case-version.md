---
title: Seed script releases manifested revisions before the case version
summary: Tests over seed.ts (integration) and its source (unit) prove the corrected release order no longer throws CaseVersionNotReleasableError, that every manifested revision and the case version itself read back released, that no raw SQL writes hypothesis_revisions.state, and that a further run leaves the already-released manifest untouched.
implementation: sha256:5dcf16c108d841f480a0cc89957c480be3e8902557ff821349a10ee24f1dd5c3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/seed-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-suite-3
tests:
- file: src/__tests__/integration/seed.spec.ts
  name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it beforehand
  proves: Criterion 1 — running seed.ts against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError. This test (and every other test in the file) depends on the file's beforeAll, which wipes the fixture's own rows, asserts the database is genuinely empty of them, and then runs seed.ts once — the exact reproduction scenario.
  fails_when: seedCase() reverts to releasing the case version before releasing its manifested hypothesis-revisions (or otherwise throws CaseVersionNotReleasableError), causing beforeAll to reject; every test in this file is then reported as failed by a beforeAll hook failure rather than by its own assertion.
- file: src/__tests__/integration/seed.spec.ts
  name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
  proves: Criteria 2 and 3 — every hypothesis-revision the seeded case version's manifest references reads back with its own state released, and the seeded case version itself reads back with its own state released.
  fails_when: releaseManifestedRevisions is never called, is called against the wrong rows, or runs after lifecycle.release instead of before it, so the join returns zero rows or a row whose state reads back as anything other than 'released'; or lifecycle.release(fixture.slug, draft.version) never runs, or the case version's stored state is not 'released' once seed.ts has run.
- file: src/__tests__/unit/seed.spec.ts
  name: writes no raw SQL statement that sets hypothesis_revisions.state
  proves: Criterion 4, first clause — seed.ts contains no raw SQL statement writing hypothesis_revisions.state.
  fails_when: seed.ts's source text once again contains an UPDATE hypothesis_revisions SET state statement, whether reintroduced in releaseManifestedRevisions or anywhere else in the file.
- file: src/__tests__/unit/seed.spec.ts
  name: releases each manifested revision by calling lifecycle's own releaseHypothesisRevision operation
  proves: Criterion 4, second clause — each manifested revision's release is performed by calling lifecycle.releaseHypothesisRevision.
  fails_when: seed.ts's source text no longer contains a call to lifecycle.releaseHypothesisRevision(...).
- file: src/__tests__/integration/seed.spec.ts
  name: resolves without rejecting when seed.ts is run a second time against a database it has already seeded
  proves: Criterion 5, first clause — running seed.ts a second time against a database it has already seeded resolves without rejecting.
  fails_when: runSeedScript(2) rejects — e.g. because alreadySeeded()'s guard fails to detect the existing version and seedCase() re-enters a path that a non-draft or already-released state refuses.
- file: src/__tests__/integration/seed.spec.ts
  name: holds no second case version, having run seed.ts a second time in a row against the version it already released
  proves: Criterion 5, second clause — running seed.ts a second time creates no second case version.
  fails_when: a second, distinct case_versions row for (SLUG, VERSION + 1) is created by the second run.
- file: src/__tests__/integration/seed.spec.ts
  name: leaves every manifested hypothesis-revision with exactly the revision number and state it already read, having run seed.ts yet again against the case version it already released
  proves: The UNDERDETERMINED entry in the task's Notes — that a second-run implementation which re-upserts the fixture's manifest onto the already-released case version would satisfy criterion 5 as written while violating a-case-version-is-written-once.
  fails_when: a further run of seed.ts creates a new hypothesis-revision row or alters an existing revision's own state, so the second snapshot differs from the first.
not_applicable:
- edge_case: Concurrent writers racing to run the seed script at once.
  why: seedCase() is guarded by alreadySeeded(), a pre-existing idempotency check this task did not introduce and does not change; this task's own criteria concern the release order within a single run, not concurrent access to it.
- edge_case: A manifest with zero entries.
  why: The fixture case manifests two hypotheses, and no criterion of this task asks for behavior over an empty manifest.
- edge_case: A dependency (the database) failing or answering slowly mid-loop over the manifested revisions.
  why: This task changes only the order in which existing calls happen inside seedCase(); it introduces no new failure-handling requirement.
untested:
- The implementation record's inference that releaseManifestedRevisions's per-revision call order carries no ordering guarantee beyond 'before the case version's release,' because release.operation.ts's manifestOwnStateViolations checks each manifest entry's own current state independently. Proving this fully means exercising that independent, per-entry check — release.operation.ts's own mechanism, delivered and proven by the sibling case-version-release-gate task, not this task's own file.
---

## What it is

Tests over seed.ts (integration and unit) proving the corrected release order, the removal of the raw-SQL bypass, and the second-run idempotency guard.

## Notes

Two earlier suite attempts failed with cause: setup — a stale, corrupted shared canonical fixture left over from suite runs captured before this task's own fix and its sibling corrective deliveries existed. Cleaned as part of the sibling case-fixture-reads-clean-collects-delete-corrective delivery; this suite run (suite-3) is the first captured against a genuinely clean fixture and passed in full (1876/1876).
