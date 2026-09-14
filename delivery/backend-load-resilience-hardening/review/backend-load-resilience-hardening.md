---
target: backend
title: Backend load resilience hardening — review
summary: Whether rate limiting on diagnose/simulate-case/simulate-hypothesis and Postgres pool tuning
  across four tasks prove their criteria, state only what the specification holds, follow the project's
  own standard, and ran clean.
reviewed:
- src/http/rate-limit.middleware.ts
- src/http/diagnose.routes.ts
- src/http/simulate-case.routes.ts
- src/http/simulate-hypothesis.routes.ts
- src/config/env.ts
- src/persistence/database-connection.ts
- src/persistence/pg.d.ts
- src/factories/diagnose-server.factory.ts
- src/__tests__/unit/http/rate-limit.middleware.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/persistence/database-connection.spec.ts
- src/__tests__/unit/factories/store-wiring.spec.ts
- src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
tasks:
- task/route-rate-limiting/parameterized-rate-limit-hook
- task/route-rate-limiting/diagnose-and-simulation-route-limits
- task/database-pool-configuration/pool-settings-in-env-schema
- task/database-pool-configuration/pool-construction-applies-settings
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/backend-load-resilience-hardening) passed cleanly; there was no failure
    to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: A hook built with threshold N and window W leaves the first N requests from one source address
    within W unrefused by the limit.
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: answers each of the first N requests from one source address within the window with its ordinary
      response, none refused
- criterion: The N+1th request from that same source address within the same window is answered HTTP 429.
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: answers the (N+1)th request from that same source address within the window with HTTP 429
- criterion: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: names, in that 429 response, a Retry-After value the caller may retry after
- criterion: A request from a second source address is not refused by the limit while the first source
    address is over its threshold in the same window.
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: does not refuse a request from a second source address while the first source address is over
      its own threshold
- criterion: The threshold and the window a hook counts by come from the arguments its construction was
    given, not from a constant fixed in the hook's own module.
  state: partial
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: 'enforces the threshold each hook was constructed with: one route refuses at its own boundary
      while a route built with a higher threshold does not'
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: lets a source address's request through once its prior window has fully elapsed
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: names, in that 429 response, a Retry-After value the caller may retry after
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: lets a source IP start a fresh window, with its ordinary response, once its prior window has
      fully elapsed
  why: 'The threshold half is bound directly, by two hooks built with 2 and 5 in one app behaving differently.
    The window half is bound only across constructions rather than within one test: no test in the set
    builds two hooks with differing windows side by side, which would bind it in one assertion.'
- criterion: 'Two hooks built by separate constructions count their windows independently: a source address
    over the threshold on one is not refused by the other.'
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: does not refuse, on a second hook's own route, a source address already refused by a first hook
      built separately
- criterion: Once a source address's window has elapsed, a further request from it is not refused by the
    limit.
  state: covered
  tests:
  - file: src/__tests__/unit/http/rate-limit.middleware.spec.ts
    name: lets a source address's request through once its prior window has fully elapsed
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: lets a source IP start a fresh window, with its ordinary response, once its prior window has
      fully elapsed
- criterion: The read-capability-by-identity route's delivered refusal past 60 requests in a minute still
    answers HTTP 429 with a Retry-After value.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: answers the 61st request within one minute from the same source IP with HTTP 429
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: names, in the 429 response, a Retry-After value the caller may retry after
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: answers every one of the first 60 requests within a minute from one source IP with its ordinary
      response, none of them refused
- criterion: The 11th request within one minute from one source address to diagnose is answered HTTP 429.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: keeps refusing the same source address past its own ten-request window even once the wall clock
      crosses into the next calendar minute, never resetting the count on the clock face alone
- criterion: The 11th request within one minute from one source address to simulate-case is answered HTTP
    429.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
- criterion: The 11th request within one minute from one source address to simulate-hypothesis is answered
    HTTP 429.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
