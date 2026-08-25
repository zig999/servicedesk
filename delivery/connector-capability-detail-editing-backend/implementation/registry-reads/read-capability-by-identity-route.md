---
title: A capability can be read directly by its own (name, version) identity over
  HTTP
summary: Adds GET /v1/capabilities/{name}/{version}, calling CapabilityRegistryService
  existing readCapabilityByIdentity through a new route, controller and DTO, wired
  into build-app and mapped through status-map.ts with a fourth typed not-found error.
task: sha256:9d7ca070c7122dc5ee764b6dcdb399113078edbb55008cf1533eba0dbe1af6be
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-reads-read-capability-by-identity-route-build
files:
- path: src/errors/capability-identity-not-found.error.ts
  effect: a typed domain error, distinct from ConceptNotAnsweredError, ConnectorConfigurationNotFoundError
    and CapabilityNotRegisteredForTestError, raised at the HTTP boundary once readCapabilityByIdentity
    resolves held false, carrying a context of name and version.
- path: src/http/dto/read-capability-by-identity.dto.ts
  effect: declares readCapabilityByIdentityParamsSchema (:name and :version path segments,
    both non-empty) and readCapabilityByIdentityResponseSchema (the capability full
    eight declared attributes), plus their inferred DTO types.
- path: src/http/read-capability-by-identity.controller.ts
  effect: handleReadCapabilityByIdentityRequest calls the injected readCapabilityByIdentity(name,
    version) function, returns resolution.capability unchanged where held, and raises
    CapabilityIdentityNotFoundError where the resolution answers held false.
- path: src/http/read-capability-by-identity.routes.ts
  effect: createReadCapabilityByIdentityRoutesPlugin registers GET /v1/capabilities/:name/:version,
    validating both path segments before the controller runs, answering 200 with the
    resolved capability or letting a thrown domain error propagate to the app shared
    error handler; no authentication guard.
- path: src/errors/status-map.ts
  effect: maps CapabilityIdentityNotFoundError to 404, alongside the other resource-does-not-exist
    errors.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gained a readCapabilityByIdentity field, and routePlugins()
    registers createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity)
    as the twenty-sixth plugin.
- path: src/factories/build-app.factory.ts
  effect: readDependencies() now also picks readCapabilityByIdentity into BuildAppDependencies,
    reusing composeResources existing readCapabilityByIdentity resource (already shared
    with testConnectorDependencies) rather than a second instance.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: gains a stubReadCapabilityByIdentity() helper (returning the held true variant
    of CapabilityIdentityResolution) and a readCapabilityByIdentity field on the fixture
    BuildAppDependencies object, inlined onto the existing readCapability line so
    stubBuildAppDependencies() stays within MNT-01 30-line bound.
criteria:
- criterion: A request naming a currently-registered (name, version) pair returns
    that capability's full declared contract — nature, input_schema, output_schema,
    timeout, connector and concept.
  met: true
  how: handleReadCapabilityByIdentityRequest returns resolution.capability unmodified
    where held, and readCapabilityByIdentityResponseSchema declares exactly the domain
    type eight attributes.
- criterion: A request naming a (name, version) pair that is not currently registered
    is refused with a typed not-found error of its own, distinct from the errors the
    other read routes raise, mapped through status-map.ts.
  met: true
  how: the controller raises CapabilityIdentityNotFoundError when the resolution answers
    held false, and status-map.ts maps it to 404 in the shared table, distinct from
    the other three classes.
- criterion: The route is registered in build-app's routePlugins() and answers on its
    first call, with no dependency on list-capabilities having run before it.
  met: true
  how: routePlugins() calls createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity);
    the underlying method reads the store fresh on every call, sharing no state with
    listCapabilities.
- criterion: The route declares or invokes no authentication middleware, guard or
    check.
  met: true
  how: read-capability-by-identity.routes.ts registers a plain app.get() call with
    no preHandler, guard or decorator checking any credential.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/http/dto/read-capability-by-identity.dto.ts
  - src/http/read-capability-by-identity.controller.ts
  how: readCapabilityByIdentityResponseSchema carries exactly the capability eight
    declared attributes under the same names the domain type holds them; the controller
    passes resolution.capability through unmodified.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/http/read-capability-by-identity.routes.ts
  - src/http/read-capability-by-identity.controller.ts
  - src/http/build-app.ts
  - src/factories/build-app.factory.ts
  how: exposes the contract fourth operation, read-capability-by-identity, over the
    pre-existing readCapabilityByIdentity method, additive to the other three published
    operations.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/read-capability-by-identity.routes.ts
  how: the new route declares no authentication middleware, guard or check of its
    own.
inferences:
- inferred: the controller depends on readCapabilityByIdentity as a plain function
    type rather than through the published ICapabilityQuery interface.
  from: the inventory own note that readCapabilityByIdentity is not part of ICapabilityQuery,
    and test-connector.controller.ts own dependency shape already taking that same
    method the same narrow way.
- inferred: the not-found refusal is raised through a new, distinct error class rather
    than reusing one of the three existing classes for the same held-false shape.
  from: the inventory own observed convention that every existing read route raises
    its own typed not-found class, and its explicit expectation that a new route add
    a fourth.
- inferred: the route path is GET /v1/capabilities/{name}/{version}, coexisting with
    register-capability own PUT against the identical segment shape.
  from: the capability own identity (name, version) and register-capability.routes.ts
    own precedent for keying that identity in the path; a different HTTP method against
    the same segment shape does not collide.
- inferred: stubBuildAppDependencies() new field is inlined onto the existing readCapability
    line rather than added as a separate line.
  from: MNT-01 30-line function bound, which the function already sat at exactly,
    and this file own established precedent of inlining a field at its use site to
    stay under that bound.
preserved:
- Every other route buildApp() already registered — routePlugins() existing twenty-five
  entries, their ordering and their closures are unchanged; only one new plugin call
  was appended.
- CapabilityRegistryService own readCapabilityByIdentity method and behavior, already
  delivered under a prior task and shared unchanged with testConnectorDependencies.
- The shared error-handling and status-mapping convention — the new class joins the
  existing table rather than introducing a second mapping mechanism.
- Every other field and every already-passing test in build-app.spec.ts — the fix
  appends one field to the fixture object and one stub helper; no existing test assertion
  changed.
deferred:
- what: build-app.spec.ts own parameterized route-reachability list does not include
    a request against the new route.
  why: which tests exist for a task is test-authorship own judgment, not this implementation.
- what: build-app.spec.ts own header comment and a doc comment still describe stale
    route-plugin counts that predate this task.
  why: correcting a pre-existing, unrelated comment count would widen this task past
    its own fixture fix.
- what: build-app.factory.ts own top-of-file comment still describes an outdated route
    count.
  why: this drift predates this task; correcting it would widen this task past its
    own wiring.
---

## What it is

A Fastify route, controller, DTO and error pair for read-capability-by-identity, calling CapabilityRegistryService already-existing readCapabilityByIdentity, wired into build-app alongside its twenty-five sibling routes.
Also fixes build-app.spec.ts own stubBuildAppDependencies() fixture, which a follow-up typecheck run found was never extended for the new required field.

## Notes

The specification now publishes this as contracts/integration/capability-registry own fourth operation, read-capability-by-identity, added by an /analyse run earlier in this same initiative.
