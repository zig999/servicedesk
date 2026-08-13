---
title: Proof for the author-case-version command
summary: Unit tests over fake ICaseStore/IGlossaryQuery/ICapabilityQuery ports prove AuthorCaseVersionService
  parses, coherence-checks and stores exactly the parsed case, refusing once with every violation named
  and storing nothing on any refusal; integration tests against a real PostgreSQL database prove the same
  through the real wiring, including that a missing concept is caught by coherence before the store's
  own foreign key is ever reached, that a real capability edit is re-read at the next submission, and
  that no row lands in cases/case_versions/hypotheses/hypothesis_collects on any refusal; two now-stale
  assertions in RelationalCaseStore's own sibling specs, which expected the generic CaseStoreError for
  a duplicate (slug, version) this task's own criterion 2 now distinguishes into CaseVersionAlreadyStoredError,
  are corrected in place.
implementation: sha256:c8e53eeedcb27b8119cfcda03a33c8ffa8c839db559a3fc42c2724571537c9e0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-authoring-author-case-version-command-suite-2
tests:
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: stores a submission of one valid case version and answers with its slug and version
  proves: A submission of one valid case version stores it and answers with its slug and version.
  fails_when: authorCaseVersion stops calling caseStore.writeVersion exactly once with the parsed case,
    or answers anything other than { slug, version } read from the parsed case.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission naming a slug and version already stored, propagating the store's own write-once
    refusal rather than merging
  proves: A submission naming a slug and version already stored is refused rather than merged.
  fails_when: a second submission of the same slug and version resolves instead of rejecting, or rejects
    with anything other than the store's own CaseVersionAlreadyStoredError carrying that slug and version.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: does not refuse a submission that holds against every validator rule, even carrying an optional
    consolidation register
  proves: A submission that holds against every validator rule is not refused by this command.
  fails_when: a structurally and coherently valid submission carrying the optional consolidation register
    is refused for any reason.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission whose collected concept the glossary does not hold, naming the concept
  proves: A submission naming ... a concept ... the glossary does not hold is refused, naming the term.
  fails_when: a submission collecting an unregistered concept is not refused, or the refusal's violations
    do not name that concept, or the store is called anyway.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission naming an outcome the glossary does not hold, naming the outcome
  proves: A submission naming a ... outcome ... the glossary does not hold is refused, naming the term.
  fails_when: a submission naming an unregistered outcome is not refused, or the violation does not name
    that outcome.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission whose hypothesis collects a concept that does not accept the case's declared
    subject type, naming the concept and the subject type
  proves: A submission whose hypothesis collects a concept that does not accept the case's declared subject
    type is refused, naming the concept and the subject type.
  fails_when: the refusal's violations omit either the concept's or the subject type's name, or the submission
    is not refused at all.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission whose collected concept has no registered read-only capability at all, naming
    the concept
  proves: A submission whose hypothesis collects a concept with no registered read-only capability ...
    is refused, naming the concept.
  fails_when: a submission collecting a concept with no registered capability is not refused, or the violation
    does not name the concept.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses a submission whose collected concept's capability declares no output schema, naming the
    concept
  proves: the same criterion's declaring-an-output-schema-and-a-timeout half
  fails_when: a capability lacking its output schema stops being treated as a gap, or the refusal does
    not name the concept.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: never refuses a submission on account of its collected concept's ttl, whether that ttl is the
    sixty-second default a registration stating none resolves to or a value a registration declares explicitly
  proves: A collected concept whose glossary registration states no ttl is read with the default of sixty
    seconds rather than refusing the submission.
  fails_when: a submission is refused because of a concept's ttl value, at the default or at any other
    value.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: answers the capability check from the registration as it stands at this submission, refusing a
    later submission once an earlier one's capability is no longer held
  proves: The capability check answers from the registration as it stands at this submission, never from
    one read earlier.
  fails_when: a second submission is not refused after the capability it depends on is forgotten between
    the two calls, or the first, still-valid submission is refused too.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: joins several coherence violations into the one CaseNotValidError, naming every one of them together
  proves: A submission violating several rules is refused once, naming every violation together (the coherence
    half).
  fails_when: only one of the two violated coherence rules is named, or two separate refusals are raised
    instead of one.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: joins several structural violations into the one InvalidCaseDocumentError, propagated unwrapped
    from the delegated structural validator
  proves: the structural half of criterion 9, and the recorded inference that a structural violation propagates
    as InvalidCaseDocumentError unwrapped.
  fails_when: only one of the two structural violations is named, or the error is wrapped into a different
    type before reaching the caller.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: refuses, through the delegated structural validator, a submission whose hypotheses share a declared
    name
  proves: the task's own UNDERDETERMINED note that criterion 3's totality rests on the five candidate
    cross-context rules alone.
  fails_when: a submission whose two hypotheses share a name is stored instead of refused.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: names only the structural violations, never a coherence one, when a document fails both a structural
    rule and what would otherwise be a coherence rule
  proves: the other half of criterion 9 — structural and coherence violations are mutually exclusive per
    submission.
  fails_when: a coherence violation appears alongside a structural one, or the refusal is anything but
    InvalidCaseDocumentError.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: never calls into the store when a submission is refused for a structural violation
  proves: Nothing is stored when a submission is refused (structural half).
  fails_when: caseStore.writeVersion is ever called for a structurally invalid submission.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: never calls into the store when a submission is refused for a coherence violation
  proves: Nothing is stored when a submission is refused (coherence half).
  fails_when: caseStore.writeVersion is ever called for a coherence-invalid submission.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: parses and validates the submitted document itself, refusing a document that is not one JSON object
    structurally rather than assuming a typed Case
  proves: the implementation's own recorded inference that the submitted document arrives as unknown and
    authorCaseVersion parses and validates it itself.
  fails_when: a non-object document is not refused, or is refused with anything other than the structural
    violation parseCaseDocument itself raises.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: never refuses on the slug/file-name rule, whatever slug the document declares, since the file-name
    stand-in is built from that same slug
  proves: the implementation's own recorded inference that the declared slug, read speculatively, stands
    in for parseCaseDocument's file-name parameter.
  fails_when: an unusual slug value is spuriously refused on the slug/file-name structural rule.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: passes the canonically-parsed case into the store, not the raw submitted document, so nothing
    undeclared travels into storage
  proves: the implementation's own recorded inference that authorCaseVersion passes the canonically-parsed
    Case into caseStore.writeVersion, not the raw submitted document.
  fails_when: an attribute the document declares but the Case type does not travels into the call the
    service makes to the store.
