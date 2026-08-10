---
title: The idempotency key is keyed on the subject's whole attribute-value set
summary: The idempotency key is computed over the subject's whole attribute-value set, case and ticket reference, replacing the prior bare subject id.
objective: The idempotency key function produces the same key for two requests sharing subject type, the whole attribute-value set, case and ticket reference, and a different key when any of those differs.
criteria:
  - Two requests with identical subject type, identical whole attribute-value set, case and ticket reference produce the same key.
  - A request whose attribute-value set differs from another's, even sharing the same subject type and case, produces a different key.
  - The key module's own documentation states why the subject's type and attribute-value set now compose the key, replacing the earlier two-flat-strings reasoning.
depends_on:
  - task/subject-identity-rework/subject-value-object
rationale: The key computation changes for its own reason — what identifies a repeated request — independent of the port and factory tasks, and stays independently demonstrable against fixture subjects without either of them.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
  - domain/glossary/subject-type
  - rules/investigation/an-investigation-is-idempotent-within-a-window
sources:
  - intake/scope.md
---

## What it is

idempotency-key.ts's key composition, rebuilt over the subject's whole attribute-value set instead of a bare id, with its own documented reasoning revisited to match.

## Notes

UNDERDETERMINED, from the specification — a key function that hashes only the subject's attribute-value set, omitting subject type, case and ticket reference from the composition entirely, satisfies both stated criteria as literally written: criterion 1 holds all four inputs identical, so any hash of the shared attribute set matches, and criterion 2 varies only the attribute-value set while holding type and case fixed, so a hash keyed on attributes alone still differs. Nothing in the two criteria forces subject type, case or ticket reference to individually gate the key, yet an-investigation-is-idempotent-within-a-window's statement requires a match only when subject type, the whole attribute-value set, case and the ticket reference all repeat. Passes: a key function computed solely from the subject's whole attribute-value set, ignoring subject type, case and ticket reference as inputs.
REMAINDER, from the specification — the clause "completed returns it, in progress joins it, and neither starts another" of an-investigation-is-idempotent-within-a-window's statement is not reached by this task's criteria, which test only the key function's equality/inequality property. Belongs to epic/diagnose-entry-point's window-dedup task (task/diagnose-entry-point/diagnose-payload-and-window-dedup).
REMAINDER, from the specification — the clause "a request carrying no ticket reference is never matched this way, and always starts its own investigation" of the same rule's statement is not reached by this task's criteria, which say nothing about the absence of a ticket reference. Belongs to epic/diagnose-entry-point's window-dedup task (task/diagnose-entry-point/diagnose-payload-and-window-dedup).
