---
title: Simulation Detail panel hypothesis hotfix
summary: Corrects the case-simulation cockpit's Detail panel so a single-hypothesis
  simulation's own Evidence and Prompt tabs show data the dispatch response already
  carries, instead of always-empty placeholders.
rationale: 'Corrective increment: one wrong behavior observed running the delivered
  system, cut by the human, without the survey or the decomposition -- CLAUDE.md''s
  own corrective-increment route.'
covers:
- domain/investigation/evaluation
- domain/investigation/evidence
- domain/investigation/evaluation-reason
- domain/investigation/investigation
- contracts/investigation/case-simulation
uncovered:
- node: domain/investigation/investigation
  why: The execution-contract-binder confirmed this task's own objective and criteria
    touch only what a simulate-hypothesis/simulate-case response already carries before
    any investigation record could exist -- contracts/investigation/case-simulation
    itself states neither operation ever writes an investigation. domain/investigation/investigation's
    own model/prompt_version attributes belong to the aggregate a diagnose call writes,
    which this corrective increment's one task never reaches.
sources:
- intake/scope.md
---

## What it is
The case-simulation cockpit's own Detail panel (Evidence tab, Prompt tab) and the two files behind the observed bug: use-case-simulation-cockpit.ts (discards a hypothesis-sourced response's own evidence) and case-simulation-cockpit-adapters.ts (always reports no judgment call happened).

## Notes
None.
