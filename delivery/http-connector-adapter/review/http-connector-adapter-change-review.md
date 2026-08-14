---
title: http-connector-adapter, first review
summary: 'What four passes found over the 5-task HTTP declarative observation-source adapter change: coverage, specification conformance, standard conformance, and the 2 pre-existing, out-of-scope failures the captured suite still shows.'
reviewed:
- src/migrations/0008-connector-configuration.sql
- src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
- src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
- src/__tests__/unit/http-connector/response-path-extractor.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/observation-source-modules.spec.ts
- src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
- src/config/env.ts
- src/connector-registry/connector-configuration-registry.service.ts
- src/connector-registry/connector-configuration-store.port.ts
- src/connector-registry/connector-configuration.ts
- src/errors/capability-not-resolved-for-observation.error.ts
- src/errors/connector-configuration-not-registered.error.ts
- src/errors/connector-configuration-store.error.ts
- src/errors/connector-placeholder-not-resolved.error.ts
- src/errors/incomplete-connector-call-descriptor.error.ts
- src/errors/incomplete-connector-configuration.error.ts
- src/errors/malformed-http-connector-configuration.error.ts
- src/factories/connector-configuration-registry.factory.ts
- src/factories/diagnose-server.factory.ts
- src/http-connector/connector-call-descriptor.ts
- src/http-connector/connector-request-resolver.ts
- src/http-connector/http-connector-call-configuration.ts
- src/http-connector/response-path-extractor.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/persistence/relational-connector-configuration-store.repository.ts
tasks:
- task/connector-registration/connector-configuration-persistence
- task/http-observation-runtime/descriptor-placeholder-resolver
- task/http-observation-runtime/response-path-extractor
- task/http-observation-runtime/http-declarative-observation-source
- task/http-observation-runtime/production-wiring-swap
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
coverage:
- criterion: The connector's call configuration is written to and read from the system's one transactional relational store, never a file the deployment ships or writes.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: answers a read with the connector identity and its configuration exactly as the row holds them
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: deletes every existing row and inserts exactly the given configurations, in that order, inside one transaction
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: issues only the DELETE and still commits, when replacing the whole table with an empty set
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: this store and the connector-registry module it implements open no file on disk
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: persists and reads back a connector configuration exactly as given
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: answers a read as the database holds it right now, never a value an earlier read already answered
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: leaves the table's earlier content untouched, when a later insert inside one replace violates a real constraint
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: holds only the connector and configuration columns — no transport-specific column such as a method or an address
  - file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
    name: persists a registered connector configuration as a row RelationalConnectorConfigurationStore reads back, through the real factory wiring
  - file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
    name: replaces the persisted configuration when the same connector registers again through the real wiring
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies the five scripts, in the order their file names number them, to a fresh empty database and produces every relation the model needs and none it does not
- criterion: No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary) imports the connector-configuration store, its persistence driver, or any HTTP client package directly.
  state: covered
  tests:
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: the case, glossary, capability-registry and investigation modules import no driver and no framework
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports the connector-configuration store or its relational adapter, by any relative path
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports an HTTP client package
- criterion: A value drawn from the Subject the collection stage passed in can appear in any part of the assembled request (address, query, headers or body) that the connector's configuration designates, through template substitution rather than by evaluating the configuration as executable code — no eval, Function constructor, or equivalent dynamic-code-execution path places it there.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: substitutes a Subject-drawn value into the descriptor's address
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: substitutes a Subject-drawn value into a query value
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: substitutes a Subject-drawn value into a header value
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: substitutes a Subject-drawn value nested arbitrarily deep inside the body
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: places every substituted value by ordinary string replacement — the resolver holds no eval, Function constructor, dynamic import or require anywhere in its own source
- criterion: A credential a connector's call needs is read from an environment variable or an equivalent secret source by name at resolution time, never from a plain-text value stored in the same row as the rest of the connector's configuration.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: reads a credential from the named environment variable, with the secret value appearing nowhere in the configuration itself
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: reads the named environment variable at resolution time rather than a value cached from an earlier call — two calls against the same variable name each answer with that call's own environment
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: refuses a credential placeholder naming an environment variable that is not set
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: refuses a credential placeholder naming an environment variable that is set to the empty string, never carrying that value in the refusal
- criterion: Resolution over an attribute the Subject the collection stage assembled does not carry is refused before any request is sent, rather than proceeding with a missing or empty value substituted in its place.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: refuses before assembling anything when a placeholder names a Subject attribute the Subject does not carry
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: refuses a Subject attribute present as the empty string exactly as it refuses one the Subject does not carry at all
- criterion: The requester identity the collection call carries is available to the connector's configuration for placement into the assembled request through the same substitution mechanism as a Subject-drawn value, so that giving one connector's call a requester-scoped parameter is a change to that connector's own configuration, never a change to the resolution mechanism itself.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: substitutes the collection's own requester identity wherever '${requester}' appears in the connector's configuration
  - file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
    name: carries whichever requester the caller passed for that one call, unchanged, rather than a default or a value left over from an earlier call
