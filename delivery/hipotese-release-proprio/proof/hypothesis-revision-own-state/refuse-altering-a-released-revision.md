---
title: Refuse altering a released hypothesis-revision's own state — proof
summary: Six schema-level integration tests exercise every criterion of the task directly against the
  trigger and rule 0021 replaces, and two repository-level integration tests exercise the same refusal
  through the TypeScript write path, one of them proving the domain-error/HTTP-409 translation the schema
  alone cannot establish.
implementation: sha256:099051ef6ac12a9cf8ec1f6038ddb941776785d8c7fe3a8289593b0b583853d9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError,
    rather than silently discarding it, where a released case version's manifest also references that
    revision
  proves: Criterion 1 — an attempt to alter a stored hypothesis-revision whose own state is released is
    refused at the point of the attempt, reporting a ReleasedHypothesisRevisionNotAlterableError.
  fails_when: the UPDATE against the released row succeeds, or is rejected with a message not containing
    'ReleasedHypothesisRevisionNotAlterableError', or the row's criterion reads back changed after the
    rejection is rolled back to.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though
    a released case version's manifest references that revision
  proves: Criterion 2 — an attempt to alter a stored hypothesis-revision whose own state is draft is not
    refused by this rule, even where a case version in released state references that revision.
  fails_when: the UPDATE against the draft row is rejected despite the referencing case version being
    released, or the stored criterion does not read back as the replacement text.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: refuses an update against a hypothesis-revision whose own state is released even though no case
    version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError
  proves: Criterion 3 — a hypothesis-revision whose own state is released and which no case version's
    manifest has ever referenced is refused alteration the same way.
  fails_when: the UPDATE against the unreferenced released row succeeds, or its rejection message does
    not contain 'ReleasedHypothesisRevisionNotAlterableError', or the stored criterion changes.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: names only hypothesis_revisions' own state column in hypothesis_revisions_refuse_when_released()'s
    body, reading no case_version_hypotheses or case_versions relation
  proves: Criterion 4 — the condition the refusal fires on names the hypothesis-revision row's own state
    and reads no case version relation and no manifest relation.
  fails_when: the function's own definition text (read back from pg_proc) lacks 'old.state', or contains
    a reference to case_version_hypotheses or case_versions.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: reads back a released hypothesis-revision's own collects exactly as they were stored, after an
    ordinary DELETE against those exact rows is attempted
  proves: Criterion 5 — the collects of a hypothesis-revision whose own state is released read back unchanged
    after an attempt to remove them.
  fails_when: the DELETE against the collect row of a released revision actually removes it, so the row
    is absent on read-back.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: removes a draft hypothesis-revision's own collects through an ordinary DELETE, even where a released
    case version's manifest references that revision
  proves: Criterion 6 — the collects of a hypothesis-revision whose own state is draft may still be removed,
    even where a case version in released state references that revision.
  fails_when: the DELETE against the collect row of a draft revision referenced by a released case version
    fails to remove it, so the row still reads back afterward.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even
    though a released case version's manifest still references that revision
  proves: Criterion 2, exercised through the TypeScript write path (RelationalCaseStore.overwriteHypothesisRevision)
    rather than raw SQL, confirming the repository layer carries the schema's own-state-only refusal through
    unchanged.
  fails_when: overwriteHypothesisRevision against the draft, manifest-referenced revision rejects, or
    the row's criterion does not read back as the replacement text.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses an overwrite attempt against a revision whose own state is released, through the same
    typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's
    manifest has ever referenced that revision
  proves: Criterion 3 at the repository/HTTP-mapping layer, and directly the UNDERDETERMINED entry — the
    schema's raw P0001 exception is translated into the ReleasedHypothesisRevisionNotAlterableError domain-error
    instance and that instance resolves to HTTP 409 through statusForError, rather than surfacing as an
    unmapped 500.
  fails_when: the rejected value is not an instance of ReleasedHypothesisRevisionNotAlterableError, or
    statusForError applied to the caught rejection is not 409 — exactly the implementation the UNDERDETERMINED
    note names as satisfying the criteria's literal wording while the specification refuses it.
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: drops the unconditional hypothesis_revisions_no_update rule and installs the release-conditioned
    trigger on hypothesis_revisions once every migration script has been applied in its numbered order
  proves: Supporting evidence for the implementation record's second inference — that hypothesis_revisions_no_update_when_released
    stayed the one trigger bound to hypothesis_revisions, under its original name, after 0021's CREATE
    OR REPLACE FUNCTION replaced only the function body. This test belongs to a sibling task's delivery
    and asserts nothing this task's criteria state; it is cited because it ran, unmodified, against the
    full migration set including 0021 in the captured run.
  fails_when: 'after applying every migration through 0021, hypothesis_revisions carries any pg_rules
    entry, or its trigger list is not exactly [{ tgname: ''hypothesis_revisions_no_update_when_released''
    }].'
untested:
- The implementation record's second inference also claims hypothesis_revision_collects_no_delete_when_released
  kept its own name (CREATE OR REPLACE RULE rather than drop-and-recreate under a different name). No
  test in the tree queries pg_rules for that rule by name — criteria 5 and 6 prove its behavior but would
  pass identically if the same behavior were installed under a different rule name. This is a naming-only
  implementation-shape claim no criterion states.
---

## What it is

Six schema-level integration tests exercise migration 0021's trigger and rule directly, and two repository-level tests exercise the same refusal through the TypeScript write path, proving the refusal is keyed on the hypothesis-revision's own state alone.

## Notes

None.
