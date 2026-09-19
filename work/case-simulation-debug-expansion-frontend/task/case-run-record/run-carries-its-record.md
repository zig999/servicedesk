---
title: A run entry keeps its own returned record
summary: CaseResultRun carries the durations, cost, consolidation record and whole
  payload of the run that produced it, not only of the latest run.
objective: Each entry in the session run history carries the case-level record its
  own run returned, so an earlier run's durations, cost, consolidation record and
  raw payload stay reachable after a later run completes.
criteria:
- CaseResultRun declares fields for the run's durations, its cost, the consolidation
  call's prompt, usage, elapsed_ms and register, and the whole payload the simulate
  call returned.
- toNewCaseResultRun fills each of those fields from the simulate-case response it
  is given.
- After two case simulation runs in one session, the earlier entry still carries its
  own durations, cost, consolidation record and payload, unchanged by the later run.
- Every existing producer of a run entry constructs the widened shape, so no call
  site is left building an incomplete run.
- A run entry recorded from a simulate-hypothesis call, which resolves no assessment,
  carries no consolidation record rather than an invented one.
rationale: Cut apart from every presentation task because what a run entry keeps changes
  for a different reason than what the curator is shown, and because the inventory
  records that a past run's raw payload has to be captured when the run is recorded
  rather than read back off the cockpit hook once a later run has replaced it.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
- rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- domain/investigation/assessment
- domain/investigation/cost
- domain/investigation/durations
- domain/investigation/usage
- domain/knowledge/consolidation-register
---

## What it is
The shape behind Runs this session and the adapter and hook that mint it.
Today an entry carries outcome, referral, text, register, hypotheses and its stale marking, and nothing of the run's cost, durations or consolidation call.
This task widens the entry and every producer of it in one move, leaving the readers to the tasks that present them.

## Notes
The inventory records NewCaseResultRun as CaseResultRun minus id, ranAt and stale, with the hook filling those three when appending.
The inventory also records the compare view and the case-result panel as existing readers of this type.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's clauses that the surface shows one retained run at a time, and that selecting an earlier run presents that run's record in place of the shown one, reach no criterion of this task; this task's criteria stop at the run entry carrying its own record.
Belongs to: the task in this epic that renders the shown run and the session's run-history selection.
REMAINDER, from the specification — rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked reaches no criterion of this task; this task renders no evidence item and masks nothing.
Belongs to: the task in this epic that renders a shown run's collected evidence items and their inputs.
REMAINDER, from the specification — rules/investigation/a-presented-consolidation-prompt-is-shown-whole is bound here only for carrying the prompt whole from the response; its rendering clauses reach no criterion of this task.
Belongs to: the task in this epic that renders the shown run's assessment, including its consolidation prompt.
REMAINDER, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations's demand on what the simulate-hypothesis operation itself returns is not produced by any criterion here, which only consumes it.
Belongs to: the task that makes the simulate-hypothesis operation's returned record carry the narrowed run's own cost and stage durations.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text reaches no criterion of this task; this task builds a curator-facing run entry, not a customer-facing surface.
Belongs to: the act that shapes the end customer's diagnosis response.
ADVISORY, from the specification — domain/investigation/durations states writing is present exactly when a consolidation call happened and absent for a run that never reaches consolidation; criterion 1 does not say the widened durations shape keeps writing optional. No criterion is contradicted, but the declared shape should hold writing optional, consistently with criterion 5.
