---
title: Persistence deadline uses remaining time and retries
summary: Fixes writeWithinDeadline in run-diagnosis.ts to bound persistence's write against the time actually
  remaining before the propagated deadline (derived from the pipeline's own already-measured durations,
  never a clock read), retries a failed first attempt once within whatever of that same bound is left,
  treats any attempt that finds the investigation's own id already stored as settled, and maps InvestigationWriteDeadlineExceededError
  to a named HTTP 500 in status-map.ts.
task: sha256:544a5a0dcdc0b3df1782b1300a81d669320fe4579f0edbb5c917edc0eda48b4d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/run-diagnosis-persistence-deadline-hotfix-persistence-deadline-uses-remaining-time-and-retries-build
files:
- path: src/investigation/run-diagnosis.ts
  effect: Persistence's own bound is now computed as min(PERSISTENCE_STAGE_BUDGET_MS, deadline - now -
    (durations.collection + durations.judgment + durations.writing)) via persistenceStageBoundMs, instead
    of the old min(BUDGET, deadline - now) that ignored time already spent in earlier stages. A bound
    of zero or less issues no write at all and raises InvestigationWriteDeadlineExceededError immediately.
    Otherwise persistWithinBound races a first store.write() against one shared stageTimeout(stageBoundMs);
    only where that first attempt rejects with anything other than InvestigationAlreadyStoredError before
    the timer fires does it issue one retry racing the same shared timer, so the retry's own remaining
    time is exactly whatever real wall-clock time the shared timer has left. raceWriteAttempt classifies
    a write's settlement as 'settled' (resolved, or rejected with InvestigationAlreadyStoredError), 'failed'
    (any other rejection before the timer fires), or the WRITE_TIMED_OUT marker. writeWithinDeadline raises
    InvestigationWriteDeadlineExceededError exactly when neither attempt settles. runDiagnosis now threads
    durations into writeWithinDeadline.
- path: src/errors/status-map.ts
  effect: STATUS_BY_ERROR_CLASS now maps InvestigationWriteDeadlineExceededError to 500 (previously it
    fell through to the handler's generic, unnamed 500 fallback). Header comment's enumeration of specification-fixed
    statuses and the table's own doc comment count were updated to match.
criteria:
- criterion: A write whose first attempt is issued after collection, judgment and writing have together
    consumed enough of the declared total that less than the full persistence nominal budget remains before
    the deadline is bounded by that smaller remaining figure — never by the persistence nominal budget
    computed against the request's original entry instant.
  met: true
  how: persistenceStageBoundMs subtracts durations.collection + durations.judgment + durations.writing
    from deadline - now before taking the minimum with PERSISTENCE_STAGE_BUDGET_MS, so time already spent
    in the three preceding stages shrinks the bound.
- criterion: The persistence stage's own nominal budget stays PERSISTENCE_STAGE_BUDGET_MS = 2000 milliseconds,
    unchanged by this fix.
  met: true
  how: The constant's declaration and value are untouched.
- criterion: Where the persistence stage's own bound — the minimum of its nominal budget and the time
    remaining before the deadline when persistence begins — is zero or less, no write attempt is issued
    at all and InvestigationWriteDeadlineExceededError is raised immediately, without the store ever being
    called.
  met: true
  how: writeWithinDeadline computes settled = stageBoundMs > 0 && (await persistWithinBound(...)); the
    && short-circuits so persistWithinBound (and store.write()) is never called when stageBoundMs <= 0,
    and the error is thrown with that same stageBoundMs.
- criterion: A write's first attempt is held to the whole of the persistence stage bound and never capped
    below it to reserve time for a retry — it runs until it settles or the stage bound elapses, whichever
    comes first.
  met: true
  how: The first raceWriteAttempt call races store.write(investigation) against timeout.promise from stageTimeout(stageBoundMs)
    — the full bound, never reduced.
- criterion: 'A write whose first attempt fails at some point before its own bound (the full persistence
    stage bound: the minimum of its nominal budget and the time remaining before the deadline when persistence
    began) elapses, leaving more than zero milliseconds of that bound unspent, is retried exactly once,
    bounded by whatever of that same stage bound remains unspent after the first attempt''s own elapsed
    time.'
  met: true
  how: persistWithinBound retries only when the first raceWriteAttempt answers 'failed'. The retry races
    store.write(investigation) against the very same timeout.promise object, which keeps counting down
    in real wall-clock time regardless of the first attempt, so whatever of the bound is left by the time
    the retry starts is exactly what it races against.
