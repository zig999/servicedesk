---
type: policy
statement: Every concept a case names has a registered read-only capability that declares an output schema and a timeout.
constrains:
  - domain/knowledge/hypothesis
  - domain/integration/capability
consistency: eventual
---

## Description

This is where the knowledge and integration contexts negotiate: a case naming a concept with no capability is invalid.
If the check only ran at execution, the curator would discover the error during a customer call.
