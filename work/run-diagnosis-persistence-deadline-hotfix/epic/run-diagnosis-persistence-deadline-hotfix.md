---
title: Run-diagnosis persistence deadline hotfix
summary: The single corrective task that fixes run-diagnosis.ts persistence stage
  to bound its write against the time actually remaining and to retry once within
  it.
rationale: A corrective increment cuts no epic through survey/decomposition — this
  is the structural container the validator still requires, holding only the one task
  claim.
covers:
- constraints/the-deadline-is-an-absolute-propagated-instant
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/an-answer-arrives-within-the-declared-deadline
- rules/investigation/an-investigation-is-written-once
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment run-diagnosis-persistence-deadline-hotfix.

## Notes

None.
