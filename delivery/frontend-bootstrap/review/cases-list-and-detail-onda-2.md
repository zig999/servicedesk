---
title: Review of cases-list-and-detail onda 2 (3 delivered tasks)
summary: 'Four-pass review of the 3 delivered cases-list-and-detail tasks: coverage over their 12 criteria,
  specification conformance, standard conformance, and the failures pass (which did not run -- the captured
  run passed cleanly).'
tasks:
- task/cases-list-and-detail/dev-proxy-for-backend-api
- task/cases-list-and-detail/case-detail-timeline
- task/cases-list-and-detail/cases-list-screen
reviewed:
- src/routes/case-detail-screen.tsx
- src/routes/cases-list-screen.tsx
- src/routes/route-tree.tsx
- src/shared/components/status-table.tsx
- vite.config.ts
- package.json
- src/vite-config.spec.ts
- src/routes/case-detail-screen.spec.ts
- src/routes/cases-list-screen.spec.ts
- src/routes/route-tree.spec.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/cases-list-and-detail-onda-2-full-suite-2) passed all 8 steps with 89/89
    tests passing; there was no failure to diagnose
coverage:
- criterion: vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1
    to http://localhost:3000.
  state: covered
  tests:
  - file: src/vite-config.spec.ts
    name: declares a server.proxy entry for /v1
  - file: src/vite-config.spec.ts
    name: forwards the /v1 proxy entry to the real backend at http://localhost:3000
- criterion: A request to http://localhost:5173/v1/cases, issued while the vite dev server and the real
    backend both run, returns the backend's own response body rather than a browser CORS error.
  state: uncovered
  why: This is a two-live-process integration fact; nothing in the test set starts either process or issues
    a network request against port 5173. Verified manually with curl outside any automated suite, per
    the implementation and proof records.
- criterion: No file under the backend's own source root is changed by this task.
  state: uncovered
  why: A fact about which files the delivery touched, not a runtime behavior any test can exercise; checked
    by reading the implementation record's own files list and the diff directly.
- criterion: Visiting a case's detail route renders one row per version returned by GET /v1/cases/:slug/versions,
    each showing that version's number and its state as a { color, label } cell.
  state: covered
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders one row per returned version, with its number and its state as a color-and-label cell
  - file: src/routes/case-detail-screen.spec.ts
    name: renders every version the endpoint returns, not only the most recently opened one
- criterion: A version whose state is draft shows a "Continue editing" action.
  state: covered
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: shows Continue editing on the draft version's row and not on the released version's row
- criterion: Clicking "Continue editing" navigates to that version's own route immediately, performing
    no additional request first.
  state: partial
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders Continue editing as a router Link to that version's own route
  why: The test checks the rendered element's href equals the expected route; it never fires a click event,
    never asserts the router's location actually changed, and never counts fetch calls before/after to
    confirm no additional request precedes navigation. The href being correct is consistent with the criterion
    but does not exercise the click-triggered navigation itself.
- criterion: The timeline renders every version the endpoint returns, not only the most recently opened
    one.
  state: covered
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders every version the endpoint returns, not only the most recently opened one
- criterion: Visiting the Cases List route renders one row per case returned by GET /v1/cases, each row
    showing that case's slug, its current state as a { color, label } cell, its version count and when
    it was last updated.
  state: covered
  tests:
  - file: src/routes/cases-list-screen.spec.ts
    name: renders one row per case from GET /v1/cases, each showing its slug, a {color,label} state cell,
      its version count and when it was last updated
  - file: src/routes/cases-list-screen.spec.ts
    name: renders an explicit 'No version yet' state and a dash for last-updated for a case currently
      holding zero versions, rather than an invented state or timestamp
- criterion: Entering text into the search/filter control narrows the rendered rows to cases matching
    that text.
  state: covered
  tests:
  - file: src/routes/cases-list-screen.spec.ts
    name: narrows the rendered rows to cases whose slug matches the typed search text
  - file: src/routes/cases-list-screen.spec.ts
    name: does not narrow rows by a match against a visible column other than slug
  - file: src/routes/cases-list-screen.spec.ts
    name: keeps showing the searchable table with zero rows when the search text matches no case, rather
      than the no-cases-yet empty state
- criterion: GET /v1/cases returning zero cases renders the empty-state message and action the scope states
    ("No cases yet — create the first one") instead of an empty table.
  state: covered
  tests:
  - file: src/routes/cases-list-screen.spec.ts
    name: renders the empty-state message and a Create case action instead of a table when GET /v1/cases
      returns zero cases
- criterion: Clicking a case's row navigates to that case's own Case Detail route, addressed by its slug.
  state: covered
  tests:
  - file: src/routes/cases-list-screen.spec.ts
    name: navigates to that case's own Case Detail route, addressed by its slug, when its row is clicked
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
findings:
- pass: conformance
  file: src/routes/case-detail-screen.tsx
  where: the CaseVersionState type declaration
  evidence: type CaseVersionState = "draft" | "released";
  cost: domain/knowledge/case-version-state names these same two values as the case version's whole lifecycle
    enumeration; this file re-derives that enumeration as its own literal union rather than reading it
    from one shared source, so the two values live in two places nothing keeps in step -- if the specification's
    enumeration ever changes, this declaration and the STATE_CELL lookup keyed off it would not reflect
    it.
  correction: Derive the type from a single source that itself answers to domain/knowledge/case-version-state,
    rather than declaring the two literals independently in this file.
