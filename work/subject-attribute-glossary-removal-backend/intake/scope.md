# Scope: remove the glossary vocabulary subject-attribute — backend

Per the specification analysed and committed at 65c02dc9 on branch
`subject-attribute-glossary-removal`, remove the glossary vocabulary
`subject-attribute` from the backend end to end, replacing the name-in-glossary
validation with the coverage already derived from capability `input_schema`
`required` (`case-input-requirements`), which `/diagnose` already uses.

Specification nodes this scope answers to: `domain/investigation/subject-attribute-value`,
`domain/knowledge/case-input-requirement`, `rules/glossary/a-vocabulary-holds-each-name-once`,
`rules/glossary/a-glossary-read-by-an-unheld-name-is-refused`,
`rules/investigation/a-subject-holds-one-value-per-attribute`,
`rules/investigation/a-composed-subject-presents-every-case-input-requirement`,
`rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set`,
`rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`,
`contracts/investigation/glossary-source`.

Known impact (backend, `src/`):

- `src/src/glossary/terms.ts` — remove `'subject-attribute'` from `TERM_VOCABULARIES`.
- `src/src/persistence/relational-glossary-store.repository.ts` — remove the
  `'subject-attribute': 'subject_attributes'` mapping.
- `src/src/seed.ts` — remove the `insertMissingTerms('subject-attribute', …)` call.
- `src/src/fixtures/glossary/subject-attribute.json` — remove.
- `src/src/investigation/investigation-factory.ts` — remove `refuseAttributesNotInGlossary`,
  its call, the `SubjectAttributeNotInGlossaryError` import, and the now-unused `glossary`
  field of `BuildInvestigationOptions`.
- `src/src/investigation/run-diagnosis.ts` — stop passing `glossary` to `buildInvestigation`.
- `src/src/errors/subject-attribute-not-in-glossary.error.ts` — remove.
- `src/src/http/simulate-case.controller.ts`, `src/src/http/simulate-hypothesis.controller.ts`
  — remove the glossary check and the `glossary` dependency.
- `src/src/case/validate-case-coherence.ts` — remove the dead `'subject-attribute'` entry
  from `VOCABULARY_ROLES`.
- A new migration dropping `investigation_subject_attribute_values`'s FK to
  `subject_attributes`, then the `subject_attributes` table itself (existing rows in
  `investigation_subject_attribute_values` are preserved; only referential integrity is lost).
- Every unit/integration test exercising any of this: `investigation-factory.spec.ts`,
  `simulate-case.controller.spec.ts`, `simulate-hypothesis.controller.spec.ts`,
  `list-vocabulary-terms.routes.spec.ts`, and whatever else asserts five vocabularies or
  exercises the removed error/checks.

Out of scope: the frontend (`frontend/app/`), delivered separately as
`subject-attribute-glossary-removal-frontend`.
