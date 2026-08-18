---
title: IGlossaryQuery gains listVocabularyTerms
summary: IGlossaryQuery and GlossaryService gain a paginated listVocabularyTerms operation that windows
  one vocabulary's whole in-memory holding by offset and limit, typed over the same closed TermVocabulary
  union readVocabularyTerm already relies on for its only refusal.
task: sha256:044a2fc047d8f86ea579518430385b87feecbf1c8f74c8c8fc60efb53635b2ce
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-build-2
files:
- path: src/glossary/glossary-query.port.ts
  effect: 'Declares listVocabularyTerms(vocabulary: TermVocabulary, pagination: PaginationRequest): Promise<PaginatedResponse<GlossaryTerm>>
    on IGlossaryQuery, documented as reading through the same holding readVocabularyTerm resolves against,
    with no vocabulary-name validation of its own because TermVocabulary''s closed set (terms.ts) is already
    the whole guard. This file also declares the sibling listConcepts operation from task/glossary-query-http/list-concepts-query-extension
    — present, not this task''s own.'
- path: src/glossary/glossary.service.ts
  effect: Implements listVocabularyTerms by reading the vocabulary's full current holding through the
    existing private helper this.terms(vocabulary) (reused, MNT-03) — which already applies assertUniqueNames
    and the outcome vocabulary's non-conclusion-outcome seeding — then windows the in-memory array by
    offset/limit into the PaginatedResponse envelope via the shared pageCountOf helper (0 for a non-positive
    limit, API-03; an out-of-range offset answers an empty data array, API-02). This file also implements
    the sibling listConcepts operation — present, not this task's own.
criteria:
- criterion: Calling listVocabularyTerms with an existing vocabulary name returns every term that vocabulary
    currently holds, paginated per src/types/pagination.ts.
  met: true
  how: listVocabularyTerms reads the vocabulary's whole current holding through this.terms(vocabulary)
    — the exact same store-backed, never-remembered read readVocabularyTerm already uses, including outcome's
    two non-conclusion outcomes and the duplicate-name guard — then slices it by pagination.offset/limit
    and returns the full PaginatedResponse<GlossaryTerm> shape (data, total, limit, offset, pageCount)
    exactly as src/types/pagination.ts declares it, with pageCount always computed from the held array's
    own length and the given limit (API-03) and an out-of-range offset answering an empty data array rather
    than an error (API-02).
- criterion: Calling listVocabularyTerms with a vocabulary name the glossary does not recognize is refused
    with the same typed error the existing read-vocabulary-term operation already raises for an unrecognized
    vocabulary.
  met: true
  how: 'Verified against read-vocabulary-term''s actual current behavior (glossary.service.ts, glossary-query.port.ts,
    relational-glossary-store.repository.ts, and every existing test): readVocabularyTerm raises no runtime
    typed error for an unrecognized vocabulary at all — its only guard is TermVocabulary''s own closed
    five-member union (terms.ts), enforced entirely at compile time. The only place an unrecognized vocabulary
    is ever refused with a typed construct is the Zod schema at the HTTP boundary of the separate task/glossary-query-http/read-vocabulary-term-route,
    out of this task''s IGlossaryQuery-level scope. listVocabularyTerms is therefore typed over the identical
    TermVocabulary union, giving it exactly the same (and only) protection readVocabularyTerm itself has
    — reusing a runtime error read-vocabulary-term does not raise would not be ''the same'' treatment,
    it would be new behavior invented for this operation alone.'
nodes:
- node: contracts/glossary/glossary-query
  how: list-vocabulary-terms is one of the four operations this contract's own frontmatter names; listVocabularyTerms
    answers every term one named vocabulary currently holds, paginated, reading through the glossary's
    current holding on every call as the contract's description requires.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-type
  how: 'listVocabularyTerms accepts ''subject-type'' as one of the five TermVocabulary values and answers
    every subject-type term currently held, paginated, through the same shared listing mechanism every
    one of the five shares. Honored, not newly encoded: subject-type''s own name attribute was already
    encoded in terms.ts by an earlier task.'
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/action
  how: listVocabularyTerms accepts 'action' as one of the five TermVocabulary values and answers every
    action term currently held, paginated, through the same shared listing mechanism, with no new fact
    of this node's own added by this delivery.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/recipient
  how: listVocabularyTerms accepts 'recipient' as one of the five TermVocabulary values and answers every
    recipient term currently held, paginated, through the same shared listing mechanism, with no new fact
    of this node's own added by this delivery.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/outcome
  how: listVocabularyTerms accepts 'outcome' and, by reusing this.terms('outcome'), answers a page that
    already includes the two non-conclusion outcomes the glossary holds before the first case does, counted
    toward the vocabulary's own total and pageCount rather than only appearing in the returned page.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-attribute
  how: listVocabularyTerms accepts 'subject-attribute' as one of the five TermVocabulary values and answers
    every subject-attribute term currently held, paginated, through the same shared listing mechanism,
    with no new fact of this node's own added by this delivery.
  encoded_at:
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary.service.ts
inferences:
- inferred: Criterion 2 is satisfied by TermVocabulary's closed union type alone, with no new runtime
    error introduced for an unrecognized vocabulary at the IGlossaryQuery level.
  from: Direct reading of GlossaryService.readVocabularyTerm's actual implementation, IGlossaryStore/RelationalGlossaryStore,
    and every existing unit and integration test for read-vocabulary-term — none raises or exercises a
    domain-level typed error for an unrecognized vocabulary; the only such refusal exists at the HTTP
    DTO boundary of the separate read-vocabulary-term-route task, outside this task's IGlossaryQuery scope,
    and the plan already cuts a symmetrical list-vocabulary-terms-route task to carry that boundary check
    for the new listing operation.
preserved:
- readVocabularyTerm, readConcept, terms(), concepts(), withNonConclusionOutcomes and assertUniqueNames
  in glossary.service.ts, and their existing behavior and error paths, left exactly as they were.
- listConcepts on IGlossaryQuery and its GlossaryService implementation, and the shared pageCountOf helper
  it also relies on — present in the same two files from the sibling task/glossary-query-http/list-concepts-query-extension,
  left untouched and not claimed as this task's own.
deferred:
- what: Refusing an HTTP request naming a vocabulary segment outside TERM_VOCABULARIES with a 400 validation
    response.
  why: That is the HTTP-boundary concern of task/glossary-query-http/list-vocabulary-terms-route (GET
    /v1/glossary/{vocabulary}), which will validate :vocabulary via Zod exactly as read-vocabulary-term-route
    already does for its own path segment — not this task's IGlossaryQuery-level scope.
---

## What it is

A new read-only IGlossaryQuery method, listVocabularyTerms, spanning subject-type, action, recipient, outcome and subject-attribute.

## Notes

Criterion 2 is a compile-time-only guarantee (TermVocabulary's closed union); no runtime error exists at this layer to reuse, confirmed independently against read-vocabulary-term's own actual behavior rather than assumed. The widened IGlossaryQuery interface required minimal listVocabularyTerms/listConcepts stubs in several unrelated test fakes (case-query.service.spec.ts, validate-case-coherence.spec.ts, investigation-factory.spec.ts, run-diagnosis.spec.ts, read-concept.routes.spec.ts, read-vocabulary-term.routes.spec.ts) purely to keep them compiling — a mechanical fix shared with the sibling list-concepts-query-extension task, disclosed in both tasks' proofs rather than claimed by either implementation alone.
