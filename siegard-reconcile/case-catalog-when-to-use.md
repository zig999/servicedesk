---
contract_version: siegard-reconcile/3
title: case-catalog-when-to-use review premise
summary: task/case-catalog/store-derives-the-case-summary widened the case listing to carry each case's
  derived summary end to end; task/case-catalog/list-cases-answers-the-summary was found to need no further
  code.
target: src
files:
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: written by the delivery of task/case-catalog/store-derives-the-case-summary
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: written by the delivery of task/case-catalog/store-derives-the-case-summary
- path: src/__tests__/unit/http/list-cases.routes.spec.ts
  change: written by the delivery of task/case-catalog/store-derives-the-case-summary
- path: src/case/case-query.port.ts
  change: ICaseQuery.listCases's return item type follows the store port's, now CaseCatalogEntry.
- path: src/case/case-query.service.ts
  change: CaseQueryService.listCases's declared return type follows the port; the method body stays the
    unchanged one-line passthrough to caseStore.listCases.
- path: src/case/case-store.port.ts
  change: Adds CaseSummary (the six domain/knowledge/case-summary attributes, version_count the only required
    one) and CaseCatalogEntry (CaseIdentity & CaseSummary); ICaseStore.listCases now answers PaginatedResponse<CaseCatalogEntry>
    instead of PaginatedResponse<CaseIdentity>. CaseIdentity itself is untouched.
- path: src/http/list-cases.controller.ts
  change: handleListCasesRequest's declared return type follows CaseCatalogEntry; pagination resolution
    is untouched.
