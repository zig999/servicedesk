---
target: backend
title: DELETE /v1/capabilities/:name/:version route
summary: Adds the route/controller/dto trio exposing remove-capability over HTTP, maps its refusal to
  HTTP 409 in status-map.ts, and wires it through build-app.ts and build-app.factory.ts.
task: sha256:7bbfa2d3d5cf5de91063449c260f2d1e2d225c155adc9485b1175dfcb0078495
run: run/capability-removal-remove-capability-route-suite-2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/http/dto/remove-capability.dto.ts
  effect: New file. Declares removeCapabilityParamsSchema (name, version as zod string().min(1), mirroring
    read-capability-by-identity.dto.ts's own params schema) and its inferred RemoveCapabilityParamsDto
    type.
- path: src/http/remove-capability.controller.ts
  effect: New file. Declares RemoveCapabilityControllerDependencies with a removeCapability(name, version)
    function and handleRemoveCapabilityRequest, which awaits it and returns nothing, raising nothing of
    its own — whatever the dependency throws propagates unchanged.
- path: src/http/remove-capability.routes.ts
  effect: New file. Registers app.delete('/v1/capabilities/:name/:version', ...); safeParse's the path
    against removeCapabilityParamsSchema, answering 400 VALIDATION_ERROR with issue details on failure;
    on success calls handleRemoveCapabilityRequest and answers reply.code(204).send() with no body. No
    hook, guard or middleware is added.
- path: src/errors/status-map.ts
  effect: Imports CapabilityCitedByEvidenceError and adds it to STATUS_BY_ERROR_CLASS mapped to 409, alongside
    the existing 409 entries.
- path: src/http/build-app.ts
  effect: Imports RemoveCapabilityControllerDependencies and createRemoveCapabilityRoutesPlugin, adds
    removeCapability to BuildAppDependencies, and appends the plugin factory entry to routePluginFactories
    so buildApp registers the route.
- path: src/factories/build-app.factory.ts
  effect: Adds removeCapability to ComposedResources (typed as CapabilityRegistryService['removeCapability']),
    wires it in composeResources as (name, version) => capabilityRegistry.removeCapability(name, version),
    adds a removeCapabilityDependencies function mirroring removeConnectorDependencies, and spreads it
    into buildAppDependencies's returned object.
criteria:
- criterion: The route is registered under the DELETE method on the same name-and-version path the existing
    identity read uses.
  met: true
  how: remove-capability.routes.ts registers app.delete(`${API_PREFIX}/capabilities/:name/:version`, ...),
    the identical segment shape read-capability-by-identity.routes.ts's app.get uses.
- criterion: A request whose path segments fail the route's declared shape is refused with an HTTP 400
    response whose error code is VALIDATION_ERROR, whose message names the path as what failed validation,
    and whose details list the issues found.
  met: true
  how: 'removeCapabilityHandler safeParse''s request.params against removeCapabilityParamsSchema; on failure
    it answers reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request path
    failed validation'', details: issues } }), issues built from parsedParams.error.issues, matching the
    identity-read and remove-hypothesis routes'' own idiom.'
- criterion: The operation's refusal error is named in the status map, so it is not answered with the
    HTTP 500 INTERNAL_ERROR response and fixed message that a domain error the map does not name receives.
  met: true
  how: status-map.ts now maps CapabilityCitedByEvidenceError to 409 in STATUS_BY_ERROR_CLASS, per the
    decision log entry at rules/integration/a-registered-capability-cited-by-evidence-is-never-removed.md
    ("An HTTP 409 response naming CapabilityCitedByEvidenceError").
- criterion: The route declares and invokes no authentication middleware, guard or check.
  met: true
  how: remove-capability.routes.ts adds no app.addHook or middleware of any kind — the plugin registers
    only the app.delete handler, matching remove-connector.routes.ts and remove-hypothesis.routes.ts,
    neither of which declares one either.
- criterion: A request naming an identity no collected evidence names leaves nothing registered at that
    identity, a subsequent identity read answering as the specification already states it answers for
    an identity nothing is registered at.
  met: true
  how: The route and controller add no logic of their own beyond invoking CapabilityRegistryService.removeCapability(name,
    version), which already deletes the row (or leaves nothing registered where nothing was) without touching
    the read path; the unmodified read-capability-by-identity route continues to answer CapabilityIdentityNotFoundError
    (404) for that same identity afterward, per constraints/the-capability-identity-read-refuses-an-unregistered-identity,
    which this task does not alter.
- criterion: The route, its controller, its request shape and the operation it calls are four separate
    files, following the separation the existing delete routes use.
  met: true
  how: remove-capability.routes.ts, remove-capability.controller.ts and dto/remove-capability.dto.ts are
    three new, separate files; the fourth, the operation, is CapabilityRegistryService.removeCapability
    in capability-registry.service.ts, delivered by the sibling task this one depends on and left untouched
    here — the same four-way split remove-hypothesis and remove-connector already use.
