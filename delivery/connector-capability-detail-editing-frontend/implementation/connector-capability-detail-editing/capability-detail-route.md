---
title: Capability detail/edit route
summary: Adds a routed /capabilities/$name/$version detail-and-edit screen that replaces
  the popup dialog's edit path for an existing capability, with dirty-gated Save,
  discard, a save acknowledgement, and an invalid-loaded-JSON warning.
task: sha256:11350647d18363ac5e895a68d580b76912ee65528006bfd70943a8b1aa13350c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-capability-detail-route-build
files:
- path: src/hooks/use-capability-detail.ts
  effect: fixes two defects proactively found by mirroring the already-delivered connector-configuration
    sibling own corrections -- the load effect now derives inputSchemaValid/outputSchemaValid
    by parsing the loaded schema (getJsonTextareaMinifiedValue !== null) instead of
    hardcoding true, so an already-invalid loaded schema warns immediately; and the
    ready phase now also exposes isSubmitSuccessful (react-query own mutation.isSuccess),
    so a composing hook can detect a just-landed save without racing a fast-resolving
    mutation isSubmitting transition.
- path: src/hooks/use-capability-detail-view.ts
  effect: new composition hook over useCapabilityDetail -- adds onDiscard (resets
    the react-hook-form portion via form.reset() with no arguments, and resets both
    JSON schema fields to a ref-snapshotted baseline captured whenever isDirty reads
    false) and justSaved (set on isSubmitSuccessful false-to-true transition, cleared
    on the next edit).
- path: src/routes/capability-detail-screen.tsx
  effect: new routed screen for /capabilities/$name/$version -- reads both path params,
    delegates to useCapabilityDetailView, and renders the loading/load-error/ready
    phases explicitly, with a Back to capabilities Link present in every phase and
    a Retry action on load-error.
- path: src/routes/capability-detail-ready-view.tsx
  effect: new ready phase markup -- shows a plain warning above the fields when input_schema
    or output_schema does not parse as JSON, composes the existing CapabilityFormFields
    unchanged (isEditingIdentity always true, the new isDirty prop passed through),
    and renders a Discard button and a Saved status message while justSaved is true.
- path: src/routes/capability-form-fields.tsx
  effect: adds one new optional isDirty prop, defaulting to unset (which never disables
    Save on its own, so capability-form-dialog.tsx existing call site keeps its exact
    prior behavior); when passed, Save is also disabled while isDirty === false, on
    top of the pre-existing conditions. No other markup changed.
- path: src/routes/capabilities-browser-screen.tsx
  effect: removes the per-row Edit action and its actions column; a row click now
    navigates to /capabilities/$name/$version (name and version read straight off
    the row) instead of opening the popup Dialog in edit mode. The New capability
    action and the popup create-mode path are unchanged.
- path: src/routes/route-tree.tsx
  effect: registers a new leaf route at /capabilities/$name/$version rendering CapabilityDetailScreen,
    added to routeTree.addChildren alongside the existing fourteen.
- path: src/routes/route-tree.spec.ts
  effect: adds /capabilities/$name/$version to EXPECTED_PATHS and its own header commentary
    (the fifteenth registered route), and updates the two hardcoded fourteen route-count
    assertions to fifteen.
criteria:
- criterion: Navigating to /capabilities/<name>/<version> for an existing capability
    shows that capability's full record, loaded through the new hook by both name
    and version.
  met: true
  how: capability-detail-screen.tsx reads name and version via useParams and passes
    both to useCapabilityDetailView, which composes useCapabilityDetail(name, version)
    -- that hook own useQuery is keyed ["capability", name, version] and issues its
    own GET by that identity.
- criterion: Clicking a row on the capabilities list screen navigates to that capability's
    /capabilities/<name>/<version> route.
  met: true
  how: capabilities-browser-screen.tsx's new handleRowClick reads row.name/row.version
    and calls navigate; StatusTable is given onRowClick in place of the removed per-row
    Edit button.
- criterion: The route offers a control that returns the operator to the capabilities
    list.
  met: true
  how: capability-detail-screen.tsx renders a Back to capabilities Link in every one
    of its three phases.
- criterion: The Save button is disabled until the form, including input_schema and
    output_schema, differs from its originally loaded values, and re-disables once
    every field is returned to that value.
  met: true
  how: capability-detail-ready-view.tsx passes isDirty into CapabilityFormFields,
    which now also disables Save while isDirty === false.
- criterion: A discard-changes control resets every field, including both JSON schema
    fields, back to the originally loaded values and re-disables Save.
  met: true
  how: capability-detail-ready-view.tsx's Discard changes button calls state.onDiscard,
    which resets the form and replays both JSON schema baselines through their onChange
    -- afterward isDirty reads false again.
- criterion: The existing capability-form-fields.tsx markup is reused unchanged inside
    the new route.
  met: true
  how: capability-detail-ready-view.tsx composes CapabilityFormFields with the same
    props capability-form-dialog.tsx already passes, plus the one new optional isDirty
    prop -- every field own markup, layout and labeling is untouched.
- criterion: A successful save shows a success acknowledgement and the screen visibly
    reflects the just-saved values.
  met: true
  how: capability-detail-ready-view.tsx renders a role=status Saved message while
    state.justSaved is true; use-capability-detail-view.ts sets it on isSubmitSuccessful
    false-to-true transition.
