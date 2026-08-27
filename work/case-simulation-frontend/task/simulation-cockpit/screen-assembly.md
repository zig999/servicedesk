---
title: Screen assembly
summary: Composes the header, subject, hypotheses, detail and case-result regions into one working cockpit with cross-region gating and stale-marking.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The case-simulation screen composes the header, the subject region, the hypotheses table, the detail panel and the case-result region into one working cockpit at the registered route, sharing one subject between the full-case and single-hypothesis runs, allowing only one run at a time, and marking the last run "stale" on return from any of the linked editing screens.
criteria:
  - The "Simulate case" header action and every row's simulate action are disabled while the subject-derivation hook reports the subject is not ready, and enabled once it is.
  - The "Simulate case" header action and every row's simulate action are disabled while any simulation dispatch is already in flight, and only one dispatch may be in flight at a time.
  - Both the full-case run and any single-hypothesis run dispatch against the same subject the Subject region currently holds — no second, independent subject exists on the screen.
  - Selecting a hypothesis row opens the Detail region for that hypothesis's latest evaluation, whether it came from a full-case run or from simulating that hypothesis alone.
  - A completed full-case run populates the Case result region; a completed single-hypothesis run does not, since it resolves no outcome or assessment.
  - Returning from the hypothesis revision editor, the version editor, or the manifest screen invalidates the version's own query, reloads the hypotheses table, and marks the last run "stale" — using a hash or updated_at comparison of the version where one exists, and unconditionally otherwise, per D8.
  - An "error" run state is shown only for an operation failure (network, 5xx) dispatching a simulation, never for a returned verdict.
depends_on:
  - task/simulation-cockpit/case-simulation-route
  - task/simulation-cockpit/use-simulate-case
  - task/simulation-cockpit/use-simulate-hypothesis
  - task/simulation-cockpit/hypotheses-table
  - task/simulation-cockpit/detail-panel
  - task/simulation-cockpit/case-result-panel
  - task/subject-derivation/subject-panel
implements:
  - contracts/investigation/case-simulation
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-single-hypothesis-is-simulated
  - rules/investigation/the-customer-sees-only-the-text
  - domain/investigation/evaluation
  - domain/investigation/verdict
  - domain/investigation/evaluation-reason
  - domain/investigation/assessment
  - contracts/knowledge/case-lifecycle
---

## What it is

The whole cockpit the scope's "Edit and re-simulate (D8)" and "States and vocabularies (6.4)" sections describe once every region exists on its own.

## Notes

The sibling backend initiative has not delivered simulate-case/simulate-hypothesis yet; this task's criteria are demonstrated against mocked dispatches of use-simulate-case/use-simulate-hypothesis, not a live endpoint.
REMAINDER, from the specification — `rules/investigation/a-simulation-writes-no-investigation` is a candidate here but none of its clauses (writes no investigation; nothing collected enters a cache; nothing collected or judged is read by a diagnosis) is a fact this task's own criteria test — they govern the dispatch's backend behavior, not this screen's composition, gating, subject-sharing or stale-marking. Belongs to `use-simulate-case`/`use-simulate-hypothesis`, which already claim it.
