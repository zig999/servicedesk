---
target: backend
title: Draft reading notes for every exhibited condition -- proof
summary: Proves reading_notes carries exactly one note per closed-vocabulary condition the chosen operation's
  responses exhibit, at the subject and cardinality the specification fixes, and none for a condition
  not exhibited.
implementation: sha256:cce867ed29bb42af2550ca3514b9694feb575fdbfbe044e4e028f2f0ed1ec3ad
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-reading-notes-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts a default-response-not-drafted note naming the default key, alongside a valid success schema
  proves: A responses object declaring a default key yields one note of kind default-response-not-drafted
    whose subject is that key.
  fails_when: no note of kind default-response-not-drafted is carried for a default-keyed response, or
    its subject is anything other than the literal key 'default'.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts one status-range-not-drafted note per range key declared
  proves: A responses object declaring a range key yields one note of kind status-range-not-drafted per
    such key, whose subject is that key.
  fails_when: fewer than one note is emitted per declared range key, a note's subject is not the exact
    range key, or the two keys collapse into one note.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: reads a lower-case range key spelling as exhibiting status-range-not-drafted exactly as the upper-case
    wildcard would
  proves: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
    -- a responses key spelling a status range in lower case, such as 2xx, exhibits status-range-not-drafted
    exactly as the upper-case 2XX does.
  fails_when: a lower-case range key such as '2xx' is read as anything other than a range, so no status-range-not-drafted
    note is carried for it.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: reads a purely numeric key outside the 100-through-599 status bound as exhibiting status-range-not-drafted
  proves: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
    -- a responses key made only of digits that is not a three-digit number from 100 through 599 is read
    as a status range and exhibits status-range-not-drafted exactly as 2XX does.
  fails_when: a purely numeric out-of-range key such as '600' is read as a numeric status or as the default
    key rather than as a range, so no status-range-not-drafted note is carried for it.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the response's own key as the subject of non-json-success-content-not-read, never its description
    or its media type
  proves: A success response whose content declares no application/json media type yields one note of
    kind non-json-success-content-not-read naming that response.
  fails_when: the note's subject is anything other than the exact key '200' -- including the response's
    own description, a media type name, an empty string, or an absent subject.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the response's own key as the subject of variants-united, never its description
  proves: A success schema whose oneOf or anyOf variants were united yields one note of kind variants-united
    naming that response.
  fails_when: the note's subject is anything other than the exact key '201' -- including the response's
    own description or the media type name.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the envelope property as the subject of envelope-read-through
  proves: A success schema read through a single object envelope yields one note of kind envelope-read-through
    whose subject is the envelope property's name.
  fails_when: no envelope-read-through note is carried for a response read through a single-property object
    envelope, or its subject is not the envelope property's own name 'payload'.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries exactly one envelope-read-through note when two success response schemas are read through
    an envelope property of the same name
  proves: The one-note-per-kind-and-subject-pairing cardinality -- a condition recurring at the same subject
    across two success response schemas yields exactly one note, not one per occurrence.
  fails_when: two envelope-read-through notes are carried instead of the single deduplicated note the
    invariant requires.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the response's own key as the subject of success-schema-declares-no-properties, at the top
    level, never leaving it absent
  proves: A success schema declaring no properties object at the level it is read at yields one note of
    kind success-schema-declares-no-properties.
  fails_when: the note's subject is not the exact key '204', is empty, or is absent.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts success-schema-declares-no-properties at the envelope inner level too, alongside the envelope-read-through
    note for that same response
  proves: A success schema declaring no properties object at the level it is read at yields one note of
    kind success-schema-declares-no-properties -- tested here at the envelope's own inner object.
  fails_when: no success-schema-declares-no-properties note is carried when the envelope's own inner object
    declares an empty properties keyword, or the accompanying envelope-read-through note for 'payload'
    is missing.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the operation's own method upper-cased followed by its path as the subject of no-responses-declared,
    never the connector's name, an operationId or a lower-cased method
  proves: An operation declaring no responses object yields one note of kind no-responses-declared.
  fails_when: the note's subject does not start with the upper-cased method 'GET', does not end with the
    path '/widgets', or instead carries the connector name, the operationId, or the lower-cased method.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts a no-success-response-schema note naming the operation itself when the responses declare
    no success response schema under application/json
  proves: An operation whose responses declare no application/json success schema yields one note of kind
    no-success-response-schema.
  fails_when: no note of kind no-success-response-schema is carried when no success-status response exists
    at all, or its subject does not start with 'GET' and end with '/widgets'.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names every not-drafted path for a repeated field name, each beside the ascending success status
    it was read from, none of them left out
  proves: A field name read under differing paths from more than one success response schema yields one
    note of kind repeated-field-name-path-not-taken whose subject is that field name and whose detail
    carries the path not drafted.
  fails_when: more than one repeated-field-name-path-not-taken note is carried for the field 'id', the
    note's subject is not 'id', or its detail omits either not-drafted path or lists them out of ascending
    status order.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries an empty reading-notes list for an operation exhibiting none of these conditions
  proves: An operation exhibiting none of these conditions carries an empty reading-notes list.
  fails_when: reading_notes is non-empty for an operation whose single success schema is well-formed,
    non-enveloped, non-variant, and free of repeated field names.
