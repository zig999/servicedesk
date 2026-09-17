---
target: backend
title: Drop subject-attribute from the glossary's own vocabularies
summary: TERM_VOCABULARIES, the repository's table map, VOCABULARY_ROLES and seed.ts shrink to four vocabularies;
  every test asserting five vocabularies or reading the retired fixture is updated to match.
task: sha256:67d3f348c155e9ddd8635de37cee91df0e7acf1d5f804e1f04ca9563f56218d7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-vocabulary-removal-drop-vocabularies-build-2
files:
- path: src/glossary/terms.ts
  effect: TERM_VOCABULARIES shrinks to exactly ['subject-type', 'outcome', 'action', 'recipient']; TermVocabulary
    and every consumer generic over it narrows automatically.
- path: src/persistence/relational-glossary-store.repository.ts
  effect: VOCABULARY_TABLES drops the 'subject-attribute' → 'subject_attributes' entry; the store now
    names no subject_attributes table.
- path: src/seed.ts
  effect: seedRemainingVocabularies() no longer calls insertMissingTerms('subject-attribute', ...); it
    now seeds exactly subject-type, action and recipient (outcome is seeded separately by seedOutcomes).
- path: src/case/validate-case-coherence.ts
  effect: VOCABULARY_ROLES drops its dead 'subject-attribute' entry; the remaining four role labels are
    unchanged.
- path: src/errors/status-map.ts
  effect: Adds the missing [DuplicateGlossaryNameError, 500] entry to STATUS_BY_ERROR_CLASS, closing a
    pre-existing gap the proof's own test found — a duplicate-name refusal fell through to the generic
    unmapped-error branch instead of naming the class, unrelated to which vocabularies exist.
- path: src/fixtures/glossary/subject-attribute.json
  effect: Deleted — no reference to this file remains in source or tests.
- path: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  effect: The it.each vocabulary/table-mapping test drops the subject-attribute row and now exercises
    exactly the four remaining pairs.
- path: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  effect: Drops the subject-attribute cleanup call and its own five-vocabularies round-trip test rewritten
    for four; removes the 'empty vocabulary' test, which relied on subject-attribute being the one vocabulary
    this shared database never permanently pins.
- path: src/__tests__/unit/glossary/glossary.service.spec.ts
  effect: The page-count-zero-for-a-non-positive-limit test now exercises 'subject-type' instead of the
    retired 'subject-attribute'.
- path: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  effect: Retitles the 'five term vocabularies' 400 test to 'four'; the empty-envelope 200 test now targets
    'recipient'; adds a test asserting GET /v1/glossary/subject-attribute now answers 400 without reaching
    listVocabularyTerms.
- path: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  effect: Retitles its own 'five term vocabularies' 400 test to 'four'; its it.each(TERM_VOCABULARIES)
    coverage narrows automatically with the tuple.
- path: src/__tests__/integration/seed.spec.ts
  effect: wipeFixtureOwnedRows/cleanupSeededRows drop their subject_attributes delete-by-fixture-name
    calls; the dedicated subject-attribute-name test is removed, since seed.ts no longer seeds that vocabulary.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  effect: ensureFixtureSeeded/cleanupFixtureSeeded drop their subject_attributes seed and cleanup entirely
    — this file writes no investigation, so nothing here ever needed that row.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: Introduces SEEDED_SUBJECT_ATTRIBUTE_NAME = 'contract-number' as a shared constant; seeds/deletes
    that literal directly instead of reading the retired fixture, preserving the investigation_subject_attribute_values
    → subject_attributes foreign key this file's own diagnose call still exercises.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  effect: Same SEEDED_SUBJECT_ATTRIBUTE_NAME substitution, for the same FK reason.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  effect: Same SEEDED_SUBJECT_ATTRIBUTE_NAME substitution, for the same FK reason.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: Same SEEDED_SUBJECT_ATTRIBUTE_NAME substitution, for the same FK reason.
criteria:
- criterion: TERM_VOCABULARIES lists exactly subject-type, outcome, action and recipient.
  met: true
  how: The tuple in glossary/terms.ts now reads ['subject-type', 'outcome', 'action', 'recipient'] as
    const.
