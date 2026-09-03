---
title: Persistence schema tests and fixture/seed setup still keyed to the manifest-referenced basis
summary: The area the suite-corrections scope lands in — the persistence schema specs, the shared fixture/seed
  builder, and the tests that read through it — all still assume the pre-0020/0021 manifest-referenced
  protection of a hypothesis revision.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
area:
- src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
- src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
- src/seed.ts
- src/factories/case-lifecycle.factory.ts
- src/case/release.operation.ts
- src/case/hypothesis-revision-release-state.port.ts
- src/persistence/relational-case-store.repository.ts
- migrations/0020-hypothesis-revision-own-state.sql
- migrations/0021-refuse-altering-a-released-revision.sql
modules:
- name: revision-alteration-refused-only-when-released-schema-spec
  path: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  role: touched
- name: protect-released-hypothesis-revision-collects-schema-spec
  path: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  role: touched
- name: relational-case-store-repository-spec
  path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  role: touched
- name: refuse-altering-a-released-revision-schema-spec
  path: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  role: adjacent
- name: seed-spec
  path: src/__tests__/integration/seed.spec.ts
  role: touched
- name: case-fixture-reads-clean-spec
  path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  role: touched
- name: diagnose-server-factory-spec
  path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  role: touched
- name: simulate-case-server-factory-spec
  path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  role: touched
- name: simulate-hypothesis-server-factory-spec
  path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  role: touched
- name: manifest-collects-survive-release-spec
  path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  role: touched
- name: seed-script
  path: src/seed.ts
  role: depends-on
- name: case-lifecycle-factory
  path: src/factories/case-lifecycle.factory.ts
  role: depends-on
- name: release-operation
  path: src/case/release.operation.ts
  role: depends-on
- name: hypothesis-revision-release-state-port
  path: src/case/hypothesis-revision-release-state.port.ts
  role: adjacent
- name: relational-case-store-repository
  path: src/persistence/relational-case-store.repository.ts
  role: depends-on
- name: hypothesis-revision-own-state-migration
  path: migrations/0020-hypothesis-revision-own-state.sql
  role: depends-on
- name: refuse-altering-a-released-revision-migration
  path: migrations/0021-refuse-altering-a-released-revision.sql
  role: depends-on
conventions:
- statement: A persistence schema spec builds an isolated Postgres schema per file, replays every migration
    file in filename order through applyMigrationFiles/migrationFilesInOrder, and asserts against raw
    SQL rather than the application's own repositories.
  seen_at: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- statement: The already-correct sibling schema spec asserts the trigger by name (hypothesis_revisions_no_update_when_released)
    and inspects the trigger function's own body text for old.state while asserting it names no case_version_hypotheses
    or case_versions relation — proving the refusal is state-only rather than manifest-derived.
  seen_at: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- statement: Fixture and seed setup always creates and places a hypothesis revision through case-lifecycle's
    reviseHypothesis/placeHypothesis/release, never through a direct INSERT into hypothesis_revisions,
    and release() only ever updates case_versions — it never writes hypothesis_revisions.state.
  seen_at: src/factories/case-lifecycle.factory.ts
- statement: Fixture/seed cleanup deletes owned rows through a deleteTolerantly helper that swallows only
    foreign-key-violation (23503) errors, letting a still-referenced row survive silently rather than
    failing the teardown.
  seen_at: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- statement: seed.spec.ts loads the production seed script as a live ES module (import(...?run=N)) rather
    than calling an exported function, so seed.ts's own top-level side effects run once per import.
  seen_at: src/__tests__/integration/seed.spec.ts
must_not_duplicate:
- what: The migration-replay fixture builder (requireDatabaseUrl, migrationFilesInOrder, applyMigrationFiles,
    per-schema glossary/case/hypothesis/manifest/collects insert helpers) that every persistence schema
    spec currently re-declares file-by-file
  at: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- what: The FK-violation-tolerant cleanup helper (isForeignKeyViolation/deleteTolerantly) and the fixture-owned-rows
    wipe/cleanup sequence
  at: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- what: The canonical fixture-seeding sequence (insertTerms/insertConcepts/insertCapabilities/insertFixtureCase
    via createCaseLifecycle) that ensures the curated case fixture exists
  at: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
risks:
- risk: Rewriting or removing the two obsolete manifest-referenced-basis test files reaches into work
    delivered by other, already-closed initiatives whose own records point at exactly those assertions.
  consumers:
  - work/hypothesis-revision-editable-until-published (closed)
  - delivery/manifest-collects-hotfix
- risk: Making a fixture/seed hypothesis-revision's own state released, to satisfy the new state-only
    trigger, risks encroaching on the not-yet-delivered release-hypothesis action this same initiative
    still owes, if done anywhere but the test-only fixture/seed setup.
  consumers:
  - src/case/release.operation.ts
  - src/case/hypothesis-revision-release-state.port.ts
- risk: seed.ts runs top-level, connection-opening side effects on import; any change to its seeding sequence
    is observed by every test file that imports it live, not only the ones the scope names.
  consumers:
  - src/__tests__/integration/seed.spec.ts
- risk: case-fixture-reads-clean.spec.ts, seed.spec.ts and the three factory specs all key off the same
    fixture case (intermittent-connection-outage, version 1) and the same underlying shared, persistent
    Neon database; a fix that changes what that fixture's revision rows look like changes what every one
    of these files reads.
  consumers:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  - src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
---

## What it is

The territory this scope's corrections land in: the persistence-schema test layer that certifies the hypothesis-revision release trigger, and the shared fixture/seed layer every integration test built on the curated case depends on.
Migration 0021 moved the trigger's condition from a manifest join (case_version_hypotheses/case_versions) onto hypothesis_revisions' own state column; three schema/repository tests still assert the old manifest-referenced basis, and the fixture/seed builder never sets a manifested revision's own state to released, so the new state-only trigger no longer protects fixture data the old join-based trigger protected by coincidence.
refuse-altering-a-released-revision-schema.spec.ts, delivered by this same initiative's migration-0021 task, is the currently-correct sibling and the pattern the obsolete tests should converge on or be retired in favor of.
release.operation.ts's own release() writes only case_versions.state; nothing in the delivered system yet writes hypothesis_revisions.state to released, and hypothesis-revision-release-state.port.ts exists unit-tested but unwired, which is the not-yet-delivered release-hypothesis action the scope explicitly says this fix must not anticipate in production code.

## Notes

None.
