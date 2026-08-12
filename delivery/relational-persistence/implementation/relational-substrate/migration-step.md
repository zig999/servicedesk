---
title: The runnable migration step, its CLI entry, and the suite's own global setup
summary: A shared migration runner applied idempotently by a new CLI entry point and by vitest's own global
  setup, both reading the connection URL from environment configuration alone; its own bookkeeping queries
  are schema-qualified against Neon's pooler leaking ambient search_path across connections.
task: sha256:355108078d67a7f450356e9b065bdd77812b1e3304e22171a5eab3a00b94e5ea
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-migration-step-build-4
files:
- path: src/errors/migration-step.error.ts
  effect: new typed error class MigrationStepError(message, context, options?), following the existing
    per-module error convention, raised by the migration runner and by the suite's own setup for whatever
    could not be applied
- path: src/persistence/migration-runner.ts
  effect: new module exporting applyPendingMigrations(connection, migrationsDirectory) — reads migrations/'s
    own *.sql files, orders them by name, reads the bookkeeping table (schema-qualified as public.schema_migrations,
    guarded by a to_regclass existence check so an empty database never raises) for what is already recorded,
    and for every remaining file runs its text verbatim followed by one parameterized INSERT recording
    it; issues no DDL of its own. Every bookkeeping reference is schema-qualified rather than ambient,
    because Neon's transaction-pooling endpoint can hand back a physical connection carrying an unrelated,
    earlier session's leftover search_path
