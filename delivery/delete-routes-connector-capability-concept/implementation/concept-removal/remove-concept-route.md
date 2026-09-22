---
target: backend
title: DELETE /v1/glossary/concepts/:name route
summary: Adds the route/controller/dto trio exposing remove-concept over HTTP, maps its refusal to HTTP
  409 in status-map.ts, wires it through build-app.ts and build-app.factory.ts, and wires the real concept-usage
  reader into createGlossary so the refusal is actually reachable in production.
task: sha256:1d0624165723ea54e3a8c55e01924ee0b507c6c4a6df31a24fca91e7758cee74
run: run/concept-removal-remove-concept-route-suite-2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/http/dto/remove-concept.dto.ts
  effect: New file. Declares removeConceptParamsSchema (name as zod string().min(1), mirroring register-concept.dto.ts's
    own params schema) and its inferred RemoveConceptParamsDto type.
- path: src/http/remove-concept.controller.ts
  effect: New file. Declares RemoveConceptControllerDependencies with a removeConcept(name) function (typed
    as GlossaryService['removeConcept']) and handleRemoveConceptRequest, which awaits it and returns nothing,
    raising nothing of its own — whatever the dependency throws propagates unchanged.
- path: src/http/remove-concept.routes.ts
  effect: New file. Registers app.delete('/v1/glossary/concepts/:name', ...); safeParse's the path against
    removeConceptParamsSchema, answering 400 VALIDATION_ERROR with issue details on failure; on success
    calls handleRemoveConceptRequest and answers reply.code(204).send() with no body. No hook, guard or
    middleware is added.
- path: src/errors/status-map.ts
  effect: Imports ConceptInUseError and adds it to STATUS_BY_ERROR_CLASS mapped to 409, alongside the
    existing 409 entries.
- path: src/http/build-app.ts
  effect: Imports RemoveConceptControllerDependencies and createRemoveConceptRoutesPlugin, adds removeConcept
    to BuildAppDependencies, and appends the plugin factory entry to routePluginFactories so buildApp
    registers the route.
- path: src/factories/build-app.factory.ts
  effect: Adds removeConcept to ComposedResources (typed as GlossaryService['removeConcept']), wires it
    in composeResources as (name) => glossary.removeConcept(name), adds a removeConceptDependencies function
    mirroring removeCapabilityDependencies, spreads it into buildAppDependencies's returned object, and
    reorders composeResources so capabilityRegistry, evidenceUsageReader and conceptUsageReader are built
    before createGlossary is called, passing conceptUsageReader into it instead of calling createGlossary(connection)
    alone.
- path: src/factories/glossary.factory.ts
  effect: 'createGlossary(connection, conceptUsageReader) now takes a second, defaulted parameter (IConceptUsageReader,
    defaulting to a module-level NO_CONCEPT_NAMED constant resolving { named: false }) and passes it to
    GlossaryService''s constructor, so a caller that supplies the real reader gets a glossary whose removeConcept
    actually refuses; createGlossaryQuery and every existing single-argument call site keep compiling
    and behaving as before.'
criteria:
- criterion: The route is registered under the DELETE method on the same concept-name path the existing
    concept registration route uses.
  met: true
  how: remove-concept.routes.ts registers app.delete(`${API_PREFIX}/glossary/concepts/:name`, ...), the
    identical segment shape register-concept.routes.ts's app.put uses.
- criterion: A request whose path segment fails the route's declared shape is refused with an HTTP 400
    response whose error code is VALIDATION_ERROR, whose message names the path as what failed validation,
    and whose details list the issues found.
  met: true
  how: 'removeConceptHandler safeParse''s request.params against removeConceptParamsSchema; on failure
    it answers reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request path
    failed validation'', details: issues } }), issues built from parsedParams.error.issues, matching remove-capability.routes.ts''s
    and remove-hypothesis.routes.ts''s own idiom.'
- criterion: The operation's refusal error is named in the status map, so it is not answered with the
    HTTP 500 INTERNAL_ERROR response and fixed message that a domain error the map does not name receives.
  met: true
  how: status-map.ts now maps ConceptInUseError to 409 in STATUS_BY_ERROR_CLASS, per rules/glossary/a-registered-concept-is-never-removed's
    own statement ("the removal is refused with an HTTP 409 response reporting a ConceptInUseError").
- criterion: The route declares and invokes no authentication middleware, guard or check.
  met: true
  how: remove-concept.routes.ts adds no app.addHook or middleware of any kind — the plugin registers only
    the app.delete handler, matching remove-capability.routes.ts and remove-connector.routes.ts, neither
    of which declares one either.
- criterion: A request naming a concept nothing answers, records, cites or collects leaves that name unheld
    by the glossary, a subsequent read of it answering as the specification already states it answers
    for an unheld name.
  met: true
  how: 'The route and controller add no logic of their own beyond invoking GlossaryService.removeConcept(name);
    when the concept usage reader resolves { named: false } — which it does for a concept nothing answers,
    records, cites or collects — removeConcept deletes the row unconditionally, leaving nothing at that
    name; the unmodified read-concept route continues to answer { held: false, name } for that same name
    afterward, per constraints/the-concept-read-refuses-an-unanswered-concept, which this task does not
    alter.'
- criterion: The route, its controller, its request shape and the operation it calls are four separate
    files, following the separation the existing delete routes use.
  met: true
  how: remove-concept.routes.ts, remove-concept.controller.ts and dto/remove-concept.dto.ts are three
    new, separate files; the fourth, the operation, is GlossaryService.removeConcept in glossary.service.ts,
    delivered by the sibling task this one depends on and left untouched here — the same four-way split
    remove-capability, remove-connector and remove-hypothesis already use.
