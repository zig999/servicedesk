---
title: Case Detail version timeline
summary: Replaces CaseDetailPlaceholder at "/cases/$slug" with CaseDetailScreen, a read-only version timeline read from GET /v1/cases/:slug/versions rendered through StatusTable, offering a precondition-free "Continue editing" navigation on any draft version.
task: sha256:638cd7c51d03fd5ebfbcb4ec01469c94425dc4b84ce5417a2910ae0130df967e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/cases-list-and-detail-onda-2-full-suite-2
files:
  - path: src/routes/case-detail-screen.tsx
    effect: >-
      New component CaseDetailScreen: reads the "/cases/$slug" route's own slug param through
      useParams, fetches GET /v1/cases/:slug/versions through apiFetch inside a useQuery, builds
      one StatusTable row per returned version (version number, state as a { color, label } cell,
      and -- for a draft row only -- a "Continue editing" @tanstack/react-router Link to
      "/cases/$slug/versions/$version"), and renders them through StatusTable. Renders a generic
      loading/error placeholder while the query is pending or failed.
  - path: src/routes/route-tree.tsx
    effect: >-
      The "/cases/$slug" route's component is now CaseDetailScreen instead of
      CaseDetailPlaceholder; the CaseDetailPlaceholder import from ./route-placeholders was
      removed from this file (it is no longer referenced here). Every other route, and the root
      route's own AppShell component, are unchanged.
  - path: src/shared/components/status-table.tsx
    effect: >-
      renderCellContent now recognizes a cell value that is itself a valid React element (checked
      via React's own isValidElement, guarded by a typeof value === "object" narrowing so the call
      typechecks against isValidElement's own parameter type) and renders it as given, ahead of the
      plain-value fallback that would otherwise stringify it into unreadable text. This is
      additive: the existing status-cell and primitive/plain-value branches, and every existing
      exported type and prop, are unchanged.
criteria:
  - criterion: Visiting a case's detail route renders one row per version returned by GET /v1/cases/:slug/versions, each showing that version's number and its state as a { color, label } cell.
    met: true
    how: >-
      CaseDetailScreen's useQuery calls apiFetch<CaseVersionsPage>(`/v1/cases/${slug}/versions`);
      toRow() maps each returned CaseVersionListItem to a StatusTable row carrying version as a
      plain number and state as STATE_CELL[version.state], a { color, label } object StatusTable's
      own isStatusCellValue/renderCellContent already renders as a color dot plus its word.
  - criterion: A version whose state is draft shows a "Continue editing" action.
    met: true
    how: >-
      toRow() sets the row's actions field to a @tanstack/react-router Link reading "Continue
      editing" only when version.state === "draft"; a released row's actions is null, which
      StatusTable already renders as an empty cell. status-table.tsx's renderCellContent was
      extended to render that Link element as itself rather than stringifying it.
  - criterion: Clicking "Continue editing" navigates to that version's own route immediately, performing no additional request first.
    met: true
    how: >-
      The action is @tanstack/react-router's own Link (to="/cases/$slug/versions/$version",
      params={{ slug, version: String(version.version) }}), the client-side navigation primitive
      already registered for that route in route-tree.tsx; a Link issues no fetch of its own on
      click, only a router transition, so no additional request precedes the navigation.
  - criterion: The timeline renders every version the endpoint returns, not only the most recently opened one.
    met: true
    how: >-
      CaseDetailScreen maps every element of the response's data array
      (data.data.map((version) => toRow(slug, version))) into a row with no filtering, slicing or
      "latest only" selection.
nodes:
  - node: domain/knowledge/case-version
    encoded_at:
      - src/routes/case-detail-screen.tsx
    how: >-
      The version's own two attributes this screen reads -- version and state -- are the
      CaseVersionListItem type this file declares, matching the shape confirmed against the real
      backend; every other attribute the aggregate holds (title, manifest, etc.) is out of this
      task's read, which is list-case-versions rather than a whole-version read.
  - node: domain/knowledge/case-version-state
    encoded_at:
      - src/routes/case-detail-screen.tsx
    how: >-
      The CaseVersionState union ("draft" | "released") and the STATE_CELL lookup keyed by it are
      the source's own encoding of the node's two-value enumeration; a version's state can only
      ever resolve to one of the two cells the lookup declares, mirroring the node's closed set.
  - node: contracts/knowledge/case-query
    encoded_at:
      - src/routes/case-detail-screen.tsx
    how: >-
      The screen's data fetch is the one call this task makes against the contract's
      list-case-versions operation, through apiFetch<CaseVersionsPage>() against GET
      /v1/cases/:slug/versions; no other operation of this published contract (read-case,
      list-cases, list-hypotheses, list-hypothesis-revisions) is touched by this task.
  - node: rules/knowledge/every-case-version-remains-readable
    encoded_at:
      - src/routes/case-detail-screen.tsx
    how: >-
      This is the one screen in this wave that reads back what the invariant guarantees the store
      never destroys: every version list-case-versions returns is rendered as its own row, with no
      "keep only the latest" narrowing anywhere in the mapping from response to rows.
