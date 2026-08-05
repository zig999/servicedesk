---
title: An answer arrives within a declared deadline
summary: The attendant waits on the line, so the answer is produced within twenty seconds and inside the caller's timeout.
ddd: invariant
statement: An investigation MUST produce its response within twenty seconds, and that deadline MUST be shorter than the timeout of whoever called.
expression: investigation.elapsed_total <= 20 seconds
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-2026-08-04.md
constrains:
  - definition/investigation/investigation
examples:
  - Given collection and judgement that together took nineteen seconds, when the write has not finished by the twentieth, then the requester gets an error rather than an unrecorded assessment.
gaps:
  - field: expression.caller_timeout
    why: Operations accepted twenty seconds and the material still does not say what the caller's timeout is, so the second clause of the statement cannot be evaluated.
---

## What it is

The attendant waits for this answer on the screen while a customer waits on the line, which is what makes every degradation rule above necessary rather than defensive.
A deadline longer than the caller's timeout shows the attendant a network error instead of a degraded assessment.
Operations accepted twenty seconds, which is what settles answering synchronously at all — reopening that decision after implementation would cost the whole execution layer.
The twenty seconds is the whole of it, so how the stages divide it is engineering and not a fact this base holds.

## Rules

None.
