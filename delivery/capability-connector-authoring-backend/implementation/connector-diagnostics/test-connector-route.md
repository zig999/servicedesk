---
title: Expose test-connector as a diagnostic HTTP route
summary: Wires a new POST /v1/test-connector route, controller and DTO that resolves a named, already-registered
  capability, refuses it unregistered or connector-mismatched, assembles a subject from the request, issues
  the connector's real call through extracted HTTP-issuance logic, and returns the raw request and raw
  outcome — writing no evidence and no citation.
task: sha256:cbe2aa3701c41a79484361fab8fd10ed3caedb883ce4a78d48104c6a31c0fae1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-diagnostics-test-connector-route-build-2
files:
- path: src/http-connector/connector-http-issuer.ts
  effect: new — extracts the HTTP-issuance mechanics HttpDeclarativeObservationSource used privately (issueConnectorHttpCall,
    plus connectorRequestUrl/connectorRequestInit) into a standalone module with no evidence-result or
    store knowledge, so a second caller can issue an identical bounded HTTP call and read its own elapsed
    time.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: delegates its own private issueRequest to issueConnectorHttpCall (unchanged observable behavior
    — still answers only 'response' or 'timed-out', still discards timing), and exports asHttpConnectorCallConfiguration.
- path: src/errors/capability-connector-mismatch.error.ts
  effect: a typed refusal raised once a named capability's own connector field does not match the connector
    configuration a test-connector request named.
- path: src/errors/capability-not-registered-for-test.error.ts
  effect: a typed refusal raised once readCapabilityByIdentity answers held:false for the capability a
    test-connector request named.
- path: src/errors/status-map.ts
  effect: maps CapabilityNotRegisteredForTestError to 404 and CapabilityConnectorMismatchError to 409.
- path: src/capability-registry/capability-registry.service.ts
  effect: 'adds readCapabilityByIdentity(name, version) — a second, identity-keyed read this task''s controller
    needs, answering the absence as ordinary { held: false, ... } data exactly as readCapability already
    does for the concept-keyed read.'
- path: src/http/dto/test-connector.dto.ts
  effect: declares testConnectorRequestSchema (capability identity, connector, subject, requester, optional
    input) and testConnectorResponseSchema (credential-redacted request echo plus a raw response/timed-out/error
    outcome, each carrying elapsedMs) and their inferred DTO types.
- path: src/http/test-connector.controller.ts
  effect: handleTestConnectorRequest resolves the named capability by identity, refuses it unregistered
    or connector-mismatched, resolves the named connector configuration, assembles the real request through
    resolveConnectorRequest, issues it once through issueConnectorHttpCall, and answers the raw outcome
    plus a credential-redacted echo of the request actually assembled.
- path: src/http/test-connector.routes.ts
  effect: 'registers POST /v1/test-connector as a Fastify plugin: validates the body, hands the parsed
    DTO to handleTestConnectorRequest, answers 200 with its result, sets no error handler and reads no
    request headers, mirroring diagnose.routes.ts''s own shape.'
- path: src/http/build-app.ts
  effect: adds a testConnector field to BuildAppDependencies and registers createTestConnectorRoutesPlugin(dependencies.testConnector)
    inside the existing routePlugins() loop.
- path: src/factories/build-app.factory.ts
  effect: composeResources now also exposes readCapabilityByIdentity from the one already-built CapabilityRegistryService
    instance; a new testConnectorDependencies() helper wires it together with the already-shared readConnectorConfiguration
    read and the platform's global fetch into BuildAppDependencies['testConnector'] — no new registry,
    store or HTTP client instance is constructed.
- path: __tests__/unit/http/build-app.spec.ts
  effect: gains a stubTestConnector() helper and a testConnector field on the fixture's BuildAppDependencies
    object; two const lines were merged to keep stubBuildAppDependencies() within MNT-01's 30-line limit.
criteria:
- criterion: Requesting test-connector for a capability that is registered and whose connector matches
    the connector configuration named returns the raw HTTP status, headers, body and timing of the call
    actually made.
  met: true
  how: 'handleTestConnectorRequest issues the resolved request through issueConnectorHttpCall and, for
    a call that reached the network, responseOutcome answers { kind: ''response'', status, headers, body,
    elapsedMs } from the same Response object and the same elapsed clock the call actually ran under.'
- criterion: The request issued is the one resolveConnectorRequest assembles from the given subject and
    the capability's connector configuration, the same translation a real observation uses.
  met: true
  how: handleTestConnectorRequest calls the exact same connector-request-resolver.ts's own resolveConnectorRequest
    — imported, not reimplemented — with the same configuration/subject/requester shape http-declarative-observation-source.adapter.ts's
    own observeConcept passes for a real observation.
- criterion: Requesting test-connector for a capability that is not registered at all is refused.
  met: true
  how: resolveTestedCapability calls readCapabilityByIdentity and throws CapabilityNotRegisteredForTestError
    when the resolution answers held:false, before any connector configuration is read or any call issued;
    mapped to 404.
- criterion: Requesting test-connector naming a connector configuration the capability's own connector
    does not match is refused.
  met: true
  how: resolveTestedCapability compares the resolved capability's own connector field against the requested
    connector and throws CapabilityConnectorMismatchError on a mismatch, before any configuration is read;
    mapped to 409.
