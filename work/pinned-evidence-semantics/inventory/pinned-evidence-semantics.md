---
title: Pinned evidence semantics across glossary, capability registry and investigation
summary: One backend territory spanning glossary concepts, capability output-schema
  reading and the evidence-collection/judgment pipeline, where semantics must move
  from live reads to a collection-time snapshot.
area:
- src/src/glossary
- src/src/capability-registry
- src/src/investigation
- src/src/persistence
- src/src/http
- src/src/errors
- src/migrations
sources:
- intake/scope.md
modules:
- name: glossary-terms
  path: src/src/glossary/terms.ts
  role: touched
- name: glossary-service
  path: src/src/glossary/glossary.service.ts
  role: touched
- name: glossary-store-port
  path: src/src/glossary/glossary-store.port.ts
  role: touched
- name: glossary-query-port
  path: src/src/glossary/glossary-query.port.ts
  role: touched
- name: relational-glossary-store
  path: src/src/persistence/relational-glossary-store.repository.ts
  role: touched
- name: register-concept-http
  path: src/src/http/register-concept.controller.ts
  role: touched
- name: register-concept-dto
  path: src/src/http/dto/register-concept.dto.ts
  role: touched
- name: read-concept-http
  path: src/src/http/read-concept.controller.ts
  role: touched
- name: read-concept-dto
  path: src/src/http/dto/read-concept.dto.ts
  role: touched
- name: evidence-value-object
  path: src/src/investigation/evidence.ts
  role: touched
- name: evidence-collection-stage
  path: src/src/investigation/evidence-collection-stage.ts
  role: touched
- name: judgment-stage
  path: src/src/investigation/judgment-stage.ts
  role: touched
- name: citation-validation
  path: src/src/investigation/citation-validation.ts
  role: touched
- name: hypothesis-evaluator-port
  path: src/src/investigation/hypothesis-evaluator.port.ts
  role: touched
- name: anthropic-hypothesis-evaluator-adapter
  path: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  role: touched
- name: fake-hypothesis-evaluator-adapter
  path: src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  role: touched
- name: relational-investigation-store
  path: src/src/persistence/relational-investigation-store.repository.ts
  role: touched
- name: capability-value-object
  path: src/src/capability-registry/capability.ts
  role: depends-on
- name: capability-query-port
  path: src/src/capability-registry/capability-query.port.ts
  role: depends-on
- name: capability-input-schema-shape
  path: src/src/capability-registry/capability-input-schema-shape.ts
  role: adjacent
- name: investigation-pipeline
  path: src/src/investigation/investigation-pipeline.ts
  role: depends-on
- name: investigation-factory
  path: src/src/investigation/investigation-factory.ts
  role: depends-on
- name: migrations
  path: src/migrations
  role: touched
- name: glossary-fixtures
  path: src/src/fixtures/glossary/concept.json
  role: depends-on
- name: capability-fixtures
  path: src/src/fixtures/capability/capability.json
  role: depends-on
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
conventions:
- statement: declaredFieldsOf/parseJsonOrUndefined/isPlainObject is the existing structural
    output_schema reader for field names.
  seen_at: src/src/investigation/citation-validation.ts
- statement: capabilityOutputSchemaKey composes a name::version key, reused by judgment-stage.ts.
  seen_at: src/src/investigation/citation-validation.ts
- statement: DEFAULT_CONCEPT_TTL_SECONDS-style registration defaults and assertUniqueNames/pageCountOf
    helpers govern concept registration.
  seen_at: src/src/glossary/glossary.service.ts
- statement: evidenceOf() is the one assembly point for an Evidence item during collection.
  seen_at: src/src/investigation/evidence-collection-stage.ts
- statement: The glossary store is whole-replace on write (writeConcepts) and fresh-read
    (readConcepts).
  seen_at: src/src/persistence/relational-glossary-store.repository.ts
- statement: capability-input-schema-shape.ts is a deliberately independent structural
    reader, parallel to citation-validation.ts's declaredFieldsOf, because the dependency
    runs investigation -> capability-registry and not the other way.
  seen_at: src/src/capability-registry/capability-input-schema-shape.ts
- statement: PROMPT_VERSION is an environment-supplied config value threaded into
    Investigation.prompt_version, not a source literal.
  seen_at: src/src/config/env.ts
- statement: A new migration file is the established convention for a store gaining
    a domain-model attribute.
  seen_at: src/migrations
must_not_duplicate:
- what: Structural output_schema field-name reading (declaredFieldsOf/parseJsonOrUndefined/isPlainObject)
  at: src/src/investigation/citation-validation.ts
- what: The name::version composite key convention (capabilityOutputSchemaKey)
  at: src/src/investigation/citation-validation.ts
- what: Concept registration defaults and validation helpers
  at: src/src/glossary/glossary.service.ts
- what: The evidenceOf() assembly helper for building one Evidence item
  at: src/src/investigation/evidence-collection-stage.ts
- what: The glossary store's whole-replace/fresh-read shape
  at: src/src/persistence/relational-glossary-store.repository.ts
- what: The deliberate-duplication convention between citation-validation.ts and capability-input-schema-shape.ts
    (a rationale to follow, never a function to import across the investigation/capability-registry
    dependency direction)
  at: src/src/capability-registry/capability-input-schema-shape.ts
