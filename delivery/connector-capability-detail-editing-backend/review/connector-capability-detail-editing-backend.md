---
title: connector-capability-detail-editing-backend, first review
summary: 'What four passes found over the backend half of the connector-capability-detail-editing initiative:
  the connector-configuration read responses'' wire-type correction, and the new read-capability-by-identity
  route.'
reviewed:
- src/http/dto/read-connector-configuration.dto.ts
- src/http/read-connector-configuration.controller.ts
- src/http/list-connector-configurations.controller.ts
- src/http/dto/list-connector-configurations.dto.ts
- src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
- src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
- src/errors/capability-identity-not-found.error.ts
- src/http/dto/read-capability-by-identity.dto.ts
- src/http/read-capability-by-identity.controller.ts
- src/http/read-capability-by-identity.routes.ts
- src/errors/status-map.ts
- src/http/build-app.ts
- src/factories/build-app.factory.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
tasks:
- task/registry-reads/connector-configuration-response-wire-type
- task/registry-reads/read-capability-by-identity-route
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: A GET /v1/connectors/{connector} response for a registered connector returns configuration
    as a JSON string, never a parsed object.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: answers 200 with the connector and configuration fields exactly as currently held under the
      named connector
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: returns configuration as a JSON string, never a parsed object
- criterion: A list-connector-configurations response returns every entry's configuration as a JSON string,
    never a parsed object.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers 200 with every connector configuration the registry read resolved, each carrying its
      connector and configuration fields unchanged
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers a data array whose single entry carries exactly the connector and configuration fields
      the domain model declares, unchanged from what the connector-configuration read resolved
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers every entry's configuration as a JSON string, never a parsed object
- criterion: Parsing the returned configuration string reproduces the same JSON value the connector was
    registered with.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: answers a configuration string that parses back to the same JSON value the connector was registered
      with
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: answers a configuration string that parses back to an empty object when the connector was registered
      with no configuration keys at all
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers every entry's configuration string parsing back to the same JSON value each connector
      was registered with
- criterion: A request naming a currently-registered (name, version) pair returns that capability's full
    declared contract — nature, input_schema, output_schema, timeout, connector and concept.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 200 with the capability currently registered under the named (name, version) identity,
      carrying its whole declared contract
- criterion: A request naming a (name, version) pair that is not currently registered is refused with
    a typed not-found error of its own, distinct from the errors the other read routes raise, mapped through
    status-map.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 404 with CapabilityIdentityNotFoundError and the requested identity as details, when
      no capability is currently registered under the named (name, version) identity
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: raises a CapabilityIdentityNotFoundError instance that is none of ConceptNotAnsweredError, ConnectorConfigurationNotFoundError
      or CapabilityNotRegisteredForTestError, the three other read routes' own not-found classes
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CapabilityIdentityNotFoundError to 404
- criterion: The route is registered in build-app's routePlugins() and answers on its first call, with
    no dependency on list-capabilities having run before it.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches read-capability-by-identity's own controller on the very first request a freshly built
      app instance ever receives, proving it is registered in routePlugins() with no dependency on any
      prior call to list-capabilities
- criterion: The route declares or invokes no authentication middleware, guard or check.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
      dispatching it exactly as one that carries none
  why: the two tests prove that an unauthenticated (or credential-bearing but unrecognized) request still
    succeeds, which is the observable proxy for the absence of a guard rather than a direct read of the
    route's own declarations; no test in the set inspects the route module itself for the presence or
    absence of a middleware/guard registration
failures_counted: 1
run: run/connector-capability-detail-editing-backend
findings:
- file: src/http/read-capability-by-identity.controller.ts
  where: lines 60-63, handleReadCapabilityByIdentityRequest's not-held branch
  cites: EDG-02
  evidence: "const resolution = await dependencies.readCapabilityByIdentity(params.name, params.version);\n\
    if (!resolution.held) {\n  throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);\n\
    }"
  cost: 'The rule requires a missing resource to be refused through a typed error raised in the service;
    here the service answers the absence as ordinary data (held: false, name, version) and the controller
    is what turns that into a thrown error. Every other caller of the same shared readCapabilityByIdentity
    read has to reimplement this same held-check-and-throw translation itself, since the service never
    throws it once for all of them.'
  correction: Move the held-check and the throw of CapabilityIdentityNotFoundError into CapabilityRegistryService's
    own readCapabilityByIdentity (or an equivalent service-level wrapper), so every consumer of the read
    receives the refusal already raised rather than the raw resolution.
  pass: standard
