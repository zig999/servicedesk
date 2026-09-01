---
title: Persistence deadline uses remaining time and retries — proof
summary: Tests for run-diagnosis.ts's fixed persistence bound/retry/id-keyed-settlement behavior and status-map.ts's
  new InvestigationWriteDeadlineExceededError mapping, reconciling pre-existing tests that asserted the
  exact old behavior this task deliberately replaced.
implementation: sha256:46339bb357876fc6f4479afafc9e4009d78a66979fcb7da18f4fe1d26880df6a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/run-diagnosis-persistence-deadline-hotfix-persistence-deadline-uses-remaining-time-and-retries-suite
tests:
- file: src/investigation/run-diagnosis.spec.ts
  name: bounds persistence by the time actually remaining once collection has already consumed part of
    the declared deadline, never by the deadline computed against the request's original entry instant
  proves: criterion 1 (the bound is the smaller remaining figure, never the deadline computed against
    the request's original entry instant)
  fails_when: persistence's own bound is computed as min(2000, deadline-now) without subtracting durations
    already spent — the deadline error would then fire at 1000ms after the 700ms collection delay instead
    of at 300ms
- file: src/investigation/run-diagnosis.spec.ts
  name: holds the first write attempt to the whole of the persistence stage bound — its own unchanged
    2000ms nominal budget — rather than capping it below to reserve time for a retry
  proves: criterion 2 (PERSISTENCE_STAGE_BUDGET_MS stays 2000ms) together with criterion 4 (the first
    attempt is held to the whole bound, never capped below it)
  fails_when: the first attempt's own race is capped below the full 2000ms bound to reserve time for a
    retry — a write taking 1999ms would then time out before settling
- file: src/investigation/run-diagnosis.spec.ts
  name: issues no write attempt at all when persistence's own bound is zero or less, raising immediately
    instead
  proves: criterion 3 (a zero-or-less bound issues no write attempt at all)
  fails_when: store.write() is ever called when the computed stage bound is zero or negative
- file: src/investigation/run-diagnosis.spec.ts
  name: retries exactly once after a first attempt fails outright, succeeding on that retry when it still
    fits within what remains of the stage bound
  proves: criterion 5 (a failed first attempt leaving time unspent is retried exactly once)
  fails_when: a failed first attempt is not retried at all, or is retried more than once
- file: src/investigation/run-diagnosis.spec.ts
  name: bounds the retry by whatever of the stage bound the first attempt's own elapsed time left unspent,
    rather than granting it a fresh budget of its own
  proves: criterion 5's own remaining-time bound
  fails_when: the retry is given its own fresh full-bound grant instead of racing the original shared
    timer — the deadline error would then fire at 3500ms rather than exactly 2000ms
- file: src/investigation/run-diagnosis.spec.ts
  name: does not retry when the first attempt runs until the stage bound itself elapses without settling
  proves: criterion 6 (a first attempt that runs out the stage bound is not retried)
  fails_when: a second write() call is issued after the first attempt times out
- file: src/investigation/run-diagnosis.spec.ts
  name: resolves normally, with no retry issued, when the first write attempt finds the investigation
    already stored under its own id
  proves: criterion 7's first-attempt half (an already-stored id counts as settled, no second record,
    no deadline error)
  fails_when: runDiagnosis rejects with InvestigationAlreadyStoredError instead of resolving, or resolves
    with anything other than the expected assessment, or a retry is issued
- file: src/investigation/run-diagnosis.spec.ts
  name: settles successfully without raising the deadline error when the retry — not the first attempt
    — finds the investigation already stored
  proves: criterion 7's retry half (the retry, not just the first attempt, counts an already-stored id
    as settled)
  fails_when: runDiagnosis raises InvestigationWriteDeadlineExceededError, or rejects, when the retry
    (not the first attempt) hits InvestigationAlreadyStoredError
- file: src/investigation/run-diagnosis.spec.ts
  name: raises InvestigationWriteDeadlineExceededError, not the raw failure, once both a genuine first-attempt
    write failure and its retry reject outright
  proves: criterion 8's "an attempt failed outright" clause
  fails_when: runDiagnosis rejects with the raw write failure instead of InvestigationWriteDeadlineExceededError,
    or the retry is never issued
