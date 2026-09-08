---
subject: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
given:
  - the chosen operation requires the security scheme apiKeyHeader, an API key carried in the header X-Api-Key
when:
  - a connector configuration draft is generated for connector erp-http from that operation
then:
  - the draft's configuration embeds "X-Api-Key" ${credential:ERP_HTTP_APIKEYHEADER} in headers
  - the draft's generated_credentials names ERP_HTTP_APIKEYHEADER paired with apiKeyHeader
involves:
  - domain/integration/connector-configuration-draft
---

## Description

The generated name is disclosed so the operator knows which environment variable to configure; it is never a value the scheme's own credential resolved to.
