---
target: backend
title: Envelope descent for a success response schema's single object property
summary: openapi-operation-reader.ts now reads a success response schema's exactly-one top-level object
  property that itself declares a properties keyword one level down, yielding the inner object's fields
  at outer.field paths carrying the outer name as their envelope, while every other shape keeps the existing
  top-level reading unchanged.
task: sha256:82217759c4af160a700a682eeaa885dfb2ef0f7c39ccd0fdbab73974709f80e8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-success-response-envelope-read-through-build
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: Added the envelope field to OpenApiSuccessResponseField; added envelopeSchemaOf, which resolves
    a candidate property's schema through $ref and reports it only where the resolved value is a plain
    object owning a properties keyword (present, empty or not); changed schemaFieldsAt so that, only when
    the already-merged top-level properties number exactly one, it checks that sole property's own schema
    through envelopeSchemaOf and, where it qualifies, reads that inner schema's own properties (merged
    the same general way as any other schema) as the yielded fields, each carrying the envelope name;
    every other case falls through to the exact mapping the prior task already implemented, untouched;
    changed responseField to compute path as envelope.name when an envelope is given and to carry the
    envelope key only then.
criteria:
- criterion: A success schema whose single top-level property is an object explicitly declaring a properties
    keyword, whether empty or not, yields that inner object's properties and not the outer property itself.
  met: true
  how: schemaFieldsAt takes the envelope branch whenever topLevelNames.length === 1 and envelopeSchemaOf(document,
    thatProperty'sOwnSchema) returns a value (a plain object owning 'properties', checked after $ref resolution);
    it then maps only Object.keys(enveloped.properties) into fields, never the outer property name itself.
- criterion: Each field yielded through an envelope holds the path made of the outer property's name,
    a dot and the field's own name.
  met: true
  how: responseField sets path to `${envelope}.${name}` whenever an envelope is passed in.
- criterion: Each field yielded through an envelope carries the outer property's name as its envelope.
  met: true
  how: schemaFieldsAt passes envelope (the outer property's own name) into every responseField call in
    the envelope branch, and responseField includes it verbatim on the returned field.
- criterion: A success schema with two or more top-level properties yields those top-level properties
    at their own names and carries no envelope.
  met: true
  how: The envelope check only runs when topLevelNames.length === 1; with two or more names the original
    branch runs unchanged, calling responseField with no envelope argument, so path equals name and no
    envelope key is set.
- criterion: A success schema whose single top-level property's own schema is not an object explicitly
    declaring a properties keyword yields that property itself as one field at its own name, carrying
    no envelope.
  met: true
  how: envelopeSchemaOf returns undefined whenever the resolved candidate schema is not a plain object
    or does not own a 'properties' key, and schemaFieldsAt then falls back to the unchanged single-field
    mapping (path equal to the property's own name, no envelope).
- criterion: An object property declared inside the envelope is not descended into, and its own subproperties
    yield no field.
  met: true
  how: The envelope branch reads exactly one level from envelopeSchema -- Object.keys(enveloped.properties)
    -- and never recurses into any inner property's own 'properties'; no further envelope check runs on
    those inner fields.
- criterion: A single top-level property that is an object declaring an empty properties keyword is read
    through as an envelope and yields no field, and a success schema whose top-level properties keyword
    is absent or empty yields no field.
  met: true
  how: An empty properties object still satisfies hasOwnProperty(resolved, 'properties'), so envelopeSchemaOf
    still reports it as an envelope, and mergedSchemaProperties over it yields an empty properties map,
    so Object.keys(...).map(...) yields no field; a schema whose own properties keyword is absent or empty
    yields topLevelNames.length === 0, so the envelope check never runs and the map over an empty array
    yields no field either.
nodes:
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: 'schemaFieldsAt implements the whole invariant: the "otherwise" clause (unchanged, from the prior
    task) reads the schema''s own top-level properties at their own names; the envelope clause is the
    new branch -- exactly one top-level property whose own schema (after $ref resolution) explicitly declares
    a properties keyword is descended into one level, yielding that keyword''s own entries at outer.field
    paths; the reading never descends past that one level; and a properties keyword absent or empty at
    whichever level is finally read yields no field.'
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: 'OpenApiSuccessResponseField gained the optional envelope: string attribute the value object declares;
    responseField now sets it, and derives path from it, only for a field read through an envelope, leaving
    name, status, declaredType and declaredRequired exactly as the prior task already reads them.'
inferences:
- inferred: Whether the single top-level property "is an object explicitly declaring a properties keyword"
    is checked on that property's own schema after resolving its $ref only, not after applying allOf/oneOf/anyOf
    combinator merging to it.
  from: The rule's own wording distinguishes the envelope clause from the "otherwise" clause, under which
    the prior task's combinator merging already lives; the envelope clause names no combinator at all,
    so eligibility is read off the schema's own literal declaration.
- inferred: Once a property qualifies as an envelope, its own inner properties are read using the same
    schemaPropertySources/mergedSchemaProperties helpers already used for the outer level.
  from: MNT-03 (a block of logic that already exists is called, not copied) and the absence of any criterion
    or node text forbidding a combinator at the enveloped level.
- inferred: declaredType and declaredRequired for a field yielded through an envelope are read from the
    enveloped schema's own type/required declarations, not from the outer response schema's.
  from: connector-configuration-draft-reading-note-kind's description of success-schema-declares-no-properties,
    naming the level a draft finally reads as the level whose properties keyword absence/emptiness is
    judged -- the same level a field's own declared type and required listing are read from.
preserved:
- 'The "otherwise" branch''s exact prior behavior for zero, two-or-more, or single-non-qualifying-property
  schemas: field enumeration order, path-equals-name, declaredType/declaredRequired presence rules, and
  the allOf/oneOf/anyOf merging established by success-response-schema-fields.'
- All non-success-field readings in this file -- untouched by this change.
---

## What it is
Adds the single-object-property envelope descent to the success response schema reading: exactly one top-level property whose own schema explicitly declares a properties keyword (empty or not) is descended into one level, yielding that keyword's entries at outer.field paths with the outer name carried as envelope; every other shape keeps the prior task's unchanged reading.

## Notes
The blocking contradiction two prior task bindings found -- between this rule's own "otherwise" clause and the reading-note kind's success-schema-declares-no-properties description, over a schema whose single property is an object with no properties keyword at all -- was resolved by an /analyse cross-check (commit 729e5e46) before this task was implemented; this delivery encodes the resolved reading.
declaredType and declaredRequired for an enveloped field are read from the enveloped schema, an inference the task's own ADVISORY note left to this implementation to settle.
