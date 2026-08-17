---
title: Case-version lifecycle schema migration
summary: A new, next-numbered SQL migration that gives cases a durable version counter, case_versions
  a state/released_at lifecycle with a corrected release-conditioned immutability rule, and splits hypothesis
  identity from its revisioned content behind a manifest, dropping the old flat hypotheses/hypothesis_collects
  tables.
task: sha256:8d4f8832b32201d7593a0ef053f2bb6535f4d6b128f51a31b0f4e024a50155af
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-persistence-case-version-lifecycle-schema-build-3
files:
- path: migrations/0009-case-version-lifecycle-schema.sql
  effect: Adds cases.next_version (a durable counter, DEFAULT 1) and case_versions.state (TEXT NOT NULL
    DEFAULT 'released', the default kept permanently rather than dropped, so every currently-shipped write
    path that inserts into case_versions without naming state — RelationalCaseStore.writeVersion and
    everything built on it — keeps behaving exactly as it does today) and .released_at; adds a partial
    unique index enforcing at most one draft per case; replaces 0006's unconditional case_versions_no_update
    with a release-conditioned CREATE OR REPLACE RULE so a draft row (including the transition to released)
    stays writable while a released row's UPDATE still no-ops; adds a release-conditioned DELETE-refusal
    rule on case_versions; drops hypotheses and hypothesis_collects (migration 0004) with no row-transformation;
    recreates hypotheses as an identity-only table keyed by (case_slug, name); creates hypothesis_revisions
    keyed by (case_slug, hypothesis_name, revision) with an unconditional UPDATE-refusal rule; creates
    hypothesis_revision_collects keyed by (case_slug, hypothesis_name, revision, concept_name); creates
    the case_version_hypotheses manifest keyed by (case_slug, case_version, hypothesis_name) with position
    unique per version and its own pair of release-conditioned UPDATE/DELETE-refusal rules.
criteria:
- criterion: case_versions gains a state column restricted by CHECK to draft or released, and a released_at
    column.
  met: true
  how: ADD COLUMN state TEXT NOT NULL DEFAULT 'released' — the default backfills every pre-existing row
    and is kept permanently, not dropped, since every currently-shipped write path inserts into case_versions
    without naming state and none of this task's criteria requires the default's removal — plus CONSTRAINT
    case_versions_state_check CHECK (state IN ('draft', 'released')); ADD COLUMN released_at TIMESTAMPTZ,
    nullable exactly as domain/knowledge/case-version declares it optional.
- criterion: cases gains a durable version counter column, never computed from MAX(version) over existing
    rows.
  met: true
  how: ADD COLUMN next_version INTEGER NOT NULL DEFAULT 1 on cases — a stored counter, never a MAX(case_versions.version)
    computation.
- criterion: A constraint permits at most one case_versions row in draft state per case at any time.
  met: true
  how: CREATE UNIQUE INDEX case_versions_one_draft_per_case ON case_versions (slug) WHERE state = 'draft'
    — a partial unique index, the declarative shape available since a plain CHECK cannot see sibling rows.
- criterion: hypotheses becomes an identity-only table keyed by (case_slug, name), carrying no content
    column.
  met: true
  how: The old hypotheses is dropped and recreated with exactly case_slug and name, PRIMARY KEY (case_slug,
    name), no criterion/resolution/position column.
- criterion: hypothesis_revisions holds one numbered row per revision of a hypothesis's content (criterion,
    resolution outcome/action/recipient), keyed by (case_slug, hypothesis_name, revision), and an UPDATE
    against an already-stored row is refused or no-ops rather than silently changing it.
  met: true
  how: CREATE TABLE hypothesis_revisions with criterion, resolution_outcome/action/recipient columns,
    PRIMARY KEY (case_slug, hypothesis_name, revision); CREATE RULE hypothesis_revisions_no_update AS
    ON UPDATE TO hypothesis_revisions DO INSTEAD NOTHING refuses every UPDATE unconditionally.
