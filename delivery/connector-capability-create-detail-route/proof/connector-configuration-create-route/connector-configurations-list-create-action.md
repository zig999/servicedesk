---
title: |-
  Proof for the connector configurations list's create-action navigation
summary: |-
  Vitest coverage for connector-configurations-screen.tsx's own five criteria: the "New connector
  configuration" action now navigates to /connectors/new rather than opening the popup dialog, holds
  no leftover form-target state to reopen one, still renders across the list's loading/failed/empty
  states, and leaves row-click navigation to a connector's own detail route unchanged -- through
  small, self-contained test routers mirroring this project's own established "row click navigates"
  convention.
implementation: sha256:f699297b823bfa8cd612a8a9b659476d6dd6dbb26f57ed252860a473fc22f923
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-connector-configurations-list-create-action-suite-2
tests:
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" navigates to the create route
    (criterion 1) > navigates to /connectors/new when activated
  proves: |-
    Criterion 1 -- activating "New connector configuration" on the connector configurations list
    navigates to the create route.
  fails_when: |-
    Activating the button leaves the location at "/connectors", or resolves to any pathname other
    than "/connectors/new".
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" opens no dialog (criterion 2) >
    renders no dialog over the list, immediately after the action is activated and once navigation
    resolves
  proves: |-
    Criterion 2 -- activating "New connector configuration" opens no dialog over the connector
    configurations list, checked both the instant the action is activated and once the navigation
    has resolved.
  fails_when: |-
    An element with role="dialog" is found at either the moment right after the click or once
    "/connectors/new" is reached.
- file: src/routes/connector-configurations-screen-form-save.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" submits nothing of its own
    (criterion 2, dispatch dimension) > issues no PUT to the connectors endpoint when the action is
    activated and navigation resolves
  proves: |-
    Criterion 2's dispatch half -- there is no register-connector PUT left for the action to still
    trigger now that the popup dialog it used to open is gone.
  fails_when: |-
    Any PUT request to the connectors endpoint is recorded in the fetch stub's call log after the
    action is activated and navigation resolves.
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: |-
    ConnectorConfigurationsScreen — holds no create/edit form-target state of its own (criterion 3,
    two activations at once) > still shows no dialog when the action is activated twice in quick
    succession
  proves: |-
    Criterion 3 -- the connector configurations list screen holds no create/edit form-target state
    of its own. A form-target state left over from the retired popup dialog is the one thing that
    could make a second activation, before the first navigation settles, behave differently from the
    first (e.g. toggling a dialog open); nothing here does, since both clicks are plain navigate()
    calls with no local state to accumulate or toggle.
  fails_when: |-
    A dialog appears after either click, which only a surviving form-target state could produce
    given both clicks call the same stateless navigate().
- file: src/routes/connector-configurations-screen.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" renders unconditionally (disclosed
    inference) > offers the New connector configuration action while the list is still loading
  proves: |-
    Criterion 4, loading half -- the action renders while the list is loading, as it does today.
  fails_when: |-
    The "New connector configuration" button is absent while GET /v1/connectors is still pending.
- file: src/routes/connector-configurations-screen.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" renders unconditionally (disclosed
    inference) > offers the New connector configuration action after the list fails to load
  proves: |-
    Criterion 4, load-failed half -- the action renders while the list has failed to load, as it does
    today.
  fails_when: |-
    The "New connector configuration" button is absent once GET /v1/connectors has failed and the
    failure message has rendered.
- file: src/routes/connector-configurations-screen.spec.ts
  name: |-
    ConnectorConfigurationsScreen — "New connector configuration" renders unconditionally (disclosed
    inference) > offers the New connector configuration action, as the one button rendered, when the
    list is empty
  proves: |-
    Criterion 4, empty half -- the action renders while the list is empty, as it does today, and
    remains the only button on the screen at that point (no stray dialog-opening control survives
    alongside it).
  fails_when: |-
    The "New connector configuration" button is absent once the list is empty, or more than one
    button renders once the empty state's message has appeared.
