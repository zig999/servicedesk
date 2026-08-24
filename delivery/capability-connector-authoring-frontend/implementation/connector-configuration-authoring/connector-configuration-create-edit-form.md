---
title: Connector Configuration create/edit screen
summary: Adds a new Connectors screen (route /connectors, reachable from the sidebar) listing every registered
  connector configuration by name, with a New action and per-row Edit action sharing one create/edit Dialog
  over PUT /v1/connectors/{connector}.
task: sha256:e09620c8389982c73c03031e884841e71d8f04be6cbba44caa99b9f6e55ec002
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-authoring-connector-configuration-create-edit-form-build
files:
- path: src/hooks/use-connector-configurations.ts
  effect: New file. useConnectorConfigurations() reads GET /v1/connectors (paginated), returning {connectorConfigurations,
    isLoading, isError, refetch}, mirroring use-capabilities.ts's own list-read convention. Exports the
    ConnectorConfiguration type (connector, configuration).
- path: src/services/connector-configuration-form-schema.ts
  effect: New file. The zod schema for the form's one react-hook-form-governed field, connector (required,
    non-empty), mirroring the backend's registerConnectorParamsSchema. configuration is deliberately absent
    — validated through the shared JSON control instead.
- path: src/hooks/use-connector-configuration-form.ts
  effect: 'New file. useConnectorConfigurationForm(existing, onSaved) — a create(null)/edit(existing)
    hook: builds react-hook-form state for connector (disabled in edit mode), tracks configuration as
    separate value+isValid state, dispatches PUT /v1/connectors/{connector} with the minified configuration
    on submit (blocked while invalid), invalidates the ["connector-configurations"] query on success,
    guards against a double dispatch via a synchronous isDispatchingRef, and resolves a ConnectorConfigurationNotWellFormedError
    save failure to its own distinct message via error-ui-state.ts.'
- path: src/routes/connector-configuration-form-fields.tsx
  effect: New file. Field markup for connector (Input, disabled while editing) and configuration (JsonTextareaField),
    with the Save button disabled while configuration is invalid.
- path: src/routes/connector-configuration-form-dialog.tsx
  effect: New file. ConnectorConfigurationFormDialog wrapping useConnectorConfigurationForm + ConnectorConfigurationFormFields,
    opened from either the screen's "New connector configuration" action or a row's "Edit" action; no
    loading/load-error phase needed since this form reads no dependent vocabulary.
- path: src/routes/connector-configurations-screen.tsx
  effect: 'New file. ConnectorConfigurationsScreen: lists every connector configuration by its connector
    name (one row each), with an unconditional "New connector configuration" action and a per-row "Edit"
    action, both opening ConnectorConfigurationFormDialog; loading/error/empty states follow capabilities-browser-screen.tsx''s
    own convention.'
- path: src/routes/route-tree.tsx
  effect: Modified. Adds connectorConfigurationsRoute (path "/connectors", component ConnectorConfigurationsScreen)
    as a new flat child of rootRoute.
- path: src/shared/components/app-shell.tsx
  effect: 'Modified. Widens SIDEBAR_ENTRIES''s `to` type union to include "/connectors", adds a fourth
    sidebar destination ({ label: "Connectors", to: "/connectors" }) after Capabilities, and adds "/connectors":
    "Connectors" to ROUTE_LABELS — criterion 1''s "reachable from the app''s navigation".'
- path: src/services/error-ui-state.ts
  effect: Modified. Adds a 19th mapped error class, ConnectorConfigurationNotWellFormedError, to UI_STATE_BY_ERROR_CODE
    (kind "connector-configuration-not-well-formed", 422-appropriate section) and the corresponding UiErrorStateKind
    union member; updates the module's own header/table-size comments to state the table's new size honestly.
criteria:
- criterion: A new route reachable from the app's navigation lists every currently registered connector
    configuration by name.
  met: true
  how: route-tree.tsx registers "/connectors" as a root-level route rendering ConnectorConfigurationsScreen,
    which reads useConnectorConfigurations() and renders one StatusTable row per configuration keyed and
    labeled by its connector name; app-shell.tsx's Sidebar links to "/connectors" as a fourth top-level
    destination, present on every screen.
- criterion: The screen offers a "New connector configuration" action that opens a form for name and configuration.
  met: true
  how: 'ConnectorConfigurationsScreen renders an unconditional "New connector configuration" Button that
    sets formTarget to { mode: "create" }, mounting ConnectorConfigurationFormDialog with useConnectorConfigurationForm(null,
    ...) — a blank form for connector and configuration.'
