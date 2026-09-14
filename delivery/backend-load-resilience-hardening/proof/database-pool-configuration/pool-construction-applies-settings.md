---
target: backend
title: Postgres pool construction applies the three configured bounds — proof
summary: Unit tests over createDatabaseConnection's optional second argument and its mapping onto pg's
  max/idleTimeoutMillis/statement_timeout, plus the two pre-existing tree-wide checks brought into line
  with the new two-argument call shape and a new tree-wide single-pool-construction check.
implementation: sha256:2af7e7f941c0f37084059a40c1a81552a5413de5e225ade47b48697cd49725cf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/database-pool-configuration-pool-construction-applies-settings-suite-2
tests:
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.maxConnections onto the pg Pool's max option
  proves: 'Criterion: the pool is constructed with a maximum-connections option equal to the configured
    value.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's max
    field to poolOptions.maxConnections.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.idleTimeoutMs onto the pg Pool's idleTimeoutMillis option
  proves: 'Criterion: the pool is constructed with an idle-timeout option equal to the configured value.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's idleTimeoutMillis
    field to poolOptions.idleTimeoutMs.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.statementTimeoutMs onto the pg Pool's statement_timeout option
  proves: 'Criterion: the pool is constructed with a statement-timeout option equal to the configured
    value.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's statement_timeout
    field to poolOptions.statementTimeoutMs.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no numeric literal for the max, idleTimeoutMillis or statement_timeout pool option anywhere
    in its own source
  proves: 'Criterion: none of those three values is written literally in the persistence module.'
  fails_when: database-connection.ts's own source contains a numeric literal assigned directly to max,
    idleTimeoutMillis or statement_timeout instead of reading it from the poolOptions parameter.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: builds the pg Pool with exactly the given connection URL as its connectionString, and no other
    configuration key, when the caller supplies no pool options
  proves: 'Criterion: the tree holds no assertion that the pool is constructed with the connection string
    as its only option — this assertion is now scoped to the no-pool-options case rather than stated as
    universal, and continues to prove the connectionString mapping and the single-Pool-call shape it always
    held.'
  fails_when: createDatabaseConnection, called with no second argument, calls Pool with any key other
    than connectionString, calls it more than once, or maps connectionString to anything other than the
    URL it was given.
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: createDiagnoseHttpServer's own exported function takes exactly one parameter, env, and builds
    its one connection from env.DATABASE_URL alone, naming no data-directory field of Env
  proves: 'Criterion: the connection URL reaching the pool still comes from environment configuration
    and from nowhere else — the factory''s call site names env.DATABASE_URL alone as its first argument,
    whatever shape the second (pool-options) argument takes.'
  fails_when: diagnose-server.factory.ts's createDatabaseConnection call site names anything other than
    env.DATABASE_URL, alone, as its first argument.
- file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  name: builds every connection the deployment opens from env.DATABASE_URL, naming no other source for
    the URL anywhere
  proves: 'Criterion: the deployment check over connection-factory call sites passes against the factory''s
    new call shape — updated to the actual, whitespace-normalized set of distinct createDatabaseConnection
    argument texts the regex now captures across the deployed tree.'
  fails_when: any deployed file's createDatabaseConnection call or declaration carries an argument text
    outside this known set — in particular, a call site naming a connection-URL source other than env.DATABASE_URL
    or connectionUrl.
- file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  name: constructs the pg Pool in exactly one place across the entire deployed tree
  proves: 'Criterion: exactly one pool construction exists in the deployed tree.'
  fails_when: a second new Pool( call site appears anywhere in the deployed (non-test) source tree.
not_applicable:
- edge_case: Boundary values of the three bounds (zero, negative, non-integer, absent-with-fallback-to-default)
  why: REMAINDER-noted by the task itself as belonging to the sibling task/act that declares the three
    settings on the environment schema with defaults and enforces their admissible shape; no criterion
    of this task concerns the value's shape, only that a configured value is what the pool carries.
- edge_case: A dependency (the real Postgres server) that is unavailable, slow, or rejects the configured
    bounds
  why: No criterion of this task concerns runtime connection failure or the driver's enforcement of a
    bound; the criteria are all about what the pool is constructed with, verified with the driver mocked
    at the unit boundary.
- edge_case: Concurrent construction of two pools, or two operations against one pool at once
  why: No criterion or node fact this task implements addresses concurrency; construction is a single
    synchronous call with no shared mutable state between invocations.
- edge_case: An empty or duplicate poolOptions field
  why: IDatabaseConnectionPoolOptions's three fields are each a single required number with no criterion
    treating a duplicate or a collection.
untested:
- 'Whether migrate.ts, seed.ts and the test harness''s own pool constructions apply the configured bounds
  is left unproven by any test: only diagnose-server.factory.ts''s production wiring was updated to supply
  poolOptions, and no criterion of this task requires the scripts or harness to do so.'
- That max, idleTimeoutMillis and statement_timeout are the pg driver's actual accepted Pool config keys
  is inferred from reading the installed package's own source (pg ships no official types), not from a
  specification node or a type declaration pg itself publishes. No test here verifies against the real
  driver that these keys are honored at runtime.
- 'constraints/the-connection-pool-is-bounded-by-configuration is not decided whole by any test in this
  proof: its fitness requires both that a configured bound is carried by the pool (this task''s ground,
  tested above) and that each bound falls back to a declared default where the deployment states none
  — a clause the task''s own REMAINDER note assigns to the sibling task, already delivered outside this
  task''s files.'
- 'constraints/the-database-is-externally-provisioned is not decided whole by any test in this proof:
  this task answers only its connection-URL-from-configuration clause; the clauses that the database is
  provisioned outside the deployment and that the deployment provisions no database service are, per the
  task''s own REMAINDER note, answered by the deployment manifest''s absence of a database service, outside
  this task''s files.'
- 'constraints/the-system-persists-to-one-relational-database is not decided whole by any test in this
  proof: this task answers only its one-connection-answers-every-record clause via the exactly-one-pool-construction
  test above; the clause that no record is held in a file the deployment ships or writes is, per the task''s
  own REMAINDER note, answered by already-delivered acts outside this task''s files.'
---
## What it is
Unit tests over the pool's option mapping, plus updated tree-wide checks.

## Notes
The first suite attempt (run/database-pool-configuration-pool-construction-applies-settings-suite) failed with one unrelated pre-existing flaky test in src/__tests__/integration/factories/diagnose-server.factory.spec.ts, asserting a real measured duration >= a mocked 10ms delay and observing 9ms — a boundary-exact timing assertion with no tolerance for scheduler jitter. A failure-diagnostician confirmed cause: test, on a file none of this delivery's own tasks touched, and unrelated to any node this task implements. The suite passed cleanly on the next attempt (suite-2), confirming the diagnosis.
