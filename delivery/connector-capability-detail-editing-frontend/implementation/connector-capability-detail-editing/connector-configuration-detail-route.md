---
title: Connector configuration detail/edit route
summary: A routed /connectors/$connector screen that loads, edits, discards, and saves
  one connector configuration in place of the popup dialog edit path, with list-row
  navigation wired to it, corrected against two real code defects a failure-diagnostician
  found.
task: sha256:89ed57559f2891a800525967f4d97fbef1ee6c87ebf2e565432c5188ed7dcbe8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-connector-configuration-detail-route-build-3
files:
- path: src/hooks/use-connector-configuration-detail-view.ts
  effect: 'New composition hook over the already-delivered useConnectorConfigurationDetail:
    adds a discard-changes action (snapshots the configuration text/validity every
    time the underlying hook isDirty reads false, and plays that snapshot back through
    configuration.onChange plus form.reset on demand) and a justSaved flag, now derived
    from isSubmitSuccessful (react-query mutation.isSuccess) own false-to-true transition,
    tracked via a ref, rather than from comparing isSubmitting across renders, since
    a fast-resolving save could leave React never committing an intermediate isSubmitting=true
    frame. Exports ConnectorConfigurationDetailViewState, the same phase union widened
    with onDiscard and justSaved on the ready variant.'
- path: src/hooks/use-connector-configuration-detail.ts
  effect: 'Sibling task delivered file, corrected here: its load effect now derives
    configurationValid by parsing the loaded configuration text through getJsonTextareaMinifiedValue
    instead of hardcoding it true, so a stored value that does not parse as JSON is
    flagged invalid immediately on load. Its ready phase also now exposes isSubmitSuccessful
    (react-query own mutation.isSuccess), a level signal a caller can edge-detect
    for a completed save.'
- path: src/routes/connector-configuration-detail-screen.tsx
  effect: 'New routed screen: reads connector via useParams, delegates to useConnectorConfigurationDetailView,
    and renders each phase explicitly (loading text, a load-error Retry action, or
    the ready view) with a Back to connector configurations Link present in every
    phase.'
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: 'New component holding the route ready phase markup: an invalid-JSON warning
    banner, the existing ConnectorConfigurationFormFields (unchanged call, plus the
    new optional isDirty prop), a Discard changes button wired to onDiscard, a Saved
    success acknowledgement shown while justSaved is true, and the existing ConnectorTestPanel
    scoped to this route own connector.'
- path: src/routes/route-tree.tsx
  effect: Registers a new /connectors/$connector route (ConnectorConfigurationDetailScreen)
    as a child of rootRoute, alongside the existing /connectors route.
- path: src/routes/connector-configurations-screen.tsx
  effect: Row click now navigates to /connectors/$connector instead of opening the
    popup Dialog edit mode; the actions/Edit-button column and per-row onEdit callback
    are removed since StatusTable own onRowClick now drives the whole row. The New
    connector configuration button and its create-mode Dialog usage are unchanged.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Adds one optional isDirty prop to ConnectorConfigurationFormFieldsProps,
    folded into the existing isSaveDisabled condition. Left unset, as the existing
    dialog call site still does, it changes nothing; the routed detail screen is the
    one caller that now passes it. Every other line of markup is unchanged.
criteria:
- criterion: Navigating to /connectors/<connector> for an existing connector shows
    that connector configuration's full record, loaded through the new hook.
  met: true
  how: route-tree.tsx new route renders ConnectorConfigurationDetailScreen, which
    calls useConnectorConfigurationDetailView(connector) and, once ready, renders
    both attributes through the existing ConnectorConfigurationFormFields. Unaffected
    by the two corrections.
- criterion: Clicking a row on the connector-configurations list screen navigates
    to that connector's /connectors/<connector> route.
  met: true
  how: connector-configurations-screen.tsx's StatusTable now receives onRowClick,
    which reads the clicked row's own connector field and calls navigate. Unaffected.
- criterion: The route offers a control that returns the operator to the connector-configurations
    list.
  met: true
  how: connector-configuration-detail-screen.tsx renders a Back to connector configurations
    Link in every phase. Unaffected.
