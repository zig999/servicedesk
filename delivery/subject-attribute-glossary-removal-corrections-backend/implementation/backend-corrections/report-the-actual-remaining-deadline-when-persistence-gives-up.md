---
target: backend
title: Report the actual remaining deadline when persistence gives up
summary: writeWithinDeadline now throws InvestigationWriteDeadlineExceededError with the deadline-minus-now
  reading taken at the moment persistence gave up, instead of the pre-computed stage bound.
task: sha256:672a82411e897eac71046cc1a587b4fa92caebe7955d8d37a38309c0c5d804c7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
files:
- path: src/investigation/run-diagnosis.ts
  effect: writeWithinDeadline's throw of InvestigationWriteDeadlineExceededError now passes Math.max(0,
    deadline - readClockMs()), read at the point of the throw, instead of the pre-computed stageBoundMs;
    stageBoundMs, persistenceStageBoundMs, persistWithinBound and the settled/not-settled branching are
    all unchanged.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: The e2e assertion on remainingMs no longer assumes it is bounded by the 2-second persistence
    stage budget (a relationship the old, wrong implementation happened to produce); it now asserts remainingMs
    is non-negative and strictly less than the declared TOTAL_DEADLINE_BUDGET_MS, matching the corrected
    semantics.
criteria:
- criterion: When persistence settles no write, InvestigationWriteDeadlineExceededError's remainingMs
    is computed by reading the clock again at the moment of the throw and subtracting from the declared
    deadline, clamped to zero, never the pre-computed stage bound persistence was granted at entry.
  met: true
  how: The throw site reads Math.max(0, deadline - readClockMs()) at the point of the throw.
- criterion: Where the stage bound was already zero or less when persistence began (no write attempt made),
    remainingMs is still the deadline-minus-now reading taken at that same moment, consistent with the
    case where an attempt was made and failed.
  met: true
  how: The if (!settled) branch is reached identically in both cases, and the same expression is evaluated
    at the throw site regardless of which path led there.
- criterion: The error's message still states remainingMs milliseconds remaining of the declared deadline,
    using the corrected value.
  met: true
  how: InvestigationWriteDeadlineExceededError's constructor is unmodified; it builds its message from
    whatever remainingMs it receives, now the corrected value.
- criterion: Every other behavior of writeWithinDeadline (the stage-bound computation, the one-retry-in-leftover-time
    policy, the settled/not-settled branching) is unchanged.
  met: true
  how: Only the argument passed inside the existing throw statement was edited; persistenceStageBoundMs,
    the stageBoundMs > 0 guard, and persistWithinBound's retry logic are untouched.
- criterion: src's test suite passes.
  met: true
  how: Confirmed by run/backend-corrections-suite-2, including the corrected e2e assertion.
nodes:
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: The rule requires the thrown error's remainingMs to be the milliseconds that remained of the declared
    deadline when persistence gave up — a reading taken at that moment, not at the moment persistence
    was granted its bound. writeWithinDeadline now takes that reading; the rest of the rule (at most two
    attempts against the stage's own bound, the message naming id and remainingMs) was already encoded
    here and is unchanged.
inferences:
- inferred: readClockMs() is safe and cheap to call a second time at the throw site.
  from: readClockMs() is already imported and called twice earlier in the same file with no guarding,
    so the file's own convention treats it as a plain, repeatable clock read.
preserved:
- persistenceStageBoundMs's computation, used unchanged to size the write attempt(s).
- persistWithinBound's one-retry-in-leftover-time policy.
- The settled/not-settled branching.
- InvestigationWriteDeadlineExceededError's own shape (id and remainingMs in context, message template).
---

## What it is

See summary.

## Notes

None.
