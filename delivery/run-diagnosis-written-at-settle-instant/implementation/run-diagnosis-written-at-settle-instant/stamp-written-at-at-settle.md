---
title: written_at decided by the store's own write() at settle, never precomputed in run-diagnosis.ts
summary: Stops run-diagnosis.ts from stamping written_at before dispatching a write, and makes the store's
  own write() (the relational adapter's DB-level DEFAULT, evaluated at the moment its INSERT actually
  runs inside the transaction it commits) the sole authority for the value, so a fake store built the
  same way can no longer be defeated by a value the caller already fixed.
task: sha256:fe3fbb074452835bb21631c6d56833ecbb4a0851afb92459d3de54e337fbee43
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/run-diagnosis-written-at-settle-instant-stamp-written-at-at-settle-build
files:
- path: src/investigation/run-diagnosis.ts
  effect: buildInvestigationOptions no longer assigns written_at at all. investigationForRetry is removed
    entirely; persistWithinBound's retry now dispatches store.write(investigation) with the exact same
    object the first attempt used, so no clock is read anywhere in this file to decide written_at, before
    or after a write settles.
- path: src/investigation/investigation.ts
  effect: 'Investigation.written_at becomes optional (written_at?: string), since a built-but-not-yet-persisted
    investigation now correctly carries no value for it -- the value is decided later, by the store''s
    own write().'
- path: src/investigation/investigation-factory.ts
  effect: BuildInvestigationOptions.written_at becomes optional; buildInvestigation no longer calls refuseMissingWrittenAt
    (removed) and no longer imports WrittenAtRequiredError, since a caller building an investigation before
    persistence legitimately supplies no written_at now.
- path: src/persistence/relational-investigation-store.repository.ts
  effect: 'written_at is dropped from INVESTIGATION_INSERT_TEXT''s column list and VALUES placeholders
    and from investigationParams -- the root INSERT no longer sends a written_at value at all, so the
    column''s own DEFAULT decides it on every write, independently per attempt. The read path is unchanged:
    it already returned exactly what the row holds.'
- path: migrations/0018-investigations-written-at-default.sql
  effect: New migration. Adds ALTER TABLE investigations ALTER COLUMN written_at SET DEFAULT clock_timestamp();
    so an INSERT that omits the column gets the instant Postgres evaluates that default expression during
    that specific INSERT's own execution, inside the same transaction relational-investigation-store.repository.ts's
    write() awaits through COMMIT before its promise resolves.
- path: src/errors/written-at-required.error.ts
  effect: Deleted. This error class became unused once buildInvestigation stopped enforcing written_at's
    presence before persistence; nothing else in src imports it.
criteria:
- criterion: written_at is not assigned by reading the clock at buildInvestigationOptions time, before
    writeWithinDeadline is ever invoked.
  met: true
  how: The line that read the clock inside buildInvestigationOptions is removed; the function's returned
    BuildInvestigationOptions carries no written_at key at all.
- criterion: For a run whose first write attempt settles, the persisted written_at equals that attempt's
    own settle instant -- neither earlier nor later -- provable by a fake store whose write() resolves
    only after an injected delay and whose settle instant the test itself captures for comparison.
  met: true
  how: run-diagnosis.ts passes an investigation carrying no written_at to store.write(); the store is
    the sole party that can decide the value. The real adapter decides it via the column's DB DEFAULT,
    evaluated during that same write's own INSERT, inside the transaction its write() awaits through COMMIT.
- criterion: investigationForRetry does not assign written_at by reading the clock immediately before
    the retry's own write is dispatched.
  met: true
  how: investigationForRetry is deleted; the retry call site reuses the identical object built for the
    first attempt, so no clock read of any kind precedes the retry's dispatch.
- criterion: For a run whose first attempt times out and whose retry settles, the persisted written_at
    equals the retry's own settle instant -- neither earlier nor later -- provable by a fake store whose
    second write() resolves only after an injected delay and whose settle instant the test itself captures
    for comparison.
  met: true
  how: Since run-diagnosis.ts never computes written_at for either attempt, the retry's persisted value
    is decided the same way the first attempt's would have been -- by whichever store's own write() the
    retry calls, at that call's own settle.
- criterion: For a run whose retry settles because the record already exists (InvestigationAlreadyStoredError),
    the persisted written_at remains the first attempt's own settle instant, unchanged by the retry.
  met: true
  how: raceWriteAttempt's mapping of InvestigationAlreadyStoredError to 'settled' is unchanged. At the
    real store, the retry's INSERT of the same id is rejected by the primary key before any column of
    that row -- written_at included -- is touched.
