---
type: invariant
statement: Generating a capability schema draft issues no register-capability call -- no capability is created or replaced, and every capability currently registered stands exactly as it stood.
constrains:
- domain/integration/capability-schema-draft
---

## Description

A draft exists only to be reviewed and, at the operator's own later act, applied to an authoring surface and submitted through register-capability -- the one write the registry publishes.
Generating one is a read, drawn from an OpenAPI document alone, and reads change nothing -- the same restraint a-connector-configuration-draft-registers-nothing already holds over its own sibling operation.
