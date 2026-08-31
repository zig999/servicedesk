---
title: writeConnectorConfigurations upserts by identity instead of deleting the whole table
summary: RelationalConnectorConfigurationStore.writeConnectorConfigurations now upserts each given configuration
  by its own connector identity through INSERT ... ON CONFLICT (connector) DO UPDATE, issuing no DELETE
  at all, so registering or rewriting a connector configuration never removes any row belonging to a different
  connector.
task: sha256:e8fb47b3b888fd317b0b40571326b2e3e8239a09775564635fc6ee9177b6e165
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/relational-connector-configuration-store.repository.ts
  effect: writeConnectorConfigurations no longer runs DELETE FROM connector_configurations followed by
    one INSERT per kept-and-incoming configuration. It now runs, inside the same one transaction (EDG-05),
    one INSERT ... ON CONFLICT (connector) DO UPDATE SET configuration = EXCLUDED.configuration per given
    configuration (renamed from insertStatementFor to upsertStatementFor), so a new connector is inserted,
    an already-held connector is replaced in place, and no row outside the given set is ever read, written
    or deleted. readConnectorConfigurations is unchanged; the header comment and the class's and method's
    own doc comments were rewritten to describe the upsert-by-identity mechanics and cite task/connector-configuration-write-upsert-hotfix
    and the primary key this resolves against.
- path: src/connector-registry/connector-configuration-store.port.ts
  effect: writeConnectorConfigurations' own doc comment on IConnectorConfigurationStore no longer promises
    a whole-table replace ("Replaces the registry's persisted connector configurations, whole."); it now
    states the upsert-by-identity contract the sole production implementation delivers — create fresh
    or replace in place, by connector, never deleting a configuration the call does not name — so the
    port's own documentation matches what RelationalConnectorConfigurationStore actually does.
criteria:
- criterion: Registrar um connector configuration em uma identidade (connector) nova sucede sem apagar
    a configuração de nenhum connector diferente já registrado.
  met: true
  how: registerConnector's write goes through writeConnectorConfigurations, which now issues no DELETE
    at all. A new connector identity runs through upsertStatementFor's INSERT ... ON CONFLICT (connector)
    DO UPDATE, which behaves as a plain INSERT when the identity is new and never touches, locks for deletion,
    or otherwise disturbs any other row.
- criterion: Reescrever a configuração de um connector já registrado substitui exatamente esse connector;
    nenhuma linha de connector_configurations pertencente a um connector diferente é apagada como efeito
    colateral dessa escrita.
  met: true
  how: No statement writeConnectorConfigurations runs is a DELETE of any kind; the only statements it
    sends are per-connector INSERT ... ON CONFLICT (connector) DO UPDATE. Re-registering an already-held
    connector runs the DO UPDATE branch against exactly that row (configuration = EXCLUDED.configuration),
    so a row belonging to a different connector is never a candidate for removal by that write.
- criterion: Nenhuma escrita em connector_configurations emite mais um DELETE sem filtro de WHERE contra
    a tabela inteira.
  met: true
  how: The DELETE FROM ${CONNECTOR_CONFIGURATIONS_TABLE} statement — the only DELETE writeConnectorConfigurations
    ever issued, and the only one with no WHERE clause anywhere in this file — was removed outright rather
    than given a WHERE clause; writeConnectorConfigurations' body is now a loop of upsertStatementFor
    calls with no DELETE statement at all, in either this method or anywhere else in the file.
nodes:
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
  - src/connector-registry/connector-configuration-store.port.ts
  how: 'This contract''s register-connector operation — "creating it or replacing whatever configuration
    already answered to that name" — is what registerConnector (connector-configuration-registry.service.ts,
    unchanged by this task) already expresses at the service level through its own read-filter-append-write.
    This task fixes the persistence beneath it so that promise no longer carries the table-wide-delete
    risk: writeConnectorConfigurations now upserts by connector identity instead of deleting and reinserting
    the whole table on every call. read-connector-configuration and list-connector-configurations are
    unreached by this task, per the task''s own Notes, and remain exactly as delivered.'
- node: domain/integration/connector-configuration
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: The node's identity attribute (connector) is exactly the ON CONFLICT (connector) target the new
    upsertStatementFor names — the same primary key migrations/0008-connector-configuration.sql declares.
    Its "replacing it whole on every edit" is still honored at the row level (the whole configuration
    column is overwritten on the DO UPDATE branch, never merged field-by-field — there is only the one
    column to replace). The node's two other declared facts (configuration held and answered as JSON object
    text; a capability's connector attribute need not resolve) are unreached by this task's criteria and
    are left exactly as already delivered — toConnectorConfiguration and the pass-through of configuration
    text in upsertStatementFor are unchanged from the prior insertStatementFor.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: The Responsibility's "hold the current configuration for each connector name as currently registered"
    (singular per name) is what the connector primary key and the ON CONFLICT (connector) upsert enforce
    at the storage level — exactly one row per connector name, never two. This task's criteria reach only
    which rows a write touches; the registry's two refusal clauses (a configuration that is not a well-formed
    JSON object, and an orphaned Subject-attribute placeholder), both enforced in connector-configuration-registry.service.ts
    before any store write, are unreached by this task and left exactly as already delivered — the store
    never had a role in either check and this change touches no line that ran them.