- criterion: A write whose first attempt fails with zero or fewer milliseconds of the stage bound left
    unspent, or whose first attempt runs until the stage bound itself elapses without settling, is not
    retried, and InvestigationWriteDeadlineExceededError is raised immediately.
  met: true
  how: If the first raceWriteAttempt answers WRITE_TIMED_OUT, persistWithinBound returns false immediately
    without any retry. A retry that is issued races against a timer that may already be at or past its
    own bound, resolving to WRITE_TIMED_OUT almost immediately in that case.
- criterion: 'Any write attempt — the first attempt or the retry — that finds a record already persisted
    under the investigation''s own id counts as a write that settled successfully: it persists no second
    record, and does not raise InvestigationWriteDeadlineExceededError.'
  met: true
  how: raceWriteAttempt (used identically for both the first attempt and the retry) classifies a rejection
    as 'settled' when it is an instance of InvestigationAlreadyStoredError. No second call to the store
    follows a 'settled' outcome.
- criterion: InvestigationWriteDeadlineExceededError is raised whenever neither the first attempt nor
    the retry (where one is issued) settles successfully — whether because the persistence stage's own
    bound elapsed first, an attempt failed outright, or no time remained for a retry — and is never raised
    once a write has settled successfully, including an attempt that found the record already there.
  met: true
  how: writeWithinDeadline throws InvestigationWriteDeadlineExceededError exactly when settled is false,
    covering the zero-or-less-bound case, a timed-out first attempt, and a first attempt that failed followed
    by a retry that also failed or timed out, and never throws when either attempt answered 'settled'.
- criterion: Every path that raises InvestigationWriteDeadlineExceededError is answered to the requester
    as an HTTP 500 response naming InvestigationWriteDeadlineExceededError as the reported condition.
  met: true
  how: 'status-map.ts''s STATUS_BY_ERROR_CLASS now maps InvestigationWriteDeadlineExceededError to 500,
    so error-handler.middleware.ts''s handleUnexpectedError takes the domainEnvelope branch ({ error:
    { code: error.name, message: error.message, details: error.context } }) rather than the generic, unnamed
    500 fallback.'
- criterion: A write whose first attempt settles successfully before its own bound elapses answers normally,
    with no retry attempted and no change to the written investigation.
  met: true
  how: When the first raceWriteAttempt answers 'settled', persistWithinBound returns true immediately;
    no retry call is made, and runDiagnosis returns the already-built investigation's own assessment.
nodes:
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: Persistence's own bound is computed entirely from the propagated (now, deadline) pair and the pipeline's
    own already-measured durations — never from a fresh clock read inside this module. No Date.now(),
    bare new Date() or performance.now() call was introduced.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/errors/status-map.ts
  how: Persistence's single-retry shape (one retry, only on a failed-not-timed-out first attempt, bounded
    by the same stage bound's own remaining real time), the zero-or-less-bound case (raised immediately,
    store never called), and the HTTP 500 naming InvestigationWriteDeadlineExceededError are all implemented
    as this rule's statement now states them.
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  how: Only this rule's Description-stated two-second persistence slice is in scope, per this task's own
    Notes; the twenty-second total and the caller-timeout margin are out of scope. The slice stays encoded,
    unchanged, as the pre-existing PERSISTENCE_STAGE_BUDGET_MS = 2_000, which this task did not modify.
- node: rules/investigation/an-investigation-is-written-once
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: 'raceWriteAttempt treats an InvestigationAlreadyStoredError rejection — from either the first attempt
    or the retry — as ''settled'': the store''s own id-keyed refusal (unchanged, still raised before any
    second row is written) is read at the composition level as having found exactly what it was sent to
    write, never as a failure or a duplicate.'
