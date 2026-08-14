---
title: ticket_ref becomes optional across the investigation build/run chain — proof
summary: Tests that BuildInvestigationOptions.ticket_ref, Investigation.ticket_ref and RunDiagnosisOptions.ticket_ref
  are genuinely optional (not merely accepted after a delete-and-cast bypass), that an absent ticket_ref
  threads through as undefined rather than an invented placeholder end to end, that a supplied ticket_ref
  still propagates unchanged, and that the one recorded inference about the untouched investigation store
  holds; one pre-existing test that the delivered change made stale is corrected to state the new, intended
  behavior.
implementation: sha256:0b0628d8a6e129cd7d8e882bad3d5bce67f352220fc2b1c7614b00c067607723
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-ticket-ref-is-optional-suite
tests:
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: builds an Investigation whose own ticket_ref is undefined, not an invented placeholder, when the
    given options carry no ticket_ref at all
  proves: 'criterion 1 (BuildInvestigationOptions.ticket_ref and Investigation.ticket_ref are each ticket_ref?:
    string) together with criterion 2 (buildInvestigation given no ticket_ref builds an Investigation
    carrying no invented placeholder)'
  fails_when: either type reverts to a required string, in which case optionsOmittingTicketRef()'s object
    literal no longer type-checks and npm run typecheck fails; or buildInvestigation ever synthesizes
    a placeholder (e.g. '') for an absent ticket_ref, in which case investigation.ticket_ref would no
    longer be undefined
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes an investigation whose own ticket_ref is undefined, not an invented placeholder, when the
    given options carry no ticket_ref at all
  proves: 'criterion 1 (RunDiagnosisOptions.ticket_ref is ticket_ref?: string) together with criterion
    2''s propagation through the whole runDiagnosis pipeline into the written record'
  fails_when: RunDiagnosisOptions.ticket_ref reverts to a required string, in which case baseOptionsOmittingTicketRef()'s
    object literal no longer type-checks; or the written investigation's ticket_ref is ever a synthesized
    value instead of undefined
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes the given ticket_ref through unchanged into the written investigation when one is supplied
  proves: criterion 3 (every real caller of runDiagnosis that already supplies a ticket_ref keeps working
    unchanged), read from the actual persisted value rather than inferred from a partial toMatchObject
  fails_when: a supplied ticket_ref stops reaching the written investigation unchanged -- dropped, mutated
    or replaced anywhere along runDiagnosis -> buildInvestigationOptions -> buildInvestigation -> store.write
- file: src/__tests__/unit/http/build-app.spec.ts
  name: passes ticket_ref through as undefined to the diagnose call when the request names none, inventing
    no placeholder
  proves: the diagnose.controller.ts effect this task's own implementation record lists (handleDiagnoseRequest
    no longer synthesizes body.ticket_ref ?? ''), which the pre-existing test this replaces asserted the
    opposite of
  fails_when: the controller resumes synthesizing an empty string (or any other placeholder) for a request
    naming no ticket_ref
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends ticket_ref as undefined in the root insert's own params when the given investigation carries
    no ticket_ref at all
  proves: the DB-independent half of this task's own recorded inference -- that the untouched write()
    path forwards an Investigation whose ticket_ref is undefined without choking on it or coercing it
    into something else
  fails_when: write() throws, or silently rewrites the ticket_ref value, when given an Investigation whose
    ticket_ref is undefined
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes and reads back an investigation whose ticket_ref is undefined, storing it as a real SQL
    NULL and reading it back as the empty string this store's own read() already synthesizes for a null
    column
  proves: the real-database half of this task's own recorded inference -- that node-postgres serializes
    an undefined bound parameter to SQL NULL the same way it already serializes an explicit null, so the
    untouched write()/read() pair keeps working once Investigation.ticket_ref is optional
  fails_when: the real write rejects, or the row read back afterwards fails to match the rest of the investigation
    once ticket_ref is normalized to the empty string read() already answers for a null column
not_applicable:
- edge_case: a supplied ticket_ref that is the empty string, as distinct from an absent one
  why: no criterion of this task distinguishes an empty string from any other concrete string value, and
    the pre-existing tests already exercising '' as an explicit ticket_ref (relational-investigation-store.repository.spec.ts)
    are unaffected by widening the type to also accept absence -- nothing about how a supplied empty string
    behaves changed
- edge_case: a boundary on ticket_ref's length or format
  why: 'ticket_ref is an unconstrained string in every type this task touches; the wire boundary''s own
    minimum length (diagnoseRequestSchema''s ticket_ref: z.string().min(1).optional()) predates this task
    and is untouched by it'
- edge_case: a duplicate or uniqueness violation over ticket_ref
  why: no node or criterion treats ticket_ref as an identifier; nothing about this task makes it one
- edge_case: two concurrent operations touching ticket_ref
  why: this task changes only type declarations and straight pass-through assignments; it introduces no
    new shared state, and the pre-existing concurrent-write tests in run-diagnosis.spec.ts and relational-investigation-store.repository.spec.ts
    already exercise concurrency independently of ticket_ref's value
- edge_case: a slow or failing dependency reached while handling ticket_ref
  why: ticket_ref is a plain value carried by three call chains this task widens; it crosses no I/O boundary
    of its own for this task to raise a failure or a delay against
untested:
- 'The compile-time half of criterion 1 -- that the three fields are literally declared ticket_ref?: string
  -- is exercised only indirectly, through object literals (optionsOmittingTicketRef, baseOptionsOmittingTicketRef)
  that fail npm run typecheck if any of the three reverts to required. Confirmed directly by this record''s
  own captured run: typecheck passed as one of the steps the cited run covers.'
- DiagnoseRequestDto's own ticket_ref optionality (diagnose.dto.ts's z.string().min(1).optional()) predates
  this task and is not re-tested here, since it is neither one of this task's files nor named by its criteria.
- No test in this proof drives one HTTP request naming no ticket_ref all the way through to a persisted,
  relational row in one run -- build-app.spec.ts proves the controller's own propagation with a stand-in
  runDiagnose, and the two relational-investigation-store tests prove the persistence boundary directly;
  the two ends are not joined in a single end-to-end assertion (diagnose-server.factory.spec.ts and diagnose-e2e.spec.ts,
  both real-database integration suites, were left as they already stood).
---

## What it is

The proof that ticket_ref genuinely becomes optional across BuildInvestigationOptions, Investigation and RunDiagnosisOptions, that an absent one never gets an invented placeholder, and that everything already supplying one keeps working end to end.

## Notes

None.