- criterion: A GET of /v1/glossary/subject-attribute is answered 400 for a :vocabulary segment naming
    none of the term vocabularies, without reaching listVocabularyTerms.
  met: true
  how: listVocabularyTermsParamsSchema's vocabulary field is z.enum(TERM_VOCABULARIES), so the shrunk
    tuple alone fails param validation before the controller runs; a dedicated test asserts the 400/VALIDATION_ERROR
    response and that listVocabularyTerms is never called.
- criterion: relational-glossary-store.repository.ts's vocabulary-to-table map names no subject_attributes
    table.
  met: true
  how: VOCABULARY_TABLES no longer has a 'subject-attribute' key.
- criterion: VOCABULARY_ROLES in validate-case-coherence.ts holds no subject-attribute entry.
  met: true
  how: The key and its spacer are removed; the object now types exactly against the four-member TermVocabulary.
- criterion: Case coherence validation reports the same violations for every case fixture as it did before
    this change.
  met: true
  how: VOCABULARY_ROLES's entry was already dead code — namedVocabularyTerms() never produced a subject-attribute
    NamedTerm — so removing it changes no violation glossaryCoherenceViolations() can produce.
- criterion: seed.ts calls insertMissingTerms for exactly the four remaining vocabularies.
  met: true
  how: seedRemainingVocabularies() now calls it for subject-type, action and recipient; outcome is called
    separately by seedOutcomes() — together exactly the four remaining vocabularies, once each.
- criterion: src/src/fixtures/glossary/subject-attribute.json is gone from the tree, and the other five
    fixture files under src/src/fixtures/glossary are still read by seed.ts.
  met: true
  how: The fixture file is deleted; outcome.json, subject-type.json, action.json, recipient.json and concept.json
    are untouched and still read exactly where they were.
- criterion: A read of a vocabulary term by a name the named vocabulary does not hold is still refused
    with an HTTP 404 response reporting a VocabularyTermNotHeldError, for each of the four remaining vocabularies.
  met: true
  how: GlossaryService.readVocabularyTerm() and status-map.ts's mapping are untouched and generic over
    TermVocabulary; read-vocabulary-term.routes.spec.ts's it.each(TERM_VOCABULARIES) exercises this for
    exactly the four remaining vocabularies automatically.
- criterion: A read over a vocabulary holding one name more than once is still refused with an HTTP 500
    response reporting a DuplicateGlossaryNameError, for each of the four remaining vocabularies.
  met: true
  how: GlossaryService.assertUniqueNames() still raises DuplicateGlossaryNameError for a duplicated name in
    any of the four remaining vocabularies. The proof's own test found that errors/status-map.ts's
    STATUS_BY_ERROR_CLASS had never named this class — a pre-existing gap unrelated to which vocabularies
    exist, so the HTTP boundary fell through to the generic unmapped-error branch instead of reporting the
    class name — and this record adds the missing [DuplicateGlossaryNameError, 500] entry, closing it.
- criterion: seed.spec.ts asserts a seeded glossary holding four vocabularies and reads no subject-attribute
    fixture.
  met: true
  how: The dedicated subject-attribute-name test is removed, and both wipeFixtureOwnedRows() and cleanupSeededRows()
    no longer touch that fixture or table.
- criterion: src's test suite passes.
  met: true
  how: run/subject-attribute-vocabulary-removal-drop-vocabularies-build-2 passed install, typecheck, lint,
    secret-scan and test-unit, after adding the status-map.ts entry the proof's own test required.
nodes:
- node: rules/glossary/a-vocabulary-holds-each-name-once
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/errors/status-map.ts
  how: The vocabulary-half of this node's compound statement now holds end to end — assertUniqueNames()
    raises DuplicateGlossaryNameError for a duplicated name in any of the four remaining vocabularies, and
    status-map.ts now maps it to HTTP 500, closing a pre-existing gap the proof found (the class was never
    mapped, so the HTTP boundary fell through to a generic unmapped-error response). The node's
    'or over the concepts' clause is outside this task's covers, per its own Notes.
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/errors/status-map.ts
  - src/http/dto/read-vocabulary-term.dto.ts
  how: The vocabulary-term clause (HTTP 404 VocabularyTermNotHeldError) is unaffected — readVocabularyTerm()
    and the status map stay generic over TermVocabulary, now exercised for exactly the four remaining
    vocabularies. The node's concept-read clause is outside this task's covers, per its own Notes.
