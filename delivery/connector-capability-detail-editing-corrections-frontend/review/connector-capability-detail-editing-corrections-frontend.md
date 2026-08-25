---
title: connector-capability-detail-editing-corrections-frontend, first review
summary: 'What four passes found over the frontend corrective change''s two tasks: rejecting non-object JSON in the connector-configuration validity check, and requiring confirmation before Discard on both detail screens.'
reviewed:
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-detail.test-support.ts
- src/hooks/use-connector-configuration-detail-validity.spec.ts
- src/hooks/use-capability-detail.ts
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/capability-detail-ready-view.tsx
- src/routes/connector-configuration-detail-screen-discard.spec.ts
- src/routes/capability-detail-screen-discard.spec.ts
tasks:
- task/detail-screen-corrections/configuration-validity-check
- task/detail-screen-corrections/discard-confirmation-dialog
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean (all steps, including test, exited 0) -- there was no failure for this pass to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: A configuration text that parses as valid JSON but is not an object (an array, a bare string, a number, true, or null) sets configurationValid to false in use-connector-configuration-detail.ts, where it previously read true.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: reads configuration.isValid as false when the loaded configuration parses as $label rather than an object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: reads configuration.isValid as false once the field is edited to $label rather than an object
- criterion: A configuration text that parses as a JSON object continues to set configurationValid to true.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: reads configuration.isValid as true when the loaded configuration parses as a JSON object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: reads configuration.isValid as true once the field is edited to a different JSON object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: recovers configuration.isValid to true once a non-object edit is corrected back to a JSON object
- criterion: The Save button in connector-configuration-form-fields.tsx is disabled when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-form-fields.tsx itself.
  state: uncovered
  why: nothing in the test set renders a form with a non-object-but-syntactically-valid configuration and reads the Save button's disabled attribute against it -- use-connector-configuration-detail-validity.spec.ts exercises configurationValid only at the bare hook level, never through the rendered form, and connector-configuration-detail-screen-discard.spec.ts only edits the field to an object value.
- criterion: The warning banner in connector-configuration-detail-ready-view.tsx appears when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-detail-ready-view.tsx itself.
  state: uncovered
  why: no test mounts the ready view (or the screen around it) with a non-object parsed configuration and looks for the warning text; connector-configuration-detail-screen-discard.spec.ts never sets the field to a non-object value.
- criterion: use-capability-detail.ts's inputSchemaValid and outputSchemaValid derivation, and json-textarea-field.tsx's parseJsonText/getJsonTextareaMinifiedValue, are unchanged.
  state: uncovered
  why: capability-detail-screen-discard.spec.ts only edits input/output schema fields between two syntactically-valid JSON objects, never a non-object parsed value, so nothing in the set exercises inputSchemaValid/outputSchemaValid's non-object handling directly.
- criterion: Clicking Discard on connector-configuration-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: opens a confirmation Dialog when Discard is clicked, rather than resetting the field immediately
- criterion: Confirming that dialog calls state.onDiscard, resetting the connector-configuration form to its last loaded-or-saved values.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: closes the Dialog and resets the field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: resets to the just-saved configuration once a save has succeeded and the confirmation Dialog is confirmed, rather than the value loaded before it
- criterion: Cancelling or closing that dialog leaves the connector-configuration form's unsaved edits intact and does not call state.onDiscard.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: leaves the field's unsaved edit intact and issues no reset when Keep editing is clicked
  why: only the explicit "Keep editing" cancel button is exercised; the Dialog's own default close affordance and Escape/overlay-click dismissal are never driven, so the "closing" half of the criterion is unexercised.
- criterion: Clicking Discard on capability-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: opens a confirmation Dialog when Discard is clicked, rather than resetting the fields immediately
- criterion: Confirming that dialog calls state.onDiscard, resetting the capability form to its last loaded-or-saved values.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: closes the Dialog and resets every edited field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: resets both schema fields to their just-saved values once a save has succeeded and the confirmation Dialog is confirmed, rather than the values loaded before it
- criterion: Cancelling or closing that dialog leaves the capability form's unsaved edits intact and does not call state.onDiscard.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: leaves every edited field's unsaved edit intact and issues no reset when Keep editing is clicked
  why: 'same gap as the connector-configuration dialog: only "Keep editing" is exercised, never the dialog''s other dismissal paths.'
- criterion: Both dialogs are composed from @tui/ui/dialog's existing primitives with two explicit buttons — one to discard, one to continue editing — matching the Release dialog's plain two-button shape in case-version-editor-ready-view.tsx rather than the typed-slug Discard dialog's heavier shape.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)
  why: the observable shape (no textbox, a Keep-editing button, an enabled confirm button) is exercised for both screens, but nothing in the set verifies this shape is actually produced by @tui/ui/dialog's own primitives rather than other markup that happens to render the same way.
