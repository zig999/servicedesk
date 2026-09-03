---
title: The store refuses a write against a version that is not draft — proof
summary: Unit and integration tests over relational-case-store.repository.ts prove that placeHypothesis,
  removeManifestEntry, release and discard each refuse against a non-draft version with their stated typed
  error and write nothing, that insertHypothesisRevision refuses CaseHoldsNoDraftError when the case holds
  no draft, and that all five still succeed exactly as before against draft state.
implementation: sha256:139eec72962c6ba7e265c57fa84813dc8c759393667a69c5b916fd6e75f215e1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/released-version-write-guards-refuse-writes-against-a-non-draft-version-suite-7
tests:
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses place-hypothesis with CaseVersionNotDraftError, naming the slug, version and state, and
    inserts no manifest entry, when the version is not in draft state
  proves: criterion 1
  fails_when: insertManifestEntry omits the requireVersionState/refuseUnlessDraft guard, raises a different
    error, or still runs the INSERT after a released state is read
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses placeHypothesis, through CaseVersionNotDraftError, against a released version, inserting
    no manifest entry
  proves: criterion 1, against the real database rather than a mocked driver
  fails_when: the same guard is absent, wrongly typed, or the manifest row is inserted despite the released
    state
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses removeManifestEntry with CaseVersionNotDraftError, naming the slug, version and state,
    and deletes no manifest entry, when the version is not in draft state
  proves: criterion 2
  fails_when: deleteManifestEntry omits its guard, raises a different error, or still runs the DELETE
    against a released version
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses removeManifestEntry, through CaseVersionNotDraftError, against a released version, leaving
    its own manifest entry in place
  proves: criterion 2, against the real database
  fails_when: the manifest entry is actually removed, or a different/no error surfaces
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses release with CaseVersionNotDraftAtReleaseError, naming the slug, version and state, changing
    neither its state nor its released_at, when the version is not in draft state
  proves: criterion 3
  fails_when: releaseVersion omits refuseUnlessDraftAtRelease, raises the wrong error type, or still issues
    the UPDATE
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses a second release call against a version already released, through CaseVersionNotDraftAtReleaseError,
    leaving its recorded released_at unchanged
  proves: criterion 3, against the real database, asserting released_at is literally unchanged across
    the two calls
  fails_when: a second release call succeeds or silently overwrites released_at
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses discard with CaseVersionNotDraftError, naming the slug, version and state, deleting neither
    the manifest entries nor the version row, when the version is not in draft state
  proves: criterion 4
  fails_when: discardDraft omits its guard, raises a different error, or either DELETE statement still
    runs
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses discard, through CaseVersionNotDraftError, against a released version, leaving it — its
    state, its released_at and its manifest — untouched
  proves: criterion 4, against the real database, asserting the version, its state and its manifest all
    survive the refused call
  fails_when: the released version or its manifest entries are actually deleted
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses insertHypothesisRevision with CaseHoldsNoDraftError, naming the slug, and inserts no revision,
    when the case currently holds no draft version
  proves: criterion 5
  fails_when: requireCaseHoldsDraft is skipped, raises a different error, or the hypothesis/revision insert
    statements still run
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses insertHypothesisRevision, through CaseHoldsNoDraftError naming the slug, against a case
    that currently holds no draft version, inserting no revision
  proves: criterion 5, against the real database
  fails_when: a revision row is actually inserted, or a different/no error is raised
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: places one hypothesis-revision at one manifest position, after reading the version state as draft,
    as one unit of work
  proves: criterion 6 (placeHypothesis half) — the draft-state success path is unchanged by the guard
  fails_when: the guard now refuses a draft version, or the manifest insert stops running against a draft
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: removes only the named manifest entry, after reading the version state as draft, never touching
    the hypothesis-revision it referenced
  proves: criterion 6 (removeManifestEntry half)
  fails_when: the guard now refuses a draft version, or the delete stops running against a draft
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: transitions the version to released, recording the instant of release, after reading the version
    state as draft
  proves: criterion 6 (release half)
  fails_when: the guard now refuses a draft version, or the UPDATE stops running against a draft
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: removes a draft version's own manifest entries before its own row, after reading the version state
    as draft, never touching any hypothesis-revision
  proves: criterion 6 (discard half)
  fails_when: the guard now refuses a draft version, or either DELETE stops running against a draft
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: records the instant of release when release is called against a draft version
  proves: criterion 6 (release half), against the real database
  fails_when: release against a draft version now fails or leaves released_at unset
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: removes a draft version and its own manifest entries, without deleting any hypothesis-revision
  proves: criterion 6 (discard half), against the real database
  fails_when: discard against a draft version now fails or the version/manifest survive
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: assembles one version whole — its own attributes together with its manifest, ordered by position
    regardless of the order entries were placed in, each entry joined to its own adopted hypothesis-revision
    and its collects
  proves: criterion 6 (placeHypothesis half), against the real database — placeHypothesis called twice
    against a draft version still succeeds and both entries land in the manifest
  fails_when: placeHypothesis against a draft version now refuses, or a manifest entry is silently dropped
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: finds the case's own draft first, claims the hypothesis's own identity idempotently, inserts the
    revision numbered off its own highest existing revision, and inserts its own collects, as one unit
    of work
  proves: criterion 7 — insertHypothesisRevision against a case holding a draft still succeeds exactly
    as before
  fails_when: requireCaseHoldsDraft now refuses a case that holds a draft, or any statement in the sequence
    (hypothesis identity, revision insert, each collect insert) is skipped or reordered
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: numbers a hypothesis-revision one past that hypothesis's own highest existing revision, or 1 where
    none exists yet, independently per hypothesis
  proves: criterion 7, against the real database — repeated insertHypothesisRevision calls against a held
    draft keep succeeding and keep numbering correctly
  fails_when: insertHypothesisRevision against a held draft now refuses, or the revision numbering breaks
