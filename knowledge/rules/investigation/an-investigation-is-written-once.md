---
type: invariant
statement: An investigation is written once and never mutated; no intermediate domain state persists; the investigation's own id identifies at most one record, so a write of an investigation the store already holds a record for persists no second record and counts as a write that settled.
constrains:
  - domain/investigation/investigation
---

## Description

Persisting in stages would reintroduce the intermediate states and the rich aggregate that were cut.
A crash before the write costs one re-execution, acceptable because collection is read-only and parallel.
The id is what holds the once-ness rather than any ordering of attempts: a write abandoned without its outcome being known may still be landing, so nothing that follows it can tell an attempt that failed from one that succeeded unobserved, and only the record's own identity can refuse the duplicate that would otherwise follow.
An attempt that finds the record already present has found exactly what it was sent to write — the same investigation, under the same id, written once — so it settles rather than failing: the requester is then answered from a record that exists, which is the whole of what the-response-follows-the-record asks, while the error no-stage-aborts-on-its-deadline reserves for a persistence that settles no write would report a missing record that is in fact there.
