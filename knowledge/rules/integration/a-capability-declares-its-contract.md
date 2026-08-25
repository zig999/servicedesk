---
type: invariant
statement: A registered capability declares its input schema, its output schema and its timeout as an integer count of milliseconds; a registration that states no timeout takes the default of sixty seconds; an attribute that is absent or an empty string is undeclared, and a registration leaving any required attribute undeclared is refused with an HTTP 422 response reporting an IncompleteCapabilityContractError.
constrains:
  - domain/integration/capability
---

## Description

The output schema is what bounds citations; the timeout is what bounds the collection stage; a capability without either cannot be held to anything.
