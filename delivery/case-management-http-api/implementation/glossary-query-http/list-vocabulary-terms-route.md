---
title: GET /v1/glossary/{vocabulary}
summary: A thin Fastify plugin, controller and Zod DTO expose IGlossaryQuery.listVocabularyTerms over
  HTTP, refusing an unrecognized vocabulary segment at the DTO boundary alone.
task: sha256:354fbeca313d30e2332dfa9113d39fbd84c94c1f8debca2ffd1530741f2160f0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-build
files:
- path: src/http/dto/list-vocabulary-terms.dto.ts
  effect: Declares listVocabularyTermsParamsSchema (vocabulary validated against z.enum(TERM_VOCABULARIES))
    and listVocabularyTermsQuerySchema (offset/limit, coerced and optional, mirroring list-cases.dto.ts),
    plus their inferred Dto types. Declares no response schema, since the route answers the shared PaginatedResponse<GlossaryTerm>.
- path: src/http/list-vocabulary-terms.controller.ts
  effect: Declares ListVocabularyTermsControllerDependencies (glossaryQuery, defaultLimit, maxLimit) and
    handleListVocabularyTermsRequest, which resolves the query's optional offset/limit against the configured
    bound (resolvePagination) and calls dependencies.glossaryQuery.listVocabularyTerms(params.vocabulary,
    pagination), answering with the resolved page unchanged.
- path: src/http/list-vocabulary-terms.routes.ts
  effect: Registers GET /v1/glossary/:vocabulary as a Fastify plugin closed over its dependencies; validates
    :vocabulary and the query string in that order before the controller is reached, answering 400 VALIDATION_ERROR
    for either failure and 200 with the resolved page otherwise. Sets no error handler of its own.
criteria:
- criterion: A valid request against a recognized vocabulary returns a paginated page of every term it
    currently holds.
  met: true
  how: listVocabularyTermsParamsSchema and listVocabularyTermsQuerySchema validate :vocabulary and the
    query string before the controller is reached; handleListVocabularyTermsRequest resolves offset/limit
    against the configured defaultLimit/maxLimit (resolvePagination) and calls glossaryQuery.listVocabularyTerms(vocabulary,
    pagination), and the route answers 200 with the PaginatedResponse<GlossaryTerm> it resolves, unchanged.
- criterion: A request naming a vocabulary the glossary does not recognize is refused with the status
    status-map assigns.
  met: true
  how: 'Satisfied by the DTO-level 400, not by any status-map entry: listVocabularyTermsParamsSchema''s
    vocabulary field is z.enum(TERM_VOCABULARIES), so a :vocabulary segment outside the five recognized
    vocabularies fails Zod validation before the controller or IGlossaryQuery.listVocabularyTerms is ever
    reached, and the route answers the same plain 400 VALIDATION_ERROR envelope every other malformed
    segment of this route answers with. This is ''the status status-map assigns'' in exactly the sense
    read-vocabulary-term-route''s own delivered criterion is satisfied by it: a validation refusal that
    never reaches any domain error status-map would resolve, since IGlossaryQuery.listVocabularyTerms/readVocabularyTerm
    raise no typed error for an unrecognized vocabulary at all. See the divergence below for the correction
    to this task''s own Notes.'
nodes:
- node: contracts/glossary/glossary-query
  how: list-vocabulary-terms is one of the four operations this contract's own frontmatter names; this
    delivery is the HTTP transport that exposes it — GET /v1/glossary/{vocabulary} validates the request,
    calls the operation unchanged, and answers with the paginated page it resolves.
  encoded_at:
  - src/http/dto/list-vocabulary-terms.dto.ts
  - src/http/list-vocabulary-terms.controller.ts
  - src/http/list-vocabulary-terms.routes.ts
- node: domain/glossary/subject-type
  how: This route accepts 'subject-type' as one of the five values listVocabularyTermsParamsSchema's z.enum(TERM_VOCABULARIES)
    admits, and lists whatever terms that vocabulary currently holds through the unchanged domain operation.
    Honored, not encoded — the node's own name attribute already lives in terms.ts.
