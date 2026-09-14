---
contract_version: siegard-reconcile/5
title: Backend load resilience hardening — review
summary: Delivers rate limiting on diagnose, simulate-case and simulate-hypothesis (10 requests per minute
  per source IP, counted independently per route) and Postgres pool tuning (configured max connections,
  idle timeout and statement timeout applied to the connection pool instead of the driver's implicit defaults),
  across four tasks of the backend-load-resilience-hardening initiative.
target: backend
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: updated by task/database-pool-configuration/pool-settings-in-env-schema's fix to the hand-typed
    Env fixture, adding the three new pool variables so the fixture still compiles.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  change: same Env-fixture fix as above, applied by the same task.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  change: same Env-fixture fix as above, applied by the same task.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  change: same Env-fixture fix as above, applied by the same task.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  change: same Env-fixture fix as above, applied by the same task.
- path: src/__tests__/unit/config/env.spec.ts
  change: extended by task/database-pool-configuration/pool-settings-in-env-schema's proof with tests
    over the three new pool variables; a lint naming-convention break was fixed in the same file.
- path: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  change: updated by task/database-pool-configuration/pool-construction-applies-settings's proof to match
    the factory's new call shape, and extended with a single-pool-construction check.
- path: src/__tests__/unit/factories/store-wiring.spec.ts
  change: updated by task/database-pool-configuration/pool-construction-applies-settings's proof to match
    the factory's new two-argument createDatabaseConnection call shape.
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  change: extended by task/route-rate-limiting/diagnose-and-simulation-route-limits's proof with rate-limit
    tests; a lint max-lines-per-function break was fixed in the same file.
- path: src/__tests__/unit/http/rate-limit.middleware.spec.ts
  change: written by task/route-rate-limiting/parameterized-rate-limit-hook's proof.
- path: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  change: written by task/route-rate-limiting/diagnose-and-simulation-route-limits's proof.
- path: src/__tests__/unit/http/simulate-case.routes.spec.ts
  change: written by task/route-rate-limiting/diagnose-and-simulation-route-limits's proof.
- path: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  change: written by task/route-rate-limiting/diagnose-and-simulation-route-limits's proof.
- path: src/__tests__/unit/persistence/database-connection.spec.ts
  change: extended by task/database-pool-configuration/pool-construction-applies-settings's proof to cover
    the new poolOptions mapping, and rescoped its existing no-pool-options assertion.
- path: src/config/env.ts
  change: 'written by task/database-pool-configuration/pool-settings-in-env-schema: adds DATABASE_POOL_MAX_CONNECTIONS,
    DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS to envSchema, each a positive-integer,
    defaulted variable.'
- path: src/factories/diagnose-server.factory.ts
  change: 'written by task/database-pool-configuration/pool-construction-applies-settings: builds poolOptions
    from the three configured env values and passes them as createDatabaseConnection''s second argument
    for the production HTTP server.'
- path: src/http/diagnose.routes.ts
  change: 'written by task/route-rate-limiting/diagnose-and-simulation-route-limits: registers a 10-requests-per-minute
    rate-limit hook ahead of the diagnose handler.'
- path: src/http/rate-limit.middleware.ts
  change: 'written by task/route-rate-limiting/parameterized-rate-limit-hook: exports createRateLimitHook,
    a construction taking a threshold and a window and returning a per-source-address counting Fastify
    onRequest hook that refuses overflow with HTTP 429 and a Retry-After header.'
- path: src/http/simulate-case.routes.ts
  change: 'written by task/route-rate-limiting/diagnose-and-simulation-route-limits: registers the same
    10-requests-per-minute rate-limit hook ahead of the simulate-case handler.'
- path: src/http/simulate-hypothesis.routes.ts
  change: 'written by task/route-rate-limiting/diagnose-and-simulation-route-limits: registers the same
    10-requests-per-minute rate-limit hook ahead of the simulate-hypothesis handler.'
- path: src/persistence/database-connection.ts
  change: 'written by task/database-pool-configuration/pool-construction-applies-settings: adds an optional
    poolOptions parameter to createDatabaseConnection, mapping it onto pg''s max/idleTimeoutMillis/statement_timeout
    Pool options.'
- path: src/persistence/pg.d.ts
  change: 'written by task/database-pool-configuration/pool-construction-applies-settings: extends the
    project''s own pg ambient type declaration with the three optional Pool config fields.'
nodes:
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: "src/http/diagnose.routes.ts: held at the diagnoseHandler function (lines 23-35): it awaits the\
    \ assessment and sends it back within the same request-response cycle, with no job, queue or polling\
    \ construct anywhere in the file — const assessment = await handleDiagnoseRequest(dependencies, parsed.data);\n\
    \  return reply.code(200).send(assessment);"
  encoded_at:
  - src/http/diagnose.routes.ts
- node: constraints/the-connection-pool-is-bounded-by-configuration
  conforms: false
  how: "src/persistence/database-connection.ts, the optional `poolOptions` parameter and its `undefined`\
    \ branch, lines 13 and 17-19: poolOptions?: IDatabaseConnectionPoolOptions,\n...\n...(poolOptions\
    \ === undefined\n      ? {}\n      : { — When createDatabaseConnection is called with no poolOptions,\
    \ the Pool is constructed with no `max`, no `idleTimeoutMillis` and no `statement_timeout` at all,\
    \ so all three bounds fall through to pg's own built-in defaults (driver max 10, driver idle timeout,\
    \ no statement timeout) rather than to any declared default — exactly the case the constraint calls\
    \ out by name, and a reader checking this file for \"how do the three bounds get their fallback\"\
    \ finds a path that hands the outcome to the driver instead."
  observed_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
  - src/persistence/database-connection.ts
  - src/persistence/pg.d.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'src/config/env.ts: held at the `DATABASE_URL` field, read only from environment configuration
    — DATABASE_URL: z.string().min(1),

    src/factories/diagnose-server.factory.ts: held at the createDatabaseConnection call, which takes the
    URL from configuration and constructs no service — const connection = createDatabaseConnection(env.DATABASE_URL,
    poolOptions);

    src/persistence/database-connection.ts: held at the `connectionString` field passed to `new Pool`,
    line 16, fed from the function''s `connectionUrl` parameter — connectionString: connectionUrl,'
  encoded_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
  - src/persistence/database-connection.ts
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  conforms: true
  how: "src/http/diagnose.routes.ts: held at the onRequest hook registered in createDiagnoseRoutesPlugin\
    \ (lines 12-18), configured with the module-level constants at lines 7-8 — const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE\
    \ = 10;\nconst RATE_LIMIT_WINDOW_MS = 60_000;\n...\ncreateRateLimitHook({\n      maxRequestsPerWindow:\
    \ RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,\n      windowMs: RATE_LIMIT_WINDOW_MS,\n    }),\nsrc/http/rate-limit.middleware.ts:\
    \ held at createRateLimitHook's returned hook (lines 19-33) and refuseOverLimit (lines 48-58) — const\
    \ sourceIp = request.ip;\n    const window = windows.get(sourceIp);\n    ...\n    window.requestCount\
    \ += 1;\n    if (window.requestCount > options.maxRequestsPerWindow) {\n      const retryAfterSeconds\
    \ = computeRetryAfterSeconds(window, now, options.windowMs);\n      await refuseOverLimit(reply, retryAfterSeconds);\n\
    \    }\n...\nawait reply\n    .header('Retry-After', String(retryAfterSeconds))\n    .code(429)\n\
    src/http/simulate-case.routes.ts: held at the constants declared at the top of the file and the onRequest\
    \ hook registration that wires them into the plugin — const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 10;\n\
    const RATE_LIMIT_WINDOW_MS = 60_000;\n...\napp.addHook(\n  'onRequest',\n  createRateLimitHook({\n\
    \    maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,\n    windowMs: RATE_LIMIT_WINDOW_MS,\n\
    \  }),\n);\nsrc/http/simulate-hypothesis.routes.ts: held at the `onRequest` hook registration, which\
    \ wires the shared rate-limit factory with this route's own max-per-window and window-length values\
    \ — const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 10; const RATE_LIMIT_WINDOW_MS = 60_000; ... app.addHook(\n\
    \  'onRequest',\n  createRateLimitHook({\n    maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,\n\
    \    windowMs: RATE_LIMIT_WINDOW_MS,\n  }),\n);"
  encoded_at:
  - src/http/diagnose.routes.ts
  - src/http/rate-limit.middleware.ts
  - src/http/simulate-case.routes.ts
  - src/http/simulate-hypothesis.routes.ts
- node: constraints/the-pool-bounds-are-positive-integers
  conforms: true
  how: "src/config/env.ts: held at the `.int().positive()` validators on the three pool-bound fields,\
    \ combined with `loadEnv`'s refusal to return on a failed parse — DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),\n\
    DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),\nDATABASE_POOL_STATEMENT_TIMEOUT_MS:\
    \ z.coerce.number().int().positive().default(30_000),\n...\nconst parsed = envSchema.safeParse(source);\n\
    \  if (!parsed.success) {\n    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}:\
    \ ${issue.message}`);\n    throw new InvalidEnvironmentError(issues);\n  }"
  encoded_at:
  - src/config/env.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The shape is finite — three named bounds against three rejected value classes plus the
    admitted one — so the remainder is the rest of that table over the same loadEnv entry point the existing
    cases already use: for each of DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS,
    a source naming a non-integer, a zero and a negative value yields InvalidEnvironmentError whose issues
    name that field, and a source naming a positive integer yields an Env whose value for that field is
    an integer greater than zero. The defaults clause closes with the same assertion applied to loadEnv
    over a source naming none of the three: Number.isInteger and greater than zero for each, in place
    of Number.isFinite. The startup clause closes with one assertion against the process entry point rather
    than loadEnv: an environment carrying one out-of-shape bound makes startup fail with the configuration
    error and bind no listener.'
- node: constraints/the-system-persists-to-one-relational-database
  conforms: false
  how: 'the fact left part of its ground: still held in src/factories/diagnose-server.factory.ts, src/persistence/database-connection.ts,
    and src/config/env.ts read `nowhere` — the schema declares exactly one connection field, `DATABASE_URL:
    z.string().min(1),`, and no field or branch in `envSchema` states that all records land in one store
    or that no record is held in a file — the file only shapes configuration, it does not declare the
    persistence behavior the node describes — a binding asserts the file answers for the node, so the
    pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
  - src/persistence/database-connection.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/http/simulate-case.routes.ts: held at the POST route registration that wires the published
    simulate-case operation to its handler — app.post(`${API_PREFIX}/simulate`, (request, reply) => simulateCaseHandler(dependencies,
    request, reply));

    src/http/simulate-hypothesis.routes.ts: held at the POST route registration naming the operation''s
    own path and dispatching to the controller that runs the narrowed, no-outcome, no-persistence collection
    the node describes; this file itself decides none of that behavior, only the wiring to it — app.post(`${API_PREFIX}/simulate/hypothesis`,
    (request, reply) => simulateHypothesisHandler(dependencies, request, reply)); ... const result = await
    handleSimulateHypothesisRequest(dependencies, parsed.data); return reply.code(200).send(result);'
  encoded_at:
  - src/http/simulate-case.routes.ts
  - src/http/simulate-hypothesis.routes.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/http/diagnose.routes.ts: held at the POST /v1/diagnose registration and its handler''s response
    (lines 19 and 33-34): body validated against diagnoseRequestSchema, then the assessment sent back
    as the response — app.post(`${API_PREFIX}/diagnose`, (request, reply) => diagnoseHandler(dependencies,
    request, reply));

    ...

    const assessment = await handleDiagnoseRequest(dependencies, parsed.data);

    return reply.code(200).send(assessment);'
  encoded_at:
  - src/http/diagnose.routes.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: "src/factories/diagnose-server.factory.ts: held at the wiring of caseInputRequirementsQuery into\
    \ the diagnose controller's dependencies — const caseInputRequirementsQuery = createCaseInputRequirementsQuery(connection);\
    \ const runDiagnose = createProductionDiagnoseRunner(runnerDependencies(env, connection, observationSource));\
    \ const diagnose: DiagnoseControllerDependencies = {\n  caseQuery,\n  caseInputRequirementsQuery,\n\
    \  runDiagnose,\n  model: env.EVALUATOR_MODEL,\n  promptVersion: env.PROMPT_VERSION,\n};"
  encoded_at:
  - src/factories/diagnose-server.factory.ts
- node: contracts/system/guided-diagnosis
  conforms: false
  how: 'no named file holds this fact now: src/http/diagnose.routes.ts read `nowhere` — the whole diagnoseHandler
    only parses the body, calls handleDiagnoseRequest and forwards whatever it returns as `assessment`;
    none of the capability''s own terms — outcome, referral, text, degraded, deadline — appear anywhere
    in this file, so what is exposed here is the endpoint wiring and not the capability''s content'
  observed_at:
  - src/http/diagnose.routes.ts
- node: domain/investigation/durations
  conforms: false
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts, the IInvestigationRow interface,
    lines 272-281: readonly durations_writing: number; — investigationsFor is a general-purpose reader
    of the investigations table, not one scoped to runs that reached consolidation; typing durations_writing
    as an always-present, non-null number tells the next reader of this row shape that writing is unconditionally
    there, so a caller building on this same type for a run that never reaches consolidation — where the
    column is actually absent — reads a shape that promises a value the specification says is never recorded
    for that run, and looks to this type rather than to domain/investigation/durations for what "writing"
    means.'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at placeFixtureHypotheses\
    \ and releaseManifestedRevisions (lines 155-190) — const revised = await lifecycle.reviseHypothesis({\n\
    \  slug: fixture.slug,\n  hypothesis_name: entry.hypothesis_name,\n  criterion: entry.criterion,\n\
    \  collects: entry.collects,\n  resolution: entry.resolution,\n  subject: fixture.subject,\n});\n\
    src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held at reviseHypothesis's\
    \ call (lines 169-176) and releaseRevisionDirectly's call to releaseHypothesisRevision (line 130)\
    \ — const revised = await lifecycle.reviseHypothesis({\n  slug: fixture.slug,\n  hypothesis_name:\
    \ 'h1',\n  criterion: fixture.hypothesisCriterion,\n  collects: [fixture.concept],\n  resolution:\
    \ { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },\n\
    \  subject: fixture.subjectType,\n});\n...\nawait createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug,\
    \ identity.hypothesisName, identity.revision);"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the state assertion
    at lines 372-373 — expect(manifestEntries.length).toBeGreaterThan(0);

    expect(states).toEqual(manifestEntries.map(() => ''released''));'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    read `nowhere` — expect(written?.durations_judgment).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);

    expect(written?.durations_writing).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);

    expect(written?.durations_collection).toBeGreaterThan(0);'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the alreadyStored\
    \ guard and release ordering in insertFixtureCase (lines 192-213) — const alreadyStored = await store.assembleVersion(SLUG,\
    \ VERSION);\nif (alreadyStored !== undefined) {\n  return;\n}\n...\nconst placed = await placeFixtureHypotheses(lifecycle,\
    \ fixture, draft.version);\nawait releaseManifestedRevisions(lifecycle, fixture.slug, placed);\nawait\
    \ lifecycle.release(fixture.slug, draft.version);\nsrc/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts:\
    \ held at the second it() block, lines 456-458 — const refusal = await releaseRevisionDirectly(connection,\
    \ identity).catch((error: unknown) => error);\n\nexpect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the release ordering
    in insertFixtureCase (lines 210-212) — const placed = await placeFixtureHypotheses(lifecycle, fixture,
    draft.version);

    await releaseManifestedRevisions(lifecycle, fixture.slug, placed);

    await lifecycle.release(fixture.slug, draft.version);'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
