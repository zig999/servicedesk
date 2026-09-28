---
contract_version: siegard-reconcile/5
title: overwrite-hypothesis-revision-draft-guard-corrective
summary: overwrite-revision-refuses-without-a-draft adds requireCaseHoldsDraft to overwriteHypothesisRevision,
  matching insertRevision, and rewrites one pre-existing test in the same spec file whose premise the
  new guard invalidates.
target: backend
files:
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: Two new integration tests prove the CaseHoldsNoDraftError refusal (message/details, unchanged
    stored content) and that it preempts ReleasedHypothesisRevisionNotAlterableError; one pre-existing
    test (owned by the closed initiative hipotese-release-proprio) was rewritten whole to isolate the
    manifest-reference condition it always meant to test from the case-holds-a-draft condition this delivery's
    guard now enforces. Written by the delivery of task/overwrite-revision-draft-guard/overwrite-revision-refuses-without-a-draft.
- path: src/persistence/relational-case-store.repository.ts
  change: overwriteRevision now opens with await requireCaseHoldsDraft(tx, input.slug) — the same helper
    insertRevision already calls first — so an overwrite against a case holding no draft version throws
    CaseHoldsNoDraftError before the UPDATE, the collects delete, or the collects re-insert ever runs.
    Written by the delivery of task/overwrite-revision-draft-guard/overwrite-revision-refuses-without-a-draft.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at assembleVersion / assembleWholeVersion,
    lines 127-129 and 233-240 — return runInTransaction(this.connection, raiseReadFailure, (tx) => assembleWholeVersion(tx,
    { slug, version }));

    ...

    const manifest = await readManifest(tx, key);

    return assembledCaseVersionOf(key, versionRow, manifest);'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at the ICaseStore write methods, lines\
    \ 187-221 (createDraft, insertHypothesisRevision, overwriteHypothesisRevision, placeHypothesis, removeManifestEntry,\
    \ release, discard, updateDraft, delete) — public async createDraft(input: CreateDraftInput): Promise<number>\
    \ {\n  return runInTransaction(this.connection, raiseWriteFailure, (tx) => createDraftVersion(tx,\
    \ input));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assembleVersion, listCases, listCaseVersions,\
    \ listHypotheses, listHypothesisRevisions, lines 127-160 — public async listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>> {\n  return runInTransaction(this.connection, raiseReadFailure,\
    \ (tx) => listCasesPage(tx, pagination));\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement and assignNextVersion,\
    \ lines 669-688 — INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING\n...\n\
    UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug = $1\n       RETURNING\
    \ next_version - 1 AS version"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf, lines 334-344
    — ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state) } : {}),

    version_count: Number(row.version_count),'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at assembledCaseVersionOf, lines 270-285
    — state: caseVersionStateOf(row.state),

    ...(row.released_at !== null ? { released_at: row.released_at.toISOString() } : {}),

    manifest,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at CASE_VERSION_STATE_VALUES / caseVersionStateOf,\
    \ lines 93 and 1003-1012 — const CASE_VERSION_STATE_VALUES: ReadonlySet<string> = new Set<string>(CASE_VERSION_STATES);\n\
    function isCaseVersionState(value: string): value is CaseVersionState {\n  return CASE_VERSION_STATE_VALUES.has(value);\n\
    }"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement, lines
    760-765 — INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,
    name) DO NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the shape\
    \ asserted for a read-back hypothesis-revision, carrying revision, criterion, collects, resolution\
    \ and state together — expect(page.data).toEqual([{ revision, criterion: 'the replaced criterion',\
    \ collects: [], resolution: aResolution(newGlossary), state: 'draft' }]);\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at revisionInsertStatement, lines 776-787 — INSERT INTO ${HYPOTHESIS_REVISIONS_TABLE}\n   \
    \      (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state)\n       SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7"
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the state
    read back after releaseHypothesisRevision, and the state field on listed revisions — await store.releaseHypothesisRevision(slug,
    ''a-hypothesis'', revision); const state = await store.readHypothesisRevisionOwnState(slug, ''a-hypothesis'',
    revision); expect(state).toBe(''released'');

    src/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_STATE_VALUES / hypothesisRevisionStateOf,
    lines 95 and 602-611 — const HYPOTHESIS_REVISION_STATE_VALUES: ReadonlySet<string> = new Set<string>(HYPOTHESIS_REVISION_STATES);'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at manifestEntryOf, lines 259-268 —
    return { position: row.position, hypothesis_revision: hypothesisRevision };'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at isConceptCollectedByHypothesisRevision\
    \ / hypothesisRevisionCollectSelect, lines 223-230 and 411-418 — SELECT 1 FROM ${HYPOTHESIS_REVISION_COLLECTS_TABLE}\
    \ hrc\n       WHERE hrc.concept_name = $1\n       LIMIT 1"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, lines 737-739
    — return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at deleteVersionlessCase, lines 898-912
    — await requireCaseIdentity(tx, slug);

    await refuseIfCaseHoldsVersions(tx, slug);

    await runStatement(tx, hypothesisRevisionCollectsDeleteBySlugStatement(slug), raiseWriteFailure);

    await runStatement(tx, hypothesisRevisionsDeleteBySlugStatement(slug), raiseWriteFailure);

    await runStatement(tx, hypothesesDeleteBySlugStatement(slug), raiseWriteFailure);

    await runStatement(tx, caseDeleteStatement(slug), raiseWriteFailure);'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect, lines 355-380 —
    ORDER BY c.slug'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at requireCaseIdentity and requireVersionState,\
    \ lines 433-438 and 935-941 — if (row === undefined) {\n  throw new CaseNotFoundError(slug, NO_VERSION_NAMED);\n\
    }\n...\nif (row === undefined) {\n  throw new CaseNotFoundError(key.slug, key.version);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest and released\
    \ subqueries, lines 364-377 — SELECT DISTINCT ON (slug) slug, state, authored_at,\n              COUNT(*)\
    \ OVER (PARTITION BY slug) AS version_count\n       FROM ${CASE_VERSIONS_TABLE}\n       ORDER BY slug,\
    \ version DESC"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft, guarding updateDraftVersion,\
    \ insertManifestEntry, deleteManifestEntry and discardDraft, lines 943-947 — function refuseUnlessDraft(key:\
    \ ICaseVersionKey, state: CaseVersionState): void {\n  if (state !== DRAFT_STATE) {\n    throw new\
    \ CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft and refuseUnlessDraftAtRelease,\
    \ lines 943-953 — function refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState):\
    \ void {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftAtReleaseError(key.slug,\
    \ key.version, state);\n  }\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assignNextVersion / nextVersionUpdateStatement,\
    \ lines 673-688 — UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug = $1\n\
    \       RETURNING next_version - 1 AS version"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at requireCaseHoldsDraft, checked before\
    \ any write, in insertRevision (line 742) and overwriteRevision (line 798) — async function overwriteRevision(tx:\
    \ IQueryable, input: OverwriteHypothesisRevisionInput): Promise<void> {\n  await requireCaseHoldsDraft(tx,\
    \ input.slug);\n  const key: IRevisionKey = { slug: input.slug, hypothesis_name: input.hypothesis_name,\
    \ revision: input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input), raiseOverwriteFailure(input));"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  decided_by: reading
  remainder: testable
  remainder_why: Two assertions would close it. First, a case whose draft declares subject type S, plus
    a revise request collecting a concept accepted for S but not for the subject type of an earlier released
    version (or of a value sent with the request). The request is accepted, and a concept accepted only
    for the other type is refused. Second, a revise request through HTTP against a case holding no draft,
    including one whose target revision is released. The answer is HTTP 409, the body reports CaseHoldsNoDraftError
    with a message naming the slug and details exactly { slug }, no ReleasedHypothesisRevisionNotAlterableError
    appears, and no revision is written.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement, lines
    760-765 — ON CONFLICT (case_slug, name) DO NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure, lines\
    \ 850-855 — isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n  ? new ManifestPositionOccupiedError(input.slug,\
    \ input.version, input.position)"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at insertRevisionRow (new-revision path,\
    \ lines 776-787) and revisionOverwriteStatement (overwrite-in-place path, lines 818-826), offered\
    \ as separate primitives — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7\n...\n\
    UPDATE ${HYPOTHESIS_REVISIONS_TABLE}\n       SET criterion = $4, resolution_outcome = $5, resolution_action\
    \ = $6, resolution_recipient = $7\n       WHERE case_slug = $1 AND hypothesis_name = $2 AND revision\
    \ = $3"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessHypothesisRevisionDraftAtRelease,\
    \ lines 644-648 — if (state !== HYPOTHESIS_REVISION_DRAFT_STATE) {\n  throw new HypothesisRevisionNotDraftAtReleaseError();\n\
    }"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement, line 781
    — COALESCE(MAX(revision), 0) + 1'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect, lines\
    \ 539-548 — ORDER BY revision DESC\n       LIMIT $3 OFFSET $4"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf, lines
    571-579 — state: hypothesisRevisionStateOf(row.state),'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and manifestCopyStatement,
    lines 690-703 and 727-735 (see the finding above for the gap in this coverage) — const row = await
    queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug), raiseWriteFailure);

    return row?.version ?? undefined;'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the overwrite-refusal
    assertion against a revision whose own stored state is released, mapped to HTTP 409 — const rejection
    = store.overwriteHypothesisRevision({ slug, hypothesis_name: ''a-hypothesis'', revision, criterion:
    "a criterion the revision''s own released state should have refused", collects: [], resolution: aResolution(glossary)
    }); await expect(rejection).rejects.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError); const
    caught = await rejection.catch((error: unknown) => error); expect(statusForError(caught)).toBe(409);'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement, line 669-670
    — INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at discardDraft, lines 881-885, gated\
    \ by refuseUnlessDraft so only a draft version's row is ever removed — async function discardDraft(tx:\
    \ IQueryable, key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key, await requireVersionState(tx,\
    \ key));\n  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n  await\
    \ runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n}"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect, lines 386-397 — WHERE\
    \ cvh.case_slug = $1 AND cvh.case_version = $2\n       ORDER BY cvh.position"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's released subquery,\
    \ lines 371-376 — SELECT DISTINCT ON (slug) slug, version, title, when_to_use\n       FROM ${CASE_VERSIONS_TABLE}\n\
    \       WHERE state = $3\n       ORDER BY slug, version DESC\n     ) released"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionRow / releaseHypothesisRevisionStatement,\
    \ lines 639-656 — UPDATE ${HYPOTHESIS_REVISIONS_TABLE} SET state = $4\n       WHERE case_slug = $1\
    \ AND hypothesis_name = $2 AND revision = $3"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raiseOverwriteFailure, lines 807-812,\
    \ with insertRevision (lines 741-751) as the caller's next-revision path — isReleasedRevisionRefusal(cause)\n\
    \  ? new ReleasedHypothesisRevisionNotAlterableError(input.slug, input.hypothesis_name, input.revision)\n\
    \  : raiseWriteFailure(cause);"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/persistence/relational-case-store.repository.ts
  where: resolveSourceVersion (lines 690-696) and manifestCopyStatement (lines 727-735), used by createDraftVersion
  evidence: "if (input.source_version !== undefined) {\n  return input.source_version;\n}\n...\nINSERT\
    \ INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name, revision, position)\n\
    \       SELECT case_slug, $2, hypothesis_name, revision, position\n       FROM ${CASE_VERSION_HYPOTHESES_TABLE}\n\
    \       WHERE case_slug = $1 AND case_version = $3"
  cost: 'A create-draft that names a source_version this case never held — mistyped, or a version long
    since discarded — is never refused: the copy statement''s SELECT simply matches no row, so the new
    draft is created anyway with an empty manifest, reading exactly like a case''s legitimate first-ever
    draft. A curator who asked to continue from an earlier version has no way to tell "rolled back, and
    that version happened to be empty" from "the version I named was never found," and no refusal names
    the version that failed to resolve.'
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/overwrite-hypothesis-revision-draft-guard-corrective.returns/.

  Certification of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft did not hold:
  the auditor answered `partial` — The store-level half of the fact is exercised, and these tests would
  fail if it stopped holding. A revision is refused through CaseHoldsNoDraftError when the case holds
  no draft, for a new revision and for an overwrite. The overwrite leaves the stored criterion, collects
  and resolution unchanged, and inserting leaves no row. The error''s message contains the slug and its
  context equals exactly { slug }. With a released revision and no draft, CaseHoldsNoDraftError is what
  the store answers, not ReleasedHypothesisRevisionNotAlterableError. Where a draft exists, the overwrite
  goes through. Three parts of the fact go unexercised. (1) Nothing in the file runs a concept-acceptance
  check, so nothing shows that the new revision''s check uses the draft version''s declared subject type
  rather than another one, such as a released version''s or one sent with the request. The foreign-key
  test on an unregistered concept is not that check. (2) No test applies statusForError to CaseHoldsNoDraftError
  or sends a request through HTTP. So the refusal "with an HTTP 409 response" is not exercised. The only
  409 assertion in the file is for ReleasedHypothesisRevisionNotAlterableError. (3) "Details carry that
  slug and nothing else" is asserted on the error''s own context field, not on the details of an HTTP
  response, so what the response carries goes unexercised. Two smaller notes. The insert-path test''s
  name says "naming the slug", but it checks context only with toMatchObject; it never checks the message
  or that the context holds nothing else. The not.toBeInstanceOf check on ReleasedHypothesisRevisionNotAlterableError
  adds almost nothing to the positive CaseHoldsNoDraftError check, because a single rejection cannot report
  two errors. So "never alongside it" is guarded only by that positive check.. The node is decided by
  reading, and a certification standing on it from an earlier reconciliation is released by the bind.
  The remainder is testable: Two assertions would close it. First, a case whose draft declares subject
  type S, plus a revise request collecting a concept accepted for S but not for the subject type of an
  earlier released version (or of a value sent with the request). The request is accepted, and a concept
  accepted only for the other type is refused. Second, a revise request through HTTP against a case holding
  no draft, including one whose target revision is released. The answer is HTTP 409, the body reports
  CaseHoldsNoDraftError with a message naming the slug and details exactly { slug }, no ReleasedHypothesisRevisionNotAlterableError
  appears, and no revision is written..

  Staged by a review over files a delivery wrote: every pair a delivery or a hand stamped was judged,
  and a pair was omitted only where a reconciliation''s judgment had cleared it at these very bytes; the
  plan''s node(s) rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased,
  domain/knowledge/hypothesis-revision were read on every file and answered for, and bound from nowhere
  here — a binding this record writes is one the trace already held.

  A finding in src/__tests__/integration/persistence/relational-case-store.repository.spec.ts names rules/knowledge/a-hypothesis-collects-at-least-one-concept,
  which no file of this set is bound to: the it block ''answers none of the concepts the revision collected
  before the replacement, once the replacement drops them all'', lines 1912-1938 (and the identical pattern
  recurring throughout the file wherever a revision is built with `collects: []`, e.g. lines 368-371,
  641-658, 1030-1041, 1811-1827, 1891-1909, 1919-1938, 1946-1968): await store.overwriteHypothesisRevision({
  slug, hypothesis_name: ''a-hypothesis'', revision, criterion: ''the replaced criterion'', collects:
  [], resolution: aResolution(glossary) });

  const page = await store.listHypothesisRevisions(slug, ''a-hypothesis'', { offset: 0, limit: 20 });
  expect(page.data[0]?.collects).toEqual([]); — A reader trusting this passing suite would conclude that
  RelationalCaseStore lets a hypothesis-revision stand with zero collected concepts — both freshly inserted
  and after an overwrite that strips every concept away — with no rejection anywhere in the file and no
  import of HypothesisRevisionCollectsNoConceptError at all; the next reader chasing why a revision with
  nothing to cite still passed the store''s own gate would not find the refusal here, because this suite
  pins the opposite as the accepted outcome for exactly the operation (overwrite) this file''s own task
  concerns.. It blocks nothing here; it is owed a route of its own.

  Candidates: 2 opened across 2 of 2 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/overwrite-hypothesis-revision-draft-guard-corrective.returns/`, which are the evidence behind every entry above.
