---
title: Simulation cockpit
summary: The route, the entry points into it, the mutation hooks, and the four screen regions that let a curator run and inspect a full-case or single-hypothesis simulation.
rationale: The scope's default shape is one epic covering the route/entry, the two mutation hooks, the hypotheses table, the detail panel and the case-result panel; I kept that shape for everything that depends on `contracts/investigation/case-simulation`, which the sibling backend initiative has not yet delivered, as the one boundary distinguishing it from subject-derivation's already-published dependencies.
sources:
  - work/case-simulation-frontend/intake/scope.md
covers:
  - contracts/investigation/case-simulation
  - contracts/knowledge/case-lifecycle
  - contracts/integration/connector-diagnostics
  - domain/investigation/investigation
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
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - rules/investigation/a-simulation-writes-no-investigation
  - rules/investigation/the-customer-sees-only-the-text
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-simulation-never-enters-the-cache
  - scenarios/investigation/a-single-hypothesis-is-simulated
uncovered:
  - node: contracts/integration/connector-diagnostics
    why: This plan reuses the "Test connector" panel's established UI pattern (subject assembly, capability hint, raw request/response block) as precedent only; it does not touch the test-connector operation or its own screen.
  - node: scenarios/investigation/a-simulation-never-enters-the-cache
    why: This scenario proves a subsequent diagnosis re-observes rather than reading a simulation's cached evidence — a guarantee the diagnosis engine and its cache hold entirely on the backend. No task in this frontend plan runs a diagnosis or touches a cache, so no criterion here can exercise it.
---

## What it is

A curator's own entry to the same engine a diagnosis runs, open on a case version in either state.
Two mutation hooks front the two operations the contract publishes: one runs the whole case, the other narrows to one named hypothesis and resolves no outcome.
Four regions show the result: a precedence-ordered hypotheses table, a per-hypothesis detail with three tabs, and a case-result region that only appears after a full-case run and never persists what it shows.
No editors live inside the cockpit; the curator leaves it to edit and returns to a screen that marks its last run stale.

## Notes

None.
