---
title: Store the hypothesis-revision's own state — proof
summary: Integration tests over a fresh migration replay and over ReviseHypothesisOperation's own write
  path, proving the state column exists, is CHECK-constrained to draft/released, is not nullable, defaults
  draft for a row this migration did not create, and is written draft on insert while left untouched on
  overwrite.
implementation: sha256:84601799624d6cce8d2dd4fdc25b80ed2d94e62e3b827647a6716e547915abea
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-store-the-revisions-own-state-suite
tests:
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: gives hypothesis_revisions a state column after applying every migration script, in numbered order,
    to an empty database
  proves: Applying every migration script to an empty database in numbered order, with no step performed
    by hand, produces a hypothesis-revision relation holding a state column.
  fails_when: The schema produced by the standard beforeAll replay (readdir + sort, every .sql file applied
    once) holds no column named state on hypothesis_revisions — the migration was skipped, numbered out
    of order, or never added the column.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: adds hypothesis_revisions exactly one new column, state, when migration 0020 runs on top of every
    migration before it
  proves: Every column the migration adds pairs with an attribute domain/knowledge/hypothesis-revision
    declares — observed as the migration adding exactly the one column, state, and no other.
  fails_when: Applying 0020-hypothesis-revision-own-state.sql on top of every prior migration changes
    hypothesis_revisions' own column set by anything other than adding exactly ['state'] — none added,
    a different name added, or more than one column added.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts draft and released for a hypothesis-revision's own state and refuses a third value through
    a CHECK violation
  proves: The state column admits the values draft and released and refuses any other value.
  fails_when: An INSERT naming state = 'draft' or state = 'released' is refused, or an INSERT naming a
    third value ('archived') is accepted instead of raising a CHECK violation (23514).
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses storing a hypothesis-revision whose state is explicitly null
  proves: The state column is not nullable, so every stored hypothesis-revision names exactly one state.
  fails_when: An INSERT that explicitly names state = NULL is accepted rather than refused with a NOT
    NULL violation (23502).
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: defaults a hypothesis-revision's state to draft when an insert names no state at all
  proves: The implementation record's inference that the column carries DEFAULT 'draft' as a mechanical
    backfill for a row this migration itself did not create — exercised here through the suite's own pre-existing
    insertHypothesisRevision helper, which never names state.
  fails_when: An INSERT that omits state entirely is refused for lack of a default, or reads back a value
    other than 'draft'.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: reads back with its own state draft, the revision revise-hypothesis originates by inserting
  proves: A revision revise-hypothesis inserts reads back with its own state draft.
  fails_when: The revision ReviseHypothesisOperation.reviseHypothesis inserts (the very first revise for
    a never-named hypothesis) reads back with any state other than 'draft', or the column is absent.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves a revision's own state exactly as it was when a revise replaces its content in place, rather
    than resetting it to draft
  proves: A revision whose content revise-hypothesis replaces in place reads back with its own state unchanged.
  fails_when: A second revise that takes the overwrite branch (replacing criterion in place) changes the
    row's state column at all — the deliberately non-default value ('released') set before the overwrite
    is lost, reset to 'draft', or altered to anything else.
not_applicable:
- edge_case: Two operations against one subject at once (concurrency)
  why: No criterion of this task states any concurrency behavior for the state column itself; the two
    write paths this task touches (an explicit 'draft' literal on insert, an UPDATE that never names state
    on overwrite) introduce no new contention surface beyond the revision-numbering concurrency already
    exercised by this suite's own pre-existing tests, which this task leaves untouched.
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: This task adds one plain SQL migration and binds one already-known literal on an existing write
    path against the same PostgreSQL connection every other test in this suite already depends on; no
    new external dependency is introduced for this task to degrade.
- edge_case: A duplicate where uniqueness is claimed
  why: The state column carries no uniqueness constraint, and no criterion of this task claims one.
- edge_case: An operation attempted against state that forbids it (a workflow-state guard refusing a write)
  why: Explicitly out of this task's scope — the task's own Notes REMAINDER-flag every clause that would
    gate a write on this column (the overwrite-vs-insert branch, the immutability trigger) to the sibling
    tasks overwrite-only-while-the-revision-is-draft and refuse-altering-a-released-revision; no criterion
    here asks for a refusal driven by this column's value.
untested:
- 'The semantic pairing between the one column this migration adds and the exact attribute domain/knowledge/hypothesis-revision
  declares (its name ''state'', its type hypothesis-revision-state, its requiredness) is proven here only
  as far as an automated test over this target source root can reach: that the migration adds exactly
  one column, named state, and no other. Whether that column''s name, type and requiredness actually match
  the specification node''s declared attribute is a specification-conformance judgment, not something
  this suite''s tests read the node text to check — no test in this codebase parses a specification node,
  and none was introduced here to keep that convention.'
- The inference that HypothesisRevisionState is declared as its own exported type and HYPOTHESIS_REVISION_STATES
  constant rather than reusing CaseVersionState is a compile-time-only naming decision. Both enumerations
  hold identical runtime values ('draft' | 'released'), so no Vitest assertion can distinguish 'a dedicated
  type was used' from 'CaseVersionState was reused' beyond what the CHECK-constraint and default tests
  above already prove about the column's own values; a conflation would be caught by the project's own
  strict type-checking (STK-01/TYP-01), not by a test written here.
- constraints/the-domain-depends-on-no-infrastructure, as the implementation record itself states, is
  a property the placement of the state literal satisfies (named in the persistence repository rather
  than threaded through ReviseHypothesisOperation) rather than a fact any file records or any runtime
  behavior exposes; it is not independently testable by an assertion over stored data or an operation's
  answer.
---

## What it is

Integration tests over a fresh migration replay (`schema-migrations.spec.ts`) and over `ReviseHypothesisOperation`'s own write path (`revise-hypothesis.operation.spec.ts`), proving the state column exists, is CHECK-constrained, is not nullable, defaults `draft` for a row this migration did not create, and is written `draft` on insert while left untouched on overwrite.

## Notes

None.
