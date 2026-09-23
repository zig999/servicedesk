---
contract_version: siegard-reconcile/5
title: Reconcile relational-case-store.repository.ts against the case-lifecycle/case-query nodes it binds
summary: This repository file is asserted correct as it stands on disk; the trace's bindings for it are
  stale because the file changed without a rebind. This reconciliation reads it fresh against every node
  the trace currently binds to it, over one file.
target: backend
files:
- path: src/persistence/relational-case-store.repository.ts
  change: The file as committed implements the case/case-version/hypothesis/hypothesis-revision persistence
    surface — no further description beyond what the judge's own reading reports.
nodes:
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at the RelationalCaseStore class''s
    createDraft, insertHypothesisRevision, overwriteHypothesisRevision, releaseHypothesisRevision, placeHypothesis,
    removeManifestEntry, updateDraft, release and discard methods — public async createDraft(input: CreateDraftInput):
    Promise<number> {

    public async insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number> {

    public async overwriteHypothesisRevision(input: OverwriteHypothesisRevisionInput): Promise<void> {

    public async placeHypothesis(input: PlaceHypothesisInput): Promise<void> {

    public async removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void>
    {

    public async release(slug: string, version: number): Promise<void> {

    public async discard(slug: string, version: number): Promise<void> {

    public async updateDraft(slug: string, version: number, attributes: UpdateDraftInput): Promise<void>
    {

    public async releaseHypothesisRevision(slug: string, hypothesisName: string, revision: number): Promise<void>
    {'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at the assembleVersion, listCases, listCaseVersions,
    listHypotheses and listHypothesisRevisions methods — public async assembleVersion(slug: string, version:
    number): Promise<AssembledCaseVersion | undefined> {

    public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>
    {

    public async listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>
    {

    public async listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>
    {

    public async listHypothesisRevisions('
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at the cases table's slug and next_version\
    \ columns, addressed by caseIdentityStatement and nextVersionUpdateStatement — function nextVersionUpdateStatement(slug:\
    \ string): IStatement {\n  return {\n    text: `UPDATE ${CASES_TABLE} SET next_version = next_version\
    \ + 1\n           WHERE slug = $1\n           RETURNING next_version - 1 AS version`,\n    params:\
    \ [slug],\n  };\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf, assembling current_state,\
    \ version_count, last_updated, title, when_to_use, released_version as optional fields — return {\n\
    \  slug: row.slug,\n  ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state)\
    \ } : {}),\n  version_count: Number(row.version_count),\n  ...(row.last_updated !== null ? { last_updated:\
    \ row.last_updated.toISOString() } : {}),\n  ...(row.title !== null ? { title: row.title } : {}),\n\
    \  ...(row.when_to_use !== null ? { when_to_use: row.when_to_use } : {}),\n  ...(row.released_version\
    \ !== null ? { released_version: row.released_version } : {}),\n};"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assembledCaseVersionOf, composing\
    \ version, title, when_to_use, authored_at, subject, fallback, consolidation_register, state, released_at,\
    \ manifest — return {\n  slug: key.slug,\n  version: key.version,\n  title: row.title,\n  when_to_use:\
    \ row.when_to_use,\n  authored_at: row.authored_at.toISOString(),\n  subject: row.subject,\n  fallback:\
    \ resolutionOf(row.fallback_outcome, row.fallback_action, row.fallback_recipient),\n  ...(consolidationRegister\
    \ !== undefined ? { consolidation_register: consolidationRegister } : {}),\n  state: caseVersionStateOf(row.state),\n\
    \  ...(row.released_at !== null ? { released_at: row.released_at.toISOString() } : {}),\n  manifest,\n\
    };"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at the DRAFT_STATE/RELEASED_STATE constants\
    \ and isCaseVersionState guard — const DRAFT_STATE: CaseVersionState = 'draft';\nconst RELEASED_STATE:\
    \ CaseVersionState = 'released';\n...\nfunction isCaseVersionState(value: string): value is CaseVersionState\
    \ {\n  return CASE_VERSION_STATE_VALUES.has(value);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement and the\
    \ HYPOTHESES_TABLE (case_slug, name) rows — function hypothesisIdentityStatement(key: IHypothesisKey):\
    \ IStatement {\n  return {\n    text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1,\
    \ $2) ON CONFLICT (case_slug, name) DO NOTHING`,\n    params: [key.slug, key.hypothesis_name],\n \
    \ };\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at the HYPOTHESIS_REVISION_DRAFT_STATE/RELEASED_STATE\
    \ constants and isHypothesisRevisionState guard — const HYPOTHESIS_REVISION_DRAFT_STATE: HypothesisRevisionState\
    \ = 'draft';\nconst HYPOTHESIS_REVISION_RELEASED_STATE: HypothesisRevisionState = 'released';\n...\n\
    function isHypothesisRevisionState(value: string): value is HypothesisRevisionState {\n  return HYPOTHESIS_REVISION_STATE_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestEntryOf, pairing position\
    \ with one hypothesis-revision — function manifestEntryOf(row: IManifestRow, collects: readonly string[]):\
    \ ManifestEntry {\n  const hypothesisRevision: HypothesisRevisionContent = { ... };\n  return { position:\
    \ row.position, hypothesis_revision: hypothesisRevision };\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, translating\
    \ the ONE_DRAFT_PER_CASE_CONSTRAINT violation into CaseAlreadyHasDraftError(slug) — function raiseCreateDraftFailure(slug:\
    \ string): RaiseStoreError {\n  return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT)\
    \ ? new CaseAlreadyHasDraftError(slug) : raiseWriteFailure(cause));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect''s slug ordering
    — FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c

    ...

    ORDER BY c.slug`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's \"latest\" and\
    \ \"released\" subqueries — LEFT JOIN (\n  SELECT DISTINCT ON (slug) slug, state, authored_at,\n \
    \        COUNT(*) OVER (PARTITION BY slug) AS version_count\n  FROM ${CASE_VERSIONS_TABLE}\n  ORDER\
    \ BY slug, version DESC\n) latest ON latest.slug = c.slug\nLEFT JOIN (\n  SELECT DISTINCT ON (slug)\
    \ slug, version, title, when_to_use\n  FROM ${CASE_VERSIONS_TABLE}\n  WHERE state = $3\n  ORDER BY\
    \ slug, version DESC\n) released ON released.slug = c.slug"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft, guarding insertManifestEntry,\
    \ deleteManifestEntry and updateDraftVersion against a non-draft (released) version — function refuseUnlessDraft(key:\
    \ ICaseVersionKey, state: CaseVersionState): void {\n  if (state !== DRAFT_STATE) {\n    throw new\
    \ CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft/refuseUnlessDraftAtRelease\
    \ raising CaseVersionNotDraftError / CaseVersionNotDraftAtReleaseError with slug, version and state\
    \ — function refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState): void {\n \
    \ if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftAtReleaseError(key.slug, key.version,\
    \ state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement's monotonically\
    \ increasing next_version counter, never decremented by discardDraft — text: `UPDATE ${CASES_TABLE}\
    \ SET next_version = next_version + 1\n       WHERE slug = $1\n       RETURNING next_version - 1 AS\
    \ version`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at requireCaseHoldsDraft, called from\
    \ insertRevision before creating a hypothesis identity or revision — async function insertRevision(tx:\
    \ IQueryable, input: HypothesisRevisionInput): Promise<number> {\n  await requireCaseHoldsDraft(tx,\
    \ input.slug);"
  encoded_at:
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
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure, translating\
    \ the POSITION_UNIQUE_CONSTRAINT violation into ManifestPositionOccupiedError(slug, version, position)\
    \ — function raisePlaceHypothesisFailure(input: PlaceHypothesisInput): RaiseStoreError {\n  return\
    \ (cause) =>\n    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n      ? new ManifestPositionOccupiedError(input.slug,\
    \ input.version, input.position)\n      : raiseWriteFailure(cause);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement''s COALESCE(MAX(revision),
    0) + 1 and revisionOverwriteStatement''s in-place UPDATE — SELECT $1, $2, COALESCE(MAX(revision),
    0) + 1, $3, $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}

    WHERE case_slug = $1 AND hypothesis_name = $2'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessHypothesisRevisionDraftAtRelease,\
    \ raising HypothesisRevisionNotDraftAtReleaseError with no arguments — function refuseUnlessHypothesisRevisionDraftAtRelease(state:\
    \ HypothesisRevisionState | undefined): void {\n  if (state !== HYPOTHESIS_REVISION_DRAFT_STATE) {\n\
    \    throw new HypothesisRevisionNotDraftAtReleaseError();\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement''s COALESCE(MAX(revision),
    0) + 1, scoped to case_slug and hypothesis_name — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3,
    $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}

    WHERE case_slug = $1 AND hypothesis_name = $2'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect's descending\
    \ order — text: `SELECT revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state\n       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n       WHERE case_slug = $1 AND hypothesis_name\
    \ = $2\n       ORDER BY revision DESC\n       LIMIT $3 OFFSET $4`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf, including\
    \ state in every listed revision — function hypothesisRevisionListItemOf(row: IHypothesisRevisionRow,\
    \ collects: readonly string[]): HypothesisRevisionListItem {\n  return {\n    revision: row.revision,\n\
    \    criterion: row.criterion,\n    collects,\n    resolution: resolutionOf(row.resolution_outcome,\
    \ row.resolution_action, row.resolution_recipient),\n    state: hypothesisRevisionStateOf(row.state),\n\
    \  };\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion (naming an explicit\
    \ source, or falling back to the latest released version) and manifestCopyStatement — async function\
    \ resolveSourceVersion(tx: IQueryable, input: CreateDraftInput): Promise<number | undefined> {\n \
    \ if (input.source_version !== undefined) {\n    return input.source_version;\n  }\n  const row =\
    \ await queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug),\
    \ raiseWriteFailure);\n  return row?.version ?? undefined;\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement''s ON CONFLICT
    (slug) DO NOTHING — text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseVersionSelect reading any stored\
    \ version by key, and discardDraft only ever removing a version still in draft state — async function\
    \ discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key, await\
    \ requireVersionState(tx, key));\n  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n\
    \  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect, ordering by the manifest\
    \ entry's own declared position — text: `SELECT cvh.position, cvh.hypothesis_name, cvh.revision,\n\
    \              hr.criterion, hr.resolution_outcome, hr.resolution_action, hr.resolution_recipient\n\
    \       FROM ${CASE_VERSION_HYPOTHESES_TABLE} cvh\n       JOIN ${HYPOTHESIS_REVISIONS_TABLE} hr\n\
    \         ON hr.case_slug = cvh.case_slug AND hr.hypothesis_name = cvh.hypothesis_name AND hr.revision\
    \ = cvh.revision\n       WHERE cvh.case_slug = $1 AND cvh.case_version = $2\n       ORDER BY cvh.position`,"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect, drawing title/when_to_use/released_version
    from the highest-numbered released version and current_state from the highest-numbered version overall
    — ) released ON released.slug = c.slug

    ...

    released.title AS title,

    released.when_to_use AS when_to_use,

    released.version AS released_version'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow, updating\
    \ only the hypothesis_revisions table and touching no case-version or manifest table — async function\
    \ releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey): Promise<void> {\n  refuseUnlessHypothesisRevisionDraftAtRelease(await\
    \ resolveHypothesisRevisionOwnState(tx, key));\n  await runStatement(tx, releaseHypothesisRevisionStatement(key),\
    \ raiseWriteFailure);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement, always creating
    a new numbered row rather than touching an existing one — SELECT $1, $2, COALESCE(MAX(revision), 0)
    + 1, $3, $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}

    WHERE case_slug = $1 AND hypothesis_name = $2

    RETURNING revision'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/relational-case-store-drift: `test-unit` passed (exit 0) over
    node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair,
    and the run is the whole of what answered it'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/persistence/relational-case-store.repository.ts
  where: hypothesesPageSelect
  evidence: "function hypothesesPageSelect(slug: string, pagination: PaginationRequest): IStatement {\n\
    \  return {\n    text: `SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 ORDER BY name LIMIT\
    \ $2 OFFSET $3`,\n    params: [slug, pagination.limit, pagination.offset],\n  };\n}"
  cost: list-hypotheses answers name-ascending order and a curator paging it without a known name relies
    on that order holding page to page, but no node anywhere in the specification commits to it — unlike
    the three sibling listings (cases by slug, case-versions by version, hypothesis revisions by revision
    number), each of which has its own invariant recording the order and the reasoning for it. A reader
    auditing this behavior against domain/knowledge/hypothesis or contracts/knowledge/case-query finds
    no ordering decision at all, so this file is the only place the order is recorded, and it can change
    without anyone reading a violated node.
pairs_omitted:
- node: domain/knowledge/hypothesis-revision
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/a-registered-concept-is-never-removed
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/relational-case-store-drift.returns/.

  1 pair(s) over 1 node(s) were decided by run/relational-case-store-drift rather than by a judge — a
  registry step decides the constraint, or a certified test decides the node — with step(s) test-unit.
  No delegation read them; the run''s own log is the evidence, and it sits beside these returns.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/relational-case-store-drift.returns/`, which are the evidence behind every entry above.
