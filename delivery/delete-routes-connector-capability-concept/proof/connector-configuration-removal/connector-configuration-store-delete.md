---
target: backend
title: Proof for the connector-configuration store's unconditional delete-by-name
summary: New tests over IConnectorConfigurationStore.deleteConnectorConfiguration and RelationalConnectorConfigurationStore
  cover the declared port shape, the transactional DELETE and its failure path, the read-exclusion after
  removal, and the rule's unconditional-on-absence branch; write's own pre-existing suite is cited unmodified
  for the untouched-write criterion; three IConnectorConfigurationStore test doubles were widened to compile
  against the new interface member.
implementation: sha256:862ea9bc3f4865fda34e6fe2f555f401bc480d7293958b27b011b7e26cd0d43c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-removal-connector-configuration-store-delete-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-store.port.spec.ts
  name: declares deleteConnectorConfiguration keyed by the connector name alone, returning Promise<void>,
    alongside the existing read and write methods
  proves: 'Criterion: the store port declares a removal keyed by the connector name alone, the one identity
    a connector configuration has.'
  fails_when: IConnectorConfigurationStore.deleteConnectorConfiguration is declared with a parameter list
    other than exactly one string or with a return type other than Promise<void>.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: issues exactly one parameterized DELETE against connector_configurations inside BEGIN and COMMIT,
    naming only the connector, with no guard query ahead of it
  proves: 'Criterion: the relational implementation issues a delete statement against the connector-configuration
    relation inside a transaction.'
  fails_when: deleteConnectorConfiguration fails to wrap the DELETE in BEGIN/COMMIT, sends a different
    statement or table/column, fails to parameterize the connector value, or issues any additional statement
    before the DELETE.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when the delete is refused
  proves: The transaction guarantee criterion 2 requires for the delete's own failure path, wired the
    same way write's already-tested failure path is.
  fails_when: a driver failure during the DELETE propagates untyped, is not wrapped as ConnectorConfigurationStoreError,
    fails to issue ROLLBACK, or leaves the client unreleased.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: removes the named connector configuration so a subsequent read no longer includes it, leaving
    a different, unrelated connector configuration untouched
  proves: 'Criterion: after the removal, a read of the registered connector configurations does not return
    that name — against the real database, with a sibling row left standing.'
  fails_when: a read taken after deleteConnectorConfiguration still returns the removed connector, or
    the removal also drops or alters the unrelated connector's row.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: resolves without refusal, and leaves every currently registered configuration untouched, when
    the named connector is one nothing is registered under
  proves: The rule's own second branch and the UNDERDETERMINED entry — it fails over exactly the implementation
    the entry describes (a store that instead reports absence via a found/not-found flag, a deleted-row
    count, or a not-registered error).
  fails_when: deleteConnectorConfiguration throws or rejects for a connector name nothing is registered
    under, resolves to any value other than undefined, or removes/alters an unrelated already-registered
    configuration as a side effect.
  demonstrates: rules/integration/removing-a-connector-configuration-is-unconditional
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: upserts each given configuration by its own connector identity, inside one transaction, and never
    sends a DELETE
  proves: 'Criterion: the store port''s existing write method keeps its current signature and behaviour.
    Pre-existing test, unmodified by this task; it already asserts writeConnectorConfigurations never
    issues a DELETE.'
  fails_when: writeConnectorConfigurations starts issuing a DELETE statement, or its upsert statement
    or transaction shape changes.
not_applicable:
- edge_case: An empty-string or otherwise degenerate connector name passed to deleteConnectorConfiguration
  why: The store performs no validation of the connector value; it is passed straight through as a parameter
    to a WHERE clause. Falls in the same equivalence class as any other name nothing is registered under,
    already covered.
- edge_case: A second deleteConnectorConfiguration call racing a concurrent write or read against the
    same connector name
  why: No criterion or node states an ordering guarantee for concurrent operations; row-level locking
    inside a transaction is PostgreSQL's own guarantee, not something this task introduces.
- edge_case: An operation attempted against state that forbids the removal
  why: rules/integration/removing-a-connector-configuration-is-unconditional states there is no such state
    — the removal is unconditional by definition.
- edge_case: A dependency that answers slowly (latency/timeout) during the delete
  why: No criterion or node states a timeout or retry behaviour for this store, and none of the store's
    existing methods carries one either.
untested:
- 'rules/integration/removing-a-connector-configuration-is-unconditional''s capability-independence clause
  ("succeeds whether or not any capability currently names it as its own connector") is not decided by
  any test in this task''s scope: deleteConnectorConfiguration takes only a connector name and never reads
  a capability''s registration, so no non-vacuous test can vary capability presence at this layer. That
  clause is decided, if at all, at the registry/capability-registry layer this task does not implement.'
- domain/integration/connector-configuration-registry's fact spans register-connector, hold and remove-connector
  as one domain-service responsibility; this task implements only the store primitive, so no test here
  decides the node's fact whole.
- domain/integration/connector-configuration's fact concerns the value object's own hold/replace-whole
  responsibility, which this task's type is untouched by, so there is no new behaviour for a test to decide
  against this node.
- 'constraints/the-domain-depends-on-no-infrastructure is scope: system, decided by the lint step per
  the project''s own standard, not by a test in this suite; the pre-existing repo-wide audit does not
  scan the connector-registry directory this task''s port file sits in.'
- 'constraints/the-system-persists-to-one-relational-database is scope: system (everything the system
  records, together); this task''s own tests demonstrate only this one store''s compliance, necessary
  but not sufficient to decide the system-wide claim.'
---

## What it is
The tests proving connector-configuration-store-delete: the port's declared shape, the transactional DELETE, its failure path, read-exclusion after removal, and the unconditional-on-absence branch — plus repair of three IConnectorConfigurationStore test doubles that no longer compiled against the widened interface.

## Notes
The test-author had no shell in this session and could not run npm run typecheck directly; the fixture repairs were verified by re-reading each file after editing, and the caller re-ran the build to confirm.
run/connector-configuration-removal-connector-configuration-store-delete-build failed typecheck, cause: code — three pre-existing test fixtures did not implement the widened IConnectorConfigurationStore interface. run/connector-configuration-removal-connector-configuration-store-delete-build-2, run first after this proof's fixture repairs, passed.
