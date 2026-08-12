---
title: Proof for RelationalCapabilityStore, plus the sibling regressions its migration caused
summary: Unit tests mocking DatabaseConnection and integration tests against a real database prove RelationalCapabilityStore's
  read/write mechanics, the criteria this task states, and the UNDERDETERMINED exclusion of an incomplete
  registration; three sibling proof files broken by migrations/0007-capability-concept.sql's new NOT NULL/count
  are fixed in this same delivery, disclosed.
implementation: sha256:6dee780b7a5a9545bca7aeaa77a432fab52e7356b0f965c0fd71a0472bf69921
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-capability-store-suite-2
tests:
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: answers a read with every declared attribute — name, version, nature, both schemas, timeout, connector
    and concept
  proves: A read answers each registration with its name, version, nature, input schema, output schema,
    timeout and connector.
  fails_when: readCapabilities() stops naming one of the seven original columns or the added concept column
    in its SELECT, or toCapability() stops mapping one of them onto the returned Capability
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: answers the second call's own rows, never a value the first call already answered
  proves: A read answers the registration as the database holds it at that call, never a value held from
    an earlier call.
  fails_when: readCapabilities() starts memoizing or caching a prior result instead of issuing a fresh
    SELECT on every call
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: a driver rejection during a read reaches the caller as CapabilityStoreError carrying the original
    failure as its cause
  fails_when: readCapabilities() lets a driver rejection propagate unwrapped, or drops the original failure
    instead of setting it as the error's cause
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: answers the empty registry when the table currently holds no row
  proves: the empty-collection edge case — readCapabilities() over zero rows answers an empty array rather
    than throwing or answering undefined
  fails_when: readCapabilities() throws or answers anything other than [] when the SELECT matches no row
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a row whose nature is outside the declared
    enumeration
  proves: the implementation's own defensive guard (isCapabilityNature) actually excludes a row holding
    a nature the CAPABILITY_NATURES enumeration does not declare
  fails_when: toCapability() stops narrowing a row's nature and answers an unrecognized value as if it
    were a valid CapabilityNature
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: deletes every existing row and inserts exactly the given capabilities, in that order, inside one
    transaction
  proves: the whole-replace mechanism — writeCapabilities() issues BEGIN, resets search_path, DELETEs
    the table, INSERTs one row per given capability, then COMMITs, releasing the connection exactly once
  fails_when: writeCapabilities() stops deleting before inserting, inserts a wrong column or param order,
    skips resetting search_path, or fails to commit/release
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: issues only the DELETE and still commits, when replacing the whole table with an empty set
  proves: the empty-collection edge case on the write side
  fails_when: writeCapabilities([]) fails to issue the DELETE, fails to commit, or leaves the connection
    unreleased
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: persists a capability whose nature is read-only without refusing it on that ground
  proves: A registration whose nature is read-only is not refused on that ground.
  fails_when: the store starts refusing a read-only-natured capability for that reason
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when the write is refused
  proves: a driver rejection during the write half reaches the caller as CapabilityStoreError and the
    transaction is rolled back rather than left committed
  fails_when: writeCapabilities() lets a driver rejection propagate unwrapped, drops the cause, or commits
    instead of rolling back on failure
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: persists and reads back a registration exactly as given — name, version, nature, both schemas,
    timeout, connector and concept
  proves: A read answers each registration with its name, version, nature, input schema, output schema,
    timeout and connector — against a real database, including the new concept column.
  fails_when: a real write/read round trip through RelationalCapabilityStore loses or corrupts any of
    the eight attributes
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: answers a read as the database holds it right now, never a value an earlier read already answered
  proves: A read answers the registration as the database holds it at that call, never a value held from
    an earlier call — the real-effect half of criterion 2.
  fails_when: a second write/read round trip answers the first write's content instead of the second's
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: leaves the table's earlier content untouched, when a later insert inside one replace violates
    a real constraint
  proves: the real-effect half of the whole-replace transaction guarantee
  fails_when: a failed replace leaves the table empty, partially replaced, or otherwise different from
    what it held before the failed call
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: 'excludes a registration with no output schema: the write is refused and nothing is stored'
  proves: the UNDERDETERMINED entry — a registration persisted with an absent schema does not enter the
    store, excluded here by the real NOT NULL constraint on output_schema
  fails_when: a write carrying an absent output_schema succeeds and the row is found in the table afterward
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: 'excludes a registration with no connector: the write is refused and nothing is stored'
  proves: the UNDERDETERMINED entry — a registration persisted with an absent connector does not enter
    the store, excluded here by the real NOT NULL constraint on connector
  fails_when: a write carrying an absent connector succeeds and the row is found in the table afterward
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: leaves the table exactly as it stood when a non-read-only registration is refused before ever
    reaching the store
  proves: A registration whose nature is not read-only does not enter the store — the real-effect proof,
    end to end.
  fails_when: a mutating registration ends up persisted in the real table
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: persists a complete read-only registration, unrefused, when registered against the real store
  proves: A registration whose nature is read-only is not refused on that ground — the real-effect proof,
    end to end.
  fails_when: a complete, read-only registration fails to appear in the real table after registerCapability()
    resolves
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: holds a registration that states no timeout with the default of sixty seconds, in what the store
    actually persists
  proves: A registration that states no timeout is held with the default of sixty seconds — the real-effect
    proof.
  fails_when: the persisted row's timeout is anything other than 60000 for a registration that stated
    none
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: resolves a concept to the capability the database currently holds, reflecting a registration made
    since an earlier resolution
  proves: The store resolves each concept to exactly one capability as currently registered.
  fails_when: readCapability() answers the earlier absence instead of the capability registered since,
    when backed by the real store