- criterion: The Save button is disabled until the form, including configuration,
    differs from its originally loaded values, and re-disables once every field is
    returned to that value.
  met: true
  how: The detail hook own isDirty is passed as the new isDirty prop to ConnectorConfigurationFormFields,
    whose isSaveDisabled now also reads isDirty === false. Unaffected by the two corrections.
- criterion: A discard-changes control resets every field, including configuration,
    back to the originally loaded values and re-disables Save.
  met: true
  how: The ready view's Discard changes button calls state.onDiscard, which resets
    connector via form.reset and configuration via configuration.onChange back to
    the snapshot most recently captured while isDirty read false. Unaffected.
- criterion: The existing connector-configuration-form-fields.tsx markup and the existing
    ConnectorTestPanel are reused unchanged inside the new route.
  met: true
  how: ConnectorTestPanel is composed with no changes, scoped to this route's connector.
    connector-configuration-form-fields.tsx markup is unchanged; the one addition
    is a new optional isDirty prop that changes nothing for the existing call site.
    Unaffected.
- criterion: A successful save shows a success acknowledgement and the screen visibly
    reflects the just-saved values.
  met: true
  how: Fixed. justSaved now sets true on isSubmitSuccessful's own false-to-true transition
    (react-query mutation.isSuccess, exposed by use-connector-configuration-detail.ts)
    rather than on a same-render comparison of isSubmitting, which a failure-diagnostician
    found never fires when a quick successful PUT's pending and settled states commit
    together. justSaved still clears the instant a fresh edit makes isDirty true.
    The ready view role=status Saved text, unchanged, renders off that flag.
- criterion: If the loaded configuration value does not parse as valid JSON, the screen
    shows a plain warning that the stored value is invalid and must be corrected before
    Save can succeed, instead of rendering it silently.
  met: true
  how: Fixed. use-connector-configuration-detail.ts's load effect now sets configurationValid
    to getJsonTextareaMinifiedValue(query.data.configuration) !== null instead of
    hardcoding true, so an invalid stored value reads invalid the instant it loads,
    before any edit. The ready view's existing, unchanged invalid-configuration warning
    banner and onSubmit's existing validity guard both now see the correct value from
    the first render.
- criterion: Editing an existing connector configuration from the list screen opens
    the new route instead of the popup dialog.
  met: true
  how: connector-configurations-screen.tsx no longer constructs an edit-mode form
    target from any row action; the only remaining formTarget construction is create-mode
    from the New connector configuration button. Unaffected.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configurations-screen.tsx
  how: The route shows and edits both of this value-object's required attributes as
    one record, loaded and replaced whole on save through the sibling hook this task
    composes over and corrects; the list screen row now addresses that same record
    by its one identifying attribute to reach the route.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: 'This task''s own layer surfaces the registry''s read-connector-configuration
    and register-connector operations as a full detail/edit screen: the loaded record,
    the save action, and the (now correctly firing) just-saved acknowledgement.'
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/hooks/use-connector-configuration-detail.ts
  how: Criterion 8's plain warning and Save's pre-existing validity disable now actually
    check the loaded value against this rule at load time (previously assumed valid
    unconditionally), making the rule visible to the operator before a save is even
    attempted.
inferences:
- inferred: Adding one optional isDirty prop to ConnectorConfigurationFormFieldsProps
    counts as reused unchanged for criterion 6, since the markup itself is untouched
    and the existing dialog call site behavior is unaffected.
  from: Criterion 4 requires Save to be gated on isDirty, and the file had no such
    condition and no prop to carry one -- the plan inventory own module list marks
    this exact file touched, distinct from depends-on.
- inferred: The originally loaded values (criterion 5) means the values useConnectorConfigurationDetail
    itself currently treats as baseline, re-seeded after a successful save.
  from: use-connector-configuration-detail.ts own header comment and its sibling task
    own criterion 5 both state the baseline moves to what was just saved after a successful
    save.
- inferred: The invalid-JSON warning needed its own plain wording distinct from JsonTextareaField
    own inline parser message.
  from: no specification node or existing UI text states this wording; the shared
    component message names the parser error, not the consequence criterion 8 itself
    states.
