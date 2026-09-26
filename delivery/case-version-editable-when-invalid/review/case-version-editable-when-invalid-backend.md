---
target: backend
title: case-version-editable-when-invalid -- backend, review
summary: Coverage, specification-conformance, standard-conformance and run-failure passes over the 4 backend
  tasks and their 31 files.
reviewed:
- src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
- src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/diagnose.controller.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/discard.routes.spec.ts
- src/__tests__/unit/http/list-case-versions.routes.spec.ts
- src/__tests__/unit/http/list-cases.routes.spec.ts
- src/__tests__/unit/http/list-hypotheses.routes.spec.ts
- src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- src/__tests__/unit/http/read-case-version.routes.spec.ts
- src/__tests__/unit/http/read-case.routes.spec.ts
- src/__tests__/unit/http/release.routes.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/http/update-draft.routes.spec.ts
- src/case/case-query.port.ts
- src/case/case-query.service.ts
- src/case/discard.operation.ts
- src/http/build-app.ts
- src/http/discard.controller.ts
- src/http/discard.routes.ts
- src/http/dto/discard.dto.ts
- src/http/dto/read-case-version.dto.ts
- src/http/read-case-version.controller.ts
- src/http/read-case-version.routes.ts
- src/http/update-draft.controller.ts
tasks:
- task/draft-correction-while-invalid/read-a-drafts-own-declared-attributes
- task/draft-correction-while-invalid/serve-a-drafts-own-declared-attributes-over-http
- task/draft-discard-while-invalid/prove-discard-accepts-a-draft-failing-validation
- task/draft-correction-while-invalid/answer-update-draft-from-the-drafts-own-record
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: run/case-version-editable-when-invalid-backend passed; there was no failure to read
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-version-editable-when-invalid-backend
reconciliation: siegard-reconcile/case-version-editable-when-invalid-backend.md
coverage:
- criterion: Over a draft whose manifest holds no entry, the read answers the draft's declared attributes
    instead of raising CaseVersionNotValidError.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
- criterion: Over a draft whose stored subject names a subject type the glossary does not hold, the read
    answers the draft's declared attributes instead of raising CaseVersionNotValidError.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored subject names a subject type
      the glossary does not hold
  why: The not-raising half is tested; only the answered subject is checked. Nothing asserts that the
    title, when_to_use and fallback answered in this case are the draft's own, so a read that answered
    only the subject would still pass.
- criterion: Over a draft whose stored title is blank, the read answers the draft's declared attributes
    instead of raising CaseVersionNotValidError.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored title is blank
  why: The not-raising half is tested; only the answered title is checked. Nothing asserts the other three
    attributes are the draft's own in this case.
- criterion: The answered title is the title the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored title is blank
- criterion: The answered when_to_use is the when_to_use the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
- criterion: The answered subject is the subject the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored subject names a subject type
      the glossary does not hold
- criterion: The answered fallback outcome is the fallback outcome the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
- criterion: The answered fallback referral is the fallback referral the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
- criterion: Where the draft declares a consolidation_register, the answered consolidation_register is
    the one the draft's own stored record carries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the draft's own declared consolidation_register exactly as its stored record carries
      it, when the draft declares one
- criterion: Where the draft declares no consolidation_register, the read answers no consolidation_register
    value for it.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  why: Held only in passing via a toEqual comparing the whole answer; no test is built specifically around
    a draft declaring no consolidation_register to assert none is answered.
- criterion: Where another version of the same case carries a different title, the answered title is the
    draft's own stored title.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers each version's own title, never another version's, for the same case
  why: The test tells two versions apart by title, but both are released by default (seedCase). No test
    reads a draft while another version of the same case carries a different title.
- criterion: The read answers no manifest entry.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a released version's own declared attributes unvalidated, even though the same stored
      content fails read-case's structural validation
  why: Held only in passing by exact-equality assertions; both tests read only versions with no hypotheses,
    so their manifest has no entries -- no test exercises a manifest holding entries.
- criterion: A slug and version that no case version answers makes the read raise CaseNotFoundError carrying
    that slug and version.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: raises CaseNotFoundError, carrying the slug and version, when no case version is stored for
      them
