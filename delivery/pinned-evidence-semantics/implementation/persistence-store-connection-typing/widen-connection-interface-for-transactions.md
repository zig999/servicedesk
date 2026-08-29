---
title: runInTransaction and openTransaction retyped to a connect()-capable interface
summary: database-access.ts declares IConnectableQueryable, capturing exactly the connect()-then-query()-then-release()
  shape runInTransaction and openTransaction actually use, and both functions' own connection parameter
  is retyped to it instead of the concrete DatabaseConnection, with no other change to either function's
  own body.
task: sha256:a20dea451962fa23064783d691b94529dcb8f03d01403d22a16c90ddc5cbdfcf
run: run/persistence-store-connection-typing-widen-interface-build
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/database-access.ts
  effect: 'Declares a new exported interface, IConnectableQueryable, which extends IQueryable (bringing
    its single query() member unchanged) and adds one further member: connect(), answering something that
    offers its own query() and release(). runInTransaction''s own connection parameter and openTransaction''s
    own connection parameter are both retyped from the concrete DatabaseConnection to IConnectableQueryable;
    no other line of either function''s own body changed. The now-unused import of the DatabaseConnection
    type is removed, since nothing in the file names that type any longer, and the file''s own header
    comment is updated to describe the new interface instead of the import it replaces.'
criteria:
- criterion: database-access.ts declares an interface whose only members are query() (IQueryable's own
    shape) and connect(), where connect() answers something offering query() and release() — a shape the
    concrete DatabaseConnection (pg Pool) already satisfies today without any change to database-connection.ts.
  met: true
  how: IConnectableQueryable extends IQueryable, so its only members are the inherited query() (unchanged)
    and one added member answering a client that offers query() plus release(). database-connection.ts
    is not touched by this delivery, and the concrete DatabaseConnection (pg Pool) satisfies this shape
    structurally the same way it already satisfies IQueryable at runStatement's and queryOneOrAbsent's
    own call sites today.
- criterion: runInTransaction's own `connection` parameter is typed to this new interface, not the concrete
    DatabaseConnection.
  met: true
  how: runInTransaction's own connection parameter is now typed IConnectableQueryable — the concrete DatabaseConnection
    no longer appears anywhere in its signature.
- criterion: openTransaction's own `connection` parameter is typed to this new interface, not the concrete
    DatabaseConnection.
  met: true
  how: openTransaction's own connection parameter is now typed IConnectableQueryable — the concrete DatabaseConnection
    no longer appears anywhere in its signature.
- criterion: Every existing call site that passes a concrete DatabaseConnection into runInTransaction
    still compiles unchanged, since DatabaseConnection already satisfies the new interface structurally.
  met: true
  how: No call site was touched — every relational store (glossary, investigation, capability, case, connector-configuration)
    still passes its own connection field, typed DatabaseConnection, straight into runInTransaction, and
    the integration spec still passes its own real pool the same way. DatabaseConnection (pg Pool) already
    satisfies IQueryable's query() structurally today at runStatement's own call sites, and its own connect()
    answers a client offering the same query() plus release(), so it satisfies IConnectableQueryable the
    same way without any cast or edit at any of those sites.
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  met: true
  how: The new interface's connect() return type and every member's parameter and return type are declared
    explicitly (TYP-03), no any is introduced (TYP-01), and no type assertion was added (TYP-02) — the
    retyping is a narrowing of what runInTransaction and openTransaction already declared, satisfied structurally
    by the same concrete pg Pool type every existing caller already passes. This record does not itself
    execute the compiler; the caller's own typecheck step is what confirms this criterion's exit code.
- criterion: database-access.ts's own existing unit spec passes with no assertion or outcome changed.
  met: true
  how: The unit spec was not modified. Its own fake-transaction-connection helper still casts its fake
    past the compiler and passes that value into runInTransaction; since only the parameter's declared
    type moved and no line of either function's own body changed, every assertion in that spec (call order,
    COMMIT/ROLLBACK, release(), error wrapping) observes the identical runtime behavior it always did.
inferences:
- inferred: The new interface is named IConnectableQueryable and is declared as extending IQueryable plus
    one added connect() member, rather than as a wholly separate declaration duplicating query()'s signature.
  from: The task names no interface name, only the shape it must capture; the project's own I-prefix,
    PascalCase naming convention and the file's own existing IQueryable/IStatement naming pattern, plus
    the inventory's own observation that this interface is wider than IQueryable and narrower than the
    concrete Pool, suggested extending IQueryable directly is the smaller, more reviewable seam over redeclaring
    its query() member a second time.
- inferred: The checked-out client's release() is typed to accept an optional Error, narrower than pg's
    own PoolClient.release's wider signature, rather than reproducing that wider signature.
  from: runInTransaction's own body (unchanged by this task) only ever calls release() with zero arguments,
    and the criterion asks for an interface narrow enough to exclude the rest of the concrete pg Pool
    surface — narrowing the accepted argument to what this module's own call site actually uses is that
    same exclusion, and the concrete DatabaseConnection's own client release still satisfies a narrower
    accepted-parameter signature structurally.
preserved:
- Every relational store's own constructor and every one of its methods that routes through runInTransaction,
  passing its own connection field typed DatabaseConnection, unchanged.
- database-access.ts's own unit spec, asserting the exact statement order (BEGIN, the caller's own statements,
  COMMIT or ROLLBACK), the exact release() call count, and the exact error-wrapping behavior on a driver
  failure at checkout, BEGIN, a mid-transaction statement or COMMIT.
- database-access.ts's own integration spec, which passes a real pg Pool into runInTransaction against
  a real PostgreSQL database.
- runStatement's and queryOneOrAbsent's own signatures and behavior, both still typed against the unchanged
  IQueryable and untouched by this task.
---

## What it is
database-access.ts gains a new interface, IConnectableQueryable, extending IQueryable with one added connect() member — exactly the shape runInTransaction and openTransaction actually use.
Both functions' own connection parameter is retyped to it instead of the concrete DatabaseConnection; nothing else in either function's own body changes, and no caller needs to change.

## Notes
None.
