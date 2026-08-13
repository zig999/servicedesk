---
title: The relational glossary store, answering the five vocabularies and the concepts as held
summary: Adds RelationalGlossaryStore, the database-backed implementation of IGlossaryStore, reading each
  term vocabulary and every concept registration fresh from its own table and replacing a vocabulary's
  whole table content on write.
task: sha256:04c3b81605b2ff84675994b25a355574fa90384b14b9ee2116cb34e93316f393
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-glossary-store-build-2
files:
- path: src/persistence/relational-glossary-store.repository.ts
  effect: 'new module — RelationalGlossaryStore implements IGlossaryStore against the shared database-access.ts/database-connection.ts
    seam. readTerms(vocabulary) runs one live SELECT name over the vocabulary''s own schema-qualified table
    (subject_types, subject_attributes, outcomes, actions or recipients) on every call. writeTerms(vocabulary,
    terms) replaces that table''s whole content inside one transaction: a DELETE, then one INSERT per given
    term. readConcepts() runs, inside one transaction, a SELECT over "concepts" (name, ttl) and a SELECT
    over "concept_accepts" (grouped by concept name, subject types ordered for determinism), and assembles
    the two into the ConceptRegistration shape the port promises. Every driver failure is wrapped into
    GlossaryStoreError, carrying the failure as its cause'
criteria:
- criterion: A term read answers the five vocabularies — subject types, subject attributes, outcomes, actions
    and recipients — as the database holds them at that read.
  met: true
  how: readTerms(vocabulary) looks up the given vocabulary's own table in VOCABULARY_TABLES — a record covering
    exactly the five TermVocabulary values 'subject-type', 'subject-attribute', 'outcome', 'action' and
    'recipient' — and issues a fresh SELECT name against it on every call; nothing is cached between calls
- criterion: A concept read answers each concept with its name, the subject types it accepts and its ttl.
  met: true
  how: readWholeConcepts (called by readConcepts()) SELECTs name and ttl from "concepts" and joins in every
    subject type "concept_accepts" names for that concept, grouped by concept name, into the accepts array
    — the three attributes domain/glossary/concept declares
- criterion: A read answers a term exactly as the glossary currently holds it and adds no term the glossary
    does not hold.
  met: true
  how: readTerms' own SELECT names only the "name" column of the vocabulary's own table and returns those
    rows unchanged, with no filtering, no synthesized entry and no value carried over from an earlier call
    — a vocabulary with no matching row simply answers the empty array
- criterion: A term write stores the term.
  met: true
  how: writeTerms' own per-term INSERT (inside the same unit of work as the table's own DELETE) persists
    every given term's name to the vocabulary's own table; the transaction commits only once every insert
    has run, so a given term is stored whole or the write is rolled back entirely
nodes:
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: reads and writes exclusively through the shared DatabaseConnection/database-access.ts seam — no file
    write, no second store, no vocabulary or concept held anywhere but its own table
- node: constraints/the-stored-schema-mirrors-the-declared-model
  how: honored, not newly encoded — migrations/0002-glossary-vocabulary.sql already gives every declared
    attribute of the five vocabulary elements and of concept its own column; this adapter's reads and writes
    touch exactly those columns and introduce no additional column or domain fact of their own
- node: domain/glossary/concept
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readConcepts() answers exactly this element's three declared attributes — name, accepts (subject
    types) and ttl — assembled fresh from "concepts" and "concept_accepts" on every call
- node: domain/glossary/subject-type
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readTerms('subject-type') answers each subject_types row's own declared "name"; the same table's
    rows also surface as the names concept_accepts joins into each concept's own accepts
- node: domain/glossary/subject-attribute
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readTerms('subject-attribute') answers each subject_attributes row's own declared "name"
- node: domain/glossary/action
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readTerms('action') answers each actions row's own declared "name"
- node: domain/glossary/outcome
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readTerms('outcome') answers each outcomes row's own declared "name", exactly as the table currently
    holds it; seeding the two non-conclusion outcomes into that table is GlossaryService's own, unmodified
    write-back through writeTerms, which this task's own Notes place out of scope
- node: domain/glossary/recipient
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: readTerms('recipient') answers each recipients row's own declared "name"
- node: contracts/glossary/glossary-query
  how: the read-vocabulary-term and read-concept operations this contract publishes are unchanged, implemented
    by GlossaryService.readVocabularyTerm/readConcept (untouched); this store is what a relational deployment
    of that already-published contract now resolves its answer through, since GlossaryService's own terms()/concepts()
    read exclusively via IGlossaryStore
