---
title: 'Review: written_at stamped at settle, not at issue'
summary: Coverage, specification conformance, standard conformance and failure diagnosis over stamp-written-at-at-settle's
  delivered change against the current main tree.
reviewed:
- migrations/0018-investigations-written-at-default.sql
- src/investigation/investigation-factory.ts
- src/investigation/investigation.ts
- src/investigation/run-diagnosis.ts
- src/persistence/relational-investigation-store.repository.ts
- src/__tests__/integration/factories/store-wiring.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
tasks:
- task/run-diagnosis-written-at-settle-instant/stamp-written-at-at-settle
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/run-diagnosis-written-at-settle-instant-review-suite) passed every step
    (install, typecheck, lint, secret-scan, test); there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: written_at is not assigned by reading the clock at buildInvestigationOptions time, before
    writeWithinDeadline is ever invoked.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: dispatches a write whose investigation carries no written_at of its own, leaving the store alone
      to decide that value later, at settle
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: 'reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now()
      call appears in run-diagnosis.ts'
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: builds an Investigation carrying no written_at, rather than refusing, when written_at is missing
      entirely from the given options — the store decides that value later, at settle
- criterion: For a run whose first write attempt settles, the persisted written_at equals that attempt's
    own settle instant -- neither earlier nor later -- provable by a fake store whose write() resolves
    only after an injected delay and whose settle instant the test itself captures for comparison.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: persists written_at equal to the store's own settle instant for the first attempt — never the
      instant the write was issued, even once collection has already consumed real wall-clock time before
      that issue
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written ... with written_at assigned by the store
      itself at settle rather than the literal the fixture supplied
  - file: src/__tests__/integration/factories/store-wiring.spec.ts
    name: answers, through a second createInvestigationStore built from one connection, an investigation
      written through a first createInvestigationStore built from that same connection
  why: 'The named unit test cannot fail on this criterion: its fake store overwrites written_at with its
    own settle stamp regardless of what run-diagnosis supplied, so the assertion holds identically whether
    written_at were assigned at build time, at issue, or not at all — it exercises fake-timer pipeline
    timing, not written_at''s provenance, and never captures the settle instant itself for comparison
    as the criterion asks. The two integration round trips are the real evidence that the persisted value
    is store-assigned rather than the fixture''s literal, but their 60-second tolerance window cannot
    separate an attempt''s issue instant from its settle instant, so "neither earlier nor later" is unproven
    — the same gap the proof record''s own untested section already names for the DB DEFAULT''s exact
    semantics.'
- criterion: investigationForRetry does not assign written_at by reading the clock immediately before
    the retry's own write is dispatched.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: dispatches the retry with the exact same investigation object the first attempt used, so no
      second clock reading — for written_at or anything else — could precede it
- criterion: For a run whose first attempt times out and whose retry settles, the persisted written_at
    equals the retry's own settle instant -- neither earlier nor later -- provable by a fake store whose
    second write() resolves only after an injected delay and whose settle instant the test itself captures
    for comparison.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: persists written_at equal to the retry's own settle instant when the first attempt fails outright
      and the retry settles only after its own delay — never the first attempt's own start instant
  why: 'Two parts are unexercised. The criterion''s own precondition (a first attempt that times out,
    followed by a retry) may not be reachable: the named test''s first write rejects immediately rather
    than timing out, and the one test where the first attempt does run past its stage bound asserts no
    retry is issued at all — whether the named scenario is even constructible is a fact for a person to
    settle, not this audit. Separately, the retry fake overwrites written_at with its own settle stamp
    regardless of what was passed, so the assertion cannot distinguish a value stamped at retry-issue
    from one stamped at retry-settle, and no test exercises a retry against a real store with an injected
    delay.'
- criterion: For a run whose retry settles because the record already exists (InvestigationAlreadyStoredError),
    the persisted written_at remains the first attempt's own settle instant, unchanged by the retry.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: leaves a preexisting record's own written_at unchanged when this run's first attempt fails outright
      and its retry settles by finding the record already stored
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, and
      leaves the already-stored record's own written_at, and everything else about it, completely unchanged
  why: In no unit test does a first attempt actually settle and stamp the record that a retry then finds
    already stored — the surviving value in every such test is a hardcoded fixture literal a rejecting
    store never touches, never a genuine settle instant. The integration test is real evidence but goes
    through no run-diagnosis retry at all; it proves a second store-level write of a stored id leaves
    the whole document, written_at included, untouched, which is adjacent to but not identical to the
    criterion's own stated scenario.
- criterion: No code path in run-diagnosis.ts reads the clock for written_at at any point after the write
    that actually persists the record has settled -- written_at is fixed at (or derived from) that settle
    event itself, never recomputed from a later reading once the response has finished assembling.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: 'reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now()
      call appears in run-diagnosis.ts'
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: dispatches a write whose investigation carries no written_at of its own, leaving the store alone
      to decide that value later, at settle
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: issues no UPDATE statement anywhere while writing a whole investigation
findings:
- pass: conformance
  file: src/investigation/investigation.ts
  where: line 29, the written_at field of the Investigation type
  evidence: 'readonly written_at?: string;'
  cost: the domain model declares written_at required on the aggregate — the field the store's own settle
    instant fills — but the TypeScript type lets any caller construct or hold an Investigation value missing
    it; a factory or store path can carry an instance the specification treats as an incomplete record,
    and the compiler gives no signal that the record's dating fact is absent.
  correction: 'declare the field as `readonly written_at: string;`, matching domain/investigation/investigation''s
    `required: true`.'
