---
title: Proof for the migration step, its CLI entry, and the suite's own global setup
summary: Tests applyPendingMigrations directly (ordering, idempotent re-run, and a script's own failure)
  against both a mocked filesystem/driver and a real, externally-provisioned PostgreSQL database, prove
  the manifest exposes the step as npm run migrate, prove vitest's own global setup runs before any test
  and never substitutes a default connection, and audit the whole test tree for the one behavior criterion
  4 forbids outright.
implementation: sha256:2f9484161905bf780d44bb88c331bc3d67d5d2b17cf51433e3c3099cc8fe888b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-migration-step-suite-5
tests:
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: has already recorded every migration file as applied by the time this spec's own first test runs,
    proving the suite's own setup ran before any test
  proves: criterion 4's first half — the suite's setup runs that step before any test runs — and criterion
    2, since this is the one real empty→populated schema transition a shared-database suite ever produces
  fails_when: public.schema_migrations does not already name every one of the six migration files, or
    to_regclass('public.cases') does not already resolve, by the time this file's first test queries them
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: resolves without error when called the same way vitest itself calls it, against the real configured
    connection
  proves: the wiring criterion 4 depends on actually works
  fails_when: setup() rejects when DATABASE_URL is validly configured
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: refuses with a typed error naming DATABASE_URL, never substituting a default, when the environment
    names no connection
  proves: the task's own UNDERDETERMINED note — excludes a built-in default connection URL used whenever
    the environment names none
  fails_when: setup() resolves, or rejects with anything other than a MigrationStepError naming DATABASE_URL,
    when the environment variable is absent
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: keeps naming DATABASE_URL rather than substituting a default even when it is set to an empty string
  proves: the same UNDERDETERMINED exclusion against a second falsy shape
  fails_when: setup() treats an empty-string DATABASE_URL as usable instead of refusing it
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: leaves a disposable schema without the domain tables when its bookkeeping already shows everything
    applied
  proves: the now-global bookkeeping table's own consequence, disclosed directly rather than left implicit
    — a disposable schema is never re-populated once public.schema_migrations already names every file
  fails_when: to_regclass('cases') resolves under the disposable schema's search_path after this call,
    when it should not
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: applies no script twice and fails nothing when run again against a database that already holds
    the schema
  proves: criterion 3
  fails_when: a second call to applyPendingMigrations against an already-migrated schema rejects, or leaves
    any filename recorded more than once in public.schema_migrations
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: raises MigrationStepError naming the file and wrapping the original error as its cause, when a
    script cannot be applied
  proves: the module's own documented failure-wrapping behavior (COR-01) for a script that cannot be applied
  fails_when: applying a syntactically invalid migration file resolves instead of rejecting, rejects with
    something other than MigrationStepError, omits the failing filename from its context, or drops the
    original driver error as the cause
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: applies migration files in ascending filename order, regardless of the order the filesystem lists
    them
  proves: criterion 1's ordering clause, independent of any real database or real file
  fails_when: the statements sent to the connection for a scrambled filesystem listing are not sent in
    ascending filename order
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: sends no further statement once every migration file is already recorded as applied
  proves: criterion 3 at the mechanism level — nothing beyond the two bookkeeping reads is ever sent once
    every file is already recorded
  fails_when: readFile (and so a script's own DDL) is invoked for a file public.schema_migrations already
    names as applied
- file: src/__tests__/unit/migrate.spec.ts
  name: the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring
    "start"'s own precedent
  proves: criterion 1's own wiring — the tree holds a runnable step — reachable as npm run migrate
  fails_when: package.json's scripts.migrate is absent, or names anything other than "node dist/migrate.js"
- file: src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
  name: no test in the tree writes a table-creating or table-altering statement of its own
  proves: criterion 4's second half, stated as its own totality — no test in the tree creates or alters
    a table
  fails_when: any *.spec.ts file under the test tree contains a literal statement matching a table-creating
    or table-altering DDL verb followed by TABLE
not_applicable:
- edge_case: an empty migrations/ directory (zero .sql files available, as opposed to zero pending once
    every file is already recorded)
  why: exercises the identical empty-result code path already proven by the mocked "sends no further statement"
    test — a dedicated test would assert the same behavior through a different cause of emptiness
- edge_case: two invocations of the step running concurrently against the same database
  why: no criterion or bound node states behavior under concurrent runs; criterion 3 only requires sequential
    idempotency, which is tested
- edge_case: a boundary at each end of a stated numeric range
  why: none of this task's four criteria state a bounded range
- edge_case: migrations/ itself being absent from the tree
  why: every criterion presupposes it exists as the checked-in part of the tree the task's own ADVISORY
    note hands to the standard's own arrangement
untested:
- migrate.ts's own top-level composition (loadEnv, createDatabaseConnection, applyPendingMigrations, and
  connection.end()) is never directly executed by any test here, following the same precedent index.ts's
  own top-level composition already sets in this tree; its constituent pieces are each proven independently.
- A crash between one migration file's DDL succeeding and its own bookkeeping INSERT failing is left unproven,
  matching the implementation record's own disclosed deferral.
- Whether a multi-statement migration file rolls back as a whole when a later statement in that same file
  fails — the one failure-wrapping test written here uses a single-statement invalid script.
- Whether a connection naming an unreachable host (rather than no URL at all) is wrapped the same way
  a script's own SQL failure is — not reproduced directly.
- Whether Neon's pooler can still leak session state into a way this task's own code does not schema-qualify
  against, beyond schema_migrations itself — the fix here is scoped to the one relation this task's own
  code reads and writes; true cross-connection isolation is task/relational-substrate/integration-test-isolation's
  own objective.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/migration-runner.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: identical to the reason schema-migrations.spec.ts already discloses for the same departure — proving
    applyPendingMigrations alone has no use for the whole application's environment schema
- cites: STK-08
  file: src/__tests__/integration/vitest-global-setup.spec.ts
  departure: DATABASE_URL is read directly from process.env, both through a local helper and by manipulating
    process.env.DATABASE_URL itself, rather than through loadEnv.
  why: the module under test reads DATABASE_URL the same direct way for the same reason; a test proving
    its no-default behavior has to exercise that same path
- cites: TST-04
  file: src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
  departure: this file mirrors no single unit under test — criterion 4's second half is a claim over the
    whole test tree, not over one source file.
  why: modeled directly on this codebase's own existing precedent for exactly this shape of claim, neither
    of which mirrors a single unit either
---

## What it is

Eleven tests proving the migration step applies in order, replays idempotently, wraps a script's own
failure in a typed error, is reachable as `npm run migrate`, runs automatically before every test via
vitest's own global setup, never substitutes a default connection, and that no test anywhere in the
tree creates or alters a table of its own.

## Notes

Two of these tests were rewritten mid-delivery once running them against the real database showed the
disposable-schema "empty database" scenario is no longer provable per-test now that bookkeeping is
global — the empty→populated transition is now demonstrated once, by vitest's own real global setup,
and the disposable-schema test was repurposed to assert what is still true about it instead.
