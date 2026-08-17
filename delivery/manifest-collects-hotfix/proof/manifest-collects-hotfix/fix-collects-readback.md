---
title: 'Proof for fix-collects-readback, corrected again: diagnose-server.factory.spec.ts''s own afterAll
  hook timeout raised'
summary: Holds the same six tests against migration 0010 and the global-setup repair step, and additionally
  rewrites seed.spec.ts's own cleanupSeededRows to route every DELETE through the file's own already-established
  deleteTolerantly helper, closing a real, reproduced foreign-key violation on hypothesis_revisions that
  the no_delete_when_released rule now causes there, and raises diagnose-server.factory.spec.ts's own
  afterAll hookTimeout to give its teardown headroom under the full suite's accumulated load.
implementation: sha256:5e14a0f59ae64b9b02274f82c5f3e644bc5ee2a024726162cb3017aae371806a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/manifest-collects-hotfix-fix-collects-readback-suite-6
tests:
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: removes a hypothesis-revision's own collects row on an ordinary DELETE where its revision belongs
    only to a still-draft case version's manifest
  proves: the no_delete_when_released rule migrations/0010 adds is release-conditioned, not a blanket
    DELETE refusal
  fails_when: the rule's own WHERE EXISTS/state='released' condition is widened (or dropped) so a still-draft
    revision's collects survive an ordinary DELETE it should not
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: leaves a hypothesis-revision's own collects row present after an ordinary DELETE attempts to remove
    it, where its revision belongs to a released case version's manifest
  proves: migrations/0010's own hypothesis_revision_collects_no_delete_when_released rule
  fails_when: the rule is removed, weakened, or its EXISTS reach through case_version_hypotheses/case_versions
    stops matching a genuinely released version
- file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  name: leaves a hypothesis-revision's own collects row naming its original concept after an ordinary
    UPDATE attempts to change which concept it names
  proves: hypothesis_revision_collects_no_update, unconditional
  fails_when: an UPDATE actually changes the stored concept_name
- file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty,
    even after an ordinary DELETE against those exact rows is attempted
  proves: criterion 1
  fails_when: readCase answers either hypothesis's collects as empty or wrong after the deliberate direct
    DELETE
- file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  name: releases a new draft that inherits an earlier released version's own manifest without refusing
    through the structural 'collects no concept' problem, even though an ordinary DELETE against the inherited
    revision's own collects row was already attempted
  proves: criterion 3
  fails_when: releasing the second version is refused with a structural collects-problem, or reads back
    empty collects for the inherited revision
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: resolves without rejecting when the suite's own global setup runs a second time, proving its own
    repair step guards its insert rather than relying on running exactly once
  proves: repairFixtureManifestCollects is safe to run more than once against an already-migrated, already-seeded,
    already-repaired database
  fails_when: a second call to setup() rejects — an INSERT ... ON CONFLICT against a ruled table (0A000),
    or a bare duplicate INSERT without the WHERE NOT EXISTS guard (23505)
not_applicable:
- edge_case: absent or empty boundary input
  why: this task ships a schema migration and a global-setup step, neither reached through any request
    or API boundary
- edge_case: a numeric or size boundary at either end of a stated range
  why: no criterion of this task states a range
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: the one dependency here is the same PostgreSQL connection every sibling integration test already
    reaches through; the general handling is proven by pre-existing tests answering a different task
- edge_case: two operations against one subject at once (a concurrent release racing the DELETE these
    rules guard against)
  why: no criterion states concurrent behavior, and this delivery touches no code path that could create
    or resolve such a race
- edge_case: a collects row belonging to a revision manifested by no case version at all, or by more than
    one
  why: both collapse into the same WHERE EXISTS branch the two kept DELETE tests already exercise
untested:
- Whether the two specific rows the implementation names as historically destroyed are, right now, genuinely
  present in the real, persistent test database because repairFixtureManifestCollects restored them —
  as opposed to having simply never been deleted this time. The fix's own corrective effect (as opposed
  to its mechanical idempotency, which the new test does prove) cannot be independently re-demonstrated
  by any test written after the fact.
