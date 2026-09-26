---
contract_version: siegard-reconcile/5
title: Review of case-deletion-backend
summary: 'Delivers case deletion for the case-lifecycle surface: a case holding no case version may be
  deleted, cascading through its hypotheses, hypothesis-revisions and their collects, refused with CaseHoldsVersionsError
  (409) for a case holding any version and CaseNotFoundError (404) for an unknown slug, answering HTTP
  204 with no body on acceptance. Includes a migration reconciling the released-collects no-delete rule
  (0021) with the new delete so a versionless case''s cascade can actually complete.'
target: backend
files:
- path: migrations/0026-a-versionless-case-may-delete-released-collects.sql
  change: Adds a second EXISTS clause to the hypothesis_revision_collects_no_delete_when_released rule
    so its no-op applies only while the case still holds a case version, letting a versionless case's
    cascade delete a released revision's collects.
- path: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  change: >-
    Unchanged; cited by proof/case-deletion/delete-case-over-case-lifecycle as the test that
    demonstrates constraints/the-domain-depends-on-no-infrastructure for the delete operation
    module, and certified separately by the coverage-auditor (see
    certify__constraints__the-domain-depends-on-no-infrastructure.yaml).
- path: src/__tests__/integration/http/delete-case.routes.spec.ts
  change: 'New integration tests over DELETE /v1/cases/:slug against the real store: accepted delete of
    a versionless case with cascade, 409 refusal for draft/released versions, 404 for an unknown slug,
    and the post-delete listing/slug-reuse scenario.'
- path: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  change: Adds a case_versions fixture row and a new test proving the versionless-case exception directly
    against the DB rule from migration 0026.
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: 'New integration tests over RelationalCaseStore.delete: accept/refuse cascade behavior and the
    CaseNotFoundError refusal for an unknown slug.'
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: FakeCaseStore's ICaseStore implementation extended with a no-op delete method to satisfy the
    widened interface; no case-query behavior changed.
- path: src/__tests__/unit/case/release.operation.spec.ts
  change: FakeReleaseStore's ICaseStore implementation extended with a no-op delete method to satisfy
    the widened interface; no release behavior changed.
- path: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  change: New unit tests over CaseHoldsVersionsError's own shape, message and context.
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: Adds a test asserting CaseHoldsVersionsError maps to HTTP 409.
- path: src/__tests__/unit/http/build-app.spec.ts
  change: stubBuildAppDependencies extended with a delete mock on ICaseStore and a deleteCase entry on
    BuildAppDependencies so the wiring sweep covers the new route.
- path: src/__tests__/unit/http/delete-case.routes.spec.ts
  change: New unit tests over the DELETE /v1/cases/:slug route/controller's status and envelope mapping.
- path: src/__tests__/unit/http/discard.routes.spec.ts
  change: SingleDraftCaseStore extended with a no-op delete method to satisfy the widened interface.
- path: src/__tests__/unit/http/update-draft.routes.spec.ts
  change: Store mock extended with a no-op delete method to satisfy the widened interface.
- path: src/case/case-store.port.ts
  change: Adds delete(slug) to the ICaseStore interface.
- path: src/case/delete-case.operation.ts
  change: New pure pass-through operation module, deleteCase(store, slug) calling store.delete(slug).
- path: src/errors/case-holds-versions.error.ts
  change: New domain error class CaseHoldsVersionsError(slug), with a Brazilian-Portuguese message and
    context { slug }.
- path: src/errors/status-map.ts
  change: Registers CaseHoldsVersionsError at HTTP 409 in STATUS_BY_ERROR_CLASS.
- path: src/factories/build-app.factory.ts
  change: Wires deleteCase into BuildAppDependencies.
- path: src/factories/case-lifecycle.factory.ts
  change: Adds a delete entry to CaseLifecycleOperations, delegating to deleteCase.
- path: src/http/build-app.ts
  change: Registers the new DELETE /v1/cases/:slug route plugin.
- path: src/http/delete-case.controller.ts
  change: New thin controller handleDeleteCaseRequest calling dependencies.delete(params.slug).
- path: src/http/delete-case.routes.ts
  change: New route registering DELETE /v1/cases/:slug, answering 204 empty body on success.
- path: src/http/dto/delete-case.dto.ts
  change: New Zod schema deleteCaseParamsSchema validating the slug path param.
