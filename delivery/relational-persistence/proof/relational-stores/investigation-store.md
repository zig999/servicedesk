---
title: Proof for RelationalInvestigationStore, the IInvestigationStore relational adapter
summary: Unit tests over a stand-in DatabaseConnection prove write()'s and read()'s mechanics (statement
  order and params, one transaction, write-once decided by a key, no UPDATE, no filesystem call, defensive
  re-narrowing on read), and integration tests against a real database prove the whole round trip, real
  write-once and atomicity under real constraint violations, and that the evidence-to-capability pin is
  a real foreign key rather than only this store's own shape.
implementation: sha256:44a77bc0574fc9d2b1266416aba7ff77f96d6f89bad84069e0532c0be60a93aa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-investigation-store-suite-2
tests:
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends every declared attribute of the root row — identity, subject type, prompt version, model,
    pinned case, assessment, cost, durations and written_at — as the root insert's own params, in order
  proves: criterion 1 — every declared root-row attribute is persisted
  fails_when: any field is missing, wrong, or out of the order INVESTIGATION_INSERT_TEXT declares
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: inserts the root row first, then every subject attribute-value, every evidence item, and each
    evaluation immediately followed by its own citations, all through the one transaction it opens
  proves: criterion 1 (one transaction, ordered inserts)
  fails_when: any statement runs outside BEGIN…COMMIT, or the order of root/attributes/evidence/evaluation+citations
    changes
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: inserts one row per subject attribute-value the investigation's subject carries
  proves: criterion 1 — the subject's whole attribute-value set is written
  fails_when: an attribute-value row is dropped, merged, or its params are wrong
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: carries each evidence item's capability_name and capability_version pin into its own insert row,
    not only the eight fields criterion 6 names explicitly
  proves: this task's UNDERDETERMINED note (write side) — the capability pin travels into the evidence
    insert
  fails_when: an implementation persists only the eight named evidence fields and drops capability_name/capability_version
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: rolls back and raises this store's own typed error, carrying the driver failure as its cause,
    when an evidence insert fails after the root row and the subject attribute-values already succeeded
  proves: criterion 2 (rollback mechanics) and the InvestigationStoreError wrapping convention
  fails_when: no ROLLBACK is issued, release is skipped, or the error is not InvestigationStoreError carrying
    the cause
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, mapped
    from the root insert's own unique-violation, without any SELECT ever run before it
  proves: criterion 3 — write-once decided by a key, never by reading first
  fails_when: the error is not InvestigationAlreadyStoredError, or any statement before the failing INSERT
    is a SELECT
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: does not refuse a write for an id not already stored
  proves: criterion 4
  fails_when: the write rejects or the transaction never commits for a fresh id
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: answers absence, not a rejection, and reads no further, when investigations holds no row for the
    given id
  proves: read()'s absence-is-data precondition for criterion 5
  fails_when: read() throws for an absent id, or issues any SELECT against a child table before returning
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: answers one evidence item for every evidence row and one evaluation for every evaluation row a
    read finds, unfiltered
  proves: criterion 5
  fails_when: the read filters, drops, or duplicates an evidence or evaluation row
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reads back the subject's whole attribute-value set, paired with its type
  proves: criterion 1's read side (subject and its whole attribute-value set)
  fails_when: any attribute-value pair is dropped or the subject type is wrong
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: read failure wrapping convention
  fails_when: a driver failure reaches the caller unwrapped
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles each evidence item with its concept, inputs, observation, observed_at, ttl, origin,
    result and its capability pin, including result_detail when it carried one
  proves: criterion 6, and this task's UNDERDETERMINED note (read side)
  fails_when: any of the eight named fields, or the capability pin, is missing, or result_detail is included
    when null or omitted when present
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a row whose result is outside evidence-result's
    declared enumeration
  proves: defensive re-narrowing on evidence-result (matching RelationalCaseStore's consolidation_register
    precedent)
  fails_when: an unrecognized value is silently coerced or passed through instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles a confirmed evaluation with its hypothesis, verdict and citations, and no reason
  proves: criterion 7 (decided branch)
  fails_when: citations are wrong or a reason key is present
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles an inconclusive evaluation with its hypothesis, verdict, reason and whatever citations
    it carried
  proves: criterion 7 (inconclusive branch)
  fails_when: the reason or the citations carried are wrong
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a row whose verdict is outside verdict's
    declared enumeration
  proves: defensive re-narrowing on verdict
  fails_when: an unrecognized verdict is silently coerced instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a confirmed evaluation whose citation
    set is empty
  proves: the delivery record's inference that a decided verdict with no citations raises rather than
    silently coerces
  fails_when: an empty citation set for a confirmed evaluation is answered instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a refuted evaluation whose citation
    set is empty
  proves: the same inference for the refuted branch
  fails_when: an empty citation set for a refuted evaluation is answered instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering an inconclusive evaluation whose reason
    column is null
  proves: the delivery record's inference that a null reason on an inconclusive row raises
  fails_when: a null reason is answered as undefined/omitted instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: raises this store's own typed error rather than answering an inconclusive evaluation whose reason
    is outside evaluation-reason's declared enumeration
  proves: defensive re-narrowing on evaluation-reason
  fails_when: an unrecognized reason is silently coerced instead of raising
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles the assessment with its outcome, referral, determining_hypothesis and text, when a hypothesis
    was named
  proves: criterion 8
  fails_when: any of outcome, referral, determining_hypothesis or text is missing or wrong
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: leaves determining_hypothesis out of the assembled assessment when the fallback answered and no
    hypothesis was named
  proves: criterion 8 (absent case)
  fails_when: the key is present with a null/undefined value instead of being absent
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: issues no UPDATE statement anywhere while writing a whole investigation
  proves: criterion 9's mechanical half (no UPDATE path exists)
  fails_when: any statement text contains UPDATE
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: 'opens no file of any kind: this module names no filesystem import and calls no filesystem function'
  proves: criterion 10
  fails_when: the module's own source text names a node:fs import or a filesystem read/write function
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reads evidence ordered by concept, evaluations ordered by hypothesis, citations ordered by hypothesis
    then concept then field, and subject attribute-values ordered by attribute then value
  proves: the delivery record's ordering inference
  fails_when: any of the four SELECTs drops or changes its own ORDER BY clause
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: computes StoredInvestigation's own hash as sha256 of the assembled document's own JSON serialization
  proves: the delivery record's hash inference (and its disclosed divergence from the port doc comment)
  fails_when: the hash is computed over anything other than the assembled document's own deterministic
    JSON
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends ticket_ref exactly as the given investigation holds it, including the empty string used
    where no ticket was given
  proves: the delivery record's ticket_ref inference (write side)
  fails_when: an empty ticket_ref is translated to NULL before being sent
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: answers ticket_ref as the empty string when the stored column itself is a SQL NULL
  proves: the same inference (read side)
  fails_when: a NULL ticket_ref is answered as null/undefined instead of the empty string
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: inserts no evidence row and no evaluation row for an investigation carrying neither
  proves: edge case — an empty evidence/evaluation collection on write
  fails_when: a spurious INSERT is attempted against either child table with nothing to insert
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: answers empty evidence and evaluations arrays when a read finds neither table holding a row for
    the given id
  proves: edge case — an empty evidence/evaluation collection on read
  fails_when: the read answers anything other than an empty array for either collection
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
    with its capability pin, evaluations with their citations, assessment, cost and durations — through
    one transaction
  proves: criteria 1, 5, 6, 7, 8 together, against a real database, and the capability pin's positive
    round trip (this task's UNDERDETERMINED note)
  fails_when: the read document differs from what was written in any part, or the hash is not sha256 of
    that document's JSON
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, and leaves
    the already-stored record completely unchanged
  proves: criterion 3 and criterion 9, against a real primary-key violation
  fails_when: the second write is not refused through InvestigationAlreadyStoredError, or the stored record
    differs from the original afterward
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: lets only one of two concurrent writes to the same id succeed, the other refused through InvestigationAlreadyStoredError
  proves: edge case — two operations against one subject at once
  fails_when: both writes succeed, both fail, or the failing one is not InvestigationAlreadyStoredError
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: does not refuse a write for an id not already stored
  proves: criterion 4, against a real database
  fails_when: the write rejects for a fresh id
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: answers undefined, not a rejection, for an id nothing was ever written under
  proves: read()'s absence-is-data behavior, against a real database
  fails_when: read() throws, or answers anything other than undefined
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back one evidence item for each concept and one evaluation for each hypothesis the investigation
    was written with
  proves: criterion 5, with more than one evidence item and more than one evaluation, against a real database
  fails_when: either collection is filtered, merged, or answered out of the identity it was written with
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back an evidence item exactly as written when its result is not ok and it carries a result
    detail
  proves: criterion 6 — the detail an evidence item carries when it has one
  fails_when: result_detail is dropped, or the non-ok result is altered
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back an assessment with no determining_hypothesis when the fallback answered and none was
    named
  proves: criterion 8 (absent case), against a real database
  fails_when: determining_hypothesis is present after being written absent
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: leaves nothing behind — no root row, no subject attribute-value row, no evidence row, no evaluation
    row, no citation row — when a second evaluation in the same write collides with an earlier one's own
    hypothesis
  proves: criterion 2, against a real unique-constraint violation partway through a multi-statement write
  fails_when: any row from the failed write survives in any of the five tables
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: refuses a write, through a real foreign key violation, when an evidence item names a capability
    name and version the capabilities table does not hold — and leaves nothing stored
  proves: this task's UNDERDETERMINED note, its real-constraint half — the capability pin is a real foreign
    key, not only this store's own shape
  fails_when: the write is not refused by a real foreign-key violation, or the root row survives
not_applicable:
- edge_case: an empty subject (no attribute-value at all)
  why: refused upstream at construction by Subject's own invariant (subject.ts's buildSubject), before
    an Investigation ever reaches this store; not this store's job to test.
