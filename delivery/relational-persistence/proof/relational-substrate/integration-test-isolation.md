---
title: Proof for per-test transactional isolation over one shared Postgres pool
summary: Proves checkOutIsolatedConnection's own isolation — a write vanishes once its connection is released,
  two tests writing the same case slug or investigation id in one run both pass, a test observes none
  of another test's rows, and no test obtains any of that by creating, dropping or altering a table —
  plus a type-regression fix this task's own pg.d.ts extension caused in a sibling task's already-delivered
  proof file.
implementation: sha256:f3dfe0b8d69f264cf23bfcf25766c707491c89f095d24872c517baea68b3a9f4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-integration-test-isolation-suite-3
tests:
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: leaves the cases table holding no row for the slug it wrote, once it releases the isolated connection
    it wrote through
  proves: An integration test that writes leaves the database holding none of the rows it wrote once it
    has finished.
  fails_when: release() stops issuing ROLLBACK before returning the client to the pool, or checkOutIsolatedConnection
    stops pinning one physical connection and schema across BEGIN/INSERT/release
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: lets a first integration test write a case under a slug a second test in this run will also write,
    without a unique-key collision
  proves: Two integration tests writing the same case slug in one suite run both pass. (first half)
  fails_when: the insert throws, which would happen if some earlier, un-rolled-back run's row under this
    same fixed slug were still present
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: lets a second integration test write a case under the same slug the first one already wrote, in
    the same suite run
  proves: Two integration tests writing the same case slug in one suite run both pass. (second half, the
    literal duplicate)
  fails_when: this second write throws a unique-violation because the first test's row was still present
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: lets a first integration test write an investigation under an id a second test in this run will
    also write, without a primary-key collision
  proves: Two integration tests writing the same investigation id in one suite run both pass. (first half)
  fails_when: the insert (or one of its prerequisite inserts) throws
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: lets a second integration test write an investigation under the same id the first one already
    wrote, in the same suite run
  proves: Two integration tests writing the same investigation id in one suite run both pass. (second
    half, the literal duplicate)
  fails_when: this second write throws a primary-key violation because the first test's row was still
    present
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: writes a case under a slug the next test below reads back
  proves: the writer half of "A test observes no row another test wrote."
  fails_when: the write itself throws, or the connection it used is not released before the next test
    starts
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: observes no row for the slug the previous test wrote, once that test had already released its
    own connection
  proves: A test observes no row another test wrote. (the actual observation)
  fails_when: the SELECT for the previous test's slug returns a row
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: still refuses a second case written under an already-used slug within one still-open isolated
    connection, since isolation scopes visibility rather than disabling constraints
  proves: that checkOutIsolatedConnection's isolation scopes cross-test visibility rather than disabling
    the store's own uniqueness constraint
  fails_when: the second insert inside the same still-open transaction does not throw a unique-violation
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: resolves release() without error when nothing was ever begun or written on the checked-out connection
  proves: release() unconditionally issues ROLLBACK, and Postgres accepts a ROLLBACK with no transaction
    in progress as a harmless no-op
  fails_when: release() rejects when called on a freshly checked-out connection
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: resolves release() without error when the caller already sent its own ROLLBACK before calling
    it
  proves: the same guarantee's other half — a caller that already rolled back leaves release() with nothing
    to undo
  fails_when: release() rejects when called after the caller's own explicit ROLLBACK already ran
- file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  name: keeps two isolated connections checked out from the same pool at once from seeing each other's
    uncommitted writes, and leaves neither write behind once both release
  proves: checkOutIsolatedConnection pins one physical connection per caller, so two concurrent callers
    never share session state
  fails_when: either connection's SELECT for the other's uncommitted slug returns a row, or a row survives
    after both release
not_applicable:
- edge_case: absent or empty input to checkOutIsolatedConnection
  why: it takes exactly one required Pool parameter with no optional or absent variant the isolation guarantee
    could differ over
- edge_case: a numeric boundary at either end of a range
  why: neither checkOutIsolatedConnection nor release() takes a count, a limit or any other numeric parameter
- edge_case: the database or pool answering slowly or failing outright during connect()/release()
  why: the store is the one boundary this task's own established convention keeps real rather than standing
    in for; no criterion of this task names degraded-dependency behavior for it to prove
untested:
- UNDERDETERMINED (task Notes) — a harness building the test database's schema through means other than
  replaying the numbered migration scripts would still pass every criterion here; excluding it sits in
  task/relational-substrate/migration-step's own scope, already excluded there.
- UNDERDETERMINED (task Notes) — the objective's 'one database' is not backed by any criterion stating
  the suite writes to a single store; which harness the suite actually runs under is a test-infrastructure
  decision outside what this task's own module or proof implements.
- UNDERDETERMINED (task Notes) — an isolation arrangement that let two same-slug cases coexist and cleaned
  them up only afterward would still pass criterion 2 as literally worded; the fact that would exclude
  it (slug uniqueness) is not this task's to implement, so no test scoped to this task settles which mechanism
  was actually used.
- 'True concurrent execution across separate vitest worker processes/files against the shared pool (fileParallelism
  enabled) is not exercised: vitest.config.ts still disables fileParallelism as its own stopgap.'
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/isolated-connection.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv,
    and two raw pool.query() calls bypassing checkOutIsolatedConnection read the unqualified cases table
    as public.cases.
  why: the same STK-08/search_path-pollution rationale already disclosed for schema-migrations.spec.ts
    and migration-runner.spec.ts — these two reads run outside checkOutIsolatedConnection's own schema-pinning,
    so they schema-qualify directly instead
- from: the boundary that a task's own proof touches only its own task's test files
  departure: this proof also edits src/__tests__/integration/persistence/migration-runner.spec.ts — task/relational-substrate/migration-step's
    own, already-delivered proof file — adding a local asMigrationConnection() helper and routing that
    file's four calls into applyPendingMigrations through it instead of passing its own Client directly.
  why: this task's own extension of pg.d.ts (Pool gaining connect()) broke that sibling file's structural-typing
    assumption. applyPendingMigrations itself only ever calls .query() on the connection it is given,
    so the fix is a narrower local cast confined to that one file, changing nothing it tests or asserts.
    Folding it into this task's own proof follows the same reasoning already applied twice earlier in
    this initiative
- from: the rule that a test depends on no other test having run
  departure: 'the two criterion-4 tests in isolated-connection.spec.ts ("writes a case under a slug the
    next test below reads back" and "observes no row for the slug the previous test wrote") are deliberately
    coupled: the second reads module-level state the first one set, and its pass depends on the first
    having already run and released its own connection.'
  why: criterion 4 is itself a statement about the relationship between two tests in one suite run, and
    no single self-contained test can state that relationship without simulating a second test inside
    the first, which would prove something narrower than the criterion literally names
---

## What it is

Eleven tests proving a written row vanishes once its isolated connection is released, that two
tests writing the same case slug or investigation id in one run both pass, that a test observes
none of another test's rows, and that none of this comes from creating, dropping or altering a
table.

## Notes

The real suite surfaced a live instance of the exact bug this task exists to prevent, inside this
module's own first proof run — an unqualified statement immediately after checkout failed against
an unrelated session's leftover search_path. Fixed in the implementation (checkout now resets
search_path itself) and, for the two reads that run outside that pinning entirely, in this proof.
