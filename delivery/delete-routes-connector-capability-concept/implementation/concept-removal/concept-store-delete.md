---
target: backend
title: Concept removal in the relational glossary store
summary: Adds deleteConcept(name) to IGlossaryStore and its relational implementation, removing a concept's
  concept_accepts rows and its concepts row in one transaction.
task: sha256:0e019074609103dcecadd15996bbc25544f556c729d178fcf99a652933301403
run: run/concept-removal-concept-store-delete-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/glossary/glossary-store.port.ts
  effect: 'Adds deleteConcept(name: string): Promise<void> to IGlossaryStore, alongside the existing readConcepts/writeConcepts,
    keyed by the concept''s one identity, its name.'
- path: src/persistence/relational-glossary-store.repository.ts
  effect: Adds RelationalGlossaryStore.deleteConcept(name), which runs inside runInTransaction and issues
    deleteConceptAcceptsStatement(name) followed by a new deleteConceptStatement(name), children before
    parent, matching the concept_accepts foreign key with no ON DELETE CASCADE.
criteria:
- criterion: The store port declares a removal keyed by the concept name alone, the one identity a concept
    has.
  met: true
  how: 'IGlossaryStore.deleteConcept(name: string) takes only the concept''s name, per concepts_pkey PRIMARY
    KEY (name).'
- criterion: The relational implementation deletes the concept's accepted-subject-type rows and the concept
    row in one transaction, so neither is left behind when the other is gone.
  met: true
  how: Both DELETE statements run inside one runInTransaction call, the same helper deleteManifestEntry/discardDraft
    use, so a failure on either rolls back both.
- criterion: After the removal, a read of the registered concepts does not return that name.
  met: true
  how: deleteConceptStatement(name) issues DELETE FROM concepts WHERE name = $1; readConcepts selects
    from the same table.
- criterion: The subject types the removed concept accepted are still held in their own vocabulary after
    the removal.
  met: true
  how: deleteConceptAcceptsStatement only ever targets concept_accepts; the subject_types table itself
    is never touched by deleteConcept.
- criterion: The store port's existing concept write method keeps its current signature and behaviour,
    the removal being a method of its own rather than a new meaning for the write.
  met: true
  how: writeConcepts is untouched; deleteConcept is a new, separate method on both the port and the implementation.
nodes:
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
  how: The store now offers the removal path the rule presupposes and mechanically honors the rule's accepts/subject-type
    clause; the reference-guard clause is out of scope here and belongs to the consuming operation task.
- node: domain/glossary/concept
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: deleteConcept removes exactly the concept row keyed by its name attribute and its accepts declaration,
    leaving ttl and description to go with the row they describe.
- node: domain/glossary/subject-type
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: deleteConcept never issues a statement against subject_types, so a subject type named in the removed
    concept's accepts list is left standing.
- node: constraints/the-system-persists-to-one-relational-database
  how: The new delete path adds no second store, no file write and no second connection.
- node: constraints/the-domain-depends-on-no-infrastructure
  how: The new method is declared on IGlossaryStore, a domain-module port, and implemented only in the
    persistence file.
inferences:
- inferred: Inside the transaction, concept_accepts rows are deleted before the concepts row (children
    before parent).
  from: migrations/0002-glossary-vocabulary.sql declares concept_accepts.concept_name REFERENCES concepts(name)
    with no ON DELETE CASCADE, so deleting the concepts row first would raise a foreign-key violation
    while concept_accepts rows still exist.
- inferred: deleteConcept raises no not-found or reference-in-use refusal itself — it issues the two DELETE
    statements unconditionally.
  from: The task's own Notes mark the rule's reference guard as belonging to the consuming remove-concept
    operation task; the two sibling store-delete tasks already merged establish the same unconditional-DELETE
    shape for this store family.
preserved:
- writeConcepts(concepts) — signature, upsert SQL, and its own delete-then-reinsert of concept_accepts
  for each concept it writes, unchanged.
- readTerms, writeTerms, insertMissingTerms, readConcepts and every other IGlossaryStore method and RelationalGlossaryStore
  behavior — untouched.
- The migrations under src/migrations — no DDL was added or changed; concept_accepts' existing foreign
  key (no cascade) governs the delete order used here.
---

## What it is
The store-layer half of remove-concept: a real SQL DELETE reaching two relations (concept_accepts then concepts) in one transaction, keyed by the concept's name, leaving the subject-type vocabulary and the existing upsert-only write untouched.

## Notes
Existing IGlossaryStore test fixtures do not yet implement deleteConcept; the build step will surface this as a typecheck failure until the test-author's pass fixes them, mirroring the sibling connector-configuration-store-delete and capability-store-delete tasks.
The first build attempt (run/concept-removal-concept-store-delete-build) failed typecheck for exactly this reason, fixed by the test-author's proof pass; the second build attempt (run/concept-removal-concept-store-delete-build-2) passed.
