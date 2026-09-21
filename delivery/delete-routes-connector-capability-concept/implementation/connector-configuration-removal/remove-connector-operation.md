---
target: backend
title: remove-connector on the connector-configuration registry service
summary: Adds ConnectorConfigurationRegistryService.removeConnector, delegating unconditionally to the
  store's deleteConnectorConfiguration with no capability read, no placeholder check and no refusal of
  its own.
task: sha256:0f175ebc618068e602ed43833f879370327fa32e564c340f9f755e066ff47890
run: run/connector-configuration-removal-remove-connector-operation-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: 'Adds a public removeConnector(connector: string): Promise<void> method that awaits this.store.deleteConnectorConfiguration(connector)
    and does nothing else.'
criteria:
- criterion: Where a configuration is registered under the name, the operation removes it and a subsequent
    read of the registry does not return it.
  met: true
  how: removeConnector calls store.deleteConnectorConfiguration(connector); readConnectorConfiguration/listConnectorConfigurations
    both read fresh through the store.
- criterion: Where a capability currently names that connector as its own, this rule does not refuse the
    removal.
  met: true
  how: removeConnector never reads capabilitiesReader; nothing about a capability's existence is consulted
    before or during the delete.
- criterion: A capability naming the removed connector is still registered after the removal, the removal
    writing to no capability.
  met: true
  how: removeConnector's only side effect is the single await on the connector-configuration store; the
    service holds no capability write dependency.
- criterion: The operation consults no capability and performs no placeholder check before removing.
  met: true
  how: The method body is one statement, calling neither refuseOrphanedPlaceholders nor orphanedPlaceholders
    nor capabilitiesReader.readCapabilities.
- criterion: The operation raises no refusal of its own on any condition about the connector's use.
  met: true
  how: removeConnector contains no conditional, no throw and no error class reference; it is a single
    unconditional delegation to the store.
nodes:
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: The node's operations list names remove-connector alongside register-connector; removeConnector
    is that operation, taking the same store dependency already used by register-connector and the reads.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: removeConnector removes the value object registered under a connector name from the store without
    reading or reshaping its attributes.
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: removeConnector consults nothing about capability state and delegates unconditionally to the store's
    deleteConnectorConfiguration, which the sibling store task's delivered implementation already answers
    for the absent-name branch.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: removeConnector adds no new import; it uses only the already-injected IConnectorConfigurationStore
    port and the connector string parameter.
- node: constraints/the-system-persists-to-one-relational-database
  how: This task touches no persistence code; removeConnector calls only the port method the relational
    store already implements.
inferences:
- inferred: The method name removeConnector (camelCase, matching the domain node's remove-connector operation).
  from: The class's own naming convention (registerConnector, readConnectorConfiguration) and CON-01's
    camelCase rule for functions.
deferred:
- what: A route/controller/DTO surface exposing removeConnector over HTTP.
  why: Out of this task's scope by its own rationale — it is cut as the store's consumer and the route's
    dependency, with the HTTP surface reserved for a sibling route task.
---

## What it is
The registry operation the published contract names, and the whole of what its governing rule asks: removal succeeds whether or not a capability names the connector. A single unconditional delegation to the store.

## Notes
None.
