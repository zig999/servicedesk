---
title: written_at is stamped from the settle instant, not from a pre-write clock read
summary: Stops buildInvestigationOptions and investigationForRetry from stamping written_at before the
  write is issued, and stamps it instead from the instant the write that actually persists the record
  settles.
objective: An investigation's written_at, read back from the store, equals the instant the write that
  actually persisted it settled -- never an instant taken before that write settles, and never an instant
  taken after it (a later reading, such as one taken once the whole response has finished assembling).
criteria:
- written_at is not assigned by reading the clock at buildInvestigationOptions time, before writeWithinDeadline
  is ever invoked.
- For a run whose first write attempt settles, the persisted written_at equals that attempt's own settle
  instant -- neither earlier nor later -- provable by a fake store whose write() resolves only after an
  injected delay and whose settle instant the test itself captures for comparison.
- investigationForRetry does not assign written_at by reading the clock immediately before the retry's
  own write is dispatched.
- For a run whose first attempt times out and whose retry settles, the persisted written_at equals the
  retry's own settle instant -- neither earlier nor later -- provable by a fake store whose second write()
  resolves only after an injected delay and whose settle instant the test itself captures for comparison.
- For a run whose retry settles because the record already exists (InvestigationAlreadyStoredError), the
  persisted written_at remains the first attempt's own settle instant, unchanged by the retry.
- No code path in run-diagnosis.ts reads the clock for written_at at any point after the write that
  actually persists the record has settled -- written_at is fixed at (or derived from) that settle event
  itself, never recomputed from a later reading once the response has finished assembling.
implements:
- rules/investigation/written-at-records-when-the-write-settled
sources:
- intake/scope.md
---

## What it is

Moves run-diagnosis.ts's written_at stamping from a pre-write clock read to the instant the write
that actually persists the investigation settles, matching
rules/investigation/written-at-records-when-the-write-settled.

## Notes

UNDERDETERMINED, from the specification — every criterion binds only run-diagnosis.ts and proves the value through a fake store the test itself controls, so nothing holds the real persistence adapter to stamping at settle rather than at issue. An implementation that has the real adapter stamp written_at at the moment write() is invoked (before the underlying insert is dispatched) would satisfy every criterion as written if the test's fake store is not built to distinguish issue-time from settle-time. A test must use a fake store whose write() resolves only after an injected delay and must assert the persisted value against that resolve instant, not against any instant available before the call.
