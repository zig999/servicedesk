---
title: RelationalInvestigationStore writes and reads one investigation whole
summary: Adds RelationalInvestigationStore, the database-backed implementation of IInvestigationStore,
  writing one investigation and every part it declares across five tables in one transaction, deciding
  write-once by the root row's own primary key rather than a read first, and reading it back whole including
  each evidence item's capability pin.
task: sha256:a467dceb18a673544aa5ccd0e7aae5429f8f7d7bd0c772e2de08dea0177c0a24
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-investigation-store-build-2
files:
- path: src/persistence/relational-investigation-store.repository.ts
  effect: New module — RelationalInvestigationStore implements IInvestigationStore against the shared
    database-access.ts/database-connection.ts seam. write(investigation) runs one transaction that inserts
    the root row into investigations first (id, requester, ticket_ref, narrative, subject_type, prompt_version,
    model, pinned_case_slug/version, the flattened assessment, cost and durations, written_at), then one
    row per subject attribute-value into investigation_subject_attribute_values, one per evidence item
    into investigation_evidence (including capability_name/capability_version) and, per evaluation, one
    row into investigation_evaluations immediately followed by one row per citation into investigation_evaluation_citations.
    A unique-violation on the root row's own primary key over id is mapped to the already-declared InvestigationAlreadyStoredError
    rather than read first; any other failure is wrapped in the already-declared InvestigationStoreError.
    read(id) runs one transaction that answers undefined the moment the root row is absent, otherwise
    reassembles the whole Investigation-shaped document from all five tables and answers it as StoredInvestigation's
    document/hash pair, hash being sha256 of the assembled document's own deterministic JSON serialization.
criteria:
- criterion: A write persists the id, requester, ticket reference when one was given, narrative, subject
    with its whole set of attribute-values, prompt version, model, every evidence item, every evaluation,
    the assessment, the cost, the durations, written_at and the pinned slug and version, in one transaction.
  met: true
  how: 'writeWholeInvestigation runs entirely inside runInTransaction''s own checked-out connection: the
    root INSERT carries id, requester, ticket_ref, narrative, subject.type, prompt_version, model, pinned_case.slug/version
    and the flattened assessment, cost and durations, plus written_at; childStatementsFor then inserts
    one row per subject attribute-value, one per evidence item and one per evaluation together with its
    own citations, all through the same checked-out connection before the transaction commits.'
- criterion: A write that fails part way leaves no part of the record stored.
  met: true
  how: Every statement writeWholeInvestigation issues runs through the one connection runInTransaction
    checked out; a rejection from any of them is caught by runInTransaction's own catch, which issues
    ROLLBACK before the connection is released, undoing every statement already run in that call.
- criterion: A second write of an id already stored is refused through the existing typed error, decided
    by a key the database holds rather than by reading before writing.
  met: true
  how: The root INSERT names no ON CONFLICT and no SELECT ever runs before it; a duplicate id fails against
    investigations' own primary key, and raiseRootInsertFailure maps that unique-violation (Postgres code
    23505) to the already-declared InvestigationAlreadyStoredError rather than this store's own generic
    error.
- criterion: A write of an id not already stored is not refused on that ground.
  met: true
  how: raiseRootInsertFailure only substitutes InvestigationAlreadyStoredError where isUniqueViolation(cause)
    holds; a fresh id's own INSERT raises no error at all, so write() resolves normally.
- criterion: A read answers the record holding one evidence item for each concept the collection plan
    named and one evaluation for each hypothesis the pinned case required.
  met: true
  how: readWholeInvestigation reads back exactly the evidence and evaluation rows write() stored for that
    id, unfiltered. The totality itself is what investigation-factory.ts's own refuseTotalityViolations
    already refused to let an invalid Investigation past before this store ever received it (this task's
    own REMAINDER note); a whole, faithful round trip is what this criterion asks of the store.
- criterion: A read answers each evidence item with its concept, inputs, observation, when it was observed,
    its ttl, its origin, the result its collection ended in and the detail it carried when it had one.
  met: true
  how: evidenceOf reassembles every one of those eight fields from investigation_evidence's own columns,
    narrowing result through resultOf against evidence-result's own four declared values and including
    result_detail only where that column is not null.
- criterion: A read answers each evaluation with its hypothesis, its verdict, the citations it carried
    when decided and the reason it carried when inconclusive.
  met: true
  how: evaluationOf reassembles hypothesis and verdict (narrowed through verdictOf) from investigation_evaluations,
    then, for a confirmed or refuted verdict, attaches the citation set nonEmptyCitations guards non-empty
    from investigation_evaluation_citations, or, for inconclusive, the reason reasonOf guards non-null
    and recognized from the row's own reason column.
