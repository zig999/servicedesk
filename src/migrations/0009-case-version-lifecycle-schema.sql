-- The case-version lifecycle, its durable version counter, and hypothesis
-- identity split from its revisioned content behind a manifest
-- (task/case-lifecycle-persistence/case-version-lifecycle-schema).
--
-- Implements, from the specification:
--   domain/knowledge/case               -- cases.next_version
--   domain/knowledge/case-version       -- case_versions.state, .released_at
--   domain/knowledge/case-version-state -- the CHECK restricting .state
--   domain/knowledge/manifest-entry     -- case_version_hypotheses
--   domain/knowledge/hypothesis         -- hypotheses, now identity-only
--   domain/knowledge/hypothesis-revision -- hypothesis_revisions
--   rules/knowledge/a-case-version-is-written-once            -- case_versions_no_update
--     (replacing 0006's blanket rule) plus the two release-conditioned
--     rules on case_version_hypotheses, below
--   rules/knowledge/a-case-version-number-is-never-reused      -- cases.next_version,
--     a durable counter rather than MAX(case_versions.version)
--   rules/knowledge/a-hypothesis-revision-number-is-never-reused -- the PRIMARY KEY
--     over (case_slug, hypothesis_name, revision) on hypothesis_revisions;
--     "numbered exactly one past the highest existing revision" is the
--     revise() operation's own arithmetic, not a fact this schema states
--   rules/knowledge/a-case-version-moves-through-its-declared-lifecycle -- the
--     CHECK restricting case_versions.state to draft/released
--   rules/knowledge/a-hypothesis-name-is-unique-within-its-case -- the
--     PRIMARY KEY over (case_slug, name) on the new, version-less hypotheses
--   rules/knowledge/a-hypothesis-position-is-unique-within-its-case -- the
--     UNIQUE constraint over (case_slug, case_version, position) on
--     case_version_hypotheses
--   rules/knowledge/a-released-hypothesis-revision-is-never-altered -- answered
--     a fortiori by hypothesis_revisions_no_update, which refuses every
--     UPDATE unconditionally rather than only once released
--   rules/knowledge/only-a-draft-case-version-may-be-discarded -- the
--     release-conditioned DELETE rule on case_versions, below
--   rules/knowledge/a-case-has-at-most-one-draft -- the partial unique index
--     on case_versions (slug) WHERE state = 'draft'
--   rules/knowledge/every-position-declares-a-resolution -- hypothesis_revisions'
--     own resolution_outcome/action/recipient, required exactly as
--     hypotheses' did before this split (the case_version fallback half of
--     this rule was already answered by an earlier migration and is untouched
--     here)
--   scenarios/knowledge/a-released-version-keeps-its-original-revision -- a
--     released case_versions row's own manifest can no longer be moved once
--     released, and the hypothesis_revisions row it references can never be
--     altered by any UPDATE at all, so the scenario's "reads exactly as it
--     did before" holds structurally
--   constraints/a-case-is-read-whole -- honored by leaving hypotheses,
--     hypothesis_revisions and (for a draft) case_version_hypotheses
--     independently writable; the whole-assembly validated read path itself
--     belongs to the case-query task, not this schema
--
-- Two invariants this migration closes beyond the task's own eleven
-- criteria, because the specification nodes above already state them and a
-- declarative constraint can express both:
--
--   1. rules/knowledge/a-case-version-is-written-once says a released
--      version's manifest is "never altered again", not only the
--      case_versions row itself. case_version_hypotheses therefore carries
--      its own pair of release-conditioned rules (UPDATE and DELETE), the
--      same shape as case_versions' own.
--   2. rules/knowledge/only-a-draft-case-version-may-be-discarded says "a
--      released version is never removed" — DELETE, not only UPDATE.
--      case_versions therefore also carries a release-conditioned DELETE
--      rule beside its UPDATE one.
--
-- Neither widens the schema past tables this script already creates or
-- touches; both use the same DO INSTEAD NOTHING shape 0006 established.
--
-- MIG-03 (a migration that destroys or alters data ships with a reverse
-- migration beside it): this script DROPs hypotheses and hypothesis_collects,
-- which does destroy whatever rows either held in any environment already
-- running 0004. No reverse script accompanies it — a departure, disclosed
-- rather than silently skipped the way 0007 skipped one for a genuinely
-- unpopulated table. migration-runner.ts applies every .sql file this
-- directory holds, unconditionally, in filename order, the moment it is not
-- yet in schema_migrations; it has no separate up/down channel. A file that
-- recreated the dropped tables would not sit "beside" this one waiting for a
-- person to run it on purpose — it would be picked up and applied forward,
-- in the same run, undoing this very migration before any rollback was ever
-- intended. There is no way to place a working reverse script under this
-- directory without defeating the ordinary replay path MIG-01 and this
-- runner both depend on, so satisfying MIG-03 as written is not reachable
-- from inside this project's own migration mechanism for this script.

