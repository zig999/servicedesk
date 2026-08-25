# Scope — connector-capability-detail-editing-corrections-backend

Corrective work over code already delivered by the closed initiative
connector-capability-detail-editing (both work/delivery roots -backend and
-frontend, now history), based on findings recorded by /review-change and
reanalysed in temp/2026-08-25-connector-capability-detail-editing-review-findings.md.
This backend increment covers three corrective facts, each a wrong behavior in
already-delivered code:

## 1. EDG-02 — not-found refusal thrown in the controller instead of the service, capability side

File: src/http/read-capability-by-identity.controller.ts
(handleReadCapabilityByIdentityRequest's not-held branch, lines ~60-63).

The shared read (readCapabilityByIdentity, backing CapabilityRegistryService)
answers a miss as ordinary data ({ held: false, name, version }); the
controller does the held-check and throws CapabilityIdentityNotFoundError
itself.

Correction: move that held-check and throw into CapabilityRegistryService's
own readCapabilityByIdentity (or an equivalent service-level wrapper), so
every consumer of that read (including testConnectorDependencies per
build-app.factory.ts) receives the refusal already raised. No change to the
error type, its condition, or its message — this is a relocation within the
code, not a new fact.

## 2. EDG-02 — same pattern, connector-configuration side (pre-existing)

File: src/http/read-connector-configuration.controller.ts
(handleReadConnectorConfigurationRequest's not-held branch, lines ~73-76).

ConnectorConfigurationRegistryService's own read answers a miss as ordinary
data ({ held: false, connector }); the controller does the held-check and
throws ConnectorConfigurationNotFoundError itself.

Correction: raise ConnectorConfigurationNotFoundError from within
ConnectorConfigurationRegistryService's own read path (or an equivalent
service-level wrapper), not the controller.

## 3. EDG-07 — the read-capability-by-identity route carries no rate limit

File: src/http/read-capability-by-identity.routes.ts
(createReadCapabilityByIdentityRoutesPlugin's route registration).

A caller can invoke this route unboundedly with no refusal ever telling it to
slow down.

This is now specified:
knowledge/constraints/the-capability-identity-read-is-rate-limited.md
(Architecture Constraint, scope integration) — at most 60 requests per minute
from one caller, identified by the request's source IP address (no route in
this build verifies a claimed identity, per
constraints/no-route-enforces-authentication.md); a request past that limit
is refused with an HTTP 429 response naming when the caller may retry
(Retry-After).

Correction: apply this rate limit at this route's own registration (or a
plugin only this route uses). Scope of this task is only this one route — no
shared rate-limit plugin for other routes.

## Notes

Target source root note: real files live under src/src/..., so
src/http/... above is src/src/http/... from the repo root.
Standard: standards/backend-node-service.yaml.

Full original review record for cross-reference:
delivery/connector-capability-detail-editing-backend/review/connector-capability-detail-editing-backend.md
and temp/2026-08-25-connector-capability-detail-editing-review-findings.md
(findings B1, B2, B3 — B4 is explicitly out of scope, belongs to a different
owner, not part of this increment).
