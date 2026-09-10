---
target: backend
title: Guard hypothesis-revision release on its currently stored state
summary: Proves that releaseHypothesisRevisionRow refuses release with HypothesisRevisionNotDraftAtReleaseError
  whenever the revision's own current state is not draft — including an identity never
  stored — leaves the row untouched on refusal, succeeds and marks the row released
  when the state is draft, and raises the refusal identically across both triggering
  branches.
implementation: sha256:f30e61183e2f96a3da4391c21f030c7dabf07ac4f87e92f07917c207befaf195
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-revision-release-guard-guard-release-on-current-state-suite
tests:
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: releases a hypothesis-revision whose currently stored state is draft, updating
    its own state to released
  proves: Releasing a hypothesis-revision whose currently stored state is draft succeeds,
    and the row reads released afterward.
  fails_when: the guard refuses a hypothesis-revision whose read-back state is draft,
    or no UPDATE statement setting state to released is issued with the expected key
    and value.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses releaseHypothesisRevision with HypothesisRevisionNotDraftAtReleaseError,
    and issues no UPDATE, when the revision's currently stored state is not draft
  proves: Releasing a hypothesis-revision whose currently stored state is not draft
    is refused with HypothesisRevisionNotDraftAtReleaseError, and the row is left
    exactly as it stood.
  fails_when: releasing a revision whose read-back state is released succeeds, raises
    a different error, or an UPDATE statement is issued despite the refusal.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses releaseHypothesisRevision with HypothesisRevisionNotDraftAtReleaseError,
    and issues no UPDATE, when the identity has never been stored at all
  proves: Releasing a hypothesis-revision identity that has never been stored at all
    is refused with HypothesisRevisionNotDraftAtReleaseError.
  fails_when: releasing an identity for which the state read resolves to undefined
    succeeds, raises a different error, or an UPDATE statement is issued despite the
    refusal.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises HypothesisRevisionNotDraftAtReleaseError with the exact same message
    and no own field beyond name, whether the revision was already released or was
    never stored at all
  proves: UNDERDETERMINED, from the specification — HypothesisRevisionNotDraftAtReleaseError
    must carry no further value beyond its own condition and message, and in particular
    never which of the two triggers (already-released vs never-stored) raised it.
  fails_when: the error raised across the two branches carries a different message,
    or either instance carries an own enumerable field beyond name (for example a
    state field distinguishing which branch raised it).
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: releases a hypothesis-revision whose currently stored state is draft, reading
    released back afterward
  proves: Releasing a hypothesis-revision whose currently stored state is draft succeeds,
    and the row reads released afterward (against the real database).
  fails_when: the real write is refused for a draft-state revision, or a subsequent
    readHypothesisRevisionOwnState call does not report released.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses releasing a hypothesis-revision already released, through HypothesisRevisionNotDraftAtReleaseError,
    leaving its own stored state exactly as it was
  proves: Releasing a hypothesis-revision whose currently stored state is not draft
    is refused with HypothesisRevisionNotDraftAtReleaseError, and the row is left
    exactly as it stood (against the real database).
  fails_when: a second release call against an already-released revision succeeds,
    raises a different error, or its stored state reads as anything other than released
    afterward.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses releasing a hypothesis-revision identity that was never stored at
    all, through HypothesisRevisionNotDraftAtReleaseError
  proves: Releasing a hypothesis-revision identity that has never been stored at all
    is refused with HypothesisRevisionNotDraftAtReleaseError (against the real database).
  fails_when: releasing an identity nothing was ever stored under succeeds or raises
    a different error against the real database.
not_applicable:
- edge_case: Absent, malformed or out-of-range slug/hypothesis-name/revision input
    reaching releaseHypothesisRevisionRow.
  why: the task's own Notes (REMAINDER) scope every criterion to releaseHypothesisRevisionRow
    inside RelationalCaseStore, which receives already-typed arguments from its caller;
    input validation happens at the HTTP/DTO boundary a different task owns, not here.
- edge_case: A dependency (the database driver) that fails or answers slowly during
    the release write.
  why: that wrapping is the shared runInTransaction/raiseWriteFailure mechanism every
    write method in this repository inherits unconditionally, already exercised in
    both spec files by the equivalent tests for release, discard and insertHypothesisRevision;
    this task changed no code in that mechanism and states no criterion about it,
    so re-exercising it against this one method would prove nothing this task added.
- edge_case: A uniqueness violation, or an empty collection returned where one is
    expected.
  why: releasing a hypothesis-revision performs one UPDATE keyed on an existing composite
    key and returns void; no uniqueness constraint or collection is at stake in this
    operation.
- edge_case: A boundary at either end of a numeric range on the revision identity.
  why: the guard's condition is a state-equality check (draft vs anything else, including
    undefined), not a range comparison; there is no boundary for a revision number
    to cross.
untested:
- 'Two concurrent release calls against the same hypothesis-revision identity: refuseUnlessHypothesisRevisionDraftAtRelease
  reads the current state with a plain SELECT carrying no row lock, so nothing here
  rules out two concurrent transactions both reading draft and both then writing released.
  None of this task''s three criteria states a concurrency requirement, and the guard''s
  own SQL mirrors releaseVersion''s pre-existing, similarly unlocked guard elsewhere
  in this file, so proving or disproving serialization here would be judging a database
  isolation guarantee neither this task''s criteria nor the sibling code they mirror
  state one way or the other.'
---

## What it is
None.

## Notes
None.
