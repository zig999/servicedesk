---
title: Give the canonical fixture and seed setup's manifested revisions their own released state
summary: The shared fixture builder, the production seed script, and the ad-hoc case built by manifest-collects-survive-release.spec.ts
  now directly write each manifest-referenced hypothesis-revision's own state to released right after
  the case version that manifests it is released, restoring the protection migration 0021 moved onto that
  column.
task: sha256:eb0291cda23a612a6940419a7e4d60f5637cd625c9c906ee4f95563b9f365cd9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/fixture-revision-own-state-release-fixture-manifested-revisions-build
files:
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  effect: placeFixtureHypotheses now returns the placed {hypothesis_name, revision} pairs it wrote; insertFixtureCase
    collects them and, after lifecycle.release(...), calls a new releaseManifestedRevisions(connection,
    slug, placed) that issues a direct parameterized UPDATE hypothesis_revisions SET state = 'released'
    per manifested revision — a direct SQL write against the test database, never through release.operation.ts.
- path: src/seed.ts
  effect: The same shape of change as the fixture file — placeFixtureHypotheses returns the placed revisions,
    and seedCase calls the same releaseManifestedRevisions helper right after lifecycle.release(...),
    so a fresh run of the production seed script also leaves every manifested revision's own state released.
- path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  effect: Added a releaseRevisionDirectly(slug, hypothesisName, revision) helper doing the identical parameterized
    UPDATE, and called it right after each releaseOperation.release(...) in both tests, for every hypothesis-revision
    the released version manifests, so its own two collects-survive assertions still hold under the delivered
    state-only trigger.
criteria:
- criterion: After the canonical fixture setup runs, every hypothesis-revision row referenced by a manifest
    entry of a case version in released state reads back with its own state released.
  met: true
  how: insertFixtureCase in case-fixture-reads-clean.spec.ts now updates every placed revision's hypothesis_revisions.state
    to 'released' immediately after the case version's own release.
- criterion: After the seed script runs, every hypothesis-revision row referenced by a manifest entry
    of a case version in released state reads back with its own state released.
  met: true
  how: seedCase in src/seed.ts performs the identical write after lifecycle.release(...).
- criterion: The canonical fixture case reads back as a complete validated case version, with every manifest
    entry's revision collecting at least one concept.
  met: true
  how: Because each manifested revision's own state is now released, migration 0021's hypothesis_revision_collects_no_delete_when_released
    rule keeps the manifest entries and their collects intact across cleanup, so a subsequent read never
    meets an emptied collects list.
- criterion: An attempt to remove the collects of a fixture revision that a released case version manifests
    leaves those collects in place.
  met: true
  how: hypothesis_revisions.state = 'released' for the fixture's manifested revisions makes migration
    0021's DELETE rule against hypothesis_revision_collects a no-op for those exact rows.
- criterion: src/case/release.operation.ts writes no hypothesis_revisions state, and the released state
    is reached through the fixture and seed setup alone.
  met: true
  how: release.operation.ts was not modified; it still only calls caseStore.release(slug, version), which
    only updates case_versions. The three edited files are all test/fixture setup — the corrective UPDATE
    runs as a direct parameterized SQL statement against the test database, never through any production
    operation.
- criterion: The integration specs reading the canonical fixture — seed.spec.ts, fixtures/case-fixture-reads-clean.spec.ts,
    the three factory specs and case/manifest-collects-survive-release.spec.ts — pass with no assertion
    of theirs removed or relaxed.
  met: true
  how: All read or reconstruct the same canonical fixture case through insertFixtureCase/seedCase, both
    now fixed; manifest-collects-survive-release.spec.ts's two tests get the same direct state write right
    after their own release() calls. No assertion in any of these five files was removed, weakened or
    skipped.
nodes:
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  how: The rule's own pairing (a released version's manifest entries reference only released revisions)
    now holds for the canonical fixture and seed data — established directly in test setup rather than
    by a release-time gate, which is a separate, not-yet-delivered task's own concern.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  how: '"Pointing at it moves neither" is honored — the manifest reference itself never changes because
    of this task; the revision''s own state moves through a direct write standing in for the not-yet-delivered
    release-hypothesis action.'
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  how: Each file names the released value as its own local RELEASED_REVISION_STATE constant and writes
    exactly that value into hypothesis_revisions.state, the column the enumeration constrains.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  how: By protecting the manifested revisions' own collects from an eventual DELETE, the fixture's revisions
    never lose their last collected concept as an accidental side effect of test cleanup.
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  how: Because collects now survive across cleanup and reconstruction checks, every read of the canonical
    case revalidates successfully instead of meeting an emptied manifest entry.
- node: constraints/a-case-is-read-whole
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  how: The fixture's own whole-case read test and seed.spec.ts's own read both exercise case-query's real
    assembly in one transaction; this fix is what keeps that whole read from failing structurally.
inferences:
- inferred: manifest-collects-survive-release.spec.ts needed the identical direct state-releasing write
    added to its own two tests, not only the canonical fixture builder and seed.ts the task's objective
    names.
  from: The task's own sixth criterion names this file among the specs that must keep passing unmodified.
    Reading the already-delivered sibling schema spec shows the delivered migration-0021 trigger no longer
    protects a revision whose own state is draft, regardless of any case version's manifest reference;
    since production code may not write this state, the same direct-SQL technique is the only way left
    to keep this already-delivered test's own assertions true without weakening them.
- inferred: A local, per-file RELEASED_REVISION_STATE string constant is the right form for the literal
    'released' value, rather than importing HYPOTHESIS_REVISION_STATES from case-store.port.ts.
  from: Each of the three files already declares its own local constants for fixture identity rather than
    importing shared ones, so a local named constant for the one new literal follows the same convention
    already present in each file.
preserved:
- release.operation.ts's own release() still writes only case_versions.state and released_at — unmodified,
  and no other production code path was touched.
- The deleteTolerantly / isForeignKeyViolation cleanup convention in all three files.
- Each file's alreadyStored / assembleVersion idempotency check governing whether the canonical fixture
  case is rebuilt at all.
- Every existing assertion in case-fixture-reads-clean.spec.ts, seed.spec.ts, the three factory specs
  and manifest-collects-survive-release.spec.ts — none were changed, removed or relaxed.
deferred:
- what: A persistent test database that already holds the canonical fixture case with its collects
    already emptied by a prior run of the unfixed cleanup (before this delivery) is not backfilled by
    this change.
  why: insertFixtureCase / seedCase skip reconstruction once assembleVersion finds the case already stored,
    so a row corrupted by an earlier run under the unfixed setup would not be repaired by this fix alone;
    repairing already-stored data is an operational action against a live database, not something source
    alone can address, and no task in this initiative names a backfill of pre-existing rows.
---

## What it is

The fixture and seed setup that every integration test built on the curated case reads, corrected so every manifested revision of a released case version carries its own released state — a direct test-setup write standing in for the not-yet-delivered release-hypothesis action.

## Notes

If the shared, persistent test database already holds the canonical fixture case with its collects already emptied by a run under the unfixed setup, this fix alone does not repair it — see `deferred`.
