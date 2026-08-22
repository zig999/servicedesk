---
title: Review of frontend-console-foundation onda 1 (8 tasks)
summary: 'Four-pass review of the 8 frontend-console-foundation tasks: coverage over their 37 criteria,
  specification conformance, standard conformance, and the failures pass (which did not run -- the captured
  run passed cleanly).'
tasks:
- task/frontend-console-foundation/router-skeleton
- task/frontend-console-foundation/app-shell
- task/frontend-console-foundation/query-client-and-toaster
- task/frontend-console-foundation/typed-api-client
- task/frontend-console-foundation/error-to-ui-state-table
- task/frontend-console-foundation/conflict-banner
- task/frontend-console-foundation/telemetry-catalog-hook
- task/frontend-console-foundation/reusable-status-table
reviewed:
- src/routes/route-placeholders.tsx
- src/routes/route-tree.tsx
- src/main.tsx
- package.json
- src/shared/components/app-shell.tsx
- src/services/query-client.ts
- src/services/api-client.ts
- src/services/error-ui-state.ts
- src/shared/components/conflict-banner.tsx
- vite.config.ts
- tsconfig.json
- src/hooks/use-telemetry.ts
- src/shared/components/status-table.tsx
- src/routes/route-tree.spec.ts
- src/shared/components/app-shell.spec.ts
- src/services/query-client.spec.ts
- src/shared/components/toaster-mount.spec.ts
- src/services/api-client.spec.ts
- src/services/error-ui-state.spec.ts
- src/shared/components/conflict-banner.spec.ts
- src/hooks/use-telemetry.spec.ts
- src/shared/components/status-table.spec.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/frontend-console-foundation-onda-1-full-suite-2) passed all 8 steps with
    0 failures; there was no failure to diagnose
coverage:
- criterion: Each of the ten screens (2.1 through 2.10) named in the proposal has its own route path defined
    in the router tree.
  state: covered
  tests:
  - file: src/routes/route-tree.spec.ts
    name: registers a route at each of the ten proposal screens' paths, and no other
  - file: src/routes/route-tree.spec.ts
    name: assigns no two of the ten routes the same path
- criterion: Visiting each defined route renders that route's own placeholder component, distinct from
    every other route's placeholder.
  state: partial
  tests:
  - file: src/routes/route-tree.spec.ts
    name: renders each route through exactly its own placeholder, and no route through another's
  why: the suite runs in Vitest's node environment and never navigates or renders; it inspects the statically-assigned
    route.options.component on the router's registered route objects. The component-identity half is exercised
    structurally; actually navigating and observing a placeholder appear in a DOM is unexercised.
- criterion: No route composes a layout beyond its own placeholder content in this task.
  state: uncovered
  why: no test inspects a route's rendered output for extra wrapping/layout markup around its placeholder;
    route-tree.spec.ts only compares router.routesById's registered fullPath and component references,
    never rendered DOM content.
- criterion: The router is wired as the single RouterProvider mounted at the app's entry point, using
    @tanstack/react-router at the version TUI already pins (^1.95.0).
  state: uncovered
  why: no test renders or inspects the app's entry point to confirm a single RouterProvider is mounted
    there, and no test reads package.json or an installed module's version to confirm the ^1.95.0 pin.
- criterion: The sidebar lists exactly three top-level entries -- Cases, Glossary, Capabilities -- and
    no Hypotheses entry, per the proposal's section 2.10 decision.
  state: covered
  tests:
  - file: src/shared/components/app-shell.spec.ts
    name: lists exactly the three sidebar entries Cases, Glossary and Capabilities, with no Hypotheses
      entry
- criterion: Each sidebar entry links to its screen's route from the router skeleton task.
  state: covered
  tests:
  - file: src/shared/components/app-shell.spec.ts
    name: links each sidebar entry to its own real route