- edge_case: totality of evaluations against the pinned case's required hypotheses ("inconclusive counts,
    silence does not")
  why: this task's own REMAINDER note assigns that check to investigation-factory.ts's refuseTotalityViolations;
    this store only ever receives an already-complete aggregate, so no test here asserts it as this store's
    own domain fact.
- edge_case: a malformed/untyped document passed to write()
  why: unlike ICaseStore's writeVersion, this port's write() takes the already-valid, already-typed Investigation
    directly (per investigation-store.port.ts's own doc comment), so there is no "malformed document"
    boundary for this store to guard.
- edge_case: a slow or unavailable dependency
  why: the same driver-failure path already covered by the generic read/write-refusal tests; no distinct
    behavior exists for slowness versus outright failure at this layer.
untested:
- 'REMAINDER, from the specification — rules/investigation/one-evaluation-per-required-hypothesis''s second
  clause (''inconclusive counts, silence does not''): per the task''s own Notes, this is a totality check
  the specification''s own Description assigns to construction (investigation-factory.ts''s refuseTotalityViolations),
  not to storage. No test in either file asserts totality of evaluations against the pinned case''s required
  hypotheses; the store is proven only to round-trip whatever complete aggregate it is given, faithfully.
  This is intentional per the task''s own instruction, not an oversight to be filled later.'
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  departure: DATABASE_URL is read directly from process.env with a hand-written presence check, rather
    than through config/env.ts's Zod-backed loadEnv.
  why: loadEnv refuses unless every other application variable is configured too, which this integration
    suite has no use for — the same divergence already disclosed and established by every sibling relational-store
    integration spec in this initiative (relational-case-store.repository.spec.ts, relational-capability-store.repository.spec.ts,
    relational-glossary-store.repository.spec.ts).
---

## What it is

Thirty-nine tests proving RelationalInvestigationStore writes one investigation whole across five
tables in one transaction, refuses a second write of an already-stored id through a real
primary-key violation, leaves nothing behind when a write fails partway through, and reads every
part back exactly as written — including each evidence item's capability pin, proven as a real
foreign key rather than only this store's own shape.

## Notes

The totality of evaluations against the pinned case's required hypotheses ("inconclusive counts,
silence does not") is this task's own REMAINDER note: that check belongs to
investigation-factory.ts's own construction-time refusal, not to this store, so nothing here
asserts it as a domain fact this store decides.
