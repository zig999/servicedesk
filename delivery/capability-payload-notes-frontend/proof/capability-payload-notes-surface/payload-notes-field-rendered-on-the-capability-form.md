---
target: frontend
title: Payload notes control rendered on capability-form-fields.tsx
summary: Proves the payload_notes control renders bound to the form field inside the shared FormField
  wrapper, accepts free text (including multi-line text) that reaches the submitted value, presents the
  read answer's own content (or nothing where the answer carried none), and reaches both the registration
  and detail surfaces through the one shared component.
implementation: sha256:e591e878dcce0f7ae918f929d075d6e37e55f5145ce4e2b53e65f1b23fe5f70a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/routes/capability-form-fields-payload-notes.spec.ts
  name: CapabilityFormFields -- Payload notes renders as a control bound to the form's payload_notes field,
    inside the same FormField wrapper the other attribute fields use, reaching the registration screen
    > binds a uniquely labeled Payload notes control to the payload_notes field, with no error region
    shown absent an error
  proves: Criteria 1 (a control bound to the form's payload_notes field), 2 (the control sits inside the
    same FormField label/error wrapper the other capability attribute fields use, with no second wrapper
    introduced beside it), and 6 (the control is rendered on the capability registration screen's reading
    of this component).
  fails_when: Payload notes is not reachable as a single, uniquely labeled control whose underlying element
    name is "payload_notes" on the registration screen, or an error region (#payload_notes-error) renders
    even though no error exists on that field.
- file: src/routes/capability-form-fields-payload-notes.spec.ts
  name: CapabilityFormFields -- free text typed into Payload notes becomes the form's own payload_notes
    value, submitted through it > submits exactly the free text typed into Payload notes
  proves: The control accepts free text an operator types, and what is typed becomes the form's payload_notes
    value.
  fails_when: The free text typed into the Payload notes control is not what the form submits as payload_notes.
- file: src/routes/capability-form-fields-payload-notes.spec.ts
  name: CapabilityFormFields -- Payload notes accepts text spanning more than one line > renders a native
    multi-line textarea control for Payload notes, rather than a single-line input
  proves: The control accepts text spanning more than one line.
  fails_when: Payload notes is rendered as a single-line control rather than a native multi-line textarea.
- file: src/routes/capability-form-fields-payload-notes.spec.ts
  name: CapabilityFormFields -- Payload notes presents the value the form holds, and nothing where the
    form holds none, reaching the capability detail surface > presents the identity read's own payload_notes
    content, where the read answered with content
  proves: Half of criterion 5 (the control presents the payload_notes value the form holds) together with
    criterion 7 (the control is rendered on the capability detail surface's reading of this component).
  fails_when: The rendered Payload notes control does not show the identity read's own payload_notes content
    on the detail surface.
- file: src/routes/capability-form-fields-payload-notes.spec.ts
  name: CapabilityFormFields -- Payload notes presents the value the form holds, and nothing where the
    form holds none, reaching the capability detail surface > presents no payload_notes content, where
    the read answered with none
  proves: The other half of criterion 5 (the control presents nothing where the form holds none), together
    with criterion 7.
  fails_when: The rendered Payload notes control shows any content when the identity read's own answer
    carried none.
not_applicable:
- edge_case: A boundary at each end of a stated numeric range.
  why: payload_notes is declared z.string().optional() with no length, format or numeric constraint; no
    criterion of this task states a range for it.
- edge_case: An empty collection where one comes back.
  why: payload_notes is a single free-text field, not a collection.
- edge_case: A duplicate where uniqueness is claimed.
  why: No criterion of this task claims uniqueness over payload_notes.
- edge_case: An operation against state that forbids it.
  why: Rendering a text field carries no forbidden-state transition.
- edge_case: A dependency that fails or answers slowly.
  why: The identity read's in-flight and failed presentations are governed by a different node this task
    does not implement.
- edge_case: Two operations against one subject at once.
  why: No criterion of this task states a concurrent-edit or concurrent-submission behavior for payload_notes.
untested:
- 'domain/integration/capability: the node declares the capability aggregate root''s full set of nine
  attributes, their types, and which are required. This task renders only the payload_notes attribute''s
  editable control -- no test in this proof decides the node''s fact whole.'
- 'rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them:
  the rule''s fact spans all nine declared attributes across three presentation windows. This task''s
  own Notes record that the rule''s clauses over the other eight attributes and the two unsettled windows
  reach no criterion of this task; no test here decides the rule''s fact whole.'
run: run/capability-payload-notes-surface-payload-notes-field-rendered-on-the-capability-form-suite-4
---
## What it is

Five tests in a new spec file (capability-form-fields-payload-notes.spec.ts) prove all seven criteria of this task: bound control, shared wrapper, free-text and multi-line acceptance, read-answer presentation (present and absent), and rendering on both surfaces.

## Notes

Suite attempts -suite (lint fix), -suite-2 (cause=code, missing setValueAs + dirtyFields gate) and -suite-3 (cause=code, missing live dirty-state subscription in use-capability-form.ts) each failed and were diagnosed and fixed in the implementation record; -suite-4 passed clean. This proof's own tests are unchanged since the lint fix.
