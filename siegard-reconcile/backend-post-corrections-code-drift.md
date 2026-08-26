---
contract_version: siegard-reconcile/1
title: Backend code drift over 30 files, resumed after the prior session was interrupted mid-run
summary: 'The human''s premise: the backend as currently delivered and already reviewed is correct; the
  trace''s 32 ''code'' findings for the backend target (two of which name files that no longer exist and
  are excluded from this run) had never been rebound. A prior /reconcile session over this same 32-file
  set was interrupted before compiling its record or binding anything — nothing from that session reached
  disk. This run re-judges the 30 files that still exist, from scratch, one specification-conformance-reviewer
  delegation per file, plus 4 follow-up delegations for node-file bindings the initial trace read (scoped
  from trace.py --check alone) missed — a file the check output does not list as drifted for a given node
  can still be bound to that node with an intact digest, and only reading siegard-trace.json''s own bindings
  surfaces it.'
target: backend
files:
- path: src/__tests__/integration/seed.spec.ts
  change: integration test suite covering the seeded glossary vocabularies (action, concept, outcome,
    recipient, subject-type) and the curated case version's write-once guarantee, asserted directly against
    the database
- path: src/capability-registry/capability-registry.service.ts
  change: 'registers, reads and lists capabilities: refuses an unregistered identity, a second capability
    answering a concept already answered, a non-read-only nature, an incomplete contract and a malformed
    schema'
- path: src/capability-registry/capability.ts
  change: declares the capability-nature enumeration, the default timeout constant and the required-registration-attribute
    list the registry service consumes
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: registers and reads connector configurations behind the store port, refusing a configuration
    that is not a well-formed JSON object or is incomplete
- path: src/errors/duplicate-concept-answer.error.ts
  change: the business error raised when the registry holds more than one capability answering the same
    concept
- path: src/errors/status-map.ts
  change: maps every domain error class to its HTTP status, including the connector-configuration-not-well-formed
    refusal at 422
- path: src/factories/build-app.factory.ts
  change: wires the capability-registry routes' dependencies (read, read-by-identity, list, register)
    to the registry service
- path: src/fixtures/capability/capability.json
  change: the fixture data seeding two read-only capabilities with well-formed schemas
- path: src/glossary/glossary-store.port.ts
  change: 'the domain-facing persistence port for the glossary: reading and replacing concepts, reading
    and inserting-missing vocabulary terms'
- path: src/glossary/glossary.service.ts
  change: reads and registers glossary concepts and vocabulary terms, always including the two non-conclusion
    outcomes and defaulting a concept's ttl
- path: src/http-connector/connector-call-descriptor.ts
  change: declares the pure structural types for an assembled outbound HTTP connector call, with no import
    of any framework or driver
- path: src/http/dto/read-connector-configuration.dto.ts
  change: the request/response DTOs for GET /v1/connectors/{connector}, answering configuration as JSON
    object text
- path: src/http/dto/register-capability.dto.ts
  change: the request DTOs for PUT /v1/capabilities/{name}/{version}, validating the registration body
    including a `.positive()` bound on the declared timeout
- path: src/http/list-connector-configurations.controller.ts
  change: answers a paged list of connector configurations, each exactly as the registry currently holds
    it
- path: src/http/read-capability-by-identity.controller.ts
  change: resolves a capability by (name, version) identity and answers its whole declared contract unchanged
- path: src/http/read-capability-by-identity.routes.ts
  change: registers GET /v1/capabilities/{name}/{version}, validating the two path parameters and delegating
    to the identity read
- path: src/http/test-connector.controller.ts
  change: issues one diagnostic HTTP call through a registered capability's connector, masking any resolved
    credential in the echoed request before answering
- path: src/investigation/evidence-collection-stage.ts
  change: collects one evidence item per concept a case's hypotheses declare, racing each observation
    against the smaller of the capability's own timeout and the collection's remaining budget
- path: src/investigation/fake-observation-source.adapter.ts
  change: the fixture-driven observation-source double, keyed by concept and the subject's whole flattened
    attribute set
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: 'the one production observation-source adapter: resolves a capability and its connector''s HTTP
    call configuration, issues one call bounded by the smaller of the capability''s timeout and the remaining
    budget, and normalizes the response into the glossary vocabulary'
