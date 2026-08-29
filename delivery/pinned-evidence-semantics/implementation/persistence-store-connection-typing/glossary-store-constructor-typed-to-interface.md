---
title: relational-glossary-store.repository.ts's constructor retyped to IConnectableQueryable
summary: RelationalGlossaryStore's own constructor parameter is retyped from the concrete DatabaseConnection
  to IConnectableQueryable, the connect()-capable interface database-access.ts already declares, with
  its own unit spec's two fake-connection helpers retyped alongside it and no other behavior changed.
task: sha256:1888f57e172135f6fda4ab3cc52ed85d404742091c4d29b5e1778faeff518d47
run: run/arc01-mnt03-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/relational-glossary-store.repository.ts
  effect: 'RelationalGlossaryStore''s own constructor parameter connection is retyped from the concrete
    DatabaseConnection to IConnectableQueryable, imported from database-access.ts alongside the already-imported
    IQueryable and IStatement. The now-unused import of DatabaseConnection from database-connection.ts
    is removed. No method body changed: readTerms, writeTerms, insertMissingTerms, readConcepts and writeConcepts
    all still call runStatement/runInTransaction on this.connection exactly as before. The file''s own
    header comment is updated to describe IConnectableQueryable instead of the DatabaseConnection import
    it replaces, and to cite this task by path.'
- path: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  effect: fakeBareConnection's parameter and return type, and fakeTransactionConnection's own returned
    connection type, are retyped from DatabaseConnection to IConnectableQueryable, imported from database-access.ts;
    the now-unused import of DatabaseConnection from database-connection.ts is removed. Each helper's
    own unsafe cast now reads as unknown as IConnectableQueryable instead of as unknown as DatabaseConnection.
    The file's own header comment is updated to name IConnectableQueryable as the stand-in type instead
    of DatabaseConnection. No test body, assertion, expected value or test name changed.
criteria:
- criterion: RelationalGlossaryStore's own constructor parameter `connection` is typed to the interface
    widen-connection-interface-for-transactions declares, not the concrete DatabaseConnection.
  met: true
  how: The constructor now takes connection typed IConnectableQueryable — the exact interface widen-connection-interface-for-transactions
    declared in database-access.ts (IQueryable's query() plus one added connect() member), and DatabaseConnection
    no longer appears anywhere in the constructor's signature.
- criterion: relational-glossary-store.repository.ts no longer imports the DatabaseConnection type.
  met: true
  how: The type-only import of DatabaseConnection is removed; the file's only import from that area is
    now runInTransaction, runStatement, IConnectableQueryable, IQueryable and IStatement from database-access.ts,
    and grep over the file confirms DatabaseConnection appears only in prose inside the header comment,
    never as an import or a type reference.
- criterion: relational-glossary-store.repository.spec.ts's own fakeBareConnection and fakeTransactionConnection
    helpers no longer cast their fake past the compiler with `as unknown as DatabaseConnection`.
  met: true
  how: fakeBareConnection now returns its fake cast as unknown as IConnectableQueryable, and fakeTransactionConnection
    now returns its own connection cast the same way — the literal text casting to DatabaseConnection
    no longer appears anywhere in the file, and its own import of DatabaseConnection is removed in favor
    of importing IConnectableQueryable from database-access.ts.
- criterion: readTerms, writeTerms, insertMissingTerms, readConcepts and writeConcepts each behave exactly
    as before this change — the existing suite passes with no assertion or outcome changed.
  met: true
  how: No line of any of the five methods' own bodies changed; only the constructor's declared parameter
    type, the two import statements (source and spec) and the two casts (spec only) changed. Every existing
    test in relational-glossary-store.repository.spec.ts still constructs the store the same way it always
    did, still exercises the identical runStatement/runInTransaction call sequence, and no assertion,
    expected value, or test name was touched.
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  met: true
  how: IConnectableQueryable extends IQueryable, so this.connection still satisfies IQueryable at every
    runStatement call site and satisfies IConnectableQueryable itself at every runInTransaction call site,
    with no narrowing runInTransaction's own signature does not already accept. Every call site outside
    this file that constructs a RelationalGlossaryStore still passes a value typed DatabaseConnection
    or a real pg Pool, both of which already satisfy IConnectableQueryable structurally. This record does
    not itself execute the compiler; the caller's own typecheck step is what confirms this criterion's
    exit code.
inferences:
- inferred: The source file's header comment and the spec file's header comment are both updated to describe
    IConnectableQueryable instead of DatabaseConnection.
  from: Neither update is stated by any criterion, but both comments named DatabaseConnection by name
    as the type this file's own import or cast target was — once that type changed, leaving the prose
    unchanged would have left it describing an import and a cast that no longer exist. The sibling task
    widen-connection-interface-for-transactions' own delivery record already established this convention
    for database-access.ts itself.
preserved:
- readTerms', writeTerms', insertMissingTerms', readConcepts' and writeConcepts' own bodies, SQL statement
  text, transaction boundaries and error-wrapping behavior, unchanged.
- Every existing assertion in relational-glossary-store.repository.spec.ts, including the statement-order
  checks, the release()/ROLLBACK/COMMIT call-count assertions, the error-cause assertions, and the citation-count
  assertion at the bottom of the file.
- seed.ts's and glossary.factory.ts's own call sites, each still constructing RelationalGlossaryStore
  from a connection typed DatabaseConnection, unchanged.
- The integration spec for this store, still constructing RelationalGlossaryStore from a real pg Pool,
  unchanged.
deferred:
- what: relational-capability-store.repository.ts, relational-case-store.repository.ts and relational-connector-configuration-store.repository.ts
    each still bind their own constructor to the concrete DatabaseConnection, with the identical unsafe-cast
    pattern in their own unit specs.
  why: The inventory names these three as exhibiting the identical finding, but this task's own scope
    is relational-glossary-store.repository.ts alone (the sibling task investigation-store-constructor-typed-to-interface
    covers the other named store); widening this task to the other three reaches past what this task was
    cut to change.
---

## What it is
RelationalGlossaryStore's own constructor, retyped from the concrete DatabaseConnection to IConnectableQueryable — the connect()-capable interface widen-connection-interface-for-transactions already declared in database-access.ts — with no change to any of its five methods' own behavior, and its own unit spec's two fake-connection helpers retyped alongside it so neither casts to DatabaseConnection any longer.

## Notes
None.
