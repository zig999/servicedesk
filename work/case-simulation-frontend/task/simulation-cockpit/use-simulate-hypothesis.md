---
title: use-simulate-hypothesis hook
summary: Dispatches the simulate-hypothesis operation and exposes exactly one evaluation, resolving no outcome.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: A mutation hook dispatches the simulate-hypothesis operation of contracts/investigation/case-simulation for one named hypothesis of a case version and a subject, and exposes exactly one evaluation, resolving no outcome and no assessment.
criteria:
  - For a version whose manifest holds more than one hypothesis, dispatching the hook against one named hypothesis observes only the concepts that hypothesis's own revision collects — never the collection plan's full union — per scenarios/investigation/a-single-hypothesis-is-simulated.
  - The hook's typed success response carries exactly one evaluation, shaped as domain/investigation/evaluation (verdict, citations when decided, reason when inconclusive, usage/elapsed_ms/prompt when a judgment call happened).
  - The hook's typed success response carries no outcome and no assessment field.
  - Nothing the hook does writes to, or invalidates, any query or endpoint that persists an investigation, satisfying rules/investigation/a-simulation-writes-no-investigation.
  - A dispatch failure resolves to a UI state through uiStateForApiError, the same convention use-simulate-case follows.
  - The hook exposes a pending status so a caller can gate a second dispatch while one is already in flight.
implements:
  - contracts/investigation/case-simulation
  - domain/investigation/evaluation
  - domain/investigation/verdict
  - domain/investigation/citation
  - domain/investigation/evaluation-reason
  - domain/investigation/usage
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - rules/investigation/a-simulation-writes-no-investigation
  - scenarios/investigation/a-single-hypothesis-is-simulated
---

## What it is

The hypothesis-level counterpart, answering `simulate-hypothesis`, and the direct proof that narrowing to one hypothesis resolves nothing beyond that hypothesis's own evaluation.

## Notes

The sibling backend initiative has not delivered this route yet; this task's criteria are demonstrated against the contract's declared shape through a mocked apiFetch, not a live endpoint.
