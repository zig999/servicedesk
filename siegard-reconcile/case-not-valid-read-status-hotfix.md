---
contract_version: siegard-reconcile/3
title: case-not-valid-read-status-hotfix conformance premise
summary: 'Files written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status (initiative
  case-not-valid-read-status-hotfix, target backend): renaming CaseNotValidError to CaseVersionNotValidError
  and mapping it to HTTP 409, plus the test files the rename and its proof touched.'
target: backend
files:
- path: src/__tests__/integration/factories/case-query.factory.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/unit/http/read-case.routes.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  change: written by the delivery of task/case-not-valid-status-mapping/rename-and-map-status
- path: src/case/case-query.service.ts
  change: both throw sites that used to raise CaseNotValidError — refuseIncoherence (a coherence violation)
    and structuralCase (a structural/parse violation) — now import and raise CaseVersionNotValidError
    from its renamed file
- path: src/errors/case-not-valid.error.ts
  change: no longer defines the class; re-exports CaseVersionNotValidError from its new home so the old
    path still resolves for whatever still imports it, while the identifier CaseNotValidError no longer
    appears anywhere in this file
- path: src/errors/case-version-not-valid.error.ts
  change: new file; holds the sole definition of CaseVersionNotValidError (renamed from CaseNotValidError),
    constructed from the slug, version and the violations that failed, with `this.name` set to the new
    identifier so the error envelope reports it as the code
