---
title: Relational store adapter rebuilt for the case-version lifecycle
summary: ICaseStore and its relational adapter are rewritten against the new schema — one whole-version
  assembly and seven storage primitives, each refusal mapped from a schema constraint the sibling migration
  task added.
task: sha256:2559adcccc5f88e5c41c8a75d0919b6b0154b1618bf7e6ece5e8c74ac6537876
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/case-store.port.ts
  effect: fully replaces the previous ICaseStore (writeVersion/readVersion/listVersions, StoredCaseVersion)
    with assembleVersion, createDraft, insertHypothesisRevision, placeHypothesis, removeManifestEntry,
    release and discard, plus the data types each takes or answers (AssembledCaseVersion, ManifestEntry,
    HypothesisRevisionContent, CreateDraftInput, HypothesisRevisionInput, PlaceHypothesisInput, CaseVersionState)
- path: src/persistence/relational-case-store.repository.ts
  effect: rewrites RelationalCaseStore in place against cases.next_version, case_versions.state/released_at,
    the identity-only hypotheses table, hypothesis_revisions, hypothesis_revision_collects and case_version_hypotheses
    — implementing the new ICaseStore's seven operations, each write schema-qualified and running through
    database-access.ts's existing runStatement/queryOneOrAbsent/runInTransaction helpers
- path: src/errors/case-already-has-draft.error.ts
  effect: new typed error CaseAlreadyHasDraftError, raised when a case's draft-insert violates the case_versions_one_draft_per_case
    partial unique index
- path: src/errors/manifest-position-occupied.error.ts
  effect: new typed error ManifestPositionOccupiedError, raised when a place-hypothesis insert violates
    the case_version_hypotheses_position_unique constraint
criteria:
- criterion: Assembling one version for reading joins its manifest, ordered by position, to each entry's
    adopted hypothesis-revision and its collects, in one transaction, whole or not at all.
  met: true
  how: assembleVersion() wraps the whole read in runInTransaction; assembleWholeVersion() reads the case_versions
    row, then readManifest() selects case_version_hypotheses joined to hypothesis_revisions ordered by
    position, then collectsByHypothesisName() selects the same manifest joined to hypothesis_revision_collects
    scoped to each entry's own adopted revision — any failure in any of the three rolls the whole transaction
    back rather than answering a partial result.
- criterion: An unstored slug/version answers absence before any manifest entry is read, never a partial
    assembly.
  met: true
  how: assembleWholeVersion() reads the case_versions row first and returns undefined immediately when
    queryOneOrAbsent finds none, before readManifest() (and therefore any case_version_hypotheses or hypothesis_revisions
    row) is ever queried.
- criterion: Creating a draft version assigns the case's next version number by incrementing its durable
    counter, never by computing MAX(version) over existing rows.
  met: true
  how: assignNextVersion() runs `UPDATE cases SET next_version = next_version + 1 ... RETURNING next_version
    - 1 AS version`, an atomic read-and-advance of cases.next_version; no statement anywhere in createDraftVersion()
    computes MAX(version) over case_versions.
- criterion: Creating a draft version copies the manifest of a named source version into the new draft's
    own manifest, entry for entry.
  met: true
  how: resolveSourceVersion() returns the named source_version, or, absent, the case's own latest released
    version via `SELECT MAX(version) ... WHERE state = 'released'`; manifestCopyStatement() then runs
    one INSERT ... SELECT that copies every case_version_hypotheses row of that source version into the
    new draft's version, unchanged (case_slug, hypothesis_name, revision, position).
- criterion: Creating a second draft version for a case that already holds one in draft state is refused.
  met: true
  how: draftInsertStatement() inserts into case_versions with state = 'draft'; a second draft for the
    same slug violates the schema's case_versions_one_draft_per_case partial unique index, and raiseCreateDraftFailure()
    maps that specific constraint violation to CaseAlreadyHasDraftError rather than the generic write
    failure.
- criterion: Inserting a hypothesis-revision creates the hypothesis's own identity row only the first
    time its name is used for the case, never a second identity row for a name already held.
  met: true
  how: insertRevision() always runs hypothesisIdentityStatement() first — `INSERT INTO hypotheses (case_slug,
    name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING` — which no-ops silently on a name
    already claimed rather than raising or duplicating.
- criterion: Inserting a hypothesis-revision numbers it one past the same hypothesis's own highest existing
    revision, or 1 where none exists yet.
  met: true
  how: revisionInsertStatement() is one INSERT ... SELECT — `SELECT $1, $2, COALESCE(MAX(revision), 0)
    + 1, ... FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 RETURNING revision`
    — computing and inserting the next revision number atomically from the hypothesis's own existing rows.
- criterion: Placing a revision at a manifest position already occupied by a different hypothesis in the
    same version's manifest is refused.
  met: true
  how: placeHypothesisStatement() inserts into case_version_hypotheses; a position already held by another
    hypothesis in the same version violates the schema's case_version_hypotheses_position_unique constraint,
    and raisePlaceHypothesisFailure() maps that specific violation to ManifestPositionOccupiedError.
