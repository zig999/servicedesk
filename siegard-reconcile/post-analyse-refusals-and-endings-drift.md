---
contract_version: siegard-reconcile/1
title: Backend re-read after the 2026-08-25 analyse stated the refusals and endings the code carried alone
summary: 'The human''s premise: a especificação foi movida pelo /analyse de 2026-08-25 para declarar as recusas,
  status, nomes de erro, paginação e desfechos que o backend entregue afirma; o código está como entregue e revisado.
  The sixteen files are the remainder of connector-capability-corrections-post-closure-drift, unchanged since; the
  13 `moved` findings the analyse left all fall on them.'
target: backend
files:
- path: src/capability-registry/capability-registry.service.ts
  change: source unchanged since siegard-reconcile/connector-capability-corrections-post-closure-drift.md; what
    moved is the specification, amended by the 2026-08-25 analyse to state the refusals, statuses, error names,
    pagination and observation endings this file was reported as stating on its own
- path: src/capability-registry/capability.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/errors/status-map.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/factories/build-app.factory.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/fixtures/capability/capability.json
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/glossary/glossary-store.port.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/glossary/glossary.service.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/build-app.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/dto/list-connector-configurations.dto.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/dto/read-connector-configuration.dto.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/read-capability-by-identity.controller.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/read-capability-by-identity.routes.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/http/read-connector-configuration.controller.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
- path: src/persistence/relational-glossary-store.repository.ts
  change: unchanged since the previous reconciliation; the specification moved, not this file
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.242-246 observationOf filters to the
    capability''s output_schema fields'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: '[src/http/read-capability-by-identity.routes.ts] l.22-25 header and l.58-63 plugin body registering no guard'
  encoded_at:
  - src/http/read-capability-by-identity.routes.ts
