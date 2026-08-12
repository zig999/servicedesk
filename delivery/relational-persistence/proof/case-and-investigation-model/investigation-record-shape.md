---
title: Proof for investigation carrying written_at and pinning its case by slug and version
summary: Five tests proving the pinned case is narrowed to exactly slug and version with no digest ever
  read, that a built investigation carries written_at and refuses its absence at runtime, and excluding
  both UNDERDETERMINED candidates the task's Notes name — plus three pre-existing test files, from now-closed
  initiatives, brought into agreement with this legitimate shape change.
implementation: sha256:8942fa0e29fec3695e0665abf2b0a6e80df2e1024b18530fa7dd671825c5fbfe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-investigation-record-shape-suite-2
tests:
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: pins the case by exactly slug and version, never a hash and never the whole case
  proves: The pinned case carries the slug and the version of the case that ran and nothing else.
  fails_when: pinned_case gains any field beyond slug and version (in particular hash), or drops either
    of the two it must carry
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: pins the case by exactly slug and version, never a hash and never the whole case
  proves: No module derives or reads a digest over a case's content when building an investigation.
  fails_when: two cases sharing slug and version but differing only in hash produce different pinned_case
    values, i.e. anything about pinning reads or is derived from the case's own hash
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: carries written_at from the given options, unchanged
  proves: A built investigation carries written_at as a datetime recording when its one write happened.
  fails_when: the built investigation's written_at differs from the given options.written_at, or is absent
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when written_at is missing entirely, rather than building a record with no datetime
    of its own write
  proves: The factory refuses to build an investigation without written_at.
  fails_when: buildInvestigation resolves instead of throwing when written_at is absent from the given
    options
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: does not refuse to build when ticket_ref is absent, since domain/investigation/investigation declares
    it optional
  proves: the UNDERDETERMINED entry excluding a factory that refuses to build without ticket_ref, since
    the specification declares it optional and no criterion of this task distinguishes it from the required
    attributes
  fails_when: buildInvestigation rejects (rather than resolves) when ticket_ref is absent from the given
    options — exactly what the excluded candidate implementation would do
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: carries id, requester, narrative, evaluations, assessment, cost and durations from the given options,
    unchanged — not only the four replay pins and written_at
  proves: the UNDERDETERMINED entry excluding a factory that stores only written_at, the pinned slug/version,
    model, prompt_version and evidence, dropping the eight other required attributes domain/investigation/investigation
    declares
  fails_when: any of id, requester, narrative, evaluations, assessment, cost or durations is missing from,
    or does not match, what the built investigation carries for a call that supplied distinctive values
    for each
not_applicable:
- edge_case: a boundary at each end of a numeric range
  why: none of this task's criteria state a range — the pin is two identifying fields and written_at is
    a datetime, neither bounded by a stated minimum or maximum
- edge_case: an empty collection where one comes back
  why: pinned_case is not a collection, and this task adds no collection-shaped attribute
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion of this task claims uniqueness over anything this task adds or changes
- edge_case: an operation attempted against state that forbids it
  why: buildInvestigation is a pure assembly over already-completed stage output with no state machine
    of its own; the store's write-once refusal is a different module's concern, proved by its own existing
    tests and unaffected by this task
- edge_case: a dependency that fails or answers slowly
  why: this task introduces no new dependency call; the one boundary buildInvestigation already consumes
    (the glossary port) has its own failure-propagation test pre-existing in this file, untouched by this
    change
- edge_case: two operations against one subject at once
  why: buildInvestigation holds no shared mutable state and this task changes no concurrency-relevant
    behavior; the concurrency guarantee that matters (one write per investigation id) belongs to the store
    and to run-diagnosis.ts, proved elsewhere
untested:
- run-diagnosis.ts's own derivation of written_at from the run's propagated now is exercised only implicitly,
  through the pre-existing tests that round-trip a whole written document; no test asserts written_at's
  value against a specific now independently of those.
- Cross-call isolation of pinned_case in run-diagnosis.spec.ts's rewritten second test — that one call's
  given case can never leak into another concurrent or sequential call's own investigation — is no longer
  provable through that test's own seam. Its fixture's two cases differ only by hash, which pinned_case
  no longer carries, and no substitute distinguishing difference (a different slug or version) was invented
  to replace it. Re-establishing this guarantee would need either a fixture whose two cases differ by
  slug or version, or a different seam (e.g. spying on which Case object reaches pinnedCaseOf for each
  call) than the one this test already used.
divergences:
- from: the ordinary route of re-delivering the proof over the task that owns the test — task/investigation-lifecycle/investigation-factory
    and task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject (owning
    investigation-factory.spec.ts), whichever task owns file-investigation-store.repository.spec.ts, and
    task/diagnose-entry-point/diagnose-pipeline-composition (owning run-diagnosis.spec.ts, per that file's
    own header comment) — all under now-closed initiatives (investigation-engine, investigation-engine-v2,
    live-engine-mvp)
  departure: Three pre-existing test files were edited directly inside this delivery rather than through
    their owning tasks, all explicitly authorized by the human. (1) src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    — anInvestigation()'s pinned_case literal dropped hash and the fixture gained a required written_at;
    no new assertion was added, since every test here already round-trips the whole document through toEqual/toMatchObject
    checks that already exercise written_at. (2) src/__tests__/unit/investigation/investigation-factory.spec.ts
    — validOptions() gained a required written_at, and the pre-existing "pins the case by exactly slug,
    version and hash" test was narrowed to {slug, version} with an added not.toHaveProperty('hash') check,
    since that assertion is the exact fact this task's criterion 1 changes. (3) src/__tests__/unit/investigation/run-diagnosis.spec.ts
    — the "pins the case by slug, version and hash..." test's toMatchObject expectation was narrowed the
    same way, dropping hash; and "runs and pins exactly the case object given to each call, never a case
    any other source might have published" was rewritten as "pins each call's own written document with
    its own case's slug and version, independently of the other call" and weakened to what remains true,
    since its two fixture cases differ only by hash and nothing observable through the narrowed pin can
    any longer distinguish them — the lost cross-call-isolation claim is recorded under untested above
    instead of asserted.
  why: All three owning initiatives carry closure.md and are history; the ordinary route (re-deliver the
    proof over the task that owns the test) does not exist for any of them, and the human explicitly authorized
    folding all three fixes into this delivery instead of cutting a corrective task through /plan-work.
---

## What it is

Six tests proving a built investigation carries written_at (and refuses its absence at runtime),
that the pinned case carries exactly slug and version with no digest ever read over the case's
content, and excluding both UNDERDETERMINED candidates the task's own Notes name.

## Notes

Criterion 4's own test surfaced a real disagreement with the implementation's first pass: written_at
being a required TypeScript field alone does not make the factory "refuse to build" at runtime, the
way this same module's other explicit refusals already do. That disagreement was resolved by
correcting the implementation to add a real runtime guard (WrittenAtRequiredError), not by weakening
this test — the test asserts the criterion exactly as stated and now passes against the corrected
source.
Three pre-existing test files, all belonging to now-closed initiatives with no live task to re-deliver
against, were brought into agreement with this task's legitimate shape change — see the divergence
below for the full account of what changed in each and why.
