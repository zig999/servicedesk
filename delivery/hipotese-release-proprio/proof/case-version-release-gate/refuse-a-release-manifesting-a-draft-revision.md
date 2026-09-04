---
title: Proof for refuse-a-release-manifesting-a-draft-revision
summary: Integration tests against ReleaseOperation.release() in the real database, proving each of the
  task's 9 criteria for the manifest-own-state gate, plus repairs to pre-existing fixtures in three
  files that the new gate would otherwise strand mid-scenario.
implementation: sha256:1900b94607270ea63595872428d6d63c0f6b59cc1d44b07f869c403c81ec5bb7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-version-release-gate-refuse-a-release-manifesting-a-draft-revision-suite-7
tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: releases a draft case version whose manifest holds two hypothesis-revisions, each pinned at a
      revision whose own state is already released, not refused by this rule
    proves: 'Criterion 1 — releasing a draft case version every manifest entry of which references a
      released-state revision is not refused by this rule.'
    fails_when: manifestOwnStateViolations pushes a violation for an entry whose referenced revision's own
      state already reads 'released', causing release() to throw instead of transitioning the version to
      'released'.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses releasing a draft case version whose one manifest entry references a hypothesis-revision
      whose own state is draft, through CaseVersionNotReleasableError naming that hypothesis
    proves: 'Criterion 2 — refused with CaseVersionNotReleasableError when one manifest entry references a
      draft-state revision; and the inferred violation phrasing, naming only the hypothesis.'
    fails_when: release() resolves instead of throwing when the one manifest entry references a draft-state
      revision, or throws a different error class, or the violations array does not name exactly that
      hypothesis.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: names every manifest entry's hypothesis whose referenced revision's own state is draft, leaving
      out the entry already referencing a released revision
    proves: 'Criterion 3 — the refusal names every manifest entry whose referenced revision is draft, and
      only those.'
    fails_when: the violations array omits an offending hypothesis, wrongly includes one whose revision is
      released, or the loop stops after the first offending entry instead of walking every entry.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses a release violating both this rule and the coherence rule together, naming the coherence
      violations and the own-state violation in the one CaseVersionNotReleasableError
    proves: 'Criterion 5 — a release violating this rule and another release rule is refused once, with
      both violations named in the one CaseVersionNotReleasableError.'
    fails_when: release() throws more than once, throws a class other than CaseVersionNotReleasableError,
      or the returned violations array omits either the coherence violations or the own-state violation.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves a case version in draft state, recording no release, when this rule alone refuses the
      release
    proves: 'Criterion 6 — a case version whose release this rule refuses stays in draft state.'
    fails_when: caseStore.release(slug, version) is reached (or its effect observed) despite the gate's
      violation — the stored state reads 'released' or released_at is defined after the refused attempt.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves the draft hypothesis-revision a refused release referenced exactly as it read before the
      attempt, its own state and content unchanged
    proves: 'Criterion 7 — no hypothesis-revision a refused release referenced is altered by that attempt.'
    fails_when: the hypothesis_revisions row's state or criterion column differs before and after the
      refused release() call.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: marks a draft that holds against every rule released, recording the instant of release
    proves: The pre-existing successful-release behavior, kept true once this task's gate is active — its
      fixture now releases the manifested revision before release() is called; no assertion was added,
      changed or removed.
    fails_when: release() throws (e.g. because the gate wrongly refuses a manifest entry whose revision is
      already released), or the version fails to transition to 'released' with released_at recorded.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses releasing a version that is not in draft state, through this operation's own
      CaseVersionNotDraftAtReleaseError, leaving the already-recorded release instant unchanged
    proves: The pre-existing double-release refusal, kept reachable once this task's gate is active — its
      fixture is repaired the same way so the first release() call succeeds instead of being blocked.
    fails_when: the first release() call throws instead of succeeding, or the second call's refusal or the
      unchanged released_at assertion no longer holds.
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves a manifested hypothesis-revision's own state exactly as it read before release, once
      release() succeeds
    proves: The pre-existing release-never-alters-a-manifested-revision's-own-state behavior, kept true
      once this task's gate is active.
    fails_when: release() throws instead of resolving, or the revision's own state differs before and
      after a successful release().
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: releasing version 2 with a new hypothesis-revision leaves version 1's own manifest and adopted
      revision reading exactly as they read before version 2 ever existed
    proves: The pre-existing version-isolation behavior, kept true once this task's gate is active.
    fails_when: either release() call throws instead of succeeding, or version 1's assembled state/manifest
      differs before and after version 2 is released.
  - file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
    name: places a hypothesis-revision at a position not yet occupied in a draft manifest
    proves: 'Criterion 8 — placing a manifest entry that pins a hypothesis-revision whose own state is
      draft is not refused by this rule. Pre-existing test, cited rather than duplicated: the placed
      revision defaults to draft state and is never released, yet placeHypothesis is asserted to succeed.'
    fails_when: placeHypothesis starts reading or refusing on a manifest entry's referenced revision's own
      state, so this test's draft-state fixture starts failing where it previously resolved.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as draft when only a case version in draft state pins
      it
    proves: 'Criterion 9 — a hypothesis-revision''s own state is unchanged by a manifest entry coming to
      reference it. Pre-existing test, cited rather than duplicated: it inserts a revision (default state
      draft), places it into a manifest, and reads its own state back unchanged as draft.'
    fails_when: placeHypothesis is given a write path that alters hypothesis_revisions.state, so the
      revision's own state would read back other than the 'draft' it was inserted with.
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasableError to 422
    proves: 'Criterion 4''s HTTP-mapping half — the refusal answers HTTP 422. Pre-existing test, cited
      rather than duplicated: it is generic to the error class this gate reuses unchanged.'
    fails_when: CaseVersionNotReleasableError's status-map entry changes away from 422, or the gate stops
      reusing that class for its own refusal.
