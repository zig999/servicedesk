---
title: An investigation is idempotent within a window
summary: The same question asked twice inside the window is one investigation, not two.
ddd: invariant
statement: Two requests sharing subject type, subject, case and ticket within the window MUST NOT produce two investigations.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/investigation
gaps:
  - field: expression
    why: The material states the window is configured and does not give its length.
examples:
  - Given a concluded investigation inside the window, when the same request arrives, then that investigation is returned.
  - Given an investigation in progress, when a second request arrives, then it attaches to the first rather than starting another.
---

## What it is

Someone waiting on a synchronous answer clicks twice and reloads the page, so without this each moment of impatience costs a whole investigation.
The marker for in progress is a lease outside the investigation, holding only the key and an instant, which is what keeps writing once true.

## Rules

None.
