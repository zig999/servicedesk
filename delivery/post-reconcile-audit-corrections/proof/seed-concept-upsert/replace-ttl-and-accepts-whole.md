---
target: backend
title: Re-seeding replaces a concept's ttl, accepts and description whole, through seedConcepts' delegation
  to IGlossaryStore.writeConcepts
summary: Rewrites seed.spec.ts's stale, now-false raw-SQL assertion into a genuine behavioral test of
  description replacement through IGlossaryStore.writeConcepts, and shows criteria 1-3 and the three UNDERDETERMINED
  entries are already decided, whole where a finite test can decide them, by the pre-existing RelationalGlossaryStore.writeConcepts
  test suite that seed.ts's rearrangement now reuses rather than duplicates.
implementation: sha256:7d852667e17dacb21e5621d7ab3cdb01221badb7fc227b7ada04bc4f3329254a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/seed-concept-upsert-replace-ttl-and-accepts-whole-suite
tests:
- file: src/__tests__/unit/seed.spec.ts
  name: replaces a concept's held description with the fixture's own value in the same upsert that replaces
    its ttl, writing through IGlossaryStore.writeConcepts -- the write path seedConcepts now delegates
    the whole fixture to, instead of seed.ts's own removed hand-rolled INSERT
  proves: UNDERDETERMINED entry 3 -- the rule says registering "replaces the concept already held at that
    name" whole, and domain/glossary/concept declares description as a required attribute alongside ttl
    and accepts; no criterion holds description to the fixture on re-seed.
  fails_when: the concepts upsert's ON CONFLICT clause stops setting description = EXCLUDED.description,
    or the description given to writeConcepts is no longer passed as the INSERT's third bound parameter
    -- exactly what "a seedConcepts that replaces ttl and accepts from the fixture but no longer writes
    description on conflict" (the implementation the entry names) would produce.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: updates two already-held concepts in one call — each one's own row permanently referenced by its
    own capability — replacing each one's ttl, description and accepts exactly with the given values,
    without failing and without breaking either capability's own foreign key
  proves: Re-seeding a concept whose ttl differs from the value the store already holds under that name
    leaves the store holding the fixture's ttl.
  fails_when: a re-seeded concept's ttl in the store no longer equals the value the write call gave it
    -- it stays at the value held before, or ends up merged with it, rather than replaced.
  demonstrates: domain/glossary/concept
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching
    a different concept's own rows, even though that other concept is not named anywhere in this call
    and shares the very same subject type
  proves: Re-seeding a concept whose fixture no longer names a subject type the store already records
    as accepted leaves the store not accepting that subject type.
  fails_when: the concept's held accepts array still includes a subject type the re-seeding call no longer
    names.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching
    a different concept's own rows, even though that other concept is not named anywhere in this call
    and shares the very same subject type
  proves: Re-seeding a concept whose fixture names a subject type the store does not yet record as accepted
    leaves the store accepting that subject type.
  fails_when: the concept's held accepts array does not include a subject type the re-seeding call newly
    names.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: creates a concept at a brand-new name without failing, and leaves a different, already-held concept
    — permanently referenced by a capability — exactly as it was, even though that referenced concept
    is not named anywhere in this call
  proves: 'UNDERDETERMINED entry 1 -- no criterion covers rules/glossary/a-registered-concept-is-never-removed''s
    "removes no concept already held" clause: nothing requires that a concept the store holds but the
    fixture does not name survives re-seeding.'
  fails_when: a concept not named in the writeConcepts call is missing from what the store holds afterward
    -- exactly what "a seedConcepts that clears the concepts table (or deletes every concept absent from
    the fixture) before inserting each fixture concept" (the implementation the entry names) would produce.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: creates a concept at a brand-new name without failing, and leaves a different, already-held concept
    — permanently referenced by a capability — exactly as it was, even though that referenced concept
    is not named anywhere in this call
  proves: 'UNDERDETERMINED entry 2 -- no criterion covers the rule''s "adds a concept at a new name" clause:
    nothing requires that seeding a concept at a name the store does not yet hold adds it.'
  fails_when: a concept named at a brand-new name in the writeConcepts call is absent from what the store
    holds afterward -- exactly what "a seedConcepts that only updates and replaces accepts for names already
    present, writing nothing for a new name" (the implementation the entry names) would produce.
not_applicable:
- edge_case: A concept.json fixture holding zero concepts
  why: No criterion states seedConcepts' own behavior for an empty fixture, and writeConcepts' already-tested
    handling of an empty array is not a distinct case any criterion of this task speaks to.
- edge_case: A fixture entry missing a required Concept field (name, accepts, ttl or description)
  why: The Concept type requires all four fields and seedConcepts parses the fixture straight into that
    type; no criterion of this task states a refusal or coercion behavior for malformed fixture data.
- edge_case: One re-seeding call naming the same concept name twice
  why: Already decided, independently of this task, by writeConcepts' own primary-key-resolves-to-one-row
    behavior (proven elsewhere in the pre-existing suite); no criterion here states anything additional
    about a duplicate name within one call.
- edge_case: The store or its connection failing mid-write during seeding
  why: No criterion of this task states a refusal or retry behavior for a store failure during seeding;
    GlossaryStoreError's own raising is the store's own concern and is already covered by its own tests,
    not a stated criterion of this task.
untested:
- rules/glossary/a-registered-concept-is-never-removed's fact spans removal-refusal semantics (ConceptInUseError,
  the reference and details it carries, what a removal does and does not take with it) that this task's
  own REMAINDER note places outside its scope -- seeding performs no explicit removal, and that portion
  belongs to glossary-authoring's remove-concept and the task that implements its refusal. No finite test
  in this task's scope decides the node's fact whole; only its "adds a concept at a new name or replaces
  the concept already held at that name, and removes no concept already held" clause is evidenced here
  (by the criterion tests and the two UNDERDETERMINED-entry tests above), so this node is left here rather
  than claimed as demonstrated by any single test.
---

## What it is

Rewrites the stale raw-SQL-text assertion in seed.spec.ts into a genuine description-replacement test, and shows the task's criteria plus its three UNDERDETERMINED entries are already decided by the pre-existing RelationalGlossaryStore.writeConcepts suite seed.ts now reuses.

## Notes

None.
