---
title: Investigation written_at timing hotfix
summary: The single corrective task that stamps written_at from the instant the write settles, instead
  of the instant the request entered.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding only the one task claim.
covers:
- domain/investigation/investigation
- rules/investigation/an-investigation-is-written-once
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/written-at-records-when-the-write-settled
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment investigation-written-at-timing-hotfix.

## Notes

None.
