---
title: Register-connector maps a missing connector name to its stated refusal
summary: An absent or empty connector name is answered with the HTTP 422 the specification states, not the registry's default.
objective: Registering a connector configuration with no connector name, or an empty one, is refused with the HTTP 422 response the specification states, rather than the registry's unmapped default.
criteria:
  - Registering a connector configuration whose connector attribute is absent is refused with HTTP 422 reporting IncompleteConnectorConfigurationError.
  - Registering a connector configuration whose connector attribute is an empty string is refused with HTTP 422 reporting IncompleteConnectorConfigurationError.
  - Neither case falls back to the registry's default, unmapped error response.
rationale: I isolated the status-mapping gap as its own task because it is a one-line status-registration fix with a falsifiable outcome fully independent of the malformed-object classification task, which changes what is raised rather than how it is reported.
implements:
  - rules/integration/a-connector-configuration-names-its-connector
sources:
  - intake/scope.md
---

## What it is

IncompleteConnectorConfigurationError is registered in the status map to answer HTTP 422.

## Notes

None.
