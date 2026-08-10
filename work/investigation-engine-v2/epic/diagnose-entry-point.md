---
title: Diagnose entry point
summary: The synchronous diagnose composition — requester and ticket_ref in its own payload, window dedup only when a ticket reference travels, and one written investigation before any response.
rationale: This epic is the composition root the prior plan's own diagnose-entry-point task never shipped past its BLOCKING note; splitting it from the subject and consolidation epics follows the one-objective test — assembling a fresh investigation's synchronous run is one falsifiable outcome, and deciding whether to run it, join an in-progress one, or return a completed one is another, in front of it.
sources:
  - intake/scope.md
covers:
  - contracts/investigation/diagnosis
  - domain/investigation/investigation
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/replay-is-pinned
  - rules/investigation/the-response-follows-the-record
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - constraints/diagnosis-answers-synchronously
  - constraints/in-progress-is-a-lease-not-domain-state
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - contracts/investigation/case-source
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
  - scenarios/investigation/no-ticket-reference-never-repeats
  - scenarios/investigation/no-response-without-a-record
---

## What it is

The composition that runs one fresh investigation synchronously — collection, judgment, consolidation/drafting, persistence — within the declared deadline.
requester and ticket_ref traveling in the diagnose payload itself, requester required and ticket_ref optional.
The window dedup applying only when a ticket reference is given, never otherwise.
No file under src/ mentions diagnose, requester or ticket_ref handling yet, so every task here is new composition, not a rework of standing code.

## Notes

None.
