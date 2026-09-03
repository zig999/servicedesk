---
title: Refuse a released hypothesis-revision's alteration from its own state
summary: A migration that moves the schema's release-conditioned refusal on hypothesis_revisions and hypothesis_revision_collects
  off the case-version join and onto the revision's own state column.
task: sha256:9b2a0a5599c0197e6768d05c13f66210ac62ef1b7d19736fefc5b35638236ff2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-refuse-altering-a-released-revision-build
files:
- path: migrations/0021-refuse-altering-a-released-revision.sql
  effect: Replaces hypothesis_revisions_refuse_when_released() (bound, unchanged, to the existing hypothesis_revisions_no_update_when_released
    trigger) in place so its refusal condition reads OLD.state = 'released' instead of an EXISTS join
    through case_version_hypotheses and case_versions, and replaces hypothesis_revision_collects_no_delete_when_released
    the same way so its DELETE-refusal condition reads hypothesis_revisions.state for the collect row's
    own revision instead of joining out through the manifest to a case version's state. The RAISE EXCEPTION
    text ('ReleasedHypothesisRevisionNotAlterableError'), the trigger name, and the rule name are all
    unchanged, so no other file needed editing to keep translating the raw database error into the domain
    error and its HTTP 409.
criteria:
- criterion: An attempt to alter a stored hypothesis-revision whose own state is released is refused at
    the point of the attempt, reporting a ReleasedHypothesisRevisionNotAlterableError.
  met: true
  how: hypothesis_revisions_refuse_when_released() now raises 'ReleasedHypothesisRevisionNotAlterableError'
    whenever OLD.state = 'released', at the moment of the UPDATE itself (BEFORE UPDATE trigger). relational-case-store.repository.ts's
    raiseOverwriteFailure already matches that exact exception message and throws the domain error class
    of the same name; status-map.ts already maps it to HTTP 409. Neither needed a change, since the message
    text and the trigger's binding are unchanged — only the condition inside the function moved.
- criterion: An attempt to alter a stored hypothesis-revision whose own state is draft is not refused
    by this rule, even where a case version in released state references that revision.
  met: true
  how: The condition is OLD.state = 'released' alone; a draft revision's OLD.state is 'draft', so the
    IF is false and the UPDATE proceeds, regardless of whether any case version's manifest references
    the row or what state that case version is in — the function no longer reads case_version_hypotheses
    or case_versions at all.
- criterion: A hypothesis-revision whose own state is released and which no case version's manifest has
    ever referenced is refused alteration the same way.
  met: true
  how: Because the condition reads only OLD.state, a released revision refuses every UPDATE whether or
    not case_version_hypotheses ever gained a row pointing at it — the previous EXISTS join, which required
    exactly such a row, is gone.
