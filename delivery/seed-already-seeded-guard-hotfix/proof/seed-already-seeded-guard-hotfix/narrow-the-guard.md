---
title: Proof for task/seed-already-seeded-guard-hotfix/narrow-the-guard
summary: Holds seed.spec.ts's own existing tests, plus one new assertion added to that same file, up to
  the task's four criteria — reseeding concept_accepts/capabilities regardless of case state, preserving
  the fully-seeded and freshly-empty paths, and guarding only the case write against a second run.
implementation: sha256:2110662fc881bb09e286d9ae0bf008e51320d0b04a227a04fc834a8665fc152c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-already-seeded-guard-hotfix-narrow-the-guard-suite
tests:
- file: src/__tests__/integration/seed.spec.ts
  name: holds every concept the curated case collects, each with the subject types it accepts and its
    ttl, matching the fixture exactly
  proves: criterion 1 (the concept_accepts half)
  fails_when: seedConcepts stops running unconditionally, so a concept_accepts row this file's own beforeAll
    wipe removed is not written back, or is written with the wrong subject types.
- file: src/__tests__/integration/seed.spec.ts
  name: registers one read-only capability, with every attribute the fixture declares, for each of the
    two concepts the curated case collects
  proves: criterion 1 (the capabilities half)
  fails_when: seedCapabilities stops running unconditionally, so a capability row this file's own wipe
    removed is not re-registered, or is registered with the wrong attributes.
- file: src/__tests__/integration/seed.spec.ts
  name: resolves without rejecting when seed.ts is run a second time against a database it has already
    seeded
  proves: criterion 2 (the does-not-throw half) and criterion 4 (the does-not-throw half)
  fails_when: the second run's own alreadySeeded() gate stops preventing seedCase from running again,
    and the write-once rule or a uniqueness violation rejects the import instead of resolving.
- file: src/__tests__/integration/seed.spec.ts
  name: holds no second case version, having run seed.ts a second time in a row against the version it
    already released
  proves: criterion 4 (the re-draft/re-release half, which 'resolves without rejecting' alone cannot show)
  fails_when: alreadySeeded()'s own narrowed gate stops wrapping seedCase, or createDraft is called a
    second time for this slug regardless.
- file: src/__tests__/integration/seed.spec.ts
  name: holds both non-conclusion outcomes, having run against a database this file had itself confirmed
    lacked them beforehand
  proves: criterion 3 (the outcome-vocabulary half)
  fails_when: seedOutcomes stops writing the two non-conclusion outcomes against a database that lacked
    them.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
    ones together
  proves: criterion 3 (the fixture-owned outcome names half)
  fails_when: seedOutcomes writes anything other than exactly the fixture's own outcome names plus the
    two non-conclusion ones.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-type name, the one the curated case declares as its subject
  proves: criterion 3 (the subject-type vocabulary half)
  fails_when: seedRemainingVocabularies stops writing the fixture's subject-type name.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-attribute name, even though the curated case document
    names no subject attribute of its own
  proves: criterion 3 (the subject-attribute vocabulary half)
  fails_when: seedRemainingVocabularies stops writing the fixture's subject-attribute name.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
    declare
  proves: criterion 3 (the action vocabulary half)
  fails_when: seedRemainingVocabularies stops writing the fixture's action names.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and fallback
    declare
  proves: criterion 3 (the recipient vocabulary half)
  fails_when: seedRemainingVocabularies stops writing the fixture's recipient names.
- file: src/__tests__/integration/seed.spec.ts
  name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it
    beforehand
  proves: criterion 3 (the originate-and-release half)
  fails_when: seedCase stops running against a database genuinely lacking the case, or createDraft/release
    fails partway.
- file: src/__tests__/integration/seed.spec.ts
  name: reads the seeded version back whole, matching every field the fixture document itself declares
    — not only the case's root and its hypotheses' names
  proves: criterion 3 (that what was originated is coherent and complete, not merely present)
  fails_when: the freshly-seeded case reads back with any field diverging from the fixture document.
not_applicable:
- edge_case: concept_accepts absent while capabilities are present, or vice versa
  why: seedConcepts and seedCapabilities are two independent, unconditional, per-table calls with no branch
    or shared state between them; the both-absent case already exercises the identical code path a mixed-absence
    case would.
- edge_case: two seed.ts processes running concurrently against the same database
  why: no criterion of this task addresses concurrent invocation, and the change this task makes does
    not alter whatever concurrency behavior seed.ts already had or lacked before it.
- edge_case: the database connection failing or answering slowly during a run
  why: unchanged by this task.
- edge_case: absent or malformed input to seed.ts itself
  why: seed.ts takes no external input — only its own committed fixture files and the database.
untested:
- Criterion 1's own precondition — that the case already stood released, specifically, at the moment concept_accepts
  and capabilities were reseeded — is not constructed independently by this file on its own; only the
  full 89-file suite run plausibly constructs this exact precondition, contingent on vitest's file execution
  order placing a case-releasing sibling before seed.spec.ts.
- Criterion 1's 'before verifySeededCase runs' ordering claim is not provable by any behavioral test here
  — a variant that reseeded lazily inside verifySeededCase's own read would reach the identical observable
  end state.
- Whether the delivered implementation genuinely issues no write when a database already holds everything
  (criterion 2's literal claim) is not tested at the SQL level — see contested below.
contested:
- what: 'Criterion 2 states that a fully-seeded database sees ''no write occurs.'' The delivered seed.ts
    no longer satisfies this literally: seedOutcomes and seedRemainingVocabularies now issue an INSERT
    (through insertMissingTerms) on every run regardless of whether anything is missing, and seedCapabilities''
    own registerCapability replaces its record on every run rather than skipping when nothing changed.'
  why: 'I have not changed the implementation, and the test suite still proves the criterion at the level
    this role tests behavior — the second run resolves without rejecting and the observable end state
    is unchanged. But ''no write occurs'' read literally is not something a black-box test can assert
    without binding to which internal SQL statement executed. I record the disagreement rather than resolve
    it: either the criterion''s wording is looser than it reads, or the implementation departs from it
    in a way no observable test catches.'
---

## What it is

Twelve of seed.spec.ts's own tests (eleven pre-existing, one newly added) proving this task's four criteria — no new test file was needed, since this script's own behavior is already exercised end-to-end by that file's existing, now-passing suite.

## Notes

A genuine disagreement is recorded under `contested` rather than resolved: criterion 2's literal wording ("no write occurs") is not what the delivered implementation does at the SQL-statement level, even though the observable database state is unchanged. This is disclosed rather than smoothed over, per this framework's own two-producer discipline.
