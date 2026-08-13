---
title: The curator's authoring command, backed by a distinguished write-once refusal
summary: IAuthorCaseVersion/AuthorCaseVersionService submit one case version whole, answering every structural
  and coherence rule at that write before storing anything, and RelationalCaseStore now refuses a duplicate
  (slug, version) through its own typed error instead of the generic one.
task: sha256:7d0bcf427802bd6fc3fcbc1c49462c8d2fc88d1a65abdd3d68516be7e807d816
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-authoring-author-case-version-command-build
files:
- path: src/case/author-case-version.port.ts
  effect: declares AuthoredCaseVersion and the published IAuthorCaseVersion interface, whose one operation
    submits a document and answers with the slug and version stored
- path: src/case/author-case-version.service.ts
  effect: implements IAuthorCaseVersion — parses the submission (delegated to parse-case-document.ts),
    refuses a coherence violation once (delegated to validate-case-coherence.ts's caseCoherenceViolations,
    joined into CaseNotValidError the same way case-query.service.ts's own refuseIncoherence already joins
    it), and only then calls caseStore.writeVersion, answering with the stored slug and version
- path: src/factories/author-case-version.factory.ts
  effect: createAuthorCaseVersion(connection) composes AuthorCaseVersionService from createCaseStore,
    createGlossaryQuery and createCapabilityQuery over one shared connection, mirroring case-query.factory.ts's
    own composition
- path: src/errors/case-version-already-stored.error.ts
  effect: declares CaseVersionAlreadyStoredError(slug, version), the typed refusal for a write naming
    a slug and version already stored
- path: src/persistence/relational-case-store.repository.ts
  effect: writeVersion's own version-insert statement now runs through raiseCaseVersionInsertFailure,
    which maps a real unique-constraint violation on (slug, version) to CaseVersionAlreadyStoredError
    specifically, rather than the generic CaseStoreError every other statement's failure still raises;
    every other statement, and readVersion/listVersions, unchanged
criteria:
- criterion: A submission of one valid case version stores it and answers with its slug and version.
  met: true
  how: 'authorCaseVersion parses and coherence-checks the document, calls caseStore.writeVersion(theCase.slug,
    theCase.version, theCase), and returns { slug: theCase.slug, version: theCase.version } read back
    from the parsed case'
- criterion: A submission naming a slug and version already stored is refused rather than merged.
  met: true
  how: RelationalCaseStore's version-insert statement is the one with the primary key over (slug, version);
    raiseCaseVersionInsertFailure maps a real unique-violation on that statement to CaseVersionAlreadyStoredError,
    and no statement anywhere in this store is ever an UPDATE
- criterion: A submission that holds against every validator rule is not refused by this command.
  met: true
  how: every call authorCaseVersion makes — parseCaseDocument, caseCoherenceViolations, writeVersion —
    only raises on an actual violation or a real duplicate key; a submission passing every structural
    rule (delegated in full to parse-case-document.ts) and every coherence rule reaches writeVersion and
    returns normally
- criterion: A submission naming a subject type, concept, outcome, action or recipient the glossary does
    not hold is refused, naming the term.
  met: true
  how: delegated to caseCoherenceViolations' vocabularyViolations and conceptViolations, which name the
    missing term in the violation string joined into CaseNotValidError
- criterion: A submission whose hypothesis collects a concept that does not accept the case's declared
    subject type is refused, naming the concept and the subject type.
  met: true
  how: delegated to caseCoherenceViolations' conceptViolations, whose violation string names both the
    concept and the declared subject type together
- criterion: A submission whose hypothesis collects a concept with no registered read-only capability
    declaring an output schema and a timeout is refused, naming the concept.
  met: true
  how: delegated to caseCoherenceViolations' capabilityViolations/answerGaps, whose violation strings
    name the concept for each missing clause
- criterion: A collected concept whose glossary registration states no ttl is read with the default of
    sixty seconds rather than refusing the submission.
  met: true
  how: concepts are reached only through IGlossaryQuery.readConcept (via caseCoherenceViolations), which
    resolves through GlossaryService.concepts()'s own `registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS`;
    the coherence checks this command runs never inspect ttl at all, so an absent ttl never produces a
    violation
- criterion: The capability check answers from the registration as it stands at this submission, never
    from one read earlier.
  met: true
  how: AuthorCaseVersionService holds no cache of its own — its constructor only stores the three port
    references — and each authorCaseVersion call makes one fresh caseCoherenceViolations call that reads
    capabilities.readCapability(name) for that one submission alone, never remembering an earlier submission's
    answer
