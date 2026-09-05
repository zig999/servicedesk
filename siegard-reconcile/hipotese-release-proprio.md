---
contract_version: siegard-reconcile/3
title: 'hipotese-release-proprio: release-gate and per-revision release backend delivery'
summary: 'The 11 tasks of the hipotese-release-proprio initiative together deliver: a hypothesis revision''s
  own overwrite/release state machine (store, overwrite-while-draft, refuse altering a released revision),
  a direct per-revision release operation and its HTTP endpoint, a case-version release gate refusing
  a release that manifests a still-draft revision, a revisions listing disclosing each revision''s own
  state, retirement of the obsolete manifest-basis assertions the new own-state gate replaced, and the
  fixture/seed repairs needed to keep the pre-existing suite green under the new gate.'
target: backend
files:
- path: migrations/0020-hypothesis-revision-own-state.sql
  change: New migration, applied after 0019 in filename order. Adds hypothesis_revisions.state TEXT NOT
    NULL DEFAULT 'draft' and a CHECK constraint (hypothesis_revisions_state_check) restricting it to draft/released.
    The header names every node it implements, explains the DEFAULT as a mechanical backfill for rows
    this migration did not create (matching the 0009/0011/0012 precedent), and records that this task
    deliberately leaves the release-conditioned immutability trigger, the overwrite gate and every read
    port untouched.
- path: migrations/0021-refuse-altering-a-released-revision.sql
  change: Replaces hypothesis_revisions_refuse_when_released() (bound, unchanged, to the existing hypothesis_revisions_no_update_when_released
    trigger) in place so its refusal condition reads OLD.state = 'released' instead of an EXISTS join
    through case_version_hypotheses and case_versions, and replaces hypothesis_revision_collects_no_delete_when_released
    the same way so its DELETE-refusal condition reads hypothesis_revisions.state for the collect row's
    own revision instead of joining out through the manifest to a case version's state. The RAISE EXCEPTION
    text ('ReleasedHypothesisRevisionNotAlterableError'), the trigger name, and the rule name are all
    unchanged, so no other file needed editing to keep translating the raw database error into the domain
    error and its HTTP 409.
- path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  change: Added a releaseRevisionDirectly(slug, hypothesisName, revision) helper doing the identical parameterized
    UPDATE, and called it right after each releaseOperation.release(...) in both tests, for every hypothesis-revision
    the released version manifests, so its own two collects-survive assertions still hold under the delivered
    state-only trigger.
- path: src/__tests__/integration/case/manifest-composition.operations.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/case/release.operation.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: placeFixtureHypotheses now returns the placed {hypothesis_name, revision} pairs it wrote; insertFixtureCase
    collects them and, after lifecycle.release(...), calls a new releaseManifestedRevisions(connection,
    slug, placed) that issues a direct parameterized UPDATE hypothesis_revisions SET state = 'released'
    per manifested revision — a direct SQL write against the test database, never through release.operation.ts.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: Deleted the it block titled "leaves an already-stored hypothesis revision's own columns unchanged
    after an ordinary UPDATE attempts to alter them, where a released case version's manifest references
    that revision" (previously lines 304-326), which inserted the revision through insertHypothesisRevision
    (no explicit state, defaulting to 'draft' per migration 0020), attached a released case version's
    manifest entry to it, and expected the UPDATE to be silently ineffective — a result the current state-only
    trigger (migration 0021) no longer produces. No other test in the file constructs or depends on this
    scenario; every remaining test is untouched.
- path: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  change: No longer asserts that a revision's collects survive an ordinary DELETE because a released case
    version's manifest references the revision. The one `it` block making that assertion (against a revision
    left at its default, unset state, which the current release-conditioned DELETE rule does not protect)
    is removed. The remaining two tests are untouched.
- path: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: Replaced the test titled "refuses an overwrite attempt against a revision a released case version
    still references through a distinguishable error, rather than surfacing it as an undifferentiated
    write failure" with a test titled "does not refuse an overwrite attempt against a hypothesis-revision
    whose own state is draft, even though a released case version's manifest still references that revision".
    The new test keeps the exact same fixture construction but asserts the overwrite succeeds and the
    stored criterion changed, rather than asserting any refusal. The sibling test asserting refusal from
    the revision's own released state is untouched.
- path: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  change: No longer asserts that an update is rejected, or that stored content is left unchanged, on the
    basis that a released case version's manifest references the revision. The two `it` blocks that made
    those assertions (against a hypothesis revision left at its default, unset state, which the current
    schema does not refuse at all) are removed. The four remaining tests are untouched.
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/integration/seed.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/http/build-app.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  change: written by the delivery of hipotese-release-proprio
- path: src/case/case-store.port.ts
  change: (hypothesis-revision-own-state/store-the-revisions-own-state) Declares HYPOTHESIS_REVISION_STATES
    and the derived HypothesisRevisionState type, mirroring the existing CaseVersionState/CASE_VERSION_STATES
    shape, as the named domain type for the new column's two values. | (revision-listing-state-disclosure/disclose-each-revisions-own-state)
    HypothesisRevisionListItem gained a readonly state field, typed as the same HypothesisRevisionState
    already exported from this file, alongside its existing revision, criterion, collects and resolution
    fields. No other type in this file changed.
- path: src/case/hypothesis-revision-own-state.port.ts
  change: New narrow, single-method read port. IHypothesisRevisionOwnStateQuery.readHypothesisRevisionOwnState(slug,
    hypothesisName, revision) answers the named hypothesis-revision's own state, or undefined when no
    such row exists. Imports only the HypothesisRevisionState type from case-store.port.js — no database
    driver, HTTP framework or LLM client.
- path: src/case/hypothesis-revision-release-state.port.ts
  change: 'HighestRevisionReleaseState''s revision-present branch now carries the revision''s own state:
    HypothesisRevisionState instead of a computed released_referenced: boolean; the port imports only
    that type from case-store.port.js.'
- path: src/case/hypothesis-revision-release.port.ts
  change: New narrow, single-method write port. IHypothesisRevisionRelease.releaseHypothesisRevision(slug,
    hypothesisName, revision) writes the transition; declares no import at all.
- path: src/case/release-hypothesis-revision.operation.ts
  change: New operation. ReleaseHypothesisRevisionOperation.releaseHypothesisRevision reads the revision's
    own state through IHypothesisRevisionOwnStateQuery, refuses with HypothesisRevisionNotDraftAtReleaseError
    unless that state is exactly 'draft', and otherwise calls IHypothesisRevisionRelease.releaseHypothesisRevision
    to write the transition. Depends on the store only through the ReleaseHypothesisRevisionStore intersection
    of the two new ports, never on the whole ICaseStore.
