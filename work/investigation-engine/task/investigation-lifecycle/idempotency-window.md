---
title: Idempotency window over subject, case and ticket
summary: A lease-backed mechanism that lets a repeated request within the configured window find the investigation already completed or in progress, and starts a new one only when neither exists.
objective: A request repeating subject type, subject id, case and ticket reference within the window finds the completed investigation when one exists, joins an in-progress lease when one is held, and only otherwise is free to start.
criteria:
  - A repeated request whose key matches a completed investigation within the window answers that investigation, never starting a second one.
  - A repeated request whose key matches a currently held lease joins it rather than starting a second investigation.
  - The in-progress marker holds only a key and an instant, never a domain state of the investigation.
  - A lease outside the configured window no longer blocks a fresh request.
rationale: The lease is a distinct mechanism from the investigation's own storage — a key-and-instant structure the constraint explicitly forbids from becoming domain state — so it is cut as its own task, testable against fixture keys without a built investigation.
implements:
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - constraints/in-progress-is-a-lease-not-domain-state
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
sources:
  - intake/scope.md
---

## What it is

The mechanism that keeps an impatient repeat from costing a second investigation.
The lease it holds is a key and an instant, never a state of anything domain.

## Notes

UNDERDETERMINED, from the specification — rules/investigation/an-investigation-is-idempotent-within-a-window bounds both branches, completed returns it and in progress joins it, by "within the configured window," but the criteria above attach window expiry only to the lease branch. Passes: an implementation whose completed-investigation match never expires, so a completed investigation older than the window still blocks a fresh request with the same key — satisfying every criterion above while contradicting the rule's window bound on the completed branch.
UNDERDETERMINED, from the specification — constraints/in-progress-is-a-lease-not-domain-state's fitness states both that the lease holds only a key and an instant and that the investigation store holds no record before completion, but no criterion above excludes writing a stub investigation record to make the in-progress join work. Passes: an implementation that persists a partial investigation record as soon as one begins and uses that record, rather than a separate lease, to answer the in-progress-join case — satisfying every criterion above while the constraint's fitness and an-investigation-is-written-once both refuse it.