- file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
  name: refuses placing a hypothesis-revision against a version that is not in draft state
  proves: the same guard as criterion 1 (CaseVersionNotDraftError over placeHypothesis), through a different
    already-delivered task's own operation-level test
  fails_when: placeHypothesis succeeds against a released version
not_applicable:
- edge_case: Two concurrent operations against the same version/case at once, for placeHypothesis, removeManifestEntry,
    release, discard or insertHypothesisRevision
  why: None of this task's seven criteria state a concurrency guarantee for these five guards.
- edge_case: Empty collects list on insertHypothesisRevision
  why: This task adds no check over collects; an empty list was already handled unconditionally before
    this task and is untouched by it.
untested:
- 'UNDERDETERMINED, from the specification — rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft''s
  concept-acceptance clause ("the concept-acceptance check the new revision undergoes uses that draft
  version''s declared subject type") reaches no criterion of this task. An implementation satisfying every
  criterion here while performing no concept-acceptance check at all still fails that clause of the rule.
  A fix was written and then reverted at the human''s own direction: it sat inside insertRevision, a function
  every hypothesis-revision write in the codebase passes through, and its refusal fired earlier than several
  other already-delivered tasks'' own test premises expected to be reached first — a foreign-key violation
  on an unregistered concept (this file and two others), and a release-time coherence check (release.operation.spec.ts)
  — one of the affected files belonging to a closed initiative. The gap is disclosed here and in the implementation
  record''s own deferred section, left for a scope of its own.'
---

## What it is

Nineteen tests across the unit and integration specs of relational-case-store.repository.ts prove each of this task's seven criteria: five refusals (CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError, CaseHoldsNoDraftError) and their unchanged draft-state success paths.

## Notes

One test outside this task's own file set, in src/__tests__/integration/case/manifest-composition.operations.spec.ts (owned by task/case-lifecycle-http/place-hypothesis-route under the closed initiative case-management-http-api), was repaired at the human's explicit direction: its own setup called insertHypothesisRevision after release() to fabricate a revision to place, which the CaseHoldsNoDraftError guard this task adds now correctly refuses before the test ever reaches the assertion it means to make. The fix reorders the setup (obtain the revision, then release) and changes no assertion.
A concept-acceptance ("subject-type") correction was written to close this task's own UNDERDETERMINED note, found by fourteen test failures across three files to conflict with other already-delivered tasks' own test premises, and reverted at the human's explicit direction. The gap stays UNDERDETERMINED; see untested below and the implementation record's own deferred section.