inferences:
- inferred: '"Time actually remaining before the deadline when persistence begins" is computed as deadline
    - now - (durations.collection + durations.judgment + durations.writing).'
  from: The task's own suggestion to use the pipeline's already-measured durations rather than a clock
    read, and the module's own stated "never reads the system clock internally" discipline; buildInvestigation's
    own (unmeasured) assembly time is treated as negligible, consistent with this codebase's existing
    convention of only measuring real wall-clock time around I/O-bound stage calls, never around pure
    in-memory assembly.
- inferred: The retry's own remaining bound is derived by racing both attempts against one shared timer
    (a single Promise created once via stageTimeout(stageBoundMs)), rather than by measuring the first
    attempt's own elapsed time with a second clock read.
  from: 'This is the mechanism found to satisfy "bounded by whatever of that same stage bound remains
    unspent after the first attempt''s own elapsed time" exactly, under the module''s explicit constraint
    of never reading the system clock: the shared timer''s own real, unmodified elapsing does the measuring
    implicitly.'
- inferred: On a write attempt (first or retry) settling via InvestigationAlreadyStoredError, runDiagnosis
    returns its own locally-built investigation's assessment rather than re-reading the actually-stored
    record through store.read().
  from: None of this task's stated criteria ask for a re-read; criterion 7 only requires that the settlement
    persist no second record and not raise the deadline error. A divergence between the locally-built
    and the actually-stored content on this path touches rules/investigation/the-response-follows-the-record
    and rules/investigation/replay-is-pinned, neither among this task's four implemented nodes, so reconciling
    it here would widen the task past its own objective.
preserved:
- The module's own "never reads the system clock internally" discipline — no Date.now(), bare new Date()
  or performance.now() call was introduced anywhere in run-diagnosis.ts.
- PERSISTENCE_STAGE_BUDGET_MS stays 2000ms, unchanged.
- Collection's (COLLECTION_STAGE_BUDGET_MS) and judgment's (JUDGMENT_STAGE_BUDGET_MS) own deadline handling,
  and written_at's own derivation from now, left untouched.
- The module's exactly-two exports (RunDiagnosisOptions, runDiagnosis) — no new export added.
- 'The store/port layer (investigation-store.port.ts, relational-investigation-store.repository.ts) left
  untouched: write-once-by-id via a unique-violation mapped to InvestigationAlreadyStoredError, refusing
  before any write completes, stays exactly as before.'
- Every other entry in status-map.ts's STATUS_BY_ERROR_CLASS table, and the handler's generic 500-fallback
  path for every error class the table still does not name, left unchanged.
deferred:
- what: A write attempt settling via InvestigationAlreadyStoredError answers the requester from the locally-built
    investigation rather than re-reading the actually-stored record.
  why: No criterion of this task requires a re-read, and reconciling any divergence between the two touches
    rules/investigation/the-response-follows-the-record and rules/investigation/replay-is-pinned, neither
    of which this task implements.
---

## What it is

The corrective fix to run-diagnosis.ts's persistence stage: its write-deadline bound is now
computed against the time actually remaining before the propagated deadline when persistence
begins (derived from the pipeline's own already-measured stage durations, never a clock read),
a failed first attempt is retried once within whatever of that same bound is left, and the
investigation's own id keys settlement so an attempt that finds the record already there counts
as settled rather than duplicating it. InvestigationWriteDeadlineExceededError now maps to a
named HTTP 500 in the shared status map.

## Notes

The retry's own remaining time is derived by racing both the first attempt and the retry against
one shared timer created once per persistence stage bound, rather than by a second clock read —
this keeps the module's own "never reads the system clock internally" discipline intact while
still bounding the retry correctly, since the one timer's real elapsing does the measuring
implicitly.
A write attempt that settles via InvestigationAlreadyStoredError answers the requester from the
locally-built investigation rather than re-reading the actually-stored record from the store;
this is deferred (see `deferred` above) as it touches two specification nodes this task does not
implement.
