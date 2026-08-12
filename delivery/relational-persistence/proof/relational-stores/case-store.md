---
title: Proof for the relational case store
summary: Unit-level tests over a fake DatabaseConnection prove RelationalCaseStore's own read/write mechanics,
  mapping and error-wrapping; integration-level tests against a real PostgreSQL database prove the whole-aggregate
  read, write-once refusal, version-list completeness, and — directly excluding this task's own UNDERDETERMINED
  non-atomic-write candidate — that a write that fails partway through leaves no case_versions row, no
  hypothesis row and no collect row behind.
implementation: sha256:6dd0f66c48c25a14f21e3d44083a99f62420af422dc189fe123f47acbab2f8ed
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-case-store-suite-2
tests:
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: assembles the case root together with its hypotheses and their resolutions and referrals, all
    through the one transaction it opens
  proves: A read answers the case root together with its hypotheses and their resolutions and referrals,
    assembled in one transaction.
  fails_when: readVersion stops running the three SELECTs (case_versions, hypotheses, hypothesis_collects)
    through the same opened transaction in that exact order/text/params, or stops assembling them into
    the documented Case shape.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: answers undefined and reads no further, when case_versions holds no row for the given slug and
    version
  proves: A read answers either a complete aggregate or nothing, and never a case missing a hypothesis,
    a resolution or a referral.
  fails_when: readVersion answers something other than undefined for an absent case_versions row, or issues
    a hypotheses/hypothesis_collects SELECT before confirming case_versions matched.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: a driver rejection during a read reaches the caller as CaseStoreError carrying the original
    failure as its cause
  fails_when: a real driver failure during read reaches the caller unwrapped, or CaseStoreError's cause
    stops carrying the original failure.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: runs the case identity insert, the version insert, and each hypothesis immediately followed by
    its own collects, as one unit of work — the identity insert's own idempotent ON CONFLICT never refusing
    an already-held slug
  proves: A write of a slug and version not already stored is not refused on that ground, and the write's
    own ordered mechanics behind criterion 4.
  fails_when: the statement order, exact text or params of the case-identity insert, the case_versions
    insert, or any hypothesis/collect insert changes, or the case-identity statement stops being ON CONFLICT
    (slug) DO NOTHING.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when a duplicate version violates the primary key
  proves: A write of a slug and version already stored is refused through the case store's typed error,
    and the transaction rolls back rather than committing.
  fails_when: a case_versions insert failure reaches the caller as anything but CaseStoreError, ROLLBACK
    is not issued, or the connection is not released exactly once.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: answers exactly the version numbers the query answered, in the order it answered them, trusting
    the database's own ORDER BY
  proves: 'the version list answers every version ever written under that slug, by mechanics: exact SQL,
    pass-through mapping.'
  fails_when: listVersions stops issuing exactly `SELECT version FROM public.case_versions WHERE slug
    = $1 ORDER BY version`, or re-sorts/filters the rows itself instead of trusting the query.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when listing versions
    is refused
  proves: a driver rejection while listing versions reaches the caller as CaseStoreError carrying the
    original failure as its cause
  fails_when: a driver failure during listVersions reaches the caller unwrapped or without its cause.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: answers no versions at all for a slug nothing was ever written under
  proves: the empty-collection edge case — an absent slug reads as no versions rather than raising
  fails_when: listVersions raises or answers anything but an empty array for a slug with zero rows.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: wraps a failure while mapping a malformed document into statements into this store's own typed
    error, the same way a driver failure already is
  proves: 'the implementation''s own recorded inference: a failure while mapping the given document into
    statements is wrapped into CaseStoreError the same way a driver failure already is'
  fails_when: writeVersion lets the raw TypeError from a malformed document reach the caller unwrapped,
    instead of a CaseStoreError.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: computes StoredCaseVersion's own hash as sha256 of the assembled document's own JSON serialization
  proves: 'the implementation''s own recorded inference: StoredCaseVersion.hash is computed as sha256
    of the JSON serialization of the document this read assembled'
  fails_when: the answered hash stops equaling sha256 of JSON.stringify of the assembled document.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: reads authored_at back as the Date column parses to, converted with its own toISOString()
  proves: 'the implementation''s own recorded inference: case_versions.authored_at is read back as a JavaScript
    Date and converted with .toISOString()'
  fails_when: the assembled document's authored_at stops matching the stored Date's own toISOString()
    output.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: takes the document's own slug and version from the given key, never from a column of case_versions
  proves: 'the implementation''s own recorded inference: the reconstructed document''s slug and version
    are taken from the given key parameters, never from a column of case_versions itself'
  fails_when: the assembled document's slug or version diverges from the key readVersion was called with.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: leaves consolidation_register out of the assembled document entirely when the stored value is
    null
  proves: consolidation_register's optional-attribute mapping, and the defensive-narrow inference's absence
    branch
  fails_when: the assembled document carries a consolidation_register key (even undefined) when the stored
    value is null.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: carries a stored consolidation_register through unchanged when it is one of the enumeration's
    own declared values
  proves: consolidation_register's mapping for a declared value
  fails_when: a stored 'formal'/'plain' value stops reaching the assembled document unchanged.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a row whose consolidation_register is
    outside the declared enumeration
  proves: 'the implementation''s own recorded inference: a stored consolidation_register is re-narrowed
    against the enumeration''s own two declared values on read, raising this store''s own typed error
    if a row somehow holds an outside value'
  fails_when: an out-of-enumeration stored value is answered as data instead of raising CaseStoreError.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: reads back a case's root together with its hypotheses and their resolutions and referrals, exactly
    as written
  proves: A read answers the case root together with its hypotheses and their resolutions and referrals,
    assembled in one transaction — and the hash inference — against a real database.
  fails_when: the document readVersion answers after a real write diverges from what was written, or its
    hash stops equaling sha256 of the document's own JSON.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: orders hypotheses by their own declared position, and each hypothesis's own collects by concept
    name, regardless of the order they were written in
  proves: 'the implementation''s own recorded inference: hypotheses are ordered by declared position ascending,
    and each hypothesis''s own collects are ordered by concept name ascending — proven as a real database
    effect, not merely as SQL text'
  fails_when: a real read answers hypotheses out of position order or a hypothesis's collects out of concept-name
    order.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers absence, not a rejection, for a slug and version nothing was ever written under
  proves: A read for a slug and version nothing was written under answers with absence as data rather
    than raising — against a real database.
  fails_when: readVersion raises, or answers anything but undefined, for a slug/version never written.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses a second write to the same slug and version through this store's own typed error, and
    leaves the stored version exactly as it was
  proves: A write of a slug and version already stored is refused through the case store's typed error,
    and the stored version is left exactly as it was — against a real primary-key violation.
  fails_when: a duplicate slug/version write is not refused, is refused as something other than CaseStoreError/UNIQUE_VIOLATION,
    or the stored document is not exactly what was originally written.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: lets only one of two concurrent writes to the same slug and version succeed, the other refused
    through this store's own typed error
  proves: write-once holds under two operations against one subject at once
  fails_when: both concurrent writes succeed, or the losing write's rejection is not a CaseStoreError.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: does not refuse a write for a slug and version not already stored
  proves: A write of a slug and version not already stored is not refused on that ground — against a real
    database.
  fails_when: a write for a genuinely new slug/version rejects.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: keeps an earlier version readable, and lists every version ever written under one slug, after
    later versions are written
  proves: A version stored earlier remains readable after later versions of the same slug are written,
    and the version list answers every version ever written under that slug.
  fails_when: an earlier version becomes unreadable or changes after later versions are written, or listVersions
    omits/misorders a version.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: keeps exactly one row in cases for one slug after two versions are written under it, never creating
    a second case
  proves: Every version the store holds under one slug belongs to one case — the structurally-demonstrable
    half of this criterion, per the task's own ADVISORY note.
  fails_when: a second row in "cases" is ever created for the same slug across multiple version writes.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a later
    hypothesis in the same write violates a real constraint
  proves: the task's own UNDERDETERMINED note — excludes a store whose write inserts the case root, its
    hypotheses and their collects in separate transactions
  fails_when: any of the case row, the case_versions row, either hypothesis row, or any collect row survives
    a write whose second hypothesis fails on a real unique-constraint violation — which a non-atomic (separate-transactions)
    implementation would leave behind.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a hypothesis's
    own collects reference a concept that violates a real foreign key
  proves: the task's own UNDERDETERMINED note, excluded at a different partial-commit boundary — mid-collects
    for one hypothesis, catching a per-hypothesis-atomic-but-cross-hypothesis-separate implementation
  fails_when: the case row, the case_versions row, the hypothesis row, or its first (valid) collect row
    survives a write whose second collect fails on a real foreign-key violation.
