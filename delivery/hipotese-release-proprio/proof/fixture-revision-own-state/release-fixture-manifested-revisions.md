---
title: Fixture and seed setup writes each manifested hypothesis-revision's own released state
summary: New integration tests query hypothesis_revisions and hypothesis_revision_collects directly after
  the canonical fixture builder, the seed script and release.operation.ts run, proving the own-state write
  lands where the objective requires it and nowhere else.
implementation: sha256:a4c257773bc92e0d23f79b539c4e622196fd9169b3523d68d9116a1257a7b8b8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: reads back every hypothesis-revision the released case version's manifest references with its
    own state released
  proves: Criterion 1 — after the canonical fixture setup runs, every hypothesis-revision row referenced
    by a manifest entry of a case version in released state reads back with its own state released.
  fails_when: releaseManifestedRevisions is never called (or targets the wrong rows) after insertFixtureCase's
    lifecycle.release(...), so the join returns zero rows or a row whose state is still 'draft'.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: reads every manifest entry's revision back collecting at least one concept
  proves: Criterion 3 — the canonical fixture case reads back as a complete validated case version, with
    every manifest entry's revision collecting at least one concept.
  fails_when: any manifested revision's collects were emptied by cleanup or never written, so readCase
    either throws CaseNotValidError or returns a hypothesis whose collects array is empty.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: leaves every manifested hypothesis-revision's own collects in place after an ordinary DELETE against
    those exact rows is attempted
  proves: Criterion 4 — an attempt to remove the collects of a fixture revision that a released case version
    manifests leaves those collects in place.
  fails_when: the manifested revision's own state is not 'released' (or migration 0021's protection does
    not hold against it), so the DELETE actually removes the row.
- file: src/__tests__/integration/seed.spec.ts
  name: leaves every hypothesis-revision the released version's manifest references with its own state
    released, once seed.ts has run
  proves: Criterion 2 — after the seed script runs, every hypothesis-revision row referenced by a manifest
    entry of a case version in released state reads back with its own state released.
  fails_when: seedCase never calls releaseManifestedRevisions after lifecycle.release(...) (or calls it
    against the wrong rows), so the join returns zero rows or a row still reading 'draft'.
- file: src/__tests__/integration/case/release.operation.spec.ts
  name: leaves a manifested hypothesis-revision's own state exactly as it read before release, once release()
    succeeds
  proves: Criterion 5 — src/case/release.operation.ts writes no hypothesis_revisions state, and the released
    state is reached through the fixture and seed setup alone.
  fails_when: release.operation.ts (directly or through caseStore.release) writes hypothesis_revisions.state
    for the manifested revision.
not_applicable:
- edge_case: Concurrent writers racing to build the canonical fixture case or run the seed script at once.
  why: insertFixtureCase and seedCase are both guarded by a pre-existing idempotency check that this task
    did not introduce and does not change; the task's own criteria concern the state value written on
    a single setup run.
- edge_case: Running the seed script or the fixture setup a second time against an already-seeded database.
  why: already covered by pre-existing, unmodified tests; the second run skips seedCase/insertFixtureCase
    entirely via the existing idempotency guard.
- edge_case: A persistent test database that already holds the canonical fixture case with its collects
    already emptied by a run of the unfixed setup.
  why: named explicitly in the implementation record's own deferred entry as outside what source alone
    can address; this was in fact hit and resolved by a one-time manual SQL repair alongside this delivery,
    not by a test this task could write.
untested:
- 'The inference that manifest-collects-survive-release.spec.ts needed the identical direct-SQL state
  write added to its own two tests is not exercised by a new test here: that file''s own two pre-existing
  collects-survive assertions (unmodified by this delivery) already cover exactly this claim, and they
  are part of the captured run''s passing evidence.'
- The inference that a local, per-file RELEASED_REVISION_STATE constant is the right form is a naming/style
  choice with no observable effect on behavior; no test can distinguish it from importing a shared enum
  without asserting on source text rather than behavior.
- Criterion 6 (the five listed integration specs keep passing with no assertion removed or relaxed) is
  not proven by a new test written here — proving it means re-running the suite, which only the captured
  run evidences; that run shows all five passing.
divergences:
- from: the expectation that a delivery's captured run passes against a database whose state this delivery's
    own code fix alone accounts for
  departure: The captured run (run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite)
    only passes because of a one-time manual SQL repair against the shared, persistent test database's
    pre-existing corrupted fixture rows (both intermittent-connection-outage hypothesis-revisions' own
    state moved from draft to released via a direct UPDATE), done alongside this delivery, not by the
    code fix alone. Against a genuinely fresh database the code fix (releaseManifestedRevisions in the
    fixture builder and in seed.ts) is sufficient on its own; against this specific already-corrupted
    persistent database, the fix alone would not have repaired the already-stored rows, matching the implementation
    record's own deferred entry.
  why: Disclosed because the tests written here assert directly against hypothesis_revisions.state and
    hypothesis_revision_collects for that exact persistent fixture case, and their passing in the captured
    run depends on that manual repair having already happened rather than on this task's source change
    alone.
---

## What it is

New integration tests query `hypothesis_revisions` and `hypothesis_revision_collects` directly after the canonical fixture builder, the seed script and `release.operation.ts` run, proving the own-state write lands where the objective requires it and nowhere else.

## Notes

Disclosed divergence: the captured run's own-state fixture data depended on a one-time manual SQL repair against the shared persistent test database's pre-existing corrupted rows, alongside this delivery — the code fix alone is sufficient against a fresh database.
