---
title: Reduce the glossary to four term vocabularies
summary: subject-attribute leaves TERM_VOCABULARIES, the store's vocabulary-to-table map, VOCABULARY_ROLES
  and the seed, and its fixture file leaves the tree.
rationale: 'Cut as one task across four files because TERM_VOCABULARIES is a single as-const tuple typing
  every one of them: the repository table map, the coherence role map and seed.ts''s insertMissingTerms
  call are all keyed by the same literal, so a delivery removing the tuple entry alone would not compile
  and a delivery removing any map alone would change nothing. The fixture file rides here because seed.ts
  reads it by name and deleting it separately would leave either a dangling read or an unread file.'
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
objective: The glossary declares, stores and seeds exactly four term vocabularies — subject-type, outcome,
  action and recipient — with the vocabulary name subject-attribute held nowhere in src/ (the
  subject_attributes table and its foreign key are a separate, sibling task's own objective).
criteria:
- TERM_VOCABULARIES lists exactly subject-type, outcome, action and recipient.
- A GET of /v1/glossary/subject-attribute is answered 400 for a :vocabulary segment naming none of the
  term vocabularies, without reaching listVocabularyTerms.
- relational-glossary-store.repository.ts's vocabulary-to-table map names no subject_attributes table.
- VOCABULARY_ROLES in validate-case-coherence.ts holds no subject-attribute entry.
- Case coherence validation reports the same violations for every case fixture as it did before this change.
- seed.ts calls insertMissingTerms for exactly the four remaining vocabularies.
- src/src/fixtures/glossary/subject-attribute.json is gone from the tree, and the other five fixture files
  under src/src/fixtures/glossary are still read by seed.ts.
- A read of a vocabulary term by a name the named vocabulary does not hold is still refused with an HTTP
  404 response reporting a VocabularyTermNotHeldError, for each of the four remaining vocabularies.
- A read over a vocabulary holding one name more than once is still refused with an HTTP 500 response
  reporting a DuplicateGlossaryNameError, for each of the four remaining vocabularies.
- seed.spec.ts asserts a seeded glossary holding four vocabularies and reads no subject-attribute fixture.
- src's test suite passes.
depends_on:
- task/subject-attribute-check-removal/remove-the-glossary-check-from-investigation-building
implements:
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
---

## What it is
The published language shrinks to four vocabularies, in the one tuple that types them and in each of the three parallel maps and the seed keyed off it.
Every test asserting five vocabularies, seeding the fifth, or naming its table changes with it.

## Notes
The glossary port's readVocabularyTerm signature is generic over TermVocabulary and needs no change beyond the tuple shrinking.
This task leaves the table standing so that it can be delivered without a schema change; dropping it is the sibling task's.
REMAINDER, from the specification — rules/glossary/a-glossary-read-by-an-unheld-name-is-refused's second clause (a concept read by an unheld name refused with HTTP 404 ConceptNotHeldError) reaches no criterion here; concepts are not a term vocabulary and this reduction leaves that read untouched. Belongs to: the already-delivered glossary concept read.
REMAINDER, from the specification — rules/glossary/a-vocabulary-holds-each-name-once's "or over the concepts" clause reaches no criterion here for the same reason. Belongs to: the already-delivered duplicate-name refusal over the glossary's concepts.
ADVISORY, from the specification — constraints/the-stored-schema-mirrors-the-declared-model is in the epic's covers but governs no criterion of this task as written: this task changes no relation or column, and the objective assigns the subject_attributes table and its foreign key to the sibling migration task. Left out of implements.
ADVISORY, from the specification — the criterion on the 400 response for a GET naming an unheld :vocabulary segment rests on constraints/a-malformed-request-is-refused-with-a-validation-error, which states the general shape-validation refusal (HTTP 400, VALIDATION_ERROR, details).
Decision, beyond the covers — stand: constraints/a-malformed-request-is-refused-with-a-validation-error governs route-level shape validation generally and is pre-existing, unaffected behavior (a Zod enum shrinking by one member); this task's own claim is the four-vocabulary shape, not the generic validation-refusal shape.
ADVISORY, from the specification — the VOCABULARY_ROLES / case-coherence criteria rest on which vocabularies a case's terms are checked against, held by rules/knowledge/case-terms-exist-in-the-glossary.
Decision, beyond the covers — stand: rules/knowledge/case-terms-exist-in-the-glossary's own five-vocabulary enumeration is untouched by this removal (VOCABULARY_ROLES's subject-attribute entry was already dead code, read by no coherence check); the criteria here are a regression guard on that already-unaffected behavior.
ADVISORY, from the specification — domain/glossary/_context is the node stating the four-vocabulary published language that backs this task's objective, but its identity's underscore segment cannot appear in `implements` or `covers` under the plan contract's pattern; the two bound rules' own `constrains` lists carry the same four-vocabulary enumeration and are what this task is held to instead.
Decision, beyond the covers — stand: domain/glossary/_context is read here only for the background fact its Description already states (four vocabularies), never as a claim this task's own criteria need held against it — the two bound glossary rules carry the falsifiable half.