- criterion: The topbar renders a breadcrumb through TUI's Breadcrumb primitive reflecting the currently
    matched route, not a hand-derived path string.
  state: partial
  tests:
  - file: src/shared/components/app-shell.spec.ts
    name: renders the breadcrumb through TUI's Breadcrumb primitive, reflecting the currently matched
      route
  - file: src/shared/components/app-shell.spec.ts
    name: updates the breadcrumb when a different route is current, rather than a fixed string
  why: the not-a-fixed-string half is proven directly (breadcrumb text changes between /cases and /glossary).
    The through-Breadcrumb-primitive half is only inferred from an accessible landmark (role=navigation,
    name=breadcrumb); a hand-rolled nav reproducing that same accessible name would pass this test too,
    so component identity itself is not excluded.
- criterion: The topbar displays a fixed, always-visible "No auth in this build" indicator regardless
    of which route is active.
  state: covered
  tests:
  - file: src/shared/components/app-shell.spec.ts
    name: shows the fixed no-auth indicator regardless of which route is current
- criterion: The AppShell wraps every route the router skeleton defines, so no screen renders outside
    it.
  state: partial
  tests:
  - file: src/shared/components/app-shell.spec.ts
    name: wraps the matched route's own content with the sidebar and topbar rather than replacing them
  why: only one route (/cases) of a small, hand-built three-route test router is exercised; no test renders
    AppShell against the actual ten-route tree router-skeleton defines, and none confirms the app's real
    entry point wires AppShell as the root wrapping those ten routes.
- criterion: A single module-level QueryClient instance is created with retry:1 and no staleTime set on
    the client itself.
  state: partial
  tests:
  - file: src/services/query-client.spec.ts
    name: is a QueryClient instance
  - file: src/services/query-client.spec.ts
    name: retries a failed query exactly once by default
  - file: src/services/query-client.spec.ts
    name: leaves staleTime unset on the client itself, deferring it to each query
  why: 'retry:1 and the absence of client-level staleTime are directly asserted. The single-module-level-instance
    half is unexercised: no test checks that the exported queryClient is the same reference used elsewhere
    in the app, or that only one is ever constructed.'
- criterion: The QueryClient's QueryCache declares an onError handler that fires a sonner toast.
  state: covered
  tests:
  - file: src/services/query-client.spec.ts
    name: toasts the thrown Error's own message
  - file: src/services/query-client.spec.ts
    name: toasts a fallback string, rather than throwing, when the rejection carries no Error
- criterion: Exactly one Toaster component is rendered in the app, mounted inside the AppShell.
  state: covered
  tests:
  - file: src/shared/components/toaster-mount.spec.ts
    name: renders exactly one sonner Toaster for every routed screen
- criterion: The QueryClientProvider wraps the routed app so every screen shares the same QueryClient
    instance.
  state: uncovered
  why: no test in the set imports or exercises QueryClientProvider at all; nothing renders the routed
    app tree and confirms a query consumer on two different screens reads from the same client instance.
- criterion: The installed @tanstack/react-query version matches TUI's pinned ^5.62.0.
  state: uncovered
  why: no test reads package.json or an installed package's version.
- criterion: A non-2xx response whose body matches the {error:{code,message,details?}} envelope is parsed
    into an ApiError exposing code, message and details.
  state: covered
  tests:
  - file: src/services/api-client.spec.ts
    name: rejects with an ApiError carrying the envelope's own code and message for a non-2xx response
  - file: src/services/api-client.spec.ts
    name: carries the envelope's details on the parsed ApiError when the response includes them
- criterion: ApiError.code holds exactly the thrown error's class name string as the backend sends it
    (e.g. "CaseNotFoundError"), never a re-derived enum value.
  state: covered
  tests:
  - file: src/services/api-client.spec.ts
    name: rejects with an ApiError carrying the envelope's own code and message for a non-2xx response
- criterion: ApiError.details is present on the parsed ApiError only when the response envelope's details
    field is present.
  state: covered
  tests:
  - file: src/services/api-client.spec.ts
    name: carries the envelope's details on the parsed ApiError when the response includes them
  - file: src/services/api-client.spec.ts
    name: leaves details absent as an own property when the response envelope carries none
