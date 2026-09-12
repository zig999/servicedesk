---
title: operationsAt() resolves a path-item-level $ref before listing operations
summary: Bring readOpenApiDocumentOperations back into agreement with the single-operation read for a
  path declared via a path-item-level $ref, and remove a duplicated isPlainObject helper along the way.
objective: Listing an OpenAPI document's operations resolves a path-item-level $ref exactly as the single-operation
  read already does, so a path declared that way contributes its operations instead of none.
criteria:
- 'A path in the document''s paths object declared as a $ref to a path item the document holds — whether
  under #/components/pathItems or at any other location within the document — contributes every operation
  that resolved path item declares, exactly as if it had been declared inline.'
- A path item that is not a $ref (declared inline) continues to contribute its operations exactly as before.
- A path whose $ref names no target in the document, or a target that is not a path item, contributes
  no operation and does not refuse the read of the document's other operations.
- The module no longer declares its own copy of isPlainObject; it imports the one already defined in openapi-document-reader.ts.
sources:
- intake/scope.md
implements:
- contracts/integration/openapi-document-operations
- domain/integration/openapi-document-operations
- domain/integration/openapi-operation
- rules/integration/a-paths-ref-is-read-through-before-a-documents-operations-are-listed
- rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
---

## What it is

Corrects `operationsAt()` in `src/src/connector-registry/openapi-document-operations-reader.ts`,
which lists zero operations for a path declared by `$ref` instead of resolving it, and removes a
duplicated `isPlainObject` helper.

## Notes

ADVISORY, from the specification — criterion 4 (removing the duplicated isPlainObject helper) names a source-module arrangement, not a fact of the business; no candidate node reaches it and none should be grown to state it. It stands as an implementation-hygiene criterion checked against the code, not against the specification.
ADVISORY, from the specification — rules/integration/an-openapi-operations-method-is-upper-cased is not named in implements. It constrains domain/integration/openapi-operation and reaches the operations this task newly contributes from a resolved path item, but only through criterion 1's "exactly as if it had been declared inline" — satisfied only if the resolved path item is routed through the same operation-building path as an inline one.
