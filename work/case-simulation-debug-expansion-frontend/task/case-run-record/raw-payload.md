---
title: The whole returned payload as raw JSON
summary: A raw view of the simulate-case response for the shown run, as the per-hypothesis
  Debug already gives for one evaluation, with a resolved credential value masked
  inside an evidence item's inputs.
objective: The case result Debug presents the whole payload the simulate-case call
  returned for the shown run as raw JSON — evidence, evaluations, assessment, cost
  and durations together — showing every field as received and masking only the value
  a credential placeholder resolved to within a presented evidence item's inputs.
criteria:
- The block presents a raw JSON view of the shown run's returned payload.
- That view carries the run's evidence, its evaluations, its assessment, its cost
  and its durations in one payload.
- Apart from the masking of a resolved credential value inside an evidence item's
  inputs, the payload is presented as received, with no field dropped and none renamed.
- Whatever value a credential placeholder resolved to within a presented evidence
  item's inputs is shown as the fixed text ***REDACTED***.
- The field that held the masked value is still present in the presented inputs, and
  no other value in the payload is altered by the masking.
- An evidence item's inputs that hold no resolved credential value are presented exactly
  as recorded.
- The payload presented is the shown run's own, so selecting an earlier run in the
  session history presents that run's payload.
depends_on:
- task/case-run-record/run-carries-its-record
- task/case-run-record/consolidation-debug
rationale: Cut as its own task because a raw payload view is falsifiable on its own
  and changes for a different reason than any rendered field does; it is exactly the
  view that answers an unexpected result when no rendered field explains it. The one
  exception to "as received" is not my choice — rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
  states that an operator-facing surface presenting a collected evidence item masks
  the value a credential placeholder resolved to and replaces that value only, so
  the criteria carry the exception rather than a rule of my own.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- domain/investigation/assessment
- domain/investigation/cost
- domain/investigation/durations
---

## What it is
The case-level counterpart of the per-hypothesis Debug's JSON tab, which today shows one evaluation alone.
It is the only surface where the curator sees the whole record the contract says simulate-case returns.

## Notes
The inventory records the pretty-printed JSON rendering already built for the per-hypothesis JSON tab as the presentation this reuses.
REMAINDER, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations reaches no criterion of this task; every criterion here is about the simulate-case response for the shown run, a different record from a hypothesis run's.
Belongs to: the task covering the simulate-hypothesis run's returned record and its per-hypothesis Debug view.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text reaches no criterion of this task; this task's surface is the curator's own simulation surface.
Belongs to: the act delivering an assessment to the end customer.
ADVISORY, from the specification — contracts/investigation/case-simulation's enumeration of what simulate-case returns includes the resolved outcome and the evaluations' citations, which this task's second criterion's own enumeration omits; the third criterion's "no field dropped and none renamed" still retains them, so nothing is contradicted, but a reviewer checking the payload against the second criterion alone would not look for either.
