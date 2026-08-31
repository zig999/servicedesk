---
title: writeConnectorConfigurations upserts by identity — full proof
summary: Tests proving the corrected connector-configuration store upserts by connector identity, deletes
  nothing, and satisfies the corrective task's three criteria, rewritten whole to close the coverage gap
  on criterion 2 and to relabel the schema-fitness test the review found mislabeled as an inference.
implementation: sha256:a02d5fcfde8c0ea87dabd0f137ff6076ef0d1a352948923ac48078c0e788adde
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a read with the connector identity and its configuration exactly as the row holds them
  proves: 'Criterion 1 (read side): readConnectorConfigurations answers every configuration currently
    held, mapped from the row exactly as persisted.'
  fails_when: toConnectorConfiguration stops mapping the row's connector/configuration fields onto the
    answered ConnectorConfiguration exactly as given, or readConnectorConfigurations no longer issues
    the plain SELECT.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers the second call's own rows, never a value the first call already answered
  proves: Criterion 1's fresh-read guarantee — readConnectorConfigurations caches nothing between calls.
  fails_when: the store starts answering a cached result instead of querying the connection again on the
    second call.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: a refused read is surfaced as ConnectorConfigurationStoreError carrying the driver's failure
    as cause, never a raw or swallowed error.
  fails_when: raiseReadFailure stops wrapping the driver's rejection, or the store lets a non-typed error
    escape.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: upserts each given configuration by its own connector identity, inside one transaction, and never
    sends a DELETE
  proves: Criteria 1-3's mechanics — writeConnectorConfigurations runs BEGIN, one INSERT ... ON CONFLICT
    (connector) DO UPDATE per configuration with the right params, then COMMIT, and never emits a DELETE
    statement (EDG-05).
  fails_when: the statement sequence stops matching (a DELETE reappears, a configuration is skipped or
    its params are wrong, or BEGIN/COMMIT no longer bracket the batch), or the client is not released
    exactly once.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty set
  proves: the empty-input edge case — an empty configurations array still opens and closes the transaction
    cleanly and touches no row.
  fails_when: writing an empty array sends any statement besides BEGIN/COMMIT, or fails to commit, or
    fails to release the client.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when the write is refused
  proves: EDG-05/COR-02 — a failed upsert rolls the transaction back and surfaces as this store's own
    typed error carrying the driver failure as cause.
  fails_when: a write failure stops triggering ROLLBACK, stops releasing the client, or reaches the caller
    as anything other than ConnectorConfigurationStoreError with the original cause.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: this store and the connector-registry module it implements open no file on disk
  proves: the store and its collaborators persist only through the database connection, never the filesystem.
  fails_when: any of the four named files starts importing node:fs or requiring fs.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: persists and reads back a connector configuration exactly as given
  proves: Criterion 1 — writing a single new connector persists it, and reading answers it back exactly
    as given, against a real database.
  fails_when: the written configuration is not returned unchanged by the next read.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: leaves connector-a exactly as it was when a different connector, connector-b, is written afterward
  proves: Criterion 1 — registering a brand-new connector identity (connector-b) does not remove or alter
    a different, already-registered connector's row (connector-a), against a real database.
  fails_when: writing connector-b makes connector-a disappear from a subsequent read, or alters its stored
    value, or the table stops holding both rows.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a rewritten connector with its new value at the very next read, never a value an earlier
    read of the same identity already answered
  proves: Criterion 2's substitution half, and the fresh-read guarantee, for a lone identity — rewriting
    an already-registered connector replaces its value and the next read answers only the new one.
  fails_when: a rewrite fails to change the stored value, or the read after a rewrite still answers the
    original configuration, or a second row appears for the same connector.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: rewrites connector-a in place and leaves connector-b, a different, already-registered connector,
    exactly as it was
  proves: Criterion 2 in full, both halves together against the real database — rewriting an already-registered
    connector (connector-a) substitutes exactly that connector's row, while a different, already-registered
    connector's row (connector-b) is neither deleted nor altered by that write. Closes the coverage-audit
    finding that the existing suite never observed a rewrite of an already-registered identity beside
    a surviving different connector.
  fails_when: rewriting connector-a fails to persist its new value, or the rewrite removes or alters connector-b's
    row, or connector-b is missing from the read that follows.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: keeps exactly one row for a connector name after two writes to the same identity, never appending
    a duplicate
  proves: the UNDERDETERMINED entry the task's Notes name — an append-only writer that never updates or
    deletes satisfies the three stated criteria as written but leaves list-connector-configurations answering
    duplicates for one connector name, which domain/integration/connector-configuration's identity and
    domain/integration/connector-configuration-registry's singular-per-name Responsibility refuse.
  fails_when: two writes to the same connector identity leave more than one row for that connector — the
    signature of an append-only, non-upserting implementation.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: rolls the whole write back and leaves the table's earlier content untouched, when a later upsert
    in the same batch violates a real constraint
  proves: EDG-05, against a real database — a genuine constraint violation partway through a batch rolls
    every upsert in that call back, including the ones that would otherwise have succeeded, leaving prior
    state untouched.
  fails_when: a partial set of the batch's upserts is left applied after the constraint violation, or
    the pre-existing row is altered, or the rejection's cause no longer names the real NOT NULL violation.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no connector identity: the write is refused by the real database and nothing
    is stored'
  proves: the absent-required-attribute edge case for connector — a write missing its identity is refused
    by the real database's own NOT NULL constraint and stores nothing.
  fails_when: the write with no connector value succeeds, or fails with something other than ConnectorConfigurationStoreError/NOT
    NULL, or leaves a row behind.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no configuration payload: the write is refused by the real database and
    nothing is stored'
  proves: the absent-required-attribute edge case for configuration — a write missing its payload is refused
    by the real database's own NOT NULL constraint and stores nothing.
  fails_when: the write with no configuration value succeeds, or fails with something other than ConnectorConfigurationStoreError/NOT
    NULL, or leaves a row behind.
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: holds only the connector and configuration columns — no transport-specific column such as a method
    or an address
  proves: 'constraints/the-stored-schema-mirrors-the-declared-model''s own fitness, read against domain/integration/connector-configuration''s
    two declared attributes (connector, configuration) — every column of connector_configurations pairs
    with a declared attribute and every declared attribute has a column, so no transport-specific column
    such as a method or an address exists, exactly as the domain node''s own restraint on configuration''s
    shape (a well-formed JSON object, nothing more fixed) already states directly rather than by inference.
    The banner above this test was reworded to cite the constraint and the domain node this checks, in
    place of the review''s flagged ''inference: no transport-specific column'' label; the test''s own
    assertion is unchanged.'
  fails_when: connector_configurations gains a column beyond connector and configuration (e.g. a method
    or address column), or loses either of the two the domain node requires.