- path: src/investigation/observation-source.port.ts
  change: the domain-facing port an observation source implements, carrying the requester on every call
    and importing no infrastructure
- path: src/migrate.ts
  change: 'the standalone migration entry point: reads DATABASE_URL through loadEnv alone and applies
    every pending script in numbered order'
- path: src/persistence/migration-runner.ts
  change: orders and applies migration scripts under a directory, skipping only what schema_migrations
    already records
- path: src/persistence/relational-capability-store.repository.ts
  change: 'the relational adapter behind the capability-registry store port: reads and replaces the whole
    capability set inside one transaction'
- path: src/persistence/relational-case-store.repository.ts
  change: 'the relational adapter for the whole case/hypothesis/manifest lifecycle: draft creation, hypothesis
    placement and revision, release, discard, and paged reads, one case version read whole per transaction'
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: 'the relational adapter behind the connector-configuration store port: a fresh read and a whole-set
    replace per call'
- path: src/persistence/relational-glossary-store.repository.ts
  change: 'the relational adapter behind the glossary store port: fresh reads and all-or-nothing replaces
    per vocabulary and per concept set'
- path: src/persistence/relational-investigation-store.repository.ts
  change: the relational adapter that writes one whole investigation — subject, evidence, evaluations,
    citations, assessment, cost and durations — as one unit of work, write-once by the root row's own
    primary key
- path: src/seed.ts
  change: seeds the two non-conclusion outcomes before any other vocabulary, then the remaining vocabularies,
    concepts, capabilities and the curated case, guarded against reseeding an already-released version
