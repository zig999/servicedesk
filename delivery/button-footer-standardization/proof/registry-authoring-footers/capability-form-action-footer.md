---
target: frontend
title: Capability form action footer proof
summary: Tests establishing that the capability create and detail-ready surfaces compose Save, Cancel, Discard and trailingActions through one ButtonFooter group, that the discard and route controls hold exactly the windows the task's underdetermined notes name, that a submission's outcome is stated only once the registry answers, and repairing an earlier initiative's incomplete sonner stub so its own success-path assertions exercise this delivery's code rather than throwing past it.
implementation: sha256:24d5c5dec32efca1366eccdc62e902d31a18e475aa03bd4a8bb61ab71ac51bec
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-capability-form-action-footer-suite-2
tests:
- file: src/routes/capability-form-fields-action-footer.spec.ts
  name: the action row is one Actions group rather than a plain trailing row > renders Save inside a group named Actions
  proves: capability-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  fails_when: The action row stops being wrapped by a control exposing role group and the accessible name Actions, for instance reverted to a plain div.
- file: src/routes/capability-form-fields-action-footer.spec.ts
  name: whatever a screen passes through trailingActions renders beside Save, inside that same group > renders the create screen's own Cancel control beside Save, inside the Actions group
  proves: Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save.
  fails_when: The create screen's Cancel control stops appearing inside the same Actions group as Save.
- file: src/routes/capability-form-fields-action-footer.spec.ts
  name: whatever a screen passes through trailingActions renders beside Save, inside that same group > renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  proves: Whatever a screen passes through the existing `trailingActions` prop, Discard and Cancel both, is rendered inside the footer beside Save on the detail surface too.
  fails_when: Either the Discard trigger or the Cancel control stops appearing inside the same Actions group as Save on the detail-ready surface.
- file: src/routes/capability-create-screen-actions.spec.ts
  name: a Cancel control returns to the listing without registering anything > renders Cancel as a link addressed at the capabilities listing
  proves: The footer carries a Cancel, and the disclosed inference that its destination on both surfaces is the fixed capabilities listing route.
  fails_when: Cancel stops being a link to the capabilities listing, or its destination changes.
- file: src/routes/capability-create-screen-actions.spec.ts
  name: a Cancel control returns to the listing without registering anything > navigates to the capabilities listing when Cancel is clicked, issuing no PUT
  proves: The footer carries a Cancel that leaves the authoring without submitting it, registering nothing and replacing no registered capability, and returns the operator to the surface the authoring was reached from.
  fails_when: Clicking Cancel stops navigating to the listing, or issues a registration call.
- file: src/routes/capability-create-screen-actions.spec.ts
  name: offers no Discard control, having read no registration > renders no Discard changes control anywhere on the create surface
  proves: The capability create surface, having read no registration, offers no such discard control.
  fails_when: A Discard changes control is rendered anywhere on the create surface.
- file: src/routes/capability-create-screen-outcome.spec.ts
  name: a successful registration states its outcome, naming what was registered > shows a success statement naming the registered capability's own name and version once the registry answers
  proves: Where the registry answers a submission, the surface states the outcome — that the capability was registered, naming the name and version submitted.
  fails_when: No success statement naming the submitted name and version is shown once the registration resolves successfully.
- file: src/routes/capability-create-screen-outcome.spec.ts
  name: states no outcome before the registry has answered > shows no success statement while the registration is still pending
  proves: The task's underdetermined note that neither outcome is stated of a submission the registry has not answered.
  fails_when: A success statement appears before the registration call resolves, which is the implementation the note names as passing every criterion and violating the rule.
- file: src/routes/capability-detail-screen-cancel.spec.ts
  name: a Cancel control leaves the surface without submitting or replacing the registered capability > renders Cancel as a link addressed at the capabilities listing, distinct from Discard
  proves: The footer carries a Cancel whose destination is the capabilities listing, and which is a control distinct from Discard.
  fails_when: Cancel stops being a link to the listing on the detail surface, or is collapsed into the same control as Discard.
