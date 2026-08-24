---
title: Capability, concept and connector authoring — frontend
summary: 'What four passes found over the 5 delivered frontend tasks: the shared JSON beautify/minify
  textarea, capability create/edit, concept create/edit, the new Connector Configurations screen, and
  its Test-connector debug panel.'
reviewed:
- src/hooks/use-capability-form.ts
- src/hooks/use-concept-form.ts
- src/hooks/use-connector-configuration-form.ts
- src/hooks/use-connector-configurations.ts
- src/hooks/use-test-connector-panel.ts
- src/routes/capabilities-browser-screen-capability-form-save.spec.ts
- src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
- src/routes/capabilities-browser-screen-detail.spec.ts
- src/routes/capabilities-browser-screen.spec.ts
- src/routes/capabilities-browser-screen.tsx
- src/routes/capability-form-dialog.tsx
- src/routes/capability-form-fields.tsx
- src/routes/concept-form-dialog.tsx
- src/routes/concept-form-fields.tsx
- src/routes/connector-configuration-form-dialog.tsx
- src/routes/connector-configuration-form-fields.tsx
- src/routes/connector-configurations-screen-form-save.spec.ts
- src/routes/connector-configurations-screen-form.spec.ts
- src/routes/connector-configurations-screen.spec.ts
- src/routes/connector-configurations-screen.tsx
- src/routes/connector-test-panel-capability-picker.spec.ts
- src/routes/connector-test-panel-dispatch-safety.spec.ts
- src/routes/connector-test-panel-fields.tsx
- src/routes/connector-test-panel-request-response.spec.ts
- src/routes/connector-test-panel-result.tsx
- src/routes/connector-test-panel-sample-input.spec.ts
- src/routes/connector-test-panel-subject-and-attributes.spec.ts
- src/routes/connector-test-panel.tsx
- src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
- src/routes/glossary-browser-screen-concept-form-save.spec.ts
- src/routes/glossary-browser-screen-concept-form.spec.ts
- src/routes/glossary-browser-screen.tsx
- src/routes/route-tree.spec.ts
- src/routes/route-tree.tsx
- src/services/capability-form-schema.ts
- src/services/concept-form-schema.ts
- src/services/connector-configuration-form-schema.ts
- src/services/error-ui-state.spec.ts
- src/services/error-ui-state.ts
- src/shared/components/app-shell.spec.ts
- src/shared/components/app-shell.tsx
- src/shared/components/json-textarea-field.spec.ts
- src/shared/components/json-textarea-field.tsx
tasks:
- task/capability-authoring/json-textarea-editor
- task/capability-authoring/capability-create-edit-form
- task/concept-authoring/concept-create-edit-form
- task/connector-configuration-authoring/connector-configuration-create-edit-form
- task/connector-configuration-authoring/test-connector-debug-panel
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/capability-connector-authoring-frontend) passed every step in full (install,
    typecheck, lint, style, build, a11y, secret-scan, test — 446 tests, 0 failures), so there was no failure
    to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: A "Beautify" control reformats the control's current text as indented, pretty-printed JSON
    without changing what the text means as data.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: reformats compact JSON as two-space indented, pretty-printed text that parses back to the exact
      same data (Beautify)
- criterion: Entering syntactically invalid JSON shows an inline error message next to the control.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: shows an inline error message linked to the control when the current text does not parse as
      JSON
  - file: src/shared/components/json-textarea-field.spec.ts
    name: shows no inline error message while the current text is valid JSON
  - file: src/shared/components/json-textarea-field.spec.ts
    name: shows the inline error message for a freshly empty field, with no untouched grace period
  - file: src/shared/components/json-textarea-field.spec.ts
    name: carries the JSON parser's own diagnostic in the inline error text, rather than one fixed sentence,
      for different malformed input
  - file: src/shared/components/json-textarea-field.spec.ts
    name: marks the newly typed text invalid, rather than passing it through as acceptable, when it does
      not parse as JSON
  why: the DOM-visible-error half is exercised only against a static, already-invalid value prop; the
    typing half only checks the onChange callback's reported validity, never re-asserting that the alert
    then renders for that same typed text
- criterion: While the control's current text is invalid JSON, the value it reports upward is marked invalid
    rather than silently passed on as if it were acceptable.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: marks the newly typed text invalid, rather than passing it through as acceptable, when it does
      not parse as JSON
  - file: src/shared/components/json-textarea-field.spec.ts
    name: reports newly typed text together with true when it parses as valid JSON
