---
title: Test-connector debug panel on the Connector Configuration editor
summary: A new Test section, rendered only in edit mode of the Connector Configuration dialog, that assembles
  a subject by hand through a registered capability naming the connector and shows the raw request sent
  and raw response received from one diagnostic POST /v1/test-connector call.
task: sha256:694e42c0cafedb2a9a74a3635e1b4c50097b09749e0eb8bed5190eab5cb7e62a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-authoring-test-connector-debug-panel-build-2
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: 'New file. useTestConnectorPanel(connector) holds all Test-section state and dispatch: filters
    the capability registry to those naming this connector as their own connector (criterion 1); tracks
    subject type, a hand-typed list of attribute-value rows, a free-text requester and a sample-input
    JSON string as plain component state; assembles and POSTs the test-connector request through apiFetch,
    and exposes the raw TestConnectorResult (request echo + discriminated response/timed-out/error outcome)
    or a dispatch-failure message resolved through error-ui-state.ts.'
- path: src/routes/connector-test-panel-fields.tsx
  effect: New file. Presentational component rendering the capability picker, the read-only input_schema
    reference for the chosen capability, the subject-type Select, the per-row attribute/value Inputs with
    Add/Remove, the Requester Input, the JsonTextareaField sample-input editor, and the Test button —
    reads every value and handler from useTestConnectorPanel's state, no logic of its own.
- path: src/routes/connector-test-panel-result.tsx
  effect: New file. Renders the raw request sent (method, address, headers, body) and the raw outcome
    received — a completed response's status/headers/body/elapsedMs, a raw timeout, or a raw error message
    — each as JSON.stringify(..., null, 2) inside <pre>, never parsed or summarized.
- path: src/routes/connector-test-panel.tsx
  effect: New file. Top-level Test-section component composing useTestConnectorPanel with the fields and
    result components above.
- path: src/routes/connector-configuration-form-dialog.tsx
  effect: Modified. Now renders ConnectorTestPanel, scoped to target.connectorConfiguration.connector,
    immediately after the existing form fields, only while target.mode === "edit"; unchanged in create
    mode and in its own create/edit submission behavior.
criteria:
- criterion: The Test section's capability picker offers only capabilities currently registered with this
    connector configuration's name as their connector.
  met: true
  how: useTestConnectorPanel's capabilityOptions filters useCapabilities()'s full list to capability.connector
    === connector before mapping to Select options; nothing outside that filtered set is ever offered.
- criterion: The Test section lets the operator pick a subject type and type that subject's attribute-values
    directly, with no list of existing subjects offered to select from.
  met: true
  how: subjectType is a Select over useGlossaryVocabularyOptions("subject-type")'s own vocabulary terms;
    attributes is a plain useState<SubjectAttributeRow[]> the operator adds to and edits by hand through
    free-text Input pairs — no read of any existing subject, and no list of one is ever fetched or offered.
- criterion: The sample input field is edited through the shared JSON beautify/minify textarea, scoped
    to the chosen capability's own input_schema.
  met: true
  how: connector-test-panel-fields.tsx renders JsonTextareaField for the editable sample input, and directly
    above it a read-only, pretty-printed rendering of the chosen capability's own input_schema, shown
    as context rather than validated against.
- criterion: 'Clicking "Test" issues the call and displays the request actually sent: method, resolved
    address, headers and body.'
  met: true
  how: onTest assembles the test-connector request and POSTs it to /v1/test-connector; the response's
    own request field (method, address, headers, body) is rendered verbatim by connector-test-panel-result.tsx's
    "Request sent" section.
- criterion: 'A completed call displays the response actually received: status, headers, body and elapsed
    time.'
  met: true
  how: connector-test-panel-result.tsx's "Response received" section, on response.kind === "response",
    renders status, elapsedMs, headers and body exactly as the backend returned them.
- criterion: A failed or timed-out call displays the raw error or timeout rather than a parsed or summarized
    result.
  met: true
  how: 'connector-test-panel-result.tsx branches on the same discriminated union: kind === "timed-out"
    renders only the elapsed time; kind === "error" renders the raw message string and elapsedMs verbatim
    — neither branch reclassifies or summarizes either outcome.'
