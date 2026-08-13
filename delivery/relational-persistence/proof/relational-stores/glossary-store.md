---
title: Proof for the relational glossary store
summary: Unit tests mocking DatabaseConnection prove RelationalGlossaryStore's own read/write mechanics
  for the five term vocabularies and for concepts, and integration tests against a real database prove
  the same criteria's real effect, including a real primary-key refusal of a duplicate term inside one
  write.
implementation: sha256:80486d30af08e413838716918266c0de9c251bde58331cd791d18c709f449f2e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-glossary-store-suite-4
tests:
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads subject-type from its own table, public.subject_types, never another vocabulary's
  proves: A term read answers the five vocabularies — subject types, subject attributes, outcomes, actions
    and recipients — as the database holds them at that read.
  fails_when: readTerms('subject-type') queries a table other than public.subject_types, or answers something
    other than the rows that table's own SELECT matched
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads subject-attribute from its own table, public.subject_attributes, never another vocabulary's
  proves: A term read answers the five vocabularies as the database holds them at that read.
  fails_when: readTerms('subject-attribute') queries a table other than public.subject_attributes
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads outcome from its own table, public.outcomes, never another vocabulary's
  proves: A term read answers the five vocabularies as the database holds them at that read.
  fails_when: readTerms('outcome') queries a table other than public.outcomes
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads action from its own table, public.actions, never another vocabulary's
  proves: A term read answers the five vocabularies as the database holds them at that read.
  fails_when: readTerms('action') queries a table other than public.actions
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads recipient from its own table, public.recipients, never another vocabulary's
  proves: A term read answers the five vocabularies as the database holds them at that read.
  fails_when: readTerms('recipient') queries a table other than public.recipients
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: answers the second call's own rows, never a value the first call already answered
  proves: A read answers a term exactly as the glossary currently holds it and adds no term the glossary
    does not hold — the no-caching half.
  fails_when: readTerms starts memoizing or caching a prior result instead of issuing a fresh SELECT on
    every call
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: answers the empty vocabulary, adding no term of its own, when the table currently holds no row
  proves: A read answers a term exactly as the glossary currently holds it — the empty-collection edge
    case.
  fails_when: readTerms throws, or answers anything other than [], when the SELECT matches no row
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a term read
    is refused
  proves: a driver rejection during readTerms reaches the caller as GlossaryStoreError carrying the original
    failure as its cause
  fails_when: readTerms lets a driver rejection propagate unwrapped, or drops the original failure instead
    of setting it as the error's cause
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: deletes every existing row and inserts exactly the given terms, in that order, inside one transaction
  proves: A term write stores the term — the whole-replace mechanism.
  fails_when: writeTerms stops deleting before inserting, inserts a wrong param, skips resetting search_path,
    or fails to commit/release
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: issues only the DELETE and still commits, when replacing the whole vocabulary with an empty set
  proves: the empty-collection edge case on the write side of 'A term write stores the term'
  fails_when: writeTerms([]) fails to issue the DELETE, fails to commit, or leaves the connection unreleased
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: sends one INSERT per given term, even where the given list repeats a name, relying on the real
    table to refuse a duplicate rather than deduping it itself
  proves: the task's own Dropped note ('a term already held is not duplicated by a second write of it')
    treated as this adapter's own implementation convention rather than a tested domain fact
  fails_when: writeTerms starts filtering or deduplicating the given terms before inserting them
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when a term write is refused
  proves: a driver rejection during writeTerms reaches the caller as GlossaryStoreError and the transaction
    is rolled back rather than left committed
  fails_when: writeTerms lets a driver rejection propagate unwrapped, drops the cause, or commits instead
    of rolling back on failure
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: answers each concept with its name, the subject types it accepts and its ttl
  proves: A concept read answers each concept with its name, the subject types it accepts and its ttl.
  fails_when: readConcepts stops naming name/ttl from concepts or stops joining in the subject types concept_accepts
    names for that concept
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: groups each concept's own accepts by that concept's name, even where concept_accepts interleaves
    rows across concepts
  proves: A concept read answers each concept with its name, the subject types it accepts and its ttl
    — the grouping mechanism across more than one concept.
  fails_when: readConcepts mixes one concept's accepts into another's, or drops a concept's own accepts
    row
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: answers a concept with an empty accepts array when concept_accepts holds no row for it
  proves: A concept read answers each concept with its name, the subject types it accepts and its ttl
    — the edge case where a concept currently accepts nothing.
  fails_when: readConcepts answers undefined, throws, or omits the concept instead of answering it with
    an empty accepts array
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: answers no concepts, not a rejection, when concepts currently holds no row
  proves: the task's own Dropped note ('a read for a concept the glossary does not hold answers with absence
    as data rather than raising') treated as this adapter's own implementation convention
  fails_when: readConcepts rejects, or answers anything but [], when concepts matches no row
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads concept_accepts ordered by concept name and subject type name, for a deterministic accepts
    array
  proves: 'the implementation''s own recorded inference: concept_accepts rows are grouped by concept name
    and each group''s subject types are read back ordered by subject type name'
  fails_when: the SELECT against concept_accepts stops carrying its own ORDER BY concept_name, subject_type_name
    clause
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: assembles concepts and concept_accepts inside the one transaction it opens, in that order
  proves: 'the implementation''s own recorded inference: readConcepts runs its two SELECTs inside one
    runInTransaction unit of work'
  fails_when: readConcepts stops running both SELECTs through the same opened transaction in that order,
    or fails to commit/release exactly once
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a concept
    read is refused
  proves: a driver rejection during readConcepts reaches the caller as GlossaryStoreError carrying the
    original failure as its cause
  fails_when: readConcepts lets a driver rejection propagate unwrapped, or drops the original failure
    instead of setting it as the error's cause
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers each of the five vocabularies with the rows written for it, and no other vocabulary's
    rows
  proves: A term read answers the five vocabularies as the database holds them at that read — against
    a real database.
  fails_when: a real write/read round trip for any of the five vocabularies loses its own row or answers
    a different vocabulary's row
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers the empty vocabulary when the real table currently holds no row
  proves: the empty-collection edge case, against a real database
  fails_when: readTerms rejects or answers anything other than [] for a genuinely empty real table
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers each concept with its name, the subject types it accepts and its ttl, as the real tables
    hold them
  proves: A concept read answers each concept with its name, the subject types it accepts and its ttl
    — against a real database.
  fails_when: a real readConcepts loses the name, mis-groups the accepts, or loses/corrupts the ttl
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers a concept with an empty accepts array when it currently accepts no subject type
  proves: the real-effect half of the empty-accepts edge case
  fails_when: a concept with no real concept_accepts row answers with anything other than an empty accepts
    array
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers no concepts, not a rejection, when the concepts table currently holds no row
  proves: the real-effect half of the Dropped absence-as-data convention for the concept read
  fails_when: readConcepts rejects, or answers anything but [], against a genuinely empty real concepts
    table
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers exactly what a row inserted directly into the real table holds, adding no term of its
    own
  proves: A read answers a term exactly as the glossary currently holds it — against a real database.
  fails_when: readTerms answers a row that was never actually inserted, or omits/alters the one that was
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: answers a later write's own rows, never a row an earlier write already replaced
  proves: the real-effect half of the no-caching/no-stale-value guarantee
  fails_when: a second write/read round trip answers the first write's content instead of the second's
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: persists a term write so a read against the real table, outside the store, finds it
  proves: A term write stores the term — against a real database, verified independently of the store's
    own read path.
  fails_when: a written term is not found by a plain SELECT against the real table afterward
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: leaves a vocabulary's earlier content untouched, when a later insert inside one replace violates
    a real constraint
  proves: 'the real-effect half of the task''s own Dropped note on term uniqueness, treated as this adapter''s
    own implementation convention: the whole-replace transaction rolls back together against a real primary-key
    violation.'
  fails_when: a failed replace leaves the vocabulary table empty, partially replaced, or otherwise different
    from what it held before the failed call