- Whether case-fixture-reads-clean.spec.ts and seed.spec.ts (criterion 2) currently pass against the real
  database. seed.spec.ts was, this pass, rewritten — cleanupSeededRows now tolerates the exact foreign-key
  violation reproduced directly against the real database — but that correction's own effect (afterAll
  completes without throwing) is provable only by the real, captured suite run, never by a test written
  here. case-fixture-reads-clean.spec.ts was not touched at all and this record still relies on the
  delivery's own captured, passing suite run for it.
- The implementation's own deferred note about seed.spec.ts's assertGenuinelyEmpty and migration 0009's
  release-immutability rules on case_versions/case_version_hypotheses — a fact about database history
  no test here settles, and out of this task's own scope.
- Whether raising diagnose-server.factory.spec.ts's own afterAll hookTimeout to 30000ms actually stops
  the "Hook timed out in 10000ms" failure from recurring when the full, 89-file suite is run twice in
  a row. The failure was accumulated latency under that full-suite load, reproduced directly once; no
  test written after the fact can re-demonstrate absence of a timing failure that depends on 88 other
  files' own load against the same pooled connection — only the caller's own next captured full-suite
  run settles it.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is also configured, which this schema-only
    suite has no use for.
- cites: TST-04
  file: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  departure: the file is named for the migration artifact rather than mirroring a TypeScript path.
  why: the unit under test is a .sql file outside src/src entirely, so there is no single TypeScript path
    to mirror.
- cites: STK-08
  file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is also configured too, which this file
    has no use for.
- cites: TST-04
  file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  departure: the file is named for its own scenario rather than mirroring one TypeScript unit's path.
  why: the scenario exercises RelationalCaseStore, ReleaseOperation and CaseQueryService together and
    mirrors none of them alone.
---

## What it is

Six tests across three files: three proving migrations/0010's own two schema rules directly, two
proving the application-level acceptance criteria against the real database, and one proving
vitest-global-setup.ts's own new repair step is idempotent.

## Notes

REWRITTEN once: an earlier pass of this proof wrote three tests asserting migration 0010 itself
performed a data backfill (idempotent via ON CONFLICT, guarded against an absent owning revision).
The implementation moved that backfill out of the migration entirely, into a new
vitest-global-setup.ts step, after two failed real-database apply attempts. Those three tests are
dropped; one new test proves the new step's own idempotency instead.

CORRECTED once more: running the real suite surfaced that seed.spec.ts's own cleanupSeededRows
issued a bare DELETE against hypothesis_revisions with no error tolerance, which now fails with a
real foreign-key violation once the sibling DELETE against hypothesis_revision_collects becomes a
silent no-op for a released version (this task's own new rule). Rewrote cleanupSeededRows to route
every one of its own DELETE statements through the file's own already-established deleteTolerantly
helper, exactly mirroring the sibling function wipeFixtureOwnedRows already in the same file. No new
test was added for it: no assertion in the file exercises this teardown helper directly, and this
delivery holds no shell to independently re-run the suite and confirm — the caller's own captured
run is what settles it.

CORRECTED a third time: running the real, full suite (89 files) twice in a row showed
diagnose-server.factory.spec.ts's own afterAll — which now also deletes from the
release-protected hypothesis_revision_collects table this task added protection to — failing with
"Hook timed out in 10000ms" (vitest's default hookTimeout), even though that same file in
isolation passes cleanly in ~80s with no lock found in pg_stat_activity/pg_locks while reproducing
directly: accumulated latency under the full suite's load against the one pooled Neon connection,
not a deadlock or a defect in this task's own new schema rule. Raised that one hook's own timeout
to 30000ms, using the plain per-hook-argument mechanism seed.spec.ts's own beforeAll/afterAll
already establish elsewhere in this same suite (60000ms there), rather than inventing a second
convention. No new test was added and none of the six above changed: a hook timeout value is
test-infrastructure calibration, not new behavior under test, and no assertion could observe
"completes within N milliseconds under 88 other files' own accumulated load" without the test
itself becoming a timing measurement of the shared database connection rather than of this task's
own behavior. This delivery holds no shell to independently re-run the full suite twice and
confirm the hang stops recurring — the caller's own captured run is what settles that, exactly as
the second correction above already relies on it for cleanupSeededRows.