- file: src/investigation/run-diagnosis.spec.ts
  name: settles both of two concurrent runs for the same investigation id successfully, neither raising
    the deadline error, while the store still ends up holding exactly one record
  proves: criterion 7 under concurrency, and rules/investigation/an-investigation-is-written-once's own
    no-duplicate guarantee
  fails_when: either run rejects, or the two runs' own outcomes are not both the expected assessment,
    or the store ends up holding anything other than one record for the shared id
- file: src/errors/status-map.spec.ts
  name: resolves InvestigationWriteDeadlineExceededError to 500
  proves: criterion 9's mapping half (the error resolves to a transport status at all, and that status
    is 500)
  fails_when: statusForError(new InvestigationWriteDeadlineExceededError(...)) answers anything other
    than 500, including undefined
- file: src/errors/status-map.spec.ts
  name: the header comment names eleven specification nodes that now fix a status as a decided fact, and
    states ConnectorConfigurationNotWellFormedError's 422 and SubjectDoesNotCoverCaseInputsError's 422
    and ConnectorPlaceholderOutsideInputSchemaError's 422 as facts their own rules decide rather than
    as this project's own engineering decision
  proves: the header's own running count of specification-fixed statuses now includes this hotfix's thirteenth
    entry
  fails_when: the header still states 'twelve specification nodes' after this hotfix added a thirteenth
- file: src/errors/status-map.spec.ts
  name: the header names InvestigationWriteDeadlineExceededError's HTTP 500 as a fact rules/investigation/no-stage-aborts-on-its-deadline
    decides, quoting its own closing clause
  proves: the header documents this status as a specification-fixed fact rather than an undisclosed engineering
    choice, citing the governing rule by identity
  fails_when: the header omits the class name, the rule citation, or the rule's own quoted closing clause
- file: src/http/error-handler.middleware.spec.ts
  name: answers InvestigationWriteDeadlineExceededError with a named 500 envelope, naming the error rather
    than falling back to the generic, unnamed one
  proves: 'criterion 9 in full, at the wire level: the requester receives HTTP 500 naming InvestigationWriteDeadlineExceededError
    as the reported condition, with its own message and context as details'
  fails_when: 'the response''s status is not 500, or its body is the generic {code: ''INTERNAL_ERROR'',
    ...} envelope instead of the named domain envelope, or the details do not equal the error''s own context'
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment, and
    leaves no investigation readable by its id immediately afterward, when the investigation write is
    slowed past the persistence deadline
  proves: criterion 9 against a real, externally provisioned PostgreSQL database rather than a fake store
  fails_when: the response's code is not 'InvestigationWriteDeadlineExceededError', or its details do
    not carry this run's own captured id and a remainingMs between 0 and 2000ms, or an investigation is
    readable by that id immediately after the response
untested:
- Whether real durations.judgment or durations.writing (as opposed to durations.collection, which every
  new test here exercises) independently shrink persistence's own bound is not separately proven — every
  new test uses immediate (zero-elapsed) evaluators and consolidators; persistenceStageBoundMs's own formula
  sums all three uniformly, so a defect isolated to only the judgment or writing term specifically is
  not discriminated by any test here.
- The deferred behavior itself (a settlement via InvestigationAlreadyStoredError answering from the locally-built
  investigation rather than a re-read of the actual stored record) is proven as a fact about what this
  delivery does, but whether that is the right answer to rules/investigation/the-response-follows-the-record
  or rules/investigation/replay-is-pinned is out of this task's own scope, per the implementation record's
  own `deferred` entry, and stays unproven here as well.
---

## What it is

Sixteen tests proving the nine criteria of the persistence-deadline-uses-remaining-time-and-retries
task: ten in run-diagnosis.spec.ts (two of them reconciling pre-existing assertions of the old,
now-replaced behavior), two in status-map.spec.ts, one in error-handler.middleware.spec.ts, and one
integration test against a real PostgreSQL database reconciling a pre-existing e2e assertion.

## Notes

Two pre-existing tests asserted the exact behavior this task deliberately replaced and were
rewritten in place rather than left standing beside new ones: one asserted a genuine write failure
propagating unmodified with no retry (now retries once, raising InvestigationWriteDeadlineExceededError
only if both attempts fail), and one asserted that exactly one of two concurrent runs for the same
investigation id was refused (now both settle successfully, with the store holding exactly one
record).
No UNDERDETERMINED entries existed in the task's own Notes to exclude, and no contested disagreement
with the implementation was recorded.
