---
title: relational-glossary-store.repository.ts's constructor accepts the connect()-capable interface
summary: RelationalGlossaryStore's own constructor parameter is typed to the interface widen-connection-interface-for-transactions
  declares in database-access.ts, instead of the concrete DatabaseConnection type, with every existing
  method's own behavior unchanged.
rationale: This task implements no specification node — which type a repository's own constructor parameter
  carries is not a domain fact. It is cut separately from the interface task because that task changes
  the interface and this task changes one of its consumers, and separately from the investigation-store
  task because each store is its own file with its own unit spec, independently demonstrable without the
  other.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: relational-glossary-store.repository.ts's own constructor accepts the connect()-capable interface
  database-access.ts declares, instead of the concrete DatabaseConnection type, with no change to any
  of RelationalGlossaryStore's own method behavior.
criteria:
- RelationalGlossaryStore's own constructor parameter `connection` is typed to the interface widen-connection-interface-for-transactions
  declares, not the concrete DatabaseConnection.
- relational-glossary-store.repository.ts no longer imports the DatabaseConnection type.
- relational-glossary-store.repository.spec.ts's own fakeBareConnection and fakeTransactionConnection
  helpers no longer cast their fake past the compiler with `as unknown as DatabaseConnection`.
- readTerms, writeTerms, insertMissingTerms, readConcepts and writeConcepts each behave exactly as before
  this change — the existing suite passes with no assertion or outcome changed.
- npm run typecheck exits 0 for the whole backend target source root.
depends_on:
- task/persistence-store-connection-typing/widen-connection-interface-for-transactions
---

## What it is
RelationalGlossaryStore's own constructor, typed against the narrower interface once it exists, and its own unit spec's two fake-connection helpers, no longer casting past the compiler.

## Notes
None.
