---
target: backend
title: Proof for reading a draft case version's own declared attributes
summary: Seven tests against CaseQueryService.readCaseVersion prove all thirteen criteria of draft-correction-while-invalid/read-a-drafts-own-declared-attributes,
  plus one test resolving the task's own UNDERDETERMINED entry about released versions; the four implemented
  nodes are left in untested because none of their whole facts is decided within this task's scope.
implementation: sha256:b4dda23f3164ee64c51f5b77c0099ccac17cedfaa525cf7a0e91a0179a6971e1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-read-a-drafts-own-declared-attributes-suite
tests:
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
    record carries them, even though its manifest holds no entry
  proves: Over a draft whose manifest holds no entry, the read answers the draft's declared attributes
    instead of raising CaseVersionNotValidError -- together with the title/when_to_use/subject/fallback
    outcome/fallback referral criteria (the answered value is the draft's own stored value), the no-consolidation_register-when-absent
    criterion, and the no-manifest-entry criterion, since the draft seeded here declares none of either.
  fails_when: readCaseVersion raises CaseVersionNotValidError for a manifest-less draft, or the returned
    version answers a title, when_to_use, subject or fallback other than exactly the ones stored, or includes
    a manifest or consolidation_register key it should not carry.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a draft's own declared attributes even though its stored subject names a subject type
    the glossary does not hold
  proves: Over a draft whose stored subject names a subject type the glossary does not hold, the read
    answers the draft's declared attributes instead of raising CaseVersionNotValidError.
  fails_when: readCaseVersion raises CaseVersionNotValidError for a draft whose subject the glossary does
    not recognize, or answers a subject other than the one stored.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a draft's own declared attributes even though its stored title is blank
  proves: Over a draft whose stored title is blank, the read answers the draft's declared attributes instead
    of raising CaseVersionNotValidError.
  fails_when: readCaseVersion raises CaseVersionNotValidError for a blank-titled draft, or answers a title
    other than the empty one stored.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers the draft's own declared consolidation_register exactly as its stored record carries it,
    when the draft declares one
  proves: Where the draft declares a consolidation_register, the answered consolidation_register is the
    one the draft's own stored record carries.
  fails_when: the answer omits consolidation_register, or answers a value other than the draft's own stored
    'formal'.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers each version's own title, never another version's, for the same case
  proves: Where another version of the same case carries a different title, the answered title is the
    draft's own stored title.
  fails_when: readCaseVersion answers a title belonging to a different version of the same case rather
    than the one named.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: raises CaseNotFoundError, carrying the slug and version, when no case version is stored for them
  proves: A slug and version that no case version answers makes the read raise CaseNotFoundError carrying
    that slug and version.
  fails_when: readCaseVersion answers anything other than a CaseNotFoundError for an unstored slug and
    version, or the raised error's context omits or misstates the slug or the version.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a released version's own declared attributes unvalidated, even though the same stored
    content fails read-case's structural validation
  proves: 'UNDERDETERMINED, from the specification -- contracts/knowledge/case-query publishes read-case-version
    as the read of a case version''s own stored record by slug and version number, which covers any case
    version, not only a draft; every criterion of this task speaks only of a draft, so no criterion covers
    a released version. Passes despite: a read that answers only draft case versions and raises an error,
    or answers through the validated whole-case read, for a released version named by an existing slug
    and version.'
  fails_when: readCaseVersion raises an error for a released version whose stored content fails structural
    validation (the "answers only draft and raises" implementation), or requires that same validation
    to pass before answering (the "answers through the validated whole-case read" implementation) -- either
    of the two implementations the underdetermined entry names as passing despite the contract's stated
    unvalidated read of any case version's own record.
not_applicable:
- edge_case: a malformed or absent slug/version (empty string, zero, negative, non-integer)
  why: Validation of the request shape is routed to the HTTP boundary; the task's own Notes leave constraints/a-malformed-request-is-refused-with-a-validation-error
    out of implements and assign it to the route task, and every criterion here is stated at the operation
    level, none naming an input-shape refusal.
- edge_case: an existing slug whose other versions are stored but not the one named
  why: heldVersion's own not-found check (store.assembleVersion answering undefined) does not distinguish
    an entirely unknown slug from a known slug missing only the named version; both raise CaseNotFoundError
    identically, so the empty-store representative in the CaseNotFoundError test already exercises the
    only branch this obligation reaches.
- edge_case: more than one validator rule of validation-runs-at-every-read failing on the same draft at
    once
  why: readCaseVersion consults no validator at all, so how many rules would have failed does not change
    its behavior; the three single-rule scenarios (manifest, glossary-unrecognized subject, blank title)
    already exercise the only paths this read would have taken had it validated.
- edge_case: consolidation_register set to 'plain' rather than 'formal'
  why: Both are values of the same two-member enumeration and the criterion only requires the answered
    value equal whatever the record stores; one representative value already exercises the pass-through,
    and a second only repeats the same assertion against different data.
- edge_case: the case-store dependency answering slowly, being unavailable, or throwing an unrelated error
  why: No criterion or node states special handling for readCaseVersion beyond the existing not-found
    path, and the standard's dependency-failure rule (EDG-08) is scoped to repository/adapter files, not
    this service.
- edge_case: two concurrent reads of the same slug and version
  why: This is a read with no write; no criterion or node states a concurrency guarantee for it, and nothing
    here would observably differ between one call and two.
untested:
- contracts/knowledge/case-query's whole fact -- the six published operations read-case, read-case-version,
  list-cases, list-case-versions, list-hypotheses and list-hypothesis-revisions together -- is not decided
  by any test here; this task's tests exercise only read-case-version, and the other five operations are
  implemented and proven by other tasks.
- domain/knowledge/case-version's whole fact -- an aggregate root with nine declared attributes and eight
  operations (collection-plan, requires-evaluation-of, resolve-outcome, place-hypothesis, remove-hypothesis,
  update-draft, release, discard) -- is not decided by any test here; this task reads only five of its
  declared attributes and touches none of its operations.
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's whole fact -- an HTTP 404 response,
  reads keyed by slug alone, and every lifecycle-operation clause -- is not decided by any test here;
  the CaseNotFoundError test proves only the one clause the task's own Notes assign to this task, and
  the HTTP mapping, the slug-only reads and the lifecycle operations are that same Notes' stated remainder,
  owned by other tasks.
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case's
  whole fact -- what a draft's editing surface presents and that it accepts update-draft on this same
  reading -- is not decided by any test here; this task delivers only the backend read the invariant presupposes,
  per the implementation record's own account, and the surface and update-draft's own acceptance belong
  to other tasks.
---

## What it is

Seven tests in a new spec file, __tests__/unit/case/case-query.service.spec.ts, against CaseQueryService.readCaseVersion: three prove the read is unblocked by different validator failures (empty manifest, glossary-unrecognized subject, blank title), five prove the answered attributes are exactly the draft's own stored values (title, when_to_use, subject, fallback, consolidation_register present and absent, no manifest), one proves the not-found refusal, and one resolves the task's own UNDERDETERMINED entry by proving the read is unvalidated for a released version too.

## Notes

None.
