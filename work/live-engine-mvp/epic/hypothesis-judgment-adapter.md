---
title: Hypothesis judgment answers through a real LLM adapter
summary: A production Anthropic-backed implementation of the hypothesis-evaluator port, widened to carry the case's own situational context, plus the manifest work every LLM adapter in this plan needs.
rationale: The scope's front 1 names this adapter directly, but the survey found IHypothesisEvaluator.evaluate() carries only a hypothesis's criterion and evidence while the constraint it must satisfy was amended today to require the pinned case's title and when_to_use too; I grouped the port-widening work with the real adapter under one epic since both exist for the same reason (front 1), and placed the shared dependency-manifest task here since this epic's adapter is the first of two that need @anthropic-ai/sdk.
covers:
  - domain/investigation/hypothesis-evaluator
  - constraints/judgment-runs-behind-a-port
  - constraints/the-judgment-prompt-is-closed
  - constraints/the-domain-depends-on-no-infrastructure
  - rules/investigation/judgment-does-not-infer
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
sources:
  - intake/scope.md
---

## What it is

The port through which one hypothesis is judged gains a real, production adapter calling the Anthropic API.
Getting there first requires widening what the port itself carries, since the amended prompt-closure constraint needs case context the port does not yet pass through.
The manifest edit that authorizes @anthropic-ai/sdk for this and the consolidation epic alike lives here.

## Notes

None.
