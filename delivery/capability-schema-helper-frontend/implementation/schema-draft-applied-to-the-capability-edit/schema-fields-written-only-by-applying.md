---
target: frontend
title: Applying a drafted capability schema writes it into the Input/Output schema fields, one field per act, gated by confirmation over an unsaved edit
summary: CapabilitySchemaHelperFields gained two independent 'Aplicar' acts (one per schema) that write through the schema fields' own onChange(value, isValid) contract via a new per-field apply hook, going through the existing connector-configuration confirm-overwrite dialog and diff only when the targeted field already holds an unsubmitted edit, and never issuing a register-capability call.
task: sha256:ade818fcf563686d3ee874ceac45104efccd4fc04ddf761e796b10044879f29d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-draft-applied-to-the-capability-edit-schema-fields-written-only-by-applying-build-3
files:
- path: src/routes/capability-schema-helper-fields.tsx
  effect: CapabilitySchemaHelperFieldsProps now takes onApplyInputSchema and onApplyOutputSchema; CapabilitySchemaDraftStatement renders one 'Aplicar' button beside each of the Input-schema and Output-schema draft sections, each invoking only its own callback with only its own drafted text.
- path: src/routes/capability-form-fields.tsx
  effect: Instantiates useApplyToJsonSchemaField once for inputSchema and once for outputSchema, wires their onApply into the two new CapabilitySchemaHelperFields props, and renders two independent, unmodified ConnectorConfigurationApplyConfirmationDialog instances -- one gating writes to inputSchema, one gating writes to outputSchema.
- path: src/hooks/use-apply-to-json-schema-field.ts
  effect: New hook. Holds one field's pending-apply text; onApply writes straight through field.onChange(text, true) when the field has no unsaved edit, or stages the text and computes computeApplyConfirmationDiff(field.value, text) otherwise; onConfirmApply is the only other path that calls field.onChange.
criteria:
- criterion: When a drafted outcome arrives, the Input schema field's content stands exactly as it stood before the request was dispatched.
  met: true
  how: The drafted outcome is rendered read-only; the only call to inputSchema.onChange anywhere in this change is inside useApplyToJsonSchemaField's onApply/onConfirmApply, both reachable only from the new 'Aplicar' button's onClick.
- criterion: When a drafted outcome arrives, the Output schema field's content stands exactly as it stood before the request was dispatched.
  met: true
  how: Same reasoning as the input-schema criterion, applied to the independent outputSchema apply instance and its own 'Aplicar' button.
- criterion: When any of the four refusal statements arrives, both fields' content stand exactly as they stood before the request was dispatched.
  met: true
  how: CapabilitySchemaDraftStatement (the only place either onApply callback is invoked) is rendered only when state.outcome.kind === 'drafted', never for a refusal kind, so no apply act is reachable while a refusal stands.
- criterion: Applying the draft's input_schema writes that text into the Input schema field.
  met: true
  how: The input-schema 'Aplicar' button calls onApplyInputSchema(disclosure.inputSchema), routed to inputSchemaApply.onApply/onConfirmApply, which call inputSchema.onChange.
- criterion: Applying the draft's input_schema leaves the Output schema field's content exactly as it stood.
  met: true
  how: inputSchemaApply is a wholly separate useApplyToJsonSchemaField instance closed over inputSchema alone; its onApply/onConfirmApply never reference outputSchema.
- criterion: Applying the draft's output_schema writes that text into the Output schema field.
  met: true
  how: 'Mirrors the input-schema criterion: the output-schema ''Aplicar'' button calls onApplyOutputSchema(disclosure.outputSchema), routed to outputSchemaApply.onApply/onConfirmApply.'
- criterion: Applying the draft's output_schema leaves the Input schema field's content exactly as it stood.
  met: true
  how: outputSchemaApply is closed over outputSchema alone and never references inputSchema, symmetric to the input-schema case.
- criterion: An applied write reaches the field through the same onChange value-and-validity contract the field's own typing uses, so save-gating and Discard read applied text exactly as they read typed text.
  met: true
  how: useApplyToJsonSchemaField's field parameter is JsonSchemaFieldState, the same type CapabilityFormFieldsProps.inputSchema/outputSchema already carry, and both onApply and onConfirmApply call field.onChange(value, isValid).
- criterion: Where the field applied to holds an edit the operator has not submitted, the write is offered only once the operator confirms it, and what is offered for confirmation states the drafted text against what currently stands in that field.
  met: true
  how: When hasUnsavedEdit is true, onApply stages the text instead of writing it; applyConfirmationDiff (computeApplyConfirmationDiff(field.value, pendingApplyText)) compares the field's own current value against the staged drafted text.
- criterion: Where such a confirmation has not been given, that field's content stands exactly as it stood.
  met: true
  how: Dismissing the dialog without confirming calls onApplyConfirmationOpenChange(false), which clears pendingApplyText and never calls field.onChange.
