---
title: writeConnectorConfigurations upserts by connector identity, without a whole-table DELETE
summary: Proves that writeConnectorConfigurations never issues an unfiltered DELETE, never touches a row
  belonging to a different connector, upserts a rewritten identity in place, and — against the UNDERDETERMINED
  append-only candidate the task's Notes name — leaves exactly one row per connector after two writes
  to the same identity; reconciles both pre-existing specs off the removed delete-and-reinsert mechanics.
implementation: sha256:a02d5fcfde8c0ea87dabd0f137ff6076ef0d1a352948923ac48078c0e788adde
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: upserts each given configuration by its own connector identity, inside one transaction, and never
    sends a DELETE
  proves: criterion 3 (no unfiltered DELETE against the table) and criteria 1-2's per-identity write mechanics
  fails_when: writeConnectorConfigurations issues any DELETE statement, does not send one INSERT ... ON
    CONFLICT (connector) DO UPDATE per given configuration, sends them out of order relative to BEGIN/COMMIT,
    or sends the wrong params for either row
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty set
  proves: criterion 3 holds at the empty-batch edge case (the old whole-replace mechanics issued an unconditional
    DELETE here)
  fails_when: writing an empty array issues a DELETE, an INSERT, or anything besides BEGIN/COMMIT
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when the write is refused
  proves: EDG-05/COR-02 — a failed statement inside the transaction is wrapped in ConnectorConfigurationStoreError
    and rolls back (unchanged mechanic, re-verified against the new statement shape)
  fails_when: the error is not wrapped, the cause is lost, or ROLLBACK is not issued
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a read with the connector identity and its configuration exactly as the row holds them
  proves: criterion 1's read side (unchanged, re-verified)
  fails_when: the mapped ConnectorConfiguration does not match the row
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers the second call's own rows, never a value the first call already answered
  proves: no caching across reads (unchanged, re-verified)
  fails_when: the second read answers the first call's rows
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: read failure wrapping (unchanged, re-verified)
  fails_when: the raw driver error reaches the caller unwrapped
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: this store and the connector-registry module it implements open no file on disk
  proves: STK-12/architecture boundary (unchanged, re-verified)
  fails_when: any of the four files imports node:fs or require('fs')
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: persists and reads back a connector configuration exactly as given
  proves: criterion 1 against a real database (unchanged, re-verified)
  fails_when: the round trip does not answer the exact configuration written
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: leaves connector-a exactly as it was when a different connector, connector-b, is written afterward
  proves: criteria 1 and 2 — writing a new connector identity never removes a different, already-registered
    connector's row (replaces the old whole-replace-erases-the-first-write assertion)
  fails_when: connector-a's row is missing or altered after connector-b is written
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a rewritten connector with its new value at the very next read, never a value an earlier
    read of the same identity already answered
  proves: criterion 2 — rewriting an already-registered connector replaces exactly that row's value, with
    no caching
  fails_when: the read after the rewrite answers the original value or more than one row for that connector
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: keeps exactly one row for a connector name after two writes to the same identity, never appending
    a duplicate
  proves: the task's UNDERDETERMINED entry — excludes an append-only writeConnectorConfigurations that
    never updates or deletes an existing row and instead appends a new row per write, since such an implementation
    would leave two rows for the same connector name
  fails_when: two writes to the same connector identity leave more than one row for that name in connector_configurations
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: rolls the whole write back and leaves the table's earlier content untouched, when a later upsert
    in the same batch violates a real constraint
  proves: EDG-05 — a genuine NOT NULL violation partway through a multi-item batch rolls the whole transaction
    back, leaving both the already-held row and the earlier-in-batch valid row unpersisted (replaces the
    old same-connector-collision test, which no longer collides under per-identity ON CONFLICT DO UPDATE)
  fails_when: the already-held row is altered, or the valid-second-connector row from the failed batch
    is persisted despite the batch failing
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no connector identity: the write is refused by the real database and nothing
    is stored'
  proves: NOT NULL on the primary key is still enforced and wrapped (unchanged, re-verified)
  fails_when: the write succeeds, the error is not wrapped/matched, or a row is persisted
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no configuration payload: the write is refused by the real database and
    nothing is stored'
  proves: NOT NULL on configuration is still enforced and wrapped (unchanged, re-verified)
  fails_when: the write succeeds, the error is not wrapped/matched, or a row is persisted
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: holds only the connector and configuration columns — no transport-specific column such as a method
    or an address
  proves: schema shape inference (unchanged, re-verified)
  fails_when: the table gains or loses a column
untested:
- True concurrent writes racing against the same connector identity, or a write racing a read, at the
  database's own transaction-isolation level. The objective names this window as the motivation for the
  fix, but the three stated criteria are falsifiable through single-connection, sequential statement mechanics
  (no DELETE, no cross-connector row touched, per-identity upsert) — none of them requires demonstrating
  an actual race under concurrent transactions. Building a genuine two-connection race harness is outside
  what a stand-in-for-the-driver unit test or a sequential integration test can prove, and no criterion
  asks for it; the absence is left here rather than simulated with a test that could not actually observe
  two transactions interleaving.
- registerConnector's own call-site shape — reading everything held, filtering the one identity being
  written, and resending [...kept, configuration] on every registration — is unchanged and still re-upserts
  every already-held connector's identical configuration on each call. The implementation record defers
  this to a future task rather than claiming it, and no criterion of this task reaches the service layer's
  call-site efficiency; the existing service-level tests (untouched by this task) already cover registerConnector's
  observable behavior, and writing a new one now would test a shape this task did not change.
run: run/connector-configuration-write-upsert-hotfix-write-connector-configurations-upserts-by-identity-suite-2
---

## What it is

A prova de que writeConnectorConfigurations upserta por identidade de connector sem nenhum DELETE
sem filtro, nunca toca a linha de um connector diferente, e mantém exatamente uma linha por
connector mesmo sob a implementação "append-only" que o UNDERDETERMINED do task exclui.

## Notes

A primeira tentativa da suíte (run/connector-configuration-write-upsert-hotfix-write-connector-configurations-upserts-by-identity-suite) falhou no passo test com "node: .env.test: not found" — o failure-diagnostician classificou a causa como setup (o harness/ambiente desta worktree não tinha o .env.test, um arquivo git-ignorado que não é copiado para uma worktree nova), não código nem teste. O arquivo foi copiado do checkout original e a suíte rodou de novo, sob -suite-2, passando inteira (144 arquivos, 1682 testes).
