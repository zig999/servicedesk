---
title: A payload notes field on the shared capability form fields component
summary: Render payload_notes as a free-text control bound to the form field, inside the FormField label
  and error wrapper every other capability attribute already uses, in the one component both capability
  surfaces compose.
rationale: The rendered control is the operator-facing seam and changes for interface reasons the declarations
  and the hooks do not share, so it is cut apart from them.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
objective: An operator can read and write the capability's payload notes on the capability form component
  both the registration screen and the detail surface compose.
criteria:
- capability-form-fields renders a control bound to the form's payload_notes field.
- That control sits inside the same FormField label and error wrapper the component's other capability
  attribute fields use, with no second wrapper introduced beside it.
- The control accepts free text an operator types, and what is typed becomes the form's payload_notes
  value.
- The control accepts text spanning more than one line.
- The control presents the payload_notes value the form holds, and presents nothing where the form holds
  none.
- The control is rendered on the capability registration screen's reading of this component.
- The control is rendered on the capability detail surface's reading of this component.
depends_on:
- task/capability-payload-notes-surface/payload-notes-declared-in-the-frontend-capability-contract
implements:
- domain/integration/capability
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
---
## What it is

capability-form-fields.tsx is the single rendering component the create screen and the detail view both compose, so one field added there reaches both surfaces the scope names.
The inventory records json-textarea-field.tsx as JSON-specific, so payload notes takes a bare multi-line text control rather than that component.

## Notes

Which control carries the attribute, its label, its order and its placement are form and belong to the interface, as the governing surface rule states in its own words.

REMAINDER, from the specification -- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface's requirement that the discard act set every field, including this newly-rendered payload_notes field, to the content of the registration that read answered reaches no criterion of this task. Belongs to the task implementing the discard act over the capability detail surface (and its connector configuration sibling).
REMAINDER, from the specification -- rules/integration/a-capability-declares-its-contract's clauses on the required attributes, the timeout default, and the HTTP 422 refusal reach no criterion of this task, which renders one optional attribute's control and submits nothing. Belongs to the task implementing the capability registration submission and its refusal of an incomplete contract.
REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's clauses over the other eight declared attributes reach no criterion of this task, which renders payload_notes only. Belongs to the tasks covering those attributes on the capability detail surface's reading of this component.
ADVISORY, from the specification -- whether the form this component is handed actually holds the identity read's own answer (rather than a page of list-capabilities, a read-capability answer, or a register-capability submission's content) is decided upstream of this component and by no criterion here; the criteria as written are satisfied by binding to whatever the form carries.