- criterion: The value the control hands to its caller for submission is the same JSON minified — whitespace,
    tabs and other insignificant characters stripped — regardless of how the text is currently displayed.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: strips insignificant whitespace from indented, pretty-printed text
  - file: src/shared/components/json-textarea-field.spec.ts
    name: returns the same minified string for the same data whether the text is currently shown compact
      or pretty-printed
  - file: src/shared/components/json-textarea-field.spec.ts
    name: returns null for text that is not syntactically valid JSON
  - file: src/shared/components/json-textarea-field.spec.ts
    name: returns null for an empty string, rather than treating absent text as valid JSON
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display
      text
  - file: src/routes/connector-configurations-screen-form-save.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for the configuration field
- criterion: The control's props (value, onChange, validity) are the same for every field that embeds
    it, so a second and third consumer wire it without re-implementing its parsing or formatting.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: operates independently across two field instances sharing the same props shape, so editing one
      never reports through the other's onChange
  - file: src/routes/connector-configurations-screen-form.spec.ts
    name: offers a Beautify control beside the configuration field, the shared control's own signature
      affordance
  - file: src/routes/connector-test-panel-sample-input.spec.ts
    name: renders a Beautify control beside the Sample input field, the shared control's own signature
      affordance
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display
      text
  why: no test asserts the props type itself is identical across call sites; coverage rests on each consumer
    independently exhibiting the shared component's signature behavior, which would fail if a consumer
    stopped using the shared control or re-implemented it differently
- criterion: The capabilities browser screen offers a "New capability" action that opens a form for name,
    version, nature, input_schema, output_schema, timeout, connector and concept.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: opens a Dialog with every named field empty except nature's own read-only default, and no detail
      panel renders alongside it
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: pre-selects Nature to "read-only" rather than leaving it unselected (disclosed inference)
- criterion: Each row in the capabilities browser screen offers an "Edit" action that opens the same form
    pre-filled with that row's current values, replacing the existing read-only detail panel.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: opens a Dialog whose fields already hold that row's own current values, and no detail panel
      renders alongside it
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: opens no dialog and shows no detail panel when a row's own cell, rather than its Edit button,
      is clicked
  - file: src/routes/capabilities-browser-screen.spec.ts
    name: renders one row per capability GET /v1/capabilities returns, each showing its own name, version,
      nature, connector, concept and timeout
- criterion: input_schema and output_schema are edited through the shared JSON beautify/minify textarea,
    and the value persisted on save is the minified JSON.
  state: partial
  tests:
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display
      text
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: disables Save and issues no PUT while the input schema is not syntactically valid JSON
  why: nothing in this task's own test set asserts that the Input schema / Output schema fields render
    the shared control's own signature affordance (a Beautify button) the way connector-configurations-screen-form.spec.ts
    and connector-test-panel-sample-input.spec.ts do for their own JSON fields; only the persisted-minified-value
    half and the invalid-blocks-save presupposition are exercised
- criterion: The concept field selects exactly one existing concept; the form provides no way to associate
    a capability with more than one concept at once.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: renders concept as a combobox and offers no checkbox or other multi-select control for it
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: replaces the prior selection rather than adding to it when a second concept is chosen, so exactly
      one concept is ever persisted
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: 'renders the Concept select with no selectable option when the glossary currently holds no concepts
      (edge case: empty collection)'
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: blocks submission and issues no PUT when no concept is selected
- criterion: 'Submitting the form with a non-read-only nature does not fail silently: the registry''s
    refusal reaches the operator as a visible, specific message rather than a generic or absent one.'
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
    name: shows CapabilityNotReadOnlyError's own message, rather than a generic or absent one, when Nature
      is submitted as "mutating"
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityNotReadOnlyError to the capability-not-read-only state
- criterion: A successful create or edit persists the capability's declared contract and the browser screen
    reflects the change afterward.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
    name: issues PUT /v1/capabilities/{name}/{version} with the full declared contract, closes the Dialog,
      and the list shows the new capability afterward
  - file: src/routes/capabilities-browser-screen-capability-form-save.spec.ts
    name: issues PUT at the existing name and version with the edited contract, and the list shows the
      change afterward
- criterion: The Concepts tab offers a "New concept" action that opens a form for name, accepts and ttl.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form.spec.ts
    name: opens a Dialog with an empty, enabled name field, an unchecked accepts checkbox per subject
      type, and an empty ttl field
