---
target: backend
title: HTTP surface for remove-connector
summary: Adds the route/controller/dto trio exposing DELETE /v1/connectors/:connector over the existing
  ConnectorConfigurationRegistryService.removeConnector, wired into the application build.
task: sha256:cca1410d4c6712ec1a31ed50fb98df31c036feba49c0ac4fe588c97295c1d2be
run: run/connector-configuration-removal-remove-connector-route-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/http/dto/remove-connector.dto.ts
  effect: New file. Declares removeConnectorParamsSchema and the RemoveConnectorParamsDto type, mirroring
    remove-hypothesis.dto.ts's path-only DTO shape.
- path: src/http/remove-connector.controller.ts
  effect: New file. Declares RemoveConnectorControllerDependencies and handleRemoveConnectorRequest, which
    awaits dependencies.removeConnector(params.connector) with no try/catch.
- path: src/http/remove-connector.routes.ts
  effect: New file. Registers app.delete('/v1/connectors/:connector', ...), safe-parses request.params,
    answers 400 VALIDATION_ERROR on malformed input, otherwise answers reply.code(204).send().
- path: src/http/build-app.ts
  effect: Imports RemoveConnectorControllerDependencies/createRemoveConnectorRoutesPlugin, adds removeConnector
    to BuildAppDependencies, appends the new route's plugin factory to routePluginFactories.
- path: src/factories/build-app.factory.ts
  effect: Adds removeConnector to ComposedResources, composes it from the same connectorConfigurationRegistry
    instance, adds removeConnectorDependencies(resources), spreads it into buildAppDependencies.
criteria:
- criterion: The route is registered under the DELETE method on the same connector-name path the existing
    registration route uses.
  met: true
  how: remove-connector.routes.ts registers app.delete('/v1/connectors/:connector', ...) — the identical
    path register-connector.routes.ts registers under PUT.
- criterion: A request whose path segment fails the route's declared shape is refused with an HTTP 400
    response whose error code is VALIDATION_ERROR, whose message names the path as what failed validation,
    and whose details list the issues found.
  met: true
  how: removeConnectorParamsSchema.safeParse(request.params); on failure returns HTTP 400 with the VALIDATION_ERROR
    envelope and mapped issues.
- criterion: The route declares and invokes no authentication middleware, guard or check.
  met: true
  how: None of the three new files imports, declares or invokes anything authentication-related.
- criterion: A request naming a registered connector leaves that connector unregistered, a subsequent
    read of the name answering as the specification already states it answers for a name nothing is registered
    at.
  met: true
  how: handleRemoveConnectorRequest calls removeConnector, wired to the already-delivered service method
    that unconditionally issues store.deleteConnectorConfiguration.
- criterion: The route, its controller, its request shape and the operation it calls are four separate
    files, following the separation the existing delete routes use.
  met: true
  how: remove-connector.routes.ts, remove-connector.controller.ts, dto/remove-connector.dto.ts and the
    pre-existing service method — mirroring discard's own four-way split.
- criterion: The controller re-raises whatever the operation raises rather than mapping it to a response
    itself.
  met: true
  how: handleRemoveConnectorRequest contains no try/catch; any rejection propagates unchanged.
- criterion: The application build registers the route, so a built app answers the method and path.
  met: true
  how: build-app.ts appends createRemoveConnectorRoutesPlugin to routePluginFactories; build-app.factory.ts
    composes and supplies the dependency.
nodes:
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/http/remove-connector.routes.ts
  - src/http/remove-connector.controller.ts
  - src/http/dto/remove-connector.dto.ts
  - src/http/build-app.ts
  - src/factories/build-app.factory.ts
  how: The contract names remove-connector as one of the published surface's operations; this task adds
    the HTTP route, controller and DTO that make it reachable.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/http/remove-connector.controller.ts
  - src/factories/build-app.factory.ts
  how: The controller invokes the domain service's removeConnector operation through an injected dependency
    rather than reimplementing removal itself.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/http/dto/remove-connector.dto.ts
  - src/http/remove-connector.routes.ts
  how: The route identifies the value object to remove solely by its connector name, validated as a non-empty
    string.
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  encoded_at:
  - src/http/remove-connector.controller.ts
  - src/http/remove-connector.routes.ts
  how: The controller performs no presence check and imposes no condition of its own; the route answers
    204 for every non-malformed request regardless of outcome.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/remove-connector.routes.ts
  - src/http/dto/remove-connector.dto.ts
  how: A path segment failing the schema is answered with HTTP 400, code VALIDATION_ERROR, a message and
    a non-empty details array.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/remove-connector.routes.ts
  - src/http/remove-connector.controller.ts
  - src/http/dto/remove-connector.dto.ts
  how: None of the three files declares or invokes an authentication middleware, guard or check.
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  encoded_at:
  - src/http/remove-connector.routes.ts
  how: On success the handler answers reply.code(204).send() with no body, identically whether or not
    a configuration was registered under the name.
inferences:
- inferred: 'RemoveConnectorControllerDependencies declares its dependency as the inline function shape
    (connector: string) => Promise<void> rather than importing the concrete service method type.'
  from: register-connector.controller.ts's own convention, keeping the controller decoupled from the concrete
    service class.
- inferred: build-app.factory.ts composes removeConnector through a dedicated removeConnectorDependencies(resources)
    function rather than folding it into registrationDependencies.
  from: testConnectorDependencies, the file's own precedent for a standalone single-field composition
    function used when an operation is not a registration.
- inferred: The DTO/schema pair is named removeConnectorParamsSchema / RemoveConnectorParamsDto.
  from: remove-hypothesis.dto.ts's identical naming shape for a delete route's path-only request DTO.
preserved:
- Every existing entry in build-app.ts's routePluginFactories array keeps its prior order and behavior;
  the new entry is appended after register-connector's own.
- build-app.factory.ts's existing composeResources, registrationDependencies, testConnectorDependencies
  and buildAppDependencies functions keep their prior return shapes and call sites.
- ConnectorConfigurationRegistryService's registerConnector, readConnectorConfiguration, readConnectorConfigurationOrThrow
  and listConnectorConfigurations behavior is untouched.
deferred:
- what: src/__tests__/unit/http/build-app.spec.ts's stubBuildAppDependencies() does not include a removeConnector
    stub, and the file has no coverage yet for the new route's 400/204/no-auth/error-propagation behavior.
  why: Writing or editing a test file is outside this task's grant; updating that fixture and adding coverage
    is test-authoring work for the next step.
---

## What it is
The route that makes remove-connector reachable, mirroring the two delete routes this codebase already has.

## Notes
No node states what status a successful removal carries beyond constraints/a-successful-connector-configuration-removal-answers-with-no-content (204, no body), which this route now answers exactly.
The first build attempt (run/connector-configuration-removal-remove-connector-route-build) failed typecheck: build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeConnector field. Fixed by the test-author's proof pass; the second attempt passed.