- criterion: Removing a manifest entry deletes only that entry, never the hypothesis-revision it referenced.
  met: true
  how: removeManifestEntryStatement() is a single `DELETE FROM case_version_hypotheses WHERE case_slug
    = $1 AND case_version = $2 AND hypothesis_name = $3`; nothing in removeManifestEntry() touches hypothesis_revisions
    or hypothesis_revision_collects.
- criterion: Transitioning a version's state to released records the instant of release, and no further
    write against that version's own row or its manifest entries takes effect afterward.
  met: true
  how: releaseStatement() runs `UPDATE case_versions SET state = 'released', released_at = NOW() WHERE
    slug = $1 AND version = $2`, recording the instant; the schema's own release-conditioned rules (case_versions_no_update,
    case_version_hypotheses_no_update_when_released/no_delete_when_released) — not re-checked in this
    file — make any subsequent write against that version's row or manifest a no-op.
- criterion: Deleting a draft version removes it and its own manifest entries without deleting any hypothesis-revision.
  met: true
  how: discardDraft() runs deleteManifestEntriesStatement() (case_version_hypotheses, by case_slug/case_version)
    then deleteCaseVersionStatement() (case_versions, by slug/version), manifest entries first so the
    version row's own foreign key is never left dangling; neither statement touches hypothesis_revisions
    or hypothesis_revision_collects.
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: the case's own next_version counter is what assignNextVersion() reads and advances atomically;
    createDraft()/createDraftVersion() is this port's realization of case.md's own create-draft operation.
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: AssembledCaseVersion carries every declared attribute (title, when_to_use, authored_at, subject,
    fallback, consolidation_register, state, released_at, manifest); place-hypothesis/remove-hypothesis/release/discard
    are realized by placeHypothesis/removeManifestEntry/release/discard.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: CaseVersionState is the 'draft' | 'released' union; caseVersionStateOf()/isCaseVersionState() narrow
    a stored value to exactly those two, raising this store's own typed error on anything else.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: ManifestEntry { position, hypothesis_revision } is assembled by manifestEntryOf() from case_version_hypotheses
    joined to hypothesis_revisions, and placeHypothesisStatement()/removeManifestEntryStatement() are
    its own place/remove primitives.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: the hypotheses table is now touched only by hypothesisIdentityStatement()'s idempotent claim (case_slug,
    name) — never a content column — realizing hypothesis.md's own identity-only shape and its revise
    operation via insertHypothesisRevision().
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: HypothesisRevisionContent { hypothesis_name, revision, criterion, collects, resolution } is assembled
    by manifestEntryOf()/resolutionOf() and inserted by insertRevisionRow()/revisionCollectStatement().
- node: rules/knowledge/a-case-version-is-written-once
  how: 'honored rather than newly encoded: release() only ever sets state/released_at, and discard()/placeHypothesis()/removeManifestEntry()
    issue exactly the writes their own criteria state; the schema''s own release-conditioned UPDATE/DELETE
    rules (from the sibling migration task) are what make any write against an already-released version''s
    row or manifest take no effect, and this file never attempts to bypass them.'
- node: rules/knowledge/a-case-version-number-is-never-reused
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: assignNextVersion()'s atomic UPDATE ... RETURNING against cases.next_version is the durable counter
    this rule names, never MAX(version).
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: revisionInsertStatement()'s COALESCE(MAX(revision), 0) + 1 computation, backed by hypothesis_revisions'
    own primary key, is this rule's own numbering.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: resolveSourceVersion() resolves the named source or the case's own latest released version, empty
    where none exists yet; manifestCopyStatement() copies that source's manifest entry for entry.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: CaseVersionState restricts every value this store reads or writes to draft/released, and releaseStatement()
    is the one transition (draft to released) this store's own primitives perform.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: hypothesisIdentityStatement()'s ON CONFLICT (case_slug, name) DO NOTHING relies on and never contests
    the hypotheses table's own primary key over that pair.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/errors/manifest-position-occupied.error.ts
  how: raisePlaceHypothesisFailure() maps a violation of the schema's own case_version_hypotheses_position_unique
    constraint to ManifestPositionOccupiedError.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  how: 'honored, not re-decided: discardDraft() deletes case_version_hypotheses and then case_versions
    by identifier alone, with no check of the version''s own state field — the schema''s own case_versions_no_delete_when_released
    and case_version_hypotheses_no_delete_when_released rules are what refuse removing an already-released
    version and its manifest, the same judgment the sibling schema migration task''s own comments already
    apply to this identical gap (this task''s own UNDERDETERMINED note).'
