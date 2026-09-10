---
contract_version: siegard-reconcile/4
title: Case-lifecycle node re-read with offered test certifications
summary: These 3 files stand at HEAD, already reconciled once in case-lifecycle-code-drift-batch (same
  commit range, no source change since). The human offers four sets of existing tests as proof for four
  of the nodes this reconciliation's earlier pass cleared by reading alone, asking whether those tests
  would fail if the node's fact stopped holding, so that a node the auditor confirms is decided by a test
  from here rather than by a fresh reading on every future drift.
target: backend
files:
- path: src/case/case-query.service.ts
  change: Reads a case version and its input requirements by slug and version, refusing an unknown slug/version
    and a version that fails coherence, and lists case versions, hypotheses and hypothesis revisions by
    slug. Read-only; declares no write-side operation.
- path: src/case/case-store.port.ts
  change: Declares the case-version lifecycle state vocabulary, the hypothesis-revision state vocabulary
    as a runtime array, and the store's port surface, including the draft-only shape a hypothesis revision
    is authored against.
- path: src/persistence/relational-case-store.repository.ts
  change: Implements the case store port against the relational schema — draft creation and next-version
    assignment, hypothesis-revision insertion gated on the case holding a draft, hypothesis-revision release
    performed as an unconditional UPDATE with no prior-state guard, case-version release gated on the
    version's own draft state, and slug-keyed case identity.
