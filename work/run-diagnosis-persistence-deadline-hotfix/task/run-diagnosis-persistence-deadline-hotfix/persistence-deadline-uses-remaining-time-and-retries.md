---
title: Persistence deadline uses remaining time and retries
summary: Fixes run-diagnosis.ts's writeWithinDeadline to compute its stage bound against the time actually
  remaining before the propagated deadline when persistence begins (not the request's stale entry instant),
  and to retry once within whatever of that same capped bound the first attempt left unspent, keyed by
  the investigation's own id so any attempt finding the record already there settles rather than duplicating
  it, before raising InvestigationWriteDeadlineExceededError.
objective: run-diagnosis.ts's persistence stage computes its bound as the minimum of its own nominal budget
  and the time actually left before the propagated deadline at the moment persistence begins — not against
  the request's original entry instant — and retries a write once within whatever of that same bound the
  first attempt's own elapsed time left unspent, with the investigation's own id identifying at most one
  record so any attempt that finds the record already present settles rather than duplicating it, before
  raising InvestigationWriteDeadlineExceededError, which the requester always receives as a named HTTP
  500 response.
criteria:
- A write whose first attempt is issued after collection, judgment and writing have together consumed
  enough of the declared total that less than the full persistence nominal budget remains before the deadline
  is bounded by that smaller remaining figure — never by the persistence nominal budget computed against
  the request's original entry instant.
- The persistence stage's own nominal budget stays PERSISTENCE_STAGE_BUDGET_MS = 2000 milliseconds, unchanged
  by this fix.
- Where the persistence stage's own bound — the minimum of its nominal budget and the time remaining before
  the deadline when persistence begins — is zero or less, no write attempt is issued at all and InvestigationWriteDeadlineExceededError
  is raised immediately, without the store ever being called.
- A write's first attempt is held to the whole of the persistence stage bound and never capped below it
  to reserve time for a retry — it runs until it settles or the stage bound elapses, whichever comes first.
- 'A write whose first attempt fails at some point before its own bound (the full persistence stage bound:
  the minimum of its nominal budget and the time remaining before the deadline when persistence began)
  elapses, leaving more than zero milliseconds of that bound unspent, is retried exactly once, bounded
  by whatever of that same stage bound remains unspent after the first attempt''s own elapsed time.'
- A write whose first attempt fails with zero or fewer milliseconds of the stage bound left unspent, or
  whose first attempt runs until the stage bound itself elapses without settling, is not retried, and
  InvestigationWriteDeadlineExceededError is raised immediately.
- 'Any write attempt — the first attempt or the retry — that finds a record already persisted under the
  investigation''s own id counts as a write that settled successfully: it persists no second record, and
  does not raise InvestigationWriteDeadlineExceededError.'
- InvestigationWriteDeadlineExceededError is raised whenever neither the first attempt nor the retry (where
  one is issued) settles successfully — whether because the persistence stage's own bound elapsed first,
  an attempt failed outright, or no time remained for a retry — and is never raised once a write has settled
  successfully, including an attempt that found the record already there.
- Every path that raises InvestigationWriteDeadlineExceededError is answered to the requester as an HTTP
  500 response naming InvestigationWriteDeadlineExceededError as the reported condition.
- A write whose first attempt settles successfully before its own bound elapses answers normally, with
  no retry attempted and no change to the written investigation.
implements:
- constraints/the-deadline-is-an-absolute-propagated-instant
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/an-answer-arrives-within-the-declared-deadline
- rules/investigation/an-investigation-is-written-once
sources:
- intake/scope.md
- intake/deadline-bound-clarification.md
---

## What it is

The corrective fix to run-diagnosis.ts's persistence stage: its write-deadline bound is computed
against the time actually remaining before the propagated deadline at the moment persistence
begins, not against the request's stale entry instant, and a failed first attempt is retried once
within whatever of that same bound is left, with the investigation's own id keying settlement so
a retry (or a re-executed first attempt) that finds the record already there counts as settled
rather than duplicating it.

## Notes

REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline's opening
clause ("collection records a timeout result and judgment records deadline-exceeded") reaches no
criterion of this task; it belongs to the collection and judgment stages' own already-delivered
overrun behavior, not this persistence fix.
REMAINDER, from the specification — rules/investigation/an-investigation-is-written-once's clause
"no intermediate domain state persists" reaches no criterion of this task; it belongs to the
persistence stage's original whole-record write, not this deadline-and-retry correction.
REMAINDER, from the specification — rules/investigation/an-answer-arrives-within-the-declared-deadline's
whole statement (the twenty-second total and its margin under the caller's timeout) reaches no
criterion of this task beyond the two-second persistence slice its Description states; the total
and the caller-timeout margin belong to the request-entry work that records and sizes the declared
deadline, not this fix.
REMAINDER, from the specification — constraints/the-deadline-is-an-absolute-propagated-instant's
first clause ("A request records one absolute deadline at entry") is presupposed by this task
rather than demonstrated by it, and its third clause ("the internal total stays below the caller's
timeout with margin") reaches no criterion here; both belong to the request-entry work.
Decision, beyond the covers — stand: rules/investigation/an-investigation-is-written-once was added
to this epic's covers after repeated binder passes found the retry unsafe without it (a retry
following a first attempt whose outcome is unknown could otherwise persist a duplicate record);
the epic's claim grew rather than moving this task, since the id-keyed settlement this task
delivers is inseparable from the deadline-and-retry fix itself.
ADVISORY — the persistence stage's 2000ms nominal budget this task pins (criterion 2) is stated
only in rules/investigation/an-answer-arrives-within-the-declared-deadline's Description, which
marks the whole twenty-second split as "an engineering proposal pending operational
confirmation"; an operational confirmation that revises the split moves this criterion with it.
Four facts were decided into the specification while this task was bound, each disclosed in the
specification's own decision log against rules/investigation/no-stage-aborts-on-its-deadline
(three entries: the retry count, the error identity and status, and the zero-or-less-bound case)
and rules/investigation/an-investigation-is-written-once (one entry: the id-keyed once-ness this
task's criterion 7 and criterion 8 depend on).
