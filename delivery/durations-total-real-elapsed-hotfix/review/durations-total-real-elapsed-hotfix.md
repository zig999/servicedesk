---
title: durations-total-real-elapsed-hotfix, review
summary: What three passes found over the source and tests computing durations.total as real elapsed time
  and making durations_writing round-trip absence; the captured suite run passed clean, so no failures
  pass ran.
reviewed:
- src/investigation/investigation-pipeline.ts
- src/investigation/simulate-hypothesis-pipeline.ts
- src/investigation/durations.ts
- src/persistence/relational-investigation-store.repository.ts
- migrations/0015-durations-writing-nullable.sql
- src/http/dto/simulate-case.dto.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
tasks:
- task/durations-total-real-elapsed-hotfix/total-measured-to-record-assembly
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: investigation-pipeline.ts's returned durations.total equals the real elapsed time measured
    from the same entry instant the deadline was propagated from to the moment its result (the record
    durations.total itself belongs to) is assembled, before that record is handed to persistence — not
    collection + judgment + writing.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: computes durations.total as the real wall-clock elapsed time from pipeline entry to the moment
      its result is assembled, never as collection + judgment + writing
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: computes durations.collection and durations.judgment as the largest of their own stage's per-unit
      elapsed_ms, durations.writing as the consolidation call's own elapsed_ms, and durations.total as
      the real wall-clock time elapsed from pipeline entry to the record's own assembly — never the sum
      of the three
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: excludes persistence entirely from durations.total, since total is measured before the record
      is handed to the store
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
      the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
      the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  why: 'The ''real elapsed, not the sum'' half and the ''before persistence'' half are both exercised.
    What is unexercised is the start instant the criterion names: nothing in the set lets measurable time
    pass between the entry instant the deadline was propagated from and the moment collection begins --
    in every unit test the fake clock stands still until the first observation. A pipeline measuring total
    from the instant collection starts, rather than from the same entry instant the deadline was propagated
    from, passes every test in this set.'
- criterion: simulate-hypothesis-pipeline.ts's returned durations.total equals the real elapsed time measured
    from the same entry instant the deadline was propagated from to the moment its result is assembled
    — not collection + judgment.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: computes durations.total as the real wall-clock elapsed time from pipelineStartedAtMs to the
      moment its result is assembled, never as collection + judgment
  why: 'The ''not collection + judgment'' half is exercised. Both instants the criterion names go unexercised:
    every millisecond of measured time is spent inside collection, so a total whose clock stops when collection
    ends, rather than when the result is assembled, reports the same value and passes; no test in this
    set puts measurable time inside this pipeline''s judgment stage, and nothing lets time pass between
    the entry instant and the start of collection.'
- criterion: A diagnosis's persisted durations.total, read back from the store, equals exactly the real-elapsed
    value the write recorded, unchanged by the round trip.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: writes a diagnosis and reads back durations.total exactly as the write recorded it, unchanged
      by the round trip
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
      the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
      the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  why: The round trip and the real-elapsed provenance are proven by different tests rather than one --
    the unit test feeds the captured insert param back as the read row, the integration test compares
    a whole read document against what was written on a real database, and the value being real-elapsed
    rather than fabricated is held only by the diagnose-server run.
- criterion: relational-investigation-store.repository.ts's durations_writing column is nullable; an investigation
    whose own durations.writing was absent at write (no consolidation call happened) reads back with durations.writing
    absent, never an invented duration.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the eight columns the model declares optional
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends durations.writing as undefined in the root insert's own params, never an invented duration,
      when the given investigation carries no durations.writing at all
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: reads back durations.writing absent, never an invented duration, when the stored durations_writing
      column is a SQL NULL
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: writes and reads back an investigation whose durations.writing is absent, storing it as a real
      SQL NULL now that the column is nullable, and reads it back with durations.writing absent entirely
  why: 'Both halves hold -- nullability against the migrated schema, and absence surviving a real write
    and read on Postgres. One over-assertion to route: the eight-nullable-columns test asserts the complete
    set across every table in the schema, where this criterion names only investigations.durations_writing;
    it will break the day any sibling task legitimately makes a ninth column optional.'
- criterion: An investigation whose own durations.writing was present at write reads back that exact value,
    unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: reads back the exact durations.writing value the stored column holds, unchanged, when one was
      present at write
  why: The write-and-read-back-unchanged claim rests on the integration test, which writes durations carrying
    a real writing value to a database and compares the whole read document against it. The unit test
    whose name says 'when one was present at write' performs no write at all -- it fabricates a stored
    row and exercises the read half alone.
