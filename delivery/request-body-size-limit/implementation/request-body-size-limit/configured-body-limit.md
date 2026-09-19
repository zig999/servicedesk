---
target: backend
title: HTTP server enforces a configured request-body size ceiling
summary: envSchema gains MAX_REQUEST_BODY_BYTES (positive integer, defaulting to 1048576) and build-app.ts
  constructs Fastify with its own bodyLimit option set from it, refusing an oversized body with a 413
  before any route handler runs.
task: sha256:3d838eac21fc1fe20868e698479ce69c82422d3ccce59f7a71508b4dd6a6f607
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/request-body-size-limit-configured-body-limit-build
files:
- path: src/config/env.ts
  effect: envSchema gained MAX_REQUEST_BODY_BYTES, z.coerce.number().int().positive().default(1_048_576),
    following the exact coercion/positivity/default shape the three existing DATABASE_POOL_* fields already
    establish.
- path: src/http/build-app.ts
  effect: 'BuildAppDependencies gained an optional bodyLimit?: number field, and buildApp() now constructs
    Fastify with Fastify({ bodyLimit: dependencies.bodyLimit }) instead of Fastify() with no options.'
- path: src/factories/build-app.factory.ts
  effect: 'buildAppDependencies() now sets bodyLimit: env.MAX_REQUEST_BODY_BYTES on the BuildAppDependencies
    object it returns, so the production call path reaches Fastify() with the configured ceiling.'
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: 'placeholderEnv()''s hand-built Env literal gained MAX_REQUEST_BODY_BYTES: 1_048_576 to keep
    satisfying the now-larger Env type; no assertion changed.'
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: Same placeholderEnv() fixture fix as the sibling e2e spec.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: baseEnv()'s hand-built Env literal gained the same field.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  effect: baseEnv()'s hand-built Env literal gained the same field.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  effect: baseEnv()'s hand-built Env literal gained the same field.
criteria:
- criterion: envSchema declares MAX_REQUEST_BODY_BYTES as a positive integer, coerced from the environment,
    defaulting to 1048576 when unset.
  met: true
  how: 'Added MAX_REQUEST_BODY_BYTES: z.coerce.number().int().positive().default(1_048_576) to envSchema,
    reusing the DATABASE_POOL_* fields'' exact shape.'
- criterion: Fastify() in build-app.ts is constructed with its own bodyLimit option set to env.MAX_REQUEST_BODY_BYTES.
  met: true
  how: 'build-app.ts''s Fastify() call became Fastify({ bodyLimit: dependencies.bodyLimit }); the one
    production path (index.ts -> buildAppDependencies -> buildApp) always supplies env.MAX_REQUEST_BODY_BYTES
    for it.'
- criterion: A request whose body exceeds the configured MAX_REQUEST_BODY_BYTES is refused with an HTTP
    413 response, and no route handler runs for it.
  met: true
  how: 'This is Fastify''s own framework behavior once bodyLimit is set: its content-type parser measures
    the body against the configured limit and throws FST_ERR_CTP_BODY_TOO_LARGE (statusCode 413) before
    any route handler executes; this project''s error-handler.middleware.ts forwards any sub-500 statusCode
    unchanged, so the 413 reaches the client as-is.'
inferences:
- inferred: bodyLimit belongs on BuildAppDependencies as an optional scalar field, rather than a required
    field or a second positional parameter to buildApp().
  from: ARC-02/ARC-03's convention that every input to buildApp flows through the single dependencies
    object assembled only inside a factory function, plus the need to not force a required-field edit
    onto build-app.spec.ts's stubBuildAppDependencies(), which constructs a BuildAppDependencies literal
    directly; optional keeps that test double compiling unchanged, reproducing Fastify's own prior unconfigured
    behavior when the field is absent.
- inferred: The five hand-built Env test fixtures needed the same new field at the schema's own default
    value, with no test behavior changed.
  from: Env is z.infer<typeof envSchema>, and Zod's .default() makes the field required (not optional)
    on the inferred output type -- exactly the reason DATABASE_POOL_MAX_CONNECTIONS already appears, required,
    in every one of those same five literals today.
preserved:
- Every existing HTTP route registered in build-app.ts continues serving unchanged; bodyLimit is the only
  Fastify() constructor option added, and stubBuildAppDependencies() (which omits it) reproduces Fastify's
  own prior unconfigured 1 MiB default with no observable change.
- error-handler.middleware.ts's forwarding of any sub-500 statusCode straight through is untouched, so
  Fastify's own 413 is not reclassified as a 500.
- Every other envSchema field's parsing and defaulting is untouched.
- The five hand-built Env fixtures' other field values and every existing assertion in their five spec
  files are unchanged.
---

## What it is

Adds a configured request-body size ceiling (MAX_REQUEST_BODY_BYTES) and wires it into Fastify's
own bodyLimit option, closing the project's own standard rule EDG-06.

## Notes

This task implements no specification node -- rationale in the task file explains why: EDG-06 is
the project's own standard (decided_by: reading), not a domain fact any specification node states.
The default value (1048576 bytes) is chosen to match Fastify's own current, unconfigured default
exactly, so no existing legitimate request that succeeds today starts being refused.