- criterion: A successful (2xx) response reaches the caller without being wrapped as an ApiError.
  state: covered
  tests:
  - file: src/services/api-client.spec.ts
    name: resolves with a 2xx response's JSON body unwrapped
- criterion: The client is the one fetch wrapper this wave's code calls the backend through; no second
    envelope-parsing path exists.
  state: uncovered
  why: this is a claim about the rest of the codebase; no test searches or exercises any other call site,
    so exclusivity of this fetch wrapper is unexercised.
- criterion: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError
    each map to their own 404-appropriate UI state.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotAnsweredError to the concept-not-answered state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotHeldError to the concept-not-held state
  - file: src/services/error-ui-state.spec.ts
    name: resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state
  - file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
- criterion: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError
    each map to their own 409-appropriate UI state.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseAlreadyHasDraftError to the case-already-has-draft state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestPositionOccupiedError to the manifest-position-occupied state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftError to the case-version-not-draft state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state
  - file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
- criterion: CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each map to their own
    422-appropriate UI state.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotReleasableError to the case-version-not-releasable state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state
  - file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
- criterion: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError
    all map to the same generic fallback UI state, since the backend returns them as an indistinguishable
    INTERNAL_ERROR.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsNoDraftError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotInGlossaryError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptRefusesSubjectTypeError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError to the shared generic-error state
- criterion: An ApiError.code the table does not name also resolves to the same generic fallback UI state
    rather than throwing.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
- criterion: The table's fourteen named keys match exactly the class names in src/src/errors/status-map.ts,
    with no re-derived or renamed key.
  state: uncovered
  why: no test reads src/src/errors/status-map.ts or cross-checks the table's key set against it; the
    suite exercises fourteen named classes individually but never asserts these are the exhaustive, unrenamed
    set the backend's status map declares.
- criterion: ConflictBanner renders through TUI's Banner primitive rather than new banner markup.
  state: partial
  tests:
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders through Banner's own markup, carrying the banner landmark, rather than bespoke conflict
      markup
  why: the test observes only the resulting banner ARIA landmark and heading role; it does not inspect
    that ConflictBanner actually composes TUI's Banner component, so hand-rolled markup reproducing the
    same accessible structure would also pass.
- criterion: ConflictBanner accepts a title and a message and renders both.
  state: covered
  tests:
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders the given title as Banner's own heading
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders the given message as visible text, carried through as Banner's subtitle
- criterion: ConflictBanner reuses Banner's existing accent prop to signal a conflict, rather than adding
    a parallel styling mechanism.
  state: uncovered
  why: no test in conflict-banner.spec.ts exercises or asserts anything about an accent prop; consistent
    with the implementation record's disclosed met:false for this criterion, a stated non-satisfaction
    rather than a testing oversight.
- criterion: ConflictBanner is exported from a shared location importable by any future screen, with no
    screen-specific code inside it.
  state: uncovered
  why: no test inspects the module's export location or checks the component's props/body for the absence
    of screen-specific logic.
- criterion: The hook exposes exactly the eight events section 3's catalog names, each as its own callable.
  state: covered
  tests:
  - file: src/hooks/use-telemetry.spec.ts
    name: exposes exactly the eight cataloged events, each as its own callable
- criterion: Calling any one of the eight does not call any of the other seven.
  state: covered
  tests:
  - file: src/hooks/use-telemetry.spec.ts
    name: calling $key triggers console.info exactly once, so none of the other seven fires alongside
      it
- criterion: Each call's console.info output is namespaced with a consistent prefix identifying it as
    a telemetry event, rather than a bare message.
  state: covered
  tests:
  - file: src/hooks/use-telemetry.spec.ts
    name: calling $key emits a console.info call namespaced telemetry:$eventName carrying its payload
- criterion: No network call or real telemetry endpoint is invoked -- the sink is console.info only, matching
    the decision recorded in temp/frontend-console-decisions.md.
  state: partial
  tests:
  - file: src/hooks/use-telemetry.spec.ts
    name: never invokes fetch for any of the eight cataloged events
  why: only global fetch is spied on and asserted unused; no test rules out other network primitives (XMLHttpRequest,
    navigator.sendBeacon, WebSocket) being used as a sink instead.
