---
type: policy
statement: The capability check reads the registration as it stands at the moment of reading, never a remembered one.
constrains:
  - domain/knowledge/case-version
  - domain/integration/capability
consistency: eventual
---

## Description

Release gates whether a case version's own content may still change, never whether the capability registry it depends on has; validity against that registry stays a fact about now, checked fresh at every read a released version answers, the same as while it was still a draft.
