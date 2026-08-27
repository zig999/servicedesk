---
implementation: sha256:a9a38fe376e5bb370756f8984b4e30f166d3bdb0c4c7f07c59004a95a95755fa
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-case-simulation-route-suite-3
title: Simulation route and header — existing coverage verified complete
summary: All six named spec files already prove every criterion and every recorded inference of task/simulation-cockpit/case-simulation-route;
  no gap was found, so no new test was written.
tests:
- file: src/routes/route-tree.spec.ts
  name: registers a route at each of the sixteen proposal-plus-origination screens' paths, and no other
  proves: route-tree.tsx declares the new leaf route (criterion 1, first half) and route-tree.tsx's own
    thirteen pre-existing routes stay registered unchanged (preserved)
  fails_when: the new route is missing from router.routesById, or any pre-existing route's path is dropped
    or altered
- file: src/routes/route-tree.spec.ts
  name: assigns no two of the sixteen routes the same path
  proves: the new route's path does not collide with any pre-existing route's path
  fails_when: two registered routes share one fullPath
- file: src/routes/route-tree.spec.ts
  name: renders the /cases/$slug/versions/$version/simulate route through CaseSimulationScreen (task/simulation-cockpit/case-simulation-route,
    criterion 1)
  proves: criterion 1, second half — the new route is wired to CaseSimulationScreen as its component
  fails_when: the route's registered component is anything other than CaseSimulationScreen
- file: src/shared/components/app-shell.spec.ts
  name: shows the breadcrumb as 'Simulate' rather than falling back to the route's own resolved pathname
  proves: ROUTE_LABELS carries an entry for the new route so the breadcrumb shows a readable label rather
    than falling back to the raw pathname (criterion 2)
  fails_when: the breadcrumb shows the resolved pathname instead of "Simulate", or ROUTE_LABELS' new entry
    is removed or misspelled
- file: src/hooks/use-case-simulation-version.spec.ts
  name: reports the "loading" phase before the version resolves
  proves: the hook's loading phase, which the screen's EDG-01 branch depends on
  fails_when: the hook resolves synchronously or reports any other phase before the query settles
- file: src/hooks/use-case-simulation-version.spec.ts
  name: reports the "load-error" phase, with a retryLoad that reissues the request, when the read fails
  proves: the hook's load-error phase and its retry action, which the screen's EDG-02 branch depends on
  fails_when: a failed read does not surface phase "load-error", or retryLoad does not reissue the request
- file: src/hooks/use-case-simulation-version.spec.ts
  name: resolves to the ready phase carrying the loaded record and its own version state
  proves: the hook exposes the loaded CaseVersionRecord and its versionState, which the header's when_to_use
    and state-pill criteria (4, 3) read from
  fails_when: the ready phase omits or misreports record.when_to_use or versionState
- file: src/hooks/use-case-simulation-version.spec.ts
  name: resolves to the ready phase from an existing, fresh cache entry under that exact key, issuing
    no fetch of its own
  proves: the implementation's recorded inference — the hook keys its query ["case-version", slug, version],
    identical to use-edit-draft-version-form.ts's and use-case-attributes-at-a-glance.ts's own key
  fails_when: the hook issues its own fetch despite a fresh cache entry already present under that exact
    key, or reads under a different key
- file: src/routes/case-simulation-header.spec.ts
  name: shows the given slug and version as 'slug · vN'
  proves: the header renders the version's own identity, part of the task's objective
  fails_when: the identity string is missing, malformed, or does not reflect the given slug/version
- file: src/routes/case-simulation-header.spec.ts
  name: shows a draft version's state as 'Draft', paired with the app's own bg-warning convention
  proves: criterion 3, draft half — the state pill uses bg-warning for draft
  fails_when: a draft version's pill shows any color other than bg-warning, or omits the "Draft" text
- file: src/routes/case-simulation-header.spec.ts
  name: shows a released version's state as 'Released', paired with the app's own bg-success convention
  proves: criterion 3, released half — the state pill uses bg-success for released
  fails_when: a released version's pill shows any color other than bg-success, omits "Released", or still
    shows "Draft"
