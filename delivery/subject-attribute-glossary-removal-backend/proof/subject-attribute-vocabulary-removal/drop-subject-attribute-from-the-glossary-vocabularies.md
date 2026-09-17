---
target: backend
title: Four-vocabulary glossary reduction — proof
summary: Confirms TERM_VOCABULARIES, the repository's table map, VOCABULARY_ROLES, seed.ts and the fixture
  tree hold exactly four vocabularies, with two new tests closing gaps the implementer's own rewritten
  specs left open, and one pre-existing status-map.ts gap (DuplicateGlossaryNameError never mapped) closed
  as part of this task's own criterion.
implementation: sha256:5fa00dc7b836c6e5fc1064f11517fd76f3090103c9bd86aaca9f8f632fad4b7c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-vocabulary-removal-drop-vocabularies-suite
tests:
- file: src/__tests__/unit/glossary/terms.spec.ts
  name: lists exactly the four term vocabularies subject-type, outcome, action and recipient, in that
    order, holding no fifth entry
  proves: Criterion — TERM_VOCABULARIES lists exactly subject-type, outcome, action and recipient.
  fails_when: TERM_VOCABULARIES gains, loses, reorders or duplicates a member — including an implementation
    that still passes every it.each-driven route test by quietly keeping a fifth vocabulary.
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a GET of /v1/glossary/subject-attribute, the vocabulary this reduction dropped,
    never reaching listVocabularyTerms
  proves: Criterion — a GET of /v1/glossary/subject-attribute is answered 400 for a :vocabulary segment
    naming none of the term vocabularies, without reaching listVocabularyTerms.
  fails_when: subject-attribute is still accepted by the route's z.enum(TERM_VOCABULARIES) validation,
    or the controller is invoked before validation refuses it.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reads each vocabulary from its own table, never another vocabulary's (it.each over exactly 4 pairs)
  proves: Criterion — relational-glossary-store.repository.ts's vocabulary-to-table map names no subject_attributes
    table.
  fails_when: VOCABULARY_TABLES maps a fifth vocabulary key or a wrong table for one of the four kept
    keys.
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: the four 'refuses a case naming a role the glossary does not hold' tests, plus 'does not refuse
    a case that violates no coherence rule' (pre-existing, untouched by this task)
  proves: Criterion — case coherence validation reports the same violations for every case fixture as
    it did before this change.
  fails_when: glossaryCoherenceViolations() starts reporting a different violation set for a case naming
    only subject-type/outcome/action/recipient terms.
- file: src/__tests__/integration/seed.spec.ts
  name: the four 'holds exactly the fixture's own names' tests (pre-existing, implementer-adjusted only
    in cleanup helpers)
  proves: Criteria — seed.ts calls insertMissingTerms for exactly the four remaining vocabularies; seed.spec.ts
    asserts a seeded glossary holding four vocabularies and reads no subject-attribute fixture.
  fails_when: seed.ts stops seeding one of the four vocabularies, seeds a fifth, or wipeFixtureOwnedRows/cleanupSeededRows
    still reference subject_attributes.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: ensureFixtureSeeded's own reads of subject-type.json, outcome.json, action.json, recipient.json
    and concept.json, exercised by every test in the file
  proves: Criterion — src/src/fixtures/glossary/subject-attribute.json is gone from the tree, and the
    other five fixture files are still read by seed.ts.
  fails_when: one of the five fixture files is missing or unreadable — this file's beforeAll would reject
    before any test ran.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: refuses with the status the status map assigns VocabularyTermNotHeldError, when the named vocabulary
    does not currently hold the term
  proves: Criterion — a read of a vocabulary term by a name the named vocabulary does not hold is still
    refused with an HTTP 404 response reporting a VocabularyTermNotHeldError, for each of the four remaining
    vocabularies.
  fails_when: readVocabularyTerm resolving held:false stops raising VocabularyTermNotHeldError, or status-map.ts
    stops mapping it to 404.
  demonstrates: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers a listing whose vocabulary holds one name twice with an HTTP 500 response reporting DuplicateGlossaryNameError
  proves: Criterion — a read over a vocabulary holding one name more than once is still refused with an
    HTTP 500 response reporting a DuplicateGlossaryNameError, for each of the four remaining vocabularies.
  fails_when: the route answers anything other than HTTP 500 with error.code === 'DuplicateGlossaryNameError'
    when listVocabularyTerms rejects with that error.
  demonstrates: rules/glossary/a-vocabulary-holds-each-name-once
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses a vocabulary whose records hold one name twice; refuses a duplicated outcome vocabulary
    before seeding writes anything; refuses listing a vocabulary whose records hold one name twice (pre-existing,
    unaffected by this task)
  proves: That DuplicateGlossaryNameError is still raised, at the service layer, for a duplicated name
    in any of the four remaining vocabularies.
  fails_when: assertUniqueNames() stops raising DuplicateGlossaryNameError for a vocabulary holding a
    repeated name.