untested:
- That case_versions itself refuses an ordinary UPDATE against an already-stored row — the "never altered"
  half of write-once. This store issues no UPDATE at all; that refusal is migration 0006's own case_versions_no_update
  rule rather than a statement this store writes, so nothing here exercises an UPDATE against case_versions.
- That a genuinely distinct second case is refused under an already-held slug. The task's own ADVISORY
  note states no candidate in the specification distinguishes a second case from the next version of the
  one already there, so nothing here tests that distinction; only the structural fact that exactly one
  'cases' row persists per slug across multiple version writes is proven.
- The domain-level uniqueness of a hypothesis's own name or position within its case, and the requirement
  that a case have at least one hypothesis or a hypothesis collect at least one concept — these schema-level
  constraints are used here only as convenient triggers for the atomicity-exclusion tests, and proving
  them as rules in their own right is not this task's own criteria to answer for.
not_applicable:
- edge_case: An absent or empty-string slug/version passed to readVersion or writeVersion
  why: it is passed through to the parameterized query the same way any other value is; behaviorally indistinguishable
    from any other key nothing was written under, which the absence tests already cover.
- edge_case: A slow or otherwise-unavailable database dependency
  why: this store carries no timeout or retry logic of its own; any driver failure, however caused, is
    wrapped identically by the same mechanism the generic failure-wrapping tests already exercise.
- edge_case: A numeric boundary on version numbers (minimum, maximum, zero, negative)
  why: no criterion or bound specification node states a range for version, so there is no boundary to
    test.
- edge_case: A case document with zero hypotheses, or a hypothesis with an empty collects array, submitted
    to writeVersion
  why: the domain rules requiring at least one of each are enforced upstream of this store under validation-runs-at-every-read,
    and this store trusts the given document as-is; testing that refusal here would assert a domain fact
    this task does not own.
- edge_case: A stored consolidation_register outside its own enumeration, exercised against the real database
  why: the schema's own CHECK constraint refuses that value before it can ever land, so this path is only
    reachable through a mocked row and is proven at the unit level instead.
---

## What it is

Twenty-six tests proving RelationalCaseStore assembles a case whole in one transaction, refuses a
second write to an already-stored slug and version through a real primary-key violation, lists
every version ever written, and — directly against this task's own UNDERDETERMINED note — leaves
nothing behind when a write fails partway through, whichever statement it fails at.

## Notes

No divergence from the project's own standard was required, and nothing in the implementation was
contested.
