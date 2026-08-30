---
title: Retire the connector configuration popup form dialog
summary: The connector configuration form dialog component and its nullable-identity form-target
  type are emptied out of the tree and no longer declared, leaving the routed create screen's
  form hook and form-fields untouched.
task: sha256:edd632e19960740aa15a864918b0cc662bcbe5c7cc742bbe3b5a25f1a01bf66a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-retire-connector-configuration-form-dialog-build-2
files:
- path: src/routes/connector-configuration-form-dialog.tsx
  effect: 'removed from the tree (git rm). The task-implementer delegation, holding no Bash/shell
    tool, first emptied the file to zero bytes -- the ConnectorConfigurationFormDialog component,
    its ConnectorConfigurationFormDialogProps type, and all of its imports (Dialog/DialogContent/
    DialogHeader/DialogTitle from @tui/ui/dialog, useConnectorConfigurationForm and
    ConnectorConfigurationFormTarget from the hook, ConnectorConfigurationFormFields,
    ConnectorTestPanel) -- and the path itself was then unlinked mechanically by the orchestrating
    session, which does hold a shell, completing the one step the delegation could not perform.'
- path: src/hooks/use-connector-configuration-form.ts
  effect: 'the ConnectorConfigurationFormTarget type declaration (and its own one-line doc
    comment) is removed. Nothing else in this file changed: useConnectorConfigurationForm never
    referenced that type internally (its own signature already took `existing: ConnectorConfiguration
    | null` directly), so removing it is the only edit this file needed. ConfigurationFieldState,
    ConnectorConfigurationFormState, isValidConfigurationObject, saveFailureMessage and
    useConnectorConfigurationForm itself are byte-for-byte unchanged.'
criteria:
- criterion: The connector configuration form dialog module no longer exists in the tree.
  met: true
  how: 'the module''s entire content -- the component, its props type, and every import -- was
    removed by the task-implementer delegation, and the path itself,
    src/routes/connector-configuration-form-dialog.tsx, was then removed from the tree via
    `git rm`, completing the one step that delegation''s tool set (Read, Write, Edit, Grep, Glob;
    no Bash/shell) could not perform on its own.'
- criterion: No module in the frontend app imports the connector configuration form dialog component.
  met: true
  how: 'grepping `frontend/app/src` for `ConnectorConfigurationFormDialog` and for the
    from-path import pattern after this delivery''s edits turns up exactly one remaining import,
    in connector-configuration-form-dialog-forwards-configuration-text.spec.ts (a spec file,
    criterion 3''s own concern). Every production module -- connector-configurations-screen.tsx
    and capabilities-browser-screen.tsx included -- already held no import of this component
    before this task started, delivered by the prior task
    (task/connector-configuration-create-route/connector-configurations-list-create-action);
    this task verified that fact rather than assuming it, and needed no further edit to satisfy it.'
- criterion: No spec file references the deleted connector configuration form dialog module.
  met: true
  how: 'connector-configuration-form-dialog-forwards-configuration-text.spec.ts, the one spec that
    imported and mounted ConnectorConfigurationFormDialog, was removed from the tree by a
    test-author delegation once it confirmed the fact it proved (typed configuration text driving
    ConnectorTestPanel''s subject-attribute placeholder derivation) is already proven against the
    surviving call site by connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
    (proof for task/connector-test-panel-reads-registered-configuration/thread-registered-configuration-into-test-panel).
    Grepping the tree afterward for the module name, the component name, and the retired
    ConnectorConfigurationFormTarget type finds no remaining spec-file import, mount, or type
    reference -- only stale prose-comment mentions in production files, out of this task''s scope
    per its own deferred entries.'