inferences:
- inferred: writeConnectorConfigurations never deletes a row absent from the given set — it does not attempt
    to reconcile the table down to exactly the given array the way the old delete-and-reinsert did — because
    nothing in this codebase ever calls it to remove a connector configuration from the registry.
  from: connector-configuration-registry.service.ts's registerConnector is the only caller of writeConnectorConfigurations,
    and it always passes [...kept, configuration] — every currently held configuration except the one
    being written, plus that one — so the given set to any one call is already, by construction, everything
    the registry should hold; the same reasoning relational-capability-store.repository.ts's own capability-registry-write-upsert-hotfix
    delivery already recorded for writeCapabilities' identical shape.
- inferred: The DO UPDATE SET clause reassigns only the configuration column (the sole non-key attribute
    this row carries), so a re-registration under an already-held connector identity is a full replace
    of the one declared attribute, matching "replacing it whole on every edit" rather than a partial patch.
  from: migrations/0008-connector-configuration.sql declares exactly two columns — connector (the primary
    key) and configuration — so the DO UPDATE has exactly one non-key column to reassign, and the removed
    INSERT this replaces already wrote that same column whole on every call.
preserved:
- readConnectorConfigurations still answers every configuration fresh from the database on every call,
  with no caching, unchanged.
- writeConnectorConfigurations still runs as one transaction (EDG-05); a failure partway through a batch
  of upserts still leaves none of that call's own writes applied, exactly as the removed delete-and-reinsert
  did for its own batch.
- The configuration attribute is still persisted and read back as JSON object text unchanged (toConnectorConfiguration's
  own JSON.stringify on read, and the pass-through of the domain's already-held text on write) — this
  task touches neither.
- registerConnector's own re-registration semantics — an already-held connector is replaced with the newly
  given configuration — still hold, now delivered through ON CONFLICT DO UPDATE instead of delete-then-insert.
- 'readConnectorConfiguration and listConnectorConfigurations (connector-configuration-registry.service.ts)
  are unchanged: both still read through readConnectorConfigurations, itself untouched by this task.'
- The registry's two write-time refusals (not-well-formed configuration; orphaned Subject-attribute placeholder),
  both enforced in connector-configuration-registry.service.ts ahead of any store call, are untouched
  — this task's file set never ran either check.
- A real constraint violation during a write still rolls the whole transaction back, leaving the table's
  earlier content untouched, per constraints/the-system-persists-to-one-relational-database and EDG-05.
deferred:
- what: connector-configuration-registry.service.ts's registerConnector still computes kept (every currently
    held configuration except the one being written) and passes [...kept, configuration] to writeConnectorConfigurations
    on every call, so a single registration re-upserts every already-held connector's identical configuration
    rather than writing only the one changed identity.
  why: The three criteria are fully satisfied without touching the service — the new upsert never deletes
    and, per criterion 1 and criterion 2, never touches a row it does not name regardless of how large
    the given array is — and narrowing the call site to write only the changed identity is a service-level
    (business-logic) change this task's own file set (the store and its port) does not reach; doing it
    here would widen a corrective task beyond the defect it names, exactly as the sibling capability-registry-write-upsert-hotfix
    delivery deferred the identical call-site shape for capability-registry.service.ts's registerCapability.
- what: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts and
    its integration sibling still assert the removed mechanics directly — a DELETE followed by per-row
    INSERTs — and any test asserting a same-call PRIMARY KEY collision between two rows sharing one connector
    now behaves as an update rather than a unique-violation, since each upsert runs as its own ON CONFLICT
    DO UPDATE statement.
  why: Writing or rewriting tests is not this delegation's task — task-implementer writes source only,
    and reconciling these specs with the corrected mechanics is test-author's judgment, not mine to make
    in this pass.
run: run/connector-configuration-write-upsert-hotfix-write-connector-configurations-upserts-by-identity-build
---

## What it is

A correção do mecanismo de escrita do registry de connector configurations:
writeConnectorConfigurations passa a fazer upsert por identidade (connector), via
INSERT ... ON CONFLICT (connector) DO UPDATE, sem nenhum DELETE.

## Notes

writeConnectorConfigurations não deleta mais nenhuma linha; o único DELETE que existia (sem WHERE, contra a tabela inteira) foi removido, não filtrado.
O DO UPDATE SET reatribui só a coluna configuration, a única não-chave da tabela, preservando a semântica de substituição integral por conector que domain/integration/connector-configuration já declarava.
connector-configuration-registry.service.ts (registerConnector) não foi tocado: continua lendo tudo, filtrando a própria identidade e reenviando kept+new; o novo upsert torna esse padrão seguro, mesma conclusão já registrada para capabilities.
Os dois specs existentes (unit e integration) para este store ainda afirmam a mecânica removida (DELETE + INSERTs, e uma colisão de PRIMARY KEY dentro do mesmo lote) e precisam ser reconciliados pelo test-author nesta mesma entrega.
