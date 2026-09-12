---
title: operationsAt() resolves a path-item-level $ref before listing operations
summary: 'Bring readOpenApiDocumentOperations back into agreement with the single-operation read: a path
  declared via $ref to a reusable path item contributes its operations, not zero of them.'
covers:
- constraints/the-openapi-document-is-fetched-by-the-backend
- contracts/integration/openapi-document-operations
- domain/integration/openapi-document-operations
- domain/integration/openapi-operation
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
- rules/integration/an-openapi-operations-method-is-upper-cased
- rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
- scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- rules/integration/a-paths-ref-is-read-through-before-a-documents-operations-are-listed
- rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
uncovered:
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  why: Governs method upper-casing across every operation the Configuration Helper lists and is already implemented by the epic that delivered the operations listing; this task changes only which paths contribute an operation, not how a contributed operation's method is cased.
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  why: Governs the parse-stage refusal (non-well-formed text, unsupported version) already implemented by the epic that delivered the operations read; this task acts only on a document that already parsed and declares OpenAPI 3.x.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  why: Governs the fetch-stage refusal already implemented by the epic that delivered the operations read; this task acts only on a document already fetched.
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  why: Demonstrates the parse-stage refusal rule above, already implemented; untouched by this task.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: Governs where the fetch for this read runs; untouched by a change that only reads an already-fetched document's paths object differently.
sources:
- intake/scope.md
---

## What it is

The trace already binds `src/src/connector-registry/openapi-document-operations-reader.ts` to
these eight nodes; this epic claims exactly that set to correct the one file, re-judging nothing
else.

## Notes

None.
