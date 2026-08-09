---
type: policy
statement: The capability check reads the registration as it stands at the moment of reading, never a remembered one.
constrains:
  - domain/knowledge/case
  - domain/integration/capability
consistency: eventual
---

## Description

There is no publication gate to anchor a stale check to; validity is a fact about now.
