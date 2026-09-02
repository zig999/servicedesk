---
title: Judgment-failure evaluations carry their own call record, in memory and in the store
summary: judgmentFailureEvaluation now folds the outcome that produced it into usage/elapsed_ms/prompt
  exactly as asEvaluation does, and the investigation_evaluations table plus its write/read mapping carry
  those same three fields for any evaluation.
task: sha256:f8bd3471a204db92c7ea42af6ed60bdb5fa467c4dcf2b49c3ac6e61d1a12cb48
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/evaluation-call-record-lost-on-judgment-failure-carry-the-call-record-through-build
files:
- path: src/investigation/judgment-stage.ts
  effect: 'judgmentFailureEvaluation(name, outcome) now folds outcome''s usage/elapsed_ms/prompt via callRecordOf,
    the same helper asEvaluation uses. RetryOrFailOptions gained a first: EvaluationOutcome field; runIsolatedCall''s
    call into retryOrFail now passes first alongside the existing fields. retryOrFail calls judgmentFailureEvaluation(name,
    first) when the deadline forecloses a retry, and judgmentFailureEvaluation(name, retry) when the retry
    itself fails citation validation.'
- path: src/persistence/relational-investigation-store.repository.ts
  effect: IEvaluationRow gained input_tokens, output_tokens, elapsed_ms, prompt (each nullable). evaluationStatement's
    INSERT now writes those four columns from evaluation.usage?.input_tokens, evaluation.usage?.output_tokens,
    evaluation.elapsed_ms, evaluation.prompt (each null when absent). readEvaluations's SELECT reads the
    same four columns. A new callRecordOf(row) helper reconstructs usage/elapsed_ms/prompt onto the read-back
    Evaluation exactly when the corresponding columns are non-null, applied identically across the confirmed/refuted/inconclusive
    branches of evaluationOf.
- path: migrations/0017-evaluation-call-record.sql
  effect: 'New migration adding four nullable columns to investigation_evaluations: input_tokens INTEGER,
    output_tokens INTEGER, elapsed_ms INTEGER, prompt TEXT -- no DEFAULT, following the pattern of 0014/0015/0016
    for an optional per-row fact with no backfill semantics needed.'
criteria:
- criterion: judgmentFailureEvaluation folds the last judgment call actually made for that hypothesis
    into the returned Evaluation's usage, elapsed_ms and prompt -- the retryOrFail retry outcome where
    a retry ran, the runIsolatedCall first outcome where the remaining deadline admitted no retry -- the
    same way asEvaluation already does for confirmed, refuted and evaluator-returned inconclusive outcomes.
  met: true
  how: judgmentFailureEvaluation(name, outcome) calls the same callRecordOf(outcome) helper asEvaluation
    calls, spreading usage/elapsed_ms/prompt onto the returned Evaluation exactly when each is present
    on the outcome. retryOrFail's deadline-elapsed branch calls it with first (the outcome threaded in
    from runIsolatedCall); its final branch calls it with retry.
- criterion: Where a retry ran and also failed, the returned Evaluation carries the retry's own usage,
    elapsed_ms and prompt, never the superseded first call's, and never a usage summed across both attempts.
  met: true
  how: The final line of retryOrFail calls judgmentFailureEvaluation(name, retry) -- never first -- when
    citationsAreAcceptable(context, retry) is false, so only the retry's own record is folded in; callRecordOf
    never combines two outcomes, it reads fields off exactly one.
- criterion: A no-data evaluation (no evaluator call ever made) still carries no usage, elapsed_ms or
    prompt, unchanged by this fix.
  met: true
  how: 'noDataEvaluation is untouched by this change -- it still returns a bare { hypothesis, verdict:
    ''inconclusive'', reason: ''no-data'', citations } literal with no call-record fields.'
- criterion: The investigation_evaluations table carries nullable columns for usage (input_tokens and
    output_tokens), elapsed_ms and prompt.
  met: true
  how: Migration 0017-evaluation-call-record.sql adds input_tokens INTEGER, output_tokens INTEGER, elapsed_ms
    INTEGER and prompt TEXT to investigation_evaluations, each without NOT NULL, so all four are nullable
    and existing rows backfill to NULL.