- criterion: Each of those HTTP 429 responses carries a Retry-After value naming when the caller may retry.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: names, in that 429 response, a Retry-After value the caller may retry after
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: names, in that 429 response, a Retry-After value the caller may retry after
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: names, in that 429 response, a Retry-After value the caller may retry after
- criterion: The 10th request within the window on each of the three routes is not refused by the limit.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
- criterion: A source address over the limit on one of the three routes is answered ordinarily on each
    of the other two within the same window.
  state: partial
  tests:
  - file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
    name: answers ordinarily — 200 — on simulate-case and simulate-hypothesis for a source address that
      is over its own limit on diagnose, each route counting that address independently
  why: Only the diagnose-over-limit direction is exercised. Nothing drives one address past the limit
    on simulate-case or simulate-hypothesis and asserts the other two answer it ordinarily.
- criterion: A second source address is answered ordinarily on all three routes while the first is over
    its limit.
  state: covered
  tests:
  - file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
    name: answers ordinarily — 200 — on all three routes for a second source address while the first source
      address is over its own limit on every one of the three
- criterion: The limit on each of the three routes reaches that route's own requests and no request of
    any other route.
  state: partial
  tests:
  - file: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
    name: answers ordinarily — 200 — on simulate-case and simulate-hypothesis for a source address that
      is over its own limit on diagnose, each route counting that address independently
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: answers the 11th request within one minute from that same source address with HTTP 429
  why: That each route's limit reaches its own requests is exercised for all three; that it reaches no
    request of any other route is exercised only for diagnose's limit. Nothing exhausts simulate-case's
    or simulate-hypothesis's limit and asserts the other two answer ordinarily.
- criterion: Loading the environment with none of the three variables set succeeds and yields a value
    for each from the schema's own default.
  state: covered
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: yields a defaulted value for each of the three pool variables when the existing required-variable
      fixture names none of them
- criterion: Loading the environment with each of the three variables set yields those values as numbers.
  state: covered
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: parses a configured value for each of the three pool variables as a number, distinct from their
      defaults
- criterion: A non-numeric value for any of the three is refused with the invalid-environment error the
    schema already raises.
  state: partial
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: throws InvalidEnvironmentError naming the field when a pool variable is set to a non-numeric
      value
  - file: src/__tests__/unit/config/env.spec.ts
    name: $description for $field (refuses a non-integer value for DATABASE_POOL_STATEMENT_TIMEOUT_MS)
  why: A non-numeric value is submitted only for DATABASE_POOL_MAX_CONNECTIONS ('ten'); nothing submits
    a non-numeric value for DATABASE_POOL_IDLE_TIMEOUT_MS or DATABASE_POOL_STATEMENT_TIMEOUT_MS.
- criterion: A zero or negative value for any of the three is refused with the invalid-environment error.
  state: partial
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: $description for $field (refuses a zero value for DATABASE_POOL_IDLE_TIMEOUT_MS)
  - file: src/__tests__/unit/config/env.spec.ts
    name: $description for $field (refuses a negative value for DATABASE_POOL_MAX_CONNECTIONS)
  why: Zero is submitted only for DATABASE_POOL_IDLE_TIMEOUT_MS and negative only for DATABASE_POOL_MAX_CONNECTIONS;
    DATABASE_POOL_STATEMENT_TIMEOUT_MS receives neither anywhere in the set.
- criterion: Every default is stated in the schema declaration itself rather than at a reading site.
  state: uncovered
  why: No test in the set inspects where the three defaults are stated; the defaulting test only asserts
    a finite number results when none of the three is set, which holds equally if a reading site supplies
    the fallback.
- criterion: The existing environment fixture that enumerates required variables still loads without naming
    any of the three.
  state: covered
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: yields a defaulted value for each of the three pool variables when the existing required-variable
      fixture names none of them
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: a valid environment parses to an Env value carrying none of the four retired data-directory
      keys
- criterion: The pool is constructed with a maximum-connections option equal to the configured value.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: maps a supplied poolOptions.maxConnections onto the pg Pool's max option
  why: The mapping from a supplied value to pg's option is proven; nothing ties the value the deployed
    call site supplies to env.DATABASE_POOL_MAX_CONNECTIONS specifically.
