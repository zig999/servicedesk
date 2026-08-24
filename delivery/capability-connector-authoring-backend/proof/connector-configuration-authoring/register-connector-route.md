---
title: Proof for register-connector exposed as a write HTTP route
summary: HTTP-level tests for PUT /v1/connectors/{connector} (wiring, status mapping, DTO boundary, no-auth)
  plus direct service-level tests for wellFormedConfiguration's real JSON-syntax and object-shape checks,
  together proving the task's five criteria.
implementation: sha256:4468b1b3066444e622105899ea2f76d5a5438de6f0e49e9d747b04b5c06c9cf2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-register-connector-route-suite
tests:
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers 200 with the held connector configuration registerConnector resolved, for a valid registration
    at the :connector the path names
  proves: Registering a connector configuration at a name that does not yet exist creates it.
  fails_when: the route answers a status other than 200, or a body other than exactly what registerConnector
    resolved
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: composes the path-carried connector identity and the body into one registration, calling registerConnector
    with it exactly
  proves: Registering a connector configuration at a name that does not yet exist creates it.
  fails_when: the controller drops, renames or reshapes the path-carried identity or the body's configuration
    before calling registerConnector
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers each of two requests at the same :connector with that request's own resolution, never
    a cached or joined value
  proves: Registering a connector configuration at a name that already exists replaces it whole rather
    than merging into what stood before. (route-level half; store-level whole-replace is connector-configuration-registry.service.spec.ts's
    own)
  fails_when: the second request's response or the second call's arguments reflect the first request's
    resolution, or registerConnector is called fewer than twice
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when the
    configuration text is not syntactically valid JSON
  proves: A registration whose configuration text is not syntactically valid JSON is refused. (HTTP-mapping
    half)
  fails_when: the route answers anything but 422, or an error code/details other than the error's own
    name and reason, when registerConnector rejects with it
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when the
    configuration text parses to something other than a JSON object
  proves: A registration whose configuration text parses to something other than a JSON object is refused.
    (HTTP-mapping half)
  fails_when: the route answers anything but 422, or an error code/details other than the error's own
    name and reason, when registerConnector rejects with it
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
    header
  proves: A request to the route carrying no authentication credential is not refused for lacking one.
  fails_when: a headerless request is refused
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
    dispatching it exactly as one that carries none
  proves: A request to the route carrying no authentication credential is not refused for lacking one.
  fails_when: a request bearing an unrecognized authorization header is refused instead of dispatched
    the same as a headerless one
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers 400 for a wholly empty body, without ever reaching registerConnector
  proves: basic DTO validation — configuration is required before the controller is reached
  fails_when: an empty body is accepted, or registerConnector is called for it
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: answers 400 via validation for a request with an empty :connector segment, never 404 route not
    found
  proves: basic DTO validation — the path identity's own required, non-empty connector is enforced at
    the validation boundary
  fails_when: the empty-segment request answers 404 instead of 400, or registerConnector is called for
    it
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration text is not syntactically valid JSON, naming the reason
  proves: A registration whose configuration text is not syntactically valid JSON is refused. (the real
    logic, string input, no HTTP/mock layer)
  fails_when: the malformed string ('{not valid') is accepted, or the reason text drifts from 'configuration
    is not syntactically valid JSON'
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration text is valid JSON but a JSON array
  proves: A registration whose configuration text parses to something other than a JSON object is refused.
    (real logic, array case)
  fails_when: '''[1,2,3]'' is wrongly accepted or the object-shape check is skipped'
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration text is valid JSON but a string primitive
  proves: A registration whose configuration text parses to something other than a JSON object is refused.
    (real logic, string-primitive case)
  fails_when: '''"a-string"'' is wrongly accepted'
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration text is valid JSON but the null primitive
  proves: A registration whose configuration text parses to something other than a JSON object is refused.
    (real logic, null case)
  fails_when: '''null'' is wrongly accepted'
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for a syntax failure
  proves: the JSON-syntax refusal is raised before any write
  fails_when: the store is written to despite the syntax refusal
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for a non-object shape
  proves: the object-shape refusal is raised before any write
  fails_when: the store is written to despite the shape refusal
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: accepts a registration whose configuration text is valid JSON object text, holding the parsed
    object unchanged
  proves: the positive control — real, valid JSON object text is accepted and held as the parsed object,
    making the five refusal tests above meaningful
  fails_when: valid object text is refused, or held as the raw string rather than the parsed object
not_applicable:
- edge_case: duplicate registration at one connector identity within a single request, or two operations
    against one subject at once
  why: no criterion of this task states concurrent-write behavior; the store-level replace-by-identity
    mechanics already belong to connector-configuration-registry.service.spec.ts's own pre-existing tests
- edge_case: an empty list / absence response shape
  why: register-connector is a write route answering one registered configuration, never a collection
- edge_case: a dependency (registerConnector) that fails slowly or times out
  why: no criterion or bound node states a timeout behavior for this route
untested:
- the disclosed inference that the route registers under PUT rather than POST (a request to the same URL
  via POST would answer Fastify's own 404) is not tested, matching the scope this task's route-level tests
  were narrowed to
- the disclosed inference that a non-string configuration value is passed through wellFormedConfiguration
  unchanged (treated as already-parsed) is not tested — this DTO always sends configuration as a string,
  so no HTTP-level test can exercise that branch, and it applies only to a non-HTTP caller outside this
  task's own scope
---

## What it is

Nine route-level tests proving register-connector's HTTP wiring, status mapping and no-auth criteria, plus six service-level tests proving wellFormedConfiguration's real JSON-syntax and object-shape logic with genuine string input — closing the gap a first pass at this proof honestly flagged rather than left silent.

## Notes

None.