- criterion: A read answers the assessment with its outcome, its referral, its determining hypothesis
    when one was named, and its text.
  met: true
  how: assessmentOf reassembles outcome, referral (action and recipient) and text unconditionally, and
    determining_hypothesis only where investigations.assessment_determining_hypothesis is not null.
- criterion: A record already stored is altered by no later write.
  met: true
  how: No statement this module issues is ever an UPDATE against any of the five tables it writes to;
    the only path that could touch an existing investigations row is the very INSERT criterion 3 already
    shows fails on that id's own primary key.
- criterion: No part of a record is held in a file.
  met: true
  how: This module issues no filesystem call of any kind; every read and write runs exclusively through
    the connection database-access.ts's helpers check out of DatabaseConnection.
nodes:
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: write() and read() run every statement through the shared connection database-access.ts checks
    out, and this module opens no file of any kind — the whole of one investigation's record lives in
    rows across five tables, never in a file the deployment ships or writes.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: Every write and read maps exactly the columns migrations/0005-investigation.sql already declares
    for domain/investigation/investigation and every part it carries, including the capability-pin columns
    on investigation_evidence the required cardinality-1 relationship to domain/integration/capability
    needs (this task's own UNDERDETERMINED note) — confirmed already columned by that migration before
    this task ran.
- node: rules/investigation/an-investigation-is-written-once
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: Write-once is decided by the investigations table's own primary key over id (raiseRootInsertFailure
    maps a unique-violation to InvestigationAlreadyStoredError), never by a read first; "never mutated"
    is answered by issuing no UPDATE anywhere in this module.
- node: rules/investigation/one-evidence-per-collected-concept
  how: 'This store honors rather than decides this rule: investigation_evidence''s own primary key over
    (investigation_id, concept) admits at most one evidence row per concept, and write() persists exactly
    the evidence array the given, already-validated Investigation carries. The collection-plan totality
    itself is enforced upstream by investigation-factory.ts''s own refuseTotalityViolations; the store''s
    own contribution is that what was written whole is read back whole, unchanged.'
- node: rules/investigation/one-evaluation-per-required-hypothesis
  how: 'This store honors rather than decides this rule, per this task''s own REMAINDER note: it persists
    and reads back the evaluations set whole and unchanged; investigation_evaluations'' own primary key
    over (investigation_id, hypothesis) admits at most one evaluation row per hypothesis, but the totality
    check itself belongs to investigation-factory.ts''s own refuseTotalityViolations, which this task
    does not implement.'
- node: domain/investigation/investigation
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: investigationStatement/investigationParams persist every declared attribute plus the pinned-case
    relationship (slug, version) in one INSERT, and investigationOf/readWholeInvestigation reassemble
    the same shape on read, each inside one transaction.