- criterion: A request to the route over a draft whose manifest holds no entry is answered HTTP 200.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: answers HTTP 200 both for a draft whose manifest holds no hypothesis and for a version that
      reads back fully as a case, never conditioning the status on the version's validity
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  why: The route's 200 is only tested with a mocked caseQuery.readCaseVersion; the empty-manifest condition
    never reaches the route itself, resting on the service-level test instead.
- criterion: The 200 body carries the declared attributes exactly as the draft's own-record read answered
    them.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: carries the declared attributes exactly as the draft's own-record read answered them, dropping
      none of the five named attributes and carrying no field beyond them
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: answers 200 even when the subject or fallback itself is the declared attribute a validator rule
      would reject, not only when an empty manifest is the failing rule
- criterion: Where the draft declares no consolidation_register, the 200 body carries no consolidation_register
    value.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: carries no consolidation_register key, rather than an empty or null one, when the draft declares
      none
- criterion: The 200 body carries no manifest entry.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: carries the declared attributes exactly as the draft's own-record read answered them, dropping
      none of the five named attributes and carrying no field beyond them
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: carries no consolidation_register key, rather than an empty or null one, when the draft declares
      none
- criterion: A request naming a slug and version that no case version answers is answered HTTP 404 reporting
    a CaseNotFoundError whose details carry that slug and version.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: refuses with 404 reporting CaseNotFoundError carrying the named slug and version, when no case
      version answers them
- criterion: A request whose version path segment is not an integer is answered HTTP 400 with code VALIDATION_ERROR
    and a message naming the path.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case-version.routes.spec.ts
    name: refuses with 400 VALIDATION_ERROR naming the path and listing the issue found, when the version
      segment is not an integer
- criterion: A discard of a draft whose manifest holds no entry is answered HTTP 204.
  state: covered
  tests:
  - file: src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
    name: 'accepts a discard of a draft whose manifest holds no entry: the route answers 204 with an empty
      body, the store then answers no case version at that slug and number, and the case''s next draft
      is not numbered with the discarded draft''s number'
- criterion: After that discard, the store answers no case version at that draft's slug and number.
  state: covered
  tests:
  - file: src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
    name: 'accepts a discard of a draft whose manifest holds no entry: the route answers 204 with an empty
      body, the store then answers no case version at that slug and number, and the case''s next draft
      is not numbered with the discarded draft''s number'
- criterion: After that discard, a draft next created for the same case is not numbered with the discarded
    draft's number.
  state: covered
  tests:
  - file: src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
    name: 'accepts a discard of a draft whose manifest holds no entry: the route answers 204 with an empty
      body, the store then answers no case version at that slug and number, and the case''s next draft
      is not numbered with the discarded draft''s number'
- criterion: A discard of a draft whose stored subject names a subject type the glossary does not hold
    is answered HTTP 204.
  state: partial
  tests:
  - file: src/__tests__/unit/http/discard.routes.spec.ts
    name: accepts a discard of a draft whose stored subject names a subject type the glossary does not
      hold, answering 204 with an empty body, routed through the real controller and the real discard
      operation rather than a mocked dependency
  why: Runs through the real route/controller/operation but over a fixture store, with no glossary taking
    part; the relational store's discard over a subject genuinely missing from the glossary tables is
    not tested.
- criterion: A well-formed update-draft over a draft whose manifest holds no entry is answered HTTP 200.
  state: covered
  tests:
  - file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
    name: accepts a well-formed update-draft over a draft whose manifest holds no entry, answering HTTP
      200, and the store then holds the submitted title
- criterion: After that update-draft, the draft's own stored record carries the submitted title.
  state: covered
  tests:
  - file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
    name: accepts a well-formed update-draft over a draft whose manifest holds no entry, answering HTTP
      200, and the store then holds the submitted title
- criterion: The 200 answer carries the declared attributes the draft's own stored record carries after
    the write.
  state: covered
  tests:
  - file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
    name: the 200 answer's body carries the stored record's own declared attributes exactly, carrying
      no manifest entry and no consolidation_register defaulted in place of the one the write left absent
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 with the body built from caseQuery.readCaseVersion's own stored-record read, dropping
      none of its five declared attributes and carrying no manifest field
