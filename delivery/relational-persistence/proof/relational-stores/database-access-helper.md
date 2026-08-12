---
title: Proof for the shared relational access helper
summary: Unit-level tests over stand-in IQueryable/DatabaseConnection objects proving the four criteria's
  mechanics, plus integration-level tests against the real database proving each criterion's actual data
  effect.
implementation: sha256:260a1a45b3e0c7acef4949ab6c774992657021fe02a7fcaada6d836c7f1b0d5c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-database-access-helper-suite-2
tests:
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: answers every row a statement matched, exactly as the driver returned them, and sends the statement's
    own text and params unchanged
  proves: runStatement's underlying mechanic that queryOneOrAbsent and criterion 1 build on
  fails_when: runStatement narrows to one row, drops a row, or sends different text/params than the statement
    it was given
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: answers undefined, not a rejection, when a statement matches no row
  proves: Criterion 1 — A statement run through the helper that matches no row answers with absence as
    data rather than raising.
  fails_when: queryOneOrAbsent rejects, or resolves to anything other than undefined, when the driver
    answers zero rows
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: answers the one row itself, not an array holding it, when a statement matches exactly one row
  proves: the complementary half of criterion 1's shape — a real match is the row itself, not wrapped
  fails_when: queryOneOrAbsent answers an array, a different row, or undefined when exactly one row matched
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: raises the caller's own typed error, carrying a message, a context object and the driver failure
    as its cause, when the driver rejects a statement
  proves: Criterion 2 — a driver failure arrives at the caller as the caller's own typed error, carrying
    a message, a context object and the driver failure as its cause
  fails_when: runStatement throws the raw driver error instead of calling raise, or throws something whose
    .cause is not the exact driver failure object raise was given
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: lets the same wrapping reach queryOneOrAbsent, since it runs its own statement through runStatement
    itself
  proves: criterion 2 holds through queryOneOrAbsent too, not only through runStatement directly
  fails_when: queryOneOrAbsent swallows or alters the rejection runStatement produced
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: passes whatever the driver rejected with through to raise unexamined, even where it is not an
    Error instance
  proves: the implementation's inference that RaiseStoreError is one generic callback rather than a taxonomy
    dispatching on the failure's shape
  fails_when: runStatement inspects, transforms, or refuses to forward a non-Error rejection to raise
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: opens BEGIN and resets search_path to public before ever handing the connection to the unit of
    work, then lets a read run through it just as freely as a write would, and only then commits
  proves: the inference that runInTransaction resets search_path immediately after BEGIN, and the inference
    that the transaction facility accepts a read as freely as a write
  fails_when: BEGIN and SET LOCAL are reordered, omitted, or run after work's own statement; or a SELECT
    sent through work is refused, altered, or excluded from the transaction
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: commits once the whole unit of work resolves, answering with the value work itself resolved to
    and releasing the connection back to the pool
  proves: Criterion 3 — a unit of work run through the helper commits as a whole
  fails_when: COMMIT is not issued once work resolves, the returned value differs from what work resolved
    to, or the connection is never released
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: issues ROLLBACK and never COMMIT — still releasing the connection back to the pool — when a later
    statement inside the unit of work fails
  proves: Criterion 4's mechanic — a unit of work in which one statement fails leaves none of its earlier
    statements applied
  fails_when: COMMIT is issued despite the failure, ROLLBACK is skipped, or the connection is not released
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: rolls back and rethrows the unit of work's own rejection unchanged, when it fails for a reason
    other than the driver refusing a statement
  proves: a business-logic failure thrown by the caller's own work still triggers ROLLBACK and release,
    and reaches the caller unwrapped
  fails_when: the module wraps a non-driver rejection through raise, or fails to roll back/release for
    it
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: raises the caller's own typed error and never calls the unit of work, when checking a connection
    out of the pool itself fails, before any transaction is opened
  proves: a dependency (the pool) failing before any statement is attempted is wrapped through raise,
    and work is never invoked
  fails_when: the checkout failure is not wrapped through raise, or work is called despite the checkout
    never succeeding
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: raises the caller's own typed error, releases the checked-out connection and never calls the unit
    of work, when BEGIN itself fails
  proves: a BEGIN failure is wrapped through raise, the already-checked-out connection is still released,
    and work is never called
  fails_when: BEGIN's failure reaches the caller unwrapped, the connection leaks unreleased, or work still
    runs
