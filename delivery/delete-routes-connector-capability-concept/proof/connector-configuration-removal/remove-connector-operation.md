---
target: backend
title: remove-connector on the connector-configuration registry service — unit proof
summary: Five new unit tests over ConnectorConfigurationRegistryService.removeConnector proving it removes
  a registered configuration, never refuses on any capability-related condition, never consults the capabilities
  reader, leaves a capability naming the removed connector untouched, and succeeds unconditionally against
  a name nothing is registered under.
implementation: sha256:9ff595080fb114f063a39931322f59f330190ece33a120ede27f27dbac959dda
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-removal-remove-connector-operation-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: removes the configuration registered under the name, so a subsequent read of the registry no longer
    returns it
  proves: Criterion 1 — where a configuration is registered under the name, the operation removes it and
    a subsequent read of the registry does not return it.
  fails_when: 'readConnectorConfiguration for the same connector still answers { held: true } after removeConnector
    was called.'
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: does not refuse removing a connector currently named by a registered capability, capability-naming
    being the only condition about a connector's use this domain declares
  proves: Criterion 2 and criterion 5.
  fails_when: removeConnector rejects or throws when a capability is currently registered naming that
    same connector.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: still answers a capability naming the removed connector after the removal, unchanged, since the
    operation writes to no capability
  proves: Criterion 3 — a capability naming the removed connector is still registered after the removal,
    the removal writing to no capability.
  fails_when: readRegisteredCapabilities answers something other than exactly the same capability it held
    before the connector configuration was removed.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: consults no capability before removing, succeeding even though the injected capabilities reader
    would throw if invoked
  proves: Criterion 4 — the operation consults no capability and performs no placeholder check before
    removing.
  fails_when: removeConnector calls capabilitiesReader.readCapabilities() (or otherwise reaches into capability
    state) before deleting.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds without refusal against a connector nothing is registered under, leaving every registered
    configuration exactly as it stood
  proves: The absent-name branch of rules/integration/removing-a-connector-configuration-is-unconditional.
  fails_when: removeConnector throws or rejects for a connector name nothing is registered under, or the
    store's held configurations change as a result of that call.
not_applicable:
- edge_case: An empty-string or otherwise degenerate connector-name value passed to removeConnector.
  why: removeConnector contains no name-format branch; an empty string falls in the same class as any
    other name, and no criterion or node distinguishes it.
- edge_case: The injected store's own deleteConnectorConfiguration call failing or answering slowly.
  why: No criterion or node states removeConnector's behavior when its store dependency fails; that belongs
    to the store port's own contract.
- edge_case: Two removals against the same connector name in flight at once, or a removal racing a registration.
  why: No criterion or node addresses concurrency or ordering guarantees for this operation.
- edge_case: A duplicate or already-removed registration.
  why: Not relevant to a removal operation; the absent-name test already covers 'nothing to remove.'
untested:
- domain/integration/connector-configuration-registry — the node's Responsibility bundles three separable
  duties; this task decides only the removal clause, not registration or hold.
- domain/integration/connector-configuration — the node's fact concerns the value object's shape and replace-whole-on-edit
  behavior at registration time; nothing about it changes at removal.
- rules/integration/removing-a-connector-configuration-is-unconditional — the invariant's return-value-equivalence
  clause is not falsifiable, since removeConnector's return type is void regardless of branch; the task's
  own UNDERDETERMINED note already records this.
- constraints/the-domain-depends-on-no-infrastructure — decided by a dependency audit over the domain
  modules' imports, not by a unit test.
- constraints/the-system-persists-to-one-relational-database — a system-scope statement, not verifiable
  from a single service unit test built against an in-memory store double.
---

## What it is
The tests proving remove-connector-operation: removal takes effect, no refusal on any capability-related condition, no capability consulted, an unrelated capability left untouched, and the absent-name branch succeeds too.

## Notes
None.