- criterion: The assertion that the currently typed configuration text reaches the connector
    test panel still stands against a surviving call site of that panel.
  met: true
  how: 'the one surviving call site is src/routes/connector-configuration-detail-ready-view.tsx,
    which composes `<ConnectorTestPanel connector={...} configurationText={state.registeredConfigurationText} />`
    -- untouched by this task, exactly as this task''s own instructions require ("do not touch
    the test-connector dispatch logic, registeredConfigurationText, or any test/spec file"). The
    criterion''s own "currently typed configuration text reaches the connector test panel" is
    about ConnectorTestPanel''s own client-side derivation of subject-attribute placeholder rows
    from whatever configurationText string reaches it (task/connector-test-panel-placeholder-attributes/
    route-configuration-text-to-test-panel''s own plumbing, unchanged), not about which
    configuration the test dispatch itself exercises -- the task''s own Notes state this
    explicitly and this delivery honors it: nothing here re-plumbs the surviving call site to
    carry unsaved authoring text into the test-connector request body, which would satisfy this
    criterion''s literal wording while being refused by
    rules/integration/a-connector-configuration-is-tested-through-a-registered-capability. Deleting
    the dialog''s own (production-unreachable) edit-mode branch removes no reachable behavior,
    per that file''s own former header comment, now confirmed empty rather than merely quoted.'
- criterion: The nullable-identity connector configuration form-target type is no longer declared.
  met: true
  how: 'ConnectorConfigurationFormTarget''s declaration in src/hooks/use-connector-configuration-form.ts
    is removed, and its declaration inside the now-emptied connector-configuration-form-dialog.tsx
    was never a second declaration (that file only imported the type, at its own line 5, and
    re-exported nothing). Grepping src for `ConnectorConfigurationFormTarget` after both edits
    finds it in prose comments only, in connector-configurations-screen.tsx and
    capabilities-browser-screen.tsx (both header comments documenting an earlier, different
    task''s own delivery) -- neither is a declaration, an import, or a construction of the type;
    both are deferred below rather than edited, since correcting another task''s own delivered
    documentation reaches past this task''s stated scope.'
- criterion: The connector-configuration create/edit form hook the routed create screen consumes
    is not deleted.
  met: true
  how: 'src/hooks/use-connector-configuration-form.ts still exports useConnectorConfigurationForm,
    ConnectorConfigurationFormState and ConfigurationFieldState unchanged; only the
    ConnectorConfigurationFormTarget type (never consumed by the hook''s own body, only exported
    for the now-emptied dialog''s callers) was removed. connector-configuration-create-screen.tsx''s
    own `useConnectorConfigurationForm(null, handleSaved)` call site is untouched by this
    delivery and continues to compile against the hook exactly as before.'
nodes:
- node: contracts/integration/connector-configuration-registry
  how: 'this task dispatches no register-connector, read-connector-configuration or
    list-connector-configurations request of its own; it removes a popup dialog that composed
    the already-implemented create/edit hook, and leaves that hook''s own dispatch (PUT
    /v1/connectors/{connector}) completely unchanged. The routed create screen this task leaves
    standing is what already carries this contract forward, delivered under a sibling task.'
- node: contracts/integration/connector-diagnostics
  how: 'this task deletes a dialog that used to render ConnectorTestPanel in a
    production-unreachable edit-mode branch, and preserves the one reachable panel call site
    (connector-configuration-detail-ready-view.tsx) untouched. It dispatches no test-connector
    request of its own and changes nothing about how or when one is dispatched.'
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: 'honored by omission and by restraint, as this task''s own Notes anticipate: this task
    neither dispatches the test-connector call nor refuses it, so the three clauses this record
    could have violated -- testing only through a specific already-registered capability, the
    HTTP 404 CapabilityNotRegisteredForTestError refusal, and the HTTP 409
    CapabilityConnectorMismatchError refusal -- reach no code this task touches. What matters
    here is the negative fact: the surviving ConnectorTestPanel call site''s own
    `configurationText={state.registeredConfigurationText}` (never unsaved authoring text) is
    left exactly as it stood, so the rule''s own "never configuration text an operator holds
    unsaved in an authoring surface" is not violated by this delivery re-plumbing anything to
    satisfy criterion 4''s literal wording instead.'
inferences:
- inferred: emptying connector-configuration-form-dialog.tsx to zero bytes (rather than, say,
    leaving a stub re-export or a comment-only file) was the closest available substitute for
    deletion given the task-implementer delegation's tool set, pending the path's own removal by
    a step holding filesystem/git access.
  from: the task's own criterion 1 ("no longer exists in the tree") and the absence of any
    file-deletion primitive among the tools that delegation was given; a partial file (e.g. a
    barrel re-export) would have left a live import surface behind, which is exactly what
    criterion 2 forbids.
preserved:
- src/routes/connector-configuration-detail-ready-view.tsx's own
  `<ConnectorTestPanel connector={...} configurationText={state.registeredConfigurationText} />`
  call site, and everything upstream of it in use-connector-configuration-detail-view.ts that
  computes registeredConfigurationText -- the one live diagnostic call this task must not
  re-plumb to consume unsaved authoring text instead.
- src/hooks/use-connector-configuration-form.ts's own useConnectorConfigurationForm,
  ConnectorConfigurationFormState, ConfigurationFieldState, isValidConfigurationObject and
  saveFailureMessage -- every export the routed create screen (and the now-empty dialog's own
  former callers) relied on except the one type this task retires.
- src/routes/connector-configuration-form-fields.tsx, entirely untouched -- both the routed
  create screen and the routed detail/edit screen compose it directly.
- src/routes/connector-configuration-create-screen.tsx's own
  `useConnectorConfigurationForm(null, handleSaved)` composition, untouched.
deferred:
- what: 'connector-configuration-form-dialog-forwards-configuration-text.spec.ts still imports
    and mounts the now-empty ConnectorConfigurationFormDialog, and will fail to compile once the
    module holds no such export.'
  why: 'writing or deleting a spec file is test-author''s task, never this implementation task''s
    -- flagged here so the next delegation does not discover it cold. This is the same spec the
    task''s own Notes name as "the one spec exercising this dialog."'
- what: 'connector-configurations-screen.tsx''s and capabilities-browser-screen.tsx''s own header
    comments still name ConnectorConfigurationFormDialog and ConnectorConfigurationFormTarget in
    prose, documenting a different, already-delivered task''s own history ("this screen no longer
    imports either ... The Dialog component and its type are untouched"). That claim is now
    stale -- the type is no longer declared and the dialog is now empty -- but correcting another
    task''s own delivered documentation reaches past this task''s stated scope (only the dialog
    module and its form-target type are named for removal).'
  why: 'these files are not named by this task''s criteria or objective, and rewriting a sibling
    task''s own delivered narrative widens this task rather than completing it.'
- what: 'connector-test-panel.tsx''s own header comment states "Rendered by
    connector-configuration-form-dialog.tsx only in edit mode," which is now stale since that
    file renders nothing.'
  why: 'ConnectorTestPanel itself is explicitly out of this task''s scope ("Do NOT touch ... any
    test/spec file" and the surrounding instruction to leave the panel''s own call sites
    untouched); correcting its header prose is a documentation-only change this task''s stated
    criteria do not require and its own boundary ("only the dialog module and its form-target
    type are in scope for removal") does not cover.'
---

## What it is
The connector configuration popup form dialog's content is fully removed and its form-target
type is no longer declared anywhere; the form hook and form-fields component the routed create
screen depends on are untouched, and the panel's one surviving call site keeps supplying
`state.registeredConfigurationText` exactly as before.

## Notes
The task-implementer delegation held no Bash/shell tool, so it emptied
`src/routes/connector-configuration-form-dialog.tsx` of all content but could not unlink the path
itself, and could not compute the `task`/`standard.pin` digests. The orchestrating session, which
does hold a shell, completed both: `git rm` on the emptied file, and `sha256sum` for both pins.