not_applicable:
- edge_case: a boundary at each end of a numeric range
  why: no criterion, node, or column this task reaches states a numeric range (a limit, an offset, a count)
    — writeConnectorConfigurations takes a set of configurations with no stated size bound, so there is
    no boundary to place a test at.
- edge_case: an operation attempted against state that forbids it
  why: the corrected write is an unconditional per-identity upsert — a new connector is inserted, an already-held
    one is replaced — with no state (already registered, or not) that the write refuses; EDG-04 has no
    forbidding state to name here.
untested:
- 'Two writers upserting the same connector identity concurrently (two operations against one subject
  at once): the suite runs every write sequentially against one connection, and nothing in this file''s
  own architecture (no injected delay, no held-open transaction to race against) lets a second, real overlapping
  write be driven against the same row while the first is still in flight. Postgres'' own row-level locking
  under ON CONFLICT ... DO UPDATE is what would make this safe, but no test here observes it directly
  against two truly concurrent callers.'
- connector-configuration-registry.service.ts's registerConnector still re-upserts every already-held
  connector's identical configuration on each call (the implementation record's own deferred item) — untested
  here because it is explicitly out of this task's criteria and file set, not because it is unobservable.
run: run/connector-configuration-write-upsert-hotfix-write-connector-configurations-upserts-by-identity-suite-3
---

## What it is

A prova de que writeConnectorConfigurations upserta por identidade de connector sem nenhum DELETE
sem filtro, nunca toca a linha de um connector diferente mesmo quando reescreve outra identidade
já registrada, e mantém exatamente uma linha por connector mesmo sob a implementação "append-only"
que o UNDERDETERMINED do task exclui.

## Notes

Este proof foi reescrito por inteiro (proof-only re-delivery) em resposta a dois achados do primeiro /review-change desta tarefa, com a implementação inalterada (confirmado via trace.py --check --all: nenhum dos três nós que esta tarefa vincula está com drift): (1) o coverage pass marcou o critério 2 como parcial, porque nenhum teste reescrevia uma identidade já registrada enquanto uma identidade diferente estava presente — o novo teste "rewrites connector-a in place and leaves connector-b ... exactly as it was" fecha isso; (2) o conformance pass apontou que o banner do último teste rotulava de "inference" um fato que domain/integration/connector-configuration já declara diretamente — o banner foi reescrito para citar o nó e a constraint, sem mudar a asserção do teste. Os dois achados de standard (STK-08, MNT-03) do mesmo review não foram tratados aqui — ficaram fora do escopo desta re-entrega, por pedido explícito.
A primeira tentativa da suíte original (run/connector-configuration-write-upsert-hotfix-write-connector-configurations-upserts-by-identity-suite) falhou no passo test com "node: .env.test: not found", causa setup (harness/ambiente desta worktree sem o .env.test git-ignorado) — não código nem teste; a suíte seguinte (-suite-2) passou inteira. Esta reentrega rodou sob -suite-3, também inteira (144 arquivos, 1683 testes).