- file: src/http/read-capability-by-identity.routes.ts
  where: lines 46-48, the route registration inside createReadCapabilityByIdentityRoutesPlugin
  cites: EDG-07
  evidence: app.get(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) => readCapabilityByIdentityHandler(dependencies,
    request, reply));
  cost: No rate limit is attached to this route's own registration, and build-app.ts registers no shared
    rate-limiting plugin either, so a caller can invoke this read as fast as it likes with no refusal
    ever telling it to slow down or when to retry.
  correction: Apply a rate limit at this route's registration (or through a shared plugin every route
    registers under), and have its refusal name when the caller may try again.
  pass: standard
- file: src/http/read-connector-configuration.controller.ts
  where: lines 73-76, handleReadConnectorConfigurationRequest's not-held branch
  cites: EDG-02
  evidence: "const resolution = await dependencies.readConnectorConfiguration(params.connector);\nif (!resolution.held)\
    \ {\n  throw new ConnectorConfigurationNotFoundError(resolution.connector);\n}"
  cost: 'The rule requires the typed not-found error to be raised in the service; here the connector-configuration-registry
    service answers the absence as ordinary data (held: false, connector) and the controller performs
    the held-check and throw itself. Any other caller reading through the same registry receives the raw
    resolution rather than a refusal already raised once.'
  correction: Raise ConnectorConfigurationNotFoundError from within ConnectorConfigurationRegistryService's
    own read path (or an equivalent service-level wrapper) rather than from the controller, so the refusal
    exists once for every caller of the read.
  pass: standard
- cause: setup
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: beforeAll hook, line 393 (createDatabaseConnection / freshFixture setup)
  evidence: "Error: Hook timed out in 10000ms.\nIf this is a long-running hook, pass a timeout value as\
    \ the last argument or configure it globally with \"hookTimeout\".\n ❯ src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts:393:1\n\
    \    391| let fixture: IFixture;\n    392|\n    393| beforeAll(async () => {\n       | ^\n    394|\
    \   connection = createDatabaseConnection(requireDatabaseUrl());\n    395|   fixture = freshFixture();"
  cost: Neither the code nor the test for this suite's one scenario was reached -- the hook that stands
    up the real database connection and fixture never returned inside the default 10-second window, so
    the run says nothing about whether the persistence-deadline behavior (task/service-on-the-database/diagnose-end-to-end,
    criterion 5) still holds, and the suite's single test was left skipped rather than exercised. This
    file belongs to a different, already-delivered task and is outside this review's own file set.
  correction: Establish why creating the database connection and the fixture in this file's own beforeAll
    did not complete inside 10000ms in this run's environment (e.g. the externally provisioned PostgreSQL
    the constraint requires was slow to accept a connection, or unavailable) and fix that setup path,
    or, if the fixture/connection setup is legitimately slower than the default, raise this file's hookTimeout
    explicitly -- but only after confirming the delay is not itself a symptom of an unreachable or overloaded
    database.
  pass: failures
---

## What it is

The first review of the backend half of connector-capability-detail-editing: the connector-configuration wire-type fix and the new capability read-by-identity route, both tasks, over four independent passes plus one captured run of the project's own suite.

## Notes

The failures pass's one finding is a hook timeout in a file this review's own file set does not include (diagnose-persistence-deadline-e2e.spec.ts, belonging to task/service-on-the-database/diagnose-end-to-end) -- recorded because the run named it, exactly as the run reported it, not because this change touched that file.
The standard pass's three findings all cite EDG-02 or EDG-07, none of which state a domain fact -- SEC-01 (authentication) was checked but not cited, since the absence of an auth guard on these routes is a domain decision the specification already states (constraints/no-route-enforces-authentication), not a standard-conformance question.
The trace over the backend target (src) reports 78 code-drift findings over 24 files, none orphaned or moved -- almost all predate this review and belong to other deliveries across this and other initiatives; the route to each is /reconcile, owned by whoever delivered the change that left it stale, never this review.
