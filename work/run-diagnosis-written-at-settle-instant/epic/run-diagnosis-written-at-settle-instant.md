---
title: run-diagnosis stamps written_at before the write settles
summary: The single corrective task that stamps an investigation's written_at from the instant the write
  that actually persists it settles, never from a pre-dispatch or pre-persistence clock read.
rationale: A corrective increment cuts no epic through survey/decomposition -- this is the structural
  container the validator still requires, holding only the one task claim.
covers:
- rules/investigation/written-at-records-when-the-write-settled
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment run-diagnosis-written-at-settle-instant.

## Notes

None.
