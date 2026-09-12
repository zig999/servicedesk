---
type: invariant
statement: >-
  Where a path in a fetched OpenAPI document's paths object declares a $ref that names no
  target in that document, or names a target that is not a path item, the read of that
  document's operations contributes no operation for that path and is not refused on account
  of it, answering with the operations the document's other paths declare.
expression: >-
  For a request to read the operations of a document that was fetched, parses and declares
  OpenAPI 3.x: where an entry of that document's paths object declares a $ref whose target
  the document does not hold, or whose target is not a path item, the answered
  openapi-document-operations holds no openapi-operation carrying that path, the request is
  not refused on account of that entry — neither as OpenApiDocumentNotFetchedError nor as
  OpenApiDocumentNotReadableError — and every openapi-operation the document's other paths
  declare is answered as it stands.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

This read's two refusals are both held against the document as a whole and both before any path is looked at: `an-unfetchable-openapi-link-refuses-the-operations-read` refuses a link that answered nothing or answered outside 2xx, and `a-malformed-or-unsupported-openapi-document-refuses-the-operations-read` refuses text that does not parse, that parses as something other than an OpenAPI document, or that declares a version other than OpenAPI 3.x — at the parse stage, on the document's own terms. A document that was received, parses and declares 3.x has passed both, and one of its paths pointing at a target the document does not hold is not a further version of either condition.

Refusing the whole read for it would take from the operator every operation the document does declare. `a-refused-operations-read-states-its-refusal-to-the-operator` states a refusal as either a link that could not be fetched or a document that could not be read as OpenAPI 3.x, and `a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing` leaves that operator no other way to name an operation: told the document is unreadable when every other path in it lists perfectly well, they go and correct a link or a document that was not what was wrong, and a document with one stale reference becomes a document nothing can be drafted from.

Nothing is listed for that path either, because there is nothing to list. `domain/integration/openapi-operation` is a path together with the HTTP method the document declares an operation under, and a reference naming no path item declares no method at all; an entry carrying the path with no method, or with the reference text in the method's place, would offer the operator a choice that `contracts/integration/connector-configuration-draft`'s draft request cannot be made from. `an-openapi-document-declaring-no-such-operation-refuses-the-draft` already reads a paths entry that declares no operation for a method as an operation the document does not declare rather than as a document that cannot be read, and the same reading is taken here — the listing simply has no per-path refusal to take, being the call that produces the pairings rather than one naming a pairing.

This states nothing about a $ref that does name a path item the document holds.
