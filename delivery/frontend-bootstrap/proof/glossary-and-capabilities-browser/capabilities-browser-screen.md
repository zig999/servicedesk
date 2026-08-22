---
title: Capabilities Browser screen proof
summary: Tests for capabilities-browser-screen.tsx and its use-capabilities.ts hook, covering the listing,
  the loading/error/empty states, the row-selection detail panel, every disclosed inference, and a repair
  of route-tree.spec.ts's own now-stale route-to-component mapping.
implementation: sha256:956751a6e12c3a171245d65991ec3f49c1f837ab37e6ffb971420fd900d80ae0
run: run/glossary-and-capabilities-browser-onda-6-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — listing (criterion 1) > renders one row per capability GET /v1/capabilities
    returns, each showing its own name, nature, connector, concept and timeout
  proves: Visiting /capabilities renders one row per capability GET /v1/capabilities returns, each row
    showing that capability's own name, nature, connector, concept and timeout.
  fails_when: a row is missing, duplicated, or any of its five column values is wrong, swapped between
    rows, or omitted
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — loading and load-error placeholders > shows a loading placeholder
    before GET /v1/capabilities responds
  proves: the screen's own loading state (an edge case the read raises — a dependency that has not yet
    answered)
  fails_when: the loading text is absent while the request is still pending, or a table renders before
    data arrives
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — loading and load-error placeholders > shows a generic load-failure
    message when GET /v1/capabilities fails, rather than routing through a specific per-error message
  proves: 'the disclosed inference: a load failure renders a plain generic-error message ("Capabilities
    could not be loaded.") rather than routing through error-ui-state.ts''s uiStateForApiError()'
  fails_when: the exact text "Capabilities could not be loaded." is not shown on a failed load, a different/specific
    message is shown instead, or a table renders anyway
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — empty state > renders an explicit empty-state message and no table
    when GET /v1/capabilities returns zero capabilities
  proves: the empty-collection edge case this read raises
  fails_when: the empty-state message is missing, or a table (even an empty one) renders instead
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — timeout and nature formatting (disclosed inferences) > renders a capability's
    timeout with an explicit ' ms' unit suffix rather than a bare number
  proves: 'the disclosed inference: a capability''s timeout renders with an explicit " ms" unit suffix
    rather than as a bare number'
  fails_when: the timeout cell shows the bare number (e.g. "250") instead of "250 ms"
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — timeout and nature formatting (disclosed inferences) > renders a capability's
    nature as plain text, never as a StatusTable {color,label} status cell
  proves: 'the disclosed inference: nature renders as plain text, never as a StatusTable {color,label}
    status cell'
  fails_when: the nature cell renders a {color,label}-shaped value, evidenced by an aria-hidden color-dot
    element appearing inside that cell
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen — no mutating controls (criterion 6) > renders no control that creates,
    edits or deletes a capability, or changes a capability's nature
  proves: No control on the screen creates, edits or deletes a capability, or changes a capability's nature.
  fails_when: any button beyond the row-selection buttons appears, a button named Create/Edit/Delete (case-insensitively)
    exists, or any textbox/combobox control is present
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: CapabilitiesBrowserScreen — before selection (criterion 2) > renders no capability's detail panel
    before any row is selected
  proves: Before any row is selected, the screen renders no capability's detail panel.
  fails_when: any element with an accessible-name-bearing region role renders on initial mount, before
    a row is clicked
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: CapabilitiesBrowserScreen — selecting a row (criterion 3) > renders a detail panel showing the
    clicked row's own version, input_schema and output_schema exactly as GET /v1/capabilities returned
    them
  proves: Clicking a capability's row renders a detail panel showing that same row's own version, input_schema
    and output_schema exactly as GET /v1/capabilities already returned them.
  fails_when: the panel is absent after a click, or shows a version/input_schema/output_schema other than
    the clicked capability's own
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: CapabilitiesBrowserScreen — selecting a different row (criterion 4) > swaps the detail panel to
    the newly clicked row's own version, input_schema and output_schema
  proves: Clicking a different row swaps the detail panel to that row's own version, input_schema and
    output_schema.
  fails_when: the previously selected row's own fields remain visible after a second row is clicked, the
    newly clicked row's fields fail to appear, or both panels coexist
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: CapabilitiesBrowserScreen — no second network read on selection (criterion 5) > issues no network
    request beyond the one GET /v1/capabilities call the table's own listing already made
  proves: Selecting a row issues no network request beyond the one GET /v1/capabilities call the table's
    own listing already made.
  fails_when: the mocked fetch is called more than once at mount or after either row click
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: CapabilitiesBrowserScreen — composite name::version selection key (disclosed inference) > disambiguates
    two capabilities sharing the same name by their own version, so selecting one never shows the other's
    own detail
  proves: 'the disclosed inference: a row''s own selection/identity key is the composite name::version,
    not name alone'
  fails_when: clicking the second of two same-named capabilities shows the first one's own version/input_schema/output_schema
    instead of its own
- file: src/routes/route-tree.spec.ts
  name: route-tree > renders the /capabilities route through CapabilitiesBrowserScreen (task/glossary-and-capabilities-browser/capabilities-browser-screen)
  proves: the route-tree.tsx wiring change this task's files list declares -- capabilitiesRoute's component
    now points at CapabilitiesBrowserScreen instead of CapabilitiesPlaceholder
  fails_when: the /capabilities route's own registered component is anything other than CapabilitiesBrowserScreen
not_applicable:
- edge_case: absent vs. empty operator-supplied input
  why: this screen takes no operator-supplied input at all (no search box, no route params, no form) --
    the only "empty" state its own read can raise is the zero-capabilities response already tested
- edge_case: a boundary at each end of a stated numeric range
  why: no criterion or field this screen shows (timeout included) carries a declared minimum or maximum
    for a boundary test to exercise
- edge_case: an operation attempted against a state that forbids it
  why: criterion 6 forbids every mutating operation outright -- there is no permitted operation whose
    forbidden-state variant exists to test
- edge_case: two operations against one subject at once
  why: the screen issues no mutation and holds no writable state a second concurrent operation could race
    against
untested:
- 'Reading a second page of GET /v1/capabilities: the implementation''s own disclosed deferral (useCapabilities()
  reads only the first page, mirroring both existing glossary hooks'' convention) is not exercised by
  any test here.'
---

## What it is
Thirteen tests across three spec files (two new, plus a repair to route-tree.spec.ts) proving the Capabilities Browser's listing, its loading/error/empty states, the row-selection detail panel, and every disclosed inference.

## Notes
route-tree.spec.ts's own EXPECTED_COMPONENT_BY_PATH still asserted "/capabilities": CapabilitiesPlaceholder, which the delivered route-tree.tsx made false; repaired the stale entry, its surrounding count/comment, and added a dedicated test asserting /capabilities now renders CapabilitiesBrowserScreen, mirroring this file's own established precedent for every prior placeholder-to-real-screen transition.
