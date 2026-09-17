---
title: Backend wiring for the glossary vocabulary subject-attribute and its replacement
summary: Where the subject-attribute glossary vocabulary is declared, stored, checked, seeded, and tested
  across src/, and where the capability-input-schema-derived coverage check it is replaced by already
  lives.
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
area:
- src/src/glossary/terms.ts
- src/src/glossary/glossary-query.port.ts
- src/src/persistence/relational-glossary-store.repository.ts
- src/src/seed.ts
- src/src/fixtures/glossary
- src/src/investigation/investigation-factory.ts
- src/src/investigation/run-diagnosis.ts
- src/src/investigation/investigation-pipeline.ts
- src/src/investigation/simulate-hypothesis-pipeline.ts
- src/src/investigation/subject-covers-case-input-requirements.ts
- src/src/errors/subject-attribute-not-in-glossary.error.ts
- src/src/errors/subject-does-not-cover-case-inputs.error.ts
- src/src/errors/status-map.ts
- src/src/http/simulate-case.controller.ts
- src/src/http/simulate-hypothesis.controller.ts
- src/src/http/diagnose.controller.ts
- src/src/case/validate-case-coherence.ts
- src/src/factories/simulate.factory.ts
- src/src/factories/production-simulate-hypothesis.factory.ts
- src/src/factories/diagnose.factory.ts
- src/migrations
- src/src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
- src/src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/src/__tests__/unit/glossary/glossary.service.spec.ts
- src/src/__tests__/integration/seed.spec.ts
- src/src/__tests__/integration/persistence/schema-migrations.spec.ts
modules:
- name: glossary-terms
  path: src/src/glossary/terms.ts
  role: touched
- name: relational-glossary-store
  path: src/src/persistence/relational-glossary-store.repository.ts
  role: touched
- name: seed-script
  path: src/src/seed.ts
  role: touched
- name: subject-attribute-fixture
  path: src/src/fixtures/glossary/subject-attribute.json
  role: touched
- name: investigation-factory
  path: src/src/investigation/investigation-factory.ts
  role: touched
- name: run-diagnosis
  path: src/src/investigation/run-diagnosis.ts
  role: touched
- name: subject-attribute-error
  path: src/src/errors/subject-attribute-not-in-glossary.error.ts
  role: touched
- name: simulate-case-controller
  path: src/src/http/simulate-case.controller.ts
  role: touched
- name: simulate-hypothesis-controller
  path: src/src/http/simulate-hypothesis.controller.ts
  role: touched
- name: validate-case-coherence
  path: src/src/case/validate-case-coherence.ts
  role: touched
- name: glossary-migration
  path: src/migrations/0002-glossary-vocabulary.sql
  role: touched
- name: investigation-migration
  path: src/migrations/0005-investigation.sql
  role: touched
- name: new-migration-slot
  path: src/migrations
  role: touched
- name: investigation-pipeline
  path: src/src/investigation/investigation-pipeline.ts
  role: depends-on
- name: simulate-hypothesis-pipeline
  path: src/src/investigation/simulate-hypothesis-pipeline.ts
  role: depends-on
- name: simulate-factory
  path: src/src/factories/simulate.factory.ts
  role: depends-on
- name: production-simulate-hypothesis-factory
  path: src/src/factories/production-simulate-hypothesis.factory.ts
  role: depends-on
- name: diagnose-factory
  path: src/src/factories/diagnose.factory.ts
  role: depends-on
- name: subject-covers-case-input-requirements
  path: src/src/investigation/subject-covers-case-input-requirements.ts
  role: adjacent
- name: diagnose-controller
  path: src/src/http/diagnose.controller.ts
  role: adjacent
- name: subject-does-not-cover-case-inputs-error
  path: src/src/errors/subject-does-not-cover-case-inputs.error.ts
  role: adjacent
- name: status-map
  path: src/src/errors/status-map.ts
  role: adjacent
- name: investigation-factory-spec
  path: src/src/__tests__/unit/investigation/investigation-factory.spec.ts
  role: touched
- name: simulate-case-controller-spec
  path: src/src/__tests__/unit/http/simulate-case.controller.spec.ts
  role: touched
- name: simulate-hypothesis-controller-spec
  path: src/src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  role: touched
- name: list-vocabulary-terms-routes-spec
  path: src/src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  role: touched
- name: relational-glossary-store-spec
  path: src/src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  role: touched
- name: glossary-service-spec
  path: src/src/__tests__/unit/glossary/glossary.service.spec.ts
  role: touched
- name: seed-integration-spec
  path: src/src/__tests__/integration/seed.spec.ts
  role: touched
- name: schema-migrations-spec
  path: src/src/__tests__/integration/persistence/schema-migrations.spec.ts
  role: touched
conventions:
- statement: TERM_VOCABULARIES is a single as-const tuple that both types TermVocabulary and drives every
    generic vocabulary code path (repository table map, coherence-role labels, route/tests iterating it),
    so removing one entry there is the single source change every other vocabulary-agnostic consumer needs.
  seen_at: src/src/glossary/terms.ts:15
- statement: 'Each glossary vocabulary is wired in three parallel maps keyed by the same TermVocabulary
    literal: the repository''s table map, validate-case-coherence.ts''s VOCABULARY_ROLES, and the fixture-file/insertMissingTerms
    call pair in seed.ts.'
  seen_at: src/src/persistence/relational-glossary-store.repository.ts:17; src/src/case/validate-case-coherence.ts:12;
    src/src/seed.ts:37-42
