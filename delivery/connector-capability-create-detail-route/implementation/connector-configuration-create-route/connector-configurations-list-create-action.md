---
title: Connector configurations list opens the routed create screen
summary: The connector configurations list's "New connector configuration" button navigates to "/connectors/new"
  instead of opening the popup create/edit Dialog, and the list screen no longer holds its own create/edit
  form-target state.
task: sha256:9b64e272a578f8d167e7b7be5b303cbdcdcfff0839ff68c5dbbe25257120eb65
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-connector-configurations-list-create-action-build
files:
- path: src/routes/connector-configurations-screen.tsx
  effect: 'the "New connector configuration" button calls navigate({ to: "/connectors/new" }) instead
    of opening ConnectorConfigurationFormDialog; the screen no longer imports ConnectorConfigurationFormDialog
    or ConnectorConfigurationFormTarget, no longer holds a formTarget useState, and no longer renders
    the Dialog conditionally. Row-click navigation to "/connectors/$connector" and the loading/error/empty
    renderBody() branches are unchanged.'
criteria:
- criterion: Activating "New connector configuration" on the connector configurations list navigates to
    the create route.
  met: true
  how: 'the button''s onClick is now () => void navigate({ to: "/connectors/new" }), the same useNavigate
    instance the screen already held for row-click navigation.'
- criterion: Activating "New connector configuration" opens no dialog over the connector configurations
    list.
  met: true
  how: ConnectorConfigurationFormDialog is no longer imported or rendered anywhere in this file.
- criterion: The connector configurations list screen holds no create/edit form-target state of its own.
  met: true
  how: the formTarget useState<ConnectorConfigurationFormTarget | null> declaration and the ConnectorConfigurationFormTarget
    import are both removed.
- criterion: The "New connector configuration" action renders while the list is loading, while it has
    failed to load, and while it is empty, as it does today.
  met: true
  how: the button's JSX position is unchanged -- it still sits in the header div, ahead of and outside
    renderBody()'s loading/error/empty/table branches.
- criterion: Clicking a row on the connector configurations list still navigates to that connector configuration's
    own detail route.
  met: true
  how: handleRowClick and its wiring into StatusTable's onRowClick are untouched by this change.
nodes:
- node: contracts/integration/connector-configuration-registry
  how: this task only moves the operator from the list screen to the routed create screen; it dispatches
    no register-connector request and reads no read-connector-configuration or list-connector-configurations
    response of its own -- both already-implemented and unchanged by this delivery.
preserved:
- The "New connector configuration" button renders in every one of the list's loading, load-failed and
  empty states, ahead of and outside renderBody()'s branches.
- Row-click navigation to "/connectors/$connector" via StatusTable's onRowClick, reading the clicked row's
  own connector field with the existing guard.
- The list's own loading, load-failed (with its Retry action) and empty-state rendering in renderBody(),
  and the StatusTable rendering for a non-empty list.
- ConnectorConfigurationFormDialog and ConnectorConfigurationFormTarget themselves, untouched -- this
  task's own scope is the list screen's state and button only.
deferred:
- what: connector-configurations-screen.test-support.ts's own header comment states that ConnectorConfigurationsScreen
    calls no router hook at all, already stale before this task and now doubly so.
  why: fixing a test-support module's own claims is the test-author's concern, not this navigation-only
    implementation task's.
---

## What it is
The connector configurations list's "New connector configuration" button now navigates to "/connectors/new" instead of opening the popup Dialog, and the list screen no longer holds create/edit form-target state.

## Notes
None.
