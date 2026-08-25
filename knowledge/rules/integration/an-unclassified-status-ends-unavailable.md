---
type: policy
statement: An HTTP status the executing connector configuration's statusMap does not classify ends the observation as unavailable.
constrains:
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

Every collection ends in exactly one of the four evidence results, and a status nobody classified still has to land in one of them.
Unavailable is the ending that claims the least: it asserts no denial and no timeout, and it never enters the evidence cache.
