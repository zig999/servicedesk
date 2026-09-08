---
subject: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
given:
  - a capability read-invoices is currently registered naming connector erp-http, with input schema properties holding only customer_id
  - the operation GET /customers/{customerId}/invoices is chosen from a fetched OpenAPI document
when:
  - a connector configuration draft is generated for connector erp-http from that operation
then:
  - customerId is named in the draft's unresolved list with reason no-matching-input-schema-property
  - the draft's configuration embeds no ${subject:customerId} placeholder
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration-draft
---

## Description

customerId and customer_id read alike to a person; the draft never treats them as the same fact.
