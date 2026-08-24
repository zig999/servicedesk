---
title: GET /v1/connectors/{connector} read-connector-configuration route
summary: Four app.inject() tests against createReadConnectorConfigurationRoutesPlugin with a stood-in
  readConnectorConfiguration, proving both stated criteria plus the route's own not-found mapping and
  empty-path validation.
implementation: sha256:24544f5cbcd459261a8adacd4417ffbc7cb2f183d40917dde62cbfed6fbae431
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-read-connector-configuration-route-suite
tests:
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers 200 with the connector and configuration fields exactly as currently held under the named
    connector
  proves: Criterion 1 — reading by a currently registered name returns its connector and configuration
    fields exactly as currently held.
  fails_when: the response body omits, renames or adds a field relative to the resolution's held configuration,
    or the status is not 200
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: does not refuse a request carrying no authentication credential
  proves: Criterion 2 — a request carrying no authentication credential is not refused for lacking one.
  fails_when: any authentication guard, decorator or middleware is added to this route that rejects a
    credential-less request before the controller runs
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers 404 with ConnectorConfigurationNotFoundError when no connector configuration is currently
    registered under the named connector
  proves: the route's own not-found mapping — a held:false resolution reaches the client as 404 with the
    shared error envelope
  fails_when: the controller stops raising ConnectorConfigurationNotFoundError on held:false, the status-map
    entry is removed or changed, or the error envelope's shape changes
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers 400 via validation for a request with an empty connector segment, never reaching the read
  proves: the path-param schema's non-empty constraint is enforced before the controller runs
  fails_when: an empty :connector segment reaches the controller, or the status stops being 400
not_applicable:
- edge_case: concurrent requests against different connector names
  why: read-capability.routes.spec.ts already establishes this shape is stateless per-request for the
    sibling route and read-connector-configuration.controller.ts has no shared mutable state of its own
    to race on
- edge_case: the query rejecting (dependency failure surfacing as 500 without leaking detail)
  why: already proved for the identical error-handler.middleware.ts path by read-capability.routes.spec.ts's
    own equivalent test; this task adds no new behavior to that shared handler
- edge_case: case/hyphenation preservation of the :connector segment
  why: criterion 1 only requires fields to come back exactly as held for a currently registered name;
    the route does no normalization of its own, and the implementation record states no inference about
    casing behavior to pin
untested:
- whether readConnectorConfiguration in build-app.factory.ts's wiring actually resolves to the same ConnectorConfigurationRegistryService
  instance registerConnector shares — the implementation record claims this instance-sharing as an inference/preserved
  fact, but it is a build-app.ts / build-app.factory.ts wiring concern outside this file's route-level
  tests, which stand in the dependency behind a mock; build-app.spec.ts is where that wiring is exercised,
  not this route's own suite
---

## What it is

Four route-level tests proving read-connector-configuration's two stated criteria plus its own not-found mapping and path-param validation.

## Notes

None.
