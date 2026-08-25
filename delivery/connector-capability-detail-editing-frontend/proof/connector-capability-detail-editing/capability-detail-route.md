---
title: Capability detail/edit route, proven directly against the routed screen and its composing
  hooks
summary: 31 tests over the routed /capabilities/$name/$version screen, its ready-phase view,
  capability-form-fields.tsx's widened isDirty prop, the capabilities list's row-click navigation,
  and the use-capability-detail-view composition hook -- proving all nine of this task's criteria,
  split across five spec files to respect this project's own max-lines rule from the start.
implementation: sha256:9f68d6d68d07949635726ee13ff8fbae19140d905c4ef9807c0e01bf26a123a1
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-capability-detail-route-suite
tests:
- file: src/routes/capability-detail-screen.spec.ts
  name: renders the capability's own identity and every declared field, all read from the
    GET this route's own hook issues by both name and version
  proves: Navigating to /capabilities/<name>/<version> for an existing capability shows that
    capability's full record, loaded through the new hook by both name and version.
  fails_when: any pre-filled field (name, version, nature, connector, concept, timeout, input_schema,
    output_schema) fails to reflect the loaded record, or the screen never issues the GET
    keyed by both name and version.
- file: src/routes/capability-detail-screen.spec.ts
  name: navigates back to the capabilities list when Back to capabilities is clicked
  proves: The route offers a control that returns the operator to the capabilities list.
  fails_when: the Back link is absent or clicking it fails to navigate to /capabilities.
- file: src/routes/capability-detail-screen.spec.ts
  name: keeps the same control available when the load fails
  proves: 'The route offers a control that returns the operator to the capabilities list --
    over the load-error phase (edge case: a dependency that fails).'
  fails_when: the Back link disappears once the identity GET fails.
- file: src/routes/capability-detail-screen.spec.ts
  name: renders every field capability-form-dialog.tsx already composes through CapabilityFormFields,
    plus the Save button
  proves: The existing capability-form-fields.tsx markup is reused unchanged inside the new
    route.
  fails_when: any field the shared CapabilityFormFields markup renders (Name, Version, Nature,
    Input schema, Output schema, Timeout, Connector, Concept) or the Save button is missing
    from the routed screen.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows a plain warning that the stored input schema is not valid JSON when the loaded
    value does not parse, without hiding the stored value itself
  proves: If the loaded input_schema or output_schema value does not parse as valid JSON,
    the screen shows a plain warning that the stored value is invalid and must be corrected
    before Save can succeed, instead of rendering it silently -- input_schema half.
  fails_when: no plain-wording warning renders for an invalid loaded input_schema, or the
    invalid stored text is hidden or blanked rather than shown beside it.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows no such warning while the loaded input_schema is valid JSON
  proves: the same criterion's negative case for input_schema.
  fails_when: the warning renders for a syntactically valid loaded input_schema.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows the same plain warning once a valid loaded input_schema is edited into invalid
    JSON, and blocks Save while it stays that way
  proves: the criterion's must-be-corrected-before-Save-can-succeed half, for input_schema.
  fails_when: editing a valid loaded input_schema into invalid JSON does not surface the warning,
    Save stays enabled, or clicking Save still issues a PUT.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: edits away the warning once the input_schema text is corrected back to valid JSON
  proves: the criterion is scoped to the current text rather than a sticky flag, for input_schema.
  fails_when: the warning survives correcting the text back to valid JSON.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows a plain warning that the stored output schema is not valid JSON when the loaded
    value does not parse, without hiding the stored value itself
  proves: If the loaded input_schema or output_schema value does not parse as valid JSON,
    the screen shows a plain warning that the stored value is invalid and must be corrected
    before Save can succeed, instead of rendering it silently -- output_schema half.
  fails_when: no plain-wording warning renders for an invalid loaded output_schema, or the
    invalid stored text is hidden or blanked rather than shown beside it.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows no such warning while the loaded output_schema is valid JSON
  proves: the same criterion's negative case for output_schema.
  fails_when: the warning renders for a syntactically valid loaded output_schema.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: shows the same plain warning once a valid loaded output_schema is edited into invalid
    JSON, and blocks Save while it stays that way
  proves: the criterion's must-be-corrected-before-Save-can-succeed half, for output_schema.
  fails_when: editing a valid loaded output_schema into invalid JSON does not surface the
    warning, Save stays enabled, or clicking Save still issues a PUT.
