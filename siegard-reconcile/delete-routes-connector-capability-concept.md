---
contract_version: siegard-reconcile/5
title: Delete routes for connector, capability and concept — review
summary: 11 tasks delivered under the /plan-work initiative delete-routes-connector-capability-concept,
  each via /implement-task's two-producer split, adding DELETE routes and their supporting store/service/reader
  layers for connector-configuration, capability and concept removal.
target: backend
files:
- path: src/capability-registry/capability-registry.service.ts
  change: Adds a defaulted third constructor dependency (evidenceUsageReader) and public async removeCapability(name,
    version) that checks isCapabilityNamedByEvidence first, throws CapabilityCitedByEvidenceError when
    cited, and otherwise calls store.deleteCapability unconditionally.
- path: src/capability-registry/capability-store.port.ts
  change: Adds deleteCapability(name, version) -> Promise<void> to ICapabilityStore, alongside the unchanged
    readCapabilities/writeCapabilities signatures.
- path: src/capability-registry/evidence-usage-reader.port.ts
  change: New port file declaring CapabilityIdentityForEvidenceUsageCheck (name+version identity) and
    IEvidenceUsageReader, whose isCapabilityNamedByEvidence(identity) answers whether collected evidence
    names that identity. No imports.
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: 'Adds a public removeConnector(connector: string): Promise<void> method that awaits this.store.deleteConnectorConfiguration(connector)
    and does nothing else.'
- path: src/connector-registry/connector-configuration-store.port.ts
  change: Declares deleteConnectorConfiguration(connector) -> Promise<void> on IConnectorConfigurationStore,
    alongside the existing read and write methods.
- path: src/errors/capability-cited-by-evidence.error.ts
  change: New domain error class CapabilityCitedByEvidenceError, modeled on ManifestWouldHoldNoHypothesisError's
    shape — extends Error, sets this.name, carries a readonly typed context ({ name, version }).
- path: src/errors/concept-in-use.error.ts
  change: New file. Declares ConceptInUseError, a typed domain error carrying { concept, reference } context,
    where reference is the ConceptUsageReference (capability | evidence | citation | hypothesis-revision-collects)
    that caused the refusal; message text names which kind of reference blocked the removal.
- path: src/errors/status-map.ts
  change: Imports ConceptInUseError and adds it to STATUS_BY_ERROR_CLASS mapped to 409, alongside the
    existing 409 entries.
- path: src/factories/build-app.factory.ts
  change: Imports and wires createConceptUsageReader(connection, capabilityRegistry), adding conceptUsageReader
    to ComposedResources beside evidenceUsageReader/capabilitiesReader.
- path: src/factories/concept-usage-reader.factory.ts
  change: 'New factory exposing createConceptUsageReader(connection, capabilityQuery), checking in order:
    capability answers it, evidence names it, citation names it, unmanifested hypothesis-revision collects
    it, or none.'
- path: src/factories/glossary.factory.ts
  change: 'createGlossary(connection, conceptUsageReader) now takes a second, defaulted parameter (IConceptUsageReader,
    defaulting to a module-level NO_CONCEPT_NAMED constant resolving { named: false }) and passes it to
    GlossaryService''s constructor, so a caller that supplies the real reader gets a glossary whose removeConcept
    actually refuses; createGlossaryQuery and every existing single-argument call site keep compiling
    and behaving as before.'
- path: src/factories/investigation-store.factory.ts
  change: New exported factory function createEvidenceUsageReader(connection), instantiating RelationalInvestigationStore
    and adapting its new method into an IEvidenceUsageReader.
- path: src/glossary/concept-usage-reader.port.ts
  change: New port declaring IConceptUsageReader, ConceptUsageResolution and ConceptUsageReference; no
    import statement at all.
- path: src/glossary/glossary-store.port.ts
  change: 'Adds deleteConcept(name: string): Promise<void> to IGlossaryStore, alongside the existing readConcepts/writeConcepts,
    keyed by the concept''s one identity, its name.'
- path: src/glossary/glossary.service.ts
  change: 'GlossaryService now takes a third, defaulted constructor parameter conceptUsageReader (IConceptUsageReader,
    defaulting to a NO_CONCEPT_NAMED stub resolving { named: false }), and exposes removeConcept(name),
    which awaits conceptUsageReader.readConceptUsage(name), throws ConceptInUseError(name, reference)
    when it resolves named:true, and otherwise calls store.deleteConcept(name) unconditionally.'
- path: src/http/build-app.ts
  change: Imports RemoveConnectorControllerDependencies/createRemoveConnectorRoutesPlugin, adds removeConnector
    to BuildAppDependencies, appends the new route's plugin factory to routePluginFactories.
- path: src/http/dto/remove-capability.dto.ts
  change: New file. Declares removeCapabilityParamsSchema (name, version as zod string().min(1), mirroring
    read-capability-by-identity.dto.ts's own params schema) and its inferred RemoveCapabilityParamsDto
    type.
- path: src/http/dto/remove-concept.dto.ts
  change: New file. Declares removeConceptParamsSchema (name as zod string().min(1), mirroring register-concept.dto.ts's
    own params schema) and its inferred RemoveConceptParamsDto type.
- path: src/http/dto/remove-connector.dto.ts
  change: New file. Declares removeConnectorParamsSchema and the RemoveConnectorParamsDto type, mirroring
    remove-hypothesis.dto.ts's path-only DTO shape.
- path: src/http/remove-capability.controller.ts
  change: New file. Declares RemoveCapabilityControllerDependencies with a removeCapability(name, version)
    function and handleRemoveCapabilityRequest, which awaits it and returns nothing, raising nothing of
    its own — whatever the dependency throws propagates unchanged.
- path: src/http/remove-capability.routes.ts
  change: New file. Registers app.delete('/v1/capabilities/:name/:version', ...); safeParse's the path
    against removeCapabilityParamsSchema, answering 400 VALIDATION_ERROR with issue details on failure;
    on success calls handleRemoveCapabilityRequest and answers reply.code(204).send() with no body. No
    hook, guard or middleware is added.
- path: src/http/remove-concept.controller.ts
  change: New file. Declares RemoveConceptControllerDependencies with a removeConcept(name) function (typed
    as GlossaryService['removeConcept']) and handleRemoveConceptRequest, which awaits it and returns nothing,
    raising nothing of its own — whatever the dependency throws propagates unchanged.
- path: src/http/remove-concept.routes.ts
  change: New file. Registers app.delete('/v1/glossary/concepts/:name', ...); safeParse's the path against
    removeConceptParamsSchema, answering 400 VALIDATION_ERROR with issue details on failure; on success
    calls handleRemoveConceptRequest and answers reply.code(204).send() with no body. No hook, guard or
    middleware is added.
- path: src/http/remove-connector.controller.ts
  change: New file. Declares RemoveConnectorControllerDependencies and handleRemoveConnectorRequest, which
    awaits dependencies.removeConnector(params.connector) with no try/catch.
- path: src/http/remove-connector.routes.ts
  change: New file. Registers app.delete('/v1/connectors/:connector', ...), safe-parses request.params,
    answers 400 VALIDATION_ERROR on malformed input, otherwise answers reply.code(204).send().
- path: src/persistence/relational-capability-store.repository.ts
  change: Adds RelationalCapabilityStore.deleteCapability, which runs a literal DELETE FROM capabilities
    WHERE name = $1 AND version = $2 inside runInTransaction, and the deleteStatementFor helper; reuses
    the existing raiseWriteFailure for the failure path.
- path: src/persistence/relational-case-store.repository.ts
  change: Adds isConceptCollectedByUnmanifestedHypothesisRevision(concept), finding a hypothesis_revision_collects
    row for the concept whose (case_slug, hypothesis_name, revision) has no matching case_version_hypotheses
    row.
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: Implements deleteConnectorConfiguration by running a parameterized DELETE FROM connector_configurations
    WHERE connector = $1 inside runInTransaction, mapping any driver failure through the existing raiseWriteFailure
    -> ConnectorConfigurationStoreError path; writeConnectorConfigurations and readConnectorConfigurations
    are unchanged.
- path: src/persistence/relational-glossary-store.repository.ts
  change: Adds RelationalGlossaryStore.deleteConcept(name), which runs inside runInTransaction and issues
    deleteConceptAcceptsStatement(name) followed by a new deleteConceptStatement(name), children before
    parent, matching the concept_accepts foreign key with no ON DELETE CASCADE.
- path: src/persistence/relational-investigation-store.repository.ts
  change: Adds isConceptNamedByEvidence(concept) against investigation_evidence and isConceptNamedByCitation(concept)
    against investigation_evaluation_citations.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at function assembleWholeVersion(tx,
    key) — reads versionRow, then readManifest(tx, key), both

    inside the one transaction assembleVersion opens — return runInTransaction(this.connection, raiseReadFailure,
    (tx) => assembleWholeVersion(tx, { slug, version }));'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/status-map.ts, and src/http/remove-capability.controller.ts
    read `nowhere` — await dependencies.removeCapability(params.name, params.version); — the handler has
    no try/catch and performs no error-to-status mapping of its own.; src/http/remove-concept.controller.ts
    read `nowhere` — await dependencies.removeConcept(params.name); — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/errors/status-map.ts
  - src/http/remove-capability.controller.ts
  - src/http/remove-concept.controller.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: "src/http/dto/remove-connector.dto.ts: held at the params schema declaring the route's shape, whose\
    \ failure a validation layer turns into the 400 refusal — export const removeConnectorParamsSchema\
    \ = z.object({\n  connector: z.string().min(1),\n});\n\nsrc/http/remove-capability.routes.ts: held\
    \ at the 400 branch of removeCapabilityHandler, lines 21-24 — const issues = parsedParams.error.issues.map((issue)\
    \ => `${issue.path.join('.')}: ${issue.message}`); return reply.code(400).send({ error: { code: 'VALIDATION_ERROR',\
    \ message: 'the request path failed validation', details: issues } });\nsrc/http/remove-concept.routes.ts:\
    \ held at the `if (!parsedParams.success)` branch of removeConceptHandler — return reply.code(400).send({\
    \ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues\
    \ } });\nsrc/http/remove-connector.routes.ts: held at the 400 branch of removeConnectorHandler — return\
    \ reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation',\
    \ details: issues } });"
  encoded_at:
  - src/http/dto/remove-connector.dto.ts
  - src/http/remove-capability.routes.ts
  - src/http/remove-concept.routes.ts
  - src/http/remove-connector.routes.ts
- node: constraints/a-successful-capability-removal-answers-with-no-content
  conforms: true
  how: 'src/http/remove-capability.routes.ts: held at the return statement of removeCapabilityHandler,
    line 26 — return reply.code(204).send();'
  encoded_at:
  - src/http/remove-capability.routes.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two inputs against one expected result, run against the real remove-capability path
    rather than a stub: first a DELETE at the name and version of a capability that is registered and
    that no collected evidence item names, then a DELETE at a name and version no capability is currently
    registered at — each asserted to answer HTTP 204 with a wholly empty body, and the two answers asserted
    indistinguishable, so nothing in the response tells the removal apart from the absence.'
- node: constraints/a-successful-concept-removal-answers-with-no-content
  conforms: true
  how: 'src/http/remove-concept.routes.ts: held at the final statement of removeConceptHandler — return
    reply.code(204).send();'
  encoded_at:
  - src/http/remove-concept.routes.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/http/remove-concept.routes.spec.ts
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  conforms: true
  how: 'src/http/remove-connector.routes.ts: held at the unconditional return after awaiting handleRemoveConnectorRequest
    — await handleRemoveConnectorRequest(dependencies, parsedParams.data); return reply.code(204).send();'
  encoded_at:
  - src/http/remove-connector.routes.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One test at the node''s stated integration scope, over the real removal path rather
    than a mock: register a connector configuration, issue DELETE /v1/connectors/:connector for its name,
    then issue DELETE for a name nothing is registered under (the just-removed name serves), and assert
    each of the two answers is HTTP 204 with a wholly empty body — the same status and the same absent
    body, with nothing in either answer telling the two apart.'
- node: constraints/listings-are-paged
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at listCapabilities() — const total\
    \ = held.length; const data = held.slice(pagination.offset, pagination.offset + pagination.limit);\
    \ return { data, total, limit: pagination.limit, offset: pagination.offset, pageCount: pageCountOf(total,\
    \ pagination.limit) };\nsrc/connector-registry/connector-configuration-registry.service.ts: held at\
    \ the return statement of listConnectorConfigurations(), lines 66-72 — return {\n  data,\n  total,\n\
    \  limit: pagination.limit,\n  offset: pagination.offset,\n  pageCount: pageCountOf(total, pagination.limit),\n\
    };\n\nsrc/glossary/glossary.service.ts: held at listVocabularyTerms and listConcepts, which page the\
    \ full held set by offset and limit and report total, offset, limit and page count. — public async\
    \ listConcepts(pagination: PaginationRequest): Promise<PaginatedResponse<Concept>> {\n    const held\
    \ = await this.concepts();\n    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);\n\
    \    return {\n      data,\n      total: held.length,\n      limit: pagination.limit,\n      offset:\
    \ pagination.offset,\n      pageCount: pageCountOf(held.length, pagination.limit),\n    };\n  }"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary.service.ts