- path: src/persistence/relational-case-store.repository.ts
  change: 'Implements RelationalCaseStore.delete via deleteVersionlessCase: refuses with CaseHoldsVersionsError
    if the case holds any version, refuses with CaseNotFoundError if the slug is unknown, otherwise removes
    hypothesis_revision_collects, hypothesis_revisions, hypotheses and the case row in FK order inside
    one transaction.'
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/case/case-store.port.ts: held at the return shape of assembleVersion, which yields one fully\
    \ assembled AssembledCaseVersion or nothing, alongside separate methods for hypothesis/manifest-entry\
    \ operations — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>;\n\
    src/persistence/relational-case-store.repository.ts: held at assembleWholeVersion, which reads the\
    \ version row and its whole manifest inside one transaction and returns nothing partial — const versionRow\
    \ = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);\nif (versionRow\
    \ === undefined) {\n  return undefined;\n}\nconst manifest = await readManifest(tx, key);\nreturn\
    \ assembledCaseVersionOf(key, versionRow, manifest);"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: true
  how: 'src/errors/status-map.ts: held at the fallback return of statusForError — return undefined;'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  conforms: false
  how: 'src/__tests__/unit/case/case-query.service.spec.ts, the same three violations assertions (lines
    533, 549 and 753), specifically the word naming the concept noun: the concept "${CONCEPT}" does not
    exist in the glossary — This file fixes, by hard equality, the exact string the error''s message carries
    — and that string names the noun this specification reserves one fixed Portuguese word for ("conceito")
    by its English word instead. A reader comparing this refusal against another that correctly says "conceito"
    has no way to tell whether the two speak of the same thing, which is exactly the confusion the fixed-vocabulary
    rule exists to close off.

    src/__tests__/unit/errors/case-holds-versions.error.spec.ts, line 18, inside the test "names the case
    slug in a Brazilian-Portuguese message that calls the case \"caso\" and never the English word \"case\"":
    expect(error.message).toMatch(/exclu[ií]do/i); — The node this test otherwise draws from requires
    only that the refusal name the case slug, write it in Brazilian Portuguese, and use "caso" rather
    than "case" — and its own Description states plainly that "how each message is built around these
    words stays free to be written and rewritten for clarity". A future message satisfying every one of
    those requirements but phrasing the refusal without the literal word "excluído"/"excluido" would fail
    this assertion though nothing the specification states would be violated — the suite polices a wording
    choice the specification explicitly leaves open.'
  observed_at:
  - src/errors/case-holds-versions.error.ts
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  conforms: false
  how: "src/__tests__/unit/case/case-query.service.spec.ts, the violations arrays pinned for a coherence\
    \ refusal of CaseVersionNotValidError, at the concept-violation assertion (line 533), the joined action-and-concept\
    \ assertion (lines 547-550), and the readCaseInputRequirements coherence assertion (lines 750-754):\
    \ violations: [`the concept \"${CONCEPT}\" does not exist in the glossary`],\nviolations: [\n  `the\
    \ action \"${ACTION}\" does not exist in the glossary`,\n  `the concept \"${CONCEPT}\" does not exist\
    \ in the glossary`,\n], — The same CaseVersionNotValidError whose message this file elsewhere pins\
    \ in Brazilian Portuguese for a missing-hypothesis violation ('o caso não declara nenhuma hipótese',\
    \ line 502, and asserted via .message at lines 850-853) is pinned here, by three separate assertions,\
    \ to carry an English sentence for a coherence violation. An operator reading a refusal that happens\
    \ to fail on a concept or action coherence rule is handed wording the specification's own constraint\
    \ says a domain refusal never carries, while the sibling structural refusal in the same file is correctly\
    \ Portuguese — the file itself is the inconsistency's only record."
  observed_at:
  - src/errors/case-holds-versions.error.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/delete-case.routes.ts: held at the 400 branch of deleteCaseHandler, lines 19-21 — return
    reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request path failed validation'',
    details: issues } });'
  encoded_at:
  - src/http/delete-case.routes.ts