not_applicable:
- edge_case: two writeCapabilities() calls racing each other against the same table
  why: no bound node or criterion states any guarantee about concurrent writers to the store
- edge_case: a slow or unavailable database dependency
  why: exercised generically by the driver-failure-wrapping tests; no criterion distinguishes a slow failure
    from any other driver rejection
untested:
- duplicate-concept registration refusal and absence-as-data for an unmatched read are the task's own
  two explicitly Dropped behaviors; this proof does not assert either as a requirement.
- no test exercises RelationalCapabilityStore wired into src/factories/capability-registry.factory.ts,
  since that cutover is itself deferred by the implementation record to a later task.
- the exact SQL error path for an absent name, version or nature is not separately proven; the two representative
  fields the UNDERDETERMINED entry names (a schema, a connector) are what is proven.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is configured too; the same departure database-access.spec.ts
    and isolated-connection.spec.ts already disclose
- from: the boundary that a task's own proof touches only its own task's test files
  departure: 'Three sibling, already-delivered proof files broke on this task''s own legitimate migration,
    migrations/0007-capability-concept.sql, and are fixed here rather than through a separate proof-only
    re-delivery of the tasks that produced them: schema-migrations.spec.ts''s three raw INSERT INTO capabilities
    statements named no concept column and would fail the new NOT NULL constraint — each now supplies
    a concept value, and critically for the invalid-nature insert, supplying it keeps that insert failing
    with CHECK_VIOLATION rather than being masked by a NOT_NULL_VIOLATION on the now-required column.
    vitest-global-setup.spec.ts''s and migration-runner.spec.ts''s own EXPECTED_MIGRATION_FILENAMES constants
    (task/relational-substrate/migration-step) each undercounted the real migration set by one and are
    fixed by appending ''0007-capability-concept.sql'' as their seventh, final entry.'
  why: This initiative is still open, each break is a direct and legitimate consequence of this task's
    own migration, and folding all three fixes into this delivery keeps one coherent change answering
    for what it caused, following the same pattern already used repeatedly in this initiative
---

## What it is

Nineteen tests proving RelationalCapabilityStore reads every declared attribute fresh, writes a
whole replace inside one transaction, and excludes an incomplete registration at the schema level
— mechanically, over a mocked connection, and concretely, against the real database.

## Notes

migrations/0007-capability-concept.sql broke three sibling, already-delivered proof files in this
same open initiative — schema-migrations.spec.ts's raw INSERTs, and vitest-global-setup.spec.ts's
and migration-runner.spec.ts's own hardcoded migration-file counts. All three fixed here, disclosed,
following the pattern already used repeatedly in this initiative for legitimate, in-scope breaks.
