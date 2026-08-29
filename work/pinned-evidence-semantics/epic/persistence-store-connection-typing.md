---
title: Persistence stores' constructor typed to an interface, not the concrete pool
summary: relational-glossary-store.repository.ts's and relational-investigation-store.repository.ts's
  own constructors, and the connect()-capable interface database-access.ts's runInTransaction/openTransaction
  gain to reach them, so neither store's own constructor is typed against the concrete DatabaseConnection
  (pg Pool) type.
rationale: The scope names two ARC-01 findings, both the identical constructor-typed-to-a-concrete-class
  binding, so one epic groups them; the inventory's own convention note records that IQueryable already
  exists but declares no connect(), and its own risk note records that runInTransaction/openTransaction
  call connection.connect(), so retyping a store's constructor without also widening those two functions
  would only move the unsafe cast one level deeper rather than remove it — this epic's tasks touch database-access.ts
  for that reason, a shaping choice the scope's own two findings do not state. `covers` names the two
  architecture-constraint nodes this scope's own situate step read as the closest candidates before finding
  neither governs either finding; both are declared entirely `uncovered` because the specification is
  silent on what type a store's own constructor parameter carries, and this epic's tasks are a standard-conformance/code-quality
  correction, not a domain fact.
covers:
- constraints/the-system-persists-to-one-relational-database
- constraints/the-domain-depends-on-no-infrastructure
uncovered:
- node: constraints/the-system-persists-to-one-relational-database
  why: This constraint states where a record lands and through which connection, and its own fitness is
    that no store reads or writes a file and every record answers from the same connection. No task under
    this epic changes which store a record lands in, opens a file, or changes how many connections a record
    answers from — every task narrows a constructor's or a helper function's own declared parameter type
    to an interface the concrete connection already satisfies today, which changes nothing this constraint's
    statement or fitness reaches.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: This constraint states that the domain layer — case behavior, investigation factory, evaluation,
    vocabulary — imports no framework, driver or client package, reaching infrastructure only through
    ports. The two stores this epic's tasks touch are themselves the infrastructure side of those ports,
    not the domain layer, and every task narrows an adapter's own constructor parameter to an interface
    still declared beside the concrete DatabaseConnection type in database-access.ts/database-connection.ts
    — no domain module gains or loses an import of a driver, a framework or a provider client.
sources:
- intake/standard-conformance-arc01-mnt03.md
---

## What it is
The connect()-capable interface database-access.ts gains so runInTransaction and openTransaction no longer name the concrete DatabaseConnection type, and the two named stores' own constructors retyped against it once it exists.
The two ARC-01 findings the scope names — relational-glossary-store.repository.ts and relational-investigation-store.repository.ts — each losing their own unsafe-cast fallout in their own unit spec once their constructor's declared type stops forcing one.

## Notes
The identical DatabaseConnection-typed constructor and identical unsafe-cast unit-spec pattern also exists in relational-capability-store.repository.ts, relational-case-store.repository.ts and relational-connector-configuration-store.repository.ts; this epic's tasks touch only the two stores the scope names, and the three siblings are left exactly as they are — a follow-up scope may want the same fix extended to them once this epic's own interface is delivered and reviewed.