- criterion: A submission violating several rules is refused once, naming every violation together.
  met: true
  how: every structural violation is joined into one InvalidCaseDocumentError by parseCaseDocument (delegated);
    every coherence violation is joined into one CaseNotValidError by refuseIncoherence, mirroring case-query.service.ts's
    own joining; the two phases are mutually exclusive per submission — coherence never runs on a document
    that failed to parse
- criterion: Nothing is stored when a submission is refused.
  met: true
  how: caseStore.writeVersion is the one and only call this service makes into persistence, reached only
    after parsedCase and refuseIncoherence have both already returned without throwing; a refusal at either
    stage returns control to the caller before writeVersion is ever called
nodes:
- node: contracts/system/case-authoring
  encoded_at:
  - src/case/author-case-version.service.ts
  how: authorCaseVersion refuses once with every violated rule named, at this one write, before any store
    call — structural via the delegated parseCaseDocument call, coherence via the delegated caseCoherenceViolations
    call — and stores only once both have already held
- node: contracts/knowledge/author-case-version
  encoded_at:
  - src/case/author-case-version.port.ts
  - src/case/author-case-version.service.ts
  - src/factories/author-case-version.factory.ts
  how: IAuthorCaseVersion publishes authorCaseVersion(document) -> { slug, version }; AuthorCaseVersionService
    implements it; createAuthorCaseVersion wires it from one connection, mirroring case-query.factory.ts's
    own composition for the read side
- node: contracts/knowledge/vocabulary-terms
  encoded_at:
  - src/factories/author-case-version.factory.ts
  how: honored by composing IGlossaryQuery into this command through the same createGlossaryQuery leaf
    factory case-query.factory.ts already uses, then delegating every check that reads it to validate-case-coherence.ts's
    own caseCoherenceViolations
- node: contracts/knowledge/capability-check
  encoded_at:
  - src/factories/author-case-version.factory.ts
  how: honored the same way, composing ICapabilityQuery through createCapabilityQuery and delegating every
    capability check to caseCoherenceViolations' own capabilityViolations
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/case/author-case-version.service.ts
  how: the rule's authoring-write clause is this task's own job — authorCaseVersion runs both parseCaseDocument
    and caseCoherenceViolations fresh on every call, never caching a prior result; the rule's other two
    clauses reach no criterion of this write-only task and belong to the read path
- node: rules/knowledge/case-terms-exist-in-the-glossary
  how: honored by calling caseCoherenceViolations, whose vocabularyViolations and conceptViolations already
    enforce this rule against the glossary as it stands
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  how: honored the same way, through caseCoherenceViolations' conceptViolations, which already refuses
    a mismatch and names both disagreeing terms
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  how: honored the same way, through caseCoherenceViolations' capabilityViolations/answerGaps, which already
    refuse a concept with no qualifying capability
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  how: honored by reaching concepts exclusively through IGlossaryQuery.readConcept, which already applies
    the sixty-second default; this command never reads a concept registration by any other path
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  encoded_at:
  - src/case/author-case-version.service.ts
  how: AuthorCaseVersionService is stateless beyond its three port references, so each submission's capabilityViolations
    call reads the registration fresh, never a remembered one from an earlier submission
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  encoded_at:
  - src/case/author-case-version.service.ts
  how: the scenario's own mechanics live in validate-case-coherence.ts's conceptViolations, unmodified;
    this task's own contribution is that the same scenario now also refuses at the authoring write, not
    only at read
inferences:
- inferred: the submitted document arrives as unknown and authorCaseVersion parses and validates it itself,
    rather than trusting a caller to have already produced a typed Case.
  from: contracts/knowledge/author-case-version's own payload (domain/knowledge/case) names the concept
    the command carries, not a pre-validated shape, and the command's own description promises every validator
    rule answers "at this write"; case-query.service.ts's own document/unknown treatment is the same precedent.
- inferred: the document's own declared slug, read speculatively with a typeof guard before any structural
    check runs, stands in for parseCaseDocument's file-name parameter.
  from: this task's own Notes flagging that parseCaseDocument's second parameter checks the slug against
    a file name this write has none of, and case-query.service.ts's own precedent for building a synthetic
    file name from a known slug.
- inferred: a coherence violation is joined into CaseNotValidError(slug, version, violations) — the same
    joined type read-case's own refuseIncoherence raises — reached only once parsing has already succeeded;
    a structural violation instead propagates as InvalidCaseDocumentError unwrapped.
  from: this task's own Notes considering CaseNotValidError's reuse likely correct; case-query.service.ts's
    own refuseIncoherence precedent; and CaseNotValidError's own constructor requiring slug and version
    as non-optional typed values.