- file: src/routes/connector-configurations-screen-navigation.spec.ts
  name: |-
    ConnectorConfigurationsScreen -- a row click navigates to the connector's own detail route
    (criterion 2) > navigates to /connectors/<connector> when a row is clicked
  proves: |-
    Criterion 5 -- clicking a row on the connector configurations list still navigates to that
    connector configuration's own detail route. This test predates this task (written for
    task/connector-capability-detail-editing/connector-configuration-detail-route) and this task
    changed no row-click code -- handleRowClick and its wiring into StatusTable's onRowClick are
    untouched -- so this existing, still-passing test is what this task's own "still navigates"
    criterion rests on; no new test is written over unchanged behavior.
  fails_when: |-
    Clicking a row no longer navigates to "/connectors/<connector>", or navigates to a different
    pathname.
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: |-
    ConnectorConfigurationCreateScreen — the Test section renders only in edit mode > renders no Test
    section, and issues no read for it, on the routed create screen
  proves: |-
    Fallout of this task's own change: repointing "New connector configuration" at navigate() instead
    of ConnectorConfigurationFormDialog made that dialog's create-mode instance permanently
    unreachable from the list screen. The pre-existing "Test section renders only in edit mode" proof
    used to reach create mode by clicking that button inside the dialog's own router-less harness;
    it no longer can, so this test was rewritten in the same follow-up pass to mount the routed
    create screen (ConnectorConfigurationCreateScreen) directly instead, keeping the adjacent
    guarantee -- that a connector configuration being created shows no Test section and issues no
    capability/subject-type reads for one -- provably intact rather than silently losing its own
    coverage to this task's change.
  fails_when: |-
    The routed create screen renders a "Test" heading, or issues a read to the capabilities or
    subject-type endpoints, once this is the only mount path a create-mode screen has left.
not_applicable:
- edge_case: |-
    Two operations against one subject at once (a concurrent create/register-connector dispatch)
  why: |-
    This screen dispatches no create/edit request of its own any more -- "New connector
    configuration" is a plain navigation, so there is nothing here left to race. The routed create
    screen's own dispatch and its own double-submit guard belong to a sibling task's proof.
- edge_case: |-
    A duplicate connector name, or any other registration-refusal edge case
  why: |-
    This screen submits no registration; the task's own Notes disclose that the refusal-handling
    specification statement (rules/integration/a-connector-configuration-names-its-connector) reaches
    no criterion of this navigation-only task.
- edge_case: |-
    A numeric or string boundary on an input this action carries
  why: |-
    "New connector configuration" takes no input of its own -- it is a navigation trigger with no
    parameters -- so there is no boundary to test.
- edge_case: |-
    Absent or empty input to the create action
  why: |-
    Same reason as above: the action carries no input.
untested:
- |-
  The routed create screen's own rendering, dispatch and refusal-handling behavior once
  "/connectors/new" is reached -- this task's tests deliberately mount a dummy placeholder
  component at that route, since ConnectorConfigurationCreateScreen's own behavior is a sibling
  task's proof (task/connector-configuration-create-route/connector-configuration-create-screen),
  not this navigation-only task's.
---

## What it is
Proves ConnectorConfigurationsScreen's own five criteria for this task -- the "New connector configuration" action's navigation to the create route, its opening no dialog and leaving no form-target state to reopen one, its continued rendering through loading/failed/empty states, and unchanged row-click navigation -- plus the one fallout fix this task's own change forced on an adjacent, pre-existing test; the full suite passes.

## Notes
connector-configurations-screen.test-support.ts's own header comment, which the implementation record's own `deferred` entry flagged as stale (claiming this screen calls no router hook at all), has since been corrected as part of this test rewrite: it now states plainly that useNavigate() itself needs no RouterProvider context but invoking the function it returns does, and names exactly which spec files mount their own router scaffolding as a result. No further action is owed on that deferral.
