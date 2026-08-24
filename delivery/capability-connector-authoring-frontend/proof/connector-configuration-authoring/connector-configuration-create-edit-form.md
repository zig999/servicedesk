---
title: Connector configuration create/edit screen proof
summary: Three new spec files plus a shared test-support module, and targeted extensions to three pre-existing
  spec files (error-ui-state.spec.ts, app-shell.spec.ts, route-tree.spec.ts), prove all five of connector-configuration-create-edit-form's
  criteria and the implementation's own disclosed inferences; the row-Edit no-second-fetch test is now
  scoped to the connector-configurations list path itself, so it stays true once a sibling Test-panel
  section reads its own unrelated paths inside the same dialog.
implementation: sha256:8eccafdc5253a79349ce8f520b6540ff7ff1eac6a6900f91caabf4d3106fe38b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-authoring-connector-configuration-create-edit-form-suite-2
tests:
- file: src/routes/connector-configurations-screen.spec.ts
  name: renders one row per connector configuration GET /v1/connectors returns, each showing its own connector
    name
  proves: A new route reachable from the app's navigation lists every currently registered connector configuration
    by name.
  fails_when: a row is missing, duplicated, or fails to show its own connector's name
- file: src/routes/connector-configurations-screen.spec.ts
  name: renders no row for a connector configuration GET /v1/connectors does not return
  proves: the listing shows exactly the connector configurations the backend currently returns, no more
  fails_when: a row renders for a connector configuration GET /v1/connectors never returned
- file: src/routes/connector-configurations-screen.spec.ts
  name: shows a loading placeholder before GET /v1/connectors responds
  proves: 'edge case: a dependency that has not yet answered'
  fails_when: the loading text is absent while the request is still pending, or a table renders before
    data arrives
- file: src/routes/connector-configurations-screen.spec.ts
  name: shows a generic load-failure message with a Retry action when GET /v1/connectors fails
  proves: 'edge case: a dependency that fails — the screen degrades to a typed error state offering a
    retry'
  fails_when: no failure message or no Retry control appears when the request fails, or a table renders
    anyway
- file: src/routes/connector-configurations-screen.spec.ts
  name: re-issues GET /v1/connectors when Retry is clicked, rendering the configurations once that retry
    succeeds
  proves: Retry actually re-issues the failed read rather than only changing what is displayed
  fails_when: clicking Retry issues no new request, or the list never renders once the retried request
    succeeds
- file: src/routes/connector-configurations-screen.spec.ts
  name: renders an explicit empty-state message and no table when GET /v1/connectors returns zero configurations
  proves: 'edge case: an empty collection where one comes back'
  fails_when: the empty-state message is missing, or a table (even an empty one) renders instead
- file: src/routes/connector-configurations-screen.spec.ts
  name: offers the New connector configuration action while the list is still loading
  proves: the disclosed inference that "New connector configuration" renders unconditionally, ahead of
    the loading/error/empty branches
  fails_when: the New connector configuration button is absent while the list is still loading
- file: src/routes/connector-configurations-screen.spec.ts
  name: offers the New connector configuration action after the list fails to load
  proves: the same disclosed inference, over the load-error state
  fails_when: the New connector configuration button is absent after the list fails to load
