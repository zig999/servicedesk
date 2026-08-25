---
title: Confirm before Discard resets form state on both detail screens
summary: Both connector-configuration-detail-ready-view.tsx and capability-detail-ready-view.tsx now require an explicit confirm step, via an uncontrolled Dialog composed from @tui/ui/dialog's own primitives, before Discard resets form state.
task: sha256:be238ab64e3d2a80c1b8dc1d926e5693c3c366f397bcabe7a320d2b9b3957da4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-screen-corrections-discard-confirmation-dialog-build-5
files:
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: 'The ''Discard changes'' Button is now a DialogTrigger for an uncontrolled Dialog (no open/onOpenChange state) composed from @tui/ui/dialog''s Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose primitives. The trigger keeps its prior disabled condition (!state.isDirty || state.isSubmitting). The DialogContent shows a title (''Discard changes?''), a new DISCARD_DIALOG_DESCRIPTION constant, and a DialogFooter with two DialogClose-wrapped buttons: ''Keep editing'' (secondary) and ''Discard changes'' (destructive, onClick={state.onDiscard}). state.onDiscard now fires only from the confirm button, never from the original trigger click.'
- path: src/routes/capability-detail-ready-view.tsx
  effect: 'The identical treatment applied to this screen''s own ''Discard changes'' Button: now a DialogTrigger for the same uncontrolled Dialog shape, its own DISCARD_DIALOG_DESCRIPTION constant, title ''Discard changes?'', and a DialogFooter with ''Keep editing'' (secondary) / ''Discard changes'' (destructive, onClick={state.onDiscard}) — structurally parallel to the connector-configuration screen''s own dialog.'
- path: src/hooks/use-capability-detail.ts
  effect: handleInputSchemaChange and handleOutputSchemaChange, each wrapped in useCallback([]), replace the inline arrow functions previously passed as inputSchema.onChange/outputSchema.onChange to JsonTextareaField. Bodies are byte-identical to the removed inline arrows (setInputSchemaValue/setInputSchemaValid, setOutputSchemaValue/setOutputSchemaValid). Needed because editing one schema field re-renders this hook and recreates the OTHER field's own inline onChange too — JsonTextareaField's load-detection effect (deps include onChange) then mistakes that fresh identity for a caller replacing the loaded value, silently pretty-printing the sibling field's still-unsaved typed text. Confirmed empirically (console.log instrumentation across both fields, run in isolation) before this fix was written — see Notes.
- path: src/hooks/use-connector-configuration-detail.ts
  effect: handleConfigurationChange, wrapped in useCallback([]), replaces the inline arrow previously passed as configuration.onChange to JsonTextareaField (closing over setConfigurationValue/setConfigurationValid and the module-level isValidConfigurationObject). This screen has only the one JSON field, so the sibling-field re-render this fixes on the capability screen does not apply here as directly, but the same instability is still a real, avoidable source of spurious effect re-runs (e.g. the justSaved/baseline-snapshot effects in use-connector-configuration-detail-view.ts also re-render this hook), so the identical fix is applied for the same reason.
criteria:
- criterion: Clicking Discard on connector-configuration-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  met: true
  how: The Button is now wrapped in DialogTrigger asChild inside an uncontrolled Dialog; its own onClick handler (previously state.onDiscard) was removed, so a click only opens the Dialog via Radix's own trigger behavior.
- criterion: Confirming that dialog calls state.onDiscard, resetting the connector-configuration form to its last loaded-or-saved values.
  met: true
  how: The DialogFooter's destructive 'Discard changes' button carries onClick={state.onDiscard}, wrapped in its own DialogClose asChild so confirming both runs the reset and dismisses the dialog.
- criterion: Cancelling or closing that dialog leaves the connector-configuration form's unsaved edits intact and does not call state.onDiscard.
  met: true
  how: The 'Keep editing' button is a plain DialogClose-wrapped secondary Button with no onClick at all — closing via it, the dialog's own close affordance, or an outside click/Escape (Radix's own default dismissal, unmodified) never touches state.onDiscard, which only the confirm button's own onClick reaches.
