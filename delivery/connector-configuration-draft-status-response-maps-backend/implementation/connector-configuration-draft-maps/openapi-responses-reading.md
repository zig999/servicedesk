---
target: backend
title: OpenAPI operation reader exposes the chosen operation's declared response keys
summary: Extends readOpenApiOperation with a responses field that yields every key of the chosen operation's
  responses object, classified as a numeric status, a range key or the default key, each carrying the
  document's own description where one is declared.
task: sha256:0b215cac1eb8ab5c7ba9f6b33b935e9c0051a18012724b2521505fafb14e67fb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-openapi-responses-reading-build-3
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: 'Adds OpenApiResponseKeyKind (''status'' | ''range'' | ''default'') and OpenApiOperationResponse
    ({key, kind, description?}) types; adds a responses field to OpenApiOperationReading; readOpenApiOperation
    now populates it via a new responsesOf(document, operation) that reads operation.responses (returning
    [] and raising nothing when it is not a plain object), maps each key through the module''s existing
    resolveRef before reading its description (never through a second resolver), and classifies every
    key with responseKeyKind: ''default'' for the literal key "default", ''status'' for a key matching
    ^[1-5][0-9]{2}$ (a three-digit number from 100 through 599), and ''range'' for every other key --
    which covers 2XX/4XX/5XX, a lower-case spelling such as 2xx, and a digits-only key outside 100-599
    such as 42 or 600, all in the same bucket. A response''s description is carried only when the document
    declares one as a string; otherwise the description property is omitted from the yielded entry rather
    than set to an empty string.'
criteria:
- criterion: Reading an operation whose responses declare 200, 403 and 503 yields those three keys.
  met: true
  how: responsesOf reads Object.keys(operation.responses) and maps each to a responseReading entry, so
    200, 403 and 503 each yield one entry with key equal to the declared string and kind 'status' (each
    matches ^[1-5][0-9]{2}$).
- criterion: Each yielded key carries the description the document declares for that response.
  met: true
  how: responseReading resolves the raw response value through resolveRef and reads description off the
    resolved plain object when it is a string, carrying it on the yielded entry.
- criterion: A response the document declares with no description is yielded with no description rather
    than with an empty one.
  met: true
  how: When the resolved response has no string description, responseReading returns { key, kind } with
    the description property entirely absent, never present-and-empty.
- criterion: A response keyed default is yielded classified apart from any numeric status key.
  met: true
  how: responseKeyKind returns 'default' for the literal key "default", a kind distinct from 'status'.
- criterion: A response keyed by a range such as 2XX, 4XX or 5XX is yielded classified apart from any
    numeric status key.
  met: true
  how: None of "2XX", "4XX", "5XX" matches the numeric-status regex ^[1-5][0-9]{2}$ (they contain letters),
    so responseKeyKind falls through to 'range', distinct from 'status'.
- criterion: An operation declaring no responses object yields no response key and raises nothing.
  met: true
  how: responsesOf returns [] when operation.responses is not a plain object; no error is constructed
    or thrown on that path.
- criterion: The reading resolves any $ref it meets through the module's existing resolveRef rather than
    through a second resolver.
  met: true
  how: responseReading calls the module's existing resolveRef(document, rawResponse) -- the same function
    parametersOf, requestBodyFieldNamesOf and requiredSecuritySchemesOf already call -- before reading
    description off the resolved value; no second resolver is introduced.
