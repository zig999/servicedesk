---
implementation: sha256:b1b6c0ce59b9e29be5f2010ae95499bd7f9c44e4ac522fc214c9d358ae6e0140
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-ticket-ref-absence-hotfix-ticket-ref-round-trips-absence-suite
title: ticket_ref round-trips absence, never the empty string
summary: Tests over relational-investigation-store.repository.ts proving that an absent or
  empty-string ticket_ref is written and read back as absence, and that a given non-empty
  ticket_ref is written and read back exactly unchanged, replacing the two pre-existing tests
  that had pinned the coalesce-to-empty-string bug this task fixes.
tests:
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: leaves ticket_ref out of the assembled investigation, rather than answering it as the
    empty string, when the stored column itself is a SQL NULL
  proves: criterion 1 — reading back an investigation whose ticket_ref was absent at write
    answers ticket_ref as absent, never as an empty string
  fails_when: investigationOf() reverts to `row.ticket_ref ?? ''` (or any other synthesis of
    an empty string) instead of the conditional spread that omits the key for a null column
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reads back the exact ticket_ref value the stored column holds, unchanged, when one was
    given at write
  proves: criterion 2 — reading back an investigation whose ticket_ref was given at write
    answers that exact value, unchanged
  fails_when: investigationOf() drops, mutates or fails to carry through a non-null ticket_ref
    column value (e.g. the field is omitted, coalesced, or clipped) instead of passing it
    straight through
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends ticket_ref as undefined in the root insert's own params, never the empty string,
    when the given investigation carries ticket_ref as the empty string
  proves: criterion 3, write side — an empty-string ticket_ref is normalized before it reaches
    the ticket_ref insert param, rather than persisted as the empty string
  fails_when: ticketRefForWrite()/holdsNoTicketReference() stop treating the empty string the
    same as undefined, so the empty string is sent straight through as the insert param
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: records a diagnose call giving ticket_ref as the empty string and reads it back with no
    ticket_ref at all, never the empty string, matching
    an-empty-ticket-reference-is-no-ticket-reference
  proves: criterion 3, end to end — constructs an Investigation with ticket_ref '', writes it and
    reads it back through this repository's own write()/read(), with the fake connection
    threading the actual inserted param into the subsequent SELECT row so the write and read
    sides are proven together rather than in isolation
  fails_when: either ticketRefForWrite() stops normalizing the empty string to undefined at
    write, or investigationOf() stops omitting a null ticket_ref column at read — either
    regression alone makes ticket_ref reappear on the returned document
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends a ticket_ref holding only whitespace through unchanged, rather than treating it the
    same as the empty string
  proves: the fix's boundary — holdsNoTicketReference() tests for exact-empty-string equality,
    not a blank or trimmed value, so a whitespace-only ticket_ref is preserved rather than
    over-normalized to absence
  fails_when: holdsNoTicketReference() is changed to trim before comparing, or to test
    falsiness/blankness instead of `value === ''`, so a whitespace-only ticket_ref is silently
    dropped
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes and reads back an investigation whose ticket_ref is undefined, storing it as a
    real SQL NULL and reading it back with no ticket_ref at all, never the empty string
    (rewritten from the pre-existing test of the same shape, which had asserted the answered
    document equalled the investigation with ticket_ref coalesced to '')
  proves: criterion 1, against a real PostgreSQL instance rather than a mock — the same assertion
    as the unit test above, over the driver's own real NULL handling
  fails_when: the real read path resurrects a null ticket_ref column as the empty string
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes and reads back an investigation whose ticket_ref is the empty string, storing it
    as a real SQL NULL and reading it back with no ticket_ref at all, matching
    an-empty-ticket-reference-is-no-ticket-reference
  proves: criterion 3, against a real PostgreSQL instance — an empty-string ticket_ref given at
    write is genuinely stored as NULL by the real driver and read back as absent, not merely by a
    mock that could paper over a driver-level surprise
  fails_when: the empty string is not normalized before reaching the real insert (so a real
    empty-string value is stored and read back), or the real NULL is resurrected as '' on read
not_applicable:
- edge_case: a uniqueness/duplicate check over ticket_ref
  why: the rule's own text says ticket_ref "participat[es] in no matching or deduplication
    logic," and no criterion of this task claims otherwise; no uniqueness constraint exists to
    violate
- edge_case: concurrent writes/reads racing on ticket_ref
  why: this task's fix is a pure per-row read/write transform with no shared or ordered state;
    the file's existing concurrency test (unaffected by this change) already covers the unrelated
    id-uniqueness race, and nothing about the ticket_ref fix introduces a new race
- edge_case: a dependency failure or slow answer during the write/read of ticket_ref specifically
  why: the file's existing generic write-failure and read-failure tests (unaffected by this
    change) already cover the store's failure-mapping behavior; this task changes no error path
- edge_case: an empty collection case
  why: ticket_ref is a scalar attribute, not a collection
untested:
- "the full HTTP diagnose path refusing (or, per the fixed rule, no longer refusing) an empty
  ticket_ref end to end — diagnose.dto.ts's `z.string().min(1).optional()` still refuses an empty
  string before it ever reaches this store. This task's own implementation record discloses this
  under `deferred`, scoping the fix to the store alone; consequently, the rule's further clause
  that the diagnose call itself is not refused for an empty ticket_ref is unproven by any test
  here, and stays unproven until a task in this store's file scope's own DTO is delivered."
---

## What it is

The proof for the ticket_ref absence round-trip fix: relational-investigation-store.repository.ts
now writes an absent-or-empty ticket_ref as a real SQL NULL and reads a NULL column back as an
absent attribute.

## Notes

Two pre-existing tests (one unit, one integration) had pinned the coalesce-to-empty-string bug
this task fixes; both were rewritten to assert the corrected behavior rather than weakened.
