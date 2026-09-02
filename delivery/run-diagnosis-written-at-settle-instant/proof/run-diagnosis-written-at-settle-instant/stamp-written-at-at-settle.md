---
title: written_at stamped at settle, not at issue -- run-diagnosis, the factory, the relational store,
  and store-wiring
summary: Proves run-diagnosis.ts never assigns written_at before or after a write settles, that the relational
  store alone decides the value at settle for both the first attempt and a retry, and that every collateral
  pre-fix test this change broke (investigation-factory, the unit and integration relational store specs,
  and store-wiring) now asserts the corrected contract.
implementation: sha256:fddf5de54b7a7b49d8e7220adbb865277c427eca09f7cb6274f688dfa3e9c191
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/run-diagnosis-written-at-settle-instant-stamp-written-at-at-settle-suite-3
tests:
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: dispatches a write whose investigation carries no written_at of its own, leaving the store alone
    to decide that value later, at settle
  proves: criterion 1 -- written_at is not assigned by reading the clock at buildInvestigationOptions
    time, before writeWithinDeadline is ever invoked
  fails_when: run-diagnosis.ts (re)computes a written_at value -- from any clock read, before or independent
    of dispatching the write -- and hands store.write() an investigation object carrying that value instead
    of one with written_at absent.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: persists written_at equal to the store's own settle instant for the first attempt -- never the
    instant the write was issued, even once collection has already consumed real wall-clock time before
    that issue
  proves: criterion 2 -- for a run whose first write attempt settles, the persisted written_at equals
    that attempt's own settle instant; answers the task's UNDERDETERMINED note by using a fake store (DelayedSettlingInvestigationStore)
    whose write() only assigns/resolves written_at after an injected 300ms delay, and asserting the persisted
    value against that resolve instant rather than against any instant available before the call
  fails_when: written_at is computed at or before the write's own dispatch rather than at the instant
    DelayedSettlingInvestigationStore's own setTimeout callback actually assigns it.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: dispatches the retry with the exact same investigation object the first attempt used, so no second
    clock reading -- for written_at or anything else -- could precede it
  proves: criterion 3 -- investigationForRetry does not assign written_at by reading the clock immediately
    before the retry's own write is dispatched
  fails_when: the retry call site builds or copies a new investigation object for the second attempt rather
    than reusing the first attempt's own reference.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: persists written_at equal to the retry's own settle instant when the first attempt fails outright
    and the retry settles only after its own delay -- never the first attempt's own start instant
  proves: criterion 4 -- for a run whose first attempt fails and whose retry settles, the persisted written_at
    equals the retry's own settle instant; answers the same UNDERDETERMINED note for the retry path via
    a fake store's own injected 500ms delay
  fails_when: the persisted written_at is computed from the first attempt's own start instant or from
    any instant earlier than the retry's own settle.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: leaves a preexisting record's own written_at unchanged when this run's first attempt fails outright
    and its retry settles by finding the record already stored
  proves: criterion 5 -- for a run whose retry settles because the record already exists, the persisted
    written_at remains the first attempt's own settle instant, unchanged by the retry
  fails_when: a retry that resolves via InvestigationAlreadyStoredError is followed by any code path that
    overwrites or restamps the already-stored record's written_at.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: leaves the already-present record's own written_at untouched, never restamping it, when the first
    write attempt finds the investigation already stored
  proves: the general written-at-records-when-the-write-settled intent, extended to the sibling case the
    six numbered criteria do not name explicitly -- the very first attempt (not the retry) finding the
    record already stored
  fails_when: run-diagnosis.ts's handling of a first-attempt InvestigationAlreadyStoredError mutates or
    re-writes any part of the already-stored document, including written_at.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: 'reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now()
    call appears in run-diagnosis.ts'
  proves: criterion 6 -- no code path in run-diagnosis.ts reads the clock for written_at at any point
    after the write that actually persists the record has settled, or at any other point
  fails_when: any clock-reading call is reintroduced into run-diagnosis.ts's own source text.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: builds an Investigation carrying no written_at, rather than refusing, when written_at is missing
    entirely from the given options -- the store decides that value later, at settle
  proves: the corrected collateral contract (buildInvestigation no longer enforces written_at's presence)
    and behaviorally demonstrates both stated inferences that BuildInvestigationOptions.written_at/Investigation.written_at
    became optional and that written-at-required.error.ts's refusal path was removed
  fails_when: buildInvestigation still calls refuseMissingWrittenAt (or an equivalent check) and throws
    when written_at is absent.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends every declared attribute of the root row -- identity, subject type, prompt version, model,
    pinned case, assessment, cost and durations -- as the root insert's own params, in order, with written_at
    never among them
  proves: the corrected collateral contract -- the root INSERT no longer sends a written_at value, so
    the column's own DEFAULT decides it independently per write
  fails_when: the root insert's own params array includes a written_at value anywhere.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a whole investigation exactly as written -- root, subject attribute-values, evidence
    with its capability pin, evaluations with their citations, assessment, cost and durations -- through
    one transaction, with written_at assigned by the store itself at settle rather than the literal the
    fixture supplied
  proves: the corrected collateral contract against the real Postgres adapter -- every field but written_at
    round-trips unchanged, and written_at is a real, store-assigned, recent timestamp distinct from the
    fixture's own hardcoded literal
  fails_when: the round-tripped document's written_at equals the fixture's own literal, or any other field
    diverges, or the assigned written_at fails to parse as a well-formed, recent timestamp.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, and leaves
    the already-stored record's own written_at, and everything else about it, completely unchanged
  proves: the real-adapter counterpart to criterion 5 -- a colliding retry/second write leaves the first-stored
    written_at (and the whole document) untouched
  fails_when: a second write against an existing id succeeds, or the previously-stored document changes
    as a side effect of the rejected attempt.
- file: src/__tests__/integration/factories/store-wiring.spec.ts
  name: answers, through a second createInvestigationStore built from one connection, an investigation
    written through a first createInvestigationStore built from that same connection
  proves: rules/investigation/written-at-records-when-the-write-settled, exercised through the factory-built
    store rather than the class constructed directly -- every other field of the round-tripped document
    is unchanged from the fixture, and the document's written_at is a real, store-assigned, recent timestamp,
    never the fixture's own hardcoded literal
  fails_when: the round-tripped document's written_at equals the fixture's own literal, or any other field
    diverges, or the assigned written_at is not a parseable, recent timestamp.
untested:
- The stated inference that the DB DEFAULT uses clock_timestamp() rather than now()/transaction_timestamp()
  has no test binding it. Every black-box assertion available only shows written_at differs from a caller-supplied
  literal and is recent -- it cannot distinguish a per-statement live evaluation from one fixed at the
  surrounding transaction's BEGIN, since the root INSERT is issued as that transaction's very first statement,
  leaving no observable time gap between the two candidate semantics.
- The stated inference that the new migration is numbered 0018 is a file-naming fact, not an observable
  behavior -- no existing test enumerates migrations by number.
divergences:
- cites: TYP-04
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  departure: TYP-04 requires named constants for values with meaning; the omittingWrittenAt helper's discarded
    destructured binding is named writtenAt and immediately voided (void writtenAt;) purely to satisfy
    no-unused-vars, carrying no meaning of its own beyond 'discarded'.
  why: This project's eslint naming-convention rule only permits a leading underscore on the parameter
    selector, not variable, and no-unused-vars has no varsIgnorePattern configured; void x; is the existing
    idiom this codebase already uses elsewhere for an intentionally-discarded destructured binding, so
    this follows established local convention rather than introducing a new one.
---

## What it is

Proves written_at is decided by the store's own write() at settle, never by run-diagnosis.ts at any
instant of its own, for the first attempt, a retry, and an already-stored collision alike -- and
brings every pre-existing test the correction legitimately broke (investigation-factory, the unit
and integration relational-store specs, and store-wiring) up to the corrected contract.

## Notes

Divergence: TYP-04 (named constants) -- a discarded destructured binding is named descriptively and
voided rather than assigned a synthetic constant name, following this codebase's own existing idiom.
