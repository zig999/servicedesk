---
title: Store the hypothesis-revision's own state column and write draft on insert
summary: Adds hypothesis_revisions.state (draft/released, NOT NULL, CHECK-constrained) via a new numbered
  migration, and makes the insert write path name it explicitly as draft, leaving the overwrite path untouched.
task: sha256:99c407718c6774438cd32b49ab76ffcae6f2c55394e97636c459532172325edc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-store-the-revisions-own-state-build
files:
- path: migrations/0020-hypothesis-revision-own-state.sql
  effect: New migration, applied after 0019 in filename order. Adds hypothesis_revisions.state TEXT NOT
    NULL DEFAULT 'draft' and a CHECK constraint (hypothesis_revisions_state_check) restricting it to draft/released.
    The header names every node it implements, explains the DEFAULT as a mechanical backfill for rows
    this migration did not create (matching the 0009/0011/0012 precedent), and records that this task
    deliberately leaves the release-conditioned immutability trigger, the overwrite gate and every read
    port untouched.
- path: src/case/case-store.port.ts
  effect: Declares HYPOTHESIS_REVISION_STATES and the derived HypothesisRevisionState type, mirroring
    the existing CaseVersionState/CASE_VERSION_STATES shape, as the named domain type for the new column's
    two values.
- path: src/persistence/relational-case-store.repository.ts
  effect: Imports HypothesisRevisionState, adds the HYPOTHESIS_REVISION_DRAFT_STATE constant, and extends
    revisionInsertStatement to name and bind the state column explicitly to 'draft' on every insert. overwriteRevision/revisionOverwriteStatement
    is unchanged — its UPDATE still never mentions state, so an overwritten row's own state column is
    left exactly as it was.
criteria:
- criterion: Applying every migration script to an empty database in numbered order, with no step performed
    by hand, produces a hypothesis-revision relation holding a state column.
  met: true
  how: 0020-hypothesis-revision-own-state.sql is a plain numbered .sql file under src/migrations, picked
    up by migration-runner.ts's orderedMigrationFiles (readdir + sort) and applied unconditionally after
    0001-0019; ALTER TABLE hypothesis_revisions ADD COLUMN state ... gives the relation the column on
    a fresh replay, exactly as schema-migrations.spec.ts's own fresh-schema test already exercises for
    every other migration.
- criterion: The state column admits the values draft and released and refuses any other value.
  met: true
  how: hypothesis_revisions_state_check CHECK (state IN ('draft', 'released')) refuses any INSERT or UPDATE
    naming a third value with a CHECK violation, the same shape case_versions_state_check already takes.
