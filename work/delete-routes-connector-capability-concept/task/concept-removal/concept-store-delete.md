---
title: A real deletion in the glossary store
summary: A removal of a concept by name on the glossary store port, deleting the concept row and its accepted-subject-type
  rows in one transaction.
rationale: Cut ahead of the operation because it changes the store port, an interface whose consumer is
  the operation. Kept separate from the other two store tasks because this deletion reaches a second relation,
  the concept's accepted subject types, which neither of the others has.
sources:
- intake/scope.md
objective: The glossary store removes a stored concept by name together with its accepted-subject-type
  rows.
criteria:
- The store port declares a removal keyed by the concept name alone, the one identity a concept has.
- The relational implementation deletes the concept's accepted-subject-type rows and the concept row in
  one transaction, so neither is left behind when the other is gone.
- After the removal, a read of the registered concepts does not return that name.
- The subject types the removed concept accepted are still held in their own vocabulary after the removal.
- The store port's existing concept write method keeps its current signature and behaviour, the removal
  being a method of its own rather than a new meaning for the write.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/glossary/glossary-store.port.ts
- src/src/persistence/relational-glossary-store.repository.ts
- src/src/persistence/relational-case-store.repository.ts
implements:
- rules/glossary/a-registered-concept-is-never-removed
- domain/glossary/concept
- domain/glossary/subject-type
- constraints/the-system-persists-to-one-relational-database
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
The one store change this removal needs, and the only place in it that touches SQL.
The accepted-subject-type rows are keyed by concept name and carry no cascade, so the deletion has to name them itself — the same statement the concept write already issues before re-inserting them.

## Notes
REMAINDER, from the specification — the rule's own reference guard (refuse where a capability answers, evidence or citation names, or a hypothesis-revision collects the concept) reaches no criterion of this store-only task; it belongs to the remove-concept operation task that consumes this store.
ADVISORY, from the specification — the published surface (contracts/glossary/glossary-authoring) and the three route-scoped constraints govern the HTTP layer, not this store; left out of implements as the sibling operation/route tasks' own.
ADVISORY, from the specification — re-bind confirmation: rules/glossary/a-registered-concept-is-never-removed now states that a concept's removal takes its own accepts declaration with it and removes no term of the subject-type vocabulary, settling criteria 2 and 4 as decided fact rather than unstated ones.