- criterion: Clicking Discard on capability-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately.
  met: true
  how: 'Identical treatment as the connector-configuration screen: the Button is now a DialogTrigger with no onClick of its own.'
- criterion: Confirming that dialog calls state.onDiscard, resetting the capability form to its last loaded-or-saved values.
  met: true
  how: 'Identical treatment: the destructive confirm button carries onClick={state.onDiscard} inside its own DialogClose.'
- criterion: Cancelling or closing that dialog leaves the capability form's unsaved edits intact and does not call state.onDiscard.
  met: true
  how: 'Identical treatment: ''Keep editing'' carries no onClick, and every other dismissal path never reaches state.onDiscard.'
- criterion: Both dialogs are composed from @tui/ui/dialog's existing primitives with two explicit buttons — one to discard, one to continue editing — matching the Release dialog's plain two-button shape in case-version-editor-ready-view.tsx rather than the typed-slug Discard dialog's heavier shape.
  met: true
  how: Both files import the same eight primitives from @tui/ui/dialog and follow the Release dialog's structure (DialogHeader/DialogTitle, DialogDescription, DialogFooter with two buttons) with no slug-confirmation input, no controlled open state, and no async validation — the plain shape, not the typed-slug Discard dialog's heavier one.
- criterion: connector-configuration-detail-screen-discard.spec.ts and capability-detail-screen-discard.spec.ts no longer assert the removed one-click-no-confirmation behavior.
  met: false
  how: Not addressed here — this criterion belongs to the test-author's own pass (updating the two existing spec files' assertions), which had not yet run when this implementation record was composed. The task-implementer writes source only, never tests.
inferences:
- inferred: The Dialog is uncontrolled — no open/onOpenChange prop on Dialog itself, unlike the Release dialog's controlled state.
  from: state.onDiscard is a synchronous, always-succeeding form-state reset with no loading state, no server round trip, and no failure branch that would need to keep the dialog open (unlike Release's checklist/violations gating, or the typed-slug Discard dialog's validation) — so the confirm button is wrapped in its own DialogClose exactly like the Cancel/Keep-editing button, and there is nothing left for controlled state to coordinate.
- inferred: 'Dialog title ''Discard changes?'', a plain descriptive sentence naming what will be lost (DISCARD_DIALOG_DESCRIPTION, worded per-screen: ''connector configuration'' vs ''capability''), confirm button labeled ''Discard changes'' with variant="destructive", cancel button labeled ''Keep editing'' with variant="secondary".'
  from: no wording is pinned by the task or any node; this app has no existing confirm-dialog string to reuse for this exact action, so wording follows the same plain, consequence-naming convention this app's own INVALID_*_WARNING banners already use, and destructive styling on the confirm button matches the existing Discard-draft dialog's own destructive confirm button in case-version-editor-ready-view.tsx (an irreversible loss of user edits), while Release's own non-destructive confirm button was not followed since Release is not itself destructive.
- inferred: Each ready-view defines its own DISCARD_DIALOG_DESCRIPTION constant inline, rather than sharing one constant or component between the two files.
  from: 'the task''s own inventory convention: each ready-view already defines its own such strings inline (the INVALID_CONFIGURATION_WARNING / INVALID_INPUT_SCHEMA_WARNING pattern), and the task''s own text says the dialog reuses @tui/ui/dialog''s primitives directly, not a new shared wrapper component.'