- file: src/routes/capability-detail-screen-cancel.spec.ts
  name: a Cancel control leaves the surface without submitting or replacing the registered capability > navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT
  proves: The footer carries a Cancel that leaves the authoring without submitting it, registering nothing and replacing no registered capability.
  fails_when: Clicking Cancel with an unsaved edit present stops navigating to the listing, or issues a call replacing the registered capability.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: a refused save states a distinguishable outcome to the operator > shows the registry's own distinguishable refusal message when the edit is refused
  proves: Where the registry refuses a submission, the surface states which refusal answered it, a named condition.
  fails_when: No distinguishable refusal message is shown, or the wrong one is, once the edit is refused with a recognised condition.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: a refused save states a distinguishable outcome to the operator > falls back to a generic message for a refusal this surface does not recognise
  proves: A refusal whose condition the surface does not recognise states a distinguishable generic message rather than nothing.
  fails_when: No message is shown, or a named condition is shown, once the edit fails with a condition the surface does not name.
- file: src/routes/capability-detail-screen-discard-availability.spec.ts
  name: the Discard control is withheld while the read is outstanding > renders no Discard control while the capability read is still pending
  proves: The task's underdetermined note that the discard act is withheld from every surface whose read has not answered.
  fails_when: The discard control appears in the detail surface's read-outstanding window, which is the implementation the note names.
- file: src/routes/capability-detail-screen-discard-availability.spec.ts
  name: the Discard control is withheld once the read has failed > renders no Discard control once the capability read fails
  proves: The task's underdetermined note that the discard act is withheld from every surface whose read failed.
  fails_when: The discard control appears in the detail surface's read-failed window, which is the implementation the note names.
- file: src/routes/capability-detail-screen-route.spec.ts
  name: a route to the listing is offered while the read is still outstanding > renders Back to capabilities while the capability read is still pending
  proves: The task's underdetermined note that the route to the listing is present on every reading, naming expressly the read that has not completed.
  fails_when: The route is rendered only once the read has answered, which is the implementation the note names.
- file: src/routes/capability-create-screen-save.spec.ts
  name: dispatches at the name and version typed into the form > issues the registration at the name and version just typed
  proves: Submitting the capability form issues the registration at the name and version typed into the form.
  fails_when: No registration is issued at the typed name and version once Save is clicked with a valid form.
- file: src/routes/capability-create-screen-save.spec.ts
  name: dispatches at the name and version typed into the form > issues the call at a different URL when a different name and version are typed, rather than a fixed destination
  proves: The registration's destination tracks whatever name and version the operator typed rather than a fixed URL.
  fails_when: The call is issued at a fixed or stale URL rather than the name and version currently in the form.
- file: src/routes/capability-create-screen-save.spec.ts
  name: blocks dispatch while a declared schema is not valid JSON > keeps Save disabled and dispatches nothing while the input schema is not valid JSON
  proves: An invalid input schema keeps Save disabled and blocks dispatch.
  fails_when: Save stays enabled, or a registration is issued, while the input schema is not valid JSON.
- file: src/routes/capability-create-screen-save.spec.ts
  name: blocks dispatch while a declared schema is not valid JSON > keeps Save disabled and dispatches nothing while the output schema is not valid JSON
  proves: An invalid output schema keeps Save disabled and blocks dispatch.
  fails_when: Save stays enabled, or a registration is issued, while the output schema is not valid JSON.
- file: src/routes/capability-create-screen-save.spec.ts
  name: a concept-already-answered refusal is reported without leaving the screen > shows the registry's own distinguishable message and keeps the operator on the create screen
  proves: A concept-already-answered refusal states its own distinguishable message and keeps the operator on the create surface.
  fails_when: The distinguishable message stops appearing, or the operator is moved off the create surface, on this refusal.
