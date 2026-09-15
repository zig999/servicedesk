---
type: invariant
statement: A request to draft a capability schema whose fetched document does not parse as OpenAPI 3.x in either of the two serializations the format defines, or whose declared version is not OpenAPI 3.x, is refused with an HTTP 422 response reporting an OpenApiDocumentNotReadableError, read exactly the way a-malformed-or-unsupported-openapi-document-refuses-the-draft already reads that same condition for the sibling operation, including its own reading of a document declaring no version at all; no draft is generated from an unparseable or unsupported document.
constrains:
- domain/integration/capability-schema-draft
---

## Description

Reuses the same error value a-malformed-or-unsupported-openapi-document-refuses-the-draft and an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already fix for the same condition, for the reason an-unfetchable-openapi-link-refuses-the-schema-draft's own description already gives: one vocabulary, decided once, for one fact met by more than one operation.
Only OpenAPI 3.x is read for the same reason it is read for the sibling operations: a Swagger 2.0 document names its parameters, its request bodies and its responses differently, and reading one as though it were 3.x would misname what the draft resolves rather than refuse honestly.
