---
title: Proof for the Test-connector debug panel on the Connector Configuration editor
summary: Six new spec files (plus one shared test-support module) proving all seven of this task's criteria,
  its own disclosed inferences, the explicit edit-mode-only fact, and the edge cases its two dependent
  reads and its one-shot dispatch raise.
implementation: sha256:97938be2ba01af559f0b5f8e034ee8683c72a90725129c07a9d12d4afe92872f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-authoring-test-connector-debug-panel-suite-5
tests:
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: offers the matching capability and omits one registered against a different connector
  proves: The Test section's capability picker offers only capabilities currently registered with this
    connector configuration's name as their connector.
  fails_when: capabilityOptions stops filtering by capability.connector === connector, so a capability
    naming a different connector is offered too
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: 'offers no option at all once the read resolves, when no capability currently names this connector
    (edge case: empty match)'
  proves: criterion 1's own empty-collection edge case — filtering to nothing renders an empty picker
    rather than falling back to the unfiltered list
  fails_when: the picker falls back to offering every capability (or throws) once the filtered set is
    empty
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: keys capability options by name and version together, offering two capabilities that share a name
    as distinct, independently selectable options (composite-key inference)
  proves: the implementation's disclosed inference that a capability is picked by the composite key ${name}@${version}
  fails_when: the picker keys or resolves selection by name alone, so choosing the second, same-named
    capability shows the first one's own input_schema (or the two collapse into one option)
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: 'shows an alert rather than silently offering no options when the capabilities read itself fails
    (edge case: a dependency that fails)'
  proves: the edge case of the capability picker's own dependent read failing
  fails_when: the failure alert stops rendering, or the picker renders as though the read had simply returned
    no capabilities
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: renders no Test section, and issues no read for it, while creating a new connector configuration
  proves: the implementation's own stated fact that the Test section renders only in edit mode, never
    in create mode, and mounts no dependent read while absent
  fails_when: ConnectorTestPanel (or either of its own two reads) renders during create mode
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: offers exactly the subject-type vocabulary's own current terms as options, once the read resolves
  proves: The Test section lets the operator pick a subject type — the subject-type Select is sourced
    from the glossary vocabulary, not a fixed or hand-rolled list
  fails_when: the Subject type options stop matching the subject-type vocabulary's own current terms,
    in order or in membership
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: lets the operator add an attribute row and type its own attribute name and value
  proves: The Test section lets the operator ... type that subject's attribute-values directly
  fails_when: Add attribute stops appending an editable row, or typing into its Attribute/Value inputs
    stops updating their own displayed value
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: removes exactly the row whose own Remove action was clicked, leaving the other rows' own values
    intact (stable-row-identity inference)
  proves: the implementation's disclosed inference that each row carries a locally generated id used to
    key and target it, rather than being addressed by array index
  fails_when: removing the middle row corrupts or swaps a surviving row's own attribute/value (the index-based-key
    failure mode MNT-04 and this inference exist to avoid)
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: issues no network request beyond the panel's own two dependent reads while a subject is assembled
    by hand
  proves: with no list of existing subjects offered to select from — assembling attribute rows by hand
    triggers no read of any subject-listing source
  fails_when: adding a row or typing into it triggers any additional network request (e.g. a lookup against
    an existing-subjects endpoint)
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: renders the attribute-value row as plain text inputs, not a combobox offering existing subjects
    to pick from
  proves: criterion 2's own '...directly, with no list of existing subjects offered to select from' —
    structurally, not just by absence of a network call
  fails_when: the Value field becomes a combobox/select rather than a plain text input
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: renders Requester as a plain text input, and reflects whatever the operator types into it
  proves: the implementation's disclosed inference that requester is collected as a plain free-text Input,
    with no existing screen or component to extend
  fails_when: Requester stops being a plain text input, or typing into it stops updating its own displayed
    value
- file: src/routes/connector-test-panel-sample-input.spec.ts
  name: renders a Beautify control beside the Sample input field, the shared control's own signature affordance
  proves: The sample input field is edited through the shared JSON beautify/minify textarea
  fails_when: the Sample input field stops being rendered through JsonTextareaField (loses its Beautify
    control)
- file: src/routes/connector-test-panel-sample-input.spec.ts
  name: reflects whatever the operator types into the Sample input field
  proves: the sample input field is an editable control, not a static or read-only display
  fails_when: typing into Sample input stops updating its own displayed value
- file: src/routes/connector-test-panel-sample-input.spec.ts
  name: shows the chosen capability's own input_schema, pretty-printed, as a read-only reference
  proves: the sample input field is ... scoped to the chosen capability's own input_schema
  fails_when: selecting a capability stops showing (or shows the wrong) input_schema reference
- file: src/routes/connector-test-panel-sample-input.spec.ts
  name: falls back to the raw stored text for an input_schema that is not itself valid JSON (disclosed
    inference)
  proves: the implementation's disclosed inference that a capability's own input_schema is shown pretty-printed,
    falling back to the raw stored string if it fails to parse
  fails_when: an unparsable input_schema renders blank, throws, or is silently dropped instead of showing
    the raw stored text
- file: src/routes/connector-test-panel-sample-input.spec.ts
  name: starts the Sample input field at "{}" rather than blank, before any capability is even selected
  proves: the implementation's disclosed inference that the sample input field defaults to "{}" rather
    than blank
  fails_when: Sample input starts blank (or otherwise not at a valid default) rather than "{}"
