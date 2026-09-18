---
target: backend
title: Confirm not-grounded is already the adapter's reason for a well-formed inconclusive answer
summary: Implementation record confirming the production adapter, unchanged, already returns reason
  'not-grounded' for a well-formed {"verdict":"inconclusive"} model answer and unchanged
  'judgment-failure' for parse/shape/provider failures, so this corrective task required no source edit.
task: sha256:992f8f19d978353625c96d0abf9a5a00214f1186220980e877671472c87f8538
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: Unchanged by this task. outcomeFromModelText's branch for parsed.verdict === 'inconclusive'
    already calls notGroundedOutcome(callRecord), returning reason 'not-grounded', for a well-formed
    {"verdict":"inconclusive"} model answer. Its parsed === undefined branch (a response that failed
    to parse as JSON, or whose parsed shape parseJudgment does not recognize) and evaluate()'s
    message === undefined branch (a provider call that rejected, caught in requestJudgment) both
    still call judgmentFailureOutcome(callRecord), returning reason 'judgment-failure'. Confirmed by
    reading the file; no edit was made because the earlier inconclusive-response-not-judgment-failure/
    distinct-reason delivery already put this branching in place.
criteria:
- criterion: A test giving the adapter a well-formed model answer of {"verdict":"inconclusive"}
    asserts the resulting outcome carries reason 'not-grounded', not 'judgment-failure'.
  met: true
  how: The production fact this assertion depends on already holds unchanged — outcomeFromModelText
    parses {"verdict":"inconclusive"} to ParsedJudgment{verdict:'inconclusive'} and returns
    notGroundedOutcome, whose reason is 'not-grounded'. This record's reach stops at confirming that
    fact in the adapter; rewriting the test's own assertion to read it is this task's proof/test-author
    step, not made here.
- criterion: The sibling assertions in the same file for a response that failed to parse at all, that
    parsed into no recognized shape, or that never arrived because the provider call rejected, still
    assert reason 'judgment-failure', unchanged.
  met: true
  how: judgmentFailureOutcome is unchanged and still reached for all three cases — parseJudgment
    returns undefined for text that fails JSON.parse, for a non-plain-object, for an unrecognized
    verdict, and for a confirmed/refuted verdict whose citations are missing or invalid (feeding
    outcomeFromModelText's parsed === undefined branch); and evaluate() returns judgmentFailureOutcome
    directly when requestJudgment's try/catch turns a rejected provider call into message === undefined.
    None of this branching was touched by this task.
nodes:
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/investigation/evaluation-reason.ts
  how: EVALUATION_REASONS already lists 'not-grounded' beside 'no-data', 'judgment-failure' and
    'deadline-exceeded', added by the earlier distinct-reason delivery. This task adds nothing to the
    enumeration; it only confirms the adapter draws the reason its criteria describe from this existing
    set.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The rule's distinction — a judgment call that ran to completion and answered a well-formed
    inconclusive verdict declares not-grounded, while a response the system could not read at all
    declares judgment-failure — is exactly outcomeFromModelText's parsed.verdict === 'inconclusive'
    branch against its parsed === undefined branch, both unchanged by this task. Confirming that split
    still holds, for the well-formed-inconclusive case the criteria name, was the whole of this record's
    work; no edit was needed or made.
deferred:
- what: Rewriting the stale reason assertion (and confirming its sibling assertions) in
    src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts.
  why: The defect this task targets lives in test code, not production code. Fixing that assertion is
    this task's own proof/test-author step, explicitly withheld from this implementation record by the
    launching instructions — whose job is confirming the production fact the corrected assertion will
    read, not editing the test file.
---

## What it is

Confirms the production adapter already implements both criteria unchanged, since the earlier
inconclusive-response-not-judgment-failure/distinct-reason task's delivery already split the
not-grounded case out of judgment-failure. No source edit was needed.

## Notes

None.
