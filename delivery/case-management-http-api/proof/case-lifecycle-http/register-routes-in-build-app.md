---
title: build-app.ts registers every route this initiative delivers — proof
summary: Proves build-app.ts's one registration convention and that all eighteen non-diagnose route plugins
  are reachable through it, fixes the six pre-existing test files buildApp()'s widened BuildAppDependencies
  parameter and env.ts's two new required fields broke, and confirms every pre-existing diagnose test
  keeps proving criterion 3 unmodified.
implementation: sha256:19339625394c62b3bdb6fdb4728c47e5bc8f53917ce54f11cc87203ad0679b13
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/register-routes-suite
tests:
- file: src/__tests__/unit/http/build-app.spec.ts
  name: registers every route plugin through one shared app.register() call site, never one repeated per
    route
  proves: Criterion 1 — build-app.ts declares one stated convention for registering a route plugin rather
    than repeating the call per route.
  fails_when: build-app.ts's own source, with every full-line comment stripped, contains any number of
    app.register( call sites other than exactly one — e.g. it is rewritten to call app.register() once
    per route inline instead of through routePlugins()'s shared loop.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for each of the eighteen new routes (it.each)
  proves: 'Criterion 2 — every one of the eighteen route plugins this initiative''s other four epics deliver
    is registered through build-app.ts''s convention and reachable: a validly DTO-shaped request against
    each one''s own real method/path answers something other than 404.'
  fails_when: Any one of the eighteen routes is dropped from routePlugins()'s array, wired under a wrong
    path or method, or never registered at all — the request against that one route would then fall through
    to Fastify's own default 404 handler instead of reaching its controller.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: every pre-existing diagnose test in this file (criteria 1 through 6 and every edge case)
  proves: Criterion 3 — the diagnose route's own registration is preserved exactly as it already answers,
    unchanged in shape or behavior. Only buildTestApp()'s own call site changed (wrapping the same DiagnoseControllerDependencies
    value into the wider BuildAppDependencies buildApp() now requires); no assertion changed.
  fails_when: Any diagnose-route status code, response body, ticket_ref handling, id-freshness, header
    independence, framework-import or edge-case assertion this file already made stops holding.
untested:
- That build-app.factory.ts's own buildAppDependencies() correctly wires each of the eighteen other routes'
  own dependencies from a real DatabaseConnection end to end (a real request against e.g. GET /v1/capabilities
  or GET /v1/cases through createDiagnoseHttpServer() reaching a real controller backed by a real store).
  Only the diagnose route is exercised this way (diagnose-server.factory.spec.ts); no integration test
  in this tree calls createDiagnoseHttpServer() and then requests any of the other eighteen routes.
- Whether every edit here type-checks and passes under a real run rather than manual tracing alone — the
  test-author itself had no shell access; this was independently confirmed by the orchestrating session
  running typecheck, lint, secret-scan and the full suite directly (run/register-routes-suite), all passing.
---

## What it is

New it.each and one-convention tests in build-app.spec.ts, plus six pre-existing test files' fallout fixes for the widened BuildAppDependencies parameter and the two new required env fields.

## Notes

The test-author itself had no shell access and could not run vitest; the orchestrating session independently ran the scoped tests (72 passing, including 32 in build-app.spec.ts) and then the full suite (run/register-routes-suite) before this record was composed. The orchestrating session also found and fixed one implementation bug the test-author's manual tracing did not surface: seventeen createXRoutesPlugin imports in build-app.ts pointed at the wrong module (.controller.js instead of .routes.js) — disclosed as a divergence in the implementation record.
