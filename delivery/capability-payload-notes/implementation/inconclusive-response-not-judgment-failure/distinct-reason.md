---
target: backend
title: A well-formed inconclusive judgment declares reason not-grounded, distinct from judgment-failure
summary: anthropic-hypothesis-evaluator.adapter.ts's outcomeFromModelText now routes a well-formed
  {"verdict":"inconclusive"} model answer to a new notGroundedOutcome, leaving judgmentFailureOutcome
  for a response that failed to parse, matched no recognized shape, or never arrived at all.
task: sha256:bc77f32243dec81af3e1ac3acee07a9b508f8bd528c7fd3efd7f872e17ae6b77
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
files:
- path: src/investigation/evaluation-reason.ts
  effect: EVALUATION_REASONS gains 'not-grounded' beside 'no-data', 'judgment-failure' and
    'deadline-exceeded'.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: >-
    Adds notGroundedOutcome(callRecord), mirroring judgmentFailureOutcome's shape
    ({ verdict: 'inconclusive', citations: [], ...callRecord }) but with reason: 'not-grounded' and
    callRecord required rather than optional. outcomeFromModelText's parsed.verdict === 'inconclusive'
    branch now calls notGroundedOutcome(callRecord) instead of judgmentFailureOutcome(callRecord);
    the parsed === undefined branch (unparseable or unrecognized-shape response) still calls
    judgmentFailureOutcome(callRecord), unchanged. The confirmed/refuted branches are untouched.
criteria:
- criterion: A well-formed model response of exactly {"verdict":"inconclusive"} yields an
    evaluation whose reason is "not-grounded".
  met: true
  how: outcomeFromModelText's parsed.verdict === 'inconclusive' branch calls notGroundedOutcome,
    which sets reason to 'not-grounded'.
- criterion: A model response that cannot be parsed as JSON, or whose shape this adapter does not
    recognize, still yields an evaluation whose reason is "judgment-failure".
  met: true
  how: parsed === undefined (JSON.parse failure, non-plain-object, unrecognized verdict, or
    missing/invalid citations) still calls judgmentFailureOutcome, unchanged.
- criterion: A well-formed {"verdict":"confirmed",...} or {"verdict":"refuted",...} response is
    unaffected by this change and yields the same verdict and citations as before.
  met: true
  how: The confirmed and refuted branches of outcomeFromModelText are untouched by this task.
nodes:
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/investigation/evaluation-reason.ts
  how: The enumeration gains the fourth value this task's criteria require.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The rule's distinction between a call that ran to completion and answered a well-formed
    inconclusive verdict (not-grounded) and a response the system could not read at all
    (judgment-failure) is exactly outcomeFromModelText's new split.
inferences:
- inferred: notGroundedOutcome takes callRecord as required rather than optional, unlike
    judgmentFailureOutcome's optional parameter.
  from: The only caller of notGroundedOutcome (outcomeFromModelText's inconclusive-verdict branch)
    always has a callRecord in scope at that point, since a call that never resolved cannot have
    parsed a verdict at all.
preserved:
- judgmentFailureOutcome's own shape and every existing caller of it apart from the one branch
  this task redirects.
- The confirmed and refuted verdict branches, unchanged.
---

## What it is

The adapter's inconclusive-verdict outcome now distinguishes a well-formed inconclusive judgment
(not-grounded) from a response the system could not read at all (judgment-failure), per the
rule's own distinction.

## Notes

None.