unstated:
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: assertDeadlineExceeded, lines 353-362
  evidence: "const body = options.response.json() as { error: { code: string; message: string; details?:\
    \ { id: string; remainingMs: number } } };\nexpect(body.error.code).toBe('InvestigationWriteDeadlineExceededError');\n\
    expect(body.error.details).toBeDefined();\nconst remainingMs = (body.error.details as { id: string;\
    \ remainingMs: number }).remainingMs;\nexpect(body.error.details).toEqual({ id, remainingMs });\n\
    expect(remainingMs).toBeGreaterThan(0);\nexpect(remainingMs).toBeLessThanOrEqual(2_000);\nexpect(body.error.message).toBe(\n\
    \  `the investigation with id \"${id}\" could not be written within the ${remainingMs}ms remaining\
    \ of the declared deadline, so no assessment is returned without a corresponding record`,\n);"
  cost: 'rules/investigation/no-stage-aborts-on-its-deadline and the decision log entry that named InvestigationWriteDeadlineExceededError
    settle only its HTTP status and its identity ("Status: 500 ... Name: InvestigationWriteDeadlineExceededError"),
    never what its details carry or its exact wording. This file is the only place that states the details
    carry an id and a remainingMs figure and the only place that fixes the message''s exact sentence,
    so the next reader who wants to know what this refusal discloses to a caller has to read this test
    rather than the specification.'
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  where: the test "keeps refusing the same source address past its own ten-request window even once the
    wall clock crosses into the next calendar minute, never resetting the count on the clock face alone"
    (lines 261-271)
  evidence: "it(\"keeps refusing the same source address past its own ten-request window even once the\
    \ wall clock crosses into the next calendar minute, never resetting the count on the clock face alone\"\
    , async () => {\n  const built = buildRateLimitTestApp();\n  app = built.app;\n  vi.setSystemTime(new\
    \ Date('2024-01-01T00:00:55.000Z'));\n\n  await sendDiagnoseRequests(app, REQUESTS_WITHIN_RATE_LIMIT,\
    \ RATE_LIMIT_SOURCE_IP);\n  vi.setSystemTime(new Date('2024-01-01T00:01:05.000Z'));\n  const [over]\
    \ = await sendDiagnoseRequests(app, 1, RATE_LIMIT_SOURCE_IP);\n\n  expect(over.statusCode).toBe(429);\n\
    });"
  cost: Whether the ten-request count is a rolling window measured from each request or a bucket that
    resets at each calendar-minute boundary decides exactly when a caller who has been refused may resume
    being served — the same thing the node's own Retry-After value exists to tell the caller. That choice
    is pinned only by this test (and whatever counting the middleware it drives happens to implement);
    a reader checking the specification for how the one-minute window is measured finds only "at most
    10 requests per minute" and has to infer the rolling-window behavior from the test suite instead of
    from a decided node.
