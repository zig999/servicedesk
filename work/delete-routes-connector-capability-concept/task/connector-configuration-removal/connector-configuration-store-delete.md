---
title: A real deletion in the connector-configuration store
summary: A removal by connector name on the store port, implemented as a deletion of the stored row inside
  a transaction rather than as an omission from the upsert-only write.
rationale: Cut ahead of the operation because it changes the store port, an interface whose consumer is
  the operation. Cut as a task of its own at all because the surveyor found the existing write path is
  upsert-only and never deletes an absent row, so a removal built on it would leave the row in place while
  the in-memory list looked correct.
sources:
- intake/scope.md
objective: The connector-configuration store removes a stored configuration by connector name.
criteria:
- The store port declares a removal keyed by the connector name alone, the one identity a connector configuration
  has.
- The relational implementation issues a delete statement against the connector-configuration relation
  inside a transaction.
- After the removal, a read of the registered connector configurations does not return that name.
- The store port's existing write method keeps its current signature and behaviour, the removal being
  a method of its own rather than a new meaning for the write.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/connector-registry/connector-configuration-store.port.ts
- src/src/persistence/relational-connector-configuration-store.repository.ts
- src/src/persistence/relational-case-store.repository.ts
implements:
- rules/integration/removing-a-connector-configuration-is-unconditional
- domain/integration/connector-configuration-registry
- domain/integration/connector-configuration
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
---

## What it is
The one store change this removal needs, and the only place in it that touches SQL.
The existing case store's manifest-entry deletion is the shape to mirror: a literal delete statement inside the store's own transaction.

## Notes
UNDERDETERMINED, from the specification — the rule now also states that a removal naming a connector nothing is registered under is never refused for that absence and is answered exactly as one that removed a row; no criterion excludes a store that instead reports absence (a found/not-found flag, a deleted-row count, or a not-registered error) to its caller.
ADVISORY, from the specification — contracts/integration/connector-configuration-registry and the two route-scoped constraints (a-malformed-request-is-refused-with-a-validation-error, no-route-enforces-authentication) govern the published surface this task does not build; left out of implements as the sibling route task's own.
