---
title: Cases List screen
summary: Replaces CasesListPlaceholder with a table listing every case from GET /v1/cases, with a search/filter control, an empty state, and per-row navigation to Case Detail.
rationale: >-
  I bundled the table render, the empty state, the search/filter narrowing and the per-row
  navigation into one task rather than splitting them further because they share one objective
  and one reason to change -- a curator finding and opening a case through a single read call --
  and cross no interface boundary of their own: navigation reuses StatusTable's own onRowClick
  contract rather than introducing a second one, and the empty state is the same render's own
  boundary case, not a distinct concern. This is a decomposition choice the scope's prose did
  not itself spell out at this grain.
objective: Visiting the Cases List route surfaces every case GET /v1/cases returns, in a searchable table, and lets a curator open any one of them.
criteria:
  - Visiting the Cases List route renders one row per case returned by GET /v1/cases, each row showing that case's slug, its current state as a { color, label } cell, its version count and when it was last updated.
  - Entering text into the search/filter control narrows the rendered rows to cases matching that text.
  - GET /v1/cases returning zero cases renders the empty-state message and action the scope states ("No cases yet — create the first one") instead of an empty table.
  - Clicking a case's row navigates to that case's own Case Detail route, addressed by its slug.
depends_on:
  - task/cases-list-and-detail/dev-proxy-for-backend-api
implements:
  - domain/knowledge/case
  - domain/knowledge/case-summary
  - domain/knowledge/case-version-state
  - rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  - contracts/knowledge/case-query
sources:
  - intake/onda-2-scope.md
---

## What it is
The real Cases List screen the scope's section 2.1 describes, rendered through the existing StatusTable component rather than a new table primitive.
It depends on the dev-proxy task because it is the first screen to issue a real GET /v1/cases from the browser.
Each case's state/version-count/last-updated cell is computed per the newly-decided domain/knowledge/case-summary value-object and its deriving rule, not returned directly by GET /v1/cases (which answers only { slug } per case, confirmed against the real backend) -- the binder's own advisory note leaves the exact call pattern (e.g. one GET /v1/cases/:slug/versions per case) to the implementation, since no node mandates one.

## Notes
The binder returned an advisory note (not blocking): GET /v1/cases returning only { slug } per case is consistent with the governing nodes -- case-query publishes list-cases and list-case-versions as separate operations, and case-summary's fields are declared derived from a case's own case-versions rather than carried by list-cases itself. Deriving the summary via one list-case-versions call per case is a plausible strategy, but the specification does not mandate any particular call pattern; that choice belongs to the implementation.