- file: src/routes/connector-test-panel-request-response.spec.ts
  name: shows the method, resolved address, headers and body exactly as the response echoed them back
  proves: 'Clicking "Test" issues the call and displays the request actually sent: method, resolved address,
    headers and body.'
  fails_when: any one of method, address, headers or body stops being rendered verbatim from the response's
    own request echo
- file: src/routes/connector-test-panel-request-response.spec.ts
  name: shows the status, elapsed time, headers and body exactly as the response carried them
  proves: 'A completed call displays the response actually received: status, headers, body and elapsed
    time.'
  fails_when: any one of status, elapsed time, headers or body stops being rendered verbatim from a completed
    response
- file: src/routes/connector-test-panel-request-response.spec.ts
  name: shows only the elapsed time for a timed-out call, with no status or body rendered as though a
    response had arrived
  proves: A failed or timed-out call displays the raw error or timeout rather than a parsed or summarized
    result — the timed-out half
  fails_when: a timeout stops rendering its own message, or is reclassified/rendered with a fabricated
    status/body
- file: src/routes/connector-test-panel-request-response.spec.ts
  name: shows the raw error message and elapsed time verbatim, with no status or body rendered as though
    a response had arrived
  proves: A failed or timed-out call displays the raw error or timeout rather than a parsed or summarized
    result — the raw-error half
  fails_when: the raw error message stops rendering verbatim, or is reclassified/summarized, or is rendered
    with a fabricated status/body
- file: src/routes/connector-test-panel-dispatch-safety.spec.ts
  name: issues no further read of the connectors, capabilities or subject-type vocabulary after a completed
    test call
  proves: Nothing the Test section displays is persisted as evidence or reachable from any investigation
    screen — the no-invalidation, no-cache-write half, observable as no refetch of any listing
  fails_when: a completed test call triggers a refetch/invalidation of the connector configurations, capabilities
    or subject-type reads (which a write into a shared cache or store would cause)
- file: src/routes/connector-test-panel-dispatch-safety.spec.ts
  name: shows the fixed generic dispatch-failure message rather than the backend's own raw error text,
    even for a mapped error code
  proves: the implementation's disclosed inference that a dispatch failure of the POST itself resolves
    through error-ui-state.ts's central mapping with an empty per-kind table, always falling back to one
    generic message
  fails_when: the raw backend message is shown instead, or a distinct per-kind wording appears where the
    table holds none
- file: src/routes/connector-test-panel-dispatch-safety.spec.ts
  name: renders the Test button disabled, and issues no call, before any field has been filled
  proves: the edge case of an operation attempted against a state that forbids it — Test cannot be dispatched
    before its own required fields are filled
  fails_when: the Test button is enabled, or a POST /v1/test-connector call is recorded, before every
    required field is filled
- file: src/routes/connector-test-panel-dispatch-safety.spec.ts
  name: issues only one POST /v1/test-connector call when Test is clicked twice before the first call
    settles
  proves: the edge case of two operations against one subject at once — clicking Test twice before the
    first dispatch settles issues only one call
  fails_when: a second POST /v1/test-connector call is recorded before the first one resolves
not_applicable:
- edge_case: a duplicate attribute name typed across two rows
  why: no criterion or bound node states a uniqueness constraint over attribute names within one hand-typed
    subject, and the backend's own subjectAttributeValueSchema places none on this route either
- edge_case: submitting the JSON textarea's Beautify control on a currently-invalid sample input
  why: this behavior belongs to json-textarea-editor's own shared control and is proven by its own spec
    (json-textarea-field.spec.ts); re-testing Beautify's own internals here would test a unit this task
    did not write
untested:
- the second half of criterion 7 — 'reachable from any investigation screen' — is a totality over the
  rest of the codebase that no test in this file set can establish by running the reviewed files alone;
  supported by the implementation record's own disclosed check that no such consumer exists today, and
  by this task's own files list creating no such path.
- that the Test section's state resets when the dialog is closed and reopened is not proven by a running
  test here — the in-memory-only, no-cache-write half of criterion 7 is instead proven through the no-invalidation
  test above.
- the exact wire body POST /v1/test-connector is dispatched with is not asserted directly — every test
  here observes the response's own echoed request and outcome, which is what criteria 4-6 actually require
  rendered verbatim.
---

## What it is

Twenty-three tests across five new spec files proving the Test-connector debug panel's seven stated criteria plus the implementation's own disclosed inferences.

## Notes

run/connector-configuration-authoring-test-connector-debug-panel-suite failed at typecheck (a tuple-typing mismatch in a new test-support helper, the same class already fixed once earlier this session; fixed as test infrastructure).
run/connector-configuration-authoring-test-connector-debug-panel-suite-2 failed at test: 2 failures — one a mechanical query-scoping bug in this task's own new Beautify test (cause: test, fixed here), the other a stale assertion in a sibling task's own test invalidated by this delivery's own legitimate two additional reads (cause: test, on a test an earlier task owns).
run/connector-configuration-authoring-test-connector-debug-panel-suite-3 failed at lint (testing-library/no-node-access on the Beautify fix's own `.parentElement` access; fixed with a getAllByRole index-based query instead).
run/connector-configuration-authoring-test-connector-debug-panel-suite-4 failed at test: 1 failure — the sibling task's own stale assertion, unresolved until its own proof-only re-delivery landed (task/connector-configuration-authoring/connector-configuration-create-edit-form, reconciled separately, committed before this run).
run/connector-configuration-authoring-test-connector-debug-panel-suite-5 passed in full, with the sibling's proof-only re-delivery already landed.
