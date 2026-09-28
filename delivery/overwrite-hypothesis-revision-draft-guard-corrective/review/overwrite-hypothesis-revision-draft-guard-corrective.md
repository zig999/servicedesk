---
target: backend
title: overwrite-hypothesis-revision-draft-guard-corrective review
summary: 'Reviews task/overwrite-revision-draft-guard/overwrite-revision-refuses-without-a-draft over
  the two files its delivery touched: persistence/relational-case-store.repository.ts and its integration
  spec.'
tasks:
- task/overwrite-revision-draft-guard/overwrite-revision-refuses-without-a-draft
reviewed:
- src/persistence/relational-case-store.repository.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: run/overwrite-hypothesis-revision-draft-guard-corrective passed; there was no failure to read
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/overwrite-hypothesis-revision-draft-guard-corrective
reconciliation: siegard-reconcile/overwrite-hypothesis-revision-draft-guard-corrective.md
coverage:
- criterion: Overwriting a hypothesis-revision through the case store, for a case that currently holds
    no draft version, is refused with CaseHoldsNoDraftError whose message names the case slug and whose
    details carry that slug and nothing else.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses overwriteHypothesisRevision through CaseHoldsNoDraftError whose message names the slug
      and whose details carry that slug and nothing else, leaving the revision's stored criterion, collects
      and resolution unchanged, when the case currently holds no draft version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released through CaseHoldsNoDraftError,
      never through ReleasedHypothesisRevisionNotAlterableError alone or alongside it, when the case currently
      holds no draft version
- criterion: A refused overwrite (per the criterion above) leaves the hypothesis-revision's stored criterion,
    collects and resolution unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses overwriteHypothesisRevision through CaseHoldsNoDraftError whose message names the slug
      and whose details carry that slug and nothing else, leaving the revision's stored criterion, collects
      and resolution unchanged, when the case currently holds no draft version
- criterion: Overwriting a hypothesis-revision through the case store, for a case that currently holds
    a draft version, replaces that revision's stored criterion, collects and resolution with the newly
    submitted values, in place, without changing the revision number.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: overwrites a revision's content while leaving its own revision number exactly as it was before
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the replacement's own criterion and resolution, once that revision is read back after
      the overwrite
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers exactly the concepts the replacement carried, once that revision's collects are read
      back after the overwrite
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers none of the concepts the revision collected before the replacement, once the replacement
      drops them all
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and
      no fewer
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite
      assigns no revision number the hypothesis had already assigned elsewhere
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: performs the overwrite through the IHypothesisRevisionOverwrite port alone, without needing
      the rest of ICaseStore
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft,
      even though a released case version's manifest still references that revision, so long as the case
      currently holds a draft version of its own — isolating the manifest reference from the case-holds-a-draft
      precondition
- criterion: Overwriting a hypothesis-revision that is in released state, for a case that currently holds
    no draft version, is refused with CaseHoldsNoDraftError and never with ReleasedHypothesisRevisionNotAlterableError,
    whether alone or alongside it.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released through CaseHoldsNoDraftError,
      never through ReleasedHypothesisRevisionNotAlterableError alone or alongside it, when the case currently
      holds no draft version
  why: 'The "alongside" half is only partly exercised: the context assertion uses toMatchObject({ slug
    }), which allows extra keys, so a CaseHoldsNoDraftError that also carried a ReleasedHypothesisRevisionNotAlterableError
    as its cause or inside its context would still pass. The exact-context check (toEqual) exists only
    in the sibling test over a draft-state revision, where the release check could never fire.'
unpaired:
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version — removing it together with every hypothesis, every
      hypothesis-revision (draft and released) and every collect those revisions held — and refuses deleting
      a case holding a draft or a released version through CaseHoldsVersionsError naming that slug, leaving
      it and everything it holds untouched
  asserts: delete() behavior over the case aggregate — unrelated to overwriteRevision's draft guard.
