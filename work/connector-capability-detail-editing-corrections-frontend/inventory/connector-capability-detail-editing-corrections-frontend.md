---
title: Connector configuration and capability detail-route editing surfaces
summary: The frontend app root, surveyed at the hooks/routes/shared-components the two corrective facts land in — the configurationValid derivation and its two consumers, its capability-side sibling, the app's existing Dialog-confirmation precedent, and both screens' current one-click Discard control and its existing test coverage.
area:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-capability-detail.ts
  - src/shared/components/json-textarea-field.tsx
  - src/shared/components/json-textarea-field.spec.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/hooks/use-capability-detail-view.ts
  - src/routes/connector-configuration-detail-screen-discard.spec.ts
  - src/routes/capability-detail-screen-discard.spec.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/services/discard-confirmation.ts
modules:
  - name: use-connector-configuration-detail
    path: src/hooks/use-connector-configuration-detail.ts
    role: touched
  - name: json-textarea-field
    path: src/shared/components/json-textarea-field.tsx
    role: touched
  - name: connector-configuration-detail-ready-view
    path: src/routes/connector-configuration-detail-ready-view.tsx
    role: touched
  - name: capability-detail-ready-view
    path: src/routes/capability-detail-ready-view.tsx
    role: touched
  - name: use-connector-configuration-detail-view
    path: src/hooks/use-connector-configuration-detail-view.ts
    role: depends-on
  - name: use-capability-detail-view
    path: src/hooks/use-capability-detail-view.ts
    role: depends-on
  - name: use-capability-detail
    path: src/hooks/use-capability-detail.ts
    role: adjacent
  - name: connector-configuration-form-fields
    path: src/routes/connector-configuration-form-fields.tsx
    role: depends-on
  - name: capability-form-fields
    path: src/routes/capability-form-fields.tsx
    role: adjacent
  - name: case-version-editor-ready-view
    path: src/routes/case-version-editor-ready-view.tsx
    role: adjacent
  - name: discard-confirmation
    path: src/services/discard-confirmation.ts
    role: adjacent
conventions:
  - statement: "configurationValid (and its capability-side siblings inputSchemaValid/outputSchemaValid) is derived only from `getJsonTextareaMinifiedValue(text) !== null`, which is `parseJsonText`'s parse-only check (JSON.parse does not throw) — it accepts any syntactically valid JSON value, not only an object, so an array, a bare string, a number, `true`, or `null` reads as valid."
    seen_at: "src/shared/components/json-textarea-field.tsx:24-33,45-48 (parseJsonText / getJsonTextareaMinifiedValue)"
  - statement: "The same parse-only gap exists identically on the capability side: inputSchemaValid and outputSchemaValid are derived the same way, with the same header-comment language (\"a stored schema that does not parse as JSON\"), for both input_schema and output_schema."
    seen_at: "src/hooks/use-capability-detail.ts:206-213"
  - statement: "A ready-phase JSON-field's validity flag is read by exactly two consumers per field: the route's own INVALID_*_WARNING banner (gated on `!field.isValid`) and the corresponding form-fields component's Save-disable (`isSaveDisabled = isSubmitting || !field.isValid || isDirty === false`) — both already keyed off the one flag this correction fixes, so neither needs its own code change once the derivation is corrected."
    seen_at: "src/routes/connector-configuration-detail-ready-view.tsx:50-54; src/routes/connector-configuration-form-fields.tsx:96"
  - statement: "getJsonTextareaMinifiedValue is also the isDirty/baseline-comparison function (minifies both sides before comparing) and the save-payload minifier — the same function serves three separate purposes across the hook, so a change to what it treats as valid must be checked against all three call sites, not only the validity-flag one."
    seen_at: "src/hooks/use-connector-configuration-detail.ts:172,185,220"
  - statement: "A destructive action already gets a two-button Dialog confirmation elsewhere in this app: `@tui/ui/dialog`'s Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose composed directly in the ready-view component (not behind a shared wrapper component) — the Release dialog there is the plain two-button shape (DialogClose \"Cancel\" / a destructive-styled confirm button), while the Discard dialog there additionally requires typing the case's slug to enable its confirm button, a heavier precedent than this scope's two-explicit-buttons ask."
    seen_at: "src/routes/case-version-editor-ready-view.tsx:169-231,232-284"
  - statement: "Where a Dialog's own supporting logic (state shape, confirm/cancel handlers) grows past a couple of lines, it is factored into a plain services module reused by the composing hook, not left inline in the ready-view or the hook itself."
    seen_at: "src/services/discard-confirmation.ts"
  - statement: "A dialog's confirm button uses variant=\"destructive\" and DialogClose wraps the cancel/keep button; both disable while a mutation the dialog triggers is in flight."
    seen_at: "src/routes/case-version-editor-ready-view.tsx:266-281"