- criterion: hypothesis_revision_collects holds the concepts one hypothesis-revision collects, each row
    referencing that exact revision.
  met: true
  how: CREATE TABLE hypothesis_revision_collects, PRIMARY KEY (case_slug, hypothesis_name, revision, concept_name),
    FOREIGN KEY (case_slug, hypothesis_name, revision) REFERENCES hypothesis_revisions — each row names
    its exact owning revision.
- criterion: case_version_hypotheses (the manifest) associates one case version, one hypothesis, its adopted
    revision and a position, with position unique within one version's own manifest.
  met: true
  how: CREATE TABLE case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position),
    PRIMARY KEY (case_slug, case_version, hypothesis_name), and CONSTRAINT case_version_hypotheses_position_unique
    UNIQUE (case_slug, case_version, position).
- criterion: An UPDATE against a case_versions row already in released state is refused or no-ops.
  met: true
  how: CREATE OR REPLACE RULE case_versions_no_update AS ON UPDATE TO case_versions WHERE OLD.state =
    'released' DO INSTEAD NOTHING — fires exactly when the pre-update row is released.
- criterion: An UPDATE transitioning a still-draft case_versions row (including to released) is not blocked
    by this same rule.
  met: true
  how: The same rule's WHERE OLD.state = 'released' is false for any row whose OLD.state is 'draft', including
    the one UPDATE that sets state to 'released' — the rule does not apply and the UPDATE proceeds ordinarily.
- criterion: The old hypotheses/hypothesis_collects tables (migration 0004) are dropped in favor of the
    tables above, with no row-transformation logic, since no data need be preserved.
  met: true
  how: DROP TABLE hypothesis_collects; DROP TABLE hypotheses; — two bare DROP statements, no SELECT/INSERT
    moving any row into the new tables.
- criterion: The migration is a new script numbered next in sequence; migration 0006 is not edited in
    place.
  met: true
  how: Written as migrations/0009-case-version-lifecycle-schema.sql, the next zero-padded number after
    0008; 0006-case-version-immutability.sql is not opened for writing — its rule is superseded at the
    schema level by this script's own CREATE OR REPLACE RULE statement, not by editing 0006's file.
nodes:
- node: domain/knowledge/case
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: cases.next_version is the durable counter the node's own next_version attribute names.
- node: domain/knowledge/case-version
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: case_versions.state and .released_at are the two attributes this script adds; the node's manifest
    attribute is case_version_hypotheses, also added here.
- node: domain/knowledge/case-version-state
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: case_versions_state_check restricts the column to exactly the enumeration's two values.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: 'case_version_hypotheses is the table: position plus a reference to exactly one hypothesis_revisions
    row.'
- node: domain/knowledge/hypothesis
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: hypotheses is rebuilt to hold only the node's name attribute, keyed by (case_slug, name).
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: hypothesis_revisions carries revision, criterion, collects (via hypothesis_revision_collects) and
    resolution, referencing the hypothesis it belongs to.
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: The case_versions half is case_versions_no_update (replaced, release-conditioned). The manifest
    half — "every manifest entry it composes is never altered again" — is answered beyond the literal
    criteria by case_version_hypotheses_no_update_when_released and case_version_hypotheses_no_delete_when_released,
    both firing only when the owning case_versions row is released.
- node: rules/knowledge/a-case-version-number-is-never-reused
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: cases.next_version is a durable counter never reset or reissued by a discard; the counter's own
    advance-on-create-draft logic belongs to a different task, but the durable column this rule needs
    is here.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: PRIMARY KEY (case_slug, hypothesis_name, revision) on hypothesis_revisions makes a reused revision
    number for one hypothesis a primary-key violation; "numbered exactly one past the highest existing
    revision" is the revise() operation's arithmetic, not a fact this schema states.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: case_versions_state_check is the declarative floor of the state machine (only draft/released are
    storable at all); the transition trigger itself (release()) is a different task's operation.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: PRIMARY KEY (case_slug, name) on the rebuilt hypotheses table, now version-less, so uniqueness
    holds across every version the case ever holds.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: CONSTRAINT case_version_hypotheses_position_unique UNIQUE (case_slug, case_version, position),
    stated on position alone.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: hypothesis_revisions_no_update refuses every UPDATE unconditionally, a fortiori satisfying the
    narrower "never altered once referenced by a released version."
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: Beyond the literal eleven criteria (none of which mention DELETE), case_versions_no_delete_when_released
    refuses/no-ops DELETE where OLD.state = 'released'; a draft row's DELETE (discard) is left ordinary.
