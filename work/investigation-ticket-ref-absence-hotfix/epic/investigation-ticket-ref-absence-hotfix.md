---
title: Investigation ticket_ref absence hotfix
summary: The single corrective task that preserves an absent ticket_ref as absent on read, instead of
  coercing it to an empty string.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding only the one task claim.
covers:
- domain/investigation/investigation
- rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment investigation-ticket-ref-absence-hotfix.

## Notes

None.
