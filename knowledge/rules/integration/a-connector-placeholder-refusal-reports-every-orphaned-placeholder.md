---
type: policy
statement: >-
  A refusal a-connector-placeholder-is-declared-by-its-capability states is an HTTP 422 response
  reporting a ConnectorPlaceholderOutsideInputSchemaError naming every orphaned placeholder
  together with the capability that fails to declare it.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

`a-connector-placeholder-is-declared-by-its-capability` reconciles a connector configuration's own placeholders against whatever capability schema stands registered against it, checked at both writes that could put them out of step; this states what either refusal reports rather than when it fires.
