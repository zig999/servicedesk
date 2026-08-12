-- rules/knowledge/a-case-version-is-written-once, its second half.
--
-- 0004-case-and-hypothesis.sql's PRIMARY KEY over case_versions
-- (slug, version) already answers "written once": a version already
-- stored cannot be stored a second time under the same key. Nothing in
-- that script stops an ordinary UPDATE against an already-stored row's
-- other columns, so this script closes exactly that gap and answers
-- "never altered" the rest of the way: revising a case writes a new
-- version, and case_versions itself refuses to let an already-stored
-- version's own columns move under it.
--
-- A rule reads closest to the CHECK/UNIQUE/PRIMARY KEY constraints already
-- declared in this schema — one declarative statement attached to the
-- table, rather than a trigger's separate procedural function, or a
-- privilege revoked from a role this schema never names and whose owner
-- an ordinary REVOKE cannot reach anyway. DO INSTEAD NOTHING rewrites
-- every UPDATE against case_versions into a no-op: the statement runs and
-- reports success, but touches no row, so a version already stored reads
-- back exactly as written no matter what an UPDATE names.

CREATE RULE case_versions_no_update AS
  ON UPDATE TO case_versions
  DO INSTEAD NOTHING;