- criterion: If the loaded input_schema or output_schema value does not parse as valid
    JSON, the screen shows a plain warning that the stored value is invalid and must
    be corrected before Save can succeed, instead of rendering it silently.
  met: true
  how: capability-detail-ready-view.tsx renders a role=alert warning for each of inputSchema/outputSchema
    while that field own isValid reads false; that flag is now correctly derived at
    load time by the fixed load effect instead of the hardcoded true this task found
    and fixed.
- criterion: Editing an existing capability from the list screen opens the new route
    instead of the popup dialog.
  met: true
  how: capabilities-browser-screen.tsx's per-row Edit button and its onEdit callback
    are removed entirely; the only way to reach an existing capability from that screen
    is now the row click, which navigates to the new route.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-screen.tsx
  - src/routes/capabilities-browser-screen.tsx
  - src/routes/route-tree.tsx
  how: the route and the hook it composes both address one capability strictly by
    its stated identity, name and version together -- the path params, the query key,
    the PUT URL, and the row navigation all carry both fields together.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: this task surfaces two of the four operations this contract publishes through
    the UI -- the by-identity read and register-capability -- and this task own two
    fixes to that same file both sit directly on those two operations own results.
- node: rules/integration/a-capability-declares-well-formed-schemas
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-ready-view.tsx
  how: the fixed load effect detects a stored schema that does not parse, the ready
    view shows a plain warning naming the consequence, and capability-form-fields.tsx's
    own pre-existing invalidity gate already blocks Save while either schema is invalid.
inferences:
- inferred: Back to capabilities as the Link text, and Capability {name} {version}
    as the ready-phase heading.
  from: mirrors connector-configuration-detail-screen.tsx's own identical pattern
    for the sibling route.
- inferred: two separate plain-language warnings, one for input_schema and one for
    output_schema, each naming the consequence rather than reusing JsonTextareaField
    own inline parser-message text.
  from: mirrors connector-configuration-detail-ready-view.tsx's own identical warning
    banner, split into two because a capability declares two schemas.
- inferred: onDiscard resets the react-hook-form portion via a bare form.reset() rather
    than a hand-snapshotted baseline of each editable field.
  from: react-hook-form's own reset() behavior paired with use-capability-detail.ts's
    own load effect and mutation onSuccess already calling form.reset(fullValues).
- inferred: the optional isDirty prop added to capability-form-fields.tsx is safe
    under criterion 6 (reused unchanged), because it is additive and never fires at
    the one pre-existing call site.
  from: the already-delivered sibling task made the identical widening to connector-configuration-form-fields.tsx
    under identically-worded criterion text.
- inferred: no other test-support helper reaches the popup dialog's edit mode the
    way connector-test-panel.test-support.ts's mountTestPanelInEditMode once did for
    the connector side.
  from: a repository-wide search for every reference to CapabilityFormDialog turned
    up only capabilities-browser-screen.tsx itself, its own test-support module, and
    its own proof files.
divergences:
- from: use-capability-detail.ts as delivered by task/connector-capability-detail-editing/capability-detail-hook
  departure: modified that already-delivered file directly -- the load effect now
    derives both validity flags through getJsonTextareaMinifiedValue(...) !== null
    instead of the hardcoded true, and the ready phase now also exposes isSubmitSuccessful.
  why: this task's own instructions named these as the exact two defects a failure-diagnostician
    already found once against the sibling connector-configuration hook, and asked
    to check for and fix them here proactively.
- from: this task's own criterion 6 (the existing capability-form-fields.tsx markup
    is reused unchanged inside the new route)
  departure: added one optional isDirty prop to CapabilityFormFieldsProps (default
    unset, never itself disabling Save).
  why: capability-form-fields.tsx's pre-existing Save-disable logic carries no differs-from-loaded-record
    concept at all, and criterion 4 requires exactly that; the same reasoning the
    already-delivered sibling task recorded for connector-configuration-form-fields.tsx
    under identical criterion wording.
preserved:
- The popup CapabilityFormDialog's New capability create-mode flow, and every field
  it renders, entirely untouched.
- CapabilityFormDialog's and useCapabilityForm's own edit-mode branch -- left fully
  intact even though capabilities-browser-screen.tsx no longer constructs one.
- capabilities-browser-screen.tsx's own loading, error-with-retry and empty-state
  rendering for the capabilities list, and its column set for every field besides
  the removed actions column.
- Every one of the fourteen routes route-tree.tsx already registered, and route-tree.spec.ts's
  own coverage of each -- only the count and the one new path changed.
deferred:
- what: route-tree.tsx's own top-of-file comment and the declare-module comment near
    the bottom were already stale before this task and remain stale after it.
  why: correcting stale prose comments unrelated to this task own criteria reaches
    past its objective; every route addition since has left this same prose untouched.
---

## What it is

A dedicated route replacing the popup dialog edit path for one capability, composing the already-delivered data hook (fixed of the same two defects the connector sibling hit) with discard and just-saved behavior, reusing the existing field markup unchanged.

## Notes

This task proactively found and fixed, in its own first pass, the same two code defects a failure-diagnostician had to discover for the connector-configuration sibling task (a hardcoded schema-validity true on load, and a save-acknowledgement race) -- both fixes sit in use-capability-detail.ts, delivered by the sibling task/connector-capability-detail-editing/capability-detail-hook, disclosed above as divergences.
