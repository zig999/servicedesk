---
title: Concept write path on the glossary store
summary: Adds a whole-replace concept write method to IGlossaryStore, its RelationalGlossaryStore implementation,
  and a GlossaryService.registerConcept that authors a concept by name.
task: sha256:8ac3465cf3e97bf7a091e820fc531c549e02836eed32e8765e45b3a8625f5f05
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-authoring-glossary-store-concept-write-build-2
files:
- path: src/glossary/glossary-store.port.ts
  effect: 'IGlossaryStore gains writeConcepts(concepts: readonly Concept[]): Promise<void>, documented
    as replacing the glossary''s persisted concept registrations whole — the same shape writeTerms already
    holds for a term vocabulary and ICapabilityStore.writeCapabilities / IConnectorConfigurationStore.writeConnectorConfigurations
    already hold for their registries. Imports Concept from terms.ts alongside the existing ConceptRegistration
    import.'
- path: src/glossary/glossary.service.ts
  effect: 'GlossaryService gains registerConcept(registration: ConceptRegistration): Promise<Concept>
    (register-concept, contracts/glossary/glossary-authoring): builds the Concept to hold — defaulting
    ttl to DEFAULT_CONCEPT_TTL_SECONDS where the registration states none, the same default this.concepts()
    already applies on read — reads the currently held set through this.concepts(), excludes whatever
    entry already carries the registered name, and writes the whole resulting set back through the store''s
    writeConcepts.'
- path: src/persistence/relational-glossary-store.repository.ts
  effect: 'RelationalGlossaryStore implements writeConcepts: inside one transaction, deletes every row
    of concept_accepts then every row of concepts (that order, since concept_accepts.concept_name references
    concepts.name), then inserts each given concept into concepts (name, ttl) followed by one concept_accepts
    row per subject type it accepts. Adds insertConceptStatement and insertConceptAcceptStatement beside
    the existing insertTermStatement/insertMissingTermStatement, and rewrites the header comment''s stale
    claim that the port declares no write operation for concepts.'
- path: __tests__/unit/glossary/glossary-query.port.spec.ts
  effect: MutableGlossaryStore (a test double implementing IGlossaryStore) gains writeConcepts, replacing
    its own concepts array with the given one — mirrors its existing holdConcepts mutation — so the file
    typechecks against the widened interface.
- path: __tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  effect: ConceptOnlyGlossaryStore (a test double implementing IGlossaryStore) gains a no-op writeConcepts,
    since its concepts field is a readonly constructor parameter nothing reads back — the file typechecks
    against the widened interface.
- path: __tests__/unit/glossary/glossary.service.spec.ts
  effect: InMemoryGlossaryStore (a test double implementing IGlossaryStore) gains a no-op writeConcepts,
    for the same reason — the file typechecks against the widened interface.
criteria:
- criterion: Writing a concept at a name that does not yet exist creates it with its accepts subject types
    and its ttl.
  met: true
  how: GlossaryService.registerConcept builds a Concept from the registration (ttl defaulted where absent),
    finds no candidate sharing that name in the held set read through this.concepts(), and calls store.writeConcepts([...held,
    concept]). RelationalGlossaryStore.writeConcepts then inserts a new concepts row (name, ttl) and one
    concept_accepts row per name in accepts, inside one transaction.
- criterion: Writing a concept at a name that already exists replaces it in place rather than creating
    a second entry.
  met: true
  how: registerConcept filters the held set with candidate.name !== concept.name before appending the
    new concept, so the prior entry for that name never reaches writeConcepts. writeConcepts itself deletes
    every row of concept_accepts and concepts before reinserting the whole given set, so the name's row
    and its accepts rows come back exactly once.
- criterion: The relational implementation persists the same fields the new port method declares.
  met: true
  how: 'writeConcepts(concepts: readonly Concept[]) declares name, accepts and ttl. insertConceptStatement
    persists name and ttl into concepts; insertConceptAcceptStatement persists one concept_accepts row
    per entry of accepts — every field the parameter type declares reaches a column, and none is silently
    dropped or defaulted inside the store.'
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
  how: The concept's declared shape — name, the subject types it accepts (many), and its ttl — is exactly
    what IGlossaryStore.writeConcepts' Concept parameter carries, what GlossaryService.registerConcept
    assembles before writing, and what RelationalGlossaryStore.writeConcepts persists across concepts
    and concept_accepts.
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
  how: 'register-concept''s create-or-replace-in-place semantics are realized end to end by GlossaryService.registerConcept
    down through the new store-port method and its relational implementation. No HTTP surface is added
    here: per this task''s own notes, the route is the sibling task task/concept-authoring/register-concept-route''s
    own scope, and this task stops at the method the route will call.'
