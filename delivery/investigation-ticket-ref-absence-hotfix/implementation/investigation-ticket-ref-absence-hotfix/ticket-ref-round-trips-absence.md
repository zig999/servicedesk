---
title: ticket_ref round-trips absence as absence in the investigation store
summary: relational-investigation-store.repository.ts now writes an absent-or-empty ticket_ref as
  a real SQL NULL and reads a NULL column back as an absent attribute, never coalescing it to the
  empty string on either side.
task: sha256:f9bc930254bf82903f56ee86d3cacd3537e4c9cef5de77ef6e3c9f6a3c507c5a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-ticket-ref-absence-hotfix-ticket-ref-round-trips-absence-build
files:
- path: src/persistence/relational-investigation-store.repository.ts
  effect: identityParams() now sends ticketRefForWrite(investigation.ticket_ref) as the ticket_ref
    insert param, which substitutes undefined (persisted as SQL NULL by the same path the
    undefined-ticket_ref case already used) for both an undefined and an empty-string ticket_ref
    and passes any other value straight through unchanged; investigationOf() now includes
    ticket_ref on the returned object only when row.ticket_ref is not null, via the same
    conditional-spread idiom the same function already uses for result_detail and
    determining_hypothesis, instead of coalescing a null column to the empty string.
criteria:
- criterion: Reading back an investigation whose ticket_ref was absent at write answers ticket_ref as absent
    (the attribute is not present on the returned object), never as an empty string.
  met: true
  how: "investigationOf() spreads the ticket_ref field onto the returned object only when the row's own
    ticket_ref column is not null; for a null column the spread contributes nothing, so the returned
    Investigation object carries no ticket_ref key at all, rather than the previous coalesce-to-empty-string
    behavior."
- criterion: Reading back an investigation whose ticket_ref was given at write answers that exact value,
    unchanged.
  met: true
  how: ticketRefForWrite() passes any value that is not undefined and not the empty string through
    unmodified into the insert params, so a given ticket_ref is stored as that exact string; on read, the
    same conditional spread in investigationOf() carries the non-null column value through to the returned
    object unchanged.
- criterion: A diagnose call giving an empty string as its ticket reference is recorded and read back as an
    absent ticket_ref, never as an empty-string value, matching
    rules/investigation/an-empty-ticket-reference-is-no-ticket-reference.
  met: true
  how: holdsNoTicketReference() treats the empty string the same as undefined, so ticketRefForWrite()
    substitutes undefined for it and the insert stores SQL NULL for that column -- the same storage the
    undefined case already produced -- rather than persisting the empty string; investigationOf() then
    reads that NULL back as an absent ticket_ref through the same conditional spread as the first
    criterion.
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: the node states ticket_ref arrives in the diagnose call but, unlike requester, is not always
    given. The store's write and read now both honor that optionality precisely -- ticket_ref is written
    as NULL, and read back as an absent attribute, exactly when the investigation carried none -- instead
    of the read silently manufacturing a present-but-empty value the domain type never claims.
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: the invariant that ticket_ref never holds the empty string, and that an empty string given is
    recorded and read back as absence, is enforced at the store boundary -- ticketRefForWrite()
    normalizes an empty string to the same undefined/NULL path the absent case already used before the
    value ever reaches the ticket_ref column, and investigationOf() never resurrects a NULL column as ''.
    The rule's further clause that the call itself is never refused for an empty ticket_ref is not
    reached by this node answer -- the HTTP boundary (diagnose.dto.ts) that could refuse an empty string
    before it reaches this store sits outside this task's file scope, and is recorded under deferred
    below rather than changed here.
inferences:
- inferred: the empty-string normalization belongs in relational-investigation-store.repository.ts itself,
    at both write and read, rather than upstream in investigation-factory.ts or run-diagnosis.ts.
  from: the task's own title and summary name this one file and its read specifically, and
    intake/scope.md's bug report is scoped to the same file's investigationOf(); the file already holds
    the precedent for this exact idiom (result_detail, assessment.determining_hypothesis), so the
    normalization sits beside the pattern it extends rather than in a file this task does not name.
preserved:
- a given non-empty ticket_ref is still persisted and read back exactly as given, unchanged in either
  direction.
- an investigation whose ticket_ref was already undefined still writes SQL NULL through the same
  parameter path as before (ticketRefForWrite returns undefined for it, exactly as the bare
  investigation.ticket_ref reference did previously).
- every other field written and read by writeWholeInvestigation()/readWholeInvestigation() -- requester,
  narrative, subject attributes, evidence, evaluations, citations, assessment, cost, durations,
  written_at, and the content hash computed over the whole read-back document -- is untouched by this
  change.
deferred:
- what: diagnose.dto.ts declares ticket_ref as `z.string().min(1).optional()`, which refuses an HTTP
    request that gives ticket_ref as the empty string before it ever reaches buildInvestigation or this
    store -- in tension with the rule's own clause that "the call is not refused for it."
  why: this task's title, summary and intake/scope.md all scope the fix to
    relational-investigation-store.repository.ts and its read/write of ticket_ref; the DTO sits in a
    different file, at a different boundary (HTTP validation, not persistence), and changing it reaches
    past what this corrective task names.
---

## What it is

The corrective fix preserving an absent ticket_ref as absent on read, and normalizing an
empty-string ticket reference to absence at write, matching
rules/investigation/an-empty-ticket-reference-is-no-ticket-reference (decided while this task was
bound).

## Notes

None.