not_applicable:
- edge_case: two writeTerms() calls racing each other against the same vocabulary
  why: no bound node or criterion states any guarantee about concurrent writers to this store
- edge_case: a slow or unavailable database dependency
  why: exercised generically by the driver-failure-wrapping tests; no criterion distinguishes a slow failure
    from any other driver rejection
- edge_case: a numeric boundary on a concept's ttl
  why: no criterion or bound node states a range for ttl; the store passes the stored column value through
    unchanged, which the general concept-read tests already exercise
- edge_case: an absent or empty-string term name passed to writeTerms
  why: it is passed through to the parameterized INSERT the same way any other value is, and no criterion
    states a shape constraint on a term's name beyond persisting it
- edge_case: an operation attempted against state that forbids it
  why: writeTerms and readTerms/readConcepts carry no precondition of their own about permissible state;
    every call is a bare whole-replace or a bare read
untested:
- duplicate-term-write refusal as a domain fact across all five vocabularies, and absence-as-data for
  an unmatched concept read as a domain fact, are the task's own two explicitly Dropped behaviors; this
  proof asserts each only as this adapter's own implementation convention, never as a requirement any
  specification node states.
- no test exercises RelationalGlossaryStore wired into src/factories/glossary.factory.ts, since that cutover
  is itself deferred by the implementation record to a later task; the production factory still wires
  FileGlossaryStore.
- GlossaryService's own write-back of the two non-conclusion outcomes through writeTerms is untouched
  by this task and untested here, per the task's own Notes.
- the port declares no writeConcepts, so there is no write path for a concept registration to test; readConcepts
  is proven only against rows this proof inserts directly through pool.query, never through a store-owned
  write.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is configured too, which this file has
    no use for — the same departure every sibling integration proof in this initiative already discloses.
- from: the boundary that a task's own proof touches only its own task's test files
  departure: 'This task''s own five-vocabulary round-trip integration test exceeded vitest''s 5000ms
    default per-test timeout under real Neon network latency (ten sequential statements, no fault
    being provoked); fixed here first with an explicit 15000ms third argument to that one test, then,
    once the same class of timeout independently hit an already-delivered sibling
    (relational-case-store.repository.spec.ts''s own whole-case read, under the same real network
    conditions), by raising vitest.config.ts''s own suite-wide testTimeout to 20000ms instead of
    patching every slow integration test one flake at a time.'
  why: This initiative is still open, the second break is a direct and legitimate consequence of the
    same real-network-latency condition this task's own fix first responded to, and folding the
    durable, suite-wide fix into this delivery keeps one coherent change answering for what it caused,
    following the same pattern already used repeatedly in this initiative.
---

## What it is

Twenty-eight tests proving RelationalGlossaryStore reads each of the five vocabularies and every
concept fresh from its own table, and that a write replaces a vocabulary's whole content inside
one transaction, rolling back together against a real constraint violation.

## Notes

Duplicate-term-write refusal and absence-as-data for an unmatched concept read are the task's own
two Dropped behaviors; proven here only as this adapter's own implementation convention (a real
primary key, and an empty-array default), never asserted as a domain fact any specification node
states — matching the same treatment already established for database-access-helper and
capability-store.
