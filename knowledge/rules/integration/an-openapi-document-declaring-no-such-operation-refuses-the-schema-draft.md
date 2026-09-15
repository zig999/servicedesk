---
type: invariant
statement: A request to draft a capability schema whose fetched document parses and declares OpenAPI 3.x but declares no operation at the path and HTTP method the request names is refused with an HTTP 422 response reporting an OpenApiOperationNotFoundError, naming that path and that method, exactly as an-openapi-document-declaring-no-such-operation-refuses-the-draft already refuses that same condition for the sibling operation; no capability-schema-draft is produced -- no input_schema, no output_schema and no unresolved item.
constrains:
- domain/integration/capability-schema-draft
---

## Description

Reuses the same error value for the same reason the two fetch-and-parse refusal rules' own descriptions already give: the request is well formed and the document was read, and what it names -- a path and method pairing -- is what cannot be drafted from, exactly the condition OpenApiOperationNotFoundError already names.
Everything a schema draft holds is drawn from one operation, so where the document declares none at the named pairing there is nothing to read a properties entry, a type or a required listing from, and answering with a draft holding nothing resolved would misstate an empty unresolved list as an operation with nothing in it rather than as an operation never found.