- path: src/persistence/pg.d.ts
  effect: Pool.query<R = Record<string, unknown>>(text, params?) and end() added beside the pre-existing
    connectionString constructor, unconstrained rather than bounded (matching the existing ambient Client
    declaration's own convention)
- path: src/migrate.ts
  effect: new CLI entry point — loads the environment once through loadEnv, builds the connection from
    env.DATABASE_URL alone, runs applyPendingMigrations against migrations/, then closes the connection
- path: src/vitest-global-setup.ts
  effect: new module exporting vitest's own globalSetup default function — reads DATABASE_URL from process.env
    directly (disclosed divergence below), builds the connection, and runs applyPendingMigrations once,
    before any test file in the suite starts; protected against the same pooler risk automatically as
    a caller of migration-runner.ts's now-qualified queries
- path: vitest.config.ts
  effect: declares test.globalSetup as ['./src/vitest-global-setup.ts'] and test.fileParallelism as false
    — the latter a disclosed stopgap reducing how often Neon's pooler swaps a session's physical backend
    mid-session, not a fix for the underlying risk (see divergences)
- path: package.json
  effect: 'scripts gains "migrate": "node dist/migrate.js", inserted between "build" and "start", mirroring
    "start"''s own precedent of running from the built dist/ output'
criteria:
- criterion: The tree holds a runnable step that applies every script under migrations/ in numbered order
    against the connection the environment names.
  met: true
  how: src/migrate.ts, run as "npm run migrate" → node dist/migrate.js, calls loadEnv() exactly once for
    DATABASE_URL — with no default anywhere in this path — builds the connection, and calls applyPendingMigrations,
    which reads every *.sql file under migrations/, sorts them by their own zero-padded prefix, and applies
    each one not yet recorded, in that order
- criterion: Running that step against an empty database leaves it holding the schema the scripts describe.
  met: true
  how: against an empty database, the bookkeeping-exists check reads false, appliedFilenames returns an
    empty set, and every one of the six ordered scripts is applied, leaving the database holding every
    relation and rule they declare plus one bookkeeping row per applied file — demonstrated directly by
    vitest's own real, single global-setup run, the one genuine empty-database transition a shared-database
    suite produces
- criterion: Running that step against a database that already holds the schema applies no script twice
    and fails nothing.
  met: true
  how: once every filename is already a row in the bookkeeping table, the pending-files filter is empty
    and applyPendingMigrations's loop body never runs — nothing is applied twice and nothing can fail
- criterion: The suite's setup runs that step before any test runs, and no test in the tree creates or
    alters a table.
  met: true
  how: vitest.config.ts wires src/vitest-global-setup.ts's default export as the suite's globalSetup,
    vitest's own mechanism for a step that runs once before any test file starts, calling applyPendingMigrations
    the same way migrate.ts does. No test file this task adds creates or alters a table; the pre-existing
    schema-migrations.spec.ts applies the scripts itself into its own disposable schemas, the direct demonstration
    of the replay property, not an ordinary test's incidental side effect
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - src/persistence/migration-runner.ts
  - src/migrate.ts
  - src/vitest-global-setup.ts
  how: the reconstruct-on-an-empty-database property is what applyPendingMigrations/orderedMigrationFiles/applyMigrationFile
    together encode — reading migrations/'s own files, sorting by their zero-padded prefix, and applying
    every one not yet recorded, in that order, with no step performed by hand. Where the scripts themselves
    live and their file form is left to the standard's own MIG rules
- node: constraints/the-database-is-externally-provisioned
  encoded_at:
  - src/migrate.ts
  - src/vitest-global-setup.ts
  how: migrate.ts reads DATABASE_URL exclusively through loadEnv, which admits no default; vitest-global-setup.ts
    reads it from process.env directly for a disclosed reason but still only from environment configuration,
    never a literal or default value. Neither entry point nor migration-runner.ts ever hardcodes a URL,
    host, port or credential
- node: constraints/the-stored-schema-mirrors-the-declared-model
  how: 'not reached for its governing clause: every column pairing with a declared attribute was already
    answered by task/relational-substrate/schema-migrations. This task is named here only for the exemption
    over the migration-bookkeeping relation, which criterion 3 turns on: migration-runner.ts''s own writes
    touch only that relation and issue no DDL of its own'
inferences:
- inferred: DATABASE_URL admits no built-in default anywhere in this delivery; both entry points throw
    rather than substitute a value when it is absent
  from: resolving the task's own UNDERDETERMINED note explicitly, and constraints/the-database-is-externally-provisioned's
    own statement that the URL is read from environment configuration and from nowhere else
- inferred: migration-runner.ts takes an already-built DatabaseConnection rather than a URL of its own,
    and never imports 'pg' directly
  from: the inventory's own convention that a store's location/connection arrives as a constructor argument,
    and database-connection.ts's own claim to be "the only file that imports the driver"
- inferred: migrate.ts and vitest-global-setup.ts wire loadEnv/createDatabaseConnection/applyPendingMigrations
    inline, rather than through a dedicated factory
  from: index.ts's own precedent — the one other file that wires a whole process end to end directly,
    without a factory
- inferred: applying one migration file's DDL and recording it as applied are two separate statements
    rather than one explicit cross-statement transaction
  from: no criterion or node states crash-mid-migration behavior; wrapping the two would need a larger
    pg.d.ts surface than this task's own criteria call for — left unguarded and disclosed
- inferred: the bookkeeping-table-exists check reads to_regclass(...) rather than catching the driver's
    "relation does not exist" error
  from: a plain, always-succeeding read keeps applyPendingMigrations from having to distinguish a real
    failure from "the table isn't there yet"
- inferred: '"migrate" runs the built src/migrate.ts from dist/migrate.js, not directly from source'
  from: '"start" already runs dist/index.js rather than a source file directly'
- inferred: src/vitest-global-setup.ts sits directly under src/ rather than under src/__tests__
  from: it is suite infrastructure that runs once for the whole run, not a test exercising one unit that
    TST-04's own sense could apply to
- inferred: Pool.query<R>'s ambient generic is left unconstrained (R = Record<string, unknown>) rather
    than bounded
  from: the existing ambient Client declaration already uses an unconstrained default and its own callers
    already pass plain inline shapes with no index signature
- inferred: every bookkeeping reference (to_regclass check, SELECT, INSERT) is schema-qualified as public.schema_migrations
    rather than left ambient
  from: 'discovered directly against the live database during this delivery''s own suite run: a completely
    fresh connection''s SHOW search_path returned a leftover per-test schema name from an unrelated, already-finished
    test session, and to_regclass(''schema_migrations'') (unqualified) resolved to null against public.schema_migrations,
    which held six correct rows all along — Neon''s transaction-pooling endpoint hands back physical connections
    without resetting session-level state between logically distinct client sessions, so nothing that
    reads or writes this one global table can trust ambient search_path'
- inferred: vitest.config.ts sets fileParallelism to false
  from: 'the same live-database discovery: running this task''s new Postgres-touching test files concurrently
    with the pre-existing schema-migrations.spec.ts multiplied how often Neon''s pooler swapped a session''s
    physical backend mid-session, intermittently breaking that already-delivered file''s own unqualified
    per-test-schema statements; disclosed as a stopgap rather than a fix — see divergences'
preserved:
- Every existing test, file store, factory and the HTTP surface continue to behave exactly as before;
  this delivery adds no import to src/case, src/glossary, src/capability-registry, src/investigation or
  src/factories.
- src/persistence/database-connection.ts is unmodified; its own claim to be "the only file that imports
  the driver" continues to hold.
- The existing "test" script (vitest run --passWithNoTests) is unchanged; vitest.config.ts adds only globalSetup
  and fileParallelism.
- src/__tests__/integration/persistence/schema-migrations.spec.ts's own migration application into its
  own disposable schemas is untouched, and now passes reliably again once file-level concurrency is removed.
- The manifest's declared-dependencies set is unchanged; this task installs nothing.
divergences:
- cites: STK-08
  file: src/vitest-global-setup.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is also configured; vitest's globalSetup
    runs once before every test in the suite, not only the ones that touch the database — the identical
    reason schema-migrations.spec.ts already discloses for departing from the same rule
- from: a complete fix for cross-connection session-state isolation against Neon's pooler
  departure: vitest.config.ts disables fileParallelism as a stopgap, and migration-runner.ts schema-qualifies
    only its own bookkeeping table references. Neither eliminates the underlying risk that a pooled connection
    can carry an unrelated, earlier session's leftover state (search_path, or anything else session-scoped);
    the first only reduces how often it is provoked, and the second only protects the one relation this
    task's own code touches.
  why: closing this fully — true per-worker database or connection isolation — is task/relational-substrate/integration-test-isolation's
    own, not-yet-delivered objective, discovered as a live consequence of this delivery's own suite run
    rather than solved here, since solving it properly reaches past this task's own four criteria
deferred:
- what: src/__tests__/integration/persistence/schema-migrations.spec.ts's own private migration-ordering-and-apply
    helpers now duplicate the logic centralized in persistence/migration-runner.ts.
  why: that file is task/relational-substrate/schema-migrations' own already-delivered proof; rewriting
    it is outside this task's own criteria
- what: A crash between applying a migration file's DDL and recording it as applied (an atomic cross-statement
    transaction over the two) is not guarded against.
  why: none of the three replay/idempotency criteria exercise this path
