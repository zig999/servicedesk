---
title: durations.total measured to record assembly; durations.writing round-trips absence
summary: Fixes investigation-pipeline.ts and simulate-hypothesis-pipeline.ts to compute durations.total
  as the real wall-clock elapsed time from pipeline entry to result assembly instead of summing stage
  figures, makes relational-investigation-store.repository.ts's durations_writing column nullable so an
  absent durations.writing round-trips as absent while a present one round-trips unchanged, and widens
  simulate-case.dto.ts's own durations schema so its response type still matches Durations's now-optional
  writing.
task: sha256:47cdebcb95778a30563abe5adc2eaf1b7ce12fce23c30139af1e10ba56832548
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/durations-total-real-elapsed-hotfix-total-measured-to-record-assembly-build-2
files:
- path: src/investigation/investigation-pipeline.ts
  effect: runInvestigationPipeline() reads the clock once at entry and once immediately before durations
    is assembled, and durationsOf() now takes that real-elapsed difference as durations.total instead
    of summing collection, judgment and writing; durationsOf()'s four values are now passed as one options
    object rather than four positional parameters.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  effect: runSimulateHypothesisPipeline() reads the clock again right before assembling its result and
    passes the difference from its already-captured pipelineStartedAtMs into durationsOf() as durations.total,
    replacing the collection+judgment sum.
- path: src/investigation/durations.ts
  effect: 'Durations.writing is now an optional attribute (writing?: number) rather than a required one,
    mirroring the domain model''s own declaration that writing is present exactly when a consolidation
    call happened.'
- path: src/persistence/relational-investigation-store.repository.ts
  effect: IInvestigationRow.durations_writing is now typed number | null; durationsParams() passes durations.writing
    through unconverted (undefined flows to SQL NULL, the same convention ticketRefForWrite already uses
    for ticket_ref); investigationOf() reconstructs durations.writing conditionally, present only when
    the stored column is not null.
- path: migrations/0015-durations-writing-nullable.sql
  effect: Drops the NOT NULL constraint on investigations.durations_writing, so the column can hold an
    absent duration.
- path: src/http/dto/simulate-case.dto.ts
  effect: 'durationsSchema''s writing field is now z.number().optional() instead of z.number(), so SimulateCaseResponseDto''s
    inferred durations shape (writing?: number) matches Durations''s own now-optional writing attribute;
    handleSimulateCaseRequest()''s return of the pipeline''s Durations value at simulate-case.controller.ts
    now type-checks again.'
criteria:
- criterion: investigation-pipeline.ts's returned durations.total equals the real elapsed time measured
    from the same entry instant the deadline was propagated from to the moment its result (the record
    durations.total itself belongs to) is assembled, before that record is handed to persistence — not
    collection + judgment + writing.
  met: true
  how: runInvestigationPipeline() captures enteredAtMs = readClockMs() before buildSubject() and every
    stage, then computes totalElapsedMs = readClockMs() - enteredAtMs immediately before calling durationsOf(),
    which now assigns that value to total instead of collection + judgment + writingElapsedMs.
- criterion: simulate-hypothesis-pipeline.ts's returned durations.total equals the real elapsed time measured
    from the same entry instant the deadline was propagated from to the moment its result is assembled
    — not collection + judgment.
  met: true
  how: runSimulateHypothesisPipeline() already captured pipelineStartedAtMs = readClockMs() at entry (from
    the earlier deadline-arithmetic-clock-read-hotfix task); a second readClockMs() read is now taken
    right before durationsOf() is called, and their difference (totalElapsedMs) becomes total instead
    of collection + judgment.
- criterion: A diagnosis's persisted durations.total, read back from the store, equals exactly the real-elapsed
    value the write recorded, unchanged by the round trip.
  met: true
  how: durationsParams() and investigationOf() pass durations.total straight through to and from the durations_total
    column, untouched by this task -- the same pass-through that already held before this fix, still verified
    against the corrected upstream value.
- criterion: relational-investigation-store.repository.ts's durations_writing column is nullable; an investigation
    whose own durations.writing was absent at write (no consolidation call happened) reads back with durations.writing
    absent, never an invented duration.
  met: true
  how: Migration 0015 drops the column's NOT NULL constraint. durationsParams() passes an absent durations.writing
    through as undefined (never inventing a value), and investigationOf() only includes a writing field
    in the reconstructed Durations when the stored column is not null.
- criterion: An investigation whose own durations.writing was present at write reads back that exact value,
    unchanged.
  met: true
  how: 'durationsParams() passes a present durations.writing through as the number it is, and investigationOf()
    includes it unchanged as { writing: row.durations_writing } whenever the column holds a value.'
