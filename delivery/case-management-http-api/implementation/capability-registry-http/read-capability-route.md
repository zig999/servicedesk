---
title: GET /v1/capabilities/{concept} — read-capability HTTP route
summary: A thin Fastify plugin, controller and Zod DTO expose the existing readCapability domain operation
  over HTTP, with a new typed error and status-map entry translating its held:false answer into 404.
task: sha256:2d2a2556d41e061f16bbc76156cd181b92b89b40481aaa3e4dbf9d6fd286c908
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
files:
- path: src/http/read-capability.routes.ts
  effect: New Fastify plugin registering GET /v1/capabilities/:concept under the /v1 prefix; validates
    :concept against readCapabilityParamsSchema, calls handleReadCapabilityRequest, answers 200, lets
    thrown domain errors propagate.
- path: src/http/read-capability.controller.ts
  effect: 'New controller: handleReadCapabilityRequest calls ICapabilityQuery.readCapability(concept)
    and either returns the held capability''s whole contract or throws ConceptNotAnsweredError when held:false.'
- path: src/http/dto/read-capability.dto.ts
  effect: 'New Zod DTO: readCapabilityParamsSchema (the :concept path parameter) and readCapabilityResponseSchema
    (the capability''s eight attributes), plus inferred types.'
- path: src/errors/concept-not-answered.error.ts
  effect: New typed error ConceptNotAnsweredError, carrying { concept }, raised only at the HTTP boundary
    once the controller reads an ordinary held:false CapabilityResolution.
- path: src/errors/status-map.ts
  effect: Adds ConceptNotAnsweredError → 404 to STATUS_BY_ERROR_CLASS.
criteria:
- criterion: A valid request returns the capability currently answering the named concept, with its declared
    contract.
  met: true
  how: readCapabilityHandler validates :concept, calls handleReadCapabilityRequest, which resolves it
    through the existing CapabilityRegistryService.readCapability (unchanged) and — on a held resolution
    — returns the capability object whole; the route answers 200 with exactly that object.
- criterion: A request naming a concept no capability currently answers is refused with the status status-map
    assigns.
  met: true
  how: readCapability's held:false answer is ordinary data, not an error; the controller turns that ordinary
    absence into a typed refusal by throwing ConceptNotAnsweredError, and status-map.ts now maps that
    class to 404 — the same table task/case-lifecycle-http/status-map wired into error-handler.middleware.ts.
nodes:
- node: contracts/integration/capability-registry
  how: This task is the HTTP exposure of the published read-capability operation the contract describes;
    list-capabilities is a separate, undelivered task and is not touched here.
  encoded_at:
  - src/http/read-capability.routes.ts
  - src/http/read-capability.controller.ts
  - src/http/dto/read-capability.dto.ts
- node: domain/integration/capability
  how: readCapabilityResponseSchema mirrors every one of the element's eight declared attributes, spelled
    under the same names capability.ts already uses.
  encoded_at:
  - src/http/dto/read-capability.dto.ts
- node: domain/integration/capability-registry
  how: The route exposes resolve-concept (readCapability) exactly as CapabilityRegistryService already
    implements it; register-capability is untouched.
  encoded_at:
  - src/http/read-capability.controller.ts
- node: rules/integration/one-capability-answers-one-concept
  how: Honored by construction rather than newly enforced here — the existing readCapability already refuses
    (via DuplicateConceptAnswerError, untouched) a holding that answers one concept more than once.
inferences:
- inferred: The domain's read-capability answers { held:false, concept } as ordinary data rather than
    throwing, confirmed by reading capability-registry.service.ts's readCapability and capability-query.port.ts's
    own CapabilityResolution directly.
  from: src/capability-registry/capability-registry.service.ts, src/capability-registry/capability-query.port.ts
- inferred: Since no typed error already existed for 'no capability answers this concept', a new class
    was needed to key the shared status map by class.
  from: status-map.ts's own header comment and the existing CaseNotFoundError/DuplicateConceptAnswerError
    convention
- inferred: Named the new error ConceptNotAnsweredError, mapped to 404, following status-map.ts's own
    stated grouping rule.
  from: status-map.ts, concept-already-answered.error.ts, duplicate-concept-answer.error.ts
- inferred: File/module naming follows the established route trio (diagnose.routes.ts / diagnose.controller.ts
    / dto/diagnose.dto.ts), named per this route's own use case.
  from: the inventory's own convention entry and diagnose.routes.ts itself
preserved:
- CapabilityRegistryService.readCapability's own behavior and CapabilityResolution's shape are unchanged.
- error-handler.middleware.ts's own dispatch logic is unchanged; only status-map.ts's own table gained
  one entry.
- diagnose.routes.ts, diagnose.controller.ts, dto/diagnose.dto.ts and build-app.ts are untouched.
deferred:
- what: Registering this new route plugin inside build-app.ts.
  why: no task in this plan — including this one — states wiring into build-app.ts as a criterion; task/case-lifecycle-http/register-routes-in-build-app
    now covers it once every route exists.
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-capability domain operation, with one new typed error closing the held:false-to-HTTP-status gap.

## Notes

None.
