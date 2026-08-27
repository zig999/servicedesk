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
  - The project still builds with every existing adapter (Anthropic and fake) unchanged.
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
