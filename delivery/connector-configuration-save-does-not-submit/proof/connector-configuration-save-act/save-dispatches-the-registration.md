---
target: frontend
title: Save dispatches the registration — proof for connector-configuration-save-act
summary: Mounts the connector configuration detail screen with the app shell's footer slot present, so
  ButtonFooter's createPortal is actually taken, and proves the Save control regains its form owner and
  reaches every outcome the task's criteria and Notes describe.
implementation: sha256:2a83b6a7d836938ffb7cc0e8d32013cfe8ede1fd05add4130ba2f9e2cba87072
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-save-act-save-dispatches-the-registration-suite
tests:
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: keeps the screen's own form as the Save button's form owner even though the button renders outside
    that form's DOM subtree
  proves: With the footer slot present, so the portal the application takes is taken, the screen's save
    control has the screen's own form as its form owner.
  fails_when: the Save button carries no form attribute matching the screen's own form id, or the ids
    diverge, so button.form is null or some other element once ButtonFooter's portal moves the button
    outside the form's DOM subtree — exactly the pre-fix defect
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: issues a PUT to this connector's own configuration endpoint once the configuration is edited to
    a materially different value
  proves: With the footer slot present and every required field of the configuration filled, activating
    the save control submits a registration for the connector the route names.
  fails_when: activating Save with the footer slot present fires no submit event (the pre-fix defect,
    where a portaled submit control owning no form dispatches nothing), or the PUT is issued against a
    URL not keyed on the route's own connector name
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: renders the inline Saved. acknowledgement together with this connector's name in the screen's
    own heading
  proves: With the footer slot present and the registry answering that the registration registered, the
    screen states that it registered and states the connector name it registered under.
  fails_when: a registered answer, reached through the footer-slot-present path, fails to render the Saved.
    status, or the screen stops showing the connector's own name
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: states neither a Saved. acknowledgement nor a refusal while the register-connector call is still
    outstanding, and states Saved. only once it resolves
  proves: the task's UNDERDETERMINED note over rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
    — this test fails over that note's own named passing candidate.
  fails_when: the screen states any outcome (a Saved. acknowledgement or a refusal) before the register-connector
    call has answered
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: states the recognised, distinguishable refusal message and renders no Saved. acknowledgement
  proves: With the footer slot present and the registry refusing the registration (a recognised condition),
    the screen states that nothing registered and states the refusal that answered it.
  fails_when: a recognised refusal (not-well-formed configuration) is not mapped to its distinguishing
    message, or a Saved. acknowledgement renders despite the refusal
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: falls back to the generic failure message and renders no Saved. acknowledgement
  proves: the task's UNDERDETERMINED note over the unrecognised-refusal branch of rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
    — together with the recognised-refusal test above, this fails over that note's own named passing candidate.
  fails_when: an unrecognised refusal renders with the same wording as the recognised refusal covered
    by the test above, rather than the distinct generic fallback message
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: issues no PUT to the connector configuration endpoint, even after the configuration was edited
  proves: activating an abandon control issues no registration, leaves the registry's standing entry exactly
    as it was.
  fails_when: activating Cancel with the footer slot present issues a PUT despite an edited, unsaved configuration
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: navigates back to the origin surface rather than a fixed destination
  proves: returns the operator to the screen the authoring was opened from.
  fails_when: activating Cancel with an origin present in history does not return the operator to that
    origin
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: navigates to /connectors when the authoring surface was reached with no earlier history entry
  proves: the task's UNDERDETERMINED note over rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
    — this test fails over that note's own named passing candidate.
  fails_when: Cancel does nothing (leaves the operator on the connector configuration screen) when there
    is no earlier history entry to return to, instead of landing on the /connectors listing
---

## What it is

Mounts the connector configuration detail screen with the app shell's footer slot present, so the footer portal the running application actually takes is taken, and proves the Save control's restored form ownership reaches submission, both outcome branches, and the abandon control's two destinations.

## Notes

Not applicable, disclosed rather than silently skipped: two rapid Save activations (guarded by the pre-existing, untouched isSubmittingRef, unrelated to this defect); activating abandon while a save is in flight (no criterion of this task states this, and Cancel's logic is unaffected by the portal defect); activating Save with invalid JSON (Save is disabled whenever configuration.isValid is false, already exercised by connector-configuration-detail-screen-save.spec.ts).

Untested, disclosed rather than silently skipped: the destination clause of rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface has no distinguishing test — this screen has no second surface to navigate to, so no observable-behavior test can tell "navigated to the addressed surface" apart from "stayed on the authoring surface" without also failing over the architecture this task's own criteria and covered nodes were written against. The connector-configuration create screen shares ConnectorConfigurationFormFields and also gets a correctly form-owned Save button as a side effect of this fix, but its own footer-portal behavior is outside this task's criteria and is not proved here.
