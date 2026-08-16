---
type: policy
statement: An investigation may only be pinned to a case version in released state; a draft version may be read but never diagnosed against.
constrains:
  - domain/investigation/investigation
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A draft exists to be composed and previewed while it is still incomplete or under revision; nothing built on it should ever answer a real diagnosis until a curator has released it.
