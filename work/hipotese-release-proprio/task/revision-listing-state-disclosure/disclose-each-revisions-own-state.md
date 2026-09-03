---
title: State each listed revision's own state
summary: The hypothesis-revisions listing, answering the draft-or-released state of every revision it
  carries.
rationale: The planning kept the listing's item shape and every reader that answers with it in one task,
  because a field the listing's answer does not carry discloses nothing and the disclosure is the only
  outcome here to falsify.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: A listing of one hypothesis's revisions states, for every revision it answers, that revision's
  own state.
criteria:
- Every revision the listing answers carries its own state.
- A revision whose own stored state is released is answered as released.
- A revision whose own stored state is draft is answered as draft.
- The state a revision is answered with is read from that revision's own stored state and from no case
  version that references it.
- The listing answers a hypothesis's revisions ordered by revision number descending, highest first.
- The listing answers one page selected by the requested offset and limit, together with the total number
  of revisions that hypothesis holds.
depends_on:
- task/hypothesis-revision-own-state/store-the-revisions-own-state
implements:
- rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- contracts/knowledge/case-query
- constraints/listings-are-paged
---

## What it is

The listing a curator browses one hypothesis's revisions by, stating beside each whether it may still be edited in place or already stands immutable.
Two entries reading otherwise identically answer differently to a save, and the listing is where that difference becomes visible.

## Notes

UNDERDETERMINED, from the specification — criterion 6 reaches only part of what `constraints/listings-are-paged` states: the offset is optional and defaults to 0; the limit is optional, defaults to a configured default and is clamped to a configured maximum; and the answer carries the offset, the limit and the page count applied, not the data and the total alone. Nothing in the criteria excludes an implementation that drops all three. Passes every criterion as written while an implementation that requires offset and limit on every call, never clamps an over-limit request, and echoes back neither the applied offset/limit nor a page count would still violate the constraint.
REMAINDER, from the specification — `contracts/knowledge/case-query` declares five operations (read-case, list-cases, list-case-versions, list-hypotheses, list-hypothesis-revisions); this task's objective and criteria speak only of `list-hypothesis-revisions`. The other four belong to earlier increments that already delivered them.
ADVISORY, from the specification — criteria 2-4 turn on a hypothesis-revision holding a stored draft-or-released state of its own, governed by `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle` (outside this epic's covers) and written by `task/hypothesis-revision-own-state/store-the-revisions-own-state`, which this task already depends on. This task reads the field; it must not also decide or transition it.
Decision, beyond the covers — stand: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle is informational here, pointing at the dependency this task already declares rather than at a fact this task needs to implement itself.
