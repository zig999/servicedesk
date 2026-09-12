---
target: backend
title: Draft the responseMap and disclose each field -- proof
summary: 12 new unit tests over generateConnectorConfigurationDraft prove the responseMap's always-present-and-possibly-empty
  key, its by-name keying, its lowest-status dedup across differing and equal paths, the key-never-renamed
  guarantee, and the response_fields disclosure's exact shape and conditional declared_type/declared_required/envelope
  carriage.
implementation: sha256:4ee65b290c506de34b26c5888dc5112129130e780dee5a4f6df792cebe21fbfd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-drafted-response-map-suite-3
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: keys each drafted responseMap entry by the field's own name and values it with the path the reading
    gave it, through an envelope
  proves: Criteria 2 and 3 -- each field read from a success response schema is drafted as one entry keyed
    by the field's own name, holding the path the reading gave it as its value; an enveloped fixture (name
    != path) is used so a swap of key and value would be caught.
  fails_when: responseMap stops being keyed by the field's own name, or an entry's value stops being the
    path the reading gave that field -- e.g. keyed by path instead of name, or valued by name instead
    of path.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: states an empty responseMap object -- never an absent key -- and no response fields, for a success
    response from which no field is read
  proves: Criterion 1's empty boundary (an operation from which no success field is read still holds a
    responseMap key, empty) together with the zero-entries boundary of criterion 7 (no responseMap entries
    means no response fields).
  fails_when: responseMap stops being present as an empty object, or draft.response_fields stops being
    an empty array, when the operation's one success response reads no field.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts the path read from the lowest success status when a field name repeats under differing
    paths
  proves: Criterion 4 -- a field name read under differing paths from more than one success response schema
    is drafted with the path read from the lowest success status.
  fails_when: the drafted path for the repeated field name comes from any status other than the numerically
    lowest one that declares it -- e.g. first-encountered-wins or highest-status-wins.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts one responseMap entry for a field name read under the same path from more than one success
    response schema
  proves: Criterion 5 -- a field name read under the same path from more than one success response schema
    is drafted as one entry.
  fails_when: more than one responseMap entry is drafted for a field name whose competing success schemas
    already agree on its path.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: discloses the lowest success status's own account for a field whose path already agrees across
    success response schemas
  proves: The implementation's recorded inference -- the same by-name dedup that resolves the differing-paths
    case also picks the lowest-status schema's own status, declared_type and declared_required when the
    paths already agree, rather than an arbitrary or first/last-processed schema's account.
  fails_when: the disclosed response field for the repeated name carries a status, declared_type or declared_required
    taken from any schema other than the numerically lowest success status that declares it at the agreed
    path.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries exactly one response field per drafted responseMap entry, holding that entry's own name,
    path and success status
  proves: Criterion 7 -- the draft carries exactly one response field per drafted responseMap entry, holding
    that entry's name, path and success status; the exact per-entry object equality also guards that no
    envelope/declared_type/declared_required key leaks in where nothing was declared.
  fails_when: response_fields carries a different count of entries than responseMap has keys, an entry's
    name/path/status disagrees with its own responseMap entry, or an entry carries an extra key nothing
    declared.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries the declared type and the declared required listing on a response field when the schema
    declares both
  proves: Criterion 8, present class -- a response field carries the declared type and the declared required
    listing where the schema declares them, including a positive (true) required listing.
  fails_when: the response field omits declared_type or declared_required, or misstates either value,
    when the schema declares both.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries neither declared_type nor declared_required on a response field when the schema declares
    neither
  proves: Criterion 8, absent class -- a response field carries neither the declared type nor the declared
    required listing where the schema declares neither.
  fails_when: the response field carries a declared_type or a declared_required key when the schema declares
    neither.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries declared_required as false, rather than omitting it, for a field a declared required listing
    exists but does not name
  proves: Criterion 8's required-listing boundary -- a field a declared required array exists but does
    not include still carries declared_required as false rather than omitting the key (a falsy value is
    not the same as an undeclared one).
  fails_when: declared_required is omitted, instead of carried as false, for a field whose schema declares
    a required array that does not name it.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries the envelope name on a response field read through a single-property envelope
  proves: Criterion 9, present class -- a response field carries the envelope name where the field was
    read through one.
  fails_when: the response field omits the envelope key, or misnames it, when the reading descended through
    a single-property envelope to reach the field.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: keeps a drafted responseMap key as the field's own name, never a name a registered capability's
    schema declares instead
  proves: Criterion 6 -- no drafted key is renamed to any name a capability's output schema declares;
    shown by registering a capability naming a different property and confirming the drafted key is unaffected.
  fails_when: the drafted responseMap key for the field stops being its own name -- e.g. renamed toward
    a name a registered capability's schema mentions instead.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries, whole, the response field shape the specification declares -- required name/path/status
    always present, and declared_type, declared_required and envelope present only where the schema declares
    them
  proves: domain/integration/connector-configuration-draft-response-field
  fails_when: any response field stops carrying name/path/status in every case, or an optional attribute
    (declared_type, declared_required, envelope) is carried when its schema does not declare it or omitted
    when its schema does.
  demonstrates: domain/integration/connector-configuration-draft-response-field