- node: constraints/the-capability-identity-read-is-rate-limited
  conforms: true
  how: '[src/http/read-capability-by-identity.routes.ts] l.59 `app.addHook(''onRequest'', createReadCapabilityByIdentityRateLimitHook());`
    with header l.27-37 `A source IP past 60 requests within the same one-minute window is answered 429 with a Retry-After
    value`'
  encoded_at:
  - src/http/read-capability-by-identity.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: false
  how: '[src/http/read-capability-by-identity.controller.ts] l.31-34 comment `Which transport status the propagated
    CapabilityIdentityNotFoundError becomes is COR-04''s concern, not this specification''s` — the node states the
    404 outright | (cleared in src/capability-registry/capability-registry.service.ts: l.125-131 `if (!resolution.held)
    { throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version); }`)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/read-capability-by-identity.controller.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.1-9 `import type { IConnectorConfigurationStore
    } from ''./connector-configuration-store.port.js'';` and l.38 constructor over the port | [src/glossary/glossary-store.port.ts]
    l.1-9 single type-only import from ./terms.js; no framework, driver or client | [src/investigation/http-declarative-observation-source.adapter.ts]
    the infrastructure side of a port; imports only ports, types and sibling infrastructure — states nothing against
    the node'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary-store.port.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: '[src/persistence/relational-glossary-store.repository.ts] readTerms l.115-121 and readConcepts l.153-155
    over the one DatabaseConnection'
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: '[src/factories/build-app.factory.ts] l.68/119/218 `registerConcept: { registerConcept: resources.registerConcept
    },` | [src/glossary/glossary-store.port.ts] l.31-47 writeConcepts doc and signature | [src/glossary/glossary.service.ts]
    l.75-85 registerConcept whole-replace | [src/http/build-app.ts] l.132 dependency and l.168 `createRegisterConceptRoutesPlugin(dependencies.registerConcept)`
    | [src/persistence/relational-glossary-store.repository.ts] writeConcepts l.170-181'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/http/build-app.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.93-164 readVocabularyTerm, readConcept, listVocabularyTerms, listConcepts'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: '[src/capability-registry/capability-registry.service.ts] l.95-99 comment `Not part of the published capability-registry
    contract (contracts/integration/capability-registry names only read-capability, by concept, and list-capabilities)`
    — the node publishes read-capability-by-identity among four operations | [src/http/read-capability-by-identity.controller.ts]
    l.10-16 comment `readCapabilityByIdentityOrThrow is not part of that contract (... this operation is published
    as this route''s own fourth operation` — the node lists read-capability-by-identity among its four operations
    | (cleared in src/factories/build-app.factory.ts: l.161-162 readCapability/readCapabilityByIdentity, l.182 listCapabilities,
    l.217 registerCapability wiring) | (cleared in src/http/build-app.ts: l.110-115 fields and l.146-151 the four
    route plugins) | (cleared in src/http/read-capability-by-identity.routes.ts: l.60-62 `app.get(`${API_PREFIX}/capabilities/:name/:version`,
    ...)` and l.85-86 answering the capability)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/read-capability-by-identity.controller.ts
  - src/http/read-capability-by-identity.routes.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.124 `observeConcept(concept, subject,
    requester): Promise<ObservationOutcome>`'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: '[src/factories/build-app.factory.ts] l.166 readConnectorConfiguration, l.189 listConnectorConfigurations,
    l.219 registerConnector wiring | [src/http/dto/list-connector-configurations.dto.ts] l.47-50 `offset: z.coerce.number().int().nonnegative().optional(),
    limit: z.coerce.number().int().positive().optional()` — as constraints/listings-are-paged states | [src/http/dto/read-connector-configuration.dto.ts]
    l.40 params schema and l.53 response schema of read-connector-configuration | [src/http/read-connector-configuration.controller.ts]
    l.77-83 handleReadConnectorConfigurationRequest'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/dto/list-connector-configurations.dto.ts
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.126-129 one generic call per capability
    through its connector'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.104 `implements IObservationSource`'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.99-102/126 no external system named'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/action
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.35-42 terms() generically over TermVocabulary | [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES l.90 `action: ''public.actions''`'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: '[src/glossary/glossary-store.port.ts] l.28-29/47 readConcepts and writeConcepts over Concept/ConceptRegistration
    | [src/glossary/glossary.service.ts] l.50-58/76-80 `{ name, accepts, ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS
    }` | [src/persistence/relational-glossary-store.repository.ts] IConceptRow l.74-77, readWholeConcepts l.208-212,
    insertConceptStatement l.195-205'
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.38-41 outcome branch of terms() and l.176-185 withNonConclusionOutcomes
    | [src/persistence/relational-glossary-store.repository.ts] VOCABULARY_TABLES l.89'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.35-42 terms() generically | [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES l.91'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.35-42 terms() generically | [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES l.88'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.35-42 terms() and l.55/78 `accepts: registration.accepts` | [src/persistence/relational-glossary-store.repository.ts]
    VOCABULARY_TABLES l.87 and concept_accepts l.202'
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/integration/capability
  conforms: false
  how: '[src/capability-registry/capability.ts] l.66-71 comment attributes concept''s requiredness to `domain/integration/capability-registry`;
    the node holding it is domain/integration/capability (attribute concept, required: true) | [src/capability-registry/capability.ts]
    l.72-80 `REQUIRED_REGISTRATION_ATTRIBUTES = [''name'',''version'',''nature'',''input_schema'',''output_schema'',''connector'',''concept'']`
    — the required set re-derived from the node''s flags into a stale-able copy | (cleared in src/capability-registry/capability-registry.service.ts:
    l.181-190 heldCapability builds the eight attributes; sameIdentity l.268-270) | (cleared in src/fixtures/capability/capability.json:
    each object l.2-11/12-21 carries exactly the eight required attributes) | (cleared in src/http/read-capability-by-identity.controller.ts:
    l.47 `readonly readCapabilityByIdentity: (name: string, version: string) => Promise<Capability>;`) | (cleared
    in src/investigation/http-declarative-observation-source.adapter.ts: l.126/129/244 connector, timeout, output_schema
    read off the resolved capability)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/fixtures/capability/capability.json
  - src/http/read-capability-by-identity.controller.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability-nature
  conforms: false
  how: '[src/capability-registry/capability.ts] l.11 `export const CAPABILITY_NATURES = [''read-only'', ''mutating'']
    as const;` — the enumeration spelled a second time, nothing reads it from the node | (cleared in src/fixtures/capability/capability.json:
    l.5/15 `"nature": "read-only"`)'
  observed_at:
  - src/capability-registry/capability.ts
  - src/fixtures/capability/capability.json
- node: domain/integration/capability-registry
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] registerCapability l.62-69 `refuseAnsweredConcept(kept,
    capability); await this.store.writeCapabilities([...kept, capability]);` and readCapability l.80-88'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.53-57 replace-whole by connector
    name; l.168-175 the held shape | [src/http/dto/read-connector-configuration.dto.ts] l.53-56 `connector: z.string().min(1),
    configuration: z.string().min(1)` — configuration as the string the node declares | [src/http/read-connector-configuration.controller.ts]
    l.102-109 `configuration: JSON.stringify(configuration.configuration)`'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.50-58 registerConnector | [src/factories/build-app.factory.ts]
    l.110 `createConnectorConfigurationRegistry(connection)` and l.120 registerConnector delegated | [src/http/build-app.ts]
    l.133 dependency and l.169 `createRegisterConnectorRoutesPlugin(dependencies.registerConnector)`'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.131/203-209/295-297 endings answered
    and recognised via EVIDENCE_RESULTS'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: false
  how: '[src/glossary/glossary-store.port.ts] l.17-21 the rule is cited to `(task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the node now holds it and the file names a disposable plan task as its authority | [src/glossary/glossary.service.ts]
    l.29-33 and l.166-173 comments cite `(task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    for the never-remove-a-referenced-outcome rule the node now holds | [src/persistence/relational-glossary-store.repository.ts]
    l.26-34 and l.134-142 cite `(task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)` twice for
    the add-only, never-remove-a-referenced-outcome guarantee the node now holds'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: '[src/capability-registry/capability-registry.service.ts] l.212-214 `if (registration.timeout !== undefined
    && !Number.isInteger(registration.timeout)) { problems.push(''timeout is not an integer count of milliseconds'');
    }` — a stated non-integer timeout is refused as IncompleteCapabilityContractError, a condition the node pairs
    only with an undeclared attribute; whether it is this 422 or the 400 of a-malformed-request-is-refused-with-a-validation-error
    is settled only by this function | (cleared in src/capability-registry/capability.ts: l.64 `DEFAULT_CAPABILITY_TIMEOUT_MS
    = 60_000` and l.72-80 REQUIRED_REGISTRATION_ATTRIBUTES (timeout omitted as defaulted))'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] l.229-244 `SCHEMA_ATTRIBUTES.filter((attribute)
    => !isWellFormedJson(registration[attribute]))` → `throw new CapabilitySchemaNotWellFormedError(malformed)`'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] l.178-180 `if (registration.nature !== READ_ONLY_NATURE)
    { throw new CapabilityNotReadOnlyError(registration.nature); }`'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.155-174 `readonly configuration:
    Readonly<Record<string, unknown>>;` ... `configuration: wellFormedConfiguration(registration.configuration)`
    — the node says the registry holds and answers the configuration as text; the service parses, discards the text
    and holds the object | [src/connector-registry/connector-configuration-registry.service.ts] l.180-182/219-238
    `A value already given as an object — undeclared, null, an array, or a genuine plain object — passes through
    unchanged` ... `problems.push(''configuration is not a plain object''); throw new IncompleteConnectorConfigurationError(problems);`
    — a null/array/absent configuration is refused as IncompleteConnectorConfigurationError, the value a-connector-configuration-names-its-connector
    reserves for an absent connector name, where the node says ConnectorConfigurationNotWellFormedError | [src/errors/status-map.ts]
    l.1-8 header `which status each domain error resolves to is this project''s own engineering decision, not a
    fact the specification holds or should hold` — the bound node states the 422 as a decided fact | [src/errors/status-map.ts]
    l.27-31/96 `[CapabilityConnectorMismatchError, 409],` cited to a plan task — no node names this refusal of the
    test action | [src/errors/status-map.ts] l.48-51 and the table''s absence of IncompleteConnectorConfigurationError
    — the class stays unmapped and answers 500 where rules/integration/a-connector-configuration-names-its-connector
    states HTTP 422 | [src/errors/status-map.ts] l.84 `[CaseNotFoundError, 404],` — no node states what a read of
    an unknown case answers | [src/errors/status-map.ts] l.91 `[CaseAlreadyHasDraftError, 409],` — rules/knowledge/a-case-has-at-most-one-draft
    names no status or error | [src/errors/status-map.ts] l.92 `[ManifestPositionOccupiedError, 409],` — rules/knowledge/a-hypothesis-position-is-unique-within-its-case
    names no status or error | [src/errors/status-map.ts] l.93-94 `[CaseVersionNotDraftError, 409], [CaseVersionNotDraftAtReleaseError,
    409],` — no node names either or distinguishes the two | [src/errors/status-map.ts] l.97 `[CaseVersionNotReleasableError,
    422],` — no node names the release refusal''s status or error | [src/errors/status-map.ts] l.98 `[ManifestWouldHoldNoHypothesisError,
    422],` — rules/knowledge/a-case-has-at-least-one-hypothesis names no status or error'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.11-21 header `its absence stated
    as data — never an invented configuration and never an error` — the node says the published read refuses the
    miss with HTTP 404 ConnectorConfigurationNotFoundError, which readConnectorConfigurationOrThrow below does;
    the header contradicts it | [src/http/read-connector-configuration.controller.ts] l.33-38 comment `Which transport
    status the propagated ConnectorConfigurationNotFoundError becomes is COR-04''s concern, not this specification''s`
    — the node states the 404 outright | (cleared in src/factories/build-app.factory.ts: l.166 the published read
    wired to readConnectorConfigurationOrThrow, described l.143-147 as raising ConnectorConfigurationNotFoundError
    on a miss)'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/read-connector-configuration.controller.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.242-246 observation keyed by the capability''s
    output_schema'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] l.281-286 `throw new ConceptAlreadyAnsweredError(registering.concept,
    answering, registering);` and l.83-85 `throw new DuplicateConceptAnswerError(concept, answers);`'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.129 `await this.issueRequest(httpFields.method,
    request, capability.timeout)` with header l.13-16 citing this rule — the only bound applied is the capability
    timeout; no remaining-time input exists to clamp by the seven-second stage budget the node states, so a sixty-second
    default holds a call open from inside a stage bounded at seven'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.128 `resolveConnectorRequest({ configuration:
    rawConfiguration, subject, requester })`'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.130-132 `if (call.kind === ''timed-out'')
    { return { result: ''timeout'' }; }`'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: '[src/glossary/glossary.service.ts] l.56/79 `ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS`'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: '[src/fixtures/capability/capability.json] each object''s nature, output_schema, timeout and concept keys
    — the capability half of the rule'
  encoded_at:
  - src/fixtures/capability/capability.json
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.130-132 the timed-out branch records
    result timeout'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
notes: 'Judgment shape: sixteen specification-conformance-reviewer delegations, one per file, each handed its one
  file, the nodes the trace binds to it, and as candidates every other node of the set plus the nine nodes the analyse
  wrote (a-connector-configuration-names-its-connector, an-http-connector-configuration-declares-its-call, an-unclassified-status-ends-unavailable,
  an-unresolvable-observation-ends-unavailable, a-glossary-read-by-an-unheld-name-is-refused, a-vocabulary-holds-each-name-once,
  listings-are-paged, a-malformed-request-is-refused-with-a-validation-error, the-concept-read-refuses-an-unanswered-concept).
  Thirteen of the bound nodes had also moved on the specification side; each was read as it stands now and the bind
  restamps both sides. Folding as before: a node conforms only where every delegation that read one of its files
  cleared it; a finding naming a node landed on that node; a finding naming no node landed on every node of its
  file (the seven no-node findings on status-map.ts land on its one node, a-connector-configuration-holds-a-well-formed-object,
  which two other findings already refuse). Findings against candidate nodes no named file is bound to, which therefore
  have no entry above and no binding to write: constraints/listings-are-paged ← src/capability-registry/capability-registry.service.ts:
  l.246-265 pageCountOf `return limit > 0 ? Math.ceil(total / limit) : 0;` with comment `neither this task''s own
  criteria nor src/types/pagination.ts states what a non-positive limit answers` — the constraint states the case
  is refused upstream; constraints/listings-are-paged ← src/connector-registry/connector-configuration-registry.service.ts:
  l.133-151 same pageCountOf comment and branch; constraints/listings-are-paged ← src/glossary/glossary.service.ts:
  l.188-200 same pageCountOf comment and branch; rules/integration/a-connector-configuration-names-its-connector
  ← src/errors/status-map.ts: IncompleteConnectorConfigurationError absent from STATUS_BY_ERROR_CLASS → answers
  500 where the node states 422; rules/integration/an-unresolvable-observation-ends-unavailable ← src/factories/build-app.factory.ts:
  l.148-155 comment says the adapter raises its own error on a connector-configuration miss; the node says the observation
  ends unavailable; rules/integration/an-unresolvable-observation-ends-unavailable ← src/investigation/http-declarative-observation-source.adapter.ts:
  l.142-148 `throw new CapabilityNotResolvedForObservationError(concept)` and l.156-162 `throw new ConnectorConfigurationNotRegisteredError(connector)`
  — raised, not ended unavailable; the doubly-answered case is absent; rules/integration/an-http-connector-configuration-declares-its-call
  ← src/investigation/http-declarative-observation-source.adapter.ts: l.269-277 `throw new MalformedHttpConnectorConfigurationError(connector,
  problems)` — raised, where the node says the observation ends unavailable carrying it as result detail; rules/integration/an-unclassified-status-ends-unavailable
  ← src/investigation/http-declarative-observation-source.adapter.ts: l.71-80 the value agrees (`unavailable`) but
  the comment claims `no specification node states a default classification`. Two files were previously named and
  are gone (src/case/author-case-version.service.ts, src/factories/author-case-version.factory.ts); they are outside
  this file set and their six bindings stand as recorded in author-case-version-retirement-drift, awaiting trace.py
  --replace by hand. Shape of what remains: (a) comments contradicting nodes as they now stand — capability-registry.service.ts
  l.95-99, read-capability-by-identity.controller.ts l.10-16 and l.31-34, read-connector-configuration.controller.ts
  l.33-38, connector-configuration-registry.service.ts l.11-21, status-map.ts l.1-8, the three pageCountOf comments,
  the adapter l.71-80, and the four task-path citations for the non-conclusion rule; (b) behavior the specification
  now decides differently from the code — the adapter raising where nodes say the observation ends unavailable,
  the adapter applying no stage-budget clamp, IncompleteConnectorConfigurationError unmapped (500 vs 422), a non-plain-object
  configuration refused as Incomplete rather than NotWellFormed, the registry holding an object where the node says
  text, a non-integer timeout folded into the incomplete-contract refusal; (c) facts still held by no node — CapabilityConnectorMismatchError
  and six knowledge-context refusal statuses in status-map.ts, and the two capability.ts constants restating the
  node''s enumeration and required set.'
---
