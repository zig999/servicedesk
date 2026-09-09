---
subject: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
given:
  - no capability is currently registered naming connector erp-http
  - an operation declaring a path parameter and a query parameter is chosen from a fetched OpenAPI document
when:
  - a connector configuration draft is generated for connector erp-http from that operation
then:
  - both parameters are named in the draft's unresolved list with reason no-capability-registered
  - the draft's configuration embeds no ${subject:...} placeholder
  - the draft is generated, not refused
involves:
  - domain/integration/connector-configuration-draft
---

## Description

Capability registration order is never a precondition here, the same reading domain/integration/connector-configuration already gives a connector configured before any capability names it.