- node: domain/glossary/action
  how: Honored the same way as subject-type — 'action' is one of the five accepted TERM_VOCABULARIES values,
    listed through the unchanged domain operation, with no new fact of this node's own added by this transport-only
    delivery.
- node: domain/glossary/recipient
  how: Honored the same way as subject-type — 'recipient' is one of the five accepted TERM_VOCABULARIES
    values, listed through the unchanged domain operation, with no new fact of this node's own added by
    this transport-only delivery.
- node: domain/glossary/outcome
  how: Honored the same way as subject-type — 'outcome' is one of the five accepted TERM_VOCABULARIES
    values, listed through the unchanged domain operation (which already includes the two non-conclusion
    outcomes in its page and its total per the query-extension task), with no new fact of this node's
    own added by this transport-only delivery.
- node: domain/glossary/subject-attribute
  how: Honored the same way as subject-type — 'subject-attribute' is one of the five accepted TERM_VOCABULARIES
    values, listed through the unchanged domain operation, with no new fact of this node's own added by
    this transport-only delivery.
inferences:
- inferred: The path parameter and the query string are validated by two separate schemas, listVocabularyTermsParamsSchema
    and listVocabularyTermsQuerySchema, in one file, rather than one combined schema or two files.
  from: This route is the first needing both a path-only DTO pattern (read-vocabulary-term.dto.ts) and
    a query-only DTO pattern (list-cases.dto.ts/list-concepts.dto.ts) at once, so naming each half separately
    reads the same way either sibling does, while one file keeps the two DTOs of one route beside each
    other per DTO-03's naming convention.
divergences:
- from: 'This task''s own ## Notes, which state that criterion 2''s refusal ''reuses the same typed error
    read-vocabulary-term already raises... resolved by task/case-lifecycle-http/status-map'''
  departure: No typed error is reused and no status-map entry is added or consulted. Instead, an unrecognized
    :vocabulary segment is refused by listVocabularyTermsParamsSchema's z.enum(TERM_VOCABULARIES) alone,
    answering the same plain 400 VALIDATION_ERROR envelope this route answers every other malformed segment
    with, before the controller or IGlossaryQuery.listVocabularyTerms is ever reached.
  why: read-vocabulary-term-route's own actual delivered code shows its own refusal for an unrecognized
    vocabulary is exactly this DTO-level 400, with no typed error and no status-map involvement — status-map
    only ever sees VocabularyTermNotHeldError, a different case (an unrecognized name within a recognized
    vocabulary). This is independently confirmed by task/glossary-query-http/list-vocabulary-terms-query-extension's
    own implementation and proof records, and by this route's own test-author. Following the task's note
    as written would have meant inventing a runtime error path that does not exist anywhere in this codebase.
preserved:
- list-concepts.routes.ts's static GET /v1/glossary/concepts and read-vocabulary-term.routes.ts's two-segment
  GET /v1/glossary/:vocabulary/:name, both left untouched — Fastify resolves the new GET /v1/glossary/:vocabulary
  beside them without collision because a static route is matched ahead of a parameterized one and the
  two-segment route is a distinct shape.
- IGlossaryQuery.listVocabularyTerms and GlossaryService's existing implementation of it, left exactly
  as task/glossary-query-http/list-vocabulary-terms-query-extension delivered them — not modified by this
  task.
- Every existing route file and its own behavior under src/http/, none of which this task touched.
deferred:
- what: Registering this route's plugin into the running app (build-app.ts) and wiring glossaryQuery/defaultLimit/maxLimit
    for it through src/factories/glossary.factory.ts.
  why: That wiring belongs to task/case-lifecycle-http/register-routes-in-build-app, which this task's
    own plan edges declare depends on it.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listVocabularyTerms query operation, spanning subject-type, action, recipient, outcome and subject-attribute.

## Notes

The task's own Notes mischaracterized criterion 2's mechanism (claimed a typed-error/status-map path that does not exist in this codebase, including in the very route it cites as precedent); the correction is disclosed above as a divergence rather than silently followed or silently fixed.