- what: True isolation of concurrent integration test connections against Neon's transaction-pooling endpoint
    — this delivery's disabled fileParallelism is a stopgap, not a fix.
  why: task/relational-substrate/integration-test-isolation, which this task's dependents wait on, is
    the objective this belongs to; this delivery surfaced the concrete evidence (a leaked ambient search_path
    breaking two different files) that task will need
---

## What it is

The one way a database gets this schema, whether by hand through a CLI entry point or automatically
before every suite run. Both read the connection from environment configuration alone, and applying
the migrations twice does nothing the second time. Its own bookkeeping never trusts the connection's
ambient schema, because Neon's pooler does not reliably reset session state between connections.

## Notes

vitest's own globalSetup mechanism is what wires the suite's own setup; the installed vitest version
exposes no CLI flag for this, so a new vitest.config.ts was the only way to declare it.
The suite's own setup now depends on a real, externally-provisioned PostgreSQL instance being
reachable at DATABASE_URL — every future test run needs that connection, not only the
schema-migrations integration suite that already needed it on its own.
Running this delivery's own suite for the first time surfaced a real, live bug: Neon's transaction-pooling
endpoint hands back physical connections without resetting session-level state (search_path) between
unrelated client sessions, which broke both this task's own bookkeeping reads and, once several
Postgres-touching test files ran concurrently, an already-delivered sibling file's own per-test schema
isolation. Fixed for this task's own code by schema-qualifying every bookkeeping reference; mitigated
suite-wide, as a disclosed stopgap rather than a fix, by disabling file-level test parallelism.
