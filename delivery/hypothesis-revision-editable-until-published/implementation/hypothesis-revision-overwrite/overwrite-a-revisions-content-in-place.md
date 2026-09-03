---
title: Overwrite a hypothesis revision's content in place
summary: A new case-store port capability and its relational write replace an existing hypothesis revision's
  criterion, collects and resolution wholesale while leaving its own revision number untouched.
task: sha256:ad0118c86e54f4b97c1411392fea3be32899830e2700846a1ffd75c052d67abe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-build-2
files:
- path: src/case/case-store.port.ts
  effect: declares OverwriteHypothesisRevisionInput, HypothesisRevisionInput extended with a revision
    field naming the exact existing revision to overwrite; ICaseStore itself is untouched
- path: src/case/hypothesis-revision-overwrite.port.ts
  effect: new file declaring IHypothesisRevisionOverwrite, a port separate from ICaseStore exposing overwriteHypothesisRevision(input);
    the file imports only the OverwriteHypothesisRevisionInput type from case-store.port.ts, so a caller
    depending on this port alone imports no driver, framework or provider client
- path: src/persistence/relational-case-store.repository.ts
  effect: RelationalCaseStore now also implements IHypothesisRevisionOverwrite; overwriteHypothesisRevision
    runs, inside one transaction, an UPDATE against the named (case_slug, hypothesis_name, revision) row
    setting criterion/resolution_outcome/resolution_action/resolution_recipient (revisionOverwriteStatement),
    then a DELETE of every existing hypothesis_revision_collects row for that exact revision (revisionCollectsDeleteStatement),
    then a fresh INSERT per concept the replacement carries, reusing the existing revisionCollectStatement;
    the revision column itself is never written by any of these statements. The UPDATE's own failure raiser
    (raiseOverwriteFailure) additionally recognizes migration 0019's trigger-raised ReleasedHypothesisRevisionNotAlterableError
    message and re-raises it as the same-named typed error instead of the generic write-failure wrapper,
    reusing the isConstraintViolation-style translation this file already applies for other driver-raised
    conditions (raisePlaceHypothesisFailure)
- path: src/errors/released-hypothesis-revision-not-alterable.error.ts
  effect: new file declaring ReleasedHypothesisRevisionNotAlterableError, a typed Error a caller of overwriteHypothesisRevision
    can distinguish from an ordinary write failure by class, carrying the slug/hypothesis_name/revision
    the refusal was raised against
criteria:
- criterion: After the replacement, that revision's number is the number it held before.
  met: true
  how: revisionOverwriteStatement's UPDATE names the target row by case_slug/hypothesis_name/revision
    in its WHERE clause and its SET list never includes the revision column, so the row's own number is
    never written to
- criterion: After the replacement, reading that revision answers the criterion and the resolution the
    replacement carried.
  met: true
  how: the same UPDATE's SET list writes input.criterion and the three resolution columns (via referralColumns),
    so any subsequent read of hypothesis_revisions for that key (listHypothesisRevisionsPage, assembleWholeVersion's
    manifest join) returns exactly the replacement's criterion and resolution
- criterion: After the replacement, reading that revision's collects answers exactly the concepts the
    replacement carried.
  met: true
  how: overwriteRevision inserts one hypothesis_revision_collects row per entry of input.collects, keyed
    to the same revision, immediately after clearing the table below — a subsequent read (collectsByRevision,
    manifestCollectsSelect) returns exactly that set
- criterion: After the replacement, none of the concepts the revision collected before the replacement
    is answered by that revision's collects.
  met: true
  how: revisionCollectsDeleteStatement deletes every hypothesis_revision_collects row for that exact (case_slug,
    hypothesis_name, revision) before any new row is inserted, so no concept from before the replacement
    survives unless the replacement names it again
- criterion: After the replacement, the hypothesis holds exactly the revisions it held before, no more
    and no fewer.
  met: true
  how: overwriteRevision issues no INSERT and no DELETE against hypothesis_revisions itself — only the
    UPDATE on the one existing row named by the input — so the row count for that hypothesis is unchanged
- criterion: The replacement assigns no revision number that the hypothesis had already assigned to a
    different revision.
  met: true
  how: no statement in overwriteRevision computes or assigns a revision number at all; the number is supplied
    by the caller as the identity of the row to update, so nothing is newly assigned and nothing already
    assigned elsewhere can be collided with
nodes:
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: this rule's own outcome for the unreleased branch — "replacing its content in place and leaving
    its number unchanged" — is exactly what overwriteRevision performs; the clause selecting which revision
    is that hypothesis's highest one, the released-vs-unreleased routing, and "a hypothesis holding no
    revision yet always creates revision 1" are not reached here, per the task's own REMAINDER notes —
    those belong to the sibling task that decides and wires the choice
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: only the rule's third clause — a number once assigned is never reused — is answered, by criteria
    one and six; the write never touches the revision column and never mints a new one, so the number
    named before the overwrite is the number named after, exactly as this rule's own description says
    an in-place replacement is not a reuse. The first two clauses (numbering the first revision 1; numbering
    a later one exactly one past the highest) are not reached, per the task's own REMAINDER note
