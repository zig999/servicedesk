---
type: invariant
statement: A registered capability declares its input schema, its output schema and its timeout; a registration that states no timeout takes the default of sixty seconds.
constrains:
  - domain/integration/capability
---

## Description

The output schema is what bounds citations; the timeout is what bounds the collection stage; a capability without either cannot be held to anything.
