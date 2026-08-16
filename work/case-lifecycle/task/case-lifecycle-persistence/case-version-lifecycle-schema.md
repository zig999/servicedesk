---
title: Case-version lifecycle schema migration
summary: A new, sequentially-numbered migration script (or scripts) that gives case_versions a state and released_at, cases a durable version counter, and splits hypothesis identity from its revisioned content behind a manifest — while fixing migration 0006's blanket update refusal so a draft row stays writable.
rationale: The scope leaves the exact table/column split and the script count to whoever implements; I bundled the new tables with the fix to migration 0006's blanket update refusal into one task because both answer one objective — a schema that can hold a draft open to further writes while keeping a released row immutable — and the scope names this exact conflict as something this plan must resolve, without prescribing how many files it takes.
sources:
- work/case-lifecycle/intake/scope.md
objective: The relational schema persists a case version's draft/released lifecycle, a manifest joining a version to the hypothesis-revisions it adopts, and hypothesis identity separated from its revisioned content, enforcing every invariant a declarative constraint can express.
criteria:
- case_versions gains a state column restricted by CHECK to draft or released, and a released_at column.
- cases gains a durable version counter column, never computed from MAX(version) over existing rows.
- A constraint permits at most one case_versions row in draft state per case at any time.
- hypotheses becomes an identity-only table keyed by (case_slug, name), carrying no content column.
- hypothesis_revisions holds one numbered row per revision of a hypothesis's content (criterion, resolution outcome/action/recipient), keyed by (case_slug, hypothesis_name, revision), and an UPDATE against an already-stored row is refused or no-ops rather than silently changing it.
- hypothesis_revision_collects holds the concepts one hypothesis-revision collects, each row referencing that exact revision.
- case_version_hypotheses (the manifest) associates one case version, one hypothesis, its adopted revision and a position, with position unique within one version's own manifest.
- An UPDATE against a case_versions row already in released state is refused or no-ops.
- An UPDATE transitioning a still-draft case_versions row (including to released) is not blocked by this same rule.
- The old hypotheses/hypothesis_collects tables (migration 0004) are dropped in favor of the tables above, with no row-transformation logic, since no data need be preserved.
- The migration is a new script numbered next in sequence; migration 0006 is not edited in place.
implements:
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/every-position-declares-a-resolution
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/a-case-is-read-whole
---

## What it is

The DDL that stores everything §2 of the scope describes: two new columns on an existing table, one new column on another, four new or replaced tables, and a corrected immutability rule.
It is the one place the migration convention (never editing an applied script) and the case_versions_no_update risk both have to be answered together.

## Notes

RESOLVED — the BLOCKING note this task previously carried (domain/knowledge/case declaring only `slug`, contradicting this task's version-counter criterion) is settled: domain/knowledge/case now declares a required `next_version` integer attribute, extending the specification per the human's explicit choice, disclosed in the specification's own append-only decision record. This task's `implements` was rebound fresh against the updated node and now also names rules/knowledge/a-hypothesis-revision-number-is-never-reused, which the fifth criterion (numbering a revision one past the hypothesis's own highest existing revision) answers to.
UNDERDETERMINED, from the specification — rules/knowledge/a-case-version-is-written-once states that a released case version, "and every manifest entry it composes," is never altered again — reinforced by scenarios/knowledge/a-released-version-keeps-its-original-revision. This task's only update-protection criterion (the eighth) scopes the refusal to the case_versions row itself; no criterion protects case_version_hypotheses rows from UPDATE once their owning case version is released. A test must exclude: a migration satisfying every listed criterion literally — a CHECK/trigger refusing UPDATE against case_versions only when its own state is released, with case_version_hypotheses left ordinarily updatable regardless of whether the case version it belongs to is released — letting a released version's manifest be silently changed after release.
UNDERDETERMINED, from the specification — rules/knowledge/only-a-draft-case-version-may-be-discarded states a released case_versions row is never removed, and this task's own objective claims to enforce "every invariant a declarative constraint can express," yet no criterion addresses DELETE at all. A test must exclude: a migration implementing all eleven listed criteria with no CHECK, rule or trigger preventing DELETE against a case_versions row whose state is released, allowing a released version to be silently discarded.
REMAINDER, from the specification — rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version describes copying an existing version's manifest entry-for-entry as a draft's starting content. This is the effect of an operation (create-draft / rollback), not a fact a declarative schema constraint expresses, and no criterion of this task touches it. Belongs to: the task implementing the create-draft (or rollback) operation that composes a new draft's initial manifest, not this schema-migration task.
REMAINDER, from the specification — rules/knowledge/every-position-declares-a-resolution states that "every hypothesis-revision and every case version's fallback declare an outcome and a referral." Criterion 5 addresses the hypothesis-revision half; the case-version fallback half reaches no criterion here — this migration only adds state and released_at to case_versions and does not touch the existing fallback column. Belongs to: the earlier task that established case_versions and its required fallback column.
REMAINDER, from the specification — constraints/a-case-is-read-whole states two things: a case version read for diagnosis is assembled and validated whole in one transaction, and a hypothesis, its revisions and a draft's own manifest entries may otherwise be created, read, revised or removed independently. This task's normalized table split satisfies the second clause; no criterion here addresses the first, the whole-assembly validated-or-nothing read path. Belongs to: the task implementing the case-query/read-path that assembles and validates a case version whole.