not_applicable:
- edge_case: A GET reaching listVocabularyTerms/readVocabularyTerm with a TermVocabulary value of 'subject-attribute'
    at the service or repository layer, bypassing the HTTP DTO's z.enum validation.
  why: TermVocabulary is now a 4-member literal union at the type level; no caller inside this codebase
    can construct such a call without failing typecheck, so the only observable path for this input is
    the HTTP boundary, already covered by the 400-refusal test.
- edge_case: Concurrent seed.ts runs, or a seed.ts run racing a live read of a vocabulary mid-seed.
  why: Unaffected by shrinking which vocabularies exist; seed.ts's own idempotency under repeat runs is
    already exercised by seed.spec.ts's own neighboring tests, none of which this task's criteria ask
    to be re-proven.
- edge_case: A vocabulary segment that is syntactically a term vocabulary name but differs only in case
    or trailing content.
  why: No criterion of this task states case-sensitivity or path-segment-boundary behavior for :vocabulary;
    that is Fastify's own routing and the pre-existing z.enum's own case sensitivity, neither of which
    this task touches.
untested:
- rules/glossary/a-vocabulary-holds-each-name-once's fact is stated over two clauses — 'over a vocabulary,
  or over the concepts' — and this task's own Notes carve the concept-half out as belonging to the already-delivered
  glossary concept read. The vocabulary-half is now soundly demonstrated by the passing test above; the
  compound statement as a whole is not decided by any single test, since the concept-half remains outside
  this task's covers.
- 'Criterion ''VOCABULARY_ROLES in validate-case-coherence.ts holds no subject-attribute entry'' has no
  test that can decide it directly: VOCABULARY_ROLES is a module-private, unexported constant, so no spec
  file can import and inspect its keys. Confirmed by direct reading of case/validate-case-coherence.ts
  and by the project''s typecheck step, which would reject an excess property on this Record<TermVocabulary,
  string> literal.'
- Criterion 'src/src/fixtures/glossary/subject-attribute.json is gone from the tree' is a filesystem fact
  about the repository's structure rather than a runtime behavior; no fs.existsSync-style test was written
  for the file's absence. Confirmed by a direct directory listing and a repo-wide search finding no remaining
  reference to the filename.
---

## What it is

Nine tests across nine spec files — two new (terms.spec.ts; a new case in list-vocabulary-terms.routes.spec.ts for the 500/DuplicateGlossaryNameError path), the rest pre-existing and largely unmodified — proving every testable criterion of task/subject-attribute-vocabulary-removal/drop-subject-attribute-from-the-glossary-vocabularies.

## Notes

The new 500/DuplicateGlossaryNameError test initially failed against the delivered code: errors/status-map.ts had never mapped that class, a pre-existing gap unrelated to which vocabularies exist. Since the criterion it proves is this task's own, the coordinating session added the missing status-map.ts entry (implementation record's own Notes) rather than leaving the criterion unmet or the test unwritten.
