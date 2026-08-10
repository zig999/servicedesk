---
title: Investigation lifecycle
summary: Builds the immutable, pinned investigation from every stage's output, writes it once, honors the idempotency window, and wires the whole synchronous diagnose entry point that responds only after the write and publishes InvestigationCompleted only after that.
rationale: The factory, the write-once store, the idempotency lease and the entry point that composes everything are cut apart because each changes for a different reason — invariant enforcement, storage mechanics, repeat-request deduplication and stage wiring respectively — while each stays independently demonstrable on its own fixtures without the others being finished first.
covers:
  - domain/investigation/investigation
  - domain/investigation/subject
  - domain/investigation/cost
  - domain/investigation/durations
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/one-evaluation-per-required-hypothesis
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/replay-is-pinned
  - rules/investigation/the-response-follows-the-record
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
  - scenarios/investigation/no-response-without-a-record
  - contracts/investigation/diagnosis
  - contracts/investigation/case-source
  - contracts/investigation/investigation-completed
  - contracts/knowledge/case-query
  - constraints/diagnosis-answers-synchronously
  - constraints/in-progress-is-a-lease-not-domain-state
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: contracts/knowledge/case-query
    why: The knowledge context's own publishing side is already delivered by an earlier plan; this epic only consumes it through case-source and never touches the knowledge context itself, per the scope's own boundary.
sources:
  - intake/scope.md
---

## What it is

The aggregate that pins one diagnosis whole, the storage that writes it exactly once, the lease that lets a repeated request join or reuse it, and the entry point that ties the whole flow to one absolute deadline.
Nothing here is acted on before it is written, and the completion event carries only what was written.

## Notes

None.