- criterion: The condition the refusal fires on names the hypothesis-revision row's own state and reads
    no case version relation and no manifest relation.
  met: true
  how: hypothesis_revisions_refuse_when_released()'s body is `IF OLD.state = 'released' THEN RAISE EXCEPTION
    ...`, naming only the row's own state column; it contains no reference to case_versions or case_version_hypotheses.
- criterion: The collects of a hypothesis-revision whose own state is released read back unchanged after
    an attempt to remove them.
  met: true
  how: hypothesis_revision_collects_no_delete_when_released's WHERE clause now checks EXISTS a hypothesis_revisions
    row matching the collect row's own (case_slug, hypothesis_name, revision) with state = 'released'
    — true whenever the owning revision is released, with or without any case version ever having referenced
    it — so the DELETE is a no-op (DO INSTEAD NOTHING) and the row reads back unchanged.
- criterion: The collects of a hypothesis-revision whose own state is draft may still be removed, even
    where a case version in released state references that revision.
  met: true
  how: The same WHERE clause is false whenever the owning hypothesis_revisions row's state is 'draft',
    regardless of any case_version_hypotheses/case_versions row that might point at it — the rule no longer
    reads either table — so the DELETE proceeds ordinarily.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  how: '"Once released, this content never changes again" and "A case version''s manifest may point at
    this revision in either state; pointing at it moves neither" are now read literally by the schema:
    the refusal (on the revision row and on its collects) depends only on the revision''s own state, never
    on whether or how any case version''s manifest points at it.'
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  how: The value both refusal conditions compare against ('released') is exactly a value of this enumeration,
    read from the hypothesis_revisions.state column 0020 already paired with this node.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  how: The invariant's refusal — "an attempt to alter its stored content is refused at the point of the
    attempt ... rather than being accepted and left with no effect" — is what both replaced conditions
    enforce, now keyed on the revision's own release state rather than on a case-version join that could
    miss an unreferenced released revision or wrongly catch a draft one referenced by a released version's
    manifest.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  how: This migration adds no column; both replaced conditions read the one column 0020 already paired
    with hypothesis-revision.state, so the pairing this constraint requires is unchanged by this task.
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  how: A plain numbered .sql file beside its twenty siblings under src/migrations/, applied once in filename
    order by migration-runner.ts (readdir + sort), with no step performed by hand.
inferences:
- inferred: hypothesis_revision_collects_no_delete_when_released's condition should move onto hypothesis_revisions.state
    for the collect row's own (case_slug, hypothesis_name, revision), not only hypothesis_revisions_no_update_when_released's
    own condition.
  from: Criteria 5 and 6 state the collects refusal purely in terms of the owning revision's "own state,"
    with no qualifier about any case version referencing it — the same decoupling the task's objective
    states for the revision row itself — and the sibling migration 0010's own header already established
    that hypothesis_revision_collects needs its own explicit rule because nothing else in the schema shields
    it.
- inferred: CREATE OR REPLACE FUNCTION (for the trigger's function body) and CREATE OR REPLACE RULE (for
    the collects rule) are the right shape, leaving the trigger and rule names, and the trigger's binding,
    untouched.
  from: The inventory's own convention statement ("A release-conditioned immutability rule... is expressed
    declaratively as CREATE RULE... an unconditional block uses a plain trigger instead") plus 0009's
    own use of CREATE OR REPLACE RULE for exactly this kind of condition-only change to an existing declarative
    rule, and the risk note that "0019's replacement trigger" is "referenced by name in later integration
    schema specs" — preserving the name was necessary to avoid breaking that reference for no reason this
    task required.
deferred:
- what: released-hypothesis-revision-not-alterable.error.ts's message still narrates "is referenced by
    a case version in released state," which is no longer necessarily true once this migration refuses
    alteration on a released revision no case version has ever referenced.
  why: The inventory lists this file's role for this task as depends-on, not touched — this task's own
    module scope is the migration alone. Rewording a message this task's inventory does not assign it
    risks widening past what was cut, and no criterion here names the message's wording (only the error
    class name, which is unchanged).
preserved:
- The RAISE EXCEPTION message text 'ReleasedHypothesisRevisionNotAlterableError', which relational-case-store.repository.ts's
  isReleasedRevisionRefusal pattern-matches on to raise the domain error, and which status-map.ts maps
  to HTTP 409 — neither file was touched.
- The trigger name hypothesis_revisions_no_update_when_released and its binding to hypothesis_revisions_refuse_when_released(),
  which revision-alteration-refused-only-when-released-schema.spec.ts asserts by name.
- The rule name hypothesis_revision_collects_no_delete_when_released, and the untouched, unconditional
  hypothesis_revision_collects_no_update rule beside it.
- Every migration file 0001 through 0020, unmodified, and the filename-order replay migration-runner.ts
  performs over all twenty-one.
---

## What it is

The schema's own guarantee that released content never moves, read from the revision's own state instead of from a join to the case versions that reference it — both on the hypothesis_revisions row itself and on its collects.
It replaces the condition the current trigger and rule fire on, which refused an update or delete only once some released case version happened to reference the row.

## Notes

None.
