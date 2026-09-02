---
title: Judgment-failure evaluations carry their call record, in memory and through the store
summary: Proves judgmentFailureEvaluation folds the retry's own call record (never the discarded first
  call's, never summed) when a retry ran and also failed, proves the store's INSERT/SELECT round trip
  preserves usage/elapsed_ms/prompt for every verdict including judgment-failure, and proves the widened
  schema declares exactly the four new nullable columns. The one obsolete test that asserted the pre-fix
  behavior (a judgment-failure evaluation carries no call record even though a retry ran) was rewritten
  to assert the corrected behavior the task's own criteria 1 and 2 require, and the unit persistence fixture's
  default row was widened with explicit nulls for the four new columns so pre-existing read-back tests
  keep asserting what they always asserted rather than picking up a fixture artifact the new reconstruction
  logic would otherwise expose.
implementation: sha256:4f01907584f5def3972dcc2d57db530916c27926140f9a9210439982bdaf78ee
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/evaluation-call-record-lost-on-judgment-failure-carry-the-call-record-through-suite-4
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: attaches the retry's own usage, elapsed_ms and prompt -- never the discarded first call's, and
    never a usage summed across both attempts -- onto a judgment-failure evaluation when the retry also
    fails citation validation
  proves: Criterion 1's retry clause (judgmentFailureEvaluation folds the retryOrFail retry outcome when
    a retry ran) and criterion 2 in full (the retry's own record, never the first's, never summed). This
    test replaces a pre-existing test that asserted the opposite, pre-fix behavior (no call record at
    all on a judgment-failure evaluation); that assertion is exactly what this task's criteria 1 and 2
    overturn.
  fails_when: judgmentFailureEvaluation stops folding callRecordOf(outcome) at all (bare literal, as before
    this fix), or folds the first outcome's usage/elapsed_ms/prompt instead of the retry's, or sums input_tokens/output_tokens
    across both attempts instead of reading one outcome's own fields.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: a no-data evaluation carries no usage, elapsed_ms or prompt key at all -- judgment was never called
    for it
  proves: Criterion 3 (a no-data evaluation still carries no call record, unchanged by this fix). This
    test is pre-existing and untouched by this delivery; noDataEvaluation is confirmed untouched by the
    implementation record's own preserved section, so this existing assertion continues to hold and remains
    the proof for this criterion.
  fails_when: noDataEvaluation began attaching a usage, elapsed_ms or prompt key.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends a judgment-failure evaluation's own usage, elapsed_ms and prompt as the evaluation insert's
    own additional params, present exactly when the evaluation carries them
  proves: Criterion 5's positive branch -- evaluationStatement's INSERT populates the four new columns
    from an Evaluation that carries usage/elapsed_ms/prompt.
  fails_when: evaluationStatement stops sending input_tokens, output_tokens, elapsed_ms or prompt as the
    insert's fifth through eighth params, sends them in the wrong order, or drops them for a judgment-failure
    evaluation that carries them.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends null for usage's two columns, elapsed_ms and prompt on the evaluation insert when the evaluation
    given carries none of them
  proves: Criterion 5's negative branch -- absence on the Evaluation becomes SQL NULL, never undefined
    or an invented default.
  fails_when: evaluationStatement sends undefined instead of null, or invents a non-null default, for
    an evaluation carrying no call record.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reconstructs usage, elapsed_ms and prompt onto a read-back inconclusive evaluation exactly as
    the row's own four columns hold them, for the judgment-failure reason
  proves: Criterion 6 for the judgment-failure reason specifically.
  fails_when: evaluationOf/callRecordOf stops reconstructing usage, elapsed_ms or prompt for a judgment-failure
    row, or reconstructs any of them incorrectly.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reconstructs usage, elapsed_ms and prompt onto a read-back confirmed evaluation too, not only
    onto an inconclusive one
  proves: Criterion 6's "for every reason" breadth -- the reconstruction is not special-cased to the inconclusive
    branch alone.
  fails_when: callRecordOf's reconstruction is applied only inside the inconclusive branch of evaluationOf,
    leaving a confirmed or refuted row's usage/elapsed_ms/prompt unread.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: leaves usage, elapsed_ms and prompt off a read-back no-data evaluation, unchanged by this fix,
    when the row's own four call-record columns are all null
  proves: Criterion 7 at the persistence-unit level.
  fails_when: callRecordOf treats a null column as present, or evaluationOf attaches call-record keys
    unconditionally regardless of the row's own null columns.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: omits usage entirely when only one of input_tokens or output_tokens is present on the row, never
    constructing a usage object with a missing token count
  proves: An edge case the AND-shaped presence check in callRecordOf raises -- partial data on a row never
    manufactures a half-populated usage object.
  fails_when: callRecordOf constructs a usage object from a single non-null token count (i.e., uses OR
    instead of AND across input_tokens and output_tokens).
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a judgment-failure evaluation's own usage, elapsed_ms and prompt exactly as written,
    alongside its reason and empty citations
  proves: Criteria 5 and 6 together, end to end, against a real PostgreSQL instance through RelationalInvestigationStore.write/.read
    -- the write/read round trip the task asks for, specifically for a judgment-failure evaluation.
  fails_when: the real write/read round trip loses, mismatches or corrupts usage, elapsed_ms or prompt
    for a judgment-failure evaluation.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes a no-data evaluation's citation with no field at all -- the exact shape judgment-stage.ts's
    noDataEvaluation and the adapter's noDataOutcome now construct -- now that investigation_evaluation_citations'
    field column is nullable and no longer part of its primary key, and reads it back with concept present
    and no field key at all
  proves: Criterion 7 at the real-database round-trip level. This test is pre-existing and untouched by
    this delivery; its full-object toEqual against an evaluation carrying no usage/elapsed_ms/prompt would
    fail if the round trip began attaching any of those keys, so it continues to stand as proof for this
    criterion.
  fails_when: the real round trip attaches usage, elapsed_ms or prompt to a no-data evaluation that never
    carried them.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: holds every domain column NOT NULL except exactly the twelve columns the model declares optional
  proves: Criterion 4 -- investigation_evaluations carries input_tokens, output_tokens, elapsed_ms and
    prompt as nullable columns. This pre-existing exhaustive test was updated (its list widened from eight
    to twelve nullable columns, the title's count updated to match) because migration 0017 genuinely widens
    the nullable-column set this test enumerates against the real schema.
  fails_when: any of investigation_evaluations' input_tokens, output_tokens, elapsed_ms or prompt is declared
    NOT NULL, is missing from the schema, or an unexpected extra column becomes nullable.
untested:
- Criterion 1's other clause -- judgmentFailureEvaluation folding the runIsolatedCall first outcome's
  own record when the remaining deadline admitted no retry (retryOrFail's `if (deadlineGuard.elapsed())
  return judgmentFailureEvaluation(name, first);` branch) -- could not be exercised through judgeHypotheses's
  public API. Reaching that branch requires deadlineGuard.elapsed() to read true at the exact synchronous
  instant immediately after obtaining a first outcome that itself just won its own race against that same
  deadline signal, which no construction attempted (pool congestion, a tied same-tick timer race, a manually-resolved
  promise) could produce without landing on the already-covered deadlineExceededEvaluation path instead,
  or requiring the deadline to already be elapsed before any call is attempted, which acquireSlotOrDeadline
  also refuses before runIsolatedCall is ever entered. This half of criterion 1 is proven only by reading
  the code (the branch is structurally identical to the proven retry-failed branch, calling judgmentFailureEvaluation
  with first instead of retry), not by an integration test that can independently make it fail.
---

## What it is

Proves an evaluation's own usage, elapsed_ms and prompt survive judgment-stage.ts's
judgmentFailureEvaluation and the round trip through relational-investigation-store.repository.ts's
write and read paths, for a judgment-failure outcome, naming the last call actually made per
rules/investigation/a-judgment-failure-records-the-last-call-made.

## Notes

Untested: the no-retry branch of judgmentFailureEvaluation (deadline forecloses a retry) could not
be independently exercised through the public API -- proven only by code inspection of the
structurally identical, already-tested retry-failed branch.
