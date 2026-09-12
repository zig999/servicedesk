---
target: backend
title: Draft reading notes for every exhibited condition
summary: Populates ConnectorConfigurationDraft's reading_notes with one note per kind-and-subject pairing
  the chosen operation's responses exhibit, replacing the [] placeholder, across two new modules and an
  extended openapi-operation-reader.ts.
task: sha256:fcf745d5747390aed36012603464edc94a7df0e24471a83dce98498ecbfa9b1b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-reading-notes-build-4
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: Exposes a new OpenApiSuccessResponseReading per success-status response (hasJsonContent, variantsUnited,
    declaresNoProperties, envelope) alongside the existing successResponseFields, by refactoring the schema-reading
    path (former schemaFieldsAt, now schemaReadingAt) to compute both the fields and these facts from
    one reading; adds combinatorKindOf so the oneOf/anyOf-vs-allOf distinction variants-united needs is
    read once. schemaReadingAt's two branches were extracted into directSchemaReading and envelopedSchemaReading
    (each behind a single grouped-options parameter) to satisfy the standard's max-lines-per-function
    and max-params rules; behavior and return shape (SchemaReading) are unchanged from the refactor.
- path: src/connector-registry/success-response-field-selection.ts
  effect: New module. Extracts lowestStatusSuccessFieldsOf and its single-entry primitive lowestStatusEntry
    from connector-configuration-draft-generation.ts, so the responseMap's drafted path and the reading-notes'
    repeated-field-name-path-not-taken detail read from the identical by-name selection rather than two
    independent ones.
- path: src/connector-registry/connector-configuration-draft-reading-notes.ts
  effect: 'New module. draftedReadingNotes(input) computes the draft''s reading_notes: default-response-not-drafted
    and status-range-not-drafted from the responses list; non-json-success-content-not-read, variants-united
    and success-schema-declares-no-properties from successResponseReadings, each subjected at the response''s
    own key; envelope-read-through from successResponseReadings, deduplicated by envelope name; repeated-field-name-path-not-taken
    from successResponseFields, grouped by field name, naming every path not drafted (excluding the one
    lowestStatusSuccessFieldsOf already selected) each beside the lowest status it was read from, ascending;
    no-responses-declared / no-success-response-schema at the whole-operation level, subjected at the
    operation''s method upper-cased followed by its path.'
- path: src/connector-registry/connector-configuration-draft-generation.ts
  effect: generateConnectorConfigurationDraft's reading_notes field now calls draftedReadingNotesOf(reading,
    path) in place of the [] placeholder; draftedResponseMap and draftedResponseFields now import lowestStatusSuccessFieldsOf
    from the extracted module instead of holding a private copy.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  effect: 'Widened two pre-existing tests'' reading_notes: [] to reading_notes: [{ kind: ''no-responses-declared'',
    subject: ''GET /widgets'' }], since their shared fixture operation (no responses object at all) now
    correctly exhibits that condition; left every other assertion, including the unaffected Object.keys(...)
    listing, untouched.'
criteria:
- criterion: A responses object declaring a default key yields one note of kind default-response-not-drafted
    whose subject is that key.
  met: true
  how: draftedReadingNotes maps every response classified kind 'default' (at most one, per JSON object
    key uniqueness) to a note of that kind, subject the key itself, via responseKeysOfKind(responses,
    'default').
- criterion: A responses object declaring a range key yields one note of kind status-range-not-drafted
    per such key, whose subject is that key.
  met: true
  how: responseKeysOfKind(responses, 'range') maps every response classified kind 'range' to its own note,
    subject the key, one per key.
- criterion: A success response whose content declares no application/json media type yields one note
    of kind non-json-success-content-not-read naming that response.
  met: true
  how: successResponseReadingAt sets hasJsonContent false whenever the response's content object carries
    no application/json entry; nonJsonSuccessContentNotes emits a note per such reading, subject the response's
    own key.
- criterion: A success schema read through a single object envelope yields one note of kind envelope-read-through
    whose subject is the envelope property's name.
  met: true
  how: schemaReadingAt reports the envelope property's own name whenever the single-property-envelope
    descent applies; envelopeReadThroughNotes emits one note per distinct envelope name, deduplicating
    where two success schemas read through an envelope of the same name.