- file: src/http/rate-limit.middleware.ts
  where: refuseOverLimit(), lines 52-56
  evidence: "code: 'RATE_LIMIT_EXCEEDED',\n        message: 'too many requests from this source; retry\
    \ after the given number of seconds',\n        details: { retryAfterSeconds },"
  cost: Every other refusal in this build has its caller-facing code and wording decided in a node — VALIDATION_ERROR
    and INTERNAL_ERROR are named system-wide, and each domain refusal (CapabilityIdentityNotFoundError,
    CaseNotFoundError, and the rest) is named in its own rule or constraint — but the decision log for
    both rate-limit constraints (this one and its 60-per-minute sibling) stops at "an HTTP 429 response
    carrying a Retry-After value" and never names an error code or message. RATE_LIMIT_EXCEEDED and its
    exact wording exist only in this file, so a reader who wants to know what a rate-limited caller is
    told has nowhere in the specification to find it and would not know the code owns that decision unread.
unbound:
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
- src/__tests__/unit/factories/store-wiring.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/rate-limit.middleware.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/persistence/database-connection.spec.ts
notes: 'Judged by 22 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/backend-load-resilience-hardening.returns/.

  Certification of constraints/the-pool-bounds-are-positive-integers did not hold: the auditor answered
  `partial` — The fact binds all three bounds against all three rejected shapes, and the offered proof
  walks only a diagonal of that table: non-integer is exercised on the statement timeout alone, zero on
  the idle timeout alone, and negative on the maximum connections alone. So the maximum connections stopping
  its refusal of a non-integer or a zero, the idle timeout stopping its refusal of a non-integer or a
  negative, and the statement timeout stopping its refusal of a zero or a negative are each a way the
  fact stops holding with every named test still passing. The admitting half is thinner still: only DATABASE_POOL_MAX_CONNECTIONS
  is asserted to be an integer greater than zero on a started deployment, so the fitness clause that every
  value a started deployment holds for the three is a positive integer is unexercised for the idle timeout
  and the statement timeout. The defaults test ("yields a defaulted value for each of the three pool variables
  when the existing required-variable fixture names none of them") does not close that gap and is worth
  naming to a reader who opens the file expecting it to: it asserts only Number.isFinite on each of the
  three, which holds for 2.5, for 0 and for -1, so a default silently changed to a non-integer, zero or
  negative value passes it. Finally, the refusal the node states is at startup — the deployment serves
  no request — whereas every named test asserts only that loadEnv throws InvalidEnvironmentError; nothing
  in the offered proof binds that throw to a deployment failing to start, so a startup path that caught
  or bypassed loadEnv would leave the fact broken and the proof green.. The node is decided by reading,
  and a certification standing on it from an earlier reconciliation is released by the bind. The remainder
  is testable: The shape is finite — three named bounds against three rejected value classes plus the
  admitted one — so the remainder is the rest of that table over the same loadEnv entry point the existing
  cases already use: for each of DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS,
  a source naming a non-integer, a zero and a negative value yields InvalidEnvironmentError whose issues
  name that field, and a source naming a positive integer yields an Env whose value for that field is
  an integer greater than zero. The defaults clause closes with the same assertion applied to loadEnv
  over a source naming none of the three: Number.isInteger and greater than zero for each, in place of
  Number.isFinite. The startup clause closes with one assertion against the process entry point rather
  than loadEnv: an environment carrying one out-of-shape bound makes startup fail with the configuration
  error and bind no listener..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/the-diagnosis-and-simulation-routes-are-rate-limited,
  constraints/the-connection-pool-is-bounded-by-configuration, constraints/the-pool-bounds-are-positive-integers,
  constraints/the-database-is-externally-provisioned, constraints/the-system-persists-to-one-relational-database
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  A finding in src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts names rules/investigation/an-answer-arrives-within-the-declared-deadline,
  which no file of this set is bound to: the TOTAL_DEADLINE_BUDGET_MS constant (line 39) and its use to
  construct the deadline handed to the runner in buildDelayedTestApp (line 297): const TOTAL_DEADLINE_BUDGET_MS
  = 30_000;

  ...

  const now = Date.now();

  return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS }); — A reader of this integration
  test learns the system''s declared total deadline for a diagnose call is thirty seconds; the specification''s
  own node states it as twenty (two of overhead and margin, seven of collection, five of judgment, four
  of writing and two of persistence). Because this file computes and injects the deadline itself rather
  than exercising the production computation, the test keeps passing under either figure, so nobody is
  alerted if this thirty-second belief and the specification''s twenty-second decision ever diverge further..
  It blocks nothing here; it is owed a route of its own.

  Candidates: 14 opened across 7 of 22 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 3 fact(s) the source states that no node holds, over 3 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/backend-load-resilience-hardening.returns/`, which are the evidence behind every entry above.
