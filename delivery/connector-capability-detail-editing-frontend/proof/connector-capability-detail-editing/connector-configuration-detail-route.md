---
title: Proof for the connector-configuration detail/edit route
summary: Tests over the new routed screen, its ready view, its composition hook, and
  the list screen's row-click navigation, proving all nine of this task's criteria
  and its disclosed inferences.
implementation: sha256:1c89811f0ac6953e16441a213037a7e9fb094bde61a365da599fe8e8a8a37780
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-connector-configuration-detail-route-suite-2
tests:
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: resets the edited configuration text back to its loaded value and clears isDirty
  proves: A discard-changes control resets every field, including configuration, back
    to the originally loaded values and re-disables Save.
  fails_when: onDiscard stops resetting configuration.value to the loaded baseline,
    or isDirty stays true after discard.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: resets the connector field back to this route's own identity through form.reset
  proves: A discard-changes control resets every field, including configuration, back
    to the originally loaded values and re-disables Save.
  fails_when: onDiscard stops resetting the connector field, or isDirty stays true
    after discard.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: discards back to the just-saved configuration after a successful save, not
    the value loaded before it
  proves: the inference that originally loaded values means the baseline useConnectorConfigurationDetail
    treats as current, re-seeded after a successful save.
  fails_when: onDiscard resets to the value loaded before the save instead of the
    value just saved.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: is false before any save has happened
  proves: justSaved's own negative baseline, feeding criterion 7.
  fails_when: justSaved reads true before any save ever succeeded.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: becomes true the instant a save succeeds
  proves: A successful save shows a success acknowledgement and the screen visibly
    reflects the just-saved values.
  fails_when: justSaved never turns true after a save actually succeeds -- fixed to
    derive from isSubmitSuccessful (mutation.isSuccess) own false-to-true transition
    rather than an isSubmitting render comparison.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: clears once the operator edits again after a save, so the acknowledgement
    never outlives what it acknowledged
  proves: the acknowledgement's own boundary, feeding criterion 7.
  fails_when: justSaved stays true after a fresh edit invalidates what it was acknowledging.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: stays false while a save is still pending, only turning true once that same
    save actually resolves
  proves: criterion 7's edge case of a still-pending dependency.
  fails_when: justSaved turns true before the PUT actually resolves.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: renders the connector's own identity and its configuration, both read from
    the GET this route's own hook issues
  proves: Navigating to /connectors/<connector> for an existing connector shows that
    connector configuration's full record, loaded through the new hook.
  fails_when: the screen fails to show the connector identity, or the configuration
    field's settled value never becomes the pretty-printed loaded text, or the screen
    never issues the GET.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: navigates back to the connector-configurations list when Back to connector
    configurations is clicked
  proves: The route offers a control that returns the operator to the connector-configurations
    list.
  fails_when: the Back link is absent, or clicking it does not navigate to /connectors.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: keeps the same control available when the load fails
  proves: The route offers a control that returns the operator to the connector-configurations
    list, over the load-error phase (edge case -- a dependency that fails).
  fails_when: the load-error phase, once it actually renders (awaited via its own
    Retry control), is missing either the Retry button or the Back link.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: renders the shared Connector/Configuration/Save fields and mounts the real
    ConnectorTestPanel, which issues its own two independent reads
  proves: The existing connector-configuration-form-fields.tsx markup and the existing
    ConnectorTestPanel are reused unchanged inside the new route.
  fails_when: the shared fields or ConnectorTestPanel are missing, replaced by a stand-in,
    or ConnectorTestPanel own two reads never fire.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: shows a plain warning that the stored configuration is not valid JSON when
    the loaded value does not parse
  proves: If the loaded configuration value does not parse as valid JSON, the screen
    shows a plain warning that the stored value is invalid and must be corrected before
    Save can succeed, instead of rendering it silently -- right at load, before any
    edit.
  fails_when: the warning banner is absent for an initially-loaded, invalid configuration
    once the Configuration field is present.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: shows no such warning while the loaded configuration is valid JSON
  proves: criterion 8's negative case.
  fails_when: the warning renders for a validly-loaded configuration.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: shows the same plain warning once a valid loaded configuration is edited into
    invalid JSON, and disables Save while it stays that way
  proves: criterion 8, and the disclosed inference that the banner's wording is distinct
    from JsonTextareaField's own inline parser message.
  fails_when: the warning does not appear once an edit makes the text invalid, the
    two messages collapse into one, or Save stays enabled or a click through it issues
    a PUT.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: edits away the warning once the text is corrected back to valid JSON
  proves: criterion 8's own boundary.
  fails_when: the warning persists after the text is corrected.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: disables Save immediately after load, before any edit
  proves: The Save button is disabled until the form, including configuration, differs
    from its originally loaded values, and re-disables once every field is returned
    to that value.
  fails_when: Save is enabled right after load with no edit made.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: enables Save once the configuration is edited to a materially different value
  proves: criterion 4.
  fails_when: Save stays disabled after a real edit.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: re-disables Save once the edited configuration is returned to its exact originally
    loaded value
  proves: criterion 4, re-disable half.
  fails_when: Save stays enabled after the field is returned to its loaded value.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: shows an inline success acknowledgement and keeps the screen showing the just-saved
    value
  proves: A successful save shows a success acknowledgement and the screen visibly
    reflects the just-saved values.
  fails_when: no acknowledgement appears, or the field no longer reflects the saved
    data.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: re-disables Save immediately after the save succeeds, with no further edits
  proves: criterion 4's re-disable half, exercised through a real save.
  fails_when: Save stays enabled right after a successful save.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: clears the acknowledgement once the operator edits again, so it never outlives
    the values it acknowledged
  proves: criterion 7's own boundary at the DOM level.
  fails_when: Saved. keeps showing after a fresh edit.
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: disables the Discard control while there is nothing to discard
  proves: criterion 5's own edge case.
  fails_when: Discard is clickable with no outstanding edit.
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: enables Discard once the configuration is edited, and resets the field back
    to its originally loaded value when clicked, re-disabling Save
  proves: A discard-changes control resets every field, including configuration, back
    to the originally loaded values and re-disables Save.
  fails_when: Discard fails to reset the field, or Save stays enabled afterward.
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: shows no confirmation step before discarding
  proves: the inference that the Discard control needs no destructive-action confirmation
    step.
  fails_when: a dialog/alertdialog appears before the reset takes effect.
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: resets to the just-saved configuration once a save has succeeded, rather than
    the value loaded before it
  proves: the disclosed inference that originally loaded values moves to what was
    just saved, at the DOM level.
  fails_when: discard after a save falls back to the pre-save loaded value instead
    of the just-saved one.
