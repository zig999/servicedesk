---
target: backend
title: Fake hypothesis-evaluator's call record matches the specification's all-or-nothing rule
summary: Revises FakeHypothesisEvaluator.evaluate() so a no-data outcome is stripped of usage, elapsed_ms
  and prompt regardless of what the seed carried, and every other outcome always gets a complete placeholder
  call record -- usage, elapsed_ms and prompt together.
task: sha256:cf096697ac7afe6c57ec5c104812ed3b2d39a2e60393256636ec927b14049f32
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/fake-hypothesis-evaluator-no-data-usage-no-usage-or-elapsed-for-no-data-build-2
files:
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  effect: evaluate() now branches on the seeded outcome's reason. When reason is present and equals no-data,
    it returns a freshly built object carrying only verdict, reason and citations -- unconditionally omitting
    usage, elapsed_ms and prompt even when the seed itself supplied any of them, since a no-data outcome
    means judgment was never called. For every other outcome (confirmed, refuted, or inconclusive with
    a reason other than no-data) it returns the seed spread with ZEROED_USAGE and ZEROED_ELAPSED_MS merged
    in as before, plus prompt now set to the seed's own prompt when present or the new PLACEHOLDER_PROMPT
    constant when absent -- so every outcome representing an actual call always carries all three call-record
    fields together.
criteria:
- criterion: Calling evaluate() against a seed whose reason is no-data and which carries no usage or elapsed_ms
    of its own answers an outcome carrying no usage and no elapsed_ms.
  met: true
  how: The no-data branch constructs { verdict, reason, citations } explicitly, so a seed with no usage
    or elapsed_ms of its own answers with neither key present -- satisfied by construction rather than
    merely by the seed lacking them.
- criterion: Calling evaluate() against a seed whose reason is not no-data and which carries no usage
    or elapsed_ms of its own still answers an outcome carrying the fake's own placeholder usage and elapsed_ms.
  met: true
  how: Any seed not reasoned no-data falls to the second return, which always merges ZEROED_USAGE and
    ZEROED_ELAPSED_MS onto the seeded outcome regardless of what the seed itself carried.
nodes:
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  how: 'The node states usage, elapsed_ms and prompt are "present exactly when a call happened, absent
    when reason no-data means judgment was never called at all." The revision now encodes both directions
    of that "exactly": the no-data branch strips all three unconditionally, even when the seed itself
    supplied one or more of them, so a no-data outcome never carries a leftover call record; the non-no-data
    branch now completes the placeholder call record with a prompt alongside the existing usage and elapsed_ms
    whenever the seed did not supply its own, so an outcome representing an actual call always carries
    all three together rather than two of three.'
inferences:
- inferred: 'The no-data branch is built as a fresh object literal ({ verdict: outcome.verdict, reason:
    outcome.reason, citations: outcome.citations }) rather than by destructuring the seed and omitting
    usage/elapsed_ms/prompt via a rest pattern.'
  from: 'eslint.config.js''s @typescript-eslint/no-unused-vars is configured with only argsIgnorePattern:
    ''^_'', no varsIgnorePattern or ignoreRestSiblings; a rest-destructure that discards three underscore-prefixed
    bindings would trip MNT-02 (unused locals), so an explicit field-by-field literal was the shape that
    stays clean under the project''s own lint configuration.'
- inferred: The placeholder prompt is the literal string constant PLACEHOLDER_PROMPT = 'the fake evaluator
    materializes no real judgment prompt', applied only when the seed did not supply its own (outcome.prompt
    ?? PLACEHOLDER_PROMPT).
  from: TYP-04 (a value with meaning is a named constant) and the file's own existing convention -- ZEROED_USAGE
    and ZEROED_ELAPSED_MS are already named, deterministic placeholder constants for the same call record.
    A prompt has no natural zero value the way a token count or a duration does, so the constant is a
    descriptive sentence rather than an empty string, chosen so a reader who sees it in a fixture recognizes
    it as the fake's own filler rather than mistaking it for a materialized prompt the anthropic-hypothesis-evaluator.adapter.ts's
    real buildUserPrompt would have produced.
preserved:
- The throw naming the unseeded criterion when evaluate() is called against a criterion nothing seeded.
- Answering by criterion alone, ignoring the evidence and case-context arguments.
- A later seed for the same criterion replacing an earlier one.
- A seeded prompt on a non-no-data outcome passing through unchanged rather than being overwritten by
  the placeholder.
---

## What it is

Revises FakeHypothesisEvaluator.evaluate() so a no-data outcome is stripped of usage, elapsed_ms and prompt regardless of what the seed carried, and every non-no-data outcome always receives a complete placeholder call record (usage, elapsed_ms and prompt together), matching domain/investigation/evaluation's all-or-nothing rule in both directions.

## Notes

This is a revision of an earlier version of this record. The first version left both directions of the invariant open (per its own deferred section) because the task's stated criteria did not require them; the proof step's independent reading of domain/investigation/evaluation wrote two tests against the fuller rule, which failed against that first version -- a genuine disagreement between the two producers, resolved by a person's decision to widen the implementation rather than narrow the tests. Widening to complete the non-no-data branch's prompt in turn broke seven pre-existing tests in the same file that asserted the opposite (prompt absent); those are the proof step's to reconcile, per this framework's rule that a test whose owning file this delivery rewrote is this delivery's to answer, and they are rewritten whole in this task's proof.
