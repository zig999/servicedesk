---
title: GET /v1/glossary/{vocabulary}/{name}
summary: A thin Fastify route, controller and Zod DTO exposing the existing read-vocabulary-term glossary-query
  operation over HTTP.
task: sha256:55bc889b0b74bb9b8d7bb7d37b5c905df70b418712eaa88059c0e144ecde6603
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
files:
- path: src/http/dto/read-vocabulary-term.dto.ts
  effect: declares readVocabularyTermParamsSchema (validating :vocabulary against TERM_VOCABULARIES's
    closed set of five and :name as non-empty) and readVocabularyTermResponseSchema (the term's bare name
    attribute).
- path: src/http/read-vocabulary-term.controller.ts
  effect: handleReadVocabularyTermRequest maps validated params to IGlossaryQuery.readVocabularyTerm,
    answers the held term's name unchanged, and raises VocabularyTermNotHeldError when held:false.
- path: src/http/read-vocabulary-term.routes.ts
  effect: createReadVocabularyTermRoutesPlugin registers GET /v1/glossary/:vocabulary/:name, validating
    params before calling the controller.
- path: src/errors/vocabulary-term-not-held.error.ts
  effect: adds VocabularyTermNotHeldError, distinct from ConceptNotHeldError, carrying { vocabulary, name
    } as context.
- path: src/errors/status-map.ts
  effect: adds VocabularyTermNotHeldError to STATUS_BY_ERROR_CLASS mapped to 404.
criteria:
- criterion: A valid request returns the named term exactly as the glossary currently holds it.
  met: true
  how: 'handleReadVocabularyTermRequest calls IGlossaryQuery.readVocabularyTerm(vocabulary, name) and,
    on held:true, answers { name: resolution.term.name } unchanged.'
- criterion: A request naming a term the glossary does not hold is refused with the status status-map
    assigns.
  met: true
  how: on held:false the controller raises VocabularyTermNotHeldError; it propagates to the shared error
    handler, which resolves it through statusForError to 404.
nodes:
- node: contracts/glossary/glossary-query
  how: exposes the published read-vocabulary-term operation over HTTP, adding no domain logic.
  encoded_at:
  - src/http/read-vocabulary-term.routes.ts
  - src/http/read-vocabulary-term.controller.ts
  - src/http/dto/read-vocabulary-term.dto.ts
- node: domain/glossary/subject-type
  how: one of the five literals TERM_VOCABULARIES holds; admitted as a valid :vocabulary path segment.
  encoded_at:
  - src/http/dto/read-vocabulary-term.dto.ts
- node: domain/glossary/action
  how: same closed-set admission and bare-name response shape, for the action vocabulary.
  encoded_at:
  - src/http/dto/read-vocabulary-term.dto.ts
- node: domain/glossary/recipient
  how: same closed-set admission and bare-name response shape, for the recipient vocabulary.
  encoded_at:
  - src/http/dto/read-vocabulary-term.dto.ts
- node: domain/glossary/outcome
  how: same closed-set admission and bare-name response shape, for the outcome vocabulary — including
    the two non-conclusion outcomes.
  encoded_at:
  - src/http/dto/read-vocabulary-term.dto.ts
- node: domain/glossary/subject-attribute
  how: same closed-set admission and bare-name response shape, for the subject-attribute vocabulary.
  encoded_at:
  - src/http/dto/read-vocabulary-term.dto.ts
inferences:
- inferred: a new typed error (VocabularyTermNotHeldError), distinct from ConceptNotHeldError, is the
    right shape for this held:false-to-error boundary.
  from: TermResolution's held:false branch carries { vocabulary, name } — a field ConceptNotHeldError's
    context has no slot for; the inventory's own convention states a domain refusal is raised as a typed
    error class carrying a distinct name and context object.
- inferred: the response carries only the term's name, with no vocabulary field of its own.
  from: 'GlossaryTerm (terms.ts) declares exactly one attribute, name; TermResolution''s held branch carries
    term: GlossaryTerm and nothing else.'
- inferred: VocabularyTermNotHeldError resolves to 404, grouped with CaseNotFoundError/ConceptNotAnsweredError/ConceptNotHeldError.
  from: 'status-map.ts''s own grouping comment: ''a resource that plainly does not exist answers 404''.'
preserved:
- status-map.ts's existing entries and their statuses are unchanged; the new entry is appended rather
  than reordered.
- the read-concept route, controller and DTO are untouched; this task adds a sibling file set.
- GlossaryService.readVocabularyTerm and GlossaryService.terms are consumed as published, unmodified.
deferred:
- what: wiring createReadVocabularyTermRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every route of this surface
    once it all exists.
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-vocabulary-term operation, covering all five vocabulary kinds.

## Notes

None.
