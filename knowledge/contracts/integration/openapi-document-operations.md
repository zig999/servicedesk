---
type: api
direction: published
operations:
  - read-openapi-document-operations
---

## Description

Read every operation a fetched OpenAPI document declares — its path and its method — for the Configuration Helper to offer as choices before a connector configuration draft is requested from one of them. Fetches the same operator-named document contracts/integration/connector-configuration-draft's own draft operation would fetch, but generates no draft and issues no register-connector call.
