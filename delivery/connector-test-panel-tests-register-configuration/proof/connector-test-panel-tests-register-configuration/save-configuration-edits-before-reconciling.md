---
title: Proof for saving Configuration edits before reconciling
summary: The seven affected tests save Configuration through the real "Save" button and wait for its own
  disabled attribute to reflect the settled save (state.isDirty turning false), bypassing a pre-existing,
  unrelated defect in the "Saved." acknowledgement path; the full suite passes.
implementation: sha256:a3cfb2ab778d954f422524d2daa1036634ea60c5720992f1f2cacb0d3cd6087a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-tests-register-configuration-save-configuration-edits-before-reconciling-suite-3
tests:
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: adds exactly one empty-valued row for each subject-attribute placeholder Configuration's current
    text names, when no row exists yet
  proves: Each of the five affected tests saves each Configuration edit before the "Add attribute" click
    that depends on that edit having taken effect.
  fails_when: the shared saveConfiguration(dialog) helper resolves before state.isDirty (hence Save's
    own disabled attribute) has actually turned true, so "Add attribute" reconciles against the textarea's
    stale, unsaved edit instead of the registered configuration.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: drops the account-id row and adds the region row once Configuration's text no longer names account-id
  proves: Each of the five affected tests saves each Configuration edit before the "Add attribute" click
    that depends on that edit having taken effect.
  fails_when: saveConfiguration resolves before the save actually reaches registeredConfigurationText,
    so "Add attribute" still reconciles against the withdrawn "account-id" placeholder and the "region"
    row never appears.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: 'removes every row, leaving none, once Configuration''s text names no placeholder at all (edge
    case: an empty collection where one previously existed)'
  proves: Each of the five affected tests saves each Configuration edit before the "Add attribute" click
    that depends on that edit having taken effect.
  fails_when: saveConfiguration resolves before the save settles, so "Add attribute" reconciles against
    a configuration that still names "account-id" and the row is not dropped to an empty collection.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: keeps the earlier row's own value and drops the later duplicate's, once two rows share one attribute
    name
  proves: keeps the earlier row's own value in a tie -- saves each Configuration edit before the "Add
    attribute" click.
  fails_when: either of this test's two saveConfiguration calls resolves before its own edit has propagated
    to registeredConfigurationText -- in particular the second save must genuinely re-settle isDirty to
    false before the second "Add attribute" click, or the tie-break collapse to one "account-id" row with
    value "111" would not happen.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: re-orders the rows to match the placeholder order Configuration's text currently declares, even
    though that order differs from the rows' own prior order
  proves: reconciled rows follow Configuration's own current placeholder order -- saves each Configuration
    edit before the "Add attribute" click.
  fails_when: either of this test's two saveConfiguration calls resolves before its own edit has propagated
    to registeredConfigurationText -- the second save in particular must genuinely complete before the
    second "Add attribute" click, or the rows would not re-order to ["beta", "alpha"].
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: adds a row already named for Configuration's own placeholder, not an empty row
  proves: The affected test in connector-test-panel-capability-picker.spec.ts saves its Configuration
    edit before the "Add attribute" click that depends on it.
  fails_when: the inline save step resolves before Save's own disabled attribute turns true, so "Add attribute"
    reconciles against an unsaved edit and the row it finds carries an empty Attribute value instead of
    "picker-panel-subject-id".
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: removes exactly the row whose own Remove action was clicked, leaving the other rows' own values
    intact (stable-row-identity inference)
  proves: The affected test in connector-test-panel-subject-and-attributes.spec.ts saves its Configuration
    edit before the "Add attribute" click that depends on it.
  fails_when: the inline save step resolves before Save's own disabled attribute turns true, so "Add attribute"
    reconciles to zero or the wrong three rows and the subsequent Remove-then-assert sequence fails.
not_applicable:
- edge_case: a dependency that fails or answers slowly, during the save itself
  why: this task only corrects the wait mechanism around a save that always succeeds in these seven tests;
    no criterion asks these tests to also cover a failing or slow PUT.
- edge_case: absent or empty Configuration text at the save step
  why: already exercised elsewhere in the same file by criterion 6's three tests (unparsed JSON, a JSON
    array, and empty text), none of which is among the seven tests this task touches.
- edge_case: two saves issued concurrently against one subject
  why: every save step in these seven tests is a single, awaited fireEvent.click followed by a single
    waitFor before the next action proceeds; nothing in this task's own criteria states or needs concurrent-save
    behavior.
contested:
- what: use-connector-configuration-detail-view.ts's own wasSubmitSuccessfulRef is never reset when justSaved
    clears (on a later edit, or on discard), so a second successful save within the same session never
    re-sets justSaved to true, and the "Saved." acknowledgement never reappears even though react-query's
    own mutation.isSuccess genuinely transitions false-to-true again.
  why: 'this is a real, pre-existing production defect in code no task of this delivery is scoped to change
    (the human''s own explicit decision for this task: rework the tests'' wait mechanism instead of the
    ref). Disclosed here rather than fixed or silently worked around, since it will resurface for any
    future caller relying on "Saved." across two saves in one session; this task''s own seven tests no
    longer route through that mechanism at all, so none of them is affected by the defect going unfixed.'
---

## What it is
Proves that the seven affected tests save Configuration through the real Save action, waiting on Save's own disabled attribute rather than the buggy "Saved." acknowledgement, and still assert exactly what they asserted before; the full suite passes.

## Notes
A pre-existing, out-of-scope production defect (wasSubmitSuccessfulRef never resetting between saves in use-connector-configuration-detail-view.ts) was found and disclosed as a `contested` entry rather than fixed, per the human's own decision for this task.
Three suite attempts stand for this delivery: the first failed on the seven tests this task fixes (a fixed-timer-tick wait); the second failed on two of those same tests, exposing the wasSubmitSuccessfulRef defect through a "Saved."-based wait; this record's own run is the third attempt, after the wait was reworked to avoid that defect, and it passed clean.
