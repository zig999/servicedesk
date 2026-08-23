---
type: invariant
statement: The registry refuses to register or update a connector configuration whose configuration is not syntactically valid JSON object text.
constrains:
  - domain/integration/connector-configuration
---

## Description

The same discipline a-capability-declares-well-formed-schemas holds for a capability's two schemas, held here for the one field a connector configuration carries: a human authoring this text directly can now write something a runtime call would fail on, and the registry is where that gets caught, not the call.
