Corrective increment (bug found by running the delivered system, not a task's criteria).

Wrong behavior observed: register-connector (PUT /v1/connector-configurations/:connector) is
built on RelationalConnectorConfigurationStore.writeConnectorConfigurations
(src/persistence/relational-connector-configuration-store.repository.ts:77-84), which
unconditionally runs DELETE FROM connector_configurations for the entire table before
reinserting the given batch, inside one transaction. ConnectorConfigurationRegistryService
.registerConnector (connector-configuration-registry.service.ts:84-93) always reads every held
configuration, filters out the one being replaced, and writes the whole resulting set back — so
a single isolated call ends up correct, but two concurrent registerConnector calls for two
different connectors race: whichever write lands last wins the DELETE-then-reinsert and
silently erases the connector the other call had just written, even though it names a different
identity entirely. No table currently holds a foreign key into connector_configurations
(confirmed across every migration 0001-0013), so this has not yet crashed as a 500 the way it
did for capabilities and concepts — but it is the exact same delete-the-whole-table-then-reinsert
defect class already fixed once for capabilities
(task/capability-registry-write-upsert-hotfix/scope-write-to-identity) and once for concepts
(task/glossary-concept-write-upsert-hotfix/write-concepts-upserts-by-identity), and it was
explicitly disclosed as out of scope and not-yet-cut in the concept hotfix's own intake
(work/glossary-concept-write-upsert-hotfix/intake/scope.md): "RelationalConnectorConfigurationStore
.writeConnectorConfigurations has the same table-wide-DELETE bug ... but is a separate,
not-yet-cut corrective task."

Corrective fix to cut as this task: apply the same upsert-by-identity shape already applied to
writeCapabilities, adapted for connector_configurations' one-column-PK shape:

- writeConnectorConfigurations: replace the DELETE FROM connector_configurations + per-item
  INSERT with a per-connector upsert — INSERT INTO connector_configurations (connector,
  configuration) VALUES ($1, $2) ON CONFLICT (connector) DO UPDATE SET configuration =
  EXCLUDED.configuration — no table-wide DELETE FROM connector_configurations, ever. Keep the
  whole batch inside one transaction (existing runInTransaction), preserving all-or-nothing per
  call: a constraint violation partway through a batch must still roll back every write in that
  batch and leave the table's earlier content untouched.
- A write naming one connector identity must never delete, or otherwise touch, a row belonging
  to a different connector identity.
- Update writeConnectorConfigurations' docstring on the port
  (src/connector-registry/connector-configuration-store.port.ts:16, currently "Replaces the
  registry's persisted connector configurations, whole.") and the repository's own
  header/method docstrings (currently describing "replaced whole on every write" / "a DELETE,
  then one INSERT") to state the corrected upsert-by-identity, never-deletes-what-it-doesn't-name
  semantics — mirroring capability-store.port.ts's and
  relational-capability-store.repository.ts's current docstrings.
- ConnectorConfigurationRegistryService.registerConnector is unchanged — it keeps passing the
  full kept+new array; the new upsert makes that safe, the same conclusion already reached for
  capabilities.
- Test reconciliation required, both already-existing specs for this store bake in
  whole-table-replace semantics that the fix removes:
  - src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts:
    101-124 ("deletes every existing row and inserts exactly the given configurations, in that
    order, inside one transaction") asserts the statement sequence BEGIN, DELETE, INSERT,
    INSERT, COMMIT — must instead assert BEGIN, INSERT (ON CONFLICT ...), INSERT (ON CONFLICT
    ...), COMMIT, with no DELETE statement at all.
  - src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts:
    126-137 ("issues only the DELETE and still commits, when replacing the whole table with an
    empty set") no longer holds any meaning under upsert (an empty batch issues no statement
    besides BEGIN/COMMIT) — replace its assertion and title accordingly.
  - src/__tests__/integration/persistence/relational-connector-configuration-store.repository
    .spec.ts:14-17 (file header) documents "replaces the whole ... table on every call (a
    DELETE, then one INSERT)" — correct to describe the upsert-by-identity semantics instead.
  - src/__tests__/integration/persistence/relational-connector-configuration-store.repository
    .spec.ts:77-86 ("answers a read as the database holds it right now, never a value an earlier
    read already answered") currently proves that writing connector-b erases connector-a
    (whole-replace semantics) — split into two proofs, the same way
    task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-replace split its
    capability equivalent: (1) connector-a is left exactly as it was when a different connector,
    connector-b, is written afterward; (2) rewriting the SAME connector identity with a new
    configuration value answers that new value at the very next read, never a value an earlier
    read of the same identity already answered.
  - src/__tests__/integration/persistence/relational-connector-configuration-store.repository
    .spec.ts:88-100 ("leaves the table's earlier content untouched, when a later insert inside
    one replace violates a real constraint") currently forces a real constraint violation by
    giving writeConnectorConfigurations two rows sharing one connector identity in the same
    call, colliding on the primary key under the removed delete-then-insert mechanics — under
    the new per-identity ON CONFLICT DO UPDATE this no longer collides at all (the second row's
    own upsert just updates the row the first one just inserted). Replace with a genuine
    constraint the new upsert cannot avoid (e.g. a NOT NULL violation on configuration, in a
    two-item batch alongside an already-held, unrelated connector) that still proves EDG-05: a
    failure partway through a batch rolls the whole write back, leaving the table's earlier
    content untouched.
  - No FK-violation reproduction test is needed or possible here (unlike the capability
    hotfix's own reproduction test): no table currently references connector_configurations by
    foreign key, so there is no real-database precondition to reproduce that class of 500 for
    this store. This is an expected difference from the capability hotfix's own proof set, not
    a gap.

Out of scope: no change to ConnectorConfigurationRegistryService, to any HTTP route, or to any
migration/schema. capabilities and concepts are already fixed and are not touched by this task.

State this as a single corrective task, no survey, no decomposition, bound to the
connector-configuration specification nodes the way the capability hotfix task was bound to the
capability ones and the concept hotfix task was bound to the concept ones.