must_not_duplicate:
  - what: "parseJsonText / getJsonTextareaMinifiedValue — the one parse/minify function every JSON-field consumer (connector configuration, capability input/output schema, test-connector sample input) already calls; tightening what counts as valid belongs here, not as a second, hand-written object check in either hook."
    at: "src/shared/components/json-textarea-field.tsx:24-48"
  - what: "The `@tui/ui/dialog` primitives (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose) already imported and composed for a destructive-action confirmation in this exact app — the only confirmation-dialog precedent to reuse; no separate ConfirmDialog/AlertDialog component exists to reach for instead."
    at: "src/routes/case-version-editor-ready-view.tsx:5-14"
risks:
  - risk: "Tightening configurationValid's derivation without also checking json-textarea-field.tsx's own isDirty/save-payload uses of getJsonTextareaMinifiedValue could either widen the fix beyond the hook (if getJsonTextareaMinifiedValue itself is changed) or leave a second, duplicated object check if a new function is added only for the validity flag — either changes what isDirty and the save payload compute too, since all three read the same function."
    consumers:
      - src/hooks/use-connector-configuration-detail.ts (isDirty comparison, mutation payload)
      - src/routes/connector-configuration-form-fields.tsx (Save-disable)
      - src/routes/connector-configuration-detail-ready-view.tsx (warning banner)
  - risk: "use-capability-detail.ts derives inputSchemaValid/outputSchemaValid through the identical parse-only call and is read by capability-detail-ready-view.tsx's own two warning banners and capability-form-fields.tsx's Save-disable the same way — if the correction touches getJsonTextareaMinifiedValue itself rather than a connector-configuration-only wrapper, this capability-side surface changes behavior too even though it is outside this scope's two named facts."
    consumers:
      - src/hooks/use-capability-detail.ts
      - src/routes/capability-detail-ready-view.tsx
      - src/routes/capability-form-fields.tsx
  - risk: "Both detail-ready-view screens already have a spec asserting the current one-click Discard behavior, including one connector-configuration test that explicitly asserts no dialog/alertdialog role appears on click — inserting a confirmation modal will fail these specific existing tests until they are updated to expect and drive the new confirmation step."
    consumers:
      - src/routes/connector-configuration-detail-screen-discard.spec.ts (specifically its "shows no confirmation step before discarding" test, lines 62-71)
      - src/routes/capability-detail-screen-discard.spec.ts (both its tests assert Discard resets fields on the same click with no confirmation step)
  - risk: "onDiscard on both ready-views is wired directly to the Button's onClick (`onClick={state.onDiscard}`); inserting a Dialog means the Button becomes a DialogTrigger and state.onDiscard moves to the dialog's confirm action, so both call sites' JSX structure changes, not just their behavior."
    consumers:
      - src/routes/connector-configuration-detail-ready-view.tsx (lines 74-81)
      - src/routes/capability-detail-ready-view.tsx (lines 83-90)
sources:
  - intake/scope.md
---

## What it is

The area two corrective facts land in: use-connector-configuration-detail.ts's configurationValid derivation and json-textarea-field.tsx's parseJsonText/getJsonTextareaMinifiedValue it calls, read by connector-configuration-detail-ready-view.tsx's warning banner and connector-configuration-form-fields.tsx's Save-disable; and both capability-detail-ready-view.tsx's and connector-configuration-detail-ready-view.tsx's "Discard changes" Button, currently wired straight to state.onDiscard with no confirmation step.
use-capability-detail.ts derives inputSchemaValid/outputSchemaValid through the exact same parse-only gap, read by capability-detail-ready-view.tsx's two warning banners and capability-form-fields.tsx's Save-disable — the scope names only the connector-configuration hook, so this is the capability-side analogue surveyed for reference, not itself in scope.
This app's one existing confirmation-dialog precedent is case-version-editor-ready-view.tsx's Release and Discard dialogs, composed directly from `@tui/ui/dialog`'s Radix-backed primitives; there is no separate ConfirmDialog or AlertDialog wrapper component anywhere in the app.
Both detail-ready-view screens already carry a discard spec file asserting the current one-click behavior, one of which explicitly asserts no dialog appears.

## Notes

The rule governing fact 1 is knowledge/rules/integration/a-connector-configuration-holds-a-well-formed-object.md, already stating "syntactically valid JSON object text" — confirmed to already require the object shape, so no specification change is implied by this correction.
None of getJsonTextareaMinifiedValue's three call sites in use-connector-configuration-detail.ts (validity flag, isDirty comparison, save payload) is itself in scope beyond the validity-flag one the scope names, but a fix at the shared function's own level rather than a local wrapper would change all three, and the capability-side hook's identical read of that same function, at once.
The Release dialog's plain two-button shape (Cancel / destructive confirm) is the closer precedent for this scope's ask than the Discard dialog's typed-slug variant, since neither capability nor connector-configuration discard needs typed confirmation text by the scope's own wording ("two explicit buttons: one to discard the changes, one to continue editing").
