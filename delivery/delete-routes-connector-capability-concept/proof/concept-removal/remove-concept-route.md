---
target: backend
title: Proof for the remove-concept HTTP route
summary: A new remove-concept.routes.spec.ts proves the route's own criteria (path/method, malformed-path
  refusal, named-refusal mapping to 409, unmapped-error propagation, unconditional 204/no-body answer),
  the build-app.spec.ts fixture is repaired for the now-required removeConcept dependency, and one added
  build-app.spec.ts test proves the route's path/method share register-concept's own PUT path without
  colliding, wiring it through the real build.
implementation: sha256:5af16fd45547120548b88fd7ffba2e2800f8481892aa29c5f66392c4bbb42e91
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/concept-removal-remove-concept-route-suite-2
tests:
- file: src/__tests__/unit/http/remove-concept.routes.spec.ts
  name: answers 204 with a wholly empty body, identically for a concept currently held and one nothing
    answers, records, cites or collects
  proves: Criterion 5's HTTP-boundary half (removeConcept invoked with the exact name for both a held
    and an absent concept, this route answering identically); constraints/a-successful-concept-removal-answers-with-no-content's
    own stated fitness, whole.
  fails_when: Either call answers a status other than 204, either body is non-empty, removeConcept is
    not invoked with the exact name, or the two calls answer differently from one another.
  demonstrates: constraints/a-successful-concept-removal-answers-with-no-content
- file: src/__tests__/unit/http/remove-concept.routes.spec.ts
  name: answers 400 via validation for a request with an empty :name segment, never reaching removeConcept
  proves: Criterion 2 (a path segment failing the declared shape is refused with HTTP 400, code VALIDATION_ERROR,
    a message naming the path, and a non-empty details list).
  fails_when: The response is anything other than HTTP 400, the code is not VALIDATION_ERROR, the message
    does not name the path, details is empty, or removeConcept is invoked despite the malformed segment.
- file: src/__tests__/unit/http/remove-concept.routes.spec.ts
  name: answers HTTP 409 naming ConceptInUseError and its (concept, reference) context as details, when
    removeConcept rejects with that class
  proves: Criterion 3 (the operation's refusal error is named in the status map, so it is not answered
    with the generic 500 fallback).
  fails_when: The response is anything other than HTTP 409, the code is not ConceptInUseError, or the
    details do not carry the exact concept and reference the error's own context holds.
- file: src/__tests__/unit/http/remove-concept.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeConcept
    rejects with a generic, non-domain error
  proves: Criterion 7 (the controller re-raises whatever the operation raises rather than mapping it to
    a response itself).
  fails_when: The response carries any status, code or body other than the shared handler's generic 500
    INTERNAL_ERROR envelope, or the rejected error's own message reaches the response.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers the DELETE to /v1/glossary/concepts/{name} through remove-concept and the PUT to the identical
    path through register-concept, neither one colliding with the other
  proves: Criterion 1 together with Criterion 8, both exercised through the real buildApp()/BuildAppDependencies
    wiring.
  fails_when: The DELETE answers anything other than 204, the PUT answers anything other than 200, or
    either request is dispatched to the other route's handler or answers 404/405 from a routing collision.
not_applicable:
- edge_case: An entirely absent path (DELETE /v1/glossary/concepts with no name segment at all)
  why: Fastify's router refuses it before any request is dispatched to this route's handler, so it is
    a routing-level 404 no criterion of this task governs.
- edge_case: A slow or unavailable dependency behind removeConcept
  why: No criterion or node names a timeout, retry or degraded-dependency behavior for this route.
- edge_case: Two removal requests against the same concept name at once
  why: Concurrency safety, if any, is the store's own transaction boundary, not this HTTP surface's.
- edge_case: A malformed request body accompanying the DELETE
  why: This route declares no body schema — removeConceptParamsSchema validates only the path.
- edge_case: Criterion 6's file-layout fact (four separate files) tested as an observable runtime behavior
  why: It is a file-layout fact, not an observable runtime behavior, so no test asserts it directly —
    it is evidenced by the implementation record's own files list.
untested:
- 'contracts/glossary/glossary-authoring: the contract''s whole fact spans both its published operations
  (register-concept and remove-concept); this task''s tests exercise only remove-concept.'
- 'domain/glossary/concept: the value object''s whole fact covers all four declared attributes (name,
  accepts, ttl, description) and its full responsibility; this task''s route carries only the name identity,
  no other attribute.'
- 'rules/glossary/a-registered-concept-is-never-removed: at the HTTP/controller layer the dependency is
  a mock that resolves or rejects exactly as told; no test at this layer can decide whether the guard
  truly reads a registered capability, collected evidence, a citation or a hypothesis-revision''s own
  collects before refusing — that is the sibling operation task''s (glossary.service.ts) own suite. The
  rule''s registering clause belongs to register-concept, untouched here, and its closing clause about
  what a removal takes with it (the concept''s own accepts declaration) is the store''s, per the task''s
  own Notes.'
- 'constraints/a-malformed-request-is-refused-with-a-validation-error: the constraint''s own scope is
  system-wide, over path, query and body across the whole surface; this task''s test decides only the
  path case for this one route.'
- 'constraints/a-domain-error-unmapped-by-status-is-refused-generically: the constraint''s own scope is
  system-wide, over any domain error the status map does not name across any route; this task''s test
  decides only one error class (a generic Error) at this one route.'
- 'constraints/no-route-enforces-authentication: the constraint''s own scope is system-wide; the pre-existing
  build-app.spec.ts sweep (its two tests scanning every file under the API layer for an authentication
  package or guard, plus the credential-free dispatch sweep over every registered route) already extends
  to remove-concept.controller.ts and remove-concept.routes.ts at test-run time without modification,
  since both files sit under the swept HTTP-layer directory and the new route is now registered in routePluginFactories.
  No test this proof itself adds decides the whole system fact. Criterion 4 (no route enforces authentication)
  is likewise left to that pre-existing sweep rather than a dedicated test here.'
- 'constraints/the-concept-read-refuses-an-unanswered-concept: already decided whole by read-concept.routes.spec.ts''s
  own pre-existing suite, unmodified by this task; no test this proof adds exercises the read route itself,
  so criterion 5''s "subsequent read" half rests on that neighboring, untouched suite rather than anything
  this proof contributes.'
- UNDERDETERMINED, from the specification — constraints/a-successful-concept-removal-answers-with-no-content
  states HTTP 204 with no body; no criterion names that status or the absent body, so nothing in the criteria
  alone holds a differently-shaped success answer to account. The node's own fact is nonetheless demonstrated
  above; this entry records that the criteria do not, by themselves, exclude an alternative. The Notes
  entry names no implementation the criteria would still accept while diverging further, so no test is
  written against it.
- UNDERDETERMINED, from the specification — the rule names the refusal's own transport value, HTTP 409
  naming ConceptInUseError; criterion 3 requires only that the error be named in the status map, not what
  it is named to or what status it carries. This entry observes a clause the criterion does not reach;
  it names no implementation criterion 3 would still accept while diverging further, so no test is written
  against it.
---

## What it is
The tests proving remove-concept-route: unconditional 204/no-body answer, malformed-path 400 refusal, 409 mapping for ConceptInUseError, generic-error propagation, and wiring through the real application build alongside register-concept on the same path. This is the last of the eleven planned delivery tasks.

## Notes
run/concept-removal-remove-concept-route-build failed typecheck, cause: code — build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeConcept field. Fixed by the test-author's proof pass.
