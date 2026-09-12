---
target: backend
title: operationsAt() resolves a path-item-level $ref before listing operations — proof
summary: Two new tests over the untouched openapi-document-operations-reader.spec.ts prove path-item $ref
  resolution at both the canonical and an arbitrary document location, and prove an unresolvable or non-path-item
  ref contributes nothing without refusing the document's other operations; the two governing rule nodes
  are each demonstrated whole, criterion 2 by an unmodified pre-existing test, and criterion 4 and both
  behavioral inferences are left unpinned.
implementation: sha256:e3f1d2e91e6e0dcd55f6e1a6ac236294e42c867521121fdc4a2943a71ebd362e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/resolve-path-item-ref-suite-2
tests:
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: 'resolves a path-item $ref to its target before reading operations, whether the target sits under
    #/components/pathItems or elsewhere in the document, upper-casing each method exactly as an inline
    path item would'
  proves: 'criterion 1 — a path declared as a $ref to a path item the document holds, whether under #/components/pathItems
    or at any other location, contributes every operation that resolved path item declares exactly as
    if declared inline'
  fails_when: 'a path declared via $ref stops contributing its target path item''s operations for either
    the canonical #/components/pathItems location or an arbitrary other document location, or a method
    key found through the resolved path item is not upper-cased the same way an inline path item''s method
    already is'
  demonstrates: rules/integration/a-paths-ref-is-read-through-before-a-documents-operations-are-listed
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: lists no operation for a path whose $ref names no target in the document or a target that is not
    a path item, without refusing the read of the document's other operations
  proves: criterion 3 — a path whose $ref names no target in the document, or a target that is not a path
    item, contributes no operation and does not refuse the read of the document's other operations
  fails_when: a path with a dangling $ref or a $ref resolving to a non-path-item value either throws a
    refusal, drops the operations declared by the document's other paths, or itself contributes an operation
    despite resolving to nothing usable
  demonstrates: rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: reads a path declaring a get and a post operation into two entries naming that same path, one
    per method
  proves: criterion 2 — a path item that is not a $ref (declared inline) continues to contribute its operations
    exactly as before
  fails_when: an inline (non-$ref) path item stops contributing one operation entry per declared method,
    as this pre-existing test — untouched by this task's change — already asserts
not_applicable:
- edge_case: two reads of the same or different documents running concurrently
  why: operationsAt, pathItemReferencedBy and documentValueAtPointer are synchronous, pure functions over
    a document value with no shared mutable state; no criterion or node this task implements addresses
    concurrent access.
- edge_case: the document fetcher failing, timing out, or answering slowly
  why: unrelated to this task's change, which touches only how a path item is resolved after the document
    text is already fetched and parsed; already exercised by the preserved, unmodified tests for network
    failure, timeout and non-2xx status.
- edge_case: a document declaring no paths at all, or a path item declaring no methods
  why: unrelated to this task's change; already proven by the preserved "answers with an empty operations
    array when the fetched document declares no paths at all" test, which this task leaves untouched.
- edge_case: a path item value whose $ref field is present but is not a string (e.g. null or a number)
  why: no criterion or node this task implements states this shape; it falls under the pre-existing, unmodified
    inline/ref-recognition check (typeof pathItem.$ref !== 'string'), which this task's criteria do not
    name and do not change.
untested:
- Inferred (implementation record) — a path item's $ref is resolved one level only, with no looping or
  cycle detection for a $ref that resolves to a further $ref. Neither governing rule node states a chained-ref
  case, and the criteria describe only a single level of indirection, so no test pins this specific choice;
  a test doing so would make the suite the only place this unstated behavior lives.
- Inferred (implementation record) — a path item value is recognized as a $ref whenever it is a plain
  object carrying a string $ref property, even if it also carries sibling keys, rather than requiring
  $ref to be the object's only key. No criterion or node states this either way, so it is left unpinned
  rather than tested.
- Criterion 4 — the module no longer declares its own copy of isPlainObject and imports the one from openapi-document-reader.ts.
  This is a source-arrangement fact, not observable behavior; the task's own Notes mark it ADVISORY and
  checked against the code by reading, not against the specification. A test asserting which module a
  function is imported from would pin the module's internal wiring rather than any behavior a caller can
  observe, so none is written; it is verified by reading src/connector-registry/openapi-document-operations-reader.ts
  and openapi-document-reader.ts directly.
---

## What it is

Proves the path-item $ref resolution fix in operationsAt(), across both governing rule nodes,
without touching any test outside the module's own spec file.

## Notes

None.
