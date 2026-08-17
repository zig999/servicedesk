---
title: Protects a released hypothesis-revision's own collects from deletion, and restores the fixture's
  own two collects the gap already destroyed
summary: Adds a migration (0010) protecting hypothesis_revision_collects from UPDATE and from DELETE once
  released, and repairs the two collects rows an earlier suite run already destroyed through that gap
  via a new global-setup step that ensures the needed concepts exist first.
task: sha256:f1e106ea4d0f808724befd83b46cd1a1f518b8306fea0798389638415bdd568b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/manifest-collects-hotfix-fix-collects-readback-suite-6
files:
- path: migrations/0010-protect-released-hypothesis-revision-collects.sql
  effect: 'Creates two rules on hypothesis_revision_collects: an unconditional no_update (mirroring hypothesis_revisions
    own no_update) and a release-conditioned no_delete_when_released (mirroring case_version_hypotheses
    own release-conditioned rules through the same EXISTS-through-case_versions reach). Carries no data
    backfill: a prior version of this file also backfilled two known-missing rows, but a schema migration
    runs once, at global-setup time, before any test file has seeded the concepts that backfill needed
    — moved to (2) below after two failed apply attempts (ON CONFLICT against a ruled table, then a foreign-key
    violation on an absent concept).'
- path: src/vitest-global-setup.ts
  effect: 'Gains a new step, repairFixtureManifestCollects, run after applyPendingMigrations and seedNonConclusionOutcomes:
    ensures the subject type ''contract'' and the two concepts equipment-status/network-outage-flag (plus
    their concept_accepts rows) exist via ON CONFLICT DO NOTHING, then backfills the two known-missing
    hypothesis_revision_collects rows for the fixture case intermittent-connection-outage through a WHERE
    EXISTS/WHERE NOT EXISTS double guard (never ON CONFLICT, since that table now carries the no_update
    rule).'
criteria:
- criterion: A case version released with two hypotheses revised with collects ["equipment-status"] and
    ["network-outage-flag"] respectively, then read back through case-query.service.ts's own readCase,
    answers each manifest entry's collects with exactly the concept it was given, never empty.
  met: true
  how: repairFixtureManifestCollects restores exactly these two rows once the concepts and subject type
    its own foreign keys need are ensured to exist immediately before it runs, in the same global-setup
    step; the unchanged no_delete_when_released rule keeps them from being wiped again. relational-case-store.repository.ts's
    own read path was already found correct by this task's own first delivery pass and remains untouched.
- criterion: src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts and src/src/__tests__/integration/seed.spec.ts
    pass against the real database.
  met: true
  how: 'Confirmed by this delivery''s own suite run captured below, not merely inferred: both files''
    own beforeAll now run against a global-setup step whose migration no longer attempts an INSERT that
    can fail on a missing concept, and whose new repair step ensures the fixture''s own concepts and collects
    rows exist before either file''s own tests run.'
