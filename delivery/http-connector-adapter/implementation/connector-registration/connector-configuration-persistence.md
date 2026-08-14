---
title: Connector configuration's relational persistence boundary, outside the domain
summary: A new connector-registry module (port, service, relational store, migration and factory) that writes and reads a connector's own opaque call configuration through the system's one relational database, reachable by nothing under the domain layer.
task: sha256:5284ae93b4d96ad4860664a2dee5f4c55e980bde30a26323ae8c3da53f8fa3f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/connector-registration-connector-configuration-persistence-build
files:
- path: src/connector-registry/connector-configuration.ts
  effect: 'Declares the pure ConnectorConfiguration and ConnectorConfigurationRegistration value types: a connector identity (the same value domain/integration/capability''s own "connector" attribute names) paired with an opaque configuration payload, with no shape imposed on the payload''s own keys.'
- path: src/connector-registry/connector-configuration-store.port.ts
  effect: Declares IConnectorConfigurationStore, the port through which the registry's registrations reach persistence — readConnectorConfigurations/writeConnectorConfigurations over the whole collection, implemented in persistence/ and imported by nothing under the domain layer.
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: Adds ConnectorConfigurationRegistryService. registerConnector refuses a registration that declares no connector identity or a configuration payload that is not a plain object, then replaces any existing row for that same connector identity before writing the whole collection back. readConnectorConfiguration resolves a connector identity to its currently held configuration, or its absence as data.
- path: src/errors/incomplete-connector-configuration.error.ts
  effect: Adds IncompleteConnectorConfigurationError, raised by registerConnector before any write when a registration departs from the registry's minimum required shape.
- path: src/errors/connector-configuration-store.error.ts
  effect: Adds ConnectorConfigurationStoreError, raised by the relational store when a read or write against connector_configurations fails, carrying the driver failure as its cause.
- path: src/persistence/relational-connector-configuration-store.repository.ts
  effect: 'Adds RelationalConnectorConfigurationStore, implementing IConnectorConfigurationStore against connector_configurations: reads every row fresh on every call, and replaces the whole table (DELETE then re-INSERT every row) inside one transaction on every write, through the shared database-access.ts helpers.'
- path: migrations/0008-connector-configuration.sql
  effect: Creates connector_configurations (connector TEXT primary key, configuration JSONB not null) — the one relational table the new store reads and writes.
- path: src/factories/connector-configuration-registry.factory.ts
  effect: Adds createConnectorConfigurationRegistry(connection), wiring ConnectorConfigurationRegistryService over RelationalConnectorConfigurationStore from the shared DatabaseConnection.
criteria:
- criterion: The connector's call configuration is written to and read from the system's one transactional relational store, never a file the deployment ships or writes.
  met: true
  how: registerConnector and readConnectorConfiguration on ConnectorConfigurationRegistryService go through IConnectorConfigurationStore, implemented only by RelationalConnectorConfigurationStore, which reads and writes the connector_configurations table via runStatement/runInTransaction against the one shared DatabaseConnection every other store in this tree already uses. No file this task added opens or writes a filesystem path anywhere.
- criterion: No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary) imports the connector-configuration store, its persistence driver, or any HTTP client package directly.
  met: true
  how: This task touched no existing file and introduced no import into any domain module; a search of src/src for every name this task introduced (connector-registry, connector-configuration, ConnectorConfiguration) after the change finds only the seven source files this delivery wrote. No HTTP client package was introduced at all.
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: The store is reached only through IConnectorConfigurationStore; the service receives it by constructor injection and imports no driver, and RelationalConnectorConfigurationStore — the one class that does import the connection type — sits behind that port in persistence/, the same separation capability-store.port.ts already holds for the capability registry. Nothing under case behavior, investigation factory, evaluation or vocabulary references any file this task added.
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - migrations/0008-connector-configuration.sql
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: A connector's own call configuration lives in one row of connector_configurations, in the same Postgres database every other record in this project uses, reached through the same DatabaseConnection/runStatement/runInTransaction helpers every sibling relational store already shares; no file this task wrote ever opens or writes to a file.
inferences:
- inferred: A connector's own call configuration is stored as one opaque JSON payload column (configuration JSONB), keyed by the connector identity, rather than named columns for a method, an address, a request or response mapping, or any other structured field.
  from: The task's own Notes granting free technical design over the descriptor's shape; the decision log's "an opaque string keeps vendors out of the model" for domain/integration/capability's own connector attribute; domain/investigation/subject's "a connector resolves internally ... which of the attributes it needs and how to derive its call from them"; and constraints/the-stored-schema-mirrors-the-declared-model, which the epic's own uncovered list leaves open for this task's technical design to resolve — since no Domain Model element describes any structured shape, only an untyped payload avoids inventing named columns that would each need to pair with an attribute nothing declares.
- inferred: Re-registering under an already-held connector identity replaces that connector's row whole, rather than merging it, versioning it, or refusing the second registration.
  from: The inventory's must_not_duplicate entry naming capability-registry.service.ts's own "validate before write, replace-by-identity semantics" as the pattern a registerConnector would mirror.