- file: src/routes/connector-configurations-screen.spec.ts
  name: offers the New connector configuration action, as the one button rendered, when the list is empty
  proves: the same disclosed inference, over the empty-list state
  fails_when: the New connector configuration button is absent when the list is empty, or a second, unexpected
    button renders instead
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: opens a Dialog titled for a new connector configuration, with connector empty and enabled
  proves: The screen offers a "New connector configuration" action that opens a form for name and configuration.
  fails_when: clicking the action opens no Dialog, the Dialog's title does not read "New connector configuration",
    or the connector field starts non-empty or disabled
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: renders the configuration field empty through the shared Configuration control
  proves: the same criterion's configuration-field half
  fails_when: the configuration field starts non-empty, or the New action does not open the shared Configuration
    control at all
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: opens a Dialog whose connector and configuration fields already hold that row's own current values
  proves: Each connector configuration in the list offers an edit action that opens the same form pre-filled
    with its current name and configuration.
  fails_when: clicking Edit opens no Dialog, the Dialog's title omits that row's own connector name, or
    either field fails to pre-fill with that row's own current value
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: issues no second network request beyond the initial GET /v1/connectors when a row's own Edit action
    is opened
  proves: opening Edit pre-fills from the already-loaded row rather than issuing a second fetch to the
    connector-configurations list path
  fails_when: opening the Edit dialog causes the connector-configurations list path (CONNECTORS_PATH)
    itself to be fetched more than the one time the initial listing already made, counted independently
    of however many other, unrelated paths a sibling Test-section mounted inside the dialog may legitimately
    read
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: renders the connector field disabled while editing, so its identity cannot be changed
  proves: the disclosed inference that connector is disabled (not merely pre-filled) in edit mode
  fails_when: the connector field is editable while editing an existing connector configuration
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: leaves the connector field enabled while creating, unlike the edit-mode case above
  proves: the same disclosed inference's contrasting create-mode half
  fails_when: the connector field starts disabled while creating a new connector configuration
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: offers a Beautify control beside the configuration field, the shared control's own signature affordance
  proves: The configuration field is edited through the shared JSON beautify/minify textarea (the shared-control
    half).
  fails_when: no Beautify control renders beside the configuration field, evidencing a bespoke textarea
    rather than the shared control
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: blocks submission and issues no PUT when connector is left blank
  proves: connector-configuration-form-schema.ts's own required-connector rule actually blocks submission
  fails_when: Save issues a PUT despite a blank connector, or no visible error is shown
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: issues PUT /v1/connectors/{connector}, closes the Dialog, and the list shows the new configuration
    afterward
  proves: A successful create or edit replaces whatever configuration previously answered to that name,
    and the screen reflects the current configuration afterward (create path).
  fails_when: the mutation stops issuing PUT at the connector path, the Dialog fails to close on success,
    or the list does not show the new configuration afterward
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: issues PUT at the existing connector name with the edited configuration, and the list shows the
    change afterward
  proves: the same criterion's edit path
  fails_when: an edit stops issuing PUT at the same connector name, the PUT body omits the edited configuration,
    the Dialog does not close, or the list does not show the updated value afterward
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: persists JSON.stringify(JSON.parse(text)) for the configuration field
  proves: the value persisted on save is the minified JSON.
  fails_when: the PUT body carries the raw or beautified display text instead of the minified JSON for
    the configuration field
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: disables Save and issues no PUT while the configuration is not syntactically valid JSON
  proves: submission is blocked while the configuration does not parse, presupposed by criterion 4's "the
    value persisted on save is the minified JSON"
  fails_when: Save is not disabled, or a PUT is issued, while the configuration text does not parse as
    JSON
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: disables Save by default when the New connector configuration form first opens, since a blank
    field is not valid JSON either
  proves: the same presupposition holds at the form's very first render, not only after a user edits the
    field
  fails_when: Save starts enabled on a freshly opened, blank New connector configuration form
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: shows ConnectorConfigurationNotWellFormedError's own message, distinguishable from the generic
    fallback, and keeps the Dialog open
  proves: the disclosed inference that the exact wording of the one new save-failure message resolves
    to its own distinct UI-state kind and message rather than a generic one
  fails_when: the specific message is not shown, the generic message is shown instead, or the Dialog closes
    on this failure
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: shows the shared generic save-failure toast for a failure error-ui-state.ts does not name
  proves: an unmapped save failure still reaches the operator visibly rather than failing silently
  fails_when: no toast fires for an unmapped failure, or the Dialog closes despite the failure
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: issues exactly one PUT when Save is clicked twice before the first request resolves
  proves: 'edge case: two operations against one subject at once — use-connector-configuration-form.ts''s
    own isDispatchingRef guard'
  fails_when: two Save clicks before the first PUT resolves issue two PUT requests instead of one
- file: src/services/error-ui-state.spec.ts
  name: resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed
    state, not the shared generic-error fallback
  proves: rules/integration/a-connector-configuration-holds-a-well-formed-object's own refusal reaching
    a distinct UI state
  fails_when: ConnectorConfigurationNotWellFormedError resolves to any kind other than connector-configuration-not-well-formed,
    including the generic fallback
