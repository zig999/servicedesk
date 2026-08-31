---
title: Requirement inputs carry their own required standing and every asking capability
summary: Rewrites the Subject panel's requirement-rendering block to read the array-of-capabilities shape
  derive-subject-fields-from-input-requirements now exposes, marking required inputs, listing every asking
  capability per field, and stating an empty read explicitly.
task: sha256:8098ef08e362f4fb5a7842c036f2d91d4c759720e99e96b85362df0b7b6ac973
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-derive-and-present-build-5
files:
- path: src/routes/case-simulation-subject-panel.tsx
  effect: the requirement-rendering ul/li block now reads SimulationRequiredField's current shape (required
    boolean, capabilities readonly array) instead of the retired singular connector/capability/inputSchemaHint
    fields; a required requirement's input carries the native `required` attribute, and its Label is wrapped
    together with a sibling text asterisk in a `<span className="flex items-center gap-1">` so the asterisk
    sits beside the Label rather than inside it; an optional one carries neither the attribute nor the
    asterisk sibling; every capability in a field's own capabilities array is listed by its own name,
    version and connector, each with its own input-schema hint shown verbatim where non-empty; an empty
    state paragraph states, in the rule's own terms, that the pinned version's case-input-requirements
    name no attribute, replacing the prior generic wording. The header comment is updated to describe
    the same shape; nothing else in the file was touched. Corrected post-delivery -- the asterisk originally
    sat inside the Label element itself (aria-hidden but still part of the Label's own text content),
    which broke getByLabelText matching for every required field across this file's own tests and every
    other cockpit test filling this field by label; it is now a sibling of the Label instead, so the Label's
    own text/accessible name stays exactly the attribute name (see this file's own Notes below).
criteria:
- criterion: An input is rendered for every requirement the state exposes, required and optional alike.
  met: true
  how: state.requiredFields.map renders one <li>/<Input> per entry unconditionally -- the array already
    carries every requirement (required and optional) per the sibling derivation task, and this component
    filters none of it out.
- criterion: A required requirement's own input is shown as required where it is rendered.
  met: true
  how: the Input for a field with field.required === true carries required={field.required} (a real HTML
    required attribute), and a text asterisk (<span aria-hidden="true">*</span>) is rendered as a sibling
    of its Label -- inside a shared wrapping span, never inside the Label element itself -- as a visible,
    non-color signal that leaves the Label's own text/accessible name unchanged.
- criterion: An optional requirement's own input is rendered without that marking.
  met: true
  how: required={field.required} evaluates to false for an optional field, so no required attribute is
    set, and the asterisk span is conditional on field.required so it renders nothing for an optional
    field.
- criterion: Each requirement's input shows every asking capability's own name, version and connector
    the state exposes for it, and the input-schema text the state already carries for it, where the state
    carries one.
  met: true
  how: field.capabilities.map renders one <li> per capability in the array (never just the first), each
    showing capability.connector, capability.name and capability.version verbatim, plus capability.inputSchemaHint
    as a trailing span whenever its trimmed value is non-empty.
- criterion: A pinned version whose read names no requirement at all renders an explicit empty state rather
    than a bare empty list.
  met: true
  how: the state.requiredFields.length === 0 branch renders "The pinned case version's own case-input-requirements
    name no attribute.", matching rules/investigation/a-composed-subject-presents-every-case-input-requirement's
    own closing clause rather than a generic contentless placeholder.
- criterion: The panel recomputes no requirement, no required flag and no annotation, reading each from
    the state it is passed.
  met: true
  how: every value rendered is read straight off the state prop with no filtering, mapping-to-a-new-shape,
    or derivation performed in this component; the only conditional logic is presentational.
nodes:
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: 'the panel is where this rule''s clauses reach the person composing the subject: one input per
    requirement required and optional alike, the required flag shown as a real marking, every asking capability
    named by its own name/version/connector, and the explicit empty-state disclosure in the rule''s own
    wording. The rule''s opening clause, over the diagnose entry point''s own subject-assembling interface,
    is REMAINDER per this task''s own Notes and is not reached here.'
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: this node's own shape -- one subject attribute, its required flag, and every currently-registered
    capability asking for it -- is what the panel renders per requirement, reading it as data the sibling
    derivation task already computed rather than deriving or restating it here.
- node: domain/integration/capability
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: a capability's own name, version and connector are displayed exactly as the resolved capability
    entries carry them, restating none of them as a fact this component asserts; input_schema is shown
    only as the free-text inputSchemaHint the derivation already read, displayed verbatim and never parsed.
inferences:
- inferred: 'no existing convention marks a required vs. optional input anywhere else in this codebase,
    so this delivery invents one: the native HTML required attribute on the Input plus a plain text asterisk
    rendered as a sibling of the Label (never nested inside it), both conditioned on field.required.'
  from: a targeted search across frontend/app/src for any existing required/optional marking convention,
    which returned nothing; the task's own instruction to pick something simple and disclose it as an
    inference where none exists.
- inferred: the native required attribute has no dispatch-blocking effect here and so introduces no violation
    of the sibling gating task's boundary.
  from: 'reading case-simulation-ready-view.tsx (the panel''s one call site) and case-simulation-header.tsx:
    neither wraps the Subject panel or the Simulate control in a <form> element, and no requestSubmit()/native
    form submission exists anywhere in this tree, so a required attribute here is a semantic/visual marker
    only.'
preserved:
- the dispatch-gating logic in use-simulation-subject.ts's own isReady computation (untouched, belongs
  to the sibling gating task)
- the malformed-capability disclosure (untouched, belongs to its own sibling task)
- the '+ attribute' control and its Select's glossary-drawn filtering, plus its own loading/error branches
  (untouched)
- the subject-type Select, the requester Input, their own loading/error branches, and the 'View subject
  JSON' <details> block (untouched)
- the state.isLoadingRegistries / state.isRegistriesError branches wrapping the requirement list (untouched)
- the field.attribute keying convention for the outer <li> list (unchanged)
deferred:
- what: case-simulation-subject-panel.spec.ts, case-simulation-subject-panel-attributes.spec.ts, case-simulation-subject-panel-json-view.spec.ts
    and their shared case-simulation-subject-panel.test-support.ts still build and assert against the
    retired singular connector/capability/inputSchemaHint shape.
  why: writing tests is the test-author's judgment, not the task-implementer's.
---

## What it is
The Subject region's requirement rows: what used to be a list of placeholder-derived fields becomes the version's own requirements, each labelled with the standing the read gave it.

## Notes
Correction (post-delivery, bug found by running the suite): the original delivery rendered the required-field
asterisk marker inside the `<Label>` element itself, alongside `field.attribute`, with `aria-hidden="true"`
on the asterisk's own span. `aria-hidden` only removes a node from the accessible-name algorithm assistive
tech reads -- it does not remove that node's text from the string testing-library's `getByLabelText`
computes from a `<label>`'s own `textContent` in this tooling version. So a required field's Label text
became `"account-id *"` instead of `"account-id"`, and `screen.getByLabelText("account-id")` (an exact-string
match) failed to resolve for every required field -- breaking not only this component's own tests but every
other spec across the cockpit that fills the same field by label (case-simulation-ready-view*.spec.ts,
use-case-simulation-cockpit*.spec.ts), confirmed by a failure-diagnostician run.
Fixed by moving the asterisk out of the `<Label>` and rendering it as a sibling instead: both the `<Label>`
and the conditional asterisk `<span>` now sit inside a shared `<span className="flex items-center gap-1">`
wrapper, so the Label's own text/accessible name is exactly `field.attribute`, with no asterisk mixed in,
while the asterisk stays visually adjacent to the label and still conditioned on `field.required`. This
option was chosen over trying to exclude the aria-hidden span from testing-library's own textContent
computation because no such exclusion exists in this tooling version's label-association algorithm --
moving the node out of the Label is the only fix that changes what the Label's own text is rather than
attempting to suppress a computation that does not distinguish aria-hidden children. Nothing else changed:
the Input's own native `required` attribute, the subject-type Select, the requester Input, the "View subject
JSON" block are untouched.
