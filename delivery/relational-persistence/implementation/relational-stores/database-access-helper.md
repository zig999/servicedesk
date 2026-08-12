---
title: The shared relational access helper
summary: A new persistence module giving every future relational store adapter one way to run a statement,
  answer absence as data, raise the caller's own typed error, and run a unit of work as a transaction
  that commits whole or rolls back whole.
task: sha256:601f97c69e28296987dd9420efa0193a4c7141f079f421f746c9cbf68ab99085
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-database-access-helper-build
files:
- path: src/persistence/database-access.ts
  effect: new module exporting IStatement, IQueryable and RaiseStoreError types plus three functions.
    runStatement(connection, statement, raise) runs one parameterized statement against any IQueryable
    and answers every row it matched, wrapping a driver failure into raise(cause). queryOneOrAbsent(connection,
    statement, raise) is runStatement narrowed to at most one row, answering undefined where none matched.
    runInTransaction(connection, raise, work) checks a connection out of the given DatabaseConnection,
    opens a transaction on it (BEGIN, then SET LOCAL search_path TO public), runs the caller's own work
    callback against that one checked-out connection, commits once work resolves, and rolls back — releasing
    the connection back to the pool either way — once work or the commit itself rejects
criteria:
- criterion: A statement run through the helper that matches no row answers with absence as data rather
    than raising.
  met: true
  how: queryOneOrAbsent delegates to runStatement and returns rows[0], which is undefined whenever the
    driver's own result held no row — the same absence-is-data rule persistence/json-file.ts's readJsonFileOrAbsent
    already holds for a file that does not exist
- criterion: A driver failure reaching the helper arrives at its caller as that caller's own typed store
    error, carrying a message, a context object and the driver failure as its cause.
  met: true
  how: every point that calls the driver directly is wrapped in try/catch, and each catch throws raise(error)
    rather than the caught error itself, so a caller's own typed error carries the caught driver failure
    as its direct .cause
- criterion: A unit of work run through the helper commits as a whole.
  met: true
  how: runInTransaction checks out one connection, opens one transaction on it, and runs the caller's
    entire work callback against that single checked-out connection before ever issuing COMMIT
- criterion: A unit of work in which one statement fails leaves none of its earlier statements applied.
  met: true
  how: a rejection from work or from commitTransaction's own COMMIT is caught by runInTransaction's own
    catch, which issues ROLLBACK on the same checked-out connection before the finally block releases
    it back to the pool, undoing every statement work already ran
nodes:
- node: constraints/a-case-is-read-whole
  how: this task's own UNDERDETERMINED note observes that no criterion holds the transaction facility
    to serving reads, and that a write-only facility would leave this constraint undeliverable by whichever
    adapter must read a case's root, hypotheses, resolutions and referrals together. runInTransaction
    is built generic over any statement its caller's work sends through the checked-out connection — a
    SELECT as freely as an INSERT — so it keeps the one transactional mechanism the constraint needs available
    and unforeclosed for the adapter task that does the reading. The constraint's own guarantee is not
    demonstrated here; only kept reachable
inferences:
- inferred: runInTransaction's transaction facility accepts any statement a caller's work callback sends
    through it — a read as freely as a write — rather than being restricted to write statements
  from: the task's own UNDERDETERMINED note stating that a write-only transaction facility would pass
    criteria 3 and 4 as written while leaving constraints/a-case-is-read-whole undeliverable
- inferred: runInTransaction resets the checked-out connection's search_path to public with SET LOCAL
    immediately after BEGIN, before ever handing the connection to work
  from: persistence/isolated-connection.ts's own header comment and delivery record (task/relational-substrate/integration-test-isolation),
    documenting that this project's DATABASE_URL reaches Postgres through a transaction-pooling endpoint
    that can hand back a connection still carrying an unrelated session's own search_path
- inferred: 'RaiseStoreError is one generic (cause: unknown) => Error callback rather than a taxonomy
    of named failure kinds'
  from: this task's own ADVISORY note that criteria 1 and 2 rest on no candidate stating any store-error
    taxonomy; narrowing to one generic kind avoids inventing a taxonomy nothing states and leaves each
    caller's own raise free to inspect the raw failure and choose its own typed error
preserved:
- database-connection.ts is unmodified; its own claim to be the only file that imports the driver continues
  to hold — database-access.ts names no 'pg' import.
- persistence/isolated-connection.ts and persistence/migration-runner.ts are unmodified and unaffected.
- No domain module gains any new import; domain-depends-on-no-infrastructure.spec.ts's own existing sweep
  keeps passing unaffected.
divergences:
- cites: MNT-03
  file: src/persistence/database-access.ts
  departure: IQueryable, declared here, repeats the shape persistence/isolated-connection.ts's own IIsolatedConnection.query
    already declares, rather than the two modules sharing one declared type.
  why: unifying them means editing isolated-connection.ts, a module this task does not depend on and whose
    own delivery this task does not reach; that module's own release() always rolls back, built specifically
    for test isolation, so its own interface cannot simply be reused for a facility that must also commit
- cites: COR-01
  file: src/persistence/database-access.ts
  departure: runInTransaction's own catch and openTransaction's inner catch each perform a side effect
    (ROLLBACK, or releasing the checked-out connection) and then rethrow the caught error unwrapped, rather
    than wrapped with the original as its cause.
  why: by the time either catch runs, the error is already either the caller's own typed store error or
    is about to be wrapped by the very next enclosing catch; wrapping it a second time would nest a new
    typed error around the first and break criterion 2's own requirement that the caller's typed error
    carry the driver failure itself, not another wrapper, as its direct cause
deferred:
- what: Sharing one canonical query-shape interface between persistence/isolated-connection.ts's own IIsolatedConnection
    and this module's IQueryable, so the two near-identical query() signatures are declared once rather
    than twice.
  why: reaches into a sibling module this task does not depend on and whose own delivery record this task
    does not reach; unifying the shape without also examining whether that module's own behavior should
    change is a decision for whichever task next touches it
---

## What it is

The single seam every relational store adapter will run its statements through: absence answers
as data, a driver failure arrives as the caller's own typed error, and a unit of work commits
whole or rolls back whole.

## Notes

runInTransaction resets the checked-out connection's own schema at open time, the same defensive
guard task/relational-substrate/integration-test-isolation's own checkout already adds, since
both check a connection out of the same pool reaching the same transaction-pooling endpoint.
The transaction facility is deliberately built generic over reads and writes, rather than
write-only, so constraints/a-case-is-read-whole stays reachable for whichever adapter task reads
a case whole in one transaction — this task does not itself demonstrate that read.