- criterion: The table is composed over TUI's Table/TableHeader/TableBody/TableRow/TableHead/TableCell
    primitives rather than new markup.
  state: uncovered
  why: every assertion queries by native table roles (table, columnheader, row, cell), which hand-rolled
    semantic table markup would produce identically; nothing distinguishes TUI's own primitives from equivalent
    hand-rolled markup.
- criterion: Clicking a row triggers a caller-supplied navigation callback, not a hand-rolled anchor per
    row.
  state: covered
  tests:
  - file: src/shared/components/status-table.spec.ts
    name: calls onRowClick with exactly the clicked row's data, not another row's
  - file: src/shared/components/status-table.spec.ts
    name: renders no anchor element for a clickable row
  - file: src/shared/components/status-table.spec.ts
    name: activates onRowClick when Enter is pressed on the row
  - file: src/shared/components/status-table.spec.ts
    name: activates onRowClick when Space is pressed on the row
  - file: src/shared/components/status-table.spec.ts
    name: does not activate onRowClick for a key other than Enter or Space
  - file: src/shared/components/status-table.spec.ts
    name: gives a row with no onRowClick neither an interactive role nor a tab stop
- criterion: Any status value rendered in the status column carries both a color and a word, never color
    alone or word alone.
  state: partial
  tests:
  - file: src/shared/components/status-table.spec.ts
    name: renders a status cell's color indicator together with its label
  - file: src/shared/components/status-table.spec.ts
    name: never renders a color indicator for a value carrying only a color and no label
  why: the color-alone half is exercised; the word-alone half is not -- no test supplies a status value
    carrying a label but no color to confirm that case is likewise never rendered as a bare, indicator-less
    word.
- criterion: The component takes its columns and rows as data rather than hard-coding Cases, Glossary
    or Capabilities-specific fields.
  state: covered
  tests:
  - file: src/shared/components/status-table.spec.ts
    name: renders a header cell labeled for each given column
  - file: src/shared/components/status-table.spec.ts
    name: renders a table row per given row with each column's value as a cell
  - file: src/shared/components/status-table.spec.ts
    name: renders an empty cell rather than throwing when a row lacks a given column's field
  - file: src/shared/components/status-table.spec.ts
    name: renders a plain, non-status cell value as itself with no color indicator
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
findings:
- pass: standard
  file: src/services/query-client.ts
  where: the QueryCache's onError handler
  cites: API-02
  evidence: "onError: (error) => {\n      toast.error(error instanceof Error ? error.message : \"Something\
    \ went wrong while loading data.\");\n    },"
  cost: This is the one place every background query failure surfaces, and it decides what the user sees
    by inspecting the thrown value here rather than going through error-ui-state.ts's named mapping (uiStateForApiError)
    -- the module that exists for exactly this purpose and is otherwise only exercised by its own spec
    file. A raw ApiError's backend message is toasted unchanged, so two failures the mapping table treats
    as distinct states (or as the shared generic-error state) are shown however their own message happens
    to read, and the next call site that also needs a mapped state has no reason to look here first --
    this handler already shows it found its own answer inline.
  correction: Route the caught error through uiStateForApiError (or an equivalent lookup keyed the same
    way) before deciding what to toast, so this handler answers to the one named mapping instead of reading
    the error's message directly.
