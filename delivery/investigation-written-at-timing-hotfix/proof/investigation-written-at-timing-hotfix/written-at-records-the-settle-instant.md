---
implementation: sha256:8e14fae17a3f4f592d3de610bda6ac0253f5e07131e4ef5a72bad49ff84c551f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-written-at-timing-hotfix-written-at-records-the-settle-instant-suite
title: written_at records the settle instant — proof
summary: Four tests over run-diagnosis.spec.ts prove written_at is read from a fresh clock reading
  taken at persistence time per physical write attempt, never from the request's entry instant and
  never restamped over an already-present record.
tests:
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: reads written_at from the clock at persistence time, distinctly later than the request's own
    entry instant once collection has consumed real wall-clock time
  proves: written_at on a persisted investigation is read from the clock at the moment the store confirms
    the write settled, never from the request's entry instant.
  fails_when: buildInvestigationOptions() derives written_at from options.now (the request's entry
    instant) instead of a fresh readClockMs() reading taken once the pipeline has finished -- the test
    fixes the real clock 500ms ahead of options.now's own scale via a 500ms collection delay and asserts
    the persisted written_at equals the later real-clock reading, not the entry-instant-derived value
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: records written_at from the retry's own fresh clock reading when the retry — not the first
    attempt — is the one that settles, never from the first attempt's own start
  proves: A write whose first attempt fails and is retried once records written_at from whichever attempt
    actually settles, not from the first attempt's own start.
  fails_when: persistWithinBound()'s retry path reuses the first attempt's investigation object (and its
    written_at) instead of dispatching investigationForRetry(investigation) with a freshly-read
    written_at -- the test forces a 500ms real-time gap between the first attempt's rejection and the
    retry's dispatch and asserts the persisted written_at reflects the later, retry-time reading
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: leaves the already-present record's own written_at untouched, never restamping it, when the first
    write attempt finds the investigation already stored
  proves: A write that finds the record already present (settles without a new write, per
    rules/investigation/an-investigation-is-written-once) reads written_at from the existing record,
    never restamping it.
  fails_when: any code path issues a further write, update or restamp once raceWriteAttempt() treats an
    InvestigationAlreadyStoredError rejection as 'settled' -- the test seeds the store with a minimal
    pre-existing document under the id and asserts it comes back byte-identical after the run, which
    would fail if any field (written_at included) were added or changed
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: reads written_at from the clock immediately before dispatching a write attempt, not from a
    reading taken after the store confirms that attempt has settled
  proves: the inference the implementation recorded -- that 'the moment the store confirms the write
    settled' is implemented as the freshest clock reading obtainable before each physical attempt is
    dispatched, rather than a reading taken strictly after the store's own confirmation
  fails_when: buildInvestigationOptions() or investigationForRetry() read the clock after `await
    store.write(...)` resolves instead of before dispatch -- the test uses a store that delays 500ms
    between dispatch and resolution and asserts the persisted written_at equals the pre-delay (dispatch)
    instant, not the post-delay (confirm) instant
not_applicable:
- edge_case: written_at's value when persistence ultimately fails -- both attempts reject outright, or
    the persistence stage bound elapses (via a hanging store) before either attempt settles
  why: no document is ever persisted on either path (writeWithinDeadline raises
    InvestigationWriteDeadlineExceededError instead), so there is no written_at to assert about; these
    paths are already exercised by pre-existing tests for the deadline behavior itself, which this task
    does not change
untested:
- "Whether written_at reflects a reading taken strictly after the store's own confirmation of a
  settling write, as opposed to immediately before that attempt's own dispatch, as criterion 1's
  phrasing ('at the moment the store confirms the write settled') and the bound rule's own paraphrase
  ('never... an attempt's own start', per this task's Notes) could be read to require. The
  dispatch-vs-confirm test in this proof demonstrates the implementation's actual behavior (a
  dispatch-time reading) but does not settle whether that reading satisfies the criterion's or the
  rule's literal wording -- the implementation record's own divergence and deferred entries concede the
  store's write(investigation) Promise<void> contract gives no post-confirmation hook to read a
  settle-confirmed timestamp from, and reaching one would mean changing that contract, which sits
  outside this task's single-file scope."
- "written_at's own preservation specifically when it is the retry -- not the first attempt -- that
  finds the record already present. The pre-existing suite's own test for that exact scenario
  (FailOnceThenAlreadyStoredInvestigationStore, unmodified by this task) asserts only the returned
  assessment, because that fixture's read() always answers undefined and cannot be inspected for store
  contents. This proof's own criterion-3 test exercises the first-attempt case only; the underlying
  no-restamp mechanism (raceWriteAttempt() treating InvestigationAlreadyStoredError as 'settled') is
  unchanged and identical for both attempts per this task's own REMAINDER note, but no test here
  directly inspects a retry-side already-stored outcome against store contents."
- "The concurrent-request variant of criterion 3 -- verifying that when two runDiagnosis calls race for
  one id, the losing racer's own locally-computed written_at is never the value that lands in the store.
  The pre-existing concurrency test (unmodified by this task) asserts only that exactly one record
  exists and both callers' returned assessments, not which written_at value survived; the underlying
  mechanism is the same InvestigationAlreadyStoredError path this proof's criterion-3 test exercises
  directly, but no test asserts this specifically under genuine concurrency."
---

## What it is

The proof for the written-at settle-instant fix: run-diagnosis.ts now stamps written_at from a
fresh clock reading taken at persistence time per physical write attempt, never from the request's
entry instant.

## Notes

No pre-existing test in run-diagnosis.spec.ts, or elsewhere in the suite, asserted the old
behavior -- no test anywhere checked written_at's actual value coming out of run-diagnosis.ts prior
to this task, so nothing needed correcting.
