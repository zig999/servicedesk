---
title: Release each manifested hypothesis-revision before the case version in diagnose-server.factory.spec.ts's own fixture seeding
summary: insertFixtureCase now releases every manifested hypothesis-revision through the lifecycle's own releaseHypothesisRevision before releasing the case version, so beforeAll no longer throws CaseVersionNotReleasableError against an empty database.
task: sha256:77cdd7161e2ab01d962304e12f6abc7c9edf7a78f8020af9869e91f949931cd7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/diagnose-server-factory-fixture-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-build
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: placeFixtureHypotheses now returns the list of hypothesis_name/revision pairs it placed instead of void; a new releaseManifestedRevisions helper calls lifecycle.releaseHypothesisRevision for each placed revision; insertFixtureCase calls releaseManifestedRevisions with that list before calling lifecycle.release on the case version, mirroring src/seed.ts's already-corrected seedCase/releaseManifestedRevisions shape.
criteria:
- criterion: Running this file's own beforeAll against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  met: true
  how: insertFixtureCase now releases every manifested revision (via lifecycle.releaseHypothesisRevision) before calling lifecycle.release on the case version, so the manifest-only-released-revisions gate finds every referenced revision already released and raises nothing.
- criterion: Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once this file's own beforeAll has run.
  met: true
  how: releaseManifestedRevisions iterates every entry placeFixtureHypotheses placed (one per manifest entry) and calls lifecycle.releaseHypothesisRevision(slug, hypothesis_name, revision) for each, which is the declared operation that moves a hypothesis-revision's own state to released.
- criterion: The seeded case version itself reads back with its own state released.
  met: true
  how: lifecycle.release(fixture.slug, draft.version) still runs, unchanged, as the last step of insertFixtureCase, now succeeding because the manifest-only-released-revisions gate no longer finds a draft-state entry.
- criterion: This file's own fixture-seeding helper releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
  met: true
  how: releaseManifestedRevisions calls lifecycle.releaseHypothesisRevision, the CaseLifecycleOperations method already backed by ReleaseHypothesisRevisionOperation; no SQL is written or touched by this change.
- criterion: Every test in this file that depends on the seeded fixture runs (none is skipped by a beforeAll crash), given a database holding none of the fixture's rows beforehand.
  met: true
  how: Because beforeAll's call to ensureFixtureSeeded/insertFixtureCase no longer throws, every it() block in the file — which all depend on the seeded fixture through app.inject — executes rather than being skipped by a thrown beforeAll.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: The fixture-seeding helper now respects that a hypothesis-revision's release is a curator's action taken directly against this revision, answering to no case version and no manifest — it releases each revision through lifecycle.releaseHypothesisRevision as its own step, separate from and prior to the case version's own release.
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: Each manifested revision's state moves from draft to released via the declared operation before the case version's release is attempted, so every revision the manifest references reads back released.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: The fixture helper drives the revision's lifecycle transition (draft to released) exclusively through lifecycle.releaseHypothesisRevision, and only against revisions it has just placed in draft state, never re-releasing an already-released one.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: insertFixtureCase now releases every manifest entry's referenced revision before calling lifecycle.release on the case version, satisfying the policy's requirement that a case version's release finds every manifest entry's referenced revision already released.
inferences:
- inferred: The exact shape of the fix — a PlacedRevision type and a separate releaseManifestedRevisions helper fed by placeFixtureHypotheses' returned list, called between placeFixtureHypotheses and lifecycle.release — rather than inlining the release call inside placeFixtureHypotheses' own loop.
  from: src/seed.ts's already-corrected seedCase/placeFixtureHypotheses/releaseManifestedRevisions, which implement this exact shape for the identical defect.
preserved:
- The file's six existing it() blocks and their assertions against the seeded fixture's request/response shape, unchanged.
- insertFixtureCase's early return when store.assembleVersion(SLUG, VERSION) already reads a stored version, so the fixture is still created at most once across the shared database.
- The unrelated seeding steps (insertTerms, insertConcepts, insertCapabilities, insertConnectorConfigurations) and the afterAll cleanup sequence, none of which this change touches.
- placeHypothesis and reviseHypothesis calls remain exactly as before, still called once per manifest entry before any release.
---

## What it is

Reorders diagnose-server.factory.spec.ts's own insertFixtureCase to release every manifested hypothesis-revision through the declared lifecycle operation before releasing the case version.

## Notes

The prior ordering was refused by rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions, delivered by this same initiative's case-version-release-gate epic — confirmed by two failure-diagnostician passes over the seed.ts corrective delivery's own captured suite runs, both showing this file's beforeAll crashing with CaseVersionNotReleasableError.