- criterion: The pool is constructed with an idle-timeout option equal to the configured value.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: maps a supplied poolOptions.idleTimeoutMs onto the pg Pool's idleTimeoutMillis option
  why: 'Same gap as maximum connections: the mapping is proven, but nothing ties the deployed call site''s
    value to env.DATABASE_POOL_IDLE_TIMEOUT_MS.'
- criterion: The pool is constructed with a statement-timeout option equal to the configured value.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: maps a supplied poolOptions.statementTimeoutMs onto the pg Pool's statement_timeout option
  why: 'Same gap as the other two: nothing ties the deployed call site''s value to env.DATABASE_POOL_STATEMENT_TIMEOUT_MS.'
- criterion: None of those three values is written literally in the persistence module.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: writes no numeric literal for the max, idleTimeoutMillis or statement_timeout pool option anywhere
      in its own source
  why: The regexes match only the inline form; a literal written into a named constant in the same module
    and referenced at the option site would not fail this test.
- criterion: The connection URL reaching the pool still comes from environment configuration and from
    nowhere else.
  state: covered
  tests:
  - file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
    name: holds no connection URL literal in any file the deployment ships, so nothing hardcodes the endpoint
      the deployment does not provision
  - file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
    name: builds every connection the deployment opens from env.DATABASE_URL, naming no other source for
      the URL anywhere
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: builds the pg Pool with exactly the given connection URL as its connectionString, and no other
      configuration key, when the caller supplies no pool options
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: createDiagnoseHttpServer's own exported function takes exactly one parameter, env, and builds
      its one connection from env.DATABASE_URL alone, naming no data-directory field of Env
- criterion: The tree holds no assertion that the pool is constructed with the connection string as its
    only option.
  state: uncovered
  why: Nothing in the set searches the tree for such an assertion; the set itself still contains one,
    scoped to the no-pool-options case (database-connection.spec.ts's first test).
- criterion: The deployment check over connection-factory call sites passes against the factory's new
    call shape.
  state: covered
  tests:
  - file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
    name: builds every connection the deployment opens from env.DATABASE_URL, naming no other source for
      the URL anywhere
- criterion: Exactly one pool construction exists in the deployed tree.
  state: covered
  tests:
  - file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
    name: constructs the pg Pool in exactly one place across the entire deployed tree
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: constructs exactly one connection in its own source, never a second one for a second store
findings:
- pass: conformance
  file: src/persistence/database-connection.ts
  where: the optional poolOptions parameter and its undefined branch, lines 13 and 17-19
  evidence: "poolOptions?: IDatabaseConnectionPoolOptions,\n...\n...(poolOptions === undefined\n     \
    \ ? {}\n      : {"
  cost: When createDatabaseConnection is called with no poolOptions, the Pool is constructed with no max,
    no idleTimeoutMillis and no statement_timeout at all, so all three bounds fall through to pg's own
    built-in defaults rather than to any declared default — exactly the case constraints/the-connection-pool-is-bounded-by-configuration
    calls out by name.
  correction: make poolOptions (and each of its three fields) required for createDatabaseConnection, resolving
    any 'deployment stated none' case to a declared default before this function is called, never inside
    it.
- pass: conformance
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: the IInvestigationRow interface, lines 272-281
  evidence: 'readonly durations_writing: number;'
  cost: investigationsFor is a general-purpose reader of the investigations table, not scoped to runs
    that reached consolidation; typing durations_writing as an always-present, non-null number promises
    a value domain/investigation/durations says is never recorded for a run that never reaches consolidation.
  correction: type durations_writing as optional/nullable, matching its conditional presence in domain/investigation/durations.
- pass: conformance
  file: src/http/rate-limit.middleware.ts
  where: refuseOverLimit(), lines 52-56
  evidence: "code: 'RATE_LIMIT_EXCEEDED',\n        message: 'too many requests from this source; retry\
    \ after the given number of seconds',\n        details: { retryAfterSeconds },"
  cost: Every other refusal in this build has its caller-facing code and wording decided in a node, but
    the decision log for both rate-limit constraints stops at 'an HTTP 429 response carrying a Retry-After
    value' and never names an error code or message; RATE_LIMIT_EXCEEDED and its exact wording exist only
    in this file.
  correction: decide the rate-limit refusal's error code, message text and body shape in constraints/the-diagnosis-and-simulation-routes-are-rate-limited
    (as its sibling and VALIDATION_ERROR/INTERNAL_ERROR each already do), then read it from there.
- pass: conformance
  file: src/__tests__/unit/http/diagnose.routes.spec.ts
  where: the test 'keeps refusing the same source address past its own ten-request window even once the
    wall clock crosses into the next calendar minute...' (lines 261-271)
  evidence: 'vi.setSystemTime(new Date(''2024-01-01T00:00:55.000Z''));

    await sendDiagnoseRequests(app, REQUESTS_WITHIN_RATE_LIMIT, RATE_LIMIT_SOURCE_IP);

    vi.setSystemTime(new Date(''2024-01-01T00:01:05.000Z''));

    const [over] = await sendDiagnoseRequests(app, 1, RATE_LIMIT_SOURCE_IP);

    expect(over.statusCode).toBe(429);'
  cost: Whether the ten-request count is a rolling window or a bucket that resets at each calendar-minute
    boundary decides exactly when a refused caller may resume being served; the specification states only
    'at most 10 requests per minute' and a reader has to infer the rolling-window behavior from this test
    instead of from a decided node.
  correction: constraints/the-diagnosis-and-simulation-routes-are-rate-limited (or a decision-log entry
    against it) would need to state that the per-route count is a rolling window measured from each request
    rather than a fixed calendar-minute bucket.
- pass: conformance
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: the TOTAL_DEADLINE_BUDGET_MS constant (line 39) and its use in buildDelayedTestApp (line 297)
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 30_000;

    ...

    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });'
  cost: A reader of this integration test learns the system's declared total deadline for a diagnose call
    is thirty seconds; the specification's own node states it as twenty. Because this file computes and
    injects the deadline itself, the test keeps passing under either figure.
  correction: derive the injected deadline from the specification's own declared total (twenty seconds)
    instead of a locally chosen thirty.
