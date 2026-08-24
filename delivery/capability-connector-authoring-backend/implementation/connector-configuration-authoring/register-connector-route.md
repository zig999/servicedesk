---
title: Expose register-connector as a write HTTP route
summary: A PUT route, controller and DTO pair for register-connector, plus a new JSON-object well-formedness
  check in ConnectorConfigurationRegistryService.registerConnector, before any write.
task: sha256:65a4a5d2b81cc4e673ada9bb838a318421a5f96cae78175325ad2954657a4731
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-register-connector-route-build-3
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: registerConnector now resolves a string configuration through wellFormedConfiguration before
    the existing completeness check, throwing ConnectorConfigurationNotWellFormedError when the text fails
    JSON.parse or parses to a non-plain-object value (array, primitive, null); a non-string configuration
    is unaffected. The replace-whole-by-connector-identity write and the undeclared-connector/non-plain-object
    refusal are unchanged.
- path: src/errors/connector-configuration-not-well-formed.error.ts
  effect: new typed domain error (name, message, context.reason) raised when a connector configuration's
    text is not syntactically valid JSON, or parses to something other than a JSON object.
- path: src/errors/status-map.ts
  effect: maps ConnectorConfigurationNotWellFormedError to 422, alongside the existing well-formedness/completeness/nature
    refusals.
- path: src/http/dto/register-connector.dto.ts
  effect: registerConnectorParamsSchema (connector, from the path) and registerConnectorBodySchema (configuration,
    a required non-empty string) validate the wire shape at the route boundary; JSON-syntax and object-shape
    well-formedness are deliberately left to the registry service, not checked here.
- path: src/http/register-connector.controller.ts
  effect: handleRegisterConnectorRequest composes the path-carried connector identity and the validated
    body into one ConnectorConfigurationRegistration and calls the registerConnector operation given as
    its one dependency, returning the registered ConnectorConfiguration unchanged.
- path: src/http/register-connector.routes.ts
  effect: registers PUT /v1/connectors/:connector, validating path and body via safeParse (400 + VALIDATION_ERROR
    envelope on failure), otherwise calling the controller and answering 200 with the registered configuration;
    declares no authentication guard.
- path: src/factories/build-app.factory.ts
  effect: composeResources builds one ConnectorConfigurationRegistryService instance via createConnectorConfigurationRegistry
    and exposes its registerConnector method as the ComposedResources.registerConnector field; registrationDependencies
    maps it into BuildAppDependencies.registerConnector alongside registerCapability and registerConcept.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gained a registerConnector field, and routePlugins() registers createRegisterConnectorRoutesPlugin(dependencies.registerConnector)
    in the shared plugin loop.
- path: __tests__/unit/http/build-app.spec.ts
  effect: gains a stubRegisterConnector() helper and a registerConnector field on the fixture's BuildAppDependencies
    object, so the file typechecks against the widened type; stubBuildAppDependencies() was reshaped (caseStore
    built inline at its one use site) to stay within MNT-01's 30-line limit after the new field was added.
criteria:
- criterion: Registering a connector configuration at a name that does not yet exist creates it.
  met: true
  how: registerConnector's kept = held.filter(candidate => candidate.connector !== configuration.connector)
    leaves the existing rows untouched when no row matches, and writeConnectorConfigurations([...kept,
    configuration]) appends the new one; the route/controller pass the HTTP registration straight through
    to this call.
- criterion: Registering a connector configuration at a name that already exists replaces it whole rather
    than merging into what stood before.
  met: true
  how: the same filter drops the one row whose connector matches before the new row is appended, so the
    write holds exactly the new configuration for that name — nothing of the prior configuration's keys
    survives into it.
- criterion: A registration whose configuration text is not syntactically valid JSON is refused.
  met: true
  how: wellFormedConfiguration runs JSON.parse on a string configuration inside a try/catch and throws
    ConnectorConfigurationNotWellFormedError before any write when parsing throws; the DTO requires configuration
    to be a string, so every HTTP registration reaches this check.
- criterion: A registration whose configuration text parses to something other than a JSON object is refused.
  met: true
  how: after a successful JSON.parse, isPlainObject(parsed) is checked (rejects arrays, primitives and
    null); wellFormedConfiguration throws ConnectorConfigurationNotWellFormedError when it is false, before
    any write.
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: register-connector.routes.ts declares no authentication middleware, guard or check anywhere in
    the plugin or the handler.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/http/dto/register-connector.dto.ts
  - src/http/register-connector.controller.ts
  - src/http/register-connector.routes.ts
  how: the DTO carries the value object's two attributes (connector from the path, configuration in the
    body); the controller composes them into a ConnectorConfigurationRegistration; the route's PUT semantics
    answer the node's own responsibility of replacing the current configuration whole on every edit.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  how: the route is wired to the one published registerConnector operation of ConnectorConfigurationRegistryService,
    rather than to any construction of its own; the controller and route add no persistence or business
    decision.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/connector-configuration-not-well-formed.error.ts
  - src/errors/status-map.ts
  how: wellFormedConfiguration is the rule's condition, checked before any write, refusing text that fails
    JSON.parse or parses to a non-object; the refusal's identity is the new typed error, and its transport
    status is resolved in the one status-map table.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/http/register-connector.routes.ts
  how: register-connector is exposed as the write half of this published API, at PUT /v1/connectors/{connector};
    this task adds only the register-connector operation, leaving read-connector-configuration and list-connector-configurations
    to their own tasks.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/register-connector.routes.ts
  how: the new route declares no authentication middleware, guard or check of its own.
inferences:
- inferred: the route method is PUT rather than POST.
  from: register-capability.routes.ts's own precedent for the identical create-or-replace-at-a-known-identity
    shape (the connector's identity is known before the call and carried in the path).
- inferred: the route answers 200 for both a creation and a replacement, drawing no status distinction
    between the two.
  from: registerConnector never distinguishes creation from replacement in its own return value or behavior;
    mirrors register-capability.routes.ts's own reasoning; no criterion asks for a distinguishing status.
- inferred: the connector-configuration registry's well-formedness check treats a non-string configuration
    (already an object) as pre-validated and passes it through wellFormedConfiguration unchanged, applying
    JSON.parse only to a string value.
  from: the DTO always sends configuration as a string over HTTP, and the registry module's own doc comment
    states this mirrors capability-registry.service.ts's refuseMalformedSchemas precedent for handling
    a schema string versus an already-structured value from a non-HTTP caller.
preserved:
- The registry's existing undeclared-connector and non-plain-object refusals (IncompleteConnectorConfigurationError)
  continue to run, now downstream of the new JSON well-formedness check, and their existing unit tests
  (connector-configuration-registry.service.spec.ts) were not touched.
- The diagnose route's registration and every other route already listed in routePlugins() are unchanged
  in call shape and order.
- createDiagnoseHttpServer's own use of createConnectorConfigurationRegistry (for HttpDeclarativeObservationSource)
  is untouched — it builds its own separate instance for that unrelated purpose, as it did before this
  task.
deferred:
- what: read-connector-configuration and list-connector-configurations, the other two operations contracts/integration/connector-configuration-registry
    names, are not exposed as routes.
  why: each is its own task (read-connector-configuration-route, list-connector-configurations-route)
    in this same epic; this task's objective and criteria name only register-connector.
---

## What it is

A Fastify route, controller and DTO pair for register-connector, plus a new JSON-object well-formedness check added to the registry service alongside its existing refusals.

## Notes

None.
