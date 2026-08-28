---
title: simulate-hypothesis endpoint wiring hotfix
summary: The one corrective task that rewires the frontend simulate-hypothesis dispatch
  to the backend route actually delivered.
rationale: A corrective increment cuts no epic through survey/decomposition -- this
  is the structural container the validator still requires, holding exactly the one
  task's own claim.
covers:
- contracts/investigation/case-simulation
- domain/investigation/evaluation
- domain/investigation/verdict
- domain/investigation/citation
- domain/investigation/evaluation-reason
- domain/investigation/usage
- domain/investigation/evidence
- domain/investigation/durations
- domain/investigation/subject
- domain/investigation/investigation
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- scenarios/investigation/a-single-hypothesis-is-simulated
sources:
- intake/scope.md
---

## What it is

A single-task epic for the simulate-hypothesis-endpoint-hotfix corrective increment.

## Notes

Grown after the first execution-contract-binder round: criterion 2's request body (case, subject,
requester, hypothesis) rests on facts domain/investigation/subject, domain/investigation/investigation
(requester) and domain/knowledge/case (case identity) state, which the first candidate set did not
name. rules/investigation/a-simulation-writes-no-investigation was dropped from covers: the binder
classed it remainder, belonging to the already-delivered backend simulate-hypothesis-operation task,
never reached by a frontend dispatch-wiring fix.
