---
title: Cases List screen, wired onto the real backend
summary: Replaces CasesListPlaceholder with a StatusTable-backed screen that lists every case GET /v1/cases returns, derives each row's case-summary (state/version-count/last-updated) from that case's own versions, filters client-side by slug, shows the scope's empty state, and navigates to Case Detail on row click.
task: sha256:89e949273a7ff3ada5a38d6a1f25a13c7cc34125cda1b7fe5b8ba629d63eda39
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/cases-list-and-detail-onda-2-full-suite-2
files:
  - path: src/routes/cases-list-screen.tsx
    effect: >-
      New component. Calls GET /v1/cases (apiFetch), then derives each returned case's
      domain/knowledge/case-summary from its own versions (a probe call to GET
      /v1/cases/:slug/versions for version_count and, where needed, the highest-numbered
      version's row, plus GET /v1/cases/:slug/versions/:version for that version's authored_at),
      renders one StatusTable row per case (slug, a { color, label } state cell, version count, a
      human-readable last-updated timestamp), narrows rendered rows to those whose slug matches a
      controlled search input, renders the scope's "No cases yet — create the first one" empty
      state (with an inert "Create case" button) when GET /v1/cases answers zero cases, and
      navigates to "/cases/$slug" on row click via StatusTable's onRowClick.
  - path: src/routes/route-tree.tsx
    effect: >-
      casesListRoute's own component now points at CasesListScreen instead of
      CasesListPlaceholder; the now-unused CasesListPlaceholder import was dropped from this
      file's import list (its own export in route-placeholders.tsx is untouched, since other
      consumers still import it there).
criteria:
  - criterion: Visiting the Cases List route renders one row per case returned by GET /v1/cases, each row showing that case's slug, its current state as a { color, label } cell, its version count and when it was last updated.
    met: true
    how: >-
      CasesListScreen's useQuery calls fetchCasesWithSummaries, which reads GET /v1/cases and
      derives each case's CaseSummary (fetchCaseSummary); toRow() maps each entry to a StatusTable
      row carrying slug, a { color, label } state cell (CASE_STATE_CELL, or an explicit "No
      version yet" cell where the case currently holds no version), versionCount, and a formatted
      lastUpdated string.
  - criterion: Entering text into the search/filter control narrows the rendered rows to cases matching that text.
    met: true
    how: >-
      A controlled input[type=search] drives searchText state; filterEntriesBySlug (memoized via
      useMemo) narrows the fetched entries to those whose slug (lower-cased) includes the trimmed,
      lower-cased search text, entirely client-side over the data useQuery already fetched -- no
      second network call is made on input change.
  - criterion: GET /v1/cases returning zero cases renders the empty-state message and action the scope states ("No cases yet — create the first one") instead of an empty table.
    met: true
    how: >-
      hasNoCasesAtAll (entries.length === 0, computed from the raw fetched set, not the filtered
      one) switches the render from the search-input+StatusTable pair to a block carrying the
      exact copy "No cases yet — create the first one" plus a "Create case" button, instead of a
      StatusTable with zero rows.
  - criterion: Clicking a case's row navigates to that case's own Case Detail route, addressed by its slug.
    met: true
    how: >-
      handleRowClick reads row.slug from the StatusTableRow StatusTable's onRowClick hands back
      and calls useNavigate()'s navigate({ to: "/cases/$slug", params: { slug } }) -- the same
      route registered in route-tree.tsx.
nodes:
  - node: domain/knowledge/case
    encoded_at:
      - src/routes/cases-list-screen.tsx
    how: >-
      CaseIdentity types GET /v1/cases's own per-case shape as slug alone, matching the node's own
      "almost everything ... now belongs to a specific case version" description -- next_version,
      the identity's other declared attribute, is never read or shown by this listing. Each row's
      slug is what addresses the case's own Case Detail route on click.
  - node: domain/knowledge/case-summary
    encoded_at:
      - src/routes/cases-list-screen.tsx
    how: >-
      The CaseSummary type declares exactly this value-object's three attributes (versionCount,
      currentState, lastUpdated), computed fresh per case by fetchCaseSummary from that case's own
      versions and held by nothing else -- never stored, never carried by the case identity
      itself.
  - node: domain/knowledge/case-version-state
    encoded_at:
      - src/routes/cases-list-screen.tsx
    how: >-
      The CaseVersionState type is exactly the two-value union ("draft" | "released");
      CASE_STATE_CELL maps each to its own { color, label } cell, exhaustively over the type.
  - node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
    encoded_at:
      - src/routes/cases-list-screen.tsx
    how: >-
      fetchCaseSummary implements the rule's statement directly: version_count is the probe
      call's own total; current_state is the state of the row at the highest-numbered offset
      (versionCount - 1) in case_versions' own ascending-by-version order, confirmed against
      relational-case-store.repository.ts's own caseVersionsPageSelect ("ORDER BY version");
      last_updated is that same highest-numbered version's own authored_at, read through a
      further GET /v1/cases/:slug/versions/:version call since the versions listing itself never
      carries authored_at (case-store.port.ts's own CaseVersionListItem).
  - node: contracts/knowledge/case-query
    encoded_at:
      - src/routes/cases-list-screen.tsx
    how: >-
      Consumes three of this published API's five operations through the one shared apiFetch
      wrapper: list-cases (GET /v1/cases), list-case-versions (GET /v1/cases/:slug/versions,
      twice per case at most) and read-case (GET /v1/cases/:slug/versions/:version, for
      authored_at). No second fetch path is opened.
inferences:
  - inferred: >-
      The per-case call pattern used to derive a case-summary: a probe call to GET
      /v1/cases/:slug/versions at limit=1/offset=0 to read total (and, where total === 1, the one
      version it already returns), a second such call at offset=total-1 where total > 1 to read
      the highest-numbered version's own row, and a third call to GET
      /v1/cases/:slug/versions/:version for that version's own authored_at.
    from: >-
      The task's own Notes: the binder's advisory that GET /v1/cases returning only { slug } is
      consistent with the governing nodes and that the specification does not mandate any
      particular call pattern -- confirmed against relational-case-store.repository.ts's own
      ascending ORDER BY version for case_versions, which is what makes the offset=total-1 call
      reliably answer the highest-numbered version.
  - inferred: >-
      A case currently holding zero versions renders an explicit "No version yet" state cell and
      a "—" for last-updated, rather than being hidden from the list or shown with an invented
      state/timestamp.
    from: >-
      case-store.port.ts's own documented edge (a case row survives the discarding of every
      version it ever held); neither domain/knowledge/case-summary nor its deriving rule states
      what a listing shows for a case this value-object cannot be constructed for, so this screen
      shows an honest absence rather than asserting a state or a timestamp no node supports.
  - inferred: The { color, label } cell for each case-version-state value -- draft -> bg-warning, released -> bg-success.
    from: >-
      routes/case-detail-screen.tsx's own STATE_CELL mapping (delivered concurrently, visible in
      this same tree), matched exactly rather than picked independently, so the two screens agree
      on what each state looks like.
  - inferred: The search/filter control matches against a case's slug alone, not any other visible field.
    from: >-
      Slug is the one field GET /v1/cases itself carries per case and the one a curator hunting
      for a known case would type.
  - inferred: >-
      The empty-state's "Create case" button is rendered present but inert (disabled, with a
      title explaining why) rather than wired to a route or left silently clickable with no
      effect.
    from: >-
      The button's target action (a case-creation screen) does not exist anywhere in this plan;
      disabling it with an explanatory title was chosen over a silent no-op click so a curator is
      not left wondering whether anything happened.
  - inferred: >-
      GET /v1/cases's own paginated envelope, and GET /v1/cases/:slug/versions's own per-item
      shape, are redeclared locally in this file (PaginatedResponse<T>, CaseIdentity,
      CaseVersionListItem, CaseVersionDetail) rather than imported from a shared frontend module.
    from: >-
      src/types/pagination.ts and case-store.port.ts's own CaseIdentity/CaseVersionListItem, read
      directly to match field names and shapes exactly; no shared frontend type for either existed
      yet in this target root, and this is the first frontend module to consume a paginated
      backend response, so introducing a new shared module for it reaches past this task's own
      objective.
  - inferred: fetchCasesWithSummaries reads only GET /v1/cases's own first page, never paging through every one of its pages.
    from: >-
      Neither this task's criteria nor the scope's section 2.1 names a pagination control for the
      cases list itself; reading every page would be new, unscoped behavior this task's own
      criteria do not ask for.
