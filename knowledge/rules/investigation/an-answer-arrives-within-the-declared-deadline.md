---
type: policy
statement: A diagnosis answers within the declared total deadline of three hundred seconds, and that deadline is smaller than the caller's timeout.
constrains:
  - domain/investigation/investigation
---

## Description

The attendant waits on screen; past the caller's timeout they see a network error instead of a degraded assessment.
The total is an operations decision, set at three hundred seconds.
