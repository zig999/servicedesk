---
type: invariant
statement: >-
  A path a fetched OpenAPI document's paths object declares as a $ref in place of stating a
  path item directly is read through to the path item that reference targets -- including one
  held under #/components/pathItems -- before the operations declared under that path are
  read, so those operations are among the operations the document declares exactly as if the
  path item had been stated inline.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

What a $ref stands for is fixed by OpenAPI 3.x itself and is not a reading this specification is free to choose either way: a reference names a declaration to be read exactly as if it stood written where the reference sits. A path read instead as the literal keys it carries has one key, `$ref`, which names no HTTP method, so the path contributes nothing — not a narrower reading of the operator's document but a reading of a different document, one in which the operator's own declared operations are absent.

`a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs` already reads a $ref through at a parameter, a request-body schema and a security scheme for the sibling draft operation, and says nothing of a reference standing at the path itself, which is one level above everything it reaches; the read that lists a document's operations meets that reference before any parameter is reached, so it is stated here.

What is lost when the reference is not followed falls on the operator rather than on any caller. `a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing` leaves them no way to name an operation but from this listing, and a path that silently contributes none is indistinguishable to them from a document declaring none there — no refusal is due, since `a-malformed-or-unsupported-openapi-document-refuses-the-operations-read` refuses documents that do not parse or do not declare OpenAPI 3.x, and a document declaring a path by reference is a well-formed one.

Home is a new invariant over `domain/integration/openapi-document-operations`, the element that holds every operation a fetched document declares: this states what "declares" reaches, and adds no attribute, publishes no operation and refuses no call.