- criterion: connector-configuration-detail-screen-discard.spec.ts and capability-detail-screen-discard.spec.ts no longer assert the removed one-click-no-confirmation behavior.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: opens a confirmation Dialog when Discard is clicked, rather than resetting the field immediately
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: opens a confirmation Dialog when Discard is clicked, rather than resetting the fields immediately
findings:
- pass: conformance
  file: src/routes/capability-detail-ready-view.tsx
  where: lines 62-65, the INVALID_INPUT_SCHEMA_WARNING and INVALID_OUTPUT_SCHEMA_WARNING constants
  evidence: "const INVALID_INPUT_SCHEMA_WARNING =\n  \"This capability's stored input schema is not valid JSON. Correct it before Save can succeed.\";\nconst INVALID_OUTPUT_SCHEMA_WARNING =\n  \"This capability's stored output schema is not valid JSON. Correct it before Save can succeed.\";"
  cost: 'the operator is told, in these exact words, what will and will not let a save succeed at the moment a schema is invalid. The file''s own header comment admits the source: "this is this task''s own additional, plain wording naming the consequence ... since no criterion or node states this exact wording" -- rules/integration/a-capability-declares-well-formed-schemas states only that the registry refuses a malformed schema, never what an operator is told about it, so the wording the operator actually sees lives only in this component.'
  correction: what an operator is told at this outcome would need to be decided into the specification (alongside a-capability-declares-well-formed-schemas, or a scenario naming this screen) and read from there, rather than authored as this route's own inference.
- pass: conformance
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: lines 68-69, the INVALID_CONFIGURATION_WARNING constant
  evidence: "const INVALID_CONFIGURATION_WARNING =\n  \"This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.\";"
  cost: 'the same gap as the capability screen''s pair of banners: the file''s own header comment states "since no criterion or node states this exact wording and no such banner exists anywhere else in this app to reuse" -- rules/integration/a-connector-configuration-holds-a-well-formed-object states that the registry refuses a malformed configuration, but not what an operator is told about it.'
  correction: what an operator is told at this outcome would need to be decided into the specification and read from there, rather than authored as this route's own inference.
- pass: standard
  file: src/routes/capability-detail-ready-view.tsx
  where: the return JSX, around the state.justSaved block (lines 141-151)
  cites: API-02
  evidence: "{state.justSaved && (\n  <p role=\"status\" className=\"text-sm text-foreground\">\n    Saved.\n  </p>\n)}"
  cost: the component renders a state for a successful save but composes nothing at all for a failed one -- neither useCapabilityDetail (whose mutation carries no onError and exposes no failure field) nor this view maps a save's distinct failure responses to any user-facing state, so an operator whose PUT is refused sees the same screen they saw before clicking Save, with no sign anything went wrong.
  correction: expose the mutation's failure through a named field on the "ready" phase (mirroring how isSubmitSuccessful was added), and render a message from it here beside the justSaved block.
- pass: standard
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the return JSX, around the state.justSaved block (lines 140-150)
  cites: API-02
  evidence: "{state.justSaved && (\n  <p role=\"status\" className=\"text-sm text-foreground\">\n    Saved.\n  </p>\n)}"
  cost: the component renders a state for a successful save but composes nothing for a failed one -- useConnectorConfigurationDetail's own mutation carries no onError and exposes no failure field, so a save refused by the registry produces no visible change beyond isSubmitting returning to false.
  correction: expose the mutation's failure through a named field on the "ready" phase and render it here, the same way justSaved is rendered.
---

## What it is

Four passes over the frontend corrective change: coverage against all thirteen criteria of its two tasks, specification conformance against the file set (one node named, plus a full read for any fact stated nowhere), standard conformance against frontend-typescript.yaml's 29 reading-decided rules, and a failures pass that did not run because the captured run passed clean.

## Notes

Both conformance findings and both standard findings describe pre-existing code this corrective change did not introduce -- the invalid-JSON warning banners and the missing save-failure state both predate task/detail-screen-corrections/discard-confirmation-dialog, which only wrapped the existing Discard button in a confirmation Dialog -- but both files sit in this review's own file set (touched by that task) and both passes report against the whole file set regardless of which task's delivery first wrote a given line.
The captured run (run/connector-capability-detail-editing-corrections-frontend) over the registry's full step list -- install, typecheck, lint, style, build, a11y, secret-scan, test -- passed clean.
The trace's own drift is reported separately below and is not a finding of any of the four passes; it is the same shared trace file the backend review already reported over, not a second, independent count for this target.
