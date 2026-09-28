---
target: backend
title: seedConcepts re-seeds through the glossary store's own write path
summary: Replaces seedConcepts' hand-rolled INSERT/ON CONFLICT upsert with a call to IGlossaryStore.writeConcepts,
  so re-seeding a concept already held under a name replaces its ttl and its accepted subject types whole
  instead of only touching description and only adding new accepts.
task: sha256:5b1b1967f3474b83f78ea96555e3b3fccb98a37eda5fd8b78b038babdb8e79f1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/seed-concept-upsert-replace-ttl-and-accepts-whole-build-2
files:
- path: src/seed.ts
  effect: seedConcepts now takes the wired IGlossaryStore instance instead of the raw DatabaseConnection,
    parses concept.json straight into the domain Concept[] type (replacing the redundant local ConceptFixture
    alias), and delegates the whole write to store.writeConcepts(concepts) -- the same call site already
    used by seedOutcomes and seedRemainingVocabularies -- instead of running its own two hand-written
    queries per concept. The main script now passes the already-constructed glossary store into seedConcepts
    instead of the bare connection.
criteria:
- criterion: Re-seeding a concept whose ttl differs from the value the store already holds under that
    name leaves the store holding the fixture's ttl.
  met: true
  how: writeConcepts' upsertConceptStatement (src/persistence/relational-glossary-store.repository.ts)
    runs INSERT ... ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description
    for every concept in the array seed.ts now passes it, so a conflicting name is updated to the fixture's
    own ttl rather than only refreshing description as the removed hand-rolled statement did.
- criterion: Re-seeding a concept whose fixture no longer names a subject type the store already records
    as accepted leaves the store not accepting that subject type.
  met: true
  how: writeConcepts deletes every concept_accepts row for that concept's name (deleteConceptAcceptsStatement)
    before inserting one row per subject type the fixture currently names, so a subject type the fixture
    stopped naming is not re-inserted and no longer stands after the write; the removed hand-rolled loop
    only ever inserted with ON CONFLICT DO NOTHING and never deleted, so a subject type dropped from the
    fixture used to survive.
- criterion: Re-seeding a concept whose fixture names a subject type the store does not yet record as
    accepted leaves the store accepting that subject type.
  met: true
  how: After the accepts wipe, writeConcepts inserts insertConceptAcceptStatement for every subject type
    in concept.accepts, so a newly-named subject type is written; this was already true of the removed
    code for the add-only case and remains true here.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/seed.ts
  - src/persistence/relational-glossary-store.repository.ts
  how: The node's Responsibility states the glossary "replace[s] them whole whenever a concept is registered
    under a name the glossary already holds ... nothing is merged with what stood before." seed.ts's seedConcepts
    now routes every fixture concept through IGlossaryStore.writeConcepts -- the same whole-replace write
    path glossary.service.ts's own registerConcept itself calls -- instead of a second, independent upsert
    that only merged. Since writeConcepts only ever touches the concept names present in the array it
    is given, a concept the store holds under a name the fixture also names is replaced whole (ttl, accepts,
    and, as a consequence of reusing the real write path, description too), while a name the fixture happens
    not to mention is left untouched by this call -- matching the node's "hold them by name" together
    with the removal-refusal rule below, even though the task's own criteria test only the ttl and accepts
    clauses.
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/seed.ts
  how: The rule states registering "replaces the concept already held at that name ... and removes no
    concept already held." Reusing writeConcepts rather than a bespoke seed-only upsert means seeding
    takes the same code path glossary-authoring's register-concept takes for a single concept, so seed.ts
    cannot drift from that guarantee a second time. The rule's removal-refusal clauses (ConceptInUseError
    and its reference/details) are not reached by this task, exactly as the task's own REMAINDER note
    records -- seeding performs no explicit removal, only writes.
inferences:
- inferred: seedConcepts should call IGlossaryStore.writeConcepts with the whole fixture array in one
    call, rather than looping and calling it once per concept.
  from: writeConcepts already accepts readonly Concept[] and, read in src/persistence/relational-glossary-store.repository.ts,
    iterates internally inside one transaction; calling it once with the full array is how glossary.service.ts's
    own registerConcept already uses it (with [...kept, concept]), and it is what "the glossary store's
    own write path" in the task's title names.
- inferred: Replaced the file's own ConceptFixture type alias with the imported domain Concept type instead
    of keeping a fixture-local shape.
  from: 'ConceptFixture''s four fields (name, accepts: readonly string[], ttl: number, description: string)
    were already structurally identical to Concept in src/glossary/terms.ts, and the rest of seed.ts already
    reuses domain term types directly for fixture parsing (GlossaryTerm for outcome/subject-type/action/recipient)
    rather than declaring a parallel fixture type per vocabulary -- MNT-03 in the project''s standard
    also names reusing what already exists over a parallel declaration.'
- inferred: Passed the already-constructed glossary RelationalGlossaryStore instance into seedConcepts
    instead of having it construct or receive a second one.
  from: 'seedOutcomes and seedRemainingVocabularies, immediately above, already take store: IGlossaryStore
    and are called with the same glossary variable in the script''s own body; seedConcepts now follows
    that established call shape instead of being the one remaining function still taking the raw connection
    for this purpose.'
preserved:
- seedOutcomes, seedRemainingVocabularies, seedCapabilities, seedCase, placeFixtureHypotheses, releaseManifestedRevisions,
  alreadySeeded and verifySeededCase are untouched -- same signatures, same bodies, same call order in
  the script's own try block.
- The script's own idempotency for the case fixture (seedCase only runs when alreadySeeded is false; releaseHypothesisRevision
  is still called through the lifecycle rather than raw SQL) is unchanged, since only seedConcepts and
  its call site were edited.
- seedCapabilities still receives the raw DatabaseConnection, unaffected by seedConcepts' switch to the
  store.
deferred:
- what: src/__tests__/unit/seed.spec.ts still asserts, at "passes each concept's description straight
    through, as the INSERT's third bound parameter, to the concepts table", that seed.ts's own source
    text matches the literal removed pattern INSERT INTO concepts[\s\S]*?\[concept.name, concept.ttl,
    concept.description\]. That hand-rolled statement no longer exists in seed.ts after this fix.
  why: Writing or editing a test is outside this delegation's bound. This is source-only; the stale assertion
    is a proof-side fact for whichever pass next reads or re-delivers that test file, the same way a prior
    task in this same plan needed a proof-only re-delivery for stale fixtures.
---

## What it is

Replaces seed.ts's hand-rolled concept upsert with a call to IGlossaryStore.writeConcepts, so re-seeding a concept already held under a name replaces its ttl and accepted subject types whole, per rules/glossary/a-registered-concept-is-never-removed and domain/glossary/concept.

## Notes

The first build attempt (run/seed-concept-upsert-replace-ttl-and-accepts-whole-build) failed its
test-unit step against the pre-existing test in the deferred entry above, which asserted seed.ts's
own removed source text; cause: code, on a test this delivery's own file made obsolete, not a
defect in the source above. That test was rewritten whole in this task's own proof step, per the
reasoning the suite step's own contract gives for a test whose owning file this delivery rewrote,
and the build run named above (`-build-2`) is the one taken after that rewrite, with no change to
the source between attempts.
