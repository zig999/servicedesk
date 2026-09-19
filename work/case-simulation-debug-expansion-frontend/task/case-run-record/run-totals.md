---
title: The run's own totals beside its durations
summary: Calls and tokens in and out for the whole run, shown next to the stage durations
  already on screen.
objective: The case result Debug presents the shown run's cost totals, its calls and
  its input and output token counts, beside the stage durations that run recorded.
criteria:
- The block presents the run's total call count.
- The block presents the run's total input token count and its total output token
  count.
- The block presents the run's collection, judgment and total durations.
- A run that recorded no writing duration is presented with no writing figure rather
  than with a zero.
- The totals presented are the shown run's own, so selecting an earlier run in the
  session history presents that run's totals.
depends_on:
- task/case-run-record/run-carries-its-record
- task/case-run-record/consolidation-debug
rationale: Kept separate from the consolidation record because a run's totals across
  every call and one call's own record are two falsifiable outcomes, and the scope
  itself lists them as two additions; whether they land as a tab or a line beside
  the durations is form and is left open here.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
- domain/investigation/cost
- domain/investigation/durations
---

## What it is
The one place a curator can learn what simulating the whole case cost.
Per-hypothesis token cost is already in the hypotheses table; no total for the run exists anywhere today.

## Notes
The inventory names the durations-line rendering with its conditional writing figure as the existing convention for an absent duration.
domain/investigation/durations declares writing present exactly when a consolidation call happened, which is the conditional presence the fourth criterion falsifies.
UNDERDETERMINED, from the specification — Criterion 3 names the total duration without fixing where it comes from, while domain/investigation/durations states that total is the whole call's own real elapsed time and "is never the sum of collection, judgment and writing, which loses the overhead and the gaps between stages".
A passing implementation that would defeat this as written: a Debug block that shows a "total" computed by adding the collection, judgment and writing figures it displays, instead of the run's own recorded total attribute.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's clauses about retention, showing one run at a time, and the evidence/evaluations/assessment parts of what is presented from the shown run's record reach no criterion of this task.
Belongs to: the task that builds the session run history and its run selection, and the tasks presenting the shown run's evidence items, evaluations and assessment.
