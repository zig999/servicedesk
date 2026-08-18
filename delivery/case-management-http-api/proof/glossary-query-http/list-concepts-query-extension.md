---
title: GlossaryService.listConcepts pagination
summary: Seven tests in glossary.service.list-concepts.spec.ts prove both of the task's criteria and every
  implementation-record inference the sibling operations established for this pagination shape.
implementation: sha256:886f2431e6f810270e4796076d7d9717fcec9d731f8fde4771286669e6015efc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-suite-2
tests:
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: answers a page of the registered concepts with the full pagination envelope, its page count computed
    from the total and the limit (API-03)
  proves: Criterion 1 (listConcepts returns every registered concept, paginated) — the full PaginatedResponse
    envelope (data, total, limit, offset, pageCount), with pageCount computed by ceiling division rather
    than hardcoded.
  fails_when: listConcepts omits any envelope field, returns the wrong slice of concepts for the given
    window, or computes pageCount by any means other than ceil(total/limit).
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: answers a page from the middle of a larger concept list, windowed by offset and limit rather than
    always starting at the first concept
  proves: The pagination window is applied by offset, not just by limit from the start — a distinct code
    path from the first-page case.
  fails_when: listConcepts always starts its slice at index 0 regardless of the given offset, or windows
    incorrectly.
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: answers an empty data array, never an error, for a glossary holding no concepts (API-02)
  proves: Criterion 2 (an empty glossary answers an empty page rather than an error) for the case of zero
    registered concepts.
  fails_when: listConcepts throws, rejects, or returns data other than [] when the store holds no concepts.
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: answers an empty data array, never an error, when the offset falls past the end of the registered
    concepts (API-02)
  proves: Criterion 2 extended to a non-empty glossary read past its end — an offset beyond total answers
    an empty page, not an error, while total still reports the true count.
  fails_when: listConcepts throws or returns a non-empty/undefined data array when offset exceeds the
    number of held concepts, or misreports total.
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: holds the default of sixty seconds, read through listConcepts, for a concept whose registration
    states no ttl
  proves: listConcepts reuses the concepts() helper's ttl-defaulting rather than reading raw registrations.
  fails_when: listConcepts returns a concept with ttl undefined, or any value other than the stated 60-second
    default, for a registration that declared none.
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: refuses listing concepts whose registrations hold one name twice, the same typed error reading
    a single concept already raises
  proves: listConcepts reuses the concepts() helper's duplicate-name assertion, raising the same typed
    DuplicateGlossaryNameError with the same context shape.
  fails_when: listConcepts silently returns duplicate-named concepts, throws an untyped error, or raises
    DuplicateGlossaryNameError with a different vocabulary/name in its context.
- file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  name: answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)
  proves: The shared pageCountOf helper's defensive floor is reached through listConcepts for a non-positive
    limit, never dividing by it or throwing.
  fails_when: 'listConcepts returns a non-zero, NaN, or Infinity pageCount for limit: 0, or throws.'
not_applicable:
- edge_case: Two concurrent listConcepts calls against one subject
  why: The service performs no state mutation; each call independently reads the store and slices in memory,
    so there is no shared state to race and no sibling list operation in this codebase tests this either.
- edge_case: A failing/slow store dependency (readConcepts rejecting)
  why: Not named by this task's criteria, is a repository-layer concern the standard (EDG-08) scopes to
    repository.ts/clients rather than service.ts, and no sibling pagination test exercises it either;
    the duplicate-name test already demonstrates that a synchronous failure inside the reused helper propagates
    as a rejection.
- edge_case: Offset exactly equal to total, as distinct from offset past total
  why: Array.prototype.slice behaves identically for offset === length and offset > length; the offset-past-end
    test already exercises that code path and a boundary-equal case would exercise nothing distinct.
- edge_case: 'A negative limit, as distinct from limit: 0'
  why: 'pageCountOf''s guard is limit > 0 ? ... : 0, so zero and negative limits take the exact same branch;
    testing both would duplicate the existing non-positive-limit test rather than reach a different path.'
- edge_case: Negative or fractional offset
  why: 'PaginationRequest carries no validation of its own by design (src/types/pagination.ts''s own header:
    bounding happens at the controller/route boundary via a DTO, never at this module), so an invalid
    offset reaching the service is outside this task''s scope.'
untested:
- That listConcepts reads the store fresh on every call rather than remembering an earlier read (stated
  in glossary-query.port.ts's own listConcepts docstring). Neither this file nor its direct sibling (listVocabularyTerms's
  tests) has ever isolated this property for the glossary side, unlike the analogous property already
  tested for listCapabilities — a pre-existing gap in this codebase's glossary test coverage, not one
  this task introduced.
divergences:
- cites: TST-04
  file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  departure: The two directly comparable sibling tasks in this same epic (list-vocabulary-terms-query-extension,
    list-capabilities-query-extension) each added their pagination tests inside the existing per-module
    spec file (glossary.service.spec.ts, capability-registry.service.spec.ts respectively), establishing
    this codebase's practice of one spec file per source file. This file instead sits beside glossary.service.spec.ts
    as a separate companion file rather than appending its tests into it.
  why: The file's own header comment already flags this tension. Relocating an already-correct, already-passing
    test suite is a structural change outside this proof's remit of verifying and closing behavioral gaps,
    so the tests were left in place rather than merged.
---

## What it is

Seven unit tests against GlossaryService.listConcepts, over an in-memory glossary store.

## Notes

No source or test edits were needed; the TST-04 divergence (companion file rather than appended to glossary.service.spec.ts) is disclosed above rather than silently accepted. Verified by running the whole suite (run/list-query-extensions-batch-suite-2): 106 files, 1068 tests, all passing.
