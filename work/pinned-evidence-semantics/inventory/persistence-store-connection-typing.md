---
title: Persistence stores' constructor binding to the concrete pg Pool
summary: Five relational store repositories under src/persistence bind their constructor to DatabaseConnection
  (the concrete pg Pool type), of which the scope names two for correction, forcing every one's own unit
  spec through an unsafe cast.
area:
- src/persistence
- src/persistence/database-access.ts
- src/persistence/database-connection.ts
- src/__tests__/unit/persistence
modules:
- name: database-connection
  path: src/persistence/database-connection.ts
  role: depends-on
- name: relational-glossary-store-repository
  path: src/persistence/relational-glossary-store.repository.ts
  role: touched
- name: relational-investigation-store-repository
  path: src/persistence/relational-investigation-store.repository.ts
  role: touched
- name: relational-capability-store-repository
  path: src/persistence/relational-capability-store.repository.ts
  role: adjacent
- name: relational-case-store-repository
  path: src/persistence/relational-case-store.repository.ts
  role: adjacent
- name: relational-connector-configuration-store-repository
  path: src/persistence/relational-connector-configuration-store.repository.ts
  role: adjacent
- name: database-access
  path: src/persistence/database-access.ts
  role: depends-on
- name: isolated-connection
  path: src/persistence/isolated-connection.ts
  role: adjacent
- name: migration-runner
  path: src/persistence/migration-runner.ts
  role: adjacent
conventions:
- statement: 'A narrower query-shape interface already exists and is already used where a caller must
    accept either a bare pool or a checked-out transaction client: IQueryable, declared in database-access.ts,
    is `{ query<R>(text, params?): Promise<{ rows: R[] }> }`, and runStatement/queryOneOrAbsent already
    accept it instead of DatabaseConnection.'
  seen_at: src/persistence/database-access.ts
- statement: 'Every relational store''s own constructor is `public constructor(private readonly connection:
    DatabaseConnection) {}` — the identical binding, not just in the two named findings.'
  seen_at: src/persistence/relational-capability-store.repository.ts
- statement: Every relational store's own unit spec declares an identical pair of helpers, fakeBareConnection
    and fakeTransactionConnection, each casting its fake past the compiler with `as unknown as DatabaseConnection`,
    and each spec's own header cites TST-03 as the rule permitting a stand-in at 'the driver boundary'.
  seen_at: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
- statement: runInTransaction and openTransaction in database-access.ts still take the concrete DatabaseConnection
    rather than an interface, because they call connection.connect() — a method IQueryable does not declare
    — so an interface fix at a store's constructor still needs a connect()-capable interface (wider than
    IQueryable, narrower than the concrete Pool) to reach runInTransaction without widening database-access.ts's
    own signature to accept anything.
  seen_at: src/persistence/database-access.ts
must_not_duplicate:
- what: The narrower query-only shape a caller can already declare a dependency against instead of the
    concrete Pool
  at: src/persistence/database-access.ts (IQueryable)
risks:
- risk: The identical DatabaseConnection-typed constructor and identical unsafe-cast unit-spec pattern
    exists in three more stores the scope does not name (capability, case, connector-configuration); narrowing
    only the two named stores' constructors leaves three siblings with the same finding unaddressed and
    no shared interface for either group to converge on.
  consumers:
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-case-store.repository.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- risk: A store's constructor accepting connect() plus query() (rather than the bare query()-only IQueryable)
    is still needed because writeTerms/writeConcepts/write/read all route through runInTransaction, which
    itself takes the concrete DatabaseConnection and calls connection.connect(); typing only the constructor
    against an interface while runInTransaction keeps the concrete type either forces a second cast at
    the runInTransaction call site or requires widening database-access.ts's own exported surface, which
    the scope's two findings do not mention.
  consumers:
  - src/persistence/database-access.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
sources:
- intake/standard-conformance-arc01-mnt03.md
---

## What it is
The concrete pg Pool type DatabaseConnection every relational store's constructor is bound to today, and the two stores the scope names for ARC-01 correction, alongside three sibling stores exhibiting the identical binding and the identical unsafe-cast fallout in their own unit specs.
IQueryable already exists in database-access.ts as a narrower interface some call sites (runStatement, queryOneOrAbsent) already accept in place of the concrete connection, but it declares only query(), not connect(), so it does not by itself cover a store constructor whose methods route through runInTransaction.

## Notes
The two named stores (glossary, investigation) are not the only ones exhibiting the finding; capability, case and connector-configuration stores show byte-identical constructor signatures and byte-identical spec-file cast helpers, which the decomposition should weigh before deciding whether this increment's scope is deliberately narrower than the full defect population.
Fixing only the constructor's declared type without also addressing runInTransaction's own DatabaseConnection parameter leaves the unsafe cast reachable one level deeper, at whatever call passes a store's connection into runInTransaction, unless a connect()-plus-query() interface is introduced and both signatures move to it together.