inferences:
  - inferred: draft renders as bg-warning (amber-toned) and released as bg-success (green-toned) in the { color, label } status cell.
    from: >-
      No node names a color for either state -- only the two states themselves. STATE_CELL uses
      TUI's existing semantic tokens bg-warning and bg-success instead of a literal Tailwind
      palette, since frontend/tui/frontend/src/shared/components/ui/alert/alert.tsx already keys
      its own success/warning variants off exactly those two tokens, and the
      frontend-app-substrate inventory's own convention is that a component references only the
      semantic tier.
  - inferred: each row's id is set to the version number, rather than left to StatusTable's own JSON.stringify(row) fallback key.
    from: >-
      status-table.tsx's own getRowKey() convention prefers a row's own id. A row here also
      carries a React element (the Link) in its actions field; stringifying a row holding a React
      element risks hitting circular internal element fields, so supplying id explicitly avoids
      relying on that fallback path for this row shape.
  - inferred: the slug is URL-encoded (encodeURIComponent) before being interpolated into the request path.
    from: >-
      No established convention exists yet for this in the codebase -- this is the first task to
      issue a real, browser-side GET call built from a route parameter. Encoding the parameter
      before interpolating it into the URL is standard defensive practice for a path segment
      sourced from user-navigable state, not a fact any specification node states.
  - inferred: status-table.tsx's renderCellContent renders a valid React element cell value as itself, ahead of the plain-value fallback.
    from: >-
      The "Continue editing" action requires a cell value StatusTable's existing renderCellContent
      did not support: today it renders only a { color, label } status cell or a stringified
      primitive, and would have turned an embedded Link element into unreadable text. The
      frontend-cases-list-detail-foundation inventory's own must_not_duplicate entry for
      status-table.tsx calls for composing this shared table rather than reimplementing one, which
      this additive extension does rather than a second, parallel table component.
  - inferred: a loading state renders "Loading version timeline…" and a failed/empty query renders "Unable to load this case's version timeline." as plain text.
    from: >-
      No criterion of this task, and no node it implements, states a wording or a UI treatment for
      either state; a failed request is already surfaced through query-client.ts's own cache-level
      toast, so this text is only a placeholder against an empty screen rather than a second error
      surface duplicating that toast's own message.
preserved:
  - The other nine registered routes in route-tree.tsx and their placeholder components, untouched.
  - >-
    The root route's own AppShell composition (sidebar, topbar, Outlet) and app-shell.tsx's
    ROUTE_LABELS lookup, keyed by the unchanged "/cases/$slug" route id -- unaffected since only
    the route's component changed, not its path or id.
  - >-
    status-table.tsx's existing rendering for a { color, label } status cell, a plain
    string/number value, an empty/missing field, and its onRowClick click/keyboard/inert-row
    behavior -- all exercised by status-table.spec.ts and left unchanged by this task's additive
    branch.
  - vite.config.ts's dev proxy for /v1/* (delivered by the dev-proxy dependency task), which this task's first real GET call relies on and does not modify.
deferred:
  - what: >-
      GET /v1/cases/:slug/versions is paginated (limit/offset/pageCount); CaseDetailScreen renders
      only the one page its single call returns, with no further paging if a case ever holds more
      versions than the backend's configured default/max limit.
    why: >-
      No criterion of this task asks for paging through multiple pages -- "renders every version
      the endpoint returns" is answered by rendering the one response's own data array in full --
      and building pagination reaches past what this task's objective and criteria state.
  - what: >-
      A case slug the backend does not hold (CaseNotFoundError, a 404) is not mapped to a specific
      on-screen state through error-ui-state.ts's existing "case-not-found" kind; it falls through
      to the same generic loading-failed text every other query failure does.
    why: >-
      No criterion of this task describes a 404-specific screen state, and error-ui-state.ts's own
      docstring already leaves "what each state displays" to the screen tasks that consume it --
      doing so here would be inventing UI wording no node or criterion states.
---

## What it is
The read-only half of the Case Detail screen the scope's section 2.2 describes: the version timeline and the precondition-free "Continue editing" navigation.
It depends on the dev-proxy task because it is the first task to issue a real GET /v1/cases/:slug/versions from the browser.

## Notes
route-tree.spec.ts's own assertion that "/cases/$slug" renders CaseDetailPlaceholder is no longer true now that this task wired CaseDetailScreen in its place; per implement-task's narrower re-delivery mode, router-skeleton's own proof was rewritten (its implementation left untouched) to narrow that assertion to the eight routes still rendering a placeholder, since which component /cases/$slug renders is now this task's own criterion and this task's own proof to test.
