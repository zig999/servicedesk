---
title: Manifest action on every Versions-panel row — proof
summary: Proves the case-detail-screen Versions panel's per-row Manifest link exists for both draft and
  released rows, targets each row's own version, renders as a link, coexists with the existing actions
  in the inferred trailing position, navigates without an extra request, and -- for the underdetermined
  finding -- that a released row's Manifest action lands on a manifest whose entries cannot be moved or
  removed.
implementation: sha256:5ab9c826d3a337efa277e89aca36302448609f586b62eaef12fc8dcad64d3bda
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-shortcuts-version-row-manifest-action-suite
tests:
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: renders a Manifest link on a draft version's row, targeting that row's own manifest route
  proves: Criterion 1 (every row carries a Manifest action) and criterion 2 (targeted at that row's own
    version), for a draft row.
  fails_when: the draft row carries no Manifest link, or its href is not /cases/{slug}/versions/3/manifest.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: renders a Manifest link on a released version's row too, targeted at that row's own manifest route
    the same way a draft row's is
  proves: Criterion 1 for a released row, and criterion 3 (the Manifest action is present for a released
    row).
  fails_when: the released row carries no Manifest link, or its href is not /cases/{slug}/versions/5/manifest.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: targets each row's own version number, never one row's version repeated on another
  proves: Criterion 2, across a released row and a draft row with distinct version numbers in the same
    panel.
  fails_when: either row's Manifest href carries the other row's version number, or both hrefs collapse
    to the same version.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: exposes Manifest only as a link, never additionally as a button
  proves: Criterion 5 (rendered as a link, the same as the panel's existing per-row actions).
  fails_when: Manifest is rendered as a button, or as both a link and a button.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: renders Continue editing, Simulate and Manifest together on a draft row, replacing neither existing
    action
  proves: Criterion 1 (the Manifest action sits alongside the actions the panel renders today, rather
    than replacing one of them).
  fails_when: a draft row renders any link count other than exactly three, i.e. Manifest is missing, duplicated,
    or an existing action was dropped.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: orders a released row's actions as View, then Simulate, then Manifest, and a draft row's as Continue
    editing, then Simulate, then Manifest
  proves: The implementation record's own inference that Manifest is placed last, after Simulate, rather
    than first or between the existing two actions.
  fails_when: Manifest is rendered first or between Continue-editing/View and Simulate rather than after
    both.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: navigates to that version's own manifest route, issuing no request beyond the versions-list load
    already made
  proves: Clicking the Manifest link actually routes to the version's own manifest destination and triggers
    no additional network call on its own.
  fails_when: clicking Manifest fails to reach the manifest route's rendered content, or issues any fetch
    beyond the one versions-list load already made.
- file: frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  name: navigates a released row's Manifest link to a manifest whose entries cannot be moved or removed
  proves: The task's own UNDERDETERMINED finding -- that criterion 3, read literally, is satisfiable by
    wiring a released row's Manifest action to the same composing surface a draft row's opens with nothing
    bounding it to reading. This test proves that, in this composed system, following that same link for
    a released row still reaches a manifest where Remove and Move controls are disabled, so the composed
    behavior upholds the read-only constraint the specification states even though no criterion of this
    task states it.
  fails_when: an implementation wires the released row's Manifest action to a manifest surface whose Remove
    or Move controls remain enabled -- i.e. the exact implementation the underdetermined entry names,
    with nothing bounding the released row's action to reading.
- file: frontend/app/src/routes/case-detail-screen-view-released-action.spec.ts
  name: renders Continue editing and Simulate on a draft version's row, never a View action (existing
    test, its link-count assertion corrected from two to three)
  proves: Criterion 1 again, from a pre-existing assertion that this task's own addition of a third per-row
    link would otherwise falsify -- kept accurate rather than left stale and red.
  fails_when: the draft row's total link count is anything other than exactly three.
not_applicable:
- edge_case: A case with zero versions, so the Versions panel renders no rows and therefore no Manifest
    action.
  why: The empty-state rendering (an explicit sentence instead of the table) is untouched by this task
    and already covered by case-detail-screen.spec.ts; with no row there is no per-row action for this
    task's criteria to reach.
- edge_case: Rapid or repeated clicking of the Manifest link (a double-navigation race).
  why: The Manifest link is a plain declarative <Link>, the same construct the existing Simulate action
    already uses with no such test written for it either -- it triggers client-side routing only, with
    no network request or mutable state of its own for a repeated click to race against.
- edge_case: A version number requiring URL-encoding in the manifest route.
  why: version.version is always a plain number, and params builds it with String(version.version), the
    same conversion the existing Continue-editing/View and Simulate links already use -- there is no character
    in a numeric version that URL-encoding would ever change.
untested:
- 'Criterion 4 (the Manifest action reuses actionsForRow''s existing params object rather than constructing
  a second one) has no independent proof here: whether params is reused or freshly built with identical
  values produces the same href on the wire, so no DOM assertion can tell the two apart without inspecting
  the internal construction, which would bind the test to how the code is written rather than to what
  it renders. Nothing in this suite would fail if a future edit silently reconstructed the object.'
---

## What it is
Tests over the per-row Manifest action on the case-detail Versions panel: presence for draft and released rows, per-row targeting, rendering as a link, coexistence and ordering with the existing actions, navigation, and the composed read-only behavior for a released row.

## Notes
None.