- file: src/routes/connector-configurations-screen-navigation.spec.ts
  name: navigates to /connectors/<connector> when a row is clicked
  proves: Clicking a row on the connector-configurations list screen navigates to
    that connector's /connectors/<connector> route.
  fails_when: the row click stops navigating, or navigates to the wrong path.
- file: src/routes/connector-configurations-screen-navigation.spec.ts
  name: offers no separate per-row Edit action that would open the popup dialog
  proves: Editing an existing connector configuration from the list screen opens the
    new route instead of the popup dialog.
  fails_when: a per-row Edit action reappears.
- file: src/routes/connector-configurations-screen-navigation.spec.ts
  name: opens no popup dialog when a row is clicked, only the routed navigation
  proves: criterion 9.
  fails_when: a Dialog renders alongside or instead of the navigation.
not_applicable:
- edge_case: row.connector failing the typeof string guard in connector-configurations-screen.tsx's
    own handleRowClick
  why: toRow() always seeds a row's connector field as a string from the domain's
    own identifying attribute; the guard is defensive typing over an untyped row shape,
    never a state real data can put the UI into.
- edge_case: two clicks of Save before the first request settles
  why: the guard lives in the already-delivered useConnectorConfigurationDetail's
    own onSubmit, reused unchanged by this route, and is already proven directly by
    that hook's own proof and by the sibling form-save proof for the same shared fields.
- edge_case: two operators editing the same connector configuration at once
  why: no criterion or specification node this task implements states a concurrency
    guarantee, and the underlying hook tracks no version/etag to detect it.
- edge_case: an empty collection, a duplicate, or a numeric-range boundary
  why: this screen holds exactly one record with one JSON-text field; none of these
    shapes arises anywhere in its own criteria.
untested:
- A failed save leaves this route with no visible error state, since useConnectorConfigurationDetail's
  own mutation has no onError branch -- explicitly deferred by the implementation
  record itself.
- That the pre-existing dialog call site is wholly unaffected relies on that dialog's
  own existing proof files, not re-verified here.
- 'The absence of a toast call on a successful save is not asserted directly: this
  test harness never mounts a Toaster.'
---

## What it is

Proves the nine criteria and disclosed inferences for the connector-configuration detail/edit route, its composition hook, and the list screen's row-click navigation, split across multiple spec files to respect this project own max-lines rule.

## Notes

An earlier version of this proof recorded criterion 8 as contested, since the sibling hook's load effect then hardcoded configurationValid to true. That defect is now fixed (disclosed in the implementation record's own divergences), and the criterion-8 tests above now agree with the implementation -- the contested entry is dropped.
Two test-timing races a failure-diagnostician found in connector-configuration-detail-screen.spec.ts (criterion 1's configuration-field read, and criterion 3's load-error edge case) are also fixed, by awaiting each assertion's own settled condition instead of a heading/link common to every phase.
The two pre-existing proof files from a different, already-closed initiative that clicked the now-removed per-row Edit button (connector-configurations-screen-form.spec.ts, connector-configurations-screen-form-save.spec.ts), plus five connector-test-panel-*.spec.ts files reaching ConnectorTestPanel through the same removed control, and two other stale assertions (route-tree.spec.ts's route count, connector-configurations-screen.spec.ts's row-role query), were fixed directly outside this task's own delivery, with the project owner's explicit authorization, since their owning initiative is already closed and a proof-only re-delivery cannot target a closed work root.
