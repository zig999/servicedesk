---
title: Capability creation as a routed screen
summary: The capability create path moved out of the popup dialog and onto its own full-page route beside the existing detail/edit route.
rationale: The scope names two registries and states no epic split, so the planning cut one epic per registry -- the capability screens, hooks and dialog share no module with the connector configuration ones, so each epic's tasks are demonstrable without the other epic being finished.
sources:
- intake/scope.md
covers:
- domain/integration/capability
- domain/integration/capability-registry
- contracts/integration/capability-registry
- rules/integration/one-capability-answers-one-concept
- contracts/glossary/glossary-query
- rules/integration/a-capability-declares-well-formed-schemas
---

## What it is
Everything the operator's create path for a capability needs once it is a full page rather than a popup: the route and its screen, the browser screen's entry into it, and the retirement of the dialog it replaces.
The registry surface itself is unchanged -- register-capability is already create-or-replace at an identity, so what moves here is where an operator authors the registration, not what the registration does.

## Notes
The three tasks are chained by dependency: the route must exist before the browser screen can navigate to it, and the browser screen must have stopped opening the dialog before the dialog can be removed.
