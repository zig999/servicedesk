---
type: api
direction: published
operations:
- draft-capability-schema-from-openapi
---

## Description

Generate a candidate input schema and output schema for a capability from one operation of a fetched OpenAPI document -- a read, never a registration.
Fetches the same operator-named document contracts/integration/openapi-document-operations's own read operation would fetch, but generates a schema draft rather than a listing and issues no register-capability call.
