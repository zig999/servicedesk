---
title: Connector-configuration registry holds configuration as text
summary: configuration is stored and answered as JSON object text everywhere it is read, matching the domain node's declared string type.
objective: The connector-configuration registry stores and answers `configuration` as JSON object text, matching its declared string type, across registration, single read and list.
criteria:
  - A connector configuration read back after registration answers `configuration` as a JSON text string, not a parsed object, from read-connector-configuration.
  - A connector configuration read back after registration answers `configuration` as a JSON text string, not a parsed object, from list-connector-configurations.
  - A connector configuration registered with the configuration supplied as a parsed object round-trips to the same content as text on every subsequent read.
rationale: I isolated the field's own storage representation from the one call site that consumes it as an object to derive a call (test-connector.controller.ts), under the one-seam boundary between an interface's own shape and its consumer.
implements:
  - domain/integration/connector-configuration
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - contracts/integration/connector-configuration-registry
sources:
  - intake/scope.md
---

## What it is

The connector-configuration registry service's internal field for configuration is a string, not a parsed object.

## Notes

None.
