-- Moves the release-conditioned refusal against hypothesis_revisions, and the
-- release-conditioned DELETE refusal against hypothesis_revision_collects,
-- off the join to case_version_hypotheses/case_versions and onto the
-- revision's own state column 0020 added
-- (task/hypothesis-revision-own-state/refuse-altering-a-released-revision).
--
-- Implements, from the specification:
--   domain/knowledge/hypothesis-revision -- "Once released, this content
--     never changes again ... A case version's manifest may point at this
--     revision in either state; pointing at it moves neither" now reads
--     literally: the refusal below never looks at a manifest at all
--   domain/knowledge/hypothesis-revision-state -- the value this refusal
--     reads is exactly hypothesis_revisions.state, the column 0020 already
--     paired with this node
--   rules/knowledge/a-released-hypothesis-revision-is-never-altered -- the
--     refusal fires exactly when the row's own OLD.state is 'released',
--     whether or not any case version's manifest ever referenced it
--   constraints/the-stored-schema-mirrors-the-declared-model -- neither
--     change adds a column; both read the one column 0020 already paired
--     with hypothesis-revision.state
--   constraints/the-schema-replays-from-its-scripts -- a plain numbered
--     .sql file beside its twenty siblings, applied once in filename order
--
-- hypothesis_revisions_refuse_when_released() (0019) is replaced in place
-- (CREATE OR REPLACE FUNCTION, same signature) rather than dropping and
-- recreating the trigger already bound to it
-- (hypothesis_revisions_no_update_when_released) — the EXISTS join against
-- case_version_hypotheses/case_versions is gone; the condition is now
-- OLD.state = 'released', naming the row's own state and reading no case
-- version relation and no manifest relation. The RAISE EXCEPTION text is
-- unchanged, so relational-case-store.repository.ts's own
-- isReleasedRevisionRefusal (which matches on that exact message) keeps
-- translating it into ReleasedHypothesisRevisionNotAlterableError, and
-- status-map.ts keeps answering it with an HTTP 409 — neither file needed
-- any change from this migration alone.
CREATE OR REPLACE FUNCTION hypothesis_revisions_refuse_when_released()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state = 'released' THEN
    RAISE EXCEPTION 'ReleasedHypothesisRevisionNotAlterableError';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hypothesis_revision_collects_no_delete_when_released (0010) is replaced in
-- place the same way (CREATE OR REPLACE RULE, same name, same shape 0009's
-- own case_versions_no_update conditional rule already used). Its condition
-- no longer reaches through case_version_hypotheses to case_versions; it
-- reads only hypothesis_revisions.state for the exact revision the collects
-- row belongs to. Without this, a released revision no case version's
-- manifest has ever referenced would leave its own collects removable — the
-- same gap this migration closes on hypothesis_revisions itself — and a
-- revision left in draft state would stay refused merely for being
-- referenced by a released case version's manifest, which
-- domain/knowledge/hypothesis-revision's own "pointing at it moves neither"
-- forbids. hypothesis_revision_collects_no_update (0010, unconditional) is
-- untouched: nothing this codebase's write path ever issues against an
-- existing collects row is an UPDATE, in either state.
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
  DO INSTEAD NOTHING;