- node: domain/investigation/subject
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: 'subject.type is persisted as investigations.subject_type and reassembled on read as `{ type: row.subject_type,
    attributes }`, paired with its whole attribute-value set from investigation_subject_attribute_values.'
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: subjectAttributeValueStatement inserts one row per attribute-value pair; readSubjectAttributeValues
    reads them all back, sorted by attribute then value for a deterministic result.
- node: domain/investigation/evidence
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: evidenceStatement/evidenceOf persist and reassemble every declared attribute — concept, inputs,
    observation, observed_at, ttl, origin, result, result_detail (when carried) — plus the capability_name/capability_version
    pin the node's own required relationship to domain/integration/capability needs (this task's own UNDERDETERMINED
    note).
- node: domain/investigation/evidence-result
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: resultOf/isEvidenceResult narrow a stored result string to the enumeration's own four declared
    values, raising this store's own typed error on anything else.
- node: domain/investigation/evaluation
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: evaluationStatement/evaluationOf persist and reassemble each evaluation's hypothesis, verdict and,
    for a decided verdict, its citations, or, for inconclusive, its reason.
- node: domain/investigation/verdict
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: verdictOf/isVerdict narrow a stored verdict string to the enumeration's own three declared values.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: reasonOf/isEvaluationReason narrow a stored, non-null reason to the enumeration's own three declared
    values, raising where an inconclusive row carries none or an unrecognized one.
- node: domain/investigation/citation
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: citationStatement inserts one row per citation an evaluation carries; citationsByHypothesis reads
    them all back grouped by hypothesis, and nonEmptyCitations guards the non-empty citation set a decided
    verdict requires.
- node: domain/investigation/assessment
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: assessmentParams/assessmentOf flatten and reassemble outcome, referral (action, recipient), the
    optional determining_hypothesis and text.
- node: domain/investigation/cost
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: costParams persists calls/input_tokens/output_tokens; investigationOf reassembles them into the
    Cost shape on read.
- node: domain/investigation/durations
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: durationsParams persists collection/judgment/writing/total; investigationOf reassembles them into
    the Durations shape on read.
inferences:
- inferred: read() answers StoredInvestigation's hash as sha256 of the assembled document's own deterministic
    JSON serialization, not of bytes read off a disk.
  from: the same gap this task's own inventory names for the file-era hash, already closed the same way
    by relational-case-store.repository.ts's own contentHash for the identical StoredCaseVersion.hash
    pattern (also disclosed below as a divergence from the port's own doc comment).
- inferred: ticket_ref travels through this store exactly as the given Investigation holds it — including
    the empty string the HTTP boundary already uses where no ticket was given — rather than being translated
    to or from a SQL NULL.
  from: investigation.ts's own ticket_ref field is a required TypeScript string, never undefined, and
    no node this task implements states that an empty string and a SQL NULL mean the same thing for this
    column; the store persists and reads back the field unchanged instead.
- inferred: this task adds no migration script for the capability-pin columns the UNDERDETERMINED note
    asks after.
  from: 'reading migrations/0005-investigation.sql directly: investigation_evidence already declares capability_name
    and capability_version, NOT NULL, foreign-keyed to capabilities(name, version) — added when task/relational-substrate/schema-migrations
    first created this table, before this task ran.'
- inferred: a confirmed or refuted row found with no citations, or an inconclusive row found with no reason
    or an unrecognized one, raises this store's own typed read failure rather than being silently coerced
    into a value.
  from: TYP-02's guard-alongside-every-assertion convention, and this task's own REMAINDER-adjacent reasoning
    that this store never itself constructs or validates an Investigation.
- inferred: the evidence and evaluation rows a read answers are ordered by concept and by hypothesis respectively,
    and each evaluation's own citations by concept then field, for a deterministic result.
  from: relational-case-store.repository.ts's and relational-glossary-store.repository.ts's own identical
    precedent for hypothesis_collects and concept_accepts, neither of which carries an order column of
    its own either.
divergences:
- from: the IInvestigationStore port's own doc comment and FileInvestigationStore's own contentHash, both
    describing StoredInvestigation.hash as sha256 of the exact bytes a read found on disk.
  departure: this store's own contentHash instead hashes the JSON serialization of the document readWholeInvestigation
    assembled from investigations and its four child tables.
  why: there is no file and no disk bytes once the content is rows; hashing the assembled document's deterministic
    serialization is the closest equivalent that keeps the same content-identity property, the same choice
    relational-case-store.repository.ts's own contentHash already made for the identical port pattern.
preserved:
- persistence/file-investigation-store.repository.ts and its own proof keep behaving exactly as before
  — untouched; no factory in src/factories wires this new store, matching the precedent the three prior
  relational stores already set.
- investigation-store.port.ts's IInvestigationStore/StoredInvestigation shapes are unchanged — this task
  implements them rather than replacing them.
- migrations/0001 through 0007 are untouched; this task adds no schema change, since the capability-pin
  columns it needs were already added by migrations/0005-investigation.sql before this task ran.
- no-network-persistence.spec.ts, dependency-manifest.spec.ts and the module-audit specs keep passing
  unaffected — this file imports no driver of its own and adds no dependency.
- domain-depends-on-no-infrastructure.spec.ts's own sweep keeps passing unaffected — no investigation-context
  module gains a new import.
deferred:
- what: wiring RelationalInvestigationStore into a factory in place of FileInvestigationStore.
  why: no task in this plan names that cutover yet (task/service-on-the-database/store-wiring does, later),
    and this task's own objective is the store's behavior against the database, not which store production
    uses — matching the precedent the three prior relational-store tasks already set.
- what: investigation-store.port.ts's own header comment still names the retired constraint constraints/the-mvp-persists-to-no-database
    rather than constraints/the-system-persists-to-one-relational-database.
  why: this task implements the port rather than replacing it, the same as every sibling relational store;
    correcting a stale comment in a file this task does not otherwise touch reaches past this task's own
    objective — the identical situation relational-case-store's own delivery record already deferred for
    case-store.port.ts and case-query.port.ts.
- what: the reused InvestigationStoreError/InvestigationAlreadyStoredError classes carry no explicit status
    field the way COR-04's own mapping and the standard's error shape otherwise imply.
  why: this is a pre-existing characteristic shared by every sibling relational store's own typed errors;
    this task's own instructions call for reusing the existing typed errors rather than inventing new
    ones, and editing them reaches outside the one file this task's objective names.
---

## What it is

RelationalInvestigationStore: one investigation and every part it declares — subject and its
attribute-values, evidence, evaluations, assessment, cost, durations — written across five tables
in one transaction, write-once decided by the root row's own primary key, read back whole
including each evidence item's capability pin.

## Notes

No migration was added: migrations/0005-investigation.sql already carries the
capability_name/capability_version columns the UNDERDETERMINED note asked after, confirmed by
reading the file before writing any source.
