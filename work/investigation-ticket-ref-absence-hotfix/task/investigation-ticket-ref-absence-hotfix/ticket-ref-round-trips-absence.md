---
title: ticket_ref round-trips absence as absence, never as an empty string
summary: Fixes relational-investigation-store.repository.ts's read to preserve an absent ticket_ref
  as absent, instead of coalescing it to an empty string, and never writes or reads back an empty
  string as a ticket reference at all.
objective: Reading back a persisted investigation answers ticket_ref exactly as it was at write —
  absent when the diagnose call carried none, present with its exact value when it did — never an
  empty string standing in for absence.
criteria:
- Reading back an investigation whose ticket_ref was absent at write answers ticket_ref as absent
  (the attribute is not present on the returned object), never as an empty string.
- Reading back an investigation whose ticket_ref was given at write answers that exact value,
  unchanged.
- A diagnose call giving an empty string as its ticket reference is recorded and read back as an
  absent ticket_ref, never as an empty-string value, matching
  rules/investigation/an-empty-ticket-reference-is-no-ticket-reference.
implements:
- domain/investigation/investigation
- rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
sources:
- intake/scope.md
---

## What it is

The corrective fix preserving an absent ticket_ref as absent on read, and normalizing an
empty-string ticket reference to absence at write, matching
rules/investigation/an-empty-ticket-reference-is-no-ticket-reference (decided while this task was
bound).

## Notes

Decided while this task was bound: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
now states explicitly that ticket_ref never holds the empty string — an empty ticket reference
given at a diagnose call is the absence of one, recorded and read back as none, with the call never
refused for it.
