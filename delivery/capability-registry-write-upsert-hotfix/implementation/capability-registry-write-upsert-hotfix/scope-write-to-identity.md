---
title: writeCapabilities upserts by identity instead of deleting the whole table
summary: RelationalCapabilityStore.writeCapabilities now upserts each given capability by its own (name,
  version) identity through INSERT ... ON CONFLICT DO UPDATE, issuing no DELETE at all, so a registration
  no longer fails or destroys unrelated rows when any capability is referenced by investigation_evidence.
task: sha256:6ca1d703c34527428033581bd424f3bc4ba4f62fb9e8635e140bd869753b8e70
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/relational-capability-store.repository.ts
  effect: writeCapabilities no longer runs DELETE FROM capabilities followed by one INSERT per kept-and-incoming
    capability. It now runs, inside the same one transaction (EDG-05), one INSERT ... ON CONFLICT (name,
    version) DO UPDATE per given capability (renamed from insertStatementFor to upsertStatementFor), so
    a new identity is inserted, an already-held identity is replaced in place, and no row outside the
    given set is ever read, written or deleted. readCapabilities and the rest of the file are unchanged;
    the header comment and the class's and method's own doc comments were rewritten to describe the upsert-by-identity
    mechanics and cite task/capability-registry-write-upsert-hotfix and the FK this fixes.
- path: src/capability-registry/capability-store.port.ts
  effect: writeCapabilities' own doc comment on ICapabilityStore no longer promises a whole-table replace
    ("Replaces the registry's persisted registrations, whole"); it now states the upsert-by-identity contract
    the sole production implementation delivers -- create fresh or replace in place, by (name, version),
    never deleting a registration the call does not name -- so the port's own documentation matches what
    RelationalCapabilityStore actually does.
criteria:
- criterion: PUT /v1/capabilities/perfil-mobile-tecnico-reader/1.0.0 com um input_schema alterado, contra
    um banco onde essa identidade já tem ao menos uma linha em investigation_evidence citando-a, responde
    200 com a capability atualizada, nunca 500.
  met: true
  how: registerCapability's write now runs through writeCapabilities' new upsertStatementFor, which issues
    INSERT ... ON CONFLICT (name, version) DO UPDATE SET nature/input_schema/output_schema/timeout/connector/concept
    = EXCLUDED.*. That statement never deletes any row of capabilities, so a row investigation_evidence_capability_fkey
    (migrations/0005-investigation.sql) already references -- whether at this identity or another one
    held in the same batch -- can no longer trigger a 23503 foreign-key violation the way the removed
    table-wide DELETE did; the identity's own row is simply updated in place and the request succeeds.
- criterion: Registrar uma capability em uma identidade (name, version) nova sucede mesmo quando outra
    capability já registrada está referenciada por investigation_evidence.
  met: true
  how: Because writeCapabilities no longer issues any DELETE, registering a brand-new (name, version)
    inserts that one row via ON CONFLICT (name, version) DO UPDATE (which behaves as a plain INSERT when
    the identity is new) without ever touching, locking for deletion, or otherwise disturbing any other
    row -- including one an investigation_evidence row's foreign key already cites.
- criterion: Uma linha de capabilities referenciada por investigation_evidence nunca é apagada como efeito
    colateral de escrever uma capability de identidade diferente.
  met: true
  how: No statement writeCapabilities runs is a DELETE of any kind; the only statements it sends are per-identity
    INSERT ... ON CONFLICT DO UPDATE. A row belonging to a different identity than the one a given upsert
    names is therefore never a candidate for removal by that write, referenced by investigation_evidence
    or not.
- criterion: Nenhuma escrita em capabilities emite mais um DELETE sem filtro de WHERE contra a tabela
    inteira.
  met: true
  how: The DELETE FROM ${CAPABILITIES_TABLE} statement -- the only DELETE writeCapabilities ever issued,
    and the only one with no WHERE clause anywhere in this file -- was removed outright rather than given
    a WHERE clause; writeCapabilities' body is now a loop of upsertStatementFor calls with no DELETE statement
    at all, in either this method or anywhere else in the file.
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  - src/capability-registry/capability-store.port.ts
  how: 'This contract''s register-capability operation -- ''creating it at a new name and version, or
    replacing whatever already stood at that identity'' -- is what registerCapability (capability-registry.service.ts,
    unchanged by this task) already expresses at the service level; this task fixes the persistence beneath
    it so that promise is actually deliverable: writeCapabilities now upserts by identity instead of a
    table-wide delete-and-reinsert that failed whenever any capability row was referenced elsewhere, which
    made register-capability un-deliverable for any identity once investigation_evidence held even one
    citation.'