- file: src/__tests__/unit/case/author-case-version.service.spec.ts
  name: lets a capability-registry integrity failure reach the caller rather than becoming a coherence
    violation of the case
  proves: the dependency-failure edge case — an upstream integrity error is not swallowed into an ordinary
    coherence violation.
  fails_when: the DuplicateConceptAnswerError is caught and turned into a CaseNotValidError instead of
    propagating unchanged, or the store is called anyway.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: stores a submission of one valid case version, through the real wiring, and answers with its slug
    and version
  proves: criterion 1, against the real database.
  fails_when: the real command fails to store the version, or answers anything other than the submitted
    slug and version, or the real store does not hold a matching document afterward.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses a submission naming a slug and version already stored, through the real store's own CaseVersionAlreadyStoredError,
    and leaves the stored version exactly as it was
  proves: criteria 2 and 10 together, against a real primary-key violation.
  fails_when: the conflicting resubmission is not refused, is refused as anything but CaseVersionAlreadyStoredError,
    or the stored title/version count changes.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: does not refuse, through the real wiring, a submission that holds against every validator rule,
    including a case declaring more than one hypothesis
  proves: criterion 3, against the real database.
  fails_when: a coherent multi-hypothesis submission is refused for any reason through the real wiring.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses through the real wiring a submission naming an outcome the glossary does not hold, naming
    the outcome
  proves: criterion 4, against the real glossary.
  fails_when: the real refusal is not CaseNotValidError naming exactly the missing outcome.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses through the real wiring a submission whose hypothesis collects a concept that does not
    accept the case's declared subject type, naming the concept and the subject type
  proves: criterion 5 and scenarios/knowledge/a-subject-mismatch-refuses-the-case, against the real glossary.
  fails_when: the real refusal omits either name, or the submission is not refused.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses through the real wiring a submission whose collected concept has no registered capability
    at all, naming the concept
  proves: criterion 6, against the real capability registry.
  fails_when: the real refusal is not CaseNotValidError naming the concept.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: answers the real capability check from the registration as it stands at this submission, refusing
    a later submission once the real registration's own output schema is edited away directly against
    the table, and storing nothing for that refused version
  proves: criteria 8 and 10 together — register, submit successfully, edit the row directly, submit again
    and observe the refusal.
  fails_when: the second submission succeeds despite the edited row, or a row for the refused version
    appears in case_versions.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses through the real wiring, joining every coherence violation together, when a collected
    concept is absent from the glossary entirely
  proves: criterion 9's coherence half, against the real schema's own foreign key.
  fails_when: only one of the two violations is named, or the submission reaches the store's own foreign
    key instead of being refused by the coherence check first.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: refuses through the real wiring, joining every structural violation together, before the coherence
    checks or the store are ever reached
  proves: criterion 9's structural half, against the real database.
  fails_when: only one structural violation is named, or a coherence-shaped violation appears alongside
    them.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is
    refused structurally
  proves: criterion 10, structural half, checked across all four tables the criterion names.
  fails_when: any row for the slug appears in any of the four tables after the refused structural submission.
