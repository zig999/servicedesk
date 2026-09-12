---
target: backend
title: OpenAPI operation reader's response-key reading
summary: Extends the existing openapi-operation-reader unit spec with tests over the new responses field
  -- classification, description carrying, the no-responses-object and $ref-through-resolveRef paths,
  and the two range-key cases the specification's lower-case and digits-only-out-of-range facts add.
implementation: sha256:adc43a937d4588558d811f77cb82c041865e67a993bf356ae3c6a1ceb1cb7e77
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-openapi-responses-reading-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields a status entry for each of three declared numeric response keys
  proves: Reading an operation whose responses declare 200, 403 and 503 yields those three keys.
  fails_when: responsesOf drops one of the three declared keys, or classifies any of 200/403/503 as anything
    other than 'status'.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: carries the description the document declares for a response
  proves: Each yielded key carries the description the document declares for that response.
  fails_when: responseReading fails to read a declared string description onto the yielded entry, or reads
    the wrong value.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: omits the description property for a response declaring none, rather than carrying an empty one
  proves: A response the document declares with no description is yielded with no description rather than
    with an empty one.
  fails_when: responseReading sets description to an empty string (or any value) when the document declares
    none, instead of omitting the property entirely.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: classifies a response keyed default apart from any numeric status key
  proves: A response keyed default is yielded classified apart from any numeric status key.
  fails_when: responseKeyKind classifies the literal key "default" as 'status' (or as the same kind a
    numeric status key gets).
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: classifies a response keyed by an upper-case status range apart from any numeric status key
  proves: A response keyed by a range such as 2XX, 4XX or 5XX is yielded classified apart from any numeric
    status key.
  fails_when: responseKeyKind classifies an upper-case NXX key as 'status' instead of 'range'.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: yields no response key and raises nothing when the operation declares no responses object
  proves: An operation declaring no responses object yields no response key and raises nothing.
  fails_when: responsesOf throws, or returns anything other than an empty array, when operation.responses
    is absent.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: follows a response's $ref to its target before reading its description
  proves: The reading resolves any $ref it meets through the module's existing resolveRef rather than
    through a second resolver (success path).
  fails_when: responseReading fails to follow a response's $ref to its target, or reads no description
    from (or the wrong description off) the resolved declaration.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a response whose $ref points nowhere the document
    declares
  proves: The reading resolves any $ref it meets through the module's existing resolveRef rather than
    through a second resolver (shared-failure path).
  fails_when: a dangling $ref at a response is silently swallowed instead of raising the same OpenApiDocumentNotReadableError('unparseable')
    the module's existing resolveRef already raises for a dangling parameter $ref -- which is what a second,
    independent resolver would do differently.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: classifies a lower-case status range key the same as its upper-case spelling
  proves: UNDERDETERMINED, from the specification -- the lower-case range spelling clause
  fails_when: responseKeyKind is case-sensitive and classifies '2xx' as anything other than 'range'.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: classifies a digits-only response key outside 100 through 599 as a range key
  proves: UNDERDETERMINED, from the specification -- the digits-only out-of-range clause
  fails_when: responseKeyKind is numeric-range-blind and classifies '42' or '600' as anything other than
    'range'.
untested:
- domain/integration/connector-configuration-draft-status-reading -- this reader supplies only the key
  and the document's own description; the value object's third attribute, ending, is paired by the drafting
  task and not built here, so no test over this reader decides the value object's stated fact whole.
- domain/integration/connector-configuration-draft-reading-note-kind -- this task emits no reading_notes
  value and declares no type over the note-kind enumeration; it only supplies the 'range'/'default' classification
  a downstream reader turns into two of the nine note kinds, so no finite test over this reader decides
  the enumeration's fact.
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  -- the rule requires a statusMap holding one ending per status key; this reader yields classified keys
  only, leaving ending-selection and statusMap assembly to the drafting task, so no test here decides
  the rule whole.
- rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  -- the task's own REMAINDER note scopes this task to the rule's range-key classification clauses alone;
  the one-note-per-kind-and-subject pairing, the response-key subject for the three response-level kinds,
  and the repeated-field-name-path-not-taken detail are not reached by this reader, so no test here decides
  the rule whole.
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  -- the task's own REMAINDER note scopes this task to the rule's response-$ref clause alone; the path-item-parameter-merge
  clause and the $ref clauses for a parameter, a request-body schema and a security scheme are implemented
  by sibling tasks against different files, so no test here decides the rule whole.
not_applicable:
- edge_case: An operation's responses field present but not a plain object (e.g. an array, a string or
    null) rather than absent entirely
  why: reaches the same !isPlainObject(responses) branch the criterion's own "no responses object" case
    already exercises; not a class the criterion distinguishes from absence.
- edge_case: An empty responses object ({})
  why: reaches the same "yield no response key, raise nothing" behavior already tested for the absent-field
    case, through Object.keys({}).map(...) returning an empty array; not a separate class the criterion
    names.
- edge_case: Two reads of the same or different documents running concurrently, or a response value mutated
    mid-read
  why: readOpenApiOperation is a pure synchronous function over a string parameter with no shared or mutable
    state across calls; no criterion or node states a concurrency behavior for it.
- edge_case: A dependency that is slow, unavailable or answers in an unexpected shape
  why: this reader performs no I/O -- the document text arrives as an in-memory string parameter already
    fetched by its caller.
- edge_case: A duplicate response key in the document
  why: neither a JSON document nor a JS object literal can carry two properties of the same name reaching
    operation.responses, so no obligation states a behavior for it.
---

## What it is
Ten tests extending the existing OpenAPI operation reader unit spec over the new responses field: classification of status/range/default keys, description carrying (present and absent), the no-responses-object path, the $ref-through-resolveRef path (success and dangling-reference), and the two range-key cases the specification's now-decided lower-case and digits-only-out-of-range facts add.

## Notes
None.
