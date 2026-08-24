---
title: Proof for the capability create/edit form on the Capabilities Browser screen
summary: Two new spec files plus three realigned pre-existing ones and an extended error-ui-state.spec.ts
  prove all six of capability-create-edit-form's criteria, the new Edit-button screen shape, coverage
  for the four new error codes, and the implementation's own disclosed inferences.
implementation: sha256:8d558ab293f216ddb9c82389307b8eebf66f95791f747626e1647e4d932cc29a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-authoring-capability-create-edit-form-suite-2
tests:
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: issues PUT /v1/capabilities/{name}/{version} with the full declared contract, closes the Dialog,
    and the list shows the new capability afterward
  proves: A successful create or edit persists the capability's declared contract and the browser screen
    reflects the change afterward.
  fails_when: the mutation stops issuing PUT at the name/version path, the body omits or misshapes any
    of nature/input_schema/output_schema/timeout/connector/concept, the Dialog fails to close on success,
    or the list does not show the new capability afterward
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: issues PUT at the existing name and version with the edited contract, and the list shows the change
    afterward
  proves: A successful create or edit persists the capability's declared contract and the browser screen
    reflects the change afterward (edit path).
  fails_when: an edit stops issuing PUT at the same name/version, the edited value is missing from the
    body, the Dialog does not close, or the list does not show the updated value afterward
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows CapabilityNotReadOnlyError's own message, rather than a generic or absent one, when Nature
    is submitted as "mutating"
  proves: 'Submitting the form with a non-read-only nature does not fail silently: the registry''s refusal
    reaches the operator as a visible, specific message rather than a generic or absent one.'
  fails_when: the specific message is not shown, the generic message is shown instead, or no toast fires
    while the Dialog silently closes or stays open with no feedback
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows IncompleteCapabilityContractError's own distinct message rather than the generic fallback,
    and keeps the Dialog open
  proves: the implementation's disclosed treatment of the registry's other three named refusals the same
    way criterion 5 requires
  fails_when: this code shows the generic fallback message (or none) instead of its own message, or the
    Dialog closes on this failure
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows CapabilitySchemaNotWellFormedError's own distinct message rather than the generic fallback,
    and keeps the Dialog open
  proves: the same disclosed treatment as above, for this refusal
  fails_when: this code shows the generic fallback message (or none) instead of its own message, or the
    Dialog closes on this failure
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows ConceptAlreadyAnsweredError's own distinct message rather than the generic fallback, and
    keeps the Dialog open
  proves: the same disclosed treatment as above, for this refusal
  fails_when: this code shows the generic fallback message (or none) instead of its own message, or the
    Dialog closes on this failure
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows five mutually distinct messages, one per failure kind, when the same Save button is used
    to trigger each of the four registry refusals plus the generic fallback in turn
  proves: the implementation's disclosed inference that the four named refusal messages and the generic
    fallback are all mutually distinguishable
  fails_when: any two of the five failure kinds produce the same toast message text
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: shows the shared generic save-failure toast for a failure error-ui-state.ts does not name
  proves: an unmapped save failure still reaches the operator visibly (the generic fallback half of criterion
    5's "not absent")
  fails_when: no toast fires for an unmapped failure, or the Dialog closes despite the failure
- file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
  name: issues exactly one PUT when Save is clicked twice before the first request resolves
  proves: 'edge case: two operations against one subject at once — the save path guards against a duplicate
    dispatch'
  fails_when: two Save clicks before the first PUT resolves issue two PUT requests instead of one
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display text
  proves: input_schema and output_schema are edited through the shared JSON beautify/minify textarea,
    and the value persisted on save is the minified JSON.
  fails_when: the PUT body carries the raw or beautified display text instead of the minified JSON for
    either schema field
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: disables Save and issues no PUT while the input schema is not syntactically valid JSON
  proves: criterion 3's own presupposition — submission is blocked while a schema is invalid (rules/integration/a-capability-declares-well-formed-schemas)
  fails_when: Save is not disabled, or a PUT is issued, while the input schema text does not parse as
    JSON
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: renders concept as a combobox and offers no checkbox or other multi-select control for it
  proves: The concept field selects exactly one existing concept; the form provides no way to associate
    a capability with more than one concept at once (structural half).
  fails_when: the concept control is not a single combobox, or any checkbox renders for it
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: replaces the prior selection rather than adding to it when a second concept is chosen, so exactly
    one concept is ever persisted
  proves: the same criterion's behavioral half — choosing a second concept replaces rather than adds to
    the first
  fails_when: choosing a second concept adds to rather than replaces the first, or the persisted body
    carries more than one concept or the wrong one
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: 'renders the Concept select with no selectable option when the glossary currently holds no concepts
    (edge case: empty collection)'
  proves: edge case — an empty collection where one normally comes back; the select degrades to zero options
    rather than crashing or stalling
  fails_when: the Concept select throws, hangs, or renders a phantom option when the concept vocabulary
    is empty
- file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
  name: blocks submission and issues no PUT when no concept is selected
  proves: criterion 4's own presupposition that concept is required
  fails_when: Save issues a PUT despite no concept being selected, or no visible error is shown
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: opens a Dialog with every named field empty except nature's own read-only default, and no detail
    panel renders alongside it
  proves: The capabilities browser screen offers a "New capability" action that opens a form for name,
    version, nature, input_schema, output_schema, timeout, connector and concept, together with criterion
    2's "replacing the existing read-only detail panel".
  fails_when: any named field is missing from the New-capability form, a field starts pre-filled that
    should not be, or a detail panel (region role) still renders
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: pre-selects Nature to "read-only" rather than leaving it unselected
  proves: the implementation's disclosed inference that nature defaults to read-only in create mode
  fails_when: Nature starts unselected, or defaults to "mutating," in create mode
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: opens a Dialog whose fields already hold that row's own current values, and no detail panel renders
    alongside it
  proves: Each row offers an "Edit" action that opens the same form pre-filled with that row's current
    values, replacing the existing read-only detail panel.
  fails_when: the Edit action fails to pre-fill any field from that row's current values, or a detail
    panel still renders alongside the Dialog
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: renders Name and Version disabled while editing, so neither can be changed
  proves: the implementation's disclosed inference that name/version are disabled, not merely pre-filled,
    in edit mode
  fails_when: Name or Version is editable (not disabled) while editing an existing capability
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: opens no dialog and shows no detail panel when a row's own cell, rather than its Edit button,
    is clicked
  proves: the implementation's disclosed inference that a row itself is inert and only its own Edit action
    opens anything
  fails_when: clicking a row's own cell (rather than its Edit button) opens a dialog or shows a detail
    panel
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: shows a loading placeholder inside the Dialog before the concept vocabulary arrives
  proves: 'edge case: a dependency (the concept vocabulary) that answers slowly — the form must not race
    ahead of it'
  fails_when: the Dialog renders form fields before the concept vocabulary has resolved, instead of the
    loading placeholder
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: shows a load-failure message with a Retry action inside the Dialog when the concept vocabulary
    fails to load, and Retry re-issues that same request
  proves: 'edge case: a dependency that fails — the form degrades to a typed error state with retry rather
    than hanging or crashing'
  fails_when: the Dialog shows no failure state (or an indefinite loading state) when the concept vocabulary
    fails to load, or Retry does not re-issue the request
- file: src/routes/capabilities-browser-screen.spec.ts
  name: renders one row per capability GET /v1/capabilities returns, each showing its own name, version,
    nature, connector, concept and timeout
  proves: this task's own disclosed inference that the capabilities table gains a "Version" column now
    that the detail panel that used to show it is gone
  fails_when: a row no longer shows its own version value
- file: src/routes/capabilities-browser-screen.spec.ts
  name: renders an explicit empty-state message and no table when GET /v1/capabilities returns zero capabilities,
    still offering the New capability action
  proves: criterion 1's own disclosed inference that "New capability" renders unconditionally, even in
    the empty state
  fails_when: the "New capability" button does not render (or something else does) when the capability
    list is empty
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptAlreadyAnsweredError to the concept-already-answered state
  proves: rules/integration/one-capability-answers-one-concept's own refusal reaching a distinct UI state
  fails_when: ConceptAlreadyAnsweredError resolves to any kind other than concept-already-answered
- file: src/services/error-ui-state.spec.ts
  name: resolves IncompleteCapabilityContractError to the incomplete-capability-contract state
  proves: rules/integration/a-capability-declares-its-contract's own refusal reaching a distinct UI state
  fails_when: IncompleteCapabilityContractError resolves to any kind other than incomplete-capability-contract
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilityNotReadOnlyError to the capability-not-read-only state
  proves: the mapping half criterion 5 depends on
  fails_when: CapabilityNotReadOnlyError resolves to any kind other than capability-not-read-only, including
    the generic fallback
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state
  proves: rules/integration/a-capability-declares-well-formed-schemas's own refusal reaching a distinct
    UI state
  fails_when: CapabilitySchemaNotWellFormedError resolves to any kind other than capability-schema-not-well-formed
- file: src/services/error-ui-state.spec.ts
  name: gives each of these four newly mapped classes a kind distinct from the others and from the shared
    generic-error fallback
  proves: the structural precondition criterion 5's "specific message" depends on
  fails_when: any two of the four codes collapse onto the same kind, or any of them collapses onto generic-error
not_applicable:
- edge_case: two browser sessions creating or editing the same capability concurrently (a race between
    two register-capability calls)
  why: no node this task implements states a concurrent-conflict outcome for register-capability beyond
    the single-request refusals error-ui-state.ts already names; a test asserting a specific concurrent-conflict
    result would assert a guarantee nothing in this task's scope makes
- edge_case: a malformed (non-JSON) transport-level error response from register-capability
  why: apiFetch/ApiError's own wrapping is the shared service-layer boundary every save-failure test here
    already goes through unmocked at that layer; a raw-transport failure is that shared module's own concern,
    not this form's
untested:
- Client-side validation of Name, Version, Connector and Timeout as empty or invalid inputs (each is zod-required
  or zod-bounded in capability-form-schema.ts) is not exercised by any test in these files — only Concept's
  own required-ness (criterion 4's presupposition) is tested against a bare-empty submission.
- Whether leaving Timeout blank actually omits the field from the PUT body (so the registry's own sixty-second
  default applies) rather than sending an explicit falsy value — no test inspects the PUT body's own timeout
  key when Timeout is left blank.
- Escape-dismisses-and-returns-focus behavior for CapabilityFormDialog specifically is not exercised —
  a project-wide convention rather than something this task's own criteria state.
---

## What it is

Twenty-eight tests across two new spec files, three realigned pre-existing screen specs and an extended error-ui-state.spec.ts, proving all six of the capability create/edit form's stated criteria plus the implementation's own disclosed inferences.

## Notes

run/capability-authoring-capability-create-edit-form-suite failed at lint: three `as Record<string, unknown>` type assertions (forbidden by this project's own ESLint rule), fixed by asserting with `expect.objectContaining(...)` against the unknown value directly, matching this codebase's own existing no-cast precedent. The suite passed in full afterward (run/capability-authoring-capability-create-edit-form-suite-2), which this record's run points at.
