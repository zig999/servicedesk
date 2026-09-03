---
title: Store write guards against a non-draft version
summary: placeHypothesis, removeManifestEntry, release, discard and insertRevision in RelationalCaseStore
  now read the version's (or case's) state and refuse the write before it happens, mirroring the read-state-then-refuse-or-write
  shape updateDraftVersion already used.
task: sha256:26121ff629a63ce27a6005afe0ae116eea26fbee42fb72c3e724f320071796f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/released-version-write-guards-refuse-writes-against-a-non-draft-version-build-3
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: 'Imports CaseHoldsNoDraftError and CaseVersionNotDraftAtReleaseError alongside the already-imported
    CaseVersionNotDraftError and CaseNotFoundError. placeHypothesis, removeManifestEntry and release are
    now routed through runInTransaction (discard and insertHypothesisRevision already were). Five guarded
    functions replace their former unguarded bodies: insertManifestEntry (placeHypothesis), deleteManifestEntry
    (removeManifestEntry), releaseVersion (release), discardDraft (discard, extended in place) and insertRevision
    (extended in place) each read state/draft-presence before writing and refuse otherwise. A shared trio
    -- requireVersionState (reads case_versions.state via caseVersionStateSelect/queryOneOrAbsent, throwing
    CaseNotFoundError when the row is absent), refuseUnlessDraft (throws CaseVersionNotDraftError) and
    refuseUnlessDraftAtRelease (throws CaseVersionNotDraftAtReleaseError) -- is introduced and updateDraftVersion
    is refactored onto it too, so the read-then-refuse block exists once rather than five times. insertRevision
    gains requireCaseHoldsDraft, reusing the existing draftVersionSelect(slug) query (the same one findDraftVersion
    already runs) and throwing CaseHoldsNoDraftError before touching the hypotheses or hypothesis_revisions
    tables. No public method signature, DTO/port type, or read path changed.'
criteria:
- criterion: place-hypothesis called against a version that is not in draft state is refused with CaseVersionNotDraftError,
    and no manifest entry is inserted.
  met: true
  how: insertManifestEntry reads the version's state via requireVersionState before running placeHypothesisStatement;
    refuseUnlessDraft throws CaseVersionNotDraftError(slug, version, state) when state !== 'draft', inside
    the same transaction, before the INSERT ever runs.
- criterion: remove-hypothesis (removeManifestEntry) called against a version that is not in draft state
    is refused with CaseVersionNotDraftError, and no manifest entry is deleted.
  met: true
  how: deleteManifestEntry reads the version's state via requireVersionState and calls refuseUnlessDraft
    before running removeManifestEntryStatement's DELETE, inside the same transaction.
- criterion: release called against a version that is not in draft state is refused with CaseVersionNotDraftAtReleaseError,
    and neither its state nor its released_at is changed.
  met: true
  how: releaseVersion reads the version's state via requireVersionState and calls refuseUnlessDraftAtRelease
    (throwing CaseVersionNotDraftAtReleaseError) before running releaseStatement's UPDATE, inside the
    same transaction.
- criterion: discard called against a version that is not in draft state is refused with the stated error,
    and neither the version row nor its manifest entries are deleted.
  met: true
  how: discardDraft now reads the version's state via requireVersionState and calls refuseUnlessDraft
    (CaseVersionNotDraftError, per this task's ADVISORY note locating the error at rules/knowledge/a-case-version-moves-through-its-declared-lifecycle's
    "a lifecycle operation other than release" clause) before either DELETE statement runs, inside the
    same transaction discard already opened.
- criterion: insertHypothesisRevision called against a case that currently holds no draft version is refused
    with CaseHoldsNoDraftError, and no hypothesis revision is inserted.
  met: true
  how: insertRevision calls requireCaseHoldsDraft(tx, input.slug) first, which reuses draftVersionSelect(slug)
    (the same query findDraftVersion already runs) and throws CaseHoldsNoDraftError(slug) when no row
    comes back -- before hypothesisIdentityStatement, revisionInsertStatement or any collect insert runs,
    inside the transaction insertHypothesisRevision already opened.
- criterion: place-hypothesis, remove-hypothesis, release and discard each still succeed, exactly as before
    this task, when called against a version that is in draft state.
  met: true
  how: requireVersionState returns 'draft', refuseUnlessDraft/refuseUnlessDraftAtRelease no-op, and each
    function falls through to the exact same statement (placeHypothesisStatement with raisePlaceHypothesisFailure
    preserved for ManifestPositionOccupiedError, removeManifestEntryStatement, releaseStatement, the two
    discard DELETEs) it ran before this task, with the same params and the same error mapping.
- criterion: insertHypothesisRevision still succeeds, exactly as before this task, when called against
    a case that currently holds a draft version.
  met: true
  how: requireCaseHoldsDraft finds the draft row and returns without throwing; the rest of insertRevision
    (hypothesisIdentityStatement, insertRevisionRow, the per-concept revisionCollectStatement loop) is
    unchanged from before this task.