nodes:
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: This task supplies the raw material the value object is built from -- for a key classified 'status',
    the reader's OpenApiOperationResponse carries exactly the declared key string and, where the document
    states one, the description that value object's own declared_as attribute names. Pairing a status
    with the ending the draft chose for it is the drafting task's own act, not this reader's.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: The reader exposes, per key, the 'default' and 'range' classifications a downstream reader can
    turn into default-response-not-drafted and status-range-not-drafted notes respectively -- the range
    classification now covers a lower-case spelling and a digits-only out-of-range key exactly as an upper-case
    NXX key. This task emits no reading_notes value itself; that construction belongs to the task naming
    the draft's reading_notes.
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: The reader yields exactly the responses-object keys the rule's statusMap is drafted from, each
    already classified so a consumer can select only the 'status' keys (those matching a three-digit number
    100-599) and pass every other key over. Choosing the ending per status and emitting the statusMap
    object itself is the drafting task's, not this reader's.
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: 'Implemented here only for its range-key classification clauses, as the task''s own REMAINDER note
    scopes it: a lower-case range spelling (2xx) and a digits-only key outside 100-599 (42, 600) are both
    classified ''range'' by responseKeyKind, exactly as an upper-case NXX key is. The one-note-per-kind-and-subject
    pairing, the non-json-success-content-not-read/variants-united/success-schema-declares-no-properties
    response-key subject, and the repeated-field-name-path-not-taken detail are not reached here; they
    belong to the task naming the draft''s reading_notes.'
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: 'Implemented here only for its response-$ref clause, as the task''s own REMAINDER note scopes it:
    a response stated as a $ref is read through resolveRef to the declaration it targets before its description
    is read, and the status key it stands under is classified exactly as it would be if the response were
    written inline. The path-item-parameter-merge clause and the $ref clauses for a parameter, a request-body
    schema and a security scheme are unchanged by this task and belong to the tasks reading those parts.'
inferences:
- inferred: Any responses-object key that is neither the literal "default" nor a match for ^[1-5][0-9]{2}$
    (a three-digit decimal 100-599) classifies as 'range' rather than being left unclassified or raising
    -- covering not only 2XX/4XX/5XX but a lower-case spelling (2xx) and a digits-only out-of-range key
    (42, 600) in the same bucket.
  from: 'The task''s own UNDERDETERMINED note: the specification (a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits)
    states a lower-case range spelling and a digits-only out-of-range key both exhibit status-range-not-drafted
    exactly as 2XX does, while the task''s literal criteria name only upper-case spellings. Since the
    domain''s own vocabulary leaves no third bucket for a responses key, every key that is not the literal
    default and not a valid three-digit status is read as a range key.'
preserved:
- readOpenApiOperation's existing method, parameters, requestBodyFieldNames, requiredSecuritySchemes and
  serversInEffect fields and the functions that compute them (parametersOf, requestBodyFieldNamesOf, requiredSecuritySchemesOf,
  serversInEffectOf) are unchanged.
- 'resolveRef and pointerTarget''s existing cycle-safe, #/-pointer-only $ref resolution is unchanged and
  reused rather than duplicated.'
- The existing OpenApiOperationNotFoundError / OpenApiDocumentNotReadableError raising paths are unchanged.
deferred:
- what: Building the drafted statusMap (with per-status endings) and responseMap from the reader's classified
    response keys.
  why: Belongs to the connector-configuration-draft-generation task per the task's own note; this task
    only extends the reader the generator consumes.
- what: Emitting reading_notes entries (default-response-not-drafted, status-range-not-drafted and the
    other kinds), including the one-note-per-kind-and-subject pairing and the repeated-field-name-path-not-taken
    detail.
  why: Explicitly named by the task's REMAINDER note as belonging to the task naming the draft's reading_notes.
- what: The path-item-parameter-merge clause and the $ref clauses for a parameter, a request-body schema
    and a security scheme, from a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs.
  why: Explicitly named by the task's REMAINDER note as belonging to the tasks reading the operation's
    parameters, request body and security scheme.
---

## What it is
Extends the OpenAPI operation reader with the responses half of OpenApiOperationReading, classifying every key of the chosen operation's responses object as a numeric status, a range key (upper-case, lower-case, or digits-only out-of-range) or the literal default key, each carrying the document's own description where one is declared.

## Notes
Reuses the module's existing resolveRef/pointerTarget for any $ref standing at a response, never a second resolver.
Range classification is deliberately total: every key that is not the literal "default" and not a three-digit decimal 100-599 classifies as a range key, per the task's own note on the specification's now-decided lower-case and digits-only-out-of-range facts.
The statusMap/responseMap assembly, the reading_notes emission, and the parameter/request-body/security-scheme $ref clauses are explicitly deferred to sibling tasks, per the task's own REMAINDER notes.
