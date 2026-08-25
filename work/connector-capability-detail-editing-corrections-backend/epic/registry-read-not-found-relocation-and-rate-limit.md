---
title: Capability and connector-configuration read corrections
summary: The corrective relocation of two not-found refusals and a new rate limit on the read-capability-by-identity route, over code the closed connector-capability-detail-editing initiative already delivered.
rationale: The scope's three corrective facts land in the same read-by-identity surface — the capability and connector-configuration controllers, their sibling registry services, and the one capability-by-identity route — as a single backend increment already shipped by one closed initiative; nothing here separates into distinct specification coverage that would justify more than one epic.
sources:
  - intake/scope.md
covers:
  - constraints/the-capability-identity-read-is-rate-limited
  - constraints/the-capability-identity-read-refuses-an-unregistered-identity
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  - constraints/no-route-enforces-authentication
  - domain/integration/capability
  - domain/integration/capability-registry
  - contracts/integration/capability-registry
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
uncovered:
  - node: constraints/no-route-enforces-authentication
    why: This corrective work adds no authentication check to any route; the referenced constraint's own non-refusal already holds unchanged and is cited only as the reason the rate limit identifies a caller by source IP rather than a verified identity.
  - node: domain/integration/capability
    why: The capability aggregate's own attributes are untouched; the correction only relocates where an existing not-found refusal is raised for a read that already returns this shape.
  - node: domain/integration/capability-registry
    why: This domain service's stated operations (register-capability, resolve-concept) and responsibility do not name the read-by-identity not-found handling this corrective work relocates; nothing about registration or concept resolution changes.
  - node: contracts/integration/capability-registry
    why: The read-capability-by-identity operation this contract already names is unchanged in existence, condition, or response; the correction only moves which layer raises the same refusal, not what the API surface offers.
  - node: domain/integration/connector-configuration
    why: The connector configuration value object's own shape and replace-whole-on-edit responsibility are untouched; the correction only relocates where an existing not-found refusal on a read is raised.
  - node: domain/integration/connector-configuration-registry
    why: This domain service's stated operation (register-connector) and its responsibility to hold the current configuration by name are unchanged; the correction concerns only where an already-existing not-found refusal on a read is raised, not registration or holding.
  - node: rules/integration/a-connector-configuration-holds-a-well-formed-object
    why: This invariant governs registration validity; the corrective work concerns the not-found refusal on a read path and touches no registration or validation behavior.
---

## What it is

The two controllers currently do their own held-check-and-throw over a data resolution the underlying service methods already return, and this epic relocates each into a service-level wrapper its own controller alone calls.
The read-capability-by-identity route currently carries no rate limit, and this epic applies the one the new architecture constraint states, to that one route only.
Every other consumer of the two underlying read methods, and the raw methods' own signatures, are left exactly as they stand today.

## Notes

None.