- node: rules/knowledge/a-case-has-at-most-one-draft
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: case_versions_one_draft_per_case, a partial unique index on (slug) WHERE state = 'draft'.
- node: rules/knowledge/every-position-declares-a-resolution
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: The hypothesis-revision half is answered by hypothesis_revisions' required resolution_outcome/action/recipient
    columns. The case version's own fallback half is untouched by this migration — an earlier migration
    already made case_versions.fallback_outcome/action/recipient required, and this script does not reach
    that column at all.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  encoded_at:
  - migrations/0009-case-version-lifecycle-schema.sql
  how: 'Structurally reproduced: once version 1 is released, its case_version_hypotheses rows can no longer
    be updated or deleted (case_version_hypotheses_no_update_when_released / _no_delete_when_released),
    and the hypothesis_revisions row it references can never be altered by any UPDATE at all — so reading
    version 1 again after version 2 exists and is released still finds the original reference and the
    original content, unchanged.'
- node: constraints/a-case-is-read-whole
  how: This migration's own normalized split (hypothesis, its revisions and, for a draft, the manifest,
    as three independently writable relations) honors the constraint's second clause. The constraint's
    first clause — the whole-assembly, validated-or-nothing read path — is not reached by a schema migration
    at all; it belongs to the case-query read-path task, deferred below.
inferences:
- inferred: 'cases.next_version keeps its DEFAULT 1 (not dropped after backfill): it both backfills every
    pre-existing case row and remains the sensible value for a genuinely new case row that has never yet
    had a draft.'
  from: domain/knowledge/case's own description — "the number this case's next draft is assigned" for
    a case with no prior version is naturally 1 — and the absence of any node stating what an ADD COLUMN
    NOT NULL should backfill pre-existing rows with.
- inferred: case_versions.state is backfilled to 'released' for every pre-existing row via its DEFAULT,
    and that DEFAULT is kept permanently rather than dropped, so any insert that does not name state —
    every currently-shipped write path, since none of that code has been rewritten by this task — continues
    to store 'released' exactly as it implicitly did before this migration.
  from: migration 0006's own already-applied case_versions_no_update rule, which made every case_versions
    row unconditionally immutable before this script ran — the closest fact on hand to what "released"
    already meant for a row this migration cannot ask a curator about; no specification node addresses
    this backfill value, and none of this task's eleven criteria requires the default's removal once
    backfilled.
