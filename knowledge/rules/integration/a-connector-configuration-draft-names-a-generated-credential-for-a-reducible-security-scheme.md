---
type: invariant
statement: An operation's security scheme reducible to one credential value — an API key or an HTTP basic or bearer scheme — becomes a ${credential:<name>} placeholder in the draft's configuration, with the generated name naming the connector and that scheme together, upper-cased; the generated name is always disclosed in the draft's generated_credentials, never presented as a value already resolved. A security scheme not reducible to one credential value — OAuth2 and OpenID Connect among them — is named in the draft's unresolved list instead, with reason security-scheme-not-reducible-to-a-credential, and never becomes a placeholder.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The connector configuration's own placeholder mechanism resolves ${credential:<name>} to exactly one value read from environment configuration at resolution time; an API key or a basic or bearer scheme asks for exactly that one value, so each becomes exactly one generated placeholder. A multi-step scheme like OAuth2 or OpenID Connect has no single value to substitute — forcing one into the same placeholder would misstate what the mechanism can do, so such a scheme is disclosed as unresolved instead, the same honesty the sibling rule over subject placeholders already holds a name to.

The generated name is the connector's own name and the security scheme's own name from the OpenAPI document, each with every character outside A-Z0-9 replaced by an underscore, joined by an underscore, the whole upper-cased — connector erp-http and scheme apiKeyHeader generate ERP_HTTP_APIKEYHEADER. Disclosing it is never resolving it: the credential's real value still comes only from environment configuration, exactly as a-diagnostic-response-masks-a-resolved-credential already keeps a resolved credential out of what a diagnostic response shows.
