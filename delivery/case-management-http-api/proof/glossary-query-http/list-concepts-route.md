---
title: Proof for glossary-query-http/list-concepts-route
summary: Fastify-level tests proving GET /v1/glossary/concepts answers 200 with the resolved PaginatedResponse<Concept>,
  resolves pagination bounds the way list-cases.routes.ts's own inference does, and refuses malformed
  offset/limit with 400 before ever reaching the glossary query.
implementation: sha256:2d91a160f5f55d5e6fe0f93c64ded76d0d266eb4828b8a28139e7e65cd6ba75f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-suite
tests:
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 200 with the paginated page of every concept currently registered the glossary query resolved,
    for a request naming its own offset and limit
  proves: A valid request returns a paginated page of every concept currently registered.
  fails_when: the route answers a status other than 200, or a body other than exactly the page IGlossaryQuery.listConcepts
    resolved
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: passes the request's own offset and limit through to the glossary query unchanged, when both are
    given and within bounds
  proves: A valid request returns a paginated page of every concept currently registered.
  fails_when: the controller recomputes, drops or otherwise changes an in-bounds offset/limit before calling
    listConcepts
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares
    — data, limit, offset, pageCount and total — nothing more and nothing less
  proves: The response body matches the pagination envelope src/types/pagination.ts defines.
  fails_when: the response body gains, drops or renames a field of PaginatedResponse<Concept>
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: defaults offset to 0 when the request names none
  proves: the controller's own inferred resolution of an absent offset (mirroring list-cases.controller.ts's
    own inference)
  fails_when: an absent offset is passed through as anything other than 0, or the request is refused instead
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
  proves: the controller's own inferred resolution of an absent limit against defaultLimit
  fails_when: an absent limit resolves to anything other than the configured defaultLimit, or is left
    undefined
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
  proves: the controller's own inferred clamping of an oversized limit against maxLimit
  fails_when: a limit above maxLimit is passed through unclamped, or the request is refused with 400 instead
    of served at maxLimit
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: passes a limit exactly equal to the configured maxLimit through unclamped
  proves: the boundary of the clamping inference — maxLimit itself is not treated as already over the
    bound
  fails_when: a limit exactly equal to maxLimit is altered or the call is not made with that exact value
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when the
    glossary query resolves an empty glossary
  proves: The response body matches the pagination envelope src/types/pagination.ts defines. (the empty-collection
    edge case)
  fails_when: an empty page from the glossary query is altered, wrapped or answered as anything other
    than the same empty envelope
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 400 for a non-numeric offset, without ever reaching the glossary query
  proves: EDG-01 — absent-vs-malformed input is refused at the validation boundary before the glossary
    query is reached
  fails_when: a non-numeric offset is coerced to a number and reaches listConcepts, or the response is
    not 400
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 400 for a non-numeric limit, without ever reaching the glossary query
  proves: EDG-01, for a malformed limit
  fails_when: a non-numeric limit is coerced and reaches listConcepts, or the response is not 400
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 400 for a negative offset, one below the nonnegative range the schema declares, without
    ever reaching the glossary query
  proves: the schema's nonnegative bound on offset, one below the valid range
  fails_when: offset=-1 is accepted and reaches listConcepts, or the response is not 400
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 400 for a limit of zero, one below the positive range the schema declares, without ever
    reaching the glossary query
  proves: the schema's positive bound on limit, one below the valid range
  fails_when: limit=0 is accepted and reaches listConcepts, or the response is not 400
- file: src/__tests__/unit/http/list-concepts.routes.spec.ts
  name: answers 500 with the generic envelope, never the rejected call's own error text, when the glossary
    query itself rejects
  proves: SEC-04/COR-04 as this route honors them — a dependency failure never leaks its own text to the
    client
  fails_when: the response is not 500, or the response body contains the rejected error's own message
    text
not_applicable:
- edge_case: a duplicate concept appearing twice in one page
  why: neither this task's criteria nor contracts/glossary/glossary-query claims uniqueness within a page;
    that is GlossaryService.listConcepts's own concern, proved separately, and this route asserts nothing
    about the page's own content beyond carrying it through unchanged
- edge_case: an operation attempted against state that forbids it
  why: list-concepts is a pure read with no state transition and no precondition to violate — there is
    no forbidden state for a listing to be attempted against
- edge_case: two operations against one subject at once
  why: list-concepts names no subject (no path or body parameter identifies one resource) and every test
    builds its own isolated Fastify instance and mock, so there is no shared state for two concurrent
    requests to race over
untested:
- the exact shape of the 400 validation-error body (its code, message and per-field details) is not asserted
  here, only its status and that the glossary query was never reached — mirroring list-cases.routes.spec.ts's
  own scope
---

## What it is

Thirteen Fastify-injection tests over createListConceptsRoutesPlugin, with a mocked IGlossaryQuery.

## Notes

Verified by running the whole suite (run/list-route-batch2-suite): all files passing, including the 13 tests in this file directly.
