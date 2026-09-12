---
subject: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
given:
  - a capability read-invoices is currently registered naming connector erp-http, with input schema properties holding only customer_id
  - the operation GET /customers/{customerId}/invoices is chosen from a fetched OpenAPI document
when:
  - a connector configuration draft is generated for connector erp-http from that operation
then:
  - the draft's configuration embeds ${subject:customerId} at customerId's own position
  - customerId is named in no item of the draft's unresolved list
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration-draft
---

## Description

customerId and customer_id read alike to a person; this rule no longer holds the draft to whether any registered capability's input schema names the exact string customerId, only to whether erp-http currently has a capability registered against it at all — which read-invoices already satisfies.
