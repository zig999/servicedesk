---
title: Backend service, its four file-backed stores and the case/investigation shapes around them
summary: "The area the relational-persistence scope lands in: one layered TypeScript/Fastify service under src/, whose four store ports are implemented today by four plain-JSON file repositories and whose case and investigation shapes still carry the file-era fields."
sources:
  - intake/scope.md
area:
  - src/src/case
  - src/src/glossary
  - src/src/capability-registry
  - src/src/investigation
  - src/src/persistence
  - src/src/factories
  - src/src/http
  - src/src/config
  - src/src/errors
  - src/src/fixtures
  - src/src/__tests__
  - src/package.json
  - src/tsconfig.json
  - src/tsconfig.build.json
  - src/eslint.config.js
modules:
  - name: case
    path: src/src/case
    role: touched
  - name: glossary
    path: src/src/glossary
    role: touched
  - name: capability-registry
    path: src/src/capability-registry
    role: touched
  - name: investigation
    path: src/src/investigation
    role: touched
  - name: persistence
    path: src/src/persistence
    role: touched
  - name: factories
    path: src/src/factories
    role: touched
  - name: config-env
    path: src/src/config/env.ts
    role: touched
  - name: fixtures
    path: src/src/fixtures
    role: touched
  - name: tests
    path: src/src/__tests__
    role: touched
  - name: errors
    path: src/src/errors
    role: depends-on
  - name: http
    path: src/src/http
    role: depends-on
  - name: entry-point
    path: src/src/index.ts
    role: depends-on
  - name: manifest
    path: src/package.json
    role: touched
  - name: eslint-config
    path: src/eslint.config.js
    role: adjacent
conventions:
  - statement: A store is declared as an interface in its own domain directory and implemented in src/persistence, so no domain module imports a driver or opens a file.
    seen_at: src/src/case/case-store.port.ts
  - statement: Every module is wired in exactly one factory function under src/factories named <resource>.factory.ts, and the store's location arrives as a constructor argument rather than being written in source.
    seen_at: src/src/factories/case-store.factory.ts
  - statement: Each file repository raises its own typed store error carrying a message, a context object and a cause, mapped from a shared JsonFileFailure union.
    seen_at: src/src/persistence/file-case-store.repository.ts
  - statement: A read answers an absent record as undefined — data, never a failure — and only unreadable or unparsable content raises.
    seen_at: src/src/persistence/json-file.ts
  - statement: Every boundary input, including this process's environment, is parsed by a Zod schema that refuses once naming every violated field together.
    seen_at: src/src/config/env.ts
  - statement: A validator collects every violation in one pass and throws one error naming them all, rather than failing on the first.
    seen_at: src/src/case/parse-case-document.ts
  - statement: Persisted domain fields are spelled snake_case exactly as the specification spells them, while TypeScript locals and functions are camelCase.
    seen_at: src/src/investigation/investigation.ts
  - statement: An integration test stands up real state in a fresh mkdtemp directory in beforeEach and removes it in afterEach; nothing is shared between tests.
    seen_at: src/src/__tests__/integration/persistence/file-case-store.repository.spec.ts
  - statement: A fixture-backed integration test copies the committed fixture directories into scratch directories before reading, so the committed bytes are never written back.
    seen_at: src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - statement: Test files mirror the unit under test under src/__tests__/ with parallel unit/ and integration/ subtrees.
    seen_at: src/src/__tests__/unit/case/case-query.service.spec.ts
  - statement: Guard specs read source text and the manifest directly to audit what a directory may import, and refuse to pass vacuously when they find nothing to audit.
    seen_at: src/src/__tests__/unit/case/case-document-modules.spec.ts
  - statement: Each module carries a header comment naming the specification nodes it answers to, and the lint rule set carries the standard rule id beside each entry.
    seen_at: src/eslint.config.js
