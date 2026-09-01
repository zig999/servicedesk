---
title: Deadline arithmetic clock-read hotfix
summary: The single corrective task that makes run-diagnosis.ts's persistence stage bound and simulate-hypothesis-pipeline.ts's
  judgment stage bound read the clock against the propagated deadline at the moment each stage begins,
  instead of reconstructing the remaining time from recorded stage durations.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding only the one task claim.
covers:
- constraints/the-deadline-is-an-absolute-propagated-instant
- rules/investigation/no-stage-aborts-on-its-deadline
- domain/investigation/durations
- rules/investigation/an-answer-arrives-within-the-declared-deadline
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment deadline-arithmetic-clock-read-hotfix.

## Notes

None.