- path: src/vitest-global-setup.ts
  change: applies pending migrations against DATABASE_URL read directly, then backfills two hypothesis-revision-collects
    rows a prior suite run's cleanup deleted
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] assembleVersion/assembleWholeVersion runs
    inside one runInTransaction and reads the version row plus its whole manifest together — nothing partial
    is ever returned.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] observationOf() extracts the
    ok observation through response-path-extractor.ts''s own extractResponseFields and keys it by the
    capability''s own output_schema property names, filtering to declared fields only.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: '[src/http/test-connector.controller.ts] handleTestConnectorRequest declares no authentication
    middleware or guard, and takes the requester directly from the request body unverified.'
  encoded_at:
  - src/http/test-connector.controller.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] readCapabilityByIdentityOrThrow: `if
    (!resolution.held) { throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);
    }`.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: '[src/migrate.ts] reads DATABASE_URL through loadEnv alone (`const env = loadEnv(); const connection
    = createDatabaseConnection(env.DATABASE_URL);`); [src/vitest-global-setup.ts] reads `process.env.DATABASE_URL`
    directly and passes it the same way, with the file''s own header disclosing that direct read as a
    divergence from loadEnv rather than from the node''s own fact.'
  encoded_at:
  - src/migrate.ts
  - src/vitest-global-setup.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] `const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS,
    deadline - now));` — both `now` and `deadline` arrive as explicit parameters; the module never reads
    the system clock itself.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] the class''s only dependency
    is the injected store port. [src/glossary/glossary-store.port.ts] its only import is a type import
    of the domain''s own terms module. [src/http-connector/connector-call-descriptor.ts] the file contains
    no import statement at all. [src/investigation/fake-observation-source.adapter.ts] its only import
    is a type-only import of the port itself. [src/investigation/http-declarative-observation-source.adapter.ts]
    never imported by the domain layer; no domain module imports this file or the fetch it calls through.
    [src/investigation/observation-source.port.ts] its only imports are `EvidenceResult` and `Subject`
    type imports. [src/persistence/relational-connector-configuration-store.repository.ts] the domain
    declares the port and this class is the infrastructure behind it, with no driver import under the
    domain layer.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary-store.port.ts
  - src/http-connector/connector-call-descriptor.ts
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: '[src/migrate.ts] `await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY, await resolvedSchema(connection));`.
    [src/persistence/migration-runner.ts] orderedMigrationFiles orders every `.sql` script by filename
    and appliedFilenames skips only what schema_migrations already names. [src/vitest-global-setup.ts]
    applies pending migrations the same way before any fixture repair runs.'
  encoded_at:
  - src/migrate.ts
  - src/persistence/migration-runner.ts
  - src/vitest-global-setup.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] investigationStatement/investigationParams:
    "The one INSERT the root row needs, from every attribute domain/investigation/investigation declares
    plus the flattened subject, pinned case, assessment, cost and durations."'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: '[src/persistence/relational-capability-store.repository.ts] every read and write goes through
    the injected `this.connection`, no file opened anywhere. [src/persistence/relational-connector-configuration-store.repository.ts]
    readConnectorConfigurations/writeConnectorConfigurations both run through `runStatement(this.connection,
    ...)`. [src/persistence/relational-glossary-store.repository.ts] readTerms/readConcepts run a fresh
    read on every call, never a remembered value. [src/persistence/relational-investigation-store.repository.ts]
    write()/read() wrapped in runInTransaction over the injected connection.'
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: '[src/glossary/glossary-store.port.ts] writeConcepts()''s doc comment: "creating one at a name
    the glossary did not yet hold, or replacing one in place at a name it already held". [src/glossary/glossary.service.ts]
    registerConcept() matches the same create-or-replace-in-place shape. [src/persistence/relational-glossary-store.repository.ts]
    writeConcepts "replaces every concept ... with exactly the given set, as one unit of work".'
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: '[src/glossary/glossary.service.ts] readVocabularyTerm/readConcept/listVocabularyTerms/listConcepts
    each resolve fresh through the store every call, answering absence as data.'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: '[src/factories/build-app.factory.ts] readDependencies, listDependencies and registrationDependencies
    wire exactly the four declared operations (read-capability, read-capability-by-identity, list-capabilities,
    register-capability). [src/http/dto/register-capability.dto.ts] registerCapabilityParamsSchema/registerCapabilityBodySchema
    match the register operation''s identity-plus-attributes shape. [src/http/read-capability-by-identity.routes.ts]
    registers GET /v1/capabilities/{name}/{version}, resolving name and version together as one identity.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/dto/register-capability.dto.ts
  - src/http/read-capability-by-identity.routes.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: '[src/investigation/fake-observation-source.adapter.ts] `public async observeConcept(...)` is the
    class''s only operation, matching the read-only single-operation shape. [src/investigation/http-declarative-observation-source.adapter.ts]
    observeConcept() resolves the capability and connector call configuration and issues exactly one HTTP
    call within the bounded timeout.'
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] registerConnector/readConnectorConfiguration/listConnectorConfigurations
    are each present, register-connector replacing whatever configuration already answered to the connector
    name. [src/http/dto/read-connector-configuration.dto.ts] readConnectorConfigurationResponseSchema
    carries exactly `connector` and `configuration` as strings.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/dto/read-connector-configuration.dto.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] class doc comment: "a generic,
    data-driven HTTP call for any capability whose connector is registered — no external system''s name,
    host or shape named anywhere in this file."'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] collectOneEvidence calls `observationSource.observeConcept(...)`
    through the port. [src/investigation/fake-observation-source.adapter.ts] `export class FakeObservationSource
    implements IObservationSource`. [src/investigation/http-declarative-observation-source.adapter.ts]
    "The one production adapter behind IObservationSource". [src/investigation/observation-source.port.ts]
    declares `IObservationSource` and its `observeConcept` operation.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] one method per declared operation: createDraft,
    insertHypothesisRevision, placeHypothesis, removeManifestEntry, updateDraft, release, discard.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] assembleVersion/listCases/listCaseVersions/listHypotheses/listHypothesisRevisions
    cover the declared read operations.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/system/corporate-records
  conforms: true
  how: '[src/http-connector/connector-call-descriptor.ts] the descriptor types assemble one read call
    carrying the requester''s own identity, consistent with read-only observations read on demand within
    the requester''s scope. [src/investigation/http-declarative-observation-source.adapter.ts] a generic,
    data-driven HTTP call naming no external system.'
  encoded_at:
  - src/http-connector/connector-call-descriptor.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/action
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts the actions table holds exactly the fixture''s
    own action names. [src/glossary/glossary.service.ts] terms() reads and asserts unique names for the
    vocabulary, action included. [src/persistence/relational-glossary-store.repository.ts] VOCABULARY_TABLES
    maps `action: ''actions''`.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts every concept the curated case collects, with
    its accepted subject types and ttl, matches the fixture exactly. [src/glossary/glossary-store.port.ts]
    writeConcepts()''s create-or-replace shape matches the node. [src/glossary/glossary.service.ts] concepts()
    builds `{ name, accepts, ttl }` per registration. [src/persistence/relational-glossary-store.repository.ts]
    IConceptRow/IConceptAcceptRow mirror the declared columns.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts the two non-conclusion outcomes are held after
    a run against a database confirmed to lack them beforehand. [src/glossary/glossary.service.ts] withNonConclusionOutcomes
    adds them through the port''s additive primitive. [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES maps `outcome: ''outcomes''`. [src/seed.ts] seedOutcomes unions the fixture outcomes
    with the non-conclusion ones missing from the fixture.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/seed.ts
- node: domain/glossary/recipient
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts the recipients table holds exactly the fixture''s
    own recipient names. [src/glossary/glossary.service.ts] terms() handles it as an ordinary named vocabulary.
    [src/persistence/relational-glossary-store.repository.ts] VOCABULARY_TABLES maps `recipient: ''recipients''`.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: '[src/glossary/glossary.service.ts] terms() handles it as an ordinary named vocabulary. [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES maps `''subject-attribute'': ''subject_attributes''`.'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts the subject_types table holds exactly the fixture''s
    own subject-type name. [src/glossary/glossary.service.ts] concepts()/registerConcept() carry it as
    an ordinary declared attribute. [src/persistence/relational-glossary-store.repository.ts] VOCABULARY_TABLES
    maps `''subject-type'': ''subject_types''`.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/integration/capability
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] heldCapability returns every declared
    attribute unchanged. [src/fixtures/capability/capability.json] each fixture entry carries every required
    attribute with the declared type. [src/http/read-capability-by-identity.controller.ts] passes the
    resolved aggregate through untouched. [src/investigation/http-declarative-observation-source.adapter.ts]
    effectiveTimeoutMsFor/observationOf read `capability.timeout`/`capability.output_schema` as declared.
    [src/persistence/relational-capability-store.repository.ts] ICapabilityRow/toCapability carry all
    eight declared attributes unchanged.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/fixtures/capability/capability.json
  - src/http/read-capability-by-identity.controller.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-nature
  conforms: true
  how: '[src/capability-registry/capability.ts] `export const CAPABILITY_NATURES = [''read-only'', ''mutating'']
    as const;`. [src/fixtures/capability/capability.json] both fixture entries use `"nature": "read-only"`,
    one of the two declared values. [src/persistence/relational-capability-store.repository.ts] `CAPABILITY_NATURE_VALUES`
    is read from the shared `CAPABILITY_NATURES` constant rather than re-listed.'
  encoded_at:
  - src/capability-registry/capability.ts
  - src/fixtures/capability/capability.json
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-registry
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] registerCapability/readCapability implement
    the create-or-replace and one-capability-per-concept resolution the node declares. [src/persistence/relational-capability-store.repository.ts]
    class docstring: the adapter behind the registry''s store port, deferring the registry''s own refuse/resolve
    responsibility to the service.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: '[src/http/dto/read-connector-configuration.dto.ts] `configuration: z.string().min(1)` matches
    the node''s "held and answered as JSON object text". [src/http/list-connector-configurations.controller.ts]
    each entry''s configuration answers exactly as the registry now holds it, the same JSON-string type.'
  encoded_at:
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/list-connector-configurations.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] registerConnector refuses
    before write via heldConfiguration''s checks and replaces whatever configuration already answered
    to the connector name.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/investigation/assessment
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] assessmentParams/assessmentOf carry
    the assessment''s five columns flattened from its referral.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] citationStatement inserts one row
    of one evaluation''s own citations.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] costParams carries the cost''s
    own three columns.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] durationsParams carries the durations''
    own four columns.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] evaluationStatement/evaluationOf
    insert one evaluation''s hypothesis, verdict and, where inconclusive, its reason.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] EVALUATION_REASON_VALUES/reasonOf
    reuse every value the node declares.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] evidenceStatement/evidenceOf insert
    one evidence item''s whole row, every declared attribute plus the capability reference.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'Bound files [src/investigation/evidence-collection-stage.ts, src/investigation/http-declarative-observation-source.adapter.ts,
    src/investigation/observation-source.port.ts, src/persistence/relational-investigation-store.repository.ts]
    each conform: evidence-collection-stage.ts''s settledEvidence() maps `outcome.result` to `ok`/`unavailable`/other
    unchanged; http-declarative-observation-source.adapter.ts''s outcomeFromResponse returns `{ result:
    ending }` for the node''s own endings; observation-source.port.ts''s ObservationOutcome union spells
    the four endings by type; relational-investigation-store.repository.ts''s EVIDENCE_RESULT_VALUES/resultOf
    reuse the declared values. A finding attributed here from outside this bound set: [src/investigation/fake-observation-source.adapter.ts]
    observeConcept''s docstring types the four ending names into prose ("not one of the four evidence-result
    endings") with no node citation, unlike the surrounding comments'' explicit citations of their own
    nodes — a reader trusting this prose reads a vocabulary that could silently drift from the node.'
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
  - src/persistence/relational-investigation-store.repository.ts
  - src/investigation/fake-observation-source.adapter.ts
- node: domain/investigation/investigation
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] IInvestigationRow/investigationOf/identityParams
    hold the whole investigation in the shape the node declares.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] the subject is passed unfiltered through CollectOneEvidenceOptions.
    [src/investigation/fake-observation-source.adapter.ts] fixtureKey flattens the subject''s whole attribute
    set, none filtered out. [src/persistence/relational-investigation-store.repository.ts] identityParams
    (subject_type) plus readSubjectAttributeValues assembled into the subject field.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/fake-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: '[src/investigation/fake-observation-source.adapter.ts] fixtureKey reads exactly the `attribute`/`value`
    pair. [src/persistence/relational-investigation-store.repository.ts] subjectAttributeValueStatement
    inserts one row per attribute-value.'
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] VERDICT_VALUES/verdictOf reuse
    every value the node declares.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] caseIdentityStatement/assignNextVersion
    claim the case''s identity row idempotently and assign the next version by incrementing a durable
    counter.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts every attribute of the seeded case version against
    the fixture. [src/persistence/relational-case-store.repository.ts] assembledCaseVersionOf builds the
    version from every declared attribute plus its manifest.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] DRAFT_STATE/RELEASED_STATE constants and
    isCaseVersionState match the node''s two declared states.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] hypothesisIdentityStatement claims the hypothesis''s
    identity row idempotently, never a second one for a name already held.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] insertRevisionRow/IHypothesisRevisionRow
    are immutable once inserted, no UPDATE ever targets the table. [src/vitest-global-setup.ts] backfillRepairedCollects
    restores hypothesis_revision_collects rows a prior cleanup deleted, on a table the node states carries
    a no-update rule.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/vitest-global-setup.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] manifestEntryOf returns `{ position, hypothesis_revision
    }` per the node''s declared shape.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: '[src/seed.ts] the top-level sequence calls seedOutcomes() before seedRemainingVocabularies/seedConcepts/seedCapabilities
    and the guarded seedCase().'
  encoded_at:
  - src/seed.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: 'Bound files [src/capability-registry/capability-registry.service.ts, src/capability-registry/capability.ts]
    both conform: capability.ts declares DEFAULT_CAPABILITY_TIMEOUT_MS (60000ms) and REQUIRED_REGISTRATION_ATTRIBUTES
    exactly as the node states; capability-registry.service.ts''s refuseContractDepartures/contractProblems
    enforce exactly that attribute list. A finding attributed here from outside this bound set: [src/http/dto/register-capability.dto.ts]
    `timeout: z.number().int().positive().optional()` refuses a declared timeout of 0 or negative with
    400 VALIDATION_ERROR — the node states only that a stated timeout must be "an integer count of milliseconds",
    never that zero or a negative value is invalid; the schema''s own test names this as "the schema''s
    own positive lower boundary", i.e. an unstated rule invented at the validation layer.'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/http/dto/register-capability.dto.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] refuseMalformedSchemas/isWellFormedJson:
    `const malformed = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]));`.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] heldCapability: `if (registration.nature
    !== READ_ONLY_NATURE) { throw new CapabilityNotReadOnlyError(registration.nature); }`.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: 'Bound file [src/errors/status-map.ts]: the 422 map entry itself is correct (`[ConnectorConfigurationNotWellFormedError,
    422]`), but the file''s own opening comment tells a reader this status is "this project''s own engineering
    decision, not a fact the specification holds" — the opposite of what the node states and of what the
    file''s own 422 section says a few lines later. A second finding attributed here from outside the
    bound set: [src/connector-registry/connector-configuration-registry.service.ts] wellFormedConfiguration/registrationProblems
    classify null, an array, an absent value and any other non-object primitive as malformed versus incomplete
    (two different refusals) by the code''s own admitted inference — the node does not decide which of
    the two a caller receives for each shape.'
  observed_at:
  - src/errors/status-map.ts
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: '[src/http/test-connector.controller.ts] resolveTestedCapability: checks the capability lookup
    first (own error), then compares the found capability''s connector against the request''s named connector,
    in the rule''s own order.'
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] httpConfigurationProblems/refuseHttpConfigurationDepartures/resolveHttpConnectorCallConfiguration
    validate the method and other declared call attributes before use.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: false
  how: 'Bound file [src/investigation/http-declarative-observation-source.adapter.ts] conforms: resolveCapability/resolveConnectorConfiguration
    answer `{ ok: false, outcome: unavailableFor(new CapabilityNotResolvedForObservationError(concept))
    }`, reporting the raised error''s own class name as result_detail. A finding attributed here from
    outside this bound set: [src/investigation/evidence-collection-stage.ts] unavailableEvidence, for
    the identical scenario (no capability currently registered for the concept), composes a free-text
    sentence instead — `` `no capability is currently registered for concept "${concept}"` `` — rather
    than the reported error name the rule and its sibling adapter path both use, so the rule stops being
    the one place that names the cause for this path.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] observationOf filters extracted
    fields to `declaredFields` from the capability''s own output_schema.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] refuseAnsweredConcept/readCapability
    refuse a second capability answering an already-answered concept and refuse a read that finds more
    than one answering. [src/errors/duplicate-concept-answer.error.ts] the error message states exactly
    this cardinality fact as the node holds it.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/duplicate-concept-answer.error.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: '[src/persistence/relational-investigation-store.repository.ts] writeWholeInvestigation/raiseRootInsertFailure:
    write-once decided by the root insert''s own primary key, never a read-first check; no statement is
    ever an UPDATE.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] `COLLECTION_STAGE_BUDGET_MS = 7_000` and effectiveBoundMsFor
    bound each call by the smaller of the capability''s timeout and the stage ceiling. [src/investigation/http-declarative-observation-source.adapter.ts]
    effectiveTimeoutMsFor applies the identical `Math.min`.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] the requester is passed straight through to every
    observe-concept call, never substituted. [src/investigation/http-declarative-observation-source.adapter.ts]
    resolveConnectorRequest carries `requester` into the assembled request. [src/investigation/observation-source.port.ts]
    `requester` is required on every ObserveConceptOptions call.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] settledEvidence''s TIMED_OUT branch answers `{
    result: ''timeout'', resultDetail: ... }` rather than throwing. [src/investigation/http-declarative-observation-source.adapter.ts]
    `if (call.kind === ''timed-out'') { return { result: ''timeout'' }; }`.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] collectEvidence runs exactly one collectOneEvidence
    per concept in the collection plan.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] raiseCreateDraftFailure maps the ONE_DRAFT_PER_CASE_CONSTRAINT
    violation to CaseAlreadyHasDraftError.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: '[src/__tests__/integration/seed.spec.ts] asserts a second seed run releases no second version
    of an already-released case. [src/persistence/relational-case-store.repository.ts] updateDraftVersion
    refuses via CaseVersionNotDraftError once a version leaves draft. [src/seed.ts] alreadySeeded guards
    the sole call to seedCase().'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] updateDraftVersion refuses an operation
    other than release once state is not draft, with release''s own guard held one layer up per the file''s
    own header disclosure.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] assignNextVersion increments the case''s
    own durable counter and answers the pre-increment value, never MAX(version) over existing rows.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: false
  how: 'Bound file [src/glossary/glossary.service.ts] conforms: concepts()/registerConcept() carry `ttl:
    registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS`. A finding attributed here from outside this bound
    set: [src/glossary/glossary-store.port.ts] readConcepts()''s doc comment states "ttl absent where
    the registration stated none" without citing this node, and in apparent tension with domain/glossary/concept''s
    own required-ttl attribute — the registration-versus-resolved-concept distinction this node actually
    settles is nowhere cited alongside the claim.'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/glossary/glossary-store.port.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: '[src/vitest-global-setup.ts] REPAIRED_COLLECTS names two hypothesis/concept pairs backfilled after
    a prior cleanup deleted them, restoring each hypothesis to collecting at least one concept.'
  encoded_at:
  - src/vitest-global-setup.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] findDraftVersion was added expressly to
    serve this rule''s gate at the calling layer.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] hypothesisIdentityStatement idempotently
    claims the hypothesis''s identity row, never a second one for a name already held.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] raisePlaceHypothesisFailure maps the POSITION_UNIQUE_CONSTRAINT
    violation to ManifestPositionOccupiedError.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] revisionInsertStatement assigns `COALESCE(MAX(revision),
    0) + 1` scoped per case and hypothesis name.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] resolveSourceVersion/manifestCopyStatement
    copy the named version''s manifest, or the case''s own latest released version, undefined where none
    exists.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] caseIdentityStatement idempotently claims
    the case''s identity row, never refusing an already-held slug.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] discardDraft removes only a draft version
    and its own manifest entries, never a released version''s row.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: '[src/persistence/relational-case-store.repository.ts] manifestSelect orders by `cvh.position`.'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] the TIMED_OUT branch of settledEvidence records
    the evidence-recording half of the scenario. [src/investigation/http-declarative-observation-source.adapter.ts]
    `if (call.kind === ''timed-out'') { return { result: ''timeout'' }; }`.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: '[src/investigation/evidence-collection-stage.ts] effectiveBoundMsFor bounds the call by the smaller
    of the capability''s timeout and the stage ceiling. [src/investigation/http-declarative-observation-source.adapter.ts]
    effectiveTimeoutMsFor applies the identical bound.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/connector-diagnostics
  conforms: false
  how: 'Bound file [src/http/test-connector.controller.ts]: the diagnostic call itself matches the contract
    (assembled subject, read-only, nothing persisted), but resolveConnectorRequest is called a second
    time with a redacting environment substitute so a resolved credential is masked (`***REDACTED***`)
    before the echoed request reaches the response — a decision about what the diagnostic operation tells
    its caller that the contract itself does not state, disclosed by the file''s own comment as this controller''s
    own silent inference.'
  observed_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: '[src/errors/status-map.ts] comment lines 46-49 and map entry line 112: "or one whose connector
    name is absent or an empty string (IncompleteConnectorConfigurationError, rules/integration/a-connector-configuration-names-its-connector)
    — answers 422 Unprocessable Entity ... [IncompleteConnectorConfigurationError, 422]," — status, error
    class and condition all match the node exactly.'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] readConnectorConfigurationOrThrow
    (lines 94-100): "const resolution = await this.readConnectorConfiguration(connector); if (!resolution.held)
    { throw new ConnectorConfigurationNotFoundError(resolution.connector); }" — carries the raising half
    of the refusal; the HTTP 404 mapping is correctly deferred to status-map.ts outside this file, and
    its absence here is not a departure.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: '[src/fixtures/capability/capability.json] both entries carry `"nature": "read-only"`, an `output_schema`,
    a `timeout` and a `concept` — e.g. `"nature": "read-only", "output_schema": "{...}", "timeout": 5000,
    "concept": "equipment-status"` and the matching quartet for `network-outage-flag`, matching what the
    node currently requires.'
  encoded_at:
  - src/fixtures/capability/capability.json
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: '[src/http/dto/register-capability.dto.ts] header comment above the timeout field: "timeout: z.number().int().positive()
    also refuses a declared-but-non-integer timeout ... with this schema''s own 400 VALIDATION_ERROR envelope,
    the same status and code for every non-integer value tested" — matches the node''s HTTP 400 / VALIDATION_ERROR
    statement and cites it by identity rather than restating it as independent authority; corroborated
    against decision-log.md lines 653-659.'
  encoded_at:
  - src/http/dto/register-capability.dto.ts
- node: constraints/listings-are-paged
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] the file''s own judge opened this node
    (found by searching the specification root for the terms the source''s own comments cite, alongside
    constraints/a-malformed-request-is-refused-with-a-validation-error) to confirm pageCountOf''s attribution,
    and reported it ''confirmed to hold what the source says they hold, with no discrepancy.'''
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: constraints/the-capability-identity-read-is-rate-limited
  conforms: true
  how: '[src/http/read-capability-by-identity.routes.ts] the file''s own judge opened this candidate node
    and confirmed: "the ''60 requests,'' ''429,'' ''Retry-After'' language in the second comment block
    matches that node''s statement verbatim."'
  encoded_at:
  - src/http/read-capability-by-identity.routes.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] the file''s own judge opened
    this candidate node via DEFAULT_STATUS_ENDING/endingForStatus() and confirmed: the node''s statement
    (''An HTTP status the executing connector configuration''s statusMap does not classify ends the observation
    as unavailable'') matches what the file''s comment quotes verbatim.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
notes: 'Judgment shape: 30 independent specification-conformance-reviewer delegations, one per file, run
  together in three waves respecting a 20-concurrent-subagent cap, plus 4 further single-node delegations
  dispatched after the first --bind-record attempt refused over 7 node-file bindings this run''s initial
  file-to-node accounting missed (read from trace.py --check''s code-drift listing alone, rather than
  the full siegard-trace.json bindings for each named file, per the skill''s own warning that an intact
  binding is invisible to a drift report). Of those 7, three were already confirmed in passing by their
  file''s own original delegation (constraints/listings-are-paged, constraints/the-capability-identity-read-is-rate-limited,
  rules/integration/an-unclassified-status-ends-unavailable) and are recorded here from that same delegation''s
  own quoted confirmation; the other four (constraints/a-malformed-request-is-refused-with-a-validation-error,
  rules/integration/a-connector-configuration-names-its-connector, rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused,
  rules/knowledge/every-collected-concept-has-a-read-only-capability) were judged by fresh single-node
  delegations. No delegation read another''s return. Each of the 30 original delegations was handed its
  own file''s bound node set plus, as candidates, the union of all 81 nodes bound across that batch, so
  a fact one file states could be attributed to a node bound to a different file rather than reported
  as an absence. Seven candidate- or own-node findings surfaced this way; each is folded into the node
  its own `node` field names, combined with that node''s own bound-file readings where they exist, per
  the contract''s fold rule. Two files bound by the trace to backend code drift were excluded from this
  reconciliation because they no longer exist on disk and cannot be read: src/case/author-case-version.service.ts
  (4 bindings: contracts/system/case-authoring, rules/knowledge/the-contract-check-reads-the-current-registration,
  rules/knowledge/validation-runs-at-every-read, scenarios/knowledge/a-subject-mismatch-refuses-the-case)
  and src/factories/author-case-version.factory.ts (2 bindings: contracts/knowledge/capability-check,
  contracts/knowledge/vocabulary-terms), both removed in commit 4a02bc7 (the closed case-lifecycle initiative).
  Those six bindings remain exactly as drifted as before this run; this record makes no claim about them,
  and they are not this reconciliation''s to resolve — a vanished file has nothing left to read against
  its nodes. Two independent specification-conformance-reviewer readings of duplicate-concept-answer.error.ts''s
  error message have now been produced across the two sessions (the interrupted one, never bound, judged
  the cardinality-rule restatement a finding; this run''s fresh delegation cleared it). Per the framework''s
  rule that a delegation answers once and two divergent answers void rather than reconcile, only this
  run''s judgment — the one actually recorded and bound — stands; the earlier reading was never written
  anywhere and is superseded by never having existed on disk.'
---