- statement: Migrations are plain numbered .sql files applied once in filename order (0001 through 0022
    currently), each opening with a comment block naming the specification nodes it implements and the
    constraints it satisfies.
  seen_at: src/migrations/0022-case-version-authored-at-default.sql:1-17
- statement: A destructive/behavior-preserving migration documents what it does NOT change and cites the
    sibling migration it mirrors.
  seen_at: src/migrations/0022-case-version-authored-at-default.sql:18-24
- statement: A production factory builds one dependency object at the wiring seam by spreading the caller's
    Omit-typed call plus factory-constructed singletons (store/glossary/capabilities/etc.); the Omit<...,
    'glossary' | ...> list is the exact set a factory itself supplies.
  seen_at: src/src/factories/diagnose.factory.ts:21-31, 33-48
- statement: Domain error classes are declared as small standalone files under src/src/errors/, each with
    a message-building constructor and a readonly context; only errors a route must answer with a non-default
    status are registered in STATUS_BY_ERROR_CLASS in status-map.ts.
  seen_at: src/src/errors/status-map.ts:41-79
- statement: SubjectAttributeNotInGlossaryError is declared but absent from status-map.ts — it currently
    falls through to whatever default status an unmapped Error gets.
  seen_at: src/src/errors/status-map.ts (no entry); src/src/errors/subject-attribute-not-in-glossary.error.ts
must_not_duplicate:
- what: refuseSubjectMissingRequiredCaseInputs(attributes, requirements) — the coverage check the scope
    names as the replacement — already implemented and already wired into diagnose.controller.ts via ICaseInputRequirementsQuery.readCaseInputRequirements
  at: src/src/investigation/subject-covers-case-input-requirements.ts:5-16; src/src/http/diagnose.controller.ts:12,26-30
- what: SubjectDoesNotCoverCaseInputsError — the error the coverage check already throws, already mapped
    to 422 in status-map.ts
  at: src/src/errors/subject-does-not-cover-case-inputs.error.ts; src/src/errors/status-map.ts:70
- what: ICaseInputRequirementsQuery — the existing query surface a simulate controller would reuse instead
    of a new lookup, where a task needs it
  at: src/src/case/case-input-requirements.port.ts
risks:
- risk: BuildInvestigationOptions.glossary is used only by refuseAttributesNotInGlossary, but InvestigationPipelineOptions.glossary
    and SimulateHypothesisPipelineOptions.glossary are separate, broader dependencies threaded through
    the same factories; removing the narrower field must not touch the pipeline-level one.
  consumers:
  - src/src/investigation/investigation-pipeline.ts
  - src/src/investigation/simulate-hypothesis-pipeline.ts
  - src/src/factories/simulate.factory.ts
  - src/src/factories/production-simulate-hypothesis.factory.ts
  - src/src/factories/diagnose.factory.ts
- risk: 'run-diagnosis.ts''s buildInvestigationOptions() builds an object literal with glossary: options.glossary;
    once BuildInvestigationOptions drops that field, the literal must drop the line too or TypeScript''s
    excess-property check fails.'
  consumers:
  - src/src/investigation/run-diagnosis.ts:55-74
- risk: schema-migrations.spec.ts asserts the full table list including subject_attributes and separately
    inserts a probe row into it for FK behavior; both need updating in the same change that drops the
    table.
  consumers:
  - src/src/__tests__/integration/persistence/schema-migrations.spec.ts:31,36,268
- risk: seed.spec.ts and seed.ts both read fixtures/glossary/subject-attribute.json by name and assert
    the seeded case holds exactly that fixture's attribute names; deleting the fixture without updating
    both leaves a dangling read.
  consumers:
  - src/src/seed.ts:39
  - src/src/__tests__/integration/seed.spec.ts:109,166,249-250
- risk: 'SimulateCaseControllerDependencies and SimulateHypothesisControllerDependencies both declare
    a glossary: IGlossaryQuery field used solely for the refuseAttributesNotInGlossary call; removing
    the call without removing the field leaves an unused/mismatched dependency at every call site.'
  consumers:
  - src/src/http/simulate-case.controller.ts:9-13
  - src/src/http/simulate-hypothesis.controller.ts:11-15
  - src/src/__tests__/unit/http/simulate-case.controller.spec.ts
  - src/src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
---

## What it is

The full set of source, migration and test files wiring the `subject-attribute` glossary vocabulary through storage, seeding, investigation building, the two simulate controllers, and case coherence validation, plus the already-existing case-input-requirements coverage mechanism the scope names as the replacement.
It also names the pipeline-level `glossary` dependency and test assertions that share files with the removal but are not themselves in scope, so the removal can avoid touching them.

## Notes

No fixtures/glossary/ file besides subject-attribute.json is implicated; outcome.json, subject-type.json, action.json, recipient.json and concept.json remain read by seed.ts unchanged.
validate-case-coherence.ts and its spec never validate a subject attribute against the glossary today (namedVocabularyTerms only checks subject-type, outcome, action, recipient), so the VOCABULARY_ROLES entry is dead code with no behavioral test depending on it.
The migrations directory is src/migrations; files run 0001 through 0022 in order, so a new migration belongs at 0023.
IGlossaryQuery/IGlossaryStore's readVocabularyTerm signature is generic over TermVocabulary and needs no change beyond the vocabulary list shrinking by one.
