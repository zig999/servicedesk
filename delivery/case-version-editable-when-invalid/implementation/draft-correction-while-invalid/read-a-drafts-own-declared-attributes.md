---
target: backend
title: Read a draft case version's own declared attributes, unvalidated
summary: Adds a read-case-version operation to the case-query port and service that answers a case version's
  title, when_to_use, subject, fallback and consolidation_register straight from its own stored record,
  gated by no validator rule and excluding the manifest.
task: sha256:8820aa88781da6b1bfe2fac1387cdd918dd7a4916fea521f2fabe45174631f6d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-read-a-drafts-own-declared-attributes-build-2
files:
- path: src/case/case-query.port.ts
  effect: declares CaseVersionAttributes, ReadCaseVersionResult, and a readCaseVersion(slug, version)
    member on ICaseQuery
- path: src/case/case-query.service.ts
  effect: implements readCaseVersion by loading the stored version through the existing heldVersion helper
    and mapping it through a new attributesOf helper, never through parseCaseDocument/structuralCase/refuseIncoherence
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: 'its ICaseQuery test stub gains a readCaseVersion: vi.fn() member so it keeps satisfying the
    widened interface; the test''s own assertions are unchanged'
- path: src/__tests__/unit/http/diagnose.controller.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/list-case-versions.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/list-cases.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/list-hypotheses.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/read-case.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/release.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-case.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  effect: same stub addition, same reason
- path: src/__tests__/unit/http/update-draft.routes.spec.ts
  effect: same stub addition, same reason
criteria:
- criterion: Over a draft whose manifest holds no entry, the read answers the draft's declared attributes
    instead of raising CaseVersionNotValidError.
  met: true
  how: readCaseVersion calls heldVersion and attributesOf directly, never structuralCase or refuseIncoherence,
    so an empty manifest never reaches a validator
- criterion: Over a draft whose stored subject names a subject type the glossary does not hold, the read
    answers the draft's declared attributes instead of raising CaseVersionNotValidError.
  met: true
  how: the same read path never calls refuseGlossaryIncoherence, so a glossary-incoherent subject is read
    as stored
- criterion: Over a draft whose stored title is blank, the read answers the draft's declared attributes
    instead of raising CaseVersionNotValidError.
  met: true
  how: attributesOf reads assembled.title unconditionally, with no structural check on its content
- criterion: The answered title is the title the draft's own stored record carries.
  met: true
  how: attributesOf.title is assembled.title, read from the AssembledCaseVersion heldVersion returned
    for the named slug and version
- criterion: The answered when_to_use is the when_to_use the draft's own stored record carries.
  met: true
  how: attributesOf.when_to_use is assembled.when_to_use
- criterion: The answered subject is the subject the draft's own stored record carries.
  met: true
  how: attributesOf.subject is assembled.subject
- criterion: The answered fallback outcome is the fallback outcome the draft's own stored record carries.
  met: true
  how: attributesOf.fallback is assembled.fallback (a Resolution), carrying its own outcome unchanged
- criterion: The answered fallback referral is the fallback referral the draft's own stored record carries.
  met: true
  how: the same assembled.fallback carries its own referral unchanged
- criterion: Where the draft declares a consolidation_register, the answered consolidation_register is
    the one the draft's own stored record carries.
  met: true
  how: the conditional spread includes assembled.consolidation_register verbatim when it is not undefined
- criterion: Where the draft declares no consolidation_register, the read answers no consolidation_register
    value for it.
  met: true
  how: the conditional spread omits the key entirely when assembled.consolidation_register is undefined,
    rather than setting it to undefined
- criterion: Where another version of the same case carries a different title, the answered title is the
    draft's own stored title.
  met: true
  how: heldVersion loads exactly the named slug and version, so attributesOf reads only that version's
    own record
- criterion: The read answers no manifest entry.
  met: true
  how: CaseVersionAttributes declares no manifest field, and attributesOf never reads assembled.manifest
- criterion: A slug and version that no case version answers makes the read raise CaseNotFoundError carrying
    that slug and version.
  met: true
  how: heldVersion raises CaseNotFoundError(slug, version) whenever store.assembleVersion answers undefined,
    reused unchanged from readCase's own path