- node: domain/integration/capability
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: The node's own 'identified by name and version' is exactly the ON CONFLICT (name, version) target
    the new upsertStatementFor names -- the same primary key migrations/0003-capability-registry.sql declares.
    Every required attribute the node lists (nature, both schemas, timeout, connector, concept) is still
    written whole on every upsert, both on the INSERT branch and on the DO UPDATE SET branch, so a replace
    at an identity still leaves every declared attribute exactly as given, unchanged from before this
    fix.
- node: domain/investigation/evidence
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: 'This task did not reach investigation_evidence''s own persistence and changed no column or row
    of it. It honors the node''s ''the capability reference pins which registered capability, at which
    version, produced this observation'' by construction: writeCapabilities'' new upsert-only mechanics
    never delete any capabilities row, so a capability an evidence row''s foreign key already pins is
    never invalidated as a side effect of some other identity being written -- the exact failure this
    task was cut to remove.'
inferences:
- inferred: writeCapabilities never deletes a row absent from the given set -- it does not attempt to
    reconcile the table down to exactly the given array the way the old delete-and-reinsert did -- because
    nothing in this codebase ever calls it to remove a capability from the registry.
  from: capability-registry.service.ts is the only caller of writeCapabilities (registerCapability), and
    its own doc comment states re-registration 'replacing the record it holds' but names no deregistration
    or removal operation anywhere on ICapabilityQuery/ICapabilityStore; a store with no caller that ever
    shrinks the set has no case where a true delete-of-absent-rows would ever be exercised.
- inferred: The DO UPDATE SET clause reassigns every non-key column (nature, input_schema, output_schema,
    timeout, connector, concept) rather than a subset of them, so a re-registration under an already-held
    identity is a full replace of every declared attribute, not a partial patch.
  from: domain/integration/capability declares all eight attributes required, and the removed INSERT this
    replaces already wrote all eight on every call; keeping every one in the update list is what preserves
    'replacing whatever already stood at that identity' from contracts/integration/capability-registry
    without narrowing it to a subset the specification never distinguishes.
preserved:
- readCapabilities still answers every registration fresh from the database on every call, with no caching,
  unchanged.
- 'writeCapabilities still runs as one transaction (EDG-05): a failure partway through a batch of upserts
  still leaves none of that call''s own writes applied, exactly as the removed delete-and-reinsert did
  for its own batch.'
- Every declared attribute of a capability (name, version, nature, input_schema, output_schema, timeout,
  connector, concept) is still persisted whole on every write, matching domain/integration/capability.
- registerCapability's own re-registration semantics -- an already-held (name, version) is replaced with
  the newly given record -- still hold, now delivered through ON CONFLICT DO UPDATE instead of delete-then-insert.
- A real constraint violation during a write (e.g. a NOT NULL violation from an incomplete registration)
  still rolls the whole transaction back, leaving the table's earlier content untouched, per constraints/the-system-persists-to-one-relational-database
  and EDG-05.
deferred:
- what: capability-registry.service.ts's registerCapability still computes `kept` (every currently held
    registration except the one being written) and passes [...kept, capability] to writeCapabilities on
    every call, so a single registration now re-upserts every already-held row's identical values rather
    than writing only the one changed identity.
  why: The four criteria are fully satisfied without touching the service -- the new upsert never deletes
    and never fails on an unrelated FK reference regardless of how large the given array is -- and narrowing
    the call site to write only the changed identity is a service-level (business-logic) change this task's
    own file set (the store and its port) does not reach; doing it here would widen a corrective task
    beyond the defect it names.
- what: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts and its integration
    sibling still assert the removed mechanics directly -- a DELETE followed by per-row INSERTs, and a
    same-call PRIMARY KEY collision between two rows sharing one identity raising a 23505 unique-violation
    now that each upsert runs as its own ON CONFLICT DO UPDATE statement (the second call updates the
    row the first inserted rather than colliding).
  why: Writing or rewriting tests is not this delegation's task -- task-implementer writes source only,
    and reconciling these specs with the corrected mechanics is test-author's judgment, not mine to make
    in this pass.
run: run/capability-registry-write-upsert-hotfix-scope-write-to-identity-build
---

## What it is

A correção do mecanismo de escrita do registry de capabilities: writeCapabilities passa a
upsertar cada registro pela sua própria identidade (name, version) via
INSERT ... ON CONFLICT DO UPDATE, sem nenhum DELETE, em vez de apagar e reinserir a tabela
inteira.

## Notes

None.