- file: src/routes/case-simulation-header.spec.ts
  name: shows the given whenToUse text
  proves: criterion 4 — the header shows the version's when_to_use text
  fails_when: the whenToUse text is missing or not rendered
- file: src/routes/case-simulation-header.spec.ts
  name: targets the version screen directly when the version is draft
  proves: criterion 5, draft half — Edit version targets the version screen directly for a draft
  fails_when: the Edit version link's href for a draft version is anything other than /cases/$slug/versions/$version
- file: src/routes/case-simulation-header.spec.ts
  name: targets creating a draft from this version, addressed by its own number, when the version is released
  proves: criterion 5, released half — Edit version targets /cases/$slug/versions/new?sourceVersion=<n>
    for a released version
  fails_when: the Edit version link for a released version does not point at /cases/$slug/versions/new
    with sourceVersion set to that version's own number
- file: src/routes/case-simulation-header.spec.ts
  name: targets the manifest screen for this version when the version is draft
  proves: criterion 6, draft half
  fails_when: the Manifest link's href for a draft version is not /cases/$slug/versions/$version/manifest
- file: src/routes/case-simulation-header.spec.ts
  name: targets the manifest screen for this version when the version is released, same as when it is
    draft
  proves: criterion 6, released half — the Manifest link is unconditional of state
  fails_when: the Manifest link's target changes for a released version
- file: src/routes/case-simulation-header.spec.ts
  name: exposes both as role "link", with no role "button" carrying either name
  proves: the implementation's recorded inference — Edit version and Manifest render as plain Links, never
    a Button wrapping a Link
  fails_when: either action renders as, or is wrapped by, a button rather than a plain link
- file: src/routes/case-simulation-header.spec.ts
  name: is disabled when the caller's canSimulate prop is false
  proves: criterion 7, first half — the Simulate case control's enabled/disabled state is driven by the
    canSimulate prop
  fails_when: the button is not disabled when canSimulate is false
- file: src/routes/case-simulation-header.spec.ts
  name: is enabled when the caller's canSimulate prop is true, rather than the header computing its own
    readiness
  proves: criterion 7, second half — the header does not compute its own readiness
  fails_when: the button stays disabled when canSimulate is true, or the header's own logic overrides
    the given prop
- file: src/routes/case-simulation-header.spec.ts
  name: calls exactly the caller's own onSimulateCase when clicked, rather than a handler the header computes
    itself
  proves: criterion 7, dispatch half — the control's click handler is the caller-supplied prop, not one
    the header computes
  fails_when: clicking the enabled button does not call the given onSimulateCase, or calls a different
    function
- file: src/routes/case-simulation-ready-view.spec.ts
  name: passes the loaded record's own when_to_use and the version's own state through to the header
  proves: CaseSimulationReadyView wires the loaded ready-phase state into CaseSimulationHeader's whenToUse
    and versionState props
  fails_when: the ready view stops forwarding the loaded record's when_to_use or the loaded versionState
    to the header
- file: src/routes/case-simulation-ready-view.spec.ts
  name: renders 'Simulate case' disabled, since no subject-readiness gate exists in this tree yet
  proves: the implementation's recorded inference — case-simulation-ready-view.tsx wires canSimulate to
    a literal false rather than a computed gate
  fails_when: the Simulate case control renders enabled from the ready view with no gate present
- file: src/routes/case-simulation-ready-view.spec.ts
  name: does not throw when the disabled Simulate case control is clicked, since its click handler is
    an inert placeholder
  proves: the implementation's recorded inference — onSimulateCase is wired to an inert no-op rather than
    a real dispatch
  fails_when: clicking the control throws, or attempts a real dispatch that has no backing implementation
- file: src/routes/case-simulation-ready-view.spec.ts
  name: never renders the loaded record's own title, only identity, state and when_to_use
  proves: the implementation's recorded inference — the header omits the version's title
  fails_when: the loaded record's title text appears anywhere in the rendered ready view
