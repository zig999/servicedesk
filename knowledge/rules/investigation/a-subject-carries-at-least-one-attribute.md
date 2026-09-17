---
type: invariant
statement: A subject carries at least one attribute-value; a call whose subject carries none is refused with an HTTP 422 response reporting a SubjectCarriesNoAttributeError.
constrains:
  - domain/investigation/subject
---

## Description

A subject with no attribute-value at all identifies nothing, and no capability's connector would have anything to derive its call from.
