---
title: A hypothesis run returns its own cost
summary: SimulateHypothesisResult gains a required cost of the shape the case-level result
  already declares, threaded through useSimulateHypothesis's result and through the one
  shared fixture every hook-level spec builds that result from.
objective: A simulate-hypothesis run's record carries that run's own cost beside its durations
  and hands both to useSimulateHypothesis's caller, so the narrowed run has the totals
  the specification requires of it rather than none.
criteria:
- SimulateHypothesisResult in src/hooks/use-simulate-hypothesis.ts declares cost as a
  required field carrying calls, input_tokens and output_tokens.
- That cost field reuses the SimulateCost already declared in src/hooks/use-simulate-case.ts
  rather than a second declaration of the same three members.
- SimulateHypothesisResult declares durations beside cost, so the narrowed run's record
  carries both totals the rule names.
- The durations a hypothesis run carries express writing as absent rather than as a figure,
  since that run reaches no consolidation call.
- useSimulateHypothesis's onSimulate result carries the cost the response returned, unaltered.
- A simulate-hypothesis response whose cost totals one judgment call and no consolidation
  call reaches the caller with those totals intact.
- simulateHypothesisResult in src/hooks/use-case-simulation-cockpit.test-support.ts returns
  a SimulateHypothesisResult carrying a cost.
- No call site in src/hooks/use-case-simulation-cockpit.ts or in any spec reading hypSim's
  result declares a hypothesis-result literal of its own to supply the new field.
- The frontend type-checks with no error arising from SimulateHypothesisResult in any
  file that declares, builds or consumes one.
rationale: 'The scope states finding 4 and names the shape to reuse; folding the shared
  fixture builder and the threading through use-case-simulation-cockpit.ts into this same
  task is my cut, from the inventory''s recorded risk that a required field on this type
  changes onSimulate''s result shape everywhere the shared builder is consumed. The criterion
  on durations is mine as well: the scope names only the missing cost, while the governing
  rule names cost and durations together as what the narrowed run returns, so a criterion
  that pins only one of the two would leave the other demonstrable by nothing.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/review-findings-1-to-4.md
implements:
- rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
- domain/investigation/cost
- domain/investigation/durations
---

## What it is
The hypothesis-run result type and the one shared fixture every hooks-level spec builds it from.
It carries no cost today, so the surface that presents a shown run has nothing to present for a hypothesis run and nothing honest to say instead.
This task adds the field, reuses the cost shape already declared once for the case-level result, and threads the response's value through to the hook's caller.

## Notes
The inventory records SimulateCost at src/hooks/use-simulate-case.ts:43 as the one existing declaration of the three-member shape, which is the reuse point rather than a model to copy.
It records simulateHypothesisResult at src/hooks/use-case-simulation-cockpit.test-support.ts:245-249 as the one shared fixture for this type, constructing it with no cost today.
It records use-case-simulation-cockpit.ts as reading hypSim's result through previousHypothesisResultRef, which is the threading path the new field travels.
REMAINDER, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations states that a simulate-hypothesis call's returned record carries that run's own cost; no criterion of this task makes the simulate-hypothesis response emit a cost at all — every criterion here types, threads or fixtures a cost assumed already present on the response. Belongs: the backend work that produces the simulate-hypothesis response for contracts/investigation/case-simulation; not this frontend task.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one states that the curator's simulation surface presents every part of the shown run, cost and durations alike, from that run's own returned record; no criterion of this task reaches retention, selection, or presentation of a hypothesis run's cost and durations — this task stops at the hook's result type, its threading and the shared fixture. Belongs: a task presenting a retained hypothesis run's cost and durations on the curator's simulation surface.
ADVISORY, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations' own Description points at domain/investigation/usage for the cost shape, but it is domain/investigation/cost, named in that rule's own constrains, that declares the three-member shape (calls, input_tokens, output_tokens) this task's first criterion requires; domain/investigation/usage is the call-granularity two-member shape. Nothing in this task diverges — the criteria follow domain/investigation/cost — but the rule's prose points a reader at the wrong node for the shape it demands.
