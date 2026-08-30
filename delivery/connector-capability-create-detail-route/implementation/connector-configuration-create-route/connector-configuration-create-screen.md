---
title: Routed connector configuration create screen
summary: A new "/connectors/new" route and screen let an operator register a connector configuration on
  a full page, reusing the existing create/edit form hook and field markup, and land on the created record's
  own detail route on success.
task: sha256:7fa07b668a64c0aadab229d4c24793d657a85730b1f5a4de03876ddd97c43667
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-connector-configuration-create-screen-suite-3
files:
- path: src/routes/connector-configuration-create-screen.tsx
  effect: new ConnectorConfigurationCreateScreen component -- opens useConnectorConfigurationForm(null,
    onSaved) in create mode, composes the existing ConnectorConfigurationFormFields with isEditingIdentity=false
    and no trailingActions, renders no ConnectorTestPanel, renders an unconditional "Back to connector
    configurations" Link, and on a successful save reads the just-registered connector name back off the
    shared form (via a ref populated each render) and navigates to that connector's own "/connectors/$connector"
    detail route.
- path: src/routes/route-tree.tsx
  effect: imports ConnectorConfigurationCreateScreen and registers a new connectorConfigurationCreateRoute
    at "/connectors/new" (a static sibling of the existing dynamic "/connectors/$connector" route) whose
    component is that screen.
- path: src/hooks/use-connector-configuration-form.ts
  effect: added a module-private isValidConfigurationObject(text) function (parses via getJsonTextareaMinifiedValue,
    then requires the parsed value be a non-null, non-array object) and changed the configuration.onChange
    handler to derive configurationValid through it instead of trusting the parse-only isValid flag JsonTextareaField's
    own onChange reports -- correcting a captured-suite finding, classed a code defect, that this screen's
    dispatch gate accepted a syntactically valid JSON array or null. This hook is also read by connector-configuration-form-dialog.tsx's
    own edit-mode branch, so that consumer gains the same stricter gate without any change to that file.
criteria:
- criterion: Navigating to "/connectors/new" renders the connector configuration create screen inside
    the app shell.
  met: true
  how: route-tree.tsx registers connectorConfigurationCreateRoute at path "/connectors/new" as a child
    of rootRoute (whose component is AppShell), with ConnectorConfigurationCreateScreen as its own component.
- criterion: Navigating to "/connectors/new" does not render the connector configuration detail screen
    for a connector named "new".
  met: true
  how: '"/connectors/new" is a static path segment and "/connectors/$connector" is a dynamic one; TanStack
    Router sorts its route tree by specificity rather than registration order, so the static route always
    wins the match.'
- criterion: The create screen's connector field is editable rather than disabled.
  met: true
  how: useConnectorConfigurationForm is opened with existing=null, so its returned isEditingIdentity is
    false; the screen passes that straight through to ConnectorConfigurationFormFields.
- criterion: The create screen composes the existing connector-configuration form-fields component rather
    than a second copy of that markup.
  met: true
  how: ConnectorConfigurationCreateScreen imports and renders ConnectorConfigurationFormFields unchanged,
    passing form/configuration/isEditingIdentity/isSubmitting/onSubmit exactly as the two existing call
    sites already do.
- criterion: The create screen's form state comes from the existing connector-configuration create/edit
    hook opened in create mode rather than from a second hook re-deriving that state.
  met: true
  how: the screen calls useConnectorConfigurationForm(null, handleSaved), the same shared hook the popup
    Dialog already opens in create mode, with no parallel state beyond the navigation ref.
- criterion: Saving from the create screen dispatches the registry's register-connector request under
    the connector name typed into the form.
  met: true
  how: useConnectorConfigurationForm's own mutation dispatches PUT /v1/connectors/{values.connector} using
    whatever the operator typed; the create screen changes none of that dispatch logic.
- criterion: The create screen does not dispatch a registration while the connector name is empty.
  met: true
  how: connectorConfigurationFormSchema (z.string().min(1)) refuses form.handleSubmit's own validation
    for an empty connector before mutation.mutate is ever called.
- criterion: The create screen does not refuse a connector name that is present and non-empty.
  met: true
  how: connectorConfigurationFormSchema states only z.string().min(1) for connector, so any present, non-empty
    string passes the resolver and reaches mutation.mutate unmodified.
