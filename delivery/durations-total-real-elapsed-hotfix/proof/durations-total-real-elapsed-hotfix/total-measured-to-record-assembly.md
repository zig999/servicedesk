---
implementation: sha256:48ff9c36d84bf47c36e798e2833ddc85539178bc23d0874dca1ef213fa9a58b4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/durations-total-real-elapsed-hotfix-total-measured-to-record-assembly-suite
title: durations.total measured to record assembly; durations.writing round-trips absence — proof
summary: Tests proving investigation-pipeline.ts and simulate-hypothesis-pipeline.ts now compute durations.total
  as real wall-clock elapsed time (never a stage-figure sum), that the persisted total round-trips unchanged,
  and that the store's durations_writing column round-trips both absence and presence exactly -- plus
  corrections to five pre-existing tests across the wider suite that baked in the old sum-based total
  and would otherwise fail (or silently under-prove) against the delivered fix.
tests:
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: 'corrected: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations
    and prompts together, for one confirmed hypothesis'
  proves: criterion 1, on the no-delay path -- with every stage resolving on the same fake-timer tick,
    durations.total is the real (zero) elapsed time between entry and assembly, not the old collection+judgment+writing
    sum (0+50+7=57)
  fails_when: durations.total is still computed as collection + judgment + writing, which would read 57
    instead of the real-elapsed 0
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: computes durations.total as the real wall-clock elapsed time from pipeline entry to the moment
    its result is assembled, never as collection + judgment + writing
  proves: criterion 1 -- a 3s delay introduced only in evidence collection (via a delayed observation
    source and vi.advanceTimersByTimeAsync) makes durations.total equal exactly that delay, and shows
    it differs from collection+judgment+writing (3057)
  fails_when: durations.total is computed as the collection+judgment+writing sum instead of a readClockMs()
    difference anchored at pipeline entry; the sum would read 3057, not 3000, and the not.toBe assertion
    would itself fail (sum would equal total)
- file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  name: 'corrected: carries durations with collection and judgment only, real measured values, and no
    writing field at all — neither in the type nor on the answer'
  proves: criterion 2, on the no-delay path -- durations.total is the real (zero) elapsed time from pipelineStartedAtMs
    to assembly, not the old collection+judgment sum (0+5=5)
  fails_when: durations.total is still computed as collection + judgment, which would read 5 instead of
    the real-elapsed 0
- file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  name: computes durations.total as the real wall-clock elapsed time from pipelineStartedAtMs to the moment
    its result is assembled, never as collection + judgment
  proves: criterion 2 -- a 3s collection delay makes durations.total equal exactly that delay and shows
    it differs from collection+judgment (3005)
  fails_when: durations.total is computed as the collection+judgment sum instead of a readClockMs() difference
    anchored at pipelineStartedAtMs; the sum would equal total, failing the not.toBe assertion
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: 'corrected: computes durations.collection and durations.judgment as the largest of their own stage''s
    per-unit elapsed_ms, durations.writing as the consolidation call''s own elapsed_ms, and durations.total
    as the real wall-clock time elapsed from pipeline entry to the record''s own assembly — never the
    sum of the three'
  proves: criterion 1, exercised through run-diagnosis.ts's own real production call into investigation-pipeline.ts
    -- with a 300ms collection delay, a fixed 200ms judgment figure and a fixed 400ms writing figure,
    the persisted durations.total is the real 300ms elapsed, not the old sum (900)
  fails_when: durations.total is still collection+judgment+writing, which would read 900 instead of the
    real-elapsed 300
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: excludes persistence entirely from durations.total, since total is measured before the record
    is handed to the store
  proves: criterion 1's own "before that record is handed to persistence" clause -- a store that takes
    1000ms to write does not inflate the persisted durations.total, which stays at the 200ms collection
    delay alone
  fails_when: durations.total were measured anywhere at or after the point the record is handed to the
    store (e.g. after write() settles), it would read close to 1200 instead of 200
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: 'corrected: persists real, non-zero cost and durations for the judgment and consolidation calls,
    now that the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total
    exceeding the sum of the three stage figures since it measures the whole pipeline''s own real elapsed
    time'
  proves: criterion 1, end-to-end over a real HTTP request, real DB and real (mocked) provider delays
    -- durations_total strictly exceeds durations_collection + durations_judgment + durations_writing,
    since it is measured over the whole pipeline run rather than reconstructed from the three stage figures
  fails_when: durations_total is still exactly equal to the sum of the three columns (the old behavior,
    and what a reverted implementation would still produce byte for byte)
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: 'corrected: holds every domain column NOT NULL except exactly the seven columns the model declares
    optional'
  proves: criterion 4's own nullability claim, read directly from information_schema.columns against a
    database that ran every migration in order -- investigations.durations_writing is now among the nullable
    columns
  fails_when: migrations/0015 does not drop the NOT NULL constraint (or does so against the wrong column/table);
    the row set would still list only six nullable columns and omit investigations.durations_writing
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: declares Durations.writing as optional, so an investigation may carry no durations.writing at
    all
  proves: the implementation record's inference that Durations.writing becomes writing?:number
  fails_when: Durations.writing is still required; the type-level assertion itself would not compile/match
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends durations.writing as undefined in the root insert's own params, never an invented duration,
    when the given investigation carries no durations.writing at all
  proves: criterion 4's write side
  fails_when: durationsParams() invents a value (e.g. 0 or null) for an absent durations.writing instead
    of passing undefined through at the exact params[24] position
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reads back durations.writing absent, never an invented duration, when the stored durations_writing
    column is a SQL NULL
  proves: criterion 4's read side
  fails_when: investigationOf() reconstructs a writing field (e.g. 0) even though the stored column is
    null
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: reads back the exact durations.writing value the stored column holds, unchanged, when one was
    present at write
  proves: criterion 5
  fails_when: investigationOf() alters, rounds or drops a present durations_writing value instead of passing
    it through unchanged
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: writes a diagnosis and reads back durations.total exactly as the write recorded it, unchanged
    by the round trip
  proves: criterion 3, at the store's own params/row boundary, with a distinctive value (6172) that cannot
    be confused with any neighbouring column
  fails_when: durationsParams()/investigationOf() transform, truncate or misindex durations.total across
    the write/read boundary
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes and reads back an investigation whose durations.writing is absent, storing it as a real
    SQL NULL now that the column is nullable, and reads it back with durations.writing absent entirely
  proves: criterion 4, against a real PostgreSQL column carrying migration 0015 -- this is the one test
    that would fail with a genuine not-null-violation if the migration were absent or wrong, which no
    fake-connection unit test can catch
  fails_when: migrations/0015 does not actually drop the NOT NULL constraint on investigations.durations_writing;
    the write itself would reject with a real driver error instead of succeeding
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose durations carries no writing field at all, matching a run whose own
    consolidation has not yet happened
  proves: the implementation record's inference that simulate-case.dto.ts's durationsSchema.writing becomes
    z.number().optional()
  fails_when: durationsSchema.writing is still z.number() (required); safeParse would report success:false
    for a durations object missing writing
