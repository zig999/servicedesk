---
subject: rules/integration/a-connector-placeholder-is-declared-by-its-capability
given:
  - a capability naming connector erp-http declares an input schema whose properties hold only contract_number
when:
  - the erp-http connector configuration is registered with a call embedding a placeholder naming the customer_document Subject attribute
then:
  - the registration is refused
  - the refusal names customer_document as a placeholder the capability naming erp-http does not declare
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration
---

## Description

The capability was registered first and already stands; it is the new connector configuration write that is held to what it declares, the direction this rule checks whenever a connector configuration is the side being written.