nodes:
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The statement's "a lifecycle operation other than release ... refused ... reporting a CaseVersionNotDraftError"
    clause is encoded by refuseUnlessDraft, used by insertManifestEntry (placeHypothesis), deleteManifestEntry
    (removeManifestEntry), discardDraft and updateDraftVersion. Its "release ... refused ... reporting
    a CaseVersionNotDraftAtReleaseError" clause is encoded by refuseUnlessDraftAtRelease, used by releaseVersion.
    The node's own HTTP 409 clause is out of scope here per this task's own REMAINDER note -- it names
    no criterion of this task and belongs to the HTTP layer's error-to-status mapping task.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The "a revision requested while the case holds no draft version is refused ... reporting a CaseHoldsNoDraftError"
    clause is encoded by requireCaseHoldsDraft, called first inside insertRevision, via the existing draftVersionSelect
    query. The statement's concept-acceptance-check-uses-the-draft's-subject-type clause is UNDERDETERMINED
    by this task's own criteria (see decision below) and is deliberately not encoded; its HTTP 409 clause
    is likewise out of scope per this task's own REMAINDER note.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The invariant ("a case version may be discarded only while in draft state") is encoded by discardDraft's
    new guard -- requireVersionState followed by refuseUnlessDraft -- raised before either of discard's
    two DELETE statements runs. The error it raises, CaseVersionNotDraftError, is not this node's own
    statement (which names none) but the one this task's ADVISORY note locates at rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    instead.
inferences:
- inferred: placeHypothesis and removeManifestEntry (previously single-statement calls directly on this.connection,
    with release the same) are now wrapped in runInTransaction, exactly as updateDraftVersion, discard
    and insertHypothesisRevision already were.
  from: The task's instruction to mirror updateDraftVersion's own shape, which reads state and writes
    inside one transaction; and the standard's EDG-05 ("A write spanning more than one statement runs
    in a transaction that rolls back as a whole"), applies_to .repository.ts -- the guard read and the
    conditional write must be atomic against a concurrent state change, which a bare connection.query()
    pair cannot guarantee.
- inferred: A version row absent from case_versions (queryOneOrAbsent returning undefined) is refused
    with CaseNotFoundError in insertManifestEntry, deleteManifestEntry, releaseVersion and discardDraft,
    exactly as it already was in updateDraftVersion.
  from: The task note's own wording -- "the same read-state-then-refuse-or-write guard updateDraftVersion
    already uses" -- and the structural fact that caseVersionStateSelect via queryOneOrAbsent can return
    no row, which updateDraftVersion's own precedent already resolves by raising CaseNotFoundError rather
    than treating an absent row as a state to compare.
- inferred: The read-then-refuse block is factored into one shared requireVersionState/refuseUnlessDraft/refuseUnlessDraftAtRelease
    trio rather than repeated inline five times, and updateDraftVersion is refactored onto the same trio.
  from: the standard's MNT-03 ("A block of logic that already exists somewhere in this project is called,
    not copied").
- inferred: insertRevision's draft-presence check reuses draftVersionSelect(slug) unmodified -- the same
    query findDraftVersion already runs -- rather than a new query.
  from: the task note's explicit instruction ("keyed by slug alone since a case holds at most one draft
    at a time") together with the standard's MNT-03.
preserved:
- 'What must keep working, verified unchanged: the page''s total (countCases/casesCountSelect, counting
  cases rows only), the pagination envelope''s limit/offset/pageCount composition (pageCountOf and the
  return object shape in listCasesPage), the cases-page''s own slug-ascending arrangement and its LIMIT/OFFSET
  parameter positions, and every other ICaseStore method (listCaseVersions, listHypotheses, listHypothesisRevisions,
  createDraft, placeHypothesis''s success path, updateDraft) and their own SQL, none of which this task
  touched beyond the guard itself.'
deferred:
- what: The HTTP 409 response each of CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError and
    CaseHoldsNoDraftError maps to.
  why: This task's own REMAINDER note locates the response-status half of each clause at the HTTP layer's
    error-to-status mapping task; no criterion of this task reaches it, and the objective bounds the work
    to the refusal raised inside relational-case-store.repository.ts.
- what: Anchoring insertHypothesisRevision's concept-acceptance check to the case's draft version's own
    declared subject type.
  why: 'This task''s own UNDERDETERMINED note records that no criterion of this task reaches that clause
    of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft. A first attempt at closing
    it was written and then reverted by the human''s own decision: the fix, correct in isolation, sits
    inside insertRevision -- a function every hypothesis-revision write in the codebase passes through
    -- and its refusal fired earlier than three other already-delivered tests'' own premises (a foreign-key
    violation on an unregistered concept, and a release-time coherence check both meant to be reached
    first), one of them in a closed initiative. The gap stays open, disclosed here and in the task''s
    own UNDERDETERMINED note, for a scope of its own.'
---

## What it is

Five write paths in RelationalCaseStore (placeHypothesis, removeManifestEntry, release, discard, insertRevision) read the version's or case's current state before writing and refuse when it does not allow the operation, mirroring updateDraftVersion's own existing shape. A shared requireVersionState/refuseUnlessDraft/refuseUnlessDraftAtRelease trio holds the read-then-refuse logic once; requireCaseHoldsDraft, reusing the existing draft-lookup query, guards insertRevision against a case with no draft.

## Notes

This is a corrective increment: the wrong behavior was pre-existing in code task/case-catalog/store-derives-the-case-summary never touched, found by /review-change's conformance pass over that task's first review.
A concept-acceptance check was added to insertRevision to close this task's own UNDERDETERMINED note, then reverted by the human's explicit decision after it broke fourteen tests across three files -- eleven in a closed initiative's own suite -- whose premises the earlier refusal made unreachable. The gap stays UNDERDETERMINED, disclosed above under deferred, for its own scope.