- pass: conformance
  file: src/routes/cases-list-screen.tsx
  where: the CaseVersionState type declaration
  evidence: type CaseVersionState = "draft" | "released";
  cost: This is a second, independent declaration of the same enumeration domain/knowledge/case-version-state
    holds (already restated once in case-detail-screen.tsx); a future addition or removal in the node
    would leave both source declarations unchanged and silently wrong until a real backend value fails
    to match either union.
  correction: Derive the type from one place that answers to domain/knowledge/case-version-state, shared
    by both screens, instead of declaring the enumeration's literals a second time here.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: the isError branch
  cites: EDG-02
  evidence: "if (isError || !data) {\n  return <p>Unable to load this case's version timeline.</p>;\n}"
  cost: A curator whose version-timeline fetch failed sees a static sentence with no way to try again
    short of leaving and re-opening the case.
  correction: Render a typed error state that includes a retry control (e.g. wired to react-query's own
    refetch) alongside the message.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: the render return after the loading/error guards
  cites: API-04
  evidence: "const rows = data.data.map((version) => toRow(slug, version));\n\nreturn (\n  <section>\n\
    \    <h1>Case {slug}</h1>\n    <StatusTable columns={CASE_VERSIONS_COLUMNS} rows={rows} />\n  </section>\n\
    );"
  cost: When a case currently holds zero versions, this renders a table with only its header row and no
    message -- a curator cannot tell "no versions exist" from a table that has not finished loading, especially
    since cases-list-screen.tsx renders an explicit message for the analogous zero-items case.
  correction: Add an explicit branch for rows.length === 0 that renders a stated empty message instead
    of an empty StatusTable.
- pass: standard
  file: src/routes/cases-list-screen.tsx
  where: filteredEntries
  cites: PRF-02
  evidence: "const filteredEntries = useMemo(\n  () => filterEntriesBySlug(entries, searchText),\n  [entries,\
    \ searchText],\n);"
  cost: filterEntriesBySlug performs one case-insensitive substring comparison per case slug -- a trivial
    derivation -- yet is wrapped in useMemo with no measured cost recorded anywhere in the file.
  correction: Compute filteredEntries inline from entries and searchText on every render, and reach for
    useMemo only once a measured cost justifies it.
- pass: standard
  file: src/routes/cases-list-screen.tsx
  where: the isError branch
  cites: EDG-02
  evidence: "if (casesQuery.isError) {\n  return <p>Cases could not be loaded.</p>;\n}"
  cost: A curator whose case list failed to load has no in-screen way to retry the fetch -- the only affordance
    is a static sentence.
  correction: Render a typed error state offering a retry action (e.g. calling casesQuery.refetch()) rather
    than only a fixed message.
- pass: standard
  file: src/routes/cases-list-screen.tsx
  where: the search input and the table it filters
  cites: ACC-07
  evidence: <input type="search" value={searchText} onChange={handleSearchChange} placeholder="Search
    cases by slug" aria-label="Search cases by slug" .../>
  cost: Typing in the search field re-renders the table to a narrower row set with no aria-live region
    or explicit focus move; a screen reader user who is not looking at the screen gets no signal that
    the result set just changed size.
  correction: Wrap the results (or a count of them) in an aria-live region, or move focus/announce the
    new count when the filtered set changes.
---

## What it is
A four-pass review over the 3 delivered tasks of cases-list-and-detail (onda 2): dev-proxy-for-backend-api, case-detail-timeline, cases-list-screen. The 4th originally-cut task, case-detail-new-draft-action, was found infeasible against the real backend (POST /v1/cases requires title/when_to_use/subject/fallback, none of which any screen in this wave holds) and was removed from the plan rather than delivered -- documented in temp/frontend-console-decisions.md and in the epic's own rationale; it is not reviewed here because nothing was delivered for it. The captured run (run/cases-list-and-detail-onda-2-full-suite-2) passed all 8 registry steps with 89/89 tests passing, so the failures pass has nothing to diagnose and did not run.

## Notes
Trace (`trace.py --check frontend/app`): 6 pre-existing `code`-class drift findings under the backend target, unchanged from before this wave and unrelated to this review's file set. This review's own work added 2 new bindings, both clean: case-detail-timeline (case-version, case-version-state, case-query, every-case-version-remains-readable) and cases-list-screen (case, case-summary, case-version-state, a-case-summary-is-derived-from-its-existing-versions, case-query), both via `trace.py --bind-record` against their own implementation records. 0 orphaned, 0 moved, 0 new code drift.

The standard pass found 24 rules in scope over this file set (ARC-01, ARC-03, ARC-04, STA-01, STA-03, API-01, API-02, API-04, EDG-01 through EDG-04, ACC-04, ACC-06 through ACC-08, ACC-11, ENV-02, SEC-05, TYP-04, PRF-02, PRF-04, TST-02, TST-03) and returned five findings (two EDG-02 retry-affordance gaps, one API-04 empty-state gap, one PRF-02 premature-memoization note, one ACC-07 live-region gap). All artifacts the registry presupposes stand against frontend/app; every rule the registry marks tool-decided had its deciding step run and pass in the captured suite.

This review's own file set (`reviewed`) is exactly the union of `files` and `tests[].file` across the 3 implementation and proof records, resolved against frontend/app, read straight out of those records.

What this review does not cover: build-substrate and the 8 frontend-console-foundation (onda 1) tasks were reviewed separately in review/frontend-bootstrap.md and review/frontend-console-foundation-onda-1.md, and are not re-reviewed here. case-detail-new-draft-action was removed from the plan before any code was written for it, so there is nothing of it to review. Ondas 3 through 6 of the wider plan have not been implemented and are out of scope by construction.

Repairs, as routes rather than as a reading of the findings: every finding above and the one partial coverage entry are answered by `/implement-task` over the same task, adding the missing retry affordance, the missing empty-state branch, the live-region, or a click-triggered navigation assertion, or by extracting CaseVersionState to one shared declaration both screens import. Which of these a person judges worth acting on, and when, is not this record's to decide.
