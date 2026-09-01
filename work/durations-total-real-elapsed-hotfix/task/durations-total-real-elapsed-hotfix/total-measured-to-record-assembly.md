---
title: durations.total is measured to the record's own assembly; durations.writing round-trips
  absence
summary: Fixes investigation-pipeline.ts and simulate-hypothesis-pipeline.ts to compute
  durations.total as the real elapsed time from the same entry instant the deadline was propagated
  from to the moment the record carrying it is assembled, instead of summing the per-stage
  figures, and fixes relational-investigation-store.repository.ts to make durations_writing
  nullable and round-trip its absence correctly.
objective: Every durations.total value an investigation-pipeline or simulate-hypothesis-pipeline
  run returns, and every durations.total a diagnosis persists and reads back, equals the real
  elapsed time from the same entry instant the deadline was propagated from to the moment the
  record carrying that same durations value is assembled — before persistence, for an
  investigation, since durations must already hold a value before the record it belongs to is
  complete enough to persist — never the sum of collection, judgment and writing; and a persisted
  investigation's durations.writing is absent, on read, for exactly the runs whose own
  durations.writing was absent at write.
criteria:
- investigation-pipeline.ts's returned durations.total equals the real elapsed time measured from
  the same entry instant the deadline was propagated from to the moment its result (the record
  durations.total itself belongs to) is assembled, before that record is handed to persistence —
  not collection + judgment + writing.
- simulate-hypothesis-pipeline.ts's returned durations.total equals the real elapsed time measured
  from the same entry instant the deadline was propagated from to the moment its result is
  assembled — not collection + judgment.
- A diagnosis's persisted durations.total, read back from the store, equals exactly the
  real-elapsed value the write recorded, unchanged by the round trip.
- relational-investigation-store.repository.ts's durations_writing column is nullable; an
  investigation whose own durations.writing was absent at write (no consolidation call happened)
  reads back with durations.writing absent, never an invented duration.
- An investigation whose own durations.writing was present at write reads back that exact value,
  unchanged.
implements:
- domain/investigation/durations
- constraints/the-stored-schema-mirrors-the-declared-model
sources:
- intake/scope.md
---

## What it is

The corrective fix computing durations.total as the real elapsed time, measured from the same
entry instant the deadline was propagated from, to the moment the investigation-pipeline or
simulate-hypothesis-pipeline result is assembled — never a sum of stage figures — and making
relational-investigation-store.repository.ts's durations_writing column round-trip absence
correctly.

## Notes

Corrected while this task was bound: domain/investigation/durations' own total definition was
found physically impossible for an investigation in an earlier pass (durations is assembled before
persistence, not after the response) and was corrected in the specification's own disclosed
decisions (two entries against domain/investigation/durations.md, field attributes.total: the
original decision and its correction) before this task's criteria were finalized against the
corrected text.
REMAINDER, from the specification — none of constraints/the-deadline-is-an-absolute-propagated-instant's
three clauses is answered by a criterion of this task; the task reads off the entry instant that
constraint establishes but changes nothing about recording or clamping it.
Decision, beyond the covers — stand: constraints/the-deadline-is-an-absolute-propagated-instant is
not claimed in implements; this task changes no deadline recording or per-stage clamp, only what
durations.total itself counts.
REMAINDER, from the specification — rules/investigation/an-answer-arrives-within-the-declared-deadline's
whole statement reaches no criterion; this task fixes only what durations.total counts, never
whether a run finishes inside the declared deadline.
Decision, beyond the covers — stand: rules/investigation/an-answer-arrives-within-the-declared-deadline
is not claimed in implements; this task changes no declared-deadline enforcement.
ADVISORY, from the binder — after this fix, a conforming investigation's durations.total is
structurally lower than the declared-total-bounded span by the persistence stage's own duration,
since total is fixed before persistence runs; no node states what allowance a load-test comparison
against the declared total takes for that exclusion.