-- domain/knowledge/case's own next_version: "always greater than every
-- version number this case has ever held, including one later discarded" —
-- a fact of the identity itself, per case.md, so it lives on cases rather
-- than being derived from MAX(case_versions.version) each time (criterion 2).
-- DEFAULT 1 backfills every case row this script finds already stored: a
-- value for the pre-existing rows this ADD COLUMN NOT NULL must supply
-- something for, not a claim about what any later-created case's own first
-- draft is numbered — the create-draft operation that assigns and advances
-- this counter is a different task's to write.
ALTER TABLE cases
  ADD COLUMN next_version INTEGER NOT NULL DEFAULT 1;

-- domain/knowledge/case-version.state and .released_at (criterion 1).
-- DEFAULT 'released' backfills every case_versions row already stored: under
-- the schema this script replaces, every such row was already unconditionally
-- immutable (0006's own blanket case_versions_no_update), which is exactly
-- what "released" means for a row this migration cannot ask a curator about.
-- The default is kept permanently, not only for the backfill: every write
-- path this project currently ships (RelationalCaseStore.writeVersion and
-- everything built on it) inserts into case_versions without naming state at
-- all, and this task does not rewrite that path — the sibling store-rewrite
-- task can still write state = 'draft' explicitly wherever it needs to,
-- which dropping the default was never required for.
ALTER TABLE case_versions
  ADD COLUMN state TEXT NOT NULL DEFAULT 'released';

ALTER TABLE case_versions
  ADD CONSTRAINT case_versions_state_check CHECK (state IN ('draft', 'released'));

ALTER TABLE case_versions
  ADD COLUMN released_at TIMESTAMPTZ;

-- rules/knowledge/a-case-has-at-most-one-draft (criterion 3): a partial
-- unique index, since PostgreSQL has no CHECK that can see sibling rows —
-- this is the declarative shape a "one draft at a time" invariant takes.
CREATE UNIQUE INDEX case_versions_one_draft_per_case
  ON case_versions (slug)
  WHERE state = 'draft';

-- Replaces 0006's case_versions_no_update in place with a conditional
-- version — the "next script" MIG-02 asks for, expressed as a fresh
-- CREATE OR REPLACE RULE statement here rather than an edit to 0006's own
-- file. Where OLD.state = 'released' the UPDATE still no-ops exactly as
-- 0006 made every UPDATE no-op (criterion 8). Where it is not — a still-draft
-- row, including the one UPDATE that transitions it to released — this rule
-- does not apply and the UPDATE proceeds ordinarily (criterion 9).
CREATE OR REPLACE RULE case_versions_no_update AS
  ON UPDATE TO case_versions
  WHERE OLD.state = 'released'
  DO INSTEAD NOTHING;

-- rules/knowledge/only-a-draft-case-version-may-be-discarded, its DELETE
-- half: a released case_versions row is never removed. discard() itself
-- (a different task) still removes a draft row and its own manifest
-- entries ordinarily, since this rule only fires where OLD.state =
-- 'released'.
CREATE RULE case_versions_no_delete_when_released AS
  ON DELETE TO case_versions
  WHERE OLD.state = 'released'
  DO INSTEAD NOTHING;

-- Dropped in favor of the identity/revision/manifest split below
-- (criterion 10): no row-transformation logic, since no data need be
-- preserved. Child before parent so no CASCADE is needed; nothing else in
-- this schema references either table (investigation_evaluations.hypothesis
-- and investigation_evidence.concept name a hypothesis/concept by value,
-- with no foreign key back to these tables).
DROP TABLE hypothesis_collects;
DROP TABLE hypotheses;

-- domain/knowledge/hypothesis, now identity-only (criterion 4): named
-- uniquely within its case across every version the case ever holds
-- (rules/knowledge/a-hypothesis-name-is-unique-within-its-case), carrying no
-- content column — criterion, collects and resolution all moved to
-- hypothesis_revisions and hypothesis_revision_collects below.
CREATE TABLE hypotheses (
  case_slug TEXT NOT NULL REFERENCES cases (slug),
  name      TEXT NOT NULL,
  CONSTRAINT hypotheses_pkey PRIMARY KEY (case_slug, name)
);

-- domain/knowledge/hypothesis-revision (criterion 5): one numbered row per
-- revision of a hypothesis's own content. hypothesis_revision.resolution
-- flattens into resolution_outcome/action/recipient the same way
-- hypotheses.resolution used to (0004's own convention), and
-- rules/knowledge/every-position-declares-a-resolution is why all three
-- stay required.
CREATE TABLE hypothesis_revisions (
  case_slug            TEXT NOT NULL,
  hypothesis_name      TEXT NOT NULL,
  revision             INTEGER NOT NULL,
  criterion            TEXT NOT NULL,
  resolution_outcome   TEXT NOT NULL REFERENCES outcomes (name),
  resolution_action    TEXT NOT NULL REFERENCES actions (name),
  resolution_recipient TEXT NOT NULL REFERENCES recipients (name),
  CONSTRAINT hypothesis_revisions_pkey PRIMARY KEY (case_slug, hypothesis_name, revision),
  CONSTRAINT hypothesis_revisions_hypothesis_fkey FOREIGN KEY (case_slug, hypothesis_name)
    REFERENCES hypotheses (case_slug, name)
);

-- An UPDATE against an already-stored hypothesis_revisions row is refused
-- rather than silently changing it (criterion 5) — unconditionally, which
-- answers rules/knowledge/a-released-hypothesis-revision-is-never-altered a
-- fortiori: content nobody may ever change stays true whether or not a
-- released version has manifested it yet.
CREATE RULE hypothesis_revisions_no_update AS
  ON UPDATE TO hypothesis_revisions
  DO INSTEAD NOTHING;

-- hypothesis_revision.collects (many domain/glossary/concept), each row
-- referencing the exact revision it belongs to (criterion 6) — the same
-- shape 0004's own hypothesis_collects used, with case_version replaced by
-- revision.
CREATE TABLE hypothesis_revision_collects (
  case_slug       TEXT NOT NULL,
  hypothesis_name TEXT NOT NULL,
  revision        INTEGER NOT NULL,
  concept_name    TEXT NOT NULL REFERENCES concepts (name),
  CONSTRAINT hypothesis_revision_collects_pkey
    PRIMARY KEY (case_slug, hypothesis_name, revision, concept_name),
  CONSTRAINT hypothesis_revision_collects_revision_fkey
    FOREIGN KEY (case_slug, hypothesis_name, revision)
    REFERENCES hypothesis_revisions (case_slug, hypothesis_name, revision)
);

-- domain/knowledge/manifest-entry, the manifest itself (criterion 7): one
-- case version's own precedence position, and exactly which revision of one
-- hypothesis's content it uses. The PRIMARY KEY holds one hypothesis to one
-- manifest entry per version; the separate UNIQUE constraint is
-- rules/knowledge/a-hypothesis-position-is-unique-within-its-case, stated on
-- position alone so reordering never touches the revision reference. The
-- revision foreign key alone is enough to guarantee (case_slug,
-- hypothesis_name) names a real hypothesis, since hypothesis_revisions
-- itself foreign-keys there.
CREATE TABLE case_version_hypotheses (
  case_slug       TEXT NOT NULL,
  case_version    INTEGER NOT NULL,
  hypothesis_name TEXT NOT NULL,
  revision        INTEGER NOT NULL,
  position        INTEGER NOT NULL,
  CONSTRAINT case_version_hypotheses_pkey
    PRIMARY KEY (case_slug, case_version, hypothesis_name),
  CONSTRAINT case_version_hypotheses_position_unique
    UNIQUE (case_slug, case_version, position),
  CONSTRAINT case_version_hypotheses_case_version_fkey
    FOREIGN KEY (case_slug, case_version)
    REFERENCES case_versions (slug, version),
  CONSTRAINT case_version_hypotheses_revision_fkey
    FOREIGN KEY (case_slug, hypothesis_name, revision)
    REFERENCES hypothesis_revisions (case_slug, hypothesis_name, revision)
);

-- rules/knowledge/a-case-version-is-written-once, its manifest half: "every
-- manifest entry [a released version] composes is never altered again" —
-- not only the case_versions row itself, which criterion 8 alone would
-- leave unanswered (the gap this task's own notes flagged as
-- underdetermined). Both fire only where the manifest entry's own case
-- version is released, leaving an ordinary draft's manifest freely
-- composable (place-hypothesis/remove-hypothesis) exactly as
-- domain/knowledge/case-version describes.
CREATE RULE case_version_hypotheses_no_update_when_released AS
  ON UPDATE TO case_version_hypotheses
  WHERE EXISTS (
    SELECT 1 FROM case_versions cv
    WHERE cv.slug = OLD.case_slug
      AND cv.version = OLD.case_version
      AND cv.state = 'released'
  )
  DO INSTEAD NOTHING;

CREATE RULE case_version_hypotheses_no_delete_when_released AS
  ON DELETE TO case_version_hypotheses
  WHERE EXISTS (
    SELECT 1 FROM case_versions cv
    WHERE cv.slug = OLD.case_slug
      AND cv.version = OLD.case_version
      AND cv.state = 'released'
  )
  DO INSTEAD NOTHING;
