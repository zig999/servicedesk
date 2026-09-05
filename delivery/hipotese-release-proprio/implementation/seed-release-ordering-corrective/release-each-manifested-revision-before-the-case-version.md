---
title: Release each manifested revision before releasing the case version in seed.ts
summary: Reorders seed.ts's seedCase() to release every manifested hypothesis-revision through the declared lifecycle operation before releasing the case version, and removes the raw SQL UPDATE that used to move revisions to released.
task: sha256:5bf2e7e6d692aee95d2445e5481f280fda757947fe2f16af99ae4b742bd0709b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/seed-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-build
files:
- path: src/seed.ts
  effect: seedCase() now calls releaseManifestedRevisions(lifecycle, slug, placed) — which loops over the placed revisions and calls lifecycle.releaseHypothesisRevision(slug, hypothesis_name, revision) for each — before calling lifecycle.release(slug, version). The RELEASED_REVISION_STATE constant and the raw UPDATE hypothesis_revisions SET state = ... statement are removed; releaseManifestedRevisions now takes the CaseLifecycleOperations bag instead of a raw DatabaseConnection.
criteria:
- criterion: Running seed.ts (or seed.spec.ts's runSeedScript) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  met: true
  how: Every manifested revision is now moved to released (via ReleaseHypothesisRevisionOperation, reached through lifecycle.releaseHypothesisRevision) before lifecycle.release(slug, version) runs release.operation.ts's manifestOwnStateViolations check, so that check finds every referenced revision already released and contributes no violation.
- criterion: Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once seed.ts has run.
  met: true
  how: releaseManifestedRevisions calls lifecycle.releaseHypothesisRevision for every entry placeFixtureHypotheses returned, i.e. every manifested revision, writing its state to released through ReleaseHypothesisRevisionOperation/RelationalCaseStore before the case version is released.
- criterion: The seeded case version itself reads back with its own state released.
  met: true
  how: lifecycle.release(fixture.slug, draft.version) is still called, now as the last step of seedCase(), unchanged in what it does to case_versions.
- criterion: seed.ts contains no raw SQL statement writing hypothesis_revisions.state; each manifested revision's release is performed by calling lifecycle.releaseHypothesisRevision.
  met: true
  how: The connection.query('UPDATE hypothesis_revisions SET state = ...') call is deleted; releaseManifestedRevisions's only per-revision action is lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision), the declared CaseLifecycleOperations member backed by ReleaseHypothesisRevisionOperation.
- criterion: Running seed.ts a second time against a database it has already seeded resolves without rejecting and creates no second case version.
  met: true
  how: Unchanged — seed.ts's top-level alreadySeeded(connection) guard still skips seedCase() entirely once assembleVersion(CASE_SLUG, CASE_VERSION) resolves defined, so this task's reordering inside seedCase() is never reached on a second run; verifySeededCase still runs and resolves against the already-released version.
nodes:
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/seed.ts
  how: The rule is enforced in release.operation.ts (untouched by this task) via manifestOwnStateViolations; this task makes seed.ts's own fixture data conform to it instead of violating it, by ensuring every manifested revision's own state is released before lifecycle.release runs that check.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/seed.ts
  how: seed.ts now moves each manifested revision from draft to released exclusively through the declared release trigger (lifecycle.releaseHypothesisRevision, backed by ReleaseHypothesisRevisionOperation's own draft-state check), rather than writing the state column directly and bypassing the transition the operation guards.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/seed.ts
  how: seed.ts now takes the revision's own release directly against this revision through the lifecycle operation, rather than deriving or forcing that state from the case version's own release.
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - src/seed.ts
  how: The revision's transition into the released member of this enumeration is performed through the one declared operation that may move it, consistent with the aggregate holding its own release.
inferences:
- inferred: releaseManifestedRevisions's per-revision call order (loop in fixture.manifest / placed order) needs no ordering guarantee beyond 'before the case version's release,' since the rule gates the case version's release on every entry's own state independently rather than on any relative order among revisions.
  from: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions's expression, which states the condition per-entry with no ordering among the entries.
preserved:
- alreadySeeded()'s guard, which still skips seedCase() (and therefore this task's changed ordering) entirely on a second run against an already-seeded database, per the task's own Notes.
- placeFixtureHypotheses's existing behavior of creating and placing each manifested revision via lifecycle.reviseHypothesis/lifecycle.placeHypothesis, untouched by this task.
- verifySeededCase's post-seed read via createCaseQuery(connection).readCase, which now reads back a case version whose manifested revisions are genuinely released rather than borrowing release state from the case version.
deferred:
- what: The already-modified integration test files present in the tree from sibling tasks of this same initiative (manifest-collects-survive-release.spec.ts, release.operation.spec.ts, diagnose-persistence-deadline-e2e.spec.ts, release.operation.ts's own domain changes) and their delivery/run artifacts.
  why: They belong to sibling tasks in this same initiative (the manifest-only-released-revisions gate and its proof), not to this seed-ordering corrective task, whose objective and criteria are scoped to seed.ts alone.
---

## What it is

Reorders seed.ts's seedCase() to release every manifested hypothesis-revision through the declared lifecycle operation before releasing the case version, and removes the raw SQL UPDATE that used to move revisions to released directly.

## Notes

The prior ordering (case version released before its manifested revisions) was refused by rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions, delivered by this same initiative's case-version-release-gate epic — confirmed by running seed.spec.ts against a genuinely empty database, which threw CaseVersionNotReleasableError. The raw-SQL bypass of releaseHypothesisRevision was found independently by /review-change's specification-conformance and standard-conformance passes.
