---
target: backend
title: Guard hypothesis-revision release on its currently stored state
summary: RelationalCaseStore's releaseHypothesisRevisionRow now reads the revision's
  own current state before writing and refuses with HypothesisRevisionNotDraftAtReleaseError
  unless that state is draft, including when no row was ever stored.
task: sha256:e2b34567226f496c4f46d675ffab568d861b43cbf29459fe877940ff37048285
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-revision-release-guard-guard-release-on-current-state-build
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: releaseHypothesisRevisionRow reads the revision's own current state (via
    the existing resolveHypothesisRevisionOwnState helper, in the same transaction)
    through a new refuseUnlessHypothesisRevisionDraftAtRelease guard before issuing
    the UPDATE; anything other than draft — including an identity nothing was ever
    stored for, which resolves to undefined — throws HypothesisRevisionNotDraftAtReleaseError
    before any write runs. Import of HypothesisRevisionNotDraftAtReleaseError added
    alongside the file's other error imports.
criteria:
- criterion: Releasing a hypothesis-revision whose currently stored state is not draft
    is refused with HypothesisRevisionNotDraftAtReleaseError, and the row is left
    exactly as it stood.
  met: true
  how: refuseUnlessHypothesisRevisionDraftAtRelease throws before releaseHypothesisRevisionStatement
    is run whenever the read-back state is not the draft constant, and the throw happens
    inside the same transaction that would have performed the UPDATE, so no write
    is issued and the row is untouched.
- criterion: Releasing a hypothesis-revision identity that has never been stored at
    all is refused with HypothesisRevisionNotDraftAtReleaseError.
  met: true
  how: resolveHypothesisRevisionOwnState returns undefined when no row matches the
    key; undefined is compared against the draft constant by the same guard and fails
    it identically to a stored-but-released row, raising the same error with no branch
    distinguishing the two cases.
- criterion: Releasing a hypothesis-revision whose currently stored state is draft
    succeeds, and the row reads released afterward.
  met: true
  how: when the read-back state equals the draft constant the guard returns without
    throwing and releaseHypothesisRevisionStatement's UPDATE runs, setting state to
    the released constant; a subsequent read through readHypothesisRevisionOwnState
    (unchanged) reports released.
nodes:
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: Implements the state-machine's release transition guard at the persistence
    boundary this task's criteria are scoped to — release is refused with HypothesisRevisionNotDraftAtReleaseError
    whenever the revision does not currently stand in draft, including the never-stored
    identity the rule's statement names explicitly. This task's Notes record that
    the same statement's HTTP 409 clause is out of scope here (it belongs to the task
    delivering the release-hypothesis HTTP surface), so no status mapping was added.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The guard reads only the revision's own row (resolveHypothesisRevisionOwnState
    against hypothesis_revisions keyed by case_slug/hypothesis_name/revision) and
    never a case version's state or manifest, matching this node's statement that
    release is taken directly against the revision and answers to no case version
    or manifest.
- node: domain/knowledge/hypothesis-revision-state
  how: The guard's comparison is against the two-value enumeration this node names
    (draft/released), reusing the existing HypothesisRevisionState type and HYPOTHESIS_REVISION_DRAFT_STATE
    constant already declared in the file; no new value or field was added to the
    enumeration itself, so no new encoding of the node's own fact was needed here.
inferences:
- inferred: The guard belongs inside releaseHypothesisRevisionRow itself (checked
    in the same transaction as the write) rather than only at the operation layer
    that already existed above it.
  from: The task's objective states the refusal as "Releasing a hypothesis-revision
    through RelationalCaseStore is refused..." and its Notes scope every criterion
    to releaseHypothesisRevisionRow specifically; the sibling releaseVersion function
    in the same file already guards its own UPDATE this way (requireVersionState +
    refuseUnlessDraftAtRelease) for case-version release, which this change mirrors
    for symmetry (MNT-03 — a block of logic already established in this project is
    reused, not reinvented).
- inferred: The already-existing pre-check in ReleaseHypothesisRevisionOperation (release-hypothesis-revision.operation.ts)
    was left untouched rather than removed as redundant.
  from: The task's Notes scope every criterion to the store method alone and say nothing
    about the operation layer; removing or altering it would widen a task that named
    only the store's own guard.
preserved:
- ReleaseHypothesisRevisionOperation's own pre-release state check and its existing
  passing integration tests, unaffected by the store now performing the same check
  a second time inside its own transaction.
- overwriteRevision's existing refusal of edits against an already-released row (ReleasedHypothesisRevisionNotAlterableError),
  untouched by this change.
- releaseVersion's own case-version draft guard and every other RelationalCaseStore
  method, none of which this task's edit reaches.
deferred:
- what: Mapping HypothesisRevisionNotDraftAtReleaseError to an HTTP 409 response.
  why: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
    also requires that mapping, but the task's own Notes (REMAINDER) record that every
    criterion here is scoped to releaseHypothesisRevisionRow inside RelationalCaseStore,
    which raises a domain error and maps no status; the mapping belongs to the task
    delivering the release-hypothesis HTTP surface of contracts/knowledge/case-lifecycle.
---

## What it is
None.

## Notes
None.
