---
title: Stage bounds read the clock against the propagated deadline, not reconstructed durations
summary: Fixes run-diagnosis.ts's persistence stage bound and simulate-hypothesis-pipeline.ts's
  judgment stage bound to read the clock against the propagated absolute deadline at the moment
  each stage begins, instead of reconstructing the remaining time by summing already-recorded
  stage durations.
objective: Both run-diagnosis.ts's persistence stage and simulate-hypothesis-pipeline.ts's judgment
  stage compute their own bound as the minimum of their nominal budget and the time actually
  remaining before the propagated deadline, read from the clock when the stage begins — never by
  subtracting recorded stage durations from the request's original entry instant, never assuming a
  conditionally-absent duration (durations.writing) is present, and never issuing a write attempt
  once the computed bound is zero or less.
criteria:
- run-diagnosis.ts's persistence stage bound is computed as the minimum of PERSISTENCE_STAGE_BUDGET_MS
  and the time remaining before the propagated deadline, measured from the clock at the moment
  persistence begins — never by subtracting durations.collection, durations.judgment and
  durations.writing from the request's original entry instant.
- That computation is written so it remains correct if durations.writing were ever absent — it
  never assumes the attribute is present — even though, for a diagnosis, durations.writing is
  currently always present, because investigation-pipeline.ts's own consolidation call is
  unconditional.
- Where the persistence stage's own bound (computed as above) is zero or less at the moment
  persistence begins, no write attempt is issued at all and the store is never called —
  InvestigationWriteDeadlineExceededError is raised immediately, exactly as
  rules/investigation/no-stage-aborts-on-its-deadline already states for this case.
- simulate-hypothesis-pipeline.ts's judgment stage deadline is computed as the minimum of
  JUDGMENT_STAGE_BUDGET_MS and the time remaining before the propagated deadline, measured from
  the clock at the moment judgment begins — never anchored to the run's entry instant regardless
  of how long collection took.
- A collection stage that consumes more than its own nominal budget results in the stage that
  follows it (persistence in run-diagnosis.ts; judgment in simulate-hypothesis-pipeline.ts)
  receiving correspondingly less time than its own nominal budget, measured against the clock —
  never the stage's full nominal budget regardless of how much time collection actually used.
implements:
- constraints/the-deadline-is-an-absolute-propagated-instant
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/an-answer-arrives-within-the-declared-deadline
- domain/investigation/durations
sources:
- intake/scope.md
---

## What it is

The corrective fix making run-diagnosis.ts's persistence stage bound and
simulate-hypothesis-pipeline.ts's judgment stage bound read the clock against the propagated
absolute deadline at the moment each stage begins, instead of reconstructing remaining time from
recorded stage durations, and never issuing a write into an already-elapsed bound.

## Notes

UNDERDETERMINED — a fix satisfying every criterion here could still leave run-diagnosis.ts's own
judgment and writing stages granted their full nominal budget or anchored to the request's entry
instant, since no criterion of this task reaches them; those two stages' own deadline handling is
not part of this fix's file scope and stays exactly as already delivered.
UNDERDETERMINED — no criterion here constrains how the computed persistence bound is spent across
the two write attempts rules/investigation/no-stage-aborts-on-its-deadline admits (the first
attempt held to the whole bound, the retry within whatever it left); that attempt-splitting
discipline is unchanged by this fix and is already correctly implemented in run-diagnosis.ts's
own raceWriteAttempt/retry logic, which this task does not touch.
UNDERDETERMINED — no criterion states what simulate-hypothesis-pipeline.ts's judgment stage does
when its own computed bound is zero or less; that degrade-to-deadline-exceeded behavior already
exists in judgment-stage.ts's own deadline guard and is unchanged by this fix.
UNDERDETERMINED — no criterion of this task restates domain/investigation/durations' own
definition of what durations.total counts; that fix is a separate corrective task
(durations-total-real-elapsed-hotfix) touching the same two pipeline files.
REMAINDER, from the specification — the collection half of
rules/investigation/no-stage-aborts-on-its-deadline's first clause ("collection records a timeout
result") reaches no criterion; it belongs to the already-delivered collection stage's own
degradation, not this fix.
REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline's final
clause (the HTTP 500 InvestigationWriteDeadlineExceededError response) is reached by criterion 3
only for the zero-or-less case; the both-attempts-overran case and the response shape belong to
the already-delivered diagnose route.
REMAINDER, from the specification — constraints/the-deadline-is-an-absolute-propagated-instant's
third clause ("the internal total stays below the caller's timeout with margin") and
rules/investigation/an-answer-arrives-within-the-declared-deadline's whole statement (the
twenty-second declared total and its margin below the caller's timeout) reach no criterion of this
task; they belong to the request-entry work that records and sizes the declared deadline.
ADVISORY — rules/investigation/collection-has-its-own-budget-within-the-total is a candidate but
not implemented here: criterion 5 turns on the following stage's own clock-read bound, not on
collection's own seven-second ceiling.
Decision, beyond the covers — stand: rules/investigation/collection-has-its-own-budget-within-the-total
is not claimed in implements; this task changes no collection-stage bound and no capability-timeout
clamp.
ADVISORY — criterion 4 names JUDGMENT_STAGE_BUDGET_MS as simulate-hypothesis-pipeline.ts's own
nominal figure; no node states a declared total or per-stage nominal budget for
simulate-hypothesis specifically, so the criterion is satisfiable without a stated figure, but the
constant's own value is held by no node.