- criterion: The state column is not nullable, so every stored hypothesis-revision names exactly one state.
  met: true
  how: The column is declared NOT NULL. A DEFAULT of 'draft' satisfies that constraint for every row already
    stored before this migration runs (this project's own persistent integration test database among them);
    every row inserted by ReviseHypothesisOperation's own write path from here on names state explicitly
    rather than relying on the default.
- criterion: Every column the migration adds pairs with an attribute domain/knowledge/hypothesis-revision
    declares.
  met: true
  how: The one column this migration adds, state, pairs with the one attribute (name state, type hypothesis-revision-state,
    required true) the node declares that hypothesis_revisions did not yet hold a column for; no other
    column is added.
- criterion: A revision revise-hypothesis inserts reads back with its own state draft.
  met: true
  how: revisionInsertStatement now inserts (..., state) ... SELECT ..., $7 with HYPOTHESIS_REVISION_DRAFT_STATE
    ('draft') bound as $7, so every row insertRevisionRow (called from ReviseHypothesisOperation.writeRevision's
    insert branch) creates stores and reads back state = 'draft'.
- criterion: A revision whose content revise-hypothesis replaces in place reads back with its own state
    unchanged.
  met: true
  how: revisionOverwriteStatement's UPDATE sets only criterion, resolution_outcome, resolution_action
    and resolution_recipient; it never names state, so overwriteRevision (called from ReviseHypothesisOperation.writeRevision's
    overwrite branch) leaves whatever state the row already carried exactly as it was.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - src/persistence/relational-case-store.repository.ts
  how: The node's own state attribute (hypothesis-revision-state, required) is now a column of the revision's
    own row rather than derived from any case-version manifest membership; the insert write path fills
    it with draft on every new revision, matching "draft until a curator releases it."
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - src/case/case-store.port.ts
  how: The enumeration's two values, draft and released, are the CHECK constraint's vocabulary and the
    HYPOTHESIS_REVISION_STATES/HypothesisRevisionState pair's own values — no third value is representable
    in either place.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  how: The one column this migration adds pairs with the one attribute the Domain Model node declares
    that hypothesis_revisions did not already hold a column for; the migration's header states this pairing
    explicitly.
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  how: The migration is one more plain numbered .sql file, applied once in filename order by the existing
    migration-runner.ts, with no step performed by hand.
- node: constraints/the-domain-depends-on-no-infrastructure
  how: Governed the placement of the change — the state literal is named where the write happens (the
    persistence repository), not threaded into ReviseHypothesisOperation or any domain/operation-layer
    type, so the domain layer gains no new dependency on this column. No fact of this constraint itself
    lives in a file; it is a property the placement satisfies rather than a fact source records.
inferences:
- inferred: The new column takes DEFAULT 'draft' rather than no default, even though the task's own Notes
    place migrating existing rows out of plan.
  from: The precedent already established by migrations/0009-case-version-lifecycle-schema.sql (case_versions.state),
    0011-investigation-evidence-elapsed-ms.sql and 0012-glossary-concept-description.sql, all of which
    backfill a new NOT NULL column with a plain, non-computed DEFAULT for exactly the same mechanical
    reason — an ADD COLUMN ... NOT NULL needs some value for every row already stored, including this
    project's own persistent integration test database and schema-migrations.spec.ts's own raw INSERT
    into hypothesis_revisions, which the task notes do not ask to touch and which would otherwise fail
    on this ALTER. The default is not a claim about any pre-existing row's true release state, only the
    same backfill mechanism those three migrations already establish as this project's own convention.
- inferred: A new exported HypothesisRevisionState type (and HYPOTHESIS_REVISION_STATES) in case-store.port.ts,
    rather than reusing the existing CaseVersionState literal or an unexported local constant.
  from: The existing CaseVersionState/CASE_VERSION_STATES pattern already in case.ts and case-store.port.ts,
    and TYP-04 (a value with meaning is a named constant). Reusing CaseVersionState for a textually-identical
    but conceptually distinct enumeration (hypothesis-revision-state) would couple two independent domain
    facts that happen to share values today; a dedicated type keeps them free to diverge without a silent
    shared dependency.
preserved:
- Every existing read and write behavior of ICaseStore's other methods (assembleVersion, listHypothesisRevisions,
  findDraftVersion, createDraft, placeHypothesis, removeManifestEntry, release, discard, updateDraft)
  is untouched.
- overwriteHypothesisRevision's own behavior (criteria 6) — it already never named state in its UPDATE,
  so no code change was needed to preserve "state unchanged on overwrite."
- hypothesis_revisions_no_update_when_released (migration 0019's trigger, joining to case_version_hypotheses/case_versions)
  is untouched and keeps firing exactly as it already does; this task does not move that refusal onto
  the new column.
- The existing raw INSERT into hypothesis_revisions in schema-migrations.spec.ts and vitest-global-setup.ts's
  own repair queries, which name no state column, keep working unchanged because of the column's DEFAULT.
deferred:
- what: Gating ReviseHypothesisOperation's overwrite-vs-insert branch, and hypothesis_revisions' own immutability
    trigger, on the new state column instead of the released_referenced join.
  why: REMAINDER-flagged out of this task's own Notes; belongs to the sibling tasks overwrite-only-while-the-revision-is-draft
    and refuse-altering-a-released-revision, which this task's Notes name explicitly.
- what: Exposing the new state column through HypothesisRevisionListItem, listHypothesisRevisions, its
    controller and its DTO.
  why: Flagged as a risk in the epic's own inventory (case-lifecycle-persistence), but no criterion of
    this task asks for it; adding it here would widen the task past what its criteria and REMAINDER notes
    state.
---

## What it is

A new migration gives hypothesis_revisions a state column of its own — draft or released, not nullable — and the insert write path names it draft explicitly on every new revision. The overwrite write path is untouched, so a replace-in-place leaves the row's own state exactly as it stood.
The immutability trigger, the overwrite-vs-insert branch and the listing's own disclosure of this column are deliberately left to the sibling tasks this task's REMAINDER notes name.

## Notes

None.