- criterion: The 200 answer carries no manifest entry.
  state: covered
  tests:
  - file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
    name: the 200 answer's body carries the stored record's own declared attributes exactly, carrying
      no manifest entry and no consolidation_register defaulted in place of the one the write left absent
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 with the body built from caseQuery.readCaseVersion's own stored-record read, dropping
      none of its five declared attributes and carrying no manifest field
- criterion: A well-formed update-draft whose submitted subject names a subject type the glossary does
    not hold, over a draft, is answered HTTP 200.
  state: partial
  tests:
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 for a well-formed update-draft whose submitted subject names a subject type the
      glossary does not hold, since this route never checks glossary coherence
  why: Both caseStore.updateDraft and caseQuery.readCaseVersion are mocks, with no glossary taking part;
    writing a glossary-absent subject through the real store, over a stored draft, and reading it back
    is not tested.
unpaired:
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a case with no hash property at all, since read-case no longer pins by content
  asserts: readCase's result for a coherent released version has no 'hash' property
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a document that would fail read-case structurally, rather than refusing it, because
      replay skips the structural refusal too
  asserts: for a version with no hypotheses, readCase rejects with CaseVersionNotValidError, while replayCase
    answers it with an empty hypotheses list
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a version written directly to the store as its very next read, with no separate publish
      step anywhere in this composition
  asserts: readCase over an unreleased coherent version answers it with the slug and state 'draft'
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers each version by its own content, never another version's
  asserts: with two released versions titled differently, readCase over the second answers its own version
    number and title
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers identical input requirements for a draft version and the same version once released
  asserts: readCaseInputRequirements answers the same attribute for a draft and once released
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers replayCase with exactly the case readCase answers for the same pinned version, minus
      the content-identity pin read-case alone carries
  asserts: replayCase's answer equals readCase's case for the same coherent version
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the case whole, matching exactly what the document holds, when every structural and
      coherence rule holds for it
  asserts: readCase over a coherent released version answers the full case
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the replay whole, matching exactly what the document holds, including its hypotheses
      and their resolutions and referrals
  asserts: replayCase over a released version answers the full case including manifest and hypotheses
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version a replay names, unaffected by a later version stored afterward under the
      same slug
  asserts: replayCase of the first version answers its own number and title even after a second version
    exists
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version stored under the named slug, never the same version number stored under
      a different slug
  asserts: replayCase answers the named slug's version, not the same version number under another slug
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: derives from the currently registered capabilities read fresh at every call, answering differently
      once a capability is registered between two calls for the same version
  asserts: readCaseInputRequirements answers differently before and after a capability is registered
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: folds a concept whose answering capability is later forgotten into no attribute for that concept,
      rather than refusing the read
  asserts: readCaseInputRequirements answers an attribute while a capability is held, and none once forgotten,
    without refusing
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several coherence violations into the one CaseVersionNotValidError
  asserts: readCase's CaseVersionNotValidError lists both glossary violations, in order
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several structural violations into the one CaseVersionNotValidError
  asserts: readCase's CaseVersionNotValidError lists both structural violations
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: leaves replayCase unrevalidated by this change -- a replay still answers the pinned version's
      content even though the same content now fails readCaseInputRequirements's coherence check
  asserts: replayCase still answers the version's slug despite a coherence failure that blocks readCaseInputRequirements
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: lets a capability-registry integrity failure reach the caller rather than becoming a coherence
      violation of the case
  asserts: readCase rejects with the very DuplicateConceptAnswerError instance the capability query throws
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: names only the structural violations, never a coherence one, when a document fails both a structural
      rule and what would otherwise be a coherence rule
  asserts: readCase's CaseVersionNotValidError names only the structural violation
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a case failing one structural rule, naming the violation in a CaseVersionNotValidError
  asserts: readCase over a version with no hypotheses rejects, context naming the violation
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a draft version's input requirements once a coherence rule stops holding for its collected
      concept, the same CaseVersionNotValidError read-case itself throws for the identical content
  asserts: readCaseInputRequirements over a draft rejects with the same CaseVersionNotValidError read-case
    would
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a stored case version failing validation at a read through CaseVersionNotValidError
      alone, naming the case slug, the version and the validator rule that fails in Brazilian Portuguese,
      mapped to the 409 the read-by-name rule requires, and never through CaseNotFoundError
  asserts: readCase over a version with no hypotheses rejects with CaseVersionNotValidError, mapped to
    409, never CaseNotFoundError
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally invalid case version the same way read-case does, naming the violation
      in a CaseVersionNotValidError
  asserts: readCaseInputRequirements over a version with no hypotheses rejects the same way readCase does
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally valid case failing one coherence rule, as the composed CaseVersionNotValidError
      rather than the coherence module's own IncoherentCaseError
  asserts: readCase rejects with CaseVersionNotValidError, not IncoherentCaseError, for a coherence failure
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the capability registry no longer
      answers a concept it depends on
  asserts: readCase answers a version, then rejects it once its capability is forgotten
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the glossary no longer holds a concept
      it depends on
  asserts: readCase answers a version, then rejects it once its concept is removed from the glossary
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never
      stored
  asserts: replayCase over an unstored slug/version rejects with CaseNotFoundError
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
      (readCase)
  asserts: readCase over an empty store rejects with CaseNotFoundError naming the slug and version
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
      (readCaseInputRequirements)
  asserts: readCaseInputRequirements over an empty store rejects with CaseNotFoundError naming the slug
    and version
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: replays a pinned version without running the coherence checks at all, answering the case even
      though the same content would refuse at read-case
  asserts: with an empty glossary and no capabilities, readCase rejects while replayCase still answers
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 for a non-numeric version segment, without ever reaching discard
  asserts: DELETE with a non-numeric version segment answers 400, discard never called
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 via validation for a request with an empty slug segment, without ever reaching discard
  asserts: DELETE with an empty slug segment answers 400, discard never called
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 via validation for a request with an empty version segment, without ever reaching
      discard
  asserts: DELETE with an empty version segment answers 400, discard never called
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when discard
      rejects with a generic, non-domain error
  asserts: a generic Error from discard answers 500 INTERNAL_ERROR with no leaked message
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when no version answers an
      unknown slug
  asserts: discard rejecting with CaseNotFoundError answers 404 with matching details
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when the slug is known but
      the named version is not
  asserts: discard rejecting with CaseNotFoundError for a known slug/unknown version answers 404 with
    matching details
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version
      is not draft
  asserts: discard rejecting with CaseVersionNotDraftError answers 409 with matching details
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: removes the named draft version through discard and answers 204 with a wholly empty body
  asserts: with discard mocked, DELETE answers 204 with a zero-length body and the mock called with (slug,
    version)
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 for a body missing a required attribute, without ever reaching caseStore.updateDraft
  asserts: PATCH with a body missing title answers 400, updateDraft never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 for a non-numeric version segment, without ever reaching caseStore.updateDraft
  asserts: PATCH with a non-numeric version segment answers 400, updateDraft never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 via validation for a request with an empty version segment, without ever reaching
      caseStore.updateDraft
  asserts: PATCH with an empty version segment answers 400, updateDraft never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when updateDraft
      rejects with a generic, non-domain error
  asserts: a generic Error from updateDraft answers 500 INTERNAL_ERROR, readCaseVersion never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: names VALIDATION_ERROR, the body as the part that failed, and a non-empty details list, on that
      same missing-attribute refusal
  asserts: a body missing title answers with code VALIDATION_ERROR, message containing 'body', non-empty
    details
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, and never reads the version
      back, when no version answers the named slug and version
  asserts: updateDraft rejecting with CaseNotFoundError answers 404, readCaseVersion never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the
      version back, when the named version is not draft
  asserts: updateDraft rejecting with CaseVersionNotDraftError answers 409, readCaseVersion never called
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: succeeds when consolidation_register is omitted from the body entirely, calling updateDraft
      with it absent rather than defaulted to some value
  asserts: a body without consolidation_register answers 200, and updateDraft is called with it absent
