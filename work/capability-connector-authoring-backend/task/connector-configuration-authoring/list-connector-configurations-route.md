---
title: Expose list-connector-configurations as a read HTTP route
summary: A new HTTP route returning every connector configuration currently registered, requiring a new service and store-port method that does not exist today.
rationale: The scope's bullet groups this with read and register, but listing is cut into its own task because no listConnectorConfigurations method exists on the service or its store port at all — a genuinely new outcome distinct from wiring an existing read.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: list-connector-configurations is exposed as a read HTTP route returning every connector configuration currently registered.
criteria:
  - Listing connector configurations returns every connector configuration currently registered, each with its connector and configuration fields.
  - A request to the route carrying no authentication credential is not refused for lacking one.
implements:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - contracts/integration/connector-configuration-registry
  - constraints/no-route-enforces-authentication
---

## What it is

A new listConnectorConfigurations method on the connector-configuration store port and its relational implementation.
A Fastify route, controller and DTO pair for list-connector-configurations built on that method.

## Notes

REMAINDER, from the specification — rules/integration/a-connector-configuration-holds-a-well-formed-object is a candidate for this task, but its statement governs refusal on register/update of a connector configuration, not on reading or listing what is already registered. Its clause reaches no criterion of this listing task; it belongs to task/connector-configuration-authoring/register-connector-route, which implements it.