nodes:
- node: domain/investigation/durations
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/investigation/durations.ts
  - src/persistence/relational-investigation-store.repository.ts
  - src/http/dto/simulate-case.dto.ts
  how: total is now the whole call's own real elapsed time -- a readClockMs() difference between pipeline
    entry and result assembly -- in both pipelines, never the collection+judgment(+writing) sum; writing's
    conditional presence (present exactly when a consolidation call happened) is now representable in
    the Durations type itself and round-tripped correctly by the store. simulate-case.dto.ts's durationsSchema
    now declares writing optional too, so the wire shape a simulate-case response validates against still
    mirrors the same conditional-presence fact the domain node states, and the value simulateCaseController
    hands back type-checks against it without narrowing writing's presence.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0015-durations-writing-nullable.sql
  - src/persistence/relational-investigation-store.repository.ts
  how: durations_writing's column nullability now mirrors durations.writing's own optional declaration
    exactly; before this fix the column was NOT NULL while the attribute the domain model declares carries
    no required true, which was itself a column-declares-more-than-the-model departure this task closes.
inferences:
- inferred: for investigation-pipeline.ts, 'the same entry instant the deadline was propagated from' is
    measured as a fresh readClockMs() read taken at the top of runInvestigationPipeline, not as options.now.
  from: the existing test fixtures for both pipelines run under vi.useFakeTimers() with options.now set
    to an arbitrary business value (e.g. 0) that the fake clock never advances to meet on its own; every
    existing stage-duration measurement in this codebase (evidence elapsed_ms, evaluation elapsed_ms,
    the persistence-stage bound in run-diagnosis.ts, and simulate-hypothesis-pipeline.ts's own judgmentBeginsAtMs
    arithmetic) is always a difference between two readClockMs() reads, never a difference against the
    now/deadline business value, so a real-elapsed duration follows the same convention.
- inferred: for simulate-hypothesis-pipeline.ts, the same already-captured pipelineStartedAtMs (added
    by the earlier deadline-arithmetic-clock-read-hotfix task) is the entry instant to measure total from,
    rather than a second, independent entry read.
  from: pipelineStartedAtMs is already a readClockMs() read taken at the top of the function, before any
    stage runs, and judgmentBeginsAtMs already treats it as the pipeline's own real-clock entry point;
    reusing it keeps one entry reading per run rather than introducing a second that could disagree with
    it by execution-order noise.
- inferred: 'Durations.writing becomes optional (writing?: number) as part of this task, rather than being
    a fact already closed elsewhere.'
  from: the epic's own summary states this task closes both facts domain/investigation/durations now decides
    -- total's real-elapsed definition and writing's absence round-trip -- and the domain node's own attributes
    list carries no required true for writing, while the type previously required it unconditionally.
- inferred: durationsParams() passes an absent durations.writing through as undefined rather than converting
    it to an explicit null.
  from: the codebase's own established convention for an absent optional column value, ticketRefForWrite()/identityParams()'s
    handling of ticket_ref, already relies on undefined reaching the query parameters and being treated
    as SQL NULL by the driver; reusing that convention rather than introducing a second style for the
    same kind of absence.
- inferred: simulate-case.dto.ts's durationsSchema.writing becomes z.number().optional() rather than staying
    z.number(), and simulate-hypothesis.dto.ts's own durationsSchema (which never declared a writing field
    at all) is left untouched.
  from: 'the compiler''s own reported error names exactly the assignment at simulate-case.controller.ts''s
    return of a Durations value against SimulateCaseResponseDto''s inferred durations shape; simulate-hypothesis.dto.ts''s
    durationsSchema has no writing field to disagree with Durations''s now-optional one, and durations.ts''s
    own writing?: number is the type this task already widened, so mirroring the same optionality in the
    one schema the widened type now fails to satisfy is the narrowest fix that clears the reported error
    without touching a file the error does not name.'
preserved:
- durations.collection and durations.judgment's own computation (the largest per-item elapsed_ms within
  each stage) in both pipelines, untouched by this fix.
- durations.total's pass-through, unmodified, by the store's write and read paths -- only what feeds it
  upstream changed.
- a present durations.writing's own round trip through the store, unchanged in value.
- simulate-hypothesis-pipeline.ts's judgment-stage deadline arithmetic (judgmentBeginsAtMs, and the deadline
  it derives for judgeHypotheses), which this task does not touch.
- every other column of the investigations row and every other table this repository writes and reads,
  untouched.
- simulate-case.dto.ts's other schemas (evidenceSchema, evaluationSchema, resolvedOutcomeSchema, assessmentSchema,
  costSchema) and simulate-hypothesis.dto.ts's own durationsSchema, unmodified by this fix.
deferred:
- what: No code path anywhere in this codebase currently constructs an Investigation with durations.writing
    absent -- draftAssessment()/the consolidator is unconditionally awaited on every run of runInvestigationPipeline(),
    so the store's now-correct round-trip of an absent durations.writing currently only serves a caller
    that builds an Investigation outside that pipeline.
  why: Introducing a consolidation-skip code path in the pipeline is a behavior change this task's covers
    (domain/investigation/durations, constraints/the-stored-schema-mirrors-the-declared-model) and its
    criteria do not ask for; the criteria are about the store's round trip, not about when writing becomes
    absent in practice.
---

## What it is

The corrective fix computing durations.total as the real elapsed time, measured from the same
entry instant the deadline was propagated from, to the moment the investigation-pipeline or
simulate-hypothesis-pipeline result is assembled — never a sum of stage figures — and making
relational-investigation-store.repository.ts's durations_writing column round-trip absence
correctly.

## Notes

None.
