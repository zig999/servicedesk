---
title: Show each manifest entry's pinned revision state
summary: The manifest presentation screen states, for every entry, the draft-or-released state of the hypothesis-revision that entry pins.
rationale: This fact was decided into the specification during this plan's own binding step, over the manifest-presentation surface rather than the release dialog or the revisions listing; no task the decomposition cut answers to it, so this task exists to close that gap.
sources:
  - intake/scope.md
objective: A case version's manifest presentation states, for every entry it shows, the draft-or-released state of the hypothesis-revision that entry pins.
criteria:
  - Every manifest entry any screen presenting a case version's manifest renders — the version-manifest screen and the case version editor's ready-view manifest table alike — states its pinned hypothesis-revision's own state, draft or released.
  - That statement is shown whatever the case version's own state is, draft or released.
  - That statement is shown without the curator having to open the entry's revision selector.
  - An entry pinning a revision in released state states released and an entry pinning one in draft state states draft.
  - The pinned revision number, and every other field the entry already showed, are unchanged.
depends_on:
  - task/hypothesis-revision-own-state-ui/show-each-revisions-own-state
implements:
  - rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
---
## What it is

One more fact rendered per manifest row, read from the same revision-state data the listing screen already reads.
It changes nothing about what placement or release do; it only tells the curator, on the manifest itself, what a refused release would otherwise be the only way to learn.

## Notes

None.
