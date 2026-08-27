---
implementation: sha256:edd113609d03d91006ba2a758d88e91e6f87751feea452429fa577b72b5b4236
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-simulate-entry-links-suite-2
title: Simulate entry links — proof
summary: Tests that the version screen and the case screen's Versions tab each show an unconditional Simulate
  control navigating to that exact version's own simulation route, in both draft and released state.
tests:
- file: src/routes/case-detail-screen-view-released-action.spec.ts
  name: renders Continue editing and Simulate on a draft version's row, never a View action
  proves: The Versions tab of the case screen shows, for each listed version, a "Simulate" control that
    navigates to that version's own /cases/$slug/versions/$version/simulate, in both draft and released
    state. (draft half, updated from the pre-existing test that proved the old single-action shape.)
  fails_when: a draft row stops rendering Simulate, renders View instead of (or in addition to) Continue
    editing, or carries any count of action links other than exactly two
- file: src/routes/case-detail-screen-simulate-action.spec.ts
  name: renders a Simulate link on a draft version's row, targeting that row's own simulate route
  proves: The Versions tab's Simulate control targets that version's own /cases/$slug/versions/$version/simulate,
    in draft state.
  fails_when: the draft row's Simulate link is absent or its href is anything other than /cases/some-slug/versions/3/simulate
- file: src/routes/case-detail-screen-simulate-action.spec.ts
  name: renders a Simulate link on a released version's row, targeting that row's own simulate route
  proves: The same criterion, in released state.
  fails_when: the released row's Simulate link is absent or its href is anything other than /cases/some-slug/versions/5/simulate
- file: src/routes/case-detail-screen-simulate-action.spec.ts
  name: targets each row's own version number, never one row's version repeated on another
  proves: the criterion's own "for each listed version" / "that version's own" route wording, across a
    mixed draft+released list
  fails_when: either row's Simulate href names the other row's version number, or any row's own version
- file: src/routes/case-detail-screen-simulate-action.spec.ts
  name: exposes Simulate only as a link, never additionally as a button
  proves: the implementation record's own inference that both new Links are plain @tanstack/react-router
    Link elements, never a Button wrapping a Link
  fails_when: a Button (or an asChild-wrapping Button leaving its own button role) surfaces around the
    Simulate control's label
- file: src/routes/case-detail-screen-simulate-action.spec.ts
  name: navigates to that version's own simulation cockpit route, issuing no request beyond the versions-list
    load already made
  proves: the "navigates to" half of criterion 2 as an actual behavior, not merely a computed href
  fails_when: clicking Simulate does not reach the destination route, or triggers any fetch beyond the
    one that already loaded the row
- file: src/routes/case-version-editor-screen-simulate-entry.spec.ts
  name: renders a Simulate link targeting this same version's own simulate route when the loaded version
    is a draft
  proves: The version screen shows a "Simulate" control that navigates to /cases/$slug/versions/$version/simulate
    for the version currently shown, in draft state.
  fails_when: the link is absent, or its href is anything other than /cases/some-slug/versions/3/simulate,
    while the loaded record is a draft
- file: src/routes/case-version-editor-screen-simulate-entry.spec.ts
  name: renders a Simulate link targeting this same version's own simulate route when the loaded version
    is released
  proves: The same criterion, in released state.
  fails_when: the link is absent, or its href differs, while the loaded record's own state is released
- file: src/routes/case-version-editor-screen-simulate-entry.spec.ts
  name: exposes Simulate only as a link, never additionally as a button
  proves: the same plain-Link, never-a-Button inference, for the version screen's own Simulate control
  fails_when: a button role carrying the Simulate label appears alongside the link
- file: src/routes/case-version-editor-screen-simulate-entry.spec.ts
  name: navigates to this version's own simulation cockpit route, issuing no further request
  proves: the "navigates to" half of criterion 1 as an actual behavior
  fails_when: clicking Simulate does not reach the destination route, or triggers any further fetch beyond
    the four the initial load already made
not_applicable:
- edge_case: Simulate control on an empty Versions-tab list
  why: no row exists for the control to sit on when the case holds no version; this task adds no new behavior
    to the existing empty-state rendering, and the pre-existing empty-state test is untouched and unaffected
- edge_case: Simulate control while the versions-list request has failed
  why: the table (and every row action, Simulate included) never renders on that path; this task adds
    no new failure-handling behavior, and the pre-existing failure-state test is untouched and unaffected
- edge_case: Simulate control during the version screen's loading/load-error phases
  why: criterion 1 speaks of "the version currently shown" -- before the ready phase, no version is shown
    yet, and the implementation places the Link only in the ready phase's own return, so there is nothing
    to observe on those two branches
- edge_case: two concurrent clicks on one Simulate control (a raced double-navigation)
  why: a plain client-side Link performs a read-only route change, not a write; no bound node states any
    guarantee about a raced double-click, and asserting one would assert a guarantee nobody made
untested:
- Whether the version screen's Simulate control keeps rendering unconditionally through the isBlocked/conflict
  UI states (mid-save, or after a 409 conflict) is unproven -- only the draft/released split the criterion
  itself names was exercised, though the implementation record's own inference (placed outside every phase-conditional
  branch) reaches further than that.
- 'The exact wrapping markup of case-detail-screen.tsx''s two-Link actions cell (the ''flex items-center
  gap-4'' div, and the Simulate Link''s own DOM position relative to the pre-existing action) is not independently
  asserted: a test pinned to that wrapper''s class or DOM order would bind implementation shape rather
  than observable behavior, so this inference is proven only through the observable link count and hrefs,
  not through the wrapper itself.'
---

## What it is

Ten tests across three spec files, proving both entry points named by the scope's "Route and entry (6.1)" section: a Simulate control on the version screen and on each row of the case screen's Versions tab, navigating to that exact version's own simulation route in draft or released state alike, exposed only as a plain link never a button.

## Notes

The suite's first run failed lint: two testing-library/prefer-find-by violations (a waitFor+getByText pair, fixed by using screen.findByText directly, Testing Library's own preferred idiom for this exact pattern). One pre-existing sibling test (case-detail-screen-view-released-action.spec.ts's own "exactly one action link" assertion on a draft row) was updated to expect the new two-link shape this task's own criterion 2 correctly introduces, without weakening what it originally proved about the state-branched action itself. run/simulation-cockpit-simulate-entry-links-suite-2 is the resulting clean run.