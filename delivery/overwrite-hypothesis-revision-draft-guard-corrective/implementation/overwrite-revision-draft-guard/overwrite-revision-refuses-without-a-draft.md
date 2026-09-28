---
target: backend
title: overwriteRevision refuses without a draft
summary: overwriteHypothesisRevision now runs the same requireCaseHoldsDraft guard insertRevision already
  applies, refusing with CaseHoldsNoDraftError before any write when the case holds no draft.
task: sha256:a76cba771d14c032d44dd944d218bba278bddd9a7fa649009705a6bc63e53aed
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-build-3
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: overwriteRevision now opens with await requireCaseHoldsDraft(tx, input.slug) — the same helper
    insertRevision already calls first — so an overwrite against a case holding no draft version throws
    CaseHoldsNoDraftError before the UPDATE, the collects delete, or the collects re-insert ever runs.
    Nothing else in the method changed.
criteria:
- criterion: Overwriting a hypothesis-revision through the case store, for a case that currently holds
    no draft version, is refused with CaseHoldsNoDraftError whose message names the case slug and whose
    details carry that slug and nothing else.
  met: true
  how: requireCaseHoldsDraft selects the case's draft version and, finding none, throws new CaseHoldsNoDraftError(slug);
    that error's own constructor (src/errors/case-holds-no-draft.error.ts, untouched by this task) sets
    message from the slug alone and context = { slug }.
- criterion: A refused overwrite (per the criterion above) leaves the hypothesis-revision's stored criterion,
    collects and resolution unchanged.
  met: true
  how: requireCaseHoldsDraft is awaited before revisionOverwriteStatement (the UPDATE) or either collects
    statement runs, all inside runInTransaction, so a thrown CaseHoldsNoDraftError leaves no UPDATE, DELETE
    or INSERT issued against the row.
- criterion: Overwriting a hypothesis-revision through the case store, for a case that currently holds
    a draft version, replaces that revision's stored criterion, collects and resolution with the newly
    submitted values, in place, without changing the revision number.
  met: true
  how: 'Unchanged from before this task: once requireCaseHoldsDraft finds a draft and returns, overwriteRevision
    runs the same revisionOverwriteStatement UPDATE (by slug/hypothesis_name/revision, never touching
    the revision column), then deletes and re-inserts the collects rows, replacing the row in place under
    its existing revision number.'
- criterion: Overwriting a hypothesis-revision that is in released state, for a case that currently holds
    no draft version, is refused with CaseHoldsNoDraftError and never with ReleasedHypothesisRevisionNotAlterableError,
    whether alone or alongside it.
  met: true
  how: ReleasedHypothesisRevisionNotAlterableError only surfaces through raiseOverwriteFailure, which
    only translates a cause the UPDATE statement itself raises (the hypothesis_revisions_no_update trigger).
    Because requireCaseHoldsDraft now throws before that UPDATE ever executes, an attempt against a released
    revision when the case holds no draft never reaches the trigger, so that error is never raised, alone
    or alongside CaseHoldsNoDraftError.
nodes:
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: 'The statement that a revision requested while the case holds no draft version is refused with
    CaseHoldsNoDraftError, that error alone, before any of the hypothesis''s revisions is written into,
    is now honored on the overwrite path the same way it already was on insert: overwriteRevision calls
    requireCaseHoldsDraft first, so the case-store layer refuses before any revision row is touched. The
    concept-acceptance check against the draft''s declared subject type and the HTTP 409 mapping are the
    revise-hypothesis route/service''s concern, not reached by this store-level guard, per this task''s
    own REMAINDER notes.'
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The clause that an overwrite replaces the revision's content in place and leaves its number unchanged
    is what overwriteRevision's three statements already did and still do once the new draft-guard clears.
    The routing between insert and overwrite, and creating revision 1 for a hypothesis with none, are
    the revise routing's concern per this task's own REMAINDER notes, and are unchanged by this task.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The node's own state discipline — before release, a further edit replaces its content in place
    and its number stays exactly what it already was — is what overwriteRevision continues to do for a
    draft-holding case; this task only adds the case-holds-a-draft precondition to the write path.
inferences:
- inferred: The new await requireCaseHoldsDraft(tx, input.slug); call is placed as the first statement
    of overwriteRevision, mirroring its position as the first statement of insertRevision.
  from: The task's own "What it is" names this exact placement ("it gains the same requireCaseHoldsDraft
    guard insertRevision already applies"), though it names no line number.
preserved:
- The revisionOverwriteStatement UPDATE, the collects delete, and the collects re-insert inside overwriteRevision
  are unchanged.
- insertRevision's own requireCaseHoldsDraft call and every other RelationalCaseStore method are unchanged.
deferred:
- what: The concept-acceptance check reading the draft version's declared subject type, and the HTTP 409
    response shape for this refusal, both named in rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.
  why: Both sit in the revise-hypothesis route and service layer, out of this task's scope per its own
    REMAINDER notes.
- what: The revise-hypothesis routing that decides insert vs. overwrite vs. revision-1 creation.
  why: Unchanged by this task per its own REMAINDER notes; this task only hardens the overwrite guard
    the routing already calls into.

---

## What it is

The corrective fix to `overwriteHypothesisRevision`'s case store implementation: it gains the
same `requireCaseHoldsDraft` guard `insertRevision` already applies, refusing the write with
`CaseHoldsNoDraftError` before touching the stored revision.

## Notes

The first build attempt
(run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-build) and its
retry (…-build-2, killed incomplete by the caller after it hung) both failed at test-unit on
`ETIMEDOUT` connecting to the test Postgres instance (10.252.4.205:30671) from
`vitest-global-setup.ts`'s schema resolution — confirmed by a direct `nc` connection test as a
standing network-reachability gap in the session's environment, unrelated to this task's source.
The human confirmed the environment should have returned; a direct connectivity check then
succeeded, and the third attempt (…-build-3, pinned above) passed clean across every step.
