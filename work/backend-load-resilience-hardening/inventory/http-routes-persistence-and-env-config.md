---
title: HTTP route registration, rate-limit middleware, Postgres pool construction and Env schema
summary: The area the rate-limiting and pool-tuning scope lands in — a single Fastify HTTP service wired
  through one build-app.ts registry, one database-connection.ts factory and one Zod-validated env.ts.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
area:
- src/src/http
- src/src/persistence/database-connection.ts
- src/src/config/env.ts
- src/src/factories/diagnose-server.factory.ts
- src/src/__tests__/unit/persistence/database-connection.spec.ts
- src/src/__tests__/unit/config/env.spec.ts
- src/src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
modules:
- name: diagnose-routes
  path: src/src/http/diagnose.routes.ts
  role: touched
- name: simulate-case-routes
  path: src/src/http/simulate-case.routes.ts
  role: touched
- name: simulate-hypothesis-routes
  path: src/src/http/simulate-hypothesis.routes.ts
  role: touched
- name: read-capability-by-identity-rate-limit-middleware
  path: src/src/http/read-capability-by-identity-rate-limit.middleware.ts
  role: depends-on
- name: read-capability-by-identity-routes
  path: src/src/http/read-capability-by-identity.routes.ts
  role: depends-on
- name: build-app
  path: src/src/http/build-app.ts
  role: touched
- name: database-connection
  path: src/src/persistence/database-connection.ts
  role: touched
- name: env-config
  path: src/src/config/env.ts
  role: touched
- name: diagnose-server-factory
  path: src/src/factories/diagnose-server.factory.ts
  role: depends-on
- name: invalid-environment-error
  path: src/src/errors/invalid-environment.error.ts
  role: depends-on
---

## What it is
A Fastify HTTP service where every route plugin is a `create<Name>RoutesPlugin` factory registered once in `src/src/http/build-app.ts`'s `routePluginFactories` array.
`src/src/http/diagnose.routes.ts`, `simulate-case.routes.ts` and `simulate-hypothesis.routes.ts` each currently register exactly one POST handler with a Zod body-schema check and no `onRequest` hook.
`src/src/http/read-capability-by-identity-rate-limit.middleware.ts` is the one existing rate-limit idiom: `createReadCapabilityByIdentityRateLimitHook()` builds a fresh in-memory `Map<sourceIp, window>` closure returning a Fastify `onRequest` hook, hardcoding `RATE_LIMIT_MAX_REQUESTS_PER_WINDOW = 60` and `RATE_LIMIT_WINDOW_MS = 60_000` as module constants, and on overflow replies 429 with a `Retry-After` header computed from the window's remaining time.
That hook is wired in exactly one place, `src/src/http/read-capability-by-identity.routes.ts`, via `app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook())` inside the route plugin function, so Fastify's plugin encapsulation scopes the limiter to that plugin's own routes only.
`src/src/persistence/database-connection.ts` exports `createDatabaseConnection(connectionUrl: string)`, which does nothing but `new Pool({ connectionString: connectionUrl })` — no other Pool option is set anywhere in the tree.
`src/src/config/env.ts` defines one Zod object schema (`envSchema`) parsed once by `loadEnv()`, mixing `z.coerce.number().int().positive()` fields (e.g. `POOL_SIZE`, `PAGINATION_DEFAULT_LIMIT`) with a `.default(...)` only on `PORT`; everything else is required with no default, and a failed parse raises `InvalidEnvironmentError` built from all issues at once.
`env.POOL_SIZE` is read only by `src/src/factories/diagnose-server.factory.ts`, passed through to three runner-dependency builder functions (`runnerDependencies`, `simulationRunnerDependencies`, `hypothesisSimulationRunnerDependencies`) as a `poolSize` field distinct from the `pg` Pool itself — it sizes an in-process worker pool, not `pg`'s connection pool.

## Notes
`src/src/__tests__/unit/persistence/database-connection.spec.ts` asserts `createDatabaseConnection` calls `new Pool` with exactly `{ connectionString: connectionUrl }` and no other key, and that the file contains exactly one `new Pool(` call in its own source — tuning Pool options here will need this test rewritten, not merely left passing.
`src/src/__tests__/unit/deployment-provisions-no-database-service.spec.ts` regex-scans every non-test `.ts` file for `createDatabaseConnection(\s*([^)]*?)\s*)` calls and asserts the full set of distinct argument strings across the whole deployed tree is exactly `['env.DATABASE_URL', 'connectionUrl: string']` — any change to the function's call sites or signature that introduces a second argument or a differently-shaped single argument will change what this regex captures and needs the same test updated.
`envSchema` uses `z.coerce.number().int().positive()` uniformly for every numeric env var seen (`POOL_SIZE`, `EVALUATOR_MAX_TOKENS`, `CONSOLIDATOR_MAX_TOKENS`, `PAGINATION_DEFAULT_LIMIT`, `PAGINATION_MAX_LIMIT`), and only `PORT` carries a `.default(...)`; new pool-tuning variables that want defaults documented in the schema (per the scope) have no existing precedent for `.default()` on a variable other than `PORT` in this file.
No route plugin file among diagnose/simulate-case/simulate-hypothesis has an existing `onRequest` hook to extend — the rate-limit hook must be newly wired into each, mirroring `read-capability-by-identity.routes.ts`'s single line rather than editing the shared middleware's call sites.
The rate-limit middleware's window/threshold are compile-time module constants, not constructor parameters — reusing it for a 10-per-minute threshold (the scope's number, versus the existing 60-per-minute) requires either parameterizing the factory or a second constants pair, since the current shape has no per-caller threshold argument.
`env.spec.ts`'s `validEnvSource()` helper is the one place every currently-required `Env` field is enumerated for tests; a new required (non-defaulted) env var would need this fixture updated everywhere it's imported, and a new defaulted var would follow the `PORT`-only precedent instead.
