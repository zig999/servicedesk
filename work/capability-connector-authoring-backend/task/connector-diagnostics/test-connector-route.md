---
title: Expose test-connector as a diagnostic HTTP route
summary: A new HTTP route that issues a connector configuration's real call, through a specific already-registered capability, against a subject built from the request, and returns the raw request and response without writing evidence.
rationale: This stays one task because the one thing it newly requires beyond an ordinary route — the HTTP-issuance logic currently private inside HttpDeclarativeObservationSource becoming callable from elsewhere — has exactly this one new consumer, so exporting it is not an independently demonstrable outcome on its own.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: test-connector is exposed as a diagnostic HTTP route that, given a registered capability and a subject assembled from the request, issues the capability's connector's real call through resolveConnectorRequest and returns the raw request sent and the raw response received, writing no evidence and no citation.
criteria:
  - "Requesting test-connector for a capability that is registered and whose connector matches the connector configuration named returns the raw HTTP status, headers, body and timing of the call actually made."
  - The request issued is the one resolveConnectorRequest assembles from the given subject and the capability's connector configuration, the same translation a real observation uses.
  - Requesting test-connector for a capability that is not registered at all is refused.
  - Requesting test-connector naming a connector configuration the capability's own connector does not match is refused.
  - The subject examined is assembled from the subject type and attribute-values supplied in the request, never read back from a store.
  - No evidence and no citation is written as a result of the operation.
  - A request to the route carrying no authentication credential is not refused for lacking one.
implements:
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - contracts/integration/connector-diagnostics
  - constraints/no-route-enforces-authentication
---

## What it is

A Fastify route, controller and DTO pair for test-connector, its request body mirroring the diagnose route's existing subject DTO.
The HTTP-issuance logic HttpDeclarativeObservationSource uses internally, exported so this route can call it directly, with the adapter's own behavior unaffected.

## Notes

None.