- path: src/case/release.operation.ts
  change: ReleaseOperation's constructor parameter widened from ICaseStore to ICaseStore and IHypothesisRevisionOwnStateQuery
    (structurally satisfied by the existing shared CaseStore instance the factory already passes, no factory
    edit needed). Added manifestOwnStateViolations(assembled, hypothesisRevisions), a new function that
    walks every assembled.manifest entry, reads its referenced hypothesis-revision's own state via readHypothesisRevisionOwnState(slug,
    hypothesisName, revision), and pushes a violation naming the hypothesis for every entry whose state
    is not exactly 'released'. releaseViolations now takes a ReleaseViolationSources object (glossary,
    capabilities, hypothesisRevisions) instead of two positional parameters, to stay within the three-positional-parameter
    limit while concatenating caseCoherenceViolations(...) and manifestOwnStateViolations(...) into the
    one array the existing single throw already consumes. No other function's behavior changed.
- path: src/case/revise-hypothesis.operation.ts
  change: writeRevision reads the highest revision's own state and branches on highest.state === 'draft'
    (overwrite in place, keeping the revision number) rather than on !released_referenced; falls through
    to insertHypothesisRevision for released, no-revision or unrecognized-shape reads alike.
- path: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  change: New domain error class. Takes no constructor argument, sets only name and message, and declares
    no context field at all — deliberately unlike every other error class in this directory.
- path: src/errors/status-map.ts
  change: Registers HypothesisRevisionNotDraftAtReleaseError at HTTP 409 in STATUS_BY_ERROR_CLASS, beside
    CaseVersionNotDraftAtReleaseError and ReleasedHypothesisRevisionNotAlterableError, the two existing
    409 entries for the same shape of refusal.
- path: src/factories/build-app.factory.ts
  change: lifecycleDependencies now also returns a releaseHypothesisRevision entry wrapping caseLifecycle.releaseHypothesisRevision,
    so buildAppDependencies (the one function diagnose-server.factory.ts and every other real assembly
    point calls before buildApp) supplies the new controller's dependency with no other call site needing
    a change.
- path: src/factories/case-lifecycle.factory.ts
  change: CaseLifecycleOperations gains a releaseHypothesisRevision method taking (slug, hypothesisName,
    revision) and answering Promise<void>. createCaseLifecycle constructs one ReleaseHypothesisRevisionOperation(caseStore),
    reusing the same caseStore instance every other lifecycle operation already shares, and exposes it
    through the returned operations object.
- path: src/factories/case-store.factory.ts
  change: Widened the exported CaseStore intersection type to add IHypothesisRevisionOwnStateQuery and
    IHypothesisRevisionRelease (RelationalCaseStore already implements both), so the single caseStore
    instance createCaseLifecycle already holds can also back ReleaseHypothesisRevisionOperation, with
    no second store construction.
- path: src/http/build-app.ts
  change: Imports ReleaseHypothesisRevisionControllerDependencies and createReleaseHypothesisRevisionRoutesPlugin;
    adds releaseHypothesisRevision to BuildAppDependencies; adds (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision)
    to routePluginFactories, beside the existing release entry.
- path: src/http/dto/release-hypothesis-revision.dto.ts
  change: New DTO file. releaseHypothesisRevisionParamsSchema is a zod object validating slug (non-empty
    string), name (non-empty string, matching the field name list-hypothesis-revisions.dto.ts already
    uses for the hypothesis name path segment) and revision (coerced to a positive integer), mirroring
    releaseParamsSchema's style. No body schema — the route accepts no payload.
- path: src/http/release-hypothesis-revision.controller.ts
  change: New pure controller. ReleaseHypothesisRevisionControllerDependencies exposes exactly CaseLifecycleOperations['releaseHypothesisRevision'].
    handleReleaseHypothesisRevisionRequest calls it with params.slug, params.name, params.revision in
    that order and returns nothing.
- path: src/http/release-hypothesis-revision.routes.ts
  change: New Fastify plugin factory. Registers POST /v1/cases/:slug/hypotheses/:name/revisions/:revision/release.
    Parses request.params with releaseHypothesisRevisionParamsSchema; on failure replies 400 with a VALIDATION_ERROR
    envelope carrying a message naming that the request path failed validation and a non-empty details
    list, issues built the same way release.routes.ts builds them. On success, awaits the controller and
    replies 204 with no body (the operation returns void and nothing about the released revision is echoed
    back), matching discard.routes.ts's own no-body-response shape.
- path: src/persistence/relational-case-store.repository.ts
  change: (hypothesis-revision-own-release/release-a-revision-directly) RelationalCaseStore now also implements
    IHypothesisRevisionOwnStateQuery and IHypothesisRevisionRelease. Adds the HYPOTHESIS_REVISION_RELEASED_STATE
    constant; readHypothesisRevisionOwnState/resolveHypothesisRevisionOwnState runs a plain SELECT state
    FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3 (reusing
    the existing hypothesisRevisionStateOf validator); releaseHypothesisRevision/releaseHypothesisRevisionRow
    runs a plain UPDATE hypothesis_revisions SET state = $4 WHERE case_slug = $1 AND hypothesis_name =
    $2 AND revision = $3, with no state condition in the WHERE clause and no join to case_versions or
    case_version_hypotheses anywhere in either statement. | (hypothesis-revision-own-state/overwrite-only-while-the-revision-is-draft)
    resolveHighestRevisionReleaseState/highestRevisionReleaseStateSelect now SELECT revision, state FROM
    hypothesis_revisions ... ORDER BY revision DESC LIMIT 1 (no join to case_version_hypotheses/case_versions,
    no CTE); added hypothesisRevisionStateOf/isHypothesisRevisionState (mirroring the existing caseVersionStateOf/isCaseVersionState
    pattern) and the HYPOTHESIS_REVISION_STATE_VALUES set built from the exported HYPOTHESIS_REVISION_STATES.
    | (hypothesis-revision-own-state/store-the-revisions-own-state) Imports HypothesisRevisionState, adds
    the HYPOTHESIS_REVISION_DRAFT_STATE constant, and extends revisionInsertStatement to name and bind
    the state column explicitly to 'draft' on every insert. overwriteRevision/revisionOverwriteStatement
    is unchanged — its UPDATE still never mentions state, so an overwritten row's own state column is
    left exactly as it was. | (revision-listing-state-disclosure/disclose-each-revisions-own-state) IHypothesisRevisionRow
    gained a readonly state string field. hypothesisRevisionsPageSelect's SQL now selects that column
    alongside revision, criterion, resolution_outcome, resolution_action and resolution_recipient, and
    its ORDER BY clause now reads 'ORDER BY revision DESC' rather than the prior ascending 'ORDER BY revision'.
    hypothesisRevisionListItemOf now sets the item's state field by passing row.state through the existing
    hypothesisRevisionStateOf validator (unchanged, already defined lower in this same file and already
    used by resolveHighestRevisionReleaseState and resolveHypothesisRevisionOwnState for the identical
    raw-string-to-typed-state conversion), so an unrecognized stored value raises the store's own read-failure
    error exactly as it already does for those two callers. No other statement, row shape or mapping function
    in this file changed.
