---
type: api
direction: published
operations:
  - draft-connector-configuration-from-openapi
---

## Description

Generate a candidate connector configuration for one connector name from one operation of a fetched OpenAPI document — a read, never a registration. Diagnostic in the same sense contracts/integration/connector-diagnostics already is: nothing this operation returns is registered, and no investigation ever reads what it returned.
What it hands back is the draft alone: a-connector-configuration-draft-response-carries-no-capability holds the answer to the draft's own declared attributes, so the capabilities read to resolve its placeholders are disclosed only through the placeholders and the unresolved reasons they produced.
