---
target: backend
title: Proof for the remove-capability HTTP route
summary: A new remove-capability.routes.spec.ts proves the route's own criteria (path/method, malformed-path
  refusal, named-refusal mapping to 409, unmapped-error propagation, unconditional 204/no-body answer),
  the build-app.spec.ts fixture is repaired for the now-required removeCapability dependency, and one
  added build-app.spec.ts test proves the route's path/method share the identity-read route's own path
  without colliding, wiring it through the real build.
implementation: sha256:8dd319e4ab14fad215851fb5f499d345f988b92e6748bd7f8ba7ea4964c82524
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-removal-remove-capability-route-suite-2
tests:
- file: src/__tests__/unit/http/remove-capability.routes.spec.ts
  name: answers 204 with a wholly empty body, identically for a capability identity currently registered
    and one nothing is registered under
  proves: Criterion 5's HTTP-boundary half (removeCapability invoked with the exact name and version for
    both a registered and an absent identity, this route answering identically); constraints/a-successful-capability-removal-answers-with-no-content's
    own stated fitness, whole.
  fails_when: Either call answers a status other than 204 (in particular, the unregistered-identity call
    answering 404), either body is non-empty, removeCapability is not invoked with the exact (name, version)
    pair, or the two calls answer differently from one another.
  demonstrates: constraints/a-successful-capability-removal-answers-with-no-content
- file: src/__tests__/unit/http/remove-capability.routes.spec.ts
  name: answers 400 via validation for a request with an empty :version segment, never reaching removeCapability
  proves: Criterion 2 (a path segment failing the declared shape is refused with HTTP 400, code VALIDATION_ERROR,
    a message naming the path, and a non-empty details list).
  fails_when: The response is anything other than HTTP 400, the code is not VALIDATION_ERROR, the message
    does not name the path, details is empty, or removeCapability is invoked despite the malformed segment.
- file: src/__tests__/unit/http/remove-capability.routes.spec.ts
  name: answers HTTP 409 naming CapabilityCitedByEvidenceError and its (name, version) context as details,
    when removeCapability rejects with that class
  proves: Criterion 3 (the operation's refusal error is named in the status map, so it is not answered
    with the generic 500 fallback).
  fails_when: The response is anything other than HTTP 409, the code is not CapabilityCitedByEvidenceError,
    or the details do not carry the exact name and version the error's own context holds.
- file: src/__tests__/unit/http/remove-capability.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeCapability
    rejects with a generic, non-domain error
  proves: Criterion 7 (the controller re-raises whatever the operation raises rather than mapping it to
    a response itself).
  fails_when: The response carries any status, code or body other than the shared handler's generic 500
    INTERNAL_ERROR envelope, or the rejected error's own message reaches the response.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers the DELETE to /v1/capabilities/{name}/{version} through remove-capability and the GET
    to the identical path through read-capability-by-identity, neither one colliding with the other
  proves: Criterion 1 together with Criterion 8, both exercised through the real buildApp()/BuildAppDependencies
    wiring.
  fails_when: The DELETE answers anything other than 204, the GET answers anything other than 200, or
    either request is dispatched to the other route's handler or answers 404/405 from a routing collision.
not_applicable:
- edge_case: An entirely absent path (DELETE /v1/capabilities with no name or version segment at all)
  why: Fastify's router refuses it before any request is dispatched to this route's handler, so it is
    a routing-level 404 no criterion of this task governs.
- edge_case: A malformed :name segment tested as a distinct case alongside the malformed :version segment
  why: Both segments are validated inside one safeParse call against the identical z.string().min(1) primitive,
    and the obligation (a segment failing the declared shape answers 400 VALIDATION_ERROR) does not change
    behavior by which segment fails; a second test over the other segment would protect nothing the version-segment
    test does not already protect.
- edge_case: A slow or unavailable dependency behind removeCapability
  why: No criterion or node names a timeout, retry or degraded-dependency behavior for this route.
- edge_case: Two removal requests against the same identity at once
  why: Concurrency safety, if any, is the store's own transaction boundary, not this HTTP surface's.
- edge_case: A malformed request body accompanying the DELETE
  why: This route declares no body schema — removeCapabilityParamsSchema validates only the path.
- edge_case: Criterion 6's file-layout fact (four separate files) tested as an observable runtime behavior
  why: It is a file-layout fact, not an observable runtime behavior, so no test asserts it directly —
    it is evidenced by the implementation record's own files list.
untested:
- 'contracts/integration/capability-registry: the contract''s whole fact spans all five operations (read-capability,
  read-capability-by-identity, list-capabilities, register-capability, remove-capability); this task''s
  tests exercise only remove-capability.'
- 'domain/integration/capability-registry: the node''s whole fact spans register/remove/resolve-concept
  and their refusal conditions; this task''s files touch only the removal delegation.'
- 'domain/integration/capability: the aggregate''s whole fact covers all nine declared attributes and
  both responsibilities; this task''s route carries only the (name, version) identity, no other attribute.'
- 'rules/integration/a-registered-capability-cited-by-evidence-is-never-removed: at the HTTP/controller
  layer the dependency is a mock that resolves or rejects exactly as told; no test at this layer can decide
  whether the guard truly reads collected evidence before refusing — that is the sibling operation task''s
  (capability-registry.service.ts) own suite.'
- 'constraints/a-malformed-request-is-refused-with-a-validation-error: the constraint''s own scope is
  system-wide, over path, query and body across the whole surface; this task''s test decides only the
  path case for this one route.'
- 'constraints/a-domain-error-unmapped-by-status-is-refused-generically: the constraint''s own scope is
  system-wide, over any domain error the status map does not name across any route; this task''s test
  decides only one error class (a generic Error) at this one route.'
- 'constraints/no-route-enforces-authentication: the constraint''s own scope is system-wide; the pre-existing
  build-app.spec.ts sweep (its two tests scanning every file under the API layer for an authentication
  package or guard) already extends to remove-capability.controller.ts and remove-capability.routes.ts
  at test-run time, but no test this proof itself adds decides the whole system fact. Criterion 4 (no
  route enforces authentication) is likewise left to that pre-existing sweep rather than a dedicated test
  here.'
- 'constraints/the-capability-identity-read-refuses-an-unregistered-identity: already decided whole by
  read-capability-by-identity.routes.spec.ts''s own pre-existing 404 test, unmodified by this task; no
  test this proof adds exercises the read route itself, so criterion 5''s "subsequent identity read" half
  rests on that neighboring, untouched suite rather than anything this proof contributes.'
- UNDERDETERMINED, from the specification — constraints/a-successful-capability-removal-answers-with-no-content
  states HTTP 204 with no body; no criterion names that status or the absent body, so nothing in the criteria
  alone holds a differently-shaped success answer to account. The node's own fact is nonetheless demonstrated
  above; this entry records that the criteria do not, by themselves, exclude an alternative.
- UNDERDETERMINED, from the specification — the rule names the refusal's own transport value, HTTP 409
  naming CapabilityCitedByEvidenceError; criterion 3 requires only that the error be named in the status
  map, not what it is named to or what status it carries. This entry observes a clause the criterion does
  not reach; it names no implementation criterion 3 would still accept while diverging further, so no
  test is written against it.
---

## What it is
The tests proving remove-capability-route: unconditional 204/no-body answer, malformed-path 400 refusal, cited-refusal 409 mapping, generic-error propagation, and wiring through the real application build alongside the identity-read route on the same path.

## Notes
run/capability-removal-remove-capability-route-build failed typecheck, cause: code — build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeCapability field. Fixed by the test-author's proof pass.
