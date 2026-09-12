---
target: frontend
title: Response fields the answer carries are stated by name, path, status and their carried declarations
  -- proof
summary: 'Proves the drafted responseMap''s per-field disclosure at both the projection layer and the
  rendered surface -- name, path and success status always stated, declared_type/declared_required/envelope
  stated only where the answer carried them (declared_required: false treated as a real carried value),
  and no field the answer did not carry is invented.'
implementation: sha256:9ac8e76d194717c47ff4d14c010bfe1327033cc27a5d80f84a2348019d95fb0d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-response-fields-stated-suite-2
tests:
- file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
  name: each response field is projected with its own name, path and status, and with exactly the six
    attributes connector-configuration-draft-response-field declares
  proves: Criteria 1, 2 and 3 (name, path and success status stated unmodified) and the base case of criterion
    4.
  fails_when: the projection drops, renames or alters name/path/status for any field, or fails to carry
    an optional attribute correctly.
  demonstrates: domain/integration/connector-configuration-draft-response-field
- file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
  name: 'a response field''s declared_required: false is projected as the literal false, distinct from
    an absent declared_required'
  proves: The boundary of criterion 4 that a declared_required of false is a carried value and must be
    projected as false, never collapsed to undefined.
  fails_when: 'the projection treats a field''s declared_required: false as though the attribute were
    not carried.'
- file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
  name: an empty response_fields list projects no response field
  proves: Criterion 5, at the projection layer.
  fails_when: the projection synthesizes a response field despite an empty response_fields list.
- file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
  name: every response field the answer carries is stated with its name, its path and its status, and,
    only where carried, its declared type, its declared required listing and its envelope
  proves: Criteria 1, 2, 3 and the general case of criterion 4, as stated on the rendered surface.
  fails_when: any field's rendered name, path or status is wrong or missing, or an optional attribute
    renders/omits incorrectly.
  demonstrates: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
  name: 'a response field''s declared_required: false is stated as a carried value, not omitted like an
    absent one'
  proves: The rendered boundary of criterion 4.
  fails_when: the rendered surface omits the declared-required parenthetical for a field whose declared_required
    is false.
- file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
  name: no response field the answer did not carry is stated when the draft carries none
  proves: Criterion 5, at the rendered surface.
  fails_when: a Response fields section (or any part of it) renders despite an empty response_fields list.
not_applicable:
- edge_case: A draft object that omits response_fields entirely rather than carrying an empty array.
  why: No criterion or node this task implements addresses malformed input; the defensive default exists
    to avoid breaking pre-existing fixtures, not because a criterion requires tolerating a draft that
    violates its own declared shape.
- edge_case: Two response fields sharing the same name.
  why: Neither the rule, the domain node nor any criterion states uniqueness within one draft's response_fields.
- edge_case: declared_type or envelope carried as an empty string rather than omitted.
  why: No criterion or node treats an empty string specially for the two string-typed optional attributes.
untested:
- 'domain/integration/connector-configuration-draft, as a whole: this task honors the node without encoding
  it -- response_fields is one of the aggregate''s many attributes, and no other attribute is touched
  by this task.'
- 'scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes, as a whole: this
  task answers only its response-fields then-clause, per its own Notes; the scenario as a whole is shared
  with sibling tasks.'
---

## What it is
Proof of the response-fields disclosure at both the projection layer and the rendered surface.

## Notes
Suite round 1 failed lint (both original spec files exceeded the 300-line max, fixed by splitting the new tests into sibling files, following the convention already established by the status-readings-stated task). Suite round 2 passed clean.
