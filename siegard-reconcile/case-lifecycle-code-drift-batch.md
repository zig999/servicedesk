---
contract_version: siegard-reconcile/4
title: Case/hypothesis-revision lifecycle code drift batch
summary: These 8 files stand at HEAD after ordinary delivered work landed on them without every one of
  their trace bindings being restamped by the delivering task alone (a bind restamps only the delivering
  task's own nodes, and these files' bindings span several past initiatives). The human asserts the source
  as it stands now is correct and asks whether the specification nodes the trace already binds to these
  files still hold against that source.
target: backend
files:
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: Proves the case-version lifecycle schema and its migration-driven triggers, including release-immutability
    for case_versions rows and for the case_version_hypotheses manifest, but proves no equivalent release-immutability
    case for a hypothesis_revisions row.
- path: src/case/case-query.service.ts
  change: Reads a case version and its input requirements by slug and version, refusing an unknown slug/version
    and a version that fails coherence, and lists case versions, hypotheses and hypothesis revisions by
    slug.
- path: src/case/case-store.port.ts
  change: Declares the case-version lifecycle state vocabulary and the store's port surface, including
    the draft-only shape a hypothesis revision is authored against.
- path: src/case/release.operation.ts
  change: Releases a case version by slug and version, resolving the assembled version through the case
    store before applying the release's own checks.
- path: src/case/validate-case-coherence.ts
  change: Validates a case version's coherence against the glossary and the capability registry, collecting
    every violation before refusing, and derives per-concept capability-answering gaps.
- path: src/errors/case-not-valid.error.ts
  change: Re-exports CaseVersionNotValidError from case-version-not-valid.error.ts.
- path: src/persistence/relational-case-store.repository.ts
  change: Implements the case store port against the relational schema — draft creation and next-version
    assignment, hypothesis-revision insertion gated on the case holding a draft, hypothesis-revision release,
    and slug-keyed case identity.
- path: src/seed.ts
  change: Seeds a case's hypotheses, hypothesis revisions and a released case read, exercising the hypothesis-collects-at-least-one-concept,
    hypothesis-revision-lifecycle and validation-runs-at-every-read facts through calls into the case
    and lifecycle modules rather than implementing them itself.
