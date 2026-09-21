---
target: backend
title: A real deletion in the capability store
summary: ICapabilityStore gains deleteCapability(name, version), implemented as a transaction-wrapped
  literal DELETE keyed by the composite (name, version) identity.
task: sha256:f1fa4019627313478909e393d1cd4c5527a2bcbb5e805b1b11511548a01252fe
run: run/capability-removal-capability-store-delete-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/capability-registry/capability-store.port.ts
  effect: Adds deleteCapability(name, version) -> Promise<void> to ICapabilityStore, alongside the unchanged
    readCapabilities/writeCapabilities signatures.
- path: src/persistence/relational-capability-store.repository.ts
  effect: Adds RelationalCapabilityStore.deleteCapability, which runs a literal DELETE FROM capabilities
    WHERE name = $1 AND version = $2 inside runInTransaction, and the deleteStatementFor helper; reuses
    the existing raiseWriteFailure for the failure path.
criteria:
- criterion: The store port declares a removal taking name and version together, the composite identity
    a capability is registered at.
  met: true
  how: 'ICapabilityStore.deleteCapability(name: string, version: string): Promise<void> takes both parts
    of the identity as two arguments.'
- criterion: The relational implementation issues a delete statement against the capability relation inside
    a transaction.
  met: true
  how: RelationalCapabilityStore.deleteCapability wraps a literal DELETE FROM ... WHERE statement in runInTransaction,
    mirroring deleteManifestEntry/discardDraft in relational-case-store.repository.ts.
- criterion: After the removal, a read of the registered capabilities does not return that name and version.
  met: true
  how: The DELETE removes exactly the row for that composite identity; readCapabilities selects from the
    same table.
- criterion: A capability sharing the name at a different version is still returned after the removal.
  met: true
  how: The WHERE clause is conjunctive on both name = $1 AND version = $2; a row with the same name but
    a different version does not match.
- criterion: The store port's existing write method keeps its current signature and behaviour, the removal
    being a method of its own rather than a new meaning for the write.
  met: true
  how: writeCapabilities and its upsert-only body are unchanged; deleteCapability is a new, separate method.
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-store.port.ts
  - src/persistence/relational-capability-store.repository.ts
  how: The contract names remove-capability as an operation of the published surface; this task supplies
    the store-level primitive that operation will call.
- node: domain/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-store.port.ts
  - src/persistence/relational-capability-store.repository.ts
  how: deleteCapability(name, version) gives the registry service a store-level method with exactly the
    identity shape the responsibility states.
- node: domain/integration/capability
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: Capability is identified by name and version together; the delete statement's WHERE clause uses
    exactly that pair, never name alone.
- node: constraints/the-domain-depends-on-no-infrastructure
  how: The new method is declared on the port, which imports only the domain Capability type; the SQL
    and the pg-backed connection stay confined to the persistence file.
- node: constraints/the-system-persists-to-one-relational-database
  how: The delete is a statement against the same capabilities table in the one relational store every
    other capability read/write already uses.
preserved:
- ICapabilityStore.readCapabilities() and writeCapabilities() — signatures and upsert-only behaviour unchanged.
- RelationalCapabilityStore.readCapabilities and writeCapabilities — untouched; the new method is additive.
- The existing raiseReadFailure/raiseWriteFailure error-raising convention, reused rather than duplicated
  for the new delete path.
deferred:
- what: The refusal named by rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
    — refusing the delete where a collected evidence item names the capability.
  why: The task's own Notes mark this guard as outside this task's candidate set and belonging to the
    operation task that consumes this store; deleteCapability here is unconditional by design, matching
    the criteria as stated.
- what: Wiring deleteCapability into CapabilityRegistryService, a DELETE route/controller/dto, and updating
    the in-memory/spy fixtures implementing ICapabilityStore that will now be missing the new method.
  why: Widening ICapabilityStore was this task's own change; the fixtures that implement it are the test-author's,
    and the service/route are sibling tasks.
---

## What it is
The store-layer half of remove-capability: a real SQL DELETE keyed by the composite (name, version) identity, replacing nothing about the existing upsert-only write path.

## Notes
Existing ICapabilityStore test fixtures do not yet implement deleteCapability; the build step will surface this as a typecheck failure until the test-author's pass fixes them, mirroring what happened on the sibling connector-configuration-store-delete task.
The first build attempt (run/capability-removal-capability-store-delete-build) failed typecheck for exactly this reason, fixed by the test-author's proof pass; the second build attempt (run/capability-removal-capability-store-delete-build-2) passed.
