---
title: Proof for read-capability-by-identity-route
summary: Tests exercise GET /v1/capabilities/{name}/{version} in isolation and through
  buildApp(), proving the four criteria, the class-distinctness inference, the path-coexistence
  inference, and the edge cases the route's behavior raises.
implementation: sha256:ea1286e97b4cbe2507b5871ef0e893d4b3b5acb42221990746b9f328d0d25750
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-reads-read-capability-by-identity-route-suite
tests:
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 200 with the capability currently registered under the named (name,
    version) identity, carrying its whole declared contract
  proves: A request naming a currently-registered (name, version) pair returns that
    capability's full declared contract -- nature, input_schema, output_schema, timeout,
    connector and concept.
  fails_when: the controller drops, renames or adds a field to the resolved capability
    before answering, or the response no longer carries exactly the eight declared
    attributes
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: resolves the identity exactly as the path spelled it, case and hyphenation
    preserved, never normalized
  proves: criterion 1's read is keyed by the exact (name, version) the path names,
    not a normalized or partial value
  fails_when: the route or controller normalizes, trims or otherwise transforms the
    path segments before calling readCapabilityByIdentity
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers each of two requests naming different identities with that request
    own resolution, never a cached or joined value
  proves: criterion 1 holds per request rather than through any shared or cached state
    across identities
  fails_when: a second request answers with the first request resolution, or the two
    responses are joined or swapped
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 404 with CapabilityIdentityNotFoundError and the requested identity
    as details, when no capability is currently registered under the named (name,
    version) identity
  proves: A request naming a (name, version) pair that is not currently registered
    is refused with a typed not-found error of its own, distinct from the errors the
    other read routes raise, mapped through status-map.ts.
  fails_when: the route answers anything but 404, or the error envelope code is not
    exactly CapabilityIdentityNotFoundError, or details omit or misstate the requested
    name/version
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: raises a CapabilityIdentityNotFoundError instance that is none of ConceptNotAnsweredError,
    ConnectorConfigurationNotFoundError or CapabilityNotRegisteredForTestError, the
    three other read routes own not-found classes
  proves: the not-found error is distinct from the errors the other read routes raise,
    not a reuse of one of the three pre-existing classes
  fails_when: CapabilityIdentityNotFoundError is implemented as a subclass or alias
    of one of the other three, so an instanceof check against that class would pass
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication
    or authorization header
  proves: The route declares or invokes no authentication middleware, guard or check.
  fails_when: the route stops answering, or answers other than 200, for a request
    naming no credential
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 200 for a request carrying an authorization header naming no credential
    this route recognizes, dispatching it exactly as one that carries none
  proves: criterion 4 holds even for a request carrying an authorization header the
    route does not check
  fails_when: the route inspects or reacts to the authorization header at all, refusing
    the request or behaving differently because of it
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 400 via validation for a request with an empty :name segment, never
    reaching readCapabilityByIdentity
  proves: the empty-input edge case -- an empty name segment is refused at the validation
    boundary before the read is ever called
  fails_when: an empty :name segment reaches readCapabilityByIdentity, or the request
    is answered with anything but 400
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 400 via validation for a request with an empty :version segment, never
    reaching readCapabilityByIdentity
  proves: the same empty-input edge case for the :version segment
  fails_when: an empty :version segment reaches readCapabilityByIdentity, or the request
    is answered with anything but 400
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 500 with a generic message, never the rejected call own error text,
    when readCapabilityByIdentity itself rejects
  proves: the dependency-failure edge case -- a rejected read is answered generically
    rather than leaking its own error text
  fails_when: the response carries the original rejection message or any part of the
    sensitive text, or the status is not 500
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CapabilityIdentityNotFoundError to 404
  proves: the not-found refusal is mapped through status-map.ts, to 404
  fails_when: statusForError(new CapabilityIdentityNotFoundError(...)) returns anything
    other than 404, including undefined
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches read-capability-by-identity own controller on the very first request
    a freshly built app instance ever receives, proving it is registered in routePlugins()
    with no dependency on any prior call to list-capabilities
  proves: The route is registered in build-app routePlugins() and answers on its first
    call, with no dependency on list-capabilities having run before it.
  fails_when: the route was never added to routePlugins() (the first call 404s), or
    answering it requires some prior request or state this test never establishes
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers the GET to /v1/capabilities/{name}/{version} through read-capability-by-identity
    and the PUT to the identical path through register-capability, neither one colliding
    with the other
  proves: the implementation's own recorded inference that this route path coexists
    with register-capability identical PUT path shape without collision
  fails_when: either request is misrouted to the other route controller, or either
    answers with a status other than 200 because the two registrations interfere
not_applicable:
- edge_case: absent path segments (e.g. GET /v1/capabilities/a-name with no version)
  why: that URL matches read-capability own pre-existing GET /v1/capabilities/{concept}
    route, a different, already-delivered route -- it is not this route failing to
    receive a segment, so a test here would be exercising a sibling route own dispatch
    rather than this task behavior
- edge_case: two simultaneous requests for the identical (name, version) identity
  why: the route holds no shared mutable state of its own, and CapabilityRegistryService.readCapabilityByIdentity
    already reads the store fresh on every call, preserved unchanged by this task
    -- there is no concurrency hazard this route own code could introduce for a test
    to catch
- edge_case: a boundary at each end of a numeric range
  why: neither path parameter is numeric or range-bound; both are non-empty strings
    with no upper bound this task states
- edge_case: an empty collection where one comes back
  why: this route answers one resource or a 404, never a collection
- edge_case: a duplicate where uniqueness is claimed
  why: uniqueness of (name, version) is the registry own invariant, preserved unchanged
    by this task and not re-tested here
- edge_case: an operation against state that forbids it
  why: this is a pure read with no state transition to forbid
untested:
- the controller own dependency typed as a plain function rather than through ICapabilityQuery
  (the implementation first recorded inference) is a compile-time shape decision with
  no runtime-observable difference -- TypeScript structural typing erases at build;
  a test using ReadCapabilityByIdentityControllerDependencies as a plain object type-checks
  against exactly that shape, but no runtime assertion can distinguish it from a bound
  method taken off ICapabilityQuery, so this record leaves the distinction itself
  unproven at the level a test could evaluate
---

## What it is

Proves the four criteria for the new read-capability-by-identity route in isolation and through buildApp(), plus the recorded inferences (a distinct not-found class, path coexistence with register-capability) and the edge cases the route own behavior raises.

## Notes

None.
