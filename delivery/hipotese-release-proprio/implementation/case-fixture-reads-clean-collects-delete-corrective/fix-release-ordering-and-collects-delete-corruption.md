---
title: Fix case-fixture-reads-clean.spec.ts's own release ordering and its destructive collects-survive-DELETE test
summary: insertFixtureCase now releases every manifested hypothesis-revision through the declared lifecycle operation before releasing the case version, and the collects-survive-DELETE test now exercises the DELETE against a case this test owns exclusively so the shared canonical fixture is never touched.
task: sha256:625ac842bbe778ec87fc65dbd436458ae3ac0125ef1b91807ead5d8afee41843
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-fixture-reads-clean-collects-delete-corrective-fix-release-ordering-and-collects-delete-corruption-build
files:
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  effect: insertFixtureCase's own releaseManifestedRevisions helper now takes the file's CaseLifecycleOperations and calls lifecycle.releaseHypothesisRevision for every manifested revision instead of issuing a raw SQL UPDATE against hypothesis_revisions.state, and insertFixtureCase now calls it before lifecycle.release(fixture.slug, draft.version) rather than after. The former collects-survive-DELETE test is replaced by one that arranges its own dedicated case, hypothesis and released hypothesis-revision (via createDraft, reviseHypothesis and releaseHypothesisRevision, reusing the file's already-seeded fixture vocabulary), issues the ordinary DELETE against that owned revision's own collects row, and asserts it reads back unchanged — never touching the shared canonical fixture's own collects at all. A best-effort, tolerant cleanup of the owned case's rows runs in a finally block.
criteria:
- criterion: Running this file's own beforeAll (ensureFixtureSeeded/insertFixtureCase) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  met: true
  how: insertFixtureCase now calls releaseManifestedRevisions(lifecycle, fixture.slug, placed) before lifecycle.release(fixture.slug, draft.version); the manifest-only-released-revisions gate finds every referenced revision already released and raises nothing.
- criterion: insertFixtureCase releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
  met: true
  how: releaseManifestedRevisions calls lifecycle.releaseHypothesisRevision for every placed revision; no raw SQL against hypothesis_revisions.state remains anywhere in this file.
- criterion: Running case-fixture-reads-clean.spec.ts's own full test file, then reading the shared canonical fixture case's manifested hypothesis-revisions' own collects afterward, finds every one of them present and matching the fixture document.
  met: true
  how: The collects-survive-DELETE test no longer issues any DELETE against the shared canonical fixture's own collects rows at all — it constructs and deletes against a distinct, randomly-suffixed case slug it owns exclusively.
- criterion: An ordinary DELETE aimed at a released hypothesis-revision's own collects rows leaves those rows unchanged, consistent with the DB-level protection rules/knowledge/a-released-hypothesis-revision-is-never-altered names for this exact behavior — the collects-survive test asserts the rows read back unchanged, not that the DELETE itself is refused with an error.
  met: true
  how: The rewritten test creates a draft case, revises a hypothesis into a draft revision with one collect, releases that revision through lifecycle.releaseHypothesisRevision, issues an ordinary DELETE against it, and asserts (via a plain SELECT) that the concept still reads back.
- criterion: Running this file followed by any other file that reads the same canonical fixture case (e.g. seed.spec.ts) does not raise CaseNotValidError over that case declaring no hypothesis.
  met: true
  how: Because insertFixtureCase's release ordering is corrected and the collects-survive-DELETE test no longer deletes anything belonging to the shared canonical fixture, that fixture retains every hypothesis, hypothesis-revision and collect row it was seeded with once this file's suite finishes.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  how: The corrected insertFixtureCase releases every manifested revision before the case version's own release, and the rewritten collects-survive test's owned instance is built the same way with no case-version release step at all, demonstrating a revision's own release answers to no case version.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  how: Both the fixed insertFixtureCase and the rewritten collects-survive test move a revision from draft to released exclusively through lifecycle.releaseHypothesisRevision.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  how: insertFixtureCase now satisfies the gate this rule states — every manifest entry's hypothesis-revision is released before the case version's own release is attempted.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  how: The rewritten collects-survive test proves exactly the collects clause this rule states — an attempt to remove one of its collects is accepted and left with no effect — against a hypothesis-revision the test itself releases first.
- node: rules/knowledge/validation-runs-at-every-read
  how: 'Unchanged by this task: this file''s own pre-existing whole-read tests already exercise a validating read, and this task''s fix is what lets those reads keep succeeding against a coherent fixture.'
inferences:
- inferred: The owned instance's subject, concept and outcome/action/recipient names can be reused as-is without seeding any new vocabulary.
  from: They are exactly the values already present in this file's own seeded fixtures, inserted by ensureFixtureSeeded before any test in this file runs.
- inferred: The owned instance needs no case-version release step at all — only createDraft, reviseHypothesis and releaseHypothesisRevision — to exercise the DB-level collects protection.
  from: domain/knowledge/hypothesis-revision's own statement that a revision's release answers to no case version and no manifest, together with migrations/0021, confirmed against refuse-altering-a-released-revision-schema.spec.ts's own equivalent tests.
- inferred: Leaving the owned instance's rows permanently in the shared database (uncleanable exactly because they are released, which is correct by design) is an acceptable cost, not a corruption.
  from: manifest-collects-survive-release.spec.ts (already delivered in this initiative), which follows the identical shape.
preserved:
- This file's own three pre-existing, unmodified tests keep passing against the corrected insertFixtureCase.
- The shared canonical fixture case that every other integration test file (including seed.spec.ts) also reads remains coherent after this file's own suite finishes.
- cleanupFixtureSeeded's existing tolerant-cleanup behavior over the shared canonical fixture's own rows is unchanged.
deferred:
- what: Why the shared canonical fixture's own collects rows were previously observed to be genuinely, permanently deleted by the old test's raw DELETE, given that migrations 0010 and 0021 both declare a release-conditioned DELETE no-op rule over hypothesis_revision_collects that isolated schema-level tests already confirm works correctly.
  why: The fix taken (exercising the DELETE against a test-owned instance) no longer touches the shared fixture's own collects at all, so whatever the old mechanism was, it can no longer reach them; further diagnosis of that historical mechanism sits outside what this corrective task asks for.
---

## What it is

Fixes case-fixture-reads-clean.spec.ts's own two defects together: its insertFixtureCase's release ordering and raw-SQL bypass, and its collects-survive-DELETE test's corruption of the shared canonical fixture — now exercised against a case this test owns exclusively.

## Notes

The prior ordering and destructive DELETE were found by two failure-diagnostician passes over sibling corrective deliveries' own captured suite runs, tracing a 20+-failure cascade across 7 files (including this initiative's own seed.ts and diagnose-server.factory.spec.ts corrective deliveries) to this file.