- path: src/persistence/relational-case-store.repository.ts
  change: listCasesPage now selects, per case in the page, a row joining two derived subqueries over case_versions
    -- one giving the highest-numbered version's state/authored_at/count, the other giving the highest-numbered
    released version's title/when_to_use/version -- and caseCatalogEntryOf shapes each row into a CaseCatalogEntry
    with every field the case has nothing to derive absent.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/case/case-query.service.ts: held at heldVersion() (lines 131-137), called from readCase, readCaseInputRequirements\
    \ and replayCase — const assembled = await store.assembleVersion(slug, version);\n  if (assembled\
    \ === undefined) {\n    throw new CaseNotFoundError(slug, version);\n  }\n  return assembled;\nsrc/case/case-store.port.ts:\
    \ held at the AssembledCaseVersion type and assembleVersion signature, lines 20-33 and 104 — readonly\
    \ manifest: readonly ManifestEntry[];\n...\nassembleVersion(slug: string, version: number): Promise<AssembledCaseVersion\
    \ | undefined>;\nsrc/persistence/relational-case-store.repository.ts: held at assembleWholeVersion(),\
    \ lines 159-166, inside assembleVersion()'s runInTransaction call, line 100 — const manifest = await\
    \ readManifest(tx, key);\n  return assembledCaseVersionOf(key, versionRow, manifest);"
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/case-store.port.ts: held at the lifecycle methods of ICaseStore, lines 120-132 — createDraft(input:\
    \ CreateDraftInput): Promise<number>;\n\n  insertHypothesisRevision(input: HypothesisRevisionInput):\
    \ Promise<number>;\n\n  placeHypothesis(input: PlaceHypothesisInput): Promise<void>;\n\n  removeManifestEntry(slug:\
    \ string, version: number, hypothesisName: string): Promise<void>;\n\n  release(slug: string, version:\
    \ number): Promise<void>;\n\n  discard(slug: string, version: number): Promise<void>;\n\n  updateDraft(slug:\
    \ string, version: number, attributes: UpdateDraftInput): Promise<void>;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at the public methods createDraft, insertHypothesisRevision, placeHypothesis, removeManifestEntry,\
    \ release, discard, updateDraft, lines 130-156 — public async createDraft(input: CreateDraftInput):\
    \ Promise<number> {\n    return runInTransaction(this.connection, raiseWriteFailure, (tx) => createDraftVersion(tx,\
    \ input));\n  }"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-query.port.ts: held at the ICaseQuery interface's five method declarations — readCase(slug:\
    \ string, version: number): Promise<ReadCaseResult>;\n  listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>>;\n  listCaseVersions(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseVersionListItem>>;\n  listHypotheses(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<HypothesisIdentity>>;\n  listHypothesisRevisions(...)\nsrc/case/case-query.service.ts:\
    \ held at the CaseQueryService methods implementing ICaseQuery (lines 34-72) — export class CaseQueryService\
    \ implements ICaseQuery, ICaseInputRequirementsQuery {\nsrc/case/case-store.port.ts: held at the assembleVersion,\
    \ listCases, listCaseVersions, listHypotheses, listHypothesisRevisions methods, lines 104-118 — listCases(pagination:\
    \ PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;\n\n  listCaseVersions(slug: string,\
    \ pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;\n\n  listHypotheses(slug:\
    \ string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;\n\n  listHypothesisRevisions(\n\
    \    slug: string,\n    hypothesisName: string,\n    pagination: PaginationRequest,\n  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\
    src/http/list-cases.controller.ts: held at the delegation in handleListCasesRequest, line 19 — return\
    \ dependencies.caseQuery.listCases(pagination);\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembleVersion, listCases, listCaseVersions, listHypotheses, listHypothesisRevisions, lines\
    \ 99-128 — public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>\
    \ {\n    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCasesPage(tx, pagination));\n\
    \  }"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/http/list-cases.controller.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/system/case-authoring
  conforms: true
  how: "src/case/case-query.service.ts: held at refuseIncoherence (lines 74-79) — const violations = await\
    \ caseCoherenceViolations(theCase, this.glossary, this.capabilities);\n    if (violations.length >\
    \ 0) {\n      throw new CaseNotValidError(theCase.slug, version, violations);\n    }"
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-query.port.ts: held at the `slug: string` parameter shared by readCase, listCaseVersions,\
    \ listHypotheses and listHypothesisRevisions, and the `Case` import used in ReadCaseResult — readCase(slug:\
    \ string, version: number): Promise<ReadCaseResult>;\nsrc/case/case-query.service.ts: held at readCase\
    \ and heldVersion, which read and identify a case by slug and version (lines 34-39, 131-137) — public\
    \ async readCase(slug: string, version: number): Promise<ReadCaseResult> {\nsrc/case/case-store.port.ts:\
    \ held at the CaseIdentity type and createDraft method, lines 71-73 and 120 — export type CaseIdentity\
    \ = {\n  readonly slug: string;\n};\nsrc/persistence/relational-case-store.repository.ts: held at\
    \ caseIdentityStatement(), line 500-502, and nextVersionUpdateStatement(), lines 512-519 — UPDATE\
    \ ${CASES_TABLE} SET next_version = next_version + 1\n           WHERE slug = $1\n           RETURNING\
    \ next_version - 1 AS version"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseSummary type, lines 75-82 — export type CaseSummary\
    \ = {\n  readonly current_state?: CaseVersionState;\n  readonly version_count: number;\n  readonly\
    \ last_updated?: string;\n  readonly title?: string;\n  readonly when_to_use?: string;\n  readonly\
    \ released_version?: number;\n};\nsrc/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf(),\
    \ lines 253-263 — return {\n    slug: row.slug,\n    ...(row.current_state !== null ? { current_state:\
    \ caseVersionStateOf(row.current_state) } : {}),\n    version_count: Number(row.version_count),"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/case/case-query.port.ts: held at the `version: number` parameter of readCase, and CaseVersionListItem\
    \ as listCaseVersions' return element type — readCase(slug: string, version: number): Promise<ReadCaseResult>;\n\
    src/case/case-store.port.ts: held at the AssembledCaseVersion type, lines 20-33 — export type AssembledCaseVersion\
    \ = {\n  readonly slug: string;\n  readonly version: number;\n  readonly title: string;\n  readonly\
    \ when_to_use: string;\n  readonly authored_at: string;\n  readonly subject: string;\n  readonly fallback:\
    \ Resolution;\n  readonly consolidation_register?: ConsolidationRegister;\n  readonly state: CaseVersionState;\n\
    \n  readonly released_at?: string;\n  readonly manifest: readonly ManifestEntry[];\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembledCaseVersionOf(), lines 196-211 — ...(row.released_at !== null ? { released_at:\
    \ row.released_at.toISOString() } : {}),\n    manifest,\n  };"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseVersionState union type, line 5 — export type CaseVersionState\
    \ = 'draft' | 'released';\nsrc/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE\
    \ constants (lines 86-87) and isCaseVersionState(), lines 733-735 — function isCaseVersionState(value:\
    \ string): value is CaseVersionState {\n  return value === DRAFT_STATE || value === RELEASED_STATE;\n\
    }"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-query.port.ts: held at listHypotheses' return element type HypothesisIdentity, and\
    \ the hypothesisName parameter of listHypothesisRevisions — listHypotheses(slug: string, pagination:\
    \ PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;\nsrc/case/case-query.service.ts:\
    \ held at trustedHypothesisOf (lines 121-129) — return {\n    name: revision.hypothesis.name,\n  \
    \  criterion: revision.criterion,\n    collects: revision.collects,\n    resolution: revision.resolution,\n\
    \  };\nsrc/case/case-store.port.ts: held at the HypothesisIdentity type, lines 91-93 — export type\
    \ HypothesisIdentity = {\n  readonly name: string;\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at hypothesisIdentityStatement(), lines 584-589 — INSERT INTO ${HYPOTHESES_TABLE} (case_slug,\
    \ name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/case/case-query.port.ts: held at listHypothesisRevisions' return element type HypothesisRevisionListItem\
    \ — listHypothesisRevisions(\n    slug: string,\n    hypothesisName: string,\n    pagination: PaginationRequest,\n\
    \  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\nsrc/case/case-store.port.ts: held at\
    \ the HypothesisRevisionContent and HypothesisRevisionListItem types, lines 7-13 and 95-100 — export\
    \ type HypothesisRevisionListItem = {\n  readonly revision: number;\n  readonly criterion: string;\n\
    \  readonly collects: readonly string[];\n  readonly resolution: Resolution;\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at revisionInsertStatement(), lines 600-611 — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1,\
    \ $3, $4, $5, $6\n           FROM ${HYPOTHESIS_REVISIONS_TABLE}\n           WHERE case_slug = $1 AND\
    \ hypothesis_name = $2\n           RETURNING revision"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/case/case-store.port.ts: held at the ManifestEntry type, lines 15-18 — export type ManifestEntry\
    \ = {\n  readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n\
    };\nsrc/persistence/relational-case-store.repository.ts: held at manifestEntryOf(), lines 185-194\
    \ — return { position: row.position, hypothesis_revision: hypothesisRevision };"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: "src/case/case-query.port.ts: held at the readCase signature, which pins a case read to slug and\
    \ version — readCase(slug: string, version: number): Promise<ReadCaseResult>;\nsrc/case/case-query.service.ts:\
    \ held at replayCase (lines 82-85) — export async function replayCase(slug: string, version: number,\
    \ caseStore: ICaseStore): Promise<Case> {\n  const assembled = await heldVersion(caseStore, slug,\
    \ version);\n  return trustedCaseOf(assembled);\n}"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure(), lines
    569-571 — return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect(), lines 274-299\
    \ — FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c\n ...\n           ORDER\
    \ BY c.slug"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect(), lines 274-299\
    \ — SELECT DISTINCT ON (slug) slug, state, authored_at,\n                    COUNT(*) OVER (PARTITION\
    \ BY slug) AS version_count\n             FROM ${CASE_VERSIONS_TABLE}\n             ORDER BY slug,\
    \ version DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at held only for a version's own declared\
    \ attributes, via the draft-state check in updateDraftVersion, lines 671-674; placeHypothesis and\
    \ removeManifestEntry, which alter its manifest entries, and release, carry no equivalent check (see\
    \ findings) — const state = caseVersionStateOf(row.state);\n  if (state !== DRAFT_STATE) {\n    throw\
    \ new CaseVersionNotDraftError(key.slug, key.version, state);\n  }"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/persistence/relational-case-store.repository.ts, placeHypothesis(), lines 138-140, and raisePlaceHypothesisFailure(),\
    \ lines 629-634: public async placeHypothesis(input: PlaceHypothesisInput): Promise<void> {\n    await\
    \ runStatement(this.connection, placeHypothesisStatement(input), raisePlaceHypothesisFailure(input));\n\
    \  } — place-hypothesis against a version that is not in draft state succeeds instead of being refused,\
    \ so a released case version's manifest can be changed after publication — exactly the immutability\
    \ an investigation's replay depends on.\nsrc/persistence/relational-case-store.repository.ts, removeManifestEntry(),\
    \ lines 142-144: public async removeManifestEntry(slug: string, version: number, hypothesisName: string):\
    \ Promise<void> {\n    await runStatement(this.connection, removeManifestEntryStatement(slug, version,\
    \ hypothesisName), raiseWriteFailure);\n  } — A manifest entry can be removed from a released version's\
    \ manifest with no refusal, letting a published procedure change after release with nothing in this\
    \ file ever raising CaseVersionNotDraftError for it.\nsrc/persistence/relational-case-store.repository.ts,\
    \ release(), lines 146-148, and releaseStatement(), lines 643-648: function releaseStatement(slug:\
    \ string, version: number): IStatement {\n  return {\n    text: `UPDATE ${CASE_VERSIONS_TABLE} SET\
    \ state = $3, released_at = NOW() WHERE slug = $1 AND version = $2`,\n    params: [slug, version,\
    \ RELEASED_STATE],\n  };\n} — release() can be invoked against a version that is not draft — including\
    \ one already released — silently rewriting released_at, since the UPDATE carries no state precondition\
    \ and CaseVersionNotDraftAtReleaseError is never imported or thrown anywhere in this file. A caller\
    \ relying on the 409 refusal to detect a stale action gets a silent success instead."
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assignNextVersion(), lines 504-510,\
    \ and nextVersionUpdateStatement(), lines 512-519 — UPDATE ${CASES_TABLE} SET next_version = next_version\
    \ + 1\n           WHERE slug = $1\n           RETURNING next_version - 1 AS version"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseInputRequirements (lines 41-46), delegating to\
    \ deriveCaseInputRequirements — const registeredCapabilities = await everyRegisteredCapability(this.capabilities);\n\
    \    return deriveCaseInputRequirements(theCase, registeredCapabilities);"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: false
  how: "src/persistence/relational-case-store.repository.ts, insertRevision(), lines 573-582, called from\
    \ insertHypothesisRevision() at line 134-136: async function insertRevision(tx: IQueryable, input:\
    \ HypothesisRevisionInput): Promise<number> {\n  const key: IHypothesisKey = { slug: input.slug, hypothesis_name:\
    \ input.hypothesis_name };\n  await runStatement(tx, hypothesisIdentityStatement(key), raiseWriteFailure);\n\
    \  const revision = await insertRevisionRow(tx, input); — A hypothesis revision can be inserted for\
    \ a case that currently holds no draft version. The store's own CaseHoldsNoDraftError (imported nowhere\
    \ in this file) is never raised, so the refusal the rule names never fires here, and a revision can\
    \ be authored with no draft whose subject type the concept-acceptance step was meant to check it against."
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement(), lines
    584-589 — INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,
    name) DO NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure(), lines\
    \ 629-634 — isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n      ? new ManifestPositionOccupiedError(input.slug,\
    \ input.version, input.position)\n      : raiseWriteFailure(cause);"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement(), lines
    600-611 — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion(), lines 521-527,\
    \ and manifestCopyStatement(), lines 559-567 — INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug,\
    \ case_version, hypothesis_name, revision, position)\n           SELECT case_slug, $2, hypothesis_name,\
    \ revision, position\n           FROM ${CASE_VERSION_HYPOTHESES_TABLE}\n           WHERE case_slug\
    \ = $1 AND case_version = $3"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,
    and src/case/case-query.service.ts read `nowhere` — public async readCase(slug: string, version: number):
    Promise<ReadCaseResult> { — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase / heldVersion, parameterized explicitly by version\
    \ rather than always the latest (lines 34-39, 131-137) — const assembled = await store.assembleVersion(slug,\
    \ version);\nsrc/case/case-store.port.ts: held at the assembleVersion and listCaseVersions methods,\
    \ lines 104 and 110 — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion\
    \ | undefined>;\nsrc/persistence/relational-case-store.repository.ts: held at draftInsertStatement()\
    \ always inserts a new row (lines 536-557) and caseVersionSelect()/listCaseVersionsPage() read any\
    \ stored version by key; the guarantee is broken for a released version by discardDraft (see finding)\
    \ — INSERT INTO ${CASE_VERSIONS_TABLE}\n             (slug, version, title, when_to_use, authored_at,\
    \ subject, ...)\n           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect(), lines 305-316 —\
    \ WHERE cvh.case_slug = $1 AND cvh.case_version = $2\n           ORDER BY cvh.position"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/case-query.service.ts: held at readCaseInputRequirements (line 44) — const registeredCapabilities
    = await everyRegisteredCapability(this.capabilities);'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase runs structuralCase then refuseIncoherence (lines\
    \ 34-39); replayCase runs neither (lines 82-85) — const theCase = structuralCase(assembled, slug,\
    \ version);\n    await this.refuseIncoherence(theCase, version);\n    return { case: theCase };"
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect() and caseCatalogEntryOf(),\
    \ lines 253-299 — released.title AS title,\n                  released.when_to_use AS when_to_use,\n\
    \                  released.version AS released_version"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  where: the it block at lines 183-192 ("answers 500 with the generic envelope...")
  evidence: "built.listCases.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside\
    \ the server should see'));\n\n  const response = await app.inject({ method: 'GET', url: '/v1/cases'\
    \ });\n\n  expect(response.statusCode).toBe(500);\n  expect(response.body).not.toContain('sensitive\
    \ internal detail');"
  cost: the rule that an unexpected downstream failure is answered with a generic envelope that never
    surfaces the rejected call's own error text lives only in this test (and the middleware it exercises),
    so the next reader who wants to know what a caller may learn from a failed request will not find that
    refusal shape in the specification — unlike the parallel 400 case, which constraints/a-malformed-request-is-refused-with-a-validation-error
    does state
unbound:
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/http/list-cases.routes.spec.ts
notes: "Judged by 8 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/case-catalog-when-to-use.returns/.\nStaged by a review over files a delivery\
  \ wrote: no pair was omitted, so the delivery's own claims and every other binding of these files were\
  \ judged alike; the plan's node(s) domain/knowledge/case-summary, rules/knowledge/a-case-summary-is-derived-from-its-existing-versions,\
  \ scenarios/knowledge/a-catalog-entry-follows-the-released-version, rules/knowledge/a-case-listing-answers-cases-in-slug-order\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/persistence/relational-case-store.repository.ts names\
  \ rules/knowledge/only-a-draft-case-version-may-be-discarded, which no file of this set is bound to:\
  \ discard(), lines 150-152, and discardDraft(), lines 650-653: async function discardDraft(tx: IQueryable,\
  \ key: ICaseVersionKey): Promise<void> {\n  await runStatement(tx, deleteManifestEntriesStatement(key),\
  \ raiseWriteFailure);\n  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n\
  } — discardDraft deletes a case_version and its manifest entries regardless of the version's current\
  \ state, so a released version — and the investigation whose replay depends on it staying readable —\
  \ can be removed through the same call path meant only for an abandoned draft.. It blocks nothing here;\
  \ it is owed a route of its own.\nCandidates: 1 opened across 1 of 8 delegation(s); each return lists\
  \ its own under `candidates_opened`.\nUnstated: 1 fact(s) the source states that no node holds, over\
  \ 1 file(s), listed under `unstated`. They block no binding here and no rebind closes them — the route\
  \ is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-catalog-when-to-use.returns/`, which are the evidence behind every entry above.
