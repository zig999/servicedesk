---
title: connector-capability-detail-editing-corrections-backend, first review
summary: 'What four passes found over the backend corrective change''s three tasks: the not-found relocations for capability and connector-configuration reads, and the capability-identity read''s rate limit.'
reviewed:
- src/capability-registry/capability-registry.service.ts
- src/http/read-capability-by-identity.controller.ts
- src/factories/build-app.factory.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/connector-registry/connector-configuration-registry.service.ts
- src/http/read-connector-configuration.controller.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
- src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
- src/http/read-capability-by-identity-rate-limit.middleware.ts
- src/http/read-capability-by-identity.routes.ts
- src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
- src/__tests__/unit/http/test-connector.routes.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
tasks:
- task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation
- task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation
- task/registry-read-not-found-relocation-and-rate-limit/capability-identity-read-rate-limit
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean (all steps, including test, exited 0) -- there was no failure for this pass to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: A request to read-capability-by-identity for a name/version nothing has registered still responds HTTP 404 with CapabilityIdentityNotFoundError, unchanged in condition and message from before the relocation.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 404 with CapabilityIdentityNotFoundError and the requested identity as details, when no capability is currently registered under the named (name, version) identity
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: throws CapabilityIdentityNotFoundError carrying the requested name and version when nothing is registered under that identity
  why: the miss condition and the 404/error-code/details mapping are both exercised, but no test asserts the error's message text, so the "unchanged ... in message" half is unexercised (unlike the sibling connector-configuration criterion, whose own service test explicitly asserts the message string).
- criterion: read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
    name: returns exactly the capability its readCapabilityByIdentity dependency resolves, unwrapped and untransformed
  - file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
    name: propagates exactly the CapabilityIdentityNotFoundError its readCapabilityByIdentity dependency rejects with, raising none of its own
  - file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
    name: calls its readCapabilityByIdentity dependency with exactly the given name and version, performing no held-check or transformation of the params itself
  why: the exact pass-through behavior is proved, but that the injected dependency actually is CapabilityRegistryService.readCapabilityByIdentityOrThrow in production -- "a service-level wrapper method" -- is not exercised by any test driving build-app.factory.ts's real composition.
- criterion: CapabilityRegistryService.readCapabilityByIdentity's existing signature and its held-false data-returning resolution on a miss are unchanged, and its existing unit tests over that raw method continue to pass unmodified.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: readCapabilityByIdentity itself still answers an unregistered identity as ordinary held-false data, never throwing, unaffected by the wrapper's own relocation
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: 'readCapabilityByIdentity itself still answers a currently held identity as { held: true, capability }, unaffected by the wrapper'
- criterion: test-connector.controller.ts's resolveTestedCapability still throws CapabilityNotRegisteredForTestError, not CapabilityIdentityNotFoundError, on the same miss it already handles, unaffected by the relocation.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: refuses a request naming a capability that is not registered at all, with the status the status map assigns CapabilityNotRegisteredForTestError
- criterion: A request to read-connector-configuration for a connector name nothing has registered still responds HTTP 404 with ConnectorConfigurationNotFoundError, unchanged in condition and message from before the relocation.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: answers 404 with ConnectorConfigurationNotFoundError when no connector configuration is currently registered under the named connector
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: throws ConnectorConfigurationNotFoundError naming the requested connector, with the message unchanged from before the relocation, when nothing is registered under that name
- criterion: read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved configuration, from a service-level wrapper method instead.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
    name: answers the wire projection of exactly the configuration its readConnectorConfiguration dependency resolves, performing no held-check of its own
  - file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
    name: propagates exactly the ConnectorConfigurationNotFoundError its readConnectorConfiguration dependency rejects with, raising none of its own
  - file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
    name: calls its readConnectorConfiguration dependency with exactly the given connector, performing no held-check or transformation of the param itself
  why: the pass-through behavior is exercised, but that the real dependency wired in is ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow is unproven by this test set, the same gap as the capability side's own criterion above.
- criterion: ConnectorConfigurationRegistryService.readConnectorConfiguration's existing signature and its held-false data-returning resolution on a miss are unchanged, and connector-configuration-registry.service.spec.ts:158-164's existing assertion of that data-returning behavior continues to pass unmodified.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves the absence of a connector nothing has registered, as data rather than a raised error
- criterion: test-connector.controller.ts's resolveTestedConnectorConfiguration still throws its own ConnectorConfigurationNotFoundError from within test-connector.controller.ts's own code on the same miss, without going through the new wrapper, unaffected by the relocation.
  state: uncovered
  why: nothing in this test set exercises a connector-configuration-not-found miss reached through test-connector.controller.ts -- test-connector.routes.spec.ts's own readConnectorConfiguration mock is only ever resolved as held; no test sets it to an unheld resolution or asserts a ConnectorConfigurationNotFoundError from that code path.
