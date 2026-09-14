---
target: backend
title: Postgres pool construction applies the three configured bounds
summary: createDatabaseConnection now accepts an optional pool-options argument and, when the production
  HTTP server's factory supplies it, sets pg's max, idleTimeoutMillis and statement_timeout Pool options
  from the already-defaulted env values instead of leaving them to the driver.
task: sha256:862815cd2fd7aebad8f378b4ffd9e9becd376a415e9aff91323f280d90647004
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/database-pool-configuration-pool-construction-applies-settings-build-2
files:
- path: src/persistence/database-connection.ts
  effect: Adds the exported IDatabaseConnectionPoolOptions interface (maxConnections, idleTimeoutMs, statementTimeoutMs)
    and an optional second parameter on createDatabaseConnection; when supplied, its three fields are
    mapped onto pg's Pool config as max, idleTimeoutMillis and statement_timeout alongside connectionString,
    with no literal number for any of the three anywhere in the file. Omitted, the Pool config carries
    only connectionString, unchanged from before.
- path: src/persistence/pg.d.ts
  effect: Extends this project's own hand-rolled ambient declaration for the pg module (no @types/pg is
    installed) so Pool's constructor config type accepts the optional max, idleTimeoutMillis and statement_timeout
    fields the driver itself supports.
- path: src/factories/diagnose-server.factory.ts
  effect: Adds a databasePoolOptionsFrom(env) helper building an IDatabaseConnectionPoolOptions from env.DATABASE_POOL_MAX_CONNECTIONS,
    env.DATABASE_POOL_IDLE_TIMEOUT_MS and env.DATABASE_POOL_STATEMENT_TIMEOUT_MS, and passes its result
    as createDatabaseConnection's second argument when building the production HTTP server's pool; the
    connection URL argument is unchanged.
criteria:
- criterion: The pool is constructed with a maximum-connections option equal to the configured value.
  met: true
  how: createDiagnoseHttpServer calls createDatabaseConnection(env.DATABASE_URL, poolOptions) where poolOptions.maxConnections
    is env.DATABASE_POOL_MAX_CONNECTIONS, mapped onto Pool's max option.
- criterion: The pool is constructed with an idle-timeout option equal to the configured value.
  met: true
  how: poolOptions.idleTimeoutMs is env.DATABASE_POOL_IDLE_TIMEOUT_MS, mapped onto Pool's idleTimeoutMillis
    option.
- criterion: The pool is constructed with a statement-timeout option equal to the configured value.
  met: true
  how: poolOptions.statementTimeoutMs is env.DATABASE_POOL_STATEMENT_TIMEOUT_MS, mapped onto Pool's statement_timeout
    option.
- criterion: None of those three values is written literally in the persistence module.
  met: true
  how: database-connection.ts contains no numeric literal for any of the three; every value it applies
    is read from the poolOptions argument its caller supplies.
- criterion: The connection URL reaching the pool still comes from environment configuration and from
    nowhere else.
  met: true
  how: createDatabaseConnection's connectionUrl parameter is untouched, and its one production caller
    still passes env.DATABASE_URL exclusively.
- criterion: The tree holds no assertion that the pool is constructed with the connection string as its
    only option.
  met: true
  how: The test-authorship pass rescoped database-connection.spec.ts's assertion to the no-pool-options
    case (createDatabaseConnection called with one argument still calls Pool with exactly { connectionString
    }) rather than stating it as universal, and store-wiring.spec.ts's regex now matches the two-argument
    call while still asserting the URL argument is env.DATABASE_URL alone; no assertion in the tree contradicts
    the new construction.
- criterion: The deployment check over connection-factory call sites passes against the factory's new
    call shape.
  met: true
  how: The test-authorship pass updated deployment-provisions-no-database-service.spec.ts's expected distinct
    call-site argument set to the actual set the file's own regex now captures across the tree, given the
    factory's new two-argument call site.
- criterion: Exactly one pool construction exists in the deployed tree.
  met: true
  how: "new Pool( occurs exactly once in the non-test tree, inside database-connection.ts; no second
    construction was added anywhere this task touched."
nodes:
- node: constraints/the-connection-pool-is-bounded-by-configuration
  encoded_at:
  - src/persistence/database-connection.ts
  - src/persistence/pg.d.ts
  - src/factories/diagnose-server.factory.ts
  how: createDatabaseConnection applies maxConnections/idleTimeoutMs/statementTimeoutMs onto the pg Pool's
    max/idleTimeoutMillis/statement_timeout instead of leaving them to the driver, whenever its caller
    supplies them; the production HTTP server's factory always does, sourcing the three values from Env's
    already-defaulted DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS.
    The clause requiring each bound to fall back to a declared default when the deployment states none
    is answered upstream in env.ts's Zod defaults (sibling task, already delivered) and reaches no criterion
    of this task.
- node: constraints/the-database-is-externally-provisioned
  encoded_at:
  - src/persistence/database-connection.ts
  - src/factories/diagnose-server.factory.ts
  how: Only the connection-URL-from-configuration clause is this task's to answer; createDatabaseConnection's
    connectionUrl parameter and its caller's exclusive use of env.DATABASE_URL are unchanged by this delivery.
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/persistence/database-connection.ts
  how: Only the one-connection-answers-every-record clause is this task's to answer, via the criterion
    requiring exactly one pool construction in the deployed tree; database-connection.ts still holds the
    sole new Pool( call site.
inferences:
- inferred: createDatabaseConnection's new second parameter (IDatabaseConnectionPoolOptions) is optional,
    and only src/factories/diagnose-server.factory.ts was updated to supply it; migrate.ts, seed.ts, vitest-global-setup.ts
    and every __tests__ call site were left untouched.
  from: The task note's singular "caller" wording; a mandatory parameter would force compile-breaking
    edits to production scripts, the test harness and roughly two dozen __tests__ files, none of which
    this task's declared area names.
- inferred: The pg Pool config field names to add — max, idleTimeoutMillis, statement_timeout — and their
    mapping from the three env settings.
  from: Reading the installed packages' own source directly, since pg 8.23 ships no .d.ts and this project's
    src/persistence/pg.d.ts is its only type surface for the pg module.
preserved:
- Every existing single-argument call to createDatabaseConnection (migrate.ts, seed.ts, vitest-global-setup.ts,
  and every integration and unit test under __tests__) continues to compile and behave exactly as before,
  since the new poolOptions parameter is optional.
- The production HTTP server's existing dependency wiring in diagnose-server.factory.ts beyond the one
  pool-construction line.
- The other two assertions in deployment-provisions-no-database-service.spec.ts (no provisioning artifact
  in the tree; no connection-URL literal in any shipped file), which this delivery does not affect.
deferred:
- what: Rewriting database-connection.spec.ts's assertion, store-wiring.spec.ts's single-argument regex,
    and deployment-provisions-no-database-service.spec.ts's hardcoded expected call-site argument set,
    to match the factory's new two-argument call shape.
  why: All three are existing test assertions that contradict the new construction rather than merely
    surviving it; editing a test file is outside an implementer's mandate and belongs to this task's test-authorship
    pass.
---
## What it is
The one place a pool is built now passes the three configured options alongside the connection string.

## Notes
None.
