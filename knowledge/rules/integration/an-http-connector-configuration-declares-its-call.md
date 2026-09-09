---
type: invariant
statement: The same configuration declares an address, a non-empty string, and may declare a query and headers, each an object of string values, and a body of any shape; any of the four may embed one or more placeholders naming a Subject attribute, the requester, or a credential read from environment configuration at resolution time, substituted as plain text and never evaluated as code.
constrains:
  - domain/integration/connector-configuration
---

## Description

What a connector configuration must additionally declare, and what refuses it when a required key is malformed, is `an-http-connector-configuration-declares-its-method-and-status-vocabulary`'s own.

The address, query, headers and body, and their placeholder mechanism, are the same connector's statement of how its call reaches into a Subject, a requester and a credential without either living in the configuration's own text — `rules/integration/a-diagnostic-response-masks-a-resolved-credential` already presumes a credential placeholder exists and masks what it resolves to; this is the first node stating the mechanism itself. Which literal text forms a placeholder is written in is `a-connector-configuration-placeholder-is-written-in-one-of-three-forms`'s own, and what ends a call unavailable over an incomplete or unresolvable one is `an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable`'s own.
