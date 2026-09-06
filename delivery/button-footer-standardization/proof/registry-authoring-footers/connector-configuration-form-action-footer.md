---
title: Connector configuration form action footer proof
summary: Tests proving the create screen and detail ready view route their actions through the footer's Actions group, that Cancel abandons authoring without registering on both surfaces, that the discard stays out of the windows the rule withholds it from, that the create surface states a success naming the connector only once the registry answers, and that the detail surface's new refusal handling distinguishes a recognised refusal from a generic one.
implementation: sha256:0d36a52775eb054f44c4f6007c1771779c444cd31629e2bde0f8f3fe96e8ac38
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-connector-configuration-form-action-footer-suite
tests:
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders Save inside a group named Actions
  proves: connector-configuration-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  fails_when: The Save control stops being reachable through the group named Actions, for instance the action row reverting to a plain div with no group semantics.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders the create screen's own Cancel control beside Save, inside the Actions group
  proves: Whatever a screen passes through the existing trailingActions prop is rendered inside the footer beside Save, on the create surface.
  fails_when: The create screen's Cancel stops rendering inside the same Actions group as Save, for instance moving outside the footer or trailingActions no longer being forwarded.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  proves: Whatever a screen passes through the existing trailingActions prop is rendered inside the footer beside Save, on the detail surface.
  fails_when: Either the Discard or the Cancel control on the detail ready view stops rendering inside the Actions group.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders both a top-of-screen listing link and a separate footer Cancel, though both resolve to the same destination today
  proves: The implementation record's inference that Cancel and the pre-existing listing route are kept as two distinct controls rather than folded into one.
  fails_when: The two controls are folded into a single element, or either stops pointing at the connector-configurations listing.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: renders no Discard changes control
  proves: The connector-configuration create surface, having read no registration, offers no such discard control.
  fails_when: A Discard changes control appears anywhere on the create screen.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: issues no registration and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in
  proves: The footer carries a Cancel that leaves the authoring without registering anything, and the task's underdetermined note that the listing route is never a control that submits the form before navigating.
  fails_when: Clicking Cancel issues a register call before or instead of navigating to the listing, or fails to navigate there at all.
- file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  name: issues no registration and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits
  proves: The same Cancel criterion and the same underdetermined note, on the detail ready view.
  fails_when: Clicking Cancel on the detail surface issues a register call, or fails to navigate to the listing, while an unsaved edit is present.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders the listing link while the read is still outstanding
  proves: The task's underdetermined note that the route to the listing is owed on every reading, including the outstanding read the criterion narrows past. Together with the pre-existing failed-read test in connector-configuration-detail-screen.spec.ts, the two defeat the named wrong implementation across both windows it withholds the route from.
  fails_when: The listing route is absent while the configuration's read is still pending.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders no Discard changes control while the read is still outstanding
  proves: The task's underdetermined note that the discard act is withheld outside the ready phase, including the outstanding read.
  fails_when: A Discard changes control renders while the configuration's read is still pending.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders no Discard changes control once the read fails
  proves: The same underdetermined note's failed-read window.
  fails_when: A Discard changes control renders once the configuration's read has failed.
- file: src/routes/connector-configuration-create-screen-outcome.spec.ts
  name: shows a success statement naming the registered connector once the registry answers
  proves: Where the registry answers a submission, the surface states that the configuration was registered, naming the connector name submitted.
  fails_when: No success is stated, or it is stated without naming the submitted connector, once the registration resolves successfully.
- file: src/routes/connector-configuration-create-screen-outcome.spec.ts
  name: shows no success statement while the registration is still pending
  proves: The task's underdetermined note that neither outcome is stated of a submission the registry has not answered; this fails over exactly the named implementation that states success at the moment Save is pressed.
  fails_when: The success is stated before the registration resolves, that is immediately on Save rather than on the mutation's own settle.
- file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  name: saves successfully with no toast call at all
  proves: The implementation record's inference that the detail surface's registered outcome stays the pre-existing inline status, with no second statement added.
  fails_when: A success toast is added on the detail hook's successful save; this file's own stub declares no success channel, so such a call throws and this test fails.
- file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  name: shows the registry's own distinguishable refusal message when the edit is refused as not well formed
  proves: Where the registry refuses a submission, the detail surface states which refusal answered it, a named condition.
  fails_when: No refusal is stated on a refused detail save, or it is stated with a message other than the not-well-formed one.
- file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  name: falls back to a generic message for a refusal this surface does not recognise
  proves: A refusal whose condition the surface does not recognise is stated apart from a named one.
  fails_when: An unrecognised refusal produces no message, or reuses the not-well-formed message instead of the generic one.
- file: src/routes/connector-configuration-detail-ready-view-order.spec.ts
  name: renders the test panel's heading outside the Actions group, alongside Save rather than inside it
  proves: 'The boundary of the trailingActions criterion: the Actions footer carries only Save and the trailing controls, never unrelated screen content such as the connector test panel.'
  fails_when: The connector test panel's own heading ends up nested inside the Actions group.
not_applicable:
- edge_case: Absent or empty connector name, or unparsable configuration text at Save
  why: This task changes no validation logic; these paths are covered by pre-existing, unmodified specs, and this task's criteria assert nothing new over them.
- edge_case: A duplicate or uniqueness constraint
  why: No criterion of this task states a uniqueness rule; the registry's own handling is outside what this task implements, per its own advisory note on the registry contract.
- edge_case: Two operations against one subject at once
  why: The submission guard is preserved, unchanged source this task did not touch, and no criterion states anything about concurrent submission.
- edge_case: A boundary at each end of a stated numeric range, or an empty collection where one comes back
  why: None of this task's criteria states a numeric range or returns a collection.
untested:
- The no-second-prop half of the trailingActions criterion is a claim about the component's own declared props shape rather than an independently observable behaviour; asserting it would mean reading the component's internal type or props object rather than what a user or an accessibility tree observes, which this project's own testing convention forbids. It is left to the typecheck and lint steps rather than a behavioural test.
- The implementation record's inference that moving the connector test panel ahead of the form keeps the sticky footer from overlapping trailing content is a rendered-layout fact, and jsdom performs no layout, so no element's computed position or overlap is observable here. This project's convention also forbids the direct node-access APIs that would let a test read relative document order between two elements of different roles, so the ordering claim itself has no permitted assertion either. The adjacent permitted fact was tested instead — that the footer's accessible tree excludes the test panel — and that does not by itself establish either the ordering or the overlap avoidance.
---

## What it is
Sixteen assertions over the connector-configuration authoring surfaces, four of them written to fail over exactly the implementations this task's own underdetermined notes name.
The rest hold the footer's composition, both Cancels, the discard's windows and both halves of the outcome statement.

## Notes
The suite passed on its first run, which is the one difference from the sibling capability delivery: that one failed first on a pre-existing spec whose sonner stub declared no success channel, and the same change was made here, so the stub was completed before the suite ran rather than after it went red.
The second untested entry is the sharper of the two: the reorder this delivery made to keep the footer last has no permitted assertion in this project, and the test that was written in its place is named as not establishing it.
That is a gap this suite admits rather than covers, and closing it would need a real layout engine.
