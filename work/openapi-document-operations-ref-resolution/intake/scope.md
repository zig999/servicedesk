# Corrective increment: operationsAt() does not resolve a path-item-level $ref

## The wrong behavior

`src/src/connector-registry/openapi-document-operations-reader.ts`, function `operationsAt()`
(around line 53), reads the entries of a path item directly off the parsed document object,
without resolving a `$ref`. Where an OpenAPI document declares a path as a reference to a
reusable path item — `paths: { "/widgets": { "$ref": "#/components/pathItems/Widget" } } ` —
`Object.keys({ "$ref": "..." })` is `['$ref']`, which never matches an HTTP method key, so
`operationsAt()` silently contributes zero operations for that path.

A second read of the same kind of document already exists in this codebase — the single-operation
read at `src/src/connector-registry/openapi-operation-reader.ts` — and it does not treat a path
this way: given a path/method naming an operation under such a referenced path item, it answers
with that operation rather than with nothing. The two reads disagree about what the same document
declares.

## Reproduction

1. Fetch an OpenAPI document whose `paths` object declares a path using `$ref` to a reusable
   path item under `#/components/pathItems/...` instead of an inline path item.
2. List the document's operations via `readOpenApiDocumentOperations` (the same read the
   Configuration Helper's operation picker uses).
3. Observed: the referenced path contributes no operation to the list at all — no error, no
   entry, nothing.
4. Also observed, on the same document: naming that path and one of its methods directly to the
   single-operation read answers with the operation, rather than refusing or finding nothing.

## A second, related finding in the same file: duplicated isPlainObject

`isPlainObject` is defined identically in three files: `openapi-document-reader.ts`,
`openapi-operation-reader.ts`, and this same `openapi-document-operations-reader.ts`. This is not
a behavior bug — no domain fact or specification node is affected — but a maintenance cost: a
future fix to what counts as a plain object (for instance to also reject class instances) has to
be applied in three places, and this third file added a third copy instead of importing the one
already defined next to it in `openapi-document-reader.ts`.

## The file

`src/src/connector-registry/openapi-document-operations-reader.ts`

## Origin

Both findings came from a `/code-review` pass over the backend, requested directly by the human
("faça um code review do backend"), who then authorized fixing both through this corrective
increment.