- file: src/routes/capability-detail-screen-invalid-schema.spec.ts
  name: edits away the warning once the output_schema text is corrected back to valid JSON
  proves: the criterion is scoped to the current text rather than a sticky flag, for output_schema.
  fails_when: the warning survives correcting the text back to valid JSON.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: disables Save immediately after load, before any edit
  proves: The Save button is disabled until the form, including input_schema and output_schema,
    differs from its originally loaded values, and re-disables once every field is returned
    to that value.
  fails_when: Save is enabled right after load with no edit made.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: enables Save once input_schema is edited to a materially different value
  proves: the same criterion, the input_schema half of differs-from-its-originally-loaded-values.
  fails_when: editing input_schema away from its loaded value leaves Save disabled.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: enables Save once output_schema is edited to a materially different value
  proves: the same criterion, the output_schema half.
  fails_when: editing output_schema away from its loaded value leaves Save disabled.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: enables Save once a plain form field (Connector) is edited
  proves: the same criterion's the-form-differs-from-its-originally-loaded-values over a react-hook-form
    field, not only the two JSON fields.
  fails_when: editing a plain form field leaves Save disabled.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: re-disables Save once the edited input_schema is returned to its exact originally
    loaded value
  proves: and re-disables once every field is returned to that value.
  fails_when: Save stays enabled once the edit is reverted to the exact loaded value.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: shows an inline success acknowledgement and keeps the screen showing the just-saved
    values
  proves: A successful save shows a success acknowledgement and the screen visibly reflects
    the just-saved values.
  fails_when: no acknowledgement renders after a successful save, the PUT body omits the edited
    schema values, or the fields revert to anything other than the just-saved values.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: re-disables Save immediately after the save succeeds, with no further edits
  proves: the same criterion, together with the re-disabling behavior applied to a just-completed
    save.
  fails_when: Save stays enabled right after a successful save with no further edit.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: clears the acknowledgement once the operator edits again, so it never outlives the
    values it acknowledged
  proves: the acknowledgement is scoped to the values it names, not a sticky flag.
  fails_when: the Saved. acknowledgement survives a fresh edit.
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: disables the Discard control while there is nothing to discard
  proves: A discard-changes control resets every field, including both JSON schema fields,
    back to the originally loaded values and re-disables Save -- the control's own gating.
  fails_when: Discard is enabled with no outstanding edit.
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: enables Discard once either schema or a form field is edited, and resets every one
    of them back to its originally loaded value when clicked, re-disabling Save
  proves: A discard-changes control resets every field, including both JSON schema fields,
    back to the originally loaded values and re-disables Save.
  fails_when: clicking Discard fails to reset either schema field or the plain form field
    back to its loaded value, or leaves Save or Discard enabled afterward.
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: resets both schema fields to their just-saved values once a save has succeeded, rather
    than the values loaded before it
  proves: the implementation's own disclosed inference that discard's baseline moves to what
    was just saved rather than the original pre-save load.
  fails_when: discard after a successful save falls back to the pre-save loaded values instead
    of the just-saved ones.
- file: src/routes/capabilities-browser-screen-navigation.spec.ts
  name: navigates to /capabilities/<name>/<version>, by both identity fields, when a row is
    clicked
  proves: Clicking a row on the capabilities list screen navigates to that capability's /capabilities/<name>/<version>
    route.
  fails_when: clicking a row fails to navigate, or navigates to a path missing either name
    or version.
- file: src/routes/capabilities-browser-screen-navigation.spec.ts
  name: offers no separate per-row Edit action that would open the popup dialog
  proves: Editing an existing capability from the list screen opens the new route instead
    of the popup dialog.
  fails_when: a per-row Edit control still renders.
