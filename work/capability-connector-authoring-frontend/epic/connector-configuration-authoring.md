---
title: Connector configuration authoring and diagnostic testing
summary: Introduces a new screen to create and edit a connector configuration by name, and a debug-style panel on that screen to exercise it once through a registered capability.
rationale: The scope's stated coverage list groups the connector-configuration aggregate, its registry and its diagnostic-testing policy together; this epic keeps them together because the Test section is scoped by, and only reachable from, the same screen that authors the configuration it tests.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
covers:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - contracts/integration/connector-configuration-registry
  - contracts/integration/connector-diagnostics
---

## What it is

The connector configuration value object, the registry service that replaces it whole on every edit, and the rule bounding what its configuration text may be.
The policy scoping a diagnostic test to a specific, already-registered capability, and the published surface that runs it.

## Notes

None.
