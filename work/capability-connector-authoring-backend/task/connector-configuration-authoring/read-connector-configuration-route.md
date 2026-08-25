---
title: Expose read-connector-configuration as a read HTTP route
summary: A new HTTP route returning the connector configuration currently registered under a named connector.
rationale: The scope's bullet names read-connector-configuration, list-connector-configurations and register-connector together, but each is a separately demonstrable outcome; this task is cut to the read-by-name operation alone, which the service already implements today with no route at all.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: read-connector-configuration is exposed as a read HTTP route returning the connector configuration currently registered under a named connector.
criteria:
  - Reading a connector configuration by a currently registered name returns its connector and configuration fields exactly as currently held.
  - A request to the route carrying no authentication credential is not refused for lacking one.
implements:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - contracts/integration/connector-configuration-registry
  - constraints/no-route-enforces-authentication
---

## What it is

A Fastify route, controller and DTO pair for read-connector-configuration, calling the registry service's existing readConnectorConfiguration.

## Notes

None.
