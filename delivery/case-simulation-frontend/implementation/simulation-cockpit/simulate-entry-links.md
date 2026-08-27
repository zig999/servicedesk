---
title: Simulate entry links
summary: "Adds a 'Simulate' navigation Link to the version screen and to the Versions tab of the case screen, each targeting that exact version's own simulation cockpit route, unconditional of the version's draft or released state."
task: sha256:ffd8482b23aea50a7ae8ecff6d8e1f4dd53f02ef2e21a5e7aa47dbc6edfea0c5
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-simulate-entry-links-build
files:
- path: src/routes/case-version-editor-screen.tsx
  effect: "Renders a plain client-side Link, labeled 'Simulate', to '/cases/$slug/versions/$version/simulate' with this route's own slug/version params, placed above CaseVersionEditorReadyView in the 'ready' phase's return — rendered unconditionally of the loaded record's own draft/released state, so it appears identically whichever of the two the currently shown version is in."
- path: src/routes/case-detail-screen.tsx
  effect: "actionsForRow() now returns a wrapping div holding both the existing state-branched Link ('Continue editing' for draft, 'View' for released) and a second, unconditional Link labeled 'Simulate' to that same row's own '/cases/$slug/versions/$version/simulate', for every listed version regardless of its state."
criteria:
- criterion: 'The version screen shows a "Simulate" control that navigates to /cases/$slug/versions/$version/simulate for the version currently shown, in both draft and released state.'
  met: true
  how: "case-version-editor-screen.tsx's CaseVersionEditorScreen renders a Link to '/cases/$slug/versions/$version/simulate' with params={{ slug, version }} read from this same route's own useParams — placed outside any state-conditional branch (the only branches in this component are the phase union's loading/load-error/ready, never a draft/released split), so the control is present for the version currently shown whether its own state.state reads draft or released."
- criterion: 'The Versions tab of the case screen shows, for each listed version, a "Simulate" control that navigates to that version''s own /cases/$slug/versions/$version/simulate, in both draft and released state.'
  met: true
  how: "case-detail-screen.tsx's actionsForRow() now returns both the existing state-branched Link and a second, unconditional Link labeled 'Simulate', to '/cases/$slug/versions/$version/simulate' with params={{ slug, version: row.version }} read from that row's own listed version — rendered once per row regardless of row.state, so every listed version's own row carries a Simulate control targeting that same version's own route, whether draft or released."
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
  - src/routes/case-detail-screen.tsx
  how: "This contract's own description states the curator's entry is 'open to a case version in either state — draft or released'. Both new Links are unconditional of the loaded/listed version's own state, so a curator reaches the same contract's route (already registered by task/simulation-cockpit/case-simulation-route) from either screen for a version in either state, with no gate this task adds narrowing that reach."
- node: domain/knowledge/case-version-state
  how: "This enumeration's two values (draft, released) are what 'in both draft and released state' names in both criteria. Neither new Link branches on state at all — case-version-editor-screen.tsx's Link sits outside any state check, and case-detail-screen.tsx's new Link sits beside, not inside, the pre-existing draft/released ternary that already exhausts this enumeration for the unrelated Continue-editing/View label. The node is honored rather than newly encoded: no fact of the enumeration itself reaches either file through this task, since the control this task adds is the one thing here defined not to vary by state."
inferences:
- inferred: "Both new Links are plain @tanstack/react-router Link elements, never a Button wrapping a Link."
  from: "case-simulation-header.tsx's own header comment states this exact convention for a navigation action in this area ('matching case-detail-screen.tsx's and case-attributes-tab.tsx's own convention ... never a Button wrapping a Link, which this area's own inventory does not establish anywhere'), and the inventory's own conventions entry for a routed detail screen names the same triad this task extends rather than a new interaction pattern."
- inferred: "In case-version-editor-screen.tsx, the Simulate Link is placed once, above CaseVersionEditorReadyView, rather than inside that ready-view component alongside the Release/Discard controls."
  from: "case-version-editor-ready-view.tsx's own header comment describes every control it renders as gated by the loaded record's own state (canRelease, canDiscard, isReadOnly) or by which call site supplied the hook; the Simulate control is the one action this task adds that is deliberately state-invariant, so it is placed in the route-level screen component (which already reads slug/version directly from this route's own params) rather than threaded through that ready-view's props for a control that view's own gating conventions do not apply to."
- inferred: "In case-detail-screen.tsx, the two Links in one row's actions cell are wrapped in a 'flex items-center gap-4' div."
  from: "case-simulation-header.tsx's own action row (its 'Edit version' / 'Manifest' Links beside its 'Simulate case' Button) uses the identical className for the same purpose — laying out more than one action together — and no other multi-action cell convention exists elsewhere in this area's inventory to diverge from."
preserved:
- "case-detail-screen.tsx's existing 'Continue editing' (draft) / 'View' (released) Link, its own label and its own href, exactly as task/version-editor/view-released-version-read-only left it — the new Simulate Link is additive within the same cell, not a replacement of either branch."
- "case-version-editor-screen.tsx's existing loading/load-error branches and its delegation of the 'ready' phase to CaseVersionEditorReadyView, unchanged — the new Link is inserted only into the 'ready' phase's own returned markup."
- "The '/cases/$slug/versions/$version/simulate' route registration and its 'Simulate' entry in app-shell.tsx's ROUTE_LABELS, both already delivered by task/simulation-cockpit/case-simulation-route — neither file is touched by this task."
---

## What it is

The two entry points the scope's "Route and entry (6.1)" section names: a "Simulate" Link on the version screen (case-version-editor-screen.tsx) and a second one in each row of the case screen's Versions tab (case-detail-screen.tsx), both targeting that exact version's own /cases/$slug/versions/$version/simulate, for a version in draft or released state alike.

## Notes

No divergence from the project's standard was needed for either file: both additions are markup-only (a Link, a wrapping div, one new import), touch no business logic, and stay well under MNT-01's three-hundred-line ceiling for either file. No build or test run accompanies this record — this delivery has no shell, and the caller runs the registry's own steps (typecheck, lint, style, build, a11y, secret-scan) before recording it as the run this implementation's own `run` field would otherwise name.

An existing sibling test, case-detail-screen-view-released-action.spec.ts, asserts "Exactly one action link on this row — never both" for a draft row; that assertion is exactly what this task's own criterion 2 changes (a draft row now also carries the new Simulate Link), so that test is expected to need updating by the test-authoring pass rather than by this record — no test file was touched here, per this agent's own contract.
