---
title: Observation-source area — production HTTP adapter replacing the fixture-backed fake
summary: The port, its sole current adapter, the collection stage that calls it, the production wiring that constructs it, and the registry/persistence conventions the new connector descriptor would extend.
sources:
  - intake/scope.md
area:
  - src/src/investigation
  - src/src/factories
  - src/src/capability-registry
  - src/src/persistence
  - src/src/config
  - src/src/errors
  - src/src/fixtures
  - src/migrations
modules:
  - name: observation-source-port
    path: src/src/investigation/observation-source.port.ts
    role: touched
  - name: fake-observation-source-adapter
    path: src/src/investigation/fake-observation-source.adapter.ts
    role: touched
  - name: evidence-collection-stage
    path: src/src/investigation/evidence-collection-stage.ts
    role: depends-on
  - name: citation-validation
    path: src/src/investigation/citation-validation.ts
    role: depends-on
  - name: diagnose-server-factory
    path: src/src/factories/diagnose-server.factory.ts
    role: touched
  - name: production-diagnose-factory
    path: src/src/factories/production-diagnose.factory.ts
    role: depends-on
  - name: diagnose-factory
    path: src/src/factories/diagnose.factory.ts
    role: adjacent
  - name: capability-registry-service
    path: src/src/capability-registry/capability-registry.service.ts
    role: depends-on
  - name: capability-store-port
    path: src/src/capability-registry/capability-store.port.ts
    role: adjacent
  - name: capability-query-port
    path: src/src/capability-registry/capability-query.port.ts
    role: depends-on
  - name: relational-capability-store
    path: src/src/persistence/relational-capability-store.repository.ts
    role: adjacent
  - name: database-access-helper
    path: src/src/persistence/database-access.ts
    role: depends-on
  - name: env-schema
    path: src/src/config/env.ts
    role: touched
  - name: anthropic-hypothesis-evaluator-adapter
    path: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    role: adjacent
  - name: seed-script
    path: src/src/seed.ts
    role: adjacent
  - name: errors-directory
    path: src/src/errors
    role: depends-on
  - name: migrations-directory
    path: src/migrations
    role: touched
