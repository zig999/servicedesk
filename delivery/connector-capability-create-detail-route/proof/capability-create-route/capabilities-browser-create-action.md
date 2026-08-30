---
title: "Proof for the capabilities browser's create action"
summary: "Vitest coverage for CapabilitiesBrowserScreen's \"New capability\" navigation to /capabilities/new, its dialog-free interaction, the removed form-target state's behavioral fingerprint, the action's persistence across loading, failed and empty list states, and the row-click navigation to a capability's own detail route."
implementation: sha256:2e6eafbd37dedc541a6b3ae4f64e1f6ee06b17b966e37485e50dc4813bedd70c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-capabilities-browser-create-action-suite-3
tests:
  - file: "src/routes/capabilities-browser-screen-detail.spec.ts"
    name: "CapabilitiesBrowserScreen — \"New capability\" navigates to the create route (criterion 1) > navigates to /capabilities/new when New capability is clicked"
    proves: "Criterion 1 — activating \"New capability\" on the capabilities browser navigates to the create route."
    fails_when: "Clicking \"New capability\" no longer changes the router location to /capabilities/new — it stays put, goes elsewhere, or the click stops doing anything."
  - file: "src/routes/capabilities-browser-screen-detail.spec.ts"
    name: "CapabilitiesBrowserScreen — \"New capability\" opens no dialog (criteria 2 and 3) > opens no dialog when New capability is clicked, either immediately or once the navigation it triggers has resolved"
    proves: "Criterion 2 — activating \"New capability\" opens no dialog over the capabilities browser — and criterion 3 — the screen holds no create/edit form-target state of its own — exercised together behaviorally, as the absence of any dialog at every point of the interaction, since a form-target state's only observable purpose was ever to host that dialog."
    fails_when: "A role=\"dialog\" element appears at any point of the interaction — immediately after the click, or once the navigation the click triggered has actually resolved."
  - file: "src/routes/capabilities-browser-screen-capability-form-schema.spec.ts"
    name: "CapabilitiesBrowserScreen — the New capability action while the list is loading (criterion 4) > renders New capability before GET /v1/capabilities responds"
    proves: "Criterion 4, loading-state fingerprint — the \"New capability\" action renders while the capability list is loading."
    fails_when: "The button is absent, disabled, or otherwise unreachable while GET /v1/capabilities is still pending."
  - file: "src/routes/capabilities-browser-screen-capability-form-save.spec.ts"
    name: "CapabilitiesBrowserScreen — the New capability action while the list has failed to load (criterion 4) > renders New capability when GET /v1/capabilities fails"
    proves: "Criterion 4, failed-load fingerprint — the \"New capability\" action renders while the capability list has failed to load."
    fails_when: "The button is absent, disabled, or otherwise unreachable once GET /v1/capabilities has failed."
  - file: "src/routes/capabilities-browser-screen.spec.ts"
    name: "CapabilitiesBrowserScreen — empty state > renders an explicit empty-state message and no table when GET /v1/capabilities returns zero capabilities, still offering the New capability action"
    proves: "Criterion 4, empty-list fingerprint — the \"New capability\" action renders while the capability list is empty. Pre-existing and unmodified by this task: its own prior delivery already established this fingerprint, and this task's own change (repointing only where the button leads) leaves the button's position and rendering condition untouched."
    fails_when: "The button is absent from the empty-state render, or the empty state itself stops rendering in favor of a loading or error placeholder."
  - file: "src/routes/capabilities-browser-screen-navigation.spec.ts"
    name: "CapabilitiesBrowserScreen -- a row click navigates to that capability's own detail route (criterion 2) > navigates to /capabilities/<name>/<version>, by both identity fields, when a row is clicked"
    proves: "Criterion 5 — clicking a row on the capabilities browser still navigates to that capability's own detail route. Pre-existing and unmodified by this task: handleRowClick is untouched, and this test already asserts exactly what criterion 5 restates."
    fails_when: "A row click stops navigating to /capabilities/$name/$version, or navigates using a name/version pair other than the clicked row's own."
not_applicable:
  - edge_case: "A rapid double-click of \"New capability\""
    why: "The button only ever calls a plain navigate() to a fixed path; this task removed the only state (formTarget) that a repeated click could once have raced against, and no criterion of this task states any behavior for repeated activation of a pure navigation control."
  - edge_case: "Two operations against one subject at once (e.g. clicking two different rows in quick succession)"
    why: "handleRowClick is unchanged by this task and only ever reads a plain navigate() call from the clicked row's own name and version; a race between two such calls is a router-level concern this task's criteria say nothing about, and handleRowClick's own behavior is not itself in scope here."
  - edge_case: "A row-click against an empty capability list"
    why: "StatusTable renders no row at all when the list is empty, so there is nothing to click; criterion 5's row-click behavior is exercised instead against a populated list, and the empty list's own rendering is covered separately under criterion 4."
  - edge_case: "A row whose name or version is not a string (handleRowClick's own type guard)"
    why: "handleRowClick, including its typeof guard, is untouched by this task; that guard was proven by the task that introduced row-click navigation (task/connector-capability-detail-editing/capability-detail-route), and none of this task's own criteria concern malformed row data."
untested:
  - "The beautify-then-minify-on-save transform this screen's own popup Dialog previously proved for the create path (capabilities-browser-screen-capability-form-schema.spec.ts's own prior delivery) is not independently re-proven anywhere after this task removes that path: the routed create screen's own equivalent PUT-body assertions (capability-create-screen-save.spec.ts) use schemas already given as minified JSON rather than typed as beautified text and minified on save."
  - "Both navigation tests in this proof (create-route and detail-route) mount a small, self-contained test router with a dummy leaf at the destination path rather than the real screen component. That the app's actual route tree resolves /capabilities/new to CapabilityCreateScreen is proven by the sibling task's own proof (capability-create-route/capability-create-screen.md, criterion 1) and by route-tree.spec.ts's own totality assertion, not restated here; the equivalent for /capabilities/$name/$version predates this task."
---

## What it is
Proves that the capabilities browser's "New capability" action now navigates to the routed create screen instead of opening the popup form dialog, that no dialog opens and no create/edit form-target state survives the change, that the action still renders across the list's loading, failed and empty states, and that row-click navigation to a capability's own detail route is untouched — the full suite (143 files, 991 tests) passes at run/capability-create-route-capabilities-browser-create-action-suite-3.

## Notes
The stale dialog-opening assertions the implementation record's own `deferred` section flagged (capabilities-browser-screen-detail.spec.ts, capabilities-browser-screen-capability-form-save.spec.ts, and their openFilledCreateDialog/openNewCapabilityDialog helpers) do not exist in the current tree: both files, and every sibling spec file this proof reads, already assert the post-change behavior (navigation, no dialog) rather than the retired dialog-opening one, and no reference to those two helper names remains anywhere under src. No new test was needed to close that gap, because it is already closed.

capability-form-dialog.tsx's own header comment ("capabilities-browser-screen.tsx renders this component only while a target is set") is still stale as of this reading: capabilities-browser-screen.tsx no longer renders CapabilityFormDialog at all, and a repository-wide search finds no other file rendering it either — it is currently unreferenced outside its own definition. This is a source-file comment, not a test, and out of scope for a test-author to correct; disclosed here rather than left for a reader to discover on their own.
