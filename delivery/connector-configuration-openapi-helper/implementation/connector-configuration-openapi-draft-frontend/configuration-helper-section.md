---
target: frontend
title: Configuration Helper section beneath the Configuration field
summary: Adds an inline Configuration Helper offer (document-link, path and method
  controls, and a non-submitting Request Draft control) to the shared ConnectorConfigurationFormFields
  component, reused unchanged by both the create screen and the ready detail view.
task: sha256:df6b3df8ecbfaf94757262bf6702b9dfd303233b5da134f60f1da6c90d5e5e56
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-configuration-helper-section-build
files:
- path: src/hooks/use-connector-configuration-helper.ts
  effect: New hook holding the section's own local link/path/method state and composing
    the sibling useDraftConnectorConfigurationFromOpenApi(connector) hook into one
    onRequestDraft dispatcher; exposes link/path/method plus their setters, onRequestDraft
    and outcome as ConnectorConfigurationHelperState.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: New presentational component rendering the three labeled controls (OpenAPI
    document link, Operation path, Operation method) and a type="button" Request Draft
    control, entirely driven by the hook's state; the button is disabled only while
    outcome.kind === 'pending'.
- path: src/routes/connector-configuration-helper.tsx
  effect: New wrapper component composing useConnectorConfigurationHelper and ConnectorConfigurationHelperFields
    under a Configuration Helper heading (h3, styled like the existing ConnectorTestPanel's
    Test heading), the single unit embedded into the shared form.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Now renders <ConnectorConfigurationHelper connector={watch("connector")}
    /> inside its own <form>, directly beneath the JsonTextareaField (Configuration)
    and above the ButtonFooter; destructures watch from the existing form return alongside
    register and formState.
criteria:
- criterion: On the connector configuration create screen, the Configuration Helper
    section is rendered beneath the Configuration field.
  met: true
  how: ConnectorConfigurationCreateScreen composes ConnectorConfigurationFormFields
    unchanged, and that shared component now renders ConnectorConfigurationHelper
    immediately after the Configuration JsonTextareaField, so the create screen renders
    it there too.
- criterion: On the ready detail view of a registered connector configuration, the
    Configuration Helper section is rendered beneath the Configuration field.
  met: true
  how: ConnectorConfigurationDetailReadyView also composes ConnectorConfigurationFormFields
    unchanged (as a sibling of the separate ConnectorTestPanel), so the same beneath-Configuration
    placement applies there.
- criterion: The section is rendered inline within the same form that holds the Configuration
    field, on no screen of its own and in no dialog of its own.
  met: true
  how: ConnectorConfigurationHelper is a plain div tree with no route, no Dialog and
    no portal; it is placed textually inside ConnectorConfigurationFormFields' own
    <form onSubmit={onSubmit}> element, between the Configuration field and the ButtonFooter.
- criterion: The section offers a control in which the operator states the OpenAPI
    document link.
  met: true
  how: connector-configuration-helper-fields.tsx renders a labeled Input (OpenAPI
    document link) bound to state.link/state.onLinkChange.
- criterion: The section offers controls in which the operator names one operation
    of that document by its path and its HTTP method.
  met: true
  how: The same component renders two further labeled Inputs, Operation path and Operation
    method, bound to state.path/state.onPathChange and state.method/state.onMethodChange
    respectively.
- criterion: The section offers a control whose act dispatches the draft request with
    the stated link and named operation.
  met: true
  how: The Request Draft Button's onClick calls state.onRequestDraft, which the hook
    wires to requestDraft({ link, path, method }) from useDraftConnectorConfigurationFromOpenApi(connector).
- criterion: Nothing the section offers submits the surface's form or invokes its
    save path, so requesting a draft leaves every registered connector configuration
    exactly as it stood.
  met: true
  how: The Request Draft Button is type="button" (never type="submit"), so a click
    never fires the surrounding <form>'s onSubmit; its handler calls only the sibling
    hook's own POST mutation, never the save mutation ConnectorConfigurationFormFields'
    onSubmit prop drives.
- criterion: The Connector field, the Configuration field and the form's existing
    action footer remain present and reachable by their existing labels on both screens.
  met: true
  how: Neither the Connector FormField, the Configuration JsonTextareaField, nor the
    ButtonFooter (role="group", aria-label="Actions") were touched; the new section
    is inserted as an additional sibling between the two fields' existing tree and
    the footer, without altering their labels, ids, or the footer's own contents.
nodes:
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/hooks/use-connector-configuration-helper.ts
  how: The invariant's beneath-its-Configuration-field placement and issues-no-register-connector-call
    both hold structurally -- the section is composed inline in the one shared form
    component both authoring surfaces already use, and its only dispatching control
    is a type="button" that calls the sibling draft hook's own mutation, never the
    save mutation.
- node: contracts/integration/connector-configuration-draft
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: The section's Request Draft control dispatches the published draft-connector-configuration-from-openapi
    operation through the already-delivered useDraftConnectorConfigurationFromOpenApi(connector)
    hook, passing the operator-stated link, path and method; the section reads that
    hook's outcome only to disable the control while a request is pending, and renders
    nothing else from it -- presenting the drafted answer or its refusal is the disclosure
    task's own job.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  how: No file this task wrote issues any request to an operator-supplied document
    URL; the link the operator states is only ever carried as a JSON field on the
    existing sibling hook's POST, which the backend resolves.
- node: domain/integration/connector-configuration
  how: The section's own controls (link, path, method) are new, section-local state
    and never restate the connector-configuration value object's two attributes; the
    Connector input keeps registering into the shared RHF field and the Configuration
    field keeps owning ConfigurationFieldState exactly as before.
preserved:
- The Connector input's existing registration (register("connector")), its disabled/aria-invalid/aria-describedby
  wiring, and its "Connector" label.
- The Configuration field's existing JsonTextareaField wiring (id="configuration",
  its value/onChange/disabled props) and its "Configuration" label.
- The ButtonFooter's role="group" aria-label="Actions" markup and its existing Save
  button plus each screen's own trailingActions.
- The <form onSubmit={onSubmit}> element's own submit wiring, untouched by the new
  section.
- ConnectorTestPanel's separate placement (rendered as a sibling before ConnectorConfigurationFormFields
  on the detail ready view), left unchanged.
deferred:
- what: Rendering an answered draft or a refused draft request (the outcome's drafted
    and refusal variants) from useDraftConnectorConfigurationFromOpenApi/useConnectorConfigurationHelper.
  why: The task's own Notes route rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
    (and presenting a drafted answer) to the disclosure task; this task only offers
    the controls and reads outcome.kind to gate the button while pending.
- what: Applying a drafted configuration into the Configuration field, and the unsaved-edit
    confirmation before doing so.
  why: The task's own Notes route rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
    and rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation,
    with their scenario, to the apply and confirmation tasks.
---

## What it is

The operator's way in to the helper, on the one surface they already author or edit a connector configuration from.

## Notes

None.
