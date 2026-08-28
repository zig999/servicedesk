---
title: Proof for grouping Name, Version and Nature into one row
summary: Adds the one structural test criterion 1 needs -- that Name, Version and Nature share one row
  container a later field (Timeout) sits outside of -- leaving criteria 2-4 to the existing, unmodified
  capability-detail-screen.spec.ts and capability-detail-screen-save.spec.ts suites that already prove
  them.
implementation: sha256:517048468f8b22f34da0ab94c9aa07cc1a30d75795fa3ea9261ce41e7cf220b3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-layout-name-version-nature-row-suite-3
tests:
- file: src/routes/capability-detail-screen-name-version-nature-row.spec.ts
  name: wraps Name, Version and Nature in one shared container that a later-row field (Timeout) sits outside
    of
  proves: CapabilityFormFields wraps the Name, Version and Nature FormField elements in one shared row
    container instead of Nature's current standalone FormField block rendered below the Name/Version row.
  fails_when: Nature is rendered outside the container that wraps Name and Version (its prior standalone
    block below the Name/Version row), which makes the smallest element containing both Name and Nature
    the whole <form> -- an ancestor that also contains Timeout, so row.contains(timeoutField) becomes
    true and the assertion fails. It also fails if Version is moved out of whatever container does wrap
    Name and Nature together.
not_applicable:
- edge_case: two operations against one subject at once
  why: this task is a static layout regrouping with no new interactive behavior -- nothing here introduces
    a state transition or a request a second concurrent one could race.
- edge_case: absent or empty input, and a boundary at each end of a stated range
  why: no new input, field or numeric range is introduced; Name, Version and Nature keep the exact fields,
    values and validation wiring they already had, only their surrounding markup moved.
- edge_case: a dependency that fails or answers slowly
  why: no new dependency is introduced by this task, and the existing load-failure behavior (capability-detail-screen.spec.ts's
    own "keeps the same control available when the load fails" test) is unrelated to which row Nature
    renders in and is left untouched.
- edge_case: the row container is built from the codebase's own grid grid-cols-3 gap-4 convention rather
    than some other row mechanism (the implementation record's own disclosed inference)
  why: the task's own rationale states the criteria assert only the falsifiable outcome the scope asked
    for, not that specific markup choice -- asserting a particular className would bind the test to the
    implementation's shape rather than to criterion 1, and would fail for an equally valid regrouping
    (e.g. a flex wrapper) that satisfies the same criterion. The written test proves the criterion instead,
    through containment rather than through any class name.
untested:
- Name and Version's own validation-error rendering (aria-invalid and the error text linked through aria-describedby)
  is exercised by no test, either before or after this regrouping -- criterion 3 claims this behavior
  is unchanged, but nothing in capability-detail-screen.spec.ts or elsewhere submits an invalid Name or
  Version through this component to observe it, so the claim rests on the implementation record's own
  reading of the unmodified FormField markup rather than on a test.
divergences:
- cites: TST-04
  file: src/routes/capability-detail-screen-name-version-nature-row.spec.ts
  departure: The file sits beside capability-detail-screen.tsx, suffixed for the specific behavior it
    proves, rather than named exactly capability-detail-screen.spec.ts.
  why: This mirrors the already-established, previously-delivered precedent for this exact screen -- capability-detail-screen-save.spec.ts,
    capability-detail-screen-discard.spec.ts and capability-detail-screen-invalid-schema.spec.ts are all
    split the same way from the same unit, sharing capability-detail-screen.test-support.ts, to stay under
    this project's own max-lines discipline (MNT-01). This project's own eslint.config.js records that
    TST-04 is applied as a reading here rather than by a stock lint rule, precisely because no stock rule
    can enforce exact-stem naming; matching TST-04 literally would mean either exceeding MNT-01 in one
    of the existing sibling files or duplicating the mounting harness in a second, unrelated file for
    one test, either of which costs more than the departure.
---

## What it is

The test proving task/capability-detail-layout/name-version-nature-row's one structural criterion
that no existing test covers; criteria 2-4 are already proven by the existing, unmodified
capability-detail-screen.spec.ts and capability-detail-screen-save.spec.ts suites, since neither
Nature's values/wiring, Name/Version's values/validation, nor any label text changed.

## Notes

run/capability-detail-layout-name-version-nature-row-suite failed at lint: the new spec's ancestor-walk helper triggered testing-library/no-node-access on its .parentElement access, no diagnosis owed since the failing step was lint, not the suite-role test step.
run/capability-detail-layout-name-version-nature-row-suite-2 failed at lint again: the first reasoned-suppression comment landed above a plain comment line instead of directly above the flagged .parentElement access, so ESLint reported it both as an unused directive and as a live violation one line down.
Both were fixed by moving the eslint-disable-next-line testing-library/no-node-access comment (the same reasoned-suppression convention this codebase already uses elsewhere, e.g. status-table.spec.ts) to sit directly above the actual .parentElement access; run-suite-3 passed clean.