- criterion: The subject examined is assembled from the subject type and attribute-values supplied in
    the request, never read back from a store.
  met: true
  how: handleTestConnectorRequest builds the subject through the existing buildSubject(type, attributes);
    no dependency this controller calls reads a subject from any store — the only two reads are the capability-by-identity
    read and the connector-configuration read.
- criterion: No evidence and no citation is written as a result of the operation.
  met: true
  how: TestConnectorControllerDependencies exposes only two reads and an HTTP client function; the controller
    calls no store write, no evidence-collection module and no citation module — the one side effect is
    the outbound HTTP call itself, whose answer is returned rather than persisted.
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: test-connector.routes.ts declares no authentication guard, middleware or header read of any kind;
    requester travels exactly as the request body's own unverified claim, mirroring diagnose.routes.ts's
    identical posture.
nodes:
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  encoded_at:
  - src/http/test-connector.controller.ts
  - src/errors/capability-not-registered-for-test.error.ts
  - src/errors/capability-connector-mismatch.error.ts
  how: resolveTestedCapability makes the named connector configuration reachable only once a specific,
    already-registered capability has been resolved by identity and its own connector field confirmed
    to name the requested connector — refusing both an unregistered capability and one whose connector
    does not match, before any configuration read or call is attempted.
- node: contracts/integration/connector-diagnostics
  encoded_at:
  - src/http/test-connector.routes.ts
  - src/http/test-connector.controller.ts
  - src/http/dto/test-connector.dto.ts
  how: exposes test-connector as POST /v1/test-connector, exercising a connector configuration's own call
    once through the named registered capability, against a subject assembled the same way any observation
    assembles one; the response carries only the raw request and raw outcome, never an evidence-result
    classification.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/test-connector.routes.ts
  - src/http/test-connector.controller.ts
  how: neither the route plugin nor the controller declares, invokes or reads anything resembling an authentication
    mechanism.
inferences:
- inferred: A resolved credential placeholder's real value is masked with a fixed redaction marker in
    the request echo returned to the caller, while the actual call issued still uses the real, unredacted
    value.
  from: this project's own standard (SEC-03, SEC-04) forbidding a credential from reaching a client response
    or log, combined with no specification node or task criterion stating whether the echoed request must
    carry the real credential value.
- inferred: CapabilityNotRegisteredForTestError maps to 404 and CapabilityConnectorMismatchError maps
    to 409 in the shared status map.
  from: status-map.ts's own established grouping — a resource that plainly does not exist answers 404,
    an operation the named resource's own current state forbids answers 409 — extended to this task's
    own two new refusals by the identical reasoning already applied to every sibling entry.
- inferred: The HTTP client this route issues its real call through is the platform's own global fetch,
    wired at the factory rather than built from a package.
  from: no HTTP client package is authorized for this project, and http-declarative-observation-source.adapter.ts's
    own options already make this identical default choice for a real observation.
- inferred: readCapabilityByIdentity is added as a second, narrower read on CapabilityRegistryService
    rather than joining the published capability-registry contract.
  from: contracts/integration/capability-registry names only read-capability (by concept) and list-capabilities;
    this task needs a lookup by identity (name and version), the same absence-stated-as-data shape readCapability
    already gives.
- inferred: The request DTO's optional input field is accepted and echoed nowhere; it plays no role in
    the request resolveConnectorRequest assembles.
  from: neither resolveConnectorRequest's own parameters nor criterion 2 gives an input payload anywhere
    to go — the request issued is assembled only from the subject and the connector's own configuration.
divergences:
- cites: MNT-03
  file: src/http/dto/test-connector.dto.ts
  departure: testConnectorRequestSchema's own subject shape (subjectAttributeValueSchema, subjectSchema)
    is restated rather than imported from diagnose.dto.ts.
  why: diagnose.dto.ts's own subjectAttributeValueSchema and subjectSchema are private, unexported constants
    of that file — the same restate-rather-than-lift-across-a-module-boundary choice capability-registry.service.ts's
    own pageCountOf already discloses for the identical reason; exporting or hoisting either sibling schema
    is a change to diagnose.dto.ts this task's own file set does not reach.
preserved:
- 'HttpDeclarativeObservationSource.observeConcept''s own observable behavior for a real observation:
  still resolves capability and connector configuration, still assembles the request through resolveConnectorRequest,
  still answers only one of the four evidence-result endings or a rejection, and still discards the elapsed
  time issueConnectorHttpCall now additionally reports.'
- buildApp's single routePlugins() registration loop and its existing route registrations, each dependency
  slice and each plugin construction unchanged.
- 'build-app.factory.ts''s own single-instance-per-registry convention: capabilityRegistry, glossary and
  connectorConfigurationRegistry remain each built exactly once and shared across every route that reads
  from them.'
---

## What it is

A Fastify route, controller and DTO pair for test-connector, its request body mirroring the diagnose route's existing subject DTO, exercising a connector configuration's real call once through a specific, already-registered capability, and returning the raw request and raw outcome — writing no evidence and no citation.

## Notes

None.
