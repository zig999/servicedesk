---
type: invariant
statement: A connector configuration registration whose connector name is absent or an empty string is refused with an HTTP 422 response reporting an IncompleteConnectorConfigurationError.
constrains:
  - domain/integration/connector-configuration
---

## Description

The connector name is the one identity a connector configuration has, so a registration without one names nothing the registry could hold or a capability could later reference.
An empty string is treated as no name at all, the same reading a-capability-declares-its-contract gives an empty capability attribute.
