---
title: Report the actual remaining deadline when persistence gives up
summary: run-diagnosis.ts's InvestigationWriteDeadlineExceededError now carries the milliseconds actually remaining of the declared deadline at the moment persistence gave up, not the bound persistence was granted at entry.
rationale: A one-file, one-function fix isolated to run-diagnosis.ts; its own task because it shares no file with the other three corrections.
sources:
- intake/scope.md
objective: InvestigationWriteDeadlineExceededError's remainingMs is the milliseconds that remained of the declared deadline when persistence gave up, per rules/investigation/no-stage-aborts-on-its-deadline.
criteria:
- When persistence settles no write, InvestigationWriteDeadlineExceededError's remainingMs is computed by reading the clock again at the moment of the throw and subtracting from the declared deadline, clamped to zero, never the pre-computed stage bound persistence was granted at entry.
- Where the stage bound was already zero or less when persistence began (no write attempt made), remainingMs is still the deadline-minus-now reading taken at that same moment, consistent with the case where an attempt was made and failed.
- The error's message still states remainingMs milliseconds remaining of the declared deadline, using the corrected value.
- Every other behavior of writeWithinDeadline (the stage-bound computation, the one-retry-in-leftover-time policy, the settled/not-settled branching) is unchanged.
- src's test suite passes.
implements:
- rules/investigation/no-stage-aborts-on-its-deadline
---

## What it is
`writeWithinDeadline` reads the clock again (`readClockMs()`) immediately before throwing `InvestigationWriteDeadlineExceededError`, and passes `Math.max(0, deadline - readClockMs())` as `remainingMs` instead of the pre-computed `stageBoundMs`.

## Notes
`stageBoundMs` stays exactly as it is for everything it already does — bounding the write attempt(s) — this task only changes what value the thrown error reports once persistence has given up.