inferences:
- inferred: The four integration test files that submit a real subject attribute value through a live
    diagnose/simulate HTTP call still need the row 'contract-number' present in subject_attributes at
    write time, so their fixture-file read for seeding was replaced with the same literal name as a shared
    constant rather than dropped outright.
  from: migrations/0005-investigation.sql's investigation_subject_attribute_values.attribute REFERENCES
    subject_attributes (name) constraint, together with this task's own instruction to leave the subject_attributes
    table standing.
- inferred: case-fixture-reads-clean.spec.ts's subject_attributes seed/cleanup was dropped outright rather
    than replaced with a literal, since that file writes no investigation.
  from: Reading the file's own test bodies — only createCaseQuery and createCaseLifecycle operations,
    no HTTP diagnose or simulate call.
- inferred: The integration store spec's 'answers the empty vocabulary' test is removed rather than repointed
    at a different vocabulary, because subject-attribute was the one vocabulary this shared database never
    permanently pins via a foreign key.
  from: migrations 0002/0004/0005's foreign-key declarations, and the same file's own comments on its
    action/recipient tests.
- inferred: terms.ts's SubjectAttribute type alias (unrelated to the domain SubjectAttributeValue type)
    was left in place rather than removed alongside the tuple entry.
  from: The task names only the TERM_VOCABULARIES tuple entry for removal; a grep confirmed the alias
    was already unreferenced anywhere in the tree before this change, so removing it is a separate, unplanned
    cleanup this task does not ask for.
preserved:
- The subject_attributes table and its investigation_subject_attribute_values(attribute) foreign key,
  left standing exactly as migrated — this task changes application-layer wiring only, per its own Notes
  and the sibling migration task's ownership of the table's removal.
- Every other glossary fixture (subject-type.json, outcome.json, action.json, recipient.json, concept.json),
  untouched and still read exactly where it was.
- The generic, TermVocabulary-parameterized behavior in GlossaryService, the read/list-vocabulary-term
  routes' DTOs, and status-map.ts.
- The real end-to-end diagnose/simulate-case/simulate-hypothesis investigation writes that carry a seeded
  subject attribute value — the foreign-key-satisfying row is now seeded from a hardcoded literal instead
  of the retired fixture.
deferred:
- what: Drop the subject_attributes table and its foreign key from investigation_subject_attribute_values.
  why: Explicitly out of this task's scope — assigned to the sibling migration task that depends on this
    one; the table is deliberately left standing so this task can be delivered without a schema change.
- what: Remove the now-fully-unused SubjectAttribute type alias in src/src/glossary/terms.ts.
  why: It was already unreferenced anywhere in the tree before this change and is unrelated to TERM_VOCABULARIES;
    removing an unreferenced exported alias is a separate cleanup this task does not ask for.
---

## What it is

The published language shrinks to four vocabularies, in the one tuple that types them and in each of the three parallel maps and the seed keyed off it. The subject_attributes table itself, and the fixture-referencing integration tests that satisfy its foreign key from a live diagnose/simulate call, are adjusted to keep working from a literal name rather than the now-deleted fixture.

## Notes

The task-implementer's own delivery lacked a shell and could not physically delete src/src/fixtures/glossary/subject-attribute.json; the coordinating session removed the file directly once every reference to it was confirmed gone.
The proof surfaced a pre-existing gap unrelated to which vocabularies exist: DuplicateGlossaryNameError had never been mapped in status-map.ts's STATUS_BY_ERROR_CLASS, so it fell through to the generic unmapped-error branch (still HTTP 500, but reporting INTERNAL_ERROR rather than the class name) instead of the class-naming response the task's own criterion and rules/glossary/a-vocabulary-holds-each-name-once both state. Since the criterion is this task's own, the coordinating session added the missing status-map.ts entry rather than leaving it unmet.