findings:
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: lines 52-58, function requireDatabaseUrl
  cites: MNT-03
  evidence: 'function requireDatabaseUrl(): string { const url = process.env.DATABASE_URL; if (!url) {
    throw new Error(''DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.'');
    } return url; }'
  cost: The same function, character for character, also stands in schema-migrations.spec.ts and relational-investigation-store.repository.spec.ts
    -- all three files in this change. The day the suite needs a different environment variable or a clearer
    refusal message, the two copies not fixed refuse for a reason nobody can reconcile with the one that
    was.
  correction: move it into one test-support module under src/__tests__/ and have all three integration
    specs import it.
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: lines 196-200, FOREIGN_KEY_VIOLATION and isForeignKeyViolation
  cites: MNT-03
  evidence: 'const FOREIGN_KEY_VIOLATION = ''23503''; function isForeignKeyViolation(error: unknown):
    boolean { return error instanceof Error && ''code'' in error && error.code === FOREIGN_KEY_VIOLATION;
    }'
  cost: The identical constant and predicate stand in relational-investigation-store.repository.spec.ts,
    with the deleteTolerantly wrapper copied beside it. When the driver-error probe stops holding, one
    copy's teardown starts rethrowing while the other still swallows.
  correction: extract the violation-code predicate and the tolerant delete into the shared test-support
    module.
- pass: standard
  file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  where: lines 28-142, the case/capability/glossary fixture harness
  cites: MNT-03
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { return
    { position, hypothesis_revision: { hypothesis: { name: hypothesis.name }, revision: 1, criterion:
    hypothesis.criterion, collects: hypothesis.collects, resolution: hypothesis.resolution } }; }'
  cost: 'This block stands unchanged in simulate-hypothesis-pipeline.spec.ts and run-diagnosis.spec.ts.
    The copies have already begun to diverge: this file''s aCapability takes an overrides object, the
    sibling''s takes a bare concept string. When the Case or ManifestEntry shape gains a field, three
    files have to be found and changed.'
  correction: move the shared case, hypothesis, capability and glossary builders and the fake ports into
    one test-support module and import them from all three investigation specs.
- pass: standard
  file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  where: lines 199-204, IMPORT_SPECIFIER_PATTERN and runDiagnosisImportSpecifiers
  cites: MNT-03
  evidence: 'const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*[''"]([^''"]+)[''"]/g; async function
    runDiagnosisImportSpecifiers(): Promise<readonly string[]> { const source = await readFile(RUN_DIAGNOSIS_MODULE_PATH,
    ''utf8''); return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]); }'
  cost: The same regex and extraction stand in simulate-hypothesis-pipeline.spec.ts and run-diagnosis.spec.ts.
    A pattern that misses a form of import makes every one of those tests pass vacuously; fixing it in
    one file leaves the other two still claiming a guarantee they no longer check.
  correction: extract one importSpecifiersOf(modulePath) helper into the shared test-support module and
    call it from all three specs.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 510-518, inside 'does not resolve until persistence has actually written the investigation...';
    the same idiom recurs at six other places in this file
  cites: TST-01
  evidence: const resultPromise = runDiagnosis(options); const tracker = trackSettlement(resultPromise);
    await vi.advanceTimersByTimeAsync(499); expect(tracker.settled()).toBe(false); await vi.advanceTimersByTimeAsync(1);
    const assessment = await resultPromise;
  cost: Setup, acting and asserting are interleaved in one block, so a reader cannot see from the shape
    of the test what it claims -- the two claims here have to be reconstructed from the clock arithmetic,
    seven times in this file.
  correction: arrange the tracker before the call under test, advance the clock and read the outcome,
    then assert; write two tests where two timing claims are wanted.
- pass: standard
  file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  where: lines 292-302, inside 'measures judgment's own deadline from the clock at the moment judgment
    actually begins...'
  cites: TST-01
  evidence: const resultPromise = runSimulateHypothesisPipeline(options); let settled = false; resultPromise.then(()
    => { settled = true; }); await vi.advanceTimersByTimeAsync(tightDeadlineMs - 1); expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const result = await resultPromise;
  cost: The settled flag and its subscription are arranged after the pipeline has already been called,
    and an assertion sits between two clock advances, so the claim is spread across the whole body instead
    of one assert block.
  correction: arrange the settlement probe before invoking runSimulateHypothesisPipeline, advance the
    clock, then assert; give the 'not yet settled' claim its own test if worth keeping.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: lines 164-170, ticketRefForWrite and holdsNoTicketReference, called from identityParams
  cites: ARC-04
  evidence: 'function ticketRefForWrite(ticketRef: string | undefined): string | undefined { return holdsNoTicketReference(ticketRef)
    ? undefined : ticketRef; } function holdsNoTicketReference(value: string | undefined): boolean { return
    value === undefined || value === ''''; }'
  cost: The decision that an empty ticket reference is no ticket reference is made in the repository rather
    than where the investigation is assembled. A backfill, a second store implementation, or a migration
    that writes the column directly will persist the empty string, and the read path will then answer
    a ticket_ref the rule says does not exist.
  correction: normalize the empty ticket reference where the Investigation is built, and let the repository
    persist the value it is handed unchanged.
---

## What it is

The first review of durations-total-real-elapsed-hotfix: coverage over its five criteria,
specification conformance over the two nodes it implements, and standard conformance over the
project's own registry. The captured suite run passed clean, so the failures pass did not run.

## Notes

The specification-conformance pass found no divergence. Coverage found that neither pipeline's
own criterion is tested against the specific instant the criterion names (the same entry instant
the deadline was propagated from) as distinct from the instant its own first stage begins -- no
test in this set lets measurable time pass between the two, so a pipeline measuring total from
collection's own start rather than from the propagated entry instant would pass every test here
unchanged.