- inferred: The store port exposes whole-collection read/write (readConnectorConfigurations / writeConnectorConfigurations) rather than row-level upsert or delete-by-key operations.
  from: The inventory's must_not_duplicate entry naming the relational store scaffolding (runStatement, runInTransaction, typed store errors) a new store should reuse, and capability-store.port.ts's own whole-collection shape as the existing precedent for exactly this kind of registry-over-a-store composition.
- inferred: Registration validation is limited to structural well-formedness — a non-empty connector identity and a configuration payload that is a plain object — with no check of any key inside the payload.
  from: The task's own rationale and Notes, which explicitly reject the earlier cut's content-specific checks (an allowed-method vocabulary, a non-empty request-address shape, response-mapping coverage of output_schema, and a tie to the glossary's subject-attribute vocabulary) as unstated by any specification node.
- inferred: The table is named connector_configurations, not the scope's own illustrative http_connectors, and holds no transport-specific column.
  from: The connector-registration epic's own covers list, which names no HTTP-specific node — transport specifics belong to the separate http-observation-runtime epic — together with the scope's own explicit framing of its http_connectors table as a non-binding illustration.
- inferred: A wiring factory (createConnectorConfigurationRegistry) was added under src/factories/, even though no file in this delivery calls it yet.
  from: capability-registry.factory.ts's own precedent for wiring a registry-over-a-store module from the shared DatabaseConnection, and the standard's own ARC-02/ARC-03 convention that a module's construction lives in one factory function under src/factories/ rather than being constructed ad hoc by whichever future task consumes it.
divergences:
- cites: COR-02
  file: src/errors/incomplete-connector-configuration.error.ts
  departure: The error class carries a name, a message and a context field, but no status field.
  why: Every error class already under src/errors/ (CapabilityStoreError, IncompleteCapabilityContractError, InvalidEnvironmentError, and every other sibling) carries the same name/message/context shape with no status field, and no status-map.ts or equivalent single mapping exists anywhere in this project — the presupposition COR-04 states the mapping belongs to. registerConnector is, per the scope's own explicit framing, never a published HTTP operation, so this error never crosses a transport boundary. Inventing a status value for only this one new class, with no central mapping to hold it, would not satisfy COR-04's "one place" requirement and would fragment the existing convention rather than fix it; building the cross-cutting status-mapping infrastructure that would actually satisfy both rules reaches past this task's own objective of persisting configuration in the relational store, so this class follows the codebase's existing, uniform error shape instead.
- cites: COR-02
  file: src/errors/connector-configuration-store.error.ts
  departure: The error class carries a name, a message and a context field, but no status field.
  why: 'Same reasoning as the divergence recorded for incomplete-connector-configuration.error.ts: this class mirrors CapabilityStoreError''s own shape exactly, which itself already carries no status field, and no status-map.ts exists in this project for either to plug into.'
deferred:
- what: No foreign key or existence check ties capabilities.connector to connector_configurations.connector; a capability can name a connector no row here answers.
  why: 'This is exactly the inventory''s own recorded risk, and adding such a constraint is deliberately not part of this task''s criteria: the scope''s own design has a concept whose capability names an unregistered or removed connector resolve silently to the "unavailable"/configuration-error path at call time, never a registration-time or schema-level refusal. Changing that behavior would also require altering the existing capabilities table and its registration path, which this task''s own scope does not reach.'
- what: No script registers a connector configuration (the analogue of seed.ts's own use of registerCapability).
  why: No task in this plan asks for one; the scope frames registerConnector as called ad hoc by an operator against the database, not as a formal seed step this plan produces, and inventing one here would widen this task past its own criteria.
- what: Nothing wires ConnectorConfigurationRegistryService or its factory into production (diagnose-server.factory.ts, production-diagnose.factory.ts) or into any adapter that reads a connector's configuration at call time.
  why: That wiring belongs to the http-observation-runtime epic's own tasks (http-declarative-observation-source, production-wiring-swap), which depend on this task rather than this task reaching into them.
---

## What it is

A new module, connector-registry/, that gives a connector's own opaque call configuration a persistence boundary of its own: a port, a service enforcing validate-before-write and replace-by-identity, a relational store behind that port, a migration for its one table, and a factory wiring the two together.
Nothing under the domain layer references any file this task wrote, and the module introduces no HTTP client — only the relational store side of what a future connector-execution adapter will read from.

## Notes

The descriptor's own shape (an opaque JSON payload, not named columns for method/address/response-mapping) is this task's free technical design, per its own Notes; the epic's covers deliberately leave constraints/the-stored-schema-mirrors-the-declared-model's application to a connector-configuration row open for this resolution.
Two divergences from standard rule COR-02 (no status field on the two new error classes) mirror every sibling error class already in this codebase; building the central status-mapping (COR-04) that would resolve both rules together reaches past this task's own persistence objective.
Nothing wires this registry into production yet — that lands in the http-observation-runtime epic's own tasks, which depend on this one.