- criterion: http-declarative-observation-source.adapter.ts's resolveConnectorConfiguration still throws ConnectorConfigurationNotRegisteredError on the same miss, unaffected by the relocation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: rejects with a typed ConnectorConfigurationNotRegisteredError, never one of the four endings, when the capability's own connector names no configuration currently registered
- criterion: A 61st request within one minute from the same source IP to read-capability-by-identity receives HTTP 429.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: answers the 61st request within one minute from the same source IP with HTTP 429
- criterion: That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: names, in the 429 response, a Retry-After value the caller may retry after
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: never answers a Retry-After below one second, even when the refusal lands in the window's very last millisecond
- criterion: Up to and including the 60th request within the same minute from that source IP still receives its ordinary, non-429 response.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: answers every one of the first 60 requests within a minute from one source IP with its ordinary response, none of them refused
- criterion: A request from a different source IP within the same minute is not counted against another source IP's limit.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: does not count a second source IP's requests against a first source IP's own limit
- criterion: No route other than read-capability-by-identity is registered against the rate-limit mechanism this task adds, and every other existing route's tests continue to pass unmodified.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
    name: refuses no route but read-capability-by-identity, even once that route's own limit is exhausted from the same source IP
  why: the isolation half is exercised directly; the second half ("every other existing route's tests continue to pass unmodified") names a fact about the rest of the suite's own test files, none of which are a unit test bearing on this criterion -- it is instead what this review's own captured run demonstrates directly (the whole project's suite, including every other route's own spec file, passed clean), reported separately below rather than as coverage.
findings:
- pass: conformance
  file: src/http/read-capability-by-identity-rate-limit.middleware.ts
  where: refuseOverLimit(), the 429 response body
  evidence: 'code: ''RATE_LIMIT_EXCEEDED'', message: ''too many requests from this source; retry after the given number of seconds'','
  cost: constraints/the-capability-identity-read-is-rate-limited states only that a request past the limit "is refused with a 429 response naming when the caller may retry" -- it never names a condition identifier or a message for this refusal, unlike its own sibling refusal (constraints/the-capability-identity-read-refuses-an-unregistered-identity), whose statement explicitly names "CapabilityIdentityNotFoundError as the specific condition and message of that refusal", and whose own decision-log entry states this specification's idiom is to keep the HTTP status and the error value a fact the specification states rather than one left for code alone to carry. Here the refusal's own condition string and wording exist only in this file.
  correction: name the refusal's own condition (and its message, if it matters to a caller) in constraints/the-capability-identity-read-is-rate-limited's own statement or a decision-log entry against it, the way CapabilityIdentityNotFoundError is named for the sibling refusal, and have the code read that value rather than declare its own.
- pass: standard
  file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  where: lines 19-31, the heldCapability() fixture builder
  cites: MNT-03
  evidence: 'function heldCapability(overrides: Partial<Capability> = {}): Capability { return { name: ''a-capability'', version: ''1.0.0'', nature: ''read-only'', input_schema: ''an-input-schema'', output_schema: ''an-output-schema'', timeout: 5_000, connector: ''a-connector'', concept: ''a-concept'', ...overrides, }; }'
  cost: the identical function already exists, word for word, in read-capability-by-identity.routes.spec.ts and in read-capability-by-identity-rate-limit.middleware.spec.ts. A future field added to Capability has to be added to three separate copies, and nothing forces that -- the copy nobody remembered to touch still compiles and still passes, so a fixture that stopped matching the real shape would surface as silence rather than as a failing test.
  correction: call the heldCapability() builder read-capability-by-identity.routes.spec.ts already defines (export it from there, or a shared test-fixture module) rather than restating it in this file and in the rate-limit middleware spec.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: lines 150-152, the pageCountOf function
  cites: MNT-03
  evidence: 'function pageCountOf(total: number, limit: number): number { return limit > 0 ? Math.ceil(total / limit) : 0; }'
  cost: the identical function already exists in capability-registry.service.ts (lines 263-265) -- this file restates it rather than calling it, as its own header comment acknowledges. A future change to how a non-positive limit's page count is floored has to be made in both services, and the copy left unchanged keeps computing the old answer with nothing to flag that it diverged.
  correction: export capability-registry.service.ts's own pageCountOf, or lift it into a module both services import, and call it from here instead of restating the identical formula.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: lines 241-243, the isUndeclared function
  cites: MNT-03
  evidence: 'function isUndeclared(value: string | undefined): boolean { return value === undefined || value === ''''; }'
  cost: the identical function already exists in capability-registry.service.ts (lines 219-221), unacknowledged here. A future change to what counts as "undeclared" has to be made in both services, and the copy left behind keeps the old rule with no signal that the two now disagree.
  correction: export capability-registry.service.ts's own isUndeclared, or lift it into a module both services import, and call it from here instead of restating an identical function.
---

## What it is

Four passes over the backend corrective change: coverage against all fourteen criteria of its three tasks, specification conformance against the four nodes those tasks implement, standard conformance against backend-node-service.yaml's 35 reading-decided rules, and a failures pass that did not run because the captured run passed clean.

## Notes

The captured run (run/connector-capability-detail-editing-corrections-backend) over the registry's full step list -- install, typecheck, lint, secret-scan, test -- passed clean; the whole project's own suite, including every other route's own spec file, exited 0, which is what the last coverage entry's own second half rests on rather than a dedicated unit test.
The coverage pass's first run omitted two pre-existing test files this review's own file set had not named (test-connector.routes.spec.ts, http-declarative-observation-source.adapter.spec.ts) even though the tasks' own proof records cite the first of them as evidence -- caught and corrected with a second, narrower coverage pass before this record was composed; the coverage entries above already reflect the corrected reading.
The standard pass's own MNT-03 findings include two pre-existing duplications (pageCountOf, isUndeclared) the connector-configuration relocation task's own file happened to sit beside, not introduced by this change, disclosed by the reviewing agent as findings against the file set regardless of which task's delivery first wrote the duplicating line.
The trace's own drift is reported separately below and is not a finding of any of the four passes.