findings:
- pass: conformance
  file: src/__tests__/unit/http/diagnose.controller.spec.ts
  where: the test "names the pinned case's own slug, version and state on the thrown refusal, rather than
    a fixed or unrelated value", lines 102-110
  evidence: "await expect(rejection).rejects.toMatchObject({\n    context: { slug: 'a-different-slug',\
    \ version: 4, state: 'draft' },\n  });"
  cost: rules/investigation/only-a-released-case-version-is-diagnosed says only that the attempt is refused
    with an HTTP 409 response reporting a CaseVersionNotReleasedError and never says what that error's
    details carry. This test fixes that the refusal names the pinned version's own slug, version and state
    -- a disclosure decision the node already made for the sibling CaseNotFoundError but never made for
    this error. A reader of the rule learns the status and the error name but not that state rides along
    in the payload; that fact currently lives only in this test.
  correction: State, in rules/investigation/only-a-released-case-version-is-diagnosed, what CaseVersionNotReleasedError's
    details/context payload carries, the same way the log already closed this for CaseNotFoundError's
    details.
- pass: conformance
  file: src/__tests__/unit/http/diagnose.routes.spec.ts
  where: the 409 draft-state test, line 105
  evidence: 'expect(body.error.details).toEqual({ slug: ''a-slug'', version: 1, state: ''draft'' });'
  cost: rules/investigation/only-a-released-case-version-is-diagnosed states only that an attempt to diagnose
    a version not in released state is refused with an HTTP 409 response reporting a CaseVersionNotReleasedError
    -- its decision-log entry settles the status and the error name and nothing further, unlike sibling
    refusals whose details payload each node spells out. The shape {slug, version, state} exists only
    as an assertion in this test.
  correction: Extend rules/investigation/only-a-released-case-version-is-diagnosed (or a new constraint
    beside it) to state what the refusal's details carry.
