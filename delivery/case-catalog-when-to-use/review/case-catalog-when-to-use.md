---
title: case-catalog-when-to-use, first review
summary: 'What four passes found over the store-derives-the-case-summary delivery: the case-summary derivation
  and its tests, and everything else the trace still binds to the five source files touched.'
reviewed:
- src/case/case-store.port.ts
- src/case/case-query.port.ts
- src/case/case-query.service.ts
- src/http/list-cases.controller.ts
- src/persistence/relational-case-store.repository.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/http/list-cases.routes.spec.ts
tasks:
- task/case-catalog/store-derives-the-case-summary
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/case-catalog-when-to-use) passed clean — there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: The listing's entry declares all six attributes domain/knowledge/case-summary names, with
    version_count the only one always present.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes
      — current_state, version_count, last_updated, title, when_to_use and released_version — nothing
      more, for a case whose highest-numbered version is released
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries none of title, when_to_use and released_version, each absent rather than null or empty,
      for a case currently holding no released version at all
- criterion: The entry carries no field beyond those six and the slug of the case it summarizes.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes
      — current_state, version_count, last_updated, title, when_to_use and released_version — nothing
      more, for a case whose highest-numbered version is released
- criterion: An entry's title, when_to_use and released_version are read from the highest-numbered version
    of that case whose state is released.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: reads an entry's title, when_to_use and released_version off the highest-numbered version whose
      state is released, never off an earlier released version of the same case
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the released version's own title, when_to_use and released_version, never the higher-numbered
      draft's, when that case's highest-numbered version is a draft above a released one
- criterion: An entry for a case currently holding no released version carries none of title, when_to_use
    and released_version, each absent rather than null or empty.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries none of title, when_to_use and released_version, each absent rather than null or empty,
      for a case currently holding no released version at all
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
- criterion: An entry for a case whose highest-numbered version is a draft above a released one carries
    the released version's when_to_use and never the draft's.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the released version's own title, when_to_use and released_version, never the higher-numbered
      draft's, when that case's highest-numbered version is a draft above a released one
- criterion: An entry's current_state and last_updated are read from the case's highest-numbered version,
    whatever state that version is in.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: reads an entry's current_state and last_updated off the case's highest-numbered version whatever
      its own state, even though that same case's released fields still come from the earlier released
      version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes
      — current_state, version_count, last_updated, title, when_to_use and released_version — nothing
      more, for a case whose highest-numbered version is released
  why: 'Only the draft-highest branch is asserted by value: nothing in the set asserts current_state ''released''
    or a last_updated read off a released highest-numbered version. The one test over a released highest
    version asserts key presence alone, so an implementation emitting ''draft'' for every case, or reading
    last_updated from the wrong version whenever the highest is released, would pass. The ''whatever state
    that version is in'' half is unexercised for the released state.'
- criterion: An entry's version_count is the number of versions that case currently holds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: counts an entry's version_count as the number of versions that case currently holds, across
      every state
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
- criterion: An entry for a case currently holding no version has version_count 0 and carries neither
    current_state nor last_updated.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
- criterion: A case currently holding no version still appears in the page as its own entry.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: still shows a case currently holding no version as its own entry in the page
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
- criterion: No case appears more than once in a page, whatever number of versions it holds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a case exactly once in the page, however many versions it currently holds
- criterion: The page's total is the number of cases currently held, unaffected by how many versions any
    case holds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves the page's total the number of cases currently held, unaffected by how many versions
      any case holds
- criterion: The same offset and limit select the same cases, in the same order, as they did before the
    summary fields were derived.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the page in ascending slug order, the same order the offset and limit selected before
      the summary fields were derived, regardless of the order the cases were created in
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every case currently held, with no filter narrowing it, so all three freshly created
      cases show up on one wide-enough page
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares — the given limit and
      offset echoed back, the page itself held to that limit even though more cases exist, and pageCount
      computed from total and limit
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: 'answers an empty page — data: [] — rather than an error or an absent value, for a page far
      beyond anything the table could hold'
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves the page's total the number of cases currently held, unaffected by how many versions
      any case holds
  why: The order half is exercised only at offset 0 on a limit wide enough to hold every case, and only
    over the three slugs the test filters back out, so relative order among its own rows is asserted while
    the page's own selection boundary is not. Every listCases call in the set except the far-beyond-the-table
    empty page uses offset 0, so nothing selects a case set at a nonzero offset and compares it against
    what that offset selected before derivation — the 'same offset and limit select the same cases' half
    is unexercised. The limit-1 envelope test asserts the page length but never which case landed in it,
    so a derivation that reordered or dropped rows under a truncating limit would pass.
