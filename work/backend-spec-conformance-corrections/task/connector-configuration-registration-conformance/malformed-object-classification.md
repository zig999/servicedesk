---
title: Register-connector distinguishes a malformed configuration from an incomplete one
summary: A configuration that is not a well-formed JSON object is refused as not well-formed, distinctly from a merely incomplete one.
objective: A connector configuration value that is not a well-formed JSON object is refused as not well-formed, distinctly from a configuration that is well-formed but missing its connector name.
criteria:
  - Registering a connector configuration whose configuration value is null is refused as ConnectorConfigurationNotWellFormedError, not as an incomplete configuration.
  - Registering a connector configuration whose configuration value is an array is refused as ConnectorConfigurationNotWellFormedError, not as an incomplete configuration.
  - Registering a connector configuration whose configuration value is text that does not parse as a JSON object is refused as ConnectorConfigurationNotWellFormedError, not as an incomplete configuration.
  - Registering a connector configuration whose configuration value is already a plain object is accepted, exactly as the same content given as JSON text would be.
  - ConnectorConfigurationNotWellFormedError answers with the HTTP 422 response the specification states.
rationale: I scoped the criteria to null, array and unparsable text, the cases the node's own statement ("not syntactically valid JSON object text") clearly names; I left an entirely absent configuration value out of this task's criteria since the node does not clearly decide whether that is malformed or incomplete, and inventing that reading is not mine to do.
implements:
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
sources:
  - intake/scope.md
---

## What it is

wellFormedConfiguration and registrationProblems classify a null, an array, or unparsable text as not-well-formed rather than incomplete.
An already-parsed object is accepted the same as the text it would parse to.

## Notes

None.
