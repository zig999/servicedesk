---
target: backend
title: createDatabaseConnection requires explicit pool options
summary: poolOptions is now a mandatory parameter of createDatabaseConnection, the Pool construction reads
  max/idleTimeoutMillis/statement_timeout unconditionally, and every non-test production caller (the factory,
  the migration script, the seed script) now supplies it.
task: sha256:f87c8908506f4f180be2f410f901ed9aac2d157e712dc0507ab33923b70940c9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/pool-options-required-corrective-build
files:
- path: src/persistence/database-connection.ts
  effect: createDatabaseConnection's poolOptions parameter dropped its `?`, becoming required (IDatabaseConnectionPoolOptions,
    not IDatabaseConnectionPoolOptions | undefined); the Pool object literal reads max, idleTimeoutMillis
    and statement_timeout unconditionally from poolOptions, with the conditional-spread branch that built
    a Pool without them removed. No numeric literal for any of the three bounds appears in the file.
- path: src/migrate.ts
  effect: Adds a private databasePoolOptionsFrom(env) mapping DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS
    and DATABASE_POOL_STATEMENT_TIMEOUT_MS onto IDatabaseConnectionPoolOptions; the createDatabaseConnection(env.DATABASE_URL)
    call now passes the result as its second argument.
- path: src/seed.ts
  effect: Same addition as migrate.ts — a private databasePoolOptionsFrom(env) mirroring it, and createDatabaseConnection(env.DATABASE_URL)
    now supplies the resulting poolOptions.
criteria:
- criterion: 'createDatabaseConnection''s poolOptions parameter is required, not optional: a call naming
    only a connection URL fails to typecheck.'
  met: true
  how: The parameter's `?` is removed in database-connection.ts; its type is IDatabaseConnectionPoolOptions
    rather than IDatabaseConnectionPoolOptions | undefined, so a call site supplying only a connection
    URL no longer typechecks.
- criterion: The Pool construction in database-connection.ts reads max, idleTimeoutMillis and statement_timeout
    unconditionally from the supplied poolOptions — no branch constructs a Pool without them.
  met: true
  how: The object literal passed to new Pool(...) always includes max, idleTimeoutMillis and statement_timeout
    mapped from poolOptions; the conditional spread that previously allowed a Pool with none of them is
    gone.
- criterion: No numeric literal for any of the three bounds is written inside database-connection.ts itself.
  met: true
  how: The file holds no numeric literal for any bound; each is read from the poolOptions parameter's
    properties.
- criterion: Every existing caller of createDatabaseConnection (the production factory, migration and
    seed scripts, the test harness, and every test that constructs a connection) supplies poolOptions,
    and the tree still builds and its full suite passes.
  met: true
  how: The production factory already supplied poolOptions from a prior delivery. migrate.ts and seed.ts
    now both supply it, sourced from the same three DATABASE_POOL_* env values the factory already uses.
    Every test-file call site and the shared test harness were updated by this task's own test-authorship
    pass (see the proof record) to supply poolOptions as well; run/pool-options-required-corrective-build
    and run/pool-options-required-corrective-suite-full confirm the tree builds and the full suite passes.
nodes:
- node: constraints/the-connection-pool-is-bounded-by-configuration
  encoded_at:
  - src/persistence/database-connection.ts
  - src/migrate.ts
  - src/seed.ts
  how: 'This task''s own Notes (recorded by the binder before implementation) mark two UNDERDETERMINED
    gaps against this node''s full statement — that the bounds are supplied "as deployment configuration"
    and that each "falls back to a declared default where the deployment states none" — and record that
    this task''s four criteria pass regardless of either. Implementation answers exactly those four criteria:
    poolOptions is required, the three bounds are read unconditionally, no literal sits in database-connection.ts,
    and poolOptions is supplied at the migration and seed call sites (the factory already did). Where
    free to choose (how migrate.ts and seed.ts obtain their poolOptions), the same DATABASE_POOL_* env
    values the factory already reads were used, which is what makes the values deployment-configuration-shaped
    in practice, though no criterion of this task required that choice.'
inferences:
- inferred: A private databasePoolOptionsFrom(env) helper was added to both migrate.ts and seed.ts, duplicating
    the shape of the same-named private helper already in diagnose-server.factory.ts, rather than extracting
    a shared exported helper into env.ts or a new module.
  from: The existing convention of a same-named, file-local helper; a new shared abstraction was not asked
    for by this task.
- inferred: migrate.ts's and seed.ts's pool bounds are sourced from the same three DATABASE_POOL_* env
    values the production factory already reads, rather than numeric literals written directly at those
    two call sites.
  from: Criterion 3 only forbids literals inside database-connection.ts itself, and the task's own Notes
    give a caller-holds-literals shape as one example of what would pass the criteria as written — but
    using env values keeps all three production callers on one source of truth, consistent with the factory's
    own convention.
- inferred: src/vitest-global-setup.ts is test infrastructure, not a production caller, and so was left
    to the test-authorship pass rather than treated as one of "the production factory, migration and seed
    scripts" this delegation's scope named.
  from: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts already names this exact
    file SUITE_HARNESS_BASENAME and deliberately excludes it from what it treats as "the deployment."
deferred:
- what: docs/cases/_registry/register.mjs, found by a tree-wide grep, dynamically loads the compiled dist
    output and calls createDatabaseConnection(connectionUrl) with no poolOptions.
  why: It sits outside the given target source root (src) and outside this task's named callers (the production
    factory, migration and seed scripts under src); it is plain JavaScript, never type-checked by this
    project's tsconfig, so the now-required parameter offers it no protection. It will throw at runtime
    the next time it is run against a build carrying this change. Flagged for a separate decision; not
    this task's to fix.
---
## What it is
createDatabaseConnection's second parameter stops being optional, and every production call site is updated to supply it.

## Notes
None.
