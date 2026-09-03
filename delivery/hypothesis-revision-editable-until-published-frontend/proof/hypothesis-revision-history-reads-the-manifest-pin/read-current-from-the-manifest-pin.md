---
title: Revision history's "current" row proved against the highest-numbered version's manifest pin
summary: A new spec file exercises all four criteria of this corrective task directly against the manifest
  pin (not the hypothesis's own highest revision), proves the explicit no-entry statement the task's own
  Notes disclosed as a gap and this delivery closed, covers the manifest-read failure edge case the new
  fetch introduces, and repairs the pre-existing suite's fixtures so it keeps passing against the corrected
  dependency.
implementation: sha256:2a7043f032732d447316e840616bc66f5789916cbcf5814a9d4cbaba08dad050
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-history-reads-the-manifest-pin-read-current-from-the-manifest-pin-suite-3
tests:
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: marks the row for the manifest's pinned revision current, not the hypothesis's own highest revision,
    when the pin is lower than that highest revision
  proves: Criterion 1 -- where the highest-numbered version's manifest pins a revision lower than the
    hypothesis's own highest existing revision, the pinned row (not the highest) is marked current.
  fails_when: The row marked current is chosen by the hypothesis's own highest-ever revision (e.g. a Math.max
    over the revisions list, the pre-existing bug) instead of by the manifest's pinned revision, so revision
    7 rather than the pinned revision 3 is marked current.
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: marks the pinned revision's row current when that pin is the hypothesis's own highest existing
    revision
  proves: Criterion 2 -- where the manifest pins the hypothesis's own highest existing revision, that
    revision's row is marked current.
  fails_when: The equality check against the manifest pin regresses (e.g. compares against something other
    than currentPin.pinnedRevision), so the row for revision 7 stops being marked current even though
    the pin equals the highest revision.
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: marks at most one row current -- exactly the row the manifest pins -- even though three revisions
    are shown
  proves: Criterion 3 -- at most one row is marked current, the one the manifest pins.
  fails_when: More than one row is marked current at once (e.g. a fallback that also marks the hypothesis's
    own highest revision current whenever it differs from the pin), so getAllByText('current') returns
    more than one element.
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: renders the Revise action only on the row marked current, addressed at the case's highest-numbered
    version, even when that row is not the highest revision
  proves: Criterion 4 -- where the Revise action is rendered, it is rendered on the row marked current
    and on no other row.
  fails_when: The Revise link is rendered on a row other than the one marked current (e.g. still placed
    on the hypothesis's own highest-numbered revision row), or its href addresses a version other than
    the case's highest-numbered version.
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: states explicitly that the case currently uses no revision of this hypothesis when the highest-numbered
    version's manifest holds no entry for it, rather than marking nothing and saying nothing
  proves: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version's no-entry clause,
    disclosed by the task's own Notes as an UNDERDETERMINED gap and closed by this delivery's own fix
    (the explicit "uses no revision" statement).
  fails_when: pinnedRevisionFor resolves to null and the route renders every row unmarked with no other
    statement, never rendering an explicit 'no revision in use' statement -- the state of the delivery
    before its code-cause fix.
- file: src/routes/hypothesis-revision-history-current-pin.spec.ts
  name: shows the failure state with a retry action when reading the highest-numbered version's manifest
    fails, even though the revisions and the case's versions both loaded
  proves: The manifest-read failure edge case this task's new fetch introduces, and the implementation
    record's own preserved claim that the existing 'Unable to load...' + Retry surface still covers a
    manifest-read failure, including that Retry re-issues the failed manifest fetch and the screen recovers
    to the correct pin.
  fails_when: currentPin's load-error phase is not gated into the route's failure branch, so the table
    renders with no row marked current instead of the retry failure surface; or Retry does not re-issue
    the manifest fetch, so the screen never recovers to the ready state.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: labels the revision holding the highest revision number current and every other one frozen (criterion
    6, pre-existing)
  proves: The pre-existing single-version scenario where the manifest pin happens to equal the hypothesis's
    own highest revision, now driven by an explicit manifest-pin fixture instead of an implicit one, since
    the corrected hook fetches a manifest this fixture did not previously supply.
  fails_when: The row for revision 5 stops being marked current, or rows 1/2 stop being labeled frozen,
    once the manifest is read for the pin.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: renders "Revise →" only on the revision labeled current (criterion 7, pre-existing)
  proves: The pre-existing single-Revise-link scenario, re-grounded on an explicit manifest pin (revision
    5) the corrected hook now requires to resolve at all.
  fails_when: More than one Revise link renders, or it renders on a row other than revision 5.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: addresses the Revise link with this hypothesis's own name and the case's own highest version number,
    regardless of the order the versions were returned in or which one is a draft (pre-existing)
  proves: The pre-existing highest-version-selection scenario across an unordered/mixed-state versions
    list, now supplying the manifest pin at that resolved highest version (5) which the corrected hook
    fetches.
  fails_when: The Revise link's href stops addressing version 5, or the manifest fetch for version 5 is
    never issued so the row never resolves to ready.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: calls onBack when Back to hypotheses is clicked (pre-existing)
  proves: The pre-existing Back-to-hypotheses callback, now reachable again because the ready state resolves
    once the manifest fetch this fixture supplies succeeds.
  fails_when: The screen never reaches the ready state (e.g. the manifest fetch is left unmocked and the
    fetch stub throws), so the Back to hypotheses button never renders and onBack is never reachable.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: lists every revision the endpoint returns, each showing its own revision number, criterion and
    collects, as a closed, non-editable block (criterion 5, pre-existing)
  proves: The pre-existing full-listing scenario, now reachable because the shared mount() fixture supplies
    the manifest fetch the corrected hook issues before the table can render at all.
  fails_when: The screen never reaches the ready state because the manifest fetch this fixture supplies
    is missing, so no table renders.
- file: src/routes/case-hypotheses-tab.spec.ts
  name: renders that hypothesis's own revision-history view when its row is selected (criterion 4, pre-existing)
  proves: The pre-existing tab-to-history navigation, now reachable because H1's manifest fetch (at the
    resolved target version 1) is supplied.
  fails_when: The revision-history view never reaches its ready state after the row is clicked, so Back
    to hypotheses never renders.