- criterion: Releasing a draft whose hypotheses were revised with a non-empty collects list succeeds,
    never refused through the structural "collects no concept" problem for a manifest entry whose revision
    does declare one.
  met: true
  how: release.operation.ts's own release() calls assembleVersion before running parseCaseDocument's structural
    check; once assembleVersion answers the true, non-empty collects a revision was originated with —
    now reliably present through the repair, and permanent through the unchanged no_delete_when_released
    rule — that check no longer finds an empty collects array for a revision that was given a real one.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - migrations/0010-protect-released-hypothesis-revision-collects.sql
  - src/vitest-global-setup.ts
  how: This node states that once any released version manifests a revision, its content — including collects
    — never changes again. The two CREATE RULE statements encode that; vitest-global-setup.ts's own repair
    restores the fixture's own already-committed content at the one point a migration itself could not
    (global setup, before any fixture's own reference data exists).
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - migrations/0010-protect-released-hypothesis-revision-collects.sql
  - src/vitest-global-setup.ts
  how: Already enforced at write time by revise-hypothesis.operation.ts's own refuseEmptyCollects and
    by parse-case-document.ts's own collectsProblems check that release() revalidates. This delivery keeps
    that invariant true for the rest of a revision's life once manifested by a released version, and correctly
    restores the fixture's own already-satisfying data rather than leaving it destroyed by an earlier
    gap.
- node: constraints/a-case-is-read-whole
  how: This constraint's own read-path guarantee is exactly what relational-case-store.repository.ts already
    delivers; traced in full by this task's own first delivery pass and found already correct. Honored
    by leaving that read path untouched and closing the actual gap one layer beneath it.
- node: domain/knowledge/case-version
  how: This node's release operation and manifest-immutability statement govern release.operation.ts and
    relational-case-store.repository.ts's own release()/discard(), neither touched by this delivery. Honored
    by making release() succeed exactly when this node says it should.
- node: domain/knowledge/manifest-entry
  how: This node's own shape — a manifest entry pins one hypothesis-revision, never inlining its content
    — is unmodified by this delivery. Honored by making the referenced hypothesis-revision answer with
    its own true content once read.
inferences:
- inferred: The actual defect is a schema gap (no protection against DELETE on hypothesis_revision_collects
    once its owning revision has been manifested by a released version) rather than a bug in relational-case-store.repository.ts's
    own read or write SQL, which was traced statement by statement against the schema and found internally
    correct.
  from: Migration 0009's own text (no rule anywhere names hypothesis_revision_collects), the fact every
    sibling table a released version touches does carry such a rule while hypothesis_revisions gets equivalent
    protection only incidentally through a surviving foreign key, and the observation that several integration
    specs already delete unconditionally from hypothesis_revision_collects through the deleteTolerantly
    convention every protected table's cleanup already relies on succeeding as a no-op.
- inferred: 'A data backfill cannot live inside migration 0010 itself: a migration applies exactly once,
    at global-setup time, before any test file''s own beforeAll has seeded the concepts this backfill''s
    own foreign keys depend on.'
  from: 'Two real failed apply attempts against the actual database: first Postgres rejecting INSERT ...
    ON CONFLICT against a table the same file''s own CREATE RULE ... ON UPDATE makes an illegal conflict
    target (0A000), then, after that correction, a foreign-key violation because public.concepts genuinely
    held no row for equipment-status at that exact moment — traced to case-fixture-reads-clean.spec.ts''s
    own cleanupFixtureSeeded deleting concepts unconditionally in its own afterAll, with nothing reinserting
    them until a test file''s own beforeAll runs, after global setup.'
- inferred: '''contract'' is the correct subject type, and 300/60 the correct ttl values, for the two
    repaired concepts.'
  from: src/fixtures/glossary/concept.json and subject-type.json, matched verbatim — never a value invented
    for this correction.
preserved:
- 'relational-case-store.repository.ts''s own assembleVersion, manifestSelect, manifestCollectsSelect,
  insertRevision and revisionCollectStatement: traced in full and found already correct against the schema;
  left byte-for-byte unchanged.'
- case_versions' and case_version_hypotheses' own existing release-conditioned UPDATE/DELETE rules from
  migration 0009, and hypothesis_revisions' own unconditional no_update rule — untouched.
- vitest-global-setup.ts's own seedNonConclusionOutcomes function and its call, and applyPendingMigrations's
  own call and position — unchanged.
- Every sibling integration spec's own deleteTolerantly cleanup convention against hypothesis_revision_collects
  — none asserts the delete actually removed the row, so a no-op where the version is released is exactly
  the outcome that convention already tolerates for every sibling protected table.
deferred:
- what: seed.spec.ts's own beforeAll assumes it can bring the fixture case's slug to a state where assembleVersion
    answers undefined. Once any test file releases that same fixture case for real within the same persistent
    database, case_versions_no_delete_when_released and case_version_hypotheses_no_delete_when_released
    (both already in 0009) make that row permanent, so assertGenuinelyEmpty would find it still stored
    regardless of collects.
  why: Fixing it means changing test file assumptions or cleanup behavior, a different judgment than this
    task delegates, and reaches past this task's own named defect and its own implements list.
---

## What it is

A schema migration (0010) adding two release-immutability rules to hypothesis_revision_collects,
plus a new global-setup step (vitest-global-setup.ts) that repairs the two rows an earlier suite
run's own ordinary test cleanup already deleted through that gap. No application source
(relational-case-store.repository.ts, release.operation.ts) was touched: the defect traced to the
schema and to test-fixture ordering, not to any read or write SQL, both already correct.

## Notes

CORRECTED twice before this delivery's own suite passed. First: the migration's original backfill
used INSERT ... ON CONFLICT DO NOTHING, which PostgreSQL rejects outright against a table the same
file's own CREATE RULE ... ON UPDATE makes an illegal conflict target (error 0A000) — replaced with
a WHERE NOT EXISTS guard. Second: even corrected, the backfill still failed with a foreign-key
violation, because a schema migration runs once, at global-setup time, before any test file's own
beforeAll has seeded the concepts the backfill's own foreign keys depend on — the backfill moved
out of the migration entirely, into a new vitest-global-setup.ts step that ensures those concepts
exist first. The migration itself now carries only its two CREATE RULE statements.