- node: rules/knowledge/a-case-has-at-most-one-draft
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/errors/case-already-has-draft.error.ts
  how: raiseCreateDraftFailure() maps a violation of the schema's own case_versions_one_draft_per_case
    partial unique index to CaseAlreadyHasDraftError.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  how: 'honored structurally: this store never issues an UPDATE against hypothesis_revisions or against
    a released version''s own case_version_hypotheses rows, so a later draft''s own revise()/placeHypothesis()
    against the same hypothesis name creates a new hypothesis_revisions row and a new manifest entry in
    the new draft''s own manifest, leaving version 1''s already-stored row and manifest entry untouched
    — assembleVersion() reads exactly what is stored, each time.'
- node: constraints/a-case-is-read-whole
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: assembleVersion()/assembleWholeVersion() is the one whole, validated-shape read this port still
    composes end to end, inside one transaction, answering absence before any manifest entry is read;
    every other operation (place/remove/revise/release/discard) is independently callable, exactly as
    the constraint's own fitness criterion distinguishes.
inferences:
- inferred: AssembledCaseVersion carries slug as a flat top-level field identifying the case this version
    belongs to.
  from: no node names a field for case-version's own relationship to case; PinnedCase (investigation/investigation.ts)
    already establishes the convention of flattening a referenced case's identifying fields (slug, version)
    rather than nesting a further reference, and this port follows the same shape.
- inferred: create-draft's storage primitive (CreateDraftInput) receives the new draft's own full attribute
    content — title, when_to_use, authored_at, subject, fallback, consolidation_register — directly from
    its caller, rather than this store cloning them from the copied source version.
  from: domain/knowledge/case-version's own declared operations (collection-plan, requires-evaluation-of,
    resolve-outcome, place-hypothesis, remove-hypothesis, release, discard) name no operation for editing
    a case version's own attributes after creation, so create-draft is the only point these required,
    NOT NULL attributes can originate from; this mirrors the old writeVersion's own whole-document-submission
    convention rather than introducing a new one.
- inferred: naming a source_version that does not exist for the case copies nothing into the new draft's
    manifest (an empty INSERT ... SELECT match) rather than being refused.
  from: the task's own 'What it is' states every refusal this adapter raises is what a schema constraint
    maps to; no schema constraint fires against a source_version that simply matches no case_version_hypotheses
    rows, so nothing refuses it.
- inferred: discard() and release() write exactly what their own criteria state and rely entirely on the
    schema's own release-conditioned rules to protect an already-released version, rather than re-checking
    the version's own state field in application code first.
  from: this task's own Notes instructed matching the same judgment the sibling schema migration task
    already applied to this identical UNDERDETERMINED gap — that migration's own comments (migrations/0009-case-version-lifecycle-schema.sql)
    state the declarative rule, not application logic, is what refuses the released case.
- inferred: CaseAlreadyHasDraftError and ManifestPositionOccupiedError are disambiguated from any other
    unique-violation by reading Postgres' own constraint field on the driver's error object, not only
    its code.
  from: this adapter now maps more than one distinct unique constraint to its own typed error, unlike
    the single-constraint case the previous implementation's isUniqueViolation(cause) handled; the constraint
    field is part of node-postgres' own DatabaseError shape for a unique-violation.
preserved:
- database-access.ts's own runStatement/queryOneOrAbsent/runInTransaction helpers and the unique-violation-to-typed-error
  mapping convention — reused, never duplicated.
- The existing typed-error convention (readonly context object, message built from it, this.name set to
  the class name) that case-not-found.error.ts already establishes.
deferred:
- what: case-query.service.ts and author-case-version.service.ts still call the old ICaseStore shape (store.readVersion/store.writeVersion),
    which no longer exists on this port, and will fail to typecheck until rewired against assembleVersion/createDraft/insertHypothesisRevision/placeHypothesis/removeManifestEntry/release/discard.
  why: that rewiring is task/case-lifecycle-operations/wire-and-retire-author-case-version's own objective,
    a later task in this same epic group.
- what: src/seed.ts imports CaseVersionAlreadyStoredError and calls createCaseStore(connection).readVersion(...),
    neither of which this rewritten port still exposes.
  why: seed.ts is a caller of ICaseStore this task's own inventory node did not name among the modules
    the split touches; rewiring it belongs to wire-and-retire-author-case-version, which this delivery's
    own later step confirmed and completed.
- what: Test files built against the old adapter/port shape needed their own rewrite once the callers
    above were rewired.
  why: writing or rewriting tests is test-author's own judgment in its own pass, never this implementation's.
---

## What it is

The adapter behind ICaseStore, rebuilt against the new tables: one assembled read, and one storage primitive per lifecycle mutation.
Every refusal here is what a schema constraint from the sibling migration task maps to, the same unique-violation-to-typed-error convention the current adapter already keeps.

## Notes

This task's own build run could not include the whole-project suite step: the whole-project test command only goes green once every sibling task in this same continuous delivery has also landed (case-query.service.ts and author-case-version.service.ts, both callers of the old shape, only compile again once wire-and-retire-author-case-version rewires them). This record's own run is the build steps alone (install, typecheck, lint, secret-scan), captured once the whole epic's source was in place and green together; no proof record is composed yet, per the human's own explicit instruction to close every implementation record first and settle the suite separately.
