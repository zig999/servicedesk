---
title: Revise decides overwrite-vs-create from a hypothesis-revision's own state — reconciled proof
summary: Proves, via reconciled and new tests over ReviseHypothesisOperation and RelationalCaseStore,
  that the revise branch now decides overwrite-vs-create strictly from a hypothesis-revision's own
  state column, and reconciles the pre-existing tests the manifest-join shape's removal turned red.
implementation: sha256:2803932253d72163847f4adb8ef204565ca44fb4e636de9071ee615309319782
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "overwrites an already-named hypothesis's own highest revision in place, keeping its revision
      number unchanged, when that revision is referenced by no case version in released state"
    proves: criterion 1 (draft own-state replaces in place, number unchanged) — pre-existing, unaffected
      by this task's change since the fixture's revision defaults to draft state either way.
    fails_when: writeRevision stops branching on the highest revision's own state and instead always
      inserts a new row, or renumbers the existing one.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "leaves exactly the revision it held before three successive revises of an unreleased highest
      revision, reading the content of the most recent of them afterward"
    proves: criterion 1, repeated across three successive draft-state revises.
    fails_when: any of the three revises creates a new revision instead of overwriting revision 1.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "creates the next revision rather than overwriting it, and leaves an already-released
      revision's own state and content exactly as they were, when a further revise is attempted
      against it"
    proves: criterion 2 (released own-state creates the next revision, draft, leaving the released
      revision's content unchanged) — rewritten from a test that previously asserted only the state
      column stayed 'released' without checking which branch actually ran or that the content stayed
      unchanged; now asserts the returned revision number, the untouched state and the untouched
      content together.
    fails_when: a further revise against a revision whose own state is released overwrites that row in
      place instead of creating revision 2, or the created row is not in draft state, or revision 1's
      criterion changes.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "creates no revision at all — leaves the hypothesis holding only the revision it already had
      — when the highest existing revision's own state is released and no case version's manifest
      references it, other than the one draft revision the create branch itself just wrote"
    proves: criteria 2 and 3 together (released, unreferenced by any manifest at all — no
      case_version_hypotheses row is ever written for this hypothesis in this test — creates the next
      revision in draft state, leaving the released revision's row exactly as it was).
    fails_when: the create branch mutates revision 1's own row, or the newly created revision 2 is not
      recorded as draft, or no second row is created at all.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "replaces the highest existing revision's content in place, leaving its number unchanged,
      when that revision's own state is draft even though a case version in released state references
      it"
    proves: criterion 4 — rewritten from a test that (under the old manifest-join model) asserted the
      opposite outcome (create branch, revision 2) for this exact fixture; the fixture
      (seedReleasedReferencedHighestRevision) leaves the revision's own state at its schema default
      (draft) while a released case version references it, which is precisely criterion 4's scenario
      under the new own-state model.
    fails_when: the branch still consults whether any case version's manifest references the revision
      and routes to create because a released case version does.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "creates no second revision row at all when the highest existing revision's own state is
      draft, even though a case version in released state references it"
    proves: criterion 4, from the same reconciled fixture — no extra row is ever inserted.
    fails_when: a second hypothesis_revisions row is created alongside the overwritten revision 1.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "leaves the released case version's manifest referencing the same revision number after a
      revise replaces that revision's content in place — the manifest pins the revision number, not a
      copy of its content"
    proves: that the manifest entry is left untouched by the overwrite branch — reconciled from a test
      previously narrated around the (now-incorrect) create-branch premise; the assertion itself was
      already true either way, only the story was corrected.
    fails_when: the overwrite branch writes to case_version_hypotheses at all.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than
      silently succeeding, when the read the write branch acted on had already gone stale — the
      revision's own state was set to released for real between that read and the write it drove"
    proves: 'the sibling refusal (rules/knowledge/a-released-hypothesis-revision-is-never-altered) still
      fires when this operation''s own branch decision is driven by a stale read — reconciled per the
      implementation''s own deferred item 2, since the fixture now also sets the hypothesis-revision''s
      own row to released via direct SQL (mirroring the technique the sibling task''s own repository
      spec test already uses), so the real UPDATE the stale-believing overwrite branch issues actually
      meets the migration 0021 trigger and is genuinely refused, rather than silently succeeding as it
      would have under the previous fixture, which never released the revision''s own row.'
    fails_when: overwriteHypothesisRevision is called against a revision whose own current state is
      released and does not raise ReleasedHypothesisRevisionNotAlterableError, or the row's content
      changes anyway.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "answers exactly hypothesis_name and revision — no field naming which branch ran — whether
      the revise replaced a revision in place or created the next one"
    proves: criterion 7 (the answer's shape holds no field distinguishing overwrite from create),
      exercised across both branches within one test by forcing the highest revision to released state
      between the two calls.
    fails_when: either branch's answer carries an extra field, or drops hypothesis_name or revision.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "leaves a released case version's manifest referencing the same revision it referenced before
      a later revise of the same hypothesis creates the next revision, when the referenced revision's
      own state was already released"
    proves: criterion 8's manifest-reference clause — new test, using a new fixture
      (seedReleasedOwnStateReferencedHighestRevision) that sets the revision's own state to released
      via direct SQL AND has a released case version reference it, which no pre-existing test combined;
      this is the scenario criterion 8 actually describes (the fixture the old suite used for this
      shape had own-state draft, which is criterion 4's scenario, not criterion 8's).
    fails_when: the create branch alters the released case version's manifest entry for this
      hypothesis.
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: "leaves that already-referenced revision's own content reading exactly as it did before a
      later revise of the same hypothesis creates the next revision"
    proves: criterion 8's content-unchanged clause, same new fixture as above.
    fails_when: the create branch writes to the previously-referenced (now superseded) revision's row.
  - file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
    name: "imports no database driver, HTTP server or web framework, so a caller depending on this port
      alone pulls in neither"
    proves: criterion 9 — pre-existing, unaffected — the port's only import (type HypothesisRevisionState
      from case-store.port.js) did not change under this task, only the field's type changed, which
      this import-specifier scan does not distinguish.
    fails_when: the port gains an import naming a forbidden driver or framework package.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries no state field at all for a hypothesis holding no revision — never defaulting it to
      a state that would route the write side onto the overwrite branch for a hypothesis that must
      instead create revision 1"
    proves: the { revision undefined } shape carries no state field either — reconciled from a test
      that asserted the old field name (released_referenced), which would have passed vacuously against
      the new shape without ever mentioning the field the new port actually carries.
    fails_when: the no-revision answer carries any state value at all.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries the highest revision's own state as draft still, even once the case version that
      pins it moves to released state — releasing a case version never alters the hypothesis-revision's
      own state column"
    proves: the port's revision-present shape reads the column directly and is unaffected by a case
      version's own release — reconciled from a test that asserted released_referenced true under the
      old join-based shape; the corrected assertion is the literal consequence of the join's removal.
    fails_when: calling store.release() on the referencing case version changes what
      readHighestRevisionReleaseState reports for the hypothesis-revision.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries the highest revision's own state as draft when only a case version in draft state
      pins it"
    proves: same data-path fact under a second scenario — reconciled from released_referenced false.
    fails_when: the read is influenced by the draft case version's manifest reference at all.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries the highest revision's own state, ignoring which revision a released case version's
      manifest pins — a released case version referencing only a lower revision of the same hypothesis
      leaves the freshly inserted highest revision reading its own default draft state"
    proves: the ORDER BY revision DESC LIMIT 1 read picks the true highest revision and is unaffected by
      an unrelated manifest reference to a lower revision — reconciled from released_referenced false.
    fails_when: the read is swayed by the lower revision's manifest reference, or fails to pick the
      actual highest revision.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries the highest revision's own state as released once that row is updated directly, with
      no case version anywhere referencing it — this read never joins to case_version_hypotheses or
      case_versions at all"
    proves: criterion 3's data-path fact directly at the repository level — genuinely new — no existing
      test previously exercised a released own-state with zero case-version involvement at all.
    fails_when: the read still requires or is affected by a case-version/manifest join, or fails to
      surface a released own-state value.
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: "raises this store's own typed error rather than answering a highest-revision read whose own
      state is outside the declared enumeration — a row this driver-level double can answer even though
      the real schema's own CHECK constraint on hypothesis_revisions.state never lets it occur"
    proves: the implementation's own inference 3 (hypothesisRevisionStateOf/isHypothesisRevisionState
      raises CaseStoreError on an unrecognized value) — genuinely new; this scenario is unreachable at
      the integration level since migration 0020 adds a CHECK constraint restricting
      hypothesis_revisions.state to 'draft'/'released', so only a driver-level double can exercise this
      path, mirroring the existing unit-test pattern already used for case_versions.state and
      consolidation_register.
    fails_when: readHighestRevisionReleaseState answers a row carrying an unrecognized state value
      instead of raising CaseStoreError.
not_applicable:
  - edge_case: a genuine concurrent-process race between two revise-hypothesis calls against the same
      hypothesis (rather than a simulated stale read)
    why: the deterministic stale-read double already proves the exact failure mode a real race would
      produce (a write driven by a read that is no longer true), matching the pattern the pre-existing
      suite itself established for this scenario; a true concurrency test would be flaky without adding
      proof beyond what the deterministic double already gives, and the underlying trigger-level
      concurrency guarantee is the sibling task's (refuse-altering-a-released-revision) to test.
  - edge_case: seeding an out-of-enumeration hypothesis_revisions.state value through real SQL at the
      integration level
    why: migration 0020 adds hypothesis_revisions_state_check, a CHECK constraint restricting the column
      to 'draft'/'released'; a raw INSERT or UPDATE naming any other value is refused by Postgres itself
      before any application code runs, so the scenario is only reachable through a driver-level double
      (covered above at the unit level).
  - edge_case: empty/absent collects, unknown concept, concept refusing the declared subject type
    why: these are pre-existing refusals unrelated to this task's own-state branch decision; none of
      this task's 9 criteria touches them, and the pre-existing tests covering them are unaffected by
      this change (their fixtures never reach writeRevision's branch).
untested:
  - "Inference 4 from the implementation record (case-store.port.js import became one combined import
    statement rather than two from the same specifier) names a pure source-arrangement choice with no
    externally observable behavioral consequence — TypeScript compiles identically either way, and a
    test asserting on import-statement count or shape would bind to the code's arrangement rather than
    to any behavior this task's criteria state. No test is written for it; a reader wanting confirmation
    has only the source itself to read."
---

## What it is

Reconciled and new tests over `ReviseHypothesisOperation` and `RelationalCaseStore` prove the revise branch decides overwrite-vs-create strictly from a hypothesis-revision's own state column.

## Notes

None.
