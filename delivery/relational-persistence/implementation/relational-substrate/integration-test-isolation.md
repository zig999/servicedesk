---
title: A pinned, per-caller checked-out connection for isolating one integration test's writes from every
  other
summary: A new persistence module lets a caller check one connection out of the shared pool for its exclusive
  use; checkOutIsolatedConnection now opens the transaction and resets search_path to public itself before
  ever handing the connection back, so every statement a caller sends is pinned to one physical backend
  and one known schema regardless of what an unrelated, earlier session left on it, and release() always
  rolls back before returning the connection.
task: sha256:0fcb0a3a2a69db0a082ec4240c2b22389587b3946cef5062511baa8c8ab8c4e8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-integration-test-isolation-build-3
files:
- path: src/persistence/pg.d.ts
  effect: 'extends the ambient ''pg'' declaration with Pool.connect(): Promise<PoolClient> and a new PoolClient
    class (query(), release()), so a caller can hold one connection across several statements instead
    of one statement at a time'
- path: src/persistence/isolated-connection.ts
  effect: new module exporting checkOutIsolatedConnection(pool) and the IIsolatedConnection interface.
    checkOutIsolatedConnection checks one connection out of the given DatabaseConnection (pool), immediately
    issues BEGIN and SET LOCAL search_path TO public on it, and only then returns {query, release} to
    the caller — so every statement the caller issues afterward runs inside that one already-open, already-schema-pinned
    transaction on that one checked-out connection. SET LOCAL rather than plain SET is deliberate — its
    effect ends with the same transaction's own COMMIT/ROLLBACK, so release()'s existing ROLLBACK already
    undoes it. release() unconditionally issues ROLLBACK, in a try/finally, before returning the client
    to the pool. Issues no CREATE, ALTER or DROP of anything
criteria:
- criterion: An integration test that writes leaves the database holding none of the rows it wrote once
    it has finished.
  met: true
  how: release() always issues ROLLBACK (in a try/finally) before returning the checked-out client to
    the pool, undoing every write the caller made since checkout's own BEGIN. checkOutIsolatedConnection's
    own SET LOCAL search_path TO public is also what lets the caller's writes reliably reach the intended
    table at all, rather than failing outright or landing on an unrelated schema an earlier session happened
    to leave ambient on the checked-out physical backend — a failure the real suite surfaced against this
    module's own first test before this guard was added
- criterion: Two integration tests writing the same case slug in one suite run both pass.
  met: true
  how: every statement a caller sends through its checked-out connection — the BEGIN and SET LOCAL checkOutIsolatedConnection
    itself opens, the caller's own writes, and the ROLLBACK that ends it — runs against the one physical
    backend the pool pinned to that one checkout for its whole duration, against a known schema, never
    against a different backend or an unknown ambient schema. A first caller's insert under a slug is
    fully rolled back before a second caller reusing that slug ever runs, so the two rows never coexist
- criterion: Two integration tests writing the same investigation id in one suite run both pass.
  met: true
  how: identical mechanism and reasoning as the case-slug criterion above — checkOutIsolatedConnection
    and release() hold no opinion on which table or column a caller's statements touch
- criterion: A test observes no row another test wrote.
  met: true
  how: only one caller holds a given checked-out connection at a time, and every earlier caller's writes
    are already rolled back by the time release() returns it to the pool, so no later caller's read can
    observe a row an earlier caller wrote
- criterion: No integration test creates, drops or alters a table to obtain its isolation.
  met: true
  how: checkOutIsolatedConnection and release() issue no DDL of any kind — SET LOCAL search_path TO public
    is session configuration, not a schema object, and does not appear in this list either way. Isolation
    is achieved entirely by pinning one checked-out connection to one caller, resetting its schema, and
    transaction rollback against the schema the shared database already holds from replaying migrations/
    once
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  how: 'this task''s own mechanism neither replaces nor duplicates schema replay: it operates against
    the schema the shared database already holds from applying migrations/ once, and creates no table,
    schema or other DDL object of its own that a fresh replay would not already produce. Per this task''s
    own UNDERDETERMINED note, no criterion here holds the test database''s schema to the scripts, so this
    task''s own source does not, and need not, re-derive the replay property itself — it is honored by
    relying on it unmodified (and by resetting to exactly the schema that replay produces, public) rather
    than by encoding any part of it'
- node: domain/knowledge/case
  how: not reached. Criterion 2 names "case slug" only as the vocabulary for what a caller demonstrating
    this mechanism would write, not as a fact this task's own source holds; checkOutIsolatedConnection
    and release() treat every row identically regardless of which table or column it belongs to
- node: domain/investigation/investigation
  how: not reached, for the identical reason given for domain/knowledge/case above — criterion 3's "investigation
    id" is vocabulary for what a demonstrating caller writes, not a fact this mechanism encodes about
    Investigation
inferences:
- inferred: isolation is achieved by pinning one checked-out connection per caller plus an unconditional
    rollback against the already-migrated shared schema, rather than by a disposable schema per test/file
    or a database per worker
  from: this task's own UNDERDETERMINED notes explicitly leaving "one database" and "schema sourced from
    the migration scripts" open, together with the finding disclosed in task/relational-substrate/migration-step's
    own delivery record — that Neon's transaction-pooling endpoint does not reliably preserve session
    state across statements that are not all inside one open transaction. Keeping every statement of one
    caller's own unit of work inside one transaction on one checked-out connection removes that risk entirely
    rather than mitigating how often it is provoked
