---
contract_version: siegard-reconcile/3
title: hypothesis revision editable until published — backend
summary: Four backend tasks (epic hypothesis-revision-overwrite) delivering the schema, store and operation
  changes that let a hypothesis revision be overwritten in place while no released case version references
  it, and create the next revision once one does.
target: backend
files:
- path: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  change: 'written by the delivery of task/hypothesis-revision-overwrite/revision-alteration-refused-only-when-released:
    drops the unconditional hypothesis_revisions_no_update rule and replaces it with a BEFORE UPDATE trigger
    that refuses an UPDATE, raising ReleasedHypothesisRevisionNotAlterableError, only when a case version
    in released state references the revision through its manifest.'
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  change: modified by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision
    as its proof, rewriting the always-insert assertions the new rule inverts.
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: 'modified by the delivery of task/hypothesis-revision-overwrite/revision-alteration-refused-only-when-released:
    the case asserting the old unconditional immutability rule was replaced with two cases asserting the
    new, release-conditioned rule.'
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: modified by the delivery of task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place
    and task/hypothesis-revision-overwrite/read-highest-revision-and-release-state as their proof.
- path: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  change: written by the delivery of task/hypothesis-revision-overwrite/revision-alteration-refused-only-when-released
    as its proof.
- path: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
  change: written by the delivery of task/hypothesis-revision-overwrite/read-highest-revision-and-release-state
    as its proof.
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: modified by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision
    as its proof.
- path: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  change: modified by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision
    as its proof.
- path: src/case/case-store.port.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place:
    declares OverwriteHypothesisRevisionInput, and HypothesisRevisionInput extended with a revision field
    naming the exact existing revision to overwrite.'
- path: src/case/hypothesis-revision-overwrite.port.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place:
    new file declaring IHypothesisRevisionOverwrite, a port separate from ICaseStore exposing overwriteHypothesisRevision(input);
    imports only a type from case-store.port.ts.'
- path: src/case/hypothesis-revision-release-state.port.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/read-highest-revision-and-release-state:
    declares HighestRevisionReleaseState, a discriminated union answering either no-revision or a highest
    revision plus whether it is released-referenced.'
- path: src/case/revise-hypothesis.operation.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision:
    declares ReviseHypothesisStore as the constructor dependency type, and reviseHypothesis now reads
    readHighestRevisionReleaseState to choose between overwriteHypothesisRevision (unreleased highest
    revision) and insertHypothesisRevision (no revision yet, or released-referenced highest revision).'
- path: src/errors/released-hypothesis-revision-not-alterable.error.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place:
    new file declaring ReleasedHypothesisRevisionNotAlterableError, a typed Error a caller of overwriteHypothesisRevision
    can distinguish from an ordinary write failure.'
- path: src/errors/status-map.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision:
    imports ReleasedHypothesisRevisionNotAlterableError and adds [ReleasedHypothesisRevisionNotAlterableError,
    409] to STATUS_BY_ERROR_CLASS.'
- path: src/factories/case-store.factory.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision:
    exports a new CaseStore type intersecting ICaseStore, IHighestRevisionReleaseStateQuery and IHypothesisRevisionOverwrite,
    and widens createCaseStore''s return type to it.'