- criterion: No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary) imports this translation module, its secret-reading mechanism, or any HTTP-request-building package directly.
  state: covered
  tests:
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports the connector-request-resolver module or its call-descriptor vocabulary, by any relative path, except this epic's own legitimate HTTP adapter
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports either error the connector-request-resolver raises, by any relative path
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules holds any mention of the http-connector module or its exports outside a static import — a dynamic lookup, a global registry, or a string-keyed service locator would not show up as an import specifier at all, which is exactly the gap this task's own Notes call out — except this epic's own legitimate HTTP adapter
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports an HTTP client package
- criterion: Extracting a path that names a nested object key returns the value found at that nested key.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
    name: returns the value found at a nested object key
- criterion: Extracting a path that includes an array index returns the value found at that index.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
    name: returns the value found at an array index
  - file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
    name: resolves a path chaining two consecutive bracketed indices into a nested array
  - file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
    name: resolves a path that opens directly on a bracketed index for a top-level array body
- criterion: The object the extractor returns carries exactly the field names the mapping declares — none omitted, none added — for every path that resolves.
  state: covered
  tests:
  - file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
    name: carries exactly the field names whose paths resolve, adding none the mapping does not declare
- criterion: The adapter implements observeConcept(concept, subject, requester) at the existing IObservationSource port, requiring no change to the port's signature or to evidence-collection-stage.ts's call site.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: implements the existing IObservationSource port with an unmodified observeConcept(concept, subject, requester) signature
  why: The port-signature half is exercised. Nothing in the set touches evidence-collection-stage.ts at all, so the 'no change to evidence-collection-stage.ts's call site' half is unexercised.
