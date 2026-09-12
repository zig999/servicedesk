---
target: backend
title: Success response schema field reading in the OpenAPI operation reader
summary: openapi-operation-reader.ts now exposes, per operation, the top-level application/json fields
  of every success (200-299) response schema, each with its path, declared type, declared required-ness
  and the status it was read from.
task: sha256:df095c70880db2d466f392308d517d14abe433c3e60a3bb238504308b7060ef6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-success-response-schema-fields-build
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: 'Adds OpenApiSuccessResponseField (name, path, status, optional declaredType, optional declaredRequired)
    and a successResponseFields array on OpenApiOperationReading. Adds successResponseFieldsOf and its
    helpers (isSuccessStatusKey, successResponseFieldsAt, schemaFieldsAt, schemaPropertySources, mergedSchemaProperties,
    isStringValue, declaredTypeOf, responseField): for every response key classified ''status'' by the
    existing responseKeyKind and starting with ''2'', the raw response value is read through the existing
    resolveRef, its content[''application/json''].schema is read through resolveRef again, and its top-level
    properties are read -- merging every allOf part or uniting every oneOf/anyOf variant''s properties
    into one set first -- into one OpenApiSuccessResponseField per property, named and pathed by the property''s
    own name, carrying the response''s status, the property''s own declared type where present, and, only
    where at least one merged part declares a required array at all, whether that array names the field.'
criteria:
- criterion: A success response whose application/json schema declares three top-level properties yields
    those three field names, each at the path that is its own name.
  met: true
  how: schemaFieldsAt maps Object.keys(merged.properties) to a field per name, and responseField sets
    path to that same name.
- criterion: Each yielded field carries the type its own schema declares, and carries none where the schema
    declares none.
  met: true
  how: declaredTypeOf reads propertySchema.type only when it is a plain object with a string type; responseField
    omits declaredType from the returned object entirely when declaredTypeOf returns undefined.
- criterion: Each yielded field carries whether the schema's required list names it.
  met: true
  how: mergedSchemaProperties tracks requiredNames only when at least one merged part declares a required
    array; responseField sets declaredRequired to requiredNames.includes(name) only when requiredNames
    is not undefined, and omits the key otherwise.
- criterion: Each yielded field carries the success status it was read from.
  met: true
  how: successResponseFieldsOf passes the response's own key as status all the way through successResponseFieldsAt
    and schemaFieldsAt into every responseField call.
- criterion: A success response whose content declares media types but no application/json yields no field.
  met: true
  how: successResponseFieldsAt reads content['application/json'] specifically; when that key is absent,
    mediaType is undefined and the function returns [] without reading any other media type.
- criterion: A success response declaring no content yields no field.
  met: true
  how: successResponseFieldsAt derives content from the resolved response; when response.content is not
    a plain object, mediaType and schema both resolve to undefined and [] is returned.
- criterion: A success response schema reached through a $ref is read through the module's existing resolveRef
    rather than through a second resolver.
  met: true
  how: successResponseFieldsAt calls the module's existing resolveRef for the response itself and again
    for mediaType.schema; schemaPropertySources calls the same resolveRef for each allOf/oneOf/anyOf part.
    No second resolver is introduced.
- criterion: A success response schema whose root declares allOf yields the properties of every part merged
    into one set of fields.
  met: true
  how: schemaPropertySources returns the resolved allOf parts when schema.allOf is an array; mergedSchemaProperties
    Object.assigns every part's properties into one combined properties object before fields are derived.
- criterion: A success response schema whose root declares oneOf or anyOf yields the properties of every
    variant united into one set of fields.
  met: true
  how: schemaPropertySources falls back to schema.oneOf then schema.anyOf when allOf is absent, and mergedSchemaProperties
    combines every variant's properties the same way it combines allOf parts.
- criterion: A success response schema declaring no properties object yields no field.
  met: true
  how: when no part contributes a properties object, mergedSchemaProperties's properties stays an empty
    object and schemaFieldsAt's Object.keys(...).map yields an empty array.
- criterion: A response keyed by a status outside 200 through 299 contributes no field.
  met: true
  how: successResponseFieldsOf filters Object.keys(responses) through isSuccessStatusKey, which requires
    responseKeyKind(key) === 'status' (excluding 'default' and range keys like '2XX') and key.startsWith('2')
    (excluding 1xx/3xx/4xx/5xx), before any response is read.