must_not_duplicate:
  - what: The four store ports themselves — ICaseStore (writeVersion/readVersion/listVersions), IGlossaryStore (readTerms/writeTerms/readConcepts), ICapabilityStore (readCapabilities/writeCapabilities), IInvestigationStore (write/read) — which a relational adapter implements rather than replaces.
    at: src/src/case/case-store.port.ts, src/src/glossary/glossary-store.port.ts, src/src/capability-registry/capability-store.port.ts, src/src/investigation/investigation-store.port.ts
  - what: The read/write helper every file store shares, including the absence-is-data rule and the raise-through-the-caller's-typed-error shape a database adapter needs an equivalent of exactly once.
    at: src/src/persistence/json-file.ts
  - what: The structural case validator that parses one document into the Case aggregate and reports every violation together.
    at: src/src/case/parse-case-document.ts
  - what: The coherence validator that holds a parsed case against the glossary and the capability registry.
    at: src/src/case/validate-case-coherence.ts
  - what: The three pure case operations — collectionPlan, requiresEvaluationOf and resolveOutcome — which read hypothesis precedence and must keep reading it from one place.
    at: src/src/case/case-resolution.ts
  - what: The composed read-case/replay-case service, which already separates the validated read from the pinned replay.
    at: src/src/case/case-query.service.ts
  - what: The one place the pinned-case relationship is materialized from a case.
    at: src/src/investigation/investigation-factory.ts (pinnedCaseOf)
  - what: The typed store errors already declared per module.
    at: src/src/errors/case-store.error.ts, src/src/errors/glossary-store.error.ts, src/src/errors/capability-store.error.ts, src/src/errors/investigation-store.error.ts, src/src/errors/investigation-already-stored.error.ts
  - what: The single environment schema and its refuse-once loader, which any connection URL must be added to rather than read separately.
    at: src/src/config/env.ts
  - what: The composed wiring chain a deployment enters through, from env to the built Fastify app.
    at: src/src/factories/diagnose-server.factory.ts, src/src/factories/case-query.factory.ts, src/src/factories/production-diagnose.factory.ts
  - what: The curated fixture data — one case version, five glossary vocabularies, the capability registry and the canned observations — which the database seed should carry over rather than re-invent.
    at: src/src/fixtures
risks:
  - risk: Removing `hash` from Case changes the aggregate type, its structural validation and the value the pinned-case relationship is built from, so every consumer of the field breaks together.
    consumers:
      - src/src/case/case.ts
      - src/src/case/parse-case-document.ts
      - src/src/case/case-query.port.ts
      - src/src/case/case-query.service.ts
      - src/src/investigation/investigation-factory.ts
      - src/src/investigation/investigation.ts
      - src/src/fixtures/case/intermittent-connection-outage/1.json
      - src/src/__tests__/unit/case/parse-case-document.spec.ts
      - src/src/__tests__/unit/case/case-query.service.spec.ts
      - src/src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  - risk: Reducing PinnedCase to slug and version changes the shape of a written investigation document, which existing tests assert field by field and by absence of extra fields.
    consumers:
      - src/src/investigation/investigation.ts
      - src/src/investigation/investigation-factory.ts
      - src/src/__tests__/unit/investigation/investigation-factory.spec.ts
      - src/src/__tests__/unit/investigation/run-diagnosis.spec.ts
      - src/src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  - risk: Giving Hypothesis a `position` and reading precedence from it changes what resolveOutcome, collectionPlan and requiresEvaluationOf consult, while today they consult array order alone.
    consumers:
      - src/src/case/case-resolution.ts
      - src/src/case/parse-case-document.ts
      - src/src/investigation/run-diagnosis.ts
      - src/src/investigation/judgment-stage.ts
      - src/src/investigation/investigation-factory.ts
      - src/src/__tests__/unit/case/case-resolution.spec.ts
      - src/src/__tests__/unit/case/parse-case-document.spec.ts
  - risk: Two guard specs assert the tree declares no database driver and that the persistence and factories directories reach no service over the network; adding a driver and a connection module makes both fail as written.
    consumers:
      - src/src/__tests__/unit/dependency-manifest.spec.ts
      - src/src/__tests__/unit/capability-registry/no-network-persistence.spec.ts
  - risk: Seven further module-audit specs forbid a driver import inside their own directory by scanning source text; a relational adapter placed in the wrong directory trips them.
    consumers:
      - src/src/__tests__/unit/case/case-document-modules.spec.ts
      - src/src/__tests__/unit/glossary/vocabulary-modules.spec.ts
      - src/src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
      - src/src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
      - src/src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
      - src/src/__tests__/unit/investigation/observation-source-modules.spec.ts
      - src/src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  - risk: The environment schema requires four data-directory variables and the fixture file path; replacing them with a connection URL breaks every caller that passes directories down the wiring chain.
    consumers:
      - src/src/config/env.ts
      - src/src/factories/case-store.factory.ts
      - src/src/factories/case-query.factory.ts
      - src/src/factories/glossary.factory.ts
      - src/src/factories/capability-registry.factory.ts
      - src/src/factories/investigation-store.factory.ts
      - src/src/factories/diagnose.factory.ts
      - src/src/factories/production-diagnose.factory.ts
      - src/src/factories/diagnose-server.factory.ts
      - src/src/__tests__/unit/config/env.spec.ts
  - risk: Every integration test stands up its own temporary directory per test and expects total isolation; a shared database gives them shared state that nothing in the current setup tears down.
    consumers:
      - src/src/__tests__/integration/persistence/file-case-store.repository.spec.ts
      - src/src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
      - src/src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
      - src/src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
      - src/src/__tests__/integration/factories/case-query.factory.spec.ts
      - src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
      - src/src/__tests__/integration/http/diagnose-e2e.spec.ts
  - risk: The five standard commands run without any migration step and there is no vitest configuration file to hang a global setup on, so a suite that needs a schema applied has nowhere to apply it today.
    consumers:
      - src/package.json
      - standards/backend-node-service.yaml
  - risk: The glossary service writes the two non-conclusion outcomes back through the store port when a read finds them missing, so a read path performs a write that a relational adapter must reproduce transactionally.
    consumers:
      - src/src/glossary/glossary.service.ts
      - src/src/persistence/file-glossary-store.repository.ts
      - src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
