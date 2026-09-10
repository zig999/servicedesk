---
contract_version: siegard-reconcile/4
title: Hypothesis-revision release guard — offered test certifications
summary: This file stands at HEAD, unchanged since the corrective delivery that added the release-state
  guard. The human offers the delivery's own new tests (unit and integration) as proof for the two nodes
  that delivery's bind wrote, asking whether those tests would fail if either node's fact stopped holding,
  and re-reads the whole file's 31 bindings fresh since the last bind restamped this file under only two
  of them, leaving the rest stale.
target: backend
files:
- path: src/persistence/relational-case-store.repository.ts
  change: Implements the case store port against the relational schema — draft creation and next-version
    assignment, hypothesis placement, case-version and hypothesis-revision release (the latter now gated
    on the revision's own current state), manifest and listing reads, and slug-keyed case identity. Unchanged
    since the corrective delivery that added the hypothesis-revision release guard.
nodes:
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at the RelationalCaseStore class's public\
    \ methods implementing each declared operation, lines 180-216 — public async releaseHypothesisRevision(slug:\
    \ string, hypothesisName: string, revision: number): Promise<void> {\n  await runInTransaction(this.connection,\
    \ raiseWriteFailure, (tx) =>\n    releaseHypothesisRevisionRow(tx, { slug, hypothesis_name: hypothesisName,\
    \ revision }),\n  );\n}\npublic async createDraft(input: CreateDraftInput): Promise<number> { ...\
    \ }\npublic async placeHypothesis(input: PlaceHypothesisInput): Promise<void> { ... }\npublic async\
    \ removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void> { ...\
    \ }\npublic async release(slug: string, version: number): Promise<void> { ... }\npublic async discard(slug:\
    \ string, version: number): Promise<void> { ... }\npublic async updateDraft(slug: string, version:\
    \ number, attributes: UpdateDraftInput): Promise<void> { ... }\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at assembleVersion, listCases, listCaseVersions,
    listHypotheses, listHypothesisRevisions, lines 126-159 — public async assembleVersion(slug: string,
    version: number): Promise<AssembledCaseVersion | undefined> {

    public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>
    {

    public async listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>
    {

    public async listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>
    {

    public async listHypothesisRevisions(

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement and assignNextVersion,\
    \ lines 646-665 — function caseIdentityStatement(slug: string): IStatement {\n  return { text: `INSERT\
    \ INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`, params: [slug] };\n}\nfunction\
    \ nextVersionUpdateStatement(slug: string): IStatement {\n  return {\n    text: `UPDATE ${CASES_TABLE}\
    \ SET next_version = next_version + 1\n           WHERE slug = $1\n           RETURNING next_version\
    \ - 1 AS version`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf, lines 320-330\
    \ — function caseCatalogEntryOf(row: ICasesPageRow): CaseCatalogEntry {\n  return {\n    slug: row.slug,\n\
    \    ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state) } : {}),\n\
    \    version_count: Number(row.version_count),\n    ...(row.last_updated !== null ? { last_updated:\
    \ row.last_updated.toISOString() } : {}),\n    ...(row.title !== null ? { title: row.title } : {}),\n\
    \    ...(row.when_to_use !== null ? { when_to_use: row.when_to_use } : {}),\n    ...(row.released_version\
    \ !== null ? { released_version: row.released_version } : {}),\n  };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assembledCaseVersionOf, lines 256-271\
    \ — function assembledCaseVersionOf(key: ICaseVersionKey, row: ICaseVersionRow, manifest: readonly\
    \ ManifestEntry[]): AssembledCaseVersion {\n  const consolidationRegister = consolidationRegisterOf(row.consolidation_register);\n\
    \  return {\n    slug: key.slug, version: key.version, title: row.title, when_to_use: row.when_to_use,\n\
    \    authored_at: row.authored_at.toISOString(), subject: row.subject,\n    fallback: resolutionOf(row.fallback_outcome,\
    \ row.fallback_action, row.fallback_recipient),\n    ...(consolidationRegister !== undefined ? { consolidation_register:\
    \ consolidationRegister } : {}),\n    state: caseVersionStateOf(row.state),\n    ...(row.released_at\
    \ !== null ? { released_at: row.released_at.toISOString() } : {}),\n    manifest,\n  };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE constants\
    \ and caseVersionStateOf, lines 103-104 and 948-956 — const DRAFT_STATE: CaseVersionState = 'draft';\n\
    const RELEASED_STATE: CaseVersionState = 'released';\n...\nfunction caseVersionStateOf(value: string):\
    \ CaseVersionState {\n  if (!isCaseVersionState(value)) {\n    throw raiseReadFailure(new Error(`case_versions\
    \ holds an unrecognized state \"${value}\"`));\n  }\n  return value;\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement, lines\
    \ 738-743 — function hypothesisIdentityStatement(key: IHypothesisKey): IStatement {\n  return {\n\
    \    text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,\
    \ name) DO NOTHING`,\n    params: [key.slug, key.hypothesis_name],\n  };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement and releaseHypothesisRevisionRow,\
    \ lines 754-765 and 616-619 — text: `INSERT INTO ${HYPOTHESIS_REVISIONS_TABLE}\n         (case_slug,\
    \ hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state)\n       SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7\nasync function\
    \ releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey): Promise<void> {\n  refuseUnlessHypothesisRevisionDraftAtRelease(await\
    \ resolveHypothesisRevisionOwnState(tx, key));\n  await runStatement(tx, releaseHypothesisRevisionStatement(key),\
    \ raiseWriteFailure);\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  decided_by: reading
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_DRAFT_STATE/HYPOTHESIS_REVISION_RELEASED_STATE
    constants, lines 106-107 — const HYPOTHESIS_REVISION_DRAFT_STATE: HypothesisRevisionState = ''draft'';

    const HYPOTHESIS_REVISION_RELEASED_STATE: HypothesisRevisionState = ''released'';

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestEntryOf, lines 245-254 —\
    \ function manifestEntryOf(row: IManifestRow, collects: readonly string[]): ManifestEntry {\n  const\
    \ hypothesisRevision: HypothesisRevisionContent = {\n    hypothesis_name: row.hypothesis_name, revision:\
    \ row.revision, criterion: row.criterion, collects,\n    resolution: resolutionOf(row.resolution_outcome,\
    \ row.resolution_action, row.resolution_recipient),\n  };\n  return { position: row.position, hypothesis_revision:\
    \ hypothesisRevision };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, lines 715-717\
    \ — function raiseCreateDraftFailure(slug: string): RaiseStoreError {\n  return (cause) => (isConstraintViolation(cause,\
    \ ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug) : raiseWriteFailure(cause));\n\
    }\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect, lines 341-366 —
    FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c

    ...

    ORDER BY c.slug`,

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest/released\
    \ subqueries, lines 343-363 — SELECT DISTINCT ON (slug) slug, state, authored_at,\n       COUNT(*)\
    \ OVER (PARTITION BY slug) AS version_count\nFROM ${CASE_VERSIONS_TABLE}\nORDER BY slug, version DESC\n\
    ...\nSELECT DISTINCT ON (slug) slug, version, title, when_to_use\nFROM ${CASE_VERSIONS_TABLE}\nWHERE\
    \ state = $3\nORDER BY slug, version DESC\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft guarding manifest/attribute\
    \ mutation, lines 813-817, 834-837, 875-878 — async function insertManifestEntry(tx: IQueryable, input:\
    \ PlaceHypothesisInput): Promise<void> {\n  const key: ICaseVersionKey = { slug: input.slug, version:\
    \ input.version };\n  refuseUnlessDraft(key, await requireVersionState(tx, key));\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft / refuseUnlessDraftAtRelease,\
    \ lines 888-897 — function refuseUnlessDraft(key: ICaseVersionKey, state: CaseVersionState): void\
    \ {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug, key.version,\
    \ state);\n  }\n}\nfunction refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState):\
    \ void {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftAtReleaseError(key.slug,\
    \ key.version, state);\n  }\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement, lines\
    \ 658-665 — text: `UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug =\
    \ $1\n       RETURNING next_version - 1 AS version`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at requireCaseHoldsDraft, lines 719-736\
    \ — async function insertRevision(tx: IQueryable, input: HypothesisRevisionInput): Promise<number>\
    \ {\n  await requireCaseHoldsDraft(tx, input.slug);\n...\nasync function requireCaseHoldsDraft(tx:\
    \ IQueryable, slug: string): Promise<void> {\n  const row = await queryOneOrAbsent<{ version: number\
    \ }>(tx, draftVersionSelect(slug), raiseReadFailure);\n  if (row === undefined) {\n    throw new CaseHoldsNoDraftError(slug);\n\
    \  }\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement''s ON
    CONFLICT clause, lines 738-743 — text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1,
    $2) ON CONFLICT (case_slug, name) DO NOTHING`,

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure, lines\
    \ 827-832 — function raisePlaceHypothesisFailure(input: PlaceHypothesisInput): RaiseStoreError {\n\
    \  return (cause) =>\n    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n      ? new ManifestPositionOccupiedError(input.slug,\
    \ input.version, input.position)\n      : raiseWriteFailure(cause);\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at overwriteRevision and insertRevisionRow,\
    \ lines 775-782 and 745-765 — async function overwriteRevision(tx: IQueryable, input: OverwriteHypothesisRevisionInput):\
    \ Promise<void> {\n  const key: IRevisionKey = { slug: input.slug, hypothesis_name: input.hypothesis_name,\
    \ revision: input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input), raiseOverwriteFailure(input));\n\
    ...\nSELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7\nFROM ${HYPOTHESIS_REVISIONS_TABLE}\n\
    WHERE case_slug = $1 AND hypothesis_name = $2\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow / refuseUnlessHypothesisRevisionDraftAtRelease,\
    \ lines 616-625 — async function releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey):\
    \ Promise<void> {\n  refuseUnlessHypothesisRevisionDraftAtRelease(await resolveHypothesisRevisionOwnState(tx,\
    \ key));\n  await runStatement(tx, releaseHypothesisRevisionStatement(key), raiseWriteFailure);\n\
    }\n\nfunction refuseUnlessHypothesisRevisionDraftAtRelease(state: HypothesisRevisionState | undefined):\
    \ void {\n  if (state !== HYPOTHESIS_REVISION_DRAFT_STATE) {\n    throw new HypothesisRevisionNotDraftAtReleaseError();\n\
    \  }\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  decided_by: reading
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement, lines 754-765
    — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7

    FROM ${HYPOTHESIS_REVISIONS_TABLE}

    WHERE case_slug = $1 AND hypothesis_name = $2

    RETURNING revision`,

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect, lines\
    \ 516-525 — text: `SELECT revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state\n       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n       WHERE case_slug = $1 AND hypothesis_name\
    \ = $2\n       ORDER BY revision DESC\n       LIMIT $3 OFFSET $4`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf, lines\
    \ 548-556 — function hypothesisRevisionListItemOf(row: IHypothesisRevisionRow, collects: readonly\
    \ string[]): HypothesisRevisionListItem {\n  return {\n    revision: row.revision, criterion: row.criterion,\
    \ collects,\n    resolution: resolutionOf(row.resolution_outcome, row.resolution_action, row.resolution_recipient),\n\
    \    state: hypothesisRevisionStateOf(row.state),\n  };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and manifestCopyStatement,\
    \ lines 667-680 and 705-713 — async function resolveSourceVersion(tx: IQueryable, input: CreateDraftInput):\
    \ Promise<number | undefined> {\n  if (input.source_version !== undefined) {\n    return input.source_version;\n\
    \  }\n  const row = await queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug),\
    \ raiseWriteFailure);\n  return row?.version ?? undefined;\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement''s ON CONFLICT
    (slug), lines 646-648 — text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO
    NOTHING`, params: [slug] };

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assembleWholeVersion reading any\
    \ version by number, and discardDraft removing only draft rows, lines 219-226 and 858-862 — const\
    \ versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);\n\
    ...\nasync function discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key,\
    \ await requireVersionState(tx, key));\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at manifestSelect, lines 372-383 — WHERE
    cvh.case_slug = $1 AND cvh.case_version = $2

    ORDER BY cvh.position`,

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect, lines 341-366 —\
    \ LEFT JOIN (\n  SELECT DISTINCT ON (slug) slug, state, authored_at, ...\n) latest ON latest.slug\
    \ = c.slug\nLEFT JOIN (\n  SELECT DISTINCT ON (slug) slug, version, title, when_to_use\n  FROM ${CASE_VERSIONS_TABLE}\n\
    \  WHERE state = $3\n  ORDER BY slug, version DESC\n) released ON released.slug = c.slug\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow and\
    \ releaseHypothesisRevisionStatement, lines 616-633 — function releaseHypothesisRevisionStatement(key:\
    \ IRevisionKey): IStatement {\n  return {\n    text: `UPDATE ${HYPOTHESIS_REVISIONS_TABLE} SET state\
    \ = $4\n           WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3`,\n    params:\
    \ [key.slug, key.hypothesis_name, key.revision, HYPOTHESIS_REVISION_RELEASED_STATE],\n  };\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at insertRevisionRow / revisionInsertStatement,\
    \ lines 745-765 — async function insertRevisionRow(tx: IQueryable, input: HypothesisRevisionInput):\
    \ Promise<number> {\n  const columns = referralColumns(input.resolution);\n  const row = await queryOneOrAbsent<{\
    \ revision: number }>(tx, revisionInsertStatement(input, columns), raiseWriteFailure);\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/hypothesis-revision-release-guard-test-certification: `test-unit`
    passed (exit 0) over node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No
    judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/hypothesis-revision-release-guard-test-certification.returns/.

  1 pair(s) over 1 node(s) were decided by run/hypothesis-revision-release-guard-test-certification rather
  than by a judge — a registry step decides the constraint, or a certified test decides the node — with
  step(s) test-unit. No delegation read them; the run''s own log is the evidence, and it sits beside these
  returns.

  Certification of rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle did not
  hold: the auditor answered `partial` — The lifecycle itself is exercised whole: the draft-to-released
  transition is driven and the released state read back (unit and integration), release against a revision
  already released is refused with HypothesisRevisionNotDraftAtReleaseError while the state and the absence
  of any UPDATE are asserted, release against a never-stored identity is refused the same way, and the
  "whole of what that refusal reports" half — same message, no own field beyond `name`, so never which
  of the two triggers raised it — is asserted directly by the unit test comparing the two errors. What
  goes unexercised is the refusal''s stated HTTP 409: nothing in the offered proof maps HypothesisRevisionNotDraftAtReleaseError
  to a status. Every refusal assertion in both files stops at the error''s type and shape, so the named
  tests would all still pass if that error answered 500, or 422, or nothing at all. The one status assertion
  in the set — `expect(statusForError(caught)).toBe(409)` in the integration file''s overwrite test —
  is over ReleasedHypothesisRevisionNotAlterableError, a different error raised by a different trigger,
  and proves nothing about this refusal''s own status. Whatever test binds this error to 409 (a status-map
  or HTTP-layer test) lies outside the proof the certification offered, so it cannot be cited here and
  the state stays short of covered.. The node is decided by reading, and a certification standing on it
  from an earlier reconciliation is released by the bind.

  Certification of domain/knowledge/hypothesis-revision did not hold: the auditor answered `partial` —
  The release half of the fact is exercised whole: a draft revision moves to released by its own release,
  a second release is refused with the stored state left as it was, an identity never stored is refused,
  and the state is read from and written to the revision''s own row with no case version and no manifest
  consulted — a released case version pinning the revision leaves it draft, and a revision released directly
  reads released while nothing references it. The in-place-edit-before-release half is exercised too:
  an overwrite replaces criterion, collects and resolution while the revision number stays exactly what
  it was, and it is refused once the revision''s own state is released. Three stated parts go unexercised.
  First, "a further edit always creates the next revision instead": nothing in the set submits an edit
  against a released revision and observes the next revision come into being — the released path is exercised
  only as the overwrite refusal, and the numbering test inserts against a hypothesis whose revisions are
  all draft, so the routing from a released revision to a new one is never run. Second, "leaving every
  version that already adopted this one reading exactly what it always read": no test creates a further
  revision after release and then reassembles the case version that had already adopted the earlier one
  to confirm it still reads the content it always read. Third, "a case version''s manifest may point at
  this revision in either state": every placeHypothesis in the set points at a revision whose own state
  is draft, so pointing a manifest at a revision already released — and the claim that doing so moves
  neither the revision nor the version — is never submitted.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hypothesis-revision-release-guard-test-certification.returns/`, which are the evidence behind every entry above.