- criterion: The create screen does not dispatch a registration while the configuration text is not valid
    JSON.
  met: true
  how: useConnectorConfigurationForm's own submit handler checks configurationValid ahead of mutation.mutate;
    configurationValid is now computed through isValidConfigurationObject, which refuses a value that
    does not parse at all and a value that parses but is not a well-formed object alike (a stricter answer
    than the criterion's own literal wording, settling this task's own former UNDERDETERMINED note in
    the specification's favor).
- criterion: A registration the registry refuses reaches the operator as the shared hook's own distinguishable
    failure message rather than being swallowed on this screen.
  met: true
  how: useConnectorConfigurationForm's own mutation onError calls toast.error(saveFailureMessage(error));
    the create screen adds no error handling of its own around onSubmit.
- criterion: A save that succeeds leaves the operator on the created connector configuration's own detail
    route rather than on the create route.
  met: true
  how: 'handleSaved reads the submitted connector name off the stable react-hook-form object via formRef.current.getValues("connector")
    and calls navigate({ to: "/connectors/$connector", params: { connector } }).'
- criterion: The create screen renders a link back to the connector configurations list.
  met: true
  how: a Link to="/connectors" renders unconditionally at the top of the screen's markup.
- criterion: The create screen renders no connector test panel.
  met: true
  how: ConnectorTestPanel is never imported or rendered anywhere in connector-configuration-create-screen.tsx.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  how: the screen's Save action registers a connector configuration by its two required attributes, reusing
    the existing create/edit hook; this task adds no new encoding of the domain model itself.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  how: Save dispatches the registry's register-connector operation through the reused hook; this screen
    adds no second dispatch path or second refusal-handling path.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  how: the reused hook's mutation is register-connector's own wire shape, already implemented; this screen
    supplies no new request or response handling of its own.
- node: rules/integration/a-connector-configuration-names-its-connector
  how: honored rather than newly encoded -- the create screen's own dispatch gate already refuses an empty
    connector name before dispatch; the rule's own wire-level refusal belongs to the already-delivered
    backend act, not this screen.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  how: the client-side half of this rule (refusing a configuration that is not a well-formed object before
    it ever leaves the screen) is now encoded by isValidConfigurationObject, mirroring use-connector-configuration-detail.ts's
    own identical guard for the sibling edit route; the registry's own HTTP 422 refusal responses (ConnectorConfigurationNotWellFormedError,
    IncompleteConnectorConfigurationError) still belong to the already-delivered backend act, not this
    screen.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: honored by withholding the surface -- the create screen renders no ConnectorTestPanel at all, so
    no test can be initiated from an unregistered, in-progress create form.
inferences:
- inferred: on a successful save, the operator is navigated by reading the connector name back off the
    shared form object (via a ref populated on every render) rather than the hook exposing that name through
    its own onSaved callback signature.
  from: useConnectorConfigurationForm's onSaved is typed as () => void with no argument, and the task's
    must_not_duplicate guidance says this screen should reuse or extend that hook's shape rather than
    re-deriving it -- reading the name from the hook's own stable form object needed no change to the
    shared hook at all.
- inferred: the created connector configuration's own connector value used for navigation is read via
    formRef.current.getValues("connector") rather than parsed from the mutation's own response body.
  from: mirrors use-connector-configuration-detail.ts's own convention of re-baselining to what was just
    submitted, "not whatever the response body happens to carry."
- inferred: no loading or load-error phase is rendered by this screen.
  from: useConnectorConfigurationForm issues no query for existing=null -- there is nothing asynchronous
    to wait on before the form itself is ready to render.
- inferred: isValidConfigurationObject's exact well-formed-object test and its placement as a module-private
    function in use-connector-configuration-form.ts, rather than a change to the shared getJsonTextareaMinifiedValue/parseJsonText
    primitives.
  from: use-connector-configuration-detail.ts's own identical function and its header comment's own reasoning
    for scoping the fix locally (that shared primitive also drives this hook's own save-payload minification
    and, unchanged, use-capability-form.ts's inputSchemaValid/outputSchemaValid) -- the same scoping decision
    was carried over rather than re-derived.
preserved:
- The popup Dialog's own create-mode entry point keeps working unchanged -- this task adds a second, routed
  entry point beside it rather than removing or altering the first.
- useConnectorConfigurationForm's own public signature, mutation logic, and error-message mapping are
  unchanged.
- ConnectorConfigurationFormFields' own props and markup are unchanged.
- route-tree.tsx's existing routes, their component wiring, and the router's typed Register declaration
  all keep resolving exactly as before; only one new route was added.
deferred:
- what: connector-configurations-screen.tsx's own "New connector configuration" button still opens the
    popup Dialog in create mode rather than navigating to "/connectors/new".
  why: no criterion of this task states that the list screen's own entry point must be repointed here
    -- left for whichever task in this epic actually states it.
---

## What it is
A new "/connectors/new" route reuses the existing create/edit form hook and field markup to let an operator register a connector configuration on a full page, landing on the created record's own detail route on success.

## Notes
Two build/suite attempts stand for this delivery: the first two suite runs failed on the disclosed UNDERDETERMINED gap (a configuration guard accepting a syntactically valid JSON array or null); this record's own run is the third suite attempt, after use-connector-configuration-form.ts's configurationValid was corrected to require a well-formed object, and it passed clean.
