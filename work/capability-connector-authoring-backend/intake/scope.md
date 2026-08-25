Build the backend authoring surface for Capability, Connector Configuration and Concept — create
and edit for each — plus a diagnostic test-connector operation, none of which is exposed as an
HTTP route today.

Covers the specification nodes:
  domain/integration/capability, domain/integration/connector-configuration,
  domain/integration/connector-configuration-registry, domain/integration/capability-registry,
  domain/glossary/concept,
  rules/integration/a-capability-declares-its-contract,
  rules/integration/a-capability-is-read-only,
  rules/integration/one-capability-answers-one-concept,
  rules/integration/a-capability-declares-well-formed-schemas,
  rules/integration/a-connector-configuration-holds-a-well-formed-object,
  rules/integration/a-connector-configuration-is-tested-through-a-registered-capability,
  contracts/integration/capability-registry,
  contracts/integration/connector-configuration-registry,
  contracts/integration/connector-diagnostics,
  contracts/glossary/glossary-authoring

Backend work:
- Expose register-capability as a write HTTP route (create at a new (name, version), or replace
  in place at an existing one). Refuse a registration whose input_schema or output_schema is not
  syntactically valid JSON, and any capability whose nature is not read-only (both already
  domain-service responsibilities, per capability-registry.md; today's registerCapability has no
  HTTP route and the JSON check does not exist yet).
- Expose read-connector-configuration, list-connector-configurations and register-connector as
  write/read HTTP routes for Connector Configuration (a formalized value-object; the
  `connector_configurations` table and `ConnectorConfigurationRegistryService.registerConnector`
  already exist in code, called only by seed.ts — no HTTP route exists at all today, not even to
  read one). Refuse a registration whose configuration is not syntactically valid JSON object text.
- Expose register-concept as a write HTTP route for Concept (create at a new name, or replace in
  place at an existing one). Concept has no write path today, HTTP or otherwise.
- Expose test-connector: given a specific, already-registered capability that names a connector
  configuration, and a subject assembled the same way any other observation assembles one (a
  subject type plus attribute-values supplied in the request — never a subject read back from a
  store, because nothing in this system stores one), issue the connector's real call exactly as
  resolveConnectorRequest already resolves it for a real observation, and return the raw request
  actually sent and the raw response received (status, headers, body, timing), writing nothing —
  no evidence, no citation. Refuse the operation where the named capability's connector does not
  match the connector configuration named, or where the capability is not registered at all
  (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability).
- No authentication or authorization on any of these routes — matches
  constraints/no-route-enforces-authentication, which already holds for every existing route.
- Deletion of a capability, a connector configuration, or a concept is out of scope.

This is the backend half of a two-target increment; the frontend half (Capability, Concept and
Connector Configuration editor screens, including the "Test" UI) is planned separately, as
initiative capability-connector-authoring-frontend, against the frontend target.