- criterion: A success schema whose oneOf or anyOf variants were united yields one note of kind variants-united
    naming that response.
  met: true
  how: combinatorKindOf reports which of allOf/oneOf/anyOf a schema's root declares; schemaReadingAt's
    variantsUnited is true exactly when that kind is oneOf or anyOf, and variantsUnitedNotes emits a note
    per such response, subject the response's own key.
- criterion: A field name read under differing paths from more than one success schema yields one note
    of kind repeated-field-name-path-not-taken whose subject is that field name and whose detail carries
    the path not drafted.
  met: true
  how: repeatedFieldNameNotes groups successResponseFields by name, and where a name's entries carry more
    than one distinct path, names every distinct path other than lowestStatusSuccessFieldsOf's own drafted
    one, each beside the lowest status that path was read from, sorted ascending, joined into the note's
    detail -- one note per field name regardless of how many differing paths were read.
- criterion: An operation declaring no responses object yields one note of kind no-responses-declared.
  met: true
  how: operationLevelNotes emits this note, subject the operation's method upper-cased followed by its
    path, whenever reading.responses is empty.
- criterion: An operation whose responses declare no application/json success schema yields one note of
    kind no-success-response-schema.
  met: true
  how: operationLevelNotes emits this note, same subject shape, whenever responses is non-empty and no
    successResponseReadings entry has hasJsonContent true.
- criterion: A success schema declaring no properties object at the level it is read at yields one note
    of kind success-schema-declares-no-properties.
  met: true
  how: schemaReadingAt's declaresNoProperties is true when the level finally read has zero property names;
    noPropertiesNotes emits a note per such response with a json schema, subject the response's own key.
- criterion: An operation exhibiting none of these conditions carries an empty reading-notes list.
  met: true
  how: every note-emitting function is gated strictly on the fact it names; an operation with a single
    well-formed, multi-property, non-enveloped, non-variant success schema and unique field paths exercises
    none of these gates and draftedReadingNotes returns [].
- criterion: No note is carried for a condition the operation does not exhibit.
  met: true
  how: each of the nine kinds is produced by exactly one gated function reading a fact the reader computed
    for that response or operation, never emitted unconditionally or as a byproduct of another kind's
    computation.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  how: The draft's reading_notes collection, previously always [], is now populated by draftedReadingNotesOf/draftedReadingNotes,
    completing the disclosure the value object declares beside status_readings and response_fields.
- node: domain/integration/connector-configuration-draft-reading-note
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  how: The note() helper and every note-emitting function construct kind/subject/detail exactly as this
    node describes -- subject the response key, the envelope property name, or the field name where the
    condition was met at one of those, and the operation's method-upper-cased-then-path where met at the
    operation as a whole; no subject is ever a media type.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/connector-registry/openapi-operation-reader.ts
  how: All nine kinds are produced by name-literal calls to note(...), each gated on the exact fact the
    kind's own description names; the reader's new successResponseReadings is what the six response-and-schema-level
    kinds read the gate from.
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  how: The one-note-per-kind-and-subject-pairing invariant is honored structurally (every kind but envelope-read-through
    is keyed by a value already unique per occurrence, and envelope-read-through is explicitly deduplicated
    by envelope name); the response-key subject rule and the whole-operation subject rule are both implemented
    as described; the repeated-field-name-path-not-taken detail names every not-drafted path, each beside
    the lowest status it was read from, ascending, regardless of how many there are.
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  how: Reached only for the reading-note half this rule's own Description assigns to the notes rule (default-response-not-drafted,
    status-range-not-drafted); the statusMap assembly itself was delivered by an earlier task and is left
    unchanged here.
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  how: Reached only for the reading-note half this rule's own Description assigns to the notes rule (envelope-read-through,
    variants-united, repeated-field-name-path-not-taken, non-json-success-content-not-read, no-success-response-schema,
    success-schema-declares-no-properties); the responseMap assembly itself is unchanged in behavior,
    now reading the shared lowestStatusSuccessFieldsOf helper instead of a private copy.
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: Reached only for the envelope-read-through note this rule's Description requires be disclosed to
    the operator; the envelope descent itself is the same reading the sibling task delivered, extended
    to also report the envelope's name and whether its inner object is empty as facts the note reads.