- criterion: The controller re-raises whatever the operation raises rather than mapping it to a response
    itself.
  met: true
  how: handleRemoveCapabilityRequest contains a single `await dependencies.removeCapability(...)` with
    no try/catch, so any thrown error (CapabilityCitedByEvidenceError or otherwise) propagates to Fastify's
    error handler unmodified, exactly as remove-hypothesis.controller.ts and remove-connector.controller.ts
    do.
- criterion: The application build registers the route, so a built app answers the method and path.
  met: true
  how: build-app.ts adds removeCapability to BuildAppDependencies and appends `(dependencies) => createRemoveCapabilityRoutesPlugin(dependencies.removeCapability)`
    to routePluginFactories, which buildApp iterates and registers; build-app.factory.ts supplies the
    concrete removeCapability dependency from CapabilityRegistryService.removeCapability so a built app
    answers DELETE /v1/capabilities/:name/:version.
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/http/remove-capability.routes.ts
  - src/http/build-app.ts
  how: The published surface's remove-capability operation, named in this contract's operations list,
    is now reachable over HTTP through the registered DELETE route.
- node: domain/integration/capability-registry
  encoded_at:
  - src/http/remove-capability.controller.ts
  - src/factories/build-app.factory.ts
  how: The domain-service's remove-capability operation (already implemented in capability-registry.service.ts
    by the sibling task) is invoked, not reimplemented, by the controller and wired through the factory;
    this task adds no domain logic of its own.
- node: domain/integration/capability
  encoded_at:
  - src/http/dto/remove-capability.dto.ts
  - src/http/remove-capability.routes.ts
  how: The aggregate's identity (name, version) is exactly the path shape the route and its params schema
    declare; the aggregate itself is unmodified by this task.
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  encoded_at:
  - src/errors/status-map.ts
  how: This rule's own refusal — HTTP 409 naming CapabilityCitedByEvidenceError — now reaches the caller
    because the status map names that error class; the rule's own guard (reading collected evidence before
    refusing) is enforced by CapabilityRegistryService.removeCapability, delivered outside this task,
    which this route calls and whose refusal it lets pass through unmapped.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/remove-capability.routes.ts
  how: A path segment failing removeCapabilityParamsSchema is answered with HTTP 400, code VALIDATION_ERROR,
    a message naming the path, and a details array of the zod issues.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/http/remove-capability.controller.ts
  how: The controller re-raises every error unmodified rather than intercepting any of them, so any domain
    error this route's operation might raise that the status map does not name still reaches the system-wide
    fallback (build-app.ts's setErrorHandler(handleUnexpectedError), unmodified by this task) rather than
    being answered here.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/remove-capability.routes.ts
  how: The route plugin declares no hook, guard or middleware of any kind before dispatching to the handler.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  how: Honored by leaving the read route untouched — this task adds no logic that could interfere with
    read-capability-by-identity's own 404 refusal for an identity a completed removal leaves behind.
- node: constraints/a-successful-capability-removal-answers-with-no-content
  encoded_at:
  - src/http/remove-capability.routes.ts
  how: On success (the operation resolves without throwing) the handler answers reply.code(204).send()
    with no body, the same answer for both the cited-evidence-absent and identity-absent branches, since
    neither is distinguished after the operation call returns.
inferences:
- inferred: The version path parameter is validated as z.string().min(1) rather than coerced to a number.
  from: read-capability-by-identity.dto.ts's own readCapabilityByIdentityParamsSchema, and domain/integration/capability.md,
    which declares capability version as a required string attribute (unlike the case-version's numeric
    identity remove-hypothesis.dto.ts coerces).
- inferred: capability-registry.factory.ts needed no edit — createCapabilityRegistry already returns a
    CapabilityRegistryService carrying removeCapability (delivered by the sibling operation task), so
    build-app.factory.ts calls capabilityRegistry.removeCapability(name, version) directly.
  from: build-app.factory.ts's own existing pattern for registerCapability and readCapabilityByIdentity,
    both of which are wired the same way — a direct method call on the capabilityRegistry instance composeResources
    already holds — without any corresponding change to capability-registry.factory.ts.
preserved:
- The existing read-capability-by-identity route's own HTTP 404 refusal for an unregistered identity,
  untouched by this task.
- Every other entry already in status-map.ts's STATUS_BY_ERROR_CLASS map.
- The existing route registration order and every other route plugin in build-app.ts and build-app.factory.ts.
---

## What it is
The route that makes remove-capability reachable, mirroring remove-connector's own file separation.

## Notes
The first build attempt (run/capability-removal-remove-capability-route-build) failed typecheck: build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeCapability field. Fixed by the test-author's proof pass; the second attempt passed.