findings:
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: listCasesPage (lines 241-251), and the same pattern repeated in listCaseVersionsPage, listHypothesesPage
    and listHypothesisRevisionsPage
  cites: ARC-04
  evidence: "async function listCasesPage(tx: IQueryable, pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>\
    \ {\n  const total = await countCases(tx);\n  const rows = await runStatement<ICasesPageRow>(tx, casesPageSelect(pagination),\
    \ raiseReadFailure);\n  return {\n    data: rows.map(caseCatalogEntryOf),\n    total,\n    limit:\
    \ pagination.limit,\n    offset: pagination.offset,\n    pageCount: pageCountOf(total, pagination.limit),\n\
    \  };\n}"
  cost: The repository assembles the entire PaginatedResponse envelope, including the derived pageCount
    = ceil(total/limit) that API-03's own scope assigns to the service or controller layer, and does it
    identically four separate times (listCasesPage, listCaseVersionsPage, listHypothesesPage, listHypothesisRevisionsPage)
    rather than once. case-query.service.ts's listCases/listCaseVersions/listHypotheses/listHypothesisRevisions
    do nothing but forward the call, so a second store implementation, or a change to how a page count
    is derived, has four copies to keep in step rather than one.
  correction: Have the repository methods return the rows and the total; compute limit, offset and pageCount
    once, in the service (or one shared helper the service calls).
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: requireCaseIdentity (343-348), requireHypothesisIdentity (425-430), and the not-found branch
    of updateDraftVersion (666-670)
  cites: COR-03
  evidence: "async function requireCaseIdentity(tx: IQueryable, slug: string): Promise<void> {\n  const\
    \ row = await queryOneOrAbsent<{ slug: string }>(tx, caseIdentitySelect(slug), raiseReadFailure);\n\
    \  if (row === undefined) {\n    throw new CaseNotFoundError(slug, NO_VERSION_NAMED);\n  }\n}"
  cost: 'The repository raises CaseNotFoundError itself — a business error — at three sites, rather than
    the data error COR-03 assigns it. The same file''s own assembleVersion/findDraftVersion show the alternative
    already exists here: they answer undefined and let case-query.service.ts''s heldVersion decide to
    raise CaseNotFoundError. Because requireCaseIdentity/requireHypothesisIdentity instead decide and
    raise the business error themselves, listCaseVersions, listHypotheses and listHypothesisRevisions
    can no longer be reused behind a caller that wants a different answer for ''no case by that slug''
    — the decision is already made before the call returns.'
  correction: Have requireCaseIdentity/requireHypothesisIdentity signal absence (e.g. return a boolean
    or undefined) and raise CaseNotFoundError in case-query.service.ts, the way heldVersion already does
    for assembleVersion.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: the state guard inside updateDraftVersion (666-676)
  cites: ARC-04
  evidence: "async function updateDraftVersion(tx: IQueryable, key: ICaseVersionKey, attributes: UpdateDraftInput):\
    \ Promise<void> {\n  const row = await queryOneOrAbsent<{ state: string }>(tx, caseVersionStateSelect(key),\
    \ raiseReadFailure);\n  if (row === undefined) {\n    throw new CaseNotFoundError(key.slug, key.version);\n\
    \  }\n  const state = caseVersionStateOf(row.state);\n  if (state !== DRAFT_STATE) {\n    throw new\
    \ CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n  await runStatement(tx, updateDraftStatement(key,\
    \ attributes), raiseWriteFailure);\n}"
  cost: '"A version can only be corrected while it is a draft" is a business rule, and it is decided here
    — read the state, branch on it, refuse or write — inside the repository rather than beside CaseQueryService''s
    own business guards (readCase''s refuseIncoherence). A second write path to the same table, or a job
    that needs the same guard, has to re-derive or re-trust this branch rather than find it once where
    the rest of this file''s business rules live.'
  correction: Have the service read the current state and decide before calling updateDraft, or have the
    repository report the state back for the service to act on, rather than branching on it itself.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: raiseCreateDraftFailure (569-571) and raisePlaceHypothesisFailure (629-633)
  cites: COR-03
  evidence: "function raiseCreateDraftFailure(slug: string): RaiseStoreError {\n  return (cause) => (isConstraintViolation(cause,\
    \ ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug) : raiseWriteFailure(cause));\n\
    }"
  cost: 'These two functions raise CaseAlreadyHasDraftError and ManifestPositionOccupiedError — business
    errors — directly from the repository on a unique-constraint violation, rather than the data error
    COR-03 assigns this layer. This sits in real tension with EDG-03, also in scope over this file, which
    requires a uniqueness violation to be ''caught where it is raised and answered through a typed error''
    — which is exactly what this code does. The two rules cannot both hold for a unique-constraint violation
    caught inside a repository method: EDG-03 wants it turned into a business error at the point of the
    violation, COR-03 wants that decision left to the service. This file follows EDG-03''s letter at COR-03''s
    cost; the two are pulling against each other here rather than one of them simply being unmet by an
    oversight.'
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: insertRevision(), lines 573-582, called from insertHypothesisRevision() at line 134-136
  evidence: "async function insertRevision(tx: IQueryable, input: HypothesisRevisionInput): Promise<number>\
    \ {\n  const key: IHypothesisKey = { slug: input.slug, hypothesis_name: input.hypothesis_name };\n\
    \  await runStatement(tx, hypothesisIdentityStatement(key), raiseWriteFailure);\n  const revision\
    \ = await insertRevisionRow(tx, input);"
  cost: A hypothesis revision can be inserted for a case that currently holds no draft version. The store's
    own CaseHoldsNoDraftError (imported nowhere in this file) is never raised, so the refusal the rule
    names never fires here, and a revision can be authored with no draft whose subject type the concept-acceptance
    step was meant to check it against.
  correction: insertRevision would need to look up the case's current draft version first and raise CaseHoldsNoDraftError
    when none exists, the same pattern updateDraftVersion already uses for CaseVersionNotDraftError.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: placeHypothesis(), lines 138-140, and raisePlaceHypothesisFailure(), lines 629-634
  evidence: "public async placeHypothesis(input: PlaceHypothesisInput): Promise<void> {\n  await runStatement(this.connection,\
    \ placeHypothesisStatement(input), raisePlaceHypothesisFailure(input));\n}"
  cost: place-hypothesis against a version that is not in draft state succeeds instead of being refused,
    so a released case version's manifest can be changed after publication — exactly the immutability
    an investigation's replay depends on.
  correction: Check the version's state (as updateDraftVersion does) before the insert and raise CaseVersionNotDraftError
    when it is not draft.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: removeManifestEntry(), lines 142-144
  evidence: "public async removeManifestEntry(slug: string, version: number, hypothesisName: string):\
    \ Promise<void> {\n  await runStatement(this.connection, removeManifestEntryStatement(slug, version,\
    \ hypothesisName), raiseWriteFailure);\n}"
  cost: A manifest entry can be removed from a released version's manifest with no refusal, letting a
    published procedure change after release with nothing in this file ever raising CaseVersionNotDraftError
    for it.
  correction: Check the version's state before the delete and raise CaseVersionNotDraftError when it is
    not draft.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: release(), lines 146-148, and releaseStatement(), lines 643-648
  evidence: "function releaseStatement(slug: string, version: number): IStatement {\n  return {\n    text:\
    \ `UPDATE ${CASE_VERSIONS_TABLE} SET state = $3, released_at = NOW() WHERE slug = $1 AND version =\
    \ $2`,\n    params: [slug, version, RELEASED_STATE],\n  };\n}"
  cost: release() can be invoked against a version that is not draft — including one already released
    — silently rewriting released_at, since the UPDATE carries no state precondition and CaseVersionNotDraftAtReleaseError
    is never imported or thrown anywhere in this file. A caller relying on the 409 refusal to detect a
    stale action gets a silent success instead.
  correction: releaseStatement's WHERE clause (or a preceding read, mirroring updateDraftVersion) would
    need to require state = draft, with a violation raising CaseVersionNotDraftAtReleaseError.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: discard(), lines 150-152, and discardDraft(), lines 650-653
  evidence: "async function discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {\n  await\
    \ runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n  await runStatement(tx,\
    \ deleteCaseVersionStatement(key), raiseWriteFailure);\n}"
  cost: discardDraft deletes a case_version and its manifest entries regardless of the version's current
    state, so a released version — and the investigation whose replay depends on it staying readable —
    can be removed through the same call path meant only for an abandoned draft.
  correction: discardDraft would need to check the version's state is draft before deleting, and refuse
    (or no-op with an error) otherwise.