- file: src/routes/capability-create-screen-save.spec.ts
  name: never refuses a concept itself before dispatching > dispatches the registration for whatever concept is selected, without any message shown before the registry itself answers
  proves: 'No refusal message is shown before the registry answers a dispatched registration. This is the assertion the incomplete sonner stub was failing spuriously: an unstubbed success call threw inside onSuccess and the query client rerouted that throw into onError, firing the generic refusal the assertion checks was never called.'
  fails_when: A refusal message is shown before or instead of the registry's own success answer, including as a side effect of onSuccess throwing.
- file: src/routes/capability-create-screen-save.spec.ts
  name: a successful save navigates to the created capability's own detail route > navigates to the capability's own name and version once the registration succeeds, rather than staying on the create route
  proves: 'Submitting the capability form issues the registration, and where it succeeds the operator is taken to the surface addressed by that capability''s own name and version. This is the other assertion the incomplete stub was failing: onSuccess threw before reaching the navigation.'
  fails_when: Navigation to the capability's own route stops happening once the registration succeeds, including as a side effect of onSuccess throwing before reaching it.
- file: src/routes/capability-create-screen-save.spec.ts
  name: the dispatched registration carries every field the form composes > submits nature, timeout and connector alongside the schemas and the concept
  proves: The dispatched body carries every field the form composes rather than a narrower subset.
  fails_when: The body omits any of nature, timeout, connector, input schema, output schema or concept.
not_applicable:
- edge_case: Absent or empty input on a new field
  why: This task introduces no new form field or input boundary; it relocates existing action controls into the footer and adds Cancel, a success statement and a refusal statement.
- edge_case: A boundary at each end of a stated numeric range
  why: No numeric range is introduced or touched by this task.
- edge_case: An empty collection where one comes back
  why: This task adds no list or collection rendering.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness constraint is introduced by this task's criteria.
- edge_case: Two operations against one subject at once
  why: Double-submit guarding is pre-existing behaviour this task did not touch, already proven by the hook-level suites; this task's criteria add no new concurrency behaviour.
untested:
- The negative half of the second criterion, that no second prop for appending buttons is introduced alongside trailingActions, is a compile-time fact about the props shape; no runtime render can observe the absence of an unused prop, and only the project's own typecheck step decides it.
- The registers-nothing half of the discard criterion is asserted only through the pre-existing field-reset tests; no test, before or after this task's relocation of Discard into the footer, checks that confirming it issues no registration call. The implementation never calls the mutation, but that is read from source rather than proven, and the absence predates this task.
- The footer's sticky-bottom positioning against AppShell's own scrolling ancestor is a layout fact jsdom does not compute; no test here observes it, and none in this suite can without a real layout engine.
---

## What it is
Twenty-three assertions over the capability authoring surfaces: the footer composition, Cancel on both, the discard's windows, the route's windows, and both halves of the outcome statement.
Eight of them live in a spec this task did not write, brought into the file set by the human after this delivery's own code falsified two of its assertions.

## Notes
The suite failed once before it passed, at run/registry-authoring-footers-capability-form-action-footer-suite, with two failures the diagnosis returned as cause test.
Both were in src/routes/capability-create-screen-save.spec.ts, a file this delivery had not written: it stubs sonner with only an error channel, and this delivery's code now calls the success channel as a-submitted-registration-states-its-outcome-to-the-operator requires, so the unstubbed call threw inside onSuccess and the query client rerouted it into onError.
The two assertions were correct and the code was correct; the stub was what no longer represented either.
That file belongs to task/capability-create-route/capability-create-screen in the connector-capability-create-detail-route initiative, whose work root carries closure.md, so neither of the two routes the framework names for a test an earlier task owns could run: the corrective increment refuses a file the trace binds nothing to, and a proof-only re-delivery refuses a closed plan.
The human widened this delivery's file set to include it, which is recorded here because a review never discovers its own scope and this is where that set is stated.
Completing the stub is not weakening a test: both assertions still hold, still fail for the same reasons, and are now exercised against the delivered wiring rather than passing over a throw.
