-- domain/knowledge/hypothesis-revision's own state, moved off the join
-- against case_version_hypotheses/case_versions that computed it until now
-- (task/hypothesis-revision-own-state/store-the-revisions-own-state).
--
-- Implements, from the specification:
--   domain/knowledge/hypothesis-revision       -- hypothesis_revisions.state,
--     the one attribute (revision, criterion, collects, resolution, state)
--     this table did not yet hold a column for
--   domain/knowledge/hypothesis-revision-state -- the CHECK restricting
--     .state to exactly draft and released
--
-- constraints/the-stored-schema-mirrors-the-declared-model: the one column
-- this migration adds pairs with the one attribute the node above declares
-- that no column answered yet.
-- constraints/the-schema-replays-from-its-scripts: a plain numbered .sql file
-- beside its nineteen siblings, applied once in filename order by
-- migration-runner.ts, with no step performed by hand.
-- constraints/the-domain-depends-on-no-infrastructure: unaffected by a schema
-- file directly; what it bears on is that ReviseHypothesisOperation itself
-- gains no dependency on this column — the write path in
-- relational-case-store.repository.ts is what now names state explicitly on
-- insert, the same shape case_versions.state already takes for
-- CreateDraftInput, which never carries a state field either.
--
-- This task's own Notes place migrating existing rows out of plan — the
-- product confirmed the current data may be discarded and recreated rather
-- than have this migration compute, per pre-existing row, what its state
-- would have been under the join-based regime it replaces. DEFAULT 'draft'
-- below exists for the same narrow, mechanical reason
-- 0009-case-version-lifecycle-schema.sql's own case_versions.state DEFAULT
-- and every DEFAULT after it (0011, 0012) exist: an ADD COLUMN ... NOT NULL
-- needs something to put in every row already stored — including this
-- project's own persistent integration test database, and
-- schema-migrations.spec.ts's own raw INSERT into hypothesis_revisions that
-- still names none of the columns no earlier criterion asked it to name —
-- not a claim that every such row's true release state is now draft. It
-- stays on the column permanently rather than being dropped after the
-- backfill, the same as every prior DEFAULT this project's migrations add for
-- this reason: every fresh row the one write path this task changes
-- (insertRevisionRow/revisionInsertStatement) now creates still names state
-- explicitly, so the DEFAULT only ever answers for a row this migration
-- itself did not create.
--
-- What this migration deliberately leaves alone: hypothesis_revisions_no_update
-- (0019) still refuses every UPDATE by joining out to case_version_hypotheses
-- and case_versions exactly as it already does; this task does not move that
-- rule onto the new column, does not gate ReviseHypothesisOperation's own
-- overwrite-vs-insert branch on it, and exposes it through no read port. Each
-- belongs to a sibling task this epic's own inventory already names
-- (overwrite-only-while-the-revision-is-draft,
-- refuse-altering-a-released-revision) and this task's own Notes REMAINDER-flag
-- out of it.

ALTER TABLE hypothesis_revisions
  ADD COLUMN state TEXT NOT NULL DEFAULT 'draft';

ALTER TABLE hypothesis_revisions
  ADD CONSTRAINT hypothesis_revisions_state_check CHECK (state IN ('draft', 'released'));
