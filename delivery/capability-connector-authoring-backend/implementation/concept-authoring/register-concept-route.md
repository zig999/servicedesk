---
title: Expose register-concept as a write HTTP route
summary: Adds a PUT route, controller and DTO pair for register-concept, wired into the app the same way
  register-capability was, over GlossaryService.registerConcept.
task: sha256:bf535f4a8f14ad6a0ce3d70aea230008c6a92a079fd9047fbf866c501c739e4e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-authoring-register-concept-route-build-2
files:
- path: src/http/dto/register-concept.dto.ts
  effect: declares registerConceptParamsSchema (name, path-carried) and registerConceptBodySchema (accepts
    required as an array of non-empty strings, ttl optional positive integer) plus their inferred DTO
    types; declares no response schema, reusing the domain Concept type directly.
- path: src/http/register-concept.controller.ts
  effect: declares RegisterConceptControllerDependencies (the registerConcept operation alone) and handleRegisterConceptRequest,
    which composes the path-carried name and the validated body into one ConceptRegistration and hands
    it straight to the injected registerConcept operation, answering with the resulting Concept unchanged.
- path: src/http/register-concept.routes.ts
  effect: registers PUT /v1/glossary/concepts/:name as a Fastify plugin closed over its dependencies;
    validates the path parameter and the request body before the controller is reached, answering 400
    with the shared VALIDATION_ERROR envelope on either failure, and otherwise answers 200 with the registered
    concept; declares no authentication guard of its own.
- path: src/http/build-app.ts
  effect: imports register-concept's plugin and dependency type, adds a registerConcept field to BuildAppDependencies,
    and registers createRegisterConceptRoutesPlugin(dependencies.registerConcept) as the twenty-first
    entry of routePlugins()'s list.
- path: src/factories/build-app.factory.ts
  effect: composeResources now builds one GlossaryService instance via glossary.factory.ts's createGlossary
    and reuses that same instance for both glossaryQuery (unchanged in shape) and a new registerConcept
    field, mirroring how capabilityRegistry is shared between capabilityQuery and registerCapability;
    registrationDependencies now returns both registerCapability and registerConcept.
- path: __tests__/unit/http/build-app.spec.ts
  effect: gains a stubRegisterConcept() helper (mirroring stubRegisterCapability()) and a registerConcept
    field on the fixture's BuildAppDependencies object, so the file typechecks against the widened type.
criteria:
- criterion: Registering a concept at a name that does not yet exist creates it and the response reflects
    the registered concept.
  met: true
  how: The route parses :name and the body, calls dependencies.registerConcept({ name, accepts, ttl })
    — GlossaryService.registerConcept, which creates the entry where no existing concept shares the name
    and returns the registered Concept — and the route answers 200 with that value unchanged.
- criterion: Registering a concept at a name that already exists replaces it in place rather than creating
    a second entry.
  met: true
  how: The same call reaches GlossaryService.registerConcept, which reads the currently held set, filters
    out whatever entry already shares the registered name, and writes the whole resulting set back through
    the store's whole-replace writeConcepts — this route carries the call through with no logic of its
    own here.
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: register-concept.routes.ts registers the plugin with no authentication middleware, guard or check
    of any kind, consistent with every other route in this codebase and with constraints/no-route-enforces-authentication.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/http/dto/register-concept.dto.ts
  - src/http/register-concept.controller.ts
  - src/http/register-concept.routes.ts
  how: The DTO's params schema carries the concept's identifying attribute, name, read from the path;
    the body schema carries accepts and ttl (ttl optional, defaulted downstream by GlossaryService); the
    route path (/v1/glossary/concepts/:name) names the concept by that same identity, and the controller
    composes all three into one ConceptRegistration.
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/http/register-concept.routes.ts
  - src/http/register-concept.controller.ts
  - src/http/dto/register-concept.dto.ts
  - src/http/build-app.ts
  - src/factories/build-app.factory.ts
  how: register-concept, the one operation this published contract declares, is now reachable as PUT /v1/glossary/concepts/{name},
    held apart from the read surface (glossary-query's own read-concept/list-concepts routes), and wired
    into the running app the same way every other published operation already is.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/register-concept.routes.ts
  how: The plugin declares and invokes no authentication middleware, guard or check; a request reaching
    this route is dispatched without one.
inferences:
- inferred: PUT is the verb for this route, at a path naming the concept by its own identity in the URL
    rather than the body.
  from: register-capability.routes.ts's own disclosed inference for the identical create-or-replace-at-a-known-identity
    shape, reused here because domain/glossary/concept and contracts/glossary/glossary-authoring describe
    the same semantics for register-concept.
- inferred: The route answers 200 for both a creation and a replacement, rather than distinguishing the
    two by status.
  from: GlossaryService.registerConcept never distinguishes a creation from a replacement internally,
    mirroring register-capability.routes.ts's own stated reasoning for the same non-distinction; this
    task's criteria never ask for one.
- inferred: The route path is spelled /v1/glossary/concepts/:name, under the same /glossary/concepts segment
    read-concept.routes.ts and list-concepts.routes.ts already use, rather than a new segment of its own.
  from: read-concept.routes.ts's and list-concepts.routes.ts's own existing path convention for this same
    resource; register-capability.routes.ts's own precedent of reusing its resource's existing path segment
    for its own write route.
- inferred: registerConceptBodySchema requires accepts as an array of non-empty strings but does not require
    the array itself to be non-empty.
  from: read-concept.dto.ts's own readConceptResponseSchema, which spells accepts the same way with no
    array-level minimum length; domain/glossary/concept states accepts is required and many, not that
    it must hold at least one entry.
- inferred: This module declares no response schema; the controller answers with the domain Concept type
    directly.
  from: register-capability.dto.ts's own stated reasoning for the identical choice, and read-concept.dto.ts's
    own readConceptResponseSchema already wire-encoding the same three Concept attributes.
- inferred: composeResources builds one GlossaryService instance and reuses it for both glossaryQuery
    and registerConcept, rather than keeping the existing call and building a second instance for registerConcept.
  from: 'build-app.factory.ts''s own existing precedent for capabilityRegistry, built once and reused
    for both capabilityQuery and registerCapability, for the identical reason: the same shared connection
    either way.'
preserved:
- Every existing route's registration and behavior in build-app.ts and build-app.factory.ts, including
  readConcept, listConcepts, readVocabularyTerm and listVocabularyTerms, which all still resolve through
  the same IGlossaryQuery surface — now the same GlossaryService instance backing registerConcept rather
  than a second instance, but implementing the identical interface so nothing observable to them changed.
- register-capability's own route, controller, DTO and wiring, untouched.
deferred:
- what: DuplicateGlossaryNameError, raised by GlossaryService.concepts() when the store already holds
    a duplicate name, has no entry in status-map.ts, so it would reach the shared error handler unmapped
    if ever thrown.
  why: This is pre-existing behavior shared by read-concept, list-concepts and now register-concept alike
    — this task did not introduce the gap, and mapping it reaches every consumer of GlossaryService.concepts(),
    outside this task's own objective of exposing one new route.
---

## What it is

A Fastify route, controller and DTO pair for register-concept, wired the same way register-capability's route was, over GlossaryService.registerConcept.

## Notes

None.