risks:
- risk: Evidence gaining two new required fields (fields, concept_description) breaks
    every literal that builds an Evidence object today.
  consumers:
  - src/src/investigation/evidence-collection-stage.ts
  - src/src/persistence/relational-investigation-store.repository.ts
  - src/src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  - src/src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  - src/src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- risk: Removing judgment-stage.ts's live outputSchemasFor()/ICapabilityQuery read
    changes what judgeHypotheses/runIsolatedCall need, rippling into every caller
    assembling JudgeHypothesesOptions.
  consumers:
  - src/src/investigation/investigation-pipeline.ts
  - src/src/investigation/run-diagnosis.ts
  - src/src/investigation/simulate-hypothesis-pipeline.ts
  - src/src/__tests__/unit/investigation/judgment-stage.spec.ts
- risk: Widening EvidenceItem with per-field type/description and concept description
    changes the prompt anthropic-hypothesis-evaluator.adapter.ts builds and its SYSTEM_PROMPT
    text, breaking exact-prompt-text tests.
  consumers:
  - src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- risk: Adding a description column/attribute to concept read/write and a new ConceptDescriptionRequiredError
    refusal changes GlossaryService and every caller relying on today's three-attribute
    Concept shape, including seeded fixtures with no description.
  consumers:
  - src/src/http/register-concept.controller.ts
  - src/src/http/read-concept.controller.ts
  - src/src/fixtures/glossary/concept.json
  - src/src/__tests__/unit/glossary/glossary.service.spec.ts
  - src/src/__tests__/unit/http/register-concept.routes.spec.ts
  - src/src/__tests__/unit/http/read-concept.routes.spec.ts
- risk: A new migration adding columns to concepts and investigation_evidence must
    stay additive over already-seeded rows, or schema-migrations tests and vitest-global-setup's
    own seeding break.
  consumers:
  - src/src/__tests__/integration/persistence/schema-migrations.spec.ts
  - src/src/vitest-global-setup.ts
  - src/src/__tests__/integration/seed.spec.ts
---

## What it is
The area the scope lands in: the glossary's concept vocabulary and its relational store, the capability registry's output-schema reading conventions, and the investigation module's evidence-collection and judgment pipeline, plus the relational investigation store and the migrations directory that must gain the new columns.
One territory, not several — a change to citation-validation.ts's field vocabulary reaches judgment-stage.ts, which reaches evidence-collection-stage.ts and evidence.ts, which reach the relational investigation store and, through concept_description, the glossary.

## Notes
domain/glossary/concept and domain/investigation/field-semantics are already amended in the specification with description; glossary/terms.ts (Concept, ConceptRegistration) and the new field-semantics shape have no description/type+description attribute in source today.
domain/investigation/evidence already declares fields (many, field-semantics) and concept_description, both required; investigation/evidence.ts's Evidence type carries neither yet.
judgment-stage.ts's own outputSchemasFor() re-resolves each cited concept's capability through ICapabilityQuery.readCapability at judgment time, and citation-validation.ts's HypothesisCitationContext is built from that live-resolved CapabilityOutputSchemas map rather than from the evidence's own snapshot — this is exactly the live read rules/investigation/judgment-reads-the-evidence-snapshot now forbids.
evidence-collection-stage.ts calls only ICapabilityQuery.readCapability; it never reads the glossary, so nothing there resolves a concept's description at collection time today — IGlossaryQuery.readConcept (glossary-query.port.ts) is the existing read to add.
capability-input-schema-shape.ts's own header comment states its rationale for existing as an independent implementation deliberately parallel to citation-validation.ts's declaredFieldsOf, rather than a shared import, because the dependency runs investigation to capability-registry and not the other way; a third structural output-schema reader (for type/description per field) should follow that same documented, deliberate-duplication convention rather than trying to collapse it.
hypothesis-evaluator.port.ts's EvidenceItem carries only concept, declaredFields and the bare ObservationOutcome fields — no per-field type/description and no concept description — and anthropic-hypothesis-evaluator.adapter.ts's buildUserPrompt/evidenceBlock/SYSTEM_PROMPT are a documented pure function of exactly today's five inputs; the constraint text says the closed block's permitted content grows by the snapshotted semantics, so this file's own prompt-assembly functions and its SYSTEM_PROMPT text are the ones to extend, not replace.
PROMPT_VERSION is an environment-supplied value (src/src/config/env.ts, read by diagnose-server.factory.ts as env.PROMPT_VERSION) threaded into Investigation.prompt_version — bumping it is an operational/config value, not a literal in source, except wherever a fixture or test hardcodes a current value.
relational-glossary-store.repository.ts's concepts/concept_accepts tables (migrations/0002-glossary-vocabulary.sql) have no description column; relational-investigation-store.repository.ts's investigation_evidence table (migrations/0005, 0011) has no columns for fields or concept_description; a new migration file (0012+) is the established convention (constraints/the-stored-schema-mirrors-the-declared-model).
register-concept.dto.ts's registerConceptBodySchema has no description field, and read-concept.dto.ts's readConceptResponseSchema answers only name, accepts, ttl — both need to grow by description to match domain/glossary/concept's new required attribute, and status-map.ts has no entry yet for a ConceptDescriptionRequiredError (no such error class exists in src/src/errors/ today).
src/src/fixtures/glossary/concept.json and src/src/fixtures/capability/capability.json are the seed data vitest-global-setup.ts/seed.ts load; neither carries the new fields, so they are legacy-shaped inputs for the same "concept with no description" / "field with no description" degradation the scenarios describe.