nodes:
- node: contracts/system/case-authoring
  conforms: true
  how: "src/case/case-query.service.ts: held at nowhere — this file has no operation that composes, releases\
    \ or otherwise writes a case version; every public method reads — public async readCase(slug: string,\
    \ version: number): Promise<ReadCaseResult> { ... } public async listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>> {\n  return this.caseStore.listCases(pagination);\n\
    }"
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/case
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-store.port.ts, src/persistence/relational-case-store.repository.ts,
    and src/case/case-query.service.ts read `nowhere` — public async readCase(slug: string, version: number):
    Promise<ReadCaseResult> { ... } — slug and version arrive as plain parameters used only to key a read;
    the file declares no create-draft operation, no next_version counter and no slug-uniqueness check
    anywhere — a binding asserts the file answers for the node, so the pair that stopped holding it is
    released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/case/case-store.port.ts: held at the `CaseVersionState` type alias, line 5 — export type CaseVersionState\
    \ = 'draft' | 'released';\nsrc/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft\
    \ (used by insertManifestEntry, deleteManifestEntry, discardDraft and updateDraftVersion — every lifecycle\
    \ operation other than release) and refuseUnlessDraftAtRelease (used only by releaseVersion), lines\
    \ 880-890. — function refuseUnlessDraft(key: ICaseVersionKey, state: CaseVersionState): void {\n \
    \ if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug, key.version, state);\n\
    \  }\n}\nfunction refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState): void\
    \ {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftAtReleaseError(key.slug, key.version,\
    \ state);\n  }\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  decided_by: reading
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseInputRequirements(), lines 41-47 — public async\
    \ readCaseInputRequirements(slug: string, version: number): Promise<CaseInputRequirementsResult> {\n\
    \  const assembled = await heldVersion(this.caseStore, slug, version);\n  const theCase = structuralCase(assembled,\
    \ slug, version);\n  await this.refuseGlossaryIncoherence(theCase, version);\n  const registeredCapabilities\
    \ = await everyRegisteredCapability(this.capabilities);\n  return deriveCaseInputRequirements(theCase,\
    \ registeredCapabilities);\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/case/case-store.port.ts: held at the `findDraftVersion` operation and the `DraftVersion` type\
    \ it returns, and the absence of any subject field on `HypothesisRevisionInput` — findDraftVersion(slug:\
    \ string): Promise<DraftVersion | undefined>;\n...\nexport type DraftVersion = {\n  readonly version:\
    \ number;\n  readonly subject: string;\n};\n...\nexport type HypothesisRevisionInput = {\n  readonly\
    \ slug: string;\n  readonly hypothesis_name: string;\n  readonly criterion: string;\n  readonly collects:\
    \ readonly string[];\n  readonly resolution: Resolution;\n};\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at insertRevision calls requireCaseHoldsDraft(tx, input.slug) before inserting any revision\
    \ row; findDraftVersion separately exposes the draft's own subject for a caller's concept-acceptance\
    \ check. — async function requireCaseHoldsDraft(tx: IQueryable, slug: string): Promise<void> {\n \
    \ const row = await queryOneOrAbsent<{ version: number }>(tx, draftVersionSelect(slug), raiseReadFailure);\n\
    \  if (row === undefined) {\n    throw new CaseHoldsNoDraftError(slug);\n  }\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  decided_by: reading
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/case/case-store.port.ts, the module-level constant, line 7: export const HYPOTHESIS_REVISION_STATES\
    \ = ['draft', 'released'] as const; — This runtime array re-enumerates the hypothesis-revision lifecycle's\
    \ own states (initial draft, terminal released) as a second, independently-maintained vocabulary in\
    \ the port file, rather than the port reading the two states from the rule that declares them — the\
    \ way `CaseVersionState` is declared here as a bare type alias with no backing array. If the lifecycle's\
    \ declared states ever change, this constant is a second place a reader must remember to update, and\
    \ nothing here ties it back to the node that owns it.\nsrc/persistence/relational-case-store.repository.ts,\
    \ releaseHypothesisRevisionRow / releaseHypothesisRevisionStatement, lines 615-625: async function\
    \ releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey): Promise<void> {\n  await runStatement(tx,\
    \ releaseHypothesisRevisionStatement(key), raiseWriteFailure);\n}\nfunction releaseHypothesisRevisionStatement(key:\
    \ IRevisionKey): IStatement {\n  return {\n    text: `UPDATE ${HYPOTHESIS_REVISIONS_TABLE} SET state\
    \ = $4\n           WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3`,\n    params:\
    \ [key.slug, key.hypothesis_name, key.revision, HYPOTHESIS_REVISION_RELEASED_STATE],\n  };\n} — A\
    \ revision already released — or a hypothesis-revision identity nothing was ever stored for — can\
    \ be released again through this path with no refusal at all: the UPDATE runs unconditionally (or\
    \ silently matches zero rows) instead of raising HypothesisRevisionNotDraftAtReleaseError. The sibling\
    \ operation on the case-version path in this same file (releaseVersion → refuseUnlessDraftAtRelease\
    \ → CaseVersionNotDraftAtReleaseError) does perform the check, so the next reader who trusts that\
    \ pattern to repeat here will not find the guard, and the one-way draft-to-released transition the\
    \ rule requires is not enforced at this layer."
  observed_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: "the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,\
    \ and src/case/case-query.service.ts read `nowhere` — public async listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>> {\n  return this.caseStore.listCases(pagination);\n\
    } — the file only forwards slugs to the store for reads; no code here asserts or checks that a slug\
    \ names at most one case — a binding asserts the file answers for the node, so the pair that stopped\
    \ holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
pairs_omitted:
- node: constraints/a-case-is-read-whole
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-query
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/replay-is-pinned
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/a-case-is-read-whole
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-query
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-summary
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/manifest-entry
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/a-case-is-read-whole
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-query
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-summary
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/manifest-entry
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-has-at-most-one-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 3 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-lifecycle-test-certification.returns/.

  Certification of domain/knowledge/case did not hold: the auditor answered `uncovered` — Every part of
  the fact the node states is supplied by FakeCaseStore, the test double declared inside this same proof
  file, so no assertion in the set can fail when the fact stops holding in the delivered system. The counter
  is unexercised in all three of its stated parts: nothing reads next_version, nothing calls the store''s
  discard at all, and so the node''s central claim — that the number assigned to the next draft is always
  greater than every version this case has ever held, including one later discarded — has no test that
  would notice a reused number. create-draft as the operation that originates a new draft version is only
  ever the fixture''s own seedCase helper; the composition under test, CaseQueryService, never originates
  a version. Two tests bear on the identity incidentally and certify nothing: "answers each version by
  its own content, never another version''s" and "answers the version stored under the named slug, never
  the same version number stored under a different slug" both assert that a read passes the slug and version
  it was handed through to the store, against version numbers the fake itself assigned, and a slug never
  shared with another case is a property of the fake''s Map keying rather than an asserted behavior —
  both pass unchanged if a case''s slug stopped being its own stable identity. A reader who opens this
  file will find these tests and should not conclude the audit missed them.. The node is decided by reading,
  and a certification standing on it from an earlier reconciliation is released by the bind.

  Certification of rules/knowledge/a-case-version-moves-through-its-declared-lifecycle did not hold: the
  auditor answered `partial` — Exercised: the one declared transition — a draft that holds moves to released
  and records the instant — and that a refused release leaves the version in draft with no release recorded;
  and release asked of a version standing in released is refused through CaseVersionNotDraftAtReleaseError
  whose context is asserted to equal exactly the slug, the version number and the state it stood in. Unexercised,
  two stated parts. First, the HTTP 409 both refusals are stated to carry: every test in the file calls
  ReleaseOperation.release() directly against a RelationalCaseStore and asserts on the thrown error object,
  so no response and no status code is ever observed — the transport could answer 400, 422 or 500 for
  either refusal and the whole file would still pass. Second, the refusal stated for a lifecycle operation
  other than release asked of a version not in draft state: nothing in the file invokes any non-release
  lifecycle operation, CaseVersionNotDraftError is neither imported nor referenced, and so that refusal
  and its reported error are wholly unexercised. The file''s proof of "moves only along its declared lifecycle"
  is also confined to the release trigger; no test attempts any other trigger out of released.. The node
  is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind.

  Certification of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft did not hold:
  the auditor answered `partial` — Two of the fact''s three parts are exercised and would fail if they
  stopped holding: the revise-only-while-a-draft-is-held part is exercised in both directions (three refusals
  — no version ever, only version released, draft discarded — plus a success where a draft coexists with
  an already-released version, so the gate cannot be satisfied by a stub that always refuses), and the
  subject-type-comes-from-the-draft part is exercised by the pair that makes input.subject disagree with
  the draft''s declared subject, one asserting the revise succeeds on the draft''s subject and one asserting
  the refusal''s context names the draft''s subject rather than input.subject. The third part goes unexercised:
  the fact states the refusal is delivered "with an HTTP 409 response reporting a CaseHoldsNoDraftError",
  and every test in the offered proof calls ReviseHypothesisOperation.reviseHypothesis directly and asserts
  only the rejected value''s error type and context. Nothing in the set drives an HTTP request or reads
  a status code, so the status the refusal surfaces as could change to any other code and the whole file
  would still pass; the mapping from CaseHoldsNoDraftError to 409 must be proved at whatever layer builds
  the response, and that test is outside the proof offered here. One further note for a reader opening
  the file: the last test, "excludes an implementation that originates a hypothesis identity and revision
  for a case holding no draft version at all, without refusing", asserts only rejects.toBeInstanceOf(Error),
  which any thrown error satisfies — it does not bind the refusal to CaseHoldsNoDraftError, and the three
  named refusal tests above are what carry that part.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind.

  Certification of rules/knowledge/a-slug-identifies-one-case did not hold: the auditor answered `partial`
  — The fact is that no two cases share a slug. Nothing in the offered proof ever attempts to bring a
  second case into existence under a slug a case already holds and observes that attempt refused: no test
  writes a second `cases` row for one slug — neither directly (a second `INSERT INTO cases` expecting
  the unique violation) nor through the store — so the constraint that makes the slug the case''s identity
  is never put under the pressure the rule names. The four cited integration tests bear on the fact only
  incidentally, and each on the way to asserting something else: the two catalog tests assert that the
  listing projection does not multiply a case across its versions (one entry, and a total that counts
  cases rather than versions) and would fail if repeated `createDraft` calls under one slug produced a
  second case row, but their subject is the projection''s grouping, not the identity constraint, and they
  exercise only the one write path that ever creates a case row; the two draft tests assert draft uniqueness
  per case (CaseAlreadyHasDraftError, sequential and concurrent) and would fail if a same-slug call produced
  a fresh case with its own draft, but they would be changed the day the draft rule changes and nothing
  marks the slug-identity half as load-bearing. They also reach the fact only through `createDraft`; a
  duplicate arriving by any other write, or by the storage constraint itself being dropped, is unexercised.
  src/__tests__/unit/case/case-query.service.spec.ts cannot bear on the fact at all: its FakeCaseStore
  holds cases in a `Map<string, ICaseRecord>` keyed by slug, so one slug can hold only one case by construction
  of the double — including "answers the version stored under the named slug, never the same version number
  stored under a different slug", which exercises slug-scoped lookup while presuming the invariant rather
  than testing it. A test there would not fail if the fact stopped holding in the system.. The node is
  decided by reading, and a certification standing on it from an earlier reconciliation is released by
  the bind.

  Candidates: 4 opened across 2 of 3 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-lifecycle-test-certification.returns/`, which are the evidence behind every entry above.
