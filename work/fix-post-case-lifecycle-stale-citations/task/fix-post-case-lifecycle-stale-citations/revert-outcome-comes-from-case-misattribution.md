---
title: Revert resolve-and-narrow-input.ts's historical citation back to the-writing-input-is-narrowed
summary: Reverts a prior corrective delivery's own miscorrection -- the historical claim about the removed confirmed/fallback split should cite rules/investigation/the-writing-input-is-narrowed, per that node's own decision-log entry, not rules/investigation/the-outcome-comes-from-the-case.
objective: resolve-and-narrow-input.ts's module header once again cites rules/investigation/the-writing-input-is-narrowed for the removed confirmed/fallback split's historical implementation, matching that node's own decision-log entry.
criteria:
  - "resolve-and-narrow-input.ts's module header (currently: \"...the confirmed/fallback split this module once carried (task/assessment-drafting/resolve-and-narrow-input, scenarios/knowledge/no-confirmation-falls-back, scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome) implemented an earlier version of rules/investigation/the-outcome-comes-from-the-case and is removed.\") cites rules/investigation/the-writing-input-is-narrowed instead of rules/investigation/the-outcome-comes-from-the-case."
  - "No runtime behavior in src/investigation/resolve-and-narrow-input.ts changes: the existing test suite passes unchanged."
implements:
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/the-outcome-comes-from-the-case
sources:
  - intake/fifth-finding.md
---

## What it is

A corrective increment, fifth task of the same initiative: reverts a miscorrection the fourth
task's own fix introduced, per /reconcile's fifth pass.

## Notes

None.
