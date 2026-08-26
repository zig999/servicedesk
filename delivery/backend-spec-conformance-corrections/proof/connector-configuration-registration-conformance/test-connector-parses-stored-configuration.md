---
title: Test-connector's parse-then-derive path proven, including responseMap and statusMap
summary: Proves this task's one criterion — deriving method, responseMap and statusMap from a registered
  connector configuration's parsed, JSON-text-stored content — through the full capability-scoped test-connector
  route, citing the pre-existing tests that already prove the method half and adding two new tests that
  prove the previously-unobserved responseMap/statusMap half.
implementation: sha256:1bc6cca54beb1cacb561226923e83e4df7160ca96a7af285c9e5e3d4428aa67a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-test-connector-parses-stored-configuration-suite
tests:
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: issues the exact request resolveConnectorRequest assembles from the given subject and the connector
    configuration — the subject-attribute and requester placeholders resolved, not left as literal template
    text
  proves: 'Testing a registered connector configuration whose stored configuration is JSON text issues
    the call the configuration declares, deriving method, responseMap and statusMap from the parsed object.
    — the `method` half: heldConnectorConfigurationResolution() stores configuration as JSON.stringify(...)
    text, and this pre-existing test asserts the outbound httpClient call actually carries method ''GET'',
    a value only a successful parse of that stored text into an object could have produced.'
  fails_when: the controller stops parsing the registry's held JSON text before deriving method (e.g.
    reads the raw ConnectorConfiguration wrapper instead of the parsed inner object), leaving configuration.method
    undefined — the call would then be refused with MalformedHttpConnectorConfigurationError instead of
    issued as GET, and this test's calledInit.method assertion (and the response body's own request.address/headers
    assertions, which depend on the same successful derivation) would fail.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct
    from the route's own 200 wrapper
  proves: the same criterion, corroborating end to end that the full parse-then-derive-then-issue path
    over a JSON-text stored configuration completes and answers 200 rather than refusing — i.e. that responseMap
    and statusMap, once parsed, are well-formed enough not to trip asHttpConnectorCallConfiguration's
    own refusal on the ordinary path.
  fails_when: the parse-then-derive path stops succeeding for the JSON-text stored configuration this
    test supplies — the request would be refused before ever reaching httpClient, and this test's 200
    status and response-body assertions would fail.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a test-connector request whose stored connector configuration text parses to a responseMap
    holding a non-string value, proving responseMap is read from the parsed stored text rather than defaulted
    past
  proves: the `responseMap` half of this task's own criterion — that responseMap is genuinely derived
    from the parsed stored text rather than replaced with an always-valid default the route never actually
    reads, which the two tests above cannot show because this route never surfaces responseMap in its
    own response.
  fails_when: asHttpConnectorCallConfiguration stops reading responseMap from the object parsedConnectorConfiguration
    actually parsed out of the stored text (e.g. it is defaulted, ignored, or read from somewhere else)
    — the malformed value this test stores would then go unnoticed, the call would be issued (httpClient
    called) and the response would answer 200 instead of the expected 500/INTERNAL_ERROR refusal.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a test-connector request whose stored connector configuration text parses to a statusMap
    holding a value outside the four evidence-result endings, proving statusMap is read from the parsed
    stored text rather than defaulted past
  proves: the `statusMap` half of this task's own criterion, by the same reasoning as the responseMap
    test above, isolated to statusMap alone (responseMap and method are left at their default, valid values
    in this test).
  fails_when: asHttpConnectorCallConfiguration stops reading statusMap from the parsed object — the malformed
    value this test stores would go unnoticed, httpClient would be called, and the response would answer
    200 instead of the expected 500/INTERNAL_ERROR refusal.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a request naming a capability that is not registered at all, with the status the status
    map assigns CapabilityNotRegisteredForTestError
  proves: excludes the implementation this task's own Notes name as UNDERDETERMINED — one that accepts
    a connector configuration's own name directly and issues its declared call without requiring an already-registered
    capability naming that connector as its own. This pre-existing, untouched test proves the route still
    refuses (404, readConnectorConfiguration never called) before any connector configuration is read
    at all where no capability is registered at the named identity.
  fails_when: the route stopped requiring capability resolution ahead of connector-configuration resolution
    — i.e. adopted the underdetermined shortcut — so readConnectorConfiguration would be reached, or the
    response would not be 404, despite no capability being registered.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a request naming a connector configuration the capability's own connector does not match,
    with the status the status map assigns CapabilityConnectorMismatchError
  proves: excludes the same underdetermined implementation for its other refusal — a request naming a
    connector that does not match the found capability's own connector. This pre-existing, untouched test
    proves that refusal still runs (409, readConnectorConfiguration never called) ahead of any connector-configuration
    read.
  fails_when: the route stopped comparing the resolved capability's own connector against the request's
    named connector before deriving/issuing the call — the response would not be 409, or readConnectorConfiguration/httpClient
    would be reached despite the mismatch.
not_applicable:
- edge_case: connector configuration entirely absent from the registry for the named connector (ConnectorConfigurationNotFoundError)
  why: this task's own criterion presupposes "a registered connector configuration"; the not-found path
    is untouched by this task (listed under the implementation record's own `preserved`) and answers to
    a different, pre-existing refusal this task's Notes place outside its own scope.
- edge_case: a persisted configuration row whose held text is not syntactically valid JSON, or does not
    parse to a plain object
  why: registration-time validation (wellFormedConfiguration/textConfigurationOrThrow, the sibling task's
    own ground) refuses that shape before it is ever written, so no registered row this registry ever
    produces can reach this route in that state; parsedConnectorConfiguration's own isPlainObject guard
    is a defensive floor over a row this service never writes, documented as the sibling task's own inference
    rather than this task's criterion.
- edge_case: a stored configuration text whose parsed object omits `method` entirely (rather than holding
    an invalid responseMap or statusMap)
  why: this exercises the identical httpConfigurationProblems/refuseHttpConfigurationDepartures branch
    already exercised by the responseMap and statusMap tests above, and the ordinary-path tests already
    prove `method`'s own literal parsed value ('GET') survives to the outbound call — a third variant
    of the same shape check would not exercise a materially different code path.
- edge_case: two test-connector requests against the same connector configuration at once
  why: no specification node or task criterion states concurrent-request behavior for this read path,
    and readConnectorConfiguration is read fresh per request with no shared mutable state in this controller
    for a second request to race.
untested:
- whether responseMap and statusMap, once well-formed, carry the exact literal content the stored text
  declared (as opposed to some other well-formed value) — this route never surfaces either field in its
  own response, so only their shape is observable through the refusal tests above; content fidelity of
  a passing responseMap/statusMap is not independently provable through anything test-connector's own
  wire behavior exposes.
---

## What it is

Tests prove test-connector's issued call derives method, responseMap and statusMap from a registered connector configuration's parsed, JSON-text-stored content, through the full capability-scoped route.

## Notes

None.
