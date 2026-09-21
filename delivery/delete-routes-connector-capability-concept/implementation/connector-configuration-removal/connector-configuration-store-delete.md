---
target: backend
title: Unconditional delete on the connector-configuration store
summary: Adds a name-keyed removal to IConnectorConfigurationStore and implements it in RelationalConnectorConfigurationStore
  as a parameterized DELETE run inside a transaction, leaving the existing upsert-only write untouched.
task: sha256:ee8be2714b2e9c4e5e3bf2857fa65030a0c61a502aee3ab208bb4f5e9a6a1235
run: run/connector-configuration-removal-connector-configuration-store-delete-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/connector-registry/connector-configuration-store.port.ts
  effect: Declares deleteConnectorConfiguration(connector) -> Promise<void> on IConnectorConfigurationStore,
    alongside the existing read and write methods.
- path: src/persistence/relational-connector-configuration-store.repository.ts
  effect: Implements deleteConnectorConfiguration by running a parameterized DELETE FROM connector_configurations
    WHERE connector = $1 inside runInTransaction, mapping any driver failure through the existing raiseWriteFailure
    -> ConnectorConfigurationStoreError path; writeConnectorConfigurations and readConnectorConfigurations
    are unchanged.
criteria:
- criterion: The store port declares a removal keyed by the connector name alone, the one identity a connector
    configuration has.
  met: true
  how: 'IConnectorConfigurationStore gained deleteConnectorConfiguration(connector: string): Promise<void>,
    taking only the connector name.'
- criterion: The relational implementation issues a delete statement against the connector-configuration
    relation inside a transaction.
  met: true
  how: RelationalConnectorConfigurationStore.deleteConnectorConfiguration opens runInTransaction and runs
    a literal DELETE FROM connector_configurations WHERE connector = $1 via runStatement, mirroring deleteManifestEntry/discardDraft
    in relational-case-store.repository.ts.
- criterion: After the removal, a read of the registered connector configurations does not return that
    name.
  met: true
  how: The DELETE removes the row from connector_configurations, the same table readConnectorConfigurations
    selects from.
- criterion: The store port's existing write method keeps its current signature and behaviour, the removal
    being a method of its own rather than a new meaning for the write.
  met: true
  how: writeConnectorConfigurations and its upsertStatementFor helper are unmodified; deleteConnectorConfiguration
    is a new, separate method.
nodes:
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: deleteConnectorConfiguration takes only the connector name and issues the DELETE with no preceding
    existence check and no found/not-found signal (Promise<void>) — a name nothing is registered under
    simply deletes zero rows, completing exactly as a removal that removed one, per the rule's second
    branch.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: Gives the registry's store port and its relational adapter the "remove a connector configuration
    by name, unconditionally" responsibility the node states, as a method distinct from register/write.
- node: domain/integration/connector-configuration
  how: The deletion is keyed by the value object's own connector attribute, its only identity; the node's
    type itself is untouched by this task.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  how: The port addition stays a plain interface method returning Promise<void> with no SQL and no infrastructure
    reference; the SQL DELETE lives only behind that port in the persistence file.
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: The delete runs as one more statement against the same PostgreSQL connection and connector_configurations
    table the store already reads and writes through.
inferences:
- inferred: No guard query precedes the DELETE and no found/not-found value is returned from deleteConnectorConfiguration.
  from: rules/integration/removing-a-connector-configuration-is-unconditional, which states a removal
    naming an unregistered connector is never refused for that absence and is answered exactly as one
    that removed a row, plus the task's own UNDERDETERMINED note confirming no criterion requires reporting
    absence to the caller.
- inferred: A single DELETE statement is still wrapped in runInTransaction rather than issued directly
    against the store's connection.
  from: The task's own criterion (inside a transaction) and its What it is note naming the case store's
    deleteManifestEntry/discardDraft as the shape to mirror, plus writeConnectorConfigurations' own existing
    use of runInTransaction in this file.
preserved:
- writeConnectorConfigurations' upsert-only signature, its ON CONFLICT (connector) DO UPDATE statement,
  and its per-configuration loop inside runInTransaction
- readConnectorConfigurations' SELECT and row-to-domain mapping (toConnectorConfiguration)
deferred:
- what: The three IConnectorConfigurationStore test fixtures (InMemoryConnectorConfigurationStore in connector-configuration-registry.service.spec.ts
    and connector-configuration-draft-generation.spec.ts, SpyConnectorConfigurationStore in registered-method-comparison.spec.ts,
    and the literal failingStore object) do not implement the new deleteConnectorConfiguration member
    and may need updating for the typecheck/build to pass.
  why: Updating a spec file is test authorship, which this task's implementation role does not perform;
    addressed by the proof step (test-author) or a subsequent build failure fed back to the implementer.
- what: The read-modify-write path in ConnectorConfigurationRegistryService.registerConnector, and any
    DELETE route/controller/operation surface for connector removal.
  why: The task and inventory scope this delivery to the store layer alone; the service and route surface
    are sibling tasks in this epic.
---

## What it is
The store-layer half of remove-connector: a real SQL DELETE keyed by connector name, replacing nothing about the existing upsert-only write path.

## Notes
The two other IConnectorConfigurationStore test doubles do not yet implement deleteConnectorConfiguration; the build step will surface this as a typecheck failure if it is not already resolved by the time tests run.
The first build attempt (run/connector-configuration-removal-connector-configuration-store-delete-build) failed typecheck for exactly this reason: three pre-existing test fixtures (InMemoryConnectorConfigurationStore, the failingStore literal, SpyConnectorConfigurationStore) did not yet implement the widened interface. This was fixed by the test-author as part of writing this task's proof, not by this implementation; the second build attempt (run/connector-configuration-removal-connector-configuration-store-delete-build-2) passed.
