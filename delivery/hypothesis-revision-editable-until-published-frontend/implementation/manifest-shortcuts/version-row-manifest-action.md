---
title: Manifest action on every Versions-panel row in case-detail-screen
summary: actionsForRow now renders a third per-row Link to that row's own manifest route, built from the
  same shared params object, for both draft and released rows.
task: sha256:1f39346b69e10307395cca11fd0748fad046ac5eb348a50ce0ed69bb9bcdef6a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-shortcuts-version-row-manifest-action-build
files:
- path: src/routes/case-detail-screen.tsx
  effect: actionsForRow now renders a third <Link to="/cases/$slug/versions/$version/manifest" params={params}>
    sibling to the existing Continue-editing/View and Simulate links, reusing the same params object those
    two already build and rendering unconditionally on version.state -- so a released row carries the
    Manifest action on the same terms as a draft row.
criteria:
- criterion: Every row the Versions panel renders carries a Manifest action alongside the actions it renders
    today.
  met: true
  how: 'The new Manifest <Link> sits outside the version.state ? ... : ... branch in actionsForRow, alongside
    the always-rendered Simulate link, so every row toRow builds a StatusTableRow for carries it.'
- criterion: A row's Manifest action targets the manifest route built from that row's own version number,
    and not from any other row's version number.
  met: true
  how: 'It uses params, the same { slug, version: String(version.version) } object actionsForRow builds
    from the row''s own CaseVersionListItem argument -- no other row''s data is in scope at that call.'
- criterion: A row whose version is released carries the Manifest action on the same terms as a row whose
    version is draft.
  met: true
  how: The Manifest <Link> is written after the draft/released conditional closes, so its rendering and
    its params do not depend on version.state at all -- draft and released rows reach the identical JSX
    line.
- criterion: The Manifest action is built from the same shared params object actionsForRow already builds
    for its existing per-row links, adding no second construction of those params.
  met: true
  how: 'The new <Link> reuses the params constant already declared at the top of actionsForRow (const
    params = { slug, version: String(version.version) }) -- no new object literal, no second read of version.version.'
- criterion: The Manifest action is rendered as a link, the same as the panel's existing per-row actions.
  met: true
  how: It is a <Link> from @tanstack/react-router, the same component the Continue-editing/View and Simulate
    actions already use -- no button, no anchor built by hand.
- criterion: The panel's existing Continue-editing, View and Simulate actions keep the route targets they
    have today.
  met: true
  how: Their <Link to=...> targets (/cases/$slug/versions/$version and /cases/$slug/versions/$version/simulate)
    and their params objects are untouched; the edit only appends a new sibling <Link> after the Simulate
    one.
nodes:
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: The rule requires that every version a versions listing presents carries a route to that version's
    own manifest, turning on nothing about the version's state. actionsForRow (called by toRow for every
    row useCaseVersions returns) now renders the Manifest link unconditionally on version.state, targeting
    /cases/$slug/versions/$version/manifest with that row's own params -- present for a draft row and
    a released row alike, and present on every render of the panel rather than gated behind any prior
    revise.
- node: domain/knowledge/case-version
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: The node states that a released version's own attributes and manifest entries stay exactly as they
    were at release, i.e. the version is closed to alteration, never to reading. The Manifest action added
    here is a navigation link only -- it issues no write, composes nothing, and reaches the version-manifest
    screen the same way for a released row as for a draft one, so it offers reading without touching the
    write-once/freeze boundary this node states.
inferences:
- inferred: The new action's visible label is the literal text "Manifest".
  from: Both implemented rules close with "which control carries the route, its wording and where it sits
    are form and belong to the interface, not here," so the specification states no wording; the inventory's
    own convention statement and the sibling per-row actions (Continue editing, View, Simulate) already
    name their destinations directly in the link text, so "Manifest" follows that same naming convention
    rather than inventing a different one.
- inferred: The Manifest link is placed as the last of the three actions, after Simulate, rather than
    first or between the existing two.
  from: No node or criterion orders the actions; the inventory records actionsForRow's existing shared-params
    convention but not an ordering rule, so placement is form left to the interface per both implemented
    rules' closing sentence. Appending it after the existing two is the minimal edit -- it adds a sibling
    without touching the position or JSX of Continue-editing/View or Simulate, keeping criterion 6 (their
    targets are kept) trivially true by construction rather than by re-verifying an untouched ordering.
preserved:
- The Continue-editing/View draft-vs-released conditional and its route target (/cases/$slug/versions/$version)
  are untouched.
- The Simulate link and its route target (/cases/$slug/versions/$version/simulate) are untouched.
- 'The shared params object''s construction (const params = { slug, version: String(version.version) })
  is untouched -- reused, not rebuilt.'
- toRow, VersionsPanel, CaseDetailScreen, the CASE_VERSIONS_COLUMNS and STATE_CELL tables, and every import
  are untouched.
deferred:
- what: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move (the completed-revise
    offer to the draft manifest, conditioned on whether a pin must move).
  why: The task's own Notes record this as REMAINDER -- the rule conditions what a completed revise offers
    over the case's draft version alone, a different surface from this panel's standing per-row route,
    and this task's implements list does not name it. It belongs to the task delivering the revise-hypothesis
    completion surface.
---

## What it is
Every row of the case-detail screen's Versions panel now carries a "Manifest" link to that row's own case version's manifest, built from the same shared params object the existing per-row actions already build, unconditionally on the version's state.

## Notes
None.