inferences:
- inferred: 'VOCABULARY_TABLES maps each TermVocabulary value to its schema-qualified table name: subject-type
    → public.subject_types, subject-attribute → public.subject_attributes, outcome → public.outcomes, action
    → public.actions, recipient → public.recipients'
  from: migrations/0002-glossary-vocabulary.sql's own header comment, which pairs each of these five specification
    nodes with the exact table it created for it
- inferred: readConcepts() runs its two SELECTs (against "concepts" and against "concept_accepts") inside
    one runInTransaction unit of work rather than as two independent statements
  from: no criterion of this task states an atomicity requirement for the concept read by name, but the
    shape is assembled from two tables the same way RelationalCaseStore's own readWholeVersion assembles
    a case from case_versions, hypotheses and hypothesis_collects inside one transaction, and
    database-access.ts's own runInTransaction is documented as built generic over a read exactly so a multi-table
    read can use it
- inferred: writeTerms replaces a vocabulary's whole table content (DELETE, then one INSERT per given term)
    rather than diffing against what is already stored
  from: the port's own doc comment on writeTerms — "Replaces one term vocabulary's persisted records, whole"
    — and RelationalCapabilityStore's own identical whole-replace precedent for writeCapabilities
- inferred: GlossaryStoreError is reused unmodified for this adapter's own read and write failures, rather
    than a new error class or a subtype naming a relational-specific failure
  from: the inventory's own must_not_duplicate entry naming src/src/errors/glossary-store.error.ts directly,
    and CapabilityStoreError/CaseStoreError's own identical reuse (with no edit to either error file) already
    established by the two prior relational stores of this initiative
- inferred: concept_accepts rows are grouped by concept name and each group's subject types are read back
    ordered by subject type name, for a deterministic accepts array
  from: RelationalCaseStore's own identical ORDER BY convention for hypothesis_collects, since concept.accepts,
    like hypothesis.collects, is a many-valued relationship with no ordinal column of its own
preserved:
- persistence/file-glossary-store.repository.ts and its own proof keep behaving exactly as before — untouched;
  the production factory still wires FileGlossaryStore, unaffected by this task.
- glossary.service.ts's own assertUniqueNames, its default-ttl application in concepts(), and its own write-back
  of the two non-conclusion outcomes through the store port (all unmodified) keep deciding exactly what
  they decided before.
- glossary-store.port.ts and glossary-query.port.ts are implemented, not edited; their existing signatures
  and doc comments are unchanged.
- migrations/0001 through 0007 are untouched; this task adds no schema change.
- no-network-persistence.spec.ts and dependency-manifest.spec.ts keep passing as written, unaffected by
  this task.
deferred:
- what: wiring RelationalGlossaryStore into src/factories/glossary.factory.ts in place of FileGlossaryStore.
  why: no task in this plan names that cutover yet, and this task's own objective is the store's behavior
    against the database, not which store production uses — matching the precedent already set by database-access-helper
    and by the two sibling relational stores
- what: GlossaryService.withNonConclusionOutcomes's own write-back of the two non-conclusion outcomes through
    this store's own writeTerms when a read finds them missing.
  why: this task's own Notes record that no specification node states a read that writes, and that where
    the two non-conclusion outcomes belong is task/case-authoring/curated-data-seeded's own criterion to
    answer, not this task's to decide by writing a criterion around it
- what: seeding the concepts and concept_accepts tables at all — the port declares readConcepts but no
    writeConcepts, so this adapter has no write path of its own for a concept registration.
  why: this task's own ADVISORY note observes that no candidate names an explicit write operation for the
    glossary beyond writeTerms; populating "concepts" is left to task/case-authoring/curated-data-seeded
---

## What it is

The relational adapter behind the glossary's own store port: the five vocabularies each read fresh
from their own table, and every concept read fresh from "concepts" joined with "concept_accepts" —
never a value remembered from an earlier call, and a write replaces a vocabulary's table whole.

## Notes

The port declares readTerms, writeTerms and readConcepts only — no writeConcepts — so this adapter
carries no write path for a concept registration; populating "concepts" and "concept_accepts" is
left to task/case-authoring/curated-data-seeded, matching this task's own ADVISORY note.
GlossaryService's own write-back of the two non-conclusion outcomes (glossary.service.ts) is
untouched, per this task's own Notes: no node states a read that writes, and where those two
outcomes belong is a different task's own criterion.