---

## What it is

One Node/TypeScript service at `/home/siegfriedneto/projects/siegardtest/src`, with its manifest, `tsconfig.json`, `tsconfig.build.json` and `eslint.config.js` at that root and all source under `src/src/`.
The source is arranged by context — `case`, `glossary`, `capability-registry`, `investigation` — each declaring its own store port, with the four implementations gathered in `src/src/persistence/` and every wiring in `src/src/factories/`.
`ICaseStore` (`writeVersion`, `readVersion`, `listVersions`), `IGlossaryStore` (`readTerms`, `writeTerms`, `readConcepts`), `ICapabilityStore` (`readCapabilities`, `writeCapabilities`) and `IInvestigationStore` (`write`, `read`) are the four ports the scope names, implemented respectively by `FileCaseStore`, `FileGlossaryStore`, `FileCapabilityStore` and `FileInvestigationStore`, all four sharing `src/src/persistence/json-file.ts`.
Their only callers are `CaseQueryService` and `replayCase` in `src/src/case/case-query.service.ts`, `GlossaryService`, `CapabilityRegistryService`, `runDiagnosis` in `src/src/investigation/run-diagnosis.ts`, and the factories that construct them; the HTTP layer reaches persistence only through `ICaseQuery`.
`Case` in `src/src/case/case.ts` carries `hash` and holds `hypotheses` as an ordered array with no position field, and `case-resolution.ts` reads precedence from that array order alone.
`PinnedCase` in `src/src/investigation/investigation.ts` carries `slug`, `version` and `hash`, built in one place by `pinnedCaseOf` in `investigation-factory.ts`.
Nothing in the tree carries `written_at` on an investigation or `authored_at` on a case version; neither field name appears anywhere in source, fixtures or tests.
Case documents are read and written today only through `FileCaseStore`, which stores one JSON file per version at `<directory>/<slug>/<version>.json` and derives the version list from the directory's own entries; the fixture case at `src/src/fixtures/case/intermittent-connection-outage/1.json` is the one case document in the tree and was authored by hand.
There is no authoring command, CLI or route of any kind — the single HTTP route is `POST /v1/diagnose` — so `contracts/knowledge/author-case-version` has no implementation here to change, only `ICaseStore.writeVersion` behind it.
Nothing in the tree reaches a database: no driver in `package.json`, no connection module, no `migrations/` directory, and no SQL text anywhere; the only occurrences of `pg` or `postgres` are inside the guard specs that forbid them.
Tests run under Vitest with no configuration file, sourcing state from `mkdtemp` temporary directories per test and from the committed JSON under `src/src/fixtures/`, copied into scratch before use; nothing in the suite stands up an external service or a container.

## Notes

The service's own `src/` sits one level below the target source root, so a path a rule scopes `under: src` reads as `src/src/` from where the caller named the tree.
`src/src/persistence/json-file.ts` is Node-`fs`-specific throughout, so it has no role in a relational adapter and its callers are the four repositories alone.
`FileInvestigationStore.write` enforces write-once by reading before writing rather than by any store constraint, which a unique key would decide instead.
`FileCaseStore` and `FileInvestigationStore` each compute a sha256 over the exact bytes read from disk to answer their `hash` field, a value that has no equivalent once the document is rows.
The `build` script names `tsconfig.build.json`, which exists and excludes `src/__tests__`; the standard's five commands do not include it.
`package.json` declares exactly three runtime dependencies — `@anthropic-ai/sdk`, `fastify`, `zod` — and `src/src/__tests__/unit/dependency-manifest.spec.ts` asserts that exact set, so adding a driver requires that assertion to move with it.
