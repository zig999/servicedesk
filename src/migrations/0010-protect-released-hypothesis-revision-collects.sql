-- Corrective fix (task/manifest-collects-hotfix/fix-collects-readback): closes
-- a gap 0009 itself left open, found live by running this project's own
-- suite against the real, shared Neon test database rather than by reading
-- 0009's text alone (that text reads as internally consistent; the gap only
-- shows once a released case version's own hypothesis_revision_collects rows
-- are actually deleted and read back).
--
-- domain/knowledge/hypothesis-revision states plainly: "Once any case
-- version in released state manifests it, this content never changes again
-- ... leaving every version that already adopted this one reading exactly
-- what it always read." Its own attributes are revision, criterion,
-- collects and resolution together — collects is exactly as much "this
-- content" as criterion or resolution are, so the same immutability the
-- rest of that content already holds is a fact this schema owes collects
-- too (rules/knowledge/a-hypothesis-collects-at-least-one-concept: a
-- revision the citation obligation depends on holding at least one concept
-- must still hold at least one once released, not merely at the instant it
-- was written).
--
-- 0009 answered this immutability for every OTHER row a released version
-- touches: case_versions and case_version_hypotheses each carry their own
-- release-conditioned DELETE rule, and hypothesis_revisions carries an
-- unconditional UPDATE rule "a fortiori: content nobody may ever change
-- stays true whether or not a released version has manifested it yet"
-- (0009's own comment). hypothesis_revision_collects alone was left with
-- neither: nothing in 0009 names it in any rule at all. Every other
-- protected table happens to be shielded a second way even without its own
-- rule — case_version_hypotheses' own FOREIGN KEY into hypothesis_revisions
-- means deleting an already-manifested revision fails on that surviving
-- reference before this schema's own hypothesis_revisions_no_update would
-- ever need to answer a DELETE at all — but hypothesis_revision_collects is
-- a genuine leaf: nothing this schema declares references INTO it, so
-- nothing stood between an ordinary DELETE and a released revision's own
-- collects, and constraints/a-case-is-read-whole's own assembled read
-- (relational-case-store.repository.ts's manifestCollectsSelect) took that
-- absence for granted the same way every sibling query already safely could
-- for its own table.
--
-- This project's own integration suite found the gap through exactly that
-- absence: several sibling proof files release a case version for real and
-- then clean up after themselves through the same deleteTolerantly
-- convention every sibling protected table already answers with a no-op or
-- a tolerated foreign-key violation once released
-- (relational-case-store.repository.spec.ts, discard.operation.spec.ts,
-- release.operation.spec.ts, manifest-composition.operations.spec.ts,
-- create-draft.operation.spec.ts, case-query.factory.spec.ts,
-- store-wiring.spec.ts) — but for hypothesis_revision_collects, that same
-- DELETE genuinely succeeds, silently, against this project's real, shared,
-- persistent Neon test database (constraints/the-database-is-externally-provisioned),
-- rather than genuinely deleting nothing the way it must for the rule this
-- migration adds to finally hold. Two of those callers
-- (fixtures/case-fixture-reads-clean.spec.ts, integration/seed.spec.ts)
-- release the one curated fixture case
-- (fixtures/case/intermittent-connection-outage/1.json) both files and this
-- database's every later reader — including a later run of this exact
-- suite, since this database is dedicated and persists across runs — go on
-- reading from; once its own afterAll wiped that fixture's collects, its
-- manifest, its case_versions row and its hypothesis_revisions rows all
-- remained (correctly, by design, since the version is released), but every
-- one of its hypothesis-revisions' own collects read back empty from then
-- on, which is this task's own reported defect.
--
-- rules/knowledge/a-released-hypothesis-revision-is-never-altered's own
-- reach and hypothesis_revisions_no_update's own "a fortiori" reasoning
-- extend cleanly to this table for UPDATE, the same way, since nothing this
-- codebase's own write path ever issues against an existing
-- hypothesis_revision_collects row is an UPDATE either (revise-hypothesis
-- only ever inserts a fresh revision's own rows, never edits one already
-- stored). DELETE needs its own explicit, release-conditioned rule instead
-- of that same unconditional shape, because collects rows belonging to a
-- hypothesis-revision that has never yet been manifested by any released
-- version are still legitimately removable (case_version_hypotheses' own
-- FOREIGN KEY into hypothesis_revisions is what lets a revision be created,
-- placed, then removed again while its case version is still draft — no
-- criterion of any task asks collects rows to outlive that). The EXISTS
-- subquery below reaches through case_version_hypotheses to case_versions
-- for that release fact, the same reach case_version_hypotheses' own two
-- release-conditioned rules already use for themselves.

CREATE RULE hypothesis_revision_collects_no_update AS
  ON UPDATE TO hypothesis_revision_collects
  DO INSTEAD NOTHING;

CREATE RULE hypothesis_revision_collects_no_delete_when_released AS
  ON DELETE TO hypothesis_revision_collects
  WHERE EXISTS (
    SELECT 1
    FROM case_version_hypotheses cvh
    JOIN case_versions cv
      ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version
    WHERE cvh.case_slug = OLD.case_slug
      AND cvh.hypothesis_name = OLD.hypothesis_name
      AND cvh.revision = OLD.revision
      AND cv.state = 'released'
  )
  DO INSTEAD NOTHING;
