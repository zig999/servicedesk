---
title: Proof for IGlossaryQuery.listVocabularyTerms
summary: Eight tests over GlossaryService.listVocabularyTerms prove criterion 1 in full; criterion 2 is
  a compile-time guarantee of TermVocabulary's closed union with no runtime path to exercise.
implementation: sha256:80c8a021ed439e516155b906e0b8d10cf22d42b59dab1b6c4723e942e6e5e31d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-suite-2
tests:
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers a page of a vocabulary with the full pagination envelope, its page count computed from
    the total and the limit (API-03)
  proves: Calling listVocabularyTerms with an existing vocabulary name returns every term that vocabulary
    currently holds, paginated per src/types/pagination.ts.
  fails_when: the returned envelope omits data, total, limit, offset or pageCount, or pageCount stops
    being ceil(total/limit) for this total and limit
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers a page from the middle of a larger vocabulary, windowed by offset and limit rather than
    always starting at the first term
  proves: Criterion 1's windowing — a page reflects the requested offset, not just the requested limit
  fails_when: the returned data array stops being held.slice(offset, offset+limit) for a non-zero offset
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers an empty data array, never an error, for a vocabulary with no terms held (API-02)
  proves: Criterion 1's empty-vocabulary case, per API-02
  fails_when: the call rejects, or answers anything other than data:[], total:0, pageCount:0 for an empty
    vocabulary
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers an empty data array, never an error, when the offset falls past the end of a non-empty
    vocabulary (API-02)
  proves: Criterion 1's offset-past-end case, per API-02
  fails_when: an offset beyond the held array's length rejects, throws, or answers a non-empty data array
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: includes both non-conclusion outcomes in the returned page when listing the outcome vocabulary,
    exactly as terms() already seeds them
  proves: Calling listVocabularyTerms with an existing vocabulary name returns every term that vocabulary
    currently holds — including the seeded non-conclusion outcomes for the outcome vocabulary
  fails_when: listVocabularyTerms reads the store's raw readTerms output directly instead of the seeded
    terms() and the two non-conclusion outcomes are absent from the page
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: counts the seeded non-conclusion outcomes toward the outcome vocabulary's total and page count,
    not only toward its returned page (API-03)
  proves: the pagination envelope's total/pageCount for the outcome vocabulary reflect the full seeded
    holding, not just the store's own row count or the returned page's size
  fails_when: total or pageCount is computed from the store's raw row count instead of the seeded array's
    length
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses listing a vocabulary whose records hold one name twice, the same typed error reading a
    single term already raises
  proves: listVocabularyTerms reuses the same duplicate-name assertion terms()/readVocabularyTerm already
    enforce (MNT-03), rather than reimplementing its own read of the vocabulary
  fails_when: the call resolves instead of rejecting, or rejects with anything other than DuplicateGlossaryNameError
    carrying the offending vocabulary and name
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)
  proves: pageCount never divides by a non-positive limit
  fails_when: pageCount is anything other than 0 for limit:0
not_applicable:
- edge_case: calling listVocabularyTerms with a vocabulary name the glossary does not recognize (criterion
    2)
  why: 'TermVocabulary (src/glossary/terms.ts) is a closed compile-time union of exactly five literals,
    and GlossaryService implements IGlossaryQuery typed over it, so a call naming an unrecognized vocabulary
    cannot be constructed without a type-system violation — there is no runtime code path in listVocabularyTerms
    (or in readVocabularyTerm, which it delegates to) to trigger. Confirmed against the already-delivered
    read-vocabulary-term-route proof: its own test shows an unrecognized :vocabulary segment is refused
    at the HTTP DTO''s z.enum(TERM_VOCABULARIES) boundary and never reaches the readVocabularyTerm operation
    at all. The guarantee criterion 2 states is enforced entirely by the type checker, which a unit test
    cannot exercise without first defeating the type system it is meant to verify.'
- edge_case: two concurrent listVocabularyTerms calls against the outcome vocabulary racing the non-conclusion-outcome
    seeding write
  why: no bound node states a concurrency guarantee for this read, and any such race is inherited unchanged
    from terms()'s own seeding behavior, which predates and is untouched by this task
- edge_case: the store's readTerms rejecting or answering slowly
  why: listVocabularyTerms adds no store-failure handling of its own; whatever the store raises propagates
    unchanged through the existing terms() helper, and no criterion of this task asks for different handling
    at this layer
untested:
- Whether listVocabularyTerms reads the store fresh on every call rather than remembering an earlier read
  (stated in its own doc comment). No test in this file isolates this property for either glossary list
  operation, unlike the analogous property already tested for listCapabilities — a pre-existing gap in
  this codebase's glossary test coverage, not one this task introduced.
---

## What it is

Eight unit tests against GlossaryService.listVocabularyTerms, over an in-memory glossary store.

## Notes

No source or test edits were needed beyond what was already delivered; two independent passes (implementation, proof) each traced criterion 2 against read-vocabulary-term's actual behavior and reached the same conclusion. The widened IGlossaryQuery interface also required minimal listVocabularyTerms/listConcepts stubs in six unrelated test fakes/doubles outside this file (case-query.service.spec.ts, validate-case-coherence.spec.ts, investigation-factory.spec.ts, run-diagnosis.spec.ts, read-concept.routes.spec.ts, read-vocabulary-term.routes.spec.ts) purely to keep them compiling against the widened interface — a mechanical fix shared with the sibling list-concepts-query-extension task, verified by running the whole suite (run/list-query-extensions-batch-suite-2): 106 files, 1068 tests, all passing.
