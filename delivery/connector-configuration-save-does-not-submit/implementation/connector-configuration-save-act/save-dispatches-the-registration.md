---
target: frontend
title: Restore form ownership for the connector configuration screen's Save control
summary: Fixes the portaled Save button on the connector-configuration form so it submits the screen's
  own form, restoring the register-connector dispatch the footer-portal DOM shape had silently disabled.
task: sha256:8bc47e26b59f780593394d9c13153229d08791c5b387ed74f86cfa0e22350338
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-save-act-save-dispatches-the-registration-build
files:
- path: src/routes/connector-configuration-form-fields.tsx
  effect: declares CONNECTOR_CONFIGURATION_FORM_ID, sets it as the shared form's own id, and adds form={CONNECTOR_CONFIGURATION_FORM_ID}
    to the Save button so the button keeps that form as its owner once ButtonFooter's createPortal moves
    it out of the form's DOM subtree, the same fix already delivered at case-version-editor-form-fields.tsx
    and hypothesis-revision-form-fields.tsx for the identical defect
criteria:
- criterion: With the footer slot present, so the portal the application takes is taken, the screen's
    save control has the screen's own form as its form owner.
  met: true
  how: the Save button now carries form={CONNECTOR_CONFIGURATION_FORM_ID}, matching the id the form element
    itself now declares; a DOM form attribute resolves by document-wide id lookup, not tree containment,
    so the association holds across the portal
- criterion: With the footer slot present and every required field of the configuration filled, activating
    the save control submits a registration for the connector the route names.
  met: true
  how: with form ownership restored, activating the button fires the form's native submit event, invoking
    the pre-existing onSubmit in use-connector-configuration-detail.ts, which issues the PUT /v1/connectors/{connector}
    mutation for the route's connector name; this dispatch logic was already correct and was simply unreachable
    before this fix
- criterion: With the footer slot present and the registry answering that the registration registered,
    the screen states that it registered and states the connector name it registered under.
  met: true
  how: 'unchanged and now reachable: the mutation''s onSuccess sets justSaved, rendered as a role="status"
    "Saved." acknowledgement in connector-configuration-detail-ready-view.tsx, while connector-configuration-detail-screen.tsx''s
    own heading and the form''s disabled Connector field display the connector name throughout the interaction'
- criterion: With the footer slot present and the registry refusing the registration, the screen states
    that nothing registered and states the refusal that answered it.
  met: true
  how: 'unchanged and now reachable: the mutation''s onError calls toast.error(saveFailureMessage(error)),
    stating the recognised refusal distinguishably from the generic fallback for an unrecognised one;
    no success acknowledgement renders on this path'
- criterion: With the footer slot present, activating an abandon control issues no registration, leaves
    the registry's standing entry exactly as it was, and returns the operator to the screen the authoring
    was opened from.
  met: true
  how: unaffected by the portal defect since Cancel is type="button", not submit; the pre-existing, untouched
    onCancel never calls the mutation, calling router.history.back() when history allows it and otherwise
    navigating to /connectors
nodes:
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/hooks/use-connector-configuration-detail.ts
  how: the restored dispatch is what actually issues register-connector (PUT /v1/connectors/{connector})
    once the Save control's form ownership is fixed; the read-connector-configuration load path was already
    unaffected and untouched
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: the mutation this fix makes reachable submits the value object whole, keyed by connector, replacing
    whatever stood at that connector name, unchanged by this task and now dispatchable
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  how: the registered outcome is stated by the pre-existing "Saved." inline status together with the screen's
    persistent connector-name display; the refused outcome is stated by the pre-existing distinguishable
    toast.error messages; both were already correctly wired but unreachable before this fix
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-detail-view.ts
  how: 'honored by pre-existing, untouched code: justSaved and the failure toast are each set only from
    the mutation''s own onSuccess/onError callbacks, never optimistically; this task changed nothing here
    and only made the path reachable'
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
  how: 'honored trivially and left untouched: the detail screen the operator is already on, at /connectors/$connector,
    is itself the surface read-connector-configuration addresses by that connector name, so a successful
    save that stays in place already lands the operator there; no navigation was added or needed'
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: honored by the pre-existing, untouched onCancel, which never calls the mutation in either branch
    it takes
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: 'honored by the pre-existing, untouched onCancel''s fallback branch: where router.history.canGoBack()
    is false, it navigates to /connectors, the connector configuration listing'
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: 'honored by the same pre-existing onCancel: neither branch issues a register-connector call, so
    the registered set is left exactly as it was regardless of which branch runs'
inferences:
- inferred: the mechanism restoring form ownership across the ButtonFooter portal is the id-on-the-form
    plus form-attribute-on-the-button pattern, rather than any other fix
  from: the in-repo precedent at case-version-editor-form-fields.tsx / case-version-editor-ready-view.tsx
    and the already-delivered hypothesis-revision-form-fields.tsx for the identical defect; the governing
    rules leave which control carries the act, and its wording and placement, to the interface
- inferred: criteria 3, 4 and 5's outcome-stating and destination behavior needed no source change beyond
    restoring dispatch
  from: the task's own scope ("This increment corrects the connector configuration screen and nothing
    else"), the screen's persistent connector-name display throughout the save interaction, and pre-existing
    tests already asserting the "Saved." text and refusal messages as established behavior from the screen's
    original delivery
preserved:
- the Save button's isDirty/validity gating
- the inline "Saved." acknowledgement and its clearing on further edits
- the distinguishable and generic refusal toasts
- the Discard confirmation dialog and its fallback to the just-saved value
- the configuration-helper "Add attribute" reconciliation against registered vs. just-saved text
- the Cancel control's back-in-history/listing-fallback destinations
- the connector-configuration create screen, which shares ConnectorConfigurationFormFields and now also
  gets a correctly form-owned Save button as an unavoidable consequence of fixing the one shared component,
  with no other change to its own behavior
---

## What it is

The connector configuration screen's Save button was a submit control portaled out of its form's DOM subtree by ButtonFooter, so it owned no form and clicking it fired nothing. This adds an id to the form and a matching form attribute to the button, restoring the association across the portal, the same fix already delivered for the identical defect on the hypothesis revision and case version editor screens.

## Notes

None.
