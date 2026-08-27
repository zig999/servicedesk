---
title: Simulation route and header
summary: Registers the /cases/$slug/versions/$version/simulate route with a breadcrumb label and renders its header (identity, state pill, when_to_use, Edit version/Manifest links, and a caller-gated Simulate case control) over a new screen/ready-view/hook triad.
task: sha256:95277c511f8a9ce8a1a44b53b3b41010a5f1c996f778d89f360539971e30f184
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-case-simulation-route-build-3
files:
- path: src/routes/route-tree.tsx
  effect: registers a new leaf route at /cases/$slug/versions/$version/simulate, rendering CaseSimulationScreen, alongside the tree's other cases/$slug/versions/$version children
- path: src/shared/components/app-shell.tsx
  effect: adds a "Simulate" entry to ROUTE_LABELS for the new route's own id, so the breadcrumb shows that label instead of falling back to the raw pathname
- path: src/hooks/use-case-simulation-version.ts
  effect: new file - a phase-union hook (loading | load-error | ready) that reads GET /v1/cases/{slug}/versions/{version} under the same ["case-version", slug, version] query key use-edit-draft-version-form.ts and use-case-attributes-at-a-glance.ts already use, exposing the loaded CaseVersionRecord and its versionState
- path: src/routes/case-simulation-header.tsx
  effect: 'new file - CaseSimulationHeader: renders the version''s identity (slug · vN), a state pill (draft/released, bg-warning/bg-success), its when_to_use text, an "Edit version" link (branches by state), a "Manifest" link, and a "Simulate case" Button whose disabled state and click handler are both supplied by the caller'
- path: src/routes/case-simulation-ready-view.tsx
  effect: 'new file - CaseSimulationReadyView: the route''s own "ready"-phase markup, composing CaseSimulationHeader with a disabled, inert placeholder for canSimulate/onSimulateCase until sibling tasks (subject-derivation, use-simulate-case, screen-assembly) supply the real gate and dispatch'
- path: src/routes/case-simulation-screen.tsx
  effect: 'new file - CaseSimulationScreen: useParams against the new route, dispatches to useCaseSimulationVersion, renders the loading/load-error branches (EDG-01, EDG-02) and delegates the ready phase to CaseSimulationReadyView; wired into route-tree.tsx as the new route''s component'
criteria:
- criterion: route-tree.tsx declares the new leaf route and it resolves for both a draft and a released version's slug/version pair.
  met: true
  how: caseSimulationRoute is registered at path "/cases/$slug/versions/$version/simulate" and added to routeTree.addChildren([...]); the route is addressed purely by slug/version params, so it resolves identically regardless of the loaded version's own state, and the ready phase itself branches on state only for what it renders (the "Edit version" target and the pill), never for whether the route resolves
- criterion: ROUTE_LABELS carries an entry for the new route so the breadcrumb shows a readable label rather than falling back to the raw pathname.
  met: true
  how: app-shell.tsx's ROUTE_LABELS now carries "/cases/$slug/versions/$version/simulate" -> "Simulate", keyed by the route's own id exactly as every other entry in that table is
- criterion: The header shows the version's own state as a pill using the app's existing convention (draft = bg-warning, released = bg-success).
  met: true
  how: case-simulation-header.tsx's VERSION_STATE_CELL maps draft -> { color bg-warning, label "Draft" } and released -> { color bg-success, label "Released" }, rendered as a color dot plus its label text (ACC-08), matching case-detail-screen.tsx's own established STATE_CELL convention