- pass: conformance
  file: src/__tests__/unit/http/list-cases.routes.spec.ts
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
  correction: state, as a system-scope architecture constraint alongside constraints/a-malformed-request-is-refused-with-a-validation-error
    and constraints/listings-are-paged, that an unexpected error is answered with a generic response whose
    body never includes the underlying error's own message
reconciliation: siegard-reconcile/case-catalog-when-to-use.md
---

## What it is

Four passes over store-derives-the-case-summary's file set: whether the tests prove the task's twelve criteria (coverage), whether the five source files and three test files state only what the specification holds (conformance, one delegation per file, over both the delivery's own nodes and every other node the trace still binds to these files), whether the source follows the project's own standard (standard, 34 rules in scope by reading), and why the captured run failed (failures — it did not, so this pass has nothing to diagnose). The trace binds 27 node-file pairs cleared by this review and restamped; 3 it did not clear stand as they were.

## Notes

The four standard findings and five of the six conformance findings sit in relational-case-store.repository.ts, in functions this task's own delivery never touched (placeHypothesis, removeManifestEntry, release, discardDraft, insertRevision, requireCaseIdentity, updateDraftVersion) -- the conformance pass reads the whole file against every node the trace binds to it, not only the lines this delivery wrote, because the file changed at all and every other node's binding to it needed re-verifying.
The conformance pass's own candidate mechanism surfaced a sixth finding, against rules/knowledge/only-a-draft-case-version-may-be-discarded (discardDraft deleting a released version), which is not a node the trace binds to this file -- the fold recorded it as blocking no binding here, owed a route of its own, per the record's own notes.
Three trace-bound nodes did not clear and no bind was written for them: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle and rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, both against the findings above, and rules/knowledge/a-slug-identifies-one-case, which cleared nowhere in src/case/case-query.service.ts though the trace holds it bound there.
