---
title: Instrumented judgment, consolidation and cost
summary: The judgment/consolidation ports, their Anthropic and fake adapters, evidence's own elapsed_ms, and diagnose's own switch from placeholder to real cost and durations.
rationale: The caller's own hint groups these four changes as one epic; the specific covers/uncovered split below, and the decision to keep it separate from the pipeline-extraction epic even though both touch run-diagnosis.ts's own record, are this decomposition's own reading of the impact set rather than something the scope stated.
sources:
  - work/case-simulation-backend/intake/scope.md
covers:
  - domain/investigation/usage
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/evidence
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/assessment-consolidator
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/investigation/investigation
  - constraints/judgment-runs-behind-a-port
  - constraints/consolidation-runs-behind-a-port
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
  - constraints/the-judgment-prompt-is-closed
  - constraints/the-consolidation-prompt-is-closed
uncovered:
  - node: constraints/judgment-runs-behind-a-port
    why: The port/adapter architecture already stands; this plan widens the port's return shape but does not change how or whether judgment is invoked only through the port.
  - node: constraints/consolidation-runs-behind-a-port
    why: Same architecture, unchanged by widening the consolidator port's return shape.
  - node: constraints/the-judgment-prompt-is-closed
    why: This epic's tasks relay a prompt already assembled elsewhere outward instead of discarding it; none of them changes what a judgment prompt may contain or how it is assembled, which is what this constraint governs.
  - node: constraints/the-consolidation-prompt-is-closed
    why: Same reasoning — this epic's tasks propagate the consolidation prompt outward as already materialized; none of them touches its assembly.
---

## What it is

The two published judgment/consolidation ports, widened to carry usage, elapsed time and the materialized prompt.
The Anthropic adapters that stop discarding the provider's own usage and timing, and the fake adapters that keep returning deterministic zeros under the widened shape.
Evidence's own per-concept elapsed_ms.
diagnose.controller.ts's own switch from the UNMEASURED_COST/UNMEASURED_DURATIONS placeholders to real accumulation.

## Notes

None.
