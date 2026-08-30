---
title: Proof for the routed connector configuration create screen
summary: Tests over ConnectorConfigurationCreateScreen prove its routing, its reuse of the shared form-fields
  component and create/edit hook, its dispatch/refusal guards, its post-save navigation, and its Back
  link and absent test panel -- including the well-formed-object guard, corrected after this proof's own
  tests first caught the gap.
implementation: sha256:38969e4da77f0805021649e50698ad9a6e460b9779966717c45fd9e2d2f7cb56
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-connector-configuration-create-screen-suite-3
tests:
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- routing (criteria 1 and 2) > renders the create screen's
    own content when navigating to /connectors/new
  proves: Navigating to "/connectors/new" renders the connector configuration create screen inside the
    app shell.
  fails_when: the "/connectors/new" route stops resolving to ConnectorConfigurationCreateScreen, or that
    screen stops rendering its own "New connector configuration" heading.
- file: src/routes/route-tree.spec.ts
  name: route-tree > renders the /connectors/new route through ConnectorConfigurationCreateScreen, distinct
    from the /connectors/$connector route's own component
  proves: Navigating to "/connectors/new" renders the connector configuration create screen inside the
    app shell.
  fails_when: route-tree.tsx stops registering "/connectors/new" against ConnectorConfigurationCreateScreen,
    or assigns it the same component as "/connectors/$connector".
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- routing (criteria 1 and 2) > does not render the connector
    configuration detail screen for a connector named 'new'
  proves: Navigating to "/connectors/new" does not render the connector configuration detail screen for
    a connector named "new".
  fails_when: navigating to "/connectors/new" resolves to the dynamic "/connectors/$connector" pattern
    instead of the static one.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- the connector field is editable (criterion 3) > renders
    the Connector input without the disabled attribute
  proves: The create screen's connector field is editable rather than disabled.
  fails_when: the Connector input renders with the disabled attribute set.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- composes the shared form-fields component (criterion 4)
    > links the Connector field's validation error through aria-describedby, exactly as ConnectorConfigurationFormFields'
    own FormField renders it
  proves: The create screen composes the existing connector-configuration form-fields component rather
    than a second copy of that markup.
  fails_when: submitting with a blank connector name does not surface the schema's own validation message
    linked through aria-invalid/aria-describedby="connector-error".
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- the shared create/edit hook's own create-mode default (criterion
    5) > disables Save by default when the screen first mounts, since a blank configuration is not valid
    JSON either
  proves: The create screen's form state comes from the existing connector-configuration create/edit hook
    opened in create mode rather than from a second hook re-deriving that state.
  fails_when: Save is not disabled on first mount.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- dispatches register-connector under the typed name (criterion
    6) > issues PUT /v1/connectors/{connector} with the typed connector name and the entered configuration
  proves: Saving from the create screen dispatches the registry's register-connector request under the
    connector name typed into the form.
  fails_when: no PUT is issued, it is issued at a different path than the typed connector name, or its
    body is not the parsed/minified configuration.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- blocks dispatch while the connector name is empty (criterion
    7) > issues no PUT when Save is clicked with the connector name left blank
  proves: The create screen does not dispatch a registration while the connector name is empty.
  fails_when: a PUT is issued despite the connector name being left blank.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- does not refuse a present, non-empty connector name (criterion
    8) > dispatches with no validation error for a single-character connector name
  proves: The create screen does not refuse a connector name that is present and non-empty.
  fails_when: a present, non-empty connector name is refused by client-side validation, or the dispatch
    is blocked.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- blocks dispatch while the configuration text is not valid
    JSON (criterion 9) > issues no PUT when Save is clicked with unparsable configuration text
  proves: The create screen does not dispatch a registration while the configuration text is not valid
    JSON.
  fails_when: a PUT is issued despite the configuration text failing to parse as JSON at all.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- the configuration guard the specification actually requires,
    for a syntactically valid JSON array > does not dispatch register-connector, since the value is valid
    JSON but not a well-formed object
  proves: rules/integration/a-connector-configuration-holds-a-well-formed-object's own requirement, settled
    in the specification's favor after this test first caught the gap and use-connector-configuration-form.ts's
    configurationValid was corrected.
  fails_when: the create screen's configuration guard reverts to JSON.parse-succeeding alone, dispatching
    register-connector for a JSON array instead of refusing it.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- the configuration guard the specification actually requires,
    for syntactically valid JSON null > does not dispatch register-connector, since the value is valid
    JSON but not a well-formed object
  proves: rules/integration/a-connector-configuration-holds-a-well-formed-object's own requirement, for
    the null case.
  fails_when: the create screen's configuration guard reverts to JSON.parse-succeeding alone, dispatching
    register-connector for the JSON value null instead of refusing it.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- a registry refusal reaches the operator as a distinguishable
    message (criterion 10) > shows ConnectorConfigurationNotWellFormedError's own message via toast, rather
    than swallowing the refusal
  proves: A registration the registry refuses reaches the operator as the shared hook's own distinguishable
    failure message rather than being swallowed on this screen.
  fails_when: toast.error is never called with the specific ConnectorConfigurationNotWellFormedError message.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- a successful save lands on the created record's own detail
    route (criterion 11) > navigates to /connectors/{connector} after a successful save, not staying on
    /connectors/new
  proves: A save that succeeds leaves the operator on the created connector configuration's own detail
    route rather than on the create route.
  fails_when: the router's location stays at "/connectors/new" after a successful save.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: ConnectorConfigurationCreateScreen -- navigates using the submitted connector name, not the response
    body's own value (disclosed inference) > navigates to /connectors/{typed-name} even when the PUT response
    echoes back a different connector value
  proves: the delivery record's own disclosed inference that navigation reads the connector name from
    formRef.current.getValues("connector") rather than parsed from the mutation's own response body.
  fails_when: post-save navigation reads the connector name from the PUT response body instead of from
    the submitted form.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- no loading or load-error phase (disclosed inference) > renders
    the form fields immediately on mount rather than gating them behind a loading state
  proves: the delivery record's own disclosed inference that no loading or load-error phase is rendered
    by this screen.
  fails_when: the Configuration field is not present immediately on mount, or a "loading" placeholder
    gates it.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- a link back to the list (criterion 12) > renders a 'Back
    to connector configurations' link to /connectors
  proves: The create screen renders a link back to the connector configurations list.
  fails_when: no such link renders, or it renders with a different href than "/connectors".
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: ConnectorConfigurationCreateScreen -- renders no connector test panel (criterion 13) > renders
    no Test section
  proves: The create screen renders no connector test panel.
  fails_when: a "Test" heading renders anywhere on this screen.
