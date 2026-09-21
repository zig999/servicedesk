---
target: backend
title: Store-level capability removal, keyed by name and version together
summary: Proof that ICapabilityStore.deleteCapability and RelationalCapabilityStore.deleteCapability satisfy
  this task's five criteria and the one underdetermined entry the task's Notes name, while every node
  this task implements is left in untested because its fact spans more than a store-only delete decides.
implementation: sha256:022424477ceb390218362d205308fe3c0c2b53f1bf01d079d81ba8aa34d9d8fd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-removal-capability-store-delete-suite
tests:
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: issues exactly one parameterized DELETE against capabilities inside BEGIN and COMMIT, naming both
    name and version together, with no guard query ahead of it
  proves: 'Criterion: the store port declares a removal taking name and version together; Criterion: the
    relational implementation issues a delete statement against the capability relation inside a transaction.'
  fails_when: deleteCapability accepts or uses only one part of the identity, issues the DELETE outside
    a BEGIN/COMMIT pair, or sends any statement besides BEGIN, the one DELETE and COMMIT.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: removes exactly the capability at the named identity, leaving a capability sharing that name at
    a different version exactly as it was
  proves: 'Criterion: after the removal, a read of the registered capabilities does not return that name
    and version; Criterion: a capability sharing the name at a different version is still returned after
    the removal.'
  fails_when: the read after deletion still includes the removed (name, version), or no longer includes
    the surviving capability that shares the same name at a different version, against the real database.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: resolves without refusal and leaves every currently registered capability untouched, when the
    name and version named is one nothing is registered under
  proves: The boundary of the identity-present class the two removal criteria treat alike — a name/version
    nothing is registered under is a normal, non-erroring delete.
  fails_when: deleteCapability rejects or otherwise raises when called against an identity nothing is
    registered under, or that call mutates any currently registered row.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: leaves a capability registered when a removal is attempted against one a collected evidence item
    currently names
  proves: UNDERDETERMINED, from the specification — the guard is outside this task's own candidate set,
    so a store removal that unconditionally deletes a row a collected evidence item names satisfies every
    criterion here.
  fails_when: an implementation of deleteCapability that actually removes a capability's row even though
    a collected evidence item currently names it (e.g. one that also deletes or reroutes the referencing
    investigation_evidence row to route around the existing investigation_evidence_capability_fkey foreign
    key).
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: upserts each given capability by its own (name, version) identity, inside one transaction, and
    never sends a DELETE (pre-existing, unmodified by this task)
  proves: 'Criterion: the store port''s existing write method keeps its current signature and behaviour,
    the removal being a method of its own rather than a new meaning for the write.'
  fails_when: writeCapabilities starts sending a DELETE statement, or its call shape changes.
not_applicable:
- edge_case: Absent or empty name/version passed to deleteCapability
  why: no criterion or implemented node assigns the store a validation duty over its own parameters; boundary
    validation belongs to the sibling operation/route task.
- edge_case: The database driver rejects the DELETE (unavailable, slow, or otherwise fails)
  why: no criterion of this task states any failure-handling behavior; the reused raiseWriteFailure convention
    is an existing mechanism, already exercised by pre-existing tests.
- edge_case: Concurrent delete and read, or two concurrent deletes of the same identity
  why: no criterion or implemented node states an ordering or isolation guarantee beyond the existing
    per-call transaction.
- edge_case: Deleting the only registered capability, leaving an empty result set
  why: readCapabilities carries no branch that special-cases an empty result; the sibling-version test
    already exercises the same unconditional SELECT/row-mapping path.
- edge_case: A duplicate row at the same (name, version) identity
  why: the capabilities table's own primary key already makes this identity unique, and a DELETE only
    removes rows.
untested:
- 'contracts/integration/capability-registry: this task supplies only the store-level deleteCapability
  primitive for one of the five listed operations; the node''s fact spans all five and the exact refusal
  condition, which belongs to the operation task that consumes this store.'
- 'domain/integration/capability-registry: the node''s Responsibility spans refusing malformed registrations,
  resolving a concept to exactly one capability, and removing with the evidence-citation guard; this task
  changes only the persistence port and its relational adapter.'
- 'domain/integration/capability: the aggregate-root''s fact covers its full declared contract; this task
  touches only how the persisted row is removed by (name, version), too narrow to decide the whole node.'
- 'constraints/the-domain-depends-on-no-infrastructure: scope is system, decided by the project''s lint
  step across the whole tree; a test scoped to the two files this task touches would assert part of that
  audit as the whole.'
- 'constraints/the-system-persists-to-one-relational-database: scope is system, decided by the standard''s
  whole test suite step across every store; this task''s own tests show deleteCapability uses the one
  existing relational connection, not the system-wide claim.'
---

## What it is
The tests proving capability-store-delete: the composite-identity transaction, sibling-version isolation, the absent-identity non-error branch, and (via the existing DB foreign key) the evidence-citation protection the sibling operation task will name as a business refusal. Also repairs two ICapabilityStore test doubles that no longer compiled.

## Notes
run/capability-removal-capability-store-delete-build failed typecheck, cause: code — InMemoryCapabilityStore and MutableCapabilityStore test fixtures did not implement the widened ICapabilityStore interface. run/capability-removal-capability-store-delete-build-2, run after this proof's fixture repairs, passed, as did the full suite.
The evidence-citation test passes today because of the pre-existing investigation_evidence_capability_fkey foreign key (migrations/0005-investigation.sql), not because of any guard this task's code adds — the store performs an unconditional DELETE; the database itself currently refuses it when evidence cites the row. The business-level refusal (CapabilityCitedByEvidenceError, HTTP 409) is still the sibling operation task's to add, so a caller sees a named refusal instead of a raw constraint violation.