- inferred: 'Closed two gaps beyond the literal eleven criteria: an UPDATE/DELETE-refusal pair on case_version_hypotheses
    conditioned on its owning case_versions row being released, and a DELETE-refusal on case_versions
    conditioned on its own released state.'
  from: rules/knowledge/a-case-version-is-written-once ("every manifest entry it composes is never altered
    again") and rules/knowledge/only-a-draft-case-version-may-be-discarded ("a released version is never
    removed"), both named in this task's implements, together with the task's own UNDERDETERMINED notes
    flagging exactly these two gaps and the objective's own "enforcing every invariant a declarative constraint
    can express."
divergences:
- cites: MIG-03
  file: migrations/0009-case-version-lifecycle-schema.sql
  departure: This script drops hypotheses and hypothesis_collects (destroying whatever rows either held)
    with no reverse migration shipped beside it.
  why: src/src/persistence/migration-runner.ts applies every .sql file under migrations/ forward, unconditionally,
    in filename order, the moment it is not yet recorded in schema_migrations — there is no separate up/down
    channel. A reverse script placed in this directory would not wait "beside" this one for a person to
    run on purpose; it would be picked up and applied in the same replay, undoing this very migration
    immediately. Satisfying MIG-03 as written is not reachable from inside this project's own migration
    mechanism for a script of this kind, so the departure is disclosed rather than silently omitted the
    way 0007 omitted one for a table no migration or seed script ever populated.
preserved:
- "Every currently-shipped write path that inserts into case_versions without naming state — RelationalCaseStore.writeVersion
  and everything built on it (the store, the factories, author-case-version.service.ts) — none of which
  this task rewrites. case_versions.state keeps its DEFAULT 'released' permanently so such an insert continues
  to behave exactly as it does today, matching what was already true before this migration (every row
  unconditionally immutable under 0006's own case_versions_no_update)."
- The existing forward-replay of migrations 0001 through 0008 against an empty database, unchanged and
  untouched by this script.
- migration 0006's own file, left unedited; its case_versions_no_update rule name is reused by this script's
  CREATE OR REPLACE RULE rather than altered by editing 0006 itself.
- migration-runner.ts's own behavior of applying every .sql file under migrations/ forward, unconditionally,
  in filename order — this script is written to fit that mechanism rather than to require a change to
  it.
- Every other table this schema already holds (subject_types, concepts, capabilities, investigations and
  its child tables, connector_configurations, schema_migrations) and their existing constraints, none
  of which this script touches.
deferred:
- what: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version — copying an existing
    version's manifest entry-for-entry as a new draft's starting content.
  why: This is the effect of the create-draft (or rollback) operation, not a fact a declarative schema
    constraint expresses; no criterion of this task touches it. Belongs to the task implementing that
    operation.
- what: The case-version fallback half of rules/knowledge/every-position-declares-a-resolution — a case
    version's own fallback declaring an outcome and a referral.
  why: This migration only adds state and released_at to case_versions and does not touch the existing
    fallback_outcome/action/recipient columns, which an earlier migration already made required. Belongs
    to that earlier task.
- what: The whole-assembly, validated-or-nothing read path constraints/a-case-is-read-whole's first clause
    names.
  why: Belongs to the task implementing the case-query/read-path that assembles and validates a case version
    whole, not to this schema-migration task.
- what: No DELETE-refusal protects hypothesis_revisions or hypothesis_revision_collects rows structurally,
    even though rules/knowledge/a-hypothesis-revision-number-is-never-reused's own description states
    a hypothesis-revision "is never discarded."
  why: The task's own notes flagged only the case_versions and case_version_hypotheses DELETE gaps as
    sound to close beyond the literal eleven criteria; this one was not among them, and extending the
    same treatment here on my own judgment would widen the task past what was flagged. Left for a person
    to decide whether it belongs in a later corrective task.
- what: case_version_hypotheses' foreign key to case_versions carries no ON DELETE CASCADE, so discarding
    a draft case_versions row requires its own case_version_hypotheses rows to be deleted first, in the
    same transaction, by the discard() operation itself.
  why: Choosing the delete behavior for that operation is that operation's own transactional concern,
    not a fact this schema-only task should decide on its behalf.
---

## What it is

The DDL that gives the case-version lifecycle its draft/released state, a durable version counter, and hypothesis identity split from its revisioned content behind a manifest.
It is the one place the migration convention (never editing an applied script) and the case_versions_no_update risk both had to be answered together.

## Notes

This delivery closed two gaps beyond the task's literal eleven criteria — manifest immutability on release, and DELETE-refusal on a released case_versions row — because the specification nodes this task implements already state both and a declarative constraint can express them; see `inferences` and each node's `how`.
The MIG-03 divergence is structural: this project's migration runner has no up/down channel, so a reverse script for a DROP TABLE cannot be shipped "beside" the forward one without being replayed immediately and undoing this very migration.
