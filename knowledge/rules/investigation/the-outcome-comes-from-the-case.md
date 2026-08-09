---
type: policy
statement: The outcome, referral and determining hypothesis of an assessment are exactly what the pinned case's resolve-outcome returns.
constrains:
  - domain/investigation/assessment
  - domain/knowledge/case
consistency: eventual
---

## Description

The assessment produces no outcome outside the case; the writing only writes.
Leaving resolution to the application service would be the anemic model the case's own behavior exists to prevent.
