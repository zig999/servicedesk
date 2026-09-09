---
type: invariant
statement: Generating a connector configuration draft issues no register-connector call — no connector configuration is created, and every connector configuration currently registered stands exactly as it stood.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

A draft exists only to be reviewed and, at the operator's own later act, applied to an authoring surface and submitted through register-connector — the one write the registry publishes. Generating one is a read, drawn from an OpenAPI document and whatever is currently registered, and reads change nothing.
