---
title: A Manifest action on every row of the case-detail Versions panel
summary: Each case version the Versions panel lists carrying an action that reaches that version's own
  manifest.
rationale: Cut as its own task because it is falsifiable on the case-detail screen alone and would change
  for a different reason than the editing screen's shortcut -- the panel's per-row actions rather than
  what a revise offers; the criterion holding the action present for a released row as well as a draft
  row is this planning's own, read from the scope's "per row" and from the specification forbidding a
  released version's alteration rather than its reading.
sources:
- intake/scope-history-status-and-manifest-shortcuts.md
- intake/scope-history-status-and-manifest-shortcuts-narrowed.md
objective: Every row of the case-detail Versions panel offers an action reaching the manifest of that
  row's own case version.
criteria:
- Every row the Versions panel renders carries a Manifest action alongside the actions it renders today.
- A row's Manifest action targets the manifest route built from that row's own version number, and not
  from any other row's version number.
- A row whose version is released carries the Manifest action on the same terms as a row whose version
  is draft.
- The Manifest action is built from the same shared params object actionsForRow already builds for its
  existing per-row links, adding no second construction of those params.
- The Manifest action is rendered as a link, the same as the panel's existing per-row actions.
- The panel's existing Continue-editing, View and Simulate actions keep the route targets they have today.
implements:
- rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
- domain/knowledge/case-version
---

## What it is
A third per-row action in case-detail-screen.tsx's Versions panel, navigating to /cases/$slug/versions/$version/manifest for the version that row lists.
It adds no read: the rows already carry the version numbers the action's route needs.

## Notes
The survey reports case-detail-screen-simulate-action.spec.ts is the direct precedent for a per-row action test -- row-scoped link lookup, href assertion, and a link-not-button assertion.
The survey reports use-case-versions.ts already supplies the rows this panel renders, and no task here changes that read.
The survey reports the specification closes a released version to alteration and says nothing against reading its manifest, which is why a released row is not excluded here.

UNDERDETERMINED, from the specification — criterion 3's "on the same terms as a row whose version is draft" is satisfiable by wiring a released row's Manifest action to the same composing surface a draft row's opens, while rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest states a released version's manifest "is reached to be read and never to be altered" and domain/knowledge/case-version states a released version's manifest entries "stay exactly as they were at the moment of release"; no criterion here bounds the released row's action to reading.

REMAINDER, from the specification — rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move reaches no criterion of this task; its three clauses all condition what a completed revise offers over the case's draft version alone, and this task's per-row action is a standing route from a different surface that neither discharges nor violates that rule. This belongs to the task delivering the revise-hypothesis completion surface.

ADVISORY, from the specification — the disclosure log holds no entry locating the node this task's own manifest-route reading landed in; this is expected rather than an omission — the fact was found already stated in the intake material itself (scope-history-status-and-manifest-shortcuts.md items 2 and 3), so the decided-fact route's outcome was `stated`, which this framework's own procedure does not pair with a log entry (that entry is owed only where the outcome is `decided`).

ADVISORY, from the specification — criteria 4, 5 and 6 (reusing actionsForRow's shared params, rendering as a link, and the three existing actions keeping their targets) rest on no candidate node; both implemented rules close with "which control carries the route, its wording and where it sits are form and belong to the interface, not here." A delivery answering these three criteria answers the reference and the existing source, not the specification.
