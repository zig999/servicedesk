---
title: The fourth inconclusive reason reaches the cockpit
summary: not-grounded joins the three values every evaluation-reason union in the cockpit
  admits, including the separately declared union the verdict cell keys its label map on.
objective: Every evaluation-reason union the case-simulation cockpit declares admits
  not-grounded, and the label lookup keyed on one of them answers for it, so a response
  carrying the fourth reason is neither rejected at the type boundary nor displayed without
  a label.
criteria:
- SimulateEvaluationReason in src/hooks/use-simulate-case.ts admits not-grounded.
- EvaluationReason in src/hooks/use-simulate-hypothesis.ts admits not-grounded.
- CockpitEvaluation's reason in src/routes/case-simulation-cockpit-adapters.ts admits
  not-grounded.
- SimulationEvaluationReason in src/routes/case-simulation-hypotheses-table-row.ts admits
  not-grounded.
- REASON_LABEL in src/routes/case-simulation-hypotheses-table-row.ts holds an entry for
  not-grounded.
- A simulate response whose evaluation carries reason not-grounded reaches verdictCell
  with a label rather than an absent lookup.
- No evaluation-reason union in the cockpit admits a value the specification's own enumeration
  does not declare.
- The frontend type-checks with no error arising from an evaluation reason in any file
  that declares or consumes one.
rationale: 'The scope names three unions; extending this task to a fourth — hypotheses-table-row''s
  own SimulationEvaluationReason and the REASON_LABEL keyed on it — is my cut, taken from
  the inventory''s recorded risk that toRowEvaluation carries the widened value there
  structurally, leaving the label lookup with no answer for it. Widening the three the
  scope names without the fourth would deliver a type that admits a value the screen
  cannot label, which is the same defect one step downstream rather than a fix.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/review-findings-1-to-4.md
implements:
- domain/investigation/evaluation-reason
---

## What it is
Four separately declared unions over the same enumeration, three of them named by the scope and one found by the survey.
Each carries three of the four values the specification declares, so a well-formed inconclusive answer over evidence that collected ok has no reading anywhere in the cockpit.
This task adds the fourth value to all four and the matching label to the one map keyed on them.

## Notes
The inventory records the fourth union as fed structurally from CockpitEvaluation's reason through toRowEvaluation, which is why widening the first three alone reaches it without widening it.
It records REASON_LABEL as a total record over that union, so the label entry is what the widening compels rather than an addition chosen here.
UNDERDETERMINED, from the specification — no candidate states what a surface must call not-grounded when it shows an inconclusive evaluation's reason, so the REASON_LABEL criterion is satisfied by any entry at all, including wording domain/investigation/evaluation-reason's own Description refuses (the four causes are distinct and none is the umbrella of the others). Passes: REASON_LABEL gains an entry keyed not-grounded whose label repeats or paraphrases the wording already used for judgment-failure or no-data, satisfying every criterion as written while showing the curator one of the three causes the enumeration holds distinct from it.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's clauses on retaining runs, showing one at a time, and presenting every part of the shown run from its own returned record reach no criterion of this task, whose criteria concern only which values the cockpit's evaluation-reason unions admit. Belongs: the task of the case-simulation cockpit epic that builds the session's run history and the one-run-at-a-time presentation.