- inferred: authorCaseVersion passes the canonically-parsed Case into caseStore.writeVersion, not the
    raw submitted document, so nothing outside the declared attributes travels into storage.
  from: parseCaseDocument's own intent ("exactly the declared attributes, so nothing undeclared travels
    in").
- inferred: CaseVersionAlreadyStoredError is a new, distinct typed error constructed from slug and version,
    rather than reusing CaseStoreError or InvestigationAlreadyStoredError, mirroring InvestigationAlreadyStoredError's
    own shape.
  from: this task's own Notes directing exactly this addition and naming InvestigationAlreadyStoredError
    as the precedent to mirror.
- inferred: the version-insert statement specifically — never the case-identity statement or any hypothesis/collect
    statement — is the one whose unique-violation is mapped to CaseVersionAlreadyStoredError.
  from: relational-case-store.repository.ts's own pre-existing header comment ("Write-once is decided
    by case_versions' own primary key over (slug, version)") and migrations/0004-case-and-hypothesis.sql's
    own key declarations, neither modified by this task.
divergences:
- cites: COR-02
  file: src/persistence/relational-case-store.repository.ts
  departure: CaseVersionAlreadyStoredError, which this file's raiseCaseVersionInsertFailure raises on
    a duplicate (slug, version), carries a name, a message and a context field, but no status.
  why: this tree serves no transport yet and holds no status map anywhere; every existing typed error
    in this project already carries none, and COR-04 names the one place a status belongs once a transport
    arrives.
- cites: COR-02
  file: src/case/author-case-version.service.ts
  departure: CaseNotValidError, which this service raises on a coherence violation, carries a name, a
    message and a context field, but no status.
  why: the same reason — no transport reaches this command, this task did not modify CaseNotValidError's
    own pre-existing shape, and every error case-query.service.ts already raises through it carries none
    either.
- cites: DTO-01
  file: src/case/author-case-version.service.ts
  departure: authorCaseVersion(document) receives the raw submitted case document typed unknown, never
    a typed DTO a route boundary would already have validated.
  why: this command has no route or Zod boundary — the specification names the command and its payload
    but no transport for it — and this task's own criteria require the document's own structural and coherence
    rules to answer at this one write.
- cites: STK-08
  file: src/case/author-case-version.service.ts
  departure: declaredSlugOrEmpty narrows the submitted unknown document with a hand-written typeof/Array.isArray
    guard rather than a Zod schema, to read its own declared slug speculatively before parse-case-document.ts's
    own structural validation runs.
  why: the same tension a prior review already found in parse-case-document.ts's own isRecord and per-field
    guards; this one small peek exists only to build that module's own file-name stand-in, for a value
    its delegated call already validates completely.
- cites: MNT-03
  file: src/persistence/relational-case-store.repository.ts
  departure: UNIQUE_VIOLATION_CODE and isUniqueViolation are a second, near-identical copy of the same
    constant and guard relational-investigation-store.repository.ts's own root-insert handling already
    declares.
  why: this task's own instructions direct mirroring that store's exact local pattern rather than extracting
    a shared helper into database-access.ts, the common seam every relational adapter already runs statements
    through — deferred below.
preserved:
- RelationalCaseStore.readVersion and listVersions, unchanged
- the case-identity ON CONFLICT DO NOTHING statement and every hypothesis/collect insert, and their own
  failures still wrapped in the generic CaseStoreError exactly as before
- the whole write's own single-transaction, all-or-nothing behavior (runInTransaction), unchanged
- case-query.service.ts's own read-case and replay-case behavior, and the CaseNotValidError/IncoherentCaseError/InvalidCaseDocumentError
  classes it already raises, untouched
- parse-case-document.ts and validate-case-coherence.ts, called exactly as they stand and not modified
deferred:
- what: a shared unique-violation-detection helper (the UNIQUE_VIOLATION_CODE constant and the isUniqueViolation
    guard) in database-access.ts, so a third relational store needing the same distinction does not duplicate
    the pattern a third time.
  why: this task's own scope is the case store's write path and the author-case-version command; generalizing
    the pattern reaches into database-access.ts, the seam every relational adapter depends on, which sits
    outside this task's own file list.
---

## What it is

The curator's write entrance: IAuthorCaseVersion submits one case version whole, delegating every
structural and coherence rule to the validators case-aggregate-shape already established, and
storing only once both have held — refused, once, naming every violation together, if either has
not.

## Notes

RelationalCaseStore's own write-once refusal is now distinguished (CaseVersionAlreadyStoredError)
from any other write failure, mirroring RelationalInvestigationStore's own precedent — a legitimate
extension of the store this task depends on, not a reimplementation of validation.
