---
title: A judgment-failure evaluation carries its own call record, in memory and persisted
summary: Makes judgmentFailureEvaluation fold the completed (rejected) call's usage/elapsed_ms/prompt
  into the returned evaluation, and widens the investigation_evaluations table plus its read/write mapping
  to carry those same three fields for any evaluation, present exactly when a call ran.
objective: A judgment-failure evaluation carries the same usage, elapsed_ms and prompt as the completed
  call that produced it, both in the pipeline's own return value and in what is persisted and read back
  from the store.
criteria:
- judgmentFailureEvaluation folds the last judgment call actually made for that hypothesis into the
  returned Evaluation's usage, elapsed_ms and prompt -- the retryOrFail retry outcome where a retry ran,
  the runIsolatedCall first outcome where the remaining deadline admitted no retry -- the same way
  asEvaluation already does for confirmed, refuted and evaluator-returned inconclusive outcomes.
- Where a retry ran and also failed, the returned Evaluation carries the retry's own usage, elapsed_ms
  and prompt, never the superseded first call's, and never a usage summed across both attempts.
- A no-data evaluation (no evaluator call ever made) still carries no usage, elapsed_ms or prompt, unchanged
  by this fix.
- The investigation_evaluations table carries nullable columns for usage (input_tokens and output_tokens),
  elapsed_ms and prompt.
- evaluationStatement's INSERT populates those columns from the Evaluation being written, present exactly
  when the Evaluation itself carries them and absent otherwise.
- evaluationOf reconstructs usage, elapsed_ms and prompt onto the read-back Evaluation exactly as they
  were written, for every reason including judgment-failure.
- A stored investigation whose evaluation carries no call record (a no-data reason) still reads back with
  none of the three fields, unchanged by this fix.
implements:
- domain/investigation/evaluation
- rules/investigation/a-judgment-failure-records-the-last-call-made
sources:
- intake/scope.md
---

## What it is

Carries an evaluation's own usage, elapsed_ms and prompt through judgment-stage.ts's
judgmentFailureEvaluation and through relational-investigation-store.repository.ts's write and
read paths, so the fields domain/investigation/evaluation already declares survive the round trip
for a judgment-failure outcome.

## Notes

ADVISORY, from the binder — criterion 4's two column names (input_tokens and output_tokens) rest on domain/investigation/usage's own member names, which is not a candidate of this task.
Decision, beyond the covers — stand: domain/investigation/usage is not claimed in implements — this task persists a field using that node's already-existing shared shape and decides nothing new about it.
ADVISORY, from the binder — criteria 4 through 7 (the store's table, its INSERT, its read reconstruction, and no-data read-back) are backed only by domain/investigation/evaluation's own attribute list and presence condition; no candidate states anything about persistence mechanics directly, so the reading taken is that the store must preserve the value-object's declared shape and presence condition unchanged.
