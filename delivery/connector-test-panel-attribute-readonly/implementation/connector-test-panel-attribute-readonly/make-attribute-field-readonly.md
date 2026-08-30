---
title: Make the connector Test Panel's Attribute field read-only
summary: ConnectorTestPanelFields now renders each Add attribute row's Attribute field as a disabled,
  read-only Input carrying no onChange, while the Value field stays exactly as editable as before.
task: sha256:fd29b19cd9aec3bc4cc4e5fba6dd3ec3fdb7889e88458d407a576663547b557d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-attribute-readonly-make-attribute-field-readonly-build
files:
- path: src/routes/connector-test-panel-fields.tsx
  effect: Removed the onChange handler from each attribute row's Attribute Input and added disabled readOnly,
    so the operator can no longer type over the name useTestConnectorPanel's reconciliation already assigned
    to row.attribute; the value prop stays wired so the field still displays that name. The Value field
    is untouched -- still a plain, editable Input calling state.onAttributeChange(row.id, "value", event.target.value).
    Extended the file's header comment to record the new fixed-field convention and cite the specification
    clause it answers.
criteria:
- criterion: Each attribute row's Attribute field is rendered non-editable (disabled or read-only), while
    its Value field remains an editable Input exactly as before.
  met: true
  how: The Attribute Input now carries both disabled and readOnly; the Value Input's markup and onChange
    are unchanged from before this task.
- criterion: An attribute row's Attribute field still displays the row's current attribute name (the same
    text useTestConnectorPanel's reconciliation already assigns it), rather than an empty or blank control.
  met: true
  how: value={row.attribute} is kept on the Attribute Input exactly as it was; only the onChange handler
    was removed and the disabled/readOnly attributes added, so the control still renders the reconciled
    name.
- criterion: Typing into the Attribute field's control has no effect on the row's attribute name -- only
    onAttributeChange(row.id, "value", ...) can still change the row, never the attribute name through
    the UI.
  met: true
  how: The Attribute Input has no onChange prop at all (not merely a disabled one still wired), so no
    UI interaction with it can call onAttributeChange with field "attribute". The Value Input remains
    the only field wired to onAttributeChange, and only with field "value".
- criterion: Existing tests covering Add attribute's reconciliation behavior (connector-test-panel-subject-and-attributes.spec.ts,
    connector-test-panel-capability-picker.spec.ts, connector-test-panel.test-support.ts's fillTestPanelBasics
    helper) keep passing, updated only as needed for the Attribute field's own control now being read-only
    rather than asserting anything about the reconciliation logic itself.
  met: true
  how: Read all three files in full before writing. None of their assertions types into the Attribute
    field expecting its value to change -- every assertion reads attributeInput.value (via getByLabelText,
    which resolves regardless of disabled/readOnly) after "Add attribute" reconciles it, or fires a Value-field
    change instead. fillTestPanelBasics's own fireEvent.change on the Attribute input is already documented
    there as "a no-op rewrite of that same name rather than the naming of a fresh row"; with no onChange
    wired, that fireEvent.change dispatches against a control with no listener and changes nothing, so
    it stays the no-op the helper's own comment already describes. No edits were needed to any of the
    three files.
nodes:
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/routes/connector-test-panel-fields.tsx
  how: 'Answered only in its placeholder clause, per this task''s own REMAINDER note: a placeholder naming
    a Subject attribute is ${subject:<attribute-name>}, with the attribute name as its argument -- exactly
    the derived, governed text the Attribute field now displays read-only rather than lets the operator
    retype. Every other clause of this rule is unreached by this task, as the task''s own Notes already
    state; none is a condition over the Test Panel''s Attribute control -- that behavior belongs to the
    backend act assembling and issuing the HTTP connector''s call.'
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/routes/connector-test-panel-fields.tsx
  how: Each row still pairs one governed attribute name with one free value (row.attribute, row.value);
    this task changes only which control renders the attribute half, not the shape of the pair itself.
- node: domain/glossary/subject-attribute
  encoded_at:
  - src/routes/connector-test-panel-fields.tsx
  how: The Attribute field's text is the attribute name governed by this vocabulary, unchanged in content
    -- the fix only makes the control that displays it non-editable rather than altering what it shows
    or where that name comes from.
inferences:
- inferred: Used disabled readOnly on a plain TUI Input (rather than, e.g., aria-readonly alone, or a
    non-input presentational element) to satisfy "non-editable (disabled or read-only)".
  from: This app's own established convention for exactly this situation -- a fixed, derived-value field
    paired with an editable sibling field -- already exists at hypothesis-revision-form-fields.tsx:106
    (Input value={subjectType} disabled readOnly for the read-only "Subject type (from draft, fixed)"
    field beside the editable "Hypothesis name" field). Reused verbatim rather than inventing a new pattern.
- inferred: Removed the onChange prop from the Attribute Input entirely, instead of keeping it wired to
    onAttributeChange(row.id, "attribute", ...) behind the disabled attribute.
  from: Criterion 3's own wording ("never the attribute name through the UI") reads as a statement about
    what the control can do, not only about what a mouse/keyboard user can trigger through it; a still-wired
    onChange remains reachable by a programmatically dispatched change event even on a disabled input,
    so removing the handler is what actually makes typing into the control have no effect under every
    way the criterion could be exercised.
preserved:
- The Value field's editable Input and its onAttributeChange(row.id, "value", ...) wiring -- criterion
  1 requires it stay editable exactly as before, and it is untouched by this change.
- useTestConnectorPanel's onAddAttribute reconciliation logic (deriving/merging attribute rows from Configuration's
  ${subject:<name>} placeholders) -- out of scope for this frontend-fields-only corrective task.
- The Capability, Subject type, Requester fields and the input-schema read-only reference display -- unrelated
  to this task's objective, left exactly as they were.
deferred:
- what: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary (whether the read-only field's
    displayed name must itself be a glossary-held attribute name).
  why: Per this task's own UNDERDETERMINED note, no criterion here holds the reconciled text to a glossary-held
    name, and the caller already settled this by leaving that rule uncovered by this epic (which holds
    no other task to scope it to). Not this task's to widen into.
- what: The remaining clauses of rules/integration/an-http-connector-configuration-declares-its-call (required
    method/responseMap/statusMap and its malformed-configuration ending; the address/query/headers/body
    shape refusals; the requester and credential placeholder forms; the incomplete-descriptor and unresolvable-placeholder
    unavailable endings).
  why: Per this task's own REMAINDER note, none of these is a condition over the Test Panel's Attribute
    control -- they belong to the backend act that assembles and issues the HTTP connector's call, not
    this frontend task or this epic's surface work.
---

## What it is
ConnectorTestPanelFields' Attribute Input, per attribute row, loses its onChange handler and gains disabled/readOnly, so the operator can only read the attribute name useTestConnectorPanel's reconciliation already assigned; the Value Input beside it is untouched.

## Notes
None.
