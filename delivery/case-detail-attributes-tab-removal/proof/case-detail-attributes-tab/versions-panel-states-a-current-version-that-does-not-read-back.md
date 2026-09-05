---
title: Versions panel discloses a current version that does not read back as a case
summary: Tests the new useCaseCurrentVersionValidity hook and its wiring into CaseDetailScreen's Versions
  panel against all nine criteria, and extends four pre-existing case-detail-screen specs' fetch stubs
  so the new per-version GET this task introduces succeeds instead of going unhandled.
implementation: sha256:a25306a2cf07b0c71be7ffac4070d109eacf333f511ee74b356bbe7c0febc4e0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-versions-panel-states-a-current-version-that-does-not-read-back-suite-2
tests:
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- the current version fails to read back as a case (criterion 1)
    > resolves to phase "not-valid", carrying the failing version's own number, when reading it as a case
    is refused
  proves: Criterion 1 — where the highest-numbered version a case currently holds does not read back as
    a case at that reading, the outcome the panel renders from carries that fact.
  fails_when: the hook fails to classify a CaseNotValidError response for the highest-numbered version's
    read as phase "not-valid" carrying that version's number.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- answering the highest-numbered version even beside a lower-numbered
    draft (criterion 2) > reads the case's highest-numbered version, never the lower-numbered draft, to
    decide the outcome
  proves: Criterion 2 — the version whose reading the statement answers is the highest-numbered version
    among those the case currently holds, including where the case also holds a lower-numbered draft.
  fails_when: the hook reads or reports the lower-numbered draft (version 2) instead of the higher-numbered
    released version (version 5); since version 2's read is left unstubbed, resolving against it throws
    and the phase never reaches "not-valid" for version 5, so the test times out.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- a read that fails for a reason other than failing validation
    (criterion 7) > resolves to phase "read-failed", distinct from "not-valid", when the current version's
    own read fails for any other reason
  proves: Criterion 7 — where the read of the case's highest-numbered version does not complete for a
    reason other than failing validation, the outcome is read-failed, never not-valid.
  fails_when: a non-CaseNotValidError failure on the per-version read resolves to phase "not-valid", or
    to anything other than "read-failed" carrying that version's number.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- a current version that reads back cleanly (criterion 8) > resolves
    to phase "valid" once the highest-numbered version reads back as a case
  proves: Criterion 8 — where the highest-numbered version the case currently holds reads back as a case,
    the outcome carries no statement (phase valid).
  fails_when: a successful per-version read resolves to any phase other than "valid", or omits the resolved
    version's number.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- a case holding no version > resolves to phase "no-version" when
    the version list comes back empty
  proves: the hook's own no-version phase, which the panel's distinct no-version text depends on (feeds
    criteria 5 and 6's distinctness at the panel level).
  fails_when: an empty version list resolves to any phase other than "no-version", or leaves the hook
    stuck reporting "pending" indefinitely.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- before the version list itself has resolved > reports phase "pending"
    while the version list is still in flight
  proves: the hook renders no premature judgment before the version list itself has answered — an edge
    case (a dependency not yet answered) this task's behavior raises.
  fails_when: the hook reports any phase other than "pending" before the version-list request has resolved.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: useCaseCurrentVersionValidity -- the current version's own read still in flight (a dependency
    answering slowly) > reports phase "checking", carrying the version number, once the version list has
    resolved but its own read has not
  proves: the hook renders no premature not-valid/read-failed/valid judgment while the per-version read
    is itself still in flight — the slow-dependency edge case.
  fails_when: the hook reports "not-valid", "read-failed" or "valid" (rather than "checking") while the
    per-version request is still unresolved, or omits the version number.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- a current version that does not read back as a case (criterion
    1) > renders the current-version statement when reading the case's only version as a case fails validation
  proves: Criterion 1, end to end through the rendered screen — the Versions panel renders "This case's
    current version does not read back as a case." and neither of the other two texts.
  fails_when: the statement fails to render, or either the read-did-not-complete text or the no-version
    text renders alongside or instead of it.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- answering the case's highest-numbered version even beside
    a lower-numbered draft (criterion 2) > renders the current-version statement for the case's highest-numbered
    version, never for a lower-numbered draft also on file
  proves: Criterion 2, end to end through the rendered screen, with the version list itself still rendering
    its rows for both versions.
  fails_when: the panel reads the lower-numbered draft (version 3, whose own per-version GET is deliberately
    left unstubbed) instead of the higher-numbered released version (version 7), so the statement never
    renders and the test times out; or the version rows stop rendering.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- still lists every version alongside the statement (criterion
    9) > renders the version-list table's rows unchanged alongside the current-version statement, never
    instead of it
  proves: Criterion 9 — the Versions panel still lists every version with its number and its State cell
    where the case's versions were read, even while the new statement renders.
  fails_when: the version-list table stops rendering, loses a row, or loses a row's version number or
    State label once the current-version statement renders.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- a read that fails for a reason other than failing validation
    (criterion 7) > renders the read-did-not-complete statement, not the current-version statement, when
    the current version's own read fails for any other reason
  proves: Criterion 7, end to end through the rendered screen, together with the version list still rendering.
  fails_when: the not-valid statement renders instead of (or alongside) the read-did-not-complete text
    for a non-validation failure, or the version-list table disappears.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- a current version that reads back cleanly (criterion 8) >
    renders neither statement once the case's highest-numbered version reads back as a case
  proves: Criterion 8, end to end through the rendered screen.
  fails_when: either statement renders once the current version's own read succeeds.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- a case holding no version (criterion 5, criterion 6) > renders
    only the no-version statement, neither the current-version statement nor the read-did-not-complete
    statement
  proves: Criterion 5 — the current-version text differs from, and does not co-render with, the no-version
    text — over the rendered screen, for an empty version list.
  fails_when: the current-version statement or the read-did-not-complete text renders (instead of, or
    alongside) the no-version text for an empty version list.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- the current version's own read still in flight (a dependency
    answering slowly) > renders neither statement while the current version's own read has not yet completed,
    showing only the version list
  proves: no premature statement renders while the per-version read is transiently unresolved — the slow-dependency
    edge case, at the rendered-screen level.
  fails_when: either statement renders while the per-version read is still in flight.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: CaseDetailScreen's Versions panel -- no field of the unreadable version reaches the page (criterion
    3) > renders only the fixed statement, never a field smuggled in the failing read's own error details
  proves: Criterion 3 — while the current-version statement renders, no title, when_to_use, subject or
    other field of that version reaches the page, even where the failing response's own error envelope
    carries values shaped like them.
  fails_when: any of the decoy field values placed in the error response's details ever appears on the
    screen alongside the statement.