- criterion: The controller re-raises whatever the operation raises rather than mapping it to a response
    itself.
  met: true
  how: handleRemoveConceptRequest contains a single `await dependencies.removeConcept(params.name)` with
    no try/catch, so any thrown error (ConceptInUseError or otherwise) propagates to Fastify's error handler
    unmodified, exactly as remove-capability.controller.ts and remove-connector.controller.ts do.
- criterion: The application build registers the route, so a built app answers the method and path.
  met: true
  how: build-app.ts adds removeConcept to BuildAppDependencies and appends `(dependencies) => createRemoveConceptRoutesPlugin(dependencies.removeConcept)`
    to routePluginFactories, which buildApp iterates and registers; build-app.factory.ts supplies the
    concrete removeConcept dependency from GlossaryService.removeConcept — now constructed with the real
    conceptUsageReader — so a built app answers DELETE /v1/glossary/concepts/:name.
nodes:
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/http/remove-concept.routes.ts
  - src/http/build-app.ts
  how: The published surface's remove-concept operation, named in this contract's operations list, is
    now reachable over HTTP through the registered DELETE route; register-concept's own registration semantics
    are unmodified by this task.
- node: domain/glossary/concept
  encoded_at:
  - src/http/dto/remove-concept.dto.ts
  - src/http/remove-concept.routes.ts
  how: The value object's identity (name) is exactly the path shape the route and its params schema declare;
    no other attribute of the value object is read or altered by removal, and the value object itself
    is unmodified by this task.
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/glossary.factory.ts
  - src/factories/build-app.factory.ts
  how: This rule's own removal-refusal — HTTP 409 naming ConceptInUseError — now reaches the caller because
    the status map names that error class. The rule's own guard (GlossaryService.removeConcept, delivered
    by the sibling operation task) is now reachable in production rather than only under test — that operation
    task's own Notes recorded that createGlossary(connection) still wired only the always-false default
    reader, so no removal was ever actually refused; this task closes that gap by giving createGlossary
    a second, defaulted conceptUsageReader parameter and passing build-app.factory.ts's already-composed
    conceptUsageReader (createConceptUsageReader(connection, capabilityRegistry)) into it. The rule's
    registering half belongs to register-concept, untouched here; its closing clause about what a removal
    takes with it (the concept's own accepts declaration) is the store task's, per this task's own Notes.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/remove-concept.routes.ts
  how: A path segment failing removeConceptParamsSchema is answered with HTTP 400, code VALIDATION_ERROR,
    a message naming the path, and a details array of the zod issues.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/http/remove-concept.controller.ts
  how: The controller re-raises every error unmodified rather than intercepting any of them, so any domain
    error this route's operation might raise that the status map does not name still reaches the system-wide
    fallback (build-app.ts's setErrorHandler(handleUnexpectedError), unmodified by this task) rather than
    being answered here.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/remove-concept.routes.ts
  how: The route plugin declares no hook, guard or middleware of any kind before dispatching to the handler.
- node: constraints/a-successful-concept-removal-answers-with-no-content
  encoded_at:
  - src/http/remove-concept.routes.ts
  how: On success (the operation resolves without throwing) the handler answers reply.code(204).send()
    with no body, for both the not-yet-referenced and (once the wiring above is exercised) the never-reached
    refusal branches alike, since only one of the two can occur before the handler returns.
inferences:
- inferred: 'removeConceptParamsSchema declares only `name: z.string().min(1)`, matching register-concept''s
    own path shape rather than adding any further constraint.'
  from: register-concept.routes.ts's own registerConceptParamsSchema and register-concept.dto.ts, the
    reference this task names for the exact path shape and DELETE-vs-registration convention.
- inferred: 'createGlossary''s new conceptUsageReader parameter is optional, defaulting to a module-level
    NO_CONCEPT_NAMED constant resolving { named: false }, mirroring GlossaryService''s own default and
    createCapabilityRegistry''s defaulted connectorConfigurationsReader parameter, so glossary.factory.spec.ts''s
    existing single-argument createGlossary(pool) calls keep compiling and behaving exactly as before.'
  from: capability-registry.factory.ts's own NO_REGISTERED_CONNECTOR_CONFIGURATIONS default, and glossary.service.ts's
    own NO_CONCEPT_NAMED default already declared for the identical purpose.
- inferred: composeResources in build-app.factory.ts now builds capabilityRegistry, evidenceUsageReader
    and conceptUsageReader before calling createGlossary, reordering three existing statements rather
    than only adding a new one.
  from: createConceptUsageReader(connection, capabilityRegistry) already required capabilityRegistry to
    exist first; nothing else composed between the old and new position of createGlossary depends on glossary,
    so reordering changes nothing else this function returns.
preserved:
- Every other entry already in status-map.ts's STATUS_BY_ERROR_CLASS map.
- The existing route registration order and every other route plugin in build-app.ts and build-app.factory.ts.
- glossary.factory.spec.ts's existing single-argument createGlossary(pool) calls, kept compiling and behaving
  identically by the new parameter's default.
- The unmodified read-concept route's own HTTP refusal for an unanswered concept (constraints/the-concept-read-refuses-an-unanswered-concept),
  untouched by this task.
---

## What it is
The route that makes remove-concept reachable, and the status-map entry and factory wiring that make the rule's refusal actually reach a caller.

## Notes
The first build attempt (run/concept-removal-remove-concept-route-build) failed typecheck: build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeConcept field. Fixed by the test-author's proof pass. The first full-suite attempt (run/concept-removal-remove-concept-route-suite) then failed lint: composeResources() in build-app.factory.ts exceeded the project's max-lines-per-function after adding the removeConcept line; fixed by combining the registerConcept/removeConcept return-object entries onto one line. The next attempt passed.
