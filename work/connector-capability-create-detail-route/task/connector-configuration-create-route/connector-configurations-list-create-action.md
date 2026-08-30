---
title: Connector configurations list opens the create route
summary: The list screen's "New connector configuration" action navigates to the create route instead of opening the popup dialog.
rationale: The planning cut the consumer change apart from the screen it consumes -- the list screen and the create route are two sides of one seam, and changing both in one task would leave neither demonstrable on its own.
sources:
- intake/scope.md
objective: The connector configurations list's create action takes the operator to the routed create screen.
criteria:
- Activating "New connector configuration" on the connector configurations list navigates to the create route.
- Activating "New connector configuration" opens no dialog over the connector configurations list.
- The connector configurations list screen holds no create/edit form-target state of its own.
- The "New connector configuration" action renders while the list is loading, while it has failed to load, and while it is empty, as it does today.
- Clicking a row on the connector configurations list still navigates to that connector configuration's own detail route.
depends_on:
- task/connector-configuration-create-route/connector-configuration-create-screen
implements:
- contracts/integration/connector-configuration-registry
---

## What it is
One change to the connector configurations list screen: its create action becomes a navigation, and the state that used to host the dialog goes away with it.
The row-click navigation the screen already performs is untouched.

## Notes
The screen's own test support module currently records that this screen calls no router hook and mounts it without router scaffolding; that statement is already stale for the row-click navigation and will not survive this change either.
REMAINDER, from the specification -- the statement of rules/integration/a-connector-configuration-names-its-connector (a registration whose connector name is absent or an empty string is refused with HTTP 422 reporting an IncompleteConnectorConfigurationError) reaches no criterion of this task: this task only moves the operator from the list to the create route, submits no registration and handles no refusal.
Belongs: the task that writes the routed create/edit connector configuration screen's register-connector submission and its refusal handling, not this navigation-only task.
Advisory: the criterion on the "New connector configuration" action rendering through loading/failed/empty states is anchored to the current code ("as it does today"), not to any candidate; none of them names a loading, failed or empty state of the list screen, so the criterion is falsifiable only against the delivered screen's present behavior.
Advisory: the objective and the first two criteria presuppose a routed create screen already addressable at a create route, and criterion 5 presupposes a per-configuration detail route; no candidate names a route, a screen or a dialog, so which addresses exist and where the action leads is form the layout reference decides, with nothing in the candidates to check the route's own address against.