- pass: conformance
  file: src/shared/components/app-shell.tsx
  where: Topbar(), the StatusBar's right slot
  evidence: right={<span>No auth in this build</span>}
  cost: The user-facing disclosure that the system runs with no authentication is a fact about what the
    system tells someone. The specification node this task implements (constraints/no-route-enforces-authentication)
    states the backend fact only; it does not itself say this must be surfaced in the UI, or in what words.
    The wireframe in docs/frontend-triage-console-proposal.md (section 0, and the ASCII layout showing
    "[No auth in this build]") does state this literally, and app-shell's own task criteria (sourced from
    that material) require it -- so this is not an invented fact -- but the specification node itself
    carries no reference back to that UI-disclosure requirement, so the literal wording lives in exactly
    one place (this component) with nothing in the specification tying the two together; if the constraint
    is ever amended (a route starts enforcing auth), nothing here is structurally linked to that change.
  correction: Either the constraint node itself states, as part of what it holds, that this fact is disclosed
    to the user (so a reader finds the UI obligation there too), or the record stays as is with this noted
    as a second home for the fact, acceptable because the wording traces to the material rather than to
    invention.
---

## What it is
A four-pass review over the 8 delivered tasks of frontend-console-foundation (onda 1): router-skeleton, app-shell, query-client-and-toaster, typed-api-client, error-to-ui-state-table, conflict-banner, telemetry-catalog-hook, reusable-status-table. The captured run (run/frontend-console-foundation-onda-1-full-suite-2) passed all 8 registry steps (install, typecheck, lint, style, build, a11y, secret-scan, test) with 71/71 tests passing, so the failures pass has nothing to diagnose and did not run.

## Notes
Trace (`trace.py --check frontend/app`, which reads the one shared trace file at the repository's git toplevel, covering both targets): 6 pre-existing `code`-class drift findings, all under the backend target (`src/src/case/author-case-version.service.ts`, `src/src/factories/author-case-version.factory.ts`, both no longer existing) -- unrelated to this review's file set or to any task in this batch, and not introduced by this delivery. This review adds one new, clean binding: `constraints/no-route-enforces-authentication` -> `src/shared/components/app-shell.tsx`, bound via `trace.py --bind-record` against this delivery's own implementation record, with 0 drift over it. 0 orphaned, 0 moved.

The standard pass found 24 rules in scope over this file set (ARC-01, ARC-03, ARC-04, STA-01, STA-03, API-01, API-02, API-03, API-04, EDG-01 through EDG-04, ACC-04, ACC-06, ACC-07, ACC-08, ACC-11, ENV-02, SEC-05, TYP-04, PRF-02, PRF-04, TST-02, TST-03) and returned one finding (API-02, above). All artifacts the registry presupposes stand against frontend/app (package.json, tsconfig.json, eslint.config.js, vite.config.ts, playwright.config.ts, stylelint.config.js, src/design-system/tokens.css) -- none absent, so no rule went unanswered for want of substrate. Every rule the registry marks tool-decided (33 total: a11y 2, lint 21, secret-scan 1, style 8, typecheck 1) had its deciding step run and pass in the captured suite (a11y, lint, secret-scan, style, typecheck all exited 0) -- a passing step settles only that the command exited 0, not that it was configured to decide every rule resting on it, which is the registry's own fact to hold.

This review's own file set (`reviewed`) is exactly the union of `files` and `tests[].file` across the 8 implementation and proof records, resolved against frontend/app as the target source root -- read straight out of those records, never discovered.

What this review does not cover: the 9th task of this work root (`build-substrate`, under a different epic, `case-authoring-console`) was reviewed separately in `review/frontend-bootstrap.md` and is not re-reviewed here. Ondas 2 through 6 of the wider plan have not been implemented and are out of scope for this review by construction.

Repairs, as routes rather than as a reading of the findings: the API-02 finding and every `uncovered`/`partial` coverage entry above are answered by `/implement-task` over the same task, adding the missing test or the missing wiring, or by a fresh proof under implement-task's narrower re-delivery mode where only the proof needs to move. `conflict-banner`'s two `uncovered` criteria that trace to its already-disclosed `met: false` (the accent criterion) or to an untested claim about its export location are not defects this review is asking to be fixed silently -- the first is a standing, documented decision (temp/frontend-console-decisions.md); the second is ordinary missing coverage. The conformance finding over app-shell.tsx's no-auth text is answered, if a person judges it worth answering, either by amending the constraint node through `/analyse` to state the disclosure as part of what it holds, or by leaving the record as is.
