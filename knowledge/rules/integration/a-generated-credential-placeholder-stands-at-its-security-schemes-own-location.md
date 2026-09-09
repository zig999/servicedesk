---
type: invariant
statement: >-
  A generated credential placeholder for a security scheme declaring a location of its own
  stands at that location — an API key carried in a header at a drafted headers key named by
  that header, an API key carried in a query parameter at a drafted query key named by that
  parameter, each holding the bare placeholder — and one for a scheme declaring no location of
  its own stands in the drafted headers: an API key carried in a cookie inside the Cookie key's
  value as its own cookie name, an equals sign and the placeholder; an HTTP basic scheme as the
  Authorization key's whole value Basic ${credential:<name>}; and an HTTP bearer scheme as the
  Authorization key's whole value Bearer ${credential:<name>} — the placeholder standing in each
  for the credential alone and never for the text stated beside it.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The scheme text beside a credential placeholder is drafted rather than configured because Basic and Bearer are the HTTP authentication scheme's own fixed text and no part of any secret, while the placeholder resolves to exactly one value read from environment configuration. Composing the text in the draft leaves the environment holding the credential alone and keeps the drafted header a value the scheme actually accepts. It is the same division the header-carried API key already stands by, whose header name the draft states while only its value comes from the environment: what the document states goes into the draft, and only the secret is left to be configured.
