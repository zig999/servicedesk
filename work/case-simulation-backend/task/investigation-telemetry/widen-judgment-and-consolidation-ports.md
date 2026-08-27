---
title: Widen the judgment and consolidation ports to carry usage, elapsed time and prompt
summary: IHypothesisEvaluator and IAssessmentConsolidator declare usage/elapsed_ms/prompt, and the judgment stage attaches them onto each Evaluation a call produced.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: IHypothesisEvaluator.evaluate() and IAssessmentConsolidator.consolidate() declare usage, elapsed_ms and prompt in their return shape, and every Evaluation the judgment stage builds from a call that happened carries the usage/elapsed_ms/prompt that call's own port response returned.
criteria:
  - IHypothesisEvaluator.evaluate()'s return type declares an optional usage ({input_tokens, output_tokens}), an optional elapsed_ms and an optional prompt.
  - IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt, not optional.
  - An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms and prompt that call's own port response returned.
  - An Evaluation whose reason is no-data carries no usage, elapsed_ms or prompt.
  - The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their optional usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  - "The assessment-consolidator adapters (Anthropic and fake) change only enough to satisfy the widened, required ConsolidationOutcome return type — a placeholder usage of input_tokens 0 and output_tokens 0, and elapsed_ms of 0, with prompt as whatever the adapter already had assembled before this task touched it. Neither adapter gains real provider-usage reading or real call timing here — that is task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's and task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own declared scope, and duplicating it here is exactly the over-reach this criterion now exists to rule out."
implements:
  - domain/investigation/usage
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/assessment-consolidator
---

## What it is

The two ports' own return shape gains usage, elapsed_ms and prompt.
judgment-stage.ts attaches these onto every Evaluation whose call happened, and leaves them absent for a no-data evaluation.

## Notes

Criterion 2 corrected on composition from an earlier draft's "optional usage, elapsed_ms and prompt" for the consolidator to "not optional" — `domain/investigation/assessment` states these three fields (plus `register`) as required, never absent, because a consolidation call, unlike a hypothesis's judgment, never has a no-data reason to have been skipped. Two earlier binder rounds flagged the original wording as `blocking` against this same fact; the correction is disclosed here rather than silently made, recorded where `domain/investigation/assessment.md` itself was amended.
The single "every existing adapter (Anthropic and fake) unchanged" criterion is corrected on composition into the two criteria above it: as originally worded it silently contradicted the corrected criterion 2, since a non-optional ConsolidationOutcome cannot be satisfied by an adapter whose return type never changes. A first delivery attempt against the uncorrected wording implemented full real usage-reading and call timing in all three adapters (anthropic-hypothesis-evaluator, anthropic-assessment-consolidator, fake-assessment-consolidator) — squarely task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's and task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own declared scope — and broke 33 pre-existing tests whose mocks never supplied a provider `usage` field. That attempt was discarded (worktree reverted to clean) before this correction. The corrected pair of criteria states the actual boundary: hypothesis-evaluator adapters need no change at all (their new fields are optional); consolidator adapters need the minimum type-satisfying change and nothing behavioral beyond it.
