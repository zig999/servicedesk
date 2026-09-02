---
title: Simulate-case response omits assessment call-record and evidence-snapshot fields
summary: The single corrective task that widens SimulateCaseResponseDto to state the assessment call-record
  fields and the evidence item's own snapshotted semantics, now that domain/investigation/assessment and
  domain/investigation/evidence already require them.
rationale: A corrective increment cuts no epic through survey/decomposition -- this is the structural
  container the validator still requires, holding only the one task claim.
covers:
- domain/investigation/assessment
- domain/investigation/evidence
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment simulate-case-assessment-evidence-fields-omitted.

## Notes

None.