nodes:
- node: contracts/knowledge/case-query
  how: adds readCaseVersion to ICaseQuery and implements it on CaseQueryService, answering the contract's
    published read-case-version operation -- the case version's own stored record by slug and version,
    neither validated nor assembled as a whole case
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
- node: domain/knowledge/case-version
  how: attributesOf reads title, when_to_use, subject, fallback and consolidation_register straight off
    the version's own stored record, never through parseCaseDocument or coherence validation, so a draft's
    own declared attributes stay readable while draft state holds regardless of what a validator rule
    would say about them
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  how: readCaseVersion reuses heldVersion, which raises CaseNotFoundError carrying the slug and version
    when the store answers no version; only this clause of the rule is reached here -- the HTTP-404 mapping,
    the slug-only read and the lifecycle-operation clauses belong to the tasks this task's own Notes name
    as their owners
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  how: implements the backend read this invariant presupposes -- a draft's five declared attributes answered
    from its own stored record on a reading where validation-runs-at-every-read would otherwise refuse
    it -- leaving what the surface presents, the manifest, and update-draft's own acceptance to the tasks
    this task's Notes name as their owners
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
inferences:
- inferred: the new operation is named readCaseVersion on ICaseQuery/CaseQueryService, camelCase of the
    contract's read-case-version
  from: the contract names the operation but not its method signature; the sibling readCase already sets
    this project's camelCase convention for a case-query operation
- inferred: 'the result is wrapped as ReadCaseVersionResult { readonly version: CaseVersionAttributes
    }, and CaseVersionAttributes carries exactly title, when_to_use, subject, fallback and consolidation_register
    -- no slug, version, authored_at, state or manifest'
  from: 'the contract''s own Description enumerates exactly these five as what this read answers, the
    no-manifest criterion confirms manifest''s exclusion, and the envelope shape mirrors the existing
    sibling ReadCaseResult { readonly case: Case }'
- inferred: readCaseVersion reads uniformly off assembleVersion regardless of the version's state (draft
    or released), rather than branching on draft state
  from: the task's own Notes mark the released-version case underdetermined and say either behavior passes;
    the contract's Description states this read is neither validated nor assembled as a whole case for
    a case version's own stored record, with no draft-only qualifier
- inferred: consolidation_register is included via the same conditional-spread pattern already used by
    trustedCaseOf and assembledAsRawDocument in this file, rather than an explicit undefined
  from: the file's own existing convention for the identical optional field, and criterion 10's requirement
    that the answer carry no consolidation_register value when the record holds none
- inferred: 'the fourteen pre-existing unit-test ICaseQuery mocks each gained a readCaseVersion: vi.fn()
    stub, added immediately after that mock''s own readCase entry, rather than making the interface member
    optional or introducing a Partial/index-signature cast'
  from: the build's typecheck step reported these mocks no longer satisfied the widened ICaseQuery; making
    the member optional would let a real future caller silently receive undefined from a published operation,
    so a stub per mock was chosen to keep the interface honest while leaving every test's own assertions
    untouched
preserved:
- readCase, readCaseInputRequirements, listCases, listCaseVersions, listHypotheses and listHypothesisRevisions
  on CaseQueryService and ICaseQuery are unchanged; readCaseVersion and its supporting type CaseVersionAttributes/ReadCaseVersionResult
  and attributesOf helper are purely additive
- the existing heldVersion, structuralCase, refuseIncoherence and refuseGlossaryIncoherence helpers were
  reused unmodified rather than altered
- every fixed test file's own assertions, arrange/act/assert structure and existing mock values are unchanged;
  the only edit in each is the added readCaseVersion stub line
---

## What it is

readCaseVersion is a new operation on CaseQueryService and ICaseQuery: given a case slug and a version number, it loads that version's own stored record through the existing heldVersion helper and answers its title, when_to_use, subject, fallback and consolidation_register exactly as stored, through a new attributesOf helper that reads none of them through parseCaseDocument, structuralCase, refuseIncoherence or refuseGlossaryIncoherence -- so the read answers regardless of whether the version would validate as a whole case. It answers no manifest entry. A slug and version no case version answers still raises CaseNotFoundError, unchanged from readCase's own path.
Fourteen pre-existing unit-test files construct a stub implementation of ICaseQuery for testing other routes; each gained a readCaseVersion: vi.fn() member so the widened interface still type-checks, with every test's own assertions left untouched.

## Notes

This task's own Notes mark several clauses of its governed nodes as belonging to sibling tasks -- the HTTP route and its status codes, the editing surface's presentation and its acceptance of update-draft, and the manifest -- and this delivery reaches none of them, exactly as that task file states.
The build's first attempt (run/draft-correction-while-invalid-read-a-drafts-own-declared-attributes-build) failed at typecheck: fourteen pre-existing unit-test files stub ICaseQuery and did not implement the new readCaseVersion member. The fix (a readCaseVersion: vi.fn() stub added to each) is disclosed above as an inference, and the passing rerun is run/draft-correction-while-invalid-read-a-drafts-own-declared-attributes-build-2, named on this record.
