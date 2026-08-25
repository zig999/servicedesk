---
title: Discard confirmation dialog on both detail screens
summary: Proves task/detail-screen-corrections/discard-confirmation-dialog's own seven behavioral criteria on both ready-views by updating the two pre-existing discard spec files to exercise the confirm-then-discard flow instead of the removed one-click reset (satisfying criterion 8), and fixes a test-timing race in both files' own mounting helper found while diagnosing the suite's own failures.
implementation: sha256:4e037cf241653d69a52d821c1459b43bcbc7a4fabb0026295b2b3fac853bac6a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-screen-corrections-discard-confirmation-dialog-suite-4
tests:
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: opens a confirmation Dialog when Discard is clicked, rather than resetting the field immediately
  proves: Clicking Discard on connector-configuration-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  fails_when: clicking the Discard trigger resets the field on the same click (no dialog appears), or the dialog opens but the field is already reset by the time it does
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)
  proves: Both dialogs are composed from @tui/ui/dialog's existing primitives with two explicit buttons — one to discard, one to continue editing — matching the Release dialog's plain two-button shape ... rather than the typed-slug Discard dialog's heavier shape.
  fails_when: the dialog gains a text input (a typed-slug confirmation field), the "Keep editing" button is absent, or the confirm button starts out disabled pending some extra input
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: closes the Dialog and resets the field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard
  proves: Confirming that dialog calls state.onDiscard, resetting the connector-configuration form to its last loaded-or-saved values.
  fails_when: clicking the dialog's own destructive "Discard changes" button leaves the field's edited value in place, or Save/Discard stay enabled afterward
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: leaves the field's unsaved edit intact and issues no reset when Keep editing is clicked
  proves: Cancelling or closing that dialog leaves the connector-configuration form's unsaved edits intact and does not call state.onDiscard.
  fails_when: clicking "Keep editing" resets the field anyway, or Save stays disabled after the edit is retained
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: titles the Dialog "Discard changes?" and describes what will be lost
  proves: the implementation record's disclosed inference on the dialog's title and description wording
  fails_when: the dialog's title or description text stops matching what the ready-view's own DISCARD_DIALOG_DESCRIPTION constant states
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: styles the confirm button as destructive and Keep editing as a plain, non-destructive control
  proves: the implementation record's disclosed inference that the confirm button is destructive-styled and Keep editing is not
  fails_when: either button's variant swaps, so the destructive class no longer appears on the confirm button or starts appearing on Keep editing
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: resets to the just-saved configuration once a save has succeeded and the confirmation Dialog is confirmed, rather than the value loaded before it
  proves: Confirming that dialog calls state.onDiscard, resetting the connector-configuration form to its last loaded-or-saved values (updated to go through the confirm dialog; also re-proves the pre-existing loaded-or-saved disclosed inference)
  fails_when: after a successful save the confirmed discard resets to the original pre-save value instead of the just-saved one, or the reset never happens because the dialog flow is broken
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: opens a confirmation Dialog when Discard is clicked, rather than resetting the fields immediately
  proves: Clicking Discard on capability-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  fails_when: clicking the Discard trigger resets a field on the same click (no dialog appears), or the field is already reset once the dialog opens
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)
  proves: Both dialogs are composed from @tui/ui/dialog's existing primitives with two explicit buttons ... matching the Release dialog's plain two-button shape ... rather than the typed-slug Discard dialog's heavier shape.
  fails_when: the dialog gains a typed-confirmation input, "Keep editing" is absent, or the confirm button starts disabled
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: closes the Dialog and resets every edited field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard
  proves: Confirming that dialog calls state.onDiscard, resetting the capability form to its last loaded-or-saved values.
  fails_when: any of input schema, output schema or the connector field keeps its edited value after confirming, or Save/Discard stay enabled afterward
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: leaves every edited field's unsaved edit intact and issues no reset when Keep editing is clicked
  proves: Cancelling or closing that dialog leaves the capability form's unsaved edits intact and does not call state.onDiscard.
  fails_when: clicking "Keep editing" resets any of the three edited fields, or Save stays disabled after the edits are retained
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: titles the Dialog "Discard changes?" and describes what will be lost
  proves: the implementation record's disclosed inference on the dialog's title and description wording (capability screen's own worded description)
  fails_when: the dialog's title or description text stops matching the capability ready-view's own DISCARD_DIALOG_DESCRIPTION constant
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: styles the confirm button as destructive and Keep editing as a plain, non-destructive control
  proves: the implementation record's disclosed inference that the confirm button is destructive-styled and Keep editing is not
  fails_when: either button's variant swaps
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: resets both schema fields to their just-saved values once a save has succeeded and the confirmation Dialog is confirmed, rather than the values loaded before it
  proves: Confirming that dialog calls state.onDiscard, resetting the capability form to its last loaded-or-saved values (updated to go through the confirm dialog; also re-proves the pre-existing loaded-or-saved disclosed inference)
  fails_when: after a successful save the confirmed discard resets either schema field to its original pre-save value instead of the just-saved one
not_applicable:
- edge_case: dismissal via the Dialog's own corner close affordance, an outside click, or Escape (as opposed to the explicit "Keep editing" button)
  why: criteria 3 and 6 say "cancelling or closing", and only the explicit cancel button is exercised. No spec file anywhere in this codebase queries the corner-close control or exercises Escape/outside-click dismissal on any @tui/ui/dialog instance (case-version-editor-screen-release-control.spec.ts and case-version-editor-screen-discard.spec.ts, the established precedent for this primitive, test only their own named Cancel/Keep-draft buttons), so there is no established, verifiable query pattern for this in-repo to follow.
- edge_case: a race from clicking the dialog's confirm button twice in quick succession
  why: state.onDiscard is a synchronous, always-succeeding form-state reset with no loading state and no network round trip; the DialogClose wrapping unmounts the button on the first click, so there is no in-flight window a second click could land in, and no criterion describes one
- edge_case: attempting to open the Dialog while the trigger is disabled (nothing to discard, or a save in flight)
  why: the disabled condition itself is unchanged, pre-existing behavior this task preserved rather than introduced, already proven by the unmodified "disables the Discard control while there is nothing to discard" test in both files
untested:
- That the Dialog is implemented as uncontrolled (no open/onOpenChange state), the implementation record's own disclosed inference — there is no user-observable difference between a controlled and an uncontrolled Dialog in this exact case (state.onDiscard has no loading state or failure branch to coordinate), so nothing distinguishes the two from outside.
- That each ready-view defines its own DISCARD_DIALOG_DESCRIPTION constant inline rather than sharing one, the implementation record's own disclosed inference — a source-organization fact invisible to a screen-level DOM test.
divergences:
- from: connector-configuration-detail-screen-discard.spec.ts's own pre-existing mountReady() helper
  departure: 'added a waitFor asserting configurationField.value equals prettyPrinted(LOADED_CONFIGURATION) before mountReady() returns, so every test starts from a fully settled load. Previously, findByLabelText resolved as soon as the label appeared -- the same render the load effect''s own setState produces -- which could be before JsonTextareaField''s own pretty-print-on-load effect (a second, cascading render) had committed. A fireEvent.change fired immediately after could then interleave with that still-pending effect: its own stale closure (over the raw, not-yet-prettified value) committed after the operator''s own edit had already advanced the field''s internal load-detection ref, misreading the fresh edit as an external load and reformatting it -- confirmed directly by instrumenting json-textarea-field.tsx''s own effect and the hook''s onChange handler with console.log and running this one test in isolation.'
  why: found empirically while diagnosing four suite failures that survived two different production-code fix attempts unchanged, byte for byte -- tracing the actual render/effect sequence rather than reasoning further from source showed the root cause here was this file's own test timing, not the Dialog or the hooks. No production behavior changed; every test that previously passed still exercises the identical sequence, now from a state a real browser would also have reached before any operator interaction is physically possible.
- from: capability-detail-screen-discard.spec.ts's own pre-existing mountReady() helper
  departure: same fix, for both JSON schema fields (inputSchemaField against prettyPrinted(LOADED_INPUT_SCHEMA), outputSchemaField against prettyPrinted(LOADED_OUTPUT_SCHEMA)) in a single waitFor before mountReady() returns.
  why: same root cause and same reasoning as the connector-configuration file's own divergence above, on the capability screen's own two fields.
---

## What it is

Fourteen tests across the two pre-existing discard spec files prove the confirm-then-discard flow on both screens: opening, confirming, cancelling, the plain two-button shape, wording/styling, and the just-saved fallback -- replacing every assertion of the removed one-click-no-confirmation behavior (criterion 8).
Both files' own mounting helper now waits for the pretty-print-on-load cascade to settle before returning, closing a test-timing race that produced the same four failures across two unrelated production-code fix attempts before its real cause was found.

## Notes

Investigation summary: the suite failed identically after two production-code changes (onChange useCallback stabilization alone; then a rewrite of json-textarea-field.tsx's own load-detection ref), both diagnosed cause "code" and both plausible from reading the source alone. Instrumenting the actual running code with console.log and running the failing tests in isolation (rather than reasoning further from source) found two distinct real causes: a genuine onChange-identity race on the capability screen's multi-field editing (fixed by keeping the useCallback stabilization, disclosed in the implementation record), and a test-timing race in both files' own mountReady() helper (fixed here). json-textarea-field.tsx needed no change once both real causes were addressed and was reverted to its original, unmodified state.