- criterion: The header shows the version's when_to_use text.
  met: true
  how: CaseSimulationReadyView passes state.record.when_to_use (loaded by useCaseSimulationVersion's GET) through to CaseSimulationHeader's whenToUse prop, rendered as a quoted paragraph beneath the identity/state row
- criterion: The header's "Edit version" link targets the version screen directly when the version is draft, and targets creating a draft from this version (/cases/$slug/versions/new?sourceVersion=<n>) when the version is released.
  met: true
  how: 'case-simulation-header.tsx branches on versionState: draft renders a Link to "/cases/$slug/versions/$version" with this version''s own params; released renders a Link to "/cases/$slug/versions/new" with search={{ sourceVersion: version }} - the same route-tree.tsx search schema and case-attributes-tab.tsx convention already establish for this exact action'
- criterion: The header's "Manifest" link targets the existing manifest screen for that version.
  met: true
  how: case-simulation-header.tsx renders a Link to "/cases/$slug/versions/$version/manifest" with this version's own params, unconditional of state
- criterion: A "Simulate case" control is present in the header, and its enabled/disabled state is driven by a prop the header itself does not compute.
  met: true
  how: case-simulation-header.tsx renders a Button whose disabled attribute reads !canSimulate directly, and whose onClick reads onSimulateCase directly - both are required props CaseSimulationHeaderProps declares; the header contains no computation of either. CaseSimulationReadyView supplies canSimulate={false} and an inert onSimulateCase placeholder today, since no subject-derivation or dispatch hook exists in this tree yet (both belong to sibling tasks this one does not depend on) - screen-assembly is the task that replaces both with the real values, per this task's own inference below
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/route-tree.tsx
  - src/routes/case-simulation-header.tsx
  how: the new route is this contract's own curator entry point, open on a version in either draft or released state (contract's own description) - nothing in route-tree.tsx or the loading hook restricts the route by state. The header's "Simulate case" control is the one control this contract's simulate-case operation is dispatched from, though this task builds only the control (disabled, its dispatch not implemented) and not the dispatch itself, which belongs to task/simulation-cockpit/use-simulate-case and task/simulation-cockpit/screen-assembly
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-case-simulation-version.ts
  - src/routes/case-simulation-header.tsx
  how: the loaded version is read through this contract's own read side (the same GET .../versions/{version} the Version Editor and Case Detail already use); the header's "Edit version" link targets this contract's own update-draft screen for a draft, and its own create-draft screen (seeded via sourceVersion) for a released version, matching the contract's own description that release starts the next draft rather than merging into a released one
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-case-simulation-version.ts
  - src/routes/case-simulation-header.tsx
  how: useCaseSimulationVersion reads this aggregate's own read-back shape (CaseVersionRecord); the header renders exactly the identity (slug · vN) and when_to_use attributes this task's own objective names - title is not rendered, since neither the task's own criteria nor the wireframe's header row names it (this task's own inference, below)
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/routes/case-simulation-header.tsx
  how: this enumeration's exact two values (draft, released) drive VERSION_STATE_CELL's own exhaustive mapping and the "Edit version" link's own two-branch target selection, both switching on nothing else
inferences:
- inferred: case-simulation-ready-view.tsx wires CaseSimulationHeader's canSimulate to a literal false and onSimulateCase to an inert no-op, rather than a computed readiness gate or a real dispatch.
  from: no subject-derivation hook (task/subject-derivation/subject-panel) or simulate-case dispatch hook (task/simulation-cockpit/use-simulate-case) exists in this tree yet - both are sibling tasks this one does not depend on - and task/simulation-cockpit/screen-assembly (which depends on this task, use-simulate-case and subject-panel together) is the task that replaces this placeholder with the real gate and dispatch
- inferred: the header's state-pill table (VERSION_STATE_CELL) is declared locally in case-simulation-header.tsx rather than imported from case-detail-screen.tsx.
  from: case-detail-screen.tsx's own STATE_CELL is declared locally and unexported, and that file sits outside this task's own reach (touching it would widen the task) - the same color convention is followed rather than a second, divergent one invented
- inferred: the header omits the version's title, rendering only slug/version/state/when_to_use.
  from: layout/simulation-screen.md's own header row shows only "<slug> · v<version>  ● draft" and "<when_to_use>", not a title; this task's own criteria likewise name only identity, state and when_to_use
- inferred: useCaseSimulationVersion's load-error phase offers a generic message and retry with no case-not-found navigate-away branch (unlike use-edit-draft-version-form.ts's own hook).
  from: EDG-02 requires an explicit retry rather than any particular navigation, and no criterion of this task asks for navigate-away behavior; adding it would be inventing surface this task's own objective does not call for