not_applicable:
- edge_case: two saves in quick succession / a second Save click before the first request resolves
  why: the double-submit guard (isDispatchingRef) lives entirely inside use-connector-configuration-form.ts,
    unchanged in that respect by this task, and is already proven against the identical mutation logic
    by connector-configurations-screen-form-save.spec.ts's own test through the popup dialog's own create
    path.
- edge_case: an unmapped/generic save failure (a thrown network error with no ApiError shape)
  why: saveFailureMessage's generic fallback is decided entirely inside the shared hook and is already
    proven by connector-configurations-screen-form-save.spec.ts's own test against that same mapping.
- edge_case: a connector name at an upper length boundary or of a restricted format
  why: connectorConfigurationFormSchema states only z.string().min(1) -- no upper bound or pattern is
    stated anywhere in scope.
- edge_case: an empty collection rendered by this screen
  why: this screen renders no list of any kind.
- edge_case: a slow-answering dependency (a pending PUT held open)
  why: the pending/loading affordance is entirely inherited, unchanged, from ConnectorConfigurationFormFields
    and the shared hook's own mutation.isPending.
untested:
- 'The advisory note that a connector configuration registered under the literal name "new" has no reachable
  detail screen afterward: no criterion requires this screen to prevent, warn about, or special-case that
  name.'
- 'Silent create-vs-replace overwrite (re-registering an already-existing connector name from this screen):
  informational per the task''s own Notes, no criterion states a refusal or a warning here.'
- 'Whether ConnectorConfigurationFormFields is the literal imported symbol this screen renders, as opposed
  to a byte-identical hand-copied reimplementation: full assurance is a reading of the source, not a fact
  any DOM-observable test can settle.'
---

## What it is
Proves ConnectorConfigurationCreateScreen's routing, its reuse of the shared form-fields component and hook, its dispatch/refusal guards including the well-formed-object check, its post-save navigation, and its Back link and absent test panel; the full suite passes.

## Notes
The first two suite attempts for this delivery failed on this proof's own configuration-guard tests, disclosing a real gap (accepting a JSON array or null); use-connector-configuration-form.ts was corrected in response. This record's own run is the third attempt, and it passed clean.
