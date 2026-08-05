---
title: An answer arrives within a declared deadline
summary: The attendant waits on the line, so the total is declared and shorter than the caller's timeout.
ddd: invariant
statement: An investigation MUST produce its response within a declared total deadline, and that deadline MUST be shorter than the timeout of whoever called.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/investigation
gaps:
  - field: expression
    why: The third decision and the third lacuna are open — the material proposes twenty seconds, states the total is an operations decision, and gives no per-capability timeout.
---

## What it is

The attendant waits for this answer on the screen while a customer waits on the line, which is what makes every degradation rule above necessary rather than defensive.
A deadline longer than the caller's timeout shows the attendant a network error instead of a degraded assessment.
If operations does not accept the total, the decision to answer synchronously reopens, and reopening it after implementation costs the whole execution layer.

## Rules

None.
