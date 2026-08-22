---
title: Proof for the Cases List screen
summary: Nine tests prove cases-list-screen's four criteria plus several of its own disclosed inferences (state-cell colors, zero-version handling, slug-only search, the inert Create-case button), rendering CasesListScreen inside a self-contained test router and QueryClientProvider with a stubbed fetch.
implementation: sha256:87f7e45c5fc38ccf5ce952c06f86fff40772262df2b4749f613e57602d414604
run: run/cases-list-and-detail-onda-2-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/routes/cases-list-screen.spec.ts
    name: renders one row per case from GET /v1/cases, each showing its slug, a {color,label} state cell, its version count and when it was last updated
    proves: Visiting the Cases List route renders one row per case returned by GET /v1/cases, each row showing that case's slug, its current state as a { color, label } cell, its version count and when it was last updated.
    fails_when: the screen renders a different number of rows than GET /v1/cases returned cases, or any row omits/misstates its own slug, its {color,label} state cell, its version count, or its last-updated text
  - file: src/routes/cases-list-screen.spec.ts
    name: renders one row per case from GET /v1/cases, each showing its slug, a {color,label} state cell, its version count and when it was last updated
    proves: the inference the implementation recorded -- the { color, label } cell for each case-version-state value (draft -> bg-warning, released -> bg-success), matched to case-detail-screen.tsx's own mapping
    fails_when: draft stops rendering with the bg-warning color class or "Draft" label, or released stops rendering with bg-success or "Released", for either row
  - file: src/routes/cases-list-screen.spec.ts
    name: renders an explicit 'No version yet' state and a dash for last-updated for a case currently holding zero versions, rather than an invented state or timestamp
    proves: the inference the implementation recorded -- a case currently holding zero versions renders an explicit "No version yet" state cell and a dash for last-updated, rather than being hidden or shown with an invented state/timestamp
    fails_when: a zero-version case is omitted from the rendered rows, or its row shows any state label other than "No version yet", any color other than bg-muted, or any last-updated text other than "—"
  - file: src/routes/cases-list-screen.spec.ts
    name: narrows the rendered rows to cases whose slug matches the typed search text
    proves: Entering text into the search/filter control narrows the rendered rows to cases matching that text.
    fails_when: typing "beta" into the search input fails to remove case-alpha's and case-gamma's rows, or removes/misidentifies case-beta's own row
  - file: src/routes/cases-list-screen.spec.ts
    name: does not narrow rows by a match against a visible column other than slug
    proves: the inference the implementation recorded -- the search/filter control matches against a case's slug alone, not any other visible field
    fails_when: typing a word that appears only in a rendered state cell (not in either case's slug) leaves any row visible
  - file: src/routes/cases-list-screen.spec.ts
    name: keeps showing the searchable table with zero rows when the search text matches no case, rather than the no-cases-yet empty state
    proves: the boundary between a search narrowing every row out and GET /v1/cases itself returning zero cases -- the empty-state message must key off the raw fetched set, not the filtered one
    fails_when: typing text matching no case's slug shows the "No cases yet — create the first one" message, hides the search input, or removes the (empty) table
  - file: src/routes/cases-list-screen.spec.ts
    name: renders the empty-state message and a Create case action instead of a table when GET /v1/cases returns zero cases
    proves: GET /v1/cases returning zero cases renders the empty-state message and action the scope states ("No cases yet — create the first one") instead of an empty table.
    fails_when: GET /v1/cases answering zero cases fails to show the exact message text, fails to show a "Create case" button, or renders a table element of any kind
  - file: src/routes/cases-list-screen.spec.ts
    name: renders the empty-state message and a Create case action instead of a table when GET /v1/cases returns zero cases
    proves: the inference the implementation recorded -- the empty-state's "Create case" button is rendered present but inert (disabled, with a title explaining why) rather than wired to a route or a silent no-op
    fails_when: the "Create case" button is not disabled, or carries no title attribute explaining why
  - file: src/routes/cases-list-screen.spec.ts
    name: navigates to that case's own Case Detail route, addressed by its slug, when its row is clicked
    proves: Clicking a case's row navigates to that case's own Case Detail route, addressed by its slug.
    fails_when: clicking the case-alpha row leaves the router's current pathname at "/cases" (or anywhere other than "/cases/case-alpha")
not_applicable:
  - edge_case: two clicks on the same row in quick succession
    why: no node or criterion this task implements states a debounce or idempotency guarantee for repeated navigation, so a test here would assert a guarantee nobody made
  - edge_case: duplicate slugs within a single GET /v1/cases response
    why: domain/knowledge/case defines a case's slug as its identity; nothing in this task's own criteria addresses a backend answering duplicates, so testing it would assert behavior no criterion or node this task implements establishes
  - edge_case: typing into the search control while the initial GET /v1/cases request is still pending
    why: the search input is rendered only once entries have loaded (the pending branch shows "Loading cases…" with no input at all), so there is no state in which typing can race the initial fetch
  - edge_case: GET /v1/cases or a per-case derivation call failing
    why: none of this task's four criteria name failure behavior for the listing; the existing QueryCache-level toast and this screen's own "Cases could not be loaded." render are the whole of what the base asks for here
untested:
  - "the loading render (\"Loading cases…\") and the query-error render (\"Cases could not be loaded.\") are not exercised by this proof, since neither is named by any of this task's four criteria"
  - "whitespace-only or leading/trailing-whitespace search text being trimmed before matching (filterEntriesBySlug's own .trim()) is not directly exercised"
  - "the deferred behavior that one case's fetchCaseSummary failing (e.g. a 404) fails the whole cases-list query via Promise.all, with no per-row degraded state -- named in the implementation's own deferred section, not exercised here since no criterion states per-row failure behavior"
  - "that GET /v1/cases's own further pages (beyond the first) are never requested is not directly verified by an assertion that no such request occurred; the mocked fetch would throw on an unexpected URL, which is the only way this proof would surface a regression here"
---

## What it is
Nine tests over CasesListScreen, rendered inside a self-contained test router and QueryClientProvider with a stubbed fetch: the four stated criteria plus the state-cell colors, zero-version handling, slug-only search and inert-button inferences the implementation record discloses.

## Notes
The proof's own helper was renamed from renderCasesListScreen to mountCasesListScreen (and a `router` local renamed away from that name at its one capturing call site) to satisfy testing-library/render-result-naming-convention -- the function calls Testing Library's own render() internally but returns the test router instance, not a render result, and the rule's naming convention applies to any local it judges render-result-shaped by name.
