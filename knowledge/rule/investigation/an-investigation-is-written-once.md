---
title: An investigation is written once
summary: No intermediate state of the domain ever persists.
ddd: invariant
statement: An investigation MUST be written exactly once and MUST NOT be mutated afterwards.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/investigation
examples:
  - Given a crash before the write, when the request is retried, then the whole investigation runs again and nothing partial exists.
  - Given a second request inside the window while the first is running, when it arrives, then it attaches to the first rather than starting another.
---

## What it is

Persisting in stages would bring back the intermediate states and the richer aggregate this model deliberately does not have.
The cost is re-execution after a crash, which is acceptable because everything before the write only reads.
The marker for an investigation in progress is a lease held outside the investigation, which is what keeps this rule true.

## Rules

None.
