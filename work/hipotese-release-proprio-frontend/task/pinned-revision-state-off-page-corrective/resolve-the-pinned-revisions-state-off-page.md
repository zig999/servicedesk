---
title: Resolve a manifest entry's pinned-revision state even when it is off the default page
summary: Both manifest-presentation surfaces must state a pinned revision's own state whether or not that revision is on the default page its hypothesis's revisions listing answers.
rationale: Corrective increment for a defect a /review-change conformance pass found in already-delivered code -- the disclosure this rule requires is unconditional, and the delivered implementation silently drops it whenever the pinned revision is not on the unpaged default answer.
sources:
  - intake/pinned-revision-state-off-page-corrective.md
objective: A manifest entry states its pinned hypothesis-revision's own state (draft or released) whether or not that revision is present on the default page its hypothesis's revisions listing answered.
criteria:
  - On the version-manifest builder screen, a manifest row's pinned-revision-state badge states the pinned revision's own state whatever page of its hypothesis's revisions listing carries that revision -- including a hypothesis holding more revisions than the listing's own configured maximum page size.
  - On the case-version editor's released-view manifest table, an entry states its pinned revision's own state whatever page of its hypothesis's revisions listing carries that revision -- including a hypothesis holding more revisions than the listing's own configured maximum page size.
  - Where the pinned revision is present on the default page, the fact that a state is eventually shown for it is unchanged from before this fix; the entry's presentation while that read is incomplete is governed by the two criteria below, on the same terms whether the pin is on the default page or resolved by this task's own off-page path.
  - No entry states an incorrect or stale value in place of the once-missing one; whatever is shown is the pinned revision's own state as read from that revision itself, never defaulted or carried over from another entry.
  - While any read this presentation depends on to learn a pinned revision's own state has not yet completed -- whether that read is the hypothesis's default revisions listing or this task's own off-page resolution -- the entry states explicitly that this pin's state is still being read.
  - Where a read this presentation depends on to learn a pinned revision's own state fails -- whether that read is the default listing or this task's own off-page resolution -- the entry states explicitly that this pin's state could not be read.
  - The three presentations — a state read, a read still outstanding, a read that failed — are distinguishable from one another, and none of them is indistinguishable from an entry that carries no state at all.
implements:
  - rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  - constraints/listings-are-paged
---
## What it is

Both use-manifest-pinned-revision-states.ts and version-manifest-screen.tsx's RevisionSelect currently look the pinned revision up only in the unpaged first page their hypothesis's revisions listing answers, so a pin outside that page is silently unresolved and the state badge disappears.
The fix resolves the pinned revision's own state regardless of which page the default listing answered.

## Notes

REMAINDER, from the specification — constraints/listings-are-paged's clauses stating what the listing operation itself offers and carries (the offset/limit defaults, the answer's own offset/limit/page-count fields, and its fitness test) belong to the backend work that implements the published list operations of contracts/knowledge/case-query, not to this frontend presentation task.
ADVISORY, from the specification — the off-page resolution this task adds necessarily calls the same published list-hypothesis-revisions operation (contracts/knowledge/case-query) a second time with different parameters; that contract sits outside this epic's covers and is not named in this task's implements, though the fact it declares (what the operation may be asked and what it answers) is what makes the resolution possible.
Decision, beyond the covers — stand: contracts/knowledge/case-query declares the published operation this fix calls a second time, but this task states no new fact about that operation and implements nothing of its own against it -- it only reuses the call the delivered code already makes, with different parameters, so growing this epic's claim to a contract this task does not implement would be a claim the validator refuses for want of an implementing task.
