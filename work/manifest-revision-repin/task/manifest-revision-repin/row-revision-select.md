---
title: The revision Select on the manifest row
summary: The Hypothesis cell's Select over that row's revisions, showing the pinned one and invoking the
  repin action on a different choice.
rationale: Cut as the consumer side of the repin seam, and separately from the newer-revision marker,
  because offering a choice and disclosing that a newer revision exists are two outcomes a curator can
  be shown one without the other. The scope stated the Select, its component and its wiring; the boundary
  between this cell and the write path is decided here.
sources:
- intake/scope.md
objective: The Hypothesis cell of each manifest row offers that row's hypothesis's revisions as a Select,
  and choosing a revision other than the pinned one repins that row.
criteria:
- The cell renders a Select holding one option per revision obtained for that row, each labelled by its
  revision number.
- The Select's value is the revision the row's manifest entry currently pins, shown before any choice
  is made.
- Choosing a revision other than the row's pinned revision invokes the repin action for that row with
  the chosen revision.
- Choosing the revision the row already pins issues no manifest request.
- The Select is disabled exactly when that row's existing move and remove actions are disabled.
- The Select is the shared @tui/ui/select component driven as a controlled component from the row's pinned
  revision, with no second select implementation added.
- Choosing a revision on one row leaves every other row's shown revision unchanged.
implements:
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
---

## What it is
The Hypothesis cell, today the fixed text "hypothesisName · rev N", rendering a Select over the revisions that row's hypothesis holds.
The pinned revision is the value shown closed, and a different choice reaches the repin action for that row alone.

## Notes
UNDERDETERMINED, from the specification — criterion 5 ties the Select's disabled state only to the row's existing move/remove actions, never to the case version's own draft/released state; rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis and rules/knowledge/a-case-version-is-written-once together mean a released row's entry may never be repinned, so an implementation enabling the Select on a released row's entry passes the criterion as written while offering an adoption the specification refuses.
UNDERDETERMINED, from the specification — criteria 1 and 2 leave the pinned revision unshown where it is absent from the revisions obtained for the row; rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown requires the entry to still state that pinned revision, so a Select whose options are exactly the answered page (with no injected option for an absent pin) passes both criteria as written while showing the row as pinning no revision, or the wrong one.
REMAINDER, from the specification — rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis's first clause, that a surface states a higher revision exists, reaches no criterion here; the Select's option list is not that statement. Belongs: the row-presentation task of this act, not the revision Select.
REMAINDER, from the specification — rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest reaches no criterion here and bounds this task's artifact negatively: the Select may not be where that statement lives. Belongs: the same row-presentation task that carries the latest/behind statement on the entry as presented.
ADVISORY, from the specification — criteria 3 and 4's "repin action for that row" and "manifest request" presuppose the write path contracts/knowledge/case-lifecycle's place-hypothesis answers to; this task only invokes that action rather than implementing the write path.