not_applicable:
- edge_case: A dependency (observation source, evaluator or consolidator) rejecting before the second
    clock read is taken.
  why: the whole pipeline promise rejects before durationsOf() is ever called, so no Durations value is
    produced and total's correctness is moot; already covered by this task's untouched refusal tests (e.g.
    "runs buildSubject before collecting...") which assert the rejection itself, not durations.
- edge_case: Concurrent pipeline runs interfering with one another's durations.total.
  why: total is a pure per-call clock difference with no shared mutable state; one call's real elapsed
    time cannot be altered by another call running alongside it.
- edge_case: An empty case (no hypotheses, no evidence collected) affecting durations.total.
  why: total no longer depends on evidence or evaluation counts at all -- it is now a clock difference
    alone -- so this edge case, meaningful for the old sum-based formula, has no bearing on the new one.
- edge_case: A caller passing an explicit SQL NULL (as opposed to omitting the field / passing undefined)
    for durations.writing at the application layer.
  why: 'Durations.writing''s type is writing?: number -- no | null member -- so a conforming TypeScript
    caller cannot construct that shape; the codebase''s own established convention (mirrored from ticket_ref)
    is that absence is represented by omission/undefined, which is what every test here exercises.'
- edge_case: Whether the declared deadline is exceeded during a delayed collection or judgment stage.
  why: the task's own Notes explicitly state that no criterion of this task touches deadline enforcement
    or per-stage clamping (REMAINDER entries against constraints/the-deadline-is-an-absolute-propagated-instant
    and rules/investigation/an-answer-arrives-within-the-declared-deadline); durations.total's correctness
    under this fix does not depend on whether a deadline was honored.
untested:
- That the store's now-correct round-trip of an absent durations.writing is ever reached by an actual
  production call path (as opposed to a directly constructed Investigation object, which is what every
  test above uses) is the implementation record's own disclosed deferred item -- no code path in this
  codebase currently produces an Investigation with durations.writing absent, since investigation-pipeline.ts's
  own consolidation call is unconditionally awaited. Introducing a consolidation-skip path is explicitly
  out of this task's covers and criteria, so nothing exists to exercise the absence end-to-end; the tests
  here exhaust what the store's own contract can be held to in isolation.
- Whether some further pre-existing test, beyond the eight files this proof touches or inspects, also
  baked in the old collection+judgment(+writing) sum for durations.total was checked by grepping the whole
  src/__tests__ tree for every literal sum/exact-total assertion and for the nullable-columns totality
  check, correcting every one found (run-diagnosis.spec.ts, diagnose-server.factory.spec.ts, schema-migrations.spec.ts).
  That grep-based sweep is strong evidence but not a guarantee against a differently-shaped assertion
  existing somewhere in the ~140-file suite; only a full suite run can close that gap.
---

## What it is

The proof for durations.total measured to record assembly and durations.writing round-tripping
absence: investigation-pipeline.ts and simulate-hypothesis-pipeline.ts now compute durations.total
as real wall-clock elapsed time, and the store round-trips durations.writing correctly.

## Notes

Extended the audit beyond the task's own hint (which named only investigation-pipeline.spec.ts,
simulate-hypothesis-pipeline.spec.ts, and the store's spec files) after finding three more
pre-existing tests that baked in the old sum-based durations.total: run-diagnosis.spec.ts (asserted
the literal sum, corrected to the real-elapsed value, plus a companion test proving total excludes
persistence time), diagnose-server.factory.spec.ts (an end-to-end integration test asserting exact
equality between durations_total and the three stage columns' sum, corrected to toBeGreaterThan),
and schema-migrations.spec.ts (a totality test over information_schema.columns asserting exactly
six nullable domain columns, corrected to seven).
