---
title: Review of manifest-shortcuts
summary: Four-pass evidence over the two delivered tasks of the epic manifest-shortcuts — coverage, specification conformance (via reconciliation), standard conformance, and a captured run that passed cleanly.
reviewed:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  - src/hooks/use-hypothesis-revision-form-manifest-shortcut.spec.ts
  - src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  - src/routes/case-detail-screen.tsx
  - src/routes/case-detail-screen-manifest-action.spec.ts
  - src/routes/case-detail-screen-view-released-action.spec.ts
  - src/routes/case-hypotheses-tab.test-support.ts
tasks:
  - task/manifest-shortcuts/always-visible-manifest-shortcut
  - task/manifest-shortcuts/version-row-manifest-action
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: the captured run passed every step; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/manifest-shortcuts.md
coverage:
  - criterion: The hypothesis-editing screen in its ready phase, before any save has been made on it, renders a control whose target is the manifest route of the case version the screen was opened on.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: navigates to the manifest of the case version the screen was opened on, before any save is made, when opened for a new hypothesis
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: also renders before a save when the screen was opened to revise an existing hypothesis
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: renders before the hypothesis-name field in reading and tab order, rather than after the form
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: renders no manifest shortcut while the draft and its glossary vocabularies are still loading
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: renders no manifest shortcut when loading the draft's own subject type fails
  - criterion: The control's target is built from the slug and version the screen was opened on, and names no other case version.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: navigates to the manifest of that same case version rather than a hardcoded one, when opened for a different slug and version
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: navigates to the manifest of the case version the screen was opened on, before any save is made, when opened for a new hypothesis
  - criterion: The control reuses the navigate-to-manifest call already built in use-hypothesis-revision-form.ts rather than a second construction of that route.
    state: uncovered
    why: The named test asserts only that the hook's ready state carries an onOpenManifest of type "function"; it never invokes it, so nothing establishes that call navigates to the manifest, and nothing binds the screen's control to it. The reuse itself is a property of how the code is arranged rather than of what the screen does — a control wired to onOpenManifest and a control building the manifest route a second time produce the identical navigation the screen tests observe, so no test in the set fails on the day the reuse stops.
  - criterion: Rendering the control adds no request beyond the two reads the screen already issues.
    state: partial
    tests:
      - file: src/hooks/use-hypothesis-revision-form-manifest-shortcut.spec.ts
        name: carries a callable onOpenManifest in the ready phase while the request set stays exactly the reads the screen already issues
    why: The assertion compares the set of requested GET URLs, and requestedGetUrls in use-hypothesis-revision-form.test-support.ts dedupes through Array.from(new Set(urls)). A request added to a URL already in the set leaves the compared set unchanged and the test green; only a request to a new URL fails it. getCallCountFor(fetchMock, VERSION_PATH) closes that hole for the case-version read alone, so repetition of the other five reads is unexercised. The check also runs over the hook in isolation via renderHook, so "rendering the control" is unexercised at the screen. Separately, the criterion names "the two reads the screen already issues" while the pinned set holds six URLs; which reads the criterion counts is not settled here.
  - criterion: After a save whose answered revision equals the revision the draft's manifest entry pinned going into it, the screen still renders no post-save manifest-builder offer.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: 'leaves the screen with no button offering any route to the manifest, not merely no "Open Manifest Builder" button'
  - criterion: After a save whose answered revision is higher than the revision the draft's manifest entry pinned going into it, the screen still renders the post-save manifest-builder offer.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
        name: offers exactly one route to the manifest — the post-save offer — not the always-visible shortcut as well
  - criterion: Every row the Versions panel renders carries a Manifest action alongside the actions it renders today.
    state: covered
    tests:
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a draft version's row, targeting that row's own manifest route
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a released version's row too, targeted at that row's own manifest route the same way a draft row's is
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: targets each row's own version number, never one row's version repeated on another
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders Continue editing, Simulate and Manifest together on a draft row, replacing neither existing action
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: orders a released row's actions as View, then Simulate, then Manifest, and a draft row's as Continue editing, then Simulate, then Manifest
  - criterion: A row's Manifest action targets the manifest route built from that row's own version number, and not from any other row's version number.
    state: covered
    tests:
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: targets each row's own version number, never one row's version repeated on another
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a draft version's row, targeting that row's own manifest route
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a released version's row too, targeted at that row's own manifest route the same way a draft row's is
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: navigates to that version's own manifest route, issuing no request beyond the versions-list load already made
  - criterion: A row whose version is released carries the Manifest action on the same terms as a row whose version is draft.
    state: covered
    tests:
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a released version's row too, targeted at that row's own manifest route the same way a draft row's is
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: targets each row's own version number, never one row's version repeated on another
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: orders a released row's actions as View, then Simulate, then Manifest, and a draft row's as Continue editing, then Simulate, then Manifest
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: exposes Manifest only as a link, never additionally as a button
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: navigates a released row's Manifest link to a manifest whose entries cannot be moved or removed
  - criterion: The Manifest action is built from the same shared params object actionsForRow already builds for its existing per-row links, adding no second construction of those params.
    state: uncovered
    why: Every assertion in the set reads the rendered href or the navigation it performs, and those are identical whether the action draws on the shared params object or builds a second one from the same row — so nothing in the set fails on the day the sharing stops. The criterion is a condition on how the params reach the action rather than on what the panel renders.
  - criterion: The Manifest action is rendered as a link, the same as the panel's existing per-row actions.
    state: covered
    tests:
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: exposes Manifest only as a link, never additionally as a button
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders Continue editing, Simulate and Manifest together on a draft row, replacing neither existing action
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders a Manifest link on a draft version's row, targeting that row's own manifest route
  - criterion: The panel's existing Continue-editing, View and Simulate actions keep the route targets they have today.
    state: partial
    tests:
      - file: src/routes/case-detail-screen-view-released-action.spec.ts
        name: navigates to the released version's own route, issuing no request beyond the versions-list load already made
      - file: src/routes/case-detail-screen-view-released-action.spec.ts
        name: renders Continue editing and Simulate on a draft version's row, never a View action
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: renders Continue editing, Simulate and Manifest together on a draft row, replacing neither existing action
      - file: src/routes/case-detail-screen-manifest-action.spec.ts
        name: orders a released row's actions as View, then Simulate, then Manifest, and a draft row's as Continue editing, then Simulate, then Manifest
    why: Of the three actions the criterion names, only View has its route target asserted — href equal to /cases/${SLUG}/versions/5 in the click test. Continue editing and Simulate are exercised for presence by role and name, and for position by text content, and nothing in the set reads their href or clicks them, so either one repointed at a different route leaves every test in the set green.