- file: src/routes/case-simulation-screen.spec.ts
  name: renders an explicit loading state before the version resolves
  proves: EDG-01 — the screen's own loading branch
  fails_when: the screen does not show the loading text before the query settles
- file: src/routes/case-simulation-screen.spec.ts
  name: degrades to a typed error state offering a retry that reissues the request, without navigating
    away from this route
  proves: EDG-02, and the implementation's recorded inference that load-error offers a generic message
    and retry with no navigate-away branch
  fails_when: the screen fails to show the generic error message and Retry control, the retry does not
    reissue the request, or the route navigates away on failure
- file: src/routes/case-simulation-screen.spec.ts
  name: renders the ready header for a draft version's own slug/version pair
  proves: criterion 1, draft half, end to end through the real router and hook — the route resolves and
    renders correctly for a draft version
  fails_when: the screen fails to reach the ready phase for a draft version, or the rendered identity/state/Edit-version
    target is wrong for that state
- file: src/routes/case-simulation-screen.spec.ts
  name: renders the ready header for a released version's own slug/version pair
  proves: criterion 1, released half, end to end through the real router and hook — the route resolves
    and renders correctly for a released version
  fails_when: the screen fails to reach the ready phase for a released version, or the rendered state/Edit-version
    target is wrong for that state
not_applicable:
- edge_case: a loaded record whose state field is absent/undefined (use-case-simulation-version.ts's own
    defensive throw at line 64-71)
  why: the file's own comment records this branch as structurally unreachable through the real GET this
    hook calls — every real response reports state — so a test would have to fabricate an input this hook
    can never actually receive, asserting a guarantee about dead defensive code rather than about behavior
- edge_case: a malformed :version route param (e.g. non-numeric)
  why: no criterion of this task addresses parsing or validating the version param, and the hook's load-error
    phase does not distinguish by cause — a network throw and a non-2xx response already take the identical
    isError branch (case-simulation-screen.spec.ts's own load-error test), so a malformed param would
    exercise that same already-proven branch and add no new assertion
- edge_case: two simulate-case dispatches, or two version loads, in flight at once
  why: this task ships no dispatch (onSimulateCase is an inert placeholder, per the implementation's own
    recorded inference) and no write operation of its own — the only network call is a single read the
    hook already de-duplicates through react-query's own cache, so there is no concurrent-write guarantee
    this task's own criteria make for a test to hold it to
- edge_case: an unknown/third CaseVersionState value reaching VERSION_STATE_CELL's lookup
  why: domain/knowledge/case-version-state's own enumeration is exactly {draft, released}, enforced by
    the TypeScript type at compile time — no runtime path in this tree can construct a third value to
    feed the header, so a test asserting a fallback for one would test an input the type system already
    refuses
untested:
- the implementation's recorded inference that VERSION_STATE_CELL is declared locally in case-simulation-header.tsx
  rather than imported from case-detail-screen.tsx — this is a source-organization choice with no independently
  observable behavior distinct from the pill's rendered color/label (already proven by case-simulation-header.spec.ts's
  two state-pill tests); a test cannot distinguish 'declared locally' from 'imported' without asserting
  an internal module reference, which the framework's own judgment excludes as binding the shape of the
  code rather than its behavior
---

## What it is

Twenty-eight tests across six spec files, already present before this proof pass and confirmed complete over every criterion, edge case and recorded inference of this task: the route's registration and wiring, the breadcrumb label, the version-load hook's loading/error/ready phases and cache key, the header's identity/state-pill/when_to_use/action-link rendering across both draft and released states, the ready view's wiring and its two placeholder inferences (canSimulate literal false, inert onSimulateCase), and the screen's loading/error/ready composition end to end.

## Notes

No new test was written — a test-author subagent reviewed all six files' existing coverage against the task's criteria, inferences and edge-case checklist and found no gap.