inferences:
- inferred: 'The new port method is a whole-replace writeConcepts(concepts: readonly Concept[]), with
    GlossaryService doing the read-filter-append-write dance, rather than a single-row upsert method on
    the store.'
  from: The inventory's must_not_duplicate entries for capability-registry.service.ts's registerCapability
    (replace-by-(name, version) registration) and connector-configuration-registry.service.ts's registerConnector
    (replace-by-connector-identity) name exactly this shape as the established convention to reuse, and
    IGlossaryStore's own existing writeTerms already holds the identical whole-replace shape for a term
    vocabulary.
- inferred: writeConcepts' parameter type is Concept (ttl required), not ConceptRegistration (ttl optional);
    the ttl default is applied in GlossaryService.registerConcept before the store is called, never inside
    the store itself.
  from: migrations/0002-glossary-vocabulary.sql declares concepts.ttl NOT NULL, and every existing writer
    of that column (seed.ts's ConceptFixture) already supplies ttl explicitly rather than leaving it to
    a writer-side default; GlossaryService.concepts() is the one place the ttl default already lives,
    for reads, so registerConcept reuses that same default rather than duplicating it in the store.
- inferred: '"replaces it in place at an existing name" identifies a concept by its name alone, not by
    name together with accepts or ttl.'
  from: domain/glossary/concept declares name, accepts and ttl as the concept's attributes with no second
    field marked as identifying, and every existing replace-by-identity precedent in this codebase (capability
    by name+version, connector configuration by connector) replaces by a stated identity field rather
    than by comparing every attribute.
- inferred: The new GlossaryService method is named registerConcept.
  from: contracts/glossary/glossary-authoring's own operation is named register-concept, and CapabilityRegistryService.registerCapability
    / ConnectorConfigurationRegistryService.registerConnector already name their own equivalent write
    operations the same way.
- inferred: No new published TypeScript port interface (e.g. an IGlossaryAuthoring) was added for contracts/glossary/glossary-authoring;
    registerConcept is a plain public method of GlossaryService.
  from: The two other write operations this backend-authoring scope already covers — CapabilityRegistryService.registerCapability
    and ConnectorConfigurationRegistryService.registerConnector — are both exposed the same way, with
    no dedicated write-port interface; only the read contracts get one in this codebase's established
    convention.
preserved:
- IGlossaryStore.readTerms, writeTerms and insertMissingTerms, and RelationalGlossaryStore's implementations
  of them, are unchanged in behavior.
- IGlossaryStore.readConcepts and RelationalGlossaryStore.readConcepts continue to answer exactly the
  rows currently held, unchanged.
- GlossaryService's existing terms(), concepts(), readVocabularyTerm, readConcept, listVocabularyTerms,
  listConcepts and its non-conclusion-outcomes handling are unchanged.
- The concepts/concept_accepts foreign-key relationship (concept_accepts.concept_name references concepts.name)
  is respected by writeConcepts' delete and insert ordering, matching what already held true of the schema.
deferred:
- what: No validation is added to registerConcept beyond assembling and replacing the concept — for example
    a check that every name in accepts already names a held subject type (rules/knowledge/a-concept-accepts-the-declared-subject-type
    is not among this task's implements).
  why: This task's own criteria state only the create/replace-in-place mechanics and this task's implements
    list domain/glossary/concept and contracts/glossary/glossary-authoring alone; adding a refusal for
    an undeclared subject type would widen this task past what it was cut to do.
- what: No HTTP route, controller or DTO is added for register-concept.
  why: The task's own Notes and the sibling task's name (task/concept-authoring/register-concept-route)
    state this is a store-port-only task; the route depends on this one and reaches it in a separate delivery.
---

## What it is

A new write method on the glossary store port and its relational implementation, letting a concept be created at a new name or replaced in place at an existing name; GlossaryService.registerConcept assembles and calls it.

## Notes

None.