- criterion: Each concept in the Concepts tab offers an edit action that opens the same form pre-filled
    with that concept's current name, accepts and ttl.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form.spec.ts
    name: opens a Dialog whose name, accepts and ttl fields already hold that row's own current values
- criterion: The accepts field lets the operator select more than one subject type and persists exactly
    the selected set, no more and no fewer.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
    name: submits every checked subject type, in the order each was checked, when more than one is selected
  - file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
    name: drops exactly the subject type that is unchecked, keeping the rest of an existing concept's
      own selection intact
- criterion: Submitting the form with no subject type selected in accepts is blocked, accepts being a
    required field.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
    name: blocks submission and issues no PUT when no subject type is selected, showing the accepts group's
      own error
- criterion: A successful create or edit registers the concept at the given name, and the Concepts tab
    reflects the change afterward.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
    name: issues PUT /v1/glossary/concepts/{name} at the typed name, closes the Dialog, and the Concepts
      tab shows the new concept afterward
  - file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
    name: issues PUT /v1/glossary/concepts/{name} at the existing name with the edited accepts and ttl,
      and the Concepts tab shows the change afterward
- criterion: A new route reachable from the app's navigation lists every currently registered connector
    configuration by name.
  state: covered
  tests:
  - file: src/routes/route-tree.spec.ts
    name: renders the /connectors route through ConnectorConfigurationsScreen
  - file: src/shared/components/app-shell.spec.ts
    name: lists a Connectors entry linking to /connectors
  - file: src/routes/connector-configurations-screen.spec.ts
    name: renders one row per connector configuration GET /v1/connectors returns, each showing its own
      connector name
  - file: src/routes/connector-configurations-screen.spec.ts
    name: renders no row for a connector configuration GET /v1/connectors does not return
- criterion: The screen offers a "New connector configuration" action that opens a form for name and configuration.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-form.spec.ts
    name: opens a Dialog titled for a new connector configuration, with connector empty and enabled
  - file: src/routes/connector-configurations-screen-form.spec.ts
    name: renders the configuration field empty through the shared Configuration control
- criterion: Each connector configuration in the list offers an edit action that opens the same form pre-filled
    with its current name and configuration.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-form.spec.ts
    name: opens a Dialog whose connector and configuration fields already hold that row's own current
      values
- criterion: The configuration field is edited through the shared JSON beautify/minify textarea, and the
    value persisted on save is the minified JSON.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-form.spec.ts
    name: offers a Beautify control beside the configuration field, the shared control's own signature
      affordance
  - file: src/routes/connector-configurations-screen-form-save.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for the configuration field
  - file: src/routes/connector-configurations-screen-form-save.spec.ts
    name: disables Save and issues no PUT while the configuration is not syntactically valid JSON
- criterion: A successful create or edit replaces whatever configuration previously answered to that name,
    and the screen reflects the current configuration afterward.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-form-save.spec.ts
    name: issues PUT /v1/connectors/{connector}, closes the Dialog, and the list shows the new configuration
      afterward
  - file: src/routes/connector-configurations-screen-form-save.spec.ts
    name: issues PUT at the existing connector name with the edited configuration, and the list shows
      the change afterward
- criterion: The Test section's capability picker offers only capabilities currently registered with this
    connector configuration's name as their connector.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: offers the matching capability and omits one registered against a different connector
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: 'offers no option at all once the read resolves, when no capability currently names this connector
      (edge case: empty match)'
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: 'shows an alert rather than silently offering no options when the capabilities read itself fails
      (edge case: a dependency that fails)'
- criterion: The Test section lets the operator pick a subject type and type that subject's attribute-values
    directly, with no list of existing subjects offered to select from.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: offers exactly the subject-type vocabulary's own current terms as options, once the read resolves
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: lets the operator add an attribute row and type its own attribute name and value
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: issues no network request beyond the panel's own two dependent reads while a subject is assembled
      by hand
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: renders the attribute-value row as plain text inputs, not a combobox offering existing subjects
      to pick from
- criterion: The sample input field is edited through the shared JSON beautify/minify textarea, scoped
    to the chosen capability's own input_schema.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-sample-input.spec.ts
    name: renders a Beautify control beside the Sample input field, the shared control's own signature
      affordance
  - file: src/routes/connector-test-panel-sample-input.spec.ts
    name: reflects whatever the operator types into the Sample input field
  - file: src/routes/connector-test-panel-sample-input.spec.ts
    name: shows the chosen capability's own input_schema, pretty-printed, as a read-only reference
  - file: src/routes/connector-test-panel-sample-input.spec.ts
    name: falls back to the raw stored text for an input_schema that is not itself valid JSON (disclosed
      inference)