- file: src/routes/case-hypotheses-tab.spec.ts
  name: returns to the hypotheses list when Back to hypotheses is clicked from the revision-history view
    (pre-existing)
  proves: The pre-existing return-to-list navigation, reachable under the same repaired fixture.
  fails_when: The revision-history view never reaches ready (missing manifest mock), so Back to hypotheses
    is never available to click.
not_applicable:
- edge_case: A manifest entry pinning a revision higher than the hypothesis's own highest existing revision.
  why: A manifest entry's pinned revision always references a revision of the hypothesis that already
    exists (a domain invariant enforced elsewhere, at place-hypothesis / hypothesis-revision write time);
    this task's read has no reachable path to a pin exceeding the hypothesis's own highest revision, so
    a test constructing that fixture would test an unreachable state, not this task's behavior.
- edge_case: A case version's manifest holding more than one entry for the same hypothesis.
  why: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version is enforced at write
    time by the case-version composition act (place-hypothesis), outside this task's and this frontend
    target's reach, per the task's own Notes. This task's read only consumes that invariant; a test violating
    it at the fixture level would be asserting behavior under a state no criterion of this task, or any
    other reachable act, can produce.
- edge_case: Missing or empty slug/hypothesisName input to the component.
  why: HypothesisRevisionHistoryProps declares both as required strings; there is no runtime path to render
    the component without them that a rendered-DOM test could exercise -- the type system, not a behavior,
    is what refuses this.
- edge_case: Two operations against one subject at once (e.g. two concurrent Revise submissions).
  why: This task's own surface (hypothesis-revision-history.tsx) issues no write of its own; it only renders
    a link into the revise flow. There is no concurrent-write path within this task's own files to exercise.
untested:
- The task's own Notes carry a second UNDERDETERMINED entry -- what the row marked current does when the
  pinned revision is absent from the page of revisions the table currently renders. Unlike the no-entry-state
  entry, this one names no implementation that satisfies every criterion while violating the cited rule;
  it only observes that rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown requires the
  pin to still be stated even then, and that descending order makes the scenario likely as revisions accumulate.
  Writing a test against a specific implementation here would mean inventing the very implementation the
  binder declined to name, so it is left unproven rather than guessed at.
- 'The task''s own Notes carry a third UNDERDETERMINED entry -- which revision a Revise action rendered
  on the marked row submits against. It names no implementation either, only the two write-time rules
  bearing on the gap (a-hypothesis-revision-is-overwritten-while-unreleased, a-released-hypothesis-revision-is-never-altered).
  It is also, separately, not exercisable from this task''s own files: hypothesis-revision-history.tsx
  only renders the Revise link''s address, never a submission -- the submission itself happens in a different
  component this task does not touch.'
- The task's own ADVISORY note -- criterion 4 as written places Revise on the marked row unconditionally,
  with no criterion stating when Revise is offered at all, so a case whose highest-numbered version is
  released (where any revise attempt would be refused) still gets Revise rendered on the marked row. Per
  the instruction to test a criterion as it states itself, criterion 4 was tested exactly as written (no
  such gating), so this gap stays unproven and is disclosed here rather than silently closed by a test
  asserting a condition no criterion states.
- 'The implementation record''s inference that the pin-and-target-version read was extracted into a dedicated
  hook (use-case-hypothesis-current-pin.ts) rather than left inline in the route, citing ARC-03. This
  is a purely structural choice with no independently observable output: the rendered rows and the Revise
  link are identical whether the read happens inline or through a hook, so no behavioral test can distinguish
  the two without binding to the code''s own shape, which the rendered-output tests above deliberately
  do not do. ARC-03 is a reading rule, not a tool-decided one -- it is answered by the standard-conformance
  pass, not by a test.'
---

## What it is
Proof for the corrective task's read of "current" from the case's highest-numbered version's manifest pin, including the explicit no-entry statement its own delivery folded in after the first suite run failed.

## Notes
The first suite attempt (run/hypothesis-revision-history-reads-the-manifest-pin-read-current-from-the-manifest-pin-suite) failed on exactly the test named above proving the no-entry-state UNDERDETERMINED gap; the failure-diagnostician classed the cause as code, and the implementation was revised (not this proof) to close it. This proof is unchanged from what was written against the first implementation attempt, since the same tests now pass against the corrected source.
The second suite attempt (…-suite-2) failed on src/hooks/use-connector-configuration-detail-validity.spec.ts, a test file this delivery neither wrote nor touched and no file it changed reaches; re-run in isolation it passed, and the third full suite attempt (…-suite-3, the run this record pins) passed clean end to end — a transient failure, not a regression from this delivery.
