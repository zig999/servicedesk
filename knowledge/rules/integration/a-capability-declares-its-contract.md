---
type: invariant
statement: A registered capability declares its input schema, its output schema and its timeout as a positive integer count of milliseconds; a registration that states no timeout takes the default of sixty seconds; an attribute that is absent or an empty string is undeclared, and a registration leaving any required attribute undeclared is refused with an HTTP 422 response reporting an IncompleteCapabilityContractError.
constrains:
  - domain/integration/capability
---

## Description

The input schema, once its own shape is declared, is what a diagnose's entry point and a case's derived input requirements hold the subject to; the output schema is what bounds citations; the timeout is what bounds the collection stage; a capability without any of the three cannot be held to anything.
A timeout of zero or less bounds nothing — there would be no time left for a call to answer in — so a stated timeout is refused the same way a non-integer one already is, distinctly from the absent-timeout default.
