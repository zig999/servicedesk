---
title: The synchronous diagnose entry point
summary: Wires case pinning, deadline propagation, collection, judgment, resolution and drafting, the investigation factory, its write-once storage and the idempotency window into the one synchronous diagnose operation, publishing InvestigationCompleted only after the write succeeds.
objective: One diagnose call, given a case, subject and narrative, returns the assessment within the declared deadline, having written the investigation before responding and having published InvestigationCompleted only after that write.
criteria:
  - Diagnose reads the pinned case through the case-source read at the start of the request and pins exactly that case's slug, version and hash into the result.
  - One absolute deadline is recorded at the start of the request, and every stage receives the minimum of its own nominal budget and whatever of that deadline remains.
  - Diagnose returns its response within the request that asked it, with no queue, job or polling step between the caller and the answer.
  - A repeated request within the idempotency window returns the same investigation's assessment without running collection or judgment again.
  - The response leaves only after the investigation is written, never before.
  - InvestigationCompleted is published with the written investigation as its payload, and never before the write succeeds.
  - When persistence does not conclude within what remains of the deadline, the caller receives an error and no assessment, because no record exists.
depends_on:
  - task/evidence-collection/evidence-collection-stage
  - task/hypothesis-judgment/judgment-stage
  - task/assessment-drafting/draft-assessment-text
  - task/investigation-lifecycle/investigation-factory
  - task/investigation-lifecycle/investigation-store
  - task/investigation-lifecycle/idempotency-window
rationale: The composition root is its own task because it is what wires every independently demonstrable stage end to end, reusing the existing per-context factory pattern (src/src/factories) rather than inventing a second wiring convention.
implements:
  - domain/investigation/investigation
  - domain/investigation/subject
  - domain/investigation/cost
  - domain/investigation/durations
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/replay-is-pinned
  - rules/investigation/the-response-follows-the-record
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
  - scenarios/investigation/no-response-without-a-record
  - contracts/investigation/diagnosis
  - contracts/investigation/case-source
  - contracts/investigation/investigation-completed
  - constraints/diagnosis-answers-synchronously
  - constraints/in-progress-is-a-lease-not-domain-state
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The one entry point the attendant's request actually reaches.
Every stage this plan cuts apart meets here, under one deadline recorded once and never recomputed.

## Notes

BLOCKING, from the specification — domain/investigation/investigation requires requester and ticket_ref as mandatory attributes, and rules/investigation/an-investigation-is-idempotent-within-a-window's key needs subject type, subject id, case and ticket reference — but this task's own objective and contracts/investigation/diagnosis both state diagnose's input as exactly case, subject and narrative. No node anywhere in the specification states where a requester identity or a ticket reference for a diagnose call originates, so neither a valid Investigation nor the idempotency key can be assembled without inventing a value nothing states. This is the scope's own demand for idempotency-by-window (the material's ticket reference) meeting a diagnose contract that never grants that input, and it is settled through the scope or through the analysis that extends the specification, never invented here.
UNDERDETERMINED, from the specification — no criterion pins the recorded absolute deadline's value relative to the caller's own timeout, though rules/investigation/an-answer-arrives-within-the-declared-deadline and constraints/the-deadline-is-an-absolute-propagated-instant both require margin below it. Passes: an implementation that records an absolute deadline at or above the caller's own timeout while still giving every stage the minimum of its nominal budget and the remaining time.
UNDERDETERMINED, from the specification — no criterion forbids persisting an in-progress or partial investigation record before the final write, though an-investigation-is-written-once and in-progress-is-a-lease-not-domain-state both forbid it. Passes: an implementation that stores a partial record carrying a status field and lets a concurrent request join by reading it, rather than using a separate lease store, while still gating the response on the final write.
UNDERDETERMINED, from the specification — no criterion demonstrates that the wiring keeps the domain free of framework, driver or provider-client imports, as constraints/the-domain-depends-on-no-infrastructure requires. Passes: wiring that has the investigation factory or the domain functions it calls import a provider SDK, an HTTP client or a file-system driver directly, rather than receiving such capabilities through ports injected at the entry point.
REMAINDER, from the specification — no-stage-aborts-on-its-deadline's collection and judgment clauses constrain domain/investigation/evidence and domain/investigation/evaluation, neither a candidate of this task. Belongs to task/evidence-collection/evidence-collection-stage and task/hypothesis-judgment/judgment-stage.
Decision, beyond the covers — stand: both nodes are already covered and implemented elsewhere in this same plan — domain/investigation/evidence by epic/evidence-collection and domain/investigation/evaluation by epic/hypothesis-judgment; naming them here only locates where the clause's remainder actually lands, it is not a claim this epic's own covers needs to grow to answer.
REMAINDER, from the specification — one-evaluation-per-required-hypothesis constrains domain/investigation/evaluation, not a candidate of this task; none of this task's criteria address evaluation coverage. Belongs to task/investigation-lifecycle/investigation-factory and task/hypothesis-judgment/judgment-stage.
Decision, beyond the covers — stand: domain/investigation/evaluation is already covered and implemented by epic/hypothesis-judgment; naming it here only locates the remainder, it is not a claim this epic's own covers needs to grow to answer.
