---
title: Proof that relational-glossary-store.repository.ts's constructor is typed to IConnectableQueryable
summary: Confirms RelationalGlossaryStore's constructor and its unit spec's two fake-connection helpers
  carry only IConnectableQueryable, that DatabaseConnection is gone from both files' imports and type
  positions, and that the existing suite's own assertions were left untouched by the retyping.
implementation: sha256:bc48d14a31f4acd334d9892cd9c9f7ce86cd89b1edffec408084eba079992ca5
run: run/arc01-mnt03-suite
tests:
- file: src/persistence/relational-glossary-store.repository.ts
  name: the constructor's own declared parameter type
  proves: RelationalGlossaryStore's own constructor parameter `connection` is typed to the interface widen-connection-interface-for-transactions
    declares, not the concrete DatabaseConnection.
  fails_when: the constructor's declared parameter type is anything other than IConnectableQueryable —
    reading the constructor signature shows it typed to IConnectableQueryable, imported from database-access.ts
    alongside runInTransaction, runStatement, IQueryable and IStatement, and no other type named in that
    parameter position.
- file: src/persistence/relational-glossary-store.repository.ts
  name: absence of a DatabaseConnection import
  proves: relational-glossary-store.repository.ts no longer imports the DatabaseConnection type.
  fails_when: an import of DatabaseConnection reappears in this file — grepping the file's own text for
    the literal string DatabaseConnection returns it only inside the header comment's prose, never inside
    an import statement or a type position; the file's only import touching persistence types is the one
    from database-access.ts.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: fakeBareConnection and fakeTransactionConnection's own declared and cast types
  proves: relational-glossary-store.repository.spec.ts's own fakeBareConnection and fakeTransactionConnection
    helpers no longer cast their fake past the compiler with `as unknown as DatabaseConnection`.
  fails_when: either helper's own cast reads as unknown as DatabaseConnection instead of as unknown as
    IConnectableQueryable, or either helper's own parameter or return type is declared as DatabaseConnection
    — reading the file shows both helpers returning their fake cast as unknown as IConnectableQueryable;
    grepping the file's own text for the literal string DatabaseConnection returns no match at all, and
    the file's own import names only IConnectableQueryable from database-access.ts.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: the existing suite's own 17 tests, unchanged
  proves: readTerms, writeTerms, insertMissingTerms, readConcepts and writeConcepts each behave exactly
    as before this change — the existing suite passes with no assertion or outcome changed.
  fails_when: any of readTerms' per-vocabulary table routing, the second-call-answers-second-value check,
    either typed-error-with-cause assertion, writeTerms' delete-then-insert statement order and param
    values, its empty-set short-circuit, its duplicate-name pass-through, its rollback-and-release-on-failure
    behavior, readConcepts' name/accepts/ttl/description assembly, its cross-concept grouping, its empty-accepts-array
    case, its deterministic ORDER BY, its transaction statement order, its typed-error-with-cause on read
    failure, or writeConcepts' own two insertion shapes stop holding — every one of these 17 assertions
    is textually identical to what it was before this task, because only the constructor's declared parameter
    type, the two files' import statements, and the two helpers' own casts changed; no method body, no
    SQL statement text, no test name and no expected value was touched.
not_applicable:
- edge_case: a duplicate DatabaseConnection import surviving alongside the new IConnectableQueryable one
  why: TypeScript refuses two bindings of the same imported name in one module scope, so this failure
    mode would already be a compile error rather than a silent duplicate — nothing this task's own criteria
    ask for exercises it as a distinct case.
- edge_case: a caller outside this file constructing RelationalGlossaryStore with a value that satisfies
    DatabaseConnection but not IConnectableQueryable
  why: IConnectableQueryable is the interface widen-connection-interface-for-transactions already declared
    for exactly this purpose, and DatabaseConnection (pg Pool) already satisfies it structurally by that
    sibling task's own delivery; no caller in this codebase constructs the store from anything narrower
    than a full DatabaseConnection or a real pg Pool, both of which already carry query() and connect().
- edge_case: concurrent construction or concurrent method calls against one RelationalGlossaryStore instance
  why: nothing in this task's own criteria or the interface it retypes against states a concurrency guarantee,
    and this task changes a declared type, not the store's own runtime behavior under concurrent use —
    a test asserting one would prove a guarantee nobody made.
---

## What it is
Confirms, by direct reading, that RelationalGlossaryStore's own constructor and its unit spec's two fake-connection helpers carry only IConnectableQueryable, with DatabaseConnection gone from both files' imports and type positions, and every existing assertion left textually unchanged.

## Notes
No new test was written — this is a compile-following retyping with no new behavior to assert, so the existing suite is the evidence. The two criteria this proof could not itself execute (npm run typecheck's exit code, the existing suite's pass/fail state) are both confirmed by run/arc01-mnt03-suite, captured over the whole tree after all six of this increment's tasks were implemented and proven: typecheck, lint, secret-scan and the full 1680-test suite all passed.
