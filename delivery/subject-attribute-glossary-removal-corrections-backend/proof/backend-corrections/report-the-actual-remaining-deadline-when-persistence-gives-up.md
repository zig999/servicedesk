---
target: backend
title: Proof for reporting the actual remaining deadline when persistence gives up
summary: run-diagnosis.spec.ts now exercises writeWithinDeadline's corrected remainingMs across the stage-bound-capped,
  zero-real-elapsed, real-elapsed-during-attempts and already-zero-bound classes; the pre-existing e2e's
  stale assertion was corrected to match.
implementation: sha256:fda6d8875c464c0e70df56e093c6e857f97b30995ec62a9ac4aaacb2db90b1a2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
tests:
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: raises InvestigationWriteDeadlineExceededError, not the raw failure, once both a genuine first-attempt
    write failure and its retry reject outright
  proves: remainingMs is the deadline-minus-now reading, never the pre-computed stage bound, when no real
    elapsed time distinguishes the two.
  fails_when: remainingMs is reported as 2000 (the stage's own cap) instead of 20000 (the true declared-deadline
    remainder)
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining
    deadline -- and reports remainingMs against the actual declared deadline, not that two-second stage
    bound
  proves: remainingMs reflects the actual deadline remainder, not the stage bound.
  fails_when: remainingMs is reported as 2000 instead of 48000 once the write hangs for the full stage
    bound while 48000ms of the declared deadline genuinely remain
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: bounds the retry by whatever of the stage bound the first attempt's own elapsed time left unspent
    -- and reports remainingMs against the declared deadline read fresh at that moment
  proves: remainingMs and the error message both use the fresh reading, even when real wall-clock time
    elapses across a first attempt and its retry.
  fails_when: remainingMs (or the message text) reports 2000 instead of 48000
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: reads a fresh clock reading for remainingMs even when persistence's own bound was already zero
    at entry and no write was attempted
  proves: the already-zero-bound case shares the same fresh-reading computation as the attempted-and-failed
    case.
  fails_when: remainingMs is reported as 0 (the exhausted bound reused) instead of the actual fresh reading
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not
    conclude within what remains of the declared deadline
  proves: regression coverage for the corrected value in a pre-existing scenario.
  fails_when: remainingMs is asserted as the old, pre-fix stage-bound value rather than the corrected
    one
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: bounds persistence at what remains of the declared deadline when that is smaller than the nominal
    two-second budget
  proves: regression coverage for the corrected value.
  fails_when: remainingMs is asserted as the old, pre-fix stage-bound value
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: clamps persistence's own bound to zero rather than negative, once the given deadline has already
    elapsed relative to now
  proves: the clamp-to-zero half of the criterion, pinned deterministically via a fixed system clock.
  fails_when: remainingMs is anything other than 0 once the declared deadline had already elapsed
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: bounds persistence by the time actually remaining once collection has already consumed part of
    the declared deadline
  proves: regression coverage for the corrected value.
  fails_when: remainingMs is asserted as the old, pre-fix stage-bound value
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: resolves normally, with no retry issued, when the first write attempt finds the investigation
    already stored under its own id
  proves: the settled branch and its no-retry behavior are unchanged.
  fails_when: the settled branch stops resolving normally, or issues an unnecessary retry
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: holds the first write attempt to the whole of the persistence stage bound -- its own unchanged
    2000ms nominal budget -- rather than capping it below to reserve time for a retry
  proves: the stage-bound computation is unchanged.
  fails_when: the first attempt is truncated below the whole nominal stage bound
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment, and
    leaves no investigation readable by its id immediately afterward, when the investigation write is
    slowed past the persistence deadline
  proves: end-to-end, over the real HTTP route, that remainingMs is non-negative and bounded by the declared
    total deadline rather than by the persistence stage's own 2-second budget.
  fails_when: remainingMs is negative, or is greater than or equal to TOTAL_DEADLINE_BUDGET_MS
not_applicable:
- edge_case: a persistence write that succeeds, so no InvestigationWriteDeadlineExceededError is ever
    thrown
  why: remainingMs is only ever observed on the thrown error; the settled-branch tests already guard that
    path under a separate, unchanged obligation
- edge_case: the pre-existing claim that remainingMs is computed independent of the real system clock
  why: this task's own criterion requires the opposite -- a fresh clock reading taken at the moment of
    the throw; the test making the old claim was replaced rather than kept with a now-false premise
- edge_case: two concurrent runs racing on the same investigation id
  why: covered by an existing, unmodified test unrelated to remainingMs's value
untested:
- rules/investigation/no-stage-aborts-on-its-deadline's fact is a cross-stage policy spanning collection's
  and judgment's own timeout behavior together with persistence's; this proof reaches only the persistence-refusal
  slice.
- Whether callers of runDiagnosis actually supply now as a real readClockMs() reading taken at request
  entry is a fact about the HTTP layer that composes RunDiagnosisOptions, outside this file's scope to
  verify.
---

## What it is

See summary.

## Notes

None.