- pass: conformance
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: assertDeadlineExceeded, lines 353-362
  evidence: "expect(body.error.details).toEqual({ id, remainingMs });\nexpect(remainingMs).toBeGreaterThan(0);\n\
    expect(remainingMs).toBeLessThanOrEqual(2_000);\nexpect(body.error.message).toBe(\n  `the investigation\
    \ with id \"${id}\" could not be written within the ${remainingMs}ms remaining of the declared deadline,\
    \ so no assessment is returned without a corresponding record`,\n);"
  cost: rules/investigation/no-stage-aborts-on-its-deadline and the decision log settle only InvestigationWriteDeadlineExceededError's
    HTTP status and identity, never what its details carry or its exact wording; this file is the only
    place that states either.
  correction: decide, in the specification, what InvestigationWriteDeadlineExceededError's details carry
    and its message wording, so this assertion follows a decided shape rather than being the shape's only
    home.
- pass: standard
  file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  where: lines 50-115 (requireDatabaseUrl, insertTerms, insertConcepts, insertCapabilities, insertConnectorConfigurations,
    isForeignKeyViolation/deleteTolerantly)
  cites: MNT-03
  evidence: 'function requireDatabaseUrl(): string { ... } and async function insertTerms(...) { ... }
    — each already present, identically, in src/__tests__/integration/factories/diagnose-server.factory.spec.ts'
  cost: the fixture-seeding and cleanup harness is maintained in at least three near-identical copies
    across the integration suite; a schema or seeding change has to be repeated by hand in each file,
    and the files can silently drift out of step.
  correction: extract the shared fixture-seeding/cleanup helpers into one test-support module the three
    factory specs import.
- pass: standard
  file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  where: lines 43-100 and 175-219 (requireDatabaseUrl, insertTerms, insertConcepts, insertCapabilities,
    insertConnectorConfigurations, isForeignKeyViolation/deleteTolerantly, cleanupGlossaryAndCapabilities)
  cites: MNT-03
  evidence: async function insertCapabilities(...) and async function deleteTolerantly(...) reproduce,
    unchanged, the same functions already written in the other two factory specs
  cost: the same seeding/cleanup logic now exists in three places; a bug fixed in one copy has to be remembered
    and reapplied in the other two or the suites diverge.
  correction: call the shared fixture helper module instead of redefining these functions here.
