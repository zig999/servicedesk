---
target: backend
title: operationsAt() resolves a path-item-level $ref before listing operations
summary: readOpenApiDocumentOperations now reads a path-item-level $ref through to its target before listing
  a path's operations, contributing nothing (and refusing nothing) when that reference is unresolvable,
  and the module imports isPlainObject from openapi-document-reader.ts instead of declaring its own copy.
task: sha256:65fda227d08d9006a75fb9519ecf404f723e97f51128a8cdfa1e0c7e72bb6cf5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/resolve-path-item-ref-build
files:
- path: src/connector-registry/openapi-document-operations-reader.ts
  effect: operationsAt() resolves a path item's own $ref (one level, via a JSON-pointer walk from the
    document root) before reading its method keys, returns no operations for a path item that resolves
    to nothing or to something that is not a plain object, imports isPlainObject from openapi-document-reader.ts
    instead of declaring its own copy, and imports the OpenApiDocument type instead of repeating its shape
    inline.
- path: src/connector-registry/openapi-document-reader.ts
  effect: exports isPlainObject (previously module-private) so the operations reader can import the one
    copy instead of declaring another.
criteria:
- criterion: 'A path in the document''s paths object declared as a $ref to a path item the document holds
    — whether under #/components/pathItems or at any other location within the document — contributes
    every operation that resolved path item declares, exactly as if it had been declared inline.'
  met: true
  how: operationsAt() now calls pathItemReferencedBy() before reading method keys; when the path item
    is a plain object carrying a string $ref, it is replaced with documentValueAtPointer(document, pathItem.$ref),
    which walks the pointer's segments (JSON-Pointer-decoded) from the document root regardless of where
    in the document the target sits. The resolved value is then read by the same isOpenApiMethodKey/toUpperCase
    path an inline path item already went through.
- criterion: A path item that is not a $ref (declared inline) continues to contribute its operations exactly
    as before.
  met: true
  how: pathItemReferencedBy() returns the pathItem unchanged whenever it is not a plain object, or is
    a plain object whose $ref is not a string; the subsequent isPlainObject/Object.keys/isOpenApiMethodKey/toUpperCase
    sequence is untouched from before this change.
- criterion: A path whose $ref names no target in the document, or a target that is not a path item, contributes
    no operation and does not refuse the read of the document's other operations.
  met: true
  how: documentValueAtPointer() returns undefined for a pointer that does not start with "#/" and for
    any segment absent along the walk, rather than throwing; operationsAt() then finds the resolved value
    is not a plain object and returns an empty array for that path alone, and operationsDeclaredBy()'s
    flatMap keeps going over every other path entry unaffected.
- criterion: The module no longer declares its own copy of isPlainObject; it imports the one already defined
    in openapi-document-reader.ts.
  met: true
  how: the module-private isPlainObject() function is removed from openapi-document-operations-reader.ts;
    the file now imports isPlainObject (newly exported) from './openapi-document-reader.js'.
nodes:
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: the published read still fetches the same document, generates no draft and issues no register-connector
    call; the fix only changes which paths' operations that read discloses, not the operation's shape.
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: operations is still every openapi-operation the fetched document declares; a $ref-declared path
    item now correctly contributes to that set instead of being silently dropped.
- node: domain/integration/openapi-operation
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: an operation contributed from a resolved path item still carries the path key it was found under
    and its method upper-cased, through the same isOpenApiMethodKey/toUpperCase mapping an inline path
    item already used.
- node: rules/integration/a-paths-ref-is-read-through-before-a-documents-operations-are-listed
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: 'pathItemReferencedBy()/documentValueAtPointer() read a path-item-level $ref through to its target
    — including one held under #/components/pathItems — before the path''s operations are read, so those
    operations join the document''s listing exactly as an inline path item''s would.'
- node: rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: documentValueAtPointer() never throws; an out-of-document pointer or a non-"#/" pointer resolves
    to undefined, operationsAt() answers an empty array for that one path, and operationsDeclaredBy()'s
    flatMap continues over the document's other paths untouched.
inferences:
- inferred: a path item's $ref is resolved one level only, rather than looped/chained the way openapi-operation-reader.ts's
    resolveRef loops with cycle detection.
  from: neither governing rule states a case of a path item's $ref resolving to a further $ref, and the
    criteria only describe a single level of indirection; a chained-ref case is left unaddressed by the
    specification rather than decided here.
- inferred: a path item's $ref is recognized whenever the value is a plain object carrying a string $ref
    property, even if that object also carries sibling keys, rather than requiring $ref to be the object's
    only key.
  from: the existing single-operation read's own resolveRef in openapi-operation-reader.ts already tests
    only "isPlainObject(current) && typeof current.$ref === 'string'" with no check for sibling keys,
    and criterion 1 asks this module to resolve a $ref the same way.
divergences:
- cites: MNT-03
  file: src/connector-registry/openapi-document-operations-reader.ts
  departure: the pointer-walking logic is written afresh in this file rather than calling the existing
    pointerTarget()/resolveRef() helpers already in openapi-operation-reader.ts, which implement the same
    walk.
  why: those helpers are module-private and, more importantly, behave oppositely on failure — pointerTarget()
    throws OpenApiDocumentNotReadableError for a missing segment, which is exactly what rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
    forbids for this read. Reusing them would mean changing resolveRef's error contract for the single-operation
    read too, which this task does not name.
preserved:
- 'every existing passing behavior in openapi-document-operations-reader.spec.ts: an inline path item''s
  operations, method upper-casing regardless of the document''s own key case, the path string reproduced
  unaltered, aggregation across every path with no pagination, propagation of the fetcher''s own refusal,
  no imposed timeout, an empty operations array for a document with no paths, the three read-refusal cases
  with their distinct context shapes, YAML and JSON producing the same result, and the two refusal types
  staying mutually exclusive'
- openapi-operation-reader.ts's own $ref resolution (resolveRef/pointerTarget) and its own isPlainObject,
  both left exactly as they were
deferred:
- what: connector-configuration-registry.service.ts also declares its own local isPlainObject (a third
    copy).
  why: criterion 4 names only the module this task corrects; a third file's duplicate is outside this
    task's named scope.
- what: openapi-operation-reader.ts's resolveRef throws on an unresolvable $ref rather than answering
    "not found" gracefully, the opposite contract from the one this task gave the document-operations
    read.
  why: whether the single-operation read should ever behave differently for an unresolvable $ref is a
    question no node this task implements reaches, and changing it is outside the file this task names.
---

## What it is

Resolves a path-item-level `$ref` in `operationsAt()` before listing a path's operations, and
removes a duplicated `isPlainObject` in favor of the one already exported by
`openapi-document-reader.ts`.

## Notes

Inferred that a path item's $ref is resolved one level only, matching the criteria's single level of indirection — a chained-ref case is unaddressed by the specification rather than decided here.
Inferred that a $ref is recognized whenever the value is a plain object carrying a string $ref property, even with sibling keys, matching the existing single-operation read's own resolveRef.
Departure (MNT-03) — the pointer-walking logic is written afresh rather than reusing openapi-operation-reader.ts's pointerTarget()/resolveRef(), because those throw on an unresolvable pointer, which the governing rule here forbids; reusing them would mean changing that reader's own error contract, outside this task.
Deferred — connector-configuration-registry.service.ts holds a third isPlainObject copy, outside this task's named file.
Deferred — openapi-operation-reader.ts's resolveRef still throws on an unresolvable $ref rather than answering gracefully; whether it should differ is a question no node this task implements reaches.
