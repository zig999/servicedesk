---
title: diagnose accepts requester and an optional ticket reference
summary: The diagnose entry point takes requester (required) and ticket_ref (optional) in its own payload, and dedups within the window only when a ticket reference is given.
objective: diagnose accepts case, subject, narrative, requester and an optional ticket_ref in one payload; requester is always required, and the window dedup applies only when ticket_ref is given.
criteria:
  - A diagnose call missing requester is refused before any investigation starts.
  - A diagnose call carrying a ticket_ref that repeats subject type, the whole attribute-value set, case and that ticket_ref within the window returns the existing completed investigation without starting a second one.
  - A diagnose call carrying a ticket_ref that repeats those same fields while the first matching call is still in progress joins it rather than starting a second investigation.
  - A diagnose call carrying no ticket_ref always starts its own investigation, never matched against any prior call regardless of how closely subject, case or timing coincide.
  - requester and ticket_ref are read from the diagnose payload itself, never resolved from any other source.
depends_on:
  - task/diagnose-entry-point/diagnose-pipeline-composition
  - task/subject-identity-rework/idempotency-key-subject-attributes
rationale: The scope singles out payload shape and window dedup as the change that finally unblocks this entry point; cutting it as its own task, in front of the pipeline it starts or joins, keeps the dedup decision demonstrable on its own against a stub pipeline.
implements:
  - contracts/investigation/diagnosis
  - domain/investigation/investigation
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - constraints/in-progress-is-a-lease-not-domain-state
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
  - scenarios/investigation/no-ticket-reference-never-repeats
sources:
  - intake/scope.md
---

## What it is

The diagnose payload shape — case, subject, narrative, requester, optional ticket_ref.
The window-dedup decision: return completed, join in-progress, or always start fresh when no ticket_ref travels.

## Notes

This is the piece the prior plan's diagnose-entry-point task left permanently BLOCKING; the specification now states where requester and ticket_ref come from, so nothing here is undecided.
UNDERDETERMINED, from the specification — criterion 3 requires a call whose key matches an in-progress lease to join it, but no criterion requires the in-progress marker specifically to be a lease holding only a key and an instant rather than some other mechanism achieving the same observable routing (an-investigation-is-idempotent-within-a-window's own statement already admits "in progress joins it" without dictating the storage shape). Passes: an implementation that persists a partial investigation record carrying a status field and lets a concurrent request join by reading it, rather than the existing key-and-instant lease store, while still satisfying every criterion above — which constraints/in-progress-is-a-lease-not-domain-state's own fitness clause refuses.
