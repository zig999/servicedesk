---
title: Hypothesis-evaluator port and its fake adapter
summary: The port through which one hypothesis is judged against its own evidence, plus a fake adapter returning controlled verdicts for tests.
objective: A caller can judge one hypothesis's criterion against its own evidence entirely behind an interface, exercised by a fake adapter that returns each verdict deterministically.
criteria:
  - The port's evaluate operation takes exactly one hypothesis's criterion and its own evidence, and answers an Evaluation carrying a verdict, citations when decided and a reason when inconclusive.
  - The fake adapter is driven by test-supplied fixtures and returns confirmed, refuted and inconclusive evaluations on demand, importing no LLM or provider client.
  - A unit test exercises the fake adapter for each of the three verdicts and asserts the shape of the Evaluation it answers.
rationale: The scope names the fake adapter explicitly for this port; isolating the port's declaration and its fake from the stage that calls it in parallel lets the interface change for its own reason — what a judgment call promises — independently of the orchestration around it.
implements:
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/evaluation
  - domain/investigation/evaluation-reason
  - domain/investigation/citation
  - domain/investigation/verdict
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
  - constraints/judgment-runs-behind-a-port
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The interface between the judgment stage and one hypothesis's judgment call.
A fake adapter that answers controlled fixtures, so isolation and degradation logic is testable without a real model.

## Notes

UNDERDETERMINED, from the specification — criteria 1 and 3 as written admit a fake-adapter fixture that returns an inconclusive evaluation with reason no-data and zero citations; rules/investigation/an-inconclusive-evaluation-declares-its-reason's own clause that a no-data reason cites the evidence whose result is not ok refuses exactly that value. Passes: a unit test exercising the fake adapter's inconclusive case with a fixture whose reason is no-data and whose citations list is empty, asserting only that verdict is inconclusive and a reason is present.
REMAINDER, from the specification — rules/investigation/a-citation-stays-within-the-hypothesis-collects governs an adapter that parses and validates a response and retries or falls back (scenarios/investigation/a-foreign-citation-is-refused); this task's fixture-driven fake performs no such validation. Belongs to task/hypothesis-judgment/citation-validation and, for the retry/fallback behavior, task/hypothesis-judgment/judgment-stage.
REMAINDER, from the specification — rules/investigation/a-cited-field-exists-in-the-capability-output-schema is machine-checkable validation against a capability's output schema, not something the port shape or its fake need. Belongs to task/hypothesis-judgment/citation-validation.
REMAINDER, from the specification — rules/investigation/judgment-does-not-infer constrains an adapter that actually deduces from evidence; a fixture-driven fake cannot violate or demonstrate it. Belongs to a future production (LLM) adapter for this port, which this plan does not build.
REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline's clauses on collection's and judgment's own timeout behavior and on persistence's exemption are stage orchestration above this port. Belongs to task/evidence-collection/evidence-collection-stage, task/hypothesis-judgment/judgment-stage and task/investigation-lifecycle/investigation-store respectively.
REMAINDER, from the specification — rules/investigation/one-evaluation-per-required-hypothesis constrains the Investigation aggregate's own coverage, not the evaluator port or its fake. Belongs to task/investigation-lifecycle/investigation-factory.
REMAINDER, from the specification — scenarios/investigation/a-foreign-citation-is-refused describes the production adapter validating and retrying a response, which this task's fake does not do. Belongs to a future production (LLM) adapter for this port, which this plan does not build.
REMAINDER, from the specification — scenarios/investigation/a-queued-judgment-is-deadline-exceeded constructs its evaluation from a missed pool slot, never calling this port at all. Belongs to task/hypothesis-judgment/judgment-stage.
REMAINDER, from the specification — scenarios/investigation/a-collection-timeout-degrades-to-no-data constructs its evaluation from a timed-out evidence record, never calling this port at all. Belongs to task/evidence-collection/evidence-collection-stage.
