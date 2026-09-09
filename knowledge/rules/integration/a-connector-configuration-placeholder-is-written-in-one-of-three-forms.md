---
type: invariant
statement: >-
  A placeholder an-http-connector-configuration-declares-its-call admits is written as the
  literal text form ${kind} or ${kind:argument}, a placeholder naming a Subject attribute
  written ${subject:<attribute-name>} with the attribute name as its argument, a placeholder
  naming the requester written ${requester} with no argument, and a placeholder naming a
  credential written ${credential:<name>} with the credential name as its argument.
constrains:
  - domain/integration/connector-configuration
---

## Description

The address, query, headers and body, and their placeholder mechanism, are the connector's statement of how its call reaches into a Subject, a requester and a credential without either living in the configuration's own text — `rules/integration/a-diagnostic-response-masks-a-resolved-credential` already presumes a credential placeholder exists and masks what it resolves to; this is the node stating the mechanism's own literal forms.
