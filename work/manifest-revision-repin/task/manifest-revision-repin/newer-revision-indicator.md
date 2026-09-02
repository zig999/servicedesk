---
title: The newer-revision-available marker on a pinned row
summary: A visible marker on a manifest row whose pinned revision is below the highest the hypothesis's
  revisions listing answered.
rationale: Cut apart from the Select because a curator can be shown that a newer revision exists without
  any means of adopting it, and the marker changes for its own reason — what the row discloses, not what
  it lets a curator do. The scope stated the marker and its condition; that it is a deliverable of its
  own is decided here.
sources:
- intake/scope.md
objective: A manifest row whose pinned revision is not the highest revision its hypothesis holds carries
  a visible marker that a newer revision is available, readable before the row's Select is opened.
criteria:
- A row pinning revision 1 of a hypothesis whose revisions listing answered a highest revision of 2 shows
  the newer-revision marker.
- A row pinning the highest revision its revisions listing answered shows no marker.
- The marker is readable while the row's Select stands closed.
- The highest revision the marker is decided against is the one the revisions listing answered for that
  row's hypothesis, never the row's own pinned revision alone.
- A row whose revisions listing has not yet answered shows no marker.
implements:
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
---

## What it is
A marker beside the pinned revision on any row whose hypothesis has a higher-numbered revision than the one the manifest entry pins.
It is readable without opening the row's Select, so a stale pin is visible on the screen as it first loads.

## Notes
UNDERDETERMINED, from the specification — criteria 2 and 4 fix the marker's comparison basis at "the highest revision the revisions listing answered" without fixing which page of that listing was read; rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first guarantees the true highest only on the page at offset 0, so a read of any later page passes both criteria while showing no marker on a row that is in fact behind the hypothesis's true highest revision. Reading the listing at offset 0 for this comparison closes the gap.
UNDERDETERMINED, from the specification — no criterion bounds what the marker may offer; rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis requires a released row's marker to state existence alone and offer no adoption, and rules/knowledge/a-case-version-is-written-once forbids altering a released version's manifest entry at all, so a marker implemented as an actionable adopt affordance on a released row passes every criterion as written while offering what the specification refuses.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first's descending-order guarantee reaches no criterion here; this task consumes the listing's answer, it does not produce its order. Belongs: the task delivering the answer order of list-hypothesis-revisions in contracts/knowledge/case-query.
REMAINDER, from the specification — both clauses of rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown reach no criterion here; this task's criteria govern only the presence and readability of the newer-revision marker, not the pinned revision's own display. Belongs: the task presenting a manifest row's own pinned revision.
