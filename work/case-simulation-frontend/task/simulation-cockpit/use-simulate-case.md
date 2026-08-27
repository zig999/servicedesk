---
title: use-simulate-case hook
summary: Dispatches the simulate-case operation and exposes its full response, following the apiFetch/useMutation convention.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: A mutation hook dispatches the simulate-case operation of contracts/investigation/case-simulation for a given case version and subject, and exposes the full response — evidence, evaluations, the resolved assessment, cost and durations — as typed data, following the apiFetch + useMutation convention use-test-connector-panel.ts already establishes.
criteria:
  - Dispatching the hook against a draft version and against a released version both succeed structurally the same way — the operation is open to either state, per contracts/investigation/case-simulation.
  - The hook's typed success response carries one evidence item per collected concept (result, capability/connector reference, elapsed_ms, observation, result_detail when present).
  - The hook's typed success response carries one evaluation per manifested hypothesis (verdict, citations when decided, reason when inconclusive, usage/elapsed_ms/prompt when a judgment call happened).
  - The hook's typed success response carries the resolved assessment (outcome, referral, determining hypothesis when one confirmed, text, register, usage, elapsed_ms, prompt), the total cost, and the per-stage durations, matching domain/investigation/assessment, domain/investigation/cost and domain/investigation/durations.
  - Nothing the hook does writes to, or invalidates, any query or endpoint that persists an investigation — the dispatch's only observable effect is the mutation's own in-memory result, satisfying rules/investigation/a-simulation-writes-no-investigation.
  - A dispatch failure resolves to a UI state through uiStateForApiError rather than a hand-checked error code at the call site, and an operation failure (network, 5xx) is never confused with a returned verdict.
  - The hook exposes a pending status so a caller can gate a second dispatch while one is already in flight.
implements:
  - contracts/investigation/case-simulation
  - rules/investigation/a-simulation-writes-no-investigation
  - scenarios/investigation/a-draft-case-version-is-simulated
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/usage
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evidence-result
  - domain/investigation/evaluation-reason
  - domain/investigation/assessment
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/referral
---

## What it is

The case-level counterpart of `use-test-connector-panel.ts`'s dispatch convention, answering `simulate-case`.

## Notes

The sibling backend initiative (case-simulation-backend) has not delivered this route yet; this task's criteria are demonstrated against `contracts/investigation/case-simulation`'s declared shape through a mocked `apiFetch`, not a live endpoint — no criterion here requires calling the real route.
REMAINDER, from the specification — `rules/investigation/a-simulation-writes-no-investigation`'s cache clause ("nothing it collects ever enters a cache") and never-read-by-a-diagnosis clause are not reached by this task's criteria: they govern how the backend composes its observation source for a simulation, not what this frontend hook does. Belongs to `work/case-simulation-backend`'s `case-simulation-pipeline` epic, whose `no-cache-simulation-composition` task already claims exactly this guarantee.
Response shape updated on composition to include `assessment.register`, `assessment.usage`, `assessment.elapsed_ms` and `assessment.prompt` — fields the specification decided onto `domain/investigation/assessment` after this task was first bound; criterion 4 reflects the node as it now stands.