- pass: standard
  file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  where: lines 95-247 (readTermNames, insertTerms, insertConcepts, insertCapabilities, ensureFixtureSeeded,
    isForeignKeyViolation, deleteTolerantly, cleanupFixtureSeeded)
  cites: MNT-03
  evidence: the whole cleanupFixtureSeeded body deleting from hypothesis_revision_collects, case_version_hypotheses,
    hypothesis_revisions, hypotheses, case_versions, cases, capabilities, concept_accepts, concepts, subject_types,
    subject_attributes, outcomes, actions, recipients match, line for line, the same functions in the
    factory spec
  cost: the same glossary/capability/case fixture-seeding-and-teardown block is carried by hand into this
    end-to-end file too; adding a table to the seed or cleanup sequence means editing every file that
    copied it, with nothing to catch a missed one.
  correction: move the fixture-seeding and cleanup functions into one shared module used by every integration/e2e
    spec that seeds this fixture case.
- pass: standard
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: lines 27-33 and 181-193 (requireDatabaseUrl, FOREIGN_KEY_VIOLATION, isForeignKeyViolation, deleteTolerantly)
  cites: MNT-03
  evidence: 'function requireDatabaseUrl(): string { ... } and async function deleteTolerantly(...) reproduce
    the identical helpers already defined in diagnose-e2e.spec.ts and the three factory specs'
  cost: the foreign-key-tolerant delete helper is now duplicated a fifth time; a change to what counts
    as tolerable has to be found and applied in five files to take effect everywhere.
  correction: import the shared requireDatabaseUrl/isForeignKeyViolation/deleteTolerantly helpers instead
    of redefining them in this file.
- pass: standard
  file: src/config/env.ts
  where: envSchema, lines 5-20
  cites: EDG-06
  evidence: 'const envSchema = z.object({ PORT: ..., DATABASE_URL: ..., ..., DATABASE_POOL_MAX_CONNECTIONS:
    ..., DATABASE_POOL_IDLE_TIMEOUT_MS: ..., DATABASE_POOL_STATEMENT_TIMEOUT_MS: ... }) names no field
    for a request-body size ceiling'
  cost: with no configured size ceiling anywhere in the one env schema this service parses, a middleware
    boundary has nothing to enforce a payload limit against; an oversized diagnose/simulate body has no
    configured threshold to be refused at.
  correction: add a configured payload-size-limit field to envSchema (e.g. BODY_LIMIT_BYTES) and enforce
    it at the middleware boundary.
- pass: standard
  file: src/http/simulate-case.routes.ts
  where: lines 6-18 (RATE_LIMIT_MAX_REQUESTS_PER_MINUTE, RATE_LIMIT_WINDOW_MS, the onRequest hook registration)
  cites: MNT-03
  evidence: const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 10; const RATE_LIMIT_WINDOW_MS = 60_000; ... app.addHook('onRequest',
    createRateLimitHook({ ... })); reproduces, unchanged, the same block already written in src/http/diagnose.routes.ts
  cost: the rate-limit policy is now declared three times across the three route files; changing the limit
    for every route means editing three files by hand.
  correction: extract one shared rate-limit-registration helper (or a single configured policy) that all
    three route plugins call.
- pass: standard
  file: src/http/simulate-hypothesis.routes.ts
  where: lines 6-18 (RATE_LIMIT_MAX_REQUESTS_PER_MINUTE, RATE_LIMIT_WINDOW_MS, the onRequest hook registration)
  cites: MNT-03
  evidence: the same block, verbatim, as in src/http/diagnose.routes.ts and src/http/simulate-case.routes.ts
  cost: the same rate-limit wiring is now written a third time; the value 10/60_000 has to stay consistent
    by hand across three files rather than by construction.
  correction: extract one shared rate-limit-registration helper (or a single configured policy) that all
    three route plugins call.
reconciliation: siegard-reconcile/backend-load-resilience-hardening.md
---
## What it is
The review of all four tasks of backend-load-resilience-hardening, together.

## Notes
None.