- criterion: Each observeConcept invocation issues exactly one outbound call to the external system, never more than one per concept per collection attempt.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: issues exactly one outbound call per observeConcept invocation
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: issues its own single call for each of two concurrent observeConcept invocations, settling each from its own connector's own response
- criterion: Which external system a call reaches is resolved entirely from the calling capability's own connector value at call time; no external system's name, host or shape is hard-coded in the adapter's source, so a newly registered connector is reachable without a new deploy.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves which external system to reach entirely from the calling capability's own connector value, reaching a distinct host per registered connector
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: rejects with a typed ConnectorConfigurationNotRegisteredError, never one of the four endings, when the capability's own connector names no configuration currently registered
- criterion: A call that completes resolves to exactly one of the four evidence-result endings (ok, unavailable, denied, timeout); ok is the only one of the four that carries an observation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries an observation on the ok ending
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries no observation field on a non-ok ending, resolving exactly to its own result
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: defaults an HTTP status absent from the connector's own status map to the unavailable ending, rather than leaving it unclassified
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes
- criterion: Every HTTP response status the external system can return resolves to exactly one of the four evidence-result endings the adapter can produce; no status value falls through unclassified or causes a thrown exception in place of one of the four.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: defaults an HTTP status absent from the connector's own status map to the unavailable ending, rather than leaving it unclassified
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: never throws for a status its own connector configuration does not classify, answering one of the four endings instead
- criterion: A call that has not completed by its own bound elapsing resolves to the timeout ending, recorded as evidence, rather than raising an exception that would abort the collection stage.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to timeout immediately when the capability declares a zero-length timeout, the lower boundary
- criterion: The client-side timeout the adapter applies to its own call is never greater than the calling capability's own declared timeout, so a capability's own timeout can never hold the collection stage's seven-second budget hostage past what that budget still allows.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: does not resolve before a capability's own longer declared timeout elapses, refuting a small fixed timeout unrelated to it
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to timeout by the moment a different, shorter capability-declared timeout elapses, refuting a large fixed timeout unrelated to it
- criterion: The requester passed into observeConcept is available to the call the adapter constructs, never substituted by a service-level identity, for a connector whose call needs it for scoping.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries the given requester into the assembled request unmodified, never a substituted service identity
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries a different requester into a different call rather than reusing a fixed identity across calls
- criterion: The observation returned on the ok ending is keyed by the calling capability's own output_schema property names, never by a field name taken verbatim from the external response's own structure.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keys the ok observation by the capability's own output_schema property names, dropping a response-map field the schema does not declare, and never surfacing the response's own raw field name
- criterion: The adapter and any HTTP client package it uses live outside the domain layer, and no domain module imports either directly.
  state: partial
  tests:
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports an HTTP client package
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: none of these modules imports the http-declarative-observation-source adapter directly, by any relative path — it is reached only through the unchanged IObservationSource port
  why: '''No domain module imports either directly'' is exercised. Nothing exercises ''live outside the domain layer'' itself: the adapter''s own file physically sits inside investigation/, one of the four directories this same sweep otherwise treats as domain layer, and no test asserts a directory placement for it the way an analogous test asserts one for database-connection.ts under persistence/.'
- criterion: The translation from the external response's own structure into the returned observation happens entirely inside the adapter, never inside evidence-collection-stage.ts or any other domain module, so no source-system field name crosses past the adapter.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keys the ok observation by the capability's own output_schema property names, dropping a response-map field the schema does not declare, and never surfacing the response's own raw field name
  why: That the adapter itself performs a correct, schema-keyed translation is exercised. Whether evidence-collection-stage.ts (or any other domain module) performs no translation of its own is unexercised — evidence-collection-stage.ts is not among the reviewed test files.
- criterion: Building the production diagnose pipeline no longer constructs FakeObservationSource.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: reaches the network to observe a concept the case collects, rather than answering from FakeObservationSource's static fixture
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: calls each collected concept's own registered connector address, proving the pipeline's IObservationSource resolves through the HTTP declarative adapter's own registry-driven resolution rather than a hardcoded or fixture-derived one
  why: These prove the wired IObservationSource behaves as the HTTP adapter, which would fail if FakeObservationSource were the active dependency. Neither test is a source scan, so an incidental, unused construction of FakeObservationSource left elsewhere in the factory is unexercised.
- criterion: The production diagnose pipeline's IObservationSource dependency resolves to the HTTP declarative adapter.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: reaches the network to observe a concept the case collects, rather than answering from FakeObservationSource's static fixture
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: calls each collected concept's own registered connector address, proving the pipeline's IObservationSource resolves through the HTTP declarative adapter's own registry-driven resolution rather than a hardcoded or fixture-derived one
- criterion: No production code path still seeds or reads the static observations fixture file.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers correctly even while the retired static observations fixture holds unparseable content, proving no production path still reads it
  - file: src/__tests__/unit/config/env.spec.ts
    name: parses an environment naming the retired OBSERVATIONS_FIXTURE_FILE variable without carrying it onto Env, now that no production path reads it
- criterion: Every environment variable env.ts still declares as required has at least one remaining production consumer once the swap lands.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: sends the caller-configured evaluator and consolidator models to the provider, both read once from this factory's own Env
  why: Only EVALUATOR_MODEL and CONSOLIDATOR_MODEL are traced to a production consumer by name in the reviewed test set. DATABASE_URL, PORT, POOL_SIZE, CONSOLIDATOR_MAX_TOKENS, DEFAULT_CONSOLIDATION_REGISTER and PROMPT_VERSION are set in the test's Env literal but no given test traces any of them to a specific remaining production consumer — the criterion is a totality over every required variable, and no test performs that systematic check.
findings:
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: DEFAULT_STATUS_ENDING and its use in endingForStatus (lines ~69-79 and ~238-242)
  evidence: 'const DEFAULT_STATUS_ENDING: EvidenceResult = ''unavailable''; ... return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;'
  cost: domain/investigation/evidence-result names only the four endings and states that "only ok may enter a cache," but never says which of the other three an unclassified or unmapped observation resolves to. This file decides that on its own — every unrecognized or unmapped HTTP status becomes 'unavailable' rather than, say, 'denied' or a thrown fault — so which of the three non-ok endings an investigation's evidence records for a status the connector's own configuration failed to anticipate is a business classification now living only in this adapter's own constant, where the next person deciding whether that reading is right will not think to look, because they will look at the evidence-result node and find it silent by design.
  correction: Either the specification states the default ending an unclassified observation status resolves to (extending domain/investigation/evidence-result or a related rule), or the task's Notes / a BLOCKING note record this as a deliberately undecided fact and this adapter's own choice is treated as free technical design that never determines a business-visible ending — not, as written, silently determining one.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: refuseRegistrationDepartures, the throw inside it (~line 97)
  cites: COR-02
  evidence: throw new IncompleteConnectorConfigurationError(problems);
  cost: the class this raises (errors/incomplete-connector-configuration.error.ts) carries a name, a message and a context but no status, so nothing on the failure itself tells a caller a layer up what transport status to answer with — that mapping has to be reconstructed by matching on the error's identity instead of reading a field it already carries.
  correction: give the raised error class a status field alongside name, message and context, the same four COR-02 asks every raised failure to carry.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: function isPlainObject (~lines 119-121)
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: investigation/citation-validation.ts already declares the identical check; this file re-implements it rather than calling it, so a fix to what counts as a plain object has this copy to find and fix separately from the original and from the further copies this same change adds elsewhere.
  correction: export the existing plain-object guard from citation-validation.ts (or a shared module) and import it here instead of redefining it.
- pass: standard
  file: src/http-connector/connector-request-resolver.ts
  where: function isPlainObject (~lines 226-228)
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: the same block already exists in citation-validation.ts (and is copied again into two more files by this same change), so the check is now maintained in four places instead of called from one.
  correction: reuse the existing guard rather than redefining it in this file.
- pass: standard
  file: src/http-connector/response-path-extractor.ts
  where: function isPlainObject (~lines 140-142)
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is Record<string, unknown> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: another verbatim copy of citation-validation.ts's own guard; a reader who fixes the definition in one of the (now five) copies has no signal that four others still hold the old behavior.
  correction: reuse the existing guard rather than redefining it in this file.
- pass: standard
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: function isPlainObject (~lines 323-325)
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: a fourth copy of the same block within this one change (plus the pre-existing one in citation-validation.ts) — the file that most needs to stay correct about what an HTTP-configuration object looks like is trusting its own private redefinition rather than the one already proven elsewhere.
  correction: reuse the existing guard rather than redefining it in this file.
- pass: standard
  file: src/persistence/relational-connector-configuration-store.repository.ts
  where: the constructor (line 59)
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: 'DatabaseConnection is declared elsewhere as `type DatabaseConnection = Pool` — pg''s own concrete class — not an interface, so a unit test of this store cannot implement a published contract and instead fabricates an object and forces it past the type system: this file''s own unit-level sibling does exactly that (`return { query } as unknown as DatabaseConnection;`), which is the cost ARC-01 exists to name.'
  correction: take an interface narrow enough for this store's own two operations, and let the factory supply the concrete Pool-backed connection behind it.
- pass: standard
  file: src/persistence/relational-connector-configuration-store.repository.ts
  where: raiseReadFailure and raiseWriteFailure (lines 96-111)
  cites: COR-02
  evidence: "return new ConnectorConfigurationStoreError(\n    'a read against the connector-configuration store failed',\n    { operation: 'read' },\n    { cause },\n  );"
  cost: the store's own typed error carries a name, a message and a context but no status field, so a caller mapping this failure to a response has to infer a status from the error's identity rather than read one off the error itself.
  correction: give ConnectorConfigurationStoreError a status field alongside name, message and context.
- pass: failures
  file: src/__tests__/integration/vitest-global-setup.spec.ts
  where: has already recorded every migration file as applied and left the database holding the schema those files describe by the time this spec's own first test runs, proving the suite's own setup ran before any test
  evidence: "AssertionError: expected [ '0001-schema-migrations.sql', …(7) ] to deeply equal [ '0001-schema-migrations.sql', …(6) ]\n@@ -4,6 +4,7 @@\n    \"0003-capability-registry.sql\",\n    \"0004-case-and-hypothesis.sql\",\n    \"0005-investigation.sql\",\n    \"0006-case-version-immutability.sql\",\n    \"0007-capability-concept.sql\",\n+   \"0008-connector-configuration.sql\",\n  ]"
  cost: the closed list this test hardcodes (EXPECTED_MIGRATION_FILENAMES, ending at 0007-capability-concept.sql) does not admit any migration this or any future change adds, so every change that legitimately extends the migrations directory turns green suite red for a file it never touched and a task it does not own.
  correction: the totality assertion belongs to task/relational-substrate/migration-step in the relational-persistence initiative, not to any task of this change; that task's list must be extended to include 0008-connector-configuration.sql (or restated to assert order/prefix-numbering rather than a fixed enumeration), and the fix must land through that task, not by editing this file inside the http-connector-adapter delivery.
  cause: test
- pass: failures
  file: src/__tests__/integration/persistence/migration-runner.spec.ts
  where: applies no script twice and fails nothing when run again against a database that already holds the schema
  evidence: 'AssertionError: expected [ { …(2) }, { …(2) }, { …(2) }, …(5) ] to have a length of 7 but got 8

    - 7

    + 8'
  cost: the same closed EXPECTED_MIGRATION_FILENAMES list (ending at 0007-capability-concept.sql) is reused here as a row count, so the test fails the moment a new migration file exists, independent of whether applyPendingMigrations behaves correctly against the now-larger, already-applied schema.
  correction: extend the same list this file declares (currently 7 entries through 0007-capability-concept.sql) to include 0008-connector-configuration.sql, through the migration-step task that owns this assertion — not inside this change's delivery.
  cause: test
failures_counted: 2
run: run/http-connector-adapter-change-review
---

## What it is

The first review of the http-connector-adapter change: all 31 files the 5 tasks created or modified, read against every criterion those tasks state, every specification node they implement, the project's own standard, and the 2 failures the captured suite still shows.
6 of 25 criteria come back partial rather than covered — each because the test set proves the half within this change's own files, while the other half reaches a file (evidence-collection-stage.ts) or a totality (every env var's production consumer) the given tests do not scan. 1 specification-conformance finding: an HTTP status's default classification to 'unavailable' is a business-visible choice made silently in code, with no specification node stating it. 5 standard findings: two rules — COR-02 (a raised error lacks a status field) and MNT-03 (isPlainObject copied four times instead of reused) — account for all of them, plus one ARC-01 finding (a concrete Pool type stands in for a port). 2 failures, both pre-existing, both outside this change's own file set, both already disclosed in this initiative's own commits as belonging to a different task in a separate initiative.

## Notes

No proof delivery-node record exists yet for any of the 5 tasks — the suite has been red since task 1 for the same 2 pre-existing, out-of-scope reasons the failures pass confirms below, and by the human's own decision this was left unresolved rather than fixed inside this change. The test file set this review's coverage pass read is the actual, committed test files, supplied directly since no proof record could point to them formally.
The specification-conformance pass's one finding and one of the standard pass's ARC-01 findings both concern the same file (http-declarative-observation-source.adapter.ts) but are different judgments: one is a business fact decided in code with no specification backing, the other is an architecture/testability property the project's own standard states.