- file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  name: leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is
    refused for a coherence violation
  proves: criterion 10, coherence half, checked across all four tables.
  fails_when: any row for the slug appears in any of the four tables after the refused coherence submission.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own CaseVersionAlreadyStoredError, naming the slug and version, and rolls
    back, when a duplicate version violates the primary key
  proves: the corrected assertion over RelationalCaseStore's own version-insert mapping this task adds
    — criterion 2, from the store's own side.
  fails_when: the version-insert's real unique-violation stops mapping to CaseVersionAlreadyStoredError,
    or the rollback/release mechanics regress.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: still raises the generic CaseStoreError, carrying the driver failure as its cause, for a version-insert
    failure that is not a real unique-constraint violation
  proves: that the new distinguishing logic (isUniqueViolation) gates on the driver's own code rather
    than on message text.
  fails_when: a non-unique-violation failure on the version insert is mapped to CaseVersionAlreadyStoredError
    instead of the generic CaseStoreError.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses a second write to the same slug and version through this store's own CaseVersionAlreadyStoredError,
    and leaves the stored version exactly as it was
  proves: the corrected real-effect assertion for the same mapping, against a real duplicate-key violation.
  fails_when: the real duplicate write is refused as anything but CaseVersionAlreadyStoredError, or the
    stored document changes.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: lets only one of two concurrent writes to the same slug and version succeed, the other refused
    through this store's own CaseVersionAlreadyStoredError
  proves: the corrected real-effect assertion under two concurrent writers.
  fails_when: the losing concurrent write's rejection is not CaseVersionAlreadyStoredError.
untested:
- 'criterion 7''s own defaulting mechanism (GlossaryService''s registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS)
  cannot be exercised against the real database in this task''s own integration proof: concepts.ttl is
  a real NOT NULL column and this store exposes no concept-write path at all, so a registration stating
  no ttl cannot literally be produced against the real schema. This proof instead shows, at the unit level,
  that this command''s own coherence check never distinguishes on a concept''s ttl value at all. The defaulting
  mechanism itself belongs to GlossaryService and the glossary-store task''s own proof.'
- this task's own second UNDERDETERMINED note ('one case version whole' states no shape of its own) names
  no candidate implementation the specification refuses. This proof establishes only that AuthorCaseVersionService
  delegates the whole structural read to parseCaseDocument without narrowing or restating it; case-aggregate-shape's
  own structural totality is that task's own proof to carry.
- the concurrent-write guarantee for two authorCaseVersion calls submitted at once for the same slug and
  version is proven only at RelationalCaseStore's own level (corrected in this same delivery); AuthorCaseVersionService
  holds no concurrency logic of its own.
- the action and recipient vocabularies specifically are not separately exercised by name at this task's
  own level; validate-case-coherence.spec.ts already proves every one of the five term kinds exhaustively.
not_applicable:
- edge_case: two operations against one subject at once, submitted through AuthorCaseVersionService itself
  why: the write-once guarantee under concurrency is the store's own responsibility, proven at RelationalCaseStore's
    own integration level; this service adds no concurrency logic of its own to test.
- edge_case: absent/undefined or array-shaped input beyond the one non-object variant already tested
  why: parse-case-document.spec.ts already exhaustively proves every structural variant of a non-case-shaped
    document; re-proving every variant here would duplicate that module's own totality.
- edge_case: a numeric boundary on the version number (zero, negative, a maximum)
  why: no criterion or bound specification node states a range for version.
- edge_case: an empty collection answered by this command
  why: authorCaseVersion always answers a fixed two-field object ({ slug, version }) or refuses; it never
    answers a collection.
divergences:
- cites: STK-08
  file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is configured too — the same departure
    every sibling relational-store integration proof in this initiative already discloses.
- from: the boundary that a task's own proof touches only its own task's test files
  departure: 'src/__tests__/unit/persistence/relational-case-store.repository.spec.ts''s own duplicate-key
    test, and src/__tests__/integration/persistence/relational-case-store.repository.spec.ts''s own duplicate-key
    and concurrent-write tests, are corrected in this delivery rather than through a separate proof-only
    re-delivery of task/relational-stores/case-store: all three used to assert the generic CaseStoreError,
    which is exactly what this task''s own criterion 2 changed by distinguishing the version-insert''s
    own unique-violation into CaseVersionAlreadyStoredError. A new unit test is also added there, proving
    the distinguishing guard still falls through to the generic error for a non-unique-violation failure
    on the same statement.'
  why: these assertions became false the moment this task's own extension of RelationalCaseStore landed;
    leaving them asserting the old, now-incorrect behavior would be a stale test nobody flagged, and the
    task's own implementation record already names this exact store as the one it depends on and directly
    modified.
---

## What it is

Thirty-five tests proving the curator's authoring command delegates every structural and coherence
rule to case-aggregate-shape's own validators, stores exactly the parsed case only once both have
held, refuses once naming every violation together, and reads the capability check fresh at each
submission — plus two now-stale assertions in RelationalCaseStore's own sibling specs, corrected to
match the store's own distinguished write-once refusal this task adds.

## Notes

Two sibling test files in relational-stores/case-store's own delivery asserted the generic
CaseStoreError for a duplicate (slug, version); corrected here, disclosed above, since this task's
own criterion 2 is exactly what changed that behavior.
