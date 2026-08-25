---
type: api
direction: published
operations:
  - read-capability
  - read-capability-by-identity
  - list-capabilities
  - register-capability
---

## Description

The synchronous surface the registry offers: the capability currently answering a concept, with its declared contract; the capability currently registered at a given identity, name and version together; every capability currently registered, in pages (constraints/listings-are-paged); and, now that an operator authors these directly, register one — creating it at a new name and version, or replacing whatever already stood at that identity.
