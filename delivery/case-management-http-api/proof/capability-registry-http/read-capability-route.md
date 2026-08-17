---
title: Proof for GET /v1/capabilities/{concept}
summary: HTTP-layer tests exercising read-capability.routes.ts, read-capability.controller.ts, dto/read-capability.dto.ts
  and the new ConceptNotAnsweredError status-map entry through a locally-assembled Fastify instance (build-app.ts
  does not yet register this route), proving both stated criteria and the pass-through, error-mapping
  and generic-failure behavior the implementation states.
implementation: sha256:96032a47b2222e8422278490cbf2948dfb49801c5c28f3431647acf6770630ba
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
tests:
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: answers 200 with the capability currently answering the named concept, carrying its whole declared
    contract
  proves: Criterion 1
  fails_when: the route/controller answers a status other than 200, an incomplete or altered capability
    body, or a body carrying a field not in readCapabilityResponseSchema's own declared shape.
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: resolves the concept exactly as the path spelled it, case and hyphenation preserved, never normalized
  proves: the implementation's own stated inference that the path parameter reaches ICapabilityQuery.readCapability
    exactly as spelled, with no normalization.
  fails_when: the controller or route lowercases, trims or otherwise transforms the path segment before
    calling readCapability.
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: answers each of two requests naming different concepts with that request's own resolution, never
    a cached or joined value
  proves: no memoization or cross-request leakage in the route/controller.
  fails_when: the second request's response reuses or is derived from the first request's resolution.
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: refuses with the status the status map assigns ConceptNotAnsweredError, when no capability currently
    answers the named concept
  proves: Criterion 2, including the error envelope's code and details.
  fails_when: a held:false resolution answers anything other than 404, or the envelope's code/details
    do not carry ConceptNotAnsweredError's own name and { concept } context.
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: answers 404 for a request naming no concept segment at all, never reaching the capability query
  proves: an empty/absent path segment is refused by Fastify's own routing before the controller or the
    capability query is ever reached.
  fails_when: the request reaches the capability-query stand-in, or answers a status other than 404.
- file: src/__tests__/unit/http/read-capability.routes.spec.ts
  name: answers 500 with a generic message, never the rejected call's own error text, when the capability
    query itself rejects
  proves: an unmapped/unexpected dependency failure falls through to the existing generic 500 path without
    leaking internal detail (SEC-04).
  fails_when: the response is not 500, or the response body contains the rejected error's own message
    text.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ConceptNotAnsweredError to 404
  proves: the exact table entry this task's edit to status-map.ts added, pinned directly at the unit level,
    independent of the HTTP route.
  fails_when: statusForError(new ConceptNotAnsweredError(...)) answers anything other than 404.
not_applicable:
- edge_case: Authorization/header handling
  why: no specification node or criterion of this task names who may call this route, mirroring diagnose's
    own header-agnostic route.
- edge_case: Duplicate/conflicting state edge case
  why: read-capability is a pure read with no mutation, so there is no forbidding-state case.
- edge_case: Rate limiting / slow dependency
  why: no timeout or rate-limit concern is stated; the generic-rejection test already covers the applicable
    half.
untested:
- 'The route''s own validation-failure branch (readCapabilityParamsSchema.safeParse failing, answering
  400) has no test: Fastify''s own router never delivers an empty string to a required path segment.'
- 'The route is not yet reachable through the real running server: build-app.ts does not register createReadCapabilityRoutesPlugin,
  by design — that wiring is task/case-lifecycle-http/register-routes-in-build-app.'
---

## What it is

Six HTTP-layer tests plus one direct status-map unit test, over a locally-assembled Fastify instance.

## Notes

None.
