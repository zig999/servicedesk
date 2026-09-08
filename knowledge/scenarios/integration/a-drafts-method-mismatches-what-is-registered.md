---
subject: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
given:
  - a connector configuration is currently registered under connector name erp-http, declaring method GET
  - the chosen operation declares method POST
when:
  - a connector configuration draft is generated for connector erp-http from that operation
then:
  - the draft's method_mismatch names registered GET and operation POST
  - the currently registered connector configuration is unchanged
involves:
  - domain/integration/connector-configuration
---

## Description

Neither method is replaced by generating the draft; the operator sees the disagreement and decides what to submit.
