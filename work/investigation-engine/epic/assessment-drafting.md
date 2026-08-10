---
title: Assessment resolution and drafting
summary: Resolves the case's outcome over the completed evaluations and drafts the assessment's text from exactly the input that outcome admits.
rationale: Resolving-and-narrowing and drafting-the-text are cut apart because each changes for its own reason — the first only when the case-resolution reuse or the narrowing rule changes, the second only when the wording of the text itself does — even though the scope describes them together as one flow.
covers:
  - domain/investigation/assessment
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/knowledge/hypothesis
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/the-customer-sees-only-the-text
  - scenarios/knowledge/no-confirmation-falls-back
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - contracts/investigation/assessment-reviewed
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: rules/investigation/the-customer-sees-only-the-text
    why: This backend service returns the whole assessment to its caller, per contracts/investigation/diagnosis. What the presenting channel shows the end customer beyond that is outside a backend-only target.
  - node: contracts/investigation/assessment-reviewed
    why: The operator's later review is a separate capability arriving after this flow; nothing in this scope produces or consumes that event.
sources:
  - intake/scope.md
---

## What it is

The step that turns completed evaluations into the answer the requester acts on.
The outcome, referral and determining hypothesis always come from the case's own resolution, never from the text; the text is the only thing drafting produces, and it never sees more than the outcome admits.

## Notes

None.
