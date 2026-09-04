---
title: Diagnose-server fixture reads back released state after the release-ordering fix
summary: Two new integration assertions in diagnose-server.factory.spec.ts read the seeded fixture's case version and each of its manifested hypothesis-revisions back through the declared store API and confirm both land in the released state that the reordered insertFixtureCase now produces.
implementation: sha256:82dda49aad303fbafec0b0f94b5fd9d00793b29853599f909d080c37487a8a0c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/diagnose-server-factory-fixture-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-suite-3
tests:
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: seeds the fixture case version itself as released, once beforeAll has run
  proves: Criterion 'The seeded case version itself reads back with its own state released' — and, jointly with the file's pre-existing six it() blocks and the sibling test below, that beforeAll completed without throwing CaseVersionNotReleasableError and that no test in the file was skipped by a beforeAll crash.
  fails_when: insertFixtureCase's ordering reverts to releasing the case version before releasing its manifested revisions, which reintroduces the thrown CaseVersionNotReleasableError in beforeAll and prevents this test — and every other test in the file — from running at all.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: seeds every hypothesis-revision the fixture case version's manifest references as released, once beforeAll has run
  proves: Criterion 'Every hypothesis-revision the seeded case version's manifest references reads back with its own state released' — cross-checking the manifest listing returned by store.assembleVersion against each entry's own state read independently through store.readHypothesisRevisionOwnState, guarding against a vacuous pass with a non-empty manifest assertion.
  fails_when: Any manifest entry's hypothesis-revision is left in 'draft', or the manifest itself comes back empty.
not_applicable:
- edge_case: Attempting to release an already-released hypothesis-revision through this fixture helper (the HypothesisRevisionNotDraftAtReleaseError refusal path).
  why: 'The task''s own Notes record this as REMAINDER, belonging to the task delivering the hypothesis-revision release operation and its endpoint: this helper only ever calls releaseHypothesisRevision on revisions it has just placed in draft within the same insertFixtureCase run.'
- edge_case: An empty or absent manifest.
  why: The fixture document is fixed and always declares exactly two manifest entries; this task reorders one helper's calls and touches no fixture content.
- edge_case: Two concurrent invocations seeding the same fixture case at once.
  why: insertFixtureCase's pre-existing early return on store.assembleVersion already reading a stored version, and beforeAll's single synchronous call per file, mean this task introduces no new concurrent-seeding path to test.
- edge_case: The database dependency failing or answering slowly during seeding.
  why: This task changes only the ordering of two already-present calls inside insertFixtureCase.
untested:
- 'Criterion ''This file''s own fixture-seeding helper releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement'' is not independently observable from the fixture''s final DB state, which would look identical whether releaseHypothesisRevision or an equivalent raw UPDATE were used on this success path. Verified only by reading the diff: releaseManifestedRevisions calls lifecycle.releaseHypothesisRevision, and no SQL statement in the change touches hypothesis_revisions.state.'
- The implementation record's own inference about the fix's shape — a separate PlacedRevision-fed releaseManifestedRevisions helper run after every manifest entry is placed, rather than inline release inside placeFixtureHypotheses' own loop — is not distinguishable by any test observing only the final state, since the fixture's manifest holds no duplicate hypothesis_name/revision pair.
---

## What it is

New integration assertions proving the corrected release ordering in diagnose-server.factory.spec.ts's own insertFixtureCase.

## Notes

Two earlier suite attempts failed with cause: setup — a stale, corrupted shared canonical fixture left over from suite runs captured before this task's own fix and its sibling corrective deliveries existed. Cleaned as part of the sibling case-fixture-reads-clean-collects-delete-corrective delivery; this suite run (suite-3) is the first captured against a genuinely clean fixture and passed in full (1876/1876).
