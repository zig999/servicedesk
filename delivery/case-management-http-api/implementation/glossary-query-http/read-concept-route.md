---
title: GET /v1/glossary/concepts/{name}
summary: A thin Fastify plugin, controller and Zod DTO exposing the existing read-concept glossary-query
  operation over HTTP, with a new typed error for the concept-not-held refusal.
task: sha256:9a43f457c73470cd029f571cb6e767844efae4d08e7585813fdc1cd73a63596d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
files:
- path: src/http/dto/read-concept.dto.ts
  effect: declares readConceptParamsSchema for the :name path segment, and readConceptResponseSchema carrying
    a concept's name, accepted subject types and ttl.
- path: src/http/read-concept.controller.ts
  effect: maps a validated params DTO to IGlossaryQuery.readConcept, returns the held concept's attributes
    unchanged on held:true, and raises ConceptNotHeldError on held:false.
- path: src/http/read-concept.routes.ts
  effect: registers GET /v1/glossary/concepts/:name as a Fastify plugin, validating the path parameter
    before the controller is reached.
- path: src/errors/concept-not-held.error.ts
  effect: adds the typed ConceptNotHeldError, raised only at this route's HTTP boundary once glossary-query.port.ts's
    own ConceptResolution answers held:false, carrying the unresolved name as its context.
- path: src/errors/status-map.ts
  effect: maps ConceptNotHeldError to 404 alongside the existing entries.
criteria:
- criterion: A valid request returns the named concept exactly as the glossary currently holds it, including
    its accepted subject types and its ttl.
  met: true
  how: handleReadConceptRequest calls IGlossaryQuery.readConcept(params.name) and, on held:true, returns
    { name, accepts, ttl } built straight from the resolved Concept.
- criterion: A request naming a concept the glossary does not hold is refused with the status status-map
    assigns.
  met: true
  how: on held:false the controller raises ConceptNotHeldError; it propagates to error-handler.middleware.ts,
    whose call to statusForError resolves it to the 404 now entered in STATUS_BY_ERROR_CLASS.
nodes:
- node: contracts/glossary/glossary-query
  how: the route and controller are a thin transport wrapper over the contract's own read-concept operation,
    adding no domain logic.
  encoded_at:
  - src/http/read-concept.controller.ts
  - src/http/read-concept.routes.ts
- node: domain/glossary/concept
  how: readConceptResponseSchema carries exactly the node's three attributes — name, accepts and ttl.
  encoded_at:
  - src/http/dto/read-concept.dto.ts
inferences:
- inferred: ConceptNotHeldError is a new typed error distinct from capability-registry's own ConceptNotAnsweredError,
    rather than a reuse of it.
  from: concept-not-answered.error.ts's own doc comment ties it to a different bounded context and a different
    resolution type; the glossary's own vocabulary is consistently 'held'/'holds' never 'answers'.
- inferred: ConceptNotHeldError is a distinct class from the existing ConceptNotInGlossaryError, not a
    reuse, though both sit in the glossary bounded context.
  from: concept-not-in-glossary.error.ts's own doc comment and context shape show it answers a different
    criterion — a write-side refusal for a hypothesis-revision — with a different caller and context shape.
- inferred: the response's ttl field is required and constrained positive, never optional or unconstrained
    on the wire.
  from: rules/knowledge/a-collected-concept-declares-a-ttl guarantees every held concept carries a ttl;
    read-capability.dto.ts's own precedent treats a required duration the same way.
preserved:
- Every existing entry of STATUS_BY_ERROR_CLASS in status-map.ts continues to resolve to the same status
  it did before this change.
- error-handler.middleware.ts's existing behavior for every other route is unchanged.
deferred:
- what: wiring createReadConceptRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns this; widening this task to cover app
    composition was not this task's objective.
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-concept operation.

## Notes

None.