conventions:
  - statement: A port declared under investigation/ is implemented by a concrete adapter suffixed `.adapter.ts` in the same directory, never imported by domain code directly.
    seen_at: src/src/investigation/fake-observation-source.adapter.ts
  - statement: The domain depends on no infrastructure; a store or client port is declared beside the domain module and implemented in persistence/ or investigation/ behind that port, with no driver import leaking into the domain file.
    seen_at: src/src/capability-registry/capability-store.port.ts
  - statement: A production adapter that calls an external provider takes its credential from process.env with an optional constructor override, and the caller-required model/version is a required constructor parameter rather than a default invented in source.
    seen_at: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - statement: A write path that persists a registered contract (capability) validates every required attribute and refuses before any write, never accepting a raw INSERT.
    seen_at: src/src/capability-registry/capability-registry.service.ts
  - statement: A relational store adapter names no `pg` import directly; it only imports DatabaseConnection and the runStatement/runInTransaction helpers, and every statement is schema-qualified as public.<table>.
    seen_at: src/src/persistence/relational-capability-store.repository.ts
  - statement: A store's own typed error class lives under src/errors/ as `<name>.error.ts` and is raised with the driver failure as `cause`, never surfacing the driver's generic error.
    seen_at: src/src/errors/capability-store.error.ts
  - statement: Environment variables needed at startup are declared once in config/env.ts as a Zod schema and parsed exactly once via loadEnv(); no second module reads process.env for the same value.
    seen_at: src/src/config/env.ts
  - statement: A composite lookup key over multiple fields is built by joining the parts with '::' (idempotencyKeyOf, capabilityOutputSchemaKey, FakeObservationSource's fixtureKey) rather than inventing a new joining convention.
    seen_at: src/src/investigation/citation-validation.ts
  - statement: A one-off registration/seeding script (seed.ts) calls the registry's own validated write path (registerCapability) rather than writing rows directly, reads DATABASE_URL only through loadEnv, and is idempotent by checking prior state before writing.
    seen_at: src/src/seed.ts
  - statement: observeConcept never throws for the four evidence-result endings (ok, unavailable, denied, timeout); only a genuine unexpected fault propagates as a rejection, which the collection stage lets through uncaught.
    seen_at: src/src/investigation/evidence-collection-stage.ts
must_not_duplicate:
  - what: The IObservationSource port and ObservationOutcome/EvidenceResult vocabulary the new adapter must implement, unchanged.
    at: src/src/investigation/observation-source.port.ts
  - what: The composite multi-field lookup key convention (join with '::').
    at: src/src/investigation/citation-validation.ts (capabilityOutputSchemaKey) and src/src/investigation/fake-observation-source.adapter.ts (fixtureKey)
  - what: The relational store scaffolding (runStatement, runInTransaction, IStatement, schema-qualified table names, typed store errors) a new http_connectors store would reuse rather than reimplement its own transaction/error handling.
    at: src/src/persistence/database-access.ts and src/src/persistence/relational-capability-store.repository.ts
  - what: The "validate before write" registration pattern (refuse before persisting, replace-by-identity semantics) a registerConnector would mirror.
    at: src/src/capability-registry/capability-registry.service.ts
  - what: The Zod-schema-once, loadEnv() boundary-parsing convention for any new configuration value (e.g., an allowlist, a secrets source).
    at: src/src/config/env.ts
  - what: declaredFieldsOf's structural JSON-Schema `properties` key reading, which any response_map-to-output_schema validation in registerConnector would need to reuse or explicitly diverge from rather than re-deriving field extraction independently.
    at: src/src/investigation/citation-validation.ts
risks:
  - risk: Replacing FakeObservationSource in diagnose-server.factory.ts removes the only wiring that constructs and seeds it; every consumer of createDiagnoseHttpServer's production path (the HTTP surface and its e2e/integration tests) starts depending on real network reachability and connector registration instead of the static observations.json fixture.
    consumers:
      - src/src/http/diagnose.controller.ts
      - src/src/__tests__/integration/http/diagnose-e2e.spec.ts
      - src/src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
      - src/src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - risk: evidence-collection-stage.ts's timeout race relies on observeConcept respecting a bound no larger than capability.timeout; an HTTP adapter that does not itself enforce a client-side timeout at or below that value could let a slow external call outlive the race's own setTimeout resolution, changing recorded evidence from 'timeout' to a late, possibly stale 'ok'.
    consumers:
      - src/src/investigation/evidence-collection-stage.ts
      - src/src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  - risk: citation-validation.ts binds a citation's field to the schema of the specific capability version that produced the evidence; if the new adapter's response_map extraction produces an observation object whose keys do not exactly match output_schema's declared properties, citations the judge makes over real data are silently refused as foreign fields.
    consumers:
      - src/src/investigation/citation-validation.ts
      - src/src/investigation/judgment-stage.ts
  - risk: env.ts documents OBSERVATIONS_FIXTURE_FILE as backing only FakeObservationSource; removing that adapter from production wiring without also removing or repurposing this env var and its schema entry leaves a startup-required variable with no remaining production consumer.
    consumers:
      - src/src/config/env.ts
      - src/src/factories/diagnose-server.factory.ts
  - risk: The capability-registry's connector field is currently an opaque, unvalidated string; a new http_connectors table keyed by that same value with no enforced foreign key or existence check leaves capabilities free to name a connector that was never registered, resolving silently to the "descriptor absent" configuration-error branch the scope describes rather than being caught at registerCapability time.
    consumers:
      - src/src/capability-registry/capability-registry.service.ts
      - src/src/capability-registry/capability.ts
---

## What it is

A survey of the observation-source area in src/, covering the port and its only current adapter, the collection stage and citation validator that consume it, the production and diagnose-server factories that wire it, the capability registry and relational-store conventions a connector registration and store would extend, and the env/config and seed-script conventions governing configuration and one-off registration.
The area is not empty: FakeObservationSource is a small, complete, seeded-fixture adapter that the scope's HttpDeclarativeObservationSource replaces at the same port, and diagnose-server.factory.ts is the one production wiring point that constructs and seeds it today.
No production HTTP client, connector-descriptor table, placeholder resolver or registerConnector function exists yet anywhere in src/ — every piece the scope proposes (http_connectors table, descriptor validation, placeholder engine, JSONPath-with-array-index extraction) is new.

## Notes

The scope's descriptor format, algorithm and placeholder syntax are explicitly marked non-binding technical suggestions; the survey records existing conventions the task should reuse, not the specific shapes the scope proposes.
observations.json (src/src/fixtures/observations.json) and its seeding logic in diagnose-server.factory.ts are the concrete artifacts this change is expected to retire from the production path, per the scope's "even in the production wiring" framing.
No corporate-records-source or http_connectors specification/contract file was found under src/ — the scope names this as a specification-level prerequisite (contracts/system/corporate-records generalization) outside this source-root survey's reach.
