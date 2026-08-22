---
title: Proof for the Hypotheses tab and its revision-history view
summary: Twenty tests across three new spec files (plus a shared test-support module) prove hypotheses-tab's
  seven criteria -- the new Hypotheses tab beside Versions, the hypothesis list and its total-derived
  Revisions count, the expand/collapse into a hypothesis's own revision history, and that history's current/frozen
  labeling with its Revise link -- while confirming the pre-existing case-detail-screen.spec.ts needed
  no changes because the Versions tab stays selected and mounted by default.
implementation: sha256:f862bfd71c5d4bb7df54f02a35bd3d7e673123d592375e9519a857880370ee74
run: run/manifest-hypothesis-authoring-onda-4-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
  name: renders a Hypotheses tab beside the existing Versions tab, with Versions selected by default
  proves: Case Detail renders a "Hypotheses" tab beside "Versions", using the existing tabs component,
    never as a top-level sidebar entry.
  fails_when: the Hypotheses tab trigger is absent from the tab strip, or Versions is not the tab initially
    marked aria-selected="true"
- file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
  name: renders the Hypotheses tab's own content in place of the Versions tab's when Hypotheses is selected
  proves: criterion 1's own "using the existing tabs component" clause -- selecting a tab mounts that
    tab's own content and unmounts the other's
  fails_when: the Versions tab's own "New draft" link is still present after Hypotheses is selected, or
    the Hypotheses tab's own content never mounts
- file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
  name: re-mounts the Versions tab's own content when switching back to it from Hypotheses
  proves: the tab strip genuinely toggles both ways rather than only ever revealing Hypotheses once selected
  fails_when: switching back to Versions fails to remount its own content, or the Hypotheses tab's own
    content stays visible alongside it
- file: src/routes/case-hypotheses-tab.spec.ts
  name: lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the case, by name
  proves: The Hypotheses tab lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the case,
    by name.
  fails_when: the rendered rows do not number exactly one per returned hypothesis, or a row's own name
    text is missing or wrong
- file: src/routes/case-hypotheses-tab.spec.ts
  name: shows each hypothesis's Revisions count as the endpoint's own total, never the length of the page
    it returned
  proves: Each listed hypothesis's Revisions count is the total GET /v1/cases/{slug}/hypotheses/{name}/revisions
    reports for that hypothesis, not the length of a single returned page.
  fails_when: a row's Revisions cell shows the page length (1) instead of the endpoint's own total (5)
    for a hypothesis whose page and total differ
- file: src/routes/case-hypotheses-tab.spec.ts
  name: shows an em dash for a hypothesis's own Revisions count when that hypothesis's own revisions fail
    to load, without blocking the rest of the row
  proves: the implementation's own per-row degrade branch (a failed per-hypothesis revisions request renders
    "—" rather than blocking or crashing the row)
  fails_when: the failing hypothesis's own Revisions cell shows something other than "—", or the sibling
    hypothesis's own correct total fails to render alongside it
- file: src/routes/case-hypotheses-tab.spec.ts
  name: renders that hypothesis's own revision-history view when its row is selected
  proves: Selecting a hypothesis row navigates to, or expands into, that hypothesis's own revision-history
    view. (expand half)
  fails_when: selecting a row does not swap in the revision-history view, or the hypotheses list's other
    rows remain visible alongside it
- file: src/routes/case-hypotheses-tab.spec.ts
  name: returns to the hypotheses list when Back to hypotheses is clicked from the revision-history view
  proves: criterion 4's own round trip -- the expand is not one-way
  fails_when: clicking Back to hypotheses fails to bring back the hypotheses list, or the revision-history
    view's own controls remain rendered afterward
- file: src/routes/case-hypotheses-tab.spec.ts
  name: shows a loading placeholder before the hypothesis list arrives
  proves: the loading state this component renders ahead of criterion 2's own list, matching EDG-01
  fails_when: no loading text renders while the request is still pending, or a table renders before data
    arrives
- file: src/routes/case-hypotheses-tab.spec.ts
  name: shows a failure placeholder with a retry action when the hypothesis list fails to load
  proves: the load-failure state this component renders, matching EDG-02
  fails_when: no failure message or Retry action renders after the hypothesis-list request rejects
- file: src/routes/case-hypotheses-tab.spec.ts
  name: renders an explicit empty state when the case has originated no hypotheses
  proves: the empty-collection edge case for criterion 2's own row-per-hypothesis mapping (API-04)
  fails_when: an empty response renders a table with zero rows or throws, instead of the explicit empty-state
    text
- file: src/routes/hypothesis-revision-history.spec.ts
  name: lists every revision the endpoint returns, each showing its own revision number, criterion and
    collects, as a closed, non-editable block
  proves: The revision-history view lists every revision GET /v1/cases/{slug}/hypotheses/{name}/revisions
    returns for that hypothesis, each rendered as a closed, non-editable block showing its own revision
    number, criterion and collects.
  fails_when: the rendered rows do not number exactly one per returned revision, a row's own text is missing
    or wrong, or any textbox renders in the view
