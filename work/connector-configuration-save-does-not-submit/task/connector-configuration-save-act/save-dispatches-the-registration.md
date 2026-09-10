---
title: Save dispatches the registration
summary: The connector configuration screen's save control reaches the registration, in the DOM shape the running
  application actually has.
objective: An operator's save on the connector configuration screen, in the DOM shape the running application has,
  submits a registration for the connector the route names and states to the operator the outcome the registry
  answered.
criteria:
- With the footer slot present, so the portal the application takes is taken, the screen's save control has the
  screen's own form as its form owner.
- With the footer slot present and every required field of the configuration filled, activating the save control
  submits a registration for the connector the route names.
- With the footer slot present and the registry answering that the registration registered, the screen states that
  it registered and states the connector name it registered under.
- With the footer slot present and the registry refusing the registration, the screen states that nothing registered
  and states the refusal that answered it.
- With the footer slot present, activating an abandon control issues no registration, leaves the registry's standing
  entry exactly as it was, and returns the operator to the screen the authoring was opened from.
implements:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
- rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
sources:
- intake/scope.md
---

## What it is

The correction of one wrong behavior observed by running the delivered system: the save control on the connector configuration screen dispatches nothing, because it is a submit control that owns no form once the app shell's footer portal moves it out of the form's DOM subtree.
The proof owed is a proof that fails when the defect returns, which means mounting the screen with the footer slot present so the portal the application takes is actually taken.

## Notes

UNDERDETERMINED, from the specification — no criterion states where the operator is taken once the registry answers that the registration registered.
rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface states that such an operator is taken to the surface addressed by the connector name the registration carried, and is neither left on the authoring surface the registration was submitted from nor sent to the listing.
The third criterion is satisfiable without ever leaving the authoring screen, so the rule's destination clause reaches no criterion of this task.
Passes: a screen that, on a registered answer, renders a success statement naming the connector and leaves the operator standing on the authoring screen with the save control still offered.

UNDERDETERMINED, from the specification — no criterion demonstrates the silence rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers requires: neither outcome is stated of a submission the registry has not answered.
The third and fourth criteria are each conditioned on the registry having answered, so both are satisfied by a screen that also states an outcome before any answer arrives.
Passes: a screen that states "registered" optimistically the moment the save control is activated and replaces that statement when the register-connector call answers.

UNDERDETERMINED, from the specification — the fourth criterion says only that the screen states the refusal that answered it, while rules/integration/a-submitted-registration-states-its-outcome-to-the-operator requires the condition the registry's answer named to be stated apart from every other condition that route can name and apart from a refusal whose condition the surface does not recognise, and requires an answer naming no condition to be stated as a failure for a reason the surface does not recognise, never as a named condition.
The unrecognised-refusal branch reaches no criterion.
Passes: a screen that renders one refusal notice carrying whatever text the answer happened to hold, so that a refusal carrying no named condition reads to the operator exactly like a named one.

UNDERDETERMINED, from the specification — the fifth criterion states the abandonment's destination only as the screen the authoring was opened from.
rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing states that where the authoring surface was reached from no surface, the operator is landed on the listing, and rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing states that this leaving registers nothing and leaves the operator neither on that surface nor on a read keyed on the connector name.
No criterion reaches that branch.
Passes: an abandon control that navigates back one step in history where an origin exists and otherwise does nothing, leaving the operator on the connector configuration screen.

REMAINDER, from the specification — rules/integration/a-submitted-registration-states-its-outcome-to-the-operator, rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers and rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing each state one fact for both integration registries: their clauses over register-capability, over a capability registration's name and version, and over the listing list-capabilities answers reach no criterion of this task.
Belongs: the task covering the capability registration authoring surface, under whichever epic covers domain/integration/capability's authoring rules — outside this epic's covers.

ADVISORY, from the specification — the first criterion and the footer-slot precondition every criterion carries rest on no covered node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface, rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering and rules/integration/a-submitted-registration-states-its-outcome-to-the-operator each close by stating that which control carries an act, its wording and where it sits are form and belong to the interface.
Those criteria are backed by the running application's own DOM, recorded in the scope, and never by a node in implements.