untested:
  - 'Inference: readHypothesisRevisionOwnState answering undefined (no matching row) is treated the same
    as ''draft''. Not tested: every manifest entry is tied to an existing hypothesis_revisions row by a
    foreign key, so no integration-level setup can construct a manifest entry whose referenced revision
    row is absent at release time — the branch is structurally unreachable through this suite''s real
    database.'
  - 'Inference: releaseViolations takes a single ReleaseViolationSources object rather than a fourth
    positional parameter. Not tested: an internal call-shape decision with no behavior distinguishable
    from a hypothetical positional-parameter alternative.'
  - 'Inference: ReleaseOperation''s constructor parameter is widened in place rather than adding a fourth
    constructor parameter. Not tested for the same reason: no observable behavior distinguishes the two.'
  - 'ADVISORY note (eventual consistency of the own-state read against a concurrent write to
    hypothesis-revision state): not tested. The task''s own Notes settle this as stand — no criterion here
    states what a release answers when a referenced revision''s own state changes concurrently with the
    check.'
not_applicable:
  - edge_case: A concurrent write to a manifested hypothesis-revision's own state racing this gate's read
    why: the task's Notes explicitly place this outside its criteria (ADVISORY/Decision entries), and no
      criterion asks for a particular outcome under that race.
  - edge_case: An empty manifest reaching this gate
    why: a draft case version can never reach release() holding zero manifest entries (removing the last
      entry is already refused elsewhere), so this gate can never observe an empty collection.
  - edge_case: A failing or slow dependency behind readHypothesisRevisionOwnState
    why: the port is served by the same real database connection every test in this suite already
      exercises; injecting a fault would require a stand-in over business logic, which the project's own
      standard forbids, and no criterion calls for a distinct behavior under such a fault.
  - edge_case: Duplicate manifest entries for the same hypothesis
    why: the manifest's own uniqueness is a fact of a sibling task's criteria, not something this rule's
      criteria assert or could falsify differently.
divergences:
  - from: the expectation that only the one file the implementation record lists needed changing to reach
      a green suite
    departure: Three pre-existing test files whose fixtures manifested a still-draft hypothesis-revision
      and then called release() expecting success were stranded by this gate and needed repair —
      src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts,
      src/__tests__/integration/case/manifest-collects-survive-release.spec.ts (two tests, reordering an
      existing direct-SQL release call to run before release() instead of after), and
      src/__tests__/integration/case/release.operation.spec.ts's own coherence-violations test (switched
      to the file's existing placeReleasedHypothesis helper). A small extraction
      (placeAndReleaseRevision) was also added to diagnose-persistence-deadline-e2e.spec.ts to keep its
      seedFixture helper within the standard's own function-size and parameter-count rules.
    why: Disclosed because these are test-file edits outside the one file the implementation record's own
      files list names, made necessary by this task's new gate rather than by this task's own criteria;
      no assertion in any of the three files was weakened, only fixture ordering/helper-choice repaired.
---

## What it is

Integration tests against `ReleaseOperation.release()` prove each of the task's 9 criteria for the manifest-own-state gate; three pre-existing test files whose fixtures the new gate stranded were repaired.

## Notes

Disclosed divergence: repairing three pre-existing fixture files (see `divergences` above), made necessary by this task's gate rather than by its own criteria.