- criterion: Each connector configuration in the list offers an edit action that opens the same form pre-filled
    with its current name and configuration.
  met: true
  how: 'Each row''s "Edit" Button sets formTarget to { mode: "edit", connectorConfiguration }, mounting
    the identical Dialog/Fields pair with useConnectorConfigurationForm(connectorConfiguration, ...),
    whose defaultValues and configuration state pre-fill from that row''s already-loaded ConnectorConfiguration
    — no second fetch.'
- criterion: The configuration field is edited through the shared JSON beautify/minify textarea, and the
    value persisted on save is the minified JSON.
  met: true
  how: connector-configuration-form-fields.tsx renders JsonTextareaField bound to configuration's value/onChange;
    use-connector-configuration-form.ts's mutationFn sets the PUT body's configuration to getJsonTextareaMinifiedValue(configurationValue),
    and submission is blocked while configurationValid is false.
- criterion: A successful create or edit replaces whatever configuration previously answered to that name,
    and the screen reflects the current configuration afterward.
  met: true
  how: Both modes dispatch the same PUT /v1/connectors/{connector} (register-connector, create-or-replace-in-place
    by name); onSuccess invalidates ["connector-configurations"], the exact query key useConnectorConfigurations
    reads, so the screen refetches and reflects the change, and closes the dialog.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configurations.ts
  - src/services/connector-configuration-form-schema.ts
  - src/hooks/use-connector-configuration-form.ts
  how: ConnectorConfiguration carries exactly the value-object's two required attributes (connector, configuration);
    the form edits both, and connector is disabled rather than merely pre-filled in edit mode, matching
    the node's own "replacing it whole on every edit" responsibility — editing the identity would register
    a second configuration rather than replace the one at hand.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  how: useConnectorConfigurationForm's mutation dispatches PUT /v1/connectors/{connector} (register-connector)
    for both create and edit, and its onSuccess invalidates the query the registry's own list read (useConnectorConfigurations)
    is served through.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/hooks/use-connector-configuration-form.ts
  - src/services/error-ui-state.ts
  how: configuration is edited through the shared JsonTextareaField, whose onChange reports JSON-syntax
    validity; submission is blocked while invalid, and a ConnectorConfigurationNotWellFormedError refusal
    from the registry resolves to its own distinct UI-state kind and message rather than a generic one.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/hooks/use-connector-configurations.ts
  - src/hooks/use-connector-configuration-form.ts
  how: list-connector-configurations (GET /v1/connectors) and register-connector (PUT /v1/connectors/{connector})
    are the two published operations this screen calls; read-connector-configuration is not needed since
    the list read already returns every field the edit form needs.
inferences:
- inferred: The new route's path is "/connectors", its screen component is ConnectorConfigurationsScreen,
    and its sidebar label is "Connectors", positioned after Capabilities.
  from: No criterion or reference names a path, component name, or label; "/connectors" mirrors the plural-resource-name
    convention "/capabilities" and "/glossary" already establish, and positioning after Capabilities follows
    the order those two authoring surfaces were delivered in this same initiative.
- inferred: connector is disabled (not merely pre-filled) in edit mode.
  from: domain/integration/connector-configuration's own responsibility ("replacing it whole on every
    edit rather than merging into what stood before") is a replace-by-identity semantics; allowing the
    identity to change during edit would register a second configuration at a new name while leaving the
    original standing, the same reasoning already applied to concept name and capability name+version
    in sibling tasks.
- inferred: configuration is tracked as plain component state (value + isValid, reported together by JsonTextareaField's
    onChange) rather than a zod-validated react-hook-form field.
  from: 'json-textarea-field.tsx''s own established convention, already followed identically by use-capability-form.ts
    and use-concept-form.ts for the same reason: a react-hook-form field cannot express JSON-syntax validity
    on its own.'
- inferred: 'The exact wording of the one new save-failure message (connector-configuration-not-well-formed):
    "This configuration is not syntactically valid JSON."'
  from: No criterion states exact wording; the message states rules/integration/a-connector-configuration-holds-a-well-formed-object's
    own refusal in plain, technically accurate terms, mirroring the four messages already added to use-capability-form.ts
    for the same reason.
- inferred: '"New connector configuration" renders unconditionally, ahead of the loading/error/empty branches.'
  from: 'capabilities-browser-screen.tsx''s own "New capability" action establishes this precedent for
    the same reason: hiding a create action behind an unrelated read failure would block authoring for
    a reason unrelated to it.'
---

## What it is

A new screen and route (/connectors, reachable from the sidebar): list every registered connector configuration by name, create one, and edit one — its `configuration` field authored as JSON through the shared beautify/minify textarea.

## Notes

None.
