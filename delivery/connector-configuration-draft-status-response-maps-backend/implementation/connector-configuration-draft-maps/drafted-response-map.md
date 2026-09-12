---
target: backend
title: Draft the responseMap and disclose each field
summary: connector-configuration-draft-generation.ts now always emits a responseMap keyed by each success-response
  field's own name alongside one response_field per entry, with three spec files updated to match the
  now-always-present key.
task: sha256:718f04088d36d6d02671f6902b7af16f2e6caf3f75bc0347336d8d28cb385871
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-drafted-response-map-build-2
files:
- path: src/connector-registry/connector-configuration-draft-generation.ts
  effect: Added draftedResponseMap, draftedResponseFields, responseFieldOf and lowestStatusSuccessFieldsOf;
    wired an unconditional responseMap key into draftedConfigurationText's object literal (right after
    statusMap) and a response_fields key into generateConnectorConfigurationDraft's returned draft, both
    built from reading.successResponseFields.
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  effect: Rewrote the one test whose name and assertion asserted responseMap is never stated to instead
    assert the drafted configuration always carries a responseMap key, empty ({}) for the fixture operation
    that declares no success response schema; left every other test untouched.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  effect: Appended ,"responseMap":{} to the expected configuration JSON string in the two route-level
    tests, matching draftedConfigurationText's actual key order (statusMap then responseMap); left every
    other assertion untouched.
criteria:
- criterion: The drafted configuration object holds a responseMap key for every operation, including one
    from which no success field is read, where it holds an empty object.
  met: true
  how: draftedConfigurationText's configuration object literal states responseMap unconditionally, valued
    by draftedResponseMap(reading.successResponseFields), which returns {} when successResponseFields
    is empty.
- criterion: Each field read from a success response schema is drafted as one entry keyed by that field's
    own name.
  met: true
  how: draftedResponseMap maps lowestStatusSuccessFieldsOf(fields) to [field.name, field.path] entries.
- criterion: Each drafted entry holds the path the reading gave that field as its value.
  met: true
  how: The mapping values each entry with field.path, with no rewriting.
- criterion: A field name read under differing paths from more than one success response schema is drafted
    with the path read from the lowest success status.
  met: true
  how: lowestStatusSuccessFieldsOf folds fields into a Map keyed by field.name, replacing the held entry
    only when the new status is numerically lower.
- criterion: A field name read under the same path from more than one success response schema is drafted
    as one entry.
  met: true
  how: The same by-name Map holds exactly one entry per name regardless of whether competing schemas agree
    on path.
- criterion: No drafted key is renamed to any name a capability's output schema declares.
  met: true
  how: draftedResponseMap and responseFieldOf never read a capability's output_schema; the key is always
    field.name as the reading produced it.
- criterion: The draft carries exactly one response field per drafted responseMap entry, holding that
    entry's name and path and the success status it was read from.
  met: true
  how: draftedResponseFields maps the identical lowestStatusSuccessFieldsOf(fields) list draftedResponseMap
    consumes through responseFieldOf.
- criterion: A response field carries the declared type and the declared required listing where the schema
    declares them, and carries neither where it does not.
  met: true
  how: responseFieldOf conditionally spreads declared_type/declared_required only when defined, each omitted
    as a key entirely otherwise.
- criterion: A response field carries the envelope name where the field was read through one, and carries
    none where it was not.
  met: true
  how: responseFieldOf conditionally spreads envelope only when defined, carrying forward exactly the
    envelope name the reading already attached.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: The returned draft's configuration text always states a responseMap alongside statusMap, and the
    draft now always states response_fields alongside status_readings.
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: responseFieldOf produces exactly the shape this node describes -- name, path, status always present,
    and declared_type, declared_required, envelope each present only where declared.
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: draftedResponseMap, draftedResponseFields, lowestStatusSuccessFieldsOf and responseFieldOf together
    implement the invariant's statement -- one entry per field name, the lowest-status path and that same
    schema's declared type/required on a name conflict, an always-present but possibly empty responseMap.
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: Honored rather than re-implemented here -- this file's own contribution is responseFieldOf's conditional
    envelope spread, carrying the already-read envelope name into the drafted response field.
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  how: Reached, per this task's own REMAINDER note, only for its response-$ref clause; that $ref-through-reading
    is openapi-operation-reader.ts's responsibility, outside this task's own file. This task's own criteria
    exercise none of the node's parameter clauses.
inferences:
- inferred: The "same path from more than one success response schema" case is satisfied by the identical
    by-name dedup that already resolves the differing-paths case, rather than needing a separate equal-path
    branch.
  from: lowestStatusSuccessFieldsOf's Map-by-name reduction already produces the lowest-status entry regardless
    of whether competing schemas agree or differ on path.
preserved:
- statusMap and status_readings drafting is untouched and remains exactly as delivered by the earlier
  statusMap task in this epic.
- query, headers, body, method, address drafting and their conditional presence are unchanged.
- unresolved reconciliation, generated_credentials and method_mismatch behavior are unchanged.
- Every other assertion in the two touched spec files besides this round's fallout is left exactly as
  it read before.
deferred:
- what: response_fields keeps the reading_notes sibling field as an empty-array placeholder; no
    reading-note kind is emitted here.
  why: Naming every reading condition the operation exhibits is the task draft-reading-notes'
    own criteria, not this task's -- this task's criteria answer only for responseMap and response_fields.
---

## What it is
The generator now always states a responseMap in the drafted configuration (keyed by each success-response field's own name, valued by the lowest-status path where a name repeats), and draft.response_fields discloses one field per entry with its declared type, required listing and envelope where the reading carries them.

## Notes
Two build rounds: round 1 (test-unit red -- one pre-existing test asserting responseMap is never stated, two pre-existing route tests asserting an exact configuration string now missing the always-present responseMap key), round 2 green.
reading_notes remains the [] placeholder, owned by the sibling task draft-reading-notes, not yet delivered.