- file: src/routes/capabilities-browser-screen-navigation.spec.ts
  name: opens no popup dialog when a row is clicked, only the routed navigation
  proves: the same criterion's instead-of-the-popup-dialog half.
  fails_when: a dialog opens, before or after the row click, instead of or alongside the routed
    navigation.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: resets both edited JSON schema fields back to their loaded values and clears isDirty
  proves: A discard-changes control resets every field, including both JSON schema fields,
    back to the originally loaded values -- at the composition-hook level.
  fails_when: onDiscard fails to restore either schema field to its loaded value, or isDirty
    stays true afterward.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: resets a plain form field (connector) back to its loaded value through form.reset()
  proves: the same criterion's react-hook-form half, and the implementation's disclosed inference
    that onDiscard resets that portion through a bare, argument-less form.reset().
  fails_when: the connector field fails to return to its loaded value after onDiscard, or
    isDirty stays true.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: discards back to the just-saved schema values after a successful save, not the values
    loaded before it
  proves: the implementation's own disclosed inference that discard's baseline moves to what
    was just saved, at the composition-hook level.
  fails_when: onDiscard after a successful save restores the pre-save loaded values instead
    of the just-saved ones.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: is false before any save has happened
  proves: A successful save shows a success acknowledgement -- justSaved's own starting state.
  fails_when: justSaved reads true before any save was ever submitted.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: becomes true the instant a save succeeds
  proves: the same criterion, at the composition-hook level.
  fails_when: justSaved stays false once a save resolves successfully.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: clears once the operator edits again after a save, so the acknowledgement never outlives
    what it acknowledged
  proves: the acknowledgement's own scoping to the values it named.
  fails_when: justSaved stays true after a fresh edit following a successful save.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: stays false while a save is still pending, only turning true once that same save actually
    resolves
  proves: 'justSaved is derived from isSubmitSuccessful''s own false-to-true transition rather
    than a comparison that could race a fast-resolving mutation -- edge case: a slow dependency,
    and the exact defect this task''s own Notes say it proactively found and fixed.'
  fails_when: justSaved turns true before the pending PUT resolves, or never turns true once
    it does.
not_applicable:
- edge_case: two operations against one subject at once (a second Save before the first settles)
  why: the guard is use-capability-detail.ts's own isSubmittingRef, unchanged by this task,
    and is already proven by the sibling capability-detail-hook task's own delivered proof
    (use-capability-detail-save.spec.ts's ignoring-a-second-submit-before-the-first-one-settles
    test); useCapabilityDetailView composes that guard rather than reimplementing it, so retesting
    it here would duplicate rather than add.
- edge_case: an empty collection
  why: this screen renders one loaded record's own fields, never a list a criterion could
    claim is empty.
- edge_case: a boundary at each end of a stated range
  why: none of this task's nine criteria states a numeric range.
- edge_case: a duplicate where uniqueness is claimed
  why: none of this task's nine criteria claims uniqueness over anything this screen renders.
- edge_case: the screen's own bare loading phase text
  why: no criterion of this task names a loading-state requirement, and the underlying loading
    | load-error | ready phase union capability-detail-screen.tsx composes unchanged is already
    proven at the hook layer by the already-delivered capability-detail-hook task's own proof
    (use-capability-detail.spec.ts's reports-loading-before-ready test).
- edge_case: both schemas invalid at once
  why: each schema's own warning is derived independently from that field's own isValid flag
    (capability-detail-ready-view.tsx renders the two banners from two independent conditions);
    proving each field independently, as this proof does, already establishes the combined
    case follows from the same independent logic, and the invalid-JSON criterion states no
    combined behavior beyond that.
untested:
- capability-form-fields.tsx's own pre-existing call site (capability-form-dialog.tsx, which
  never passes the new isDirty prop) staying unaffected by that widening is not re-verified
  by this proof; it is provable only by capability-form-dialog.tsx's and use-capability-form.ts's
  own already-existing tests, which this record does not re-run.
---

## What it is

Proves the nine criteria for the capability detail/edit route, its ready view, its composition hook, and the capabilities list's row-click navigation, split across multiple spec files from the start to respect this project's own max-lines rule.

## Notes

This proof's own test-author found, while writing it, that capabilities-browser-screen-detail.spec.ts and capabilities-browser-screen-capability-form-save.spec.ts -- both from a different, already-delivered task -- still asserted the per-row Edit action this task's own criterion 9 correctly removes, and flagged the six affected tests as contested rather than resolving them itself. By the time this record was written, those same files (plus capabilities-browser-screen.spec.ts's row-role queries) had already been corrected directly, outside this delivery, by the project owner's explicit authorization -- the same authorization and the same pattern already applied on the connector-configuration side of this initiative for its own thirty-two stale tests from the same closed initiative. Reading those files now shows no remaining reference to the removed control, so the contested entry is not carried forward here.
