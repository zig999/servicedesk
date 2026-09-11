---
target: frontend
title: Configuration Helper offers operations as a Select, method upper-cased
summary: ConnectorConfigurationHelperFields renders the Configuration Helper's Operation field as a Select
  built from state.operations, with no free-text path or method Input remaining, and now upper-cases each
  operation's method -- in both the option label and the value used to match the selection -- before it
  is displayed or chosen from.
task: sha256:c66dac3764fc771977b8f1225b1091fe80d40c6683554dd945bc00fd3734f317
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-operation-choice-fields-build-2
files:
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Replaces the two free-text Operation path/method Inputs with one Select whose options are derived
    one-for-one from state.operations, wrapped in the same Label shape connector-test-panel-fields.tsx
    and capability-form-fields.tsx already use for Select. operationSelectValue(entry) -- used both to
    build each option's value and to derive the selected value from state.path/state.method -- now upper-cases
    entry.method before composing the value, and the option label interpolates operation.method.toUpperCase()
    rather than the raw field, so a document's own lower-case path-item spelling ("get") is never what
    is displayed or matched against; onOperationSelected finds the matching operations entry by that value
    and calls state.onChooseOperation(chosen). Where state.operations is empty, operationOptions is empty
    and no path or method can be supplied through the component. The link Input and the Request Draft
    button are unchanged and still rendered on the same surface.
criteria:
- criterion: The component renders a Select whose options are the entries the state offers, one option
    per entry.
  met: true
  how: operationOptions maps state.operations 1:1 into SelectOption entries and is passed as the Select's
    options prop.
- criterion: An option's label states both the entry's path and the entry's method.
  met: true
  how: Each option's label is `${operation.path} — ${operation.method.toUpperCase()}`, stating both the
    path and the method -- the method upper-cased regardless of the case the fetched document's path-item
    key used.
- criterion: Choosing an option calls the state's operation choice with that entry.
  met: true
  how: onOperationSelected resolves the selected value back to the matching entry in state.operations
    (matched by the same upper-cased operationSelectValue) and calls state.onChooseOperation(chosen) with
    that entry.
- criterion: The component renders no input accepting typed text for an operation path.
  met: true
  how: The former Operation path Input and its onPathChange handler are removed; nothing in the rendered
    tree accepts typed path text.
- criterion: The component renders no input accepting typed text for an operation method.
  met: true
  how: The former Operation method Input and its onMethodChange handler are removed; nothing in the rendered
    tree accepts typed method text.
- criterion: Where the state offers no entries, no path or method value can be supplied through the component
    at all.
  met: true
  how: An empty state.operations produces an empty operationOptions array, leaving the Select with nothing
    selectable and no free-text fallback.
- criterion: The OpenAPI document link field and the draft request control remain rendered on the same
    surface as before.
  met: true
  how: The link Input (bound to state.link/state.onLinkChange) and the Request Draft Button (state.onRequestDraft,
    disabled while state.outcome.kind === "pending") are untouched and still render in the same layout.
- criterion: connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts
    build their hand-written state literal from the state shape this task leaves, and both suites pass.
  met: true
  how: The component reads only fields already on ConnectorConfigurationHelperState (operations, path,
    method, onChooseOperation) supplied by the sibling state task; no new field is introduced by this
    file, so the specs' hand-built literals need no shape change from this edit.
nodes:
- node: domain/integration/openapi-operation
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: An operation's path and method are disclosed together in the option label, and the method is upper-cased
    there -- matching the node's own description ("its HTTP method upper-cased") rather than showing the
    document's raw path-item key case.
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: state.operations (the fetched document's full operations listing) is rendered whole as the Select's
    options, one option per entry, with no paging or filtering.
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: The operator can only choose one of the pairs the Select lists (built from state.operations); no
    free-text path or method field exists to type a pair the document never declared, and the chosen entry
    is handed to state.onChooseOperation unchanged.
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: operationSelectValue and the option label both call .toUpperCase() on operation.method, so an operation
    the Configuration Helper lists states its method upper-cased whatever case the fetched document's
    own path-item key named it under. This is the corrective fix for the diagnosed defect (option label
    previously interpolated the raw, possibly lower-case, method verbatim).
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: The component still renders the link field and the operation choice beneath the same surface, and
    the Request Draft control unchanged; this task only touches the operation field and does not reach
    the register-connector-call clause (REMAINDER in the task's own notes, answered by the already-delivered
    draft-request task).
preserved:
- The OpenAPI document link Input and its onLinkChange wiring.
- The Request Draft Button, its disabled-while-pending behavior, and onRequestDraft wiring.
- The disclosure rendering below the fields (pending/refused/drafted branches via disclosureStateForOutcome),
  including the drafted sub-render (ConnectorConfigurationDraftDisclosure) with its Apply button, unresolved
  list, generated-credentials list and method-mismatch section -- none of this was touched.
deferred:
- what: What the surface discloses to the operator when the fetched document is read successfully but
    declares no operations at all.
  why: ADVISORY in the task's own notes -- no candidate states this; the criterion only holds that no
    path/method value can be supplied in that case, which the empty-options Select already satisfies.
- what: Three composition-level spec files -- connector-configuration-form-fields-configuration-helper.spec.ts,
    connector-configuration-form-fields-apply-confirmation.spec.ts, and connector-configuration-create-screen-apply-draft.spec.ts
    -- drive the helper by fireEvent.change on screen.getByLabelText("Operation path") and ("Operation
    method"), controls this task's criteria require the component to stop rendering. None is named by
    this task's own criterion 8; rewriting them is outside this task's named files.
  why: 'This task''s criteria and the specification rule it implements (never by typing a path or a method)
    leave no version of this component that both satisfies the criteria and keeps those three suites''
    typed-input flow green; a failure-diagnostician confirmed all 19 resulting failures are cause: test,
    falsified by this delivery''s own correct behavior, and named the owning proof-only re-delivery as
    the human''s to invoke.'
---

## What it is

See summary and files above.

## Notes

See inferences, deferred and nodes above.
