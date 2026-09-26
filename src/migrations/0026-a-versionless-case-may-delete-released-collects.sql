-- Reconciles hypothesis_revision_collects_no_delete_when_released (0021)
-- with rules/knowledge/a-case-holding-no-version-may-be-deleted
-- (task/case-deletion/store-deletes-a-versionless-case), which the rule as
-- 0021 left it silently defeats.
--
-- 0021's own condition blocks a DELETE against hypothesis_revision_collects
-- whenever the collects row's own hypothesis_revision is released, with no
-- regard for whether that revision's case still holds a version at all --
-- exactly right for rules/knowledge/a-released-hypothesis-revision-is-never-altered's
-- ordinary reach (revise/discard leaving a released revision's own content
-- untouched), and exactly wrong for delete: rules/knowledge/a-case-holding-no-version-may-be-deleted
-- states plainly that removing a case that holds no case version removes
-- "every hypothesis-revision of those hypotheses, released ones included,
-- and every collect those revisions hold" -- a released revision's own
-- collects are not an exception the delete rule carves out; they are one of
-- the very things it names. A case with zero versions has no manifest
-- pinning any of them (that same rule's own Description), so nothing reads
-- a released revision's collects through this case any more once its last
-- version is gone -- the immutability 0021 protects is a fact about a
-- revision a live case might still read from, not about a revision whose
-- case no longer names any version at all.
--
-- The exception added below is the same shape as 0021's own condition,
-- narrowed by one more EXISTS: the rule now blocks the delete only where the
-- collects row's own case (OLD.case_slug) still holds at least one
-- case_versions row. A case mid-delete has already had every one of its
-- case_versions rows read as absent by deleteVersionlessCase's own
-- refuseIfCaseHoldsVersions check before any DELETE runs
-- (relational-case-store.repository.ts), so this new exception can never be
-- satisfied by a case still holding a draft or a released version -- the
-- ordinary revise/discard paths this rule was written for keep seeing the
-- exact same refusal as before, since neither ever runs against a case with
-- zero versions left.
--
-- CREATE OR REPLACE RULE, same name, same shape 0021 and 0010 before it both
-- used for this exact rule's own history.
--
-- Implements, from the specification:
--   rules/knowledge/a-case-holding-no-version-may-be-deleted -- closes the
--     one path (a released revision's own collects) that 0021's own
--     condition left this delete unable to complete
--   rules/knowledge/a-released-hypothesis-revision-is-never-altered -- kept
--     exactly as strict as before for every case that still holds a version
--   constraints/the-schema-replays-from-its-scripts -- a plain numbered .sql
--     file beside its twenty-five siblings, applied once in filename order

CREATE OR REPLACE RULE hypothesis_revision_collects_no_delete_when_released AS
  ON DELETE TO hypothesis_revision_collects
  WHERE EXISTS (
    SELECT 1
    FROM hypothesis_revisions hr
    WHERE hr.case_slug = OLD.case_slug
      AND hr.hypothesis_name = OLD.hypothesis_name
      AND hr.revision = OLD.revision
      AND hr.state = 'released'
  )
  AND EXISTS (
    SELECT 1
    FROM case_versions cv
    WHERE cv.slug = OLD.case_slug
  )
  DO INSTEAD NOTHING;
