---
contract_version: siegard-reconcile/1
title: Backend code drift after the connector-capability-detail-editing deliveries and their corrections
summary: 'The human''s premise: these eighteen backend files were rewritten by the deliveries of the connector-capability-detail-editing
  initiatives and their corrective plans (commits 502e53f, 5c7274a, ad8224f, 18cff5a, 82be46a and the reviews that
  followed), and by the retirement of author-case-version before them; each delivery''s bind restamped only its
  own task''s nodes, so bindings other nodes hold on the same files kept asserting digests that are no longer there.
  The human states the code is correct as delivered and reviewed; this record asks only whether the specification
  still holds what the source now states.'
target: backend
files:
- path: src/capability-registry/capability-registry.service.ts
  change: raises the identity-keyed miss from a service-level wrapper (readCapabilityByIdentityOrThrow) instead
    of the controller; the raw read still answers a miss as data
- path: src/capability-registry/capability.ts
  change: carries the registration constants the registry service reads (natures, required attributes, schema attributes,
    default timeout)
- path: src/case/author-case-version.service.ts
  change: deleted outright; no replacement file at this path (recorded before in author-case-version-retirement-drift)
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: raises the name-keyed miss from a service-level wrapper (readConnectorConfigurationOrThrow); refuses non-object
    JSON in the well-formedness check
- path: src/errors/status-map.ts
  change: maps ConnectorConfigurationNotWellFormedError to a transport status alongside the not-found classes
- path: src/factories/author-case-version.factory.ts
  change: deleted outright; no replacement file at this path (recorded before in author-case-version-retirement-drift)
- path: src/factories/build-app.factory.ts
  change: wires the identity and name-keyed read routes to the throwing service wrappers
- path: src/fixtures/capability/capability.json
  change: seeds two read-only capabilities for the registry
- path: src/glossary/glossary-store.port.ts
  change: declares insertMissingTerms beside the whole-replace writes
- path: src/glossary/glossary.service.ts
  change: ensures the non-conclusion outcomes through insertMissingTerms rather than a whole replace; answers reads
    of unheld names as data
- path: src/http/build-app.ts
  change: registers the read-capability-by-identity route plugin among the others
- path: src/http/dto/list-connector-configurations.dto.ts
  change: declares the paged query shape of the connector-configuration listing
- path: src/http/dto/read-connector-configuration.dto.ts
  change: declares the wire shape of the connector-configuration read
- path: src/http/read-capability-by-identity.controller.ts
  change: delegates to the throwing wrapper and lets CapabilityIdentityNotFoundError propagate to the status map
- path: src/http/read-capability-by-identity.routes.ts
  change: adds the per-source rate-limit hook ahead of the identity read route
- path: src/http/read-connector-configuration.controller.ts
  change: delegates to the throwing wrapper and lets ConnectorConfigurationNotFoundError propagate to the status
    map
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: resolves capability and connector configuration through the registries and classifies HTTP statuses to
    evidence-result endings