- node: constraints/a-successful-case-deletion-answers-with-no-content
  conforms: true
  how: 'src/http/delete-case.routes.ts: held at the return statement that closes deleteCaseHandler, line
    24 — return reply.code(204).send();'
  encoded_at:
  - src/http/delete-case.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the CapabilityIdentityNotFoundError entry of STATUS_BY_ERROR_CLASS,
    line 55 — [CapabilityIdentityNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/case/delete-case.operation.ts: held at the single import at the top of the file — import type
    { ICaseStore } from ''./case-store.port.js'';


    src/errors/case-holds-versions.error.ts: held at nowhere to correct — the constraint is upheld by
    what the file omits: it carries no import statement anywhere and extends only the language''s built-in
    Error — export class CaseHoldsVersionsError extends Error {

    src/factories/build-app.factory.ts: held at composeResources (lines 72–101), where the DatabaseConnection
    is threaded only into factory calls that hand back typed ports — const capabilitiesReader = createCapabilitiesReader(connection);
    const capabilityRegistry = createCapabilityRegistry(connection, createConnectorConfigurationsReader(connection));'
  encoded_at:
  - src/case/delete-case.operation.ts
  - src/errors/case-holds-versions.error.ts
  - src/factories/build-app.factory.ts
  - src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  decided_by: reading
  remainder: testable
  remainder_why: A test over the four domain directories that resolves every relative import specifier
    of every file, and asserts that each one lands on a domain module or a *.port file, would close it.
    No specifier may resolve into persistence/, factories/, http/ or http-connector/. The input is the
    current tree and the expected result is an empty offender list. Whatever infrastructure adapters are
    still allowed to sit in these directories should be declared as infrastructure by that test rather
    than skipped by filename.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at draftConnectorConfigurationFromOpenApiDependencies,
    readOpenApiDocumentOperationsDependencies and draftCapabilitySchemaFromOpenApiDependencies — documentFetcher:
    new OpenApiDocumentFetcher(),'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources / registrationDependencies / removeConceptDependencies
    — registerConcept: (registration) => glossary.registerConcept(registration), removeConcept: (name)
    => glossary.removeConcept(name),

    src/http/build-app.ts: held at the routePluginFactories array entries wiring register-concept and
    remove-concept into the app — (dependencies) => createRegisterConceptRoutesPlugin(dependencies.registerConcept),
    (dependencies) => createRemoveConceptRoutesPlugin(dependencies.removeConcept),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies / listDependencies / registrationDependencies
    / removeCapabilityDependencies — readCapability: { capabilityQuery: resources.capabilityQuery }, listCapabilities:
    { capabilityQuery: resources.caseQuery ? undefined : resources.capabilityQuery, ...pagination },

    src/http/build-app.ts: held at the routePluginFactories array entries wiring read-capability, read-capability-by-identity,
    list-capabilities, register-capability and remove-capability into the app — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),
    (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),
    (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities), (dependencies)
    => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability), (dependencies) => createRemoveCapabilityRoutesPlugin(dependencies.removeCapability),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-schema-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories array entry wiring draft-capability-schema-from-openapi
    — (dependencies) => createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories array entry wiring draft-connector-configuration-from-openapi
    — (dependencies) => createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/factories/build-app.factory.ts, src/http/build-app.ts,
    and src/errors/status-map.ts read `nowhere` — [ConnectorConfigurationNotFoundError, 404],

    [ConnectorConfigurationNotWellFormedError, 422], — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: "src/factories/build-app.factory.ts: held at readOpenApiDocumentOperationsDependencies — function\
    \ readOpenApiDocumentOperationsDependencies(): Pick<BuildAppDependencies, 'readOpenApiDocumentOperations'>\
    \ {\n  const dependencies: ReadOpenApiDocumentOperationsControllerDependencies = { documentFetcher:\
    \ new OpenApiDocumentFetcher() };\nsrc/http/build-app.ts: held at the routePluginFactories array entry\
    \ wiring read-openapi-document-operations — (dependencies) => createReadOpenApiDocumentOperationsRoutesPlugin(dependencies.readOpenApiDocumentOperations),"
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/investigation/diagnosis
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — [SubjectDoesNotCoverCaseInputsError,
    422],

    [HypothesisNotInManifestError, 404],'
  observed_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies — readCaseInputRequirements: { caseInputRequirementsQuery:
    resources.caseInputRequirementsQuery },

    src/http/build-app.ts: held at the routePluginFactories array entry wiring read-case-input-requirements
    — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/case-store.port.ts: held at the ICaseStore method set, carrying most of the published\
    \ operations — createDraft(input: CreateDraftInput): Promise<number>;\n  insertHypothesisRevision(input:\
    \ HypothesisRevisionInput): Promise<number>;\n  placeHypothesis(input: PlaceHypothesisInput): Promise<void>;\n\
    \  removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void>;\n  release(slug:\
    \ string, version: number): Promise<void>;\n  discard(slug: string, version: number): Promise<void>;\n\
    \  updateDraft(slug: string, version: number, attributes: UpdateDraftInput): Promise<void>;\n  delete(slug:\
    \ string): Promise<void>;\nsrc/errors/status-map.ts: held at the CaseHoldsVersionsError, CaseAlreadyHasDraftError,\
    \ CaseHoldsNoDraftError and CaseVersionNotDraftError/CaseVersionNotDraftAtReleaseError entries, one\
    \ per operation this contract publishes — [CaseHoldsVersionsError, 409],\n[CaseAlreadyHasDraftError,\
    \ 409],\n[CaseHoldsNoDraftError, 409],\nsrc/factories/build-app.factory.ts: held at lifecycleDependencies,\
    \ wiring all nine of the contract's operations — createDraft: { createDraft: caseLifecycle.createDraft\
    \ }, release: { release: caseLifecycle.release, caseQuery }, deleteCase: { delete: caseLifecycle.delete\
    \ },\nsrc/factories/case-lifecycle.factory.ts: held at the CaseLifecycleOperations type (lines 22-31)\
    \ and the object createCaseLifecycle returns (lines 41-51) — eight of the contract's nine operations\
    \ are wired here (create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release, release-hypothesis,\
    \ discard, delete); update-draft is composed through a separate controller (src/http/update-draft.controller.ts,\
    \ src/http/update-draft.routes.ts) and was never part of this factory's surface — export type CaseLifecycleOperations\
    \ = {\n  readonly createDraft: (input: CreateDraftInput) => Promise<CreatedDraft>;\n  readonly reviseHypothesis:\
    \ (input: ReviseHypothesisInput) => Promise<RevisedHypothesis>;\n  readonly placeHypothesis: (input:\
    \ PlaceHypothesisInput) => Promise<void>;\n  readonly removeHypothesis: (input: RemoveHypothesisInput)\
    \ => Promise<void>;\n  readonly release: (slug: string, version: number) => Promise<void>;\n  readonly\
    \ releaseHypothesisRevision: (slug: string, hypothesisName: string, revision: number) => Promise<void>;\n\
    \  readonly discard: (slug: string, version: number) => Promise<void>;\n  readonly delete: (slug:\
    \ string) => Promise<void>;\n};\nsrc/http/build-app.ts: held at the routePluginFactories array entries\
    \ wiring all nine operations — create-draft, update-draft, release, release-hypothesis, discard, delete,\
    \ revise-hypothesis, place-hypothesis and remove-hypothesis — into the app — (dependencies) => createCreateDraftRoutesPlugin(dependencies.createDraft),\
    \ (dependencies) => createUpdateDraftRoutesPlugin(dependencies.updateDraft), (dependencies) => createReleaseRoutesPlugin(dependencies.release),\
    \ (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),\
    \ (dependencies) => createDiscardRoutesPlugin(dependencies.discard), (dependencies) => createDeleteCaseRoutesPlugin(dependencies.deleteCase),\
    \ (dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis), (dependencies)\
    \ => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis), (dependencies) => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),\n\
    src/http/delete-case.routes.ts: held at the route registration inside createDeleteCaseRoutesPlugin,\
    \ line 9 — app.delete(`${API_PREFIX}/cases/:slug`, (request, reply) => deleteCaseHandler(dependencies,\
    \ request, reply));\nsrc/persistence/relational-case-store.repository.ts: held at the class's write\
    \ methods implementing each published operation — public async createDraft(input: CreateDraftInput):\
    \ Promise<number> {\npublic async release(slug: string, version: number): Promise<void> {\npublic\
    \ async discard(slug: string, version: number): Promise<void> {\npublic async delete(slug: string):\
    \ Promise<void> {"
  encoded_at:
  - src/case/case-store.port.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/factories/case-lifecycle.factory.ts
  - src/http/build-app.ts
  - src/http/delete-case.routes.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-store.port.ts: held at the four listing methods and assembleVersion for the validated\
    \ whole read — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>;\n\
    \  findDraftVersion(slug: string): Promise<DraftVersion | undefined>;\n  listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>>;\n  listCaseVersions(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseVersionListItem>>;\n  listHypotheses(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<HypothesisIdentity>>;\n  listHypothesisRevisions(slug: string, hypothesisName:\
    \ string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\
    src/persistence/relational-case-store.repository.ts: held at assembleVersion (whole, validated read)\
    \ and the listCases/listCaseVersions/listHypotheses/listHypothesisRevisions methods — public async\
    \ assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined> {\n  return\
    \ runInTransaction(this.connection, raiseReadFailure, (tx) => assembleWholeVersion(tx, { slug, version\
    \ }));\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources / registrationDependencies / removeCapabilityDependencies
    — const conceptUsageReader = createConceptUsageReader(connection, capabilityRegistry);'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/factories/build-app.factory.ts, and src/http/build-app.ts
    read `nowhere` — (dependencies) => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),
    (dependencies) => createRemoveConnectorRoutesPlugin(dependencies.removeConnector), — this only wires
    the HTTP route plugins through to controller dependencies. — a binding asserts the file answers for
    the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-store.port.ts: held at CaseIdentity carries the slug; next_version is not represented\
    \ by any type in this file — export type CaseIdentity = {\n  readonly slug: string;\n};\nsrc/case/delete-case.operation.ts:\
    \ held at the deleteCase function, which is the file's whole content and invokes the case's delete\
    \ operation through the store port — export async function deleteCase(store: ICaseStore, slug: string):\
    \ Promise<void> {\n  await store.delete(slug);\n}\n\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at caseIdentityStatement (slug identity) and nextVersionUpdateStatement (the next_version counter),\
    \ and deleteVersionlessCase (the delete operation) — return { text: `INSERT INTO ${CASES_TABLE} (slug)\
    \ VALUES ($1) ON CONFLICT (slug) DO NOTHING`, params: [slug] };\ntext: `UPDATE ${CASES_TABLE} SET\
    \ next_version = next_version + 1 WHERE slug = $1 RETURNING next_version - 1 AS version`,"
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/delete-case.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseSummary type — export type CaseSummary = {\n  readonly\
    \ current_state?: CaseVersionState;\n  readonly version_count: number;\n  readonly last_updated?:\
    \ string;\n  readonly title?: string;\n  readonly when_to_use?: string;\n  readonly released_version?:\
    \ number;\n};\nsrc/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf mapping\
    \ the computed summary fields — return {\n  slug: row.slug,\n  ...(row.current_state !== null ? {\
    \ current_state: caseVersionStateOf(row.current_state) } : {}),\n  version_count: Number(row.version_count),\n\
    \  ...(row.last_updated !== null ? { last_updated: row.last_updated.toISOString() } : {}),\n  ...(row.title\
    \ !== null ? { title: row.title } : {}),\n  ...(row.when_to_use !== null ? { when_to_use: row.when_to_use\
    \ } : {}),\n  ...(row.released_version !== null ? { released_version: row.released_version } : {}),\n\
    };"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/case/case-store.port.ts: held at the AssembledCaseVersion type — export type AssembledCaseVersion\
    \ = {\n  readonly slug: string;\n  readonly version: number;\n  readonly title: string;\n  readonly\
    \ when_to_use: string;\n  readonly authored_at: string;\n  readonly subject: string;\n  readonly fallback:\
    \ Resolution;\n  readonly consolidation_register?: ConsolidationRegister;\n  readonly state: CaseVersionState;\n\
    \  readonly released_at?: string;\n  readonly manifest: readonly ManifestEntry[];\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at ICaseVersionRow / assembledCaseVersionOf and the placeHypothesis/removeManifestEntry/updateDraft/release/discard\
    \ methods — return {\n  slug: key.slug,\n  version: key.version,\n  title: row.title,\n  when_to_use:\
    \ row.when_to_use,\n  authored_at: row.authored_at.toISOString(),\n  subject: row.subject,\n  fallback:\
    \ resolutionOf(row.fallback_outcome, row.fallback_action, row.fallback_recipient),\n  state: caseVersionStateOf(row.state),\n\
    \  manifest,\n};"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseVersionState type alias — export type CaseVersionState\
    \ = 'draft' | 'released';\nsrc/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE\
    \ constants and caseVersionStateOf's validation — const DRAFT_STATE: CaseVersionState = 'draft';\n\
    const RELEASED_STATE: CaseVersionState = 'released';\nfunction isCaseVersionState(value: string):\
    \ value is CaseVersionState {\n  return CASE_VERSION_STATE_VALUES.has(value);\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-store.port.ts: held at the HypothesisIdentity type — export type HypothesisIdentity\
    \ = {\n  readonly name: string;\n};\nsrc/persistence/relational-case-store.repository.ts: held at\
    \ hypothesisIdentityStatement and the insertRevision/overwriteRevision (revise) functions — return\
    \ { text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,\
    \ name) DO NOTHING`, params: [key.slug, key.hypothesis_name] };"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "migrations/0026-a-versionless-case-may-delete-released-collects.sql: held at the RULE's guard\
    \ on the revision's own released state, before it is let through to a delete — AND hr.state = 'released'\n\
    src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the overwrite-in-place\
    \ test, lines 1829-1854 — await store.overwriteHypothesisRevision({ slug, hypothesis_name: 'a-hypothesis',\
    \ revision, criterion: 'the replaced criterion', collects: [], resolution: aResolution(glossary) });\n\
    src/case/case-store.port.ts: held at the HypothesisRevisionContent type — export type HypothesisRevisionContent\
    \ = {\n  readonly hypothesis_name: string;\n  readonly revision: number;\n  readonly criterion: string;\n\
    \  readonly collects: readonly string[];\n  readonly resolution: Resolution;\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at IHypothesisRevisionRow / revisionInsertStatement / revisionOverwriteStatement / releaseHypothesisRevisionRow\
    \ — text: `INSERT INTO ${HYPOTHESIS_REVISIONS_TABLE}\n         (case_slug, hypothesis_name, revision,\
    \ criterion, resolution_outcome, resolution_action, resolution_recipient, state)\n       SELECT $1,\
    \ $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7\n       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n\
    \       WHERE case_slug = $1 AND hypothesis_name = $2\n       RETURNING revision`,"
  encoded_at:
  - migrations/0026-a-versionless-case-may-delete-released-collects.sql
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the draft/released
    state-reading tests, lines 592-658 — expect(page.data.every((item) => item.state === ''draft'')).toBe(true);

    src/case/case-store.port.ts: held at the HYPOTHESIS_REVISION_STATES constant and HypothesisRevisionState
    type — export const HYPOTHESIS_REVISION_STATES = [''draft'', ''released''] as const;

    export type HypothesisRevisionState = (typeof HYPOTHESIS_REVISION_STATES)[number];

    src/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_DRAFT_STATE/RELEASED_STATE
    constants and hypothesisRevisionStateOf''s validation — const HYPOTHESIS_REVISION_DRAFT_STATE: HypothesisRevisionState
    = ''draft'';

    const HYPOTHESIS_REVISION_RELEASED_STATE: HypothesisRevisionState = ''released'';'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/case/case-store.port.ts: held at the ManifestEntry type — export type ManifestEntry = {\n\
    \  readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at IManifestRow / manifestEntryOf / placeHypothesisStatement — function manifestEntryOf(row:\
    \ IManifestRow, collects: readonly string[]): ManifestEntry {\n  const hypothesisRevision: HypothesisRevisionContent\
    \ = { hypothesis_name: row.hypothesis_name, revision: row.revision, criterion: row.criterion, collects,\
    \ resolution: resolutionOf(row.resolution_outcome, row.resolution_action, row.resolution_recipient)\
    \ };\n  return { position: row.position, hypothesis_revision: hypothesisRevision };\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry, line 86 — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the VocabularyTermNotHeldError and ConceptNotHeldError entries,
    lines 51-52 — [ConceptNotHeldError, 404],

    [VocabularyTermNotHeldError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/status-map.ts, src/persistence/relational-case-store.repository.ts,
    and src/factories/build-app.factory.ts read `nowhere` — removeConcept: (name) => glossary.removeConcept(name),
    — a bare delegation — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: true
  how: 'src/errors/status-map.ts: held at the DuplicateGlossaryNameError entry, line 91 — [DuplicateGlossaryNameError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the MalformedCapabilityInputSchemaError entry, line 77 — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError
    entries — [ConnectorConfigurationNotWellFormedError, 422],

    [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the CapabilityNotRegisteredForTestError, CapabilityConnectorMismatchError
    entries — [CapabilityNotRegisteredForTestError, 404],

    [CapabilityConnectorMismatchError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the IncompleteConnectorConfigurationError entry — [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/status-map.ts, and src/factories/build-app.factory.ts
    read `nowhere` — readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow
    }, — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere for this node''s own refusal condition — [ConnectorPlaceholderOutsideInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    entries — [OpenApiDocumentNotFetchedError, 422],

    [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — [OpenApiDocumentNotReadableError,
    422],'
  observed_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — [OpenApiDocumentNotReadableError,
    422],'
  observed_at:
  - src/errors/status-map.ts
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  conforms: true
  how: 'src/errors/status-map.ts: held at the CapabilityCitedByEvidenceError entry — [CapabilityCitedByEvidenceError,
    409],'
  encoded_at:
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

    [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — [OpenApiDocumentNotFetchedError,
    422],'
  observed_at:
  - src/errors/status-map.ts
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
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the InvestigationWriteDeadlineExceededError entry — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: 'src/errors/status-map.ts: held at the ManifestWouldHoldNoHypothesisError entry — [ManifestWouldHoldNoHypothesisError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, catching\
    \ the one-draft-per-case constraint — function raiseCreateDraftFailure(slug: string): RaiseStoreError\
    \ {\n  return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)\
    \ : raiseWriteFailure(cause));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  conforms: false
  how: 'src/__tests__/unit/errors/case-holds-versions.error.spec.ts, line 36, inside the test "names the
    remaining version by its fixed Portuguese noun \"versão\"...": expect(error.message).toMatch(/\bversão\b/);
    — rules/knowledge/a-case-holding-no-version-may-be-deleted states only that the refusal''s message
    "names the case slug" — it says nothing about the message needing to also name the version. A refusal
    message that names the slug alone, in Portuguese, without "case", "draft" or "version" — fully satisfying
    every stated requirement — would fail this positive assertion, so the suite requires content the rule
    that governs the message never asked for.'
  observed_at:
  - migrations/0026-a-versionless-case-may-delete-released-collects.sql
  - src/case/case-store.port.ts
  - src/case/delete-case.operation.ts
  - src/errors/case-holds-versions.error.ts
  - src/errors/status-map.ts
  - src/factories/case-lifecycle.factory.ts
  - src/http/delete-case.routes.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s slug-ordered,
    paged subquery and outer ORDER BY — FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET
    $2) c

    ...

    ORDER BY c.slug`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at requireCaseIdentity / requireHypothesisIdentity\
    \ / requireVersionState — async function requireCaseIdentity(tx: IQueryable, slug: string): Promise<void>\
    \ {\n  const row = await queryOneOrAbsent<{ slug: string }>(tx, caseIdentitySelect(slug), raiseReadFailure);\n\
    \  if (row === undefined) {\n    throw new CaseNotFoundError(slug, NO_VERSION_NAMED);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s latest and released
    subqueries — SELECT DISTINCT ON (slug) slug, state, authored_at, COUNT(*) OVER (PARTITION BY slug)
    AS version_count

    FROM ${CASE_VERSIONS_TABLE}

    ORDER BY slug, version DESC'
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
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft, guarding updateDraftVersion/insertManifestEntry/deleteManifestEntry\
    \ — function refuseUnlessDraft(key: ICaseVersionKey, state: CaseVersionState): void {\n  if (state\
    \ !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n\
    }"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: "the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,\
    \ and src/case/case-store.port.ts read `nowhere` — release(slug: string, version: number): Promise<void>;\n\
    \  discard(slug: string, version: number): Promise<void>; — a binding asserts the file answers for\
    \ the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped\
    \ here"
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement's monotonic\
    \ increment — text: `UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug\
    \ = $1\n       RETURNING next_version - 1 AS version`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
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
  how: "src/persistence/relational-case-store.repository.ts, the overwriteRevision function, lines 797-804\
    \ (contrast with insertRevision, lines 741-751): async function overwriteRevision(tx: IQueryable,\
    \ input: OverwriteHypothesisRevisionInput): Promise<void> {\n  const key: IRevisionKey = { slug: input.slug,\
    \ hypothesis_name: input.hypothesis_name, revision: input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input),\
    \ raiseOverwriteFailure(input));\n  await runStatement(tx, revisionCollectsDeleteStatement(key), raiseWriteFailure);\n\
    \  for (const conceptName of input.collects) {\n    await runStatement(tx, revisionCollectStatement(key,\
    \ conceptName), raiseWriteFailure);\n  }\n} — A hypothesis-revision left in draft state can outlive\
    \ the one draft that ever revised it — the node this finding is about states plainly that a case emptied\
    \ by discarding its one draft \"can still be named by hypotheses nothing else can ever take down,\"\
    \ and that a-hypothesis-is-revised-only-against-its-cases-draft \"refuses even that once the case\
    \ holds no draft.\" insertRevision, a few lines above in this same file, enforces exactly that refusal\
    \ by calling requireCaseHoldsDraft(tx, input.slug) before writing; overwriteRevision performs the\
    \ equivalent write — replacing an existing revision's content in place — with no such call and no\
    \ table in its statements (hypothesis_revisions, hypothesis_revision_collects) that references case_versions\
    \ at all. A curator who overwrites an orphaned draft-state revision after its case's one draft was\
    \ discarded meets no CaseHoldsNoDraftError here, so the refusal the specification names for revising\
    \ without a draft binds one of this file's two revise paths and not the other."
  observed_at:
  - src/case/case-store.port.ts
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement''s ON
    CONFLICT (case_slug, name) — text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1,
    $2) ON CONFLICT (case_slug, name) DO NOTHING`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/errors/status-map.ts: held at the ManifestPositionOccupiedError entry — [ManifestPositionOccupiedError,\
    \ 409],\nsrc/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure,\
    \ catching the position-unique constraint — function raisePlaceHypothesisFailure(input: PlaceHypothesisInput):\
    \ RaiseStoreError {\n  return (cause) =>\n    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n\
    \      ? new ManifestPositionOccupiedError(input.slug, input.version, input.position)\n      : raiseWriteFailure(cause);\n\
    }"
  encoded_at:
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at overwriteRevision (in-place update,\
    \ revision number untouched) refused by the DB when the target is released, and insertRevisionRow\
    \ (create-next-revision path) — function isReleasedRevisionRefusal(cause: unknown): boolean {\n  return\
    \ cause instanceof Error && cause.message === 'ReleasedHypothesisRevisionNotAlterableError';\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/errors/status-map.ts: held at the HypothesisRevisionNotDraftAtReleaseError entry — [HypothesisRevisionNotDraftAtReleaseError,\
    \ 409],\nsrc/factories/case-lifecycle.factory.ts: held at nowhere — the factory forwards to releaseHypothesisRevisionOperation\
    \ without stating the draft-to-released transition or its refusal itself — releaseHypothesisRevision:\
    \ (slug, hypothesisName, revision) =>\n      releaseHypothesisRevisionOperation.releaseHypothesisRevision(slug,\
    \ hypothesisName, revision),\nsrc/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow\
    \ / refuseUnlessHypothesisRevisionDraftAtRelease — function refuseUnlessHypothesisRevisionDraftAtRelease(state:\
    \ HypothesisRevisionState | undefined): void {\n  if (state !== HYPOTHESIS_REVISION_DRAFT_STATE) {\n\
    \    throw new HypothesisRevisionNotDraftAtReleaseError();\n  }\n}"
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/case-lifecycle.factory.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement''s COALESCE(MAX(revision),
    0) + 1 — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect's descending\
    \ order — SELECT revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state\n       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n       WHERE case_slug = $1 AND hypothesis_name\
    \ = $2\n       ORDER BY revision DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: "src/case/case-store.port.ts: held at the HypothesisRevisionListItem type — export type HypothesisRevisionListItem\
    \ = {\n  readonly revision: number;\n  readonly criterion: string;\n  readonly collects: readonly\
    \ string[];\n  readonly resolution: Resolution;\n  readonly state: HypothesisRevisionState;\n};\n\
    src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf including\
    \ each revision's state — return {\n  revision: row.revision,\n  criterion: row.criterion,\n  collects,\n\
    \  resolution: resolutionOf(row.resolution_outcome, row.resolution_action, row.resolution_recipient),\n\
    \  state: hypothesisRevisionStateOf(row.state),\n};"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and manifestCopyStatement\
    \ — text: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name,\
    \ revision, position)\n       SELECT case_slug, $2, hypothesis_name, revision, position\n       FROM\
    \ ${CASE_VERSION_HYPOTHESES_TABLE}\n       WHERE case_slug = $1 AND case_version = $3`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the overwrite-against-released-revision
    test, lines 2119-2154 — await expect(rejection).rejects.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError);

    src/errors/status-map.ts: held at the ReleasedHypothesisRevisionNotAlterableError entry — [ReleasedHypothesisRevisionNotAlterableError,
    409],'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement''s ON CONFLICT
    (slug) — INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING'
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
  how: "src/case/case-store.port.ts: held at listCaseVersions and assembleVersion, accepting any version\
    \ number — listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;\n\
    src/persistence/relational-case-store.repository.ts: held at the absence of any deletion of a released\
    \ case_versions row — deleteCaseVersionStatement is only ever reached from discardDraft, itself guarded\
    \ by refuseUnlessDraft — async function discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void>\
    \ {\n  refuseUnlessDraft(key, await requireVersionState(tx, key));\n  await runStatement(tx, deleteManifestEntriesStatement(key),\
    \ raiseWriteFailure);\n  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n\
    }"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at manifestSelect''s ORDER BY cvh.position
    — FROM ${CASE_VERSION_HYPOTHESES_TABLE} cvh

    JOIN ${HYPOTHESIS_REVISIONS_TABLE} hr ...

    WHERE cvh.case_slug = $1 AND cvh.case_version = $2

    ORDER BY cvh.position`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere directly — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  conforms: false
  how: "the fact left part of its ground: still held in src/factories/case-lifecycle.factory.ts, and src/case/delete-case.operation.ts\
    \ read `nowhere` — export async function deleteCase(store: ICaseStore, slug: string): Promise<void>\
    \ {\n  await store.delete(slug);\n}\n; src/http/delete-case.routes.ts read `nowhere` — await handleDeleteCaseRequest(dependencies,\
    \ parsedParams.data); — the same delegation; nothing in this file names acceptance, the case listing,\
    \ or slug reuse the scenario describes. — a binding asserts the file answers for the node, so the\
    \ pair that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/case/delete-case.operation.ts
  - src/factories/case-lifecycle.factory.ts
  - src/http/delete-case.routes.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s separate released
    subquery feeding title/when_to_use/released_version — SELECT DISTINCT ON (slug) slug, version, title,
    when_to_use

    FROM ${CASE_VERSIONS_TABLE}

    WHERE state = $3

    ORDER BY slug, version DESC'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionStatement,\
    \ which touches only hypothesis_revisions — text: `UPDATE ${HYPOTHESIS_REVISIONS_TABLE} SET state\
    \ = $4\n       WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at insertRevisionRow''s next-revision
    creation, in draft state — params: [input.slug, input.hypothesis_name, input.criterion, outcome, action,
    recipient, HYPOTHESIS_REVISION_DRAFT_STATE],'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/persistence/relational-case-store.repository.ts
  where: the hypothesesPageSelect function, lines 482-487
  evidence: SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 ORDER BY name LIMIT $2 OFFSET $3
  cost: Alphabetical-by-name is a business decision about which of a case's hypotheses a curator reaches
    first when paging list-hypotheses — the same kind of decision the specification made explicitly for
    the case catalog (rules/knowledge/a-case-listing-answers-cases-in-slug-order) and for a hypothesis's
    own revisions (rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first), each
    reasoning that an order "left undeclared... would be whatever the storage's own arrangement returned."
    Here the order is fixed by this SQL alone; a reader auditing what order list-hypotheses answers in
    finds the decision nowhere in the specification and has to reverse-engineer it from this query.
unbound:
- src/__tests__/integration/http/delete-case.routes.spec.ts
- src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/release.operation.spec.ts
- src/__tests__/unit/errors/case-holds-versions.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/delete-case.routes.spec.ts
- src/__tests__/unit/http/discard.routes.spec.ts
- src/__tests__/unit/http/update-draft.routes.spec.ts
- src/http/delete-case.controller.ts
- src/http/dto/delete-case.dto.ts
notes: 'Judged by 23 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-deletion-backend.returns/.

  Certification of constraints/the-domain-depends-on-no-infrastructure did not hold: the auditor answered
  `partial` — The package half of the fact is exercised. The tests read every .ts file in case/, glossary/,
  capability-registry/ and investigation/. None of those directories has subdirectories, and an empty
  read makes the test throw rather than pass. The forbidden lists hold every infrastructure package the
  target depends on (fastify, pg, @anthropic-ai/sdk), so a direct import of any of them from a domain
  module fails.

  The second half, "infrastructure reaches it only through ports", is guarded only over a fixed list of
  named modules: the connection module, the connector-configuration store and its relational repository,
  the connector-request-resolver and call-descriptor, the resolver''s two errors, and the HTTP declarative
  adapter. A domain module that imported any other concrete infrastructure module would pass every test
  in the set, and through it could reach pg or fastify transitively. Examples are a relational *.repository
  under persistence/ other than the connector-configuration one, anything under factories/ or http/, or
  http-connector/connector-http-issuer.

  The provider-client check exempts two files in investigation/ by filename alone. A file with either
  name is exempt whatever it holds, so whether those files stay infrastructure rather than domain is not
  asserted.

  The connector-configuration-store test goes further than the node. It forbids importing connector-configuration-store.port,
  which is a port, and the node allows infrastructure to reach the domain through ports.

  The test "the connection module sits under persistence/, beside the relational store repositories, rather
  than under any of the four audited domain directories" asserts only that two files exist in persistence/.
  It cannot fail when a domain module imports infrastructure, so it bears on nothing here.. The node is
  decided by reading, and a certification standing on it from an earlier reconciliation is released by
  the bind. The remainder is testable: A test over the four domain directories that resolves every relative
  import specifier of every file, and asserts that each one lands on a domain module or a *.port file,
  would close it. No specifier may resolve into persistence/, factories/, http/ or http-connector/. The
  input is the current tree and the expected result is an empty offender list. Whatever infrastructure
  adapters are still allowed to sit in these directories should be declared as infrastructure by that
  test rather than skipped by filename..

  Certification of rules/knowledge/a-case-holding-no-version-may-be-deleted did not hold: the auditor
  answered `partial` — The accept half is exercised. A delete of a case with no version answers 204, and
  the case, its hypotheses, its hypothesis-revisions (released in the HTTP test, released and draft in
  the store test) and the collect the released revision held are all read back as gone. The refusal half
  is exercised for a case holding a draft and for a case holding a released version: 409, error code CaseHoldsVersionsError,
  details equal to exactly { slug }, and the case still held. One part goes unexercised: that the refusal''s
  message names the case slug. The HTTP test checks the message only against /\bcaso\b/ and against the
  absence of /\bcase\b/i. Nothing in the set checks that the message contains the slug. The store test
  checks the error''s context, not its message. A refusal whose message left the slug out would pass every
  named test, even though the HTTP test''s own name says the message names the slug. Separately, as a
  finding for a reader to route and not as extra coverage: the HTTP test''s message assertions (the Portuguese
  word "caso" present, the English "case" absent) check a message language this node does not state..
  The node is decided by reading, and a certification standing on it from an earlier reconciliation is
  released by the bind. The remainder is testable: One input against one result, for each refusal: an
  HTTP DELETE of a case holding a draft version, and one of a case holding a released version, each asserting
  that body.error.message contains that case''s slug..

  Certification of scenarios/knowledge/a-case-holding-no-version-is-deleted held (src/__tests__/integration/http/delete-case.routes.spec.ts,
  src/__tests__/integration/http/delete-case.routes.spec.ts would fail if the fact stopped holding) and
  is not written: the judgment did not clear the node, and a test-decided binding rests on a reading that
  did.

  Staged by a review over files a delivery wrote: every pair a delivery or a hand stamped was judged,
  and a pair was omitted only where a reconciliation''s judgment had cleared it at these very bytes; the
  plan''s node(s) rules/knowledge/a-case-holding-no-version-may-be-deleted, constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese,
  constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word, constraints/the-domain-depends-on-no-infrastructure,
  domain/knowledge/case, domain/knowledge/case-version, domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision,
  rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, constraints/a-successful-case-deletion-answers-with-no-content,
  scenarios/knowledge/a-case-holding-no-version-is-deleted, contracts/knowledge/case-lifecycle, rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug,
  rules/knowledge/a-slug-identifies-one-case, constraints/a-malformed-request-is-refused-with-a-validation-error
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 11 opened across 9 of 23 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-deletion-backend.returns/`, which are the evidence behind every entry above.