- node: constraints/no-route-enforces-authentication
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/remove-capability.routes.ts, src/http/remove-concept.routes.ts,
    src/http/remove-connector.controller.ts, src/http/remove-connector.routes.ts, and src/http/dto/remove-connector.dto.ts
    read `nowhere` — import { z } from ''zod''; — a binding asserts the file answers for the node, so
    the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/remove-connector.dto.ts
  - src/http/remove-capability.routes.ts
  - src/http/remove-concept.routes.ts
  - src/http/remove-connector.controller.ts
  - src/http/remove-connector.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at readCapabilityByIdentityOrThrow()\
    \ — const resolution = await this.readCapabilityByIdentity(name, version); if (!resolution.held) {\n\
    \  throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);\n}\nsrc/errors/status-map.ts:\
    \ held at the CapabilityIdentityNotFoundError entry of STATUS_BY_ERROR_CLASS — [CapabilityIdentityNotFoundError,\
    \ 404],"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/capability-registry/evidence-usage-reader.port.ts: held at the whole file — a port interface\
    \ and its identity type, carrying no import statement at all — export type CapabilityIdentityForEvidenceUsageCheck\
    \ = {\n  readonly name: string;\n  readonly version: string;\n};\n\nexport interface IEvidenceUsageReader\
    \ {\n\n  isCapabilityNamedByEvidence(identity: CapabilityIdentityForEvidenceUsageCheck): Promise<boolean>;\n\
    }\nsrc/connector-registry/connector-configuration-registry.service.ts: held at the file's own import\
    \ list, lines 1-15 — every import is an own-domain error, an own type, or a port interface — import\
    \ { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';\n\
    import { ConnectorConfigurationNotWellFormedError } from '../errors/connector-configuration-not-well-formed.error.js';\n\
    import type { IConnectorConfigurationStore } from './connector-configuration-store.port.js';\n\nsrc/connector-registry/connector-configuration-store.port.ts:\
    \ held at the port's own declaration — its only import is the domain type and every method signature\
    \ returns a Promise of that domain type or void, with no framework, driver or client import anywhere\
    \ in the file. — import type { ConnectorConfiguration } from './connector-configuration.js';\n\nexport\
    \ interface IConnectorConfigurationStore {\nsrc/factories/build-app.factory.ts: held at composeResources,\
    \ which threads one shared DatabaseConnection into every store/service factory rather than letting\
    \ a domain service reach out to infrastructure itself. — const capabilitiesReader = createCapabilitiesReader(connection);\n\
    \  const capabilityRegistry = createCapabilityRegistry(connection, createConnectorConfigurationsReader(connection));\n\
    \  const connectorConfigurationRegistry = createConnectorConfigurationRegistry(connection, capabilitiesReader);\n\
    src/factories/concept-usage-reader.factory.ts: held at createConceptUsageReader, which builds the\
    \ concrete persistence classes internally and exposes only the IConceptUsageReader port shape to its\
    \ caller — export function createConceptUsageReader(\n  connection: DatabaseConnection,\n  capabilityQuery:\
    \ ICapabilityQuery,\n): IConceptUsageReader {\n  const sources: ConceptUsageSources = {\n    capabilityQuery,\n\
    \    investigationStore: new RelationalInvestigationStore(connection),\n    caseStore: new RelationalCaseStore(connection),\n\
    \  };\n  return { readConceptUsage: (concept) => resolveConceptUsage(concept, sources) };\n}\nsrc/factories/investigation-store.factory.ts:\
    \ held at the exported factory functions' return types, which hide the concrete relational implementation\
    \ behind the domain's own ports — export function createInvestigationStore(connection: DatabaseConnection):\
    \ IInvestigationStore {\n  return new RelationalInvestigationStore(connection);\n}\nsrc/glossary/concept-usage-reader.port.ts:\
    \ held at the interface IConceptUsageReader — a pure port declared with no import of any framework,\
    \ driver or provider client, so infrastructure can reach the domain's concept-in-use check only by\
    \ implementing it. — export interface IConceptUsageReader {\n\n  readConceptUsage(concept: string):\
    \ Promise<ConceptUsageResolution>;\n}\n\nsrc/glossary/glossary-store.port.ts: held at the interface\
    \ declaration itself — the only import is a domain type import, and the interface carries no framework,\
    \ driver or provider client reference. — import type { Concept, ConceptRegistration, GlossaryTerm,\
    \ TermVocabulary } from './terms.js';\n\nexport interface IGlossaryStore {\n\nsrc/persistence/relational-connector-configuration-store.repository.ts:\
    \ held at the class declaration, which realizes the domain-declared port rather than being reached\
    \ into by it — the domain layer itself carries none of this file's infrastructure imports — export\
    \ class RelationalConnectorConfigurationStore implements IConnectorConfigurationStore {"
  encoded_at:
  - src/capability-registry/evidence-usage-reader.port.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/factories/build-app.factory.ts
  - src/factories/concept-usage-reader.factory.ts
  - src/factories/investigation-store.factory.ts
  - src/glossary/concept-usage-reader.port.ts
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at draftConnectorConfigurationFromOpenApiDependencies,
    readOpenApiDocumentOperationsDependencies and draftCapabilitySchemaFromOpenApiDependencies, each instantiating
    the fetcher server-side. — documentFetcher: new OpenApiDocumentFetcher(),'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: "src/persistence/relational-capability-store.repository.ts: held at the ICapabilityRow interface\
    \ and the column lists of the SELECT and upsert statements, which enumerate exactly the nine attributes\
    \ domain/integration/capability declares — SELECT name, version, nature, input_schema, output_schema,\
    \ timeout, connector, concept, payload_notes\n       FROM ${CAPABILITIES_TABLE}\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at the row interfaces and the INSERT/SELECT column lists, each column paired one-to-one with\
    \ a declared domain attribute — INSERT INTO ${INVESTIGATIONS_TABLE}\n    (id, requester, ticket_ref,\
    \ narrative, subject_type, prompt_version, model,\n     pinned_case_slug, pinned_case_version, assessment_outcome,\
    \ assessment_action, assessment_recipient,\n     assessment_determining_hypothesis, assessment_text,\
    \ assessment_register, assessment_usage_input_tokens,\n     assessment_usage_output_tokens, assessment_elapsed_ms,\
    \ assessment_prompt, cost_calls, cost_input_tokens,\n     cost_output_tokens, durations_collection,\
    \ durations_judgment, durations_writing, durations_total)"
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at the constructor's sole persistence\
    \ dependency and every read/write/delete call routed through it — private readonly store: ICapabilityStore,\
    \ ... await this.store.readCapabilities(); ... await this.store.writeCapabilities([...kept, capability]);\
    \ ... await this.store.deleteCapability(name, version);\nsrc/factories/glossary.factory.ts: held at\
    \ the store construction inside createGlossary, wiring the sole RelationalGlossaryStore over the one\
    \ injected DatabaseConnection — return new GlossaryService(new RelationalGlossaryStore(connection),\
    \ conceptUsageReader);\nsrc/factories/investigation-store.factory.ts: held at the construction of\
    \ the store from the injected DatabaseConnection — return new RelationalInvestigationStore(connection);\n\
    src/persistence/relational-capability-store.repository.ts: held at the single injected DatabaseConnection\
    \ the class is built around, and the transactional write/delete paths that run through it — public\
    \ constructor(private readonly connection: DatabaseConnection) {}\nsrc/persistence/relational-connector-configuration-store.repository.ts:\
    \ held at writeConnectorConfigurations and deleteConnectorConfiguration, both executed against the\
    \ relational connection inside a transaction, with no file read or write anywhere in the file — await\
    \ runInTransaction(this.connection, raiseWriteFailure, async (tx) => {\n  await runStatement(tx, deleteStatementFor(connector),\
    \ raiseWriteFailure);\n});\nsrc/persistence/relational-glossary-store.repository.ts: held at the whole\
    \ class — every read and write goes through the one injected connection, in a transaction or a single\
    \ statement, never a file — public constructor(private readonly connection: IConnectableQueryable)\
    \ {}\n...\nawait runInTransaction(this.connection, raiseWriteFailure, async (tx) => {\n...\n{ text:\
    \ `INSERT INTO ${table} (name) VALUES ($1)`, params: [term.name] }\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at write() and read(), which run every statement through one transactional connection — public\
    \ async write(investigation: Investigation): Promise<void> {\n    await runInTransaction(this.connection,\
    \ raiseWriteFailure, (tx) => writeWholeInvestigation(tx, investigation));\n  }\n\n  public async read(id:\
    \ string): Promise<StoredInvestigation | undefined> {\n    return runInTransaction(this.connection,\
    \ raiseReadFailure, (tx) => readWholeInvestigation(tx, id));\n  }"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/factories/glossary.factory.ts
  - src/factories/investigation-store.factory.ts
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: "src/factories/build-app.factory.ts: held at composeResources and removeConceptDependencies, wiring\
    \ register-concept and remove-concept to the glossary service. — registerConcept: (registration) =>\
    \ glossary.registerConcept(registration), removeConcept: (name) => glossary.removeConcept(name),\n\
    src/glossary/glossary-store.port.ts: held at the writeConcepts and deleteConcept method signatures,\
    \ which back the register-concept and remove-concept operations respectively. — writeConcepts(concepts:\
    \ readonly Concept[]): Promise<void>;\n\ndeleteConcept(name: string): Promise<void>;\n\nsrc/glossary/glossary.service.ts:\
    \ held at registerConcept (register-concept) and removeConcept (remove-concept). — public async registerConcept(registration:\
    \ ConceptRegistration): Promise<Concept> {\n...\npublic async removeConcept(name: string): Promise<void>\
    \ {\n    const usage = await this.conceptUsageReader.readConceptUsage(name);\n    if (usage.named)\
    \ {\n      throw new ConceptInUseError(name, usage.reference);\n    }\n    await this.store.deleteConcept(name);\n\
    \  }\nsrc/http/build-app.ts: held at the routePluginFactories entries wiring register-concept and\
    \ remove-concept, lines 148 and 151 — (dependencies) => createRegisterConceptRoutesPlugin(dependencies.registerConcept),\n\
    (dependencies) => createRemoveConceptRoutesPlugin(dependencies.removeConcept),\nsrc/http/remove-concept.routes.ts:\
    \ held at the DELETE route registration, which implements the contract's remove-concept operation\
    \ — app.delete(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) =>\n  removeConceptHandler(dependencies,\
    \ request, reply),\n);\nsrc/persistence/relational-glossary-store.repository.ts: held at writeConcepts\
    \ (register, lines 61-71) and deleteConcept (remove, lines 73-78) — text: `INSERT INTO ${CONCEPTS_TABLE}\
    \ (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl,\
    \ description = EXCLUDED.description`\n...\nfunction deleteConceptStatement(name: string): IStatement\
    \ {\n  return { text: `DELETE FROM ${CONCEPTS_TABLE} WHERE name = $1`, params: [name] };\n}"
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/http/build-app.ts
  - src/http/remove-concept.routes.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: "src/factories/glossary.factory.ts: held at createGlossaryQuery, which hands back the GlossaryService\
    \ instance typed as IGlossaryQuery — export function createGlossaryQuery(connection: DatabaseConnection):\
    \ IGlossaryQuery {\n  return createGlossary(connection);\n}\nsrc/glossary/glossary.service.ts: held\
    \ at readVocabularyTerm, readConcept, listVocabularyTerms and listConcepts. — public async readVocabularyTerm(vocabulary:\
    \ TermVocabulary, name: string): Promise<TermResolution> {\npublic async readConcept(name: string):\
    \ Promise<ConceptResolution> {\npublic async listVocabularyTerms(\npublic async listConcepts(pagination:\
    \ PaginationRequest): Promise<PaginatedResponse<Concept>> {"
  encoded_at:
  - src/factories/glossary.factory.ts
  - src/glossary/glossary.service.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at the five public methods registerCapability,\
    \ readCapability, readCapabilityByIdentity, listCapabilities and removeCapability — public async registerCapability(...)\
    \ ... public async readCapability(...) ... public async readCapabilityByIdentity(...) ... public async\
    \ listCapabilities(...) ... public async removeCapability(name: string, version: string): Promise<void>\n\
    src/capability-registry/capability-store.port.ts: held at the deleteCapability method signature, which\
    \ is the store-level operation register-capability's sibling remove-capability route ultimately calls\
    \ to remove a capability by name and version — deleteCapability(name: string, version: string): Promise<void>;\n\
    src/factories/build-app.factory.ts: held at composeResources, readDependencies, listDependencies and\
    \ removeCapabilityDependencies, wiring all five operations. — removeCapability: (name, version) =>\
    \ capabilityRegistry.removeCapability(name, version),\nsrc/http/build-app.ts: held at the routePluginFactories\
    \ entries wiring read-capability, read-capability-by-identity, list-capabilities, register-capability\
    \ and remove-capability, lines 123-124 and 126-129 — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),\n\
    (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),\n\
    (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),\n(dependencies)\
    \ => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),\n(dependencies) => createRemoveCapabilityRoutesPlugin(dependencies.removeCapability),\n\
    src/http/remove-capability.routes.ts: held at the DELETE route registration, lines 9-11 — app.delete(`${API_PREFIX}/capabilities/:name/:version`,\
    \ (request, reply) =>\n      removeCapabilityHandler(dependencies, request, reply),\n    );\nsrc/persistence/relational-capability-store.repository.ts:\
    \ held at the three public methods — readCapabilities, writeCapabilities, deleteCapability — which\
    \ back the registry's read, register and remove operations — public async readCapabilities(): Promise<readonly\
    \ Capability[]> {\npublic async writeCapabilities(capabilities: readonly Capability[]): Promise<void>\
    \ {\npublic async deleteCapability(name: string, version: string): Promise<void> {"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability-store.port.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/remove-capability.routes.ts
  - src/persistence/relational-capability-store.repository.ts
- node: contracts/integration/capability-schema-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entry wiring draft-capability-schema-from-openapi,
    line 155 — (dependencies) => createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entry wiring draft-connector-configuration-from-openapi,
    lines 152-153 — createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/connector-configuration-registry.service.ts,
    src/errors/status-map.ts, src/factories/build-app.factory.ts, src/http/build-app.ts, src/http/dto/remove-connector.dto.ts,
    src/http/remove-connector.controller.ts, src/http/remove-connector.routes.ts, src/persistence/relational-connector-configuration-store.repository.ts,
    and src/connector-registry/connector-configuration-store.port.ts read `nowhere` — readConnectorConfigurations():
    Promise<readonly ConnectorConfiguration[]>;

    writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;

    deleteConnectorConfiguration(connector: string): Promise<void>; — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/dto/remove-connector.dto.ts
  - src/http/remove-connector.controller.ts
  - src/http/remove-connector.routes.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: "src/factories/build-app.factory.ts: held at readOpenApiDocumentOperationsDependencies. — function\
    \ readOpenApiDocumentOperationsDependencies(): Pick<BuildAppDependencies, 'readOpenApiDocumentOperations'>\
    \ {\n  const dependencies: ReadOpenApiDocumentOperationsControllerDependencies = {\n    documentFetcher:\
    \ new OpenApiDocumentFetcher(),\n  };\nsrc/http/build-app.ts: held at the routePluginFactories entry\
    \ wiring read-openapi-document-operations, line 154 — (dependencies) => createReadOpenApiDocumentOperationsRoutesPlugin(dependencies.readOpenApiDocumentOperations),"
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError, SubjectCarriesNoAttributeError
    and InvestigationWriteDeadlineExceededError entries — [SubjectDoesNotCoverCaseInputsError, 422],

    [SubjectCarriesNoAttributeError, 422],

    ...

    [InvestigationWriteDeadlineExceededError, 500],

    '
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies. — readCaseInputRequirements: { caseInputRequirementsQuery:
    resources.caseInputRequirementsQuery },

    src/http/build-app.ts: held at the routePluginFactories entry wiring read-case-input-requirements,
    line 139 — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/errors/status-map.ts: held at the CaseHoldsNoDraftError, HypothesisRevisionNotDraftAtReleaseError,\
    \ ReleasedHypothesisRevisionNotAlterableError, HypothesisRevisionCollectsNoConceptError and ConceptRefusesSubjectTypeError\
    \ entries — [CaseHoldsNoDraftError, 409],\n[ReleasedHypothesisRevisionNotAlterableError, 409],\n[HypothesisRevisionNotDraftAtReleaseError,\
    \ 409],\n...\n[HypothesisRevisionCollectsNoConceptError, 422],\n[ConceptRefusesSubjectTypeError, 422],\n\
    \nsrc/factories/build-app.factory.ts: held at lifecycleDependencies, wiring all eight lifecycle operations.\
    \ — createDraft: { createDraft: caseLifecycle.createDraft },\n  updateDraft: { caseStore, caseQuery\
    \ },\n  release: { release: caseLifecycle.release, caseQuery },\n  releaseHypothesisRevision: { releaseHypothesisRevision:\
    \ caseLifecycle.releaseHypothesisRevision },\n  discard: { discard: caseLifecycle.discard },\n  reviseHypothesis:\
    \ { reviseHypothesis: caseLifecycle.reviseHypothesis },\n  placeHypothesis: { placeHypothesis: caseLifecycle.placeHypothesis\
    \ },\n  removeHypothesis: { removeHypothesis: caseLifecycle.removeHypothesis },\nsrc/http/build-app.ts:\
    \ held at the routePluginFactories entries wiring create-draft, update-draft, release, release-hypothesis,\
    \ discard, revise-hypothesis, place-hypothesis and remove-hypothesis, lines 130-137 — (dependencies)\
    \ => createCreateDraftRoutesPlugin(dependencies.createDraft),\n(dependencies) => createUpdateDraftRoutesPlugin(dependencies.updateDraft),\n\
    (dependencies) => createReleaseRoutesPlugin(dependencies.release),\n(dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),\n\
    (dependencies) => createDiscardRoutesPlugin(dependencies.discard),\n(dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),\n\
    (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),\n(dependencies)\
    \ => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at RelationalCaseStore's methods createDraft, insertHypothesisRevision, overwriteHypothesisRevision,\n\
    releaseHypothesisRevision, placeHypothesis, removeManifestEntry, release, discard, updateDraft — public\
    \ async createDraft(input: CreateDraftInput): Promise<number> {\n  return runInTransaction(this.connection,\
    \ raiseWriteFailure, (tx) => createDraftVersion(tx, input));\n}"
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at RelationalCaseStore's methods assembleVersion,\
    \ listCases, listCaseVersions, listHypotheses,\nlistHypothesisRevisions — public async listCases(pagination:\
    \ PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>> {\n  return runInTransaction(this.connection,\
    \ raiseReadFailure, (tx) => listCasesPage(tx, pagination));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/glossary/action
  conforms: true
  how: "src/glossary/glossary.service.ts: held at the generic terms(vocabulary) method, which handles\
    \ every TermVocabulary (including action) uniformly except outcome; no action-specific branch exists.\
    \ — public async terms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {\n    const\
    \ held = await this.store.readTerms(vocabulary);\n    assertUniqueNames(vocabulary, held);\n    if\
    \ (vocabulary !== 'outcome') {\n      return held;\n    }\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at VOCABULARY_TABLES mapping plus the generic term read/write/insert-missing methods — const\
    \ VOCABULARY_TABLES: Readonly<Record<TermVocabulary, string>> = {\n  'subject-type': 'subject_types',\n\
    \  outcome: 'outcomes',\n  action: 'actions',\n  recipient: 'recipients',\n};"
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/glossary/glossary.service.ts, src/http/dto/remove-concept.dto.ts,
    src/persistence/relational-glossary-store.repository.ts, and src/glossary/glossary-store.port.ts read
    `nowhere` — import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from ''./terms.js'';
    — Concept''s own attributes (name, accepts, ttl, description) are declared in terms.js, not restated
    in this file.; src/http/remove-concept.routes.ts read `nowhere` — `${API_PREFIX}/glossary/concepts/:name`
    — the file carries the concept''s name only as a routing parameter used to identify it for removal;
    it declares or reads none of the value object''s other attributes (accepts, ttl, description) — a
    binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/http/dto/remove-concept.dto.ts
  - src/http/remove-concept.routes.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: true
  how: "src/glossary/glossary.service.ts: held at terms()'s outcome branch and withNonConclusionOutcomes,\
    \ which ensure the two non-conclusion outcomes are present. — if (vocabulary !== 'outcome') {\n  \
    \    return held;\n    }\n    return this.withNonConclusionOutcomes(held);\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at VOCABULARY_TABLES['outcome'] plus the generic term methods — outcome: 'outcomes',"
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: true
  how: "src/glossary/glossary.service.ts: held at the same generic terms(vocabulary) mechanism as action;\
    \ no recipient-specific branch exists in this file. — public async terms(vocabulary: TermVocabulary):\
    \ Promise<readonly GlossaryTerm[]> {\n    const held = await this.store.readTerms(vocabulary);\n \
    \   assertUniqueNames(vocabulary, held);\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at VOCABULARY_TABLES['recipient'] plus the generic term methods — recipient: 'recipients',"
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: "src/glossary/glossary.service.ts: held at the same generic terms(vocabulary) mechanism as action\
    \ and recipient; no subject-type-specific branch exists in this file. — public async terms(vocabulary:\
    \ TermVocabulary): Promise<readonly GlossaryTerm[]> {\n    const held = await this.store.readTerms(vocabulary);\n\
    \    assertUniqueNames(vocabulary, held);\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at VOCABULARY_TABLES['subject-type'] and the concept_accepts columns (subject_type_name) —\
    \ 'subject-type': 'subject_types',\n...\ninterface IConceptAcceptRow {\n  readonly concept_name: string;\n\
    \  readonly subject_type_name: string;\n}"
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/integration/capability
  conforms: false
  how: "the fact left part of its ground: still held in src/capability-registry/capability-registry.service.ts,\
    \ src/capability-registry/evidence-usage-reader.port.ts, src/http/dto/remove-capability.dto.ts, src/persistence/relational-capability-store.repository.ts,\
    \ and src/factories/concept-usage-reader.factory.ts read `nowhere` — const capability = await sources.capabilityQuery.readCapability(concept);\n\
    if (capability.held) {\n  return { named: true, reference: 'capability' };\n}; src/http/remove-capability.routes.ts\
    \ read `nowhere` — const parsedParams = removeCapabilityParamsSchema.safeParse(request.params); —\
    \ a binding asserts the file answers for the node, so the pair that stopped holding it is released\
    \ by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/evidence-usage-reader.port.ts
  - src/factories/concept-usage-reader.factory.ts
  - src/http/dto/remove-capability.dto.ts
  - src/http/remove-capability.routes.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-nature
  conforms: true
  how: "src/persistence/relational-capability-store.repository.ts: held at isCapabilityNature(), which\
    \ checks a stored value against the imported CAPABILITY_NATURE_VALUES set rather than redeclaring\
    \ the enumeration — const CAPABILITY_NATURE_VALUES: ReadonlySet<string> = new Set<string>(CAPABILITY_NATURES);\n\
    function isCapabilityNature(value: string): value is CapabilityNature {\n  return CAPABILITY_NATURE_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-registry
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at registerCapability(), removeCapability()\
    \ and readCapability() (concept resolution) — public async registerCapability(registration: CapabilityRegistration):\
    \ Promise<Capability> { ... } public async removeCapability(name: string, version: string): Promise<void>\
    \ { ... }\nsrc/capability-registry/capability-store.port.ts: held at the same deleteCapability signature\
    \ — the port's shape for \"remove a capability's own registration by name and version\"; the refusal\
    \ the node also states is not this file's concern — deleteCapability(name: string, version: string):\
    \ Promise<void>;\nsrc/factories/build-app.factory.ts: held at composeResources, wiring register-capability\
    \ and remove-capability to the capability registry service. — registerCapability: (registration) =>\
    \ capabilityRegistry.registerCapability(registration),\n    removeCapability: (name, version) => capabilityRegistry.removeCapability(name,\
    \ version),\nsrc/http/remove-capability.controller.ts: held at the dependency shape and its invocation\
    \ — readonly removeCapability: (name: string, version: string) => Promise<void>; ... await dependencies.removeCapability(params.name,\
    \ params.version);\nsrc/persistence/relational-capability-store.repository.ts: held at writeCapabilities\
    \ and deleteCapability, the persistence backing for the domain service's register-capability and remove-capability\
    \ operations; resolve-concept has no counterpart here — public async writeCapabilities(capabilities:\
    \ readonly Capability[]): Promise<void> {\npublic async deleteCapability(name: string, version: string):\
    \ Promise<void> {"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability-store.port.ts
  - src/factories/build-app.factory.ts
  - src/http/remove-capability.controller.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/connector-configuration-registry.service.ts,
    src/http/dto/remove-connector.dto.ts, src/persistence/relational-connector-configuration-store.repository.ts,
    and src/http/remove-connector.routes.ts read `nowhere` — the file only reads a `connector` path parameter
    through removeConnectorParamsSchema.safeParse(request.params); the configuration value object''s own
    attributes are declared elsewhere — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/dto/remove-connector.dto.ts
  - src/http/remove-connector.routes.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: "the fact left part of its ground: still held in src/connector-registry/connector-configuration-registry.service.ts,\
    \ src/factories/build-app.factory.ts, src/http/remove-connector.controller.ts, src/persistence/relational-connector-configuration-store.repository.ts,\
    \ and src/connector-registry/connector-configuration-store.port.ts read `nowhere` — export interface\
    \ IConnectorConfigurationStore {\n\n  readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;\n\
    \n  writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;\n\
    \n  deleteConnectorConfiguration(connector: string): Promise<void>;\n}; src/http/build-app.ts read\
    \ `nowhere` — the file references this domain service only through a controller-dependency type, `readonly\
    \ removeConnector: RemoveConnectorControllerDependencies;`, never through the service's own operations\
    \ or unconditional-removal behavior — a binding asserts the file answers for the node, so the pair\
    \ that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/remove-connector.controller.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/investigation/assessment
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at assessmentParams (write)\
    \ and assessmentOf (read) — function assessmentParams(assessment: Assessment): readonly unknown[]\
    \ {\n  return [\n    assessment.outcome,\n    assessment.referral.action,\n    assessment.referral.recipient,\n\
    \    assessment.determining_hypothesis ?? null,\n    assessment.text,\n    assessment.register,\n\
    \    assessment.usage.input_tokens,\n    assessment.usage.output_tokens,\n    assessment.elapsed_ms,\n\
    \    assessment.prompt,\n  ];\n}"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: false
  how: "the fact left part of its ground: still held in src/persistence/relational-investigation-store.repository.ts,\
    \ and src/factories/concept-usage-reader.factory.ts read `nowhere` — if (await sources.investigationStore.isConceptNamedByCitation(concept))\
    \ {\n  return { named: true, reference: 'citation' };\n} — a binding asserts the file answers for\
    \ the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped\
    \ here"
  observed_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at costParams (write) and the\
    \ inline object assembled in investigationOf (read) — function costParams(cost: Cost): readonly unknown[]\
    \ {\n  return [cost.calls, cost.input_tokens, cost.output_tokens];\n}"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at durationsParams (write)\
    \ and the conditional writing spread in investigationOf (read) — durations: {\n      collection: row.durations_collection,\n\
    \      judgment: row.durations_judgment,\n      ...(row.durations_writing !== null ? { writing: row.durations_writing\
    \ } : {}),\n      total: row.durations_total,\n    },"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at evaluationStatement/evaluationOf,\
    \ tying reason to the inconclusive verdict and citations to a decided one — const reason = evaluation.verdict\
    \ === 'inconclusive' ? evaluation.reason : null;\n...\nif (verdict === 'confirmed') {\n    return\
    \ { hypothesis: row.hypothesis, verdict, citations: nonEmptyCitations(citations, row.hypothesis),\
    \ ...callRecord };\n  }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at reasonOf/isEvaluationReason\
    \ — function isEvaluationReason(value: string): value is EvaluationReason {\n  return EVALUATION_REASON_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: false
  how: "the fact left part of its ground: still held in src/persistence/relational-investigation-store.repository.ts,\
    \ and src/factories/concept-usage-reader.factory.ts read `nowhere` — if (await sources.investigationStore.isConceptNamedByEvidence(concept))\
    \ {\n  return { named: true, reference: 'evidence' };\n}; src/persistence/relational-capability-store.repository.ts\
    \ read `nowhere` — export class RelationalCapabilityStore implements ICapabilityStore {\n  public\
    \ constructor(private readonly connection: DatabaseConnection) {}\n  public async readCapabilities():\
    \ Promise<readonly Capability[]> { ... }\n  public async writeCapabilities(capabilities: readonly\
    \ Capability[]): Promise<void> { ... }\n  public async deleteCapability(name: string, version: string):\
    \ Promise<void> { ... } — a binding asserts the file answers for the node, so the pair that stopped\
    \ holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at resultOf/isEvidenceResult\
    \ — function isEvidenceResult(value: string): value is EvidenceResult {\n  return EVIDENCE_RESULT_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the fields column, written
    as JSON and read back untouched — JSON.stringify(evidence.fields),

    ...

    fields: row.fields,'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/investigation
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at investigationStatement/investigationParams\
    \ (write) and investigationOf (read) — return {\n    id,\n    requester: row.requester,\n    ...(row.ticket_ref\
    \ !== null ? { ticket_ref: row.ticket_ref } : {}),\n    narrative: row.narrative,\n    subject: {\
    \ type: row.subject_type, attributes },\n    pinned_case: { slug: row.pinned_case_slug, version: row.pinned_case_version\
    \ },\n    prompt_version: row.prompt_version,\n    model: row.model,\n    evidence,\n    evaluations,\n\
    \    assessment: assessmentOf(row),\n    cost: { calls: row.cost_calls, input_tokens: row.cost_input_tokens,\
    \ output_tokens: row.cost_output_tokens },"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the subject_type column
    plus the per-attribute inserts driven by subject.attributes — ...investigation.subject.attributes.map((attribute)
    => subjectAttributeValueStatement(investigation.id, attribute)),

    ...

    subject: { type: row.subject_type, attributes },'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at subjectAttributeValueStatement\
    \ (write) and readSubjectAttributeValues (read) — function subjectAttributeValueStatement(investigationId:\
    \ string, attribute: SubjectAttributeValue): IStatement {\n  return {\n    text: `INSERT INTO ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE}\
    \ (investigation_id, attribute, value) VALUES ($1, $2, $3)`,\n    params: [investigationId, attribute.attribute,\
    \ attribute.value],\n  };\n}"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at assessment's required usage\
    \ columns and an evaluation's optional usage columns — if (row.input_tokens !== null && row.output_tokens\
    \ !== null) {\n    record.usage = { input_tokens: row.input_tokens, output_tokens: row.output_tokens\
    \ };\n  }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at verdictOf/isVerdict — function\
    \ isVerdict(value: string): value is Verdict {\n  return VERDICT_VALUES.has(value);\n}"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement (slug) and\
    \ assignNextVersion/nextVersionUpdateStatement (next_version) — function caseIdentityStatement(slug:\
    \ string): IStatement {\n  return { text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT\
    \ (slug) DO NOTHING`, params: [slug] };\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf, built from casesPageSelect's\
    \ latest/released subqueries — return {\n    slug: row.slug,\n    ...(row.current_state !== null ?\
    \ { current_state: caseVersionStateOf(row.current_state) } : {}),\n    version_count: Number(row.version_count),"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at ICaseVersionRow and assembledCaseVersionOf\
    \ — return {\n    slug: key.slug,\n    version: key.version,\n    title: row.title,\n    when_to_use:\
    \ row.when_to_use,\n    authored_at: row.authored_at.toISOString(),"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE constants
    and caseVersionStateOf/isCaseVersionState — const CASE_VERSION_STATE_VALUES: ReadonlySet<string> =
    new Set<string>(CASE_VERSION_STATES);

    const DRAFT_STATE: CaseVersionState = ''draft'';

    const RELEASED_STATE: CaseVersionState = ''released'';'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at registerOf/isConsolidationRegister\
    \ — function isConsolidationRegister(value: string): value is ConsolidationRegister {\n  return CONSOLIDATION_REGISTER_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement and requireHypothesisIdentity\
    \ — function hypothesisIdentityStatement(key: IHypothesisKey): IStatement {\n  return {\n    text:\
    \ `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name)\
    \ DO NOTHING`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: false
  how: "the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,\
    \ and src/factories/concept-usage-reader.factory.ts read `nowhere` — if (await sources.caseStore.isConceptCollectedByUnmanifestedHypothesisRevision(concept))\
    \ {\n  return { named: true, reference: 'hypothesis-revision-collects' };\n} — a binding asserts the\
    \ file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,\
    \ never restamped here"
  observed_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_DRAFT_STATE/RELEASED_STATE
    and hypothesisRevisionStateOf/isHypothesisRevisionState — const HYPOTHESIS_REVISION_DRAFT_STATE: HypothesisRevisionState
    = ''draft'';

    const HYPOTHESIS_REVISION_RELEASED_STATE: HypothesisRevisionState = ''released'';'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at IManifestRow, manifestEntryOf and\
    \ placeHypothesisStatement — function manifestEntryOf(row: IManifestRow, collects: readonly string[]):\
    \ ManifestEntry {\n  const hypothesisRevision: HypothesisRevisionContent = {\n    hypothesis_name:\
    \ row.hypothesis_name,\n    revision: row.revision,\nreturn { position: row.position, hypothesis_revision:\
    \ hypothesisRevision };"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: "src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry — [ConceptDescriptionRequiredError,\
    \ 422],\nsrc/glossary/glossary.service.ts: held at registerConcept's refusal at the top of the method,\
    \ before any write. — if (namesNoDescription(registration.description)) {\n      throw new ConceptDescriptionRequiredError(registration.name,\
    \ registration.description);\n    }"
  encoded_at:
  - src/errors/status-map.ts
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: true
  how: "src/errors/status-map.ts: held at the VocabularyTermNotHeldError and ConceptNotHeldError entries\
    \ — [ConceptNotHeldError, 404],\n[VocabularyTermNotHeldError, 404],\n\nsrc/glossary/glossary.service.ts:\
    \ held at readVocabularyTerm and readConcept, which answer the absence as an ordinary { held: false\
    \ } resolution rather than throwing — the internal-resolution half of the rule; the HTTP refusal itself\
    \ is not in this file. — const term = held.find((candidate) => candidate.name === name);\n    return\
    \ term === undefined ? { held: false, vocabulary, name } : { held: true, term };\n  }\n\n  public\
    \ async readConcept(name: string): Promise<ConceptResolution> {\n    const held = await this.concepts();\n\
    \    const concept = held.find((candidate) => candidate.name === name);\n    return concept === undefined\
    \ ? { held: false, name } : { held: true, concept };"
  encoded_at:
  - src/errors/status-map.ts
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: "src/factories/concept-usage-reader.factory.ts, resolveConceptUsage, the fourth conditional branch,\
    \ lines 36-38: if (await sources.caseStore.isConceptCollectedByUnmanifestedHypothesisRevision(concept))\
    \ {\n  return { named: true, reference: 'hypothesis-revision-collects' };\n} — A concept collected\
    \ by a hypothesis-revision that a case version's manifest currently points at (a manifested one) never\
    \ trips this branch, so remove-concept can proceed against a concept the rule's own decided text requires\
    \ it still refuse; the glossary row is removed while a manifested hypothesis_revision_collects row\
    \ still names it, stranding exactly the reference the rule exists to keep from stranding."
  observed_at:
  - src/errors/concept-in-use.error.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/factories/glossary.factory.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: false
  how: "src/persistence/relational-glossary-store.repository.ts, readTerms (lines 30-36) and readWholeConcepts\
    \ (lines 111-119): return runStatement<GlossaryTerm>(\n      this.connection,\n      { text: `SELECT\
    \ name FROM ${VOCABULARY_TABLES[vocabulary]}` },\n      raiseReadFailure,\n    );\n...\nreturn rows.map((row)\
    \ => ({ name: row.name, accepts: accepts.get(row.name) ?? [], ttl: row.ttl, description: row.description\
    \ })); — If the underlying table ever holds two rows sharing one name, readTerms and readConcepts\
    \ hand both rows to the caller silently instead of refusing the read — the caller never sees the distinct\
    \ HTTP 500 DuplicateGlossaryNameError the rule promises, so a corrupted store is read as an odd-but-valid\
    \ one and the next reader has to notice a duplicate downstream rather than trusting the store layer\
    \ to have already refused it."
  observed_at:
  - src/errors/status-map.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: "src/glossary/glossary-store.port.ts: held at the insertMissingTerms method signature, the add-only\
    \ operation the rule's own \"ensuring\" mechanism uses. — insertMissingTerms(vocabulary: TermVocabulary,\
    \ terms: readonly GlossaryTerm[]): Promise<void>;\n\nsrc/glossary/glossary.service.ts: held at withNonConclusionOutcomes,\
    \ which only inserts whichever of the two outcomes is missing. — private async withNonConclusionOutcomes(held:\
    \ readonly GlossaryTerm[]): Promise<readonly GlossaryTerm[]> {\n    const missing = NON_CONCLUSION_OUTCOMES.filter(\n\
    \      (outcome) => !held.some((term) => term.name === outcome.name),\n    );\n    if (missing.length\
    \ === 0) {\n      return held;\n    }\n    await this.store.insertMissingTerms('outcome', missing);\n\
    \    return [...held, ...missing];\n  }\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at insertMissingTerms (lines 48-55) and insertMissingTermStatement (lines 85-87) — return {\
    \ text: `INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, params: [term.name] };"
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: "the fact left part of its ground: still held in src/capability-registry/capability-registry.service.ts,\
    \ and src/persistence/relational-capability-store.repository.ts read `nowhere` — params: [\n     \
    \ capability.name,\n      capability.version,\n      capability.nature,\n      capability.input_schema,\n\
    \      capability.output_schema,\n      capability.timeout,\n      capability.connector,\n      capability.concept,\n\
    \      capability.payload_notes ?? null,\n    ], — a binding asserts the file answers for the node,\
    \ so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/persistence/relational-capability-store.repository.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'src/capability-registry/capability-registry.service.ts: held at refuseMalformedSchemas() — const
    malformed = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute])); if
    (malformed.length > 0) { throw new CapabilitySchemaNotWellFormedError(malformed); }'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/capability-registry/capability-registry.service.ts: held at refuseMalformedInputSchemaShape()
    — const parsed: unknown = JSON.parse(registration.input_schema); const problems = inputSchemaShapeProblems(parsed);
    if (problems.length > 0) { throw new MalformedCapabilityInputSchemaError(problems); }

    src/errors/status-map.ts: held at the MalformedCapabilityInputSchemaError entry — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: 'src/capability-registry/capability-registry.service.ts: held at the nature check in heldCapability()
    — if (registration.nature !== READ_ONLY_NATURE) { throw new CapabilityNotReadOnlyError(registration.nature);
    }'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at wellFormedConfiguration(),\
    \ textConfigurationOrThrow() and registrationProblems(), lines 123-146 and 168-177 — function wellFormedConfiguration(configuration:\
    \ unknown): unknown {\n  if (typeof configuration === 'string') {\n    return textConfigurationOrThrow(configuration);\n\
    \  }\n  if (isPlainObject(configuration)) {\n    return JSON.stringify(configuration);\n  }\n  if\
    \ (configuration === null || Array.isArray(configuration)) {\n    throw new ConnectorConfigurationNotWellFormedError('configuration\
    \ is not a JSON object');\n  }\n  return configuration;\n}\n\nsrc/errors/status-map.ts: held at the\
    \ ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError entries — [ConnectorConfigurationNotWellFormedError,\
    \ 422],\n[IncompleteConnectorConfigurationError, 422],\n"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the IncompleteConnectorConfigurationError entry (shared with
    the well-formed-object rule) — [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/connector-configuration-registry.service.ts,
    src/errors/status-map.ts, and src/factories/build-app.factory.ts read `nowhere` — readConnectorConfigurationOrThrow:
    (connector) => connectorConfigurationRegistry.readConnectorConfigurationOrThrow(connector), — this
    file only wires the throwing read to controllers; the 404/refusal itself is not decided here. — a
    binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at refuseOrphanedPlaceholders() and\
    \ orphanedAcrossEveryConfiguration() — const orphaned = orphanedAcrossEveryConfiguration(capability,\
    \ configurations); if (orphaned.length > 0) { throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);\
    \ }\nsrc/connector-registry/connector-configuration-registry.service.ts: held at refuseOrphanedPlaceholders()\
    \ and orphanedAcrossEveryCapability(), lines 79-103 — const capabilities = (await this.capabilitiesReader.readCapabilities()).filter(\n\
    \  (capability) => capability.connector === configuration.connector,\n);\nconst orphaned = orphanedAcrossEveryCapability(configuration.configuration,\
    \ capabilities);\nif (orphaned.length > 0) {\n  throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);\n\
    }\n\nsrc/errors/status-map.ts: held at the ConnectorPlaceholderOutsideInputSchemaError entry — [ConnectorPlaceholderOutsideInputSchemaError,\
    \ 422],"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    entries — [OpenApiDocumentNotFetchedError, 422],

    [OpenApiDocumentNotReadableError, 422],

    '
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotReadableError entry, the status the sibling
    node states once for both draft refusals — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotReadableError entry, shared with the operations-read
    pair — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at removeCapability() — const cited\
    \ = await this.evidenceUsageReader.isCapabilityNamedByEvidence({ name, version }); if (cited) { throw\
    \ new CapabilityCitedByEvidenceError(name, version); } await this.store.deleteCapability(name, version);\n\
    src/errors/capability-cited-by-evidence.error.ts: held at the class declaration and constructor of\
    \ CapabilityCitedByEvidenceError — export class CapabilityCitedByEvidenceError extends Error {\n \
    \ public readonly context: Readonly<{ name: string; version: string }>;\n\n  public constructor(name:\
    \ string, version: string) {\n    super(`capability \"${name}\" version \"${version}\" is cited by\
    \ collected evidence and cannot be removed`);\n    this.name = 'CapabilityCitedByEvidenceError';\n\
    \    this.context = { name, version };\n  }\n}\nsrc/errors/status-map.ts: held at the CapabilityCitedByEvidenceError\
    \ entry — [CapabilityCitedByEvidenceError, 409],"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/capability-cited-by-evidence.error.ts
  - src/errors/status-map.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiOperationNotFoundError entry — [OpenApiOperationNotFoundError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    entries — [OpenApiDocumentNotFetchedError, 422],

    [OpenApiDocumentNotReadableError, 422],

    '
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError entry, shared with the draft''s
    own fetch refusal — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: 'src/capability-registry/capability-registry.service.ts: held at the duplicate check in readCapability()
    and refuseAnsweredConcept() called from registerCapability() — if (answers.length > 1) { throw new
    DuplicateConceptAnswerError(concept, answers); } ... const answering = kept.find((candidate) => candidate.concept
    === registering.concept); if (answering !== undefined) { throw new ConceptAlreadyAnsweredError(registering.concept,
    answering, registering); }'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at removeConnector(),\
    \ lines 42-44 — public async removeConnector(connector: string): Promise<void> {\n  await this.store.deleteConnectorConfiguration(connector);\n\
    }\n\nsrc/connector-registry/connector-configuration-store.port.ts: held at the deleteConnectorConfiguration\
    \ method signature — it declares no rejected or thrown condition for a name nothing is registered\
    \ under, matching a removal that is never refused for that absence. — deleteConnectorConfiguration(connector:\
    \ string): Promise<void>;\nsrc/http/remove-connector.controller.ts: held at the handler body — a single\
    \ unconditional call with no branch testing whether a configuration is currently registered under\
    \ the name, and no distinct return for either case. — await dependencies.removeConnector(params.connector);\n\
    src/http/remove-connector.routes.ts: held at the single unconditional return after handleRemoveConnectorRequest,\
    \ with no branch on whether a configuration existed — await handleRemoveConnectorRequest(dependencies,\
    \ parsedParams.data); return reply.code(204).send();\nsrc/persistence/relational-connector-configuration-store.repository.ts:\
    \ held at deleteStatementFor and deleteConnectorConfiguration, which issue an unconditional DELETE\
    \ with no existence check beforehand and no distinct handling of zero rows affected — text: `DELETE\
    \ FROM ${CONNECTOR_CONFIGURATIONS_TABLE} WHERE connector = $1`,\nparams: [connector],"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/http/remove-connector.controller.ts
  - src/http/remove-connector.routes.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions close it, each one input against one expected result. For the capability
    branch: with a configuration registered under a connector name and a capability registered whose own
    connector attribute is that same name, a removal of that connector configuration resolves without
    refusal, leaves the capability exactly as it stood, and leaves the registry holding no configuration
    under that name — the same answer the removal gives when no capability names it. For the equivalence
    of answers: assert the result of the removal that did remove a registered configuration is the same
    value the removal naming a never-registered connector answers with — undefined — so that the two branches
    are pinned to one answer rather than each to its own.'
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError entry — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the HypothesisNotInManifestError entry — [HypothesisNotInManifestError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectCarriesNoAttributeError entry — [SubjectCarriesNoAttributeError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at ticketRefForWrite/holdsNoTicketReference\
    \ (write) and the conditional ticket_ref spread in investigationOf (read) — function ticketRefForWrite(ticketRef:\
    \ string | undefined): string | undefined {\n  return holdsNoTicketReference(ticketRef) ? undefined\
    \ : ticketRef;\n}\n\nfunction holdsNoTicketReference(value: string | undefined): boolean {\n  return\
    \ value === undefined || value === '';\n}"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at raiseRootInsertFailure/isUniqueViolation,\
    \ which turns a duplicate id into a distinguishable InvestigationAlreadyStoredError rather than the\
    \ generic write failure — function raiseRootInsertFailure(id: string): RaiseStoreError {\n  return\
    \ (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id) : raiseWriteFailure(cause));\n\
    }"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the InvestigationWriteDeadlineExceededError entry — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at investigationParams, which\
    \ excludes written_at from what is handed to the store, and investigationSelect/investigationOf, which\
    \ read it back as the store fixed it — function investigationParams(investigation: Investigation):\
    \ readonly unknown[] {\n  return [\n    ...identityParams(investigation),\n    ...assessmentParams(investigation.assessment),\n\
    \    ...costParams(investigation.cost),\n    ...durationsParams(investigation.durations),\n  ];\n\
    }\n...\nwritten_at: row.written_at.toISOString(),"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, testing\
    \ ONE_DRAFT_PER_CASE_CONSTRAINT — function raiseCreateDraftFailure(slug: string): RaiseStoreError\
    \ {\n  return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)\
    \ : raiseWriteFailure(cause));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s outer ordering
    — FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c

    ...

    ORDER BY c.slug`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest/released\
    \ subqueries and caseCatalogEntryOf — SELECT DISTINCT ON (slug) slug, state, authored_at,\n      \
    \ COUNT(*) OVER (PARTITION BY slug) AS version_count\nFROM ${CASE_VERSIONS_TABLE}\nORDER BY slug,\
    \ version DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/status-map.ts: held at the CaseVersionNotValidError entry — [CaseVersionNotValidError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft, called before\
    \ every write against updateDraftVersion/insertManifestEntry/deleteManifestEntry/discardDraft — function\
    \ refuseUnlessDraft(key: ICaseVersionKey, state: CaseVersionState): void {\n  if (state !== DRAFT_STATE)\
    \ {\n    throw new CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft and refuseUnlessDraftAtRelease\
    \ — function refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState): void {\n \
    \ if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftAtReleaseError(key.slug, key.version,\
    \ state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement — text:\
    \ `UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug = $1\n       RETURNING\
    \ next_version - 1 AS version`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'src/glossary/glossary.service.ts: held at the absent-ttl default only, applied in registerConcept
    and concepts(); no check in this file refuses a stated ttl of zero, a negative number, or a non-integer.
    — ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS,'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptRefusesSubjectTypeError entry — [ConceptRefusesSubjectTypeError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/errors/status-map.ts: held at the HypothesisRevisionCollectsNoConceptError entry — [HypothesisRevisionCollectsNoConceptError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: false
  how: "src/persistence/relational-case-store.repository.ts, function overwriteRevision (used by RelationalCaseStore.overwriteHypothesisRevision):\
    \ async function overwriteRevision(tx: IQueryable, input: OverwriteHypothesisRevisionInput): Promise<void>\
    \ {\n  const key: IRevisionKey = { slug: input.slug, hypothesis_name: input.hypothesis_name, revision:\
    \ input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input), raiseOverwriteFailure(input));\n\
    \  await runStatement(tx, revisionCollectsDeleteStatement(key), raiseWriteFailure); — overwriteRevision\
    \ never calls requireCaseHoldsDraft — the guard its sibling insertRevision applies immediately (`await\
    \ requireCaseHoldsDraft(tx, input.slug);`) before touching a hypothesis-revision. An in-place edit\
    \ of a hypothesis-revision therefore reaches the UPDATE whether or not the case currently holds a\
    \ draft, so an overwrite issued after the draft was released or discarded proceeds silently instead\
    \ of being refused with CaseHoldsNoDraftError, and the concept-acceptance check the rule anchors to\
    \ a draft's declared subject type has no draft to anchor to. The next reader who trusts this guard\
    \ because insertRevision enforces it will not find it enforced on the overwrite path."
  observed_at:
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement''s ON
    CONFLICT (case_slug, name) DO NOTHING — text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES
    ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure, testing\
    \ POSITION_UNIQUE_CONSTRAINT — function raisePlaceHypothesisFailure(input: PlaceHypothesisInput):\
    \ RaiseStoreError {\n  return (cause) =>\n    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n\
    \      ? new ManifestPositionOccupiedError(input.slug, input.version, input.position)"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at insertRevisionRow (creates the next
    revision) and overwriteRevision plus raiseOverwriteFailure

    (in-place edit, refused when the revision is released) — SELECT $1, $2, COALESCE(MAX(revision), 0)
    + 1, $3, $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}

    WHERE case_slug = $1 AND hypothesis_name = $2

    RETURNING revision`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/errors/status-map.ts: held at the HypothesisRevisionNotDraftAtReleaseError entry — [HypothesisRevisionNotDraftAtReleaseError,\
    \ 409],\nsrc/persistence/relational-case-store.repository.ts: held at refuseUnlessHypothesisRevisionDraftAtRelease\
    \ and resolveHypothesisRevisionOwnState — function refuseUnlessHypothesisRevisionDraftAtRelease(state:\
    \ HypothesisRevisionState | undefined): void {\n  if (state !== HYPOTHESIS_REVISION_DRAFT_STATE) {\n\
    \    throw new HypothesisRevisionNotDraftAtReleaseError();\n  }\n}"
  encoded_at:
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement — SELECT
    $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect — text:\
    \ `SELECT revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state\n\
    \       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n       WHERE case_slug = $1 AND hypothesis_name = $2\n\
    \       ORDER BY revision DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf''s state
    field, sourced from the state column selected in hypothesisRevisionsPageSelect — state: hypothesisRevisionStateOf(row.state),'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and manifestCopyStatement\
    \ — async function resolveSourceVersion(tx: IQueryable, input: CreateDraftInput): Promise<number |\
    \ undefined> {\n  if (input.source_version !== undefined) {\n    return input.source_version;\n  }\n\
    \  const row = await queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug),\
    \ raiseWriteFailure);\n  return row?.version ?? undefined;\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/errors/status-map.ts: held at the ReleasedHypothesisRevisionNotAlterableError entry — [ReleasedHypothesisRevisionNotAlterableError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement''s ON CONFLICT
    (slug) DO NOTHING — text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`,
    params: [slug] };'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptNotInGlossaryError entry — [ConceptNotInGlossaryError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at discardDraft, restricted by refuseUnlessDraft\
    \ to draft versions only — no other operation in\nthe file deletes a case_versions row — async function\
    \ discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key, await\
    \ requireVersionState(tx, key));\n  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n\
    \  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect — WHERE cvh.case_slug\
    \ = $1 AND cvh.case_version = $2\n       ORDER BY cvh.position`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: "src/persistence/relational-capability-store.repository.ts: held at readCapabilities(), which queries\
    \ the table directly on every call with no cache — SELECT name, version, nature, input_schema, output_schema,\
    \ timeout, connector, concept, payload_notes\n       FROM ${CAPABILITIES_TABLE}"
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: "src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry (same as the rule\
    \ it instances) — [ConceptDescriptionRequiredError, 422],\nsrc/glossary/glossary.service.ts: held\
    \ at registerConcept's refusal, which throws before store.writeConcepts is ever called. — if (namesNoDescription(registration.description))\
    \ {\n      throw new ConceptDescriptionRequiredError(registration.name, registration.description);\n\
    \    }"
  encoded_at:
  - src/errors/status-map.ts
  - src/glossary/glossary.service.ts
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at refuseOrphanedPlaceholders(),\
    \ lines 79-87, via orphanedAcrossEveryCapability() — const orphaned = orphanedAcrossEveryCapability(configuration.configuration,\
    \ capabilities);\nif (orphaned.length > 0) {\n  throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);\n\
    }\n"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError entry (same as the rule
    it instances) — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: 'src/persistence/relational-glossary-store.repository.ts: held at readWholeConcepts''s row mapping
    of description — description: row.description'
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s released subquery
    joined into caseCatalogEntryOf — SELECT DISTINCT ON (slug) slug, version, title, when_to_use

    FROM ${CASE_VERSIONS_TABLE}

    WHERE state = $3

    ORDER BY slug, version DESC'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow, which\
    \ touches only hypothesis_revisions — async function releaseHypothesisRevisionRow(tx: IQueryable,\
    \ key: IRevisionKey): Promise<void> {\n  refuseUnlessHypothesisRevisionDraftAtRelease(await resolveHypothesisRevisionOwnState(tx,\
    \ key));\n  await runStatement(tx, releaseHypothesisRevisionStatement(key), raiseWriteFailure);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at insertRevisionRow, always inserting\
    \ the next revision number — async function insertRevisionRow(tx: IQueryable, input: HypothesisRevisionInput):\
    \ Promise<number> {\n  const columns = referralColumns(input.resolution);\n  const row = await queryOneOrAbsent<{\
    \ revision: number }>(tx, revisionInsertStatement(input, columns), raiseWriteFailure);"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/persistence/relational-investigation-store.repository.ts
  where: readWholeInvestigation and the contentHash helper it calls
  evidence: "const document = investigationOf({ id, row, attributes, evidence, evaluations });\nreturn\
    \ { document, hash: contentHash(document) };\n...\nfunction contentHash(document: Investigation):\
    \ string {\n  return createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex');\n\
    }"
  cost: Every read of an investigation now answers a SHA-256 hex digest of the JSON-serialized record
    alongside the document itself. No node states that a read carries such a digest, what it is for, or
    that JSON.stringify plus sha256 is the exact scheme a caller may depend on; whoever reads the specification
    to learn what read() answers will not learn this attribute exists at all, and a later change to the
    serialization or the algorithm has no node holding it accountable.
notes: 'Judged by 30 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/delete-routes-connector-capability-concept.returns/.

  Certification of constraints/a-successful-capability-removal-answers-with-no-content did not hold: the
  auditor answered `partial` — The status-and-empty-body half holds: the test injects DELETE /v1/capabilities/:name/:version
  and asserts statusCode 204, body '''' and rawPayload.length 0, so a route that answered another status
  or attached any body would fail it. The other half the node states — "the same answer whether a capability
  stood at that name and version or none did" — goes unexercised. Both requests run against a single vi.fn()
  stub of removeCapability primed with mockResolvedValueOnce(undefined) twice, so the two calls differ
  only in the URL segments; no capability is ever registered and no identity is ever genuinely absent.
  The mock, not the system, is what makes the absent-identity branch resolve, so if removal at a name
  and version nothing is registered under stopped answering 204 — if it began rejecting and the surface
  mapped that to a 404 or a 409 — this test would still pass unchanged. The node''s scope is integration
  and its fitness asks for a capability no collected evidence item names to be actually removed and then
  for a name and version no capability is currently registered at; neither is reached here, and nothing
  in the offered proof touches the registry service or evidence collection. Separately, the test''s closing
  expectations — toHaveBeenNthCalledWith(1, ''a-capability'', ''1.0.0'') and (2, ''an-absent-capability'',
  ''9.9.9'') — assert an internal call rather than the answer, so they bind the controller''s delegation
  shape and add nothing to this fact; a reader should not read them as covering the two-branch equivalence..
  The node is decided by reading, and a certification standing on it from an earlier reconciliation is
  released by the bind. The remainder is testable: Two inputs against one expected result, run against
  the real remove-capability path rather than a stub: first a DELETE at the name and version of a capability
  that is registered and that no collected evidence item names, then a DELETE at a name and version no
  capability is currently registered at — each asserted to answer HTTP 204 with a wholly empty body, and
  the two answers asserted indistinguishable, so nothing in the response tells the removal apart from
  the absence..

  Certified constraints/a-successful-concept-removal-answers-with-no-content as decided by step `test`:
  src/__tests__/unit/http/remove-concept.routes.spec.ts (answers 204 with a wholly empty body, identically
  for a concept currently held and one nothing answers, records, cites or collects) would fail if the
  fact stopped holding.

  Certification of rules/integration/removing-a-connector-configuration-is-unconditional did not hold:
  the auditor answered `partial` — The second branch — a removal naming a connector nothing is registered
  under — is exercised in two of its three parts: the removal is awaited and resolves, so it is not refused
  for the absence, and the subsequent read resolving to exactly the already-held configuration shows every
  registered configuration left as it stood. Two parts of the fact go unexercised. First, the branch the
  statement opens with — whether or not any capability currently names the connector as its own connector
  — appears nowhere in the offered proof: the file exercises only the connector-configuration store, never
  registers a capability whose own connector attribute names the connector being removed, and so never
  establishes that such a capability''s existence does not condition the removal. Every removal in the
  set names a connector no capability in the test refers to, so the removal would answer identically if
  it had begun consulting capabilities and refusing. Second, "answered exactly as a removal that removed
  one" is anchored on only one side: the absent-name test asserts `expect(outcome).toBeUndefined()`, but
  the test that does remove a registered configuration discards the result of `store.deleteConnectorConfiguration(''a-removed-connector'')`
  without asserting on it, so the two answers are never compared and the removal that removed one could
  begin answering something other than undefined with both tests still passing. Nothing in the file is
  assertion-free or asserts on a literal; the gap is in what the assertions reach, not in whether they
  can fail.. The node is decided by reading, and a certification standing on it from an earlier reconciliation
  is released by the bind. The remainder is testable: Two assertions close it, each one input against
  one expected result. For the capability branch: with a configuration registered under a connector name
  and a capability registered whose own connector attribute is that same name, a removal of that connector
  configuration resolves without refusal, leaves the capability exactly as it stood, and leaves the registry
  holding no configuration under that name — the same answer the removal gives when no capability names
  it. For the equivalence of answers: assert the result of the removal that did remove a registered configuration
  is the same value the removal naming a never-registered connector answers with — undefined — so that
  the two branches are pinned to one answer rather than each to its own..

  Certification of constraints/a-successful-connector-configuration-removal-answers-with-no-content did
  not hold: the auditor answered `partial` — The status-and-absent-body half is exercised and would fail
  if it stopped holding: the test asserts statusCode 204, body '''' and rawPayload.length 0 on the answer.
  The other half the node states — "the same answer whether a configuration stood at that name or none
  did" — is unexercised. The test drives a Fastify instance whose removeConnector is a vi.fn() mocked
  to resolve undefined for both injections, so nothing in it ever places the system in the state where
  no configuration stands at the requested name; the two injections differ only in the path string, and
  the mocked dependency answers both identically by construction. If the absent-name branch stopped answering
  204 with no body — removeConnector signalling absence and the surface rendering it as anything other
  than 204 — this test would still pass. The node''s own fitness asks for a test that "removes a registered
  connector configuration and then a connector name nothing is registered under", and its scope is integration;
  the offered proof registers nothing and removes nothing. The test''s closing assertions (toHaveBeenNthCalledWith
  on the mock) assert an internal call rather than the answer, so they add nothing to the fact. The file''s
  other two tests bear on the surface''s two refusals, which this node places in their own nodes rather
  than stating here.. The node is decided by reading, and a certification standing on it from an earlier
  reconciliation is released by the bind. The remainder is testable: One test at the node''s stated integration
  scope, over the real removal path rather than a mock: register a connector configuration, issue DELETE
  /v1/connectors/:connector for its name, then issue DELETE for a name nothing is registered under (the
  just-removed name serves), and assert each of the two answers is HTTP 204 with a wholly empty body —
  the same status and the same absent body, with nothing in either answer telling the two apart..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-domain-error-unmapped-by-status-is-refused-generically,
  constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/a-successful-capability-removal-answers-with-no-content,
  constraints/a-successful-concept-removal-answers-with-no-content, constraints/a-successful-connector-configuration-removal-answers-with-no-content,
  constraints/no-route-enforces-authentication, constraints/the-capability-identity-read-refuses-an-unregistered-identity,
  constraints/the-domain-depends-on-no-infrastructure, constraints/the-system-persists-to-one-relational-database,
  contracts/glossary/glossary-authoring, contracts/integration/capability-registry, contracts/integration/connector-configuration-registry,
  domain/glossary/concept, domain/glossary/subject-type, domain/integration/capability, domain/integration/capability-registry,
  domain/integration/connector-configuration, domain/integration/connector-configuration-registry, domain/investigation/citation,
  domain/investigation/evidence, domain/knowledge/hypothesis-revision, rules/glossary/a-registered-concept-is-never-removed,
  rules/integration/a-registered-capability-cited-by-evidence-is-never-removed, rules/integration/removing-a-connector-configuration-is-unconditional
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 1 opened across 1 of 30 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/delete-routes-connector-capability-concept.returns/`, which are the evidence behind every entry above.