- criterion: The confirmation and its diff are the existing apply-over-unsaved-edit dialog and diff computation, not a second implementation of either.
  met: true
  how: Both new instances import and render the unmodified ConnectorConfigurationApplyConfirmationDialog and call the unmodified computeApplyConfirmationDiff; neither file was changed.
- criterion: Applying either schema issues no register-capability call, and the capability registered at the identity being edited stands exactly as it stood.
  met: true
  how: useApplyToJsonSchemaField's only side effect is field.onChange plus local pending-text state; it never references the capability-save mutation.
- criterion: The act applying each schema is offered on the capability create screen and on the capability detail screen alike.
  met: true
  how: Both apply buttons live inside CapabilitySchemaHelperFields, rendered from CapabilityFormFields, which both capability-create-screen.tsx and capability-detail-ready-view.tsx render.
nodes:
- node: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
  encoded_at:
  - src/routes/capability-schema-helper-fields.tsx
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-apply-to-json-schema-field.ts
  how: The two new apply acts are the only onChange calls this change adds to inputSchema/outputSchema, and both are reachable only from an explicit 'Aplicar' button click, never from a render or effect that reacts to state.outcome becoming 'drafted' or a refusal kind.
- node: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-schema-helper-fields.tsx
  - src/hooks/use-apply-to-json-schema-field.ts
  how: Two independent useApplyToJsonSchemaField instances, one per field, each with its own pending-text state, its own diff and its own confirmation dialog, so applying input_schema can never reach outputSchema.onChange or vice versa; each writes only through field.onChange, never through the capability-save mutation; and each refuses to write over a field already holding an unsubmitted edit until confirmed.
inferences:
- inferred: Applied schema text is always written with isValid=true (field.onChange(text, true)), unconditionally, mirroring ConnectorConfigurationFormFields' own handleApply which likewise always passes true.
  from: connector-configuration-form-fields.tsx's handleApply/handleConfirmApply, and the inventory's must_not_duplicate entry naming the field's own (value, isValid) contract for any drafted schema written into input_schema/output_schema.
- inferred: Each field's own 'has an unsubmitted edit' signal is computed as isDirty ?? field.value !== '' -- the exact idiom ConnectorConfigurationFormFields already uses for its one configuration field -- applied independently per schema field, rather than exposing a new per-field baseline from use-capability-detail.ts.
  from: connector-configuration-form-fields.tsx's own hasUnsavedEdit computation, and the inventory module list, which does not name use-capability-detail.ts as touched by this task.
- inferred: The 'Aplicar' button label reuses DRAFT_DISCLOSURE_APPLY_BUTTON ('Aplicar') from connector-configuration-messages.ts rather than adding a second, capability-schema-specific constant for the same word.
  from: connector-configuration-helper-fields.tsx's own use of the same constant for its own Apply act.
- inferred: ConnectorConfigurationApplyConfirmationDialog and its message constants are reused verbatim, including their configuration-worded copy, rather than forked or reskinned for the schema fields.
  from: the task's own objective statement naming computeApplyConfirmationDiff and ConnectorConfigurationApplyConfirmationDialog by identifier as the reuse target.
- inferred: The per-field apply/confirm state was extracted into a new hook, useApplyToJsonSchemaField, reused once per field, instead of writing the four handlers and two useMemo diffs inline twice inside CapabilityFormFields as ConnectorConfigurationFormFields does for its one field.
  from: MNT-01's tool-decided 300-line ceiling on a .tsx component file, which the inline, doubled version of ConnectorConfigurationFormFields' own layout crossed by one line once written out for two fields.
preserved:
- CapabilityFormFields' isSaveDisabled reads the same state fields, unaffected by the new apply acts.
- use-capability-detail-view.ts's Discard flow is untouched.
- use-capability-form.ts's and use-capability-detail.ts's minify-at-submit contract is untouched.
- ConnectorConfigurationFormFields' own apply flow and connector-configuration-apply-diff.ts are reused, not modified.
- capability-schema-helper-fields.tsx's existing rendering of the operation picker, the request-draft act, the four refusal alerts and the unresolved-items list is unchanged.
deferred:
- what: Updating capability-schema-helper-fields.spec.ts's renderFields helper to pass the two new required onApplyInputSchema/onApplyOutputSchema props, and proving the two new apply acts and their confirm-gating.
  why: This delegation writes no test; the existing spec's compilation against the widened CapabilitySchemaHelperFieldsProps, and any new proof, belongs to the test-authoring pass.
- what: Exposing each schema field's own persisted baseline from use-capability-detail.ts, so the detail screen's confirm-gate could compare a field's current value against that field's own last-submitted text instead of the whole form's isDirty flag.
  why: use-capability-detail.ts is not among this task's touched files per the inventory; the coarser, already-delivered ConnectorConfigurationFormFields convention was reused instead.
---

## What it is

The single write path from a stated draft into the capability form: two independent apply acts, one per field, each written only by the operator's own act and confirmed before overwriting an unsaved edit.

## Notes

None.