findings:
  - pass: standard
    file: src/hooks/use-hypothesis-revision-form.ts
    where: the useEffect that resets the form once revisionsQuery.data resolves
    cites: STA-01
    evidence: |-
      const latest = latestRevisionOf(revisionsQuery.data.data);
          if (latest === undefined) {
            return;
          }
          form.reset({
            hypothesis_name: hypothesisName,
            criterion: latest.criterion,
            collects: [...latest.collects],
            resolution: latest.resolution,
          });
    cost: criterion, collects and resolution are copied out of react-query's cache into react-hook-form's own internal store. Because the effect keys on revisionsQuery.data, any background refetch that lands while the ready phase is showing re-fires form.reset and silently discards whatever the user has typed since the copy was made — the two stores disagree the moment either one changes.
    correction: read the latest revision from revisionsQuery.data directly where the form needs it, rather than mirroring it into a second, effect-synced copy inside the form.
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: the load-error phase branch
    cites: ARC-01
    evidence: |-
      <section>
              <p>Unable to load this form right now.</p>
              <Button type="button" onClick={state.retryLoad}>
                Retry
              </Button>
            </section>
    cost: TUI's Alert primitive already ships a destructive/warning variant with a title, body and an action slot built for exactly a message-plus-retry pairing, but this hand-rolls the same shape from a bare section/p/Button. A second screen needing the same error-with-retry look reimplements this markup again instead of reaching for Alert, and the two drift the first time either is restyled.
    correction: compose @tui/ui/alert with variant="destructive" and the retry button passed as its action prop, instead of the bespoke section/paragraph markup.
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: the success phase branch
    cites: ARC-01
    evidence: |-
      <p>
              Hypothesis "{state.hypothesisName}" saved as revision {state.revision}.
            </p>
            {state.offerManifestBuilder && (
              <Button type="button" onClick={state.onOpenManifestBuilder}>
                Open Manifest Builder
              </Button>
            )}
    cost: This is the same message-plus-action shape Alert's success variant and action slot exist for, hand-rolled again from a bare paragraph and Button rather than composed from the catalog.
    correction: compose @tui/ui/alert with variant="success" and the manifest-builder button as its action prop.
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: the success phase branch replacing the form after submit
    cites: ACC-07
    evidence: |-
      <p>
              Hypothesis "{state.hypothesisName}" saved as revision {state.revision}.
            </p>
    cost: The whole screen's content is swapped — the form disappears and a confirmation paragraph takes its place — with no aria-live region and no focus moved to the new content. A screen-reader user who submitted the form has no way to know the save succeeded or what revision was recorded unless they go looking.
    correction: wrap the confirmation in an aria-live region, or move focus to it explicitly, when the phase transitions to success.
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: the load-error phase's message text
    cites: API-02
    evidence: '<p>Unable to load this form right now.</p>'
    cost: versionQuery, the glossary queries and revisionsQuery can each fail independently, but the screen collapses all of them to one literal string written at this call site rather than through a shared, named mapping. A second screen facing the same kind of load failure (case-detail-screen.tsx, in this same file set) writes its own different literal instead of reusing one mapping, and the two message wordings are already out of sync.
    correction: route both screens' failure states through one named message-mapping function instead of each writing its own inline string.
  - pass: standard
    file: src/routes/case-detail-screen.tsx
    where: VersionsPanel's isError branch
    cites: ARC-01
    evidence: |-
      <section>
              <p>Unable to load this case's version timeline.</p>
              <Button type="button" onClick={() => void refetch()}>
                Retry
              </Button>
            </section>
    cost: Same message-plus-retry shape Alert's action slot is built for, hand-rolled a second time in this file set rather than composed from the catalog — the two hand-rolled copies (here and in hypothesis-revision-screen.tsx) can now drift from each other independently of Alert.
    correction: compose @tui/ui/alert with variant="destructive" and the retry button as its action prop.
  - pass: standard
    file: src/routes/case-detail-screen.tsx
    where: VersionsPanel's zero-rows branch
    cites: ARC-01
    evidence: '<p>This case currently holds no version.</p>'
    cost: TUI ships an Empty primitive built precisely for a no-data state (icon, title, description, optional action), but this renders a bare paragraph instead — a second empty-list screen has no shared component to reach for and writes its own paragraph too.
    correction: compose @tui/ui/empty for the zero-rows case instead of a bare paragraph.
  - pass: standard
    file: src/routes/case-detail-screen.tsx
    where: VersionsPanel's isError message text
    cites: API-02
    evidence: "<p>Unable to load this case's version timeline.</p>"
    cost: The failure message is a literal string chosen at this call site rather than through a shared, named mapping, worded differently from the literal string hypothesis-revision-screen.tsx chose for its own load failure — exactly the drift the rule exists to prevent.
    correction: route this screen's failure state through the same named message-mapping function hypothesis-revision-screen.tsx would use.
