---
type: api
direction: published
operations:
  - read-connector-configuration
  - list-connector-configurations
  - register-connector
  - remove-connector
---

## Description

The synchronous surface over connector configurations: the one currently registered under a name, or every one currently registered, in pages (constraints/listings-are-paged); and, now that an operator authors these directly, register one — creating it or replacing whatever configuration already answered to that name.
Remove one by name; rules/integration/removing-a-connector-configuration-is-unconditional is what governs whether that succeeds.
