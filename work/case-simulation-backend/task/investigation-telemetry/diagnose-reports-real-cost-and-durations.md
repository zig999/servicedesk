---
title: diagnose writes real cost and durations
summary: diagnose.controller.ts stops writing UNMEASURED_COST/UNMEASURED_DURATIONS and writes what the investigation actually cost and took.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: diagnose.controller.ts writes the investigation's real cost and durations instead of the UNMEASURED_COST/UNMEASURED_DURATIONS placeholders.
criteria:
  - diagnose.controller.ts no longer references UNMEASURED_COST or UNMEASURED_DURATIONS.
  - The written investigation's cost.calls counts exactly one call per required hypothesis judged plus one consolidation call.
  - The written investigation's cost.input_tokens and cost.output_tokens equal the sum of every judgment call's own usage and the consolidation call's own usage.
  - The written investigation's durations carry measured, non-constant values for collection, judgment, writing and total across two diagnose calls with different evidence/judgment timings.
depends_on:
  - task/investigation-telemetry/widen-judgment-and-consolidation-ports
  - task/investigation-telemetry/evidence-collection-measures-elapsed-ms
implements:
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/investigation/usage
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/evidence
  - domain/investigation/investigation
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/assessment-consolidator
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
---

## What it is

The controller accumulates cost from every evaluation's and the consolidation's own usage, and durations from what the pipeline actually measured.

## Notes

status-map.ts's own STATUS_BY_ERROR_CLASS convention is unrelated to this task; nothing here adds a new error class.
REMAINDER, from the specification — `constraints/hypotheses-are-judged-in-isolated-parallel-calls`'s statement has three clauses (a hypothesis judged in its own call, in parallel, under a bounded pool). This task's criteria reach only the first (one call per hypothesis appearing in the recorded cost); the parallel-execution and bounded-pool clauses are unaddressed here. Belongs to the judgment stage itself, unchanged by this task.