- file: src/routes/hypothesis-revision-history.spec.ts
  name: labels the revision holding the highest revision number current and every other one frozen
  proves: The revision holding the highest revision number is labeled "current"; every other revision
    is labeled "frozen".
  fails_when: the highest-numbered revision's own row is not labeled "current", or any lower-numbered
    revision's own row is not labeled "frozen"
- file: src/routes/hypothesis-revision-history.spec.ts
  name: renders "Revise →" only on the revision labeled current
  proves: criterion 7's rendering half -- "Revise ->" is rendered only on the revision labeled "current"
  fails_when: '"Revise →" is missing from the current revision''s own row, or present on any frozen revision''s
    own row'
- file: src/routes/hypothesis-revision-history.spec.ts
  name: addresses the Revise link with this hypothesis's own name and the case's own highest version number,
    regardless of the order the versions were returned in or which one is a draft
  proves: criterion 7's navigation half, together with the implementation's own disclosed inference that
    the target version addressed is the case's own highest version number
  fails_when: the link's href does not equal the expected path, or resolves to a version other than the
    highest one GET .../versions returned
- file: src/routes/hypothesis-revision-history.spec.ts
  name: shows a loading placeholder before the revisions and the case's versions both arrive
  proves: the loading state this component renders ahead of criteria 5-7, matching EDG-01
  fails_when: no loading text renders while either request is still pending, or a table renders before
    both have arrived
- file: src/routes/hypothesis-revision-history.spec.ts
  name: shows a failure placeholder with a retry action when loading revisions fails
  proves: the load-failure state this component renders, matching EDG-02
  fails_when: no failure message or Retry action renders after the revisions request rejects
- file: src/routes/hypothesis-revision-history.spec.ts
  name: treats a hypothesis with zero revisions as a load failure rather than an empty state
  proves: 'the task''s own Notes: a hypothesis with zero revisions is impossible by the domain, so no
    empty state is designed for the revision-history view -- rendered as the same failure branch as a
    real load error'
  fails_when: an empty revisions response renders an empty table or throws, instead of the failure message
- file: src/routes/hypothesis-revision-history.spec.ts
  name: treats a case with zero versions as a load failure rather than an empty state
  proves: the same Notes-stated design decision, exercised over the versions half of the same OR condition
    rather than the revisions half
  fails_when: an empty versions response renders an empty or broken view instead of the same failure message
- file: src/routes/hypothesis-revision-history.spec.ts
  name: calls onBack when Back to hypotheses is clicked
  proves: the onBack contract this component exposes to its own caller, which criterion 4's own round
    trip depends on
  fails_when: clicking Back to hypotheses does not call the passed-in onBack callback exactly once
not_applicable:
- edge_case: a boundary at either end of a numeric range
  why: no criterion of this task bounds a count of hypotheses, a count of revisions, or a version number
- edge_case: a duplicate among the returned hypotheses or revisions
  why: uniqueness of a hypothesis's own name and of a revision number is a fact about the store's own
    invariants, not something this read-only tab enforces or is asked to test for
- edge_case: an operation attempted against state that forbids it
  why: this task's own Notes state that "Revise ->" is rendered unconditionally regardless of whether
    the case currently holds a draft, and a CaseHoldsNoDraftError surfacing after the link is followed
    is revise-hypothesis-form's own generic-failure handling, not a gate this task adds
- edge_case: two operations against one subject at once
  why: this task ships no write operation of its own -- every request it issues is a GET, rendered read-only
- edge_case: absent slug input
  why: slug reaches CaseHypothesesTab as a prop from CaseDetailScreen's own useParams; the route itself
    cannot match with no slug segment
untested:
- 'the never-as-a-top-level-sidebar-entry clause of criterion 1 is not directly asserted: these tests
  never mount AppShell''s own sidebar navigation'
- the "…" placeholder a hypothesis's own Revisions cell shows while that hypothesis's own revisions request
  is still pending is not directly asserted -- the criterion-3 tests exercise only the resolved-total
  and failed-request branches
- the color class each of the "current"/"frozen" status cells carries (bg-success/bg-muted-foreground)
  is not asserted, only the label text criterion 6 itself states
- criterion 7's full clause -- that following "Revise ->" actually renders a form pre-loaded from this
  revision's own criterion, collects and resolution -- is not exercised end-to-end in this proof; the
  pre-population half is proven separately, by revise-hypothesis-form's own already-delivered proof
---

## What it is
Twenty tests across three new spec files (case-detail-screen-hypotheses-tab.spec.ts, case-hypotheses-tab.spec.ts, hypothesis-revision-history.spec.ts) prove hypotheses-tab's seven criteria; the pre-existing case-detail-screen.spec.ts needed no changes since the Versions tab stays selected and mounted by default.

## Notes
This task ran concurrently with task/manifest-hypothesis-authoring/manifest-builder; route-tree.tsx changed on disk from that sibling task partway through writing these tests, confirmed not to affect anything this proof exercises (this task's own files never touch route-tree.tsx).
