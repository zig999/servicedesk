---
title: Fake adapters return zero-valued usage and timing
summary: fake-hypothesis-evaluator.adapter.ts and fake-assessment-consolidator.adapter.ts satisfy the widened ports with deterministic zeros.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: The fake hypothesis-evaluator and fake assessment-consolidator adapters satisfy the widened ports with zero-valued usage and elapsed_ms, keeping test doubles deterministic.
criteria:
  - "fake-hypothesis-evaluator.adapter.ts's evaluate() returns usage (input_tokens 0, output_tokens 0) and elapsed_ms 0 for any seeded call."
  - fake-assessment-consolidator.adapter.ts's consolidate() returns the same zero-valued usage and elapsed_ms, plus a placeholder prompt string.
  - An unseeded key still throws a plain Error, unchanged from the fakes' own existing behavior.
depends_on:
  - task/investigation-telemetry/widen-judgment-and-consolidation-ports
implements:
  - domain/investigation/usage
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/assessment-consolidator
---

## What it is

Both fakes keep answering from test-seeded fixtures, now also returning zeroed usage and elapsed_ms under the widened port shape, and a placeholder prompt for the consolidator.

## Notes

None.
