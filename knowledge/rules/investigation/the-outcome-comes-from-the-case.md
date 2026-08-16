---
type: policy
statement: The outcome, referral and determining hypothesis of an assessment are exactly what the pinned case version's resolve-outcome returns.
constrains:
  - domain/investigation/assessment
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The assessment produces no outcome outside the pinned case version; the writing only writes.
Leaving resolution to the application service would be the anemic model the case version's own behavior exists to prevent.
