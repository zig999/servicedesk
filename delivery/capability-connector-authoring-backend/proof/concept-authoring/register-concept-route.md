---
title: register-concept route — proof for task/concept-authoring/register-concept-route
summary: Eight app.inject() tests against createRegisterConceptRoutesPlugin() with a mocked registerConcept
  dependency, proving the route's create-or-replace pass-through, its silence on authentication, and its
  DTO-level validation refusals.
implementation: sha256:2296c91a4acc48b1a87616d1b518d147ce44dce6ded8f09976f1a217367d28ec
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-authoring-register-concept-route-suite
tests:
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 200 with the held concept registerConcept resolved, for a valid registration at the name
    the path names
  proves: Criterion 1 — registering at a name that does not yet exist creates it and the response reflects
    the registered concept.
  fails_when: the route answers a status other than 200, or answers a body other than exactly what registerConcept
    resolved
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: composes the path-carried name with the body into one registration, calling registerConcept with
    it exactly
  proves: the controller/route pair forwards the path's :name and the body's accepts/ttl into one ConceptRegistration
    unmodified — the mechanism criterion 1 depends on
  fails_when: registerConcept is called with a different shape than { name, accepts, ttl }
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers each of two requests at the same name with that request's own resolution, never a cached
    or joined value
  proves: Criterion 2 — a second registration at an already-held name replaces in place rather than accumulating,
    at the route's own level (the store-level replace-in-place fact is GlossaryService's own tests' to
    establish)
  fails_when: the second response echoes the first, the two calls are merged, or registerConcept is not
    called exactly twice with each call's own distinct arguments
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
    header
  proves: Criterion 3 — a request with no credential at all is not refused for lacking one.
  fails_when: the route answers 401/403 (or any non-200) for a request carrying no authentication header
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
    dispatching it exactly as one that carries none
  proves: Criterion 3, strengthened — an unrecognized credential is treated identically to none
  fails_when: the route answers anything other than 200 upon seeing an authorization header it does not
    recognize
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 400 for a wholly empty body, without ever reaching registerConcept
  proves: basic DTO validation — the required accepts attribute is enforced before the service is reached
  fails_when: an empty body is accepted, or registerConcept is called despite the missing required field
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 400 via validation for a request with an empty :name segment, never 404 route not found
  proves: basic path-param validation — an empty :name is refused by registerConceptParamsSchema rather
    than accepted or producing a routing 404
  fails_when: the response is 404 or 200, or registerConcept is called
not_applicable:
- edge_case: every domain-error-to-status-code mapping test register-capability.routes.spec.ts carries
    (CapabilitySchemaNotWellFormedError, CapabilityNotReadOnlyError, ConceptAlreadyAnsweredError, etc.)
  why: this task names no such refusal in its criteria, GlossaryService.registerConcept's own error surface
    is not part of this task's objective, and the implementation record's own deferred entry (DuplicateGlossaryNameError
    reaching the shared handler unmapped) is pre-existing behavior this task did not introduce
- edge_case: a generic/unexpected-error-from-the-service test (register-capability's own 500-with-generic-envelope
    case)
  why: this task's criteria state nothing about error presentation this file would need to prove beyond
    the validation-refusal envelope already exercised
- edge_case: a POST-to-the-same-URL-answers-404 test for the PUT-only inference
  why: not one of the three stated criteria; the scope narrowed this file to the three criteria plus basic
    validation
- edge_case: a separate answers-200-rather-than-201-for-both-new-and-existing-names status-distinction
    test
  why: already subsumed by the first criterion-1 test (asserts 200) and the criterion-2 test (asserts
    200 on both calls at the same name) — a third test asserting the same fact would not fail for a different
    reason
- edge_case: duplicate-array-membership or empty-accepts-array edge cases for the body schema
  why: the implementation record's own inference states accepts must be an array of non-empty strings
    but not itself non-empty, and this is not one of the three criteria this task states
untested:
- the store-level fact that a name already held is genuinely replaced rather than duplicated (as opposed
  to the route merely forwarding requests without caching) is not proved by this file — it depends on
  GlossaryService.registerConcept and the store's write path, out of this route/controller/DTO layer's
  own reach; that proof sits at task/concept-authoring/glossary-store-concept-write's own delivery, which
  this task depends on and does not re-prove
---

## What it is

Eight app.inject() tests against register-concept's route, proving its create-or-replace pass-through, its silence on authentication, and basic DTO validation.

## Notes

None.