nodes:
- node: domain/integration/connector-configuration-draft
  how: Supplies the reader-level material (per-schema fields with path/status/declared type/declared required)
    that a later task assembles into the draft's responseMap and response_fields; this task reaches no
    criterion touching the draft's own assembled shape.
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: domain/integration/connector-configuration-draft-response-field
  how: OpenApiSuccessResponseField mirrors this node's name/path/status/declared_type/declared_required
    attributes in camelCase; its optional envelope attribute is left unproduced here, per this task's
    own UNDERDETERMINED note bounding the envelope case to the sibling success-response-envelope-read-through
    task.
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  how: Implements the per-schema reading half only -- success being a response keyed 200 through 299 read
    for application/json alone, through resolveRef, with allOf parts merged and oneOf/anyOf variants united
    into one properties object. The responseMap-assembly half is out of this task's criteria per its own
    REMAINDER note and is left to the task drafting the responseMap.
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  how: Implements only the "otherwise" branch this rule states -- a schema is read at its own top-level
    properties, each at the path that is its own name -- and never descends through a single-property
    envelope. Per this task's own UNDERDETERMINED note, the envelope-descent branch is the sibling task's
    (success-response-envelope-read-through).
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  how: Implements only this rule's response clause -- a response reached by $ref is read through to its
    declaration before its schema is read, and the status key it stands under is classified exactly as
    it would be inline. The parameter-merge and the parameter/request-body/security-scheme $ref clauses
    were already implemented before this task and are not touched here.
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
inferences:
- inferred: A property's own declared type is read directly from that property's schema object (its type
    keyword) without resolving a $ref the property schema itself might be.
  from: a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs names
    $ref-through only for a parameter, a request-body schema, a response, and a security scheme -- never
    for a property nested inside an already-resolved response schema -- and no criterion of this task
    presents a property whose own schema is a $ref.
- inferred: Whether a field's required-ness is disclosed at all turns on whether any merged allOf part
    or oneOf/anyOf variant declares a required array, not on whether the specific field's own contributing
    part does; where at least one part declares one, every field is checked against the union of every
    part's required names.
  from: The rule's own language treating an allOf's parts as "merged into one properties object" and a
    oneOf/anyOf's variants as "united into one" set of fields, extended consistently to the required list
    since no criterion distinguishes a per-part required list from a combined one.
- inferred: Where a schema's root declares allOf, oneOf or anyOf, only that combinator's parts contribute
    properties -- a properties object declared alongside it at the same level is not itself read as an
    additional part.
  from: The criteria present allOf and oneOf/anyOf as alternative root shapes on their own, never together
    with a sibling top-level properties object, so nothing in this task's criteria reaches that combination.
preserved:
- The existing OpenApiOperationReading fields (method, parameters, requestBodyFieldNames, requiredSecuritySchemes,
  serversInEffect, responses) and every function producing them are untouched; responseKeyKind is reused
  rather than reimplemented for the success-status filter.
- Every existing openapi-operation-reader.spec.ts assertion reads a specific property of reading rather
  than the whole object, so the added successResponseFields field changes none of their expectations.
deferred:
- what: The responseMap-assembly half of a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
    -- one entry per field name, the lowest-status path and disclosed status/type/required for a repeated
    name across schemas, and the empty responseMap default.
  why: This task's own REMAINDER note assigns it to the task drafting the responseMap and reconciling
    field names across responses.
- what: The single-property envelope descent a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
    states.
  why: This task's own UNDERDETERMINED note assigns it to the sibling task success-response-envelope-read-through,
    since no criterion here presents an envelope case.
- what: Naming a reading note for non-json-success-content-not-read, variants-united and success-schema-declares-no-properties
    conditions this reading produces.
  why: This task's own REMAINDER note assigns note-naming to the task that names the draft's reading_notes.
---

## What it is
Extends the OpenAPI operation reader with a successResponseFields array: the top-level application/json fields of every success (200-299) response schema, each with its path, declared type, declared required-ness and the status it was read from, with allOf merged and oneOf/anyOf united.

## Notes
Reuses the existing resolveRef for both the response and its schema; no second resolver.
The single-property envelope descent is deliberately not implemented here -- it is the sibling success-response-envelope-read-through task's, per this task's own UNDERDETERMINED note.
Required-ness is disclosed only where at least one merged part declares a required array at all; absent rather than false where none does.
