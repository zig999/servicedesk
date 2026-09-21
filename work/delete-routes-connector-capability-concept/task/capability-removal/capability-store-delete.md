---
title: A real deletion in the capability store
summary: A removal keyed by name and version together on the capability store port, implemented as a deletion
  of the stored row inside a transaction.
rationale: Cut ahead of the operation because it changes the store port, an interface whose consumer is
  the operation. Kept separate from the connector and concept store tasks because each store has its own
  identity shape and its own relations, and they would change for different reasons.
sources:
- intake/scope.md
objective: The capability store removes a stored registration by name and version together.
criteria:
- The store port declares a removal taking name and version together, the composite identity a capability
  is registered at.
- The relational implementation issues a delete statement against the capability relation inside a transaction.
- After the removal, a read of the registered capabilities does not return that name and version.
- A capability sharing the name at a different version is still returned after the removal.
- The store port's existing write method keeps its current signature and behaviour, the removal being
  a method of its own rather than a new meaning for the write.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/capability-registry/capability-store.port.ts
- src/src/persistence/relational-capability-store.repository.ts
- src/src/persistence/relational-case-store.repository.ts
implements:
- contracts/integration/capability-registry
- domain/integration/capability-registry
- domain/integration/capability
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
---

## What it is
The one store change this removal needs, and the only place in it that touches SQL.
Identity is the pair, not the name: the upsert it sits beside already conflicts on name and version together.

## Notes
UNDERDETERMINED, from the specification — rules/integration/a-registered-capability-cited-by-evidence-is-never-removed's guard (refuse where evidence names the capability) is outside this task's own candidate set, so a store removal that unconditionally deletes a row a collected evidence item names satisfies every criterion here; the guard belongs to the operation task that consumes this store.
ADVISORY, from the specification — the three route-scoped constraints (malformed request, unmapped domain error, no authentication) bind the HTTP surface, not this store; left out of implements as the sibling route task's own.