- path: src/persistence/relational-glossary-store.repository.ts
  change: implements insertMissingTerms with INSERT ... ON CONFLICT DO NOTHING
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/no-route-enforces-authentication
  conforms: false
  how: '[src/http/read-capability-by-identity.routes.ts] l.83 `return reply.code(400).send({ error: { code: ''VALIDATION_ERROR'',
    message: ''the request path failed validation'', details: issues } });` — the malformed-path refusal''s status,
    code and message are stated only here while the sibling 404 and 429 are nodes'
  observed_at:
  - src/http/read-capability-by-identity.routes.ts
- node: constraints/the-capability-identity-read-is-rate-limited
  conforms: false
  how: '[src/http/read-capability-by-identity.routes.ts] l.33-36 `A source IP past 60 requests within the same one-minute
    window is answered 429 with a Retry-After value` — what "one caller" means (source address) is stated here and
    not in the node | [src/http/read-capability-by-identity.routes.ts] l.83 `return reply.code(400).send({ error:
    { code: ''VALIDATION_ERROR'', message: ''the request path failed validation'', details: issues } });` — the
    malformed-path refusal''s status, code and message are stated only here while the sibling 404 and 429 are nodes'
  observed_at:
  - src/http/read-capability-by-identity.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: false
  how: '[src/http/read-capability-by-identity.controller.ts] l.31-34 comment `Which transport status the propagated
    CapabilityIdentityNotFoundError becomes is COR-04''s concern, not this specification''s` — the node states the
    404 outright | [src/http/read-capability-by-identity.controller.ts] l.34-37 `a class distinct from ConceptNotAnsweredError,
    ConnectorConfigurationNotFoundError and CapabilityNotRegisteredForTestError` — ConceptNotAnsweredError appears
    in no node | [src/http/read-capability-by-identity.controller.ts] l.35 `CapabilityNotRegisteredForTestError`
    — the test action''s refusal name is stated here and in no node | (cleared in src/capability-registry/capability-registry.service.ts:
    lines 125-131 readCapabilityByIdentityOrThrow: `if (!resolution.held) { throw new CapabilityIdentityNotFoundError(resolution.name,
    resolution.version); }` (the 404 pairing is the route''s))'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/read-capability-by-identity.controller.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean | (cleared in src/connector-registry/connector-configuration-registry.service.ts:
    l.9 `import type { IConnectorConfigurationStore } from ''./connector-configuration-store.port.js'';` and l.38
    constructor over the port) | (cleared in src/glossary/glossary-store.port.ts: l.1-9: `import type { Concept,
    ConceptRegistration, GlossaryTerm, TermVocabulary } from ''./terms.js'';` — `export interface IGlossaryStore
    {` imports no framework, driver or client)'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary-store.port.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: '[src/persistence/relational-glossary-store.repository.ts] header l.13-15 and every method through the one
    injected DatabaseConnection: `readTerms and readConcepts each run a fresh read on every call and answer exactly
    the rows the database currently holds`'
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: false
  how: '[src/factories/build-app.factory.ts] l.139-143 comment `that raw read still answers a miss as ordinary data,
    which is what test-connector''s own resolveTestedCapability needs to raise its own distinct CapabilityNotRegisteredForTestError`
    — the test action''s refusal is given a name no node holds (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    says only "a refusal of its own") | [src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined
    ? { held: false, vocabulary, name } : { held: true, term };` — what a read of an unheld name answers (absence
    as data, not a refusal) is decided here; contracts/glossary/glossary-query says only "exactly as the glossary
    currently holds it" | [src/glossary/glossary.service.ts] l.166-185 comment `never writeTerms''s own whole-replace,
    which would delete every outcome row first and fail the moment any of them ... is permanently referenced by
    a released case version''s fallback_outcome or a released hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/glossary/glossary-store.port.ts: l.31-47
    writeConcepts doc and signature `writeConcepts(concepts: readonly Concept[]): Promise<void>;`) | (cleared in
    src/http/build-app.ts: l.168 `createRegisterConceptRoutesPlugin(dependencies.registerConcept),` and l.132 the
    dependency field) | (cleared in src/persistence/relational-glossary-store.repository.ts: l.170-181 `public async
    writeConcepts(concepts: readonly Concept[]): Promise<void> {` — the store half of register-concept)'
  observed_at:
  - src/factories/build-app.factory.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/http/build-app.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-query
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states'
  observed_at:
  - src/glossary/glossary.service.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: '[src/capability-registry/capability-registry.service.ts] l.95-98 comment `Not part of the published capability-registry
    contract (contracts/integration/capability-registry names only read-capability, by concept, and list-capabilities)`
    — the node as it stands publishes four operations including read-capability-by-identity | [src/factories/build-app.factory.ts]
    l.139-143 comment `that raw read still answers a miss as ordinary data, which is what test-connector''s own
    resolveTestedCapability needs to raise its own distinct CapabilityNotRegisteredForTestError` — the test action''s
    refusal is given a name no node holds (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    says only "a refusal of its own") | [src/http/read-capability-by-identity.controller.ts] l.10-16 comment `readCapabilityByIdentityOrThrow
    is not part of that contract (contracts/integration/capability-registry names read-capability, by concept, list-capabilities
    and register-capability; this operation is published as this route''s own fourth operation` — the node publishes
    read-capability-by-identity among its four operations | [src/http/read-capability-by-identity.controller.ts]
    l.34-37 `a class distinct from ConceptNotAnsweredError, ConnectorConfigurationNotFoundError and CapabilityNotRegisteredForTestError`
    — ConceptNotAnsweredError appears in no node | [src/http/read-capability-by-identity.controller.ts] l.35 `CapabilityNotRegisteredForTestError`
    — the test action''s refusal name is stated here and in no node | [src/http/read-capability-by-identity.routes.ts]
    l.83 `return reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request path failed
    validation'', details: issues } });` — the malformed-path refusal''s status, code and message are stated only
    here while the sibling 404 and 429 are nodes | (cleared in src/http/build-app.ts: l.146-151 `createReadCapabilityRoutesPlugin(...)`,
    `createReadCapabilityByIdentityRoutesPlugin(...)`, `createListCapabilitiesRoutesPlugin(...)`, `createRegisterCapabilityRoutesPlugin(...)`)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/read-capability-by-identity.controller.ts
  - src/http/read-capability-by-identity.routes.ts
- node: contracts/integration/concept-observation
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.116-129 listConnectorConfigurations
    `held.slice(pagination.offset, pagination.offset + pagination.limit)` and l.150-152 `return limit > 0 ? Math.ceil(total
    / limit) : 0;` — the contract says the list answers "every one currently registered"; no node mentions pagination
    or what a non-positive limit answers | [src/factories/build-app.factory.ts] l.139-143 comment `that raw read
    still answers a miss as ordinary data, which is what test-connector''s own resolveTestedCapability needs to
    raise its own distinct CapabilityNotRegisteredForTestError` — the test action''s refusal is given a name no
    node holds (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability says only
    "a refusal of its own") | [src/http/dto/list-connector-configurations.dto.ts] l.47-50 `offset: z.coerce.number().int().nonnegative().optional(),
    limit: z.coerce.number().int().positive().optional(),` — the node says the list answers "every one currently
    registered"; that it is paged lives only in this file and its sibling | [src/http/dto/list-connector-configurations.dto.ts]
    l.11-13/48-49: a negative offset or non-positive limit is refused, attributed to standard rule EDG-01 — a refusal''s
    conditions no node states | (cleared in src/http/dto/read-connector-configuration.dto.ts: l.40 `readConnectorConfigurationParamsSchema
    = z.object({ connector: z.string().min(1) })` and l.53 `readConnectorConfigurationResponseSchema`) | (cleared
    in src/http/read-connector-configuration.controller.ts: l.77-83 `handleReadConnectorConfigurationRequest(...)
    { const configuration = await dependencies.readConnectorConfiguration(params.connector);`)'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/dto/list-connector-configurations.dto.ts
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
- node: contracts/integration/corporate-records-source
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/knowledge/capability-check
  conforms: false
  how: src/factories/author-case-version.factory.ts, the file this node is bound to, does not exist at this path
    — there is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded
    once before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/factories/author-case-version.factory.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: false
  how: src/factories/author-case-version.factory.ts, the file this node is bound to, does not exist at this path
    — there is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded
    once before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/factories/author-case-version.factory.ts
- node: contracts/system/case-authoring
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this path — there
    is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded once
    before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/case/author-case-version.service.ts
- node: contracts/system/corporate-records
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/action
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    VOCABULARY_TABLES l.90 `action: ''public.actions'',` and insertTermStatement l.186)'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/glossary/glossary-store.port.ts: l.28-29
    and 47: `readConcepts(): Promise<readonly ConceptRegistration[]>;` / `writeConcepts(...)` over the Concept types)
    | (cleared in src/persistence/relational-glossary-store.repository.ts: IConceptRow l.74-77, insertConceptStatement
    l.196 `INSERT INTO ${CONCEPTS_TABLE} (name, ttl) VALUES ($1, $2)`, accepts l.200-228)'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    VOCABULARY_TABLES l.89 `outcome: ''public.outcomes'',`)'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    VOCABULARY_TABLES l.91 `recipient: ''public.recipients'',`)'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    VOCABULARY_TABLES l.88 `''subject-attribute'': ''public.subject_attributes'',`)'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    VOCABULARY_TABLES l.87 `''subject-type'': ''public.subject_types'',`)'
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/integration/capability
  conforms: false
  how: '[src/capability-registry/capability.ts] l.72-80 `REQUIRED_REGISTRATION_ATTRIBUTES = [''name'',''version'',''nature'',''input_schema'',''output_schema'',''connector'',''concept'']`
    — the node''s `required: true` attributes enumerated again as their own authority | [src/fixtures/capability/capability.json]
    l.7/17 `"output_schema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}"` and `...{\"active\":{\"type\":\"boolean\"}}`
    — the fields a citation may name over these concepts are stated only here | [src/fixtures/capability/capability.json]
    l.8/18 `"timeout": 5000,` — a five-second per-call budget the specification states nowhere (it holds sixty seconds
    default and the seven-second collection budget) | [src/fixtures/capability/capability.json] l.10/20 `"concept":
    "equipment-status"` / `"network-outage-flag"` — which concepts hold a registered capability lives only here;
    the specification''s scenarios speak of `equipment-state`, and `network-outage-flag` appears in no node | [src/http/read-capability-by-identity.controller.ts]
    l.34-37 `a class distinct from ConceptNotAnsweredError, ConnectorConfigurationNotFoundError and CapabilityNotRegisteredForTestError`
    — ConceptNotAnsweredError appears in no node | [src/http/read-capability-by-identity.controller.ts] l.35 `CapabilityNotRegisteredForTestError`
    — the test action''s refusal name is stated here and in no node | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult = ''unavailable'';` and l.215 `return isEvidenceResult(mapped)
    ? mapped : DEFAULT_STATUS_ENDING;` — which ending an unclassified HTTP status resolves to is decided here; the
    file''s own comment says no node states a default | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);` / `throw new ConnectorConfigurationNotRegisteredError(connector);`
    — what observe-concept answers when capability or connector configuration cannot be resolved is a thrown fault
    no node states | [src/investigation/http-declarative-observation-source.adapter.ts] l.280-292 httpConfigurationProblems:
    `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is not a plain object of string values`
    / `statusMap is not a plain object mapping a status to ...` — required keys of an HTTP connector configuration,
    refused at call time, while domain/integration/connector-configuration says deliberately it never states what
    the object''s keys mean | (cleared in src/capability-registry/capability-registry.service.ts: lines 181-190
    heldCapability: `name: registration.name, version: registration.version, nature: registration.nature, input_schema...,
    output_schema..., timeout: registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS, connector..., concept...`
    and sameIdentity l.268-270)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/fixtures/capability/capability.json
  - src/http/read-capability-by-identity.controller.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability-nature
  conforms: false
  how: '[src/capability-registry/capability.ts] l.11 `export const CAPABILITY_NATURES = [''read-only'', ''mutating'']
    as const;` — the enumeration copied into a constant nothing reads from the node, a second home | [src/fixtures/capability/capability.json]
    l.7/17 `"output_schema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}"` and `...{\"active\":{\"type\":\"boolean\"}}`
    — the fields a citation may name over these concepts are stated only here | [src/fixtures/capability/capability.json]
    l.8/18 `"timeout": 5000,` — a five-second per-call budget the specification states nowhere (it holds sixty seconds
    default and the seven-second collection budget) | [src/fixtures/capability/capability.json] l.10/20 `"concept":
    "equipment-status"` / `"network-outage-flag"` — which concepts hold a registered capability lives only here;
    the specification''s scenarios speak of `equipment-state`, and `network-outage-flag` appears in no node'
  observed_at:
  - src/capability-registry/capability.ts
  - src/fixtures/capability/capability.json
- node: domain/integration/capability-registry
  conforms: false
  how: '[src/capability-registry/capability-registry.service.ts] l.83-85 `if (answers.length > 1) { throw new DuplicateConceptAnswerError(concept,
    answers); }` — what a concept read answers over a holding with two capabilities for one concept is decided here;
    the node says only "resolve each concept to exactly one capability" | [src/capability-registry/capability-registry.service.ts]
    l.281-286 `if (answering !== undefined) { throw new ConceptAlreadyAnsweredError(registering.concept, answering,
    registering); }` — a fourth refusal of register-capability the node''s Responsibility (three refusals) does
    not name'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.155-158 `readonly configuration:
    Readonly<Record<string, unknown>>;` and l.194-208 `if (typeof configuration !== ''string'') { return configuration;
    } ... parsed = JSON.parse(configuration); ... return parsed;` — the node declares `configuration` of `type:
    string`; the service holds a parsed object and admits one that was never text | [src/connector-registry/connector-configuration-registry.service.ts]
    l.219-243 `throw new IncompleteConnectorConfigurationError(problems)` / `problems.push(''connector is undeclared'')`
    / `return value === undefined || value === '''';` — a second refusal of register-connector (no connector, empty
    counts as none) no node states | (cleared in src/http/dto/read-connector-configuration.dto.ts: l.53-56 `z.object({
    connector: z.string().min(1), configuration: z.string().min(1) })` — two attributes, configuration as the string
    the node declares) | (cleared in src/http/read-connector-configuration.controller.ts: l.105-108 `return { connector:
    configuration.connector, configuration: JSON.stringify(configuration.configuration) };`)'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: '[src/factories/build-app.factory.ts] l.139-143 comment `that raw read still answers a miss as ordinary data,
    which is what test-connector''s own resolveTestedCapability needs to raise its own distinct CapabilityNotRegisteredForTestError`
    — the test action''s refusal is given a name no node holds (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    says only "a refusal of its own") | (cleared in src/connector-registry/connector-configuration-registry.service.ts:
    l.50-58 registerConnector) | (cleared in src/http/build-app.ts: l.169 `createRegisterConnectorRoutesPlugin(dependencies.registerConnector),`
    — wiring only; the node''s Responsibility is applied elsewhere)'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.289 `''statusMap is not a plain object mapping a status to one of ok, unavailable, denied, timeout''` — the
    four values enumerated a second time as text beside a check that reads them from EVIDENCE_RESULTS'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: false
  how: '[src/glossary/glossary-store.port.ts] l.16-26 doc `Adds to one term vocabulary''s persisted records exactly
    the given terms that are not already held, and touches nothing else: no already-held row is deleted or rewritten
    ... (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)` — that ensuring the outcomes never
    removes or rewrites a held one is stated here, citing a plan task, and in no node | [src/glossary/glossary.service.ts]
    l.93-97/105-109 `return term === undefined ? { held: false, vocabulary, name } : { held: true, term };` — what
    a read of an unheld name answers (absence as data, not a refusal) is decided here; contracts/glossary/glossary-query
    says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts] l.166-185 comment
    `never writeTerms''s own whole-replace, which would delete every outcome row first and fail the moment any of
    them ... is permanently referenced by a released case version''s fallback_outcome or a released hypothesis revision''s
    resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)` — the never-remove-a-held-outcome
    rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts] l.206-214
    assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on a vocabulary
    holding one name twice that no node states | (cleared in src/persistence/relational-glossary-store.repository.ts:
    nowhere — insertMissingTerms l.143-150 (`INSERT ... ON CONFLICT DO NOTHING`) is the mechanism; the file names
    neither outcome and states nothing about when they must exist)'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: '[src/capability-registry/capability-registry.service.ts] l.218-221 `function isUndeclared(value) { return
    value === undefined || value === ''''; }` — that an empty attribute counts as undeclared and is refused is stated
    here and in no node | [src/capability-registry/capability.ts] l.64 `export const DEFAULT_CAPABILITY_TIMEOUT_MS
    = 60_000;` — the sixty-second default re-derived into a literal'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: false
  how: '[src/capability-registry/capability.ts] l.88 `export const SCHEMA_ATTRIBUTES = [''input_schema'', ''output_schema'']
    as const;` — which attributes are held to JSON syntax restated in a constant | (cleared in src/capability-registry/capability-registry.service.ts:
    lines 229-244: `SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]))` → `throw
    new CapabilitySchemaNotWellFormedError(malformed)`)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: '[src/capability-registry/capability.ts] l.17 `export const READ_ONLY_NATURE = ''read-only'' satisfies CapabilityNature;`
    — the registering nature restated as a constant | (cleared in src/capability-registry/capability-registry.service.ts:
    lines 178-180: `if (registration.nature !== READ_ONLY_NATURE) { throw new CapabilityNotReadOnlyError(registration.nature);
    }`)'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts] l.199-206 `throw new ConnectorConfigurationNotWellFormedError(''configuration
    is not syntactically valid JSON'')` / `(''configuration does not parse to a JSON object'')` — the rule names
    no error value or message; its sibling read rule does | [src/errors/status-map.ts] l.102 `[ConnectorConfigurationNotWellFormedError,
    422]` — the node says only that the registry refuses a configuration that is not valid JSON object text; no
    node holds 422 or the error name, while the two sibling 404 refusals carry both in their nodes'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: false
  how: '[src/factories/build-app.factory.ts] l.139-143 comment `that raw read still answers a miss as ordinary data,
    which is what test-connector''s own resolveTestedCapability needs to raise its own distinct CapabilityNotRegisteredForTestError`
    — the test action''s refusal is given a name no node holds (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    says only "a refusal of its own") | [src/http/read-connector-configuration.controller.ts] l.33-38 comment `Which
    transport status the propagated ConnectorConfigurationNotFoundError becomes is COR-04''s concern, not this specification''s:
    the shared status map (src/errors/status-map.ts) resolves it` — the node states "refused with an HTTP 404 response
    reporting a ConnectorConfigurationNotFoundError" outright | (cleared in src/connector-registry/connector-configuration-registry.service.ts:
    l.90-96 readConnectorConfigurationOrThrow: `if (!resolution.held) { throw new ConnectorConfigurationNotFoundError(resolution.connector);
    }` (the HTTP 404 half sits in no construct of this file))'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
  - src/http/read-connector-configuration.controller.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] lines 82-85 (`const answers = held.filter((candidate)
    => candidate.concept === concept); if (answers.length > 1) {`) and lines 281-286 refuseAnsweredConcept'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: false
  how: '[src/glossary/glossary.service.ts] l.93-97/105-109 `return term === undefined ? { held: false, vocabulary,
    name } : { held: true, term };` — what a read of an unheld name answers (absence as data, not a refusal) is
    decided here; contracts/glossary/glossary-query says only "exactly as the glossary currently holds it" | [src/glossary/glossary.service.ts]
    l.166-185 comment `never writeTerms''s own whole-replace, which would delete every outcome row first and fail
    the moment any of them ... is permanently referenced by a released case version''s fallback_outcome or a released
    hypothesis revision''s resolution_outcome (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
    — the never-remove-a-held-outcome rule and the permanence of a referenced outcome are held by no node | [src/glossary/glossary.service.ts]
    l.206-214 assertUniqueNames `throw new DuplicateGlossaryNameError(vocabulary, record.name);` — a refusal on
    a vocabulary holding one name twice that no node states'
  observed_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: false
  how: '[src/fixtures/capability/capability.json] l.7/17 `"output_schema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}"`
    and `...{\"active\":{\"type\":\"boolean\"}}` — the fields a citation may name over these concepts are stated
    only here | [src/fixtures/capability/capability.json] l.8/18 `"timeout": 5000,` — a five-second per-call budget
    the specification states nowhere (it holds sixty seconds default and the seven-second collection budget) | [src/fixtures/capability/capability.json]
    l.10/20 `"concept": "equipment-status"` / `"network-outage-flag"` — which concepts hold a registered capability
    lives only here; the specification''s scenarios speak of `equipment-state`, and `network-outage-flag` appears
    in no node'
  observed_at:
  - src/fixtures/capability/capability.json
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this path — there
    is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded once
    before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/case/author-case-version.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this path — there
    is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded once
    before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/case/author-case-version.service.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: false
  how: '[src/investigation/http-declarative-observation-source.adapter.ts] l.80 `const DEFAULT_STATUS_ENDING: EvidenceResult
    = ''unavailable'';` and l.215 `return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;` — which ending
    an unclassified HTTP status resolves to is decided here; the file''s own comment says no node states a default
    | [src/investigation/http-declarative-observation-source.adapter.ts] l.142-162 `throw new CapabilityNotResolvedForObservationError(concept);`
    / `throw new ConnectorConfigurationNotRegisteredError(connector);` — what observe-concept answers when capability
    or connector configuration cannot be resolved is a thrown fault no node states | [src/investigation/http-declarative-observation-source.adapter.ts]
    l.280-292 httpConfigurationProblems: `method is not one of GET, POST, PUT, PATCH, DELETE` / `responseMap is
    not a plain object of string values` / `statusMap is not a plain object mapping a status to ...` — required
    keys of an HTTP connector configuration, refused at call time, while domain/integration/connector-configuration
    says deliberately it never states what the object''s keys mean'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this path — there
    is no source left to hold to the node, so this binding cannot be reaffirmed; the deletion was recorded once
    before in siegard-reconcile/author-case-version-retirement-drift.md
  observed_at:
  - src/case/author-case-version.service.ts
notes: 'Judgment shape: sixteen specification-conformance-reviewer delegations, one per existing file, each handed
  its one file, the nodes the trace binds to it, and every other node of the set as candidates; the two deleted
  files were handed to no judge, since a judge cannot read a file that is not there, and their nodes are refused
  here as they were in author-case-version-retirement-drift. Folding: a node conforms only where every delegation
  that read one of its files cleared it; a finding naming a node landed on that node wherever its own judge stood
  (five candidate-tier findings did so: from capability.ts onto a-capability-is-read-only and a-capability-declares-well-formed-schemas,
  from connector-configuration-registry.service.ts onto contracts/integration/connector-configuration-registry,
  from the adapter onto domain/investigation/evidence-result); a finding naming no node landed on every node of
  its file, which is what refuses whole the nodes of glossary.service.ts, capability.json, build-app.factory.ts
  and the observation adapter. Findings that name a node no file of this set is bound to, and so have no entry above:
  CapabilityNotRegisteredForTestError (build-app.factory.ts l.139-143, read-capability-by-identity.controller.ts
  l.35) names the refusal rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  leaves unnamed; ConceptNotAnsweredError (read-capability-by-identity.controller.ts l.34-37) names a refusal no
  node holds. Recurring shape across the findings: refusals, statuses, error names, pagination and defaults the
  source states and no node holds; three comments (capability-registry.service.ts l.95-98, read-capability-by-identity.controller.ts
  l.10-16 and l.31-34, read-connector-configuration.controller.ts l.33-38) state the contract or the 404 pairing
  from an earlier reading than the nodes as they stand. Also outstanding and untouched by this record: the one moved
  finding on rules/integration/a-connector-configuration-is-tested-through-a-registered-capability, healed when
  that node''s task is next delivered.'
---
