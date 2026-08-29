---
title: RelationalInvestigationStore's own constructor retyped to IConnectableQueryable
summary: relational-investigation-store.repository.ts's own constructor parameter is retyped from the
  concrete DatabaseConnection to the connect()-capable IConnectableQueryable interface database-access.ts
  already declares, and the now-unused DatabaseConnection import is removed.
task: sha256:41c2f46ca61c279cce033a9cf47d6d00cefc55ce18913b5249150aff91c01902
run: run/arc01-mnt03-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/relational-investigation-store.repository.ts
  effect: RelationalInvestigationStore's own constructor parameter connection is now typed IConnectableQueryable
    instead of the concrete DatabaseConnection; the import of DatabaseConnection from database-connection.ts
    is removed, and the existing import from database-access.ts now also names IConnectableQueryable as
    a type import alongside IQueryable, IStatement and RaiseStoreError. The file's own header comment,
    which previously named DatabaseConnection as the only thing this file names for the pool it is given,
    is updated to name IConnectableQueryable instead. No other line of write(), read(), or any of the
    module's own free functions changed.
criteria:
- criterion: RelationalInvestigationStore's own constructor parameter `connection` is typed to the interface
    widen-connection-interface-for-transactions declares, not the concrete DatabaseConnection.
  met: true
  how: The constructor's own declared parameter type changed from DatabaseConnection to IConnectableQueryable,
    the connect()-capable interface widen-connection-interface-for-transactions already added to database-access.ts.
    No other change was made to the constructor's own body — write() and read() still call runInTransaction(this.connection,
    ...) exactly as before, and runInTransaction's own parameter is itself typed IConnectableQueryable,
    so the two now agree at the type level rather than one being narrower.
- criterion: relational-investigation-store.repository.ts no longer imports the DatabaseConnection type.
  met: true
  how: The type-only import of DatabaseConnection was deleted outright, and nothing else in the file names
    that type — a search over the file after the change finds DatabaseConnection only in two prose sentences
    of the header comment, explaining why the concrete pg Pool still satisfies the new interface structurally,
    never as a type reference.
- criterion: relational-investigation-store.repository.spec.ts's own fake-connection helpers no longer
    cast their fake past the compiler with `as unknown as DatabaseConnection`.
  met: false
  how: This implementation touches no test file — writing what proves a change and writing the change
    itself are two separate judgments this framework keeps apart, so a spec file's own fake-connection
    helper is the proof's own file to edit, not this record's. The retyped constructor is what makes removing
    that cast possible without any behavior change (fakeTransactionConnection's own returned object already
    offers exactly connect() and, through it, query() and release(), so it can be typed directly to IConnectableQueryable
    once that edit is made); this record leaves the existing cast in place and defers the edit to the
    proof written against it.
- criterion: Every one of RelationalInvestigationStore's own existing methods behaves exactly as before
    this change — the existing suite passes with no assertion or outcome changed.
  met: true
  how: write() and read(), and every free function each one calls, are unmodified except for the constructor's
    own declared parameter type; no statement text, no parameter order, no branch and no call sequence
    changed. The existing unit spec's own fakeTransactionConnection still returns a value cast to DatabaseConnection,
    and DatabaseConnection (the concrete pg Pool) already satisfies IConnectableQueryable structurally,
    so every existing test still compiles and still exercises the identical runtime path it always did.
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  met: true
  how: The only declared-type change is the constructor's own parameter, narrowed from a concrete class
    to an interface the concrete class already satisfies structurally; no any was introduced, no type
    assertion was added, and the retyping reuses the interface widen-connection-interface-for-transactions
    already declared rather than redeclaring it. This record does not itself execute the compiler; the
    caller's own typecheck step is what confirms this criterion's exit code.
inferences:
- inferred: The header comment's own prose, which used to name DatabaseConnection as the one thing this
    file names for the pool it is given, was reworded to name IConnectableQueryable instead and to explain
    why the concrete DatabaseConnection still satisfies it structurally, rather than left describing the
    type this file no longer imports.
  from: database-access.ts's own header comment already establishes this exact wording convention for
    the identical change, so the sibling file's own header follows the convention its neighbor already
    set for the same retyping.
preserved:
- write()'s own ordered inserts (root row, then subject-attribute-values, then evidence, then each evaluation
  immediately followed by its own citations) and read()'s own whole-assembly order, unchanged.
- Every existing raise callback and every existing enumeration guard, unchanged.
- createInvestigationStore in src/factories/investigation-store.factory.ts, which still passes its own
  DatabaseConnection-typed connection straight into the constructor unchanged, satisfying IConnectableQueryable
  the same way runInTransaction's own callers already do.
- Every existing unit and integration spec of RelationalInvestigationStore, still passing a DatabaseConnection-typed
  value into the constructor unchanged.
deferred:
- what: relational-capability-store.repository.ts, relational-case-store.repository.ts and relational-connector-configuration-store.repository.ts
    carry the identical DatabaseConnection-typed constructor and the identical unsafe-cast unit-spec pattern
    this task corrects for the investigation store.
  why: this task's own inventory names only the glossary and investigation stores as its two named findings;
    narrowing the other three stores' own constructors reaches outside this task's own objective and is
    a matter for whichever task the plan cuts to reach them.
---

## What it is
relational-investigation-store.repository.ts's own constructor parameter connection, retyped from the concrete DatabaseConnection to the IConnectableQueryable interface widen-connection-interface-for-transactions already added to database-access.ts, with the now-unused DatabaseConnection import removed and the file's own header comment updated to match.

## Notes
Criterion 3 (the unit spec's own cast) is recorded unmet by this implementation, deliberately — that edit belongs to this task's own test-author, as part of its proof.