not_applicable:
- edge_case: two concurrent generations of a draft for the same operation
  why: draftedReadingNotes is a pure, synchronous, stateless function over an already-parsed reading;
    no criterion or node states a guarantee about concurrent invocation, and there is no shared mutable
    state for concurrency to disturb.
- edge_case: the OpenAPI document fetcher failing, answering slowly, or answering in an unreadable shape
  why: that dependency's failure modes belong to the document-fetch and document-reading tasks this task
    depends on and does not re-implement; this task's own input is the already-read OpenApiOperationReading,
    not the fetch itself.
- edge_case: an operation attempted against state that forbids it
  why: reading-note derivation is a pure read/derive computation over one already-fetched document, not
    a stateful entity with forbidden transitions.
untested:
- domain/integration/connector-configuration-draft's fact spans far more than reading_notes; this task
  governs only the reading_notes population, so no single test in this proof decides the node's fact whole
  -- only the reading_notes portion is exercised.
- domain/integration/connector-configuration-draft-reading-note's field shape (kind/subject/detail) is
  already decided whole by a pre-existing type-level test written for the sibling task draft-disclosure-type,
  in connector-configuration-draft.spec.ts; the node's further description -- what a subject names per
  condition, and that no subject is ever a media type -- is exercised piecemeal by this proof's per-kind
  tests rather than by one bundling test.
- domain/integration/connector-configuration-draft-reading-note-kind's closed nine-value vocabulary is
  already decided whole by a pre-existing type-level test in connector-configuration-draft.spec.ts; no
  single runtime test in this proof can exhibit all nine kinds at once, because several conditions structurally
  exclude each other.
- rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  states five distinct clauses; each has its own representative test above, but no single test decides
  the whole compound statement at once, to keep which clause broke legible.
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  is reached by this task only for its reading-note half; the statusMap-assembly half is proven by an
  earlier task's proof, so no test here decides the rule's statement whole.
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  is reached by this task only for its reading-note half; the responseMap-assembly half is proven by an
  earlier task's proof, so no test here decides the rule's statement whole.
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  is reached by this task only for the envelope-read-through disclosure note; the envelope-descent reading
  itself is proven by the sibling task success-response-envelope-read-through's own proof.
- 'the implementation''s inference that a whole-operation subject joins the upper-cased method and the
  path with a single literal space is not pinned by any test here: the criterion tests assert only that
  the subject starts with the method and ends with the path, leaving the exact separator unproven by design.'
- 'the implementation''s inference that the repeated-field-name-path-not-taken detail is formatted as
  ''path (status)'' joined by '', '' is not pinned by any test here: the criterion test asserts only that
  both not-drafted paths appear in ascending order, leaving the exact literal formatting unproven by design.'
- the implementation's inference that a not-drafted path recurring under more than one status is shown
  beside the lowest of those statuses is a behavior inference the specification does not state; no test
  here constructs that scenario or pins that choice.
- the implementation's inference that a success response declaring application/json with no schema (or
  a non-object one) is read as success-schema-declares-no-properties rather than non-json-success-content-not-read
  is a behavior inference the specification does not state; no test here constructs that scenario or pins
  that choice.
---

## What it is
Proof of the reading-note emission behavior across all nine closed-vocabulary conditions.

## Notes
Suite passed clean on the first attempt against the already-green build-4.