---

## What it is
Coverage, specification-conformance (via reconciliation), standard-conformance and captured-run evidence over the two `manifest-shortcuts` tasks: the always-visible manifest shortcut on the hypothesis-editing screen, and the per-row Manifest action on the case-detail screen's Versions panel.

## Notes
The conformance pass ran as `bin/trace.py --stage --review` over the reviewed file set and the two tasks' implemented nodes, plus every node the trace already binds to any of the eight files — 29 nodes total across the batch. All eight per-file delegations returned no findings; the reconciliation record `siegard-reconcile/manifest-shortcuts.md` folded 25 node-file judgments, 24 of which cleared and were bound (`trace.py --bind-record`), and one which did not: `domain/knowledge/case-version`'s prior binding to `src/routes/hypothesis-revision-screen.tsx` no longer holds — that file's own judge found the fact now held only in `src/hooks/use-hypothesis-revision-form.ts` and `src/routes/case-detail-screen.tsx`, both of which still carry it and remain bound. This is drift the review surfaced rather than a specification violation: nothing states the fact wrongly, one file simply stopped being where it is stated. That pair is released, not restamped; `trace.py --bind ... --replace` over `frontend/app` is the route to state the binding as it now stands, and until then `trace.py --owed frontend/app` reports it as open.

`trace.py --check` before this review's own binds reported the pre-existing drift on this tree; this review's binds restamped the 24 node-file pairs the fold cleared and left 43 other bindings stale (nodes bound to files this review's file set did not reach), reported by `--bind-record`'s own receipt as `code` drift for a later reconciliation, whatever wrote each change — none of it introduced by this review.

The captured run (`run/manifest-shortcuts`) passed every step — install, typecheck, lint, style, build, a11y, secret-scan, test — so the failures pass did not run; there was nothing to diagnose.

The standard pass reviewed the file set against the 24 reading rules `deliver.py --standard --reading --for` resolved for it (the tool-decided rules already ran as suite steps above and reported no failures). Its own `looked_past` note: `case-detail-screen.tsx`'s `toRow`/`actionsForRow` row-shaping reads as the named-adapter pattern ARC-01/API-01 itself sanctions rather than a departure, and `version-manifest-screen.tsx` / `hypothesis-revision-form-fields.tsx` — the screens the exercised UI actually navigates into — sit outside this review's file set, so their own field-level ARIA wiring and the destructive Remove/Move actions the `.spec` files exercise were not reviewed here.
