---
title: IGlossaryQuery gains listConcepts
summary: Adds a listConcepts read operation to IGlossaryQuery and GlossaryService, answering every registered
  concept as a paginated page over the glossary's existing full-read.
task: sha256:8dc6201d2e1625b813adc458adb1e862f7dac9b2230b2b03ee79630c4f5c4cbf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-build-2
files:
- path: src/glossary/glossary-query.port.ts
  effect: Declares listConcepts(pagination) returning Promise<PaginatedResponse<Concept>>, documented
    as reading through the same holding readConcept resolves against. This file also declares the sibling
    listVocabularyTerms operation from task/glossary-query-http/list-vocabulary-terms-query-extension
    — present, not this task's own.
- path: src/glossary/glossary.service.ts
  effect: Implements listConcepts(pagination) — reads the full concept array through the existing private
    concepts() helper (ttl-defaulting, duplicate-name assertion, unchanged), slices it by pagination.offset/pagination.limit,
    and returns a PaginatedResponse<Concept> via the existing shared pageCountOf helper. This file also
    implements the sibling listVocabularyTerms operation — present, not this task's own.
criteria:
- criterion: Calling listConcepts returns every concept currently registered, paginated per src/types/pagination.ts.
  met: true
  how: GlossaryService.listConcepts reads every concept through this.concepts() (which itself reads IGlossaryStore.readConcepts()
    in full, defaults a missing ttl to DEFAULT_CONCEPT_TTL_SECONDS, and asserts unique names), then slices
    that array by pagination.offset/pagination.limit and returns a PaginatedResponse<Concept> — data,
    total (the full array's length), limit, offset, and pageCount computed by pageCountOf(total, limit)
    rather than hardcoded.
- criterion: Calling listConcepts against a glossary holding no concepts returns an empty page rather
    than an error.
  met: true
  how: When IGlossaryStore.readConcepts() answers an empty array, concepts() answers an empty array, and
    .slice() on it yields an empty data array with total 0 and pageCountOf(0, limit) evaluating to 0 for
    a positive limit — no branch treats absence as an error.
nodes:
- node: contracts/glossary/glossary-query
  how: The contract lists list-concepts as one of the four published operations; IGlossaryQuery.listConcepts
    is declared exactly for it, and GlossaryService.listConcepts answers it by reading the glossary's
    current holding synchronously and in-process on every call, never remembering a prior read.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/concept
  how: listConcepts answers the Concept value object exactly as the node declares it — name, accepts (subject
    types, many) and ttl (integer, required, defaulted to the project's already-established sixty seconds
    where a registration states none) — through the same concepts() helper readConcept already reuses,
    so the concept's two published guarantees (unique name, ttl present) hold for the listing exactly
    as they hold for the single read.
  encoded_at:
  - src/glossary/glossary.service.ts
preserved:
- The sibling listVocabularyTerms operation in these same two files, delivered under task/glossary-query-http/list-vocabulary-terms-query-extension,
  was read but left completely untouched — not modified, not claimed by this record.
- terms()/readVocabularyTerm's existing behavior (the outcome vocabulary's non-conclusion-outcome seeding,
  duplicate-name assertion) is unaffected; listConcepts never calls into the term-vocabulary path.
- The private pageCountOf helper and assertUniqueNames helper, already shared between the two list operations,
  are unchanged.
---

## What it is

A new read-only IGlossaryQuery method, listConcepts, with no new refusal rule.

## Notes

No inferences and no divergences were required — the implementation reuses every helper the sibling listVocabularyTerms operation already established, with nothing left to defer. The widened IGlossaryQuery interface required minimal listVocabularyTerms/listConcepts stubs in several unrelated test fakes, a mechanical fix shared with and disclosed under the sibling list-vocabulary-terms-query-extension task's own proof.
