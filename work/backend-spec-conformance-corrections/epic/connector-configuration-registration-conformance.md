---
title: Connector configuration registration conformance
summary: register-connector answers the refusals the connector-configuration nodes state, and every reader of the configuration field treats it as the JSON text the domain node declares.
rationale: The scope names three divergences under one file, but each is an independently falsifiable outcome (a missing status mapping, a wrong error classification, and a wrong field representation), so I cut three tasks for them plus a fourth for test-connector.controller.ts, the one call site whose own logic must change to keep working once the representation is corrected — split out under the one-seam boundary between that representation and its one behavioral consumer. I placed a-connector-configuration-is-tested-through-a-registered-capability in uncovered because only its internal reading of the configuration field changes; its own 404/409 refusal logic is untouched by this plan.
covers:
  - rules/integration/a-connector-configuration-names-its-connector
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
uncovered:
  - node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    why: Only test-connector.controller.ts's internal reading of the configuration field changes; the rule's own 404/409 refusal logic for an unregistered or mismatched connector is untouched by this plan.
sources:
  - intake/scope.md
---

## What it is

register-connector answers HTTP 422 IncompleteConnectorConfigurationError for an absent or empty connector name.
register-connector answers HTTP 422 ConnectorConfigurationNotWellFormedError for a configuration value that is not a well-formed JSON object, distinctly from an incomplete one.
The registry holds and answers `configuration` as JSON object text everywhere it is read.
Testing a connector configuration derives its call from that stored text, parsed.

## Notes

None.