not_applicable:
- edge_case: two operations drafted concurrently against one subject
  why: draft generation is a stateless, per-request pure computation over its own inputs; no criterion
    or node states concurrent behavior, and nothing here holds shared mutable state a race could corrupt.
- edge_case: a success response schema built from a $ref, an allOf/oneOf/anyOf combinator, or a non-application/json
    media type
  why: reading such a schema into reading.successResponseFields is openapi-operation-reader.ts's responsibility,
    delivered and proven under the success-response-schema-fields task; this task's own file and its 9
    criteria consume that reading as given and never re-derive it (the task's own UNDERDETERMINED note
    2 and REMAINDER notes say so explicitly).
- edge_case: the document fetcher, capabilities reader or registry failing or answering slowly
  why: this task neither introduces nor changes how those dependencies are called or how their failures
    propagate; none of its 9 criteria concerns that ground, which existing propagation tests in this same
    file already cover.
untested:
- 'domain/integration/connector-configuration-draft: this node''s fact spans the whole draft value-object
  (connector, configuration, unresolved, generated_credentials, method_mismatch, status_readings, response_fields,
  reading_notes, and the capability relationship), most of which other tasks own and test. This task''s
  own file and criteria decide only the responseMap key inside configuration and the response_fields list,
  so no test written here decides this node''s fact whole.'
- 'rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas:
  this invariant''s own statement bundles the success-response-schema reading definition (application/json
  only, $refs read through, allOf merged, oneOf/anyOf united) -- a totality over success-response-schema
  shapes nothing here enumerates, and per the task''s own UNDERDETERMINED note 2, out of this task''s
  own file and criteria. The drafting-side clauses it also states -- one entry per name, lowest-status
  selection on both the differing-paths and same-path cases, and always-present-possibly-empty -- are
  each protected by a dedicated criterion test instead of one test deciding the whole invariant.'
- 'rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope:
  honored, not reimplemented, by this task''s own file. The envelope-reading mechanics this node states
  (the properties-keyword requirement, the one-level-only descent, an empty properties object yielding
  no field) live in openapi-operation-reader.ts under the success-response-envelope-read-through task
  and its own proof. This task''s tests exercise only the drafting side''s conditional forwarding of an
  already-read envelope name (criterion 9), not the reading''s own correctness.'
- 'rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs:
  per the task''s own REMAINDER note, reached only for its response-$ref clause, which is openapi-operation-reader.ts''s
  responsibility under a different, already-delivered task. None of this task''s own 9 criteria exercises
  any $ref resolution, so no test here decides any part of this node''s fact.'
- The task's second UNDERDETERMINED entry (about the success-response-schema definition -- media type,
  $ref, allOf, oneOf/anyOf) names candidate readers of that definition, but that definition is entirely
  openapi-operation-reader.ts's, decided by the success-response-schema-fields task and its own proof,
  not by this task's own file or criteria; no test is owed here because the entry observes ground outside
  what this task implements, and none is invented in its place.
---

## What it is
Proof of the responseMap and response_fields drafting behavior.

## Notes
Suite round 1 (against the implementation's own already-green build-2) failed typecheck over a line indexing one level past the `unknown`-typed `configurationOf(...).responseMap`; fixed by comparing the whole object, as every other test in the file already does. Suite round 2 then failed one unrelated, pre-existing test in `anthropic-assessment-consolidator.adapter.spec.ts` -- a wall-clock timing assertion (`elapsed_ms >= 20`) that measured 19ms; diagnosed as a test-design flake unrelated to this task's own files or specification nodes. Suite round 3 passed clean.