- criterion: 'Clicking "Test" issues the call and displays the request actually sent: method, resolved
    address, headers and body.'
  state: covered
  tests:
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the method, resolved address, headers and body exactly as the response echoed them back
- criterion: 'A completed call displays the response actually received: status, headers, body and elapsed
    time.'
  state: covered
  tests:
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the status, elapsed time, headers and body exactly as the response carried them
- criterion: A failed or timed-out call displays the raw error or timeout rather than a parsed or summarized
    result.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows only the elapsed time for a timed-out call, with no status or body rendered as though
      a response had arrived
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the raw error message and elapsed time verbatim, with no status or body rendered as though
      a response had arrived
- criterion: Nothing the Test section displays is persisted as evidence or reachable from any investigation
    screen.
  state: partial
  tests:
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: issues no further read of the connectors, capabilities or subject-type vocabulary after a completed
      test call
  why: the 'reachable from any investigation screen' half is entirely unexercised — no investigation screen
    is mounted anywhere in this test set to confirm the completed call's request/response never surfaces
    there; the 'not persisted as evidence' half is only indirectly touched by asserting the call count
    stays at 1 for a few already-known paths, never a total-call-count assertion or a check that no separate
    write to an evidence-storing endpoint occurred
findings:
- pass: conformance
  file: src/services/capability-form-schema.ts
  where: line 46, the CAPABILITY_NATURES constant declaration
  evidence: export const CAPABILITY_NATURES = ["read-only", "mutating"] as const;
  cost: 'domain/integration/capability-nature''s own enumeration ("read-only", "mutating") now exists
    independently in a third place (this constant, alongside the backend''s own CAPABILITY_NATURES the
    file''s own comment names) rather than being read from the node it is copied from. The values feed
    capability-form-fields.tsx''s NATURE_OPTIONS Select directly, so if the node''s enumeration ever changed,
    correcting the node would not correct this constant: the Select would keep offering exactly these
    two values, silently diverging from what the domain model states, with nothing here to notice the
    drift.'
  correction: Remove the hardcoded array and source the nature options the same way this app already sources
    domain/glossary/subject-type's own vocabulary (through a fetched vocabulary read) wherever such a
    read exists, or otherwise make this constant the one place the enumeration is declared for the whole
    app rather than a second copy of a value the backend already restates.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: line 100, inside the CapabilityFormFields component body, just above the return
  cites: API-01
  evidence: "const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({\n  value:\
    \ concept.name,\n  label: concept.name,\n}));"
  cost: the shape adaptation from what use-concept-options.ts returns ({name, accepts}) to what TUI's
    Select requires ({value, label}) is assembled at the point of use inside the component's own render
    body rather than through a named function, unlike every sibling in this same file set — use-glossary-vocabulary.ts's
    useGlossaryVocabularyOptions and use-test-connector-panel.ts's capabilityOptions both perform the
    identical kind of transform inside the hook, and capabilities-browser-screen.tsx/glossary-browser-screen.tsx/connector-configurations-screen.tsx
    all route theirs through a named toRow/toConceptRow function. A second consumer of conceptOptions
    needing the same {value,label} shape has nowhere to find this transform and re-derives it by hand.
  correction: move the mapping into use-capability-form.ts (or a named adapter function reused from there),
    the same way useGlossaryVocabularyOptions already returns SelectOption[] directly rather than leaving
    the shape conversion to the component that renders it.
---

## What it is

Coverage, specification-conformance and standard-conformance passes over the 5 delivered frontend tasks (json-textarea-editor, capability-create-edit-form, concept-create-edit-form, connector-configuration-create-edit-form, test-connector-debug-panel); the failures pass did not run (the captured suite passed in full).

## Notes

The trace shows 15 code-drift bindings over 7 frontend files, all pre-existing from earlier deliveries in this same session (e.g. glossary-browser-screen.tsx and app-shell.tsx carried forward from the frontend-bootstrap initiative, error-ui-state.ts restamped repeatedly as each of the three authoring tasks added its own entries) — none of it is new drift this review's own file set introduces beyond what each task's own delivery already restamped for its own nodes.