- file: src/__tests__/unit/persistence/database-access.spec.ts
  name: wraps a failure of the COMMIT itself as the caller's own typed error, without wrapping it a second
    time, and still issues ROLLBACK
  proves: the disclosed COR-01 divergence's actual behavior — a COMMIT failure is wrapped exactly once
    through raise, ROLLBACK still runs, and the connection is released
  fails_when: the COMMIT failure reaches the caller unwrapped, is wrapped a second time, or ROLLBACK/release
    is skipped
- file: src/__tests__/integration/persistence/database-access.spec.ts
  name: answers undefined, not a rejection, when a real query matches no row for the slug named
  proves: Criterion 1, against the real database
  fails_when: queryOneOrAbsent rejects or answers something other than undefined for a slug the real cases
    table never held
- file: src/__tests__/integration/persistence/database-access.spec.ts
  name: raises the caller's own typed error, carrying a message, a context object and the real driver
    failure as its cause, when a statement violates a real database constraint
  proves: Criterion 2, against a real driver failure — a genuine Postgres unique-violation (23505) reaching
    the caller as the caller's own typed error, with the real pg error object as its cause
  fails_when: the real unique-violation reaches the caller as a bare pg error, or the wrapped error's
    cause is not the real driver failure carrying code 23505
- file: src/__tests__/integration/persistence/database-access.spec.ts
  name: commits a unit of work as a whole, leaving every statement it ran visible to a separate connection
    once it resolves
  proves: Criterion 3, at the data level
  fails_when: either row is missing from a later, independent read, or runInTransaction resolves without
    ever having committed
- file: src/__tests__/integration/persistence/database-access.spec.ts
  name: lets a unit of work read back a row it just wrote, within the same still-open transaction, before
    ever committing
  proves: the generic-facility inference at the data level — an unqualified SELECT inside the transaction
    sees the just-written, not-yet-committed row
  fails_when: the read fails, returns undefined for the row just written in the same transaction, or fails
    to resolve against the public schema
- file: src/__tests__/integration/persistence/database-access.spec.ts
  name: leaves none of a unit of work's earlier statements applied, when a later statement inside it fails
    against a real constraint
  proves: Criterion 4, at the data level
  fails_when: the earlier statement's row is found present despite the later statement's real failure,
    or runInTransaction resolves instead of rejecting
not_applicable:
- edge_case: a boundary at each end of a numeric range
  why: no criterion or exported function takes a numeric parameter with a stated range
- edge_case: an operation attempted against state that forbids it
  why: this module enforces no business rule of its own about permissible state
- edge_case: a dependency that answers slowly
  why: neither runStatement nor runInTransaction has any timeout or retry logic of its own to exercise
    differently from an ordinary await
- edge_case: two operations against one subject at once
  why: runInTransaction's isolation comes entirely from Pool.connect() pinning one physical backend per
    checkout, the identical mechanism persistence/isolated-connection.ts's own integration suite already
    exercises directly
untested:
- The type-level half of the inference that RaiseStoreError is one generic callback rather than a taxonomy
  of named failure kinds — a runtime test can only observe that the module does not branch on the failure's
  shape, not that the exported type itself declares no second, named variant.
- That no other module bypasses this helper and opens a second connection of its own beside it (the task's
  own second UNDERDETERMINED note). This task ships exactly one file; whether a future adapter routes
  every statement through it is a fact about files this task does not contain.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/database-access.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv,
    and the shared insertCase helper's INSERT is schema-qualified as public.cases even when called against
    a checked-out transaction where it would otherwise be redundant.
  why: the same STK-08/search_path-pollution rationale already disclosed elsewhere in this initiative
    — insertCase is called both directly against the bare pool (exposed to ambient pollution) and inside
    runInTransaction (already reset), so qualifying it once, unconditionally, is simpler than two call-site
    variants
---

## What it is

Nineteen tests proving absence answers as data, a driver failure arrives as the caller's own typed
error, and a unit of work commits whole or rolls back whole — mechanically, over stand-ins, and
concretely, against the real database.

## Notes

One test initially failed against the real database for the same reason found and fixed twice
already in this initiative: a statement sent outside runInTransaction's own schema-pinning checkout
inherited an unrelated session's leftover search_path. Fixed by schema-qualifying that one test
helper's statement.