- criterion: evaluationStatement's INSERT populates those columns from the Evaluation being written, present
    exactly when the Evaluation itself carries them and absent otherwise.
  met: true
  how: evaluationStatement's params now include evaluation.usage?.input_tokens ?? null, evaluation.usage?.output_tokens
    ?? null, evaluation.elapsed_ms ?? null, evaluation.prompt ?? null -- each column is populated exactly
    when the corresponding optional field is present on the Evaluation, and null otherwise.
- criterion: evaluationOf reconstructs usage, elapsed_ms and prompt onto the read-back Evaluation exactly
    as they were written, for every reason including judgment-failure.
  met: true
  how: readEvaluations's SELECT now reads input_tokens, output_tokens, elapsed_ms, prompt alongside hypothesis/verdict/reason.
    evaluationOf calls the new callRecordOf(row) helper and spreads its result onto all three verdict
    branches, so the fields round-trip identically regardless of reason.
- criterion: A stored investigation whose evaluation carries no call record (a no-data reason) still reads
    back with none of the three fields, unchanged by this fix.
  met: true
  how: For a no-data row, evaluationStatement was never asked to write usage/elapsed_ms/prompt, so the
    four new columns read back NULL; callRecordOf(row) only sets usage when both input_tokens and output_tokens
    are non-null, and only sets elapsed_ms/prompt when non-null, so a no-data row's read-back Evaluation
    carries none of the three, identical to before this fix.
nodes:
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0017-evaluation-call-record.sql
  how: The node declares usage, elapsed_ms and prompt as the value-object's own optional attributes, present
    exactly when a call happened, absent when reason no-data means judgment was never called at all. This
    task carries that already-declared shape through the one path that dropped it (judgmentFailureEvaluation)
    and through the persistence round trip, without adding or changing any attribute the node declares.
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'The invariant states the record names the last call actually made -- the retry''s own record where
    a retry ran, the first call''s where the remaining deadline admitted no retry -- never a superseded
    first call''s record where a retry ran, and never a summed usage. judgmentFailureEvaluation''s two
    call sites in retryOrFail encode exactly this: the deadline-elapsed branch (no retry ran) passes first;
    the retry-failed branch passes retry, never both, and callRecordOf reads fields off one outcome only,
    so no summing is possible.'
inferences:
- inferred: The two new numeric columns are named input_tokens and output_tokens, with no table-specific
    prefix.
  from: The task's own instruction text names them literally as input_tokens and output_tokens, and the
    binder's ADVISORY note states these two names rest on domain/investigation/usage's own member names
    -- Usage's own shape is { input_tokens, output_tokens } -- and investigation_evaluations holds no
    other tokens-shaped column that would need disambiguation.
- inferred: The new columns are added with no DEFAULT, leaving existing rows NULL.
  from: The domain node states these three fields are absent when reason no-data means judgment was never
    called at all -- a backfilled 0 or empty string would misstate that a call happened for every pre-existing
    row, so NULL is the only value that does not invent a call record. This mirrors migrations/0015-durations-writing-nullable.sql,
    which also went nullable with no DEFAULT.
- inferred: Migration filename 0017-evaluation-call-record.sql, continuing the existing numbering from
    0016.
  from: The existing sequential numbering convention in src/migrations/ (0001 through 0016), a filesystem/tooling
    detail, not a domain fact.
preserved:
- noDataEvaluation and deadlineExceededEvaluation are untouched -- no-data and deadline-exceeded evaluations
  continue to carry no call-record fields, exactly as before this fix.
- asEvaluation and its existing callRecordOf(outcome) helper in judgment-stage.ts are unchanged; the new
  judgmentFailureEvaluation reuses that same helper rather than duplicating its logic.
- The existing INVESTIGATION_EVALUATIONS_TABLE primary key, verdict/reason CHECK constraints, and the
  citations table's foreign key onto (investigation_id, hypothesis) are all unchanged -- only new nullable
  columns were added.
- Every other row shape and read/write path in relational-investigation-store.repository.ts is untouched.
---

## What it is

Carries an evaluation's own usage, elapsed_ms and prompt through judgment-stage.ts's
judgmentFailureEvaluation and through relational-investigation-store.repository.ts's write and
read paths, so the fields domain/investigation/evaluation already declares survive the round trip
for a judgment-failure outcome, naming the last call actually made as
rules/investigation/a-judgment-failure-records-the-last-call-made requires.

## Notes

None.
