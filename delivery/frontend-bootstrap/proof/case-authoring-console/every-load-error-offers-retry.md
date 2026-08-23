---
title: Every load-error state offers a retry control — proof
summary: Twelve tests across three spec files prove that Cases List, Case Detail's Versions tab and the
  Capabilities Browser each render a retry control on load error that re-issues that same screen's own
  read, issues no other request, fires exactly once per click, and survives a repeated failure without
  getting the screen stuck.
implementation: sha256:da1b53a0a2a2abdd18d0cf6b8cb032515c2b27fc068b3ab6c3d9ca9b7550bce9
run: run/ux-consistency-sweep-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/cases-list-screen-retry.spec.ts
  name: CasesListScreen's own retry control (criterion 1) > re-issues GET /v1/cases when Retry is clicked,
    rendering the cases once that retry succeeds
  proves: Criterion 1 -- Cases List's load-error control, when activated, re-issues the same GET /v1/cases
    request the screen's own initial load issued.
  fails_when: Clicking Retry does not call fetch against /v1/cases a second time, or the screen's UI does
    not reflect the retried request's own successful result.
- file: src/routes/cases-list-screen-retry.spec.ts
  name: CasesListScreen's own retry control (criterion 4) > issues no request other than GET /v1/cases
    when Retry is clicked
  proves: Criterion 4, scoped to Cases List's own retry control -- it issues no request other than re-running
    GET /v1/cases.
  fails_when: Any fetch call recorded across the initial load and the retry targets a URL other than exactly
    "/v1/cases".
- file: src/routes/cases-list-screen-retry.spec.ts
  name: CasesListScreen's own retry control -- exactly one more request > issues exactly one more GET
    /v1/cases request per Retry click, never zero and never more than one
  proves: One click of Retry issues exactly one additional request.
  fails_when: fetch is called a number of times other than exactly two (one initial, one retry) after
    a single Retry click.
- file: src/routes/cases-list-screen-retry.spec.ts
  name: CasesListScreen's own retry control -- repeated failure > still shows the failure message and
    Retry control after a second failure following Retry, rather than getting stuck
  proves: A second failure following a Retry click still shows the failure message and the Retry control.
  fails_when: After the retried request also fails, the failure text or the Retry button is absent, or
    the screen is left showing a permanent loading placeholder instead.
- file: src/routes/case-detail-screen-versions-retry.spec.ts
  name: CaseDetailScreen's Versions tab retry control (criterion 2) > re-issues GET /v1/cases/{slug}/versions
    when Retry is clicked, rendering the version list once that retry succeeds
  proves: Criterion 2 -- Case Detail's Versions tab load-error control, when activated, re-issues the
    same GET /v1/cases/{slug}/versions request that tab's own initial load issued.
  fails_when: Clicking Retry does not call fetch against VERSIONS_PATH a second time, or the version table
    does not render once that retried request succeeds.
- file: src/routes/case-detail-screen-versions-retry.spec.ts
  name: CaseDetailScreen's Versions tab retry control (criterion 4) > issues no request other than GET
    /v1/cases/{slug}/versions when Retry is clicked
  proves: Criterion 4, scoped to the Versions tab's own retry control.
  fails_when: Any fetch call recorded across the initial load and the retry targets a URL other than VERSIONS_PATH.
- file: src/routes/case-detail-screen-versions-retry.spec.ts
  name: CaseDetailScreen's Versions tab retry control -- exactly one more request > issues exactly one
    more request per Retry click, never zero and never more than one
  proves: One click of Retry issues exactly one additional request against the Versions tab's own read.
  fails_when: fetch is called a number of times other than exactly two after a single Retry click.
- file: src/routes/case-detail-screen-versions-retry.spec.ts
  name: CaseDetailScreen's Versions tab retry control -- repeated failure > still shows the failure message
    and Retry control after a second failure following Retry, rather than getting stuck
  proves: A second failure following Retry still shows the Versions tab's own failure message and Retry
    control.
  fails_when: After the retried request also fails, the failure text or the Retry button is absent, or
    a permanent loading placeholder is shown instead.
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen's retry control (criterion 3) > re-issues GET /v1/capabilities when
    Retry is clicked, rendering the capabilities once that retry succeeds
  proves: Criterion 3 -- the Capabilities Browser's load-error control, when activated, re-issues the
    same GET /v1/capabilities request the screen's own initial load issued.
  fails_when: Clicking Retry does not call fetch against CAPABILITIES_PATH a second time, or the capability
    row does not render once that retried request succeeds.
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen's retry control (criterion 4) > issues no request other than GET /v1/capabilities
    when Retry is clicked
  proves: Criterion 4, scoped to the Capabilities Browser's own retry control.
  fails_when: Any fetch call recorded across the initial load and the retry targets a URL other than exactly
    CAPABILITIES_PATH.
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen's retry control -- exactly one more request > issues exactly one more
    request per Retry click, never zero and never more than one
  proves: One click of Retry issues exactly one additional request against the Capabilities Browser's
    own read.
  fails_when: fetch is called a number of times other than exactly two after a single Retry click.
- file: src/routes/capabilities-browser-screen.spec.ts
  name: CapabilitiesBrowserScreen's retry control -- repeated failure > still shows the failure message
    and Retry control after a second failure following Retry, rather than getting stuck
  proves: A second failure following Retry still shows the Capabilities Browser's own failure message
    and Retry control.
  fails_when: After the retried request also fails, the failure text or the Retry button is absent, or
    a permanent loading placeholder is shown instead.
not_applicable:
- edge_case: Concurrent double-click of Retry (two clicks fired before the first settles)
  why: No criterion of this task and no disclosed inference names debounce or in-flight de-duplication
    behavior; each screen's onClick calls a raw useQuery refetch (or a hook's pre-wrapped equivalent)
    with no debounce layer added by this task.
- edge_case: A network failure distinct from a thrown Error (e.g. an HTTP error status)
  why: Every load-error branch this task touches is reached identically regardless of whether the underlying
    rejection came from a thrown network error or a non-2xx response apiFetch already turns into a rejection
    -- the three pre-existing "shows a failure placeholder" tests already establish this equivalence for
    each screen.
---

## What it is
Twelve tests across three spec files, proving each of the three screens' Retry control re-issues its own read, issues nothing else, fires exactly once per click, and survives a repeated failure.

## Notes
None.