findings:
- pass: conformance
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  where: 'the it block ''answers none of the concepts the revision collected before the replacement, once
    the replacement drops them all'' (and the same collects: [] pattern recurring throughout this file)'
  evidence: 'await store.overwriteHypothesisRevision({ ..., collects: [], ... }); ... expect(page.data[0]?.collects).toEqual([]);'
  cost: A reader trusting this passing suite would conclude RelationalCaseStore lets a hypothesis-revision
    stand with zero collected concepts, both freshly inserted and after an overwrite that strips every
    concept away, with no rejection anywhere in the file and no import of HypothesisRevisionCollectsNoConceptError
    at all — contradicting rules/knowledge/a-hypothesis-collects-at-least-one-concept.
  correction: 'Either assert that insertHypothesisRevision/overwriteHypothesisRevision refuse an empty
    collects list with HypothesisRevisionCollectsNoConceptError (HTTP 422), or stop using collects: []
    as an accepted fixture value across this suite.'
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: resolveSourceVersion and manifestCopyStatement, used by createDraftVersion
  evidence: if (input.source_version !== undefined) { return input.source_version; } ... INSERT INTO case_version_hypotheses
    (...) SELECT ... FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = $3
  cost: 'A create-draft naming a source_version this case never held is never refused: the copy statement''s
    SELECT simply matches no row, so the new draft is created anyway with an empty manifest, reading exactly
    like a case''s legitimate first-ever draft — an unstated gap against rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version.'
  correction: resolveSourceVersion (or createDraftVersion) would need to confirm input.source_version
    names a version this same case actually holds before creating the draft, refusing by name when it
    does not.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: line 125 — the class constructor
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: DatabaseConnection is a type alias for pg's own Pool class, so the class's own boundary is pinned
    to the concrete driver rather than to the IQueryable/IConnectableQueryable interfaces this same file
    already defines and passes to every helper. No test of its branching logic can run below the level
    of a live Postgres instance.
  correction: declare the constructor parameter as IConnectableQueryable instead of DatabaseConnection/Pool.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: requireCaseHoldsDraft and its siblings (refuseUnlessDraft, refuseUnlessDraftAtRelease, refuseIfCaseHoldsVersions)
  cites: ARC-04
  evidence: 'async function requireCaseHoldsDraft(tx: IQueryable, slug: string): Promise<void> { ... throw
    new CaseHoldsNoDraftError(slug); }'
  cost: The repository decides and enforces, on its own, domain lifecycle invariants — nearly every write
    method in this file carries its own precondition check, so a reader auditing what business rules the
    system enforces has to read the repository, not a service, to find most of them. This delivery's own
    new guard follows the same pre-existing shape.
  correction: move each precondition check to the service that calls this repository (in tension with
    EDG-05, since the check and the write it guards currently share one transaction this repository opens).
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: raiseCreateDraftFailure (and its siblings raisePlaceHypothesisFailure, raiseOverwriteFailure)
  cites: COR-03
  evidence: 'return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));'
  cost: The repository itself interprets a unique-constraint failure as a business rule and raises a business
    error directly, instead of raising a data error for a service to translate.
  correction: have the repository raise a plain data error for the constraint violation and let the calling
    service map it to the business error (in tension with EDG-03).
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: consolidationRegisterOf / isConsolidationRegister
  cites: MNT-03
  evidence: 'function isConsolidationRegister(value: string): value is ConsolidationRegister { return
    CONSOLIDATION_REGISTER_VALUES.has(value); }'
  cost: src/persistence/relational-investigation-store.repository.ts already validates the same ConsolidationRegister
    enum the same way in its own pair; this file reimplements the block rather than calling it.
  correction: factor the enum-membership check and typed-error raise into one exported helper, parameterized
    by the value set, the table and the column, and have both repositories call it.
- pass: standard
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  where: whole file — no it(...) block calls store.findDraftVersion or store.isConceptCollectedByHypothesisRevision
  cites: TST-05
  evidence: 'public async isConceptCollectedByHypothesisRevision(concept: string): Promise<boolean> {
    ... }'
  cost: Two public ICaseStore methods are never exercised against the real database by this suite; isConceptCollectedByHypothesisRevision
    backs a real caller whose correctness this file cannot vouch for.
  correction: add an integration test calling store.findDraftVersion (with and without a draft) and one
    calling store.isConceptCollectedByHypothesisRevision (a collected and an uncollected concept).
- pass: standard
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  where: lines 20-26 — requireDatabaseUrl
  cites: STK-08
  evidence: 'function requireDatabaseUrl(): string { const url = process.env.DATABASE_URL; if (!url) {
    throw new Error(...); } return url; }'
  cost: The one place in this file that reads the environment does so through a hand-written guard and
    raises a bare Error, rather than a Zod schema.
  correction: parse process.env.DATABASE_URL through a Zod schema instead of the hand-written guard.
---

## What it is

The review of this corrective increment's one task, over the two files its delivery touched.

## Notes

The failures pass did not run: the review's own captured run (run/overwrite-hypothesis-revision-draft-guard-corrective)
passed clean across install, typecheck, lint, secret-scan, test-unit and test, so there was no
failure to diagnose.

The conformance pass's `unstated` finding on `resolveSourceVersion` (a create-draft naming a
`source_version` the case never held is silently accepted rather than refused) is pre-existing
behavior this delivery did not touch or introduce; it surfaced because the trace's node set for
this file includes `rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version`,
which the delivery's task does not implement.

The conformance pass's `contradicts` finding on the spec file (`collects: []` accepted as a
persisted value, contradicting `rules/knowledge/a-hypothesis-collects-at-least-one-concept`) is
also pre-existing — the pattern recurs across dozens of tests this delivery did not write,
including the two it did write, which follow the same file-wide convention rather than
introducing it.

All six standard findings are pre-existing conventions of this file (the `Pool`-typed
constructor, precondition checks living in the repository, business errors raised from caught
constraints, a duplicated enum-validation helper, two untested port methods, and a hand-written
environment guard); none was introduced or worsened by this delivery, whose own new
`requireCaseHoldsDraft` call follows the same already-established shape as its siblings.

The certification pass returned `partial` for
`rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft`: the store-level guard this
task added is fully exercised, but the concept-acceptance-check and HTTP-409-mapping clauses of
that same node are not, because they belong to the revise-hypothesis route/service layer per this
task's own REMAINDER notes and are not implemented by either file under this review. The
auditor named the remainder `testable` with two concrete assertions that would close it, over
files this task does not own.