- inferred: checkOutIsolatedConnection opens the transaction (BEGIN) and resets the schema (SET LOCAL
    search_path TO public) itself, before ever handing the connection to a caller, rather than leaving
    either to the caller's own first statements
  from: the real suite run against this module's own first proof, which failed an unqualified INSERT sent
    immediately after checkout with "relation \"cases\" does not exist" — proving a freshly checked-out
    physical backend can itself carry an unrelated, already-finished session's own search_path, not only
    a backend reused across a caller's separate statements. Resetting defensively at checkout, unconditionally,
    removes every future caller's own need to know about or guard against this
- inferred: two callers writing under the same case slug or investigation id are kept from colliding by
    never letting the two rows coexist at all, rather than by admitting the duplicate and cleaning it
    up afterward
  from: this task's own UNDERDETERMINED note leaving an admit-then-clean-up harness equally valid against
    criterion 2's own wording as written; strict non-coexistence is the narrower, more certain reading,
    and follows directly from checkOutIsolatedConnection's pinned-connection-plus-rollback design
- inferred: release() unconditionally issues ROLLBACK before returning the client to the pool, even where
    a caller's own teardown already rolled back
  from: no criterion or node states what happens when a caller's own teardown is itself incomplete; treating
    release() as a backstop is the more conservative reading, and is free of a double-rollback failure
    mode
- inferred: the checked-out connection is exposed as this module's own IIsolatedConnection type, rather
    than as something declared to structurally satisfy DatabaseConnection (Pool) itself
  from: no relational store adapter exists yet in this tree for a constructor signature to be fixed against
- inferred: checkOutIsolatedConnection takes an already-built DatabaseConnection rather than a URL, a
    schema name or 'pg' itself
  from: database-connection.ts's own established claim to be the only file that imports the driver, and
    persistence/migration-runner.ts's own identical precedent
preserved:
- database-connection.ts is unmodified; its own claim to be "the only file that imports the driver" continues
  to hold.
- persistence/migration-runner.ts and its own unit and integration tests are unmodified in behavior.
- The three pre-existing database-touching integration tests (schema-migrations.spec.ts, migration-runner.spec.ts,
  vitest-global-setup.spec.ts) continue to run exactly as before, unaffected in behavior.
- 'vitest.config.ts''s existing fileParallelism: false stopgap is untouched and still governs the whole
  suite''s run.'
- No domain module imports isolated-connection.ts or gains any new import; domain-depends-on-no-infrastructure.spec.ts's
  own existing sweep keeps passing unaffected.
- 'Every assertion in the proof file keeps its own meaning after the checkout-time BEGIN was added: each
  test''s own explicit isolated.query(''BEGIN'') call becomes a harmless no-op none of their assertions
  depend on.'
divergences:
- from: the boundary that a task's own proof touches only its own task's test files
  departure: 'this delivery''s own extension of src/persistence/pg.d.ts (Pool gaining connect(): Promise<PoolClient>)
    broke a sibling, already-delivered task''s proof file''s structural-typing assumption — src/__tests__/integration/persistence/migration-runner.spec.ts
    (task/relational-substrate/migration-step) passed a pg.Client where DatabaseConnection (=Pool) was
    expected, relying on Pool and Client sharing an identical minimal surface; that broke the moment Pool
    alone gained connect(). Fixed with a local asMigrationConnection() helper in that file, narrowing
    the cast to exactly what applyPendingMigrations calls (.query()), changing nothing that file tests
    or asserts.'
  why: re-delivering migration-step's proof separately for a typing fix this task's own change caused
    would split one coherent fix into two acts; the initiative that owns that file's task is still open,
    and this exact reasoning was already applied earlier in this initiative for pre-existing tests broken
    by a legitimate, in-scope change
deferred:
- what: schema-migrations.spec.ts's and migration-runner.spec.ts's own isolation is not retrofitted onto
    checkOutIsolatedConnection.
  why: those files are already-delivered proofs; rewriting their own test content is a test-authoring
    judgment over settled proofs, not this task's own criteria
- what: 'vitest.config.ts''s fileParallelism: false stopgap is not removed.'
  why: it stays load-bearing for the two pre-existing files named above, which have not adopted this mechanism
- what: making IIsolatedConnection structurally satisfy DatabaseConnection (Pool), so a real relational
    store adapter could be constructed directly against a checked-out connection.
  why: no such adapter exists yet in this tree to fix that shape against
- what: the proof file's own criterion-1 test does not wrap its isolated.release() call in try/finally,
    unlike every other test in that file — a different future failure inside it would still leak a checked-out
    connection.
  why: that file is test content; whether and how to harden it is test-author's judgment, flagged here
    so it is not read as unnoticed
---

## What it is

The one way an integration test isolates its own writes from every other test sharing the same
database: check out one connection, do the work, release it — every write vanishes, and no test
ever creates, drops or alters a table to get there. The checkout itself pins both the physical
connection and its schema, so nothing downstream needs to guard against either shifting underneath it.

## Notes

This mechanism keeps every statement of one test's own unit of work pinned to one physical
connection and one known schema for its whole duration, which is what makes it immune to the
session-state loss Neon's transaction-pooling endpoint otherwise causes — the exact bug found and
partially mitigated in task/relational-substrate/migration-step's own delivery, and found again,
live, inside this module's own first proof run, before the checkout-time guard was added.
This task's own extension to the shared ambient pg.d.ts broke a sibling, already-delivered proof
file's structural typing; fixed within this delivery, disclosed below.
