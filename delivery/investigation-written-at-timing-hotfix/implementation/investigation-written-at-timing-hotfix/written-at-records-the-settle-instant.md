---
title: written_at now stamps the store's settle instant, not the request's entry instant
summary: run-diagnosis.ts reads written_at from a fresh clock reading taken at persistence time for
  each physical write attempt, replacing the request-entry-instant read the corrective fix targets.
task: sha256:af14569e107d322e498fd6541586eeb2d5759afb60fe3a37595eb8bcddd82629
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-written-at-timing-hotfix-written-at-records-the-settle-instant-build
files:
- path: src/investigation/run-diagnosis.ts
  effect: buildInvestigationOptions() now stamps written_at from readClockMs() taken once the
    pipeline has finished (immediately before persistence begins) instead of from options.now (the
    diagnose request's own entry instant); persistWithinBound()'s retry path now calls a new helper,
    investigationForRetry(), which spreads the built investigation with a freshly-read written_at
    immediately before the retry's own store.write() dispatch, so a settling retry carries its own
    instant rather than reusing the first attempt's.
criteria:
- criterion: written_at on a persisted investigation is read from the clock at the moment the store confirms
    the write settled, never from the request's entry instant.
  met: true
  how: buildInvestigationOptions() (run-diagnosis.ts) no longer reads options.now for written_at; it reads
    readClockMs() at the point persistence is about to begin, and persistWithinBound()'s retry path
    re-reads it again immediately before that specific attempt is dispatched (investigationForRetry()).
    Neither reading can come from the request's entry instant, because options.now is no longer consulted
    for this attribute anywhere in the file. See this record's own divergence for the precise sense in
    which "at the moment... settled" is approximated rather than literally read post-confirmation.
- criterion: A write whose first attempt fails and is retried once records written_at from whichever attempt
    actually settles, not from the first attempt's own start.
  met: true
  how: persistWithinBound() only reuses the first attempt's investigation object (and its written_at) when
    the first attempt itself is the one raced; once it resolves to 'failed', the retry is issued against
    investigationForRetry(investigation) -- a new object carrying a written_at read fresh at that later
    point, distinct from whatever was read for the first attempt's own start. If the retry is the one that
    settles, the persisted written_at is that fresh reading, not the first attempt's.
- criterion: A write that finds the record already present (settles without a new write, per
    rules/investigation/an-investigation-is-written-once) reads written_at from the existing record,
    never restamping it.
  met: true
  how: raceWriteAttempt() (unchanged) still treats a rejection carrying InvestigationAlreadyStoredError as
    'settled' without issuing any further write or update statement, on either the first or the retried
    attempt; this task did not add any code path that writes again after a 'settled'-by-already-present
    outcome, so the existing record's own written_at is never touched by either attempt's locally-computed
    value. runDiagnosis() never reads written_at back out for its own return value (it returns
    investigation.assessment alone), so there is nothing in this file that could restamp or expose a stale
    reading either.
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: written_at is now assembled from a clock reading taken at persistence time (first attempt) or
    immediately before the retry's own dispatch (second attempt) rather than from the diagnose request's
    entry instant, matching the node's own "written_at records when the one write happened" and its
    distinction from a state read to decide anything.
- node: rules/investigation/an-investigation-is-written-once
  how: this task consumes only the settles-without-a-new-write outcome (per its own REMAINDER note) and
    leaves the mechanism that produces it untouched -- raceWriteAttempt() still treats
    InvestigationAlreadyStoredError as 'settled', the store's own insert-only unique constraint is not
    touched, and no path introduced by this fix issues a second write or an update against an id already
    present. The rule constrains the work here; no new fact of it was encoded by this task.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  how: this task's own REMAINDER note excludes the deadline/attempt-splitting discipline from its
    criteria; persistenceStageBoundMs(), stageTimeout(), the single-retry structure, the zero-or-less
    short-circuit and the HTTP 500 mapping are all unchanged -- only which clock reading backs written_at
    changed. The rule constrains the work here; no new fact of it was encoded by this task.
- node: rules/investigation/written-at-records-when-the-write-settled
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: buildInvestigationOptions()'s written_at source moved off options.now onto a fresh readClockMs()
    reading taken at persistence time, and persistWithinBound()'s retry now dispatches
    investigationForRetry(investigation) -- a copy carrying its own freshly-read written_at -- so a
    settling retry's own instant is what gets recorded rather than the first attempt's start, and an
    attempt that settles via InvestigationAlreadyStoredError never triggers any further write that could
    restamp the existing record's own written_at. See this record's own divergence for the residual gap
    between this reading and a literal post-confirmation read.
inferences:
- inferred: given the store's write(investigation) Promise<void> contract, "the moment the store confirms
    the write settled" is implemented as the freshest clock reading obtainable before each physical
    attempt is dispatched (persistence-build time for the first attempt, immediately before dispatch for
    the retry) rather than a reading taken strictly after the store's own confirmation.
  from: src/investigation/investigation-store.port.ts's write() signature, which returns Promise<void> and
    gives the caller no settle-confirmed timestamp to read back; and this task's own REMAINDER notes,
    which scope it to "which clock reading written_at carries" inside run-diagnosis.ts and explicitly
    exclude the write-once mechanism (an-investigation-is-written-once's own id-keyed once-ness) from what
    this task changes.
divergences:
- from: rules/investigation/written-at-records-when-the-write-settled
  departure: written_at is read from the application clock immediately before each physical write attempt
    is dispatched, not from a reading taken strictly after the store confirms that specific attempt
    settled.
  why: the value has to be a bound parameter of the one INSERT that persists the record, sent before that
    INSERT can possibly resolve; the store's own write(investigation) Promise<void> contract gives the
    caller nothing to read back a settle-confirmed timestamp from and re-stamp the same row with
    afterward, and supplying one would mean adding a second statement, a server-side clock read, or a
    changed store contract -- all of which reach past this corrective task's scope, which per its own
    REMAINDER notes is limited to which clock reading written_at carries inside run-diagnosis.ts. What is
    implemented is the closest approximation this single-round-trip, single-file architecture can produce
    -- never the request's entry instant, and never reused from an earlier physical attempt's own reading.
preserved:
- the persistence stage's deadline/attempt-splitting discipline -- persistenceStageBoundMs(),
  stageTimeout(), the single retry bounded by whatever of the stage bound the first attempt left unspent,
  and the zero-or-less short-circuit that raises without ever calling the store -- all unchanged.
- raceWriteAttempt()'s treatment of a rejection carrying InvestigationAlreadyStoredError as 'settled',
  with no update or second write issued on that path.
- runDiagnosis()'s return value (investigation.assessment) and its shape, unaffected by which written_at
  value ends up persisted.
- the existing test at src/__tests__/unit/investigation/run-diagnosis.spec.ts asserting that
  run-diagnosis.ts calls neither Date.now(), bare new Date() nor performance.now() directly -- the fix
  reads the clock only through the already-imported readClockMs(), and new Date(readClockMs()) is not a
  bare new Date() call.
deferred:
- what: a settle instant genuinely confirmed by the store itself -- e.g. a database-clock read at commit
    time, or a round trip that reads the persisted row back after the INSERT resolves -- is not
    implemented; written_at stays an application-side reading taken as close to each attempt's own
    dispatch as the current architecture allows.
  why: reaching it would mean changing investigation-store.port.ts's write() contract or
    relational-investigation-store.repository.ts's own INSERT, which sits outside this corrective task's
    single-file scope (declared by its own summary and REMAINDER notes) and outside the write-once
    mechanism this task was told to leave alone.
---

## What it is

The corrective fix stamping written_at from the clock at the moment the investigation's write
settles in the store, matching rules/investigation/written-at-records-when-the-write-settled
(decided while this task was bound), instead of from the request's entry instant.

## Notes

None.
