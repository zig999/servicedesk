---
title: Connector configuration authoring surface
summary: The read, list and write HTTP routes over connector configurations, including the list capability that does not exist anywhere in the code today.
rationale: Connector Configuration gets its own epic distinct from Capability because it is a separate aggregate with its own registry service and its own well-formedness rule (JSON object text, not JSON-in-general); it groups read, list and register because all three surface the same value-object.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
covers:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - contracts/integration/connector-configuration-registry
  - constraints/no-route-enforces-authentication
---

## What it is

The epic delivering read-connector-configuration, list-connector-configurations and register-connector as HTTP routes.
It covers the connector configuration value-object, its registry service and the one rule governing configuration well-formedness.
It covers the no-authentication constraint because these are new routes reaching the API layer.

## Notes

None.
