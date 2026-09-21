---
target: backend
title: Proof for the glossary store's transactional, name-keyed concept delete
summary: New tests over IGlossaryStore.deleteConcept and RelationalGlossaryStore cover the declared port
  shape, the two-statement children-before-parent transaction, its failure/rollback path, and the real-database
  read-exclusion plus subject-type-vocabulary survival after removal; write's own pre-existing suite is
  cited unmodified for the untouched-write criterion; four IGlossaryStore test doubles were widened to
  compile against the new interface member.
implementation: sha256:7f551bb6ef907d5108f88aa2b45955066387c00a17d20ac33f2a45e211a43a7d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/concept-removal-concept-store-delete-suite
tests:
- file: src/__tests__/unit/glossary/glossary-store.port.spec.ts
  name: declares deleteConcept keyed by the concept name alone, returning Promise<void>, alongside the
    existing read and write methods
  proves: 'Criterion: the store port declares a removal keyed by the concept name alone, the one identity
    a concept has.'
  fails_when: IGlossaryStore.deleteConcept is declared with a parameter list other than exactly one string
    or with a return type other than Promise<void>.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: deletes a concept's own concept_accepts rows before its concepts row, both parameterized to the
    given name alone, inside one BEGIN/COMMIT transaction with no guard query ahead of them
  proves: 'Criterion: the relational implementation deletes the concept''s accepted-subject-type rows
    and the concept row in one transaction, so neither is left behind when the other is gone.'
  fails_when: deleteConcept fails to wrap both DELETEs in BEGIN/COMMIT, deletes concepts before concept_accepts,
    sends a different statement, table or column, fails to parameterize the given name, or issues any
    additional statement before or between the two DELETEs.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back
    leaving nothing committed, when a concept delete is refused
  proves: The transaction guarantee criterion 2 requires for the delete's own failure path, wired the
    same way write's own failure path is already tested.
  fails_when: a driver failure during either DELETE propagates untyped, is not wrapped as GlossaryStoreError,
    fails to issue ROLLBACK, or leaves the client unreleased.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: removes the named concept and its own accepts declaration so a subsequent read no longer returns
    it, leaving a different concept and the subject types either concept accepted exactly as they were
  proves: 'Criterion: after the removal, a read of the registered concepts does not return that name;
    Criterion: the subject types the removed concept accepted are still held in their own vocabulary after
    the removal.'
  fails_when: a read taken after deleteConcept still returns the removed concept, the removal also drops
    or alters the unrelated concept's own row or its own accepts, or either subject type the two concepts
    accepted is missing from a subsequent read.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given
    names either — no matter how many concepts are given (pre-existing, unmodified by this task)
  proves: 'Criterion: the store port''s existing concept write method keeps its current signature and
    behaviour, the removal being a method of its own rather than a new meaning for the write.'
  fails_when: writeConcepts starts sending a DELETE against concepts, standing in for deleteConcept instead
    of the removal staying a separate method.
not_applicable:
- edge_case: A removal attempted against a concept a registered capability answers, a collected evidence
    item or its citation names, or a hypothesis-revision's own collects lists (the rule's reference guard)
  why: The task's own Notes mark this clause REMAINDER — belonging to the consuming remove-concept operation
    task; deleteConcept here is unconditional by design. The database's own foreign key currently rejects
    such a delete regardless, but asserting that here would test the constraint's mechanics rather than
    an obligation of this task.
- edge_case: An absent or empty-string concept name, or a name nothing is registered under, passed to
    deleteConcept
  why: no criterion or implemented node states validation or an absence-signalling behaviour for this
    store's own parameter; this task's rule states no unconditional-on-absence branch to decide.
- edge_case: Two concurrent deleteConcept calls, or a delete racing a concurrent read or write against
    the same concept name
  why: no criterion or implemented node states an ordering or isolation guarantee beyond the existing
    per-call transaction.
- edge_case: Deleting the only registered concept, leaving an empty result set
  why: readConcepts carries no branch that special-cases an empty result; a pre-existing test already
    exercises the same unconditional SELECT/row-mapping path.
- edge_case: A concept that currently accepts no subject type
  why: deleteConcept issues the same deleteConceptAcceptsStatement unconditionally regardless of how many
    concept_accepts rows exist; a DELETE matching zero rows is standard SQL and not a branch this implementation
    adds.
untested:
- rules/glossary/a-registered-concept-is-never-removed's fact spans both the reference-guard branches
  and the accepts/subject-type clause. The task's own Notes mark the guard REMAINDER — out of this store-only
  task's scope — so no test here decides those branches; only the accepts/subject-type clause is exercised,
  and asserting that clause alone would approximate the rule's whole fact as if it were the whole.
- domain/glossary/concept's fact spans collection/evidence/citation-facing responsibilities and the ttl
  and subject-type constraints across the whole system; this task's deleteConcept touches only how an
  existing row is removed by name, too narrow to decide the node's fact whole.
- domain/glossary/subject-type's fact concerns the vocabulary's own registration and growth; this task's
  tests show only that deleteConcept never issues a statement against subject_types, necessary but not
  sufficient to decide the node's own fact.
- 'constraints/the-system-persists-to-one-relational-database is scope: system, decided by the project''s
  standard through its whole test suite step across every store; this task''s own tests show only this
  one store''s compliance.'
- 'constraints/the-domain-depends-on-no-infrastructure is scope: system, decided by the lint step per
  the project''s own standard, not by a test in this suite.'
---

## What it is
The tests proving concept-store-delete: the two-statement children-before-parent transaction, its failure/rollback path, concept-name-keyed removal, read-exclusion after removal, and subject-type-vocabulary survival. Also repairs four IGlossaryStore test doubles that no longer compiled.

## Notes
run/concept-removal-concept-store-delete-build failed typecheck, cause: code — the MinimalGlossaryStore test fixture (and three sibling IGlossaryStore doubles found while fixing it) did not implement the widened interface. run/concept-removal-concept-store-delete-build-2, run after this proof's fixture repairs, passed, as did the full suite.