- criterion: Nothing the Test section displays is persisted as evidence or reachable from any investigation
    screen.
  met: true
  how: The test-connector call is a useMutation with no onSuccess side effect, no queryClient.setQueryData/invalidateQueries
    call and no write to any store; its result lives only in the mutation's own in-memory state, discarded
    when the dialog closes. No investigation screen or hook in this codebase reads from useTestConnectorPanel
    or from /v1/test-connector's own response.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/routes/connector-configuration-form-dialog.tsx
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-test-panel.tsx
  how: This task consumes the value object's identity rather than authoring it — connector-configuration-form-dialog.tsx
    threads target.connectorConfiguration.connector into ConnectorTestPanel, and use-test-connector-panel.ts
    scopes the capability filter and the request body's own connector field to that same value; no new
    fact of this value object is introduced here.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  encoded_at:
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-configuration-form-dialog.tsx
  how: capabilityOptions offers only already-registered capabilities whose own connector field names this
    connector configuration (criterion 1), and the Test section is only ever mounted while target.mode
    === "edit" — i.e. only against a connector configuration that already exists, never one still being
    created.
- node: contracts/integration/connector-diagnostics
  encoded_at:
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-test-panel-fields.tsx
  - src/routes/connector-test-panel-result.tsx
  how: use-test-connector-panel.ts dispatches the one published test-connector operation (POST /v1/test-connector)
    with a subject assembled by hand (never a stored subject read back); connector-test-panel-result.tsx
    renders the raw request and raw outcome verbatim, never reclassifying a timeout or an error into anything
    else, and nothing here writes what it displays anywhere an investigation could read it back.
inferences:
- inferred: Requester is collected as a plain free-text Input, with no existing screen or component in
    this app to extend.
  from: test-connector.dto.ts's own header comment ("requester travels the same way diagnoseRequestSchema's
    own requester does — an unverified claim taken straight from the body"), and the inventory's own confirmation
    that no requester-collecting precedent exists anywhere in this app today.
- inferred: Subject attribute-value pairs are held as a plain useState<SubjectAttributeRow[]> (an "Add
    attribute" button, per-row remove, no useFieldArray), rather than a react-hook-form field array.
  from: 'contracts/integration/connector-diagnostics''s own "a subject assembled the same way any other
    observation assembles one — never a stored subject read back": this dispatch is a one-shot diagnostic
    action, not a persisted resource with its own validation lifecycle.'
- inferred: Each attribute row carries a locally generated id purely so the row list renders with a stable
    React key; the id is stripped before the wire body is built and never reaches the request.
  from: MNT-04's own rule against keying dynamic/deletable lists by array index.
- inferred: The sample-input field defaults to "{}" rather than blank, so the Test button is not gated
    behind typing something first.
  from: test-connector.dto.ts's own input field being optional, and useConnectorConfigurationForm's own
    precedent of choosing an initial validity that matches its initial value.
- inferred: A capability is picked by a composite key of ${name}@${version}, since domain/integration/capability
    identifies a capability by name and version together.
  from: use-capabilities.ts's own Capability type, which carries name and version as separate, both-required
    fields.
- inferred: A dispatch failure of the POST to /v1/test-connector itself (distinct from criterion 6's within-response
    raw error/timeout) is resolved through error-ui-state.ts's uiStateForApiError, with an empty per-kind
    message table falling back to one generic message.
  from: API-02 (every distinct failure maps through one named registry) and use-connector-configuration-form.ts's
    own saveFailureMessage precedent for the same pattern; no criterion or node states a distinct wording
    for this operation's own dispatch failure.
- inferred: The chosen capability's own input_schema is shown pretty-printed, falling back to the raw
    stored string if it somehow fails to parse.
  from: the "raw technical display" convention this task's own notes state for headers/body, applied consistently
    to this read-only reference value.
preserved:
- ConnectorConfigurationFormDialog's existing create-mode rendering (no Test section) and its existing
  edit-mode form submission, unchanged by this task.
- ConnectorConfigurationFormFields' own props and behavior (form, configuration, isEditingIdentity, isSubmitting,
  onSubmit), untouched.
- useConnectorConfigurationForm's own create/edit state machine and its PUT /v1/connectors/{connector}
  dispatch, untouched.
---

## What it is

A debug-style Test section on the Connector Configuration editor: pick a registered capability naming this connector, assemble a subject by hand, edit a sample input against that capability's input_schema, and see the raw request sent and raw response received.

## Notes

None.
