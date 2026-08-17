---
title: Proof for GET /v1/glossary/concepts/{name}
summary: Fastify inject tests against a locally-assembled app proving both of the task's criteria — a
  held concept answers whole on the wire, and an unheld one is refused at the status status-map.ts assigns
  ConceptNotHeldError.
implementation: sha256:1021a01c82891f1f0ed4eb076e1b9d91948a4f8e236f39d5417b0dd7de812401
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
tests:
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers 200 with the concept currently held by the glossary, including its accepted subject types
    and its ttl
  proves: Criterion 1
  fails_when: the route answers a status other than 200, or the body omits, renames, or mismatches name,
    accepts or ttl.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: resolves the concept exactly as the path spelled it, case and hyphenation preserved, never normalized
  proves: Criterion 1's 'exactly' half.
  fails_when: the route trims, lower-cases or otherwise transforms the path segment before calling readConcept.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers each of two requests naming different concepts with that request's own resolution, never
    a cached or joined value
  proves: Criterion 1, each request's own answer.
  fails_when: the second request's body carries any attribute from the first request's resolution.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: refuses with the status the status map assigns ConceptNotHeldError, when the glossary does not
    currently hold the named concept
  proves: Criterion 2
  fails_when: the response status is anything other than 404, or the error envelope's code or details
    do not name ConceptNotHeldError and the requested name.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers 404 for a request naming no concept segment at all, never reaching the glossary query
  proves: EDG-01 absent input.
  fails_when: the glossary query is invoked for a request with no :name segment.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers 500 with a generic message, never the rejected call's own error text, when the glossary
    query itself rejects
  proves: EDG-08 / SEC-04.
  fails_when: the response status is anything other than 500, or the rejected call's own message text
    appears in the response body.
not_applicable:
- edge_case: a duplicate concept name, or an operation attempted against state that forbids it
  why: read-concept is a pure lookup with no uniqueness constraint and no mutable state of its own.
- edge_case: a boundary at either end of a numeric range
  why: the route's only input is a free-form string name, no numeric parameter.
- edge_case: an empty collection answered back
  why: read-concept answers one concept or its stated absence, never a collection.
- edge_case: two operations against one subject at once
  why: no bound node states a concurrency guarantee for two simultaneous reads of the same name.
untested:
- 'readConceptHandler''s own 400 VALIDATION_ERROR branch (an empty :name segment failing min(1)) is never
  exercised: Fastify''s routing confirms an empty :name segment never reaches the schema, and every non-empty
  string satisfies min(1).'
---

## What it is

Six Fastify-injected tests proving both criteria over a locally-assembled app.

## Notes

None.
