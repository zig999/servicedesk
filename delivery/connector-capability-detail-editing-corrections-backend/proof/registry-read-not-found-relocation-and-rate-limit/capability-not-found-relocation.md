---
title: Capability-by-identity not-found relocation into a service-level wrapper
summary: Proves the not-found refusal now originates from CapabilityRegistryService.readCapabilityByIdentityOrThrow rather than the controller, that the controller's handler is now a trivial pass-through, and that the raw readCapabilityByIdentity and test-connector's own refusal are unaffected.
implementation: sha256:0a271b3ef0dd0f02b92c067858d5e06c1470066566202826d3c04302d9c41a24
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-capability-not-found-relocation-suite-2
tests:
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 404 with CapabilityIdentityNotFoundError and the requested identity as details, when no capability is currently registered under the named (name, version) identity
  proves: A request to read-capability-by-identity for a name/version nothing has registered still responds HTTP 404 with CapabilityIdentityNotFoundError, unchanged in condition and message from before the relocation.
  fails_when: the route no longer answers 404 for a miss, the error code in the response body is anything other than CapabilityIdentityNotFoundError, or the details no longer carry the requested name and version — including if the controller stopped propagating a rejection its dependency raises
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: returns exactly the capability its readCapabilityByIdentity dependency resolves, unwrapped and untransformed
  proves: read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  fails_when: the controller starts inspecting or transforming the resolved value (e.g. expecting a { held, capability } shape) instead of returning the wrapper's own resolution as is
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: propagates exactly the CapabilityIdentityNotFoundError its readCapabilityByIdentity dependency rejects with, raising none of its own
  proves: read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  fails_when: the controller performs its own held-check-and-throw again (raising a different error instance, or swallowing/wrapping the dependency's own rejection) instead of letting the wrapper's own thrown error propagate unaltered
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: calls its readCapabilityByIdentity dependency with exactly the given name and version, performing no held-check or transformation of the params itself
  proves: read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  fails_when: the controller stops forwarding the path params to its dependency unchanged
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers the held capability directly, with no resolution wrapper, when one is currently registered under the named identity
  proves: the wrapper's held branch — readCapabilityByIdentityOrThrow resolves the Capability itself rather than a CapabilityIdentityResolution
  fails_when: readCapabilityByIdentityOrThrow answers a { held, capability } shape instead of the Capability directly, or fails to resolve at all for an identity the store holds
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: throws CapabilityIdentityNotFoundError carrying the requested name and version when nothing is registered under that identity
  proves: the wrapper's not-held branch, and constraints/the-capability-identity-read-refuses-an-unregistered-identity — readCapabilityByIdentityOrThrow raises CapabilityIdentityNotFoundError(resolution.name, resolution.version) on a miss
  fails_when: readCapabilityByIdentityOrThrow resolves a held:false value instead of throwing, throws a different error class, or the thrown error's context does not carry the requested name and version
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: propagates a failure the underlying store read itself raises, rather than reporting it as CapabilityIdentityNotFoundError
  proves: the edge case of a dependency (the store) failing — the wrapper does not mask an unrelated failure as a not-found refusal
  fails_when: readCapabilityByIdentityOrThrow catches the store's own rejection and reports it as CapabilityIdentityNotFoundError, or swallows it, instead of letting it propagate as itself
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: readCapabilityByIdentity itself still answers an unregistered identity as ordinary held-false data, never throwing, unaffected by the wrapper's own relocation
  proves: CapabilityRegistryService.readCapabilityByIdentity's existing signature and its held-false data-returning resolution on a miss are unchanged
  fails_when: 'readCapabilityByIdentity itself starts throwing CapabilityIdentityNotFoundError on a miss instead of answering { held: false, name, version } as data'
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: 'readCapabilityByIdentity itself still answers a currently held identity as { held: true, capability }, unaffected by the wrapper'
  proves: CapabilityRegistryService.readCapabilityByIdentity's existing signature ... unchanged
  fails_when: 'readCapabilityByIdentity itself stops answering the held branch as { held: true, capability }'
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a request naming a capability that is not registered at all, with the status the status map assigns CapabilityNotRegisteredForTestError
  proves: test-connector.controller.ts's resolveTestedCapability still throws CapabilityNotRegisteredForTestError, not CapabilityIdentityNotFoundError, on the same miss it already handles, unaffected by the relocation.
  fails_when: test-connector's own miss handling starts raising CapabilityIdentityNotFoundError, stops raising CapabilityNotRegisteredForTestError, or the response status/code changes — this test is pre-existing and untouched by this delivery; it continues to pass unmodified because TestConnectorControllerDependencies and testConnectorDependencies() were left wired to the raw, data-returning readCapabilityByIdentity
not_applicable:
- edge_case: an absent or empty :name / :version path segment
  why: refused before either the controller or the service-level wrapper is ever reached, by readCapabilityByIdentityParamsSchema's own EDG-01 boundary validation — proven, unmodified and unaffected by this relocation, by read-capability-by-identity.routes.spec.ts's own two pre-existing 400-validation tests, which this delivery did not touch
- edge_case: two requests against the same identity at once
  why: readCapabilityByIdentityOrThrow performs no write and holds no request-scoped state; no bound node states a concurrency guarantee over this read, so a test asserting one would assert a guarantee nobody made
- edge_case: a duplicate or uniqueness violation
  why: this task touches only the not-found refusal over an already-resolved identity read; capability identity uniqueness is enforced by registerCapability's own refuseAnsweredConcept/sameIdentity logic, which this task's files never reach
- edge_case: an operation attempted against a state that forbids it
  why: readCapabilityByIdentityOrThrow is a read with no precondition beyond the identity's own presence, which is exactly what the not-held-branch test already covers; there is no further forbidden-state to exercise
untested:
- That build-app.factory.ts's own readDependencies() actually wires resources.readCapabilityByIdentityOrThrow (rather than the raw resources.readCapabilityByIdentity) into the live read-capability-by-identity route in production. No integration test in this project exercises build-app.factory.ts's own composeResources/readDependencies wiring for any route — build-app.spec.ts's own unit tests construct a BuildAppDependencies value by hand and call buildApp() directly, bypassing this factory entirely, and no build-app.factory.spec.ts or equivalent exists for any route. This is a pre-existing gap in this project's test architecture, not one this delivery introduced or was asked to close.
divergences:
- from: src/__tests__/unit/http/build-app.spec.ts's own pre-existing stubReadCapabilityByIdentity() fixture
  departure: 'the fixture''s resolved value changed from { held: true, capability: {...} } to the plain Capability object directly, matching the implementation''s new Promise<Capability> return type. No assertion in this file was touched.'
  why: a direct, unavoidable compile-time consequence of this task's own legitimate retyping of ReadCapabilityByIdentityControllerDependencies.readCapabilityByIdentity — the fixture predates this task and mocked the old resolution-returning shape; fixing it is narrow, compile-only maintenance rather than new proof, and the task-implementer correctly refused it as outside its own mandate (source, never tests).
- from: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts's own pre-existing ReadCapabilityByIdentityMock fixtures
  departure: 'the mock''s type changed from Promise<CapabilityIdentityResolution> to Promise<Capability>; every held-case mockResolvedValueOnce({ held: true, capability }) became mockResolvedValueOnce(capability); the one not-held-case mockResolvedValueOnce({ held: false, name, version }) became mockRejectedValueOnce(new CapabilityIdentityNotFoundError(name, version)), matching how the relocated wrapper now actually signals a miss. No assertion (404 status, error code, or details body) was weakened, narrowed or removed.'
  why: same as above — an unavoidable consequence of this task's own retyping, not new test behavior.
---

## What it is

New unit tests over CapabilityRegistryService.readCapabilityByIdentityOrThrow (both branches: held and not-held) and over read-capability-by-identity.controller.ts's now-trivial pass-through, plus the route-level 404 assertion, plus confirmation that readCapabilityByIdentity's own raw behavior and test-connector's own distinct refusal are unaffected.
Two pre-existing test fixtures (build-app.spec.ts, read-capability-by-identity.routes.spec.ts) were updated for compile-time compatibility with this task's own legitimate type change, disclosed above as divergences rather than folded silently into the new tests.

## Notes

The first suite attempt (run/registry-read-not-found-relocation-and-rate-limit-capability-not-found-relocation-suite) failed: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts's own beforeAll hook timed out establishing a database connection, diagnosed cause "setup" — outside this delivery's own file set and outside this task's scope entirely (the same pre-existing gap named B4 in the review findings that seeded this corrective plan). Re-run once per protocol; the second attempt passed with that file's own hook again the only thing that could have failed and did not recur.