- pass: conformance
  file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  where: the test at lines 150-165, 'refuses with the same status the status map assigns CaseNotFoundError,
    when the slug names a known case but the named hypothesis name does not exist under it'
  evidence: built.listHypothesisRevisions.mockRejectedValueOnce(new CaseNotFoundError('a-known-slug',
    0));
  cost: The test fixes that a hypothesis name absent under a known case is reported through the same CaseNotFoundError
    identity a case/version miss uses, filling the class's required version field with a bare 0 that names
    nothing real. rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused scopes CaseNotFoundError
    to a case slug, or a slug and version, that no case version currently answers, never to a hypothesis
    name. This test settles that choice for a hypothesis miss in a test file rather than in a node.
  correction: Record, in a node constraining domain/knowledge/hypothesis (or wherever the specification
    decides), what identity and status refuse a list-hypothesis-revisions call naming a hypothesis a known
    case does not currently hold.
- pass: conformance
  file: src/__tests__/unit/http/release.routes.spec.ts
  where: the first test, 'answers 200 with the version now in released state, read back whole through
    the published case-query and projected the same way read-case-route already is', lines 81-105
  evidence: "expect(response.statusCode).toBe(200);\nexpect(response.json()).toEqual({\n  slug: releasedCase.slug,\n\
    \  title: releasedCase.title,\n  ...\n  manifest: releasedCase.manifest,\n});"
  cost: No node states what an accepted release answers with -- neither that it is HTTP 200, nor that
    the body is the released version read back whole through case-query's read-case rather than through
    read-case-version's own stored record. A later reader who wants to know or change what a release call
    returns has nowhere in the specification to look, and this test and the controller it exercises are
    the only place that decision now lives.
  correction: Add a constraint, alongside the sibling ones for read-case-version, discard and update-draft,
    stating that an accepted release answers with HTTP 200 carrying the released version's own attributes
    read back whole through contracts/knowledge/case-query's read-case.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the coherence-violation assertions in "refuses a structurally valid case failing one coherence
    rule..." (context.violations) and "joins several coherence violations into the one CaseVersionNotValidError",
    and the matching readCaseInputRequirements coherence test
  evidence: "expect((refusal as CaseVersionNotValidError).context).toEqual({\n  slug: SLUG,\n  version,\n\
    \  violations: [`the concept \"${CONCEPT}\" does not exist in the glossary`],\n});"
  cost: The file's own structural-violation tests show a violations-array entry lands verbatim inside
    CaseVersionNotValidError's own .message. Locking the coherence-violation entries to English text therefore
    locks the same 409 refusal's message to English for a caller in that branch, so the operator this
    refusal is meant to reach cannot read what it names, and a maintainer implementing to this suite would
    be building an English domain refusal.
  correction: Assert the coherence violations in Brazilian Portuguese, matching the Portuguese already
    asserted for the structural family in the same file.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the same coherence-violation assertions
  evidence: 'violations: [`the concept "${CONCEPT}" does not exist in the glossary`],'
  cost: The specification fixes one Portuguese word per domain noun so a reader comparing two refusals
    can tell they speak of the same thing; asserting "concept" here instead of "conceito" locks a domain
    refusal's wording to the one noun this file itself elsewhere renders correctly in Portuguese for other
    refusals, leaving the vocabulary inconsistent across the same error family.
  correction: Name the noun "conceito" rather than "concept" in the asserted violation text.