- path: src/persistence/relational-case-store.repository.ts
  change: 'written by the delivery of task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place
    and task/hypothesis-revision-overwrite/read-highest-revision-and-release-state: RelationalCaseStore
    now also implements IHypothesisRevisionOverwrite (overwriteHypothesisRevision, an in-transaction UPDATE
    plus a collects DELETE/INSERT, translating the migration 0019 trigger refusal into ReleasedHypothesisRevisionNotAlterableError)
    and IHighestRevisionReleaseStateQuery (readHighestRevisionReleaseState, one read-only statement computing
    the highest revision and whether a released case version references it).'
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/case/case-store.port.ts: held at the `assembleVersion` signature, line 97, together with `AssembledCaseVersion`'s\
    \ inline `manifest`, lines 20-33 — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion\
    \ | undefined>;\nsrc/persistence/relational-case-store.repository.ts: held at assembleWholeVersion(),\
    \ lines 179-186 — const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key),\
    \ raiseReadFailure);\nif (versionRow === undefined) {\n  return undefined;\n}\nconst manifest = await\
    \ readManifest(tx, key);\nreturn assembledCaseVersionOf(key, versionRow, manifest);\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 43 — [CapabilityIdentityNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/case/hypothesis-revision-overwrite.port.ts: held at the import statement, line 1 — import\
    \ type { OverwriteHypothesisRevisionInput } from './case-store.port.js';\nsrc/case/hypothesis-revision-release-state.port.ts:\
    \ held at the file as a whole — no import statement of any kind, only a type and an interface — export\
    \ interface IHighestRevisionReleaseStateQuery {\n\n  readHighestRevisionReleaseState(slug: string,\
    \ hypothesisName: string): Promise<HighestRevisionReleaseState>;\n}"
  encoded_at:
  - src/case/hypothesis-revision-overwrite.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: 'migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the whole
    file, as migration 0019 in the numbered sequence — DROP RULE hypothesis_revisions_no_update ON hypothesis_revisions;


    CREATE FUNCTION hypothesis_revisions_refuse_when_released()'
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: "src/factories/case-store.factory.ts: held at createCaseStore(connection), constructing the store\
    \ against one connection — export function createCaseStore(connection: DatabaseConnection): CaseStore\
    \ {\n  return new RelationalCaseStore(connection);\n}"
  encoded_at:
  - src/factories/case-store.factory.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — the map holds only
    error-class-to-status pairs; nothing in the file names an operation of this contract'
  observed_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — the map holds only
    error-class-to-status pairs; nothing in the file names the diagnose operation itself'
  observed_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/case-store.port.ts: held at the `ICaseStore` method declarations for createDraft, insertHypothesisRevision,\
    \ placeHypothesis, removeManifestEntry, updateDraft, release and discard, lines 113-125 — createDraft(input:\
    \ CreateDraftInput): Promise<number>;\nsrc/case/revise-hypothesis.operation.ts: held at the ReviseHypothesisOperation\
    \ class and its reviseHypothesis method, implementing the revise-hypothesis operation of the published\
    \ API — export class ReviseHypothesisOperation implements IReviseHypothesis {\n  public async reviseHypothesis(input:\
    \ ReviseHypothesisInput): Promise<RevisedHypothesis> {\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at the public methods implementing each named operation, lines 146-176 — public async createDraft(input:\
    \ CreateDraftInput): Promise<number> {\n  return runInTransaction(this.connection, raiseWriteFailure,\
    \ (tx) => createDraftVersion(tx, input));\n}\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-store.port.ts: held at the `ICaseStore` method declarations for assembleVersion,\
    \ listCases, listCaseVersions, listHypotheses and listHypothesisRevisions, lines 97-111 — listCases(pagination:\
    \ PaginationRequest): Promise<PaginatedResponse<CaseIdentity>>;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembleVersion, listCases, listCaseVersions, listHypotheses, listHypothesisRevisions, lines\
    \ 106-135 — public async listHypothesisRevisions(\n  slug: string,\n  hypothesisName: string,\n  pagination:\
    \ PaginationRequest,\n): Promise<PaginatedResponse<HypothesisRevisionListItem>> {\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-store.port.ts: held at the `CaseIdentity` type, lines 75-77 — export type CaseIdentity\
    \ = {\n  readonly slug: string;\n};\nsrc/persistence/relational-case-store.repository.ts: held at\
    \ assignNextVersion()/nextVersionUpdateStatement(), lines 531-546 — text: `UPDATE ${CASES_TABLE} SET\
    \ next_version = next_version + 1\n       WHERE slug = $1\n       RETURNING next_version - 1 AS version`,\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the join\
    \ and state predicate inside hypothesis_revisions_refuse_when_released() — JOIN case_versions cv\n\
    \      ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version\n    WHERE ... AND cv.state =\
    \ 'released'\nsrc/case/case-store.port.ts: held at the `AssembledCaseVersion` type, lines 20-33 —\
    \ readonly version: number;\n  readonly title: string;\n  readonly when_to_use: string;\n  readonly\
    \ authored_at: string;\n  readonly subject: string;\n  readonly fallback: Resolution;\n  readonly\
    \ consolidation_register?: ConsolidationRegister;\n  readonly state: CaseVersionState;\nsrc/case/revise-hypothesis.operation.ts:\
    \ held at the draft-existence check in refuseWithoutDraft, which the concept-acceptance check should\
    \ but does not draw its subject type from — const draftVersion = await this.caseStore.findDraftVersion(slug);\n\
    \    if (draftVersion === undefined) {\n      throw new CaseHoldsNoDraftError(slug);\n    }\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembledCaseVersionOf(), lines 216-231 — return {\n  slug: key.slug,\n  version: key.version,\n\
    \  title: row.title,\n  when_to_use: row.when_to_use,\n  authored_at: row.authored_at.toISOString(),\n\
    \  subject: row.subject,\n  fallback: resolutionOf(row.fallback_outcome, row.fallback_action, row.fallback_recipient),\n\
    \  ...(consolidationRegister !== undefined ? { consolidation_register: consolidationRegister } : {}),\n\
    \  state: caseVersionStateOf(row.state),\n  ...(row.released_at !== null ? { released_at: row.released_at.toISOString()\
    \ } : {}),\n  manifest,\n};\n"
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: false
  how: 'src/case/case-store.port.ts, the `CaseVersionState` type alias, line 5: export type CaseVersionState
    = ''draft'' | ''released''; — this file declares its own independent literal union for the case-version-state
    enumeration instead of importing the `CaseVersionState` that `case.ts` already derives from its own
    `CASE_VERSION_STATES = [''draft'', ''released''] as const`; the two declarations happen to agree today,
    but nothing ties them together, so if the specification''s case-version-state enumeration ever gains,
    drops or renames a value, a reader who updates `case.ts`''s canonical list has no signal that this
    file''s own copy also needs the same edit, and the day they disagree nobody can say which one is the
    domain''s own answer'
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-store.port.ts: held at the `HypothesisIdentity` type, lines 84-86, and the `hypothesis_name`\
    \ field of `HypothesisRevisionContent`, line 8 — export type HypothesisIdentity = {\n  readonly name:\
    \ string;\n};\nsrc/case/revise-hypothesis.operation.ts: held at the reviseHypothesis method itself,\
    \ which either overwrites or creates a revision depending on frozen state — public async reviseHypothesis(input:\
    \ ReviseHypothesisInput): Promise<RevisedHypothesis> {\n    await this.refuseWithoutDraft(input.slug);\n\
    \    await this.refuseInvalidCollects(input);\n    const revision = await this.writeRevision(input);\n\
    src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement(), lines\
    \ 611-616 — text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,\
    \ name) DO NOTHING`,\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the trigger's\
    \ target table and OLD-row reference — CREATE TRIGGER hypothesis_revisions_no_update_when_released\n\
    \  BEFORE UPDATE ON hypothesis_revisions\nsrc/case/case-store.port.ts: held at the `HypothesisRevisionContent`\
    \ type, lines 7-13 — readonly revision: number;\n  readonly criterion: string;\n  readonly collects:\
    \ readonly string[];\n  readonly resolution: Resolution;\nsrc/case/hypothesis-revision-release-state.port.ts:\
    \ held at the second variant of the `HighestRevisionReleaseState` union, describing one revision's\
    \ number and release status — { readonly revision: number; readonly released_referenced: boolean }\n\
    src/case/revise-hypothesis.operation.ts: held at overwriteInputOf, which assembles a revision's content\
    \ (criterion, collects, resolution) for the store — function overwriteInputOf(input: ReviseHypothesisInput,\
    \ revision: number): OverwriteHypothesisRevisionInput {\n  return {\n    slug: input.slug,\n    hypothesis_name:\
    \ input.hypothesis_name,\n    criterion: input.criterion,\n    collects: input.collects,\n    resolution:\
    \ input.resolution,\n    revision,\n  };\n}\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at revisionInsertStatement()/revisionCollectStatement(), lines 627-646 — text: `INSERT INTO\
    \ ${HYPOTHESIS_REVISIONS_TABLE}\n         (case_slug, hypothesis_name, revision, criterion, resolution_outcome,\
    \ resolution_action, resolution_recipient)\n       SELECT $1, $2, COALESCE(MAX(revision), 0) + 1,\
    \ $3, $4, $5, $6\n       FROM ${HYPOTHESIS_REVISIONS_TABLE}\n       WHERE case_slug = $1 AND hypothesis_name\
    \ = $2\n       RETURNING revision`,\n"
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/case/case-store.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the case_version_hypotheses\
    \ join used to find any manifest reference to the revision — FROM case_version_hypotheses cvh\n  \
    \  JOIN case_versions cv\n      ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version\n   \
    \ WHERE cvh.case_slug = OLD.case_slug\n      AND cvh.hypothesis_name = OLD.hypothesis_name\n     \
    \ AND cvh.revision = OLD.revision\nsrc/case/case-store.port.ts: held at the `ManifestEntry` type,\
    \ lines 15-18 — readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n\
    src/persistence/relational-case-store.repository.ts: held at manifestEntryOf(), lines 205-214 — return\
    \ { position: row.position, hypothesis_revision: hypothesisRevision };\n"
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 67 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 60 — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/errors/status-map.ts: held at the map entries, lines 61-62 — [ConnectorConfigurationNotWellFormedError,\
    \ 422],\n  [IncompleteConnectorConfigurationError, 422],"
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 62 — [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 41 — [ConnectorConfigurationNotFoundError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 64 — [ConnectorPlaceholderOutsideInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 63 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 44 — [HypothesisNotInManifestError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 68 — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure(), lines
    596-598 — return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at updateDraftVersion()'s own guard,\
    \ lines 736-739 — release, discard, placeHypothesis and removeManifestEntry carry no equivalent guard\
    \ (see findings) — const state = caseVersionStateOf(row.state);\nif (state !== DRAFT_STATE) {\n  throw\
    \ new CaseVersionNotDraftError(key.slug, key.version, state);\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/__tests__/integration/persistence/relational-case-store.repository.spec.ts, the it block \"\
    records the instant of release, and a second call to release leaves that instant unchanged\", lines\
    \ 798-813: await store.release(slug, version);\n    const firstRead = await store.assembleVersion(slug,\
    \ version);\n    await store.release(slug, version);\n    const secondRead = await store.assembleVersion(slug,\
    \ version);\n\n    expect(firstRead?.state).toBe('released');\n    expect(firstRead?.released_at).toBeDefined();\n\
    \    expect(secondRead?.released_at).toBe(firstRead?.released_at);\n — The rule this test's own trigger\
    \ belongs to refuses release asked of a version not in draft state with a CaseVersionNotDraftAtReleaseError,\
    \ and after the first `release` the version is no longer in draft state; this test instead awaits\
    \ the second `store.release` call unguarded and asserts it succeeds with the released_at instant merely\
    \ unchanged. A reader trusting this test will build (or keep) a store that lets a caller retry release\
    \ silently rather than being told the version has already left draft state, and the next person looking\
    \ for \"what happens on a second release\" will find this idempotent-success behavior here rather\
    \ than the refusal the lifecycle rule states.\nsrc/persistence/relational-case-store.repository.ts,\
    \ placeHypothesis()/placeHypothesisStatement(), lines 158-160 and 686-692: public async placeHypothesis(input:\
    \ PlaceHypothesisInput): Promise<void> {\n  await runStatement(this.connection, placeHypothesisStatement(input),\
    \ raisePlaceHypothesisFailure(input));\n}\n...\ntext: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE}\
    \ (case_slug, case_version, hypothesis_name, revision, position)\n       VALUES ($1, $2, $3, $4, $5)`,\n\
    \ — A hypothesis can be composed into an already-released version's manifest with nothing refusing\
    \ it — altering exactly what a-case-version-is-written-once says a released version's manifest never\
    \ does again — and no CaseVersionNotDraftError is raised anywhere in this file for place-hypothesis\
    \ the way updateDraftVersion already raises one for update-draft, so a reader who goes looking for\
    \ this refusal here will not find it.\nsrc/persistence/relational-case-store.repository.ts, removeManifestEntry()/removeManifestEntryStatement(),\
    \ lines 162-164 and 701-706: public async removeManifestEntry(slug: string, version: number, hypothesisName:\
    \ string): Promise<void> {\n  await runStatement(this.connection, removeManifestEntryStatement(slug,\
    \ version, hypothesisName), raiseWriteFailure);\n}\n...\ntext: `DELETE FROM ${CASE_VERSION_HYPOTHESES_TABLE}\
    \ WHERE case_slug = $1 AND case_version = $2 AND hypothesis_name = $3`,\n — A manifest entry can be\
    \ deleted from an already-released version with nothing refusing it, altering a manifest the specification\
    \ says a released version never changes again, and no CaseVersionNotDraftError is raised here the\
    \ way it is for update-draft.\nsrc/persistence/relational-case-store.repository.ts, release()/releaseStatement(),\
    \ lines 166-168 and 708-713: public async release(slug: string, version: number): Promise<void> {\n\
    \  await runStatement(this.connection, releaseStatement(slug, version), raiseWriteFailure);\n}\n...\n\
    text: `UPDATE ${CASE_VERSIONS_TABLE} SET state = $3, released_at = NOW() WHERE slug = $1 AND version\
    \ = $2`,\n — release() accepts any slug/version pair regardless of its current state, silently re-stamping\
    \ released_at on a version already released rather than refusing; CaseVersionNotDraftAtReleaseError\
    \ is never imported or thrown anywhere in this file, so the refusal the specification names for this\
    \ exact operation is not where the next reader would look for it.\nsrc/persistence/relational-case-store.repository.ts,\
    \ discard()/discardDraft(), lines 170-172 and 715-718: async function discardDraft(tx: IQueryable,\
    \ key: ICaseVersionKey): Promise<void> {\n  await runStatement(tx, deleteManifestEntriesStatement(key),\
    \ raiseWriteFailure);\n  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\n\
    }\n — discard() deletes the case-version row and every manifest entry it composed for any slug/version\
    \ pair with no check that the version is still draft, so a released version — which every-case-version-remains-readable\
    \ says the store keeps forever — can be removed outright with no CaseVersionNotDraftError raised."
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at assignNextVersion()/nextVersionUpdateStatement(),\
    \ lines 531-546 — text: `UPDATE ${CASES_TABLE} SET next_version = next_version + 1\n       WHERE slug\
    \ = $1\n       RETURNING next_version - 1 AS version`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at conceptsRefusingSubjectOf and refuseConceptsRefusingSubject\
    \ — function conceptsRefusingSubjectOf(resolutions: readonly ConceptResolution[], subject: string):\
    \ readonly string[] {\n  return resolutions\n    .filter(isHeld)\n    .map((resolution) => resolution.concept)\n\
    \    .filter((concept) => !concept.accepts.includes(subject))\n    .map((concept) => concept.name);\n\
    }\nsrc/errors/status-map.ts: held at the map entry, line 66 — [ConceptRefusesSubjectTypeError, 422],"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at refuseEmptyCollects — function refuseEmptyCollects(input:\
    \ ReviseHypothesisInput): void {\n  if (input.collects.length === 0) {\n    throw new HypothesisRevisionCollectsNoConceptError(input.slug,\
    \ input.hypothesis_name);\n  }\n}\nsrc/errors/status-map.ts: held at the map entry, line 65 — [HypothesisRevisionCollectsNoConceptError,\
    \ 422],"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: false
  how: "src/case/revise-hypothesis.operation.ts, refuseWithoutDraft (lines 47-52) together with refuseConceptsRefusingSubject/conceptsRefusingSubjectOf\
    \ (lines 102-120): const draftVersion = await this.caseStore.findDraftVersion(slug);\nif (draftVersion\
    \ === undefined) {\n  throw new CaseHoldsNoDraftError(slug);\n}\n...\nfunction conceptsRefusingSubjectOf(resolutions:\
    \ readonly ConceptResolution[], subject: string): readonly string[] {\n  return resolutions\n    .filter(isHeld)\n\
    \    .map((resolution) => resolution.concept)\n    .filter((concept) => !concept.accepts.includes(subject))\n\
    }\n — The rule requires the concept-acceptance check to run against the draft version's own declared\
    \ subject type, but this file never reads that attribute — findDraftVersion returns only a version\
    \ number, discarded once existence is confirmed — and instead checks caller-supplied input.subject\
    \ verbatim. A caller passing a subject that no longer matches the case's actual draft (stale UI state,\
    \ a client bug, a second concurrent update-draft) is checked against the wrong subject type with nothing\
    \ here to catch it, defeating the guarantee the rule states in exactly the aggregate meant to enforce\
    \ it."
  observed_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement(), lines
    611-616 — text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug,
    name) DO NOTHING`,

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure(), lines\
    \ 694-699 — return (cause) =>\n  isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)\n    ? new\
    \ ManifestPositionOccupiedError(input.slug, input.version, input.position)\n    : raiseWriteFailure(cause);\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the drop\
    \ of the unconditional rule and the exception's own conditional guard, whose false branch reaches\
    \ RETURN NEW — DROP RULE hypothesis_revisions_no_update ON hypothesis_revisions;\nsrc/case/revise-hypothesis.operation.ts:\
    \ held at writeRevision — const state = await this.caseStore.readHighestRevisionReleaseState(input.slug,\
    \ input.hypothesis_name);\n    if (state.revision !== undefined && !state.released_referenced) {\n\
    \      await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input, state.revision));\n\
    \      return state.revision;\n    }\n    return this.caseStore.insertHypothesisRevision(input);\n\
    src/persistence/relational-case-store.repository.ts: held at insertRevision()/insertRevisionRow()\
    \ and overwriteRevision(), lines 600-676 — the two write paths this file offers; which is invoked\
    \ is decided outside this file — text: `UPDATE ${HYPOTHESIS_REVISIONS_TABLE}\n       SET criterion\
    \ = $4, resolution_outcome = $5, resolution_action = $6, resolution_recipient = $7\n       WHERE case_slug\
    \ = $1 AND hypothesis_name = $2 AND revision = $3`,\n"
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at the overwrite branch of writeRevision, which\
    \ reuses state.revision unchanged rather than assigning a new number — await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ state.revision));\n      return state.revision;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at revisionInsertStatement(), lines 627-638 — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1,\
    \ $3, $4, $5, $6\n"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion()/manifestCopyStatement(),\
    \ lines 548-594 — async function resolveSourceVersion(tx: IQueryable, input: CreateDraftInput): Promise<number\
    \ | undefined> {\n  if (input.source_version !== undefined) {\n    return input.source_version;\n\
    \  }\n  const row = await queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug),\
    \ raiseWriteFailure);\n  return row?.version ?? undefined;\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: "migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql: held at the RAISE\
    \ EXCEPTION inside the IF EXISTS branch — RAISE EXCEPTION 'ReleasedHypothesisRevisionNotAlterableError';\n\
    src/case/revise-hypothesis.operation.ts: held at the guard condition in writeRevision that routes\
    \ away from overwrite once a revision is released-referenced — if (state.revision !== undefined &&\
    \ !state.released_referenced) {\n      await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ state.revision));\n      return state.revision;\n    }\n    return this.caseStore.insertHypothesisRevision(input);\n\
    src/errors/status-map.ts: held at the map entry, line 54 — [ReleasedHypothesisRevisionNotAlterableError,\
    \ 409],"
  encoded_at:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at caseIdentityStatement(), lines 527-529
    — { text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`, params: [slug]
    };

    '
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at refuseUnknownConcepts / unknownConceptsOf — function\
    \ refuseUnknownConcepts(input: ReviseHypothesisInput, resolutions: readonly ConceptResolution[]):\
    \ void {\n  const unknown = unknownConceptsOf(resolutions);\n  if (unknown.length > 0) {\n    throw\
    \ new ConceptNotInGlossaryError(input.slug, input.hypothesis_name, unknown);\n  }\n}\nsrc/errors/status-map.ts:\
    \ held at the map entry, line 45 — [ConceptNotInGlossaryError, 404],"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'src/case/case-store.port.ts: held at assembleVersion, line 97, and listCaseVersions, line 103,
    which read any version by number rather than only the latest — listCaseVersions(slug: string, pagination:
    PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

    src/persistence/relational-case-store.repository.ts: held at caseVersionsPageSelect()/listCaseVersionsPage(),
    lines 308-346 — but discardDraft() deletes a case-version row outright with no check that it is still
    draft (see findings) — text: `SELECT version, state FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 ORDER
    BY version LIMIT $2 OFFSET $3`,

    '
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect(), lines 283-294 —\
    \ FROM ${CASE_VERSION_HYPOTHESES_TABLE} cvh\nJOIN ${HYPOTHESIS_REVISIONS_TABLE} hr\n  ON hr.case_slug\
    \ = cvh.case_slug AND hr.hypothesis_name = cvh.hypothesis_name AND hr.revision = cvh.revision\nWHERE\
    \ cvh.case_slug = $1 AND cvh.case_version = $2\nORDER BY cvh.position`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 67 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 63 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at the overwrite branch of writeRevision (same code\
    \ as a-hypothesis-revision-is-overwritten-while-unreleased) — if (state.revision !== undefined &&\
    \ !state.released_referenced) {\n      await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ state.revision));\n      return state.revision;\n    }"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at the insert branch of writeRevision, reached when
    state.released_referenced is true — return this.caseStore.insertHypothesisRevision(input);'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
unstated:
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: the `it` block at lines 208-214, "defaults a newly created case row (no case_versions row at
    all) to next_version 1"
  evidence: expect(rows[0]?.next_version).toBe(1);
  cost: domain/knowledge/case's own next_version attribute says only that it is 'always greater than every
    version number this case has ever held, including one later discarded' — a condition any starting
    value satisfies vacuously for a case with no versions yet. The migration that sets DEFAULT 1 (0009)
    says outright this is 'not a claim about what any later-created case's own first draft is numbered'.
    This test asserts exactly that claim as an established fact, so a reader who takes the test as authoritative
    will treat 1 as decided when no node ever decided it.
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: the `it` block at lines 592-603, "defaults a newly-inserted case_versions row that does not name
    its own state to 'released' ..."
  evidence: expect(result.rows[0].state).toBe('released');
  cost: No node in domain/knowledge/case-version or its state vocabulary states what a case_versions row
    that omits its own state resolves to. The test locks in 'released' — the terminal, immutable state
    — as that default, meaning any write path that forgets to name state silently produces an unchangeable
    version rather than an editable draft; a reader looking for this consequential default in the specification
    will not find it, only in this test and the migration's own DEFAULT clause.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  where: the it block "resolves without raising, leaving no new row behind, when the named revision does
    not exist for that hypothesis", lines 1443-1471
  evidence: "await expect(\n    store.overwriteHypothesisRevision({\n      slug,\n      hypothesis_name:\
    \ 'a-hypothesis',\n      revision: neverHeldRevision,\n      criterion: 'a criterion nothing should\
    \ have stored',\n      collects: [],\n      resolution: aResolution(glossary),\n    }),\n  ).resolves.toBeUndefined();\n"
  cost: The overwrite policy in scope for this file decides only two outcomes for a revise — overwrite
    the hypothesis's own highest existing revision in place, or create its next revision — and says nothing
    about a revision number the hypothesis has never held. This test commits the store to a third, silent-success
    outcome for that case, so a caller passing a stale or mistyped revision number gets no signal at all,
    and the specification carries no record of that choice.
- file: src/__tests__/unit/errors/status-map.spec.ts
  where: the test 'resolves CaseVersionNotReleasedError to 409', lines 91-97
  evidence: "it('resolves CaseVersionNotReleasedError to 409', () => {\n  const error = new CaseVersionNotReleasedError('a-slug',\
    \ 1, 'draft');\n\n  const status = statusForError(error);\n\n  expect(status).toBe(409);\n});\n"
  cost: The rule this refusal answers for (rules/investigation/only-a-released-case-version-is-diagnosed)
    names no error identity and no HTTP status at all — every sibling refusal in the specification pairs
    its rule with an explicit 'HTTP nnn response reporting XError' clause, and the deadline case (rules/investigation/no-stage-aborts-on-its-deadline)
    even has a decision-log entry doing exactly that. This one has none, so this test is the only place
    asserting that a diagnose against a non-released version answers with 409 and with the name CaseVersionNotReleasedError
    specifically; a reader who checks the specification for that pairing finds only the general refusal,
    not the status or the error identity.
- file: src/errors/status-map.ts
  where: the map entry at line 52, and its import at line 12
  evidence: '[CaseVersionNotReleasedError, 409],'
  cost: the 409-and-CaseVersionNotReleasedError pairing for a diagnose pinned to a non-released case version
    lives only in this map; the specification's own rule for that refusal (rules/investigation/only-a-released-case-version-is-diagnosed)
    says the refusal happens but never names its status code or its error condition, so the next reader
    who wants to know what a draft-pinned diagnose answers with has to read this file rather than the
    specification, and nothing stops a future edit from renaming or re-coding this refusal without the
    specification ever disagreeing
- file: src/persistence/relational-case-store.repository.ts
  where: requireHypothesisIdentity(), lines 403-408
  evidence: "async function requireHypothesisIdentity(tx: IQueryable, key: IHypothesisKey): Promise<void>\
    \ {\n  const row = await queryOneOrAbsent<{ name: string }>(tx, hypothesisIdentitySelect(key), raiseReadFailure);\n\
    \  if (row === undefined) {\n    throw new CaseNotFoundError(key.slug, NO_VERSION_NAMED);\n  }\n}\n"
  cost: An unrecognized hypothesis name inside a case that does exist is reported with the identical error
    identity — CaseNotFoundError — as a case slug or version that cannot be resolved at all, so nothing
    this file states distinguishes 'this case does not exist' from 'this case exists but has no hypothesis
    by that name'; rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused scopes CaseNotFoundError
    only to 'a case slug, or a slug and version,' never to a hypothesis name, and no node decides what
    a missing hypothesis name in this listing should report instead.
unbound:
- src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
- src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
- src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
- src/errors/released-hypothesis-revision-not-alterable.error.ts
notes: "Judged by 16 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/hypothesis-revision-editable-until-published.returns/.\nStaged by a review\
  \ over files a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding\
  \ of these files were judged alike; the plan's node(s) rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased,\
  \ rules/knowledge/a-hypothesis-revision-number-is-never-reused, domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision,\
  \ constraints/the-domain-depends-on-no-infrastructure, domain/knowledge/case-version, domain/knowledge/manifest-entry,\
  \ contracts/knowledge/case-lifecycle, rules/knowledge/a-released-hypothesis-revision-is-never-altered,\
  \ rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves,\
  \ scenarios/knowledge/revising-a-released-revision-creates-the-next, constraints/the-schema-replays-from-its-scripts\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/persistence/relational-case-store.repository.ts names\
  \ rules/knowledge/a-case-has-at-least-one-hypothesis, which no file of this set is bound to: removeManifestEntry()/removeManifestEntryStatement(),\
  \ lines 162-164 and 701-706: text: `DELETE FROM ${CASE_VERSION_HYPOTHESES_TABLE} WHERE case_slug = $1\
  \ AND case_version = $2 AND hypothesis_name = $3`,\n — Removing the last manifest entry of a case version\
  \ succeeds outright, leaving a version that investigates nothing (only the fallback answers) with no\
  \ ManifestWouldHoldNoHypothesisError to say so — the refusal rules/knowledge/a-case-has-at-least-one-hypothesis\
  \ names has nowhere in this file it is raised.. It blocks nothing here; it is owed a route of its own.\n\
  A finding in src/persistence/relational-case-store.repository.ts names rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first,\
  \ which no file of this set is bound to: hypothesisRevisionsPageSelect(), lines 426-435: function hypothesisRevisionsPageSelect(key:\
  \ IHypothesisKey, pagination: PaginationRequest): IStatement {\n  return {\n    text: `SELECT revision,\
  \ criterion, resolution_outcome, resolution_action, resolution_recipient\n           FROM ${HYPOTHESIS_REVISIONS_TABLE}\n\
  \           WHERE case_slug = $1 AND hypothesis_name = $2\n           ORDER BY revision\n          \
  \ LIMIT $3 OFFSET $4`,\n — A curator reading the first page of one hypothesis's revisions sees revision\
  \ 1, not the hypothesis's highest existing revision — the reverse of what the node requires — so the\
  \ revision a curator would adopt into a draft, or compare a pin against, moves one page further out\
  \ of reach with every revision the hypothesis gains, instead of sitting on the first page as the specification\
  \ decided.. It blocks nothing here; it is owed a route of its own.\nCandidates: 18 opened across 7 of\
  \ 16 delegation(s); each return lists its own under `candidates_opened`.\nUnstated: 6 fact(s) the source\
  \ states that no node holds, over 5 file(s), listed under `unstated`. They block no binding here and\
  \ no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hypothesis-revision-editable-until-published.returns/`, which are the evidence behind every entry above.