- pass: conformance
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: line 220, the closing assertion of the round-trip test
  evidence: expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex'));
  cost: The test asserts that RelationalInvestigationStore.read() answers a hash alongside document, computed
    by an algorithm, encoding and input fixed nowhere in the specification — domain/investigation/investigation's
    attribute list stops at written_at and declares no hash field anywhere. A reader auditing what the
    store's read answers has no page saying this integrity value exists, why it is computed this way,
    or what depends on it.
  correction: State the read result's hash field and how it is computed on a specification node, disclosed
    in the decision log — or drop it from the store's contract if it encodes no fact the business decided.
- pass: standard
  file: src/__tests__/integration/factories/store-wiring.spec.ts
  where: lines 10-46 (requireDatabaseUrl, isForeignKeyViolation, omittingWrittenAt, expectWrittenAtAssignedByTheStore,
    deleteTolerantly)
  cites: MNT-03
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: This whole block of DB-fixture logic is retyped verbatim in the sibling integration spec rather
    than called from one shared place; the two suites can silently drift, and a future change to any of
    these behaviors has to be made twice to stay correct.
  correction: Extract these functions into one shared integration test-support module both spec files
    import.
- pass: standard
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: lines 12-44 (isForeignKeyViolation, omittingWrittenAt, expectWrittenAtAssignedByTheStore, deleteTolerantly,
    requireDatabaseUrl)
  cites: MNT-03
  evidence: "function omittingWrittenAt(document: Investigation): Omit<Investigation, 'written_at'> {\n\
    \  const { written_at: writtenAt, ...rest } = document;\n  void writtenAt;\n  return rest;\n}"
  cost: The same written_at-omission and settle-instant assertion logic already exists in store-wiring.spec.ts;
    a correction to how 'assigned by the store at settle' is verified must be made in both files or the
    two suites quietly diverge.
  correction: Call the shared helper from store-wiring.spec.ts (or a common module both import) instead
    of redefining it here.
- pass: standard
  file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  where: lines 27-59 (class FakeGlossaryQuery and function glossaryHolding)
  cites: MNT-03
  evidence: "class FakeGlossaryQuery implements IGlossaryQuery {\n  private readonly attributes = new\
    \ Set<string>();\n  ..."
  cost: The identical fake and its glossaryHolding builder are retyped in run-diagnosis.spec.ts; a change
    to IGlossaryQuery's shape has to be applied in both files, and nothing enforces that it is.
  correction: Move FakeGlossaryQuery and glossaryHolding into a shared unit-test fixture module imported
    by both spec files.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 48-59 (manifestEntryOf) and lines 110-136 (FakeGlossaryQuery, glossaryHolding)
  cites: MNT-03
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { ... }'
  cost: manifestEntryOf, FakeGlossaryQuery and glossaryHolding are copied rather than called from investigation-factory.spec.ts,
    which already defines the identical logic; a fix must be repeated across both files to actually take
    effect everywhere.
  correction: Import manifestEntryOf, FakeGlossaryQuery and glossaryHolding from a shared fixture module
    instead of redefining them here.
reconciliation: siegard-reconcile/run-diagnosis-written-at-settle-instant.md
---

## What it is

Reviews stamp-written-at-at-settle's delivered change across 5 source files (one new migration, investigation-factory.ts, investigation.ts, run-diagnosis.ts, relational-investigation-store.repository.ts) and the 5 test files it revised.
Coverage, specification conformance (via trace.py --stage --review, folded into siegard-reconcile/run-diagnosis-written-at-settle-instant.md), standard conformance and failure diagnosis all ran; the failures pass found nothing to diagnose since every captured step passed.
src/errors/written-at-required.error.ts was deleted by this change and is not part of the reviewed file set — it no longer exists to read or judge, and its removal is recorded in the implementation record.

## Notes

23 rules were in scope for reading (STK-02 through STK-12, ARC-01, ARC-04, COR-02, COR-03, EDG-03, EDG-05, EDG-08, SEC-04, MNT-03, TST-01 through TST-03); 4 findings, all MNT-03 (duplicated test fixture/helper logic across the integration and unit spec pairs).
The rules a tool decides (20 lint rules, 2 secret-scan rules, 2 typecheck rules) ran as steps of the captured run (run/run-diagnosis-written-at-settle-instant-review-suite) and all exited 0.
Coverage found three criteria partial, all for the same underlying reason the task's own UNDERDETERMINED note anticipated: the delayed-settling fakes overwrite written_at with their own stamp regardless of what run-diagnosis supplied, so no unit test can actually distinguish issue-time from settle-time stamping, and the real-database round trips carry a 60-second tolerance too coarse to do so either.
The conformance pass found one contradiction (investigation.ts declares written_at optional though the domain node requires it — a legitimate type gap opened by this exact fix, since the value genuinely does not exist before persistence) and one unstated fact (the integration test's read().hash field, computed by an algorithm the specification never names).
The conformance fold cleared 34 node-file bindings and left 3 uncleared: domain/investigation/investigation (the written_at-optional contradiction above), rules/investigation/written-at-records-when-the-write-settled (run-diagnosis.ts itself holds the rule's fact nowhere — correctly, since the fix moves that fact entirely into the store), and constraints/hypotheses-are-judged-in-isolated-parallel-calls (restamped under a different node by this same bind, not a finding against this delivery) — see siegard-reconcile/run-diagnosis-written-at-settle-instant.md for the per-node judgment.
This review does not re-examine the other three live corrective initiatives' own files, or files whose drift predates this batch and were already read by the prior `review-change: all 9 corrective batch tasks` review (4f885cf) — those stand on their own record.