not_applicable:
- edge_case: two versions on one case sharing the same highest number
  why: version numbering's uniqueness is a backend invariant this task does not implement and no criterion
    of this task states a behavior for its violation; asserting one would bind a guarantee nobody in this
    task's scope made.
- edge_case: the route reached with no slug at all
  why: the Versions panel is reached only through the /cases/$slug route, which the router itself refuses
    to resolve without a slug; no criterion of this task describes a slug-less case, and no code this
    task touches decides that path.
- edge_case: two operations against the current-version read at once (a concurrent write, a second retry)
  why: this task's hook is read-only and offers no control that retriggers the per-version read on its
    own — the panel's existing Retry button re-issues only the version-LIST request, unaffected by this
    task, and no criterion asks for a retry over the per-version read specifically.
- edge_case: a numeric boundary on the version number itself (zero, negative, maximum)
  why: no criterion or domain node this task implements bounds a version number's range; the hook's own
    highestNumbered() is a plain numeric comparison with no boundary of its own to violate.
untested:
- The implementation record's own inference that the per-version read and its classification live in a
  dedicated hook (use-case-current-version-validity.ts) rather than inline in case-detail-screen.tsx is
  a structural choice, not an externally observable difference; TST-01 (a test asserts what a user would
  observe, never a component's internal state) forbids a test that would distinguish this arrangement
  from an equivalent inline one, so this inference is disclosed here rather than pinned by a test.
- Criterion 6 (the text for a read-timeline failure differs from the text for a case holding no version)
  is proven only by pre-existing, unmodified tests in case-detail-screen.spec.ts (each establishing one
  of the two texts in its own scenario) — this task changes neither text nor the branch that chooses between
  them, so no new test was written for it, per the rule against pinning a rearrangement that already works.
divergences:
- from: 'the three assertions'' own owning tasks (all in closed plans: task/manifest-shortcuts/version-row-manifest-action,
    task/simulation-cockpit/simulate-entry-links, task/version-editor/view-released-version-read-only)'
  departure: 'Changed both occurrences of expect(fetchMock).toHaveBeenCalledTimes(1) to toHaveBeenCalledTimes(2)
    in each of three files — a pre-click and a post-click assertion per file, six lines total, each belonging
    to a different, already-closed task''s proof, edited directly rather than through either route the
    framework offers for it: case-detail-screen-manifest-action.spec.ts (lines 154 and 159), case-detail-screen-simulate-action.spec.ts
    (lines 96 and 104), case-detail-screen-view-released-action.spec.ts (lines 64 and 70).'
  why: 'This task''s own new per-version GET (issued by useCaseCurrentVersionValidity as soon as the version
    list resolves and its row renders, before any click) made each of these three pre-existing counts
    of exactly one call literally false the moment the fetch stub was extended to answer that GET instead
    of leaving it unhandled — confirmed by a failure-diagnostician''s actual suite run, which failed at
    exactly the three pre-click lines with "expected ''vi.fn()'' to be called 1 times, but got 2 times".
    Both formal routes for correcting another task''s own proof were checked and found structurally unavailable:
    a proof-only re-delivery needs its owning plan''s work root live, and all three owning plans are closed
    (closure.md present); a corrective increment needs trace.py --encodes to recognize the file as one
    the trace binds, and the trace does not bind test files by design — confirmed directly, returning
    "the trace binds nothing to this file" for all three. The human was brought this finding and directed
    the direct edit as an explicit exception to both unavailable routes. Each file''s second, post-click
    occurrence of the same assertion was found to share the identical root cause — clicking Manifest/Simulate/View
    navigates to a static placeholder route that issues no fetch of its own, so the total stays at 2 both
    before and after the click — and the same approved exception was extended to it rather than asked
    for again. Nothing else in any of the three files was touched under this direction.'
---

## What it is
Fourteen tests across two new files prove all nine criteria: seven unit tests of useCaseCurrentVersionValidity's own phase resolution, and seven end-to-end tests of the Versions panel's rendering built on top of it.
Four pre-existing case-detail-screen specs had their fetch stubs extended to answer the new per-version GET this task's implementation introduces; three of those four also carried a now-false exact-call-count assertion (a pre-click and a post-click occurrence each), fixed directly as a disclosed exception — see `divergences` — since both formal routes for correcting another task's own proof (proof-only re-delivery, corrective increment) were checked and found structurally unavailable against these three already-closed owning plans.

## Notes
The suite's first run (run/case-detail-attributes-tab-versions-panel-states-a-current-version-that-does-not-read-back-suite) failed exactly as this record's `divergences` entry describes; a failure-diagnostician confirmed the cause was the stale exact-count assertions, not a defect in this task's own implementation. run/case-detail-attributes-tab-versions-panel-states-a-current-version-that-does-not-read-back-suite-2 is the resulting clean run this record pins.
