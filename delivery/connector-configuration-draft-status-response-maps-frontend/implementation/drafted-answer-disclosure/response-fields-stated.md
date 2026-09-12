---
target: frontend
title: State the drafted answer's response fields
summary: Adds a "Response fields" section to the Configuration Helper's draft disclosure, stating each
  response field's name, path, status and (where carried) declared_type, declared_required and envelope.
task: sha256:599b4e5edb25bcf92ad4e3f9993f6a40dbca66ddb7cc040aac7808170f0f6cbd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-response-fields-stated-build
files:
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: Adds a ResponseFieldDisclosure type and a responseFields projection (defensively defaulting
    draft.response_fields to an empty array) mapping each drafted response field's name, path, status,
    declared_type, declared_required and envelope onto the DraftDisclosure the route renders.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Renders a "Response fields" section, shown only when draft.responseFields is non-empty, listing
    each field's name, path and status with declared type, declared required and envelope appended only
    where each is carried.
criteria:
- criterion: Each response field the answer carries is stated with the name that field names.
  met: true
  how: draftDisclosureFrom maps each item of draft.response_fields to field.name unchanged, and the route
    renders it as the list item's leading, bold text.
- criterion: Each response field is stated with the path drafted as its responseMap value.
  met: true
  how: 'field.path is carried through the projection unchanged from response_fields[].path and rendered
    as "path: {field.path}".'
- criterion: Each response field is stated with the success status it was read from.
  met: true
  how: 'field.status is carried through unchanged from response_fields[].status and rendered as "status:
    {field.status}".'
- criterion: Where a response field carries its declared type, its declared required listing or the envelope
    it was read through, each of those the answer carries is stated.
  met: true
  how: declaredType, declaredRequired and envelope are each carried through as string | undefined / boolean
    | undefined and rendered with an independent !== undefined guard (declaredRequired specifically, since
    false is a legitimate carried value and must not be treated as absent).
- criterion: No field, path or status the answer did not carry is stated.
  met: true
  how: The section only renders when draft.responseFields.length > 0, the list is built by mapping draft.response_fields
    with no synthesized entries, and each optional attribute's guard means an omitted value never renders.
nodes:
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Answers only the response-fields clause of this rule's statement -- every response field the answer
    carries stated by its name, path and status, with declared_type, declared_required and envelope stated
    where carried and nothing stated the answer did not carry.
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: The ResponseFieldDisclosure type and its projection carry exactly this node's attributes -- name,
    path, status (required) and declared_type, declared_required, envelope (optional) -- and the route
    states each, the optional three only where present.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: response_fields is read as the draft's own many-valued attribute (defaulted to [] defensively,
    mirroring the status_readings convention); no other attribute of this node is touched by this task.
- node: scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
  how: Answers only the scenario's response-fields then-clause. The scenario as a whole is not demonstrable
    by this task alone, per its own Notes.
inferences:
- inferred: 'declared_required''s false value must be rendered ("declared required: no") rather than treated
    as an absent value, since the attribute is boolean and its absence is what omission (not falsity)
    represents.'
  from: domain/integration/connector-configuration-draft-response-field declares declared_required as
    an optional boolean attribute distinct from its presence; treating false as absent would silently
    drop a fact the answer carried.
- inferred: The list key for each response field is the compound `${status}:${path}:${name}`, since name
    alone is not guaranteed unique across the many response fields one draft can carry.
  from: The established convention in the same component of compounding two attributes for a key where
    single-field uniqueness isn't guaranteed (the unresolved section keys on ${item.name}:${item.reason}).
preserved:
- The existing Status readings section, its rendering, its key and its declared-as guard, untouched by
  this task's edit.
- The existing Unresolved, Generated credentials and Method mismatch sections, untouched.
- The defensive (draft.status_readings ?? []) default the sibling task installed, left exactly as delivered.
- The drafted configuration text section and its Apply control, untouched.
deferred:
- what: The reading notes section (kind, subject, and where carried, detail) that the same rule and scenario
    require.
  why: The task's own Notes name this as REMAINDER, belonging to a separate sibling task of this epic
    stating the draft's reading notes.
- what: Portuguese (pt-BR) wording for the new section's labels.
  why: Wording/localization is a separate sibling task; plain English strings are used here to match the
    established convention of the status-readings section.
---

## What it is
The statement of the drafted responseMap's provenance -- each entry beside the type, the required listing and the envelope the document declared for it.

## Notes
Build round 1 green on the first attempt, following the status-readings section's established defensive-default convention.
