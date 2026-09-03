---
title: Release-conditioned refusal on hypothesis_revisions UPDATE
summary: A new migration replaces the unconditional no-update rule on hypothesis_revisions with a per-row
  trigger that refuses an UPDATE, raising a distinguishable error, only when a released case version's
  manifest still references that exact revision.
task: sha256:7d762b4b30351efe3b25f1a9e64596adfc997fde7144b0daffb42098d0e449fc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-revision-alteration-refused-only-when-released-build
files:
- path: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  effect: drops the unconditional hypothesis_revisions_no_update rule and replaces it with a BEFORE UPDATE
    trigger that refuses an UPDATE, raising ReleasedHypothesisRevisionNotAlterableError, only when a released
    case version's manifest still references the row's own revision
criteria:
- criterion: Applying every migration script in its numbered order to an empty database produces the schema
    the tree expects, with no step performed by hand.
  met: true
  how: The file is filename-numbered 0019, one past the tree's current highest (0018), so migration-runner.ts's
    own filename-order replay picks it up last, after every table and rule it reads (hypothesis_revisions,
    case_version_hypotheses, case_versions) already exists from 0009. It is pure DDL/PL/pgSQL — a DROP
    RULE, a CREATE FUNCTION and a CREATE TRIGGER — with no interactive or hand-run step.
- criterion: An update to a hypothesis revision that no case version in released state references is not
    refused by the schema's own rule over that relation.
  met: true
  how: The unconditional hypothesis_revisions_no_update RULE is dropped. The new BEFORE UPDATE FOR EACH
    ROW trigger's EXISTS check reaches through case_version_hypotheses to case_versions for a row matching
    OLD's case_slug/hypothesis_name/revision with state = 'released'; when none exists, the guard is false,
    the trigger RETURNs NEW, and the UPDATE proceeds exactly as it would with no rule installed at all.
- criterion: An update to a hypothesis revision that a case version in released state references through
    its manifest leaves that revision's stored content exactly as it was.
  met: true
  how: When the EXISTS guard is true, the trigger RAISEs an exception before RETURNing, which happens
    before the row is written and aborts the UPDATE statement — the stored row is never touched, so its
    content stays exactly what it was, the same outcome the sibling case_versions_no_update / case_version_hypotheses_no_update_when_released
    rules already guarantee for their own tables, reached here through a trigger rather than a rule.
- criterion: An update to a hypothesis revision that only case versions in draft state reference is not
    refused by the schema's own rule over that relation.
  met: true
  how: The guard's own WHERE clause filters the joined case_versions row on state = 'released'; a revision
    manifested only by draft-state case versions never satisfies it (their cv.state is 'draft'), so the
    trigger allows the UPDATE through, the same as when no case version references the revision at all.
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  how: The new rule replaces prior behavior through a fresh numbered file (0019) rather than an edit to
    0009's own file, so replaying every script in order on an empty database still reconstructs the schema
    the tree expects, with the final state of hypothesis_revisions' own UPDATE protection decided by whichever
    script runs last.
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  how: The trigger's guard is exactly this rule's condition — "referenced by any case version in released
    state" — read through the manifest join case_version_hypotheses/case_versions, the same join shape
    0009's case_version_hypotheses rules and 0010's collects-delete rule already use. Where the guard
    holds, the attempt is refused by RAISE EXCEPTION carrying the rule's own named error, ReleasedHypothesisRevisionNotAlterableError,
    at the point of the attempt and before any write — not accepted and left with no effect, which the
    unconditional DO INSTEAD NOTHING rule it replaces could not distinguish from a genuine refusal. Turning
    that raised, distinguishable exception into the stated HTTP 409 response is the revise-hypothesis
    endpoint's own work, outside this migration; the task's own notes flag this boundary explicitly.
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  how: Only this rule's negative half is answered here, per the task's own REMAINDER note — an update
    to a hypothesis's highest revision that no released case version references is not refused by the
    schema. Which revision a revise() call actually targets, whether it writes in place versus creates
    the next revision, and revision-1 creation for a hypothesis holding none yet are the revise-hypothesis
    operation task's own arithmetic, deferred exactly as the task's Notes describe.
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: domain/knowledge/hypothesis-revision
  how: '"Once any case version in released state manifests it, this content never changes again" is now
    enforced by the schema raising on the attempt rather than only by no code path issuing an UPDATE;
    "before that point ... a further edit replaces its content in place" is the case the trigger leaves
    untouched, letting an ordinary UPDATE through.'
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: domain/knowledge/case-version
  how: The trigger's guard reads case_versions.state = 'released' — the fact this node declares governs
    whether the version, and everything it manifests, may still be altered — as the condition deciding
    refusal.
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: domain/knowledge/manifest-entry
  how: The guard reaches the released case_versions row through case_version_hypotheses — this node's
    own table — matching OLD's hypothesis_name and revision against the entry's own reference, which is
    exactly "which revision of that hypothesis's content it uses."
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
inferences:
- inferred: The refusal is raised through a BEFORE UPDATE trigger rather than a PostgreSQL RULE, the shape
    0009 and 0010 use for their own release-conditioned protections.
  from: A RULE can only unconditionally rewrite or unconditionally no-op an UPDATE — it cannot conditionally
    allow a write through while raising a distinguishable error on the other branch, and the rule's own
    statement rules out "accepted and left with no effect" for the released case; nothing in the specification
    or the standard names the mechanism, only the observable refuse-with-error-vs-silently-drop behavior.
