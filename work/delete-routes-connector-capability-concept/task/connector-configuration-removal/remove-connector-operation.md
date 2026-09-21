---
title: remove-connector on the connector-configuration registry
summary: The registry service's own remove-connector, removing the configuration registered under a name
  and refusing for no reason of its own.
rationale: Cut between the store and the route because it is the store port's consumer and the route's
  dependency, and because its one falsifiable outcome — that the removal is unconditional — is demonstrable
  at the service without any HTTP surface.
sources:
- intake/scope.md
depends_on:
- task/connector-configuration-removal/connector-configuration-store-delete
objective: The connector-configuration registry removes the configuration registered under a named connector,
  unconditionally.
criteria:
- Where a configuration is registered under the name, the operation removes it and a subsequent read of
  the registry does not return it.
- Where a capability currently names that connector as its own, this rule does not refuse the removal.
- A capability naming the removed connector is still registered after the removal, the removal writing
  to no capability.
- The operation consults no capability and performs no placeholder check before removing.
- The operation raises no refusal of its own on any condition about the connector's use.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/connector-registry/connector-configuration-registry.service.ts
implements:
- domain/integration/connector-configuration-registry
- domain/integration/connector-configuration
- rules/integration/removing-a-connector-configuration-is-unconditional
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
---

## What it is
The registry operation the published contract names, and the whole of what its governing rule asks: removal succeeds whether or not a capability names the connector.
It is the one of the three removals that reads nothing outside its own store.

## Notes
UNDERDETERMINED, from the specification — the rule's absent-name branch (never refused for that absence, every configuration left as it stood, answered exactly as a removal that removed one) reaches no criterion; criterion 1 is conditioned on a configuration being registered, and criterion 5 forbids only a refusal about the connector's use, not about the name's own emptiness.
UNDERDETERMINED, from the specification — the same branch's "answered exactly as a removal that removed one, and no error value for this case to name" is likewise unreached; no criterion pins what the operation returns, so the equality between the two branches is unverifiable against the criteria as written.
ADVISORY, from the specification — contracts/integration/connector-configuration-registry and the two route-scoped constraints govern the published surface, not this service operation; left out of implements as the sibling route task's own, and domain/integration/connector-configuration-registry declares no read operation of its own, so criterion 1 is demonstrated against the service's stated Responsibility rather than a published read.
