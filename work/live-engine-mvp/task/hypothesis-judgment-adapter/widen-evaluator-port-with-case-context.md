---
title: Widen the hypothesis-evaluator port to carry the pinned case's title and when_to_use
summary: IHypothesisEvaluator.evaluate() and its one caller, judgment-stage.ts, pass the pinned case's title and when_to_use through, alongside the hypothesis's criterion and evidence.
rationale: The scope's front 1 asks for a prompt that carries the case's title and when_to_use, but the survey found the existing port signature (evaluate(criterion, evidence)) has no parameter for either, and its one caller (judgment-stage.ts, which already holds the whole Case) does not pass them. I cut this as its own task, ahead of and separate from the real adapter, because widening a used interface and writing a new implementer of it are different reasons to change — the real adapter task depends on this one rather than folding the two together.
objective: IHypothesisEvaluator.evaluate() accepts the pinned case's title and when_to_use alongside the hypothesis's own criterion and evidence, and judgment-stage.ts passes them through on every call it makes.
criteria:
  - IHypothesisEvaluator.evaluate() declares parameters for the hypothesis's criterion, its own evidence, and the pinned case's title and when_to_use.
  - judgment-stage.ts's first evaluate() call and its retry both pass the same case's title and when_to_use the judgeHypotheses() call itself was given, unchanged.
  - FakeHypothesisEvaluator and every existing test constructing an evaluate() call compile and run against the widened signature, with judgment-stage.spec.ts and hypothesis-evaluator.port.spec.ts still passing.
implements:
  - domain/investigation/hypothesis-evaluator
  - constraints/judgment-runs-behind-a-port
  - constraints/the-judgment-prompt-is-closed
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The one port through which judgment is invoked gains two more read-only parameters.
Its one caller forwards the case's own already-held title and when_to_use rather than reading them from anywhere new.

## Notes

domain/investigation/hypothesis-evaluator's own Responsibility text reads "given one hypothesis's criterion and its evidence only" — read narrowly, "only" scopes to another hypothesis's own criterion and evidence, not the pinned case's own context, consistent with the amended constraints/the-judgment-prompt-is-closed naming the case's title and when_to_use as permitted content that "grew" the closed block by exactly these two facts. The Domain Model node's own wording was not textually touched when the constraint was amended; a future reader could take "only" the broader way, so the analysis may want to reconcile the wording explicitly.
constraints/the-judgment-prompt-is-closed's own clauses on the delimited data block and the absence of tool calling govern how a prompt is actually built and how the provider is actually called — this task builds neither; both belong to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator, which does.
rules/investigation/judgment-does-not-infer constrains an adapter that actually deduces from evidence; this task only widens evaluate()'s input parameters and touches no judgment behavior. Belongs to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator.
rules/investigation/a-decided-evaluation-cites-evidence and rules/investigation/an-inconclusive-evaluation-declares-its-reason both constrain the returned Evaluation/EvaluationOutcome shape, which this task leaves untouched — no criterion here mentions the returned verdict, citation or reason. Both belong to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator.
