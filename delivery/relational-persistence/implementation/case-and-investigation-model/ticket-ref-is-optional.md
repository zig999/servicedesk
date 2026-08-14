---
title: ticket_ref becomes optional across the investigation build/run chain
summary: BuildInvestigationOptions.ticket_ref, Investigation.ticket_ref and RunDiagnosisOptions.ticket_ref
  are now optional strings whose absence threads through as an absence, and the diagnose controller's
  now-unnecessary empty-string placeholder is removed.
task: sha256:be3ef09ccc7c3e7e076b5fb9a4e7ecb90af0f18bfa3d9249212baaba4af89caa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-ticket-ref-is-optional-build
files:
- path: src/investigation/investigation.ts
  effect: 'Investigation.ticket_ref is now `ticket_ref?: string` instead of a required string, documented
    as optional because not every diagnose call carries a ticket.'
- path: src/investigation/investigation-factory.ts
  effect: 'BuildInvestigationOptions.ticket_ref is now `ticket_ref?: string`; buildInvestigation''s existing
    straight pass-through (`ticket_ref: options.ticket_ref`) now carries an absent value through as undefined
    rather than requiring a caller to invent one.'
- path: src/investigation/run-diagnosis.ts
  effect: 'RunDiagnosisOptions.ticket_ref is now `ticket_ref?: string`; its existing straight pass-through
    into buildInvestigationOptions is unchanged in code and now carries an absent value through unchanged.'
- path: src/http/diagnose.controller.ts
  effect: handleDiagnoseRequest no longer synthesizes `body.ticket_ref ?? ''`; it passes `body.ticket_ref`
    straight through, so a request naming no ticket_ref now propagates as an absence rather than an empty
    string, matching ProductionDiagnoseCall's now-optional ticket_ref.
criteria:
- criterion: 'BuildInvestigationOptions.ticket_ref, Investigation.ticket_ref and RunDiagnosisOptions.ticket_ref
    are each typed as an optional string (ticket_ref?: string), not a required one.'
  met: true
  how: 'all three type declarations now read `readonly ticket_ref?: string;` in investigation.ts, investigation-factory.ts
    and run-diagnosis.ts respectively.'
- criterion: buildInvestigation, given no ticket_ref, builds an Investigation that itself carries no ticket_ref
    (undefined, or the field genuinely absent) rather than an invented placeholder value.
  met: true
  how: 'buildInvestigation''s return statement still copies `ticket_ref: options.ticket_ref` unchanged
    in code; with ticket_ref now optional on both the input and output types, an absent input (undefined)
    produces an Investigation whose ticket_ref is undefined rather than a synthesized string -- no placeholder
    is constructed anywhere in this call.'
- criterion: Every real caller of runDiagnosis and buildInvestigation that already supplies a ticket_ref
    keeps working unchanged.
  met: true
  how: a supplied string still flows through diagnose.controller.ts -> createProductionDiagnoseRunner
    -> createDiagnoseRunner -> runDiagnosis -> buildInvestigationOptions -> buildInvestigation unchanged
    in every intermediate object literal; none of those pass-throughs were touched, only the option types
    widened to also accept absence.
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  how: 'the node''s own attribute table declares ticket_ref with no `required: true`, and its Description
    states "requester is always given, ticket_ref is not -- not every diagnose call carries a ticket";
    Investigation.ticket_ref and BuildInvestigationOptions.ticket_ref are now both `ticket_ref?: string`,
    and buildInvestigation''s unchanged pass-through lets an absent ticket_ref reach the built aggregate
    as an absence rather than an invented value.'
inferences:
- inferred: leaving src/persistence/relational-investigation-store.repository.ts's write() path untouched
    keeps it working when it now receives an Investigation whose ticket_ref is undefined, because node-postgres'
    own parameter preparation converts an undefined bound value to SQL NULL the same way it already converts
    an explicit null -- matching the ticket_ref column's own nullable declaration in migrations/0005-investigation.sql
    (no NOT NULL constraint).
  from: node-postgres' documented parameter-preparation behavior (undefined and null both serialize to
    NULL) together with the migration's own column declaration, neither of which any specification node
    states -- this is a fact about the installed dependency's behavior, not a domain fact.
preserved:
- Every real caller that already supplies a concrete ticket_ref string (diagnose.controller.ts through
  to the relational store's write/read) continues to receive and persist that same string end to end,
  unchanged.
- src/persistence/relational-investigation-store.repository.ts's write() and read() paths continue to
  type-check and run against Investigation values without modification, since its params are typed `readonly
  unknown[]` and its column is already nullable.
deferred:
- what: src/persistence/relational-investigation-store.repository.ts still documents (its own identityParams
    comment) and behaves as though ticket_ref always arrives as a string, including "the empty string
    the upstream boundary already uses where none was given," and its read() path still synthesizes `row.ticket_ref
    ?? ''` on a null column rather than representing the absence as an absence on read.
  why: this file is not a caller of buildInvestigation or runDiagnosis -- it is the store those functions
    write into -- and it belongs to a different, already-delivered task (task/relational-stores/investigation-store)
    under a different epic (service-on-the-database), carrying its own recorded inference. This task's
    own context and Notes bound this delivery to investigation-factory.ts, investigation.ts, run-diagnosis.ts
    and real callers of those two functions; reconciling the repository's own stale doc comment and read-side
    placeholder reaches past that scope and is left for a task under its own epic, or a corrective task,
    per the plan's own routing for a fact found true only once the system runs.
---

## What it is

The reconciliation between a majority-confirmed conformance finding and the source it flagged: ticket_ref stops being a required string across the investigation build/run chain, matching what domain/investigation/investigation already states.

## Notes

REMAINDER, from the specification -- the RunDiagnosisOptions half of this fix (run-diagnosis.ts) is governed by contracts/investigation/diagnosis, which sits in epic/service-on-the-database's own covers, not this epic's; fixed here anyway since the task's own objective and criteria require it, per the task's own Decision line, without claiming that node in `implements`.
A deferral is recorded above: relational-investigation-store.repository.ts's own write/read handling of ticket_ref as always-a-string belongs to a different, already-delivered task under a different epic, and is left untouched.