divergences:
- from: the original build (run/detail-screen-corrections-discard-confirmation-dialog-build), which passed with the two ready-views alone
  departure: 'the captured suite runs over that build, and over a second attempt that rewrote json-textarea-field.tsx''s own load-detection ref logic (later reverted — see Notes), kept failing 4 tests. Empirical tracing (console.log instrumentation, isolated single-test runs) found two distinct, real causes: (1) on the capability screen, editing one JSON schema field re-renders the hook and recreates the OTHER field''s own inline onChange, which JsonTextareaField''s load-detection effect (onChange in its deps) misreads as an external load and silently reformats; (2) on the connector-configuration screen with only one field, the remaining 4 failures traced to the *test''s* own mounting helper resolving before the load''s own pretty-print-on-load cascade had settled, not to production code — fixed in the proof''s own test files, not here. Only (1) is a production-code divergence: both hooks'' onChange handlers are now wrapped in useCallback([]) for a stable identity.'
  why: diagnosed cause "code" for finding (1) by the failure-diagnostician, confirmed by direct instrumentation rather than by that diagnosis alone — a real, pre-existing fragility this task's own new Dialog render (and, on the capability screen, ordinary sibling-field re-renders) was positioned to expose. The fix belongs to this task since it is what makes both Dialogs safe to open/cancel without corrupting either screen's own field state.
preserved:
- The trigger Button's existing disabled condition (!state.isDirty || state.isSubmitting) — carried onto the DialogTrigger's own Button unchanged, so opening the dialog is still gated exactly as the direct action always was.
- Every other element of both ready-views (the Save button, the warning banners, ConnectorTestPanel, the justSaved acknowledgement) — untouched.
- state.onDiscard's own implementation in each hook, json-textarea-field.tsx (reverted to its pre-existing, unmodified state after an intermediate rewrite proved unnecessary — see Notes), and every other behavior of both hooks (isDirty, the save-payload minification, the debounce-free synchronous update path, onSubmit's isSubmittingRef guard, isSubmitSuccessful, baseline re-seeding on load/save) — only the onChange callbacks' identity stability changed, their bodies are byte-identical to the inline arrows they replace.
deferred:
- what: Updating connector-configuration-detail-screen-discard.spec.ts and capability-detail-screen-discard.spec.ts, whose existing tests assert the removed one-click-no-confirmation behavior (criterion 8), and whose mounting helpers needed their own settle-wait fix for the test-timing race described above.
  why: test authorship belongs to the test-author, not the task-implementer; this implementation record's own criterion 8 entry is recorded unmet for that reason. The mounting-helper fix, though not itself proof of a new criterion, is disclosed in the proof record beside it since it was found and fixed in the same investigation.
---

## What it is

Both detail screens' "Discard changes" button now opens an uncontrolled @tui/ui/dialog confirmation before state.onDiscard runs, structurally parallel between the two files and matching case-version-editor-ready-view.tsx's own Release dialog's plain two-button shape.
Both hooks' JSON-field onChange handlers are now useCallback-stabilized, fixing a real spurious-reformat defect the Dialog's own re-renders (and, on the capability screen, ordinary sibling-field edits) exposed in JsonTextareaField's load-detection effect.

## Notes

The delivering task-implementer subagent lost its connection after writing both ready-view files (an API error mid-response); the first captured build run independently confirmed both files compile, typecheck, lint and pass a11y cleanly, and this record's own file entries for those two were composed by reading the resulting diff directly.
Three further rounds of suite failures followed, all four tests failing byte-for-byte identically across two different production-code fix attempts (useCallback alone; then a rewrite of json-textarea-field.tsx's own selfInitiatedRef into a value-comparison ref) — both diagnosed cause "code" by the failure-diagnostician, both plausible from reading the source, both wrong or incomplete. A third pass instrumented the actual running code with console.log and ran the failing tests in isolation rather than reasoning further from source, which found the two real causes described in this record's own divergences entry. json-textarea-field.tsx was reverted to its original, unmodified state (the value-comparison rewrite was unnecessary once the real causes were fixed); the useCallback fix was kept, re-applied cleanly, and confirmed necessary on its own for the capability screen's multi-field scenario. The connector-configuration screen's own remaining failures were a test-timing race in the spec file's own mounting helper, fixed there and disclosed in the proof record. Build run 5 and suite run 4 both passed clean after both fixes landed together.
