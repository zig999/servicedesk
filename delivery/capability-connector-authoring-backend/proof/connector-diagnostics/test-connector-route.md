---
title: Proof for the test-connector diagnostic route
summary: app.inject tests against createTestConnectorRoutesPlugin() with mocked reads and a stubbed HTTP
  client, proving all seven criteria of task/connector-diagnostics/test-connector-route.
implementation: sha256:1469f7ba4b71565a5f7cda68fc85f208bc2eda9f1445de62be1f525de962a8ad
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-diagnostics-test-connector-route-suite
tests:
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct
    from the route's own 200 wrapper
  proves: Requesting test-connector for a capability that is registered and whose connector matches the
    connector configuration named returns the raw HTTP status, headers, body and timing of the call actually
    made.
  fails_when: the response.response object stops carrying the call's own status, header, parsed body,
    or a numeric non-negative elapsedMs
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: issues the exact request resolveConnectorRequest assembles from the given subject and the connector
    configuration — the subject-attribute and requester placeholders resolved, not left as literal template
    text
  proves: The request issued is the one resolveConnectorRequest assembles from the given subject and the
    capability's connector configuration, the same translation a real observation uses.
  fails_when: the URL and headers actually handed to the httpClient stop reflecting resolveConnectorRequest's
    own placeholder substitution over the given subject and requester
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a request naming a capability that is not registered at all, with the status the status
    map assigns CapabilityNotRegisteredForTestError
  proves: Requesting test-connector for a capability that is not registered at all is refused.
  fails_when: readCapabilityByIdentity answering held:false stops producing a 404 with code CapabilityNotRegisteredForTestError,
    or the controller proceeds anyway
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a request naming a connector configuration the capability's own connector does not match,
    with the status the status map assigns CapabilityConnectorMismatchError
  proves: Requesting test-connector naming a connector configuration the capability's own connector does
    not match is refused.
  fails_when: a held capability whose own connector differs from the requested connector stops producing
    a 409 with code CapabilityConnectorMismatchError
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: assembles the subject examined from each request's own subject type and attribute-values alone
    — two requests at the same capability and connector each address the outbound call with their own
    request's own subject, never a shared or cached one
  proves: The subject examined is assembled from the subject type and attribute-values supplied in the
    request, never read back from a store.
  fails_when: two sequential requests at the same capability/connector stop producing two distinct addresses
    each matching their own request's own subject-attribute value
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: demonstrates structurally that TestConnectorControllerDependencies exposes only two reads and
    an HTTP client — no evidence-writing or citation-writing function exists in this shape for the controller
    to call
  proves: No evidence and no citation is written as a result of the operation.
  fails_when: the dependency object the plugin is actually constructed with carries any key beyond readCapabilityByIdentity,
    readConnectorConfiguration and httpClient
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
    header
  proves: A request to the route carrying no authentication credential is not refused for lacking one.
  fails_when: an otherwise-valid request sent with no headers stops answering 200
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
    dispatching it exactly as one that carries none
  proves: A request to the route carrying no authentication credential is not refused for lacking one
    (a garbage credential is treated identically to none).
  fails_when: a request carrying a bogus authorization header stops answering 200 identically to one carrying
    none
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: answers 400 for a request whose body omits subject entirely, without reaching any dependency
  proves: basic request-body validation
  fails_when: a body with no subject field stops answering 400, or dependencies are reached despite the
    missing field
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: answers 400 for a request whose body omits the capability identity entirely, without reaching
    any dependency
  proves: basic request-body validation
  fails_when: a body with no capability field stops answering 400, or dependencies are reached despite
    the missing field
not_applicable:
- edge_case: a timeout or a genuine network failure from the HTTP-issuer
  why: issueConnectorHttpCall and resolveConnectorRequest are pre-existing, separately proven modules;
    this task's own criteria do not ask for their behavior to be re-proven at this route
- edge_case: missing connector field, missing requester field, or a subject with zero attributes
  why: these fields are validated by the identical DTO mechanism already exercised by the two chosen validation
    tests, so an additional test would prove the same DTO-boundary fact a second time
- edge_case: two requests in flight at once against the route
  why: no criterion or bound specification node states concurrent behavior for this diagnostic route,
    and the controller holds no shared mutable state across requests
untested:
- A test-connector request naming a connector configuration the registry holds no configuration for at
  all (readConnectorConfiguration answering held:false, raising ConnectorConfigurationNotFoundError) is
  not exercised here — the controller does raise it, but none of this task's own seven stated criteria
  names this refusal; it is an adjacent behavior inherited from the connector-configuration-registry's
  own contract rather than something this task's criteria ask for.
- The optional input field's own accepted-but-unused behavior (the implementation record's own disclosed
  inference) is not exercised by a dedicated test — no criterion states anything about it.
---

## What it is

Ten route-level tests proving test-connector's seven stated criteria plus basic request-body validation, with mocked reads and a stubbed HTTP client (no real network call).

## Notes

None.