- path: src/errors/status-map.ts
  change: imports CaseVersionNotValidError and adds it to STATUS_BY_ERROR_CLASS at 409, alongside the
    other CaseVersion* 409 entries; every other entry, and statusForError's lookup logic, is unchanged
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the assertions of\
    \ the first `it()` block, lines 218-222 — const result = await query.readCase(SLUG, VERSION);\n\n\
    expect(result.case.slug).toBe(SLUG);\nexpect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);\n\
    \nsrc/case/case-query.service.ts: held at readCase(), lines 34-39 — heldVersion, structuralCase and\
    \ refuseIncoherence run in sequence before the case is returned — const assembled = await heldVersion(this.caseStore,\
    \ slug, version);\n    const theCase = structuralCase(assembled, slug, version);\n    await this.refuseIncoherence(theCase,\
    \ version);\n    return { case: theCase };"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/case-query.service.ts
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: false
  how: 'no named file holds this fact now: src/errors/status-map.ts read `nowhere` — return undefined;'
  observed_at:
  - src/errors/status-map.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing CapabilityIdentityNotFoundError with its
    status, line 45 — [CapabilityIdentityNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries for the errors this contract''s operations raise
    — [ConnectorConfigurationNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries for the errors diagnose raises — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries for the errors this contract''s operations raise
    — [CaseAlreadyHasDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/case/case-query.service.ts: held at the class declaration and its five public methods — export
    class CaseQueryService implements ICaseQuery, ICaseInputRequirementsQuery'
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/errors/case-not-valid.error.ts
    read `nowhere` — export { CaseVersionNotValidError } from ''./case-version-not-valid.error.js''; —
    a binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/errors/case-not-valid.error.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/case/case-query.service.ts: held at trustedCaseOf and assembledAsRawDocument, setting `slug`
    from the assembled version and nothing else of the case identity — slug: assembled.slug,'
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-query.service.ts: held at trustedManifestEntryOf and trustedHypothesisOf, taking\
    \ `name` from the revision's own hypothesis reference and criterion/collects/resolution from the revision\
    \ itself — hypothesis: { name: content.hypothesis_name },\n      revision: content.revision,\n   \
    \   criterion: content.criterion,\n      collects: content.collects,\n      resolution: content.resolution,"
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the reviseHypothesis\
    \ call inside placeFixtureHypotheses, lines 95-102 — const revised = await lifecycle.reviseHypothesis({\n\
    \  slug: fixture.slug,\n  hypothesis_name: entry.hypothesis_name,\n  criterion: entry.criterion,\n\
    \  collects: entry.collects,\n  resolution: entry.resolution,\n  subject: fixture.subject,\n});\n"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the RELEASED_REVISION_STATE
    constant and the assertion at line 240 — const RELEASED_REVISION_STATE = ''released'';

    ...

    expect(rows.every((row) => row.state === RELEASED_REVISION_STATE)).toBe(true);

    '
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConceptDescriptionRequiredError with its
    status, line 71 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing MalformedCapabilityInputSchemaError with
    its status, line 64 — [MalformedCapabilityInputSchemaError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/errors/status-map.ts: held at the map entries pairing ConnectorConfigurationNotWellFormedError\
    \ and IncompleteConnectorConfigurationError with their statuses, lines 65-66 — [ConnectorConfigurationNotWellFormedError,\
    \ 422],\n  [IncompleteConnectorConfigurationError, 422],"
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing IncompleteConnectorConfigurationError
    with its status, line 66 — [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConnectorConfigurationNotFoundError with
    its status, line 43 — [ConnectorConfigurationNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConnectorPlaceholderOutsideInputSchemaError
    with its status, line 68 — [ConnectorPlaceholderOutsideInputSchemaError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing SubjectDoesNotCoverCaseInputsError with
    its status, line 67 — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing HypothesisNotInManifestError with its
    status, line 46 — [HypothesisNotInManifestError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing InvestigationWriteDeadlineExceededError
    with its status, line 72 — [InvestigationWriteDeadlineExceededError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: "src/case/case-query.service.ts: held at replayCase(), lines 82-85 — export async function replayCase(slug:\
    \ string, version: number, caseStore: ICaseStore): Promise<Case> {\n  const assembled = await heldVersion(caseStore,\
    \ slug, version);\n  return trustedCaseOf(assembled);\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: "src/case/case-query.service.ts: held at refuseIncoherence() and structuralCase()'s catch clause,\
    \ both throwing CaseVersionNotValidError — if (violations.length > 0) {\n      throw new CaseVersionNotValidError(theCase.slug,\
    \ version, violations);\n    }\nsrc/errors/case-version-not-valid.error.ts: held at the class declaration\
    \ and its `name` field, lines 1 and 8 — export class CaseVersionNotValidError extends Error { ...\
    \ this.name = 'CaseVersionNotValidError';\nsrc/errors/status-map.ts: held at the map entry pairing\
    \ CaseVersionNotValidError with its status, line 52 — [CaseVersionNotValidError, 409],"
  encoded_at:
  - src/case/case-query.service.ts
  - src/errors/case-version-not-valid.error.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseInputRequirements(), delegating to deriveCaseInputRequirements(theCase,\
    \ registeredCapabilities) after everyRegisteredCapability reads the registry fresh — const registeredCapabilities\
    \ = await everyRegisteredCapability(this.capabilities);\n    return deriveCaseInputRequirements(theCase,\
    \ registeredCapabilities);"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConceptRefusesSubjectTypeError with its
    status, line 70 — [ConceptRefusesSubjectTypeError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the assertion at
    line 252 — expect(result.case.hypotheses.every((hypothesis) => hypothesis.collects.length >= 1)).toBe(true);

    src/errors/status-map.ts: held at the map entry pairing HypothesisRevisionCollectsNoConceptError with
    its status, line 69 — [HypothesisRevisionCollectsNoConceptError, 422],'
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing CaseHoldsNoDraftError with its status,
    line 56 — [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the refusal assertion\
    \ of the second-invocation test, lines 387-391 — const refusal = await lifecycle\n  .releaseHypothesisRevision(ownedSlug,\
    \ released.hypothesisName, released.revision)\n  .catch((error: unknown) => error);\n\nexpect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\n\
    \nsrc/errors/status-map.ts: held at the map entry pairing HypothesisRevisionNotDraftAtReleaseError\
    \ with its status, line 58 — [HypothesisRevisionNotDraftAtReleaseError, 409],"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the joined query\
    \ over released case versions, lines 228-240, and the release-ordering test, lines 349-369 — SELECT\
    \ hr.state\n   FROM hypothesis_revisions hr\n   JOIN case_version_hypotheses cvh\n     ON cvh.case_slug\
    \ = hr.case_slug AND cvh.hypothesis_name = hr.hypothesis_name AND cvh.revision = hr.revision\n   JOIN\
    \ case_versions cv\n     ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version\n  WHERE cv.slug\
    \ = $1 AND cv.version = $2 AND cv.state = 'released'\n"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the DELETE against\
    \ hypothesis_revision_collects and the unchanged-rows assertion, lines 333-342 — await connection.query(\n\
    \  'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n  [ownedSlug,\
    \ hypothesisName],\n);\n\nconst { rows } = await connection.query<{ concept_name: string }>(\n  'SELECT\
    \ concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n\
    \  [ownedSlug, hypothesisName],\n);\nexpect(rows.map((row) => row.concept_name)).toEqual([collectedConcept]);\n\
    \nsrc/errors/status-map.ts: held at the map entry pairing ReleasedHypothesisRevisionNotAlterableError\
    \ with its status, line 57 — [ReleasedHypothesisRevisionNotAlterableError, 409],"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/case-query.service.ts read `nowhere` — heldVersion(store,
    slug, version) reads by slug and version without any uniqueness check; this file presupposes the slug
    already names one case rather than enforcing it'
  observed_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConceptNotInGlossaryError with its status,
    line 47 — [ConceptNotInGlossaryError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'src/case/case-query.service.ts: held at heldVersion(), calling store.assembleVersion(slug, version)
    for the named version rather than only a latest one — const assembled = await store.assembleVersion(slug,
    version);'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/case-query.service.ts: held at readCaseInputRequirements(), calling everyRegisteredCapability(this.capabilities)
    fresh on each call rather than from a stored/cached registration — const registeredCapabilities =
    await everyRegisteredCapability(this.capabilities);'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: "src/case/case-query.service.ts, readCaseInputRequirements(), lines 41-46: const assembled = await\
    \ heldVersion(this.caseStore, slug, version);\n    const theCase = structuralCase(assembled, slug,\
    \ version);\n    const registeredCapabilities = await everyRegisteredCapability(this.capabilities);\n\
    \    return deriveCaseInputRequirements(theCase, registeredCapabilities); — readCase and readCaseInputRequirements\
    \ read the same stored version, but only readCase follows structuralCase with `this.refuseIncoherence(theCase,\
    \ version)`; readCaseInputRequirements returns derived requirements for a case version whose glossary\
    \ terms, concepts or capabilities may currently be incoherent, with no 409/CaseVersionNotValidError\
    \ refusal at all. A curator composing against a broken draft, or any caller of this operation, gets\
    \ computed input requirements for something the specification says is \"not yet readable as a case\
    \ at all, whether previewed.\""
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/case-query.service.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConceptDescriptionRequiredError with its
    status, line 71 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing SubjectDoesNotCoverCaseInputsError with
    its status, line 67 — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
unstated:
- file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the test "answers a draft version's input requirements even though the same content currently
    fails read-case's own coherence check" (lines 722-735) and the adjacent it.todo (lines 737-742)
  evidence: "await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\
    \n  const result = await service.readCaseInputRequirements(SLUG, version);\n\n  expect(result.requirements.map((requirement)\
    \ => requirement.attribute)).toEqual(['an-attribute']); ... \"readCaseInputRequirements today calls\
    \ only structuralCase and never refuseIncoherence, so this stays a documented gap rather than a criterion\
    \ this task owes\""
  cost: 'the next reader who checks rules/knowledge/a-case-versions-input-requirements-are-derived or
    contracts/knowledge/case-input-requirements to learn whether a case version''s input requirements
    are still answered once the version fails coherence (a missing glossary concept, say) finds nothing
    either way; the answer — that they are, because this read never re-runs the coherence checks read-case
    runs — exists only in this test file and its own it.todo, and the specification stays silent on a
    business-facing question: whether a curator sees input requirements for a case that currently would
    not read back as a case at all'
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  where: the sixth `it`, lines 95-103 ("answers 400 for a version of zero, one below the positive range
    the domain declares, without ever reaching the query")
  evidence: '''answers 400 for a version of zero, one below the positive range the domain declares, without
    ever reaching the query'''
  cost: 'the test''s own title asserts, as settled fact, that the domain declares a positive range for
    a case version number and that zero falls outside it; domain/knowledge/case-version.md declares the
    `version` attribute only as `type: integer, required: true`, with no floor, and no rule (a-case-version-number-is-never-reused
    included) fixes a starting value or excludes zero — a reader who goes to the specification to confirm
    that a version of zero is invalid finds nothing there and is left trusting this test (and the route''s
    own `.positive()` schema) as if it were the decision'
- file: src/errors/case-version-not-valid.error.ts
  where: the constructor body, lines 5-10
  evidence: '`the case "${slug}" at version ${version} violates its validator rules: ${violations.join('';
    '')}`,

    ...

    this.context = { slug, version, violations };'
  cost: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name states only that
    this read is refused with an HTTP 409 reporting a CaseVersionNotValidError; it says nothing about
    the refusal naming which validator rules failed. This file makes that disclosure decision on its own
    — the error's message and its `context.violations` list enumerate the failed rules — with no node
    saying whether a caller ever learns which rule failed or only that validation failed. A later reader
    who wants to know what this 409 discloses looks in the specification and finds no field for it; the
    sibling 422 refusal (a-release-refusal-with-no-named-violation-says-so) does state its error "names
    every violated rule together," so the silence here reads as an oversight rather than a considered
    choice, and the next person to touch this file has no node to check the shape against.
unbound:
- src/__tests__/integration/factories/case-query.factory.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/case-input-requirements.routes.spec.ts
- src/__tests__/unit/http/read-case.routes.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
notes: 'Judged by 11 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-not-valid-read-status-hotfix.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name,
  rules/knowledge/validation-runs-at-every-read, constraints/a-domain-error-unmapped-by-status-is-refused-generically,
  rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused were read on every file and answered
  for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 11 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 3 fact(s) the source states that no node holds, over 3 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-not-valid-read-status-hotfix.returns/`, which are the evidence behind every entry above.
