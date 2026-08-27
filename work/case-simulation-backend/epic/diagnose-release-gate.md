---
title: The release gate on diagnose
summary: diagnose refuses a case version still in draft state, naming that it is not released, per decision D6.
rationale: The caller's own hint separates this from the other two epics; it is named here as the tiebreak epic for a substrate task under this plan's own contract, though this plan carries no such task since no standard-presupposed artifact is absent.
sources:
  - work/case-simulation-backend/intake/scope.md
covers:
  - rules/investigation/only-a-released-case-version-is-diagnosed
  - scenarios/investigation/a-draft-case-version-refuses-diagnosis
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/investigation/investigation
---

## What it is

A new named domain error, refusing a diagnose request pinned to a draft-state case version before the engine runs.
The error's registration in status-map.ts's own STATUS_BY_ERROR_CLASS table.

## Notes

None.
