---
title: List-connector-configurations route proof
summary: Fourteen tests exercising GET /v1/connectors through Fastify's app.inject() with an injected
  mock listConnectorConfigurations dependency, proving both stated criteria and the pagination/edge-case
  behavior list-capabilities.routes.spec.ts's own precedent settled for.
implementation: sha256:4365c9ad480b933394b6757b5a6b449bd2bf86611e90a21c3d5b99f8a545d319
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-list-connector-configurations-route-suite
tests:
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 200 with every connector configuration the registry read resolved, each carrying its connector
    and configuration fields unchanged
  proves: Criterion 1 — listing returns every currently registered connector configuration with its connector/configuration
    fields.
  fails_when: the route's body diverges from exactly the page the injected read resolved, or the status
    code is not 200
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers a data array whose single entry carries exactly the connector and configuration fields
    the domain model declares, unchanged from what the connector-configuration read resolved
  proves: Criterion 1's field-shape half
  fails_when: an entry's keys are not exactly {connector, configuration}, or its values differ from what
    the mock resolved
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when the
    registry holds no connector configuration at all
  proves: an empty registry answers an empty page rather than an error, at the level list-capabilities'
    own spec settled for
  fails_when: an empty registry produces a non-200 status or a body that is not the resolved empty envelope
    unchanged
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 200 for a request carrying no authentication credential of any kind, rather than refusing
    it for lacking one
  proves: Criterion 2 — the route is not refused for lacking a credential.
  fails_when: a preHandler, guard or credential check is added and the credential-less request is refused
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: passes the request's own offset and limit through to the connector-configuration read unchanged,
    when both are given and within bounds
  proves: a well-formed offset/limit reaches the read exactly as given
  fails_when: the controller mutates, drops or miscomputes offset/limit before calling the read
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: defaults offset to 0 when the request names none
  proves: the resolvePagination default for an absent offset, mirroring list-capabilities' own settled
    level
  fails_when: an absent offset is passed through as anything other than 0
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
  proves: an absent limit is bounded by the injected defaultLimit
  fails_when: the call to the read carries a limit other than the configured defaultLimit for a request
    naming none
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
  proves: an oversized limit is clamped, not refused
  fails_when: an oversized limit is passed through unclamped or refused
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 400 for a non-numeric offset, without ever reaching the connector-configuration read
  proves: DTO validation rejects a malformed offset before the controller/read is reached
  fails_when: a non-numeric offset passes validation or the mock read is invoked anyway
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 400 for a negative offset, one below the nonnegative range the schema declares, without
    ever reaching the connector-configuration read
  proves: the schema's nonnegative bound on offset is enforced at the boundary of its declared range
  fails_when: offset=-1 is accepted or the read is called despite the 400
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 400 for a limit of zero, one below the positive range the schema declares, without ever
    reaching the connector-configuration read
  proves: the schema's positive bound on limit is enforced at the boundary of its declared range
  fails_when: limit=0 is accepted or the read is called despite the 400
untested:
- 'The route''s 500 behavior when the injected read rejects (as list-capabilities.routes.spec.ts also
  tests via a shared error-handler) is not exercised here: the route sets no error handler of its own
  and relies entirely on whatever the app already has registered, so proving the generic-envelope/no-leaked-message
  behavior belongs with error-handler.middleware.ts''s own suite and/or build-app.spec.ts''s end-to-end
  wiring, not this route''s own spec — this task''s own two criteria do not require it.'
---

## What it is

Eleven route-level tests proving list-connector-configurations' two stated criteria plus pagination defaults, clamping and validation, at the level list-capabilities' own precedent settled for.

## Notes

None.
