---
target: backend
title: Success response schema field reading -- proof
summary: Thirteen tests added to openapi-operation-reader.spec.ts cover every criterion of success-response-schema-fields
  and the one underdetermined entry a test could be written against; the five implemented specification
  nodes are each left untested because this task's own REMAINDER/UNDERDETERMINED notes bound it to only
  part of each node's fact.
implementation: sha256:e8d5b9915f90a8626fdb3a8c467d19b26d8aff2f7b52da667fd23aac5da10543
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-success-response-schema-fields-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields a field named and pathed for each of three top-level properties a success response schema
    declares
  proves: A success response whose application/json schema declares three top-level properties yields
    those three field names, each at the path that is its own name.
  fails_when: successResponseFields omits one of the three declared properties, misnames a field, or reports
    a path other than the property's own name.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: carries the type each field's own schema declares, and omits declaredType entirely where the schema
    declares none
  proves: Each yielded field carries the type its own schema declares, and carries none where the schema
    declares none.
  fails_when: a field whose schema declares type 'string' fails to carry declaredType 'string', or a field
    whose schema declares no type carries a declaredType key at all (even as undefined).
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: carries whether a schema's required list names each field, true for a named field and false for
    one it omits
  proves: Each yielded field carries whether the schema's required list names it.
  fails_when: a field named in the required array carries declaredRequired false, or a field not named
    in it carries declaredRequired true.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: leaves declaredRequired absent, never false, for a field whose success response schema declares
    no required list at all
  proves: UNDERDETERMINED entry 2 -- a schema declaring no required list at all should leave declaredRequired
    absent, per connector-configuration-draft-response-field's declared_required being carried only where
    the schema declares one.
  fails_when: an implementation that carries declaredRequired as false (rather than omitting the key)
    for a field whose schema declares no required array at all.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: carries the success status of the response each field was read from, distinguishing fields read
    from different statuses
  proves: Each yielded field carries the success status it was read from.
  fails_when: a field read from the 200 response carries a status other than '200', a field read from
    the 201 response carries a status other than '201', or the two are conflated.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields no field for a success response whose content declares a media type other than application/json
  proves: A success response whose content declares media types but no application/json yields no field.
  fails_when: a field is yielded from an application/xml (or any non-application/json) media type's schema.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields no field for a success response declaring no content at all
  proves: A success response declaring no content yields no field.
  fails_when: reading a response with no content property throws, or yields any field.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads a success response and its schema reached through $refs into fields, the same as if declared
    inline
  proves: A success response schema reached through a $ref is read through the module's existing resolveRef
    rather than through a second resolver (the resolving half).
  fails_when: a response reached via $ref, or a schema reached via $ref from within that response, fails
    to yield the 'serial' field with its declared type.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a success response schema whose $ref chain cycles
    back to itself
  proves: A success response schema reached through a $ref is read through the module's existing resolveRef
    rather than through a second resolver (the shared-refusal half).
  fails_when: a cyclic $ref chain inside a success response's schema does not throw OpenApiDocumentNotReadableError
    with kind 'unparseable'.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: merges the properties of every allOf part into one set of fields
  proves: A success response schema whose root declares allOf yields the properties of every part merged
    into one set of fields.
  fails_when: a field from one of the allOf parts is missing from the merged result.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: unites the properties of every oneOf variant into one set of fields
  proves: A success response schema whose root declares oneOf or anyOf yields the properties of every
    variant united into one set of fields.
  fails_when: a field from one of the oneOf variants is missing from the united result.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields no field for a success response schema declaring no properties object
  proves: A success response schema declaring no properties object yields no field.
  fails_when: a schema with no properties keyword yields any field.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: contributes fields only from response keys within 200 through 299, excluding a status just outside
    the range, a default key and a range key
  proves: A response keyed by a status outside 200 through 299 contributes no field (boundary cases 199/300,
    plus the default and range-key classes already excluded from the status kind).
  fails_when: a field from the 199, 300, default or 2XX-keyed response appears in the result, or a field
    from the 200 or 299 boundary is missing from it.
not_applicable:
- edge_case: Two success response schemas naming the same field at different statuses, reconciled by keeping
    the lowest status's path/type/required
  why: belongs to the responseMap-assembly half of a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas,
    which this task's own REMAINDER note assigns to the task drafting the responseMap; no criterion of
    this task reaches field reconciliation across schemas.
- edge_case: Concurrent or repeated reads against one document
  why: successResponseFieldsOf is a pure, synchronous derivation over an already-parsed, immutable document
    with no shared or mutable state; nothing in this reading can race.
- edge_case: A dependency (network, filesystem, database) failing or answering slowly
  why: the reader takes the document text as a string parameter and performs no I/O; there is no dependency
    here to fail or run slowly.
- edge_case: An operation attempted against state that forbids it
  why: this reading is a pure derivation from a static document with no state machine or write; there
    is no forbidding state to test against.
- edge_case: A schema whose top-level properties object holds exactly one property that is itself an envelope
    (an object explicitly declaring a properties keyword)
  why: per this task's own UNDERDETERMINED note, the envelope case is bounded to the sibling task success-response-envelope-read-through;
    no criterion of this task presents it.
untested:
- domain/integration/connector-configuration-draft -- its fact is the whole assembled draft; this task
  supplies only the reader-level per-schema field material and reaches no criterion touching the draft's
  own assembled shape, so no finite test written here decides this node's fact whole.
- domain/integration/connector-configuration-draft-response-field -- its fact includes an optional envelope
  attribute; this task's own UNDERDETERMINED note bounds envelope production to the sibling success-response-envelope-read-through
  task, so OpenApiSuccessResponseField never carries it here.
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  -- this task implements only the per-schema reading half; the responseMap-assembly half is this task's
  own REMAINDER, assigned to the task drafting the responseMap, so no test here decides the invariant
  whole.
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  -- this task implements only the rule's 'otherwise' branch; the envelope-descent branch is deferred
  to the sibling task per this task's own UNDERDETERMINED note.
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  -- this task implements only the rule's response-$ref clause; the parameter-merge and the parameter/request-body/security-scheme
  $ref clauses were implemented before this task and are untouched by it.
- UNDERDETERMINED entry 1 (the envelope-case scope note) -- it names no implementation the specification
  refuses; it only observes that the envelope case sits outside what this task implements, deferring it
  to the sibling task success-response-envelope-read-through.
---

## What it is
Thirteen tests over the success response schema field reading, covering every criterion, the underdetermined declared_required-absence entry, boundary status filtering (199/300), the two $ref paths (resolving and cyclic-refusal), allOf merge and oneOf union.

## Notes
None.