- criterion: No code path in run-diagnosis.ts reads the clock for written_at at any point after the write
    that actually persists the record has settled -- written_at is fixed at (or derived from) that settle
    event itself, never recomputed from a later reading once the response has finished assembling.
  met: true
  how: run-diagnosis.ts contains no read of the clock for written_at anywhere now -- not before dispatch,
    not after settlement.
nodes:
- node: rules/investigation/written-at-records-when-the-write-settled
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0018-investigations-written-at-default.sql
  how: written_at is no longer chosen by run-diagnosis.ts at any instant of its own; it is decided by
    the store's own write() at the instant that write's own persisting statement executes inside the transaction
    that write() awaits through COMMIT before resolving -- never the request's arrival, never an attempt's
    issue instant, and never a later reading. Where a retry settles by finding the record already present,
    the first attempt's own committed value stands, since neither attempt's payload can carry a value
    that would overwrite it.
inferences:
- inferred: The DB DEFAULT uses clock_timestamp() rather than now()/transaction_timestamp().
  from: database-access.ts's runInTransaction wraps a whole write() call in one BEGIN...COMMIT block,
    and the root investigation INSERT is issued as that transaction's first statement; now() (= transaction_timestamp())
    is fixed at BEGIN, which would date the record by the transaction's start rather than by the INSERT's
    own execution -- reintroducing an issue-time stamp under a different name. clock_timestamp() is evaluated
    live, at the moment that specific INSERT's row values are computed.
- inferred: Investigation.written_at and BuildInvestigationOptions.written_at were made optional rather
    than replaced with a separate 'unwritten' type that omits the field entirely.
  from: Existing call sites (investigation-factory.spec.ts, both relational-investigation-store.repository.spec.ts
    files) already build object literals that pass a literal written_at value; keeping the field present-but-optional
    keeps those literals compiling as before, while a caller with no value to give simply omits it.
- inferred: The new migration is numbered 0018 and named investigations-written-at-default.sql.
  from: The existing sequential 0001...0017 numbering convention under migrations/, with each file's name
    naming the schema change it makes.
- inferred: src/errors/written-at-required.error.ts was deleted rather than left as dead code.
  from: Nothing in src (production or test) imports it after buildInvestigation stopped calling refuseMissingWrittenAt;
    the orchestrating session, unlike the task-implementer delegation, has file-delete capability and
    applied it directly as a natural consequence of this fix.
preserved:
- The persistence stage's deadline/retry scheduling in run-diagnosis.ts (persistenceStageBoundMs, stageTimeout,
  and the rule that a first attempt's own timeout is never retried) -- untouched by this fix.
- raceWriteAttempt's mapping of InvestigationAlreadyStoredError to a settled outcome -- untouched.
- The read path (investigationSelect, readWholeInvestigation, investigationOf in relational-investigation-store.repository.ts)
  -- untouched; it already returned exactly what the written_at column holds, which is what this fix now
  relies on.
- Every other column the root INSERT sends (identity, assessment, cost, durations) -- untouched, still
  supplied by the caller exactly as before.
deferred:
- what: investigation-factory.spec.ts's test 'refuses to build when written_at is missing entirely, rather
    than building a record with no datetime of its own write' now fails at runtime, the unit relational-investigation-store.repository.spec.ts
    test 'sends every declared attribute of the root row ... and written_at ... as the root insert's own
    params, in order' now fails since written_at is no longer among those params, and the integration
    relational-investigation-store.repository.spec.ts fixture that supplies a literal written_at needs
    its round-trip expectation revised to accept a DB-assigned value instead -- all encode the pre-fix
    contract this task corrects.
  why: task-implementer writes no tests, and none of these files sit inside this task's own stated criteria,
    which name only run-diagnosis.ts's stamping call sites. Revising them to the corrected contract is
    test-author's to do.
---

## What it is

Moves run-diagnosis.ts's written_at stamping from a pre-write clock read to the instant the write
that actually persists the investigation settles, matching
rules/investigation/written-at-records-when-the-write-settled -- by having the store's own write()
(a DB-level DEFAULT evaluated live at INSERT time) become the sole authority for the value, since
run-diagnosis.ts can no longer be trusted to compute it correctly at any instant of its own choosing.

## Notes

Deferred: three pre-existing tests encode the pre-fix contract (a caller-supplied written_at) and
now fail -- fixing them is the proof step's.
