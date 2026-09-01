---
title: investigation-ticket-ref-absence-hotfix, review
summary: What four passes found over the source and tests making ticket_ref round-trip absence as absence,
  never as an empty string.
reviewed:
- src/persistence/relational-investigation-store.repository.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
tasks:
- task/investigation-ticket-ref-absence-hotfix/ticket-ref-round-trips-absence
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: Reading back an investigation whose ticket_ref was absent at write answers ticket_ref as
    absent (the attribute is not present on the returned object), never as an empty string.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: writes and reads back an investigation whose ticket_ref is undefined, storing it as a real SQL
      NULL and reading it back with no ticket_ref at all, never the empty string
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: leaves ticket_ref out of the assembled investigation, rather than answering it as the empty
      string, when the stored column itself is a SQL NULL
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends ticket_ref as undefined in the root insert's own params when the given investigation carries
      no ticket_ref at all
  why: Every case spells absence as ticket_ref set to undefined rather than omitting the key, so 'absent
    at write' is exercised only in the form the write path cannot distinguish from omission.
- criterion: Reading back an investigation whose ticket_ref was given at write answers that exact value,
    unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: reads back the exact ticket_ref value the stored column holds, unchanged, when one was given
      at write
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends every declared attribute of the root row — identity, subject type, prompt version, model,
      pinned case, assessment, cost, durations and written_at — as the root insert's own params, in order
  why: The read half has a dedicated test against a fabricated row that writes nothing. The write-then-read
    half is asserted only incidentally, as one entry in a whole-document or full-param-list assertion,
    with nothing marking it load-bearing.
- criterion: A diagnose call giving an empty string as its ticket reference is recorded and read back
    as an absent ticket_ref, never as an empty-string value, matching rules/investigation/an-empty-ticket-reference-is-no-ticket-reference.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: writes and reads back an investigation whose ticket_ref is the empty string, storing it as a
      real SQL NULL and reading it back with no ticket_ref at all, matching an-empty-ticket-reference-is-no-ticket-reference
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: records a diagnose call giving ticket_ref as the empty string and reads it back with no ticket_ref
      at all, never the empty string, matching an-empty-ticket-reference-is-no-ticket-reference
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends ticket_ref as undefined in the root insert's own params, never the empty string, when
      the given investigation carries ticket_ref as the empty string
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends a ticket_ref holding only whitespace through unchanged, rather than treating it the same
      as the empty string
  why: 'The store half is exercised end to end. What is unexercised is the diagnose call the criterion
    names: nothing in either file issues one -- all four tests construct an Investigation already carrying
    an empty-string ticket_ref and hand it straight to the store, so that a diagnose call itself is not
    refused for an empty ticket reference is presumed by the fixtures rather than shown. The whitespace
    test also asserts more than either this criterion or the cited rule states -- see this review''s own
    conformance finding.'
findings:
- pass: conformance
  file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  where: the test 'sends a ticket_ref holding only whitespace through unchanged, rather than treating
    it the same as the empty string' (around line 529)
  evidence: 'it(''sends a ticket_ref holding only whitespace through unchanged...'', async () => { ...
    await store.write(anInvestigation({ ticket_ref: '' '' })); const rootInsert = recorded.find((entry)
    => entry.text.includes(''INSERT INTO investigations'')); expect(rootInsert?.params?.[2]).toBe('' '');
    });'
  cost: The rule the specification states is scoped to the empty string alone -- an-empty-ticket-reference-is-no-ticket-reference
    and its decision-log entry both reason only about ticket_ref === '', and neither says anything about
    a value holding only whitespace. This test pins a further, distinct decision -- that a whitespace-only
    ticket_ref is a real value rather than an absence -- as if it were settled business behavior, contrasting
    it explicitly against the empty-string case. A reader who later asks whether a space-only ticket reference
    is an absence too will find only the empty-string reading in the specification.
  correction: decide, in the specification, whether a whitespace-only ticket_ref is itself an absence
    or a genuine value, and disclose the reasoning the way the empty-string reading already is in decision-log.md;
    then this test proves a recorded decision rather than being the one place the decision is made.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: lines 164-170, the ticketRefForWrite and holdsNoTicketReference helpers reached from identityParams
  cites: ARC-04
  evidence: 'function ticketRefForWrite(ticketRef: string | undefined): string | undefined { return holdsNoTicketReference(ticketRef)
    ? undefined : ticketRef; } function holdsNoTicketReference(value: string | undefined): boolean { return
    value === undefined || value === ''''; }'
  cost: 'The decision that an empty ticket reference is no ticket reference is made inside the repository
    rather than before it. An Investigation carrying ticket_ref: '''' is still an Investigation carrying
    the empty string everywhere upstream of the write, and any second writer -- another store implementation,
    an export, an in-memory double -- persists or hands on the empty string with nothing to stop it.'
  correction: normalize the empty ticket reference where the Investigation is constructed, so the value
    reaching this store is already either a reference or absent, and let identityParams pass investigation.ticket_ref
    through unchanged.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: lines 328-333, 387-406, 412-417 and 469-474 -- the read-side guards resultOf, verdictOf, reasonOf,
    nonEmptyCitations and registerOf, each throwing through raiseReadFailure
  cites: COR-02
  evidence: 'throw raiseReadFailure(new Error(`investigation_evidence holds an unrecognized result "${value}"`));
    ... function raiseReadFailure(cause: unknown): Error { return new InvestigationStoreError(''a read
    against the investigation store failed'', { operation: ''read'' }, { cause }); }'
  cost: Five distinct read failures plus every driver failure reach a caller as one InvestigationStoreError
    whose message and context never vary; what distinguishes them is a generic Error sentence handed in
    as the cause. A layer above that wants to tell a corrupt row from a dropped connection has no typed
    field to branch on and has to match on cause.message.
  correction: carry the condition in the type or in the context rather than in a wrapped generic error
    -- either a typed error class per condition, or one typed class whose context names the table, the
    column and the offending value.
- pass: failures
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time --
    line 373
  evidence: 'AssertionError: expected 173 to be greater than 173 -- expect(written?.durations_total).toBeGreaterThan((written?.durations_collection
    ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0));'
  cost: a suite failure unrelated to this task's files (relational-investigation-store.repository.ts and
    its two specs) reads as evidence against this delivery, when the durations pipeline it exercises was
    neither touched by nor implicated in ticket-ref-absence-hotfix. This is the same real-wall-clock timing
    tie found in the review of consolidation-call-record-chain-hotfix and investigation-written-at-timing-hotfix;
    two independent readings across this batch's reviews classified it test, one classified it code --
    all three recorded as returned, not reconciled.
  correction: the test should not assert a strict real-clock '>' between durations_total and the stage
    sum at millisecond resolution, since domain/investigation/durations only requires total to be measured
    independently of the stage sum, not that it exceed it by a nonzero margin on every run.
  cause: test
failures_counted: 1
run: run/investigation-ticket-ref-absence-hotfix
---

## What it is

The first review of investigation-ticket-ref-absence-hotfix: coverage over its three criteria,
specification conformance over the two nodes it implements, standard conformance over the
project's own registry, and diagnosis of the one failure the captured suite run reported.

## Notes

The one captured failure is the same real-wall-clock durations timing tie found in two other
reviews of this same batch; readings of its cause disagree across reviews and are recorded as
returned, not reconciled. The conformance pass found a test asserting a decision the specification
does not make (that a whitespace-only ticket_ref is a real value, unlike the empty string).