- inferred: '"Edit version" and "Manifest" render as plain client-side Links, never a Button wrapping a Link.'
  from: case-detail-screen.tsx's and case-attributes-tab.tsx's own established convention for a navigation action in this area - no Button-wrapped-Link pattern exists anywhere the inventory surveyed
- inferred: useCaseSimulationVersion keys its query ["case-version", slug, version], identical to use-edit-draft-version-form.ts's and use-case-attributes-at-a-glance.ts's own key for the same GET.
  from: STA-01 (server data read from the cache, never copied into a second store) and the inventory's own convention entries for both of those existing hooks reading the identical endpoint
preserved:
- The thirteen existing routes in route-tree.tsx and their ROUTE_LABELS entries, unchanged - only appended to.
- 'The ["case-version", slug, version] query cache use-edit-draft-version-form.ts and use-case-attributes-at-a-glance.ts already populate and read: useCaseSimulationVersion reads under the identical key and shape (CaseVersionRecord) rather than a second, divergent one.'
deferred:
- what: A shared, exported state-pill helper (color/label per CaseVersionState) that both case-detail-screen.tsx and case-simulation-header.tsx could import.
  why: case-detail-screen.tsx's own STATE_CELL is local and unexported today; extracting it would mean modifying a file outside this task's own reach, widening the task beyond the route and the header
- what: Computing the header's real "Simulate case" enabled state (from subject readiness and dispatch-in-flight) and its real dispatch.
  why: belongs to task/simulation-cockpit/screen-assembly, whose own criteria state this gating explicitly and which depends on this task, use-simulate-case and subject-panel together
- what: The "Simulate" entry controls on the version screen and the Case Detail Versions tab that navigate into this route.
  why: belongs to task/simulation-cockpit/simulate-entry-links, a sibling task that depends on this one
- what: The subject, hypotheses, detail and case-result regions of the cockpit.
  why: belong to their own sibling tasks (subject-panel, hypotheses-table, detail-panel, case-result-panel) and to screen-assembly, which composes them onto case-simulation-ready-view.tsx once each exists
---

## What it is

The header region of the layout's wireframe, and the route/label registration every new leaf route in this app needs.
A phase-union hook (loading | load-error | ready) loads the version by slug/version, and a ready-view composes the header with a placeholder Simulate-case gate that screen-assembly later replaces.

## Notes

Two build attempts preceded the passing one, each kept under its own run directory rather than overwritten: -build (typecheck failed: `frontend/tui`, the vendored TUI submodule, was never checked out in this worktree at all -- `git submodule status` showed it uninitialized -- resolved by `git submodule update --init frontend/tui`, restoring the already-pinned commit `.gitmodules` names, outside this delivery's manifest and confirmed to leave the tracked tree clean); -build-2 (typecheck still failed, now on every module TUI's own components import through Node's directory-walking resolution -- clsx, tailwind-merge, react, @radix-ui/*, lucide-react -- because `frontend/tui/frontend/node_modules` did not exist; resolved by `npm ci` run directly inside `frontend/tui/frontend` against its own already-committed package-lock.json, mirroring the precedent this same gap hit and disclosed in `implementation/case-authoring-console/build-substrate.md`'s own Notes, where it was likewise run outside the runner since TUI is a standalone package per its own CLAUDE.md and not a workspace member of this manifest). Both were one-time environment restorations of already-pinned, already-committed state -- no package version was chosen and nothing was added to any manifest this delivery owns.
