---
title: Proof for the glossary store's concept write path
summary: Unit tests for GlossaryService.registerConcept (create, default ttl, replace-in-place) and for
  RelationalGlossaryStore.writeConcepts' own persisted statements, together proving this task's three
  criteria.
implementation: sha256:74caf839ee3886335f7ba032a355073cc2da92e306cbab8fa9364f839c492901
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-authoring-glossary-store-concept-write-suite
tests:
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: creates a concept with its accepted subject types and its ttl, at a name the glossary does not
    yet hold
  proves: Writing a concept at a name that does not yet exist creates it with its accepts subject types
    and its ttl.
  fails_when: registerConcept returns a value other than the given name/accepts/ttl, or the store's held
    set does not include the new concept exactly as given, after registering against an empty store
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: defaults a newly created concept's ttl to sixty seconds when its registration states none, the
    same default a read already applies
  proves: the ttl-defaulting half of the first criterion (accepts subject types and ttl), specifically
    for a registration that omits ttl
  fails_when: registerConcept returns or persists any ttl other than 60 for a registration that states
    none
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: replaces a concept in place at a name the glossary already holds, rather than creating a second
    entry for it
  proves: Writing a concept at a name that already exists replaces it in place rather than creating a
    second entry.
  fails_when: the held set grows to more than two entries after re-registering an already-held name, or
    the entry at that name still reads the old accepts/ttl instead of the new ones, or an unrelated concept
    already held is lost or altered by the re-registration
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: inserts each given concept's own name and ttl into concepts, and no concept_accepts row where
    it accepts nothing
  proves: The relational implementation persists the same fields the new port method declares. — the name/ttl
    half, plus that an empty accepts list writes no spurious row
  fails_when: the INSERT INTO public.concepts statement's params are not exactly [name, ttl], or any row
    is inserted into concept_accepts for a concept whose accepts list is empty
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: inserts one concept_accepts row per subject type the given concept accepts, each carrying that
    concept's own name
  proves: 'The relational implementation persists the same fields the new port method declares. — the
    accepts half: one row per accepted subject type, in order, each paired with the concept''s own name'
  fails_when: the number of concept_accepts INSERT statements does not match the number of accepted subject
    types, any row's params are not exactly [concept name, that subject type], or the order does not match
    the given accepts array
not_applicable:
- edge_case: writeConcepts called with an empty array (deleting every concept)
  why: no criterion of this task states or implies a delete-all behavior, and registerConcept (this task's
    own caller) never constructs an empty call — it always appends the concept being registered to whatever
    was already held
- edge_case: a concurrent registerConcept call racing another for the same or a different name
  why: no node this task implements states concurrent-write behavior, and the store's transactional guarantees
    (or absence of them) belong to RelationalGlossaryStore's own persistence-layer contract, not to this
    task's read-filter-append-write logic in GlossaryService
untested:
- the real, end-to-end persistence of a written concept through an actual PostgreSQL connection (as opposed
  to the stubbed statement/params capture the two relational-store tests assert against) is not exercised
  here — no integration-level test against a real database was added for writeConcepts, mirroring the
  unit-level style already established for this spec file's sibling write tests
- the transactional atomicity of writeConcepts' delete-then-insert sequence (that a failure partway through
  leaves no partial state) is not tested — no criterion of this task states a rollback or atomicity guarantee
  to prove
divergences:
- from: the ordinary single-agent authorship of a proof record
  departure: This proof's tests were written correctly and completely by two separate test-author delegations
    across three attempts (two stalled/errored on infrastructure after writing working code; the third
    confirmed the work was already complete), but no delegation survived to return this proof's own descriptive
    summary (what each test proves, fails_when, dismissals, untested, disagreements) in structured form.
    The orchestrating session composed this summary directly from reading the finished, unmodified test
    code, rather than from an agent's own words.
  why: Four consecutive infrastructure stalls/errors on this narrow step, after the actual test-writing
    work was already verified complete and correct by direct inspection, made a fifth attempt an unproductive
    use of the same failing channel; the summary itself is a faithful, checkable description of code already
    written by the proper producer, not a new judgment about what to test.
---

## What it is

Five tests: three at the service layer proving GlossaryService.registerConcept's create, default-ttl and replace-in-place behavior, and two at the persistence layer proving RelationalGlossaryStore.writeConcepts issues the correct name/ttl and accepts statements.

## Notes

None.