nodes:
- node: contracts/system/case-authoring
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, src/case/validate-case-coherence.ts,
    and src/errors/case-not-valid.error.ts read `nowhere` — export { CaseVersionNotValidError } from ''./case-version-not-valid.error.js'';
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
  - src/errors/case-not-valid.error.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-query.service.ts: held at the `slug` accepted as the sole identifying parameter\
    \ of every query method, and carried through to the assembled version's own field — public async readCase(slug:\
    \ string, version: number): Promise<ReadCaseResult> {\n...\nslug: assembled.slug,\nsrc/case/validate-case-coherence.ts:\
    \ held at the identity passed to the coherence refusal, line 54 — throw new IncoherentCaseError(theCase.slug,\
    \ violations);\n\nsrc/persistence/relational-case-store.repository.ts: held at assignNextVersion()\
    \ / nextVersionUpdateStatement(), invoked from createDraftVersion() — the one counter is incremented\
    \ and the previous value handed out as the new draft's version. — function nextVersionUpdateStatement(slug:\
    \ string): IStatement {\n  return {\n    text: `UPDATE ${CASES_TABLE} SET next_version = next_version\
    \ + 1\n       WHERE slug = $1\n       RETURNING next_version - 1 AS version`,\n    params: [slug],\n\
    \  };\n}"
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/case/case-store.port.ts: held at the CaseVersionState type declaration, line 5 — export type
    CaseVersionState = ''draft'' | ''released'';'
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: false
  how: "src/case/validate-case-coherence.ts, capabilityViolations (lines 102-111) and answerGaps (lines\
    \ 113-129): function answerGaps(concept: string, resolution: CapabilityResolution): string[] {\n \
    \ if (!resolution.held) {\n    return [`no read-only capability currently answers the concept \"${concept}\"\
    `];\n  }\n  const { capability } = resolution;\n  const gaps: string[] = [];\n  if (capability.nature\
    \ !== READ_ONLY_NATURE) {\n    gaps.push(answeringGap(concept, 'is not read-only'));\n  }\n  if (!declaresText(capability.output_schema))\
    \ {\n    gaps.push(answeringGap(concept, 'declares no output schema'));\n  }\n  if (!declaresTimeout(capability.timeout))\
    \ {\n    gaps.push(answeringGap(concept, 'declares no timeout'));\n  }\n  return gaps;\n}\n — A reader\
    \ who follows this rule's binding to this file to see how a case version's input requirements are\
    \ derived — one case-input-requirement per subject attribute, its `required` taken from whichever\
    \ answering capability's own input schema names it — finds instead a check that the concept's answering\
    \ capability is read-only and declares an output schema and a timeout; `capability.input_schema` is\
    \ never read here and no per-attribute requirement is ever assembled, so the binding points at code\
    \ answering a different question (which capability answers the concept and whether it is fit to be\
    \ read from) than the one the statement names."
  observed_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/seed.ts read `nowhere` — collects: entry.collects,'
  observed_at:
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/case/case-store.port.ts: held at the DraftVersion type (lines 51-54) exposing the draft's\
    \ own subject, and HypothesisRevisionInput (lines 56-62) carrying no subject field of its own — export\
    \ type DraftVersion = {\n  readonly version: number;\n  readonly subject: string;\n};\nexport type\
    \ HypothesisRevisionInput = {\n  readonly slug: string;\n  readonly hypothesis_name: string;\n  readonly\
    \ criterion: string;\n  readonly collects: readonly string[];\n  readonly resolution: Resolution;\n\
    };\nsrc/persistence/relational-case-store.repository.ts: held at requireCaseHoldsDraft(), called at\
    \ the top of insertRevision() before any revision row is written. — async function requireCaseHoldsDraft(tx:\
    \ IQueryable, slug: string): Promise<void> {\n  const row = await queryOneOrAbsent<{ version: number\
    \ }>(tx, draftVersionSelect(slug), raiseReadFailure);\n  if (row === undefined) {\n    throw new CaseHoldsNoDraftError(slug);\n\
    \  }\n}"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: false
  how: 'the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,
    and src/seed.ts read `nowhere` — await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name,
    revision.revision); — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts, the hypothesis_revisions
    tests, lines 263-302, alongside the release-immutability tests at lines 371-385 and 428-471: "changes
    an already-stored hypothesis revision''s own columns on an ordinary UPDATE while the revision''s own
    state is still draft" (the test at line 287), whose insertHypothesisRevision helper (lines 90-98)
    never names a `state` column at all — no test in this file inserts a hypothesis_revisions row in ''released''
    state or attempts an UPDATE against one. — This file''s own beforeAll applies every migration file
    in the directory (migrationFilesInOrder(), line 140), so the schema under test already carries hypothesis_revisions.state
    and the hypothesis_revisions_no_update_when_released trigger that raises ReleasedHypothesisRevisionNotAlterableError.
    The file already proves the analogous release-immutability for case_versions rows (line 371) and for
    case_version_hypotheses manifest entries (line 428), so a reader trusts it covers the sibling table
    too; nothing here would fail if that trigger were dropped or its condition weakened, so a regression
    reopening a released hypothesis-revision to UPDATE passes this suite silently.'
  observed_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: "src/case/case-query.service.ts: held at slug used as the sole key locating a case across every\
    \ read method — readCase, listCaseVersions, listHypotheses, listHypothesisRevisions — never combined\
    \ with any other disambiguator — public async listCaseVersions(\n    slug: string,\n    pagination:\
    \ PaginationRequest,\n  ): Promise<PaginatedResponse<CaseVersionListItem>> {\nsrc/case/release.operation.ts:\
    \ held at the operation's own signature and its lookup, which treat `slug` (together with `version`)\
    \ as sufficient to resolve exactly one case version — public async release(slug: string, version:\
    \ number): Promise<void> {\n  const assembled = await heldAssembledVersion(this.caseStore, slug, version);\n\
    src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement(), called at the\
    \ top of createDraftVersion(); the ON CONFLICT clause presupposes the slug column's own unique constraint,\
    \ which is what makes the statement a no-op rather than a second row. — function caseIdentityStatement(slug:\
    \ string): IStatement {\n  return { text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT\
    \ (slug) DO NOTHING`, params: [slug] };\n}"
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: 'no named file holds this fact now: src/seed.ts read `nowhere` — await createCaseQuery(connection).readCase(CASE_SLUG,
    CASE_VERSION);'
  observed_at:
  - src/seed.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/case-lifecycle-code-drift-batch: `test-unit` passed (exit 0) over
    node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair,
    and the run is the whole of what answered it'
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
pairs_omitted:
- node: constraints/the-schema-replays-from-its-scripts
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
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
- node: domain/knowledge/case
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
- node: constraints/the-system-persists-to-one-relational-database
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/system/case-authoring
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/manifest-entry
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/capability-check
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/vocabulary-terms
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/referral
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/resolution
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
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
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
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
- node: domain/glossary/concept
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/outcome
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
notes: 'Judged by 8 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-lifecycle-code-drift-batch.returns/.

  3 pair(s) over 1 node(s) were decided by run/case-lifecycle-code-drift-batch rather than by a judge
  — a registry step decides the constraint, or a certified test decides the node — with step(s) test-unit.
  No delegation read them; the run''s own log is the evidence, and it sits beside these returns.

  Candidates: 4 opened across 2 of 8 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-lifecycle-code-drift-batch.returns/`, which are the evidence behind every entry above.
