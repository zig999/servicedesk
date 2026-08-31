---
title: Connector configuration creation as a routed screen
summary: The connector configuration create path moved out of the popup dialog and onto its own full-page route beside the existing detail/edit route.
rationale: The scope names two registries and states no epic split, so the planning cut one epic per registry -- the connector configuration screens, hooks and dialog share no module with the capability ones, so each epic's tasks are demonstrable without the other epic being finished.
sources:
- intake/scope.md
covers:
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- contracts/integration/connector-configuration-registry
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- contracts/integration/connector-diagnostics
---

## What it is
Everything the operator's create path for a connector configuration needs once it is a full page rather than a popup: the route and its screen, the list screen's entry into it, and the retirement of the dialog it replaces.
The registry surface itself is unchanged -- register-connector is already create-or-replace by name, so what moves here is where an operator authors the registration, not what the registration does.

## Notes
The three tasks are chained by dependency: the route must exist before the list screen can navigate to it, and the list screen must have stopped opening the dialog before the dialog can be removed.