preserved:
  - route-tree.tsx's registration of the other nine routes and their own components, untouched by this edit.
  - >-
    AppShell's ROUTE_LABELS breadcrumb table, keyed by the unchanged "/cases" route id -- this
    task swapped only that route's component, never its path.
  - >-
    route-placeholders.tsx's own CasesListPlaceholder export, left in place for its other
    existing consumer (route-tree.spec.ts) even though route-tree.tsx no longer wires it to a
    route.
  - case-detail-screen.tsx's own delivered wiring for the "/cases/$slug" route, left exactly as found.
deferred:
  - what: GET /v1/cases's own further pages (beyond the first) are never fetched or offered to a curator through a pagination control.
    why: No criterion of this task or of the scope's section 2.1 names a pagination control for the cases list; adding one reaches outside this task's own objective.
  - what: The empty-state "Create case" button's own target action -- a case-creation screen or flow -- does not exist anywhere in this plan.
    why: "The task's own instructions name this explicitly as out of scope: no case-creation screen exists yet for this button to navigate to."
  - what: >-
      If fetchCaseSummary fails for any one case (e.g. a 404 from a case deleted between the two
      listing calls), the whole cases-list query fails via Promise.all, and no row renders for
      any case rather than only the failing one being shown degraded.
    why: >-
      No criterion states per-row failure behavior for this listing; the existing, already-
      delivered QueryCache-level toast (query-client.ts) is the only failure handling this task's
      criteria call for, and inventing a finer-grained partial-failure UI reaches past this
      task's own objective.
  - what: Whether a case currently holding zero versions should even be returned by GET /v1/cases, or excluded before it reaches this listing, is not decided by any node this task read.
    why: >-
      This is a business decision about a real, reachable state that no domain node, rule or
      contract addresses; this screen renders an honest absence for it (see inferences) rather
      than deciding the question, which belongs to the specification, not to this task's own
      source.
---

## What it is
The real Cases List screen the scope's section 2.1 describes, rendered through the existing StatusTable component rather than a new table primitive.
It depends on the dev-proxy task because it is the first screen to issue a real GET /v1/cases from the browser.
Each case's state/version-count/last-updated cell is computed per domain/knowledge/case-summary and its deriving rule, not returned directly by GET /v1/cases (which answers only { slug } per case, confirmed against the real backend).

## Notes
route-tree.spec.ts's own assertion that "/cases" renders CasesListPlaceholder is no longer true now that this task wired CasesListScreen in its place; per implement-task's narrower re-delivery mode, router-skeleton's own proof was rewritten (its implementation left untouched) to narrow that assertion to the eight routes still rendering a placeholder.
