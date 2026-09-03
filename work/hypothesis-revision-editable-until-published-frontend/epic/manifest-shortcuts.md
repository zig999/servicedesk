---
title: Reaching a case version's manifest from where a curator already is
summary: The two navigation shortcuts into an existing case-version manifest screen -- one on the hypothesis-editing
  screen, one per row of the case-detail Versions panel.
rationale: The scope states two additions on two screens and no grouping, and they are cut under one epic
  because both are the same decision about how a curator reaches the manifest of one named case version
  through the route the tree already registers; the covers list is deliberately narrow -- the node stating
  when the revise screen offers a manifest route, and the case version whose own manifest each shortcut
  is keyed to -- because neither shortcut reads, writes or presents a manifest entry's content, and claiming
  the manifest-presentation nodes would claim work no task here does.
sources:
- intake/scope-history-status-and-manifest-shortcuts.md
- intake/scope-history-status-and-manifest-shortcuts-narrowed.md
covers:
- domain/knowledge/case-version
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
uncovered:
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  why: The frozen-versus-not-yet-frozen fact this rule turns on is what the scope's deferred item 1 would
    have disclosed on the hypothesis-editing screen, and the human's narrowing removed that item from
    this invocation because released_referenced is exposed by no DTO the frontend reads; no shortcut in
    this epic reads or shows that fact.
---

## What it is
One grouping for the two ways a curator reaches a case version's manifest without typing its URL: a control on the screen where a hypothesis revision is being edited, and an action on each row of the case's Versions panel.
Both reach the manifest of one already-identified case version and neither changes what that manifest screen shows or what may be composed there.

## Notes
The survey reports route-tree.tsx already registers /cases/$slug/versions/$version/manifest as VersionManifestScreen, so no task here adds a route.
The survey reports use-hypothesis-revision-form.ts already builds the navigate call to that route inside the save-success phase, and case-detail-screen.tsx's actionsForRow already builds one shared params object for its two existing per-row links.
The survey reports the released_referenced fact lives only in HighestRevisionReleaseState behind the revise operation and is serialized by neither read-case.dto.ts nor list-hypothesis-revisions.dto.ts.
The delivered task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind at this same work root already renders the post-save manifest-builder offer under the condition rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move states.
