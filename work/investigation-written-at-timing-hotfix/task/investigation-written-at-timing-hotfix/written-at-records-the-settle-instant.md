---
title: written_at records the instant the write settles, not the request's entry instant
summary: Fixes run-diagnosis.ts to stamp written_at from the clock at the moment the investigation's
  write settles, instead of from the request's original entry instant.
objective: A persisted investigation's written_at equals the instant its one write settled — never
  the instant the diagnose request was admitted.
criteria:
- written_at on a persisted investigation is read from the clock at the moment the store confirms
  the write settled, never from the request's entry instant.
- A write whose first attempt fails and is retried once records written_at from whichever attempt
  actually settles, not from the first attempt's own start.
- A write that finds the record already present (settles without a new write, per
  rules/investigation/an-investigation-is-written-once) reads written_at from the existing record,
  never restamping it.
implements:
- domain/investigation/investigation
- rules/investigation/an-investigation-is-written-once
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/written-at-records-when-the-write-settled
sources:
- intake/scope.md
---

## What it is

The corrective fix stamping written_at from the clock at the moment the investigation's write
settles in the store, matching rules/investigation/written-at-records-when-the-write-settled
(decided while this task was bound), instead of from the request's entry instant.

## Notes

Decided while this task was bound: rules/investigation/written-at-records-when-the-write-settled
now states this attribute's own instant explicitly — the store's settle instant, never the
request's arrival or an attempt's own start — and states that a write settling by finding the
record already present leaves that record's own written_at unchanged.
REMAINDER, from the specification — most of rules/investigation/no-stage-aborts-on-its-deadline's
statement (collection's timeout result, judgment's deadline-exceeded result, the zero-or-less
short-circuit, the attempt-splitting discipline, the HTTP 500 response) reaches no criterion of
this task, which is only about which clock reading written_at carries.
REMAINDER, from the specification — rules/investigation/an-investigation-is-written-once's clauses
"no intermediate domain state persists" and the id-keyed once-ness mechanism reach no criterion
here; criterion 3 consumes only the settles-without-a-new-write outcome, not what produces it.
REMAINDER, from the specification — rules/investigation/the-response-follows-the-record's whole
statement reaches no criterion of this task; nothing here changes when the response leaves, only
which clock reading written_at carries.
Decision, beyond the covers — stand: rules/investigation/the-response-follows-the-record is not
claimed in implements; this task changes no ordering between the write and the response.
ADVISORY, from the binder — the objective's earlier claim that the gap "can be up to the whole
declared deadline" is not asserted here since no candidate states the deadline's magnitude in a
form this task's criteria test.