- file: src/shared/components/app-shell.spec.ts
  name: lists exactly the four sidebar entries Cases, Glossary, Capabilities and Connectors, with no Hypotheses
    entry
  proves: A new route reachable from the app's navigation (the navigation half of criterion 1).
  fails_when: the sidebar lists anything other than exactly Cases, Glossary, Capabilities, Connectors
    in that order, or lists a Hypotheses entry
- file: src/shared/components/app-shell.spec.ts
  name: lists a Connectors entry linking to /connectors
  proves: the same navigation half of criterion 1, specifically that the Connectors entry links to the
    new route's own path
  fails_when: no Connectors link renders in the sidebar, or it links anywhere other than /connectors
- file: src/routes/route-tree.spec.ts
  name: registers a route at each of the thirteen proposal-plus-origination screens' paths, and no other
  proves: the new route this task's files list declares is actually registered, at exactly "/connectors"
    and nowhere else
  fails_when: '"/connectors" is missing from the router''s registered paths, or the router registers a
    path this task''s own criteria do not call for'
- file: src/routes/route-tree.spec.ts
  name: renders the /connectors route through ConnectorConfigurationsScreen
  proves: the /connectors route's own registered component is ConnectorConfigurationsScreen
  fails_when: the /connectors route's own registered component is anything other than ConnectorConfigurationsScreen
not_applicable:
- edge_case: two browser sessions creating or editing the same connector configuration concurrently (a
    race between two register-connector calls)
  why: no node this task implements states a concurrent-conflict outcome for register-connector beyond
    the single-request refusals error-ui-state.ts already names
- edge_case: a dependency (a second vocabulary read) that fails or answers slowly while the create/edit
    form is open
  why: unlike capability's concept select, this form reads no dependent vocabulary at all — confirmed
    by reading connector-configuration-form-dialog.tsx and use-connector-configuration-form.ts in full
- edge_case: a boundary at each end of a stated numeric range
  why: neither field this form edits (connector, configuration) carries a declared numeric range
- edge_case: a duplicate connector name submitted at create
  why: criterion 5 itself states that creating or editing at a name already answered to replaces that
    configuration in place; the edit-path test already exercises exactly this replace-by-name behavior
- edge_case: a malformed (non-JSON) transport-level error response from register-connector
  why: apiFetch/ApiError's own wrapping is the shared service-layer boundary every save-failure test here
    already goes through unmocked at that layer
- edge_case: opening Edit on a persisted configuration whose text is not valid JSON
  why: the registry refuses to persist a configuration whose text is not syntactically valid JSON, so
    every currently registered connector configuration this screen can open for editing is already well-formed
    by construction
untested:
- Whether a connector name containing characters requiring URL-encoding (e.g. a slash or a space) round-trips
  correctly through PUT /v1/connectors/{connector} is not exercised — every fixture here uses a plain
  kebab-case name.
- Escape-dismisses-and-returns-focus behavior for ConnectorConfigurationFormDialog specifically is not
  exercised — a project-wide convention rather than something this task's own criteria state.
- Whether GET /v1/connectors reads more than its first page is not exercised — useConnectorConfigurations()
  deliberately reads only the first page, mirroring the same untested gap already disclosed for the sibling
  use-capabilities.ts.
---

## What it is

Twenty-nine tests across three new spec files, a shared test-support module, and targeted extensions to error-ui-state.spec.ts, app-shell.spec.ts and route-tree.spec.ts, proving the Connector Configurations screen's five stated criteria plus the implementation's own disclosed inferences.

## Notes

Proof-only re-delivery: the implementation stands unchanged (same digest as before). Task/connector-configuration-authoring/test-connector-debug-panel's own legitimate delivery mounted a Test section inside this screen's own edit-mode Dialog, and that section issues its own two additional reads (capabilities, subject-type vocabulary) when the dialog opens — falsifying the prior proof's total-fetch-call-count assertion on the row-Edit no-second-fetch test. That one test now scopes its assertion to the connector-configurations list path itself (via a new callsToPath test-support helper), which is what this task's own criterion 3 actually requires; no other test in this delivery's file set made the same now-invalid assumption.
