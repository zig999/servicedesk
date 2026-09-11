---
type: invariant
statement: >-
  The document fetched for a request to read an OpenAPI document's operations is read as OpenAPI
  3.x in either of the two serializations the OpenAPI format itself defines -- JSON and YAML --
  with the serialization decided by parsing the fetched text itself and never by any content
  type the response declared; and a request whose fetched document parses as neither of those
  two serializations, or parses as one of them but is not a well-formed OpenAPI document, or
  whose declared version is not OpenAPI 3.x -- a Swagger 2.0 document among them -- is refused,
  naming what failed to parse or which version was declared, no operations read from an
  unparseable or unsupported document.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

a-malformed-or-unsupported-openapi-document-refuses-the-draft gives the draft operation this same refusal for the same reason: only OpenAPI 3.x is read, an earlier Swagger 2.0 document names its operations differently, and text that parses as neither JSON nor YAML is text nobody can read as OpenAPI. The Configuration Helper's read of a document's operations parses the same fetched text before any path or method is chosen, so it refuses the same way at the same parse stage.
