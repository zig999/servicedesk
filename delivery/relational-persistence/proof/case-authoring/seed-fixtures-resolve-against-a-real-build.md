---
title: Seed's FIXTURES_ROOT resolves against what a real build actually produces
summary: Two new unit tests read seed.ts's own currently-declared FIXTURES_ROOT segment and apply Node's
  real URL/fileURLToPath resolution from the fixed path a real npm run build always places its compiled
  entry point at, proving the fix removes the ENOENT the pre-fix constant produced there — without spawning
  tsc or a shell — while the task's rerun criterion is left to the pre-existing, unmodified integration
  test that already proves it.
implementation: sha256:224dac5534652983b0316b1abe4da9b193166be82c820129c16d73d8790bb131
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
tests:
- file: src/__tests__/unit/seed.spec.ts
  name: FIXTURES_ROOT resolves, from the fixed path a real build places seed.js at, to the exact directory
    the fixtures are actually committed in
  proves: Criteria 1 and 2 of task/case-authoring/seed-fixtures-resolve-against-a-real-build ("npm run
    build followed by npm run seed exits 0" and "the seed step reads every fixture it needs ... because
    the project's own build step placed them where the compiled seed script looks"), together with the
    implementation record's own disclosed inference that fixtures are resolved directly against the source
    tree rather than through a build step that copies src/fixtures/** into dist/fixtures.
  fails_when: seed.ts's own FIXTURES_ROOT segment stops being '../src/fixtures' relative to the compiled
    file's own directory — including the pre-fix './fixtures', which this test computes as resolving to
    <package-root>/dist/fixtures rather than the real, committed <package-root>/src/fixtures, or a segment
    that resolves anywhere else a copy step might have populated instead of the source tree itself.
- file: src/__tests__/unit/seed.spec.ts
  name: reads every fixture the seed step needs — the five glossary vocabularies, the concept and capability
    registrations, and the curated case — through that same built-location resolution, matching the real
    committed content exactly
  proves: Criterion 2 of task/case-authoring/seed-fixtures-resolve-against-a-real-build, read literally
    against the eight files it names (outcome.json, subject-type.json, subject-attribute.json, action.json,
    recipient.json, concept.json, capability.json, case/intermittent-connection-outage/1.json).
  fails_when: 'any one of those eight files becomes unreadable, or reads back with content different from
    the real committed fixture, when read through the location seed.ts''s own current FIXTURES_ROOT segment
    resolves to from the fixed path a real build places its compiled entry point at — reproducing the
    reported failure directly: against the pre-fix ''./fixtures'' segment, the very first read in this
    test (glossary/outcome.json under <package-root>/dist/fixtures) throws ENOENT, the exact error the
    task''s own intake captured.'
- file: src/__tests__/integration/seed.spec.ts
  name: resolves without rejecting when seed.ts is run a second time against a database it has already
    seeded
  proves: 'Criterion 3 of task/case-authoring/seed-fixtures-resolve-against-a-real-build ("Running npm
    run seed a second time against a database that already holds the curated case still exits 0, unchanged
    from the idempotency alreadySeeded already provides"). This test predates this task, is unmodified
    by it, and already exercises the full real sequence (alreadySeeded''s gate and seedCase''s catch of
    CaseVersionAlreadyStoredError) against a real database — this task''s own implementation record lists
    both as untouched ("preserved"), and this task''s own Notes state the criterion is "unchanged from
    the idempotency alreadySeeded already provides", so no new test is written for it: its proof is in
    the test that already exists.'
  fails_when: a second run of seed.ts rejects instead of resolving — e.g., alreadySeeded() stops gating
    the whole seeding sequence, or seedCase() stops catching CaseVersionAlreadyStoredError — which this
    fix's own one-line, FIXTURES_ROOT-only change has no bearing on.
not_applicable:
- edge_case: two builds or two seed runs against one subject at once (concurrency)
  why: this task changes one constant computed synchronously and statelessly from the module's own import.meta.url;
    no criterion or specification node this task touches states a concurrent-access guarantee, and whatever
    idempotency behavior exists under concurrency is unchanged by this fix and untouched by its own criteria.
- edge_case: a dependency that fails, is unavailable, or answers slowly
  why: this fix introduces no new dependency and no new I/O; FIXTURES_ROOT is derived purely from URL
    arithmetic over the module's own static import.meta.url, with no network, database or filesystem call
    involved in computing it.
- edge_case: absent or empty input, and a boundary at each end of a range
  why: the change has no input parameter and no numeric or size-bounded value; FIXTURES_ROOT is a constant
    derived from a fixed relative segment and the module's own location, neither of which can be "empty"
    or "absent" in a way any criterion here addresses.
- edge_case: a duplicate where uniqueness is claimed, or an empty collection where one comes back
  why: no criterion of this task makes a uniqueness or collection-emptiness claim; the task is exclusively
    about where a path resolves to, not about the shape or cardinality of what is read once resolution
    succeeds.
untested:
- 'Criterion 1''s own literal wording — npm run build followed by npm run seed, spawned as real OS processes,
  exiting 0 — is not exercised by any test here: writing that test requires a shell to invoke tsc and
  node, which a test-author does not hold. The two new unit tests instead prove the specific path-resolution
  fact whose failure was the reported ENOENT, using Node''s own URL/fileURLToPath primitives applied to
  the fixed path a real build''s outDir/rootDir configuration (tsconfig.build.json) always produces, without
  requiring dist/seed.js to exist on disk.'
- Whether a real npm run build's compiled dist/seed.js, once actually produced and run end-to-end as a
  Node process, also resolves its sibling compiled imports (config/env.js, the factory modules, persistence
  modules) cleanly at runtime — untouched by this one-line fix, not newly at risk from it, and not exercised
  by any test in this record.
- 'The claim, stated in the implementation record''s own files[].effect ("the identical directory, because
  dist/ and src/ sit exactly one level below the package root"), that the built-location and the uncompiled-location
  resolutions land on the same directory: this record''s two new tests prove the built-location half directly,
  and the uncompiled-location half is already exercised by the pre-existing, unmodified src/__tests__/integration/seed.spec.ts
  (which imports seed.ts directly and reads real fixtures successfully), but no test in either file asserts
  the two computed paths are literally equal to each other in one place.'
---

## What it is

The proof that task/case-authoring/seed-fixtures-resolve-against-a-real-build's fix actually removes the reported ENOENT, and that it does so by resolving to the real, committed fixtures directory rather than to some other path a copy step might have populated.
The rerun criterion needs no new test: the pre-existing integration suite already exercises the idempotency this one-line change leaves untouched.

## Notes

The two new unit tests read seed.ts's own source text for its current FIXTURES_ROOT segment rather than importing it, because seed.ts exports nothing and runs its whole sequence at module-evaluation time — the same constraint migrate.spec.ts already works under for migrate.ts.
Criterion 1's literal wording (spawning npm run build and npm run seed as real processes) stays untested here, listed under untested above, because a test-author holds no shell; the manual verification already run in this conversation (npm run build && npm run seed exiting 0 against the real Neon database) is conversation history rather than a captured, reviewable run, so it answers nothing this record can point at.