inferences:
- inferred: A whole-operation-level note's subject (no-responses-declared, no-success-response-schema)
    is formatted as the method upper-cased, a single space, then the path -- e.g. "GET /widgets/{id}".
  from: The node and the decision log both say only the method upper-cased followed by the path, naming
    no separator; a single space mirrors the familiar method-then-path convention and is the narrowest
    reading that stays a legible single string, the shape the subject field (type string) requires.
- inferred: The repeated-field-name-path-not-taken detail is formatted as the not-drafted paths, each
    written "path (status)", joined with ", " in ascending-status order.
  from: The rule fixes what the detail must contain but not a literal string shape, since detail (type
    string) has no structured sub-fields to hold path and status apart.
- inferred: Where a single not-drafted path recurs across more than one success status, the status shown
    beside it in the detail is the lowest of those statuses.
  from: Symmetry with the already-decided rule for the drafted path itself -- the response field disclosed
    at the drafted path already carries the lowest success status whose schema declares it there -- applied
    to each not-drafted path the same note discloses.
- inferred: A success response whose content declares application/json but whose media-type object carries
    no schema at all (or a non-object one) is read as declaring no properties, exhibiting success-schema-declares-no-properties
    rather than non-json-success-content-not-read.
  from: The note-kind vocabulary is closed and names no third condition for "json declared, no schema";
    treating an absent schema as an empty properties object is the narrowest fit within the nine kinds,
    structurally identical to a schema that explicitly declares an empty properties keyword.
- inferred: The note-emission logic and the lowest-status field selection each sit in their own new module,
    imported into connector-configuration-draft-generation.ts, rather than growing that file directly.
  from: 'The inventory''s own convention: generated-credential-placeholders.ts, subject-placeholder-resolution.ts
    and registered-method-comparison.ts already sit beside connector-configuration-draft-generation.ts
    as one drafting concern per file, imported rather than inlined.'
preserved:
- draftedStatusMap / draftedStatusReadings -- the statusMap ending logic and status_readings disclosure
  are untouched.
- draftedResponseMap / draftedResponseFields -- keys, drafted paths and the response_fields disclosure
  are behaviorally unchanged; only the lowest-status selection they call was relocated, not altered.
- successResponseFields' existing output for every existing caller -- schemaReadingAt's .fields is the
  same computation the former schemaFieldsAt produced.
- The reader's existing $ref/allOf/oneOf/anyOf resolution and the single-property-envelope descent, both
  reused rather than re-implemented for the new successResponseReadings facts.
- Configuration text composition (method, address, query, headers, body), unresolved items, generated_credentials
  and method_mismatch -- untouched.
deferred:
- what: The map-assembly and envelope-reading clauses of a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses,
    a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
    and a-success-response-schemas-single-object-property-is-read-through-as-its-envelope are not re-verified
    here.
  why: Per the task's own REMAINDER notes, this task names only the reading conditions those readings
    exhibit; the map-assembly and envelope-reading behavior themselves were delivered and proven by earlier
    tasks in this epic.
- what: an-observation-carries-only-the-output-schema-fields-its-response-map-reaches and a-connector-configuration-draft-response-carries-no-capability
    are not reached by any criterion of this task.
  why: Per the task's own REMAINDER note, these belong to the sibling task observation-output-schema-filter-conformance,
    not yet delivered.
---

## What it is
What keeps a map shorter than the document from being read as a document shorter than it is.

## Notes
Four build rounds: round 1 failed lint (schemaReadingAt exceeded max-lines-per-function), round 2 failed lint again (the two extracted helpers exceeded max-params), round 3 failed test-unit (two pre-existing route tests asserting reading_notes: [] against a fixture that now correctly exhibits no-responses-declared), round 4 green.
