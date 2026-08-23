---
type: invariant
statement: The registry refuses to register or update a capability whose input schema or output schema is not syntactically valid JSON.
constrains:
  - domain/integration/capability
---

## Description

Nothing checked this before a human could type this text directly: a malformed schema silently read as no fields at all, wherever a citation was checked against it (a-cited-field-exists-in-the-capability-output-schema). Refusing it at the door is what keeps that silent degradation from ever having a case to happen in.
