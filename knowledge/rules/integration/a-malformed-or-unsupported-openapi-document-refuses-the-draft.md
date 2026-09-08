---
type: invariant
statement: A request to draft a connector configuration whose fetched document does not parse as a well-formed OpenAPI document, or whose declared version is not OpenAPI 3.x — a Swagger 2.0 document among them — is refused, naming what failed to parse or which version was declared; no draft is generated from an unparseable or unsupported document.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Only OpenAPI 3.x is read: an earlier Swagger 2.0 document names its operations, parameters and security schemes differently, and reading one as though it were 3.x would misname what the draft resolves rather than refuse honestly. A document that does not parse at all is the same refusal for the same reason a-connector-configuration-holds-a-well-formed-object already gives a registration that does not parse: nothing partial is worth drafting from text nobody can read.