- inferred: A successful save acknowledgement is a plain inline Saved (role=status)
    rather than a toast.
  from: the plan inventory own convention note states no toast.success call exists
    anywhere in this app, and the one routed hook that already renders a save acknowledgement
    does so as inline state.
- inferred: The list screen per-row action is now the whole row rather than turning
    the existing Edit button into a Link.
  from: criterion 2's own wording and cases-list-screen.tsx's own already-established
    row-click-navigates convention.
- inferred: The Discard changes control needs no destructive-action confirmation step.
  from: discard only resets unsaved, in-memory edits back to the record own current
    server-held values -- nothing persisted is destroyed.
- inferred: The fix for the fast-resolving-save acknowledgement is implemented by
    exposing react-query own mutation.isSuccess as a new isSubmitSuccessful field,
    edge-detected via a ref for its false-to-true transition, rather than deriving
    justSaved directly on every render.
  from: 'use-connector-configuration-detail-view.ts''s own already-documented design
    intent that justSaved never outlives the values it was acknowledging: a pure per-render
    derivation would resurrect the acknowledgement if an unrelated later edit happened
    to revert the field back to the exact previously-saved text without a new save
    occurring, which the edge-detected ref avoids.'
- inferred: The narrower of two possible fixes -- exposing mutation.isSuccess as a
    new field on the sibling hook -- was chosen over moving the entire success-acknowledgement
    feature into that hook own mutation onSuccess.
  from: use-connector-configuration-detail.ts own header comment states that everything
    past letting the mutation settle -- including showing anything to the operator
    about a save outcome -- is deliberately this route task own concern, not the sibling
    hook, so exposing the one fact react-query already derives keeps that boundary
    intact.
divergences:
- from: task/connector-capability-detail-editing/connector-configuration-detail-hook's
    own delivered file, src/hooks/use-connector-configuration-detail.ts (the convention
    that a task's delivery only edits files its own implementation record lists)
  departure: This corrective delivery edits that file directly, changing its load
    effect configurationValid derivation from a hardcoded true to an actual parse
    check.
  why: Fixing this task's own criterion 8 required correcting a real code defect a
    failure-diagnostician found in that file's load effect; nothing in this task's
    own files could answer that defect without editing the file where it lives.
- from: task/connector-capability-detail-editing/connector-configuration-detail-hook's
    own delivered file, src/hooks/use-connector-configuration-detail.ts
  departure: This corrective delivery also widens that file own ready phase by one
    field, isSubmitSuccessful (react-query own mutation.isSuccess).
  why: Fixing this task's own criterion 7 needed a signal this sibling hook's return
    shape did not expose -- its onSubmit is void, not a promise a caller could await
    -- so nothing observable from outside the file could answer whether the last save
    succeeded without this widening.
preserved:
- The connector-configurations screen's New connector configuration button and its
  create-mode Dialog flow -- untouched by this task.
- Every other existing route in route-tree.tsx and its ordering.
- ConnectorTestPanel's own markup and behavior, and connector-configuration-form-fields.tsx's
  own field layout, both reused unchanged apart from the one additive isDirty prop.
- connector-configuration-form-dialog.tsx's own edit-mode branch and use-connector-configuration-form.ts's
  own edit-mode handling stay in place even though this screen no longer constructs
  an edit-mode target.
- use-connector-configuration-detail.ts's own loading/load-error/ready phase union
  shape, its isDirty comparison, its reset-on-load/reset-on-save baseline re-seeding,
  and both query invalidations -- all unchanged besides the two corrected/added fields.
deferred:
- what: useConnectorConfigurationDetail's own save mutation has no onError branch,
    so a failed PUT leaves the route with no visible error state.
  why: no criterion of this task states required behavior or wording for a failed
    save.
---

## What it is

A dedicated route replacing the popup dialog edit path for one connector configuration, composing the already-delivered data hook with discard and just-saved behavior, reusing the existing field markup and test panel unchanged.

## Notes

A failure-diagnostician found two real code defects on the first suite run: a save-acknowledgement race (criterion 7) and a load-time invalid-JSON warning that never fired (criterion 8). Both are now fixed, and both required correcting src/hooks/use-connector-configuration-detail.ts, a file delivered by the sibling task/connector-capability-detail-editing/connector-configuration-detail-hook -- disclosed above as two divergences.