- inferred: The raised exception's identifying text is the literal string ReleasedHypothesisRevisionNotAlterableError,
    left at PostgreSQL's default SQLSTATE (P0001).
  from: The rule's own statement names that exact error; no node or the standard states a SQLSTATE convention,
    so a caller distinguishes it by message rather than by a custom error code.
divergences:
- from: the codebase's own prior migration convention (migrations 0009 and 0010 document the specification
    mapping and rationale inline as a header comment)
  departure: The new migration file carries no explanatory header comment.
  why: The framework's own rule that source carries no comments beyond a tool directive or a suppression's
    reason places that reasoning in this record instead; this is a departure from the codebase's own prior
    migration convention, not from the project's backend-node-service.yaml standard, whose MNT-02/PRH-04
    rules do not reach a .sql file under migrations (MNT-02 scopes .ts files under src; PRH-04's own applies_to
    also names suffix .ts).
deferred:
- what: The revise-hypothesis operation's own decision of where to write (overwrite the highest revision
    in place vs. create the next revision vs. create revision 1) and its issuing the conditional UPDATE
    this schema now permits — rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's
    positive clauses.
  why: Per this task's own REMAINDER note, this belongs to the revise-hypothesis operation task under
    contracts/knowledge/case-lifecycle.
- what: Catching the raised ReleasedHypothesisRevisionNotAlterableError exception at the store/operation
    layer and surfacing it as the HTTP 409 the rule's statement names.
  why: The response shaping the task's own UNDERDETERMINED note assigns to the revise-hypothesis endpoint,
    not to this schema task.
---

## What it is
A new migration (0019) drops the unconditional `hypothesis_revisions_no_update` RULE and replaces it with a BEFORE UPDATE trigger that refuses only an UPDATE to a hypothesis revision a released case version's manifest still references, raising a distinguishable exception (`ReleasedHypothesisRevisionNotAlterableError`) rather than silently dropping the write.
An UPDATE to a revision no released case version references — whether unreferenced or referenced only by draft-state versions — passes through unchanged, exactly as if no rule existed.

## Notes
A RULE can only unconditionally rewrite or unconditionally no-op an UPDATE; it cannot conditionally allow a write through while raising a distinguishable error on the other branch. The refusal is therefore a trigger rather than a RULE, departing from the RULE shape 0009 and 0010 use for their own release-conditioned protections — the mechanism is not stated by any node or by the standard, only the observable refuse-with-error-vs-silently-drop behavior is.
The raised exception carries the literal message `ReleasedHypothesisRevisionNotAlterableError` at PostgreSQL's default SQLSTATE (P0001); no node or standard states a SQLSTATE convention. Mapping this raised exception to the rule's stated HTTP 409 response is the revise-hypothesis endpoint's own work, outside this migration, per the task's own UNDERDETERMINED note.
Only the negative half of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased is answered here, per the task's own REMAINDER note; where a revise writes, and creating revision 1 for a hypothesis holding none yet, belong to the revise-hypothesis operation task.
The migration carries no explanatory header comment, departing from 0009/0010's own convention of documenting the specification mapping inline — the framework's comment rule places that reasoning in this record instead, and this is a departure from the codebase's own prior convention rather than from the project's own standard, whose MNT-02/PRH-04 rules do not reach a .sql file.
