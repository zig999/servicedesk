---
title: Concept persistence carries a description, tolerant of a legacy row
summary: A new additive migration adds a NOT NULL DEFAULT '' description column to
  "concepts", and RelationalGlossaryStore reads and writes it, so a concept row stored
  before this migration reads back with an empty description instead of failing.
task: sha256:f4a530476c6d2303f18a9ad9a982cb064ff2c30c862c2149629dd2eb41ffe194
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-description-concept-persistence-carries-description-build
files:
- path: src/migrations/0012-glossary-concept-description.sql
  effect: 'New additive migration: ALTER TABLE concepts ADD COLUMN description TEXT
    NOT NULL DEFAULT ''''. The DEFAULT backfills every already-stored row and is kept
    permanently so every write path that inserts into concepts without naming description
    keeps working unchanged.'
- path: src/persistence/relational-glossary-store.repository.ts
  effect: 'IConceptRow gains a required description: string field. readWholeConcepts''
    SELECT now names description alongside name and ttl, mapping it into each ConceptRegistration.
    insertConceptStatement''s INSERT now names description as a third column/param,
    sourced from Concept.description.'
criteria:
- criterion: The relational glossary store persists a concept's description and reads
    it back unchanged.
  met: true
  how: writeConcepts' insertConceptStatement writes concept.description into the new
    column, and readConcepts' readWholeConcepts selects it back verbatim into ConceptRegistration.description.
- criterion: A concept row stored before this migration reads back with an honest
    empty description, never a read failure.
  met: true
  how: The migration adds the column NOT NULL DEFAULT '', backfilling every already-stored
    row to the empty string at the schema level; readWholeConcepts' SELECT then reads
    a plain, always-present string with no NULL-to-undefined translation and no path
    that could raise.
- criterion: 'The migration adding the description column is additive: no existing
    row of any other table is altered or removed.'
  met: true
  how: 0012-glossary-concept-description.sql issues exactly one ALTER TABLE ADD COLUMN
    statement against concepts and touches no other table, no DELETE; each pre-existing
    row keeps everything it held and gains only the new column.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/migrations/0012-glossary-concept-description.sql
  - src/persistence/relational-glossary-store.repository.ts
  how: This task answers the description attribute's persistence half — a required
    attribute of the value object, stored and read back through the relational store
    exactly as the sibling registration task already made it required at the domain
    and service layers. The migration's NOT NULL constraint mirrors that required-ness
    at the schema level.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  encoded_at:
  - src/migrations/0012-glossary-concept-description.sql
  - src/persistence/relational-glossary-store.repository.ts
  how: 'This task''s own falsifiable half of that scenario is the persistence side:
    the migration backfills every existing concepts row to '''' rather than leaving
    it NULL or refusing the read, and the store reads that column back as a plain
    string with no failure.'
inferences:
- inferred: The description column is NOT NULL DEFAULT '' rather than nullable with
    the empty-string default resolved only at the service layer.
  from: constraints/the-stored-schema-mirrors-the-declared-model, which pairs a required
    domain attribute with a NOT NULL column (the same pattern every other required
    attribute in migrations/0002 through 0011 already follows), and the existing schema-migrations.spec.ts
    integration proof, which asserts an exact, closed list of nullable columns across
    the whole schema that does not include concepts.description — a nullable column
    would fail that existing, unowned test.
- inferred: The DEFAULT '' is kept permanently on the column rather than dropped after
    a one-time backfill.
  from: migrations/0009-case-version-lifecycle-schema.sql's own case_versions.state
    column, whose comment states its DEFAULT is kept permanently because existing
    write paths insert without naming the column — the same situation holds here for
    vitest-global-setup.ts's repair insert and seed.ts's seedConcepts.
preserved:
- vitest-global-setup.ts's own repair insert and seed.ts's own seedConcepts, each
  writing INSERT INTO concepts (name, ttl) VALUES ... with no description column named.
- RelationalGlossaryStore's readTerms/writeTerms/insertMissingTerms for the five term
  vocabularies, and writeConcepts'/readConcepts' handling of concept_accepts and the
  accepts array.
deferred:
- what: The existing unit and integration spec files for RelationalGlossaryStore assert
    the pre-description SQL text ("SELECT name, ttl FROM concepts") and params, and
    several Concept/ConceptRegistration object literals with no description field
    — these now disagree with the store's new behavior.
  why: Writing or editing tests is the test-author's judgment, not this task's; this
    delivery only states what changed so those existing assertions can be updated
    to match.
---

## What it is
A new additive migration adds a description column to concepts (NOT NULL DEFAULT ''), and RelationalGlossaryStore reads and writes it.
A concept row stored before this migration reads back with an empty description, never a failure.

## Notes
The DEFAULT '' is kept permanently on the column, not dropped after backfill, because pre-existing write paths (vitest-global-setup.ts, seed.ts) insert into concepts naming only (name, ttl) and this task does not rewrite either.
Deferred: pre-existing RelationalGlossaryStore spec files assert the pre-description SQL text and object literals with no description field — belongs to whoever writes this task's proof.