- node: domain/knowledge/hypothesis
  how: the write is scoped by the hypothesis's own identity (case_slug, hypothesis_name) as the WHERE
    key for every statement overwriteRevision issues, without altering that identity or its name; no new
    fact of this node's own attributes reaches the code
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: OverwriteHypothesisRevisionInput carries this node's own content triad — criterion, collects, resolution
    — plus the revision identifying which numbered state is targeted; the relational write replaces exactly
    that triad in place while leaving revision untouched, which is this node's own description of what
    a further edit does before a revision is frozen
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/case/hypothesis-revision-overwrite.port.ts
  how: the port module declaring the capability and its input type imports nothing but a type from case-store.port.ts
    (itself a pure domain module); every driver-facing detail — the pg-backed DatabaseConnection, the
    parameterized UPDATE/DELETE/INSERT statements — stays inside relational-case-store.repository.ts,
    reached only through the port
inferences:
- inferred: the overwrite capability is exposed as a new port, IHypothesisRevisionOverwrite, rather than
    as a new method added directly to ICaseStore
  from: the identical choice already made and disclosed by the sibling task read-highest-revision-and-release-state's
    delivery record, for the same reason — adding the method to ICaseStore directly would break every
    existing ICaseStore implementer at typecheck (RelationalCaseStore's own inline test doubles in case-query.service.spec.ts,
    build-app.spec.ts and update-draft.routes.spec.ts)
- inferred: overwriteHypothesisRevision returns Promise<void> rather than echoing back the revision number,
    unlike insertHypothesisRevision's Promise<number>
  from: insertHypothesisRevision must report a number the store itself computes (COALESCE(MAX(revision),
    0) + 1); the revision to overwrite is instead supplied entirely by the caller as part of the input,
    so the store has nothing to compute that the caller does not already hold
- inferred: 'OverwriteHypothesisRevisionInput is declared as HypothesisRevisionInput & { revision: number
    } in case-store.port.ts, beside its sibling insert-input type, rather than as an independently duplicated
    shape in the new port file'
  from: case-store.port.ts already being the one home for every domain input/output shape this store answers
    to (CreateDraftInput, PlaceHypothesisInput, HypothesisRevisionInput itself), and the standard's MNT-03
    (a block of logic that already exists is called, not copied)
- inferred: the revision's collects are replaced by an unconditional delete of every existing row for
    that revision followed by a fresh insert per carried concept, rather than a diff against the previous
    set
  from: criteria three and four together describe a wholesale replacement ("exactly the concepts the replacement
    carried" / "none of the concepts... before... is answered... after"), and the inventory's own note
    that these rows "must also be replaced (deleted-then-reinserted, or diffed)" and that the schema's
    release-conditioned DELETE rule on this table "already tolerates a delete against an unreleased revision's
    collects"
- inferred: the UPDATE performs no existence check of its own — no read-before-write, no typed "revision
    not found" error — before writing into the named revision
  from: the task's own REMAINDER note that selecting which revision to write into "belongs to the task
    of this epic that implements the revise-hypothesis operation," so this port's caller is expected to
    supply a revision it already resolved to exist; no criterion here exercises a not-found path
- inferred: the UPDATE's own error raiser distinguishes the trigger-raised ReleasedHypothesisRevisionNotAlterableError
    from an ordinary write failure by re-raising a same-named typed Error, rather than leaving it to fall
    through as the generic "a write against the case store failed"
  from: this file's own existing convention of translating a specific driver-raised condition into a typed
    Error for a caller to react to (raisePlaceHypothesisFailure's isConstraintViolation check), applied
    here to the one other driver-raised condition this task's own write can provoke; no criterion requires
    it, and it performs no released-state check of its own — the schema trigger the dependency task delivered
    still decides the refusal, this only stops swallowing what it already raises
preserved:
- ICaseStore's existing shape and every method on it, so RelationalCaseStore's existing test doubles (FakeCaseStore
  in case-query.service.spec.ts, the inline ICaseStore mocks in build-app.spec.ts and update-draft.routes.spec.ts)
  keep compiling unchanged
- every existing insert-side write path (insertHypothesisRevision, insertRevision, insertRevisionRow,
  revisionInsertStatement) and its SQL, untouched by this task
- migration 0019's release-conditioned trigger on hypothesis_revisions and 0010's release-conditioned
  delete rule on hypothesis_revision_collects, both already in place before this task and relied on rather
  than altered
deferred:
- what: no module yet calls overwriteHypothesisRevision — ReviseHypothesisOperation still unconditionally
    calls insertHypothesisRevision, and nothing decides between the two paths yet
  why: the task's own REMAINDER notes assign that decision, and the wiring it requires, to task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision,
    which depends on this task
- what: mapping ReleasedHypothesisRevisionNotAlterableError to the rule's stated HTTP 409 response, and
    performing a released-state read of its own before issuing the UPDATE (rather than only reacting to
    what the trigger already raised)
  why: this task's own UNDERDETERMINED note and the dependency task's own deferred note both place the
    response shaping at the revise-hypothesis endpoint; this task's write now lets a caller distinguish
    the refusal by error class, which is the store-layer half, but decides no HTTP status and reads no
    release state of its own
- what: migration 0009's own inline comment above hypothesis_revisions_no_update still describes that
    rule as refusing every UPDATE unconditionally "a fortiori", which migration 0019 already superseded
    with a release-conditioned trigger
  why: 0009 is not a file this task touches or was asked to touch; the staleness predates this task and
    sits in a migration script, which this project's own conventions treat as an append-only historical
    record rather than a file this task may edit
---

## What it is
A write path that overwrites one revision's own content rather than adding a numbered one beside it.
Its collects are replaced wholesale, so a concept dropped from the revision stops being collected by it.

## Notes
run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-build passed against the source as first written; run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-build-2 is a later build against the source as it stands now, after the write's own error raiser was revised to distinguish the released-referenced refusal — the earlier run no longer reflects the tree and is superseded by this one.