- pass: conformance
  file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  where: the test 'answers exactly evidence, evaluation and durations -- no resolved, no assessment, no
    cost, no narrative and no ticket_ref field' (lines 103-115), together with completeRecord() (lines
    49-71), whose fixture never assembles a cost field
  evidence: 'expect(Object.keys(result).sort()).toEqual([''durations'', ''evaluation'', ''evidence'']);

    expect(result).not.toHaveProperty(''cost'');'
  cost: A later reader debugging why a curator's simulation surface shows no run cost for a hypothesis
    simulation will find this test asserting that absence as correct, and will look no further -- while
    the specification requires the run's own cost to travel in exactly this record, alongside durations.
  correction: completeRecord() would need to include a cost fixture, and the assertions would need to
    expect cost among the result's keys instead of asserting its absence.
---

## What it is

Four backend tasks (read-a-drafts-own-declared-attributes, serve-a-drafts-own-declared-attributes-over-http, prove-discard-accepts-a-draft-failing-validation, answer-update-draft-from-the-drafts-own-record) reviewed over their 31 files: coverage, specification conformance (one delegation per file), standard conformance (the project's own backend registry) and the captured run.
The run passed clean, so no failures pass finding exists.
The standard pass found no departure over the 37 rules in scope.
The conformance pass found 7 findings, none over a file or node this review's own 4 tasks implement -- each is on a pre-existing, untouched file or an untouched sibling test, opened as a candidate while the per-file judge searched the specification root for what a file's own domain fact answers to.
The coverage pass found every one of the 4 tasks' 26 criteria covered or partially covered; none uncovered or unauditable. 9 are partial, each because the mocked/fixture-level test proves less than its own name claims (see coverage entries above).
3 certifications were staged (constraints/a-successful-case-version-discard-answers-with-no-content, constraints/a-successful-case-version-own-record-read-answers-with-http-200, scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable); none held whole -- each auditor answered partial, for reasons recorded in the reconciliation record's own notes.

## Notes

The trace's drift over this target, read before staging: 0 orphaned, 8 moved, 4 proof, 68 code over 31 files (501 suppressed under frontend/app, declared freely edited). None of it is a finding of this review; `/reconcile` and `trace.py --prune`/`--release` are its own routes, named in the situate step's own reading, not repeated here.
The fold left 11 nodes uncleared over this review's own file set (constraints/a-successful-case-version-discard-answers-with-no-content, contracts/system/case-authoring, domain/integration/connector-configuration-registry, domain/knowledge/case-version-state, domain/knowledge/hypothesis-revision, rules/investigation/replay-is-pinned, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, rules/knowledge/a-case-version-is-written-once, rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case, rules/knowledge/a-slug-identifies-one-case, rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case); `trace.py --owed` is the report that reads them, never this record.
All 31 files remained `unbound` to a task's own claim after this bind, per the reconciliation record's own `unbound` list -- this task's node claims are asserted at the plan and delivery level (already bound by prior `/implement-task` deliveries), and this review's staging read every trace-bound and plan-node pair on these files without writing a new claim of its own beyond the 24 it restamped.
