---
title: Show each listed revision's own state
summary: The revisions listing reads and renders the state field the listing response now carries.
rationale: I folded widening the listing hook's typed shape into the screen that renders it rather than cutting a separate data task, because the shape's only new consumer is that screen and the widening has no falsifiable outcome of its own; the counting consumer named in the inventory gets a criterion here instead of a task.
sources:
  - intake/scope.md
objective: The hypothesis-revisions listing screen states, for every revision it lists, that revision's own state, draft or released, read from the listing response.
criteria:
  - The typed page shape the revisions listing hook answers carries a per-revision own-state field whose value is draft or released and nothing else.
  - Every row the revision-history screen renders states the own state of the revision on that row.
  - A revision the listing answers as draft renders as draft and a revision it answers as released renders as released.
  - A row states its revision's own state and the case's current-pin indication as two separate facts, so a row can read released and not-current at the same time.
  - The revision numbers, criteria and collects each row already showed are unchanged, and the rows stay ordered highest revision first.
  - The hypotheses tab's per-hypothesis revision count still reads the listing's own total after the shape widens.
implements:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/hypothesis-revision-state
  - rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  - rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  - constraints/listings-are-paged
---
## What it is

The listing hook's item type gains the revision's own state and the history screen renders it.
The existing current/frozen pin badge stays what it is, beside the new fact rather than in place of it.

## Notes

The inventory names the shared queryOptions builder consumed by both the history screen and the hypotheses tab's count fetch; widening the item type reaches both, and only the history screen renders the new field.
UNDERDETERMINED, from the specification — constraints/no-route-enforces-authentication states that the frontend discloses its no-authentication posture to every user, on every screen; no criterion of this task holds the revision-history screen to that disclosure, so a rewrite that loses or omits it still passes every stated criterion.
