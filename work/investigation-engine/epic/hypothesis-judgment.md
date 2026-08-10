---
title: Hypothesis judgment
summary: Isolated, deadline-bounded, cited judgment of every hypothesis a pinned case requires, behind the hypothesis-evaluator port and its fake test adapter.
rationale: Splitting the port's declaration, the structural citation check and the orchestration that calls both under a pool and a deadline follows the same seam test the whole plan applies elsewhere — an interface, a pure check and a policy change for three different reasons. The citation check mirrors the coherence-validation pattern already used for the case aggregate, applied here to an evaluator's response instead of a stored document.
covers:
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/evaluation
  - domain/investigation/evaluation-reason
  - domain/investigation/citation
  - domain/investigation/verdict
  - rules/investigation/a-citation-stays-within-the-hypothesis-collects
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
  - rules/investigation/judgment-does-not-infer
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/one-evaluation-per-required-hypothesis
  - scenarios/investigation/a-foreign-citation-is-refused
  - scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - contracts/integration/capability-registry
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
  - constraints/judgment-runs-behind-a-port
  - constraints/the-judgment-prompt-is-closed
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: constraints/the-judgment-prompt-is-closed
    why: The scope names only the fake test adapter for hypothesis-evaluator. A real LLM adapter, whose prompt assembly this constraint governs, is a distinct remainder this epic does not build.
sources:
  - intake/scope.md
---

## What it is

The judgment stage that answers one evaluation per hypothesis a case requires.
Each hypothesis is judged in its own isolated call, its evaluator's citations checked structurally, and every degradation path — no data, a failed check, a missed deadline slot — lands as a declared reason rather than a silent gap.

## Notes

None.
