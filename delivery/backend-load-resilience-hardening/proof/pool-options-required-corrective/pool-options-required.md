---
target: backend
title: createDatabaseConnection requires explicit pool options — proof
summary: Type-level and unit tests over poolOptions becoming mandatory, plus fixes to every remaining
  single-argument caller (the shared vitest harness and every affected integration/unit spec) so the
  tree typechecks and the full suite passes under the new required parameter.
implementation: sha256:c29b0cde2384ae9df705d81bafd0e672c4cae3876260691ebecee912c01a751e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/pool-options-required-corrective-suite-full-3
tests:
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: 'refuses, at the type level, a call naming only a connection URL: poolOptions is a required parameter'
  proves: "Criterion: createDatabaseConnection's poolOptions parameter is required, not optional — a
    call naming only a connection URL fails to typecheck."
  fails_when: poolOptions becomes optional or gains a default again, so the call the @ts-expect-error
    directive suppresses no longer produces a type error and `npm run typecheck` reports the directive
    itself as unused at that line.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.maxConnections onto the pg Pool's max option
  proves: 'Criterion: the Pool construction reads max unconditionally from the supplied poolOptions.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's
    max field to poolOptions.maxConnections.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.idleTimeoutMs onto the pg Pool's idleTimeoutMillis option
  proves: 'Criterion: the Pool construction reads idleTimeoutMillis unconditionally from the supplied
    poolOptions.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's
    idleTimeoutMillis field to poolOptions.idleTimeoutMs.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: maps a supplied poolOptions.statementTimeoutMs onto the pg Pool's statement_timeout option
  proves: 'Criterion: the Pool construction reads statement_timeout unconditionally from the supplied
    poolOptions.'
  fails_when: createDatabaseConnection, given a poolOptions argument, does not set the Pool config's
    statement_timeout field to poolOptions.statementTimeoutMs.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no numeric literal for the max, idleTimeoutMillis or statement_timeout pool option anywhere
    in its own source
  proves: 'Criterion: no numeric literal for any of the three bounds is written inside database-connection.ts
    itself.'
  fails_when: database-connection.ts's own source contains a numeric literal assigned to max, idleTimeoutMillis
    or statement_timeout instead of reading it from the poolOptions parameter.
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: is called with only a connection URL nowhere in the tree except this file's own type-level
    refusal proof, so every caller — production or test — supplies poolOptions
  proves: 'Criterion: every existing caller of createDatabaseConnection (the production factory, migration
    and seed scripts, the test harness, and every test that constructs a connection) supplies poolOptions.'
  fails_when: any .ts file under the target source root — production or test, including the vitest
    harness — calls createDatabaseConnection with only one argument, other than the single deliberate
    type-level demonstration this test excludes by its expected count.
- file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  name: builds every connection the deployment opens from env.DATABASE_URL, naming no other source for
    the URL anywhere
  proves: "Criterion: every production caller (diagnose-server.factory.ts, migrate.ts and seed.ts)
    supplies poolOptions, and database-connection.ts's own two-parameter signature — now with poolOptions
    required — is the only shape the deployed tree's construction calls or declaration take."
  fails_when: any deployed (non-test, non-harness) file's createDatabaseConnection call or the function's
    own declaration carries an argument text outside the two known shapes — in particular a call naming
    only one argument, or the declaration reverting to an optional poolOptions parameter.
- file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  name: builds every production caller's poolOptions from a numeric literal nowhere in that caller's
    own file
  proves: "This task's first UNDERDETERMINED note — a candidate implementation building poolOptions
    from numeric literals written directly in the caller file, reading nothing from the environment,
    satisfies every one of this task's four stated criteria while constraints/the-connection-pool-is-bounded-by-configuration
    (which names the three bounds as deployment configuration) refuses it."
  fails_when: migrate.ts, seed.ts or diagnose-server.factory.ts assigns a numeric literal directly to
    maxConnections, idleTimeoutMs or statementTimeoutMs instead of reading each from Env's pool-configuration
    fields.
- file: src/__tests__/unit/config/env.spec.ts
  name: yields a defaulted value for each of the three pool variables when the existing required-variable
    fixture names none of them
  proves: "This task's second UNDERDETERMINED note — a candidate implementation that treats the three
    pool environment values as mandatory and throws at startup when the deployment states none of them
    satisfies every one of this task's four stated criteria while the constraint's fallback-to-declared-default
    clause refuses it. This pre-existing test, delivered under the sibling database-pool-configuration/pool-settings-in-env-schema
    task whose implementation also encodes this same node, already fails over exactly that candidate,
    so no new test is written for it here."
  fails_when: loadEnv(), given a source naming none of the three pool variables, throws instead of
    yielding a finite, defaulted value for each.
not_applicable:
- edge_case: Concurrent construction of two pools, or two operations against one connection at once
  why: No criterion of this task or fact of the node it implements addresses concurrency; construction
    is a single synchronous call with no shared mutable state between invocations.
- edge_case: The real Postgres server being unavailable, slow, or rejecting a configured bound at runtime
  why: No criterion concerns runtime connection behavior; all four criteria are about what argument
    shape reaches the constructor and what the constructor does with it, verified with the driver mocked
    at the unit boundary.
- edge_case: A non-integer, zero or negative value for one of the three bounds
  why: Value-shape validation is constraints/the-pool-bounds-are-positive-integers, a sibling node this
    task does not implement; this task's criteria concern only whether poolOptions is supplied and read,
    never whether its contents are admissible.
- edge_case: Defeating the required parameter via an explicit type assertion or `any` at a call site
  why: Criterion 1 is a claim about the ordinary compile-time contract of the exported signature; no
    criterion addresses a caller that deliberately bypasses static typing, and no such call site exists
    anywhere in the tree today.
untested:
- 'docs/cases/_registry/register.mjs (line 219) calls createDatabaseConnection(connectionUrl) with a
  single argument. It sits outside the target source root, is plain JavaScript rather than TypeScript,
  and was explicitly named out of scope for this task. Because it is never type-checked by this project''s
  tsconfig, the now-required poolOptions parameter offers it no protection: if this script is invoked,
  it will read poolOptions.maxConnections off undefined and throw at runtime. No test in this proof
  reaches it, and it is left here as a known, deferred item.'
- 'constraints/the-connection-pool-is-bounded-by-configuration is not decided whole by any test in this
  proof, matching this task''s own Notes and the precedent left by the sibling pool-construction-applies-settings
  proof: the clause naming the three bounds as "supplied as deployment configuration" and the clause
  that each "falls back to a declared default where the deployment states none" are not reached by any
  of this task''s four criteria. The not-a-hardcoded-literal slice of the first clause is tested above;
  the fallback-to-default slice remains the domain of the already-delivered database-pool-configuration/pool-settings-in-env-schema
  task, whose own proof already names it unproven too.'
---
## What it is
Type-level and unit tests over the now-mandatory pool options, plus fixes to every remaining single-argument caller so the tree typechecks and the suite passes.

## Notes
run/pool-options-required-corrective-build passed cleanly; the full suite (run/pool-options-required-corrective-suite-full) hit one unrelated pre-existing flaky timing assertion in src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts (expected 19 to be >= 20 ms, a boundary-exact timing assertion with no tolerance for scheduler jitter, in a file none of this delivery's tasks touched); it passed cleanly on retry (run/pool-options-required-corrective-suite-full-3), confirming criterion 4's "tree still builds and its full suite passes" clause.
