---
title: relational-investigation-store.repository.ts's constructor accepts the connect()-capable interface
summary: RelationalInvestigationStore's own constructor parameter is typed to the interface widen-connection-interface-for-transactions
  declares in database-access.ts, instead of the concrete DatabaseConnection type, with every existing
  method's own behavior unchanged.
rationale: This task implements no specification node — which type a repository's own constructor parameter
  carries is not a domain fact. It is cut separately from the interface task because that task changes
  the interface and this task changes one of its consumers, and separately from the glossary-store task
  because each store is its own file with its own unit spec, independently demonstrable without the other.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: relational-investigation-store.repository.ts's own constructor accepts the connect()-capable
  interface database-access.ts declares, instead of the concrete DatabaseConnection type, with no change
  to any of RelationalInvestigationStore's own method behavior.
criteria:
- RelationalInvestigationStore's own constructor parameter `connection` is typed to the interface widen-connection-interface-for-transactions
  declares, not the concrete DatabaseConnection.
- relational-investigation-store.repository.ts no longer imports the DatabaseConnection type.
- relational-investigation-store.repository.spec.ts's own fake-connection helpers no longer cast their
  fake past the compiler with `as unknown as DatabaseConnection`.
- Every one of RelationalInvestigationStore's own existing methods behaves exactly as before this change
  — the existing suite passes with no assertion or outcome changed.
- npm run typecheck exits 0 for the whole backend target source root.
depends_on:
- task/persistence-store-connection-typing/widen-connection-interface-for-transactions
---

## What it is
RelationalInvestigationStore's own constructor, typed against the narrower interface once it exists, and its own unit spec's fake-connection helper(s), no longer casting past the compiler.

## Notes
None.