- path: src/seed.ts
  change: The same shape of change as the fixture file — placeFixtureHypotheses returns the placed revisions,
    and seedCase calls the same releaseManifestedRevisions helper right after lifecycle.release(...),
    so a fresh run of the production seed script also leaves every manifested revision's own state released.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the first it(...)\
    \ block, line 213-224 — const query = createCaseQuery(connection); const result = await query.readCase(SLUG,\
    \ VERSION); expect(result.case.slug).toBe(SLUG); expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);\n\
    src/case/case-store.port.ts: held at assembleVersion's single AssembledCaseVersion return, with ManifestEntry\
    \ embedding the full HypothesisRevisionContent rather than a bare reference — assembleVersion(slug:\
    \ string, version: number): Promise<AssembledCaseVersion | undefined>;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembleWholeVersion, reading the version row and the whole manifest inside one transaction\
    \ — const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);\n\
    \  if (versionRow === undefined) {\n    return undefined;\n  }\n  const manifest = await readManifest(tx,\
    \ key);\n  return assembledCaseVersionOf(key, versionRow, manifest);\nsrc/seed.ts: held at nowhere\
    \ — this file writes fixture data, it does not implement the case-query read — async function seedCase(lifecycle:\
    \ CaseLifecycleOperations, connection: DatabaseConnection): Promise<void> {"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/release-hypothesis-revision.routes.ts: held at the parsedParams guard in releaseHypothesisRevisionHandler
    — if (!parsedParams.success) { const issues = parsedParams.error.issues.map((issue) => `${issue.path.join(''.'')}:
    ${issue.message}`); return reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the
    request path failed validation'', details: issues } }); }'
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: 'src/http/release-hypothesis-revision.routes.ts: held at the app.post registration — app.post(`${API_PREFIX}/cases/:slug/hypotheses/:name/revisions/:revision/release`,
    (request, reply) => releaseHypothesisRevisionHandler(dependencies, request, reply), );'
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 44 — [CapabilityIdentityNotFoundError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/case/hypothesis-revision-release-state.port.ts: held at the import statement, line 1, and
    the file''s own body — import type { HypothesisRevisionState } from ''./case-store.port.js'';

    src/case/revise-hypothesis.operation.ts: held at the whole file''s import list, lines 1-8 — import
    { CaseHoldsNoDraftError } from ''../errors/case-holds-no-draft.error.js'';

    import type { ConceptResolution, IGlossaryQuery } from ''../glossary/glossary-query.port.js'';

    import type { HypothesisRevisionInput, ICaseStore, OverwriteHypothesisRevisionInput } from ''./case-store.port.js'';'
  encoded_at:
  - src/case/hypothesis-revision-release-state.port.ts
  - src/case/revise-hypothesis.operation.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: "migrations/0020-hypothesis-revision-own-state.sql: held at the file's own two ALTER TABLE statements\
    \ — one plain numbered script applying its whole change automatically, no hand step — ALTER TABLE\
    \ hypothesis_revisions\n  ADD COLUMN state TEXT NOT NULL DEFAULT 'draft';\n\nALTER TABLE hypothesis_revisions\n\
    \  ADD CONSTRAINT hypothesis_revisions_state_check CHECK (state IN ('draft', 'released'));\n\nmigrations/0021-refuse-altering-a-released-revision.sql:\
    \ held at the whole file, as a plainly numbered script applying CREATE OR REPLACE statements — CREATE\
    \ OR REPLACE FUNCTION hypothesis_revisions_refuse_when_released()\nsrc/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts:\
    \ held at beforeAll's replay of every migration file in filename order, and the ordering test at the\
    \ end of the file — await applyMigrationFiles(client, await migrationFilesInOrder());"
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - migrations/0021-refuse-altering-a-released-revision.sql
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: "migrations/0020-hypothesis-revision-own-state.sql: held at the ADD COLUMN statement, lines 54-55\
    \ — ALTER TABLE hypothesis_revisions\n  ADD COLUMN state TEXT NOT NULL DEFAULT 'draft';"
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/case/release.operation.ts: held at the constructor''s dependency on the ICaseStore port and
    the final delegation to it, never a direct store or file write — private readonly caseStore: ICaseStore
    & IHypothesisRevisionOwnStateQuery, ... await this.caseStore.release(slug, version);

    src/factories/case-store.factory.ts: held at createCaseStore(), the factory''s return statement —
    return new RelationalCaseStore(connection);'
  encoded_at:
  - src/case/release.operation.ts
  - src/factories/case-store.factory.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at registrationDependencies(), line 128 — registerConcept:
    { registerConcept: resources.registerConcept },

    src/http/build-app.ts: held at the routePluginFactories entry for register-concept, line 128 — (dependencies)
    => createRegisterConceptRoutesPlugin(dependencies.registerConcept),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/factories/build-app.factory.ts: held at readDependencies() lines 87-88, listDependencies()\
    \ line 100, registrationDependencies() line 127 — readCapability: { capabilityQuery: resources.capabilityQuery\
    \ },\n    readCapabilityByIdentity: { readCapabilityByIdentity: resources.readCapabilityByIdentityOrThrow\
    \ },\nsrc/http/build-app.ts: held at the four routePluginFactories entries for read-capability, read-capability-by-identity,\
    \ list-capabilities and register-capability, lines 104-109 — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),\
    \ ..."
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/factories/build-app.factory.ts, and src/errors/status-map.ts
    read `nowhere` — const STATUS_BY_ERROR_CLASS: ReadonlyMap<DomainErrorClass, number> = new Map<DomainErrorClass,
    number>([ — a binding asserts the file answers for the node, so the pair that stopped holding it is
    released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: contracts/investigation/diagnosis
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — export function statusForError(error:
    unknown): number | undefined {'
  observed_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies(), line 90 — readCaseInputRequirements:
    { caseInputRequirementsQuery: resources.caseInputRequirementsQuery },

    src/http/build-app.ts: held at the routePluginFactories entry for read-case-input-requirements, line
    119 — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-store.port.ts, src/case/release-hypothesis-revision.operation.ts,
    src/case/release.operation.ts, src/case/revise-hypothesis.operation.ts, src/errors/hypothesis-revision-not-draft-at-release.error.ts,
    src/factories/build-app.factory.ts, src/factories/case-lifecycle.factory.ts, src/http/build-app.ts,
    src/http/dto/release-hypothesis-revision.dto.ts, src/http/release-hypothesis-revision.controller.ts,
    src/http/release-hypothesis-revision.routes.ts, src/persistence/relational-case-store.repository.ts,
    and src/errors/status-map.ts read `nowhere` — const STATUS_BY_ERROR_CLASS: ReadonlyMap<DomainErrorClass,
    number> = new Map<DomainErrorClass, number>([; src/factories/case-store.factory.ts read `nowhere`
    — export type CaseStore = ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite
    & IHypothesisRevisionOwnStateQuery & IHypothesisRevisionRelease; — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/case/case-store.port.ts
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/release.operation.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/factories/case-lifecycle.factory.ts
  - src/factories/case-store.factory.ts
  - src/http/build-app.ts
  - src/http/dto/release-hypothesis-revision.dto.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/http/release-hypothesis-revision.routes.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-store.port.ts: held at the assembleVersion, listCases, listCaseVersions, listHypotheses\
    \ and listHypothesisRevisions method signatures — listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;\n\
    src/persistence/relational-case-store.repository.ts: held at assembleVersion, listCases, listCaseVersions,\
    \ listHypotheses, listHypothesisRevisions — public async listHypothesisRevisions(\n    slug: string,\n\
    \    hypothesisName: string,\n    pagination: PaginationRequest,\n  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>\
    \ {"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'src/case/release-hypothesis-revision.operation.ts: held at the same method — no case or manifest
    is read or written — await this.caseStore.releaseHypothesisRevision(slug, hypothesisName, revision);

    src/case/release.operation.ts: held at releaseViolations aggregating structural, coherence and manifest-own-state
    violations into one refusal — if (violations.length > 0) { throw new CaseVersionNotReleasableError(slug,
    version, violations); }

    src/http/release-hypothesis-revision.routes.ts: held at the route registration exposing release independently
    of any case-version endpoint — app.post(`${API_PREFIX}/cases/:slug/hypotheses/:name/revisions/:revision/release`,
    (request, reply) =>'
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/release.operation.ts
  - src/http/release-hypothesis-revision.routes.ts
- node: domain/glossary/action
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the action-names assertion, ~line 256-261 — const
    { rows } = await connection.query<{ name: string }>(''SELECT name FROM actions WHERE name = ANY($1)'',
    [expected]);'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/concept
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the concept-fixture assertion, ~line 270-294 —
    ''SELECT name, ttl FROM concepts WHERE name = ANY($1)'''
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the two non-conclusion-outcome assertions, ~line
    224-239 — const nonConclusionNames = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name);

    src/seed.ts: held at the fixture data''s resolution outcomes — resolution: { outcome: ''confirmado'',
    ... }'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/seed.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the recipient-names assertion, ~line 263-268 —
    ''SELECT name FROM recipients WHERE name = ANY($1)'''
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the subject-type assertion, ~line 241-246 — ''SELECT
    name FROM subject_types WHERE name = ANY($1)'''
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/build-app.ts, and src/factories/build-app.factory.ts
    read `nowhere` — registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseIdentity type and the findDraftVersion method — findDraftVersion(slug:\
    \ string): Promise<number | undefined>;\nsrc/persistence/relational-case-store.repository.ts: held\
    \ at caseIdentityStatement and assignNextVersion — UPDATE ${CASES_TABLE} SET next_version = next_version\
    \ + 1\n           WHERE slug = $1\n           RETURNING next_version - 1 AS version"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseSummary type — readonly current_state?: CaseVersionState;\
    \ readonly version_count: number; readonly last_updated?: string; readonly title?: string; readonly\
    \ when_to_use?: string; readonly released_version?: number;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at caseCatalogEntryOf — return {\n    slug: row.slug,\n    ...(row.current_state !== null ?\
    \ { current_state: caseVersionStateOf(row.current_state) } : {}),\n    version_count: Number(row.version_count),"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the case-stored assertion, line 315-318 — const\
    \ stored = await createCaseStore(connection).assembleVersion(SLUG, VERSION);\nsrc/case/case-store.port.ts:\
    \ held at the AssembledCaseVersion, CreateDraftInput and UpdateDraftInput types — readonly version:\
    \ number; readonly title: string; readonly when_to_use: string; readonly authored_at: string; readonly\
    \ subject: string; readonly fallback: Resolution;\nsrc/case/release.operation.ts: held at assembledAsDocument's\
    \ mapping of the version's own attributes, including the conditional released_at — ...(assembled.released_at\
    \ !== undefined ? { released_at: assembled.released_at } : {}),\nsrc/case/revise-hypothesis.operation.ts:\
    \ held at refuseWithoutDraft, lines 47-52, which requires a draft version of the case to exist before\
    \ a revision is written — const draftVersion = await this.caseStore.findDraftVersion(slug);\n    if\
    \ (draftVersion === undefined) {\n      throw new CaseHoldsNoDraftError(slug);\n    }\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at ICaseVersionRow / assembledCaseVersionOf / draftInsertStatement — return {\n    slug: key.slug,\n\
    \    version: key.version,\n    title: row.title,\n    when_to_use: row.when_to_use,"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/case/case-store.port.ts
  - src/case/release.operation.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseVersionState type alias — export type CaseVersionState\
    \ = 'draft' | 'released';\nsrc/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE\
    \ constants and isCaseVersionState — function isCaseVersionState(value: string): value is CaseVersionState\
    \ {\n  return value === DRAFT_STATE || value === RELEASED_STATE;\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/case/case-store.port.ts: held at the HypothesisIdentity type — export type HypothesisIdentity
    = { readonly name: string; };

    src/case/revise-hypothesis.operation.ts: held at input.hypothesis_name, threaded through writeRevision,
    refuseEmptyCollects, refuseUnknownConcepts and refuseConceptsRefusingSubject — return { hypothesis_name:
    input.hypothesis_name, revision };

    src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement / insertRevisionRow
    — INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name)
    DO NOTHING'
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: false
  how: 'the fact left part of its ground: still held in migrations/0020-hypothesis-revision-own-state.sql,
    migrations/0021-refuse-altering-a-released-revision.sql, src/__tests__/integration/case/manifest-collects-survive-release.spec.ts,
    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts, src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts,
    src/__tests__/integration/persistence/relational-case-store.repository.spec.ts, src/case/case-store.port.ts,
    src/case/hypothesis-revision-own-state.port.ts, src/case/hypothesis-revision-release-state.port.ts,
    src/case/hypothesis-revision-release.port.ts, src/case/release-hypothesis-revision.operation.ts, src/case/revise-hypothesis.operation.ts,
    src/http/dto/release-hypothesis-revision.dto.ts, src/persistence/relational-case-store.repository.ts,
    src/seed.ts, and src/http/release-hypothesis-revision.controller.ts read `nowhere` — await dependencies.releaseHypothesisRevision(params.slug,
    params.name, params.revision); — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - migrations/0021-refuse-altering-a-released-revision.sql
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/revise-hypothesis.operation.ts
  - src/http/dto/release-hypothesis-revision.dto.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: "migrations/0020-hypothesis-revision-own-state.sql: held at the CHECK constraint, lines 57-58 —\
    \ ALTER TABLE hypothesis_revisions\n  ADD CONSTRAINT hypothesis_revisions_state_check CHECK (state\
    \ IN ('draft', 'released'));\nmigrations/0021-refuse-altering-a-released-revision.sql: held at the\
    \ same state comparisons, lines 39 and 68 — hr.state = 'released'\nsrc/__tests__/integration/case/manifest-collects-survive-release.spec.ts:\
    \ held at the constant used to drive the direct SQL state transition — const RELEASED_REVISION_STATE\
    \ = 'released';\nsrc/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the\
    \ RELEASED_REVISION_STATE constant, line 14, and the second test's assertion, line 241 — const RELEASED_REVISION_STATE\
    \ = 'released'; ... expect(rows.every((row) => row.state === RELEASED_REVISION_STATE)).toBe(true);\n\
    src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the state-column\
    \ assertions, e.g. line 636 — expect(page.data).toEqual([{ revision, criterion: 'a criterion', collects:\
    \ [], resolution: aResolution(glossary), state: 'released' }]);\nsrc/case/case-store.port.ts: held\
    \ at the HYPOTHESIS_REVISION_STATES constant and the HypothesisRevisionState type derived from it\
    \ — export const HYPOTHESIS_REVISION_STATES = ['draft', 'released'] as const;\nsrc/case/hypothesis-revision-release-state.port.ts:\
    \ held at the state field of the revision-present branch, line 5 — { readonly revision: number; readonly\
    \ state: HypothesisRevisionState }\nsrc/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_DRAFT_STATE/RELEASED_STATE,\
    \ hypothesisRevisionStateOf — function isHypothesisRevisionState(value: string): value is HypothesisRevisionState\
    \ {\n  return HYPOTHESIS_REVISION_STATE_VALUES.has(value);\n}\nsrc/seed.ts: held at releaseManifestedRevisions,\
    \ which moves each placed revision to released state — async function releaseManifestedRevisions(tx,\
    \ slug, placed) { /* UPDATE hypothesis_revisions SET state = $1 ... */ }"
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - migrations/0021-refuse-altering-a-released-revision.sql
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/case/case-store.port.ts: held at the ManifestEntry type — export type ManifestEntry = { readonly
    position: number; readonly hypothesis_revision: HypothesisRevisionContent; };

    src/case/release.operation.ts: held at assembledAsDocument''s manifest mapping, position paired with
    one referenced hypothesis-revision — manifest: assembled.manifest.map((entry) => ({ position: entry.position,
    hypothesis_name: entry.hypothesis_revision.hypothesis_name, revision: entry.hypothesis_revision.revision,

    src/persistence/relational-case-store.repository.ts: held at IManifestRow / manifestEntryOf / placeHypothesisStatement
    — return { position: row.position, hypothesis_revision: hypothesisRevision };'
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 69 — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: 'src/seed.ts: held at nowhere — this file seeds a case''s own hypotheses and revisions, not the
    outcome glossary''s own seeding — async function seedCase(lifecycle: CaseLifecycleOperations, connection:
    DatabaseConnection): Promise<void> {'
  encoded_at:
  - src/seed.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 62 — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries, lines 63-64 — [ConnectorConfigurationNotWellFormedError,
    422], [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 64 — [IncompleteConnectorConfigurationError,
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
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 66 — [ConnectorPlaceholderOutsideInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 65 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 45 — [HypothesisNotInManifestError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 70 — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure — return
    (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect — FROM (SELECT slug
    FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c ... ORDER BY c.slug'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest/released\
    \ subqueries — SELECT DISTINCT ON (slug) slug, state, authored_at,\n                    COUNT(*) OVER\
    \ (PARTITION BY slug) AS version_count\n             FROM ${CASE_VERSIONS_TABLE}\n             ORDER\
    \ BY slug, version DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the no-second-version assertion, line 352-356\
    \ — const secondVersion = await createCaseStore(connection).assembleVersion(SLUG, VERSION + 1); expect(secondVersion).toBeUndefined();\n\
    src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft guarding insertManifestEntry,\
    \ deleteManifestEntry and updateDraftVersion — function refuseUnlessDraft(key: ICaseVersionKey, state:\
    \ CaseVersionState): void {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug,\
    \ key.version, state);\n  }\n}\nsrc/seed.ts: held at nowhere — this file writes through the lifecycle\
    \ operations, which enforce this rule themselves — const draft = await lifecycle.createDraft(...)"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/case/case-store.port.ts: held at the release method signature and the CaseVersionState type
    name the subject and the trigger; the transition guard and refusal are not encoded in this file —
    release(slug: string, version: number): Promise<void>;

    src/case/release.operation.ts: held at refuseNonDraft — if (assembled.state !== ''draft'') { throw
    new CaseVersionNotDraftAtReleaseError(assembled.slug, assembled.version, assembled.state); }

    src/persistence/relational-case-store.repository.ts: held at releaseVersion / refuseUnlessDraftAtRelease
    / releaseStatement — UPDATE ${CASE_VERSIONS_TABLE} SET state = $3, released_at = NOW() WHERE slug
    = $1 AND version = $2'
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assignNextVersion — UPDATE ${CASES_TABLE}\
    \ SET next_version = next_version + 1\n           WHERE slug = $1\n           RETURNING next_version\
    \ - 1 AS version"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at refuseConceptsRefusingSubject / conceptsRefusingSubjectOf,
    lines 102-119, raising ConceptRefusesSubjectTypeError — const refusing = conceptsRefusingSubjectOf(resolutions,
    input.subject); if (refusing.length > 0) { throw new ConceptRefusesSubjectTypeError({

    src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 68 — [ConceptRefusesSubjectTypeError,
    422],'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the third it(...)
    block, lines 245-255 — expect(result.case.hypotheses.every((hypothesis) => hypothesis.collects.length
    >= 1)).toBe(true);

    src/case/revise-hypothesis.operation.ts: held at refuseEmptyCollects, lines 77-81 — if (input.collects.length
    === 0) { throw new HypothesisRevisionCollectsNoConceptError(input.slug, input.hypothesis_name); }

    src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 67 — [HypothesisRevisionCollectsNoConceptError,
    422],

    src/seed.ts: held at the fixture data''s collects arrays — collects: [''a-concept'']'
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: false
  how: 'src/case/revise-hypothesis.operation.ts, refuseWithoutDraft, lines 47-52, together with refuseConceptsRefusingSubject
    / conceptsRefusingSubjectOf, lines 102-119: const draftVersion = await this.caseStore.findDraftVersion(slug);
    if (draftVersion === undefined) { throw new CaseHoldsNoDraftError(slug); } ... const refusing = conceptsRefusingSubjectOf(resolutions,
    input.subject); — the draft version this operation itself fetches is discarded after the undefined
    check, and the concept-acceptance check is run against input.subject — a value the caller supplies
    independently on the input DTO — rather than against any attribute read off that draft version; a
    caller that supplies a subject other than the one the case''s own draft actually declares gets a check
    validated against a fabricated subject type, and nothing in this file would catch the mismatch.'
  observed_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement — INSERT
    INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure — isConstraintViolation(cause,\
    \ POSITION_UNIQUE_CONSTRAINT)\n      ? new ManifestPositionOccupiedError(input.slug, input.version,\
    \ input.position)\n      : raiseWriteFailure(cause);"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: false
  how: 'src/__tests__/integration/case/revise-hypothesis.operation.spec.ts, the it() title at lines 258-260:
    overwrites an already-named hypothesis''s own highest revision in place, keeping its revision number
    unchanged, when that revision is referenced by no case version in released state — A reader learning
    the overwrite/create branch''s governing condition from this title concludes it turns on whether a
    released case version''s manifest references the revision — exactly the manifest-reference coupling
    the node''s own description says the domain design removed. The same file states the correct condition
    (''own state'') accurately in five other titles, so this one title is the sole place in the file where
    the superseded model reads as the rule''s actual test subject.

    src/__tests__/integration/case/revise-hypothesis.operation.spec.ts, the it() title at lines 307-310,
    against its own assertion at lines 327-330: creates no revision at all — leaves the hypothesis holding
    only the revision it already had — when the highest existing revision''s own state is released and
    no case version''s manifest references it, other than the one draft revision the create branch itself
    just wrote ... expect(rows).toEqual([{ revision: 1, criterion: ''the original text'', state: ''released''
    }, { revision: 2, criterion: ''the created text'', state: ''draft'' }]); — The title asserts the revise
    ''creates no revision at all'' and ''leaves the hypothesis holding only the revision it already had,''
    while the test''s own query proves a second row — revision 2, draft — was created by that same revise.
    A reader relying on the title rather than the assertion would believe the create-the-next-revision
    branch never fires in this scenario, when the body is exactly the scenario where it does fire.'
  observed_at:
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts, the sixth `it` (lines\
    \ 271-283), 'refuses releasing a hypothesis-revision identity no row was ever stored for, with the\
    \ same HypothesisRevisionNotDraftAtReleaseError as one that exists but is already released': const\
    \ refusal = await operation.releaseHypothesisRevision(slug, 'a-never-stored-hypothesis', 1).catch((error:\
    \ unknown) => error);\n\n    expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\
    \ — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle states, as a decided\
    \ part of its own statement, that the state the revision stood in 'is released whenever this refusal\
    \ is raised' — a claim its decision-log entry grounds in the state machine holding only draft and\
    \ released. This test locks in a second trigger the rule never named — an identity no row was ever\
    \ stored for — so a reader trusting the rule's own text to know what the refusal implies would wrongly\
    \ conclude the revision was released, when the source's own test proves it may never have existed\
    \ at all.\nsrc/case/release-hypothesis-revision.operation.ts, the refuseNonDraft function, lines 25-29,\
    \ applied to a state read that may be undefined: function refuseNonDraft(state: HypothesisRevisionState\
    \ | undefined): void {\n  if (state !== DRAFT_STATE) {\n    throw new HypothesisRevisionNotDraftAtReleaseError();\n\
    \  }\n} — The rule's own statement grounds HypothesisRevisionNotDraftAtReleaseError's silence about\
    \ which state the revision stood in on a specific claim: the state the revision stood in is released\
    \ whenever this refusal is raised — and the decision log ties that to the enumeration holding exactly\
    \ draft and released, so a caller reading the error by the rule's own reasoning learns the identity\
    \ named a revision that exists and is already released. Here state is typed HypothesisRevisionState\
    \ | undefined, so the identical refusal also fires when readHypothesisRevisionOwnState finds no row\
    \ at all — a revision that was never released, or ever stored, at that identity. The refusal's documented\
    \ meaning stops matching what actually triggers it: a curator who mistyped a hypothesis name or revision\
    \ number reads the same signal as a curator who is one release too late.\nsrc/seed.ts, releaseManifestedRevisions(),\
    \ the raw SQL UPDATE moving each revision to released: UPDATE hypothesis_revisions SET state = $1\
    \ WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4 — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle\
    \ governs how a hypothesis revision's state changes; the operation layer already exposes releaseHypothesisRevision()\
    \ as the declared way to do this transition (delivered by release-a-revision-directly). This function\
    \ bypasses it with a direct UPDATE, so the seed script and the declared lifecycle operation are two\
    \ independent homes for the same transition, and a future change to the operation's own guard would\
    \ not apply here."
  observed_at:
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/case/release-hypothesis-revision.operation.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/status-map.ts
  - src/factories/case-lifecycle.factory.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/http/release-hypothesis-revision.routes.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: false
  how: 'the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,
    and src/case/revise-hypothesis.operation.ts read `nowhere` — return this.caseStore.insertHypothesisRevision(input);
    — number assignment is delegated whole to the store; this file names no number and reads none back
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect — ORDER\
    \ BY revision DESC\n           LIMIT $3 OFFSET $4"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/case/case-store.port.ts: held at the HypothesisRevisionListItem type''s state field — readonly
    state: HypothesisRevisionState;

    src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf — state:
    hypothesisRevisionStateOf(row.state),'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion / manifestCopyStatement
    — SELECT MAX(version) AS version FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND state = $2'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: 'src/case/release.operation.ts: held at the violations.length guard, which only ever refuses when
    at least one violation was named — if (violations.length > 0) { throw new CaseVersionNotReleasableError(slug,
    version, violations); }'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: false
  how: "src/seed.ts, seedCase(), the release ordering at the placeFixtureHypotheses/lifecycle.release/releaseManifestedRevisions\
    \ sequence: const placed = await placeFixtureHypotheses(fixture.slug, draft.version);\n  await lifecycle.release(fixture.slug,\
    \ draft.version);\n  await releaseManifestedRevisions(connection, fixture.slug, placed); — rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions\
    \ requires a release to be refused whenever the version's manifest still names a draft hypothesis\
    \ revision. Here the case-version release (lifecycle.release) runs before the manifested revisions\
    \ are moved to released (releaseManifestedRevisions runs after), so at the moment of release every\
    \ manifested revision is still draft — the exact state this rule exists to refuse. Either the gate\
    \ this initiative just delivered does not apply here for a reason nothing in this file states, or\
    \ the seed script releases a case version the rule says must be refused."
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/release.operation.ts
  - src/seed.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: "migrations/0021-refuse-altering-a-released-revision.sql, the CREATE OR REPLACE RULE hypothesis_revision_collects_no_delete_when_released,\
    \ lines 60-70: CREATE OR REPLACE RULE hypothesis_revision_collects_no_delete_when_released AS\n  ON\
    \ DELETE TO hypothesis_revision_collects\n  WHERE EXISTS (\n    SELECT 1\n    FROM hypothesis_revisions\
    \ hr\n    WHERE hr.case_slug = OLD.case_slug\n      AND hr.hypothesis_name = OLD.hypothesis_name\n\
    \      AND hr.revision = OLD.revision\n      AND hr.state = 'released'\n  )\n  DO INSTEAD NOTHING;\n\
    \ — A DELETE issued against a released revision's own collects rows completes with no exception and\
    \ no error at all — the statement simply affects zero rows — so nothing translates it into ReleasedHypothesisRevisionNotAlterableError\
    \ or an HTTP 409; the same alteration attempt the trigger above refuses loudly is, for the collects\
    \ half of the revision's own declared content, accepted and left with no effect, which is the exact\
    \ outcome the node names as what refusal must replace rather than reproduce.\nsrc/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,\
    \ the fourth it(...) block, lines 257-278: for (const entry of fixture.manifest) {\n  await connection.query(\n\
    \    'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n \
    \   [SLUG, entry.hypothesis_name],\n  );\n}\n\nfor (const entry of fixture.manifest) {\n  const {\
    \ rows } = await connection.query<{ concept_name: string }>(\n    'SELECT concept_name FROM hypothesis_revision_collects\
    \ WHERE case_slug = $1 AND hypothesis_name = $2',\n    [SLUG, entry.hypothesis_name],\n  );\n  expect(rows.map((row)\
    \ => row.concept_name).sort()).toEqual([...entry.collects].sort());\n}\n — By this point every revision\
    \ named in the fixture's manifest has been released, so this test attempts a DELETE against a released\
    \ hypothesis-revision's own stored content — its collects. The query is awaited with no try/catch\
    \ and no rejection assertion, and the test then asserts the rows are unchanged: it locks in, as verified\
    \ passing behavior, that this alteration attempt is silently accepted and left with no effect. The\
    \ decision log for this node records exactly the opposite as decided: refused at the point of the\
    \ attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError, rather\
    \ than accepted and left with no effect. A reader trusting this suite comes away believing the silent-no-op\
    \ protection is the correct, specified behavior for altering a released revision's content, when the\
    \ specification explicitly rejected that shape.\nsrc/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts,\
    \ the test titled \"changes an already-stored hypothesis revision's own columns on an ordinary UPDATE\
    \ when no released case version references it\", lines 287-302: it(\"changes an already-stored hypothesis\
    \ revision's own columns on an ordinary UPDATE when no released case version references it\", async\
    \ () => { — beforeAll applies every migration file in the directory, including 0021, which replaces\
    \ the trigger's condition from a join against case_version_hypotheses/case_versions to OLD.state =\
    \ 'released' on the revision's own column — the join this title still names is gone by the time this\
    \ suite runs. A reader trusting this title to state what actually gates the write learns a mechanism\
    \ this schema no longer implements; the row is in fact mutable here only because insertHypothesisRevision\
    \ leaves state at its DEFAULT 'draft', never because any case version does or doesn't reference it.\n\
    src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts, the last\
    \ `it` block (lines 259-276), \"reads back a released hypothesis-revision's own collects exactly as\
    \ they were stored, after an ordinary DELETE against those exact rows is attempted\": await client.query(\n\
    \      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND\
    \ revision = 1',\n      [slug, 'the-hypothesis'],\n    );\n\n    const collects = await readRevisionCollects(client,\
    \ { slug, hypothesisName: 'the-hypothesis', revision: 1 });\n    expect(collects).toEqual(['a-collected-concept']);\n\
    \ — The suite asserts, without wrapping the DELETE in a rejection expectation the way the two UPDATE\
    \ tests in the very same file do, that removing a released revision's own collect succeeds silently\
    \ and simply has no visible effect. A reader of this file learns that a released revision's stored\
    \ content is protected by silent no-ops for its collects and by an explicit ReleasedHypothesisRevisionNotAlterableError\
    \ refusal for its criterion — two different answers to the same guarantee, with the silent one going\
    \ undetected by anything that checks for an error the way the sibling tests do."
  observed_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at the return statement of reviseHypothesis, line
    35 — return { hypothesis_name: input.hypothesis_name, revision };'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,
    and src/case/release.operation.ts read `nowhere` — public async release(slug: string, version: number):
    Promise<void> { — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at refuseUnknownConcepts / unknownConceptsOf, lines
    87-96, raising ConceptNotInGlossaryError — const unknown = unknownConceptsOf(resolutions); if (unknown.length
    > 0) { throw new ConceptNotInGlossaryError(input.slug, input.hypothesis_name, unknown);

    src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 46 — [ConceptNotInGlossaryError,
    404],'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/case/case-store.port.ts: held at the assembleVersion and listCaseVersions methods, addressed\
    \ by version number rather than only the latest — listCaseVersions(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseVersionListItem>>;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at discardDraft, which only ever removes a version guarded to draft state — async function\
    \ discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key, await\
    \ requireVersionState(tx, key));\n  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n\
    \  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at manifestSelect — ORDER BY cvh.position'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/release.operation.ts: held at releaseViolations passing the live capabilities port into
    caseCoherenceViolations on every call — ...(await caseCoherenceViolations(structural.theCase, sources.glossary,
    sources.capabilities)),'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the first it(...)
    block, line 214-223, via createCaseQuery''s real wiring — ''reads the fixture case whole, with no
    coherence violation, through the real case-query wiring over the fixture''s own glossary and capability
    data'', async () => { const query = createCaseQuery(connection); const result = await query.readCase(SLUG,
    VERSION);

    src/case/release.operation.ts: held at release() recomputing releaseViolations fresh on every invocation,
    with nothing cached — const violations = await releaseViolations(assembled, { glossary: this.glossary,
    capabilities: this.capabilities, hypothesisRevisions: this.caseStore, });

    src/seed.ts: held at nowhere — this file writes fixture data, it performs no read — async function
    seedCase(lifecycle: CaseLifecycleOperations, connection: DatabaseConnection): Promise<void> {'
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/release.operation.ts
  - src/seed.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 69 — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry, line 65 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's \"released\" subquery\
    \ — SELECT DISTINCT ON (slug) slug, version, title, when_to_use\n             FROM ${CASE_VERSIONS_TABLE}\n\
    \             WHERE state = $3\n             ORDER BY slug, version DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at writeRevision, lines 38-45, the same overwrite
    branch — await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input, highest.revision));
    return highest.revision;'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/hypothesis-revision-own-state.port.ts,
    src/case/hypothesis-revision-release.port.ts, src/case/release-hypothesis-revision.operation.ts, src/http/release-hypothesis-revision.controller.ts,
    src/persistence/relational-case-store.repository.ts, and src/http/release-hypothesis-revision.routes.ts
    read `nowhere` — await handleReleaseHypothesisRevisionRequest(dependencies, parsedParams.data); return
    reply.code(204).send(); — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/case/release-hypothesis-revision.operation.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/http/release-hypothesis-revision.routes.ts
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/case/release.operation.ts: held at manifestOwnStateViolations iterating every manifest entry
    rather than stopping at the first violation — for (const entry of assembled.manifest) {'
  encoded_at:
  - src/case/release.operation.ts
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  conforms: false
  how: 'no named file holds this fact now: src/case/revise-hypothesis.operation.ts read `nowhere` — this
    file never reads or freezes a case version''s own manifest at release; it only writes hypothesis-revision
    content'
  observed_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at writeRevision''s fall-through, line 44 — return
    this.caseStore.insertHypothesisRevision(input);

    src/persistence/relational-case-store.repository.ts: held at insertRevisionRow, invoked by the operation
    layer when the highest existing revision is released — SELECT $1, $2, COALESCE(MAX(revision), 0) +
    1, $3, $4, $5, $6, $7'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
  where: the test 'does not refuse removing a hypothesis name that is not part of the manifest, even where
    the manifest holds only one entry', lines 278-287
  evidence: 'await expect(removeHypothesis(store, { slug, version, hypothesis_name: ''never-placed'' })).resolves.toBeUndefined();'
  cost: the decision that remove-hypothesis silently succeeds (rather than refusing, e.g. with a not-found
    error) for a hypothesis name never placed in the manifest lives only in this test and in the operation's
    own implementation; a reader consulting the specification for what remove-hypothesis answers on an
    absent hypothesis name finds nothing, and a later change making that call refuse instead would break
    no documented contract
- file: src/__tests__/integration/case/release.operation.spec.ts
  where: line 306, the assertion in "refuses releasing a version that is not in draft state..."
  evidence: 'expect((refusal as CaseVersionNotDraftAtReleaseError).context).toEqual({ slug, version, state:
    ''released'' });'
  cost: the test binds CaseVersionNotDraftAtReleaseError's refusal to a specific context shape — slug,
    version and the state the version stood in — as a fact of the domain; the specification's own state-machine
    node for this exact refusal states only the error identity and its HTTP status, and its sibling rule
    for the analogous hypothesis-revision refusal explicitly decided the refusal carries no further value
    at all, in particular never the state. A reader who wants to know what a case-version lifecycle refusal
    discloses will look at the node and find nothing said either way, while this test has already made
    the decision for it.
- file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  where: the test title (line 12) and its assertion (line 15)
  evidence: it('declares no import at all, so a caller depending on this port alone pulls in nothing else',
    async () => { ... expect(IMPORT_LINE_PATTERN.test(source)).toBe(false); });
  cost: constraints/the-domain-depends-on-no-infrastructure forbids only framework, driver and provider-client
    imports and explicitly permits infrastructure to reach the domain layer through ports — a sibling
    port (hypothesis-revision-release-state.port.ts) legitimately imports a domain type (HypothesisRevisionState)
    without violating it. This test instead pins a stricter, unstated rule — zero imports of any kind
    — as if it were the specification's own boundary. If this port ever legitimately needed a domain-internal
    type import (as its sibling does), this test would fail it even though nothing in the specification
    forbids that; the next reader who wants to know why 'no import at all' is required will look in the
    specification and find only the narrower framework/driver/client rule.
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  where: never lets an unmapped error's own message or context reach the client, lines 105-112
  evidence: expect(response.body).not.toContain('a-secret-slug'); expect(response.body).not.toContain('a
    sensitive violation');
  cost: Whether an unmapped domain error's own message and constructor context ever reach the caller is
    an information-disclosure decision that belongs to the specification rather than to code, and no node
    states it. The guarantee currently exists only as this test's assertion against the middleware; a
    later change that let such details leak would not visibly contradict anything the specification records.
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  where: still answers 500 with the unchanged generic envelope for a typed domain error the status map
    does not name, lines 88-95
  evidence: 'expect(response.statusCode).toBe(500); expect(response.json()).toEqual({ error: { code: ''INTERNAL_ERROR'',
    message: ''an unexpected error occurred'' } });'
  cost: The exact fallback identity for a domain error the status map does not name — the code INTERNAL_ERROR
    and the fixed message an unexpected error occurred — is asserted here as a fact of the system's behavior,
    but no node states it. Every other named refusal this specification declares states its own code and
    shape as a node; this one lives only in the test and the middleware it exercises, so a reader auditing
    what an unmapped error tells a caller will not find it in the specification, and a later change to
    that wording would contradict nothing the specification says.
- file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  where: the CaseNotFoundError-on-unknown-slug test, line 146
  evidence: 'expect(body.error.details).toEqual({ slug: ''an-absent-slug'', version: 0 });'
  cost: This locks the exact payload a case-not-found 404 discloses (a details object naming slug and
    version) into a test as though the business had decided that shape. rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
    — the node governing this exact refusal — only says refused with an HTTP 404 response reporting a
    CaseNotFoundError, and decision-log.md's entry for that node's statement field records that only the
    status and the error name were pulled from the delivered code; the details payload was left out of
    what was decided. A reader checking what a case-not-found refusal is allowed to disclose will find
    the answer only in this test, not in the node that owns the refusal.
- file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
  where: the it block at lines 165-178, answers the unchanged generic envelope, never a partial body or
    leaked detail, when releaseHypothesisRevision rejects with a generic, non-domain error
  evidence: 'expect(response.statusCode).toBe(500); expect(response.json()).toEqual({ error: { code: ''INTERNAL_ERROR'',
    message: ''an unexpected error occurred'' } });'
  cost: the exact refusal a caller receives for any failure the domain does not name — status 500, code
    INTERNAL_ERROR, the fixed message an unexpected error occurred, and that no further detail ever leaks
    — is pinned only here (and in the shared middleware this test exercises); a reader who goes to the
    specification to learn what any route promises when nothing domain-specific goes wrong finds nothing,
    even though the sibling case, a malformed request, is written up as its own constraint for exactly
    this reason.
- file: src/errors/status-map.ts
  where: the STATUS_BY_ERROR_CLASS entry for CaseVersionNotReleasedError, line 53
  evidence: '[CaseVersionNotReleasedError, 409],'
  cost: the refusal rules/investigation/only-a-released-case-version-is-diagnosed states (a draft version
    may be read but never diagnosed against) never names a status or an error identity for it; this map
    is the only place that says the refusal is HTTP 409 and specifically CaseVersionNotReleasedError,
    so the next reader who wants to know what diagnose answers for a draft-pinned version has to read
    this file rather than the specification, and the next change to the mapping has no node text to be
    held to.
unbound:
- src/__tests__/integration/case/manifest-composition.operations.spec.ts
- src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
- src/__tests__/integration/case/release.operation.spec.ts
- src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts
- src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
- src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
- src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
- src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
notes: 'Judged by 44 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/hipotese-release-proprio.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-case-is-read-whole,
  constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/listings-are-paged,
  constraints/no-route-enforces-authentication, constraints/the-domain-depends-on-no-infrastructure, constraints/the-schema-replays-from-its-scripts,
  constraints/the-stored-schema-mirrors-the-declared-model, contracts/knowledge/case-lifecycle, contracts/knowledge/case-query,
  contracts/system/case-authoring, domain/knowledge/case-version, domain/knowledge/hypothesis-revision,
  domain/knowledge/hypothesis-revision-state, domain/knowledge/manifest-entry, rules/knowledge/a-hypothesis-collects-at-least-one-concept,
  rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased, rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle,
  rules/knowledge/a-hypothesis-revision-number-is-never-reused, rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first,
  rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state, rules/knowledge/a-release-refusal-with-no-named-violation-says-so,
  rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions, rules/knowledge/a-released-hypothesis-revision-is-never-altered,
  rules/knowledge/a-revise-answers-the-revision-number-it-saved, rules/knowledge/validation-runs-at-every-read,
  scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves, scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest,
  scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions, scenarios/knowledge/a-released-version-keeps-its-original-revision,
  scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state, scenarios/knowledge/revising-a-released-revision-creates-the-next
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 0 opened across 0 of 44 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 8 fact(s) the source states that no node holds, over 7 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hipotese-release-proprio.returns/`, which are the evidence behind every entry above.
